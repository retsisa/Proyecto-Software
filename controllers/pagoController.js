const PedidoRepository = require('../repositories/pedidoRepository');
const PagoService = require('../services/pagoService');
const { metodosDisponibles } = require('../factories/pagoFactory');

exports.ver = async (req, res) => {
  const pedidos = await PedidoRepository.listarPorEstados(['listo', 'entregado']);
  res.render('cobro', { pedidos, metodos: metodosDisponibles });
};

exports.cobrar = async (req) => {
  const idPedido = Number(req.body.idPedido);
  const pago = await PagoService.cobrar({
    idPedido,
    idUsuario: req.usuario.id,
    metodo: String(req.body.metodo || ''),
    recibido: Number(String(req.body.recibido || '').replace(',', '.'))
  });
  const cambio = pago.cambio > 0 ? ` Cambio: Bs ${pago.cambio.toFixed(2)}.` : '';
  return { ok: `Pedido #${idPedido} cobrado.${cambio}`, url: `/comprobante/${idPedido}` };
};

exports.comprobante = async (req, res) => {
  const pedido = await PedidoRepository.obtener(Number(req.params.id));
  if (!pedido || pedido.estado !== 'pagado') {
    return res.status(404).render('error', { titulo: 'Sin comprobante', mensaje: 'Ese pedido no está pagado.' });
  }
  res.render('comprobante', { pedido });
};
