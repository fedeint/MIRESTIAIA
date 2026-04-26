# 📘 Documentación del Design System — MiRest con IA

**Versión:** 1.0  
**Fecha:** 2026-04-04  
**Fuente tipográfica:** Inter (Google Fonts)  
**Grid base:** 8px

---

## 1. Introducción

El Design System de MiRest se fundamenta en **4 pilares**:

| Pilar | Descripción |
|-------|-------------|
| **Claridad operativa** | Lectura rápida en contextos reales (caja, cocina, delivery) |
| **Consistencia** | Mismos componentes y tokens en todos los módulos |
| **Minimalismo funcional** | Eliminar ruido visual innecesario |
| **Jerarquía visual fuerte** | Lo importante destaca sin esfuerzo |

**Regla global:** máximo 2 colores fuertes por pantalla. Naranja = acción, Azul oscuro = control/información.

---

## 2. Tokens de Diseño

### 2.1 Paleta de Colores

#### Colores principales

| Nombre | HEX | HSL | Uso |
|--------|-----|-----|-----|
| Naranja claro | `#F6A456` | `hsl(30, 90%, 65%)` | Hover, highlights, gradiente secundario |
| Naranja fuerte | `#DE5A25` | `hsl(16, 74%, 51%)` | Botón primario, CTA, gradiente principal |
| Azul oscuro | `#15192C` | `hsl(228, 33%, 13%)` | Texto principal, sidebar, contraste |

#### Neutros

| Nombre | HEX | HSL | Uso |
|--------|-----|-----|-----|
| Fondo principal | `#F8F9FB` | `hsl(220, 27%, 98%)` | Background general del app |
| Fondo secundario | `#FFFFFF` | `hsl(0, 0%, 100%)` | Cards, modales, superficies elevadas |
| Bordes | `#E5E7EB` | `hsl(220, 13%, 91%)` | Bordes de inputs, cards, separadores |
| Texto secundario | `#6B7280` | `hsl(220, 9%, 46%)` | Labels, hints, metadata |
| Texto terciario | `#9CA3AF` | `hsl(218, 11%, 65%)` | Placeholders, texto deshabilitado |

#### Estados semánticos

| Estado | HEX | HSL | Fondo suave | Uso |
|--------|-----|-----|-------------|-----|
| Éxito | `#22C55E` | `hsl(142, 71%, 45%)` | `#F0FDF4` | Confirmaciones, mesa libre |
| Error | `#EF4444` | `hsl(0, 84%, 60%)` | `#FEF2F2` | Errores, mesa ocupada, eliminación |
| Advertencia | `#F59E0B` | `hsl(38, 92%, 50%)` | `#FFFBEB` | Alertas, stock bajo |
| Info | `#3B82F6` | `hsl(217, 91%, 60%)` | `#EFF6FF` | Información, mesa reservada |

### 2.2 Sistema de Espaciado (Grid 8px)

| Token | Valor | Uso |
|-------|-------|-----|
| `space-1` | 4px | Gaps internos mínimos |
| `space-2` | 8px | Padding interno de badges/chips |
| `space-3` | 12px | Padding de inputs, gaps en cards |
| `space-4` | 16px | Padding de cards, separación de elementos |
| `space-5` | 20px | Padding de botones grandes |
| `space-6` | 24px | Separación entre secciones |
| `space-8` | 32px | Separación entre bloques mayores |
| `space-10` | 40px | Margen de contenedor principal |

### 2.3 Sombras

| Nombre | Valor CSS | Uso |
|--------|-----------|-----|
| `shadow-sm` | `0 1px 3px rgba(0,0,0,0.04)` | Inputs en focus |
| `shadow-card` | `0 4px 12px rgba(0,0,0,0.05)` | Cards estándar |
| `shadow-card-hover` | `0 8px 24px rgba(0,0,0,0.08)` | Cards en hover |
| `shadow-elevated` | `0 12px 32px rgba(0,0,0,0.1)` | Cards destacadas, modales |
| `shadow-dropdown` | `0 4px 16px rgba(0,0,0,0.12)` | Dropdowns, popovers |

### 2.4 Border Radius

| Token | Valor | Uso |
|-------|-------|-----|
| `radius-sm` | 8px | Badges pequeños, elementos internos |
| `radius-md` | 12px | Inputs, selects, textareas |
| `radius-lg` | 16px | Botones |
| `radius-xl` | 20px | Cards, modales |
| `radius-full` | 999px | Badges, chips, avatares |

---

## 3. Tipografía

### Fuente

**Inter** — sans-serif moderna, optimizada para interfaces y dashboards.  
Fallback: `system-ui, -apple-system, sans-serif`

### Escala tipográfica

| Nivel | Tamaño | Peso | Line-height | Uso |
|-------|--------|------|-------------|-----|
| H1 | 38px | Bold (700) | 1.2 | Títulos principales de página |
| H2 | 24px | SemiBold (600) | 1.3 | Títulos de sección |
| H3 | 18px | Medium (500) | 1.4 | Subtítulos, títulos de cards |
| Body | 16px | Regular (400) | 1.5 | Texto general, descripciones |
| Body large | 20px | Regular (400) | 1.5 | Texto destacado en dashboards |
| Label | 14px | Medium (500) | 1.4 | Labels de formularios, columnas de tabla |
| Caption | 12px | Regular (400) | 1.4 | Hints, timestamps, metadata |

### Reglas de uso

- Máximo **3 niveles tipográficos** visibles por pantalla
- Jerarquía por **peso** (no solo por tamaño)
- Alto contraste: texto principal en `#15192C`, secundario en `#6B7280`
- Placeholders en `#9CA3AF`
- Nunca usar fuentes serif en la interfaz

---

## 4. Botones

### Variantes

| Variante | Fondo | Texto | Borde |
|----------|-------|-------|-------|
| **Primario** | Gradiente `linear-gradient(135deg, #F6A456, #DE5A25)` | `#FFFFFF` | Ninguno |
| **Secundario** | `#F3F4F6` | `#15192C` | Ninguno |
| **Ghost** | Transparente | `#6B7280` | Ninguno |
| **Danger** | `#EF4444` | `#FFFFFF` | Ninguno |

### Tamaños

| Tamaño | Altura | Padding | Font-size |
|--------|--------|---------|-----------|
| Small (sm) | 36px | 8px 16px | 14px |
| Default | 44px | 12px 20px | 16px |
| Large (lg) | 52px | 16px 28px | 18px |

### Especificaciones comunes

```
border-radius: 16px
font-weight: 600 (SemiBold)
cursor: pointer
transition: all 0.2s ease
```

### Estados

| Estado | Efecto |
|--------|--------|
| **Hover** | Aumento leve de brillo (`filter: brightness(1.05)`) |
| **Active** | Escala reducida (`transform: scale(0.98)`) |
| **Disabled** | `opacity: 0.5`, `cursor: not-allowed`, `pointer-events: none` |
| **Focus** | Outline naranja `0 0 0 3px rgba(246,164,86,0.3)` |

### Icon Buttons

```
Tamaño: 36px × 36px
Border-radius: 12px
Icono: 20px
Fondo: transparente o #F3F4F6
Hover: fondo #F3F4F6 o sombra suave
```

---

## 5. Inputs / Formularios

### Campo de texto (Input)

```
height: 44px
padding: 12px 16px
border: 1px solid #E5E7EB
border-radius: 12px
font-size: 16px
color: #15192C
background: #FFFFFF
transition: all 0.2s ease
```

### Estados

| Estado | Estilos |
|--------|---------|
| **Default** | Borde `#E5E7EB` |
| **Hover** | Borde `#D1D5DB` |
| **Focus** | Borde `#F6A456`, box-shadow `0 0 0 3px rgba(246,164,86,0.15)` |
| **Error** | Borde `#EF4444`, box-shadow `0 0 0 3px rgba(239,68,68,0.15)` |
| **Disabled** | `opacity: 0.5`, `background: #F9FAFB` |

### Label

```
font-size: 14px
font-weight: 500
color: #15192C
margin-bottom: 6px
```

### Hint / Helper text

```
font-size: 12px
font-weight: 400
color: #6B7280
margin-top: 4px
```

### Mensaje de error

```
font-size: 12px
font-weight: 400
color: #EF4444
margin-top: 4px
```

### Select

Mismas especificaciones que Input, con:
```
Icono chevron: 16px, color #6B7280, posición derecha 12px
padding-right: 40px (espacio para el icono)
```

### Textarea

```
min-height: 100px
padding: 12px 16px
resize: vertical
/* Resto igual que Input */
```

---

## 6. Badges

### Especificaciones comunes

```
display: inline-flex
align-items: center
border-radius: 999px
padding: 4px 10px
font-size: 12px
font-weight: 600
line-height: 1
```

### Variantes

| Variante | Fondo | Texto | Ejemplo |
|----------|-------|-------|---------|
| **Success** | `#F0FDF4` | `#16A34A` | Activo, Disponible, Completado |
| **Error** | `#FEF2F2` | `#DC2626` | Inactivo, Cancelado, Sin stock |
| **Warning** | `#FFFBEB` | `#D97706` | Pendiente, Stock bajo |
| **Info** | `#EFF6FF` | `#2563EB` | En proceso, Reservado |
| **Neutral** | `#F3F4F6` | `#4B5563` | Borrador, Sin categoría |

### Uso

- Estados de entidades (productos, pedidos, mesas)
- Categorías y etiquetas
- Indicadores en tarjetas y tablas
- **Nunca** usar más de 2 badges por tarjeta
- **Nunca** saturar con colores fuertes; usar fondos suaves

---

## 7. Chips / Filtros

### Chip inactivo

```
padding: 6px 12px
border-radius: 999px
background: #F3F4F6
color: #6B7280
font-size: 14px
font-weight: 500
cursor: pointer
border: 1px solid transparent
transition: all 0.2s ease
```

### Chip activo

```
background: linear-gradient(135deg, #F6A456, #DE5A25)
color: #FFFFFF
border: 1px solid transparent
box-shadow: 0 2px 8px rgba(222, 90, 37, 0.25)
```

### Chip con cierre (removible)

```
padding-right: 8px
/* Botón de cierre: */
  width: 16px
  height: 16px
  border-radius: 50%
  background: rgba(0,0,0,0.15)
  icono: × (10px)
  margin-left: 6px
```

### Hover (inactivo)

```
background: #E5E7EB
color: #15192C
```

---

## 8. Tarjetas de Producto

### 8.1 Variante Estándar

```
width: 100% (grid responsive)
background: #FFFFFF
border-radius: 20px
padding: 0 (imagen edge-to-edge arriba)
box-shadow: 0 4px 12px rgba(0,0,0,0.05)
border: 1px solid #E5E7EB (opcional)
overflow: hidden
transition: all 0.3s ease
```

#### Estructura interna

```
┌─────────────────────────┐
│  [Imagen]               │  ← 100% ancho, 160px alto, object-fit: cover
│  [Badge] sobre imagen   │  ← Posición: top-right 8px, o bottom-left 8px
│  [Acciones] ⋮           │  ← Icon buttons, top-right 8px
├─────────────────────────┤
│  Título                 │  ← 16px, SemiBold, #15192C, 1 línea max
│  Categoría              │  ← 13px, Regular, #6B7280
│  ─────────────────────  │  ← Separador 1px #F3F4F6, margin 8px 0
│  $Precio                │  ← 18px, Bold, #DE5A25
│  [Badge estado]         │  ← Inline, debajo del precio
└─────────────────────────┘
Padding del contenido: 16px
Gap entre elementos: 8px
```

#### Imagen

```
width: 100%
height: 160px
object-fit: cover
border-radius: 16px 16px 0 0 (solo arriba, dentro del card)
```

#### Hover

```
transform: translateY(-2px)
box-shadow: 0 8px 24px rgba(0,0,0,0.08)
```

#### Acciones (icon buttons sobre imagen)

```
position: absolute
top: 8px, right: 8px
display: flex
gap: 4px
/* Cada botón: */
  width: 32px
  height: 32px
  border-radius: 8px
  background: rgba(255,255,255,0.9)
  backdrop-filter: blur(4px)
  icon: 16px, color #6B7280
  hover: background #FFFFFF, icon color #15192C
```

### 8.2 Variante Compacta

```
Diferencias vs estándar:
  - Sin imagen
  - padding: 12px
  - Título: 14px
  - Precio: 16px
  - Menor altura total
  - Ideal para listas densas
```

### 8.3 Variante Destacada

```
Diferencias vs estándar:
  - Imagen: 200px de alto
  - Sombra: 0 12px 32px rgba(0,0,0,0.1)
  - Borde: 2px solid #F6A456 (naranja sutil)
  - Badge especial "Destacado" con gradiente naranja
  - Título: 18px
  - Mayor presencia visual
```

---

## 9. Tarjetas de Estadísticas

```
background: #FFFFFF
border-radius: 20px
padding: 20px
box-shadow: 0 4px 12px rgba(0,0,0,0.05)
min-width: 200px
```

### Estructura interna

```
┌────────────────────────────┐
│  [Icono 40px]   Label      │  ← Icono en círculo coloreado + label 14px #6B7280
│                            │
│  $12,450                   │  ← Valor: 28px, Bold, #15192C
│  ▲ +12.5%                  │  ← Indicador: 13px, color según dirección
└────────────────────────────┘
```

### Indicadores de cambio

| Dirección | Color | Icono |
|-----------|-------|-------|
| Positivo | `#22C55E` | ▲ flecha arriba |
| Negativo | `#EF4444` | ▼ flecha abajo |
| Neutro | `#6B7280` | — sin flecha |

### Icono circular

```
width: 40px
height: 40px
border-radius: 12px
display: flex
align-items: center
justify-content: center
/* Color de fondo según contexto: */
  Ventas: #FEF3C7 (amarillo suave)
  Pedidos: #DBEAFE (azul suave)
  Clientes: #F3E8FF (morado suave)
  Productos: #D1FAE5 (verde suave)
```

---

## 10. Tablas

### Contenedor

```
width: 100%
border-radius: 16px
overflow: hidden
border: 1px solid #E5E7EB
background: #FFFFFF
```

### Header

```
background: #F8F9FB
position: sticky
top: 0
z-index: 10
```

### Celda de header

```
padding: 12px 16px
font-size: 14px
font-weight: 600
color: #6B7280
text-align: left
border-bottom: 2px solid #E5E7EB
text-transform: uppercase
letter-spacing: 0.05em
```

### Fila (row)

```
border-bottom: 1px solid #F3F4F6
transition: background 0.15s ease
```

### Celda de dato

```
padding: 12px 16px
font-size: 14px
font-weight: 400
color: #15192C
vertical-align: middle
```

### Estados de fila

| Estado | Efecto |
|--------|--------|
| **Hover** | `background: #F8F9FB` |
| **Seleccionada** | `background: #FFF7ED` (naranja muy suave) |
| **Alternancia** | Filas pares: `background: #FAFBFC` (opcional) |

### Acciones en tabla

```
Posición: última columna
Tipo: icon buttons (editar, eliminar, ver)
Tamaño icono: 18px
Gap entre acciones: 8px
Color: #6B7280
Hover: #15192C
```

---

## 11. Modales (Diálogos)

### Overlay

```
position: fixed
inset: 0
background: rgba(0, 0, 0, 0.5)
backdrop-filter: blur(4px)
z-index: 50
animation: fadeIn 0.2s ease
```

### Contenedor del modal

```
position: fixed
top: 50%
left: 50%
transform: translate(-50%, -50%)
background: #FFFFFF
border-radius: 20px
box-shadow: 0 24px 48px rgba(0,0,0,0.15)
max-width: 500px
width: 90%
max-height: 85vh
overflow-y: auto
z-index: 51
animation: scaleIn 0.2s ease
```

### Estructura

```
┌────────────────────────────┐
│  Header                    │  ← padding: 20px 24px, border-bottom: 1px #E5E7EB
│    Título (H3: 18px Bold)  │
│    Botón cerrar (×) 24px   │  ← top-right, color #6B7280
├────────────────────────────┤
│  Body                      │  ← padding: 24px
│    Contenido del modal     │
├────────────────────────────┤
│  Footer                    │  ← padding: 16px 24px, border-top: 1px #E5E7EB
│    [Cancelar] [Confirmar]  │  ← Botones alineados a la derecha, gap 12px
└────────────────────────────┘
```

### Animaciones

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
  to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}
```

---

## 12. Mesas (Módulo Mesas)

### Grid de mesas

```
display: grid
grid-template-columns: repeat(auto-fill, minmax(140px, 1fr))
gap: 16px
padding: 16px
```

### Tarjeta de mesa

```
width: 100%
aspect-ratio: 1 (cuadrada)
border-radius: 16px
display: flex
flex-direction: column
align-items: center
justify-content: center
gap: 8px
cursor: pointer
transition: all 0.2s ease
font-weight: 600
```

### Estados por color

| Estado | Fondo | Borde | Texto | Icono |
|--------|-------|-------|-------|-------|
| **Libre** | `#F0FDF4` | `2px solid #22C55E` | `#16A34A` | ✓ check |
| **Ocupada** | `#FEF2F2` | `2px solid #EF4444` | `#DC2626` | ● círculo |
| **Reservada** | `#EFF6FF` | `2px solid #3B82F6` | `#2563EB` | ◷ reloj |

### Contenido de la tarjeta

```
[Icono estado 24px]
Mesa {N}              ← 16px, SemiBold
{Estado}              ← 12px, Medium, mismo color que el estado
```

### Hover

```
transform: scale(1.03)
box-shadow: 0 4px 12px rgba(0,0,0,0.08)
```

---

## 13. Kanban (Módulo Delivery)

### Contenedor general

```
display: flex
gap: 16px
overflow-x: auto
padding: 16px
min-height: 400px
```

### Columna

```
min-width: 280px
flex: 1
background: #F8F9FB
border-radius: 16px
padding: 16px
```

### Header de columna

```
display: flex
justify-content: space-between
align-items: center
margin-bottom: 16px
```

```
Título: 16px, SemiBold, #15192C
Contador: badge circular
  width: 24px
  height: 24px
  border-radius: 50%
  background: #E5E7EB
  color: #6B7280
  font-size: 12px
  font-weight: 600
```

### Columnas y sus colores

| Columna | Badge color fondo | Badge color texto |
|---------|-------------------|-------------------|
| Pendiente | `#FFFBEB` | `#D97706` |
| En preparación | `#EFF6FF` | `#2563EB` |
| En camino | `#F3E8FF` | `#7C3AED` |
| Entregado | `#F0FDF4` | `#16A34A` |

### Item de pedido (card dentro de columna)

```
background: #FFFFFF
border-radius: 12px
padding: 12px
box-shadow: 0 1px 3px rgba(0,0,0,0.04)
margin-bottom: 8px
cursor: grab
transition: box-shadow 0.2s ease
```

#### Estructura del item

```
┌──────────────────────────┐
│  Pedido #001     $25.50  │  ← ID: 14px SemiBold | Precio: 14px Bold #DE5A25
│  Juan Pérez              │  ← Cliente: 13px, #6B7280
│  [Badge estado]          │  ← Badge según columna
└──────────────────────────┘
```

### Hover del item

```
box-shadow: 0 4px 12px rgba(0,0,0,0.08)
```

### Drag (arrastrando)

```
opacity: 0.8
box-shadow: 0 8px 24px rgba(0,0,0,0.12)
cursor: grabbing
```

---

## 14. Tarjeta de Cliente

### Contenedor

```
background: #FFFFFF
border-radius: 16px
padding: 16px
box-shadow: 0 4px 12px rgba(0,0,0,0.05)
display: flex
align-items: center
gap: 16px
transition: all 0.2s ease
```

### Avatar con iniciales

```
width: 48px
height: 48px
border-radius: 50%
background: linear-gradient(135deg, #F6A456, #DE5A25)
color: #FFFFFF
font-size: 18px
font-weight: 700
display: flex
align-items: center
justify-content: center
flex-shrink: 0
```

### Datos del cliente

```
┌─ Avatar ─┬─────────────────────┐
│    JP    │  Juan Pérez          │  ← Nombre: 16px, SemiBold, #15192C
│          │  juan@email.com      │  ← Email: 14px, Regular, #6B7280
│          │  +52 555 1234567     │  ← Teléfono: 14px, Regular, #6B7280
└──────────┴─────────────────────┘
```

### Hover

```
transform: translateY(-1px)
box-shadow: 0 6px 16px rgba(0,0,0,0.08)
```

---

## 15. Sidebar

### Contenedor principal

```
width: 260px (expandido) / 72px (colapsado)
height: 100vh
position: fixed
left: 0
top: 0
background: #15192C
color: #FFFFFF
padding: 20px 12px
display: flex
flex-direction: column
transition: width 0.3s ease
z-index: 40
overflow-y: auto
overflow-x: hidden
```

### Logo / Branding

```
padding: 8px 12px
margin-bottom: 24px
font-size: 20px
font-weight: 700
color: #FFFFFF
/* Con icono/emoji: 24px */
```

### Items de navegación

```
padding: 10px 12px
border-radius: 12px
font-size: 14px
font-weight: 500
color: rgba(255, 255, 255, 0.6)
display: flex
align-items: center
gap: 12px
cursor: pointer
transition: all 0.2s ease
margin-bottom: 4px
```

### Icono del item

```
width: 20px
height: 20px
flex-shrink: 0
color: inherit
/* Librería: Lucide React, stroke-width: 2 */
```

### Estados del item

| Estado | Fondo | Color texto | Efecto |
|--------|-------|-------------|--------|
| **Default** | Transparente | `rgba(255,255,255,0.6)` | — |
| **Hover** | `rgba(255,255,255,0.08)` | `rgba(255,255,255,0.85)` | — |
| **Activo** | `linear-gradient(135deg, #F6A456, #DE5A25)` | `#FFFFFF` | `font-weight: 600` |

### Separador de secciones

```
height: 1px
background: rgba(255, 255, 255, 0.1)
margin: 12px 0
```

### Footer del sidebar (usuario)

```
margin-top: auto
padding: 12px
border-top: 1px solid rgba(255,255,255,0.1)
display: flex
align-items: center
gap: 12px
```

---

## 16. Topbar

### Contenedor

```
width: calc(100% - 260px) /* Ancho total menos sidebar */
height: 64px
position: fixed
top: 0
right: 0
background: #FFFFFF
border-bottom: 1px solid #E5E7EB
display: flex
align-items: center
justify-content: space-between
padding: 0 24px
z-index: 30
```

### Lado izquierdo

```
/* Título de la página actual */
font-size: 20px
font-weight: 700
color: #15192C
```

### Lado derecho

```
display: flex
align-items: center
gap: 16px
```

#### Buscador (opcional)

```
width: 240px
height: 40px
border-radius: 12px
background: #F3F4F6
border: none
padding: 8px 12px 8px 36px
font-size: 14px
/* Icono lupa: 16px, posición absoluta left 12px, color #9CA3AF */
```

#### Botón de notificaciones

```
width: 40px
height: 40px
border-radius: 12px
background: transparent
position: relative
icon: 20px, color #6B7280
hover: background #F3F4F6
/* Indicador de notificación: */
  position: absolute
  top: 8px, right: 8px
  width: 8px
  height: 8px
  border-radius: 50%
  background: #EF4444
  border: 2px solid #FFFFFF
```

#### Avatar del usuario

```
width: 36px
height: 36px
border-radius: 50%
background: linear-gradient(135deg, #F6A456, #DE5A25)
color: #FFFFFF
font-size: 14px
font-weight: 600
cursor: pointer
```

---

## 17. Resumen de Tokens Rápidos

| Propiedad | Valor |
|-----------|-------|
| Grid base | 8px |
| Radio botones | 16px |
| Radio inputs | 12px |
| Radio cards | 20px |
| Radio badges | 999px |
| Sombra cards | `0 4px 12px rgba(0,0,0,0.05)` |
| Fuente | Inter |
| Color primario | `#DE5A25` |
| Color acción | `#F6A456` |
| Color texto | `#15192C` |
| Fondo app | `#F8F9FB` |
| Ancho sidebar | 260px |
| Alto topbar | 64px |
| Transición default | `all 0.2s ease` |
| Iconos | 20px (nav), 16-18px (acciones) |
| Max colores fuertes/pantalla | 2 |

---

*Documentación generada automáticamente para el proyecto MiRest con IA — Design System v1.0*
