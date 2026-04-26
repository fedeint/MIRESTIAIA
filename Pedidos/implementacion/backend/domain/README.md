# Domain

Aquí se modelarán las entidades y reglas del negocio del módulo [`Pedidos`](../../index.html).

## Agregados previstos

- `Table`
- `Order`
- `Round`
- `Payment`
- `DeliveryOrder`
- `TakeawayOrder`
- `Courtesy`
- `CreditNote`

## Principio

La UI consume estados ya resueltos; la lógica debe vivir aquí o en `services/`.
