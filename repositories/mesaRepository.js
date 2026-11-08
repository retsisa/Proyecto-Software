const db = require('../config/db');

module.exports = {
  async listar() {
    const { rows } = await db.query('SELECT id_mesa, numero, capacidad, estado FROM mesa ORDER BY numero');
    return rows;
  },

  async obtener(idMesa) {
    const { rows } = await db.query('SELECT id_mesa, numero, capacidad, estado FROM mesa WHERE id_mesa = $1', [idMesa]);
    return rows[0];
  },

  async crear({ numero, capacidad }) {
    await db.query('INSERT INTO mesa (numero, capacidad) VALUES ($1, $2)', [numero, capacidad]);
  },

  async cambiarReserva(idMesa) {
    // Solo alterna entre libre y reservada; una mesa ocupada no se puede reservar.
    await db.query(
      `UPDATE mesa
          SET estado = CASE WHEN estado = 'libre' THEN 'reservada' ELSE 'libre' END
        WHERE id_mesa = $1 AND estado IN ('libre', 'reservada')`,
      [idMesa]
    );
  }
};
