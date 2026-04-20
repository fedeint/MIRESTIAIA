# Plan de Implementación: almacen-supabase

## Descripción general

Migración del módulo Almacén de MiRest de localStorage a Supabase como fuente de verdad central. La implementación sigue una estrategia incremental: primero se crea la infraestructura compartida (`supabase-config.js` y `almacen-db.js`), luego se migra cada submódulo del Almacén, y finalmente se expone la función global para módulos dependientes.

## Tareas

- [x] 1. Crear script de migración SQL y archivos de configuración base
  - Crear `Almacen/migration.sql` con `CREATE TABLE` para las 4 tablas (`insumos`, `entradas_insumos`, `salidas_insumos`, `proveedores`), RLS habilitado, políticas de acceso público con anon key, índices en `codigo` y `created_at`, e `INSERT INTO insumos` con los 39 insumos del seed
  - Crear `Almacen/supabase-config.js` que expone `window.ALMACEN_SUPABASE = { url, anonKey }`
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

- [x] 2. Implementar la capa de datos compartida `almacen-db.js`
  - [x] 2.1 Implementar `AlmacenDB._fetch(endpoint, options)` con construcción de URL, headers de autenticación, verificación de `response.ok`, logging de errores y lanzamiento de excepciones
    - _Requirements: 9.1, 9.5_
  - [ ]* 2.2 Escribir property test para headers de autenticación (Property 7)
    - **Property 7: Headers de autenticación en todas las peticiones**
    - **Validates: Requirements 9.5**
  - [ ]* 2.3 Escribir property test para errores HTTP (Property 8)
    - **Property 8: Errores HTTP disparan logging y notificación**
    - **Validates: Requirements 9.1, 9.2**
  - [x] 2.4 Implementar `AlmacenDB._mostrarError(mensaje)` con toast DOM de auto-dismiss a 5 segundos y CSS inline
    - _Requirements: 9.2_
  - [x] 2.5 Implementar métodos de insumos: `getInsumos()`, `getInsumoByCodigo(codigo)`, `updateStockInsumo(codigo, nuevoStock)`
    - _Requirements: 2.1, 2.4, 2.5_
  - [x] 2.6 Implementar métodos de entradas: `getEntradas()`, `insertEntrada(entrada)`
    - _Requirements: 3.1, 3.4_
  - [x] 2.7 Implementar métodos de salidas: `getSalidas()`, `insertSalida(salida)`
    - _Requirements: 4.1, 4.3_
  - [x] 2.8 Implementar métodos de proveedores: `getProveedores()`, `insertProveedor(proveedor)`, `updateProveedor(id, datos)`
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  - [x] 2.9 Implementar `getInventarioSupabase()` con mapeo snake_case → camelCase y exponer `window.getInventarioSupabase`
    - _Requirements: 2.7, 8.1_
  - [ ]* 2.10 Escribir property test para mapeo bidireccional de campos (Property 9)
    - **Property 9: Mapeo bidireccional de campos snake_case ↔ camelCase**
    - **Validates: Requirements 2.7, 8.1**

- [x] 3. Checkpoint — Verificar que `almacen-db.js` funciona correctamente
  - Asegurarse de que todos los tests pasan. Consultar al usuario si surgen dudas.

- [x] 4. Migrar módulo Inventario (`inventario.js`)
  - [x] 4.1 Reemplazar lectura de `localStorage.getItem('inventario_mirest')` por `AlmacenDB.getInsumos()` en la función de carga inicial; renderizar tabla con datos de Supabase
    - _Requirements: 2.1, 2.6_
  - [x] 4.2 Implementar `calcularEstado(stockActual, stockMinimo)` como función pura en el cliente
    - _Requirements: 2.3_
  - [ ]* 4.3 Escribir property test para cálculo de Stock_Estado (Property 1)
    - **Property 1: Cálculo correcto de Stock_Estado**
    - **Validates: Requirements 2.3**
  - [x] 4.4 Agregar manejo de error en carga: mostrar mensaje visible si GET falla
    - _Requirements: 2.2_
  - [x] 4.5 Actualizar `inventario.html` para cargar `../supabase-config.js` y `../almacen-db.js` antes de `inventario.js`
    - _Requirements: 1.7, 1.8_

- [x] 5. Migrar módulo Entradas de Insumos (`entrada-de-insumos.js`)
  - [x] 5.1 Reemplazar lectura de historial desde localStorage por `AlmacenDB.getEntradas()` al cargar la página; poblar selector de insumos con `AlmacenDB.getInsumos()` y selector de proveedores con `AlmacenDB.getProveedores()`
    - _Requirements: 3.4, 3.5, 3.6_
  - [x] 5.2 Reemplazar escritura de entrada: al enviar formulario, llamar `AlmacenDB.insertEntrada()` y luego `AlmacenDB.updateStockInsumo()` por cada insumo; mostrar advertencia si el PATCH falla después de un POST exitoso
    - _Requirements: 3.1, 3.2, 3.3, 3.7, 3.8_
  - [ ]* 5.3 Escribir property test para actualización de stock en entradas (Property 2)
    - **Property 2: Actualización de stock en entradas preserva la suma**
    - **Validates: Requirements 3.2**
  - [x] 5.4 Actualizar `entrada-de-insumos.html` para cargar los scripts compartidos antes del módulo
    - _Requirements: 1.7_

- [x] 6. Migrar módulo Salidas de Insumos (`salida.js`)
  - [x] 6.1 Reemplazar lectura de historial desde localStorage por `AlmacenDB.getSalidas()` al cargar la página; poblar selector de insumos con `AlmacenDB.getInsumos()`
    - _Requirements: 4.3, 4.5_
  - [x] 6.2 Implementar validación de stock insuficiente en cliente antes de enviar a Supabase; mostrar error descriptivo si `cantidad > stock_actual`
    - _Requirements: 4.4_
  - [ ]* 6.3 Escribir property test para validación de stock insuficiente (Property 4)
    - **Property 4: Validación de stock insuficiente en salidas**
    - **Validates: Requirements 4.4**
  - [x] 6.4 Reemplazar escritura de salida: llamar `AlmacenDB.insertSalida()` y luego `AlmacenDB.updateStockInsumo()` con el stock decrementado; manejar error si POST o PATCH fallan
    - _Requirements: 4.1, 4.2, 4.6_
  - [ ]* 6.5 Escribir property test para actualización de stock en salidas (Property 3)
    - **Property 3: Actualización de stock en salidas preserva la resta**
    - **Validates: Requirements 4.2**
  - [x] 6.6 Actualizar `salida.html` para cargar los scripts compartidos antes del módulo
    - _Requirements: 1.7_

- [x] 7. Checkpoint — Verificar que los módulos de movimientos funcionan correctamente
  - Asegurarse de que todos los tests pasan. Consultar al usuario si surgen dudas.

- [x] 8. Migrar módulo Proveedores (`proveedores.js`)
  - [x] 8.1 Reemplazar lectura desde localStorage por `AlmacenDB.getProveedores()` al cargar; obtener categorías únicas desde `AlmacenDB.getInsumos()` para el selector del formulario
    - _Requirements: 5.1, 5.5, 5.6_
  - [x] 8.2 Reemplazar escritura: llamar `AlmacenDB.insertProveedor()` para nuevos proveedores y `AlmacenDB.updateProveedor()` para ediciones y cambios de estado
    - _Requirements: 5.2, 5.3, 5.4_
  - [x] 8.3 Actualizar `proveedores.html` para cargar los scripts compartidos antes del módulo
    - _Requirements: 1.7_

- [x] 9. Migrar módulo Qué Comprar (`que-comprar.js`)
  - [x] 9.1 Reemplazar lectura desde localStorage por `AlmacenDB.getInsumos()`; implementar filtrado en cliente de insumos con `stock_actual <= stock_minimo`
    - _Requirements: 6.1, 6.3, 6.4_
  - [x] 9.2 Implementar función `calcularCantidadSugerida(stockActual, stockMinimo)` como `MAX(0, (stockMinimo * 2) - stockActual)`
    - _Requirements: 6.2_
  - [ ]* 9.3 Escribir property test para filtrado de insumos a comprar (Property 5)
    - **Property 5: Filtrado correcto de insumos a comprar**
    - **Validates: Requirements 6.1**
  - [ ]* 9.4 Escribir property test para cálculo de cantidad sugerida (Property 6)
    - **Property 6: Cálculo correcto de cantidad sugerida**
    - **Validates: Requirements 6.2**
  - [x] 9.5 Actualizar `que-comprar.html` para cargar los scripts compartidos antes del módulo
    - _Requirements: 1.7_

- [x] 10. Migrar módulo Historial (`historial.js`)
  - [x] 10.1 Reemplazar todas las lecturas desde localStorage por llamadas a `AlmacenDB.getEntradas()`, `AlmacenDB.getSalidas()` o `AlmacenDB.getInsumos()` según el filtro de módulo seleccionado
    - _Requirements: 7.1, 7.2, 7.3, 7.5_
  - [x] 10.2 Implementar filtrado de fecha en cliente usando el campo `fecha` de los registros retornados por Supabase
    - _Requirements: 7.4_
  - [x] 10.3 Actualizar `historial.html` para cargar los scripts compartidos antes del módulo
    - _Requirements: 1.7_

- [x] 11. Implementar sincronización de localStorage y compatibilidad con módulos dependientes
  - [x] 11.1 Después de cada operación de escritura exitosa en Supabase (insertEntrada, insertSalida, updateStockInsumo), actualizar `localStorage.setItem('inventario_mirest', JSON.stringify(insumos))` con los datos más recientes
    - _Requirements: 8.3_
  - [ ]* 11.2 Escribir property test para sincronización de localStorage (Property 10)
    - **Property 10: Sincronización de localStorage después de escrituras**
    - **Validates: Requirements 8.3**
  - [x] 11.3 Verificar que `window.getInventarioSupabase()` retorna la estructura legacy correcta para módulos dependientes; agregar manejo de error cuando las credenciales no son válidas
    - _Requirements: 8.1, 8.2, 8.4_

- [x] 12. Checkpoint final — Verificar integración completa
  - Asegurarse de que todos los tests pasan y que todos los módulos del Almacén cargan correctamente con Supabase. Consultar al usuario si surgen dudas.

## Notas

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Cada tarea referencia los requisitos específicos para trazabilidad
- Los property tests usan **fast-check** ejecutado con Vitest o Jest
- Los tests de propiedad deben incluir el tag `// Feature: almacen-supabase, Property N: <texto>` como se define en el diseño
- El orden de carga de scripts en cada HTML es: `supabase-config.js` → `almacen-db.js` → `modulo.js`
