/**
 * Lectura/actualización de pedidos `channel=delivery` (Supabase). Entrada de UI: módulo Pedidos (modo delivery), no app Delivery aparte.
 */
import { supabase } from "./supabase.js";

/** Mapea estado Supabase (Pedidos) a columnas del kanban local. */
function mapToKanban(status) {
  const s = String(status || "").toLowerCase();
  if (s === "open" || s === "pending" || s === "received" || s === "pendiente") return "pendiente";
  if (s === "in_kitchen" || s === "preparando" || s === "preparacion" || s === "preparing") return "preparacion";
  if (s === "ready" || s === "in_route" || s === "listo" || s === "ruta") return "listo";
  return "pendiente";
}

/** Botón: siguiente estado en DallA; si el último, ocultar (served/closed). */
const NEXT_STATUS = {
  pendiente: "in_kitchen",
  preparacion: "ready",
  listo: "served",
};

/**
 * @returns {Promise<{
 *   ok: boolean,
 *   notAuthenticated?: boolean,
 *   message?: string,
 *   rows: object[],
 *   error?: string
 * }>}
 */
export async function fetchDeliveryBoardRows() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    return { ok: true, notAuthenticated: true, message: "Inicia sesión para ver pedidos delivery reales.", rows: [] };
  }

  const selectWithLines =
    "id, status, channel, total, opened_at, metadata, customer_id, order_items(quantity, line_total, product_id)";
  let { data: ords, error } = await supabase
    .from("orders")
    .select(selectWithLines)
    .eq("channel", "delivery")
    .in("status", ["open", "pending", "in_kitchen", "preparing", "ready", "in_route", "received"])
    .order("opened_at", { ascending: true });

  if (error) {
    const { data: ords2, error: e2 } = await supabase
      .from("orders")
      .select("id, status, channel, total, opened_at, metadata, customer_id")
      .eq("channel", "delivery")
      .in("status", ["open", "pending", "in_kitchen", "preparing", "ready", "in_route", "received"])
      .order("opened_at", { ascending: true });
    if (e2) {
      return { ok: false, error: e2.message, message: e2.message, rows: [] };
    }
    ords = ords2;
  }

  const rows = ords || [];
  const cids = [...new Set(rows.map((o) => o.customer_id).filter(Boolean))];
  const custById = new Map();
  if (cids.length) {
    const { data: customers } = await supabase.from("customers").select("id, full_name, phone, metadata").in("id", cids);
    (customers || []).forEach((c) => custById.set(c.id, c));
  }

  const allPids = new Set();
  for (const o of rows) {
    for (const li of o.order_items || []) {
      if (li?.product_id) allPids.add(li.product_id);
    }
  }
  const pids = [...allPids];
  const prodById = new Map();
  if (pids.length) {
    const { data: prods } = await supabase.from("products").select("id, name, price").in("id", pids);
    (prods || []).forEach((p) => prodById.set(p.id, p));
  }

  const mapped = rows.map((o) => {
    const m = o.metadata && typeof o.metadata === "object" ? o.metadata : {};
    const cust = o.customer_id ? custById.get(o.customer_id) : null;
    const cm = cust && cust.metadata && typeof cust.metadata === "object" ? cust.metadata : {};
    const name = (cust && cust.full_name) || m.customer_name || "Cliente";
    const address = m.delivery_address || m.direccion || m.address || cm.direccion || "—";
    const partner = m.partner || m.canal || m.afiliado || m.channel_label || "Delivery";
    const rider = m.rider || m.driver || "";

    const items = (o.order_items || []).map((li) => {
      const pr = li.product_id ? prodById.get(li.product_id) : null;
      const nm = pr?.name || "Producto";
      const prc = li.line_total != null ? Number(li.line_total) / (Number(li.quantity) || 1) : (pr && Number(pr.price)) || 0;
      return {
        qty: Number(li.quantity) || 1,
        name: nm,
        price: Math.round(prc * 100) / 100,
      };
    });

    const st = mapToKanban(o.status);
    const totalNum = o.total != null ? Number(o.total) : 0;
    const sumLines = items.reduce((s, it) => s + it.qty * it.price, 0);
    const price = totalNum > 0 ? totalNum : sumLines;
    const opened = o.opened_at ? new Date(o.opened_at) : new Date();
    const timeStr = opened.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });

    return {
      id: String(o.id),
      orderDbId: o.id,
      customer: name,
      address: String(address),
      channel: String(partner),
      status: st,
      dbStatus: o.status,
      price: Math.round(price * 100) / 100,
      time: timeStr,
      items,
      rider: rider ? String(rider) : null,
      connected: true,
    };
  });

  return { ok: true, rows: mapped };
}

/**
 * @param {string} orderId UUID
 * @param {string} kanbanStatus 'pendiente' | 'preparacion' | 'listo'
 */
export async function advanceDeliveryOrderStatus(orderId, kanbanStatus) {
  const next = NEXT_STATUS[kanbanStatus];
  if (!next) return { ok: false, message: "Estado no avanzable" };
  const { error } = await supabase.from("orders").update({ status: next }).eq("id", orderId);
  if (error) return { ok: false, message: error.message || "Error al actualizar" };
  return { ok: true, nextStatus: next };
}
