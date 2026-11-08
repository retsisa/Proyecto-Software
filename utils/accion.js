// Envuelve los formularios: ejecuta la acción y redirige con un mensaje de éxito o de error.
const { ErrorNegocio } = require('./errores');

function conMensaje(url, tipo, texto) {
  return `${url}${url.includes('?') ? '&' : '?'}${tipo}=${encodeURIComponent(texto)}`;
}

function textoError(e) {
  if (e instanceof ErrorNegocio) return e.message;
  if (e.code === '23505') return 'Ese valor ya existe, usa otro distinto';
  if (e.code === '23514' || e.code === '22P02' || e.code === '23503') return 'Alguno de los datos no es válido';
  return null;
}

// handler devuelve { ok: 'mensaje', url?: '/ruta' }; "volver" es la ruta por defecto.
module.exports = (volver, handler) => async (req, res, next) => {
  try {
    const r = (await handler(req, res)) || {};
    res.redirect(r.ok ? conMensaje(r.url || volver, 'ok', r.ok) : r.url || volver);
  } catch (e) {
    const texto = textoError(e);
    if (texto) return res.redirect(conMensaje(volver, 'err', texto));
    next(e);
  }
};
