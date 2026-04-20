-- ============================================================
-- Almacen/migration.sql
-- Migración del módulo Almacén de MiRest a Supabase
-- ============================================================

-- ============================================================
-- 1. CREAR TABLAS
-- ============================================================

CREATE TABLE insumos (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo        text UNIQUE NOT NULL,
  nombre        text NOT NULL,
  categoria     text,
  ubicacion     text,
  stock_actual  numeric DEFAULT 0,
  unidad        text,
  stock_minimo  numeric DEFAULT 0,
  costo_unitario numeric DEFAULT 0,
  ultimo_ingreso text,
  proveedor     text,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

CREATE TABLE entradas_insumos (
  id                    text PRIMARY KEY,
  fecha                 text,
  hora                  text,
  comprobante           text,
  usuario               text,
  notas                 text,
  tipo                  text,
  referencia_id         text,
  costo_total_movimiento numeric DEFAULT 0,
  ingredientes          jsonb,
  archivos              jsonb,
  created_at            timestamptz DEFAULT now()
);

CREATE TABLE salidas_insumos (
  id                    text PRIMARY KEY,
  fecha                 text,
  hora                  text,
  motivo                text,
  justificacion         text,
  comprobante           text,
  usuario               text,
  notas                 text,
  tipo                  text,
  referencia_id         text,
  costo_total_movimiento numeric DEFAULT 0,
  ingredientes          jsonb,
  archivos              jsonb,
  created_at            timestamptz DEFAULT now()
);

CREATE TABLE proveedores (
  id            bigint PRIMARY KEY,
  nombre        text NOT NULL,
  ruc           text,
  telefono      text,
  categoria     jsonb,
  ubicacion     text,
  dias_credito  integer DEFAULT 0,
  ultimo_ingreso text,
  estado        text DEFAULT 'Activo',
  distancia_km  numeric DEFAULT 0,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

-- ============================================================
-- 2. ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE insumos          ENABLE ROW LEVEL SECURITY;
ALTER TABLE entradas_insumos ENABLE ROW LEVEL SECURITY;
ALTER TABLE salidas_insumos  ENABLE ROW LEVEL SECURITY;
ALTER TABLE proveedores      ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 3. POLÍTICAS DE ACCESO PÚBLICO (anon key)
-- ============================================================

CREATE POLICY "public_read_write_insumos"
  ON insumos
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "public_read_write_entradas_insumos"
  ON entradas_insumos
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "public_read_write_salidas_insumos"
  ON salidas_insumos
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "public_read_write_proveedores"
  ON proveedores
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- 4. ÍNDICES
-- ============================================================

CREATE INDEX idx_insumos_codigo          ON insumos(codigo);
CREATE INDEX idx_entradas_insumos_created ON entradas_insumos(created_at);
CREATE INDEX idx_salidas_insumos_created  ON salidas_insumos(created_at);

-- ============================================================
-- 5. SEED — 39 insumos iniciales
-- ============================================================

INSERT INTO insumos (codigo, nombre, categoria, ubicacion, stock_actual, unidad, stock_minimo, costo_unitario, ultimo_ingreso) VALUES
  ('INS030', 'Aceite vegetal',           'Aceites, grasas y azúcar',   'Estante 3',  13.1, 'lt',  8,    6.00,  '2026-03-28'),
  ('INS010', 'Aji amarillo',             'Condimentos y especias',      'Estante 5',  4.5,  'kg',  2,    8.00,  '2026-04-01'),
  ('INS011', 'Aji limo',                 'Condimentos y especias',      'Estante 5',  3,    'kg',  1,    10.00, '—'),
  ('INS020', 'Ajo',                      'Condimentos y especias',      'Estante 5',  3,    'kg',  1,    12.00, '2026-03-30'),
  ('INS021', 'Arroz',                    'Granos, harinas y pastas',    'Estante 1',  47,   'kg',  20,   3.50,  '2026-04-02'),
  ('INS038', 'Azucar',                   'Aceites, grasas y azúcar',   'Estante 3',  15,   'kg',  8,    3.00,  '—'),
  ('INS045', 'Bolsas para llevar',       'Descartables',                'Estante 10', 200,  'und', 100,  0.10,  '2026-03-25'),
  ('INS002', 'Camarones',                'Pescados y mariscos',         'Estante 8',  2,    'kg',  5,    35.00, '2026-03-20'),
  ('INS014', 'Camote',                   'Tubérculos',                  'Estante 2',  20,   'kg',  8,    2.50,  '—'),
  ('INS015', 'Cancha serrana',           'Granos, harinas y pastas',    'Estante 1',  3,    'kg',  5,    6.00,  '2026-03-15'),
  ('INS005', 'Cebolla morada',           'Vegetales',                   'Estante 4',  5,    'kg',  3,    3.00,  '2026-04-03'),
  ('INS006', 'Cebolla roja',             'Vegetales',                   'Estante 4',  20,   'kg',  8,    3.00,  '2026-04-01'),
  ('INS016', 'Choclo desgranado',        'Vegetales',                   'Estante 4',  6,    'kg',  3,    5.00,  '—'),
  ('INS007', 'Culantro',                 'Vegetales',                   'Estante 6',  0.4,  'kg',  1,    4.00,  '2026-03-18'),
  ('INS024', 'Frejol canario',           'Legumbres',                   'Estante 1',  8,    'kg',  5,    7.00,  '—'),
  ('INS036', 'Harina de trigo',          'Granos, harinas y pastas',    'Estante 1',  10,   'kg',  5,    3.00,  '2026-03-29'),
  ('INS012', 'Huacatay',                 'Condimentos y especias',      'Estante 6',  0.8,  'kg',  1,    6.00,  '—'),
  ('INS035', 'Huevos',                   'Lácteos y huevos',            'Estante 7',  182,  'und', 60,   0.40,  '2026-04-03'),
  ('INS034', 'Leche evaporada',          'Lácteos y huevos',            'Estante 7',  20,   'lt',  10,   4.50,  '2026-03-31'),
  ('INS017', 'Lechuga',                  'Vegetales',                   'Estante 6',  8,    'kg',  3,    3.00,  '2026-04-02'),
  ('INS004', 'Limon',                    'Frutas',                      'Estante 6',  22,   'kg',  8,    4.00,  '2026-04-01'),
  ('INS025', 'Lomo fino de res',         'Carnes',                      'Estante 9',  16,   'kg',  8,    32.00, '2026-03-30'),
  ('INS039', 'Maiz morado',              'Granos, harinas y pastas',    'Estante 1',  8,    'kg',  5,    4.00,  '—'),
  ('INS037', 'Mantequilla',              'Lácteos y huevos',            'Estante 7',  5,    'kg',  3,    18.00, '2026-03-27'),
  ('INS033', 'Mayonesa',                 'Cremas, salsas y vinagres',   'Estante 3',  5,    'lt',  3,    8.00,  '—'),
  ('INS013', 'Papa amarilla',            'Tubérculos',                  'Estante 2',  42,   'kg',  15,   3.50,  '2026-04-02'),
  ('INS008', 'Papa blanca',              'Tubérculos',                  'Estante 2',  40,   'kg',  15,   2.50,  '2026-04-01'),
  ('INS022', 'Pasta de aji panca',       'Condimentos y especias',      'Estante 5',  3,    'kg',  2,    12.00, '2026-03-22'),
  ('INS001', 'Pescado fresco (corvina)', 'Pescados y mariscos',         'Estante 8',  26,   'kg',  10,   25.00, '2026-04-03'),
  ('INS029', 'Pimienta negra',           'Condimentos y especias',      'Estante 5',  1,    'kg',  0.5,  25.00, '—'),
  ('INS040', 'Pisco',                    'Bebidas',                     'Estante 10', 5,    'lt',  3,    20.00, '2026-03-28'),
  ('INS026', 'Pollo entero',             'Carnes',                      'Estante 9',  35,   'kg',  15,   10.00, '2026-04-03'),
  ('INS003', 'Pulpo',                    'Pescados y mariscos',         'Estante 8',  6,    'kg',  3,    30.00, '2026-03-26'),
  ('INS041', 'Queso fresco',             'Lácteos y huevos',            'Estante 7',  5,    'kg',  3,    15.00, '—'),
  ('INS028', 'Sal',                      'Condimentos y especias',      'Estante 5',  5,    'kg',  3,    1.50,  '2026-03-30'),
  ('INS031', 'Sillao',                   'Cremas, salsas y vinagres',   'Estante 3',  4.4,  'lt',  2,    8.00,  '—'),
  ('INS023', 'Tallarin',                 'Granos, harinas y pastas',    'Estante 1',  10,   'kg',  5,    5.00,  '2026-03-29'),
  ('INS009', 'Tomate',                   'Vegetales',                   'Estante 4',  15,   'kg',  8,    4.00,  '2026-04-02'),
  ('INS032', 'Vinagre',                  'Cremas, salsas y vinagres',   'Estante 3',  3,    'lt',  1,    4.00,  '—');
