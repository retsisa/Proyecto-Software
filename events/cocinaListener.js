// Observador: la cocina "escucha" los pedidos nuevos.
const bus = require('./bus');

let ultimoPedido = 0;

bus.on('pedido:creado', ({ idPedido }) => {
  ultimoPedido = idPedido;
});

module.exports = { ultimo: () => ultimoPedido, fijar: (n) => { ultimoPedido = n; } };
