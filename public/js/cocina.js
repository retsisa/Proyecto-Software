// La cocina consulta cada 10 segundos si llegó un pedido nuevo y recarga la lista.
(function () {
  let visto = Number(document.getElementById('datos-cocina').dataset.ultimo);
  setInterval(async () => {
    try {
      const r = await fetch('/api/cocina/novedades', { headers: { Accept: 'application/json' } });
      if (!r.ok) return;
      const { ultimo } = await r.json();
      if (ultimo !== visto) {
        visto = ultimo;
        window.location.reload();
      }
    } catch (e) { /* sin conexión: se reintenta en el próximo ciclo */ }
  }, 10000);
})();
