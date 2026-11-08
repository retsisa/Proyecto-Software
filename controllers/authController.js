const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UsuarioRepository = require('../repositories/usuarioRepository');

exports.mostrarLogin = (req, res) => {
  res.render('login', { error: null, email: '' });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const usuario = await UsuarioRepository.buscarPorEmail(email);

  if (!usuario || !(await bcrypt.compare(String(password || ''), usuario.password_hash))) {
    return res.status(401).render('login', { error: 'Correo o contraseña incorrectos', email: email || '' });
  }

  const token = jwt.sign(
    { id: usuario.id_usuario, nombre: usuario.nombre, rol: usuario.rol },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 8 * 60 * 60 * 1000
  });
  res.redirect('/dashboard');
};

exports.logout = (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
};
