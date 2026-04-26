# Mock DB del módulo Pedidos

Esta carpeta centralizará la persistencia mock del módulo [`Pedidos`](../../index.html).

## Origen actual de datos

- [`../data/orders-salon.json`](../data/orders-salon.json)
- [`../data/orders-delivery.json`](../data/orders-delivery.json)
- [`../data/orders-takeaway.json`](../data/orders-takeaway.json)
- [`../data/catalog.json`](../data/catalog.json)
- [`../data/staff.json`](../data/staff.json)

## Objetivo del refactor

- encapsular lectura/escritura
- preparar repositorios por agregado
- separar datasets de reglas de negocio
- permitir migración futura a MySQL o API real
