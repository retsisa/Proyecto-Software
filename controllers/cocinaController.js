const PedidoRepository = require('../repositories/pedidoRepository');
const cocinaListener = require('../events/cocinaListener');

exports.ver = async (req, res) => {
  const pedidos = await PedidoRepository.listarPorEstados(['pendiente', 'en_preparacion']);
  res.render('cocina', { pedidos, ultimo: cocinaListener.ultimo() });
};

exports.novedades = (req, res) => {
  res.json({ ultimo: cocinaListener.ultimo() });
};
