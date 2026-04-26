# MiRest con IA · Pedidos

## Estado actual

La implementación activa quedó consolidada sobre la capa modular en [`frontend/`](frontend).

### Runtime oficial

- Entrada principal: [`frontend/core/bootstrap.js`](frontend/core/bootstrap.js)
- Orquestador de UI y eventos: [`frontend/core/modular-app.js`](frontend/core/modular-app.js)
- Estado global: [`frontend/core/app-state.js`](frontend/core/app-state.js)
- Utilidades UI: [`frontend/core/ui-helpers.js`](frontend/core/ui-helpers.js)
- Persistencia y onboarding: [`frontend/core/storage.js`](frontend/core/storage.js), [`frontend/modules/pedidos/onboarding.js`](frontend/modules/pedidos/onboarding.js)

### Módulos operativos activos

- Salón: [`frontend/modules/pedidos/salon/index.js`](frontend/modules/pedidos/salon/index.js)
- Delivery: [`frontend/modules/pedidos/delivery/index.js`](frontend/modules/pedidos/delivery/index.js)
- Para llevar: [`frontend/modules/pedidos/takeaway/index.js`](frontend/modules/pedidos/takeaway/index.js)
- Panel resumen: [`frontend/modules/dashboard/index.js`](frontend/modules/dashboard/index.js)

### Limpieza aplicada

- Se retiró el arranque legacy basado en [`app.js`](app.js) y [`ui.js`](ui.js).
- [`index.html`](index.html) ahora comunica explícitamente que el módulo activo usa la capa modular.
- [`service-worker.js`](service-worker.js) fue alineado con los assets del runtime modular.
- Se añadió acceso directo al dashboard desde la esquina superior izquierda y se ajustó la paleta del drawer al estilo oscuro/naranja de referencia.
- Se integraron ticket de pago, facturación desde dashboard, configuración de impresoras, cierre de sesión y rondas apiladas en salón.

## Estructura relevante

```text
implementacion/
├── index.html
├── data.js
├── manifest.json
├── service-worker.js
├── styles.css
├── frontend/
│   ├── core/
│   │   ├── app-state.js
│   │   ├── bootstrap.js
│   │   ├── mesero-bridge.js
│   │   ├── modular-app.js
│   │   ├── pwa.js
│   │   ├── storage.js
│   │   └── ui-helpers.js
│   ├── modules/
│   │   ├── dashboard/
│   │   └── pedidos/
│   └── styles/
└── backend/
```

## Flujo funcional vigente

### Salón

- grid de mesas filtrable por zona,
- búsqueda en tiempo real,
- selección de mesa,
- panel contextual con estado, total estimado e ítems,
- bloqueo de liberación si existen ítems activos.

### Delivery

- pizarra por etapas,
- selección de pedido,
- panel derecho con cliente, dirección, pago y total,
- avance de estado desde card o panel.

### Para llevar

- cola por etapas,
- selección de pedido,
- panel derecho con promesa, código de recojo, pago y total,
- avance de estado desde card o panel.

### UX base

- topbar compacta,
- selector de modo visible,
- dark mode persistido,
- soporte PWA vía [`frontend/core/pwa.js`](frontend/core/pwa.js),
- onboarding contextual con reapertura desde `Guía rápida`.

## Refactor UI/UX Mesero-First

- Las tarjetas de mesa de Salón priorizan lectura rápida: número grande, total visible, estado compacto y micro-indicador animado cuando existe una ronda `enviada` pendiente de servir.
- En móvil, los filtros de zona se comportan como barra táctil inferior y el panel de gestión usa bottom sheet de hasta `90dvh` cuando se abre desde la experiencia PWA.
- Los targets táctiles críticos usan un mínimo de `44px` y el total estimado del panel queda destacado con el color primario del sistema.
- Los empty states usan un layout centrado más visual para reducir ruido cuando no hay mesa o resultados seleccionados.

### Validación rápida del refactor

1. Abrir `http://localhost:5500/implementacion/` con el servidor estático activo.
2. Entrar a `Salón` y verificar tarjetas `libre`, `ocupada` y `reservada`.
3. Seleccionar `Mesa 1` y confirmar que el panel se actualice sin recargar.
4. En DevTools mobile, usar iPhone 12/13 y validar filtros inferiores, targets táctiles y bottom sheet del panel.
5. Alternar dark mode desde el chip de usuario para revisar contraste de mesas ocupadas.

## Arquitectura dual V2 PWA/Desktop

- La variante PWA vive en [`../views/pedidos.ejs`](../views/pedidos.ejs) con marcador `@variant: pwa`, fuente DM Sans, max-width de `480px`, bottom nav y soporte safe-area.
- La variante Desktop vive en [`../views/pedidos-desktop.ejs`](../views/pedidos-desktop.ejs) con marcador `@variant: desktop`, fuente Inter y frame operativo de hasta `1920px`.
- Los colores, gradientes, radios, sombras y medidas base se centralizan en [`../public/css/tokens-v2.css`](../public/css/tokens-v2.css); los estilos de composición de la pantalla están en [`../public/css/pedidos-v2.css`](../public/css/pedidos-v2.css).
- El router por dispositivo está en [`../lib/deviceRouter.js`](../lib/deviceRouter.js) y permite forzar variante con `?variant=pwa` o `?variant=desktop`.
- La data compartida para ambas vistas sale de [`../services/pedidoService.js`](../services/pedidoService.js), evitando duplicar cálculos de totales y normalización de mesas.
- La capa Express en [`../server.js`](../server.js) aplica Helmet con CSP, bloqueo de frames, rate limiting de `120 req/min` y validación Zod para rondas/pagos desde [`../validators/pedidoSchemas.js`](../validators/pedidoSchemas.js).

### Cómo ejecutar V2

```bash
npm install
npm start
```

Luego abrir:

- `http://localhost:3000/pedidos?variant=pwa`
- `http://localhost:3000/pedidos?variant=desktop`

### Cómo testear V2

```bash
npm test
```

## Alineación visual V2.1 Admin Style

- Los botones y estados activos usan el glow administrativo `0 8px 20px rgba(239, 82, 15, 0.4)` centralizado en [`../public/css/tokens-v2.css`](../public/css/tokens-v2.css).
- El sidebar desktop de [`../views/pedidos-desktop.ejs`](../views/pedidos-desktop.ejs) replica la jerarquía visual del administrador: secciones en tracking alto, submenús indentados y activo con gradiente naranja.
- Las superficies de [`../public/css/pedidos-v2.css`](../public/css/pedidos-v2.css) usan cards flotantes con `border-radius: 20px` y sombra amplia suave para evitar una UI plana.
- El botón de pago usa verde `#22C55E`, glow suave y copy con check para alinearse al estilo de `Abrir Caja`.

## Cómo ejecutar

### Opción recomendada

Servir la carpeta con Live Server sobre [`index.html`](index.html).

### Opción alternativa

Usar un servidor estático simple:

```bash
python -m http.server 5500
```

Luego abrir `http://localhost:5500`.

## Cómo validar

1. Abrir [`index.html`](index.html).
2. Confirmar que cargue el selector de modos `Salón`, `Delivery` y `Para llevar`.
3. Seleccionar una mesa en salón y verificar el panel derecho.
4. Cambiar a delivery y avanzar el estado de cualquier pedido.
5. Cambiar a para llevar y avanzar el estado de cualquier recojo.
6. Alternar el tema oscuro con el control superior o desde el chip de usuario.
7. Abrir `Guía rápida` y verificar que el onboarding PRO vuelva a mostrarse.

## Diagnóstico de arranque en localhost

- El runtime modular se carga desde [`frontend/core/bootstrap.js`](frontend/core/bootstrap.js) mediante ES Modules.
- Si la pantalla muestra `La app no pudo inicializarse`, abrir DevTools y revisar los logs `[boot]` y `[modular-app]`.
- La app debe poder abrirse desde Live Server en rutas como `http://127.0.0.1:5500/implementacion/` o `http://localhost:5500/implementacion/index.html`.
- Para descartar caché local durante desarrollo, [`index.html`](index.html) limpia service workers y caches cuando el hostname es `localhost` o `127.0.0.1`.
- Validación rápida de sintaxis antes de probar en navegador:

```bash
node --check frontend/core/bootstrap.js
node --check frontend/core/modular-app.js
```

## Deploy

Al ser una app estática, se puede publicar directamente en hosting estático como Vercel, Netlify o GitHub Pages.

## Nota técnica

- [`data.js`](data.js) sigue siendo la fuente mock de datos operativos.
- [`styles.css`](styles.css) sigue cargándose por compatibilidad visual, pero el runtime oficial ya no depende de lógica legacy.
- La siguiente iteración razonable es desacoplar también la capa de datos hacia repositorios modulares.
