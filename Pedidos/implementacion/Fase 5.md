# FASE 5: IMPLEMENTACIÓN — MÓDULO MESAS
# Sistema: MiRest con IA — Entrega académica formal
# Separar cada tabla con una fila vacía y el título de sección.

================================================================
TABLA 1 — RESUMEN GENERAL DE IMPLEMENTACIÓN
================================================================
Sección	Descripción
Nombre de la fase	Fase 5: Implementación
Módulo trabajado	Mesas
Objetivo de implementación	Construir el módulo Mesas del sistema MiRest con IA como interfaz funcional, visual y operativa, aplicando el Design System del proyecto, reduciendo ruido visual, jerarquizando acciones y habilitando el flujo completo de gestión de mesas y pedidos.
Tecnologías utilizadas	HTML5 semántico · CSS3 con variables / grid / flexbox / animaciones / dark mode · JavaScript ES Modules vanilla · Google Fonts Inter · SVG inline para iconografía
Resultado general obtenido	Módulo Mesas completamente funcional con datos mock, gestión visual limpia, flujo de pedido con tabs, modales estandarizados, panel de gestión progresiva, filtros por zona y estado, estadísticas superiores, dark mode y diseño responsive mobile-first.

================================================================
TABLA 2 — ALCANCE FUNCIONAL IMPLEMENTADO
================================================================
N°	Funcionalidad implementada	Descripción funcional	Resultado esperado
1	Visualización del mapa de mesas	Grid de cards con número, zona, descripción, mesero asignado, estado y resumen de pedido activo. Banner superior con gradiente diferenciado por zona.	Lectura inmediata del estado de cada mesa sin acciones adicionales.
2	Lectura visual del estado de mesa	Badge dinámico: Libre (verde), Ocupada (rojo), Reservada (azul). El borde de la card refuerza el tono del estado.	Diferenciación inequívoca entre los tres estados operativos posibles.
3	Estadísticas del módulo	4 indicadores superiores reactivos: total de mesas, libres, ocupadas y reservadas.	Vista gerencial instantánea del estado general del salón.
4	Selección de mesa activa	Clic o Enter/Espacio sobre una card la selecciona y activa el panel lateral de gestión con datos completos.	Interacción directa sobre la card sin flujos secundarios.
5	Panel lateral de gestión progresiva	Panel derecho muestra: nombre, zona, mesero, estado, items, snapshot del pedido y 4 acciones: Editar, Asignar mesero, Liberar, Eliminar.	Acceso a acciones avanzadas sin sobrecargar la card ni el grid.
6	Apertura y continuación de pedido	Botón "Abrir pedido" o "Continuar" en la card. Abre el Order Drawer lateral de pedido.	Acceso al flujo de pedido en un clic con contexto del estado previo.
7	Flujo de pedido – Tab Agregar	Catálogo de 12 productos con emoji, nombre, categoría, precio, badge y botón Agregar. Buscador y filtro por categoría.	El mesero agrega productos con búsqueda y filtrado funcional.
8	Flujo de pedido – Tab Pedido	Tabla de items con controles +/- de cantidad, precio, subtotal y eliminar. Resumen de total. Botones: Enviar a cocina, Facturar todo, Mover a mesa, Dividir cuenta.	Gestión completa del pedido sin cambiar de pantalla.
9	Crear nueva mesa	Botón "+ Nueva Mesa" en el topbar. Modal con campos: número, zona y descripción. Valida campos obligatorios y número no duplicado.	Alta de mesas con validaciones activas; aparece inmediatamente en el grid.
10	Editar mesa existente	Panel lateral "Editar mesa": modal con datos actuales precargados. Modifica número, zona, descripción y estado.	Actualización sin duplicar número; cambios reflejados en la card de inmediato.
11	Asignar mesero	Panel lateral "Asignar mesero": modal con select de meseros (nombre + turno). Asigna o quita responsable.	Asignación directa visible en card y flujo de pedido.
12	Liberar mesa	Panel lateral "Liberar mesa": con items activos bloquea la acción con aviso. Sin items, abre confirmación y libera.	Control de liberación con protección ante errores operativos.
13	Eliminar mesa	Panel lateral "Eliminar mesa": modal de confirmación destructiva. Al confirmar, mesa eliminada y sistema selecciona la siguiente.	Eliminación controlada con doble confirmación.
14	Mover pedido a otra mesa	Tab "Pedido" del drawer "Mover a mesa": modal con select de mesas disponibles. Items transferidos, origen queda libre.	Movimiento sin pérdida de items, ambas cards actualizadas reactivamente.
15	Filtro por zona	Chips: Todas, Interior, Terraza, Barra, VIP. Filtra el grid en tiempo real.	Navegación segmentada por área del local.
16	Filtro por estado	Chips: Todos, Libre, Ocupada, Reservada. Combinables con filtro de zona.	Reducción del grid para enfocarse en un estado específico.
17	Búsqueda textual	Input que filtra por número, zona, descripción o mesero asignado. En tiempo real.	Localización de una mesa en segundos.
18	Sistema de toasts	Toast temporal de 2.6s por cada acción relevante del módulo.	Retroalimentación inmediata sin interrumpir el flujo principal.
19	Enviar pedido a cocina	Marca el pedido como enviado y emite toast de confirmación.	Registro del envío con confirmación visual para el mesero.
20	Facturar pedido completo	Limpia el pedido, totaliza el monto y libera la mesa automáticamente.	Cierre de cuenta con liberación de mesa en un paso.
21	Dividir cuenta	Emite toast simulando la acción. Preparado para integración real.	Prototipo funcional del flujo de división de cuenta a nivel de interfaz.
22	Dark mode	Toggle en topbar. Preferencia persistida en localStorage.	Adaptación visual nocturna sin pérdida de jerarquía.
23	Diseño responsive	960px: sidebar como drawer. 1180px: workspace en columna única.	Módulo funcional en tablets y dispositivos de los meseros.

================================================================
TABLA 3 — COMPONENTES DEL DESIGN SYSTEM APLICADOS
================================================================
Componente	Aplicación en el módulo Mesas	Regla visual aplicada	Beneficio obtenido
Table Card	Grid principal con banner de zona, número, mesero y pedido activo.	--radius-xl (20px), --shadow-card, overflow hidden, hover translateY -2px, borde con tono del estado.	Lectura inmediata del estado; diferenciación visual por zona.
Badge de estado	Banner superior de cada card y panel lateral. Variantes: success, danger, info.	Fondo suave coloreado, negrilla, padding 4px 10px, border-radius full, ícono SVG.	Señalización clara y consistente del estado operativo.
Botón Primario (btn--primary)	"Abrir pedido", "Continuar", "Nueva Mesa", "Crear", "Guardar", "Enviar a cocina". Gradiente naranja.	Altura 44px, peso 600, gradiente lineal 135°, radio --radius-lg.	Jerarquía visual de la acción principal; consistencia en todo el módulo.
Botón Secundario (btn--secondary)	"Ver pedido", "Cancelar", "Mover a mesa", "Facturar todo". Fondo gris neutro.	Misma estructura base que el primario sin gradiente.	Contrapeso visual; identifica acciones de menor riesgo.
Botón Ghost (btn--ghost)	"Editar mesa", "Asignar mesero", "Liberar mesa", "Dividir cuenta".	Border 1px --color-border, color texto secundario, fondo transparente.	Menor peso visual para acciones terciarias.
Botón Destructivo (btn--danger)	"Eliminar mesa" en panel lateral y modal de confirmación.	Fondo rojo --color-danger, color blanco.	Señal visual de riesgo inequívoca; distingue acciones destructivas.
Modal estandarizado	5 modales: nueva mesa, editar, asignar mesero, liberar, eliminar y mover pedido.	Overlay blur(4px), animación scaleIn, estructura header/body/footer, --radius-xl, cierre con Escape u overlay.	Flujos controlados; experiencia predecible y consistente en cada acción.
Order Drawer	Flujo completo de pedido con tabs Agregar y Pedido.	Animación slideIn, header fijo, tabs con borde activo --color-primary, scroll interno.	Gestión del pedido sin navegar a otra vista.
Input de texto y Select	Campos en modales: número, descripción, zona, estado, mesero asignado.	Altura 44px, padding 12px 16px, border 1px --color-border, radio --radius-md, error en rojo bajo el campo.	Formularios claros; errores directamente junto al campo.
Chips de filtro	Filtros por zona y estado en la barra de herramientas.	Padding 6px 12px, border-radius full, activo con gradiente naranja (zona) o primario suave (estado).	Filtrado visual rápido; estado activo siempre visible.
Sidebar	Navegación principal; "Mesas" marcado activo.	Fondo --color-sidebar (#15192c), 260px fijo, sticky, ítem activo con gradiente rgba naranja.	Contexto claro del módulo; navegación consistente.
Topbar	Eyebrow "Operaciones", H1 "Mesas", botón Nueva Mesa, toggle de tema, chip de usuario.	Altura 88px, backdrop blur, border-bottom, sticky z-index 20.	Acceso inmediato a la acción principal; título y contexto siempre visibles.
Tarjeta estadística (summary-card)	4 cards superiores: total, libres, ocupadas, reservadas.	Grid auto-fit minmax 180px, --radius-xl, ícono coloreado por tono, número 28px.	Lectura gerencial instantánea del estado del salón.
Sistema de toasts	Confirmación de todas las acciones relevantes del módulo.	Fixed bottom-right, stacked, duración 2.6s, tono success/danger/info, ícono acompañante.	Confirmación de cada acción sin interrumpir el flujo activo.

================================================================
TABLA 4 — IMPLEMENTACIÓN TÉCNICA
================================================================
Elemento técnico	Implementación realizada	Observación
HTML (index.html)	Shell único con: aside.sidebar, header.topbar, main.page-content, #summaryStats, #workspaceToolbar, #tablesGrid, #managementPanel, #modalRoot, #drawerRoot, #toastRoot. Carga app.js como módulo ES.	Roots vacíos como puntos de montaje para renderizado dinámico. Estructura 100% semántica.
CSS (styles.css, 26 KB)	Tokens :root, tema dark, reset mínimo, sidebar, topbar, botones, cards, badges, modales, drawer, tablas, inputs, chips, toasts, animaciones y media queries en 1180px / 960px / 720px.	Sin framework CSS. Todos los tokens en variables :root para consistencia con el Design System.
data.js	Exporta: waiters (4), zones (4), statusOptions, categories (7), products (12 con emoji, precio y paleta), initialTables (12 mesas con estado, mesero e items precargados).	Sin backend ni base de datos. Datos suficientes para simular un escenario real.
ui.js	Funciones de render puro: escapeHtml, formatCurrency (Intl PEN), slugify, getStatusInfo, getWaiterName, getTableItemsCount, getOrderDetails, getSummaryStats, filterTables, renderIcons, renderStats, renderToolbar, renderTables, renderManagementPanel, renderOrderDrawer, renderModal, renderToasts. Mapa de 25 íconos SVG inline.	Separación clara entre presentación (ui.js) y lógica (app.js). Cada función retorna HTML como string.
app.js	Estado global (state): theme, sidebarOpen, search, zone, status, selectedTableId, activeModal, orderDrawer, tables, toasts. Funciones: openCreate/Edit/Assign/Release/Delete/MoveModal, openOrder, closeModal/Drawer, submitTableForm, validateTablePayload, releaseTable, deleteTable, addProduct, changeProductQty, removeProduct, sendKitchen, invoiceOrder, splitBill, pushToast.	Estado centralizado con re-render completo ante cada cambio. Sin Virtual DOM. Patrón robusto para el alcance del módulo.
Manejo de eventos	Un addEventListener por tipo en document: click, keydown, input, change, submit. Delegación via .closest() sobre data-attributes semánticos (data-action, data-select-table, data-filter-zone, data-filter-status, data-category).	Sin re-bindeo de listeners ante re-renders. Bajo acoplamiento HTML/JS.
Validaciones	validateTablePayload(): número requerido, zona requerida, descripción requerida, número no duplicado (case-insensitive). Errores renderados bajo cada campo sin cerrar el modal.	Validación del lado del cliente antes de persistir cambios en el estado global.
Estados visuales dinámicos	El estado (libre/ocupada/reservada) determina: borde de card, tono del badge, ícono, texto del botón primario, disponibilidad de "Ver pedido" y bifurcación en el modal de liberación.	Interfaz siempre coherente con el estado interno del objeto mesa.
Dark mode	Toggle en topbar controla body[data-theme]. localStorage persiste la preferencia. Variables CSS redefinen la paleta completa desde un token root.	Dos temas sin duplicar reglas CSS.
Responsive / Mobile	Media queries: 1180px (workspace columna única), 960px (sidebar como drawer móvil con toggle), 720px (formularios y drawer en columna).	Módulo funcional en tablet sin rediseño adicional.
Persistencia de estado	Mesas y pedidos en memoria (state.tables, structuredClone de initialTables). Tema en localStorage. Sin API ni base de datos.	Preparado para integración con API real en la siguiente fase.
Animaciones y microinteracciones	fadeIn para overlay, scaleIn para modal (scale 0.95 a 1), slideIn para drawer (translateX 24px a 0). Hover en cards: translateY -2px + shadow. Foco con glow naranja.	@keyframes reutilizables, duración 0.2-0.22s para no ralentizar el flujo operativo.

================================================================
TABLA 5 — FLUJO FUNCIONAL IMPLEMENTADO
================================================================
Paso	Acción del usuario	Respuesta del sistema	Resultado
1	El usuario abre el módulo Mesas en el navegador.	Se inicializan 12 mesas mock. Sidebar, topbar con Nueva Mesa, 4 stats cards, barra de filtros, grid de 12 cards con banners de zona y panel lateral con primera mesa activa.	Vista completa del módulo visible de forma inmediata.
2	El usuario lee las estadísticas superiores.	Sistema muestra: 12 totales, 6 libres, 4 ocupadas, 2 reservadas con ícono, número grande y descripción.	Estado global del salón conocido de un vistazo.
3	El usuario filtra por zona "Terraza".	Grid filtrado reactivamente. Chip "Terraza" activo. Contador actualizado.	Grid segmentado; el operador ve solo las mesas de su área.
4	El usuario aplica adicionalmente el filtro "Ocupada".	Grid muestra solo el cruce Terraza + Ocupada.	Localización precisa de mesas con atención activa.
5	El usuario escribe "Carlos" en el buscador.	Grid filtrado a mesas con mesero Carlos asignado.	Acceso en segundos por nombre de mesero.
6	El usuario hace clic sobre una card de mesa.	Card seleccionada con borde naranja. Panel lateral con datos completos y 4 botones de gestión.	Panel progresivo activo sin modal adicional.
7	El usuario hace clic en "Abrir pedido".	Order Drawer se abre desde la derecha con animación slideIn. Tabs Agregar y Pedido activos. Catálogo visible.	Acceso al flujo de pedido sin cambiar de vista.
8	El usuario filtra por "Bebidas" y agrega "Inca Kola 500ml".	Producto agregado. Botón pasa a "Continuar". Estado pasa a Ocupada. Toast de confirmación.	Pedido iniciado con retroalimentación inmediata.
9	El usuario cambia a la tab "Pedido".	Tabla de items con controles +/-, precio, subtotal, resumen de total y botones de cierre visibles.	Gestión completa del pedido en la misma vista.
10	El usuario aumenta la cantidad de un producto.	Cantidad +1, subtotal y total recalculados en tiempo real.	Gestión de cantidades sin acciones adicionales.
11	El usuario hace clic en "Enviar a cocina".	Pedido marcado como enviado. Toast: "Mesa X enviada a cocina".	Registro del envío sin cerrar el flujo activo.
12	El usuario cierra el drawer con X o Escape.	Drawer cerrado. Grid actualizado con datos de la mesa.	Regreso limpio al mapa con estado sincronizado.
13	El usuario abre "Asignar mesero" desde el panel lateral.	Modal con select de 4 meseros, mesero actual preseleccionado.	Asignación de responsable sin salir del módulo.
14	El usuario selecciona un mesero y guarda.	Modal cerrado. Card y panel actualizan el nombre. Toast: "Mesero actualizado".	Cambio reflejado inmediatamente en la interfaz.
15	El usuario intenta liberar una mesa con pedido activo.	Sistema muestra modal de bloqueo: "No se puede liberar. Retira, factura o mueve el pedido antes."	Protección ante errores operativos activa.
16	El usuario factura el pedido completo.	Sistema limpia el pedido, calcula el total, libera la mesa. Toast con monto facturado.	Cierre de cuenta con liberación automática. Grid actualizado.
17	El usuario crea una nueva mesa desde el topbar.	Modal con campos vacíos. Con datos válidos: crea, agrega al grid, selecciona. Toast "Mesa creada".	Alta con validación activa e integración inmediata al grid.
18	El usuario intenta crear mesa con número duplicado.	Error "Ese número de mesa ya existe" sin cerrar el modal.	Protección de integridad de datos a nivel de interfaz.
19	El usuario elimina una mesa desde el panel lateral.	Modal destructivo rojo. Al confirmar: mesa eliminada, sistema selecciona la siguiente. Toast "Mesa eliminada".	Eliminación controlada; el sistema nunca queda sin selección activa.

================================================================
TABLA 6 — EVIDENCIAS REQUERIDAS (FLUJO DE CAPTURAS DE PANTALLA)
================================================================
N°	Evidencia	Qué demuestra	Nombre sugerido del archivo
1	Vista general del módulo Mesas sin interacción	Mapa completo, 4 stats, sidebar activo, topbar con Nueva Mesa, banners de zona en cards.	01_vista_general_mesas.png
2	Grid con mesas en los tres estados visibles	Diferenciación Libre (verde), Ocupada (rojo), Reservada (azul) en badges y bordes.	02_estados_de_mesas.png
3	Mesa seleccionada con panel lateral activo	Card con borde naranja + panel derecho con datos, snapshot del pedido y 4 botones de gestión.	03_mesa_seleccionada_panel_lateral.png
4	Filtro por zona activo (Terraza)	Grid filtrado, chip "Terraza" activo, contador actualizado.	04_filtro_zona_terraza.png
5	Filtro por estado activo (Ocupada)	Grid reducido, chip "Ocupada" activo.	05_filtro_estado_ocupada.png
6	Buscador activo con término escrito	Input visible con texto, grid filtrado a coincidencias.	06_buscador_activo.png
7	Modal "Nueva Mesa" abierto	Formulario vacío: número, zona, descripción. Overlay activo. Botones Cancelar y Crear mesa.	07_modal_nueva_mesa.png
8	Modal "Nueva Mesa" con errores de validación	Mensajes de error bajo campos vacíos o número duplicado. Modal permanece abierto.	08_modal_nueva_mesa_validacion.png
9	Modal "Editar Mesa" con datos precargados	Formulario con datos actuales y campo de estado. Distinguible por el título del modal.	09_modal_editar_mesa.png
10	Modal "Asignar Mesero" abierto	Select con lista de meseros (nombre + turno). Mesero actual preseleccionado.	10_modal_asignar_mesero.png
11	Modal "Liberar Mesa" – bloqueo con pedido activo	Aviso indicando que la mesa no puede liberarse por tener items activos.	11_modal_liberar_bloqueado.png
12	Modal "Liberar Mesa" – confirmación (mesa vacía)	Confirmación tono naranja: "Liberar mesa X". Botones Cancelar y Sí, liberar.	12_modal_liberar_confirmacion.png
13	Modal "Eliminar Mesa" abierto	Tono rojo/destructivo, ícono de alerta, advertencia permanente, botón Sí eliminar en rojo.	13_modal_eliminar_mesa.png
14	Modal "Mover pedido a otra mesa"	Select con mesas disponibles distintas a la actual.	14_modal_mover_pedido.png
15	Drawer de pedido – Tab Agregar con catálogo	Panel desde la derecha, categorías en panel izquierdo, cards de productos con emoji, precio y botón Agregar.	15_drawer_agregar_productos.png
16	Drawer – Tab Agregar con búsqueda activa	Buscador con término escrito, catálogo filtrado a coincidencias.	16_drawer_busqueda_producto.png
17	Drawer – Tab Pedido con items activos	Tabla con productos, cantidades, controles +/-, subtotales, total y botones de cierre.	17_drawer_pedido_activo.png
18	Drawer – Tab Pedido vacío (empty state)	Empty state con ícono e instrucción de uso. Demuestra manejo de estado vacío.	18_drawer_pedido_vacio.png
19	Toast de confirmación visible	Notificación toast en esquina inferior derecha con ícono, título y mensaje activo.	19_toast_confirmacion.png
20	Vista en modo oscuro (dark mode)	Módulo completo con paleta dark activa: sidebar, cards, panel, topbar y stats.	20_dark_mode_mesas.png

================================================================
TABLA 7 — VALIDACIONES REALIZADAS
================================================================
N°	Validación realizada	Qué se comprobó	Resultado
1	Legibilidad en modo claro	Textos, badges, botones y estados con contraste suficiente. Banners de zona no interfieren con la lectura.	Aprobado.
2	Legibilidad en modo oscuro	Los mismos elementos legibles con paleta dark (#0f1220 fondo, #f3f4f6 texto).	Aprobado. Tokens CSS centralizados evitaron ajustes adicionales.
3	Reducción del ruido visual	Una sola acción primaria visible en cada card. Acciones secundarias en panel lateral.	Aprobado. Lectura del grid más rápida y menos fatigante.
4	Funcionamiento de botones primarios	"Abrir pedido", "Continuar", "Nueva Mesa", "Crear", "Guardar", "Enviar a cocina", "Facturar todo" ejecutan sus acciones.	Aprobado. Todos los botones primarios funcionan en flujo completo.
5	Apertura y cierre de modales	Los cinco modales abren y se cierran correctamente por X, overlay, Escape y Cancelar.	Aprobado. Cierre funcional por todos los mecanismos definidos.
6	Apertura y cierre del drawer	El drawer abre con animación y se cierra por X, backdrop y Escape.	Aprobado. Sin comportamiento inesperado.
7	Actualización visual en tiempo real	Al facturar, liberar o editar: badge, borde, botón y panel lateral actualizan inmediatamente.	Aprobado. Interfaz siempre sincronizada con el estado interno.
8	Consistencia con el Design System	Radios, colores, tipografía, alturas de botón, tokens de sombra y animaciones corresponden a variables :root.	Aprobado. Sin valores hardcoded fuera del sistema de tokens.
9	Claridad del flujo de pedido	Flujo completo: Tab Agregar, filtrar, agregar producto, Tab Pedido, ajustar cantidad, facturar. Sin ambigüedad.	Aprobado. Flujo intuitivo sin instrucciones adicionales.
10	Validación de campos obligatorios	Con campos vacíos: errores visibles bajo cada campo sin cerrar el modal.	Aprobado. No es posible avanzar con datos incompletos.
11	Validación de número duplicado	Con número existente: "Ese número de mesa ya existe" (case-insensitive).	Aprobado. Detección correcta en todos los casos.
12	Protección de liberación con pedido activo	Con items: modal de bloqueo. Sin items: modal de confirmación. Flujo bifurcado correcto.	Aprobado. Protección activa ante errores operativos.
13	Filtros por zona y estado	Chips filtran el grid de forma combinable. Contador actualizado en tiempo real.	Aprobado. Filtros coherentes y siempre combinables.
14	Búsqueda textual	Búsqueda por número, zona, descripción y mesero devuelve resultados correctos.	Aprobado. Búsqueda transversal en múltiples atributos.
15	Jerarquía de acciones progresivas	Orden respetado: acción primaria en card, secundaria en panel, modal. Sin interrupciones al flujo principal.	Aprobado. Progresión lógica y controlada.
16	Accesibilidad mínima de teclado	Cards responden a Enter/Espacio. Escape cierra modales y drawers. role=dialog y aria-modal=true en modales.	Aprobado a nivel básico. Flujos críticos navegables por teclado.
17	Responsive a 960px (tablet)	Sidebar colapsa a drawer. Botón de menú visible. Contenido sin desbordamientos.	Aprobado. Vista funcional en pantallas de tablet.

================================================================
TABLA 8 — RESULTADO FINAL DE LA IMPLEMENTACIÓN
================================================================
Aspecto mejorado	Situación anterior	Mejora implementada	Impacto logrado
Sobrecarga de acciones en cada card	Cada card mostraba múltiples botones permanentes, generando ruido visual y dificultando la lectura del salón.	Una sola acción primaria visible en la card. Acciones secundarias en panel lateral de gestión progresiva.	Grid escaneable en segundos. El operador actúa sin leer listas de botones.
Diferenciación visual por zona	Las cards eran idénticas sin importar la zona (Interior, Terraza, Barra, VIP).	Banner superior con gradiente temático por zona y emoji representativo: madera cálida, verde, azul nocturno y dorado.	La zona de cada mesa se identifica visualmente de forma inmediata sin leer el texto.
Ausencia de flujo de pedido integrado	El flujo de pedido requería navegar a otra vista, perdiendo el contexto del mapa de mesas.	Order Drawer lateral sobre el mapa con tabs Agregar y Pedido, catálogo, controles de cantidad y acciones de cierre.	El mesero gestiona el pedido sin perder visibilidad del módulo. Flujo continuo sin fricciones.
Modales no estandarizados	Sin estructura unificada; inconsistencia visual y confusión sobre el tipo de acción ejecutada.	5 modales con header/body/footer, overlay blur, animación consistente y tono cromático diferenciado por riesgo.	El operador reconoce el nivel de riesgo de cada acción con confianza y seguridad.
Ausencia de retroalimentación de acciones	Sin confirmación visual al completar crear, editar, liberar o facturar.	Toasts no bloqueantes de 2.6s con título, mensaje e ícono para cada acción relevante.	Retroalimentación inmediata y contextual sin interrumpir el flujo de trabajo.
Falta de estadísticas globales del salón	Sin resumen visual del estado general al ingresar al módulo.	Panel de 4 indicadores superiores reactivos: total, libres, ocupadas y reservadas.	Visión gerencial instantánea para decisiones operativas inmediatas.
Ausencia de filtros y búsqueda	Sin posibilidad de filtrar ni buscar mesas por zona, estado o mesero asignado.	Chips de filtro por zona y estado combinables, más buscador en tiempo real por múltiples atributos.	Localización de cualquier mesa en menos de 3 segundos. Reduce carga cognitiva en alta ocupación.
Diseño no responsive	El módulo no estaba optimizado para tablets ni dispositivos móviles.	3 breakpoints (1180px, 960px, 720px). Sidebar como drawer móvil. Workspace en columna única.	Módulo funcional en tablets de restaurante sin rediseño adicional.
Ausencia de dark mode	Funcionaba solo en tema claro; desventaja en turnos nocturnos o ambientes con poca luz.	Toggle en topbar con persistencia en localStorage. Paleta completa adaptada via variables CSS :root.	Módulo operable en ambientes oscuros sin comprometer la legibilidad. Preferencia persistida entre sesiones.
