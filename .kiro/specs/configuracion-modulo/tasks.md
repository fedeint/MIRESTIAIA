# Implementation Plan: Módulo de Configuración de MiRest con IA

## Overview

Implementar el módulo de Configuración como dos archivos Vanilla JS (`Configuracion/configuracion.html` + `Configuracion/configuracion.js`) siguiendo el mismo patrón shell que `Caja/caja.html`, más la actualización de `scripts/navigation.js`. Toda la persistencia ocurre en `localStorage` bajo la clave `mirest_config`.

## Tasks

- [ ] 1. Crear estructura base del módulo y ConfigStore
  - Crear `Configuracion/configuracion.html` con el shell visual (sidebar, topbar, área de contenido) usando `data-module-key="configuracion"` y cargando los estilos globales del Design System
  - Crear `Configuracion/configuracion.js` con el objeto `ConfigStore` completo: `STORAGE_KEY`, `state`, `load()`, `persist()`, `get(path)`, `set(path, value)`, `reset()`
  - Implementar `ConfigStore.load()` con hidratación desde `localStorage` y fallback a defaults si `mirest_config` es `null` o el JSON está corrupto
  - Implementar `ConfigStore.persist()` con captura de `QuotaExceededError` y toast de error
  - Definir el objeto de defaults completo con todas las secciones: `dallIA`, `alertas`, `modulos`, `horarios`, `tour`, `usuarios`, `restaurante`
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [ ]* 1.1 Escribir property test para round-trip de persistencia del Config_Store
    - **Property 1: Round-trip de persistencia del Config_Store**
    - **Validates: Requirements 1.4, 1.5**

- [ ] 2. Implementar ConfigUI: navegación interna y estructura de secciones
  - Agregar el markup HTML de las 7 secciones en `configuracion.html` con `data-section="<key>"` y el menú lateral interno con 7 ítems
  - Implementar `ConfigUI.init()`, `ConfigUI.navigate(sectionKey)`, `ConfigUI.hydrate()`, `ConfigUI.showValidation(fieldId, message)`, `ConfigUI.clearValidation(fieldId)`, `ConfigUI.updateTopbarName(name)`
  - Conectar los event listeners del menú lateral interno para cambiar sección activa sin recargar la página
  - _Requirements: 1.7, 1.8_

  - [ ]* 2.1 Escribir property test para navegación interna
    - **Property 2: Navegación interna muestra sección correcta**
    - **Validates: Requirements 1.8**

- [ ] 3. Actualizar `scripts/navigation.js` con el módulo configuracion
  - Agregar el entry `{ key: "configuracion", label: "Configuración", short: "CF", icon: "settings", path: "Configuracion/configuracion.html", description: "..." }` al array `MODULES`
  - _Requirements: 1.1_

- [ ] 4. Implementar sección Personalizar DallIA
  - Agregar en `configuracion.html` el markup de la sección `dallia`: input nombre, select trato, select personalidad, 4 toggles de capacidades, área de vista previa
  - Implementar el handler de guardado con validación de nombre no vacío, actualización de `ConfigStore.state.dallIA` y llamada a `ConfigUI.updateTopbarName()`
  - Implementar la vista previa reactiva que muestra nombre, trato y personalidad antes de guardar
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

  - [ ]* 4.1 Escribir property test para round-trip de configuración DallIA
    - **Property 3: Round-trip de configuración DallIA**
    - **Validates: Requirements 2.5**

  - [ ]* 4.2 Escribir property test para actualización reactiva del nombre en topbar
    - **Property 4: Actualización reactiva del nombre en topbar**
    - **Validates: Requirements 2.6**

- [ ] 5. Implementar sección Alertas y Notificaciones
  - Agregar en `configuracion.html` el markup de la sección `alertas`: 6 toggles de canales, toggle DND, inputs hora Desde/Hasta
  - Implementar la lógica del toggle Urgente: deshabilitar cuando todos los demás canales están desactivados
  - Implementar la visibilidad condicional de los campos de hora según el estado del toggle DND
  - Implementar el handler de guardado con validación de campos de hora cuando DND está activo
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

  - [ ]* 5.1 Escribir property test para invariante del canal Urgente
    - **Property 5: Invariante del canal Urgente**
    - **Validates: Requirements 3.2**

  - [ ]* 5.2 Escribir property test para visibilidad condicional de campos DND
    - **Property 6: Visibilidad condicional de campos DND**
    - **Validates: Requirements 3.4**

  - [ ]* 5.3 Escribir property test para round-trip de configuración de alertas
    - **Property 7: Round-trip de configuración de alertas**
    - **Validates: Requirements 3.6**

- [ ] 6. Checkpoint — Asegurar que las secciones DallIA y Alertas persisten y cargan correctamente
  - Verificar que todos los tests pasan, consultar al usuario si hay dudas.

- [ ] 7. Implementar sección Módulos del Sistema
  - Agregar en `configuracion.html` el markup de la sección `modulos`: 4 grupos de cards con toggles, módulo Configuración sin toggle
  - Implementar los event listeners de cada toggle para actualizar `ConfigStore.state.modulos[key]` inmediatamente
  - Implementar la advertencia de dependencia al intentar desactivar `pedidosMesas` con `cocinaKDS` activo usando `<dialog>`
  - Implementar el handler de guardado que persiste el Module_Registry completo
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10_

  - [ ]* 7.1 Escribir property test para toggle de módulo actualiza el Config_Store
    - **Property 8: Toggle de módulo actualiza el Config_Store**
    - **Validates: Requirements 4.7, 4.10**

- [ ] 8. Implementar sección Horarios de Operación
  - Agregar en `configuracion.html` el markup de la sección `horarios`: 7 filas con toggle Cerrado, input apertura, input cierre
  - Implementar la lógica del toggle Cerrado: deshabilitar/ocultar campos de hora del día correspondiente
  - Implementar el handler de guardado con validación de cierre > apertura por cada día no cerrado
  - Implementar el resumen visual de días activos y horarios tras guardar
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

  - [ ]* 8.1 Escribir property test para toggle Cerrado controla campos de hora del día
    - **Property 9: Toggle Cerrado controla campos de hora del día**
    - **Validates: Requirements 5.3**

  - [ ]* 8.2 Escribir property test para round-trip de horarios de operación
    - **Property 10: Round-trip de horarios de operación**
    - **Validates: Requirements 5.5**

- [ ] 9. Implementar sección Tour del Sistema
  - Agregar en `configuracion.html` el markup de la sección `tour`: lista de 7 pasos con estado, barra de progreso, botón Reiniciar Tour
  - Implementar la función `calcularProgreso(completados, total)` que retorna `Math.round((completados / total) * 100)`
  - Implementar el handler de clic en paso: navegar al módulo o mostrar descripción con botón "Ir al módulo"
  - Implementar el handler de completar paso: actualizar `ConfigStore.state.tour.pasos[key].estado` a `"Completado"` y recalcular progreso
  - Implementar el handler de Reiniciar Tour: restablecer todos los pasos a `"Pendiente"` y `tour.completado` a `false`
  - Implementar la detección de primera carga (Config_Store vacío) para destacar el tour
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8_

  - [ ]* 9.1 Escribir property test para porcentaje de progreso del tour
    - **Property 11: Porcentaje de progreso del tour**
    - **Validates: Requirements 6.3**

  - [ ]* 9.2 Escribir property test para completar paso actualiza estado en Config_Store
    - **Property 12: Completar paso actualiza estado en Config_Store**
    - **Validates: Requirements 6.5**

  - [ ]* 9.3 Escribir property test para reiniciar tour restablece todos los pasos a Pendiente
    - **Property 13: Reiniciar tour restablece todos los pasos a Pendiente**
    - **Validates: Requirements 6.7**

- [ ] 10. Checkpoint — Asegurar que las secciones Módulos, Horarios y Tour funcionan correctamente
  - Verificar que todos los tests pasan, consultar al usuario si hay dudas.

- [ ] 11. Implementar sección Roles y Usuarios
  - Agregar en `configuracion.html` el markup de la sección `usuarios`: tabla de usuarios, formulario CRUD, tabla de permisos por rol
  - Implementar el handler de creación de usuario: validar email único, PIN de 4 dígitos, generar `id` con `crypto.randomUUID()` o `Date.now().toString(36)`, agregar al array `ConfigStore.state.usuarios`
  - Implementar el handler de edición de usuario: actualizar solo el registro con el `id` correspondiente
  - Implementar el handler de eliminación de usuario: mostrar `<dialog>` de confirmación, remover del array por `id`
  - Implementar la inicialización del Super Admin por defecto si el array `usuarios` está vacío al cargar
  - Implementar la sección de descripción de permisos por rol con los 7 roles definidos
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 7.10, 7.11, 7.12, 7.13, 7.14_

  - [ ]* 11.1 Escribir property test para creación de usuario genera id único
    - **Property 14: Creación de usuario genera id único**
    - **Validates: Requirements 7.4**

  - [ ]* 11.2 Escribir property test para edición de usuario afecta solo el registro correcto
    - **Property 15: Edición de usuario afecta solo el registro correcto**
    - **Validates: Requirements 7.5**

  - [ ]* 11.3 Escribir property test para eliminación de usuario remueve el registro del array
    - **Property 16: Eliminación de usuario remueve el registro del array**
    - **Validates: Requirements 7.6**

  - [ ]* 11.4 Escribir property test para email duplicado es rechazado
    - **Property 17: Email duplicado es rechazado**
    - **Validates: Requirements 7.7**

- [ ] 12. Implementar sección Información del Restaurante
  - Agregar en `configuracion.html` el markup de la sección `restaurante`: formulario con campos nombre, dirección, RUC, moneda, zona horaria, file input logo, área de vista previa
  - Implementar el handler de selección de imagen: validar tipo (`image/png`, `image/jpeg`) y tamaño (≤ 2 MB), mostrar vista previa con `FileReader`
  - Implementar el handler de guardado: validar RUC de 11 dígitos numéricos, convertir logo a base64, actualizar `ConfigStore.state.restaurante`
  - Implementar la visualización del nombre del restaurante como subtítulo contextual en el topbar al cargar
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9, 8.10_

  - [ ]* 12.1 Escribir property test para round-trip de información del restaurante
    - **Property 18: Round-trip de información del restaurante**
    - **Validates: Requirements 8.6, 8.7**

  - [ ]* 12.2 Escribir property test para nombre del restaurante se refleja en el topbar al cargar
    - **Property 19: Nombre del restaurante se refleja en el topbar al cargar**
    - **Validates: Requirements 8.10**

- [ ] 13. Checkpoint final — Verificar integración completa del módulo
  - Verificar que todos los tests pasan, consultar al usuario si hay dudas.

## Notes

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Los property tests usan **fast-check** vía CDN: `https://cdn.jsdelivr.net/npm/fast-check/lib/bundle/fast-check.min.js`
- Cada property test se ejecuta con mínimo 100 iteraciones (`{ numRuns: 100 }`)
- Cada tarea referencia los requisitos específicos para trazabilidad
- El módulo sigue el patrón shell de `Caja/caja.html` sin bundler (Vanilla HTML/CSS/JS)
- El color de acento es `#f07c2a` consumido via token CSS `--color-accent`
