// Toma de pedidos: arma el pedido en el navegador y lo envía al servidor como JSON.
(function () {
  const toma = document.getElementById('toma');
  const idMesa = Number(toma.dataset.mesa);
  const platos = Array.from(document.querySelectorAll('.plato'));
  const lineas = document.getElementById('lineas');
  const total = document.getElementById('total');
  const enviar = document.getElementById('enviar');
  const error = document.getElementById('error');
  const cantidades = new Map(); // id del plato -> cantidad

  const bs = (n) => 'Bs ' + n.toFixed(2);

  function pintar() {
    let suma = 0;
    lineas.innerHTML = '';
    platos.forEach((el) => {
      const id = Number(el.dataset.id);
      const cant = cantidades.get(id) || 0;
      el.querySelector('output').textContent = cant;
      el.classList.toggle('activo', cant > 0);
      el.querySelector('.nota-plato').hidden = cant === 0;
      if (cant > 0) {
        const subtotal = cant * Number(el.dataset.precio);
        suma += subtotal;
        const li = document.createElement('li');
        const nombre = document.createElement('span');
        nombre.textContent = cant + '× ' + el.dataset.nombre;
        const importe = document.createElement('span');
        importe.textContent = bs(subtotal);
        li.append(nombre, importe);
        lineas.appendChild(li);
      }
    });
    if (!lineas.children.length) {
      const li = document.createElement('li');
      li.className = 'vacio-texto';
      li.textContent = 'Aún no hay platos.';
      lineas.appendChild(li);
    }
    total.textContent = bs(suma);
    enviar.disabled = suma === 0;
  }

  toma.addEventListener('click', (e) => {
    const boton = e.target.closest('button[data-accion]');
    if (!boton) return;
    const el = boton.closest('.plato');
    const id = Number(el.dataset.id);
    const actual = cantidades.get(id) || 0;
    const nueva = boton.dataset.accion === 'mas' ? Math.min(actual + 1, 50) : Math.max(actual - 1, 0);
    cantidades.set(id, nueva);
    pintar();
  });

  enviar.addEventListener('click', async () => {
    error.hidden = true;
    const items = platos
      .map((el) => ({
        idPlato: Number(el.dataset.id),
        cantidad: cantidades.get(Number(el.dataset.id)) || 0,
        observacion: el.querySelector('.nota-plato').value.trim()
      }))
      .filter((i) => i.cantidad > 0);

    enviar.disabled = true;
    enviar.textContent = 'Enviando…';
    try {
      const r = await fetch('/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idMesa, items })
      });
      const datos = await r.json().catch(() => ({}));
      if (r.status === 401 || r.redirected) { window.location.href = '/login'; return; }
      if (!r.ok) throw new Error(datos.error || 'No se pudo enviar el pedido');
      window.location.href = '/pedidos?ok=' + encodeURIComponent('Pedido enviado a cocina');
    } catch (e) {
      error.textContent = e.message;
      error.hidden = false;
      enviar.disabled = false;
      enviar.textContent = 'Enviar a cocina';
    }
  });

  pintar();
})();
