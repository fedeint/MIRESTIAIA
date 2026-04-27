/**
 * Regla: public.tenants.dalla_activo_por_modulo[clave] === false → no mostrar DallA en esa vista.
 * Mapea data-module-key del <body> a claves de config_modulo_key.
 */
import { supabase } from "./supabase.js";

const MODULE_KEY_TO_DALLA_TENANT = {
  dashboard: "dalla",
  ia: "dalla",
  configuracion: "dalla",
  pedidos: "pedidos",
  cocina: "cocina",
  caja: "caja",
  almacen: "almacen",
  productos: "productos",
  recetas: "recetas",
  proveedores: "proveedores",
  clientes: "clientes",
  facturacion: "facturacion",
  reportes: "reportes",
  // delivery: solo si una vista lo declara en el body
  delivery: "delivery",
};

/**
 * @param {string} [pageKey] — document.body.dataset.moduleKey
 * @returns {string | null} clave en tenants.dalla_activo_por_modulo, o null = no aplica regla (mostrar)
 */
export function mapPageKeyToDallaTenantKey(pageKey) {
  if (!pageKey) return null;
  return Object.prototype.hasOwnProperty.call(MODULE_KEY_TO_DALLA_TENANT, pageKey)
    ? MODULE_KEY_TO_DALLA_TENANT[pageKey]
    : null;
}

/**
 * @param {Record<string, unknown> | null | undefined} modMap
 * @param {string | null} tenantKey
 */
export function isDallaModuloEnabledInMap(modMap, tenantKey) {
  if (tenantKey == null) return true;
  if (!modMap || typeof modMap !== "object") return true;
  return modMap[tenantKey] !== false;
}

/**
 * @returns {Promise<Record<string, unknown> | null>} null = sin sesión o error (comportamiento permisivo: se asume visible)
 */
export async function fetchDallaActivoPorModuloMap() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: p } = await supabase
      .from("usuarios")
      .select("tenant_id")
      .eq("id", user.id)
      .maybeSingle();
    if (!p?.tenant_id) return null;
    const { data: t, error } = await supabase
      .from("tenants")
      .select("dalla_activo_por_modulo")
      .eq("id", p.tenant_id)
      .maybeSingle();
    if (error) {
      console.warn("[dallia-visibility] tenants", error);
      return null;
    }
    const raw = t?.dalla_activo_por_modulo;
    return raw && typeof raw === "object" ? /** @type {Record<string, unknown>} */ (raw) : {};
  } catch (e) {
    console.warn("[dallia-visibility]", e);
    return null;
  }
}

/**
 * Si el tenant desactiva DallA en el módulo actual, no se debe inyectar el dock ni el botón del topbar.
 * Sin sesión o sin filas: se muestra (comportamiento previo al control centralizado).
 */
export async function shouldShowDallAForCurrentPage() {
  const pageKey = (document.body && document.body.dataset && document.body.dataset.moduleKey) || "";
  const tenantKey = mapPageKeyToDallaTenantKey(pageKey);
  const modMap = await fetchDallaActivoPorModuloMap();
  if (modMap == null) return true;
  return isDallaModuloEnabledInMap(modMap, tenantKey);
}
