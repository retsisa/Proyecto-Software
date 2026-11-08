// Panel principal: muestra los accesos según el rol.
const ACCESOS = {
  administrador: [
    { href: '/mesas', titulo: 'Mesas', texto: 'Ver el salón y crear mesas' },
    { href: '/pedidos', titulo: 'Pedidos activos', texto: 'Seguimiento de todos los pedidos' },
    { href: '/cocina', titulo: 'Cocina', texto: 'Pantalla de preparación' },
    { href: '/cobro', titulo: 'Caja', texto: 'Cobrar pedidos' },
    { href: '/menu', titulo: 'Menú', texto: 'Platos, precios y disponibilidad' },
    { href: '/reportes', titulo: 'Reportes', texto: 'Ventas y platos más vendidos' },
    { href: '/usuarios', titulo: 'Usuarios', texto: 'Personal y roles' }
  ],
  mesero: [
    { href: '/mesas', titulo: 'Mesas', texto: 'Elige una mesa para tomar el pedido' },
    { href: '/pedidos', titulo: 'Mis pedidos', texto: 'Pedidos en curso y entregas' }
  ],
  cocina: [{ href: '/cocina', titulo: 'Cocina', texto: 'Pedidos por preparar' }],
  caja: [{ href: '/cobro', titulo: 'Caja', texto: 'Pedidos listos para cobrar' }]
};

exports.ver = (req, res) => {
  res.render('dashboard', { accesos: ACCESOS[req.usuario.rol] || [] });
};
