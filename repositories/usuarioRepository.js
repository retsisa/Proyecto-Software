// Patrón Repository: todas las consultas SQL de usuarios viven aquí.
const db = require('../config/db');

module.exports = {
  async buscarPorEmail(email) {
    const { rows } = await db.query(
      `SELECT u.id_usuario, u.nombre, u.apellido, u.password_hash, r.nombre AS rol
         FROM usuario u JOIN rol r ON r.id_rol = u.id_rol
        WHERE u.email = $1 AND u.activo = TRUE`,
      [String(email || '').trim().toLowerCase()]
    );
    return rows[0];
  },

  async listar() {
    const { rows } = await db.query(
      `SELECT u.id_usuario, u.nombre, u.apellido, u.email, u.activo, r.nombre AS rol
         FROM usuario u JOIN rol r ON r.id_rol = u.id_rol
        ORDER BY u.activo DESC, u.apellido, u.nombre`
    );
    return rows;
  },

  async roles() {
    const { rows } = await db.query('SELECT id_rol, nombre FROM rol ORDER BY id_rol');
    return rows;
  },

  async crear({ nombre, apellido, email, passwordHash, idRol }) {
    await db.query(
      `INSERT INTO usuario (nombre, apellido, email, password_hash, id_rol) VALUES ($1, $2, $3, $4, $5)`,
      [nombre, apellido, email, passwordHash, idRol]
    );
  },

  async cambiarActivo(idUsuario, activo) {
    await db.query('UPDATE usuario SET activo = $2 WHERE id_usuario = $1', [idUsuario, activo]);
  }
};
