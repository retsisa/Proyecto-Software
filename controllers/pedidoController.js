const MesaRepository = require('../repositories/mesaRepository');
const MenuRepository = require('../repositories/menuRepository');
const PedidoRepository = require('../repositories/pedidoRepository');
const PedidoService = require('../services/pedidoService');
const { ErrorNegocio } = require('../utils/errores');

exports.nuevo = async (req, res) => {
  const mesa = await MesaRepository.obtener(Number(req.params.idMesa));
  if (!mesa) return res.status(404).render('error', { titulo: 'Mesa no encontrada', mensaje: 'Esa mesa no existe.' });
  if (mesa.estado === 'reservada') {
    return res.redirect('/mesas?err=' + encodeURIComponent('La mesa está reservada'));
  }
  const platos = await MenuRepository.platos({ soloDisponibles: true });
  const categorias = [];
  for (const p of platos) {
    let grupo = categorias.find((c) => c.nombre === p.categoria);
    if (!grupo) categorias.push((grupo = { nombre: p.categoria, platos: [] }));
    grupo.platos.push(p);
  }
  res.render('pedido_nuevo', { mesa, categorias });
};

// Recibe el pedido como JSON desde el navegador.
exports.crear = async (req, res) => {
  try {
    const idPedido = await PedidoService.crearPedido({
      idMesa: Number(req.body.idMesa),
      idUsuario: req.usuario.id,
      items: req.body.items
    });
    res.status(201).json({ idPedido });
  } catch (e) {
    if (e instanceof ErrorNegocio) return res.status(400).json({ error: e.message });
    throw e;
  }
};

exports.listar = async (req, res) => {
  const soloMios = req.usuario.rol === 'mesero';
  const pedidos = await PedidoRepository.listarPorEstados(PedidoRepository.ESTADOS_ACTIVOS, {
    idUsuario: soloMios ? req.usuario.id : null
  });
  res.render('pedidos', { pedidos });
};

exports.cambiarEstado = async (req) => {
  await PedidoService.cambiarEstado({
    idPedido: Number(req.params.id),
    estado: String(req.body.estado || ''),
    rol: req.usuario.rol
  });
  return { ok: 'Pedido actualizado', url: req.body.volver === '/cocina' ? '/cocina' : '/pedidos' };
};
