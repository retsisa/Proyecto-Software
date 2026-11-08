const db = require('../config/db');
const PedidoRepository = require('../repositories/pedidoRepository');
const { crearPago } = require('../factories/pagoFactory');
const { ErrorNegocio } = require('../utils/errores');

async function cobrar({ idPedido, idUsuario, metodo, recibido }) {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      'SELECT id_mesa, estado, total FROM pedido WHERE id_pedido = $1 FOR UPDATE',
      [idPedido]
    );
    const pedido = rows[0];
    if (!pedido) throw new ErrorNegocio('El pedido no existe');
    if (!['listo', 'entregado'].includes(pedido.estado)) {
      throw new ErrorNegocio('El pedido todavía no está listo para cobrar');
    }

    const pago = crearPago(metodo, Number(pedido.total), Number(recibido));
    await client.query(
      'INSERT INTO pago (id_pedido, id_usuario, metodo, monto) VALUES ($1, $2, $3, $4)',
      [idPedido, idUsuario, pago.metodo, pago.monto]
    );
    await PedidoRepository.actualizarEstado(client, idPedido, 'pagado');
    await PedidoRepository.liberarMesaSiCorresponde(client, pedido.id_mesa);

    await client.query('COMMIT');
    return pago;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

module.exports = { cobrar };
