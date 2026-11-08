const MenuRepository = require('../repositories/menuRepository');
const { ErrorNegocio } = require('../utils/errores');

const numero = (v) => Number(String(v).replace(',', '.'));

function leerPlato(body) {
  const nombre = String(body.nombre || '').trim();
  const precio = numero(body.precio);
  const idCategoria = Number(body.idCategoria);
  if (!nombre) throw new ErrorNegocio('Escribe el nombre del plato');
  if (!Number.isFinite(precio) || precio <= 0) throw new ErrorNegocio('El precio debe ser mayor a cero');
  if (!Number.isInteger(idCategoria)) throw new ErrorNegocio('Elige una categoría');
  return { idCategoria, nombre, descripcion: String(body.descripcion || '').trim().slice(0, 200), precio };
}

exports.ver = async (req, res) => {
  const [categorias, platos] = await Promise.all([MenuRepository.categorias(), MenuRepository.platos()]);
  res.render('menu', { categorias, platos });
};

exports.crearPlato = async (req) => {
  await MenuRepository.crearPlato(leerPlato(req.body));
  return { ok: 'Plato agregado al menú' };
};

exports.editarPlato = async (req) => {
  await MenuRepository.actualizarPlato(Number(req.params.id), leerPlato(req.body));
  return { ok: 'Plato actualizado' };
};

exports.cambiarDisponibilidad = async (req) => {
  await MenuRepository.cambiarDisponibilidad(Number(req.params.id));
  return { ok: 'Disponibilidad actualizada' };
};

exports.crearCategoria = async (req) => {
  const nombre = String(req.body.nombre || '').trim();
  if (!nombre) throw new ErrorNegocio('Escribe el nombre de la categoría');
  await MenuRepository.crearCategoria(nombre);
  return { ok: 'Categoría creada' };
};
