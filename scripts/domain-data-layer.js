/**
 * Esquema mental módulos ↔ base de datos (Supabase / Postgres).
 * Sin runtime aún: guía para migrar mocks (Pedidos, productos, etc.) a tablas reales.
 *
 * Multi-tenant: casi todas las filas llevan restaurant_id (o org_id) + RLS por JWT.
 *
 * Núcleo sugerido
 * - products, product_categories — fuente única de carta; Pedidos/Caja leen precio/nombre aquí.
 * - orders, order_items (product_id, qty, precio_unitario_snapshot) — salón / delivery / takeaway.
 * - tables (mesa, zona, estado) — Pedidos; opcional link a order_id activo.
 * - recipes, recipe_ingredients (insumo_id, cantidad) — Recetas; costeo y fichas técnicas.
 * - insumos (+ entradas_insumos, salidas_insumos, proveedores) — Almacén solo vía BD; sin datos ficticios en migration.sql.
 * - customers — Clientes; pedidos delivery/factura referencian customer_id opcional.
 * - payments, invoices — Caja; líneas desde order_items ya cerrados.
 *
 * Flujo típico: Productos (CRUD carta) → Pedidos arma order_items → Cocina ve por order/kds →
 * Caja cierra pago → Almacén descuenta por receta o manual → Reportes agrega por fecha/local.
 */
export const DOMAIN_DATA_LAYER_NOTES_VERSION = 1;
