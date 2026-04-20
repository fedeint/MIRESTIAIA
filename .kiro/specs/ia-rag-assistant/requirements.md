# Requirements Document

## Introduction

El módulo **DallIA** es el asistente de inteligencia artificial centralizado de MiRest con IA. Permite a los usuarios del restaurante hacer preguntas en lenguaje natural y recibir respuestas contextualizadas utilizando RAG (Retrieval-Augmented Generation). El sistema recupera documentos relevantes almacenados en Supabase (con pgvector para embeddings), construye un contexto enriquecido y lo envía junto con la pregunta al modelo Gemini a través del proxy backend existente (`netlify/functions/ai.js`). El resultado es una IA que "conoce" el negocio: recetas, proveedores, productos, operaciones, etc.

## Glossary

- **DallIA**: Nombre del asistente IA del sistema MiRest con IA.
- **RAG_Pipeline**: Proceso de recuperación de contexto que combina búsqueda semántica con generación de texto.
- **Embedding_Service**: Servicio que convierte texto en vectores numéricos para búsqueda semántica. Utiliza la API de Gemini (`text-embedding-004`).
- **Vector_Store**: Base de datos Supabase con extensión pgvector que almacena los embeddings de documentos.
- **Retriever**: Componente que consulta el Vector_Store para obtener los fragmentos de documentos más relevantes a una pregunta.
- **Context_Builder**: Componente que ensambla los fragmentos recuperados en un bloque de contexto legible para el LLM.
- **LLM_Proxy**: Función serverless existente en `netlify/functions/ai.js` que actúa como proxy hacia la API de Gemini.
- **Chat_Interface**: La interfaz de usuario en `IA/ia.html` donde el usuario interactúa con DallIA.
- **Document_Chunk**: Fragmento de texto de un documento fuente, almacenado junto a su embedding en el Vector_Store.
- **Conversation_History**: Lista de mensajes previos del usuario y DallIA en la sesión actual.
- **System_Prompt**: Instrucción base que define el rol y comportamiento de DallIA.
- **Similarity_Threshold**: Umbral mínimo de similitud coseno para considerar un Document_Chunk relevante.
- **Top_K**: Número máximo de Document_Chunks a recuperar por consulta.
- **Netlify_Function**: Función serverless desplegada en Netlify que ejecuta lógica backend.

---

## Requirements

### Requirement 1: Interfaz de Chat

**User Story:** Como usuario del restaurante, quiero una interfaz de chat clara y responsiva, para poder hacer preguntas a DallIA de forma natural sin necesidad de conocimientos técnicos.

#### Acceptance Criteria

1. THE Chat_Interface SHALL mostrar un área de historial de mensajes con scroll automático al último mensaje.
2. THE Chat_Interface SHALL mostrar cada mensaje del usuario con alineación derecha y cada respuesta de DallIA con alineación izquierda.
3. WHEN el usuario envía un mensaje, THE Chat_Interface SHALL mostrar un indicador visual de carga mientras DallIA procesa la respuesta.
4. WHEN DallIA genera una respuesta, THE Chat_Interface SHALL renderizar la respuesta con soporte básico de Markdown (negrita, listas, saltos de línea).
5. WHEN la sesión inicia, THE Chat_Interface SHALL mostrar un mensaje de bienvenida de DallIA indicando sus capacidades.
6. THE Chat_Interface SHALL permitir enviar mensajes tanto con el botón de envío como con la tecla Enter.
7. IF la ventana del navegador tiene un ancho menor a 768px, THE Chat_Interface SHALL adaptar el layout para ser completamente usable en móvil.
8. THE Chat_Interface SHALL aplicar la estética visual del módulo IA (tema oscuro con acento naranja) consistente con el Design System de MiRest.

---

### Requirement 2: RAG Pipeline — Generación de Embeddings de Consulta

**User Story:** Como sistema, quiero convertir la pregunta del usuario en un vector de embedding, para poder buscar documentos semánticamente relevantes en el Vector_Store.

#### Acceptance Criteria

1. WHEN el usuario envía una pregunta, THE Embedding_Service SHALL convertir el texto de la pregunta en un vector de embedding usando el modelo `text-embedding-004` de Gemini.
2. WHEN la conversión de embedding es exitosa, THE RAG_Pipeline SHALL usar el vector resultante para iniciar la búsqueda en el Vector_Store.
3. IF la llamada a la API de embedding falla, THEN THE RAG_Pipeline SHALL registrar el error en la consola y responder al usuario con un mensaje de error descriptivo sin exponer detalles técnicos internos.
4. THE Embedding_Service SHALL realizar la llamada de embedding a través del LLM_Proxy para no exponer la GEMINI_API_KEY en el frontend.

---

### Requirement 3: RAG Pipeline — Recuperación de Contexto

**User Story:** Como sistema, quiero recuperar los fragmentos de documentos más relevantes del Vector_Store, para proporcionar contexto preciso al LLM al momento de generar la respuesta.

#### Acceptance Criteria

1. WHEN el Retriever recibe un vector de embedding de consulta, THE Retriever SHALL ejecutar una búsqueda de similitud coseno en la tabla `documents` del Vector_Store de Supabase.
2. THE Retriever SHALL retornar como máximo los Top_K fragmentos más similares, donde Top_K tiene un valor por defecto de 5.
3. THE Retriever SHALL filtrar resultados por Similarity_Threshold, excluyendo Document_Chunks con similitud coseno menor a 0.70.
4. WHEN la búsqueda en Supabase falla, THEN THE Retriever SHALL registrar el error y THE RAG_Pipeline SHALL continuar la generación de respuesta sin contexto adicional, notificando al usuario que la búsqueda de documentos falló.
5. WHERE la tabla `documents` contenga una columna `metadata`, THE Retriever SHALL incluir el campo `source` del metadata en el resultado para permitir citar la fuente del documento.
6. THE Retriever SHALL ejecutar la búsqueda de similitud mediante la función RPC `match_documents` expuesta en Supabase.

---

### Requirement 4: RAG Pipeline — Construcción de Contexto y Generación de Respuesta

**User Story:** Como sistema, quiero combinar los documentos recuperados con el historial de conversación y enviarlos al LLM, para que DallIA genere respuestas precisas y contextualizadas.

#### Acceptance Criteria

1. WHEN el Context_Builder recibe los Document_Chunks del Retriever, THE Context_Builder SHALL ensamblar un bloque de texto con los fragmentos ordenados por similitud descendente.
2. THE Context_Builder SHALL incluir el System_Prompt que instruye a DallIA a responder en español, actuar como asistente del restaurante MiRest, y usar únicamente el contexto provisto para responder preguntas de negocio.
3. THE LLM_Proxy SHALL recibir el System_Prompt, el contexto ensamblado, y el Conversation_History completo de la sesión actual como parte del payload de la solicitud.
4. WHEN el LLM_Proxy retorna una respuesta exitosa, THE RAG_Pipeline SHALL extraer el texto de la respuesta del campo `data.candidates[0].content.parts[0].text` y entregarlo al Chat_Interface.
5. IF el contexto recuperado está vacío (no se encontraron Document_Chunks relevantes), THE Context_Builder SHALL incluir en el System_Prompt una instrucción explícita indicando que no se encontró contexto relevante en la base de documentos.
6. THE Conversation_History SHALL mantener un máximo de 20 pares de mensajes (usuario + asistente) para evitar exceder los límites de tokens del modelo.

---

### Requirement 5: Netlify Function para Embeddings

**User Story:** Como desarrollador, quiero una función serverless dedicada para la generación de embeddings, para no exponer la API key de Gemini en el cliente y centralizar esta operación en el backend.

#### Acceptance Criteria

1. THE Netlify_Function `netlify/functions/ai-embedding.js` SHALL aceptar solicitudes POST con un cuerpo JSON que contenga un campo `text` de tipo string.
2. WHEN la función recibe una solicitud válida, THE Netlify_Function SHALL llamar al endpoint de embeddings de Gemini `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent` usando la variable de entorno `GEMINI_API_KEY`.
3. WHEN la llamada a Gemini es exitosa, THE Netlify_Function SHALL retornar un JSON con el campo `embedding` conteniendo el array de valores numéricos del vector.
4. IF el campo `text` no está presente o está vacío en el cuerpo de la solicitud, THEN THE Netlify_Function SHALL retornar un error HTTP 400 con un mensaje descriptivo.
5. IF la llamada a Gemini falla, THEN THE Netlify_Function SHALL retornar el código de estado HTTP correspondiente y un mensaje de error estructurado.
6. THE Netlify_Function SHALL incluir cabeceras CORS consistentes con las definidas en `netlify/functions/ai.js`.

---

### Requirement 6: Gestión del Historial de Conversación

**User Story:** Como usuario, quiero que DallIA recuerde el contexto de la conversación actual, para poder hacer preguntas de seguimiento sin repetir información ya proporcionada.

#### Acceptance Criteria

1. THE Chat_Interface SHALL mantener el Conversation_History en memoria durante la sesión activa del navegador.
2. WHEN el usuario envía un nuevo mensaje, THE RAG_Pipeline SHALL incluir el Conversation_History previo en el payload enviado al LLM_Proxy.
3. WHEN DallIA responde, THE Chat_Interface SHALL agregar tanto el mensaje del usuario como la respuesta de DallIA al Conversation_History.
4. THE Chat_Interface SHALL proveer un botón "Nueva conversación" que limpie el Conversation_History y el área de mensajes, reiniciando la sesión.
5. IF el Conversation_History supera 20 pares de mensajes, THE RAG_Pipeline SHALL truncar el historial eliminando los pares más antiguos, preservando siempre el mensaje más reciente del usuario.

---

### Requirement 7: Manejo de Errores y Estados de UI

**User Story:** Como usuario, quiero recibir retroalimentación clara cuando algo falla, para entender qué ocurrió y poder intentarlo de nuevo sin frustración.

#### Acceptance Criteria

1. WHEN una solicitud al LLM_Proxy devuelve un error HTTP, THE Chat_Interface SHALL mostrar un mensaje de error amigable en el área de chat indicando que DallIA no pudo procesar la solicitud.
2. WHEN el indicador de carga está activo, THE Chat_Interface SHALL deshabilitar el campo de entrada de texto y el botón de envío para prevenir solicitudes duplicadas.
3. IF la conexión a Supabase falla durante la recuperación de contexto, THEN THE Chat_Interface SHALL mostrar una advertencia visible al usuario indicando que DallIA está respondiendo sin acceso a la base de conocimiento.
4. WHEN DallIA produce una respuesta exitosa, THE Chat_Interface SHALL habilitar nuevamente el campo de entrada de texto y enfocar el cursor en él.
5. THE Chat_Interface SHALL mostrar un contador de caracteres en el campo de entrada con un límite máximo de 1000 caracteres por mensaje.

---

### Requirement 8: Configuración y Variables de Entorno

**User Story:** Como desarrollador, quiero que todas las credenciales y configuraciones sensibles estén centralizadas en variables de entorno, para garantizar la seguridad del sistema en producción.

#### Acceptance Criteria

1. THE LLM_Proxy SHALL leer la clave de API de Gemini exclusivamente desde la variable de entorno `GEMINI_API_KEY` y nunca desde el código fuente o el frontend.
2. THE Chat_Interface SHALL leer la URL base de Supabase y la clave anónima de Supabase desde variables de entorno o desde un archivo de configuración del frontend no versionado.
3. THE Chat_Interface SHALL construir la URL del LLM_Proxy y de las Netlify_Functions de forma relativa, sin hardcodear dominios absolutos, para funcionar correctamente en entornos de desarrollo local y producción.
4. WHERE la variable de entorno `SUPABASE_URL` o `SUPABASE_ANON_KEY` no esté definida, THE Chat_Interface SHALL mostrar un error de configuración en la consola y deshabilitar el RAG_Pipeline, permitiendo al usuario usar DallIA en modo básico sin recuperación de contexto.
