const db = require('../config/db');

const ESTADOS_ACTIVOS = ['pendiente', 'en_preparacion', 'listo', 'entregado'];

async function adjuntarDetalles(pedidos) {
  if (pedidos.length === 0) return pedidos;
  const ids = pedidos.map((p) => p.id_pedido);
  const { rows } = await db.query(
    `SELECT d.id_pedido, d.cantidad, d.precio_unitario, d.subtotal, d.observacion, pl.nombre
       FROM detalle_pedido d JOIN plato pl ON pl.id_plato = d.id_plato
      WHERE d.id_pedido = ANY($1::int[])
      ORDER BY d.id_detalle`,
    [ids]
  );
  for (const p of pedidos) p.detalles = rows.filter((d) => d.id_pedido === p.id_pedido);
  return pedidos;
}

module.exports = {
  ESTADOS_ACTIVOS,

  async listarPorEstados(estados, { idUsuario = null } = {}) {
    const { rows } = await db.query(
      `SELECT pe.id_pedido, pe.estado, pe.fecha_hora, pe.total, pe.id_mesa,
              m.numero AS mesa, u.nombre AS mesero
         FROM pedido pe
         JOIN mesa m ON m.id_mesa = pe.id_mesa
         JOIN usuario u ON u.id_usuario = pe.id_usuario
        WHERE pe.estado = ANY($1::text[]) AND ($2::int IS NULL OR pe.id_usuario = $2::int)
        ORDER BY pe.fecha_hora`,
      [estados, idUsuario]
    );
    return adjuntarDetalles(rows);
  },

  async obtener(idPedido) {
    const { rows } = await db.query(
      `SELECT pe.id_pedido, pe.estado, pe.fecha_hora, pe.total, pe.id_mesa,
              m.numero AS mesa, u.nombre AS mesero, pa.metodo, pa.monto, pa.fecha_pago
         FROM pedido pe
         JOIN mesa m ON m.id_mesa = pe.id_mesa
         JOIN usuario u ON u.id_usuario = pe.id_usuario
         LEFT JOIN pago pa ON pa.id_pedido = pe.id_pedido
        WHERE pe.id_pedido = $1`,
      [idPedido]
    );
    if (!rows[0]) return undefined;
    const [pedido] = await adjuntarDetalles([rows[0]]);
    return pedido;
  },

  async estadoActual(idPedido) {
    const { rows } = await db.query('SELECT estado, id_mesa FROM pedido WHERE id_pedido = $1', [idPedido]);
    return rows[0];
  },

  async actualizarEstado(client, idPedido, estado) {
    await client.query('UPDATE pedido SET estado = $2 WHERE id_pedido = $1', [idPedido, estado]);
  },

  async liberarMesaSiCorresponde(client, idMesa) {
    await client.query(
      `UPDATE mesa SET estado = 'libre'
        WHERE id_mesa = $1
          AND NOT EXISTS (SELECT 1 FROM pedido WHERE id_mesa = $1 AND estado = ANY($2::text[]))`,
      [idMesa, ESTADOS_ACTIVOS]
    );
  }
};
