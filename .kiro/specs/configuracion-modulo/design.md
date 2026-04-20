# Design Document: Módulo de Configuración de MiRest con IA

## Overview

El módulo de Configuración es el centro de control de MiRest con IA. Permite al Super Admin y Admin personalizar el asistente DallIA, gestionar alertas, activar/desactivar módulos, configurar horarios de operación, guiar nuevos usuarios con un tour interactivo, administrar roles y usuarios, y mantener la información general del restaurante.

Se implementa como dos archivos (`Configuracion/configuracion.html` + `Configuracion/configuracion.js`) que siguen exactamente el mismo patrón shell que `Caja/caja.html`, sin bundler, usando Vanilla HTML/CSS/JS. Toda la persistencia ocurre en `localStorage` bajo la clave `mirest_config`.

---

## Architecture

```
Configuracion/
├── configuracion.html      ← Shell + markup de las 7 secciones
└── configuracion.js        ← Lógica: ConfigStore, ConfigUI, sección handlers

scripts/
└── navigation.js           ← Agregar entry "configuracion" al array MODULES

styles/
└── (sin cambios)           ← Se consumen tokens.css, base.css, layout.css,
                               components.css, dashboard.css, premium-modules.css
```

### Flujo de datos

```
localStorage['mirest_config']
        │
        ▼
  ConfigStore.load()  ──►  ConfigStore.state  ──►  ConfigUI.hydrate()
                                   │
                           ConfigUI.save()
                                   │
                           ConfigStore.persist()
                                   │
                        localStorage['mirest_config']
```

### Navegación interna (sin recarga)

El módulo usa un menú lateral interno con 7 ítems. Al hacer clic en un ítem:
1. Se remueve la clase `cfg-nav__item--active` de todos los ítems.
2. Se agrega `cfg-nav__item--active` al ítem seleccionado.
3. Se ocultan todas las secciones (`.cfg-section`).
4. Se muestra la sección correspondiente (`data-section="<key>"`).

No hay `window.location` ni recarga de página.

---

## Components and Interfaces

### ConfigStore (módulo JS)

```js
const ConfigStore = {
  STORAGE_KEY: 'mirest_config',
  state: {},          // objeto en memoria

  load(),             // lee localStorage, hidrata state, aplica defaults si null
  persist(),          // JSON.stringify(state) → localStorage
  get(path),          // acceso por dot-notation: get('dallIA.nombre')
  set(path, value),   // mutación por dot-notation + persist()
  reset(),            // restaura defaults + persist()
}
```

### ConfigUI (módulo JS)

```js
const ConfigUI = {
  init(),             // llama ConfigStore.load(), renderiza sidebar, hidrata formularios
  navigate(sectionKey),  // muestra sección activa, oculta las demás
  hydrate(),          // recorre todas las secciones y aplica ConfigStore.state a los controles
  showValidation(fieldId, message),  // muestra mensaje de error inline
  clearValidation(fieldId),
  updateTopbarName(name),  // actualiza assistant-pill y subtítulo del topbar
}
```

### Secciones (7)

| key | Label | Componentes principales |
|-----|-------|------------------------|
| `dallia` | Personalizar DallIA | Input nombre, select trato, select personalidad, 4 toggles, preview |
| `alertas` | Alertas y Notificaciones | 6 toggles canales, toggle DND, inputs hora |
| `modulos` | Módulos del Sistema | 4 grupos de cards con toggles |
| `horarios` | Horarios de Operación | 7 filas día con toggle cerrado + inputs hora |
| `tour` | Tour del Sistema | Lista de 7 pasos con estado, barra progreso, botón reiniciar |
| `usuarios` | Roles y Usuarios | Tabla usuarios, formulario CRUD, tabla permisos por rol |
| `restaurante` | Información del Restaurante | Formulario datos, file input logo, preview imagen |

---

## Data Models

### Config_Store (estructura completa en localStorage)

```js
{
  "dallIA": {
    "nombre": "DallIA",
    "trato": "Tú",                    // "Tú" | "Usted"
    "personalidad": "Amigable",       // "Profesional" | "Amigable" | "Directo"
    "capacidades": {
      "chat": true,
      "comandosVoz": true,
      "alertasProactivas": true,
      "preguntaDiaria": true
    }
  },
  "alertas": {
    "canales": {
      "urgente": true,
      "operaciones": true,
      "sugerenciasIA": true,
      "reportes": true,
      "sunatFiscal": true,
      "personal": true
    },
    "dnd": {
      "activo": false,
      "desde": "22:00",
      "hasta": "08:00"
    }
  },
  "modulos": {
    "pedidosMesas": true,
    "cocinaKDS": true,
    "paraLlevar": true,
    "delivery": true,
    "descuentosPromos": true,
    "cortesias": true,
    "productosCarta": true,
    "almacenInventario": true,
    "recetasCostos": true,
    "clientesFidelidad": true,
    "administracionGeneral": true,
    "facturacionSUNAT": true,
    "sunatIGV": true,
    "reportes": true,
    "whatsappBusiness": false,
    "impresoraTicket": false,
    "accesoAudioVoz": false,
    "accesoFotosCamara": false,
    "pedidosYaRappi": false,
    "pagosYapePlin": false,
    "usuarios": true,
    "configuracion": true,   // siempre true, sin toggle
    "soporte": true
  },
  "horarios": {
    "lunes":    { "cerrado": false, "apertura": "08:00", "cierre": "22:00" },
    "martes":   { "cerrado": false, "apertura": "08:00", "cierre": "22:00" },
    "miercoles":{ "cerrado": false, "apertura": "08:00", "cierre": "22:00" },
    "jueves":   { "cerrado": false, "apertura": "08:00", "cierre": "22:00" },
    "viernes":  { "cerrado": false, "apertura": "08:00", "cierre": "22:00" },
    "sabado":   { "cerrado": true,  "apertura": "08:00", "cierre": "22:00" },
    "domingo":  { "cerrado": true,  "apertura": "08:00", "cierre": "22:00" }
  },
  "tour": {
    "completado": false,
    "pasos": {
      "dashboard":     { "label": "Dashboard y KPIs",        "estado": "Pendiente" },
      "mesas":         { "label": "Mesas y Pedidos",         "estado": "Pendiente" },
      "dallia":        { "label": "Chat con DallIA",         "estado": "Pendiente" },
      "cocina":        { "label": "Módulo Cocina",           "estado": "Pendiente" },
      "caja":          { "label": "Módulo Caja",             "estado": "Pendiente" },
      "almacen":       { "label": "Módulo Almacén",          "estado": "Pendiente" },
      "configuracion": { "label": "Configuración del Sistema","estado": "Pendiente" }
    }
  },
  "usuarios": [
    {
      "id": "usr_superadmin_default",
      "nombre": "Super Admin",
      "email": "admin@mirest.pe",
      "rol": "Super Admin",
      "activo": true,
      "pin": "0000"
    }
  ],
  "restaurante": {
    "nombre": "",
    "direccion": "",
    "ruc": "",
    "logo": "",          // base64 string
    "moneda": "PEN",
    "zonaHoraria": "America/Lima"
  }
}
```

### User_Record

```js
{
  id: string,          // generado con crypto.randomUUID() o Date.now().toString(36)
  nombre: string,
  email: string,
  rol: "Super Admin" | "Admin" | "Gerente" | "Cajero" | "Cocinero" | "Mesero" | "Almacenero",
  activo: boolean,
  pin: string          // exactamente 4 dígitos numéricos
}
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

Antes de listar las propiedades finales, se identificaron redundancias:

- **1.4 y 1.5** (guardar → localStorage, cargar → hidratar) se combinan en una sola propiedad de round-trip: guardar cualquier estado y luego cargarlo debe producir el mismo estado.
- **4.7 y 4.10** (toggle módulo → actualiza store, guardar → persiste registry) son la misma operación; se consolidan en una propiedad.
- **7.4 y 7.5** (crear usuario con id único, editar usuario por id) son operaciones distintas y se mantienen separadas.
- **8.6 y 8.7** (logo base64, campos restaurante) se combinan en una propiedad de round-trip del formulario restaurante.

---

### Property 1: Round-trip de persistencia del Config_Store

*Para cualquier* objeto de configuración válido, guardarlo en el Config_Store y luego cargarlo desde `localStorage` debe producir un objeto equivalente al original.

**Validates: Requirements 1.4, 1.5**

---

### Property 2: Navegación interna muestra sección correcta

*Para cualquier* clave de sección válida (`dallia`, `alertas`, `modulos`, `horarios`, `tour`, `usuarios`, `restaurante`), al navegar a esa sección debe ser la única visible y todas las demás deben estar ocultas.

**Validates: Requirements 1.8**

---

### Property 3: Round-trip de configuración DallIA

*Para cualquier* combinación válida de nombre (no vacío), trato y personalidad, guardar la sección DallIA y luego leer `ConfigStore.state.dallIA` debe retornar exactamente los mismos valores ingresados.

**Validates: Requirements 2.5**

---

### Property 4: Actualización reactiva del nombre en topbar

*Para cualquier* cadena de texto no vacía usada como nombre del asistente, después de guardar, el elemento `assistant-pill` del topbar debe contener ese nombre.

**Validates: Requirements 2.6**

---

### Property 5: Invariante del canal Urgente

*Para cualquier* combinación de estados de los canales de notificación donde todos los canales no-Urgente están desactivados, el toggle del canal Urgente debe estar deshabilitado (no se puede desactivar).

**Validates: Requirements 3.2**

---

### Property 6: Visibilidad condicional de campos DND

*Para cualquier* estado del toggle DND (activo/inactivo), los campos de hora `Desde` y `Hasta` deben ser visibles si y solo si el DND está activo.

**Validates: Requirements 3.4**

---

### Property 7: Round-trip de configuración de alertas

*Para cualquier* combinación válida de estados de canales y configuración DND, guardar la sección de alertas y luego leer `ConfigStore.state.alertas` debe retornar exactamente los mismos valores.

**Validates: Requirements 3.6**

---

### Property 8: Toggle de módulo actualiza el Config_Store

*Para cualquier* clave de módulo (excepto `configuracion`), cambiar su estado activo/inactivo debe actualizar `ConfigStore.state.modulos[key]` al nuevo valor booleano.

**Validates: Requirements 4.7, 4.10**

---

### Property 9: Toggle Cerrado controla campos de hora del día

*Para cualquier* día de la semana, activar el toggle `Cerrado` debe deshabilitar y ocultar los campos de hora de ese día; desactivarlo debe habilitarlos y mostrarlos.

**Validates: Requirements 5.3**

---

### Property 10: Round-trip de horarios de operación

*Para cualquier* configuración válida de horarios (con cierre > apertura en días no cerrados), guardar y luego leer `ConfigStore.state.horarios` debe retornar exactamente los mismos valores.

**Validates: Requirements 5.5**

---

### Property 11: Porcentaje de progreso del tour

*Para cualquier* número N de pasos completados (0 ≤ N ≤ 7), la barra de progreso debe mostrar exactamente `Math.round((N / 7) * 100)`%.

**Validates: Requirements 6.3**

---

### Property 12: Completar paso actualiza estado en Config_Store

*Para cualquier* clave de paso del tour, marcarlo como completado debe actualizar `ConfigStore.state.tour.pasos[key].estado` a `"Completado"`.

**Validates: Requirements 6.5**

---

### Property 13: Reiniciar tour restablece todos los pasos a Pendiente

*Para cualquier* estado previo del tour (cualquier combinación de pasos completados/en progreso/pendientes), hacer clic en "Reiniciar Tour" debe establecer el estado de todos los pasos a `"Pendiente"` y `tour.completado` a `false`.

**Validates: Requirements 6.7**

---

### Property 14: Creación de usuario genera id único

*Para cualquier* conjunto de N usuarios válidos creados secuencialmente, todos deben tener valores de `id` distintos entre sí.

**Validates: Requirements 7.4**

---

### Property 15: Edición de usuario afecta solo el registro correcto

*Para cualquier* array de usuarios con al menos dos registros, editar los campos de un usuario identificado por su `id` debe actualizar solo ese registro y dejar los demás sin cambios.

**Validates: Requirements 7.5**

---

### Property 16: Eliminación de usuario remueve el registro del array

*Para cualquier* `id` de usuario presente en `ConfigStore.state.usuarios`, eliminarlo debe resultar en que ese `id` ya no exista en el array.

**Validates: Requirements 7.6**

---

### Property 17: Email duplicado es rechazado

*Para cualquier* email que ya exista en `ConfigStore.state.usuarios`, intentar crear un nuevo usuario con ese mismo email debe ser rechazado con mensaje de validación y el array no debe crecer.

**Validates: Requirements 7.7**

---

### Property 18: Round-trip de información del restaurante

*Para cualquier* conjunto válido de datos del restaurante (nombre, dirección, RUC de 11 dígitos, moneda, zona horaria, logo ≤ 2MB), guardar y luego leer `ConfigStore.state.restaurante` debe retornar exactamente los mismos valores, con el logo almacenado como string base64 válido.

**Validates: Requirements 8.6, 8.7**

---

### Property 19: Nombre del restaurante se refleja en el topbar al cargar

*Para cualquier* nombre de restaurante almacenado en `ConfigStore.state.restaurante.nombre`, al inicializar el módulo ese nombre debe aparecer como subtítulo contextual en el topbar.

**Validates: Requirements 8.10**

---

## Error Handling

| Condición | Comportamiento |
|-----------|---------------|
| `localStorage` lleno (QuotaExceededError) | Capturar en `ConfigStore.persist()`, mostrar toast de error, no perder el estado en memoria |
| Nombre DallIA vacío al guardar | Mostrar mensaje inline bajo el campo, no llamar a `persist()` |
| DND activo con campos de hora vacíos | Mostrar mensaje inline, no llamar a `persist()` |
| RUC con formato inválido (≠ 11 dígitos numéricos) | Mostrar mensaje inline, no llamar a `persist()` |
| Logo > 2 MB | Mostrar error antes de leer el archivo, no procesar FileReader |
| PIN con formato inválido (≠ 4 dígitos numéricos) | Mostrar mensaje inline, no llamar a `persist()` |
| Email duplicado en usuarios | Mostrar mensaje inline, no agregar al array |
| Cierre ≤ Apertura en horarios | Mostrar mensaje inline por día afectado, no llamar a `persist()` |
| Intento de desactivar Pedidos y Mesas con Cocina KDS activo | Mostrar `<dialog>` de advertencia con botones Confirmar/Cancelar |
| `JSON.parse` falla al leer `mirest_config` | Tratar como `null`, inicializar con defaults, loguear error en consola |

Todos los mensajes de validación usan el patrón:
```html
<span class="cfg-field-error" role="alert" id="error-{fieldId}">Mensaje</span>
```
y se limpian al modificar el campo correspondiente.

---

## Testing Strategy

### Enfoque dual

El módulo combina **tests de ejemplo** para comportamientos específicos y **tests de propiedad** para invariantes universales.

### Librería de property-based testing

Se usará **[fast-check](https://fast-check.dev/)** (JavaScript, sin bundler, disponible via CDN o npm). Cada test de propiedad se ejecuta con mínimo **100 iteraciones**.

```html
<!-- En el archivo de tests -->
<script src="https://cdn.jsdelivr.net/npm/fast-check/lib/bundle/fast-check.min.js"></script>
```

### Tests de ejemplo (unit tests)

Cubren comportamientos específicos y estados iniciales:

- Valores por defecto del Config_Store al inicializar con `localStorage` vacío
- Presencia de los 7 ítems de navegación en el DOM
- Estado inicial de cada sección (campos, toggles, valores)
- Canal Urgente activado por defecto
- Toggle DND desactivado por defecto
- Días Lunes-Viernes con horarios, Sábado-Domingo cerrados
- Módulo Configuración sin toggle y siempre activo
- Tabla de usuarios con columnas correctas
- Selectores de moneda y zona horaria con valores por defecto
- Primer carga con localStorage vacío muestra tour destacado

### Tests de propiedad (property-based tests)

Cada propiedad del diseño se implementa como un test fast-check con el tag:
`// Feature: configuracion-modulo, Property {N}: {texto}`

```js
// Feature: configuracion-modulo, Property 1: Round-trip de persistencia del Config_Store
fc.assert(fc.property(
  fc.record({ dallIA: fc.record({ nombre: fc.string({ minLength: 1 }) }) }),
  (config) => {
    ConfigStore.state = config;
    ConfigStore.persist();
    ConfigStore.load();
    return JSON.stringify(ConfigStore.state) === JSON.stringify(config);
  }
), { numRuns: 100 });

// Feature: configuracion-modulo, Property 11: Porcentaje de progreso del tour
fc.assert(fc.property(
  fc.integer({ min: 0, max: 7 }),
  (n) => {
    const expected = Math.round((n / 7) * 100);
    return calcularProgreso(n, 7) === expected;
  }
), { numRuns: 100 });
```

### Tests de integración

- Guardar config completo → recargar página → verificar que todos los formularios muestran los valores guardados
- Flujo completo de creación de usuario → edición → eliminación
- Flujo de tour: completar todos los pasos → verificar mensaje de felicitación → reiniciar → verificar estado Pendiente

### Cobertura de edge cases

Los generadores de fast-check deben incluir:
- Nombres con caracteres especiales, emojis, espacios
- PINs de longitud variable (0-10 dígitos)
- RUCs con letras, símbolos, longitudes incorrectas
- Horarios con cierre = apertura, cierre < apertura
- Arrays de usuarios vacíos y con muchos registros
