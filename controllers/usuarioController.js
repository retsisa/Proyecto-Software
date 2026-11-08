const bcrypt = require('bcrypt');
const UsuarioRepository = require('../repositories/usuarioRepository');
const { ErrorNegocio } = require('../utils/errores');

exports.ver = async (req, res) => {
  const [usuarios, roles] = await Promise.all([UsuarioRepository.listar(), UsuarioRepository.roles()]);
  res.render('usuarios', { usuarios, roles });
};

exports.crear = async (req) => {
  const { nombre, apellido, email, password } = req.body;
  if (!String(nombre || '').trim() || !String(apellido || '').trim() || !String(email || '').includes('@')) {
    throw new ErrorNegocio('Completa nombre, apellido y un correo válido');
  }
  if (String(password || '').length < 6) throw new ErrorNegocio('La contraseña debe tener al menos 6 caracteres');
  await UsuarioRepository.crear({
    nombre: nombre.trim(),
    apellido: apellido.trim(),
    email: email.trim().toLowerCase(),
    passwordHash: await bcrypt.hash(password, 10),
    idRol: Number(req.body.idRol)
  });
  return { ok: 'Usuario creado' };
};

exports.cambiarActivo = async (req) => {
  if (Number(req.params.id) === req.usuario.id) throw new ErrorNegocio('No puedes desactivar tu propio usuario');
  await UsuarioRepository.cambiarActivo(Number(req.params.id), req.body.activo === 'true');
  return { ok: 'Usuario actualizado' };
};
