const db = require('../config/db');

const ZONA = process.env.TZ_NEGOCIO || 'America/La_Paz';
// Hora local del negocio a partir de la fecha guardada en UTC.
const LOCAL = "(pa.fecha_pago AT TIME ZONE 'UTC' AT TIME ZONE $3)";
const RANGO = `${LOCAL} >= $1::date AND ${LOCAL} < ($2::date + 1)`;

module.exports = {
  async ventasPorDia(desde, hasta) {
    const { rows } = await db.query(
      `SELECT ${LOCAL}::date AS dia, COUNT(*)::int AS pedidos, SUM(pa.monto) AS total
         FROM pago pa
        WHERE ${RANGO}
        GROUP BY 1 ORDER BY 1 DESC`,
      [desde, hasta, ZONA]
    );
    return rows;
  },

  async platosMasVendidos(desde, hasta) {
    const { rows } = await db.query(
      `SELECT p.nombre, SUM(d.cantidad)::int AS unidades, SUM(d.subtotal) AS ingresos
         FROM detalle_pedido d
         JOIN plato p ON p.id_plato = d.id_plato
         JOIN pedido pe ON pe.id_pedido = d.id_pedido
         JOIN pago pa ON pa.id_pedido = pe.id_pedido
        WHERE pe.estado = 'pagado' AND ${RANGO}
        GROUP BY p.nombre
        ORDER BY unidades DESC, p.nombre
        LIMIT 10`,
      [desde, hasta, ZONA]
    );
    return rows;
  },

  async ventasPorMetodo(desde, hasta) {
    const { rows } = await db.query(
      `SELECT pa.metodo, COUNT(*)::int AS pedidos, SUM(pa.monto) AS total
         FROM pago pa
        WHERE ${RANGO}
        GROUP BY pa.metodo ORDER BY total DESC`,
      [desde, hasta, ZONA]
    );
    return rows;
  }
};
