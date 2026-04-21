/**
 * Cierra la sesión en este dispositivo si no hay interacción durante `idleMs`.
 * Útil cuando alguien deja el panel abierto en un móvil o terminal compartido.
 */

const DEFAULT_IDLE_MS = 30 * 60 * 1000;
const DEFAULT_TICK_MS = 30 * 1000;

const LISTENER_OPTS = { capture: true, passive: true };
const ACTIVITY_EVENTS = ["pointerdown", "keydown", "wheel", "touchstart", "scroll"];

export function startSessionIdleTimeout({
  idleMs = DEFAULT_IDLE_MS,
  tickMs = DEFAULT_TICK_MS,
  getLoginHref,
  signOut,
} = {}) {
  if (typeof getLoginHref !== "function" || typeof signOut !== "function") {
    console.warn("[session-idle-timeout] getLoginHref y signOut son obligatorios.");
    return () => {};
  }

  let lastActivity = Date.now();

  const bump = () => {
    lastActivity = Date.now();
  };

  for (const ev of ACTIVITY_EVENTS) {
    window.addEventListener(ev, bump, LISTENER_OPTS);
  }

  const intervalId = setInterval(async () => {
    if (Date.now() - lastActivity < idleMs) return;
    clearInterval(intervalId);
    for (const ev of ACTIVITY_EVENTS) {
      window.removeEventListener(ev, bump, LISTENER_OPTS);
    }
    try {
      await signOut();
    } catch (err) {
      console.error("[session-idle-timeout] signOut:", err);
    } finally {
      window.location.assign(getLoginHref());
    }
  }, tickMs);

  return () => {
    clearInterval(intervalId);
    for (const ev of ACTIVITY_EVENTS) {
      window.removeEventListener(ev, bump, LISTENER_OPTS);
    }
  };
}
