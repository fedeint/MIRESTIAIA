# Refactor plan — Módulo [`Pedidos`](../implementacion/index.html)

## Integración de dashboard y módulos conectados

Referencia analizada desde [`repositorioprincipal/MiRestconIA`](../repositorioprincipal/MiRestconIA):

- [`views/dashboard-desktop.ejs`](../repositorioprincipal/MiRestconIA/views/dashboard-desktop.ejs)
- [`views/dashboard-mesero.ejs`](../repositorioprincipal/MiRestconIA/views/dashboard-mesero.ejs)
- [`routes/pedidos.js`](../repositorioprincipal/MiRestconIA/routes/pedidos.js)
- [`routes/delivery.js`](../repositorioprincipal/MiRestconIA/routes/delivery.js)
- [`routes/para-llevar.js`](../repositorioprincipal/MiRestconIA/routes/para-llevar.js)

### Qué se integrará al refactor

1. saludo contextual por rol
2. resumen del día
3. pendientes del turno
4. accesos rápidos a módulos conectados
5. puente visual entre `Dashboard` y [`Pedidos`](../implementacion/index.html)

### Módulos conectados a simular

- `Caja`
- `Cocina`
- `Facturación`
- `Clientes`
- `Mesas`
- `Delivery`
- `Para llevar`

### Estrategia

No se copiará el dashboard directamente. Se usarán patrones visuales y de información para crear una versión modular compatible con la arquitectura nueva de [`implementacion/frontend`](../implementacion/frontend).
