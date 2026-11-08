// Patrón Factory Method: crea el objeto de pago según el método elegido.
const { ErrorNegocio } = require('../utils/errores');

const metodos = {
  efectivo: (monto, recibido) => {
    if (!Number.isFinite(recibido) || recibido < monto) {
      throw new ErrorNegocio('El monto recibido es menor al total del pedido');
    }
    return { metodo: 'efectivo', monto, recibido, cambio: +(recibido - monto).toFixed(2) };
  },
  tarjeta: (monto) => ({ metodo: 'tarjeta', monto, recibido: monto, cambio: 0 }),
  qr: (monto) => ({ metodo: 'qr', monto, recibido: monto, cambio: 0 })
};

exports.crearPago = (metodo, monto, recibido) => {
  if (!metodos[metodo]) throw new ErrorNegocio('Método de pago no válido');
  return metodos[metodo](monto, recibido);
};

exports.metodosDisponibles = Object.keys(metodos);
