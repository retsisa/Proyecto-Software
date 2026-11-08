const MesaRepository = require('../repositories/mesaRepository');
const { ErrorNegocio } = require('../utils/errores');

exports.ver = async (req, res) => {
  res.render('mesas', { mesas: await MesaRepository.listar() });
};

exports.crear = async (req) => {
  const numero = Number(req.body.numero);
  const capacidad = Number(req.body.capacidad);
  if (!Number.isInteger(numero) || numero < 1 || !Number.isInteger(capacidad) || capacidad < 1) {
    throw new ErrorNegocio('Número y capacidad deben ser enteros mayores a cero');
  }
  await MesaRepository.crear({ numero, capacidad });
  return { ok: `Mesa ${numero} creada` };
};

exports.reservar = async (req) => {
  await MesaRepository.cambiarReserva(Number(req.params.id));
  return { ok: 'Estado de la mesa actualizado' };
};
