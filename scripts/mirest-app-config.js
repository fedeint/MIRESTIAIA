/**
 * Configuración de shell (DallIA, alertas, toggles de módulos, horarios, tour, negocio)
 * persistida en public.restaurant_settings (JSONB por restaurante) como fuente de verdad
 * con caché en localStorage. La lista "usuarios" del panel Configuración queda solo en local.
 */
import { supabase } from "./supabase.js";

export const MIREST_SHELL_CONFIG_KEY = "mirest_shell_v1";
export const MIREST_CONFIG_STORAGE_KEY = "mirest_config";

/** @type {const} */
const SYNCED_ROOT_KEYS = [
  "dallIA",
  "alertas",
  "modulos",
  "horarios",
  "tour",
  "restaurante",
];

function isPlainObject(x) {
  return x != null && typeof x === "object" && !Array.isArray(x);
}

/** Mezcla profunda solo de objetos planos (suficiente para el JSON de configuración). */
export function deepMerge(base, override) {
  if (!isPlainObject(base) || !isPlainObject(override)) return override;
  const out = { ...base };
  for (const k of Object.keys(override)) {
    const b = out[k];
    const o = override[k];
    if (isPlainObject(b) && isPlainObject(o)) {
      out[k] = deepMerge(b, o);
    } else {
      out[k] = o;
    }
  }
  return out;
}

/**
 * Aplica a `target` (estado de la app) los fragmentos de servidor, sin tocar `usuarios` ni otras claves no sincronizadas.
 * @param {object} defaultRoot
 * @param {object} target
 * @param {object | null} remoteValue - típicamente { dallIA, alertas, ... } sin usuarios
 */
export function applyRemoteConfigFragments(defaultRoot, target, remoteValue) {
  if (!remoteValue || typeof remoteValue !== "object") return;
  for (const key of SYNCED_ROOT_KEYS) {
    if (remoteValue[key] === undefined) continue;
    const d = defaultRoot[key];
    const t = target[key];
    if (d != null && typeof t === "object" && remoteValue[key] != null) {
      target[key] = deepMerge(structuredClone(d), remoteValue[key]);
    }
  }
}

/**
 * Sube solo las claves sincronizables (excl. usuarios).
 * @param {object} state - ConfigStore.state
 */
export function buildRemotePayload(state) {
  const out = {};
  for (const key of SYNCED_ROOT_KEYS) {
    if (state[key] != null) out[key] = state[key];
  }
  return out;
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} tenantId
 * @param {string | null | undefined} profileRestaurantId
 * @returns {Promise<string | null>}
 */
export async function resolveDefaultRestaurantId(supabase, tenantId, profileRestaurantId) {
  if (profileRestaurantId) return String(profileRestaurantId);
  const { data, error } = await supabase
    .from("restaurants")
    .select("id")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) {
    console.warn("[mirest-app-config] restaurants:", error);
    return null;
  }
  return data?.id != null ? String(data.id) : null;
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} restaurantId
 * @returns {Promise<Record<string, unknown> | null>} fragmento de estado (claves de SYNC) o null
 */
export async function fetchRestaurantAppConfig(supabase, restaurantId) {
  const { data, error } = await supabase
    .from("restaurant_settings")
    .select("value, updated_at")
    .eq("restaurant_id", restaurantId)
    .eq("key", MIREST_SHELL_CONFIG_KEY)
    .maybeSingle();
  if (error) {
    console.warn("[mirest-app-config] fetch", error);
    return null;
  }
  if (!data?.value || typeof data.value !== "object") return null;
  return /** @type {Record<string, unknown>} */ (data.value);
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} tenantId
 * @param {string} restaurantId
 * @param {object} valuePayload
 */
export async function saveRestaurantAppConfig(
  supabase,
  tenantId,
  restaurantId,
  valuePayload
) {
  return supabase.from("restaurant_settings").upsert(
    {
      tenant_id: tenantId,
      restaurant_id: restaurantId,
      key: MIREST_SHELL_CONFIG_KEY,
      value: valuePayload,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "restaurant_id,key" }
  );
}

/**
 * Lector para otros módulos (caché local, sin I/O de red).
 * @returns {object | null}
 */
export function getCachedMirestConfig() {
  try {
    const raw = localStorage.getItem(MIREST_CONFIG_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
