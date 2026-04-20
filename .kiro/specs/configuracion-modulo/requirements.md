# Requirements Document

## Introduction

El módulo de Configuración de MiRest con IA es el centro de control del sistema. Permite al Super Admin y Admin personalizar el comportamiento del asistente DallIA, gestionar alertas y notificaciones, activar o desactivar módulos del sistema, configurar horarios de operación del restaurante, guiar a nuevos usuarios con un tour interactivo, administrar roles y usuarios, y mantener la información general del restaurante. Todos los datos se persisten en `localStorage` bajo la clave `mirest_config`. El módulo se integra al shell visual del proyecto (sidebar + topbar) usando `data-module-key="configuracion"` y respeta el Design System existente con naranja `#f07c2a` como color de acento.

---

## Glossary

- **Config_Module**: El módulo de Configuración de MiRest con IA, accesible desde el sidebar con `data-module-key="configuracion"`.
- **Config_Store**: El objeto JSON persistido en `localStorage` bajo la clave `mirest_config` que contiene toda la configuración del sistema.
- **DallIA**: El asistente de inteligencia artificial integrado en MiRest con IA, personalizable en nombre, trato y personalidad.
- **DallIA_Config**: La sección del Config_Store que almacena la personalización del asistente DallIA: nombre, trato, personalidad y capacidades activadas.
- **Alert_Channel**: Un canal de notificación configurado en el sistema: Urgente, Operaciones, Sugerencias_IA, Reportes, SUNAT_Fiscal o Personal.
- **DND_Mode**: Modo No Molestar (Do Not Disturb) que suprime notificaciones durante un rango horario configurado.
- **Module_Registry**: La sección del Config_Store que almacena el estado activo/inactivo de cada módulo del sistema por categoría.
- **Operation_Schedule**: La configuración de horarios de apertura y cierre del restaurante por día de la semana, incluyendo días marcados como cerrado.
- **System_Tour**: El onboarding interactivo que guía al usuario por los pasos principales del sistema, con seguimiento de progreso.
- **Role**: Un perfil de permisos predefinido en el sistema: Super_Admin, Admin, Gerente, Cajero, Cocinero, Mesero o Almacenero.
- **User_Record**: Un registro de usuario con nombre, email, rol asignado, estado activo/inactivo y PIN de acceso de 4 dígitos.
- **Restaurant_Info**: La sección del Config_Store que almacena nombre, dirección, RUC, logo (base64), moneda y zona horaria del restaurante.
- **Config_UI**: La interfaz de usuario del Config_Module, construida con el Design System de MiRest (tokens CSS, componentes compartidos, paleta naranja `#f07c2a`).
- **Super_Admin**: Rol con acceso total al sistema, incluyendo creación y eliminación de admins, reportes financieros y configuración del sistema.
- **Admin**: Rol con gestión completa del restaurante, sin acceso a la sección de Configuración del sistema.
- **Gerente**: Rol con acceso a reportes, caja y almacén, sin acceso a configuración.
- **Cajero**: Rol con acceso exclusivo al módulo Caja.
- **Cocinero**: Rol con acceso exclusivo al módulo Cocina.
- **Mesero**: Rol con acceso exclusivo al módulo Pedidos y Mesas.
- **Almacenero**: Rol con acceso exclusivo al módulo Almacén.

---

## Requirements

### Requirement 1: Estructura del módulo y persistencia de datos

**User Story:** Como administrador del sistema, quiero que el módulo de Configuración se integre al shell visual de MiRest y persista todos los cambios en localStorage, para que la configuración sobreviva entre sesiones sin necesidad de un backend.

#### Acceptance Criteria

1. THE Config_Module SHALL renderizarse dentro del shell visual del proyecto usando `data-module-key="configuracion"`, respetando el sidebar y topbar existentes.
2. THE Config_Module SHALL cargar los estilos globales del Design System (`tokens.css`, `base.css`, `layout.css`, `components.css`) sin duplicar reglas de estilo.
3. THE Config_Module SHALL usar `#f07c2a` como color de acento para botones primarios, indicadores activos y elementos destacados, consumiendo el token CSS `--color-accent` del Design System.
4. WHEN el usuario guarda cualquier cambio en el Config_Module, THE Config_Store SHALL serializar el estado completo como JSON y persistirlo en `localStorage` bajo la clave `mirest_config`.
5. WHEN el Config_Module carga, THE Config_Store SHALL leer `localStorage.getItem('mirest_config')` y, si existe, hidratar todos los formularios y controles con los valores almacenados.
6. IF `localStorage.getItem('mirest_config')` retorna `null`, THEN THE Config_Store SHALL inicializar el Config_Store con valores por defecto definidos en el código y persistirlos inmediatamente.
7. THE Config_Module SHALL organizar su contenido en secciones navegables: Personalizar DallIA, Alertas y Notificaciones, Módulos del Sistema, Horarios de Operación, Tour del Sistema, Roles y Usuarios, e Información del Restaurante.
8. WHEN el usuario navega entre secciones del Config_Module, THE Config_UI SHALL mostrar la sección activa sin recargar la página, usando navegación por pestañas o menú lateral interno.

---

### Requirement 2: Personalización de DallIA

**User Story:** Como administrador, quiero personalizar el nombre, trato y personalidad del asistente DallIA, y activar o desactivar sus capacidades, para adaptar el asistente al estilo de mi restaurante.

#### Acceptance Criteria

1. THE Config_UI SHALL mostrar un campo de texto para configurar el nombre del asistente DallIA, con valor por defecto `"DallIA"`.
2. THE Config_UI SHALL mostrar un selector de trato con las opciones `"Tú"` y `"Usted"`, con valor por defecto `"Tú"`.
3. THE Config_UI SHALL mostrar un selector de personalidad con las opciones `"Profesional"`, `"Amigable"` y `"Directo"`, con valor por defecto `"Amigable"`.
4. THE Config_UI SHALL mostrar cuatro toggles de capacidades: `"Chat"`, `"Comandos de voz"`, `"Alertas proactivas"` y `"Pregunta diaria de mejora"`, todos activados por defecto.
5. WHEN el usuario modifica cualquier campo de la sección DallIA y guarda, THE Config_Store SHALL actualizar la propiedad `dallIA` del Config_Store con los nuevos valores.
6. WHEN el nombre del asistente es actualizado en el Config_Store, THE Config_UI SHALL reflejar el nuevo nombre en el botón `assistant-pill` del topbar sin recargar la página.
7. IF el campo de nombre del asistente está vacío al guardar, THEN THE Config_UI SHALL mostrar un mensaje de validación indicando que el nombre es requerido y no persistir el cambio.
8. THE Config_UI SHALL mostrar una vista previa del asistente con el nombre, trato y personalidad configurados antes de guardar.

---

### Requirement 3: Alertas y Notificaciones

**User Story:** Como administrador, quiero configurar qué canales de notificación están activos y definir un horario de No Molestar, para controlar cuándo y cómo el sistema me envía alertas.

#### Acceptance Criteria

1. THE Config_UI SHALL mostrar seis toggles de canales de notificación: `"Urgente"`, `"Operaciones"`, `"Sugerencias IA"`, `"Reportes"`, `"SUNAT/Fiscal"` y `"Personal"`.
2. THE Config_UI SHALL mostrar el canal `"Urgente"` activado por defecto y no permitir desactivarlo mientras los demás canales estén desactivados.
3. THE Config_UI SHALL mostrar un toggle para activar el DND_Mode con etiqueta `"Modo No Molestar"`, desactivado por defecto.
4. WHEN el DND_Mode está activado, THE Config_UI SHALL mostrar dos campos de hora (`"Desde"` y `"Hasta"`) para definir el rango horario de silencio, con valores por defecto `"22:00"` y `"08:00"`.
5. WHILE el DND_Mode está activado, THE Config_UI SHALL mostrar un indicador visual que señale que las notificaciones están silenciadas fuera del canal Urgente.
6. WHEN el usuario guarda la configuración de alertas, THE Config_Store SHALL actualizar la propiedad `alertas` del Config_Store con el estado de cada canal y la configuración del DND_Mode.
7. IF el DND_Mode está activado y el campo `"Desde"` o `"Hasta"` está vacío al guardar, THEN THE Config_UI SHALL mostrar un mensaje de validación indicando que ambos horarios son requeridos.

---

### Requirement 4: Módulos del Sistema

**User Story:** Como Super Admin, quiero activar o desactivar módulos del sistema por categoría, para que el restaurante solo vea las funcionalidades que necesita.

#### Acceptance Criteria

1. THE Config_UI SHALL mostrar los módulos agrupados en cuatro categorías: `"Operaciones"`, `"Gestión"`, `"Administración"` e `"Integraciones"` y `"Sistema"`.
2. THE Config_UI SHALL mostrar en la categoría `"Operaciones"` los módulos: `"Pedidos y Mesas"`, `"Cocina KDS"`, `"Para Llevar"`, `"Delivery"`, `"Descuentos y Promos"` y `"Cortesías"`.
3. THE Config_UI SHALL mostrar en la categoría `"Gestión"` los módulos: `"Productos/Carta"`, `"Almacén e Inventario"`, `"Recetas y Costos"` y `"Clientes y Fidelidad"`.
4. THE Config_UI SHALL mostrar en la categoría `"Administración"` los módulos: `"Administración General"`, `"Facturación SUNAT"`, `"SUNAT/IGV"` y `"Reportes"`.
5. THE Config_UI SHALL mostrar en la categoría `"Integraciones"` los módulos: `"WhatsApp Business"`, `"Impresora/Ticket"`, `"Acceso a Audio/Voz IA"`, `"Acceso a Fotos/Cámara"`, `"PedidosYa/Rappi"` y `"Pagos Yape/Plin/POS"`.
6. THE Config_UI SHALL mostrar en la categoría `"Sistema"` los módulos: `"Usuarios"`, `"Configuración"` y `"Soporte"`.
7. WHEN el usuario activa o desactiva un módulo, THE Config_Store SHALL actualizar la propiedad `modulos` del Config_Store con el nuevo estado del módulo afectado.
8. THE Config_UI SHALL mostrar el módulo `"Configuración"` dentro de la categoría Sistema siempre activado y sin toggle, ya que es el módulo actual en uso.
9. IF el usuario intenta desactivar el módulo `"Pedidos y Mesas"` mientras `"Cocina KDS"` está activo, THEN THE Config_UI SHALL mostrar una advertencia indicando la dependencia entre módulos antes de confirmar el cambio.
10. WHEN el usuario guarda los cambios de módulos, THE Config_Store SHALL persistir el estado completo del Module_Registry en el Config_Store.

---

### Requirement 5: Horarios de Operación

**User Story:** Como administrador, quiero configurar los horarios de apertura y cierre del restaurante por día de la semana, para que el sistema conozca cuándo está operativo.

#### Acceptance Criteria

1. THE Config_UI SHALL mostrar una fila por cada día de la semana: Lunes, Martes, Miércoles, Jueves, Viernes, Sábado y Domingo.
2. THE Config_UI SHALL mostrar en cada fila un toggle `"Cerrado"`, un campo de hora `"Apertura"` y un campo de hora `"Cierre"`.
3. WHEN el toggle `"Cerrado"` de un día está activado, THE Config_UI SHALL deshabilitar y ocultar los campos de hora de ese día y mostrar la etiqueta `"Cerrado"`.
4. THE Config_UI SHALL inicializar los días Lunes a Viernes con apertura `"08:00"` y cierre `"22:00"`, y los días Sábado y Domingo con el toggle `"Cerrado"` activado.
5. WHEN el usuario guarda los horarios, THE Config_Store SHALL actualizar la propiedad `horarios` del Config_Store con el estado de cada día.
6. IF el campo `"Cierre"` de un día tiene una hora anterior o igual al campo `"Apertura"` del mismo día, THEN THE Config_UI SHALL mostrar un mensaje de validación indicando que el cierre debe ser posterior a la apertura.
7. THE Config_UI SHALL mostrar un resumen visual de los días activos y sus horarios después de guardar.

---

### Requirement 6: Tour del Sistema

**User Story:** Como nuevo usuario, quiero seguir un tour interactivo del sistema, para aprender a usar las funcionalidades principales de MiRest con IA de forma guiada.

#### Acceptance Criteria

1. THE Config_UI SHALL mostrar una lista de pasos del tour: `"Dashboard y KPIs"`, `"Mesas y Pedidos"`, `"Chat con DallIA"`, `"Módulo Cocina"`, `"Módulo Caja"`, `"Módulo Almacén"` y `"Configuración del Sistema"`.
2. THE Config_UI SHALL mostrar el estado de cada paso del tour: `"Completado"`, `"En progreso"` o `"Pendiente"`.
3. THE Config_UI SHALL mostrar una barra de progreso que indique el porcentaje de pasos completados del total.
4. WHEN el usuario hace clic en un paso del tour, THE Config_UI SHALL navegar al módulo correspondiente o mostrar una descripción del paso con un botón `"Ir al módulo"`.
5. WHEN el usuario completa un paso del tour, THE Config_Store SHALL actualizar el estado del paso a `"Completado"` en la propiedad `tour` del Config_Store.
6. WHEN todos los pasos del tour están completados, THE Config_UI SHALL mostrar un mensaje de felicitación y marcar el tour como finalizado en el Config_Store.
7. THE Config_UI SHALL mostrar un botón `"Reiniciar Tour"` que restablezca todos los pasos a `"Pendiente"` en el Config_Store.
8. WHEN el Config_Module carga por primera vez (Config_Store vacío), THE Config_UI SHALL mostrar el tour como primer elemento destacado con una invitación a comenzar el onboarding.

---

### Requirement 7: Roles y Usuarios

**User Story:** Como Super Admin, quiero gestionar los usuarios del sistema asignándoles roles con permisos predefinidos y un PIN de acceso, para controlar quién puede acceder a cada módulo.

#### Acceptance Criteria

1. THE Config_UI SHALL mostrar una tabla de usuarios con columnas: `"Nombre"`, `"Email"`, `"Rol"`, `"Estado"` y `"Acciones"`.
2. THE Config_UI SHALL mostrar un formulario para crear un nuevo User_Record con campos: nombre (texto), email (texto), rol (selector), estado activo/inactivo (toggle) y PIN de 4 dígitos (numérico).
3. THE Config_UI SHALL mostrar en el selector de rol las opciones: `"Super Admin"`, `"Admin"`, `"Gerente"`, `"Cajero"`, `"Cocinero"`, `"Mesero"` y `"Almacenero"`.
4. WHEN el usuario guarda un nuevo User_Record, THE Config_Store SHALL agregar el registro al array `usuarios` del Config_Store con un `id` único generado en el cliente.
5. WHEN el usuario edita un User_Record existente, THE Config_Store SHALL actualizar el registro correspondiente en el array `usuarios` del Config_Store usando el `id` como clave.
6. WHEN el usuario elimina un User_Record, THE Config_UI SHALL mostrar un diálogo de confirmación antes de proceder, y THE Config_Store SHALL remover el registro del array `usuarios` del Config_Store.
7. IF el email de un nuevo User_Record ya existe en el array `usuarios` del Config_Store, THEN THE Config_UI SHALL mostrar un mensaje de validación indicando que el email ya está registrado y no persistir el duplicado.
8. IF el PIN ingresado no tiene exactamente 4 dígitos numéricos, THEN THE Config_UI SHALL mostrar un mensaje de validación indicando el formato requerido.
9. THE Config_UI SHALL mostrar una sección de descripción de permisos por rol que explique qué módulos puede acceder cada Role.
10. THE Config_UI SHALL mostrar los permisos del rol `"Super Admin"` como: acceso total, creación y eliminación de admins, reportes financieros y configuración del sistema.
11. THE Config_UI SHALL mostrar los permisos del rol `"Admin"` como: gestión completa del restaurante, sin acceso a configuración del sistema.
12. THE Config_UI SHALL mostrar los permisos del rol `"Gerente"` como: acceso a reportes, caja y almacén, sin configuración.
13. THE Config_UI SHALL mostrar los permisos de los roles operativos (`"Cajero"`, `"Cocinero"`, `"Mesero"`, `"Almacenero"`) como acceso exclusivo a su módulo correspondiente.
14. WHEN el Config_Module carga, THE Config_Store SHALL inicializar el array `usuarios` con un User_Record de Super_Admin por defecto si el array está vacío.

---

### Requirement 8: Información del Restaurante

**User Story:** Como administrador, quiero registrar los datos generales del restaurante como nombre, RUC y logo, para que el sistema los use en comprobantes, reportes y la interfaz.

#### Acceptance Criteria

1. THE Config_UI SHALL mostrar un formulario con los campos: nombre del restaurante (texto), dirección (texto), RUC (texto, 11 dígitos), moneda (selector) y zona horaria (selector).
2. THE Config_UI SHALL mostrar en el selector de moneda las opciones `"PEN - Sol peruano"` y `"USD - Dólar"`, con `"PEN - Sol peruano"` como valor por defecto.
3. THE Config_UI SHALL mostrar en el selector de zona horaria las opciones de zonas horarias de América Latina, con `"America/Lima"` como valor por defecto.
4. THE Config_UI SHALL mostrar un control de carga de imagen para el logo del restaurante que acepte archivos `image/png` e `image/jpeg` con tamaño máximo de 2 MB.
5. WHEN el usuario selecciona una imagen de logo, THE Config_UI SHALL mostrar una vista previa de la imagen antes de guardar.
6. WHEN el usuario guarda la información del restaurante, THE Config_Store SHALL convertir la imagen del logo a base64 y almacenarla en la propiedad `restaurante.logo` del Config_Store.
7. WHEN el usuario guarda la información del restaurante, THE Config_Store SHALL actualizar la propiedad `restaurante` del Config_Store con todos los campos del formulario.
8. IF el campo RUC no contiene exactamente 11 dígitos numéricos, THEN THE Config_UI SHALL mostrar un mensaje de validación indicando el formato requerido y no persistir el cambio.
9. IF el archivo de logo supera los 2 MB, THEN THE Config_UI SHALL mostrar un mensaje de error indicando el límite de tamaño y no procesar la imagen.
10. WHEN el Config_Module carga, THE Config_UI SHALL mostrar el nombre del restaurante almacenado en el Config_Store en el topbar del módulo como subtítulo contextual.
