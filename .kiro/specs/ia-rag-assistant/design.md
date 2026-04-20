# Design Document — DallIA: Asistente RAG para MiRest con IA

## Overview

DallIA es el módulo de inteligencia artificial centralizado de MiRest con IA. Implementa un pipeline RAG (Retrieval-Augmented Generation) que permite a los usuarios del restaurante hacer preguntas en lenguaje natural y recibir respuestas contextualizadas con el conocimiento del negocio: recetas, proveedores, productos, operaciones, etc.

El sistema se basa en tres piezas fundamentales:
1. **Embeddings semánticos** — la pregunta del usuario se convierte en un vector numérico usando el modelo `text-embedding-004` de Gemini, a través de una nueva Netlify Function (`ai-embedding.js`).
2. **Búsqueda vectorial** — el vector se usa para recuperar los fragmentos de documentos más relevantes desde Supabase con `pgvector`, vía la función RPC `match_documents`.
3. **Generación de respuesta** — el contexto recuperado se inyecta junto con el historial de conversación al LLM Gemini, usando el proxy existente `netlify/functions/ai.js`.

El frontend es HTML/CSS/JS vanilla, ubicado en `IA/ia.html` + `IA/ia.js`, siguiendo el Design System de tokens CSS del proyecto.

### Decisiones de diseño clave

- **Sin SDK de Supabase en el frontend**: las llamadas a Supabase se realizan vía `fetch` directo a la REST API y al RPC endpoint, evitando dependencias externas pesadas en el cliente.
- **Embedding en backend**: la clave `GEMINI_API_KEY` nunca se expone en el cliente. El frontend llama a `/.netlify/functions/ai-embedding` para obtener el vector.
- **Degradación controlada**: si Supabase no está configurado, el módulo opera como chat simple con Gemini, sin RAG.
- **Historial en memoria**: el `Conversation_History` vive en JavaScript en memoria de la sesión. No se persiste en localStorage para esta versión.

---

## Architecture

```mermaid
flowchart TD
    User([Usuario]) -->|Pregunta| ChatUI[Chat Interface\nIA/ia.html + IA/ia.js]
    
    ChatUI -->|POST /text| EmbedFn[Netlify Function\nai-embedding.js]
    EmbedFn -->|text-embedding-004| GeminiEmbed[Gemini Embeddings API]
    GeminiEmbed -->|vector float[768]| EmbedFn
    EmbedFn -->|{embedding: [...]}| ChatUI
    
    ChatUI -->|vector| Retriever[Retriever\n match_documents RPC]
    Retriever -->|similarity search| Supabase[(Supabase\npgvector\ntabla: documents)]
    Supabase -->|top-K chunks| Retriever
    Retriever -->|chunks filtrados| ChatUI
    
    ChatUI -->|system + context + history| LLMProxy[Netlify Function\nai.js]
    LLMProxy -->|generateContent| GeminiLLM[Gemini LLM API\ngemini-1.5-flash]
    GeminiLLM -->|respuesta| LLMProxy
    LLMProxy -->|{ok, data}| ChatUI
    
    ChatUI -->|respuesta renderizada| User
```

### Flujo de datos paso a paso

1. Usuario escribe una pregunta y presiona Enter o el botón enviar.
2. La UI deshabilita el input y muestra el indicador de carga.
3. Se hace `POST /.netlify/functions/ai-embedding` con `{ text: pregunta }`.
4. La función retorna `{ embedding: [0.123, -0.456, ...] }` (768 dimensiones).
5. Se llama a Supabase RPC `match_documents` con el vector, `match_count: 5`, `match_threshold: 0.70`.
6. Supabase retorna hasta 5 chunks ordenados por similitud.
7. El `Context_Builder` ensambla los chunks en un bloque de texto.
8. Se hace `POST /.netlify/functions/ai` con `{ system, messages, model }` incluyendo el contexto y el historial.
9. La respuesta se extrae de `data.candidates[0].content.parts[0].text`.
10. La respuesta se renderiza con Markdown básico y se agrega al historial.
11. El input se rehabilita y el cursor se enfoca.

---

## Components and Interfaces

### 1. `IA/ia.html` — Página del módulo

Estructura HTML principal con:
- Shell del proyecto (sidebar, topbar) usando `scripts/navigation.js`
- Área de mensajes (`#chat-messages`)
- Campo de entrada (`#chat-input`) con contador de caracteres
- Botón de envío (`#btn-send`)
- Botón "Nueva conversación" (`#btn-new-chat`)
- Indicador de carga (typing indicator animado)

### 2. `IA/ia.js` — Módulo principal (ES Module)

Responsabilidades y funciones expuestas:

```javascript
// Estado global de la sesión
let conversationHistory = []; // Array<{role: string, content: string}>

// Función principal del pipeline
async function sendMessage(userText: string): Promise<void>

// Paso 1: Obtener embedding
async function getEmbedding(text: string): Promise<number[]>

// Paso 2: Buscar documentos relevantes
async function retrieveContext(embedding: number[]): Promise<Chunk[]>

// Paso 3: Construir payload para el LLM
function buildLLMPayload(chunks: Chunk[], userText: string): LLMPayload

// Paso 4: Llamar al LLM proxy
async function callLLM(payload: LLMPayload): Promise<string>

// Gestión de historial
function appendToHistory(role: string, content: string): void
function truncateHistory(): void // mantiene max 20 pares

// UI helpers
function renderMessage(role: string, content: string): void
function renderMarkdown(text: string): string
function setLoadingState(isLoading: boolean): void
function updateCharCounter(length: number): void
function clearChat(): void
```

### 3. `netlify/functions/ai-embedding.js` — Netlify Function para embeddings

**Contrato de la API:**

```
POST /.netlify/functions/ai-embedding
Content-Type: application/json

Request body:
{
  "text": string  // texto a convertir en embedding (requerido, no vacío)
}

Response 200:
{
  "ok": true,
  "embedding": number[]  // array de 768 floats
}

Response 400:
{
  "error": "Missing or empty text field"
}

Response 5xx:
{
  "error": "Gemini error",
  "data": { ... }
}
```

**Variables de entorno requeridas:**
- `GEMINI_API_KEY` — clave de la API de Gemini

### 4. Supabase — Vector Store

**Función RPC `match_documents`:**

```
POST /rest/v1/rpc/match_documents
Authorization: Bearer {SUPABASE_ANON_KEY}
Content-Type: application/json

Request body:
{
  "query_embedding": number[],  // vector float[768]
  "match_threshold": number,    // ej: 0.70
  "match_count": number         // ej: 5
}

Response 200:
[
  {
    "id": string,
    "content": string,
    "similarity": number,       // 0.0 - 1.0
    "metadata": {
      "source": string,
      // otros campos opcionales
    }
  }
]
```

**Variables de entorno requeridas (frontend):**
- `SUPABASE_URL` — URL del proyecto de Supabase
- `SUPABASE_ANON_KEY` — clave anónima pública de Supabase

---

## Data Models

### `Chunk` — Fragmento de documento recuperado

```javascript
{
  id: string,           // UUID del chunk en Supabase
  content: string,      // texto del fragmento
  similarity: number,   // similitud coseno (0.0 - 1.0)
  metadata: {
    source: string,     // nombre del documento fuente (ej: "recetas.pdf")
    // campos opcionales adicionales
  }
}
```

### `ConversationMessage` — Entrada del historial

```javascript
{
  role: "user" | "assistant",
  content: string
}
```

### `LLMPayload` — Payload para el proxy de Gemini

```javascript
{
  system: string,           // System prompt con contexto ensamblado
  messages: ConversationMessage[],  // historial (max 20 pares = 40 mensajes)
  model: "gemini-1.5-flash"
}
```

### `EmbeddingRequest` — Cuerpo de la solicitud a `ai-embedding.js`

```javascript
{
  text: string  // pregunta del usuario
}
```

### `EmbeddingResponse` — Respuesta de `ai-embedding.js`

```javascript
{
  ok: true,
  embedding: number[]  // 768 dimensiones para text-embedding-004
}
```

### Schema SQL — Tabla `documents` en Supabase

```sql
-- Habilitar extensión pgvector (si no está habilitada)
create extension if not exists vector;

-- Crear tabla de documentos
create table if not exists documents (
  id          uuid primary key default gen_random_uuid(),
  content     text not null,
  embedding   vector(768) not null,
  metadata    jsonb default '{}',
  created_at  timestamptz default now()
);

-- Índice para búsqueda vectorial eficiente (IVFFlat)
create index on documents
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- Función RPC para búsqueda por similitud coseno
create or replace function match_documents(
  query_embedding  vector(768),
  match_threshold  float,
  match_count      int
)
returns table (
  id          uuid,
  content     text,
  similarity  float,
  metadata    jsonb
)
language sql stable
as $$
  select
    id,
    content,
    1 - (embedding <=> query_embedding) as similarity,
    metadata
  from documents
  where 1 - (embedding <=> query_embedding) > match_threshold
  order by embedding <=> query_embedding
  limit match_count;
$$;
```

### Configuración de entorno — `.env`

```dotenv
# Ya existente
GEMINI_API_KEY=...

# Nuevas variables a agregar
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_ANON_KEY=eyJ...
```

### Configuración frontend — `IA/config.js` (no versionado)

Para desarrollo local, el frontend necesita acceso a las variables de Supabase. Dado que es un proyecto Netlify, se usará `netlify.toml` para las variables de entorno en producción, y un archivo `IA/config.js` en gitignore para desarrollo local:

```javascript
// IA/config.js — NO versionar este archivo
window.MIREST_CONFIG = {
  supabaseUrl: "https://<project-ref>.supabase.co",
  supabaseAnonKey: "eyJ..."
};
```

En producción (Netlify), las variables se inyectan como variables de entorno y se accede a ellas via un endpoint o se hardcodean en el build process.

> **Nota para el desarrollador**: Agregar `IA/config.js` al `.gitignore`. En Netlify, configurar `SUPABASE_URL` y `SUPABASE_ANON_KEY` en Settings > Environment Variables.

---

## Correctness Properties

*Una propiedad es una característica o comportamiento que debe mantenerse verdadera a través de todas las ejecuciones válidas de un sistema — esencialmente, una declaración formal sobre lo que el sistema debe hacer. Las propiedades sirven como puente entre las especificaciones legibles por humanos y las garantías de corrección verificables por máquinas.*

### Property 1: Renderizado de mensajes por rol

*Para cualquier* mensaje con `role="user"`, el elemento DOM generado debe contener la clase de alineación derecha (`message--user`). *Para cualquier* mensaje con `role="assistant"`, el elemento DOM debe contener la clase de alineación izquierda (`message--assistant`).

**Validates: Requirements 1.2**

---

### Property 2: Renderizado de Markdown básico

*Para cualquier* texto que contenga patrones de Markdown básico (`**texto**`, `- item`, `\n`), la función `renderMarkdown` debe producir el HTML equivalente correcto (strong, li, br). La transformación no debe alterar el contenido semántico del texto.

**Validates: Requirements 1.4**

---

### Property 3: Límite de resultados del Retriever

*Para cualquier* respuesta de Supabase que contenga N documentos (donde N puede ser mayor que Top_K), el Retriever debe retornar a lo sumo `Top_K` fragmentos (valor por defecto: 5). El resultado nunca debe exceder este límite.

**Validates: Requirements 3.2**

---

### Property 4: Filtrado por umbral de similitud

*Para cualquier* conjunto de chunks retornados por Supabase, el Retriever debe excluir todos aquellos cuyo campo `similarity` sea menor a 0.70. Todos los chunks en el resultado final deben tener `similarity >= 0.70`.

**Validates: Requirements 3.3**

---

### Property 5: Resiliencia ante fallo de Supabase

*Para cualquier* error producido por la llamada a Supabase (error de red, timeout, error 5xx), el RAG pipeline debe completar el flujo y retornar una respuesta al usuario. El sistema no debe lanzar excepciones no manejadas. La respuesta puede ser generada sin contexto, y la UI debe mostrar una advertencia visible al usuario.

**Validates: Requirements 3.4, 7.3**

---

### Property 6: Ordenamiento de chunks por similitud descendente

*Para cualquier* array de chunks con similitudes distintas, la función `buildLLMPayload` debe incluir los chunks en el bloque de contexto ordenados de mayor a menor similitud. El primer chunk en el contexto siempre debe ser el de mayor similitud.

**Validates: Requirements 4.1**

---

### Property 7: Estructura completa del payload al LLM

*Para cualquier* combinación de pregunta de usuario, historial de conversación y chunks recuperados, el payload enviado al LLM proxy debe contener: (1) el campo `system` con el System_Prompt incluyendo las instrucciones de comportamiento y el contexto ensamblado, (2) el campo `messages` con el historial de conversación, y (3) el campo `model`.

**Validates: Requirements 4.2, 4.3, 6.2**

---

### Property 8: Extracción correcta del texto de respuesta Gemini

*Para cualquier* respuesta válida del LLM proxy con la estructura `{ ok: true, data: { candidates: [{ content: { parts: [{ text: string }] } }] } }`, la función de extracción debe retornar exactamente el string en `data.candidates[0].content.parts[0].text`, sin modificaciones.

**Validates: Requirements 4.4**

---

### Property 9: Truncamiento del historial de conversación

*Para cualquier* historial de conversación que supere 20 pares de mensajes (40 mensajes totales), la función `truncateHistory` debe producir un array de exactamente 40 mensajes (20 pares), descartando los pares más antiguos. El par más reciente del usuario siempre debe estar preservado.

**Validates: Requirements 4.6, 6.5**

---

### Property 10: Validación de input vacío en Netlify Function

*Para cualquier* solicitud al endpoint `ai-embedding.js` donde el campo `text` sea ausente, null, undefined, string vacío, o string compuesto exclusivamente de whitespace, la función debe retornar HTTP 400 con un mensaje de error descriptivo. Nunca debe intentar llamar a la API de Gemini con input vacío.

**Validates: Requirements 5.4**

---

### Property 11: Propagación de errores HTTP de Gemini en la Netlify Function

*Para cualquier* código de error HTTP retornado por la API de Gemini (4xx, 5xx), la función `ai-embedding.js` debe retornar un código de estado HTTP de error al cliente (nunca HTTP 200). El cuerpo de la respuesta debe indicar que ocurrió un error, sin exponer la API key ni detalles internos de la función.

**Validates: Requirements 5.5, 2.3**

---

### Property 12: Estado de UI durante carga

*Para cualquier* estado en que `isLoading = true`, el campo de entrada `#chat-input` y el botón `#btn-send` deben tener el atributo `disabled`. *Para cualquier* estado en que `isLoading = false` después de recibir una respuesta, ambos elementos deben estar habilitados y `#chat-input` debe tener el foco.

**Validates: Requirements 7.2, 7.4**

---

### Property 13: Mensajes de error amigables al usuario

*Para cualquier* error originado en el LLM proxy (error HTTP), la UI debe mostrar un mensaje en el área de chat que no contenga: stack traces, URLs internas, nombres de variables, ni códigos de estado HTTP crudos. El mensaje debe ser legible por un usuario no técnico.

**Validates: Requirements 7.1**

---

### Property 14: Contador de caracteres del input

*Para cualquier* string de longitud N (donde 0 ≤ N ≤ 1000) en el campo de entrada, el contador debe mostrar exactamente `(1000 - N)` caracteres restantes. Para cualquier intento de ingresar texto que lleve el total a más de 1000 caracteres, el input debe truncar o impedir el exceso.

**Validates: Requirements 7.5**

---

### Property 15: Degradación controlada sin variables de Supabase

*Para cualquier* inicialización del módulo donde `SUPABASE_URL` o `SUPABASE_ANON_KEY` no estén definidas, el sistema debe: (1) registrar un error en la consola, (2) deshabilitar el RAG pipeline, y (3) permitir al usuario usar DallIA como chat simple con Gemini. El sistema no debe lanzar errores no manejados ni mostrar una página en blanco.

**Validates: Requirements 8.4**

---

### Property 16: Scroll automático al último mensaje

*Para cualquier* número de mensajes en el área de chat, al agregar un nuevo mensaje (ya sea del usuario o de DallIA), el área de mensajes debe hacer scroll hasta el último mensaje, de modo que `scrollTop + clientHeight ≈ scrollHeight`.

**Validates: Requirements 1.1**

---

### Property 17: Embedding válido para cualquier texto no vacío

*Para cualquier* string no vacío enviado al endpoint `ai-embedding.js`, la respuesta exitosa debe contener un campo `embedding` que es un array de exactamente 768 números flotantes. El array no debe estar vacío ni contener valores no numéricos.

**Validates: Requirements 2.1, 5.1, 5.3**

---

### Property 18: Crecimiento del historial por intercambio

*Para cualquier* mensaje enviado por el usuario que obtiene una respuesta exitosa de DallIA, el `conversationHistory` debe crecer en exactamente 2 entradas: una con `role: "user"` y otra con `role: "assistant"`. El orden debe preservarse (user antes que assistant).

**Validates: Requirements 6.3**

---

## Error Handling

### Matriz de errores y respuestas

| Origen del error | Tipo | Comportamiento del sistema | Mensaje al usuario |
|---|---|---|---|
| `ai-embedding.js` — input vacío | Validación | Retorna HTTP 400 | "El mensaje no puede estar vacío." |
| `ai-embedding.js` — Gemini API falla | Externo | Retorna HTTP correspondiente | "DallIA no pudo procesar tu pregunta. Intenta de nuevo." |
| Supabase — error de red | Externo | Pipeline continúa sin contexto | Advertencia: "Respondiendo sin acceso a la base de conocimiento." |
| Supabase — match_documents falla | Externo | Pipeline continúa sin contexto | Advertencia: "Respondiendo sin acceso a la base de conocimiento." |
| `ai.js` proxy — Gemini API falla | Externo | Muestra error en chat | "DallIA no pudo procesar tu solicitud en este momento." |
| `ai.js` proxy — error de red | Red | Muestra error en chat | "Problema de conexión. Verifica tu internet e intenta de nuevo." |
| Config. faltante (Supabase vars) | Configuración | Modo básico sin RAG | Error en consola, DallIA funciona sin contexto |
| Historial > 20 pares | Límite | Truncamiento silencioso | Ninguno (operación transparente) |

### Principios de error handling

1. **Fail gracefully**: ningún error debe dejar la UI en estado roto (input siempre habilitado después de un error).
2. **No exponer internals**: los mensajes de error al usuario nunca incluyen stack traces, URLs de API ni detalles técnicos.
3. **Logging en consola**: todos los errores se loguean con `console.error` para debugging en desarrollo.
4. **Degradación progresiva**: si el RAG falla, DallIA responde igualmente como LLM simple.

---

## Testing Strategy

### Enfoque dual: Unit Tests + Property-Based Tests

La estrategia de testing combina pruebas de ejemplo para casos específicos con pruebas basadas en propiedades para validar invariantes universales.

**Biblioteca de Property-Based Testing recomendada**: [`fast-check`](https://github.com/dubzzz/fast-check) — compatible con entornos JavaScript/Node.js sin dependencia de frameworks de UI.

**Test runner**: Jest o Vitest (compatible con el proyecto existente).

### Módulos a testear

#### `IA/ia.js` — Funciones puras (Unit + Property tests)

Las siguientes funciones son puras o tienen comportamiento fácilmente mockeable:

```
renderMarkdown(text)       → Property 2
buildLLMPayload(chunks, userText, history) → Properties 6, 7
truncateHistory(history)   → Property 9
filterAndSortChunks(chunks) → Properties 3, 4, 6
extractResponseText(data)  → Property 8
updateCharCounter(length)  → Property 14
```

#### `netlify/functions/ai-embedding.js` — Netlify Function (Unit + Property tests)

```
handler(event)             → Properties 10, 11, 17
```

#### UI behaviors (Example-based + Property tests con jsdom)

```
renderMessage(role, content) → Property 1
setLoadingState(isLoading)   → Property 12
appendToHistory(role, content) → Property 18
scrollToBottom()             → Property 16
clearChat()                  → Example (botón nueva conversación)
```

### Configuración de Property Tests

Cada property test debe ejecutarse con **mínimo 100 iteraciones** vía fast-check:

```javascript
// Ejemplo de estructura de property test
import fc from 'fast-check';
import { describe, test, expect } from 'vitest';

describe('Feature: ia-rag-assistant', () => {
  // Property 4: Filtrado por umbral de similitud
  // Feature: ia-rag-assistant, Property 4: Todos los chunks retornados tienen similarity >= 0.70
  test('Property 4: filtrado por threshold', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({
          id: fc.uuid(),
          content: fc.string(),
          similarity: fc.float({ min: 0, max: 1 }),
          metadata: fc.record({ source: fc.string() })
        })),
        (chunks) => {
          const result = filterChunksByThreshold(chunks, 0.70);
          return result.every(chunk => chunk.similarity >= 0.70);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Cobertura esperada

| Área | Tipo de test | Cobertura objetivo |
|---|---|---|
| `renderMarkdown` | Property (fast-check) | Cualquier texto con Markdown básico |
| `buildLLMPayload` | Property (fast-check) | Cualquier combinación de chunks e historial |
| `truncateHistory` | Property (fast-check) | Historiales de 0 a 50+ pares |
| `filterAndSortChunks` | Property (fast-check) | Arrays con similitudes aleatorias |
| `extractResponseText` | Property (fast-check) | Estructuras de respuesta válidas de Gemini |
| `ai-embedding.js handler` | Property + Example | Inputs válidos, vacíos y errores externos |
| UI renderizado | Example (jsdom) | Mensajes user/assistant, loading state |
| Flujo completo RAG | Integration (mocks) | Happy path + Supabase falla + Gemini falla |

### Tests de integración (mocked)

Los tests de integración deben mockear las llamadas externas:
- `fetch` mockeado para llamadas a Supabase RPC
- `fetch` mockeado para llamadas al proxy de Gemini
- Variables de entorno mockeadas para tests de configuración

### Tests de smoke

- Verificar que no hay credenciales hardcodeadas en el código fuente
- Verificar que `GEMINI_API_KEY` no aparece en `IA/ia.js`
- Verificar que las URLs de Gemini no aparecen en el frontend
