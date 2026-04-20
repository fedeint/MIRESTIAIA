# TECHNICAL_DOCS · Módulo [`implementacion`](implementacion)

## Resumen de arquitectura

La implementación operativa vive en [`implementacion`](implementacion) y mantiene una sola base visual para `Salón`, `Delivery` y `Para llevar`, separando claramente:

- presentación y render en [`implementacion/ui.js`](implementacion/ui.js),
- reglas de negocio y validaciones en [`implementacion/app.js`](implementacion/app.js),
- fallback y normalización en [`implementacion/data.js`](implementacion/data.js),
- registros mock en JSON dentro de [`implementacion/backend/data`](implementacion/backend/data),
- layout, responsive y microinteracciones en [`implementacion/styles.css`](implementacion/styles.css).

## Estructura Frontend / Backend local

Dentro de [`implementacion`](implementacion) la maqueta ahora se entiende como un solo módulo `Pedidos` con una separación liviana:

- **Frontend**: [`implementacion/index.html`](implementacion/index.html), [`implementacion/styles.css`](implementacion/styles.css), [`implementacion/app.js`](implementacion/app.js), [`implementacion/ui.js`](implementacion/ui.js).
- **Backend mock**: [`implementacion/backend/data/staff.json`](implementacion/backend/data/staff.json), [`implementacion/backend/data/catalog.json`](implementacion/backend/data/catalog.json), [`implementacion/backend/data/orders-salon.json`](implementacion/backend/data/orders-salon.json), [`implementacion/backend/data/orders-delivery.json`](implementacion/backend/data/orders-delivery.json), [`implementacion/backend/data/orders-takeaway.json`](implementacion/backend/data/orders-takeaway.json).

## Cambios funcionales implementados

### Capa desktop operativa [`implementacion/app.js`](implementacion/app.js) + [`implementacion/ui.js`](implementacion/ui.js)

- Se añadió un `desktopWorkbench` al estado global para manejar áreas operativas y recorridos completos sin romper la arquitectura existente.
- El workspace ahora soporta tabs desktop de alto nivel: `Pedidos`, `Cortesías`, `Propinas` y `Nota de crédito`.
- `Salón` incorpora una simulación desktop de `Servicio`, `Rondas`, `Cuenta` y `Cobro` con selección de propina y método de pago.
- `Delivery` y `Para llevar` heredan el panel lateral existente, pero ahora muestran evidencia mock de pago cuando aplica.
- `Cortesías`, `Propinas` y `Nota de crédito` se renderizan como vistas operativas desktop sobre el mismo layout principal.

### Datos mock desktop [`implementacion/data.js`](implementacion/data.js)

Se agregaron nuevas colecciones para acelerar la construcción del recorrido completo:

- `desktopTableJourneys`
- `desktopPaymentMethods`
- `desktopTipOptions`
- `desktopDeliveryWorkspace`
- `desktopTakeawayWorkspace`
- `courtesyCatalog`
- `courtesyDashboard`
- `staffMealConsumption`
- `courtesyLimits`
- `tipsDashboard`
- `creditNoteDrafts`

Estas estructuras permiten iterar UX/negocio sin requerir backend real ni alterar el contrato base del módulo.

### [`Delivery`](implementacion/ui.js:895)

- Se transformó el tablero en un pipeline horizontal compacto tipo flujo.
- Cada card muestra menos datos: código, cliente, tiempo crítico, comprobante y estado de pago.
- Dirección, teléfono, courier, tipo de comprobante y validaciones SUNAT se movieron al panel lateral en [`renderDeliveryPanel()`](implementacion/ui.js:1039).
- Regla anti-trampa: no puede pasar a `entregado` si no existe pago confirmado y comprobante emitido.

### [`Para llevar`](implementacion/ui.js:953)

- Se reemplazó la cola rígida por un mini mapa rectangular con nodos por etapa.
- Cada nodo muestra el flujo operativo con promesa, fuente del pedido, recargo y bloqueo documental.
- Regla anti-trampa: no puede pasar a `entregado` si no existe pago confirmado y boleta/factura emitida.

### [`Salón → Para llevar`](implementacion/ui.js:1139)

- El drawer incorpora una sección `Opciones extra`.
- Un pedido de mesa puede marcarse como `Para llevar` y sincronizarse con la cola pickup.
- Si el origen es `Salón` o `WhatsApp`, se aplica automáticamente un recargo del `10%` por envases, bolsas, botellas o taper.

## Referencia operativa SUNAT aplicada

La implementación usa una validación referencial inspirada en el flujo real de comprobantes electrónicos:

- `Boleta`: opción por defecto para consumo en salón o pickup estándar.
- `Factura`: opcional, pero requiere `RUC` válido y razón social antes de emitir.
- El frontend bloquea el cierre operativo cuando el comprobante aún no fue emitido o el pago no está validado.

Esto no reemplaza una integración real con SUNAT, pero deja la UI y las reglas listas para conectarse luego a un backend.

## Contrato Front ↔ Back sugerido

Para una futura API real, estas entidades deberían incluir al menos:

### `tables`

- `id`
- `number`
- `zone`
- `status`
- `waiterId`
- `order.serviceType`
- `order.takeawayChannel`
- `order.documentType`
- `order.documentIssued`
- `order.paymentConfirmed`
- `order.packagingFeeRate`
- `order.linkedTakeawayId`

### `deliveryOrders`

- `id`
- `code`
- `customer`
- `status`
- `courierId`
- `elapsedMinutes`
- `etaMinutes`
- `documentType`
- `documentIssued`
- `paymentConfirmed`
- `customerDocument`
- `businessName`
- `timeline`

### `takeawayOrders`

- `id`
- `code`
- `customer`
- `status`
- `source`
- `pickupCode`
- `documentType`
- `documentIssued`
- `paymentConfirmed`
- `baseTotal`
- `packagingFeeRate`
- `packagingFeeAmount`
- `total`
- `linkedTableId`
- `timeline`

## Simulación local actual

Mientras no exista backend real:

- el sistema intenta hidratar datos desde [`implementacion/backend/data`](implementacion/backend/data),
- si no puede leer JSON, usa fallback desde [`implementacion/data.js`](implementacion/data.js),
- luego persiste cambios operativos en `localStorage` desde [`implementacion/app.js`](implementacion/app.js).
- las evidencias de pago desktop se manejan como adjuntos mock y se marcan conceptualmente como reprocesadas a `.webp`.

## README técnico rápido

- **Run:** abrir [`implementacion/index.html`](implementacion/index.html) o servir la carpeta con cualquier static server.
- **Test manual recomendado:** `mesa → marcar para llevar → sincronizar pickup → emitir comprobante → confirmar pago → entregar`.
- **Test desktop recomendado:** `Pedidos → seleccionar mesa → revisar rondas → configurar cobro → cambiar a Cortesías/Propinas/Nota de crédito`.
- **Deploy:** publicar [`implementacion`](implementacion) en hosting estático y luego conectar APIs reales para SUNAT, caja y bot de WhatsApp.

## Ajuste UX/UI aplicado

- El dashboard se enfoca en el único módulo `Pedidos`.
- Se redujo texto accesorio en títulos, subtítulos, chips y botones para evitar ruido visual al mesero.
- `Delivery` quedó como pizarra observacional; no se usa para gestionar cocina ni avanzar flujo manual desde la card.
- El onboarding se está moviendo de modal central a guía contextual sobre la interfaz.

## Próxima etapa

1. Reemplazar la evidencia mock de pago por procesamiento real de imagen a `.webp` con preview binario.
2. Integrar emisión real de CPE SUNAT desde backend.
3. Registrar auditoría por usuario para cambios de estado sensibles.
4. Conectar bot de WhatsApp para crear pedidos pickup automáticos.
