process.env.TZ = 'UTC'; // las fechas de la base de datos están en UTC
require('dotenv').config();
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');

if (!process.env.DATABASE_URL || !process.env.JWT_SECRET) {
  console.error('Faltan las variables de entorno DATABASE_URL y JWT_SECRET (ver .env.example).');
  process.exit(1);
}

require('./events/cocinaListener');
const db = require('./config/db');
const cocinaListener = require('./events/cocinaListener');
const routes = require('./routes');

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('trust proxy', 1);

// Ayudantes disponibles en todas las vistas.
const ZONA = process.env.TZ_NEGOCIO || 'America/La_Paz';
app.locals.bs = (n) => 'Bs ' + Number(n).toFixed(2);
app.locals.hora = (d) =>
  new Date(d).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', timeZone: ZONA });
app.locals.fechaHora = (d) =>
  new Date(d).toLocaleString('es-BO', { dateStyle: 'short', timeStyle: 'short', timeZone: ZONA });
app.locals.minutosDesde = (d) => Math.max(0, Math.round((Date.now() - new Date(d).getTime()) / 60000));
app.locals.etiquetaEstado = (e) =>
  ({ pendiente: 'Pendiente', en_preparacion: 'En preparación', listo: 'Listo', entregado: 'Entregado', pagado: 'Pagado', cancelado: 'Cancelado' }[e] || e);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Mensajes de éxito o error que viajan en la URL tras enviar un formulario.
app.use((req, res, next) => {
  res.locals.usuario = null;
  res.locals.ok = req.query.ok || null;
  res.locals.err = req.query.err || null;
  res.locals.ruta = req.path;
  next();
});

app.get('/salud', (req, res) => res.json({ estado: 'ok' }));
app.use('/', routes);

app.use((req, res) => {
  res.status(404).render('error', { titulo: 'Página no encontrada', mensaje: 'La dirección que buscas no existe.' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('error', {
    titulo: 'Algo salió mal',
    mensaje: 'Ocurrió un error en el servidor. Intenta de nuevo; si sigue pasando, avisa al administrador.'
  });
});

const puerto = process.env.PORT || 3000;
db.query('SELECT COALESCE(MAX(id_pedido), 0) AS ultimo FROM pedido')
  .then(({ rows }) => {
    cocinaListener.fijar(Number(rows[0].ultimo));
    app.listen(puerto, () => console.log(`RestoGest en marcha en el puerto ${puerto}`));
  })
  .catch((e) => {
    console.error('No se pudo conectar a la base de datos:', e.message);
    process.exit(1);
  });
