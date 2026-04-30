# Estandarización de componentes para [`Pedidos`](../implementacion/index.html)

Base tomada de [`contexto/documentacion.md`](../contexto/documentacion.md).

## Reglas visuales obligatorias

- máximo 2 colores fuertes por pantalla
- naranja para acciones
- azul oscuro para control e información
- cards con radio grande y lectura operativa rápida
- componentes reutilizables entre desktop y PWA móvil

## Componentes prioritarios a normalizar

1. `topbar`
2. `mode-switcher`
3. `summary-card`
4. `table-card`
5. `ops-flow-card`
6. `management-panel`
7. `order-drawer`
8. `modal`
9. `onboarding`
10. `payment-brand`

## Tokens ya extraídos

- [`implementacion/frontend/styles/tokens.css`](../implementacion/frontend/styles/tokens.css)
- [`implementacion/frontend/styles/base.css`](../implementacion/frontend/styles/base.css)
- [`implementacion/frontend/styles/components.css`](../implementacion/frontend/styles/components.css)
- [`implementacion/frontend/styles/modules.css`](../implementacion/frontend/styles/modules.css)

## Siguiente paso

Migrar progresivamente reglas desde [`implementacion/styles.css`](../implementacion/styles.css) hacia los archivos nuevos sin romper la compatibilidad actual.
