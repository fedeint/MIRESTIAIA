-- ─── 1. EXTENSIONES ──────────────────────────────────────────────────────────
-- Necesaria para los embeddings de DallIA
create extension if not exists vector;

-- ─── 2. TABLA PARA RAG (DallIA) ──────────────────────────────────────────────
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  embedding vector(3072), -- Optimizado para gemini-embedding-001 (3072 dims)
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- Función RPC para búsqueda semántica (utilizada en IA/ia.js)
create or replace function match_documents (
  query_embedding vector(3072),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  content text,
  similarity float,
  metadata jsonb
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

-- ─── 3. TABLAS DE ALMACÉN (Inventario) ───────────────────────────────────────
create table if not exists insumos (
  id uuid primary key default gen_random_uuid(),
  codigo text unique not null,
  nombre text not null,
  categoria text,
  ubicacion text,
  stock_actual numeric default 0,
  unidad text,
  stock_minimo numeric default 0,
  costo_unitario numeric default 0,
  ultimo_ingreso text,
  proveedor text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists entradas_insumos (
  id uuid primary key default gen_random_uuid(),
  fecha text,
  hora text,
  comprobante text,
  usuario text,
  notas text,
  tipo text,
  referencia_id text,
  costo_total_movimiento numeric,
  ingredientes jsonb,
  archivos jsonb,
  created_at timestamptz default now()
);

create table if not exists salidas_insumos (
  id uuid primary key default gen_random_uuid(),
  fecha text,
  hora text,
  motivo text,
  justificacion text,
  comprobante text,
  usuario text,
  notas text,
  tipo text,
  referencia_id text,
  costo_total_movimiento numeric,
  ingredientes jsonb,
  archivos jsonb,
  created_at timestamptz default now()
);

create table if not exists proveedores (
  id bigint primary key generated always as identity,
  nombre text not null,
  ruc text,
  telefono text,
  categoria jsonb,
  ubicacion text,
  dias_credito integer,
  ultimo_ingreso text,
  estado text default 'Activo',
  distancia_km numeric,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── 4. CONFIGURACIÓN GLOBAL ─────────────────────────────────────────────────
create table if not exists configuracion_sistema (
  id int primary key default 1,
  dallia_config jsonb,
  modulos_activos jsonb,
  horarios_operacion jsonb,
  restaurante_info jsonb,
  updated_at timestamptz default now(),
  constraint single_row check (id = 1)
);

insert into configuracion_sistema (id, dallia_config)
values (1, '{"nombre": "DallIA", "trato": "Tú", "personalidad": "Amigable"}'::jsonb)
on conflict (id) do nothing;