const ReporteRepository = require('../repositories/reporteRepository');

const ZONA = process.env.TZ_NEGOCIO || 'America/La_Paz';
const dia = (ms) => new Date(ms).toLocaleDateString('en-CA', { timeZone: ZONA }); // AAAA-MM-DD en hora local
const hoy = () => dia(Date.now());
const esFecha = (v) => /^\d{4}-\d{2}-\d{2}$/.test(String(v || ''));

exports.ver = async (req, res) => {
  const hasta = esFecha(req.query.hasta) ? req.query.hasta : hoy();
  const desde = esFecha(req.query.desde)
    ? req.query.desde
    : dia(Date.now() - 6 * 86400000);

  const [ventas, platos, metodos] = await Promise.all([
    ReporteRepository.ventasPorDia(desde, hasta),
    ReporteRepository.platosMasVendidos(desde, hasta),
    ReporteRepository.ventasPorMetodo(desde, hasta)
  ]);
  const totalPeriodo = ventas.reduce((s, v) => s + Number(v.total), 0);
  const totalPedidos = ventas.reduce((s, v) => s + v.pedidos, 0);
  res.render('reportes', { desde, hasta, ventas, platos, metodos, totalPeriodo, totalPedidos });
};
