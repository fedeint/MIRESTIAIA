# Plan de Implementación: DallIA — Asistente RAG para MiRest con IA

## Overview

Implementación incremental del módulo DallIA en vanilla HTML/CSS/JS. El orden sigue el pipeline RAG de afuera hacia adentro: primero el backend (Netlify Function de embeddings), luego la base de datos (Supabase), y finalmente el frontend completo con la UI de chat.

## Tasks

- [x] 1. Preparar entorno y configuración base
  - Agregar `SUPABASE_URL` y `SUPABASE_ANON_KEY` al archivo `.env` con valores placeholder
  - Agregar `IA/config.js` al `.gitignore` del proyecto
  - Verificar que `GEMINI_API_KEY` ya existe en `.env` (no recrear)
  - _Requirements: 8.1, 8.2_

- [x] 2. Crear `netlify/functions/ai-embedding.js`
  - [x] 2.1 Implementar el handler de la Netlify Function
    - Aceptar POST con `{ text: string }` en el body
    - Validar que `text` no sea ausente, vacío ni solo whitespace → devolver HTTP 400
    - Llamar a `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent` usando `GEMINI_API_KEY`
    - En éxito devolver `{ ok: true, embedding: number[] }` (768 dimensiones)
    - Si Gemini falla, devolver el código HTTP correspondiente con `{ error, data }` sin exponer la API key
    - Incluir cabeceras CORS idénticas a `netlify/functions/ai.js`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 2.4_

  - [ ]* 2.2 Escribir property test — Property 10: Validación de input vacío
    - **Property 10: Para cualquier `text` vacío/whitespace/ausente → HTTP 400**
    - **Validates: Requirements 5.4**

  - [ ]* 2.3 Escribir property test — Property 11: Propagación de errores HTTP de Gemini
    - **Property 11: Para cualquier error HTTP de Gemini → el handler NO devuelve HTTP 200**
    - **Validates: Requirements 5.5, 2.3**

  - [ ]* 2.4 Escribir property test — Property 17: Embedding válido para texto no vacío
    - **Property 17: Para cualquier texto no vacío → `embedding` es array de exactamente 768 floats**
    - **Validates: Requirements 2.1, 5.1, 5.3**

- [x] 3. Configurar Supabase — tabla `documents` y función RPC
  - Ejecutar en el SQL Editor de Supabase el schema definido en el design.md:
    - `create extension if not exists vector`
    - `create table documents (id, content, embedding vector(768), metadata, created_at)`
    - Crear índice IVFFlat con `lists = 100`
    - Crear función RPC `match_documents(query_embedding, match_threshold, match_count)`
  - _Requirements: 3.1, 3.5, 3.6_

- [x] 4. Checkpoint — Verificar backend antes de continuar
  - Hacer un POST manual a `/.netlify/functions/ai-embedding` con un texto de prueba y verificar que devuelve un array de 768 números
  - Verificar que la tabla `documents` existe en Supabase y que la función RPC `match_documents` se puede invocar
  - Preguntar al usuario si puede continuar o si hay problemas de configuración

- [x] 5. Crear `IA/config.js` (no versionado)
  - Crear el archivo `IA/config.js` con `window.MIREST_CONFIG = { supabaseUrl, supabaseAnonKey }`
  - Los valores se leen del `.env` local; confirmar que el archivo ya está en `.gitignore`
  - _Requirements: 8.2, 8.3_

- [x] 6. Implementar las funciones de lógica pura en `IA/ia.js`
  - [x] 6.1 Implementar `renderMarkdown(text)`
    - Convertir `**texto**` → `<strong>texto</strong>`
    - Convertir líneas que comienzan con `- ` → elementos `<li>` envueltos en `<ul>`
    - Convertir `\n` → `<br>`
    - No alterar el contenido semántico del texto
    - _Requirements: 1.4_

  - [ ]* 6.2 Escribir property test — Property 2: Renderizado de Markdown básico
    - **Property 2: `renderMarkdown` produce HTML equivalente sin alterar el contenido semántico**
    - **Validates: Requirements 1.4**

  - [x] 6.3 Implementar `filterAndSortChunks(chunks, threshold, topK)`
    - Excluir chunks con `similarity < threshold` (default 0.70)
    - Ordenar descendente por `similarity`
    - Limitar resultado a `topK` elementos (default 5)
    - _Requirements: 3.2, 3.3_

  - [ ]* 6.4 Escribir property test — Property 3: Límite Top_K
    - **Property 3: El resultado de `filterAndSortChunks` tiene a lo sumo `topK` elementos**
    - **Validates: Requirements 3.2**

  - [ ]* 6.5 Escribir property test — Property 4: Filtrado por umbral de similitud
    - **Property 4: Todos los chunks en el resultado tienen `similarity >= 0.70`**
    - **Validates: Requirements 3.3**

  - [ ]* 6.6 Escribir property test — Property 6: Ordenamiento descendente por similitud
    - **Property 6: El primer chunk del resultado siempre es el de mayor similitud**
    - **Validates: Requirements 4.1**

  - [x] 6.7 Implementar `buildLLMPayload(chunks, userText, history)`
    - Construir el `system` prompt con: rol de DallIA, instrucción de responder en español, contexto ensamblado con chunks ordenados por similitud descendente
    - Si `chunks` está vacío, incluir instrucción explícita de que no se encontró contexto relevante
    - Incluir `messages` (historial) y `model: "gemini-1.5-flash"` en el payload
    - _Requirements: 4.1, 4.2, 4.3, 4.5_

  - [ ]* 6.8 Escribir property test — Property 7: Estructura completa del payload al LLM
    - **Property 7: El payload siempre contiene `system`, `messages` y `model`**
    - **Validates: Requirements 4.2, 4.3, 6.2**

  - [x] 6.9 Implementar `extractResponseText(data)`
    - Extraer exactamente `data.candidates[0].content.parts[0].text`
    - No modificar el string extraído
    - _Requirements: 4.4_

  - [ ]* 6.10 Escribir property test — Property 8: Extracción correcta del texto de respuesta Gemini
    - **Property 8: Para cualquier respuesta válida de Gemini, `extractResponseText` devuelve exactamente el texto sin modificaciones**
    - **Validates: Requirements 4.4**

  - [x] 6.11 Implementar `truncateHistory(history)`
    - Si `history.length > 40` (20 pares), descartar los pares más antiguos
    - Preservar siempre el mensaje más reciente del usuario
    - Retornar array de exactamente 40 mensajes cuando se trunca
    - _Requirements: 4.6, 6.5_

  - [ ]* 6.12 Escribir property test — Property 9: Truncamiento del historial
    - **Property 9: Para historial > 40 mensajes, `truncateHistory` devuelve exactamente 40 preservando el par más reciente**
    - **Validates: Requirements 4.6, 6.5**

  - [ ]* 6.13 Escribir property test — Property 18: Crecimiento del historial por intercambio
    - **Property 18: Cada intercambio exitoso agrega exactamente 2 entradas al historial (user + assistant en ese orden)**
    - **Validates: Requirements 6.3**

- [x] 7. Implementar el pipeline RAG completo en `IA/ia.js`
  - [x] 7.1 Implementar `getEmbedding(text)`
    - POST a `/.netlify/functions/ai-embedding` con `{ text }`
    - Retornar el array `embedding` de la respuesta
    - Si falla, lanzar error descriptivo para que `sendMessage` lo capture
    - _Requirements: 2.1, 2.2, 2.4_

  - [x] 7.2 Implementar `retrieveContext(embedding)`
    - Leer `SUPABASE_URL` y `SUPABASE_ANON_KEY` desde `window.MIREST_CONFIG`
    - Si alguna variable no está definida: loguear error en consola, deshabilitar RAG, retornar `[]`
    - POST a `{SUPABASE_URL}/rest/v1/rpc/match_documents` con `{ query_embedding, match_threshold: 0.70, match_count: 5 }`
    - Aplicar `filterAndSortChunks` al resultado
    - Si Supabase falla, loguear el error y retornar `[]` con flag de advertencia
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 8.2, 8.4_

  - [x] 7.3 Implementar `callLLM(payload)`
    - POST a `/.netlify/functions/ai` con el payload
    - Retornar el texto extraído con `extractResponseText`
    - Si falla, lanzar error con mensaje amigable para el usuario
    - _Requirements: 4.3, 4.4_

  - [x] 7.4 Implementar `sendMessage(userText)`
    - Orquesta el pipeline completo: `getEmbedding` → `retrieveContext` → `buildLLMPayload` → `callLLM`
    - Llamar a `setLoadingState(true)` al inicio y `setLoadingState(false)` al finalizar (éxito o error)
    - Agregar mensaje del usuario y respuesta al historial con `appendToHistory`
    - Llamar a `truncateHistory` si corresponde
    - Mostrar advertencia visible si Supabase falló pero el LLM respondió
    - _Requirements: 2.2, 3.4, 4.3, 6.1, 6.2, 6.3, 7.3_

  - [ ]* 7.5 Escribir property test — Property 5: Resiliencia ante fallo de Supabase
    - **Property 5: Cuando Supabase falla, `sendMessage` completa el flujo y retorna respuesta sin lanzar excepciones no manejadas**
    - **Validates: Requirements 3.4, 7.3**

  - [ ]* 7.6 Escribir property test — Property 15: Degradación controlada sin variables de Supabase
    - **Property 15: Si `SUPABASE_URL` o `SUPABASE_ANON_KEY` no están definidas, el RAG se deshabilita y DallIA opera como chat simple sin errores**
    - **Validates: Requirements 8.4**

- [x] 8. Implementar los helpers de UI en `IA/ia.js`
  - [x] 8.1 Implementar `renderMessage(role, content)`
    - Crear elemento DOM con clase `message--user` (alineación derecha) o `message--assistant` (alineación izquierda) según el `role`
    - Usar `renderMarkdown` para renderizar el contenido del asistente
    - Agregar el elemento al `#chat-messages` y llamar a `scrollToBottom()`
    - _Requirements: 1.1, 1.2, 1.4_

  - [ ]* 8.2 Escribir property test — Property 1: Renderizado de mensajes por rol
    - **Property 1: `role="user"` → clase `message--user`; `role="assistant"` → clase `message--assistant`**
    - **Validates: Requirements 1.2**

  - [ ]* 8.3 Escribir property test — Property 16: Scroll automático al último mensaje
    - **Property 16: Al agregar cualquier mensaje, `scrollTop + clientHeight ≈ scrollHeight`**
    - **Validates: Requirements 1.1**

  - [x] 8.4 Implementar `setLoadingState(isLoading)`
    - `isLoading = true`: deshabilitar `#chat-input` y `#btn-send`, mostrar typing indicator
    - `isLoading = false`: habilitar `#chat-input` y `#btn-send`, ocultar typing indicator, enfocar `#chat-input`
    - _Requirements: 7.2, 7.4_

  - [ ]* 8.5 Escribir property test — Property 12: Estado de UI durante carga
    - **Property 12: `isLoading=true` → input y botón disabled; `isLoading=false` → habilitados y foco en input**
    - **Validates: Requirements 7.2, 7.4**

  - [x] 8.6 Implementar `updateCharCounter(length)`
    - Mostrar `(1000 - length)` caracteres restantes en el contador
    - El input debe truncar o impedir texto que supere 1000 caracteres
    - _Requirements: 7.5_

  - [ ]* 8.7 Escribir property test — Property 14: Contador de caracteres
    - **Property 14: Para string de longitud N (0 ≤ N ≤ 1000), el contador muestra exactamente `1000 - N`**
    - **Validates: Requirements 7.5**

  - [ ]* 8.8 Escribir property test — Property 13: Mensajes de error amigables al usuario
    - **Property 13: Los mensajes de error en el chat no contienen stack traces, URLs internas ni códigos HTTP crudos**
    - **Validates: Requirements 7.1**

  - [x] 8.9 Implementar `clearChat()`
    - Limpiar el área `#chat-messages`
    - Resetear `conversationHistory = []`
    - Mostrar el mensaje de bienvenida de DallIA
    - _Requirements: 1.5, 6.4_

- [x] 9. Checkpoint — Verificar lógica antes de construir HTML
  - Asegurar que todos los tests no opcionales pasan
  - Preguntar al usuario si hay ajustes en el comportamiento antes de construir la UI

- [x] 10. Crear `IA/ia.html`
  - Usar el shell del proyecto (sidebar + topbar) integrando `scripts/navigation.js` con `key: "ia"`
  - Incluir `data-root-path="../"` en el `<body>` para rutas relativas correctas
  - Estructura del área de chat:
    - `#chat-messages` — área de scroll con historial de mensajes
    - Typing indicator animado (tres puntos) oculto por defecto
    - `#chat-input` — `<textarea>` con `maxlength="1000"`, placeholder descriptivo
    - Contador de caracteres ligado al input
    - `#btn-send` — botón de envío
    - `#btn-new-chat` — botón "Nueva conversación"
  - Cargar `IA/config.js` como script antes de `IA/ia.js`
  - Aplicar tema oscuro con acento naranja consistente con el Design System del proyecto
  - Verificar responsividad para ancho menor a 768px
  - _Requirements: 1.1, 1.2, 1.3, 1.5, 1.6, 1.7, 1.8, 8.3_

- [x] 11. Conectar eventos de usuario en `IA/ia.js`
  - Evento `click` en `#btn-send` → llamar a `sendMessage`
  - Evento `keydown Enter` en `#chat-input` (sin Shift) → llamar a `sendMessage`
  - Evento `input` en `#chat-input` → llamar a `updateCharCounter`
  - Evento `click` en `#btn-new-chat` → llamar a `clearChat`
  - Al cargar el módulo: inicializar la UI, mostrar mensaje de bienvenida y enfocar el input
  - Verificar smoke: `GEMINI_API_KEY` no aparece en `IA/ia.js`; URLs de Gemini no aparecen en el frontend
  - _Requirements: 1.3, 1.5, 1.6, 6.4, 8.1, 8.3_

- [x] 12. Final checkpoint — Verificar el flujo completo
  - Asegurar que todos los tests pasan
  - Probar manualmente el flujo completo: escribir pregunta → embedding → Supabase → LLM → respuesta renderizada
  - Probar el modo degradado: con `SUPABASE_URL` vacío, verificar que DallIA responde como chat simple
  - Preguntar al usuario si hay ajustes finales antes de cerrar

## Notes

- Las tareas marcadas con `*` son opcionales y pueden omitirse para una entrega MVP más rápida
- Los property tests usan `fast-check` como biblioteca PBT con mínimo 100 iteraciones por propiedad
- `IA/config.js` nunca debe versionarse — solo se usa en desarrollo local; en Netlify se configuran las variables en Settings > Environment Variables
- El SQL de Supabase (tarea 3) se ejecuta manualmente en el SQL Editor del proyecto Supabase
- El módulo IA ya está registrado en `scripts/navigation.js` apuntando a `IA/ia.html`
