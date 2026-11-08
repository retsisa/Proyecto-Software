const express = require('express');
const wrap = require('../utils/wrap');
const accion = require('../utils/accion');
const { autenticar, permitir } = require('../middleware/auth');

const auth = require('../controllers/authController');
const panel = require('../controllers/panelController');
const menu = require('../controllers/menuController');
const mesa = require('../controllers/mesaController');
const pedido = require('../controllers/pedidoController');
const cocina = require('../controllers/cocinaController');
const pago = require('../controllers/pagoController');
const reporte = require('../controllers/reporteController');
const usuario = require('../controllers/usuarioController');

const router = express.Router();
const ADMIN = 'administrador';

// Acceso
router.get('/', (req, res) => res.redirect('/dashboard'));
router.get('/login', auth.mostrarLogin);
router.post('/login', wrap(auth.login));
router.post('/logout', auth.logout);
router.get('/logout', auth.logout);

// Todo lo que sigue exige iniciar sesión
router.use(autenticar);
router.get('/dashboard', panel.ver);

// Menú (administrador)
router.get('/menu', permitir(ADMIN), wrap(menu.ver));
router.post('/menu/platos', permitir(ADMIN), accion('/menu', menu.crearPlato));
router.post('/menu/platos/:id/editar', permitir(ADMIN), accion('/menu', menu.editarPlato));
router.post('/menu/platos/:id/disponibilidad', permitir(ADMIN), accion('/menu', menu.cambiarDisponibilidad));
router.post('/menu/categorias', permitir(ADMIN), accion('/menu', menu.crearCategoria));

// Mesas
router.get('/mesas', permitir(ADMIN, 'mesero'), wrap(mesa.ver));
router.post('/mesas', permitir(ADMIN), accion('/mesas', mesa.crear));
router.post('/mesas/:id/reservar', permitir(ADMIN, 'mesero'), accion('/mesas', mesa.reservar));

// Pedidos
router.get('/pedidos/nuevo/:idMesa', permitir(ADMIN, 'mesero'), wrap(pedido.nuevo));
router.post('/pedidos', permitir(ADMIN, 'mesero'), wrap(pedido.crear));
router.get('/pedidos', permitir(ADMIN, 'mesero'), wrap(pedido.listar));
router.post('/pedidos/:id/estado', permitir(ADMIN, 'mesero', 'cocina'), accion('/pedidos', pedido.cambiarEstado));

// Cocina
router.get('/cocina', permitir(ADMIN, 'cocina'), wrap(cocina.ver));
router.get('/api/cocina/novedades', permitir(ADMIN, 'cocina'), cocina.novedades);

// Caja
router.get('/cobro', permitir(ADMIN, 'caja'), wrap(pago.ver));
router.post('/pagos', permitir(ADMIN, 'caja'), accion('/cobro', pago.cobrar));
router.get('/comprobante/:id', permitir(ADMIN, 'caja'), wrap(pago.comprobante));

// Reportes y usuarios (administrador)
router.get('/reportes', permitir(ADMIN), wrap(reporte.ver));
router.get('/usuarios', permitir(ADMIN), wrap(usuario.ver));
router.post('/usuarios', permitir(ADMIN), accion('/usuarios', usuario.crear));
router.post('/usuarios/:id/activo', permitir(ADMIN), accion('/usuarios', usuario.cambiarActivo));

module.exports = router;
