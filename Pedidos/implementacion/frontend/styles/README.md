# 📋 README — Frontend Architecture

> **Módulo:** Pedidos — MiRest con IA  
> **Runtime oficial:** modular  
> **Última actualización:** 2026-04-20

---

## Estructura vigente

```text
implementacion/
├── index.html
├── data.js
├── manifest.json
├── service-worker.js
├── styles.css
└── frontend/
    ├── styles/
    │   ├── tokens.css
    │   ├── base.css
    │   ├── components.css
    │   ├── modules.css
    │   └── patch.css
    ├── core/
    │   ├── app-state.js
    │   ├── bootstrap.js
    │   ├── mesero-bridge.js
    │   ├── modular-app.js
    │   ├── pwa.js
    │   ├── storage.js
    │   └── ui-helpers.js
    └── modules/
        ├── dashboard/
        └── pedidos/
            ├── delivery/
            ├── salon/
            ├── takeaway/
            └── onboarding.js
```

---

## Orden de carga de CSS

```html
<!-- 1. Tokens — variables CSS globales -->
<link rel="stylesheet" href="./frontend/styles/tokens.css" />
<!-- 2. Base — reset y fundamentos -->
<link rel="stylesheet" href="./frontend/styles/base.css" />
<!-- 3. Components — biblioteca completa -->
<link rel="stylesheet" href="./frontend/styles/components.css" />
<!-- 4. Modules — layouts de módulos -->
<link rel="stylesheet" href="./frontend/styles/modules.css" />
<!-- 5. Legacy visual — compatibilidad temporal -->
<link rel="stylesheet" href="./styles.css" />
<!-- 6. Patch — fixes críticos (al final, mayor especificidad) -->
<link rel="stylesheet" href="./frontend/styles/patch.css" />
```

> [`frontend/styles/patch.css`](patch.css) debe ir al final para corregir compatibilidad visual.

---

## Convenciones y reglas

### Tokens

- Todo valor de color/espacio/sombra/radio debe usar variables `--app-*` de `tokens.css`
- Nunca hardcodear colores HEX directamente en componentes nuevos
- Al leer `styles.css` legacy, usar sus tokens `--color-*` para compatibilidad

### Nomenclatura CSS

- Componentes nuevos: `.nombre-del-componente__elemento--modificador` (BEM)
- Módulos: `.modulo-tipo` (sin BEM complejo)
- No usar `!important` salvo en `patch.css`

### JavaScript

- Todo estado nuevo va en [`frontend/core/app-state.js`](app-state.js)
- Toda persistencia va en [`frontend/core/storage.js`](storage.js)
- El arranque ocurre desde [`frontend/core/bootstrap.js`](../core/bootstrap.js)
- La orquestación principal vive en [`frontend/core/modular-app.js`](../core/modular-app.js)
- Comunicación entre módulos: `CustomEvent` vía [`dispatchModuleEvent()`](../core/app-state.js:312)

### PWA

- Siempre feature-detect antes de usar APIs PWA
- Safe-area: usar `var(--app-safe-top/bottom/left/right)` de `tokens.css`
- Wake Lock: solo activar en modo "turno activo", liberar en background

---

## Estado técnico actual

- [`frontend/styles/tokens.css`](tokens.css), [`frontend/styles/base.css`](base.css), [`frontend/styles/components.css`](components.css) y [`frontend/styles/modules.css`](modules.css) forman la base visual oficial.
- [`frontend/styles/patch.css`](patch.css) sigue activo para compatibilidad con [`styles.css`](../../styles.css).
- El modo oscuro se mantiene disponible desde el shell superior y desde la PWA.
- El layout es mobile-first y compatible con bottom-nav cuando [`frontend/core/pwa.js`](../core/pwa.js) activa `pwa-shell`.

---

## Próximos pasos

- [ ] Desacoplar [`data.js`](../../data.js) hacia fuentes modulares
- [ ] Añadir más acciones de negocio en [`frontend/core/app-state.js`](../core/app-state.js)
- [ ] Conectar persistencia real para pedidos y mesas
- [ ] Añadir View Transitions al cambio de modo operativo
