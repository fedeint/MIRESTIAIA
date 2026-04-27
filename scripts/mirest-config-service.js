/**
 * Servicio de Configuración maestra (Supabase) — tablas: tenants (extendida),
 * alertas_config, tenant_modulos, tenant_horarios, auditoria_config, tenant_integraciones.
 */
import { supabase } from "./supabase.js";

const CORE_MODULOS = ["pedidos", "caja", "cocina"];

/**
 * @param {string} seccion
 * @param {'crear'|'editar'|'eliminar'|'activar'|'desactivar'} accion
 * @param {Record<string, unknown>} [detalle]
 */
export async function logConfigAudit(seccion, accion, detalle) {
  const { data: u } = await supabase.auth.getUser();
  const { data: prof } = await supabase
    .from("usuarios")
    .select("tenant_id")
    .eq("id", u.user?.id)
    .maybeSingle();
  const tid = prof?.tenant_id;
  if (!tid) return;
  const { error } = await supabase.from("auditoria_config").insert({
    tenant_id: tid,
    user_id: u.user?.id ?? null,
    seccion,
    accion,
    detalle: detalle || {},
  });
  if (error) console.warn("[auditoria_config]", error);
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} [client]
 */
export async function fetchTenantRow(client = supabase) {
  const uid = (await supabase.auth.getUser()).data.user?.id;
  if (!uid) return { tenant: null, tenantId: null };
  const { data: p } = await supabase
    .from("usuarios")
    .select("tenant_id")
    .eq("id", uid)
    .maybeSingle();
  if (!p?.tenant_id) return { tenant: null, tenantId: null };
  const { data, error } = await client
    .from("tenants")
    .select(
      "id, name, slug, dalla_nombre, dalla_tono, dalla_personalidad, dalla_activo_por_modulo, logo_url, direccion, ruc, telefono, email_contacto, zona_horaria, moneda, plan, max_usuarios, fecha_renovacion, updated_at"
    )
    .eq("id", p.tenant_id)
    .maybeSingle();
  if (error) {
    console.warn("[mirest-config] tenants", error);
    return { tenant: null, tenantId: p.tenant_id };
  }
  return { tenant: data, tenantId: p.tenant_id };
}

export async function fetchAlertas() {
  const { tenantId } = await fetchTenantRow();
  if (!tenantId) return [];
  const { data, error } = await supabase
    .from("alertas_config")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("tipo");
  if (error) {
    console.warn("[alertas_config]", error);
    return [];
  }
  return data || [];
}

export async function fetchTenantModulos() {
  const { tenantId } = await fetchTenantRow();
  if (!tenantId) return [];
  const { data, error } = await supabase
    .from("tenant_modulos")
    .select("modulo, activo, visible_en_menu, orden_menu")
    .eq("tenant_id", tenantId)
    .order("orden_menu", { ascending: true });
  if (error) {
    console.warn("[tenant_modulos]", error);
    return [];
  }
  return data || [];
}

export async function fetchTenantHorarios() {
  const { tenantId } = await fetchTenantRow();
  if (!tenantId) return [];
  const { data, error } = await supabase
    .from("tenant_horarios")
    .select("dia, hora_apertura, hora_cierre, activo, turno")
    .eq("tenant_id", tenantId);
  if (error) {
    console.warn("[tenant_horarios]", error);
    return [];
  }
  return data || [];
}

export async function hasOpenCashSession() {
  const { tenantId } = await fetchTenantRow();
  if (!tenantId) return false;
  const { count, error } = await supabase
    .from("sesiones_caja")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .is("closed_at", null);
  if (error) return false;
  return (count || 0) > 0;
}

/**
 * Guarda DallA y ficha básica en public.tenants
 * @param {object} patch
 */
export async function saveTenantPatch(patch) {
  const { tenantId } = await fetchTenantRow();
  if (!tenantId) throw new Error("Sin tenant");
  const { error, data } = await supabase
    .from("tenants")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", tenantId)
    .select()
    .single();
  if (error) throw error;
  await logConfigAudit("tenants", "editar", { tablas: "tenants", id: tenantId, patch: Object.keys(patch) });
  return data;
}

export async function upsertAlertaRow(row) {
  const { tenantId } = await fetchTenantRow();
  if (!tenantId) throw new Error("Sin tenant");
  const { error, data } = await supabase
    .from("alertas_config")
    .upsert(
      { ...row, tenant_id: tenantId, updated_at: new Date().toISOString() },
      { onConflict: "tenant_id,tipo,canal" }
    )
    .select()
    .single();
  if (error) throw error;
  await logConfigAudit("alertas_config", "editar", { id: data?.id });
  return data;
}

/** Todos los tipos de public.alerta_tipo (misma app que en UI). */
export const ALERTA_TIPOS = [
  "stock_critico",
  "caja_cerrada",
  "pedido_cobrado",
  "reporte_diario",
  "stock_agotado",
];

/**
 * Una fila lógica por `tipo` (puede haber varias con distinto canal: nos quedamos con `updated_at` más reciente).
 * @param {Array<Record<string, unknown>>} [rows]
 */
export function coalesceAlertasByTipo(rows) {
  if (!Array.isArray(rows) || !rows.length) return {};
  /** @type {Map<string, { ts: number, row: { activo: boolean, canal: string, destinatario: string, umbral_stock: number | null, hora_reporte: string | null } }>} */
  const m = new Map();
  for (const r of rows) {
    const tipo = r.tipo;
    if (typeof tipo !== "string") continue;
    const ts = new Date(String(r.updated_at || r.created_at || 0)).getTime();
    const prev = m.get(tipo);
    if (prev && ts <= prev.ts) continue;
    m.set(tipo, {
      ts,
      row: {
        activo: !!r.activo,
        canal: (r.canal && String(r.canal)) || "email",
        destinatario: (r.destinatario && String(r.destinatario)) || "",
        umbral_stock:
          r.umbral_stock != null && r.umbral_stock !== ""
            ? Number(r.umbral_stock)
            : null,
        hora_reporte: r.hora_reporte != null ? String(r.hora_reporte).slice(0, 5) : null,
      },
    });
  }
  /** @type {Record<string, { activo: boolean, canal: string, destinatario: string, umbral_stock: number | null, hora_reporte: string | null }>} */
  const out = {};
  for (const [tipo, v] of m) {
    out[tipo] = v.row;
  }
  return out;
}

/**
 * Sustituye en BD todas las filas de un `tipo` por un único registro (un destino y canal), para ajuste en UI.
 * @param {string} tipo
 * @param {object} f
 * @param {string} f.canal
 * @param {string} f.destinatario
 * @param {boolean} f.activo
 * @param {string | null | number} f.umbral_stock
 * @param {string | null} f.hora_reporte
 */
export async function saveAlertaConfigForTipo(tipo, f) {
  const { tenantId } = await fetchTenantRow();
  if (!tenantId) throw new Error("Sin tenant");
  const { error: delE } = await supabase
    .from("alertas_config")
    .delete()
    .eq("tenant_id", tenantId)
    .eq("tipo", tipo);
  if (delE) throw delE;
  const canal = f.canal || "email";
  const dest = (f.destinatario && String(f.destinatario).trim()) || null;
  let umbral =
    tipo === "stock_critico" && f.umbral_stock != null && String(f.umbral_stock) !== ""
      ? parseInt(String(f.umbral_stock), 10)
      : null;
  if (Number.isNaN(umbral)) umbral = null;
  const hora =
    tipo === "reporte_diario" && f.hora_reporte && String(f.hora_reporte).trim() !== ""
      ? String(f.hora_reporte).length <= 5
        ? String(f.hora_reporte) + ":00"
        : String(f.hora_reporte)
      : null;
  const { data, error } = await supabase
    .from("alertas_config")
    .insert({
      tenant_id: tenantId,
      tipo,
      canal,
      destinatario: dest,
      activo: !!f.activo,
      umbral_stock: umbral,
      hora_reporte: hora,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw error;
  await logConfigAudit("alertas_config", "editar", { tipo, canal: data?.canal });
  return data;
}

/**
 * Registro de “enviar prueba” (hasta conectar n8n/Edge). No dispara notificación real.
 * @param {string} tipo
 * @param {string} [canal]
 * @param {string} [dest]
 */
export async function registrarSolicitudPruebaAlerta(tipo, canal, dest) {
  await logConfigAudit("alertas_config", "crear", {
    prueba_envio: true,
    tipo,
    canal: canal || null,
    destinatario: dest || null,
  });
}

export async function updateTenantModulo(modulo, fields) {
  const { tenantId } = await fetchTenantRow();
  if (!tenantId) throw new Error("Sin tenant");
  if (CORE_MODULOS.includes(modulo) && fields.activo === false) {
    const open = await hasOpenCashSession();
    if (open) {
      throw new Error("Hay sesión de caja abierta: no se pueden desactivar módulos core (pedidos, caja, cocina).");
    }
  }
  const { data, error } = await supabase
    .from("tenant_modulos")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("tenant_id", tenantId)
    .eq("modulo", modulo)
    .select()
    .single();
  if (error) throw error;
  await logConfigAudit("tenant_modulos", "editar", { modulo });
  return data;
}

/**
 * Sincroniza los 7 días (turno unico) desde el objeto horarios { lunes: {cerrado, apertura, cierre}, ... }
 * @param {Record<string, { cerrado?: boolean, apertura?: string, cierre?: string }>} horarios
 */
export async function syncHorariosFromShell(horarios) {
  const { tenantId } = await fetchTenantRow();
  if (!tenantId) throw new Error("Sin tenant");
  const days = [
    "lunes",
    "martes",
    "miercoles",
    "jueves",
    "viernes",
    "sabado",
    "domingo",
  ];
  const rows = [];
  for (const d of days) {
    const h = horarios && horarios[d];
    const activo = h && !h.cerrado;
    rows.push({
      tenant_id: tenantId,
      dia: d,
      activo: !!activo,
      hora_apertura: h?.apertura || "08:00",
      hora_cierre: h?.cierre || "22:00",
      turno: "unico",
    });
  }
  const { error } = await supabase.from("tenant_horarios").upsert(rows, {
    onConflict: "tenant_id,dia,turno",
  });
  if (error) throw error;
  await logConfigAudit("tenant_horarios", "editar", { dias: 7 });
}

/**
 * Carga `tenant_horarios` al mapa { lunes: { cerrado, apertura, cierre } }
 */
export function mapHorariosToShell(rows) {
  const byDia = Object.fromEntries((rows || []).map((r) => [r.dia, r]));
  const out = {};
  const list = [
    "lunes",
    "martes",
    "miercoles",
    "jueves",
    "viernes",
    "sabado",
    "domingo",
  ];
  for (const d of list) {
    const r = byDia[d];
    if (r) {
      out[d] = {
        cerrado: r.activo === false,
        apertura: (r.hora_apertura || "08:00").slice(0, 5),
        cierre: (r.hora_cierre || "22:00").slice(0, 5),
      };
    } else {
      out[d] = { cerrado: true, apertura: "08:00", cierre: "22:00" };
    }
  }
  return out;
}
