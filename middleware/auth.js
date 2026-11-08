// Cadena de responsabilidad: primero se autentica y luego se verifica el rol.
const jwt = require('jsonwebtoken');

function autenticar(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.redirect('/login');
  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    res.locals.usuario = req.usuario;
    next();
  } catch (e) {
    res.clearCookie('token');
    res.redirect('/login');
  }
}

function permitir(...roles) {
  return (req, res, next) => {
    if (roles.includes(req.usuario.rol)) return next();
    res.status(403).render('error', { titulo: 'Acceso denegado', mensaje: 'Tu rol no tiene permiso para esta sección.' });
  };
}

module.exports = { autenticar, permitir };
