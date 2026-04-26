# Frontend Modules

Estructura vigente de módulos de negocio para [`Pedidos`](../../index.html).

## Módulos previstos

- `pedidos/salon/`
- `pedidos/delivery/`
- `pedidos/takeaway/`
- `dashboard/`
- `courtesies/`
- `tips/`
- `credit-notes/`

Cada módulo expone o debe exponer:

- estado mínimo
- render principal
- acciones/mutaciones
- helpers propios

## Estado actual

- [`frontend/core/bootstrap.js`](../core/bootstrap.js) arranca el runtime modular oficial.
- [`frontend/core/modular-app.js`](../core/modular-app.js) orquesta render, eventos y navegación operativa.
- [`pedidos/salon/`](./pedidos/salon) renderiza mesas y panel contextual.
- [`pedidos/delivery/`](./pedidos/delivery) renderiza la pizarra de delivery.
- [`pedidos/takeaway/`](./pedidos/takeaway) renderiza la cola de recojo.
- [`dashboard/`](./dashboard) ahora aporta el panel resumen de operación.
