// Error esperado por reglas del negocio: se muestra al usuario como mensaje, no como fallo del servidor.
class ErrorNegocio extends Error {
  constructor(mensaje) {
    super(mensaje);
    this.name = 'ErrorNegocio';
  }
}

module.exports = { ErrorNegocio };
