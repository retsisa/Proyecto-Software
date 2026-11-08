// Ejecuta scripts/schema.sql contra la base de datos indicada en DATABASE_URL.
// Uso: npm run db:init
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const db = require('../config/db');

(async () => {
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await db.query(sql);
    console.log('Base de datos lista: tablas y datos iniciales creados.');
  } catch (e) {
    console.error('No se pudo crear la base de datos:', e.message);
    process.exitCode = 1;
  } finally {
    await db.end();
  }
})();
