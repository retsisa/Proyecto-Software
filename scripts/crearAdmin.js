// Crea un usuario administrador con la contraseña cifrada.
// Uso: npm run admin:crear -- correo@ejemplo.com MiClave123
require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('../config/db');

(async () => {
  const [email, clave] = process.argv.slice(2);
  if (!email || !clave) {
    console.error('Uso: npm run admin:crear -- correo@ejemplo.com MiClave123');
    process.exit(1);
  }
  try {
    const hash = await bcrypt.hash(clave, 10);
    await db.query(
      `INSERT INTO usuario (nombre, apellido, email, password_hash, id_rol)
       VALUES ('Admin', 'Sistema', $1, $2, (SELECT id_rol FROM rol WHERE nombre = 'administrador'))`,
      [email.trim().toLowerCase(), hash]
    );
    console.log('Administrador creado:', email);
  } catch (e) {
    console.error('No se pudo crear el administrador:', e.message);
    process.exitCode = 1;
  } finally {
    await db.end();
  }
})();
