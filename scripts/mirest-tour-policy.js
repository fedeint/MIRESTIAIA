/**
 * Política de tours (onboarding) por módulo: se lee de la caché de Configuración
 * (`mirest_config` / restaurant_settings mirest_shell_v1.tour) que el superadmin
 * ajusta en Configuración del sistema.
 *
 * Claves habituales:
 * - `pedidos` — PWA `Pedidos/implementacion` (PRE/PRO/POST) y tour shell con `data-module-key=pedidos`
 * - `clientes` — tour multivista CRM (`Clientes/tour-interactivo.js`) y tour shell `clientes`
 */
import { getCachedMirestConfig } from "./mirest-app-config.js";

function isTourValueOff(v) {
  return v === false || v === "false" || v === 0 || v === "0";
}

function isTourValueOn(v) {
  return v === true || v === "true" || v === 1 || v === "1";
}

/**
 * @param {string} moduleKey - clave de `MIREST_MODULE_ONBOARDING` (p. ej. pedidos, clientes, caja)
 * @returns {boolean}
 */
export function isMirestModuleTourEnabled(moduleKey) {
  const c = getCachedMirestConfig();
  const tour = c && typeof c === "object" && c.tour && typeof c.tour === "object" ? c.tour : null;
  if (!tour) return true;
  if (isTourValueOff(tour.modulosHabilitado)) return false;
  const per = tour.activoPorModulo;
  if (per && typeof per === "object" && Object.prototype.hasOwnProperty.call(per, moduleKey)) {
    const v = per[moduleKey];
    if (isTourValueOff(v)) return false;
    if (isTourValueOn(v)) return true;
    return true;
  }
  return true;
}
