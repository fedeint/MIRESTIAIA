# Requirements Document

## Introduction

Migración del módulo Almacén de MiRest de localStorage a Supabase como fuente de verdad central. El sistema actualmente persiste todos los datos de inventario, entradas, salidas y proveedores en el localStorage del navegador, lo que impide la sincronización entre dispositivos, limita la capacidad de datos y no permite que otros módulos (Caja, Pedidos, Cocina, Delivery, Recetas, Clientes) lean el inventario en tiempo real desde una fuente compartida. La migración establece Supabase como backend central, manteniendo la interfaz vanilla HTML/CSS/JS existente y usando la Supabase REST API directamente desde el cliente.

## Glossary

- **Almacen_Module**: El conjunto de submódulos de gestión de almacén: Inventario, Entradas, Salidas, Qué Comprar, Proveedores e Historial.
- **Supabase_Client**: La capa de acceso a datos que realiza llamadas HTTP a la Supabase REST API usando la anon key configurada.
- **Inventario**: Tabla `insumos` en Supabase que almacena el catálogo de insumos con stock actual, stock mínimo, costo unitario y metadatos.
- **Entradas**: Tabla `entradas_insumos` en Supabase que registra cada movimiento de ingreso de insumos al almacén.
- **Salidas**: Tabla `salidas_insumos` en Supabase que registra cada movimiento de egreso de insumos del almacén.
- **Proveedores**: Tabla `proveedores` en Supabase que almacena el catálogo de proveedores con sus datos de contacto y clasificación.
- **Dependent_Module**: Cualquier módulo del sistema (Caja, Pedidos, Cocina, Delivery, Recetas, Clientes) que necesita leer datos del Inventario.
- **Stock_Estado**: Clasificación del nivel de stock de un insumo: `ok` (stock > 2× mínimo), `bajo` (mínimo < stock ≤ 2× mínimo), `critico` (stock ≤ mínimo o stock = 0).
- **Supabase_Config**: Archivo de configuración `Almacen/supabase-config.js` que expone `window.ALMACEN_SUPABASE` con `url` y `anonKey`.
- **Migration_Script**: Script SQL ejecutable en el SQL Editor de Supabase que crea las tablas, índices, políticas RLS y datos iniciales.
- **Seed_Data**: Los 39 insumos del dataset base definidos en `inventario.js` que deben insertarse en la tabla `insumos` durante la migración inicial.

---

## Requirements

### Requirement 1: Configuración de Supabase y esquema de base de datos

**User Story:** Como desarrollador, quiero tener las tablas necesarias en Supabase y un archivo de configuración centralizado, para que todos los módulos del Almacén puedan conectarse a la misma fuente de datos.

#### Acceptance Criteria

1. THE Migration_Script SHALL crear la tabla `insumos` con columnas: `id` (uuid, PK), `codigo` (text, unique), `nombre` (text), `categoria` (text), `ubicacion` (text), `stock_actual` (numeric), `unidad` (text), `stock_minimo` (numeric), `costo_unitario` (numeric), `ultimo_ingreso` (text), `proveedor` (text), `created_at` (timestamptz), `updated_at` (timestamptz).
2. THE Migration_Script SHALL crear la tabla `entradas_insumos` con columnas: `id` (text, PK), `fecha` (text), `hora` (text), `comprobante` (text), `usuario` (text), `notas` (text), `tipo` (text), `referencia_id` (text), `costo_total_movimiento` (numeric), `ingredientes` (jsonb), `archivos` (jsonb), `created_at` (timestamptz).
3. THE Migration_Script SHALL crear la tabla `salidas_insumos` con columnas: `id` (text, PK), `fecha` (text), `hora` (text), `motivo` (text), `justificacion` (text), `comprobante` (text), `usuario` (text), `notas` (text), `tipo` (text), `referencia_id` (text), `costo_total_movimiento` (numeric), `ingredientes` (jsonb), `archivos` (jsonb), `created_at` (timestamptz).
4. THE Migration_Script SHALL crear la tabla `proveedores` con columnas: `id` (bigint, PK), `nombre` (text), `ruc` (text), `telefono` (text), `categoria` (jsonb), `ubicacion` (text), `dias_credito` (integer), `ultimo_ingreso` (text), `estado` (text), `distancia_km` (numeric), `created_at` (timestamptz), `updated_at` (timestamptz).
5. THE Migration_Script SHALL habilitar Row Level Security (RLS) en todas las tablas y crear políticas que permitan acceso público de lectura y escritura usando la anon key.
6. THE Migration_Script SHALL insertar los 39 insumos del Seed_Data en la tabla `insumos` como datos iniciales.
7. THE Supabase_Config SHALL exponer `window.ALMACEN_SUPABASE` con las propiedades `url` y `anonKey` para ser consumido por todos los submódulos del Almacen_Module.
8. WHEN el archivo Supabase_Config no está cargado, THE Almacen_Module SHALL mostrar un mensaje de error indicando que la configuración de Supabase no está disponible y detener la inicialización.

---

### Requirement 2: Migración del módulo Inventario

**User Story:** Como encargado de almacén, quiero que el inventario de insumos se lea y actualice desde Supabase, para que los cambios sean persistentes entre sesiones y dispositivos.

#### Acceptance Criteria

1. WHEN la página de Inventario carga, THE Supabase_Client SHALL obtener todos los registros de la tabla `insumos` mediante una petición GET a la Supabase REST API y renderizarlos en la tabla.
2. WHEN la petición a Supabase falla, THE Inventario SHALL mostrar un mensaje de error visible al usuario y registrar el error en la consola del navegador.
3. THE Inventario SHALL calcular el Stock_Estado de cada insumo en el cliente usando los valores `stock_actual` y `stock_minimo` retornados por Supabase, sin almacenar el estado calculado en la base de datos.
4. WHEN el módulo Entradas registra una nueva entrada, THE Supabase_Client SHALL actualizar el campo `stock_actual` del insumo correspondiente en la tabla `insumos` mediante una petición PATCH a la Supabase REST API.
5. WHEN el módulo Salidas registra una nueva salida, THE Supabase_Client SHALL decrementar el campo `stock_actual` del insumo correspondiente en la tabla `insumos` mediante una petición PATCH a la Supabase REST API.
6. THE Inventario SHALL eliminar toda referencia a `localStorage.getItem('inventario_mirest')` y `localStorage.setItem('inventario_mirest', ...)` reemplazándolas por llamadas al Supabase_Client.
7. WHEN un Dependent_Module necesita leer el inventario, THE Supabase_Client SHALL proveer una función `getInventario()` exportable que retorne los insumos desde Supabase como un array de objetos con la misma estructura que usaba localStorage.

---

### Requirement 3: Migración del módulo Entradas de Insumos

**User Story:** Como encargado de almacén, quiero que cada entrada de insumos se registre en Supabase, para tener un historial centralizado y actualizar el stock en tiempo real.

#### Acceptance Criteria

1. WHEN el usuario envía el formulario de entrada, THE Supabase_Client SHALL insertar un nuevo registro en la tabla `entradas_insumos` con todos los campos del movimiento mediante una petición POST a la Supabase REST API.
2. WHEN la inserción en `entradas_insumos` es exitosa, THE Supabase_Client SHALL actualizar el `stock_actual` de cada insumo involucrado en la tabla `insumos` sumando la cantidad ingresada.
3. WHEN la actualización de stock falla después de insertar la entrada, THE Almacen_Module SHALL mostrar un mensaje de advertencia al usuario indicando que el historial fue guardado pero el stock no se actualizó.
4. WHEN la página de Entradas carga, THE Supabase_Client SHALL obtener los registros de `entradas_insumos` ordenados por `created_at` descendente y renderizarlos en la tabla de historial.
5. WHEN la página de Entradas carga, THE Supabase_Client SHALL obtener los insumos desde la tabla `insumos` para poblar el selector de ingredientes del formulario.
6. WHEN la página de Entradas carga, THE Supabase_Client SHALL obtener los proveedores desde la tabla `proveedores` para poblar los selectores de proveedor del formulario.
7. THE Entradas SHALL eliminar toda referencia a `localStorage.getItem('inventario_mirest_historial')` y `localStorage.setItem('inventario_mirest_historial', ...)` reemplazándolas por llamadas al Supabase_Client.
8. IF la petición POST a `entradas_insumos` falla, THEN THE Almacen_Module SHALL mostrar un mensaje de error al usuario y no actualizar el stock.

---

### Requirement 4: Migración del módulo Salidas de Insumos

**User Story:** Como encargado de almacén, quiero que cada salida de insumos se registre en Supabase y descuente el stock automáticamente, para mantener el inventario actualizado.

#### Acceptance Criteria

1. WHEN el usuario envía el formulario de salida, THE Supabase_Client SHALL insertar un nuevo registro en la tabla `salidas_insumos` mediante una petición POST a la Supabase REST API.
2. WHEN la inserción en `salidas_insumos` es exitosa, THE Supabase_Client SHALL actualizar el `stock_actual` de cada insumo involucrado en la tabla `insumos` restando la cantidad egresada.
3. WHEN la página de Salidas carga, THE Supabase_Client SHALL obtener los registros de `salidas_insumos` ordenados por `created_at` descendente y renderizarlos en la tabla de historial.
4. WHEN el usuario intenta registrar una salida con cantidad mayor al `stock_actual` del insumo en Supabase, THE Almacen_Module SHALL mostrar un mensaje de error indicando stock insuficiente y no registrar la salida.
5. THE Salidas SHALL eliminar toda referencia a `localStorage.getItem('inventario_mirest_salidas')` y `localStorage.setItem('inventario_mirest_salidas', ...)` reemplazándolas por llamadas al Supabase_Client.
6. IF la petición POST a `salidas_insumos` falla, THEN THE Almacen_Module SHALL mostrar un mensaje de error al usuario y no actualizar el stock.

---

### Requirement 5: Migración del módulo Proveedores

**User Story:** Como encargado de almacén, quiero que el catálogo de proveedores se gestione en Supabase, para que los demás módulos puedan consultar proveedores actualizados.

#### Acceptance Criteria

1. WHEN la página de Proveedores carga, THE Supabase_Client SHALL obtener todos los registros de la tabla `proveedores` mediante una petición GET y renderizarlos en la tabla.
2. WHEN el usuario guarda un nuevo proveedor, THE Supabase_Client SHALL insertar el registro en la tabla `proveedores` mediante una petición POST a la Supabase REST API.
3. WHEN el usuario edita un proveedor existente, THE Supabase_Client SHALL actualizar el registro en la tabla `proveedores` mediante una petición PATCH a la Supabase REST API usando el `id` como filtro.
4. WHEN el usuario cambia el estado de un proveedor, THE Supabase_Client SHALL actualizar el campo `estado` del registro en la tabla `proveedores` mediante una petición PATCH.
5. WHEN la página de Proveedores carga, THE Supabase_Client SHALL obtener las categorías únicas desde la tabla `insumos` para poblar el selector de categorías del formulario de proveedor.
6. THE Proveedores SHALL eliminar toda referencia a `localStorage.getItem('inventario_mirest_proveedores')` y `localStorage.setItem('inventario_mirest_proveedores', ...)` reemplazándolas por llamadas al Supabase_Client.

---

### Requirement 6: Migración del módulo Qué Comprar

**User Story:** Como encargado de almacén, quiero que el módulo Qué Comprar lea el inventario desde Supabase, para mostrar siempre los insumos con stock bajo o crítico en tiempo real.

#### Acceptance Criteria

1. WHEN la página de Qué Comprar carga, THE Supabase_Client SHALL obtener todos los insumos desde la tabla `insumos` y filtrar en el cliente aquellos cuyo `stock_actual` sea menor o igual a `stock_minimo`.
2. THE Que_Comprar SHALL calcular la cantidad sugerida de compra como `MAX(0, (stock_minimo × 2) - stock_actual)` usando los datos retornados por Supabase.
3. THE Que_Comprar SHALL eliminar toda referencia a `localStorage.getItem('inventario_mirest')` reemplazándola por una llamada al Supabase_Client.
4. WHEN la petición a Supabase falla, THE Que_Comprar SHALL mostrar un mensaje de error al usuario.

---

### Requirement 7: Migración del módulo Historial

**User Story:** Como encargado de almacén, quiero que el historial de movimientos lea desde Supabase, para consultar entradas y salidas de forma centralizada y con datos siempre actualizados.

#### Acceptance Criteria

1. WHEN el usuario selecciona el módulo "Entrada" en el filtro, THE Supabase_Client SHALL obtener los registros de la tabla `entradas_insumos` y renderizarlos en la tabla de historial.
2. WHEN el usuario selecciona el módulo "Salida" en el filtro, THE Supabase_Client SHALL obtener los registros de la tabla `salidas_insumos` y renderizarlos en la tabla de historial.
3. WHEN el usuario selecciona el módulo "Qué Comprar" en el filtro, THE Supabase_Client SHALL obtener los insumos con stock bajo o crítico desde la tabla `insumos` y renderizarlos.
4. WHEN el usuario aplica filtros de fecha, THE Supabase_Client SHALL filtrar los registros en el cliente usando los campos `fecha` de los registros retornados por Supabase.
5. THE Historial SHALL eliminar toda referencia a `localStorage.getItem('inventario_mirest_historial')`, `localStorage.getItem('inventario_mirest_salidas')` y `localStorage.getItem('inventario_mirest')` reemplazándolas por llamadas al Supabase_Client.

---

### Requirement 8: Compatibilidad con módulos dependientes

**User Story:** Como desarrollador del sistema, quiero que los módulos Caja, Pedidos, Cocina, Delivery, Recetas y Clientes puedan leer el inventario desde Supabase, para que el sistema completo opere con una única fuente de verdad.

#### Acceptance Criteria

1. THE Supabase_Client SHALL exponer una función global `window.getInventarioSupabase()` que retorne una Promise con el array de insumos desde Supabase, con la misma estructura de campos que usaba `localStorage.getItem('inventario_mirest')`.
2. WHEN un Dependent_Module llama a `window.getInventarioSupabase()`, THE Supabase_Client SHALL retornar los datos en menos de 3 segundos bajo condiciones normales de red.
3. WHERE un Dependent_Module aún usa `localStorage.getItem('inventario_mirest')`, THE Almacen_Module SHALL mantener una copia de sincronización en localStorage actualizada después de cada operación de escritura en Supabase, como mecanismo de compatibilidad temporal.
4. WHEN el Almacen_Module no ha sido configurado con credenciales válidas de Supabase, THE Dependent_Module SHALL mostrar un mensaje indicando que el módulo Almacén no está disponible y deshabilitar las funciones que requieren inventario.

---

### Requirement 9: Manejo de errores y resiliencia

**User Story:** Como usuario del sistema, quiero que los errores de conexión con Supabase sean manejados de forma clara, para saber cuándo el sistema no puede operar y qué acción tomar.

#### Acceptance Criteria

1. WHEN cualquier petición al Supabase REST API retorna un código HTTP 4xx o 5xx, THE Supabase_Client SHALL registrar el error en `console.error` con el endpoint, el código de respuesta y el mensaje de error.
2. WHEN cualquier petición al Supabase REST API retorna un código HTTP 4xx o 5xx, THE Almacen_Module SHALL mostrar una notificación de error visible al usuario con un mensaje descriptivo en español.
3. WHEN la conexión a Supabase no está disponible al cargar un módulo, THE Almacen_Module SHALL mostrar un estado de carga con indicador visual mientras reintenta la conexión.
4. IF una operación de escritura (POST o PATCH) falla, THEN THE Almacen_Module SHALL no modificar el estado local de la UI y mantener los datos previos visibles.
5. THE Supabase_Client SHALL incluir el header `apikey` y `Authorization: Bearer <anonKey>` en todas las peticiones HTTP a la Supabase REST API.
