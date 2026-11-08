// Reglas de negocio de los pedidos. Usa transacciones para no dejar datos a medias.
const db = require('../config/db');
const bus = require('../events/bus');
const PedidoRepository = require('../repositories/pedidoRepository');
const { ErrorNegocio } = require('../utils/errores');

// Estados a los que se puede pasar desde cada estado, y qué roles pueden hacerlo.
const TRANSICIONES = {
  pendiente: ['en_preparacion', 'cancelado'],
  en_preparacion: ['listo'],
  listo: ['entregado'],
  entregado: []
};
const ROLES_POR_ESTADO = {
  en_preparacion: ['cocina', 'administrador'],
  listo: ['cocina', 'administrador'],
  entregado: ['mesero', 'administrador'],
  cancelado: ['mesero', 'administrador']
};

async function crearPedido({ idMesa, idUsuario, items }) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new ErrorNegocio('Agrega al menos un plato al pedido');
  }
  for (const it of items) {
    const cant = Number(it.cantidad);
    if (!Number.isInteger(Number(it.idPlato)) || !Number.isInteger(cant) || cant < 1 || cant > 50) {
      throw new ErrorNegocio('Hay un plato o una cantidad no válida en el pedido');
    }
  }

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const mesa = await client.query('SELECT estado FROM mesa WHERE id_mesa = $1 FOR UPDATE', [idMesa]);
    if (!mesa.rows[0]) throw new ErrorNegocio('La mesa no existe');
    if (mesa.rows[0].estado === 'reservada') throw new ErrorNegocio('La mesa está reservada');

    const { rows } = await client.query(
      'INSERT INTO pedido (id_mesa, id_usuario) VALUES ($1, $2) RETURNING id_pedido',
      [idMesa, idUsuario]
    );
    const idPedido = rows[0].id_pedido;

    for (const it of items) {
      const r = await client.query(
        `INSERT INTO detalle_pedido (id_pedido, id_plato, cantidad, precio_unitario, observacion)
         SELECT $1::int, id_plato, $3::int, precio, $4::varchar
           FROM plato WHERE id_plato = $2::int AND disponible = TRUE`,
        [idPedido, it.idPlato, it.cantidad, (it.observacion || '').slice(0, 200) || null]
      );
      if (r.rowCount === 0) throw new ErrorNegocio('Uno de los platos ya no está disponible');
    }

    await client.query(
      `UPDATE pedido
          SET total = (SELECT COALESCE(SUM(subtotal), 0) FROM detalle_pedido WHERE id_pedido = $1)
        WHERE id_pedido = $1`,
      [idPedido]
    );
    await client.query(`UPDATE mesa SET estado = 'ocupada' WHERE id_mesa = $1`, [idMesa]);

    await client.query('COMMIT');
    bus.emit('pedido:creado', { idPedido, idMesa }); // avisa a la cocina
    return idPedido;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

async function cambiarEstado({ idPedido, estado, rol }) {
  if (!ROLES_POR_ESTADO[estado]) throw new ErrorNegocio('Estado no válido');
  if (!ROLES_POR_ESTADO[estado].includes(rol)) throw new ErrorNegocio('Tu rol no puede hacer este cambio');

  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      'SELECT estado, id_mesa FROM pedido WHERE id_pedido = $1 FOR UPDATE',
      [idPedido]
    );
    const pedido = rows[0];
    if (!pedido) throw new ErrorNegocio('El pedido no existe');
    if (!(TRANSICIONES[pedido.estado] || []).includes(estado)) {
      throw new ErrorNegocio(`No se puede pasar de «${pedido.estado}» a «${estado}»`);
    }
    await PedidoRepository.actualizarEstado(client, idPedido, estado);
    if (estado === 'cancelado') await PedidoRepository.liberarMesaSiCorresponde(client, pedido.id_mesa);
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

module.exports = { crearPedido, cambiarEstado };
