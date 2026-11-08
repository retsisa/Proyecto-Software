// En caja, el campo "monto recibido" solo se usa con pagos en efectivo.
document.querySelectorAll('.cobro-form').forEach((form) => {
  const metodo = form.querySelector('.metodo');
  const campo = form.querySelector('.campo-recibido');
  const alternar = () => { campo.hidden = metodo.value !== 'efectivo'; };
  metodo.addEventListener('change', alternar);
  alternar();
});
