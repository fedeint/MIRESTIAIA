/**
 * Clientes/CRM: lectura de Supabase (RLS + tenant en JWT). Sin filas de muestra.
 * LTV = suma de line_total de pedidos en estado "closed" o "served" con customer_id.
 */
import { supabase } from "./supabase.js";

const LTV_STATUS = new Set(["closed", "served"]);

function initials(name) {
  if (!name || typeof name !== "string") return "—";
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (p.length === 0) return "—";
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return (p[0][0] + p[1][0]).toUpperCase();
}

/**
 * @returns {Promise<{
 *   ok: boolean,
 *   notAuthenticated?: boolean,
 *   clients: object[],
 *   message?: string,
 *   onboardingStep?: number
 * }>}
 */
export async function fetchCrmClientRows() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    return { ok: false, notAuthenticated: true, clients: [], message: "Inicia sesión para ver clientes reales." };
  }

  const { data: cust, error: e0 } = await supabase
    .from("customers")
    .select("id, full_name, email, phone, document_number, tags, metadata, created_at, updated_at")
    .order("full_name", { ascending: true });

  if (e0) {
    return { ok: false, clients: [], message: e0.message || "Error al leer clientes." };
  }

  if (!cust || cust.length === 0) {
    return {
      ok: true,
      clients: [],
      message:
        "Sin clientes aún. Se crean con pedidos con CRM (paso 4 y 9 del onboarding) o carga en Contactos. Completa operación o importación.",
      onboardingStep: 9,
    };
  }

  const ids = cust.map((c) => c.id);
  const { data: orders, error: e1 } = await supabase
    .from("orders")
    .select("id, customer_id, status, opened_at, order_items(line_total)")
    .in("customer_id", ids);

  if (e1) {
    return { ok: false, clients: [], message: e1.message || "Error al leer pedidos por cliente." };
  }

  const ltvByCustomer = new Map();
  const countByCustomer = new Map();
  const lastByCustomer = new Map();

  for (const o of orders || []) {
    const cid = o.customer_id;
    if (!cid) continue;
    const st = o.status;
    if (!LTV_STATUS.has(String(st || ""))) continue;
    const lines = o.order_items || [];
    const sum = Array.isArray(lines) ? lines.reduce((s, li) => s + (Number(li?.line_total) || 0), 0) : 0;
    ltvByCustomer.set(cid, (ltvByCustomer.get(cid) || 0) + sum);
    countByCustomer.set(cid, (countByCustomer.get(cid) || 0) + 1);
    const t = o.opened_at ? new Date(o.opened_at).getTime() : 0;
    const prev = lastByCustomer.get(cid) || 0;
    if (t > prev) lastByCustomer.set(cid, t);
  }

  const now = new Date();

  const clients = cust.map((c) => {
    const id = c.id;
    const nombre = c.full_name || c.email || "—";
    const ltv = Math.round((ltvByCustomer.get(id) || 0) * 100) / 100;
    const pedidos = countByCustomer.get(id) || 0;
    const ticketPromedio = pedidos > 0 ? ltv / pedidos : 0;
    const tag0 = Array.isArray(c.tags) && c.tags.length ? c.tags[0] : null;
    const metadata = c.metadata && typeof c.metadata === "object" ? c.metadata : {};
    const ultT = lastByCustomer.get(id);
    let ultimaVisita = "—";
    if (ultT) {
      const d = new Date(ultT);
      const days = Math.floor((now - d) / 86400000);
      ultimaVisita = days === 0 ? "hoy" : days === 1 ? "ayer" : `hace ${days} días`;
    }
    const score = Math.min(100, ltv > 0 ? Math.round(25 + (ltv / 50) * 10) : 0);
    return {
      id,
      nombre,
      documento: c.document_number || "",
      email: c.email || "",
      telefono: c.phone || "",
      avatar: initials(nombre),
      tipo: tag0 || metadata?.segment || "—",
      arquetipo: metadata?.arquetipo || "—",
      ltv,
      pedidos,
      ticketPromedio,
      ultimaVisita,
      suscrito: Boolean(metadata?.suscrito),
      score,
      rfm: metadata?.rfm || { recencia: "—", frecuencia: "—", monetario: "—", engagement: score || 0 },
      comportamiento: {
        horario: metadata?.horario || "—",
        dias: metadata?.dias || "—",
        platos: Array.isArray(metadata?.platos_fav) ? metadata.platos_fav : [],
      },
      nurturing: metadata?.nurturing || {
        tactica: "—",
        estado: "—",
        proximaAccion: "—",
      },
      creadoEn: c.created_at || null,
      /** Copia de lectura para pantallas (secuencias RFM, etc.); no reemplaza columnas canónicas. */
      _metadata: metadata,
    };
  });

  return { ok: true, clients };
}
