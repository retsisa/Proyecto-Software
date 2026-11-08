// Patrón Singleton: una única instancia del pool de conexiones para toda la aplicación.
const { Pool } = require('pg');

let pool;

function getPool() {
  if (!pool) {
    const usarSsl = process.env.DB_SSL !== 'false';
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: usarSsl ? { rejectUnauthorized: false } : false,
      max: 5
    });
    pool.on('error', (err) => console.error('Error inesperado en el pool de PostgreSQL:', err.message));
  }
  return pool;
}

module.exports = getPool();
