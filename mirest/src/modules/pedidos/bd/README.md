# Base de datos propuesta para el módulo Pedidos

Esta carpeta documenta cómo se modelaría el módulo [`Pedidos`](../implementacion/index.html) si se conectara a MySQL.

## Alcance

- entidades operativas
- relaciones principales
- eventos críticos del negocio
- esquema inicial SQL

## Principios

- separación por `tenantId`
- trazabilidad de pedidos y pagos
- soporte a rondas, delivery y para llevar
- compatibilidad futura con facturación y auditoría
