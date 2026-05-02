-- =============================================================
-- Supabase Setup — DallIA RAG Assistant
-- =============================================================
-- Ejecutar este archivo en el SQL Editor de tu proyecto Supabase:
-- Supabase Dashboard → SQL Editor → New query → pegar y ejecutar
-- =============================================================

-- 1. Habilitar extensión pgvector (si no está habilitada)
create extension if not exists vector;

-- 2. Crear tabla de documentos
create table if not exists documents (
  id          uuid primary key default gen_random_uuid(),
  content     text not null,
  embedding   vector(3072) not null,
  metadata    jsonb default '{}',
  created_at  timestamptz default now()
);

-- 3. Índice para búsqueda vectorial eficiente (IVFFlat)
create index on documents
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- 4. Función RPC para búsqueda por similitud coseno
create or replace function match_documents(
  query_embedding  vector(3072),
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
