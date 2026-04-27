/**
 * Personal operativo (Accesos / Supabase Auth) vía edge manage-user-access.
 * Sin datos de muestra: si no hay filas, el backend devuelve `empty` + paso de onboarding.
 */
import { supabase, supabaseUrl, supabaseKey } from "./supabase.js";

const DIRECT = `${supabaseUrl}/functions/v1/manage-user-access`;
const TOKEN_IN_BODY_KEY = "__mirest_bearer";

function getManageUserEndpoint() {
  if (typeof location === "undefined") return DIRECT;
  const h = location.hostname;
  if (h === "127.0.0.1" || h === "localhost") return DIRECT;
  if (h.endsWith(".vercel.app") || h.includes("mires-ia")) {
    return `${location.origin}/api/user-access`;
  }
  return DIRECT;
}

async function callAction(payload) {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    return { ok: false, notAuthenticated: true, message: "Inicia sesión para ver al equipo operativo." };
  }

  const endpoint = getManageUserEndpoint();
  const useProxy = endpoint.includes("/api/user-access");
  const requestBody = useProxy
    ? { ...payload, [TOKEN_IN_BODY_KEY]: session.access_token }
    : payload;
  const requestHeaders = useProxy
    ? {
        apikey: supabaseKey,
        "Content-Type": "application/json",
      }
    : {
        apikey: supabaseKey,
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: requestHeaders,
    body: JSON.stringify(requestBody),
    credentials: "omit",
    cache: "no-store",
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    return { ok: false, message: data?.message || `Error ${response.status} al cargar el equipo operativo.` };
  }
  return { ok: true, data };
}

/**
 * @returns {Promise<{
 *   ok: boolean,
 *   meseros: Array<{ name: string, mesa: string, products: number, status: string, role?: string, hasLiveStatus?: boolean }>,
 *   emptyMessage?: string,
 *   onboardingStep?: number
 * }>}
 */
export async function listOperationalStaffForCaja() {
  const r = await callAction({ action: "list_operational_staff" });
  if (!r.ok) {
    return {
      ok: false,
      meseros: [],
      errorMessage: r.notAuthenticated ? r.message : r.message || "No se pudo cargar el listado.",
    };
  }
  const d = r.data;
  if (d.staff && Array.isArray(d.staff) && d.staff.length > 0) {
    const meseros = d.staff.map((s) => ({
      id: s.id,
      name: s.name,
      mesa: s.tableLabel || "—",
      products: typeof s.productCount === "number" ? s.productCount : 0,
      status: s.status === "busy" ? "busy" : s.status === "available" ? "available" : "unknown",
      role: s.role,
      hasLiveStatus: s.status === "busy" || s.status === "available",
    }));
    return { ok: true, meseros, empty: false };
  }
  return {
    ok: true,
    meseros: [],
    empty: true,
    emptyMessage: d.message || "Sin datos aún.",
    onboardingStep: d.onboardingStep,
    emptyReason: d.emptyReason,
  };
}
