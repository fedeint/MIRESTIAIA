# Migración de Embedding: text-embedding-004 → gemini-embedding-001

## 🚨 Cambio Crítico - Enero 2026

Google deprecó **text-embedding-004** el 14 de enero de 2026. Este modelo ya no funciona.

## ✅ Solución Implementada

### Modelo Actualizado
- **Antes**: `text-embedding-004` (768 dimensiones)
- **Ahora**: `gemini-embedding-001` (3072 dimensiones)

### Cambios Realizados

#### 1. Backend (`/api/ai-embedding.js`)
```javascript
// ❌ ANTES
model: "models/text-embedding-004"

// ✅ AHORA  
model: "models/gemini-embedding-001"
```

#### 2. Frontend (`IA/ia.js`)
- Fallback directo actualizado para usar `gemini-embedding-001`
- Logging de dimensiones (3072)

#### 3. Test Endpoints
- `/api/test-gemini.js` actualizado
- Todos los endpoints usan el nuevo modelo

## ⚠️ Impacto en Base de Datos

### Dimensiones del Vector
- **Antes**: 768 dimensiones
- **Ahora**: 3072 dimensiones

### Acciones Requeridas en Supabase

Si tienes datos embedidos previamente:

```sql
-- 1. Actualizar columna de embedding
ALTER TABLE documents 
ALTER COLUMN embedding TYPE vector(3072);

-- 2. Re-embedear todos los documentos
-- (Necesitas ejecutar script para re-procesar todo el contenido)

-- 3. Recrear índice vectorial
DROP INDEX IF EXISTS documents_embedding_idx;
CREATE INDEX documents_embedding_idx ON documents 
USING ivf (embedding vector_cosine_ops);
```

## 🔧 Flujo de Configuración

1. **Usuario entra** → No hay API key
2. **Modal se abre** → Usuario configura su API key de Gemini
3. **Key guardada** → En localStorage (no hardcodeada)
4. **Embedding funciona** → Con `gemini-embedding-001`

## 📊 Logs para Debugging

Los logs ahora muestran:
- Modelo usado: `gemini-embedding-001`
- Dimensiones: `3072`
- Estado de la API key

## 🚀 Próximos Pasos

1. **Testear la IA** con una API key válida
2. **Verificar logs** para confirmar 3072 dimensiones
3. **Actualizar Supabase** si tienes datos existentes
4. **Re-embedear contenido** si es necesario

## 📝 Notas Importantes

- No hay fallback a `text-embedding-004` (fue deprecado)
- Todas las API keys deben ser configuradas por usuarios
- No hay keys hardcodeadas en el código (seguridad)
- El flujo es completamente seguro y actualizado

---
*Actualizado: 30 de abril de 2026*
