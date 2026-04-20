# MiRest con IA · Módulo Mesas

## Estado actual del proyecto

Esta carpeta contiene la implementación vigente del módulo **Mesas** de MiRest con IA, construida como una interfaz operativa en **HTML5 + CSS3 + JavaScript vanilla con ES Modules**, sin framework frontend ni backend conectado.

El proyecto está orientado a simular un flujo real de atención en restaurante desde el mapa de mesas, priorizando:

- lectura visual rápida del salón,
- reducción de ruido operativo,
- gestión progresiva de acciones,
- continuidad del flujo de pedido sin salir de la vista principal,
- consistencia visual con el design system del ecosistema MiRest.

Actualmente el módulo funciona con **datos mock en memoria**, mantiene la preferencia de tema en `localStorage` y está preparado para evolucionar hacia persistencia real vía API.

---

## Objetivo funcional

Resolver la operación diaria del módulo Mesas mediante una interfaz que permita:

1. visualizar el estado completo del salón,
2. buscar y filtrar mesas rápidamente,
3. seleccionar una mesa activa,
4. gestionar sus acciones principales y secundarias,
5. abrir, editar y cerrar pedidos desde un drawer lateral,
6. evitar errores operativos comunes, como liberar una mesa con consumo activo.

---

## Stack técnico

- **HTML5 semántico**
- **CSS3 puro** con variables CSS, Grid, Flexbox, animaciones y soporte dark mode
- **JavaScript ES Modules** sin dependencias externas de UI
- **Google Fonts** con `Inter`
- **SVG inline** para iconografía propia
- **`localStorage`** para persistencia del tema visual

No se detecta uso de:

- framework SPA,
- librerías de estado,
- bundler,
- backend,
- base de datos,
- suite de pruebas automatizadas.

---

## Estructura real del módulo

```text
implementacion/
├── index.html
├── styles.css
├── app.js
├── ui.js
├── data.js
├── Fase 5.md
└── README.md
```

### Descripción por archivo

- **`index.html`**: shell principal del módulo. Define sidebar, topbar, estadísticas, toolbar, grid de mesas, panel lateral y roots dinámicos para modal, drawer y toasts.
- **`styles.css`**: capa completa de presentación. Contiene tokens de diseño, tema claro/oscuro, layout, componentes, animaciones, microinteracciones y responsive breakpoints.
- **`app.js`**: orquestador principal del estado y los eventos. Controla flujos de negocio, modales, drawer, CRUD simulado de mesas y feedback visual.
- **`ui.js`**: capa de render puro. Convierte estado en HTML, calcula visualizaciones y centraliza utilidades de presentación.
- **`data.js`**: dataset mock del módulo: meseros, zonas, estados, categorías, productos y mesas iniciales.
- **`Fase 5.md`**: documentación formal de implementación académica con alcance, validaciones, flujo funcional y evidencias.

---

## Arquitectura actual

La implementación sigue una arquitectura liviana basada en **estado centralizado + renderizado por funciones puras**.

### 1. Estado global

El estado principal vive en `app.js` e incluye:

- tema activo,
- estado del sidebar móvil,
- búsqueda,
- filtros por zona y estado,
- mesa seleccionada,
- modal activo,
- drawer de pedido,
- colección de mesas,
- cola de toasts.

Esto permite un flujo simple y controlado para un módulo sin backend.

### 2. Separación de responsabilidades

- **`app.js`** gestiona la lógica de interacción y negocio.
- **`ui.js`** se encarga del render HTML y utilidades visuales.
- **`data.js`** concentra el mock inicial desacoplado de la lógica.

### 3. Delegación de eventos

El proyecto usa listeners globales sobre `document` para:

- `click`
- `keydown`
- `input`
- `change`
- `submit`

La interacción se resuelve con `data-* attributes` y `closest()`, evitando rebinding luego de cada render.

### 4. Re-renderizado

Cada cambio relevante actualiza el estado y ejecuta un render completo de las zonas dinámicas. No existe Virtual DOM, pero para el tamaño actual del módulo el enfoque es suficiente, claro y mantenible.

---

## Flujo funcional implementado

### Vista principal

La pantalla se compone de:

- sidebar de navegación,
- topbar con acción principal `Nueva mesa`,
- tarjetas estadísticas superiores,
- toolbar con búsqueda y filtros,
- grid de mesas,
- panel lateral de gestión progresiva.

### Gestión de mesas

Operaciones disponibles:

- crear mesa,
- editar mesa,
- asignar mesero,
- liberar mesa,
- eliminar mesa,
- seleccionar mesa activa.

### Gestión de pedidos

El drawer lateral permite:

- abrir pedido,
- continuar pedido existente,
- buscar productos,
- filtrar por categoría,
- agregar productos,
- aumentar o disminuir cantidades,
- eliminar líneas,
- enviar a cocina,
- facturar todo,
- mover el pedido a otra mesa,
- simular división de cuenta.

---

## Ajuste UX aplicado en Pedidos

### Ajustes operativos recientes

Se aplicó una nueva iteración visual y funcional al flujo de `Pedidos` usando como base los tokens y componentes definidos en [`contexto/documentacion.md`](contexto/documentacion.md):

- topbar con comportamiento glass al hacer scroll,
- selector de modo centrado y con mayor ancho para mejorar la lectura de `Para llevar`,
- tarjetas KPI con color semántico visible,
- buscador de mesas sin doble marco,
- tarjetas de mesa reorganizadas con mejor jerarquía para área, ubicación, mesero, productos y total,
- panel lateral con acción única `Inspeccionar`,
- bloque `Operaciones con Mesa X` con despliegue progresivo,
- liberación forzosa con doble validación operativa y contraseña final `12345`,
- resumen de pedido encapsulado en una sola superficie visual.

En esta iteración se volvió a priorizar la **simpleza operativa**: menos sombras, menos ornamento, menos marcos redundantes y una lectura más limpia para meseros en uso continuo.

### Nueva capa desktop por fases

Se incorporó una nueva capa desktop-first sobre [`implementacion/app.js`](implementacion/app.js), [`implementacion/ui.js`](implementacion/ui.js), [`implementacion/styles.css`](implementacion/styles.css) y [`implementacion/data.js`](implementacion/data.js) para acercar el módulo a un recorrido más completo de operación:

- **Fase 1 desktop**: `Salón`, `rondas`, `detalle de pedido`, `cuenta`, `cobro`, `Delivery` y `Para llevar`.
- **Fase 2 desktop**: `Cortesías`, `Propinas` y `Nota de crédito` como áreas operativas dentro del mismo shell.
- Se añadieron datasets mock para rondas, cuentas, distribución de propinas, límites de cortesías, borradores de nota de crédito y evidencias de pago.
- El cobro desktop ahora contempla `Efectivo`, `Yape`, `Plin` y `Transferencia`, con adjunto mock de evidencia en formato `.webp`.

Se alineó la experiencia visual de los tres modos (`Salón`, `Delivery` y `Para llevar`) para que compartan el mismo patrón operativo:

- encabezado compacto por modo,
- bloque de KPIs superior,
- área principal de trabajo a la izquierda,
- panel contextual a la derecha,
- una sola acción visible para expandir panel cuando está colapsado.

### Cambio puntual de redundancia

Se eliminó el botón duplicado de apertura/cierre del panel ubicado en el encabezado izquierdo de la zona de trabajo. Ahora se conserva solo el control contextual del panel derecho, reduciendo ruido visual y manteniendo el enfoque de la referencia aprobada.

### Ajuste visual tipo dashboard compacto

La vista principal quedó simplificada para acercarse a la nueva referencia visual:

- sidebar oculto por defecto y accesible desde el botón menú,
- topbar enfocada en `Pedidos` y el selector de modo,
- hero mínimo con el nombre del apartado activo,
- KPIs superiores más compactos,
- buscador único en salón,
- cards de mesa más cortas y limpias,
- panel derecho priorizando `Proceder`, `Ver`, acciones y resumen del pedido.

### Cómo ejecutar

1. Abrir [`implementacion/index.html`](implementacion/index.html) en navegador.
2. O levantar un servidor estático simple desde [`implementacion/`](implementacion/README.md): por ejemplo con Live Server en VS Code.

### Cómo validar

1. Cambiar entre los tabs de `Salón`, `Delivery` y `Para llevar`.
2. Hacer scroll vertical y confirmar que la topbar activa fondo borroso.
3. Verificar que el selector de modo esté centrado y que `Para llevar` se lea completo.
4. Confirmar que el buscador de mesas tenga un solo contenedor visible, sin doble borde.
5. Seleccionar una mesa y revisar la nueva jerarquía de card: área, ubicación, mesero, productos y total.
6. En el panel derecho, usar `Inspeccionar` y luego `Gestionar` para abrir las operaciones de mesa.
7. Probar `Liberar forzosamente` y validar que exija dos confirmaciones más la clave `12345`.
8. Confirmar que los tres modos conservan el patrón `resumen + workspace + panel`.
9. En `Salón`, verificar que el panel derecho muestre `Servicio`, `Rondas`, `Cuenta` y `Cobro` usando los mocks desktop.
10. En el header del workspace, cambiar entre `Pedidos`, `Cortesías`, `Propinas` y `Nota de crédito`.
11. Probar selección de rondas, cambio de categoría del compositor, selección de propina y método de pago desktop.
12. En `Delivery` y `Para llevar`, validar que el panel lateral muestre estado documental, pago y evidencia mock `.webp` cuando corresponda.

### Despliegue

Al ser una implementación estática basada en [`implementacion/index.html`](implementacion/index.html), puede publicarse directamente en hosting estático como Vercel, Netlify o GitHub Pages sin proceso de build.

---

## Modelo operativo del dominio actual

### Zonas disponibles

- Interior
- Terraza
- Barra
- VIP

### Estados de mesa

- `libre`
- `ocupada`
- `reservada`

### Dataset inicial cargado

- **4 meseros**
- **4 zonas**
- **7 categorías**
- **12 productos**
- **12 mesas mock**

El módulo arranca con mesas en distintos estados y con pedidos precargados para simular un escenario operativo real.

---

## Componentes UX/UI implementados

### Cards de mesa

Cada mesa se renderiza como una card con:

- banner superior por zona,
- badge visual por estado,
- número de mesa,
- zona y descripción,
- mesero asignado,
- resumen del pedido,
- acción primaria contextual.

### Panel lateral de gestión progresiva

La mesa seleccionada muestra un panel con:

- datos de contexto,
- estado actual,
- resumen del pedido,
- acciones secundarias,
- snapshot corto del consumo.

Este patrón reduce el exceso de botones dentro del grid principal.

### Order Drawer

El drawer es el flujo central del pedido y está dividido en dos tabs:

- **Agregar**: catálogo, búsqueda y categorías.
- **Pedido**: detalle de líneas, cantidades, total y acciones de cierre.

### Modales

Se implementan modales para:

- crear mesa,
- editar mesa,
- asignar mesero,
- confirmar liberación,
- confirmar eliminación,
- mover pedido.

### Toasts

Las acciones relevantes generan feedback no bloqueante con duración temporal.

---

## Validaciones y reglas de negocio actuales

El proyecto ya implementa varias protecciones operativas:

- el número de mesa es obligatorio,
- la zona es obligatoria,
- la descripción es obligatoria,
- no se permite duplicar número de mesa,
- no se puede liberar una mesa si tiene items activos,
- al facturar se limpia el pedido y la mesa vuelve a estado libre,
- al mover un pedido se trasladan sus líneas y la mesa origen se libera,
- el envío a cocina solo aplica si hay items activos,
- las acciones del drawer se deshabilitan cuando el pedido está vacío.

---

## Accesibilidad e interacción

Se detectan varias decisiones correctas para accesibilidad básica:

- uso de etiquetas semánticas como `aside`, `header`, `main`, `section`, `article`, `table`, `button`,
- `aria-label`, `aria-modal`, `aria-live` y `aria-atomic` en puntos clave,
- selección de card por teclado con `Enter` y `Espacio`,
- cierre de modal/drawer con `Escape`,
- foco visible para elementos interactivos,
- soporte para navegación en flujos críticos sin mouse.

No obstante, todavía no es una implementación de accesibilidad avanzada o auditada formalmente.

---

## Responsive y comportamiento visual

El módulo está planteado como **responsive mobile-first adaptado a operación en tablet**.

Breakpoints detectados en `styles.css`:

- `1180px`: reorganización del workspace a una sola columna,
- `960px`: sidebar pasa a comportamiento tipo drawer móvil,
- `720px`: ajustes de formularios, drawer y tabs para pantallas más estrechas.

También incluye:

- dark mode persistido,
- animaciones `fadeIn`, `scaleIn` y `slideIn`,
- microinteracciones hover/focus,
- textura visual decorativa en el área de mesas,
- banners temáticos por zona.

---

## Design System aplicado

El proyecto está alineado con la documentación de diseño ubicada en `../contexto/documentacion.md`.

Se observa uso consistente de:

- variables CSS en `:root`,
- paleta semántica por estado,
- tipografía `Inter`,
- radios y sombras reutilizables,
- botones con variantes `primary`, `secondary`, `ghost`, `danger`,
- chips para filtros,
- badges semánticos,
- cards, modales, drawer y toasts coherentes entre sí.

Esto confirma que el módulo no es una maqueta aislada, sino una implementación coherente con un sistema visual mayor.

---

## Cómo ejecutar el proyecto

### Opción rápida

Abrir `index.html` en el navegador.

### Opción recomendada

Usar un servidor estático local para asegurar el correcto funcionamiento de los módulos ES:

#### Python

```bash
python -m http.server 5500
```

#### Node.js

```bash
npx serve .
```

Luego abrir:

```text
http://localhost:5500
```

---

## Cómo probar manualmente

### Casos mínimos recomendados

1. filtrar por zona y estado;
2. buscar una mesa por número o mesero;
3. crear una nueva mesa válida;
4. intentar crear una mesa duplicada;
5. asignar un mesero;
6. abrir un pedido y agregar productos;
7. modificar cantidades desde la tab Pedido;
8. mover un pedido a otra mesa;
9. facturar un pedido completo;
10. alternar dark mode y recargar para validar persistencia.

---

## Estado de persistencia

### Persistencia actual

- **Sí**: tema visual en `localStorage`.
- **No**: mesas, pedidos, productos, meseros y operaciones del módulo.

### Implicancia

Cada recarga restaura los datos mock iniciales, excepto el tema.

---

## Limitaciones actuales

El README anterior no reflejaba algunos detalles reales del código. En la versión actual se corrige eso y se deja explícito que hoy el sistema tiene estas limitaciones:

- no existe backend integrado,
- no hay persistencia real de mesas o pedidos,
- no hay autenticación ni roles,
- no existen pruebas unitarias o E2E implementadas,
- la división de cuenta todavía es simulada mediante toast,
- no hay integración con cocina, caja o facturación real,
- no existe almacenamiento offline estructurado,
- no hay pipeline de build o deploy configurado dentro de esta carpeta.

---

## Fortalezas técnicas actuales

- separación clara entre estado y render,
- bajo acoplamiento entre HTML y lógica mediante `data-*`,
- validaciones suficientes para demo operativa,
- design system consistente,
- experiencia visual moderna para contexto restaurante,
- buena base para migrar a backend o framework sin rehacer el modelo funcional,
- código entendible y escalable para el tamaño actual del módulo.

---

## Riesgos o mejoras detectadas

Durante el análisis se identifican mejoras lógicas para una siguiente iteración:

1. persistir `state.tables` en `localStorage` o API;
2. tipar estructuras con JSDoc o migrar a TypeScript;
3. incorporar pruebas E2E del flujo crítico de mesas y pedido;
4. separar acciones de negocio en un servicio para reducir tamaño de `app.js`;
5. impedir mover pedidos a mesas reservadas u ocupadas según regla de negocio futura;
6. registrar estado de envío a cocina con mayor granularidad;
7. convertir la división de cuenta en flujo real.

---

## Despliegue actual

No existe configuración de despliegue automatizado dentro de esta implementación. Al ser un frontend estático puro, puede publicarse en cualquier hosting de archivos estáticos, por ejemplo:

- GitHub Pages,
- Netlify,
- Vercel en modo estático,
- servidor local interno del restaurante.

---

## Relación con la documentación del proyecto

Documentos relevantes encontrados durante el análisis:

- `../contexto/documentacion.md`: design system y reglas visuales del ecosistema MiRest.
- `./Fase 5.md`: entrega formal de implementación con alcance funcional, evidencias y validaciones.

Este README queda alineado con ambos documentos, pero enfocado específicamente en el **estado real actual del código implementado**.

---

## Resumen ejecutivo

El módulo Mesas se encuentra en una fase sólida de **prototipo funcional de alta fidelidad**, con arquitectura frontend simple pero ordenada, UI consistente, validaciones operativas clave y una experiencia suficientemente madura para demo, validación con usuario y posterior integración con backend.

No es todavía un módulo productivo completo, pero sí una base técnica bien encaminada para evolucionar hacia una versión SaaS conectada, persistente y auditable.

---

## Nota de mantenimiento

Si se modifica la lógica en `app.js`, la estructura visual en `ui.js` o los datos base en `data.js`, este README debe actualizarse para mantener sincronía entre documentación y código real.

---

## Actualización funcional · Operación multicanal

La implementación actual se está reordenando para que todo viva dentro de un único módulo **Pedidos** con tres subapartados:

- **Salón**: mapa físico con foco en mesas, ocupación y continuidad del pedido existente.
- **Delivery**: pizarra observacional con tiempo, canal, monto y comprobante.
- **Para llevar**: cola de recojo con promesa de entrega, tiempo restante o retraso y control de salida.

### Ajustes operativos recientes

- La navegación principal ahora prioriza el único módulo **Pedidos** en [`implementacion/index.html`](implementacion/index.html).
- `Delivery` ahora usa un pipeline más compacto, con menos datos visibles por card y detalle operativo en el panel lateral.
- `Para llevar` cambió a un mini mapa rectangular por etapas para evitar columnas deformadas.
- El drawer de mesa incluye `Opciones extra` para marcar un pedido como `Para llevar` y sincronizarlo con recojo.
- Si el origen es `Salón` o `WhatsApp`, el sistema agrega automáticamente `10%` por envases/tapers.
- `Delivery` y `Para llevar` bloquean el cierre final si falta pago confirmado o comprobante emitido.
- Se redujeron transiciones y saltos visuales en tabs, botones y cards para evitar parpadeos molestos.
- Se empezó la migración de registros mock a `.json` dentro de [`implementacion/backend/data`](implementacion/backend/data).

### Snippet técnico de ejecución

- **Run:** abrir [`index.html`](implementacion/index.html) o servir la carpeta [`implementacion`](implementacion) con un servidor estático.
- **Test manual:** crear pedido en salón, marcarlo como para llevar, sincronizarlo con recojo, emitir boleta/factura, confirmar pago y completar entrega.
- **Deploy:** publicar la carpeta [`implementacion`](implementacion) en hosting estático; la integración real con SUNAT, caja y bot de WhatsApp queda preparada a nivel de UI y reglas.

### Actualización UI operativa

- En [`renderTakeawayQueue()`](implementacion/ui.js:900) y sus estilos de [`implementacion/styles.css`](implementacion/styles.css), la vista **Para llevar** ahora usa columnas del mismo ancho visual que Delivery para mejorar lectura operativa.
- En [`renderDeliveryToolbar()`](implementacion/ui.js:639) se retiró el filtro `App Mirest` del bloque de canales de delivery.

### Ajuste de paleta visual del dashboard

- Se alineó la paleta principal en [`implementacion/styles.css`](implementacion/styles.css) con una base crema suave, superficies blancas cálidas, sidebar azul noche y acento naranja para estados activos.
- Se actualizaron componentes clave: [`sidebar`](implementacion/styles.css), topbar, cards, chips, mode switcher y botones para que el dashboard se vea más cercano a la referencia visual.
- El toggle de modo oscuro existente en [`implementacion/index.html`](implementacion/index.html) se mantiene para alternar entre la versión clara cálida y la versión oscura del dashboard.

### Flujo ficticio de pago y división de cuenta

- En el drawer de [`renderOrderDrawer()`](implementacion/ui.js) el botón **Facturar** fue reemplazado visualmente por **Registrar pago** y **Mover** por **Trasladar cuenta**.
- Ahora el pago completo abre un modal ficticio con método de pago, boleta/factura, DNI/RUC y razón social; la división de cuenta permite definir cuotas, monto por persona y método de pago por cuota.
- En delivery y para llevar también se añadió selector de método de pago para mantener consistencia en todos los apartados de cobro dentro de [`implementacion/ui.js`](implementacion/ui.js) y [`implementacion/app.js`](implementacion/app.js).

### Reorganización de filtros

- Se reordenaron los filtros de [`Salón`](implementacion/ui.js:557), [`Delivery`](implementacion/ui.js:594) y [`Para llevar`](implementacion/ui.js:633) dentro de bloques visuales con etiqueta por grupo.
- Los contadores de resultados ahora viven en una tarjeta lateral propia para mejorar lectura rápida.
- Los estilos en [`implementacion/styles.css`](implementacion/styles.css) fueron ajustados para mantener alineación limpia en desktop y apilado correcto en responsive.

### Terminología y pizarra unificada

- Se reemplazó texto técnico como `pickup` por términos más claros para el mesero, como `recojo`, `pedido para llevar` y `código de recojo`, en [`implementacion/ui.js`](implementacion/ui.js), [`implementacion/app.js`](implementacion/app.js) y [`implementacion/data.js`](implementacion/data.js).
- La pizarra de [`Delivery`](implementacion/ui.js:883) ahora usa la misma estructura visual base de [`Para llevar`](implementacion/ui.js:939), para que ambas vistas se sientan consistentes y más fáciles de leer.

### Ajuste anti-parpadeo y navegación fluida

- **Repro detectado:** al abrir [`renderOrderDrawer()`](implementacion/ui.js:1135), cambiar tabs, buscar productos o tocar acciones rápidas, el sistema re-renderizaba toda la app y reinyectaba el drawer completo.
- **Causa raíz:** combinación de re-render global + animaciones de entrada en [`implementacion/styles.css`](implementacion/styles.css) + escrituras síncronas repetidas en `localStorage` desde [`persistUiState()`](implementacion/app.js:1561) y [`persistOperationalData()`](implementacion/app.js:1576).
- **Corrección aplicada:** preservación de scroll/foco del drawer en [`captureTransientUiState()`](implementacion/app.js:452) y [`restoreTransientUiState()`](implementacion/app.js:473), bloqueo de scroll de fondo con clases de `body`, eliminación de animación recurrente de modal/drawer y persistencia diferida a storage con cola en [`queueStorageWrite()`](implementacion/app.js:1593).
- **Impacto esperado:** menos jank, menos parpadeo, sin “regresos” visuales al explorar pedido/agregar, y respuesta mucho más estable para uso intensivo del mesero.

### Estructura frontend / backend mock

- **Frontend**: [`implementacion/index.html`](implementacion/index.html), [`implementacion/styles.css`](implementacion/styles.css), [`implementacion/app.js`](implementacion/app.js), [`implementacion/ui.js`](implementacion/ui.js).
- **Backend mock**: [`implementacion/backend/data/staff.json`](implementacion/backend/data/staff.json), [`implementacion/backend/data/catalog.json`](implementacion/backend/data/catalog.json), [`implementacion/backend/data/orders-salon.json`](implementacion/backend/data/orders-salon.json), [`implementacion/backend/data/orders-delivery.json`](implementacion/backend/data/orders-delivery.json), [`implementacion/backend/data/orders-takeaway.json`](implementacion/backend/data/orders-takeaway.json).

### Qué quedó implementado

1. **Jerarquía visual más estable**
   - shell principal persistente,
   - topbar y sidebar estables,
   - regiones internas actualizadas por modo sin “recargar” toda la vista,
   - menor salto visual al cambiar entre Salón, Delivery y Para llevar.

2. **Skeleton loaders y continuidad visual**
   - skeletons para KPIs,
   - skeletons para grid de mesas,
   - skeletons para columnas Delivery,
   - skeletons para cola Para llevar,
   - skeletons para panel contextual.

3. **Persistencia local con `localStorage`**
   - tema activo,
   - último modo usado,
   - filtros activos por modo,
   - pedido o mesa seleccionada por modo,
   - paneles colapsados,
   - hints descartados,
   - estado mock persistido de mesas, delivery y para llevar.

4. **Subapartado Delivery**
   - KPIs propios,
   - filtros por estado, prioridad y canal,
   - búsqueda,
   - tablero por etapas,
   - cards compactas de observación,
   - panel lateral para detalle, pago y comprobante.

5. **Subapartado Para llevar**
   - KPIs propios,
   - filtros por estado, prioridad y canal,
   - búsqueda,
   - cola operativa por etapas,
   - cards con promesa, canal y recargo visual,
   - panel lateral con promesa, teléfono, pago y observación local.

6. **Onboarding contextual en evolución**
   - guía contextual sobre la interfaz,
   - pasos resumidos para Salón, Delivery y Para llevar,
   - cierre persistido en `localStorage`,
   - reapertura manual desde el botón **Guía**.

### Archivos involucrados

- `index.html`
- `styles.css`
- `app.js`
- `ui.js`
- `data.js`
- `backend/data/staff.json`
- `backend/data/catalog.json`
- `backend/data/orders-salon.json`
- `backend/data/orders-delivery.json`
- `backend/data/orders-takeaway.json`
- `assets/icons/icon-192.svg`
- `assets/icons/icon-512.svg`

### Cómo ejecutar

Al ser un frontend estático puro, basta servir la carpeta con un servidor local. Ejemplos:

- **VS Code Live Server** apuntando a `index.html`
- `npx serve .`
- `python -m http.server`

### Cómo probar la demo

#### 1. Salón

- abrir el modo **Salón**,
- filtrar por zona o estado,
- seleccionar una mesa,
- abrir el drawer del pedido,
- agregar o quitar productos,
- confirmar que el panel contextual y el estado quedan persistidos localmente.

#### 2. Delivery

- cambiar al modo **Delivery**,
- usar búsqueda y chips de estado,
- abrir **Ver urgentes**,
- seleccionar una card,
- emitir boleta o factura desde el panel si corresponde,
- recargar la página y verificar persistencia del mock actualizado.

#### 3. Para llevar

- cambiar al modo **Para llevar**,
- usar búsqueda, filtros y acción **Ver listos**,
- seleccionar un pedido,
- avanzar su estado desde la card o desde el panel,
- recargar y validar continuidad del estado.

### Claves usadas en `localStorage`

- `mirest-theme`
- `mirest-pos-ui`
- `mirest-pos-demo-state`

### Cookies

No se usan cookies en esta implementación.
