const db = require('../config/db');

module.exports = {
  async categorias() {
    const { rows } = await db.query('SELECT id_categoria, nombre FROM categoria ORDER BY id_categoria');
    return rows;
  },

  async crearCategoria(nombre) {
    await db.query('INSERT INTO categoria (nombre) VALUES ($1)', [nombre]);
  },

  async platos({ soloDisponibles = false } = {}) {
    const { rows } = await db.query(
      `SELECT p.id_plato, p.id_categoria, c.nombre AS categoria, p.nombre, p.descripcion, p.precio, p.disponible
         FROM plato p JOIN categoria c ON c.id_categoria = p.id_categoria
        ${soloDisponibles ? 'WHERE p.disponible = TRUE' : ''}
        ORDER BY c.id_categoria, p.nombre`
    );
    return rows;
  },

  async crearPlato({ idCategoria, nombre, descripcion, precio }) {
    await db.query(
      'INSERT INTO plato (id_categoria, nombre, descripcion, precio) VALUES ($1, $2, $3, $4)',
      [idCategoria, nombre, descripcion || null, precio]
    );
  },

  async actualizarPlato(idPlato, { idCategoria, nombre, descripcion, precio }) {
    await db.query(
      `UPDATE plato SET id_categoria = $2, nombre = $3, descripcion = $4, precio = $5 WHERE id_plato = $1`,
      [idPlato, idCategoria, nombre, descripcion || null, precio]
    );
  },

  async cambiarDisponibilidad(idPlato) {
    await db.query('UPDATE plato SET disponible = NOT disponible WHERE id_plato = $1', [idPlato]);
  }
};
