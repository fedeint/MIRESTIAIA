/**
 * storage.js — MiRest con IA
 * Capa de persistencia:
 *   - localStorage: sesión, preferencias, onboarding
 *   - IndexedDB: menú offline, pedidos del día, cola de sync
 */

// ═══════════════════════════════════════════════════════════════
// 1. KEYS DE LOCALSTORAGE
// ═══════════════════════════════════════════════════════════════

export const STORAGE_KEYS = {
  ONBOARDING_PRE:   'mirest_onboarding_pre',
  ONBOARDING_SEEN:  'mirest_onboarding_pro_seen',
  ONBOARDING_COMPLETED: 'mirest.onboarding.completed',
  LAST_SEEN:        'mirest_last_seen',
  THEME:            'mirest_theme',
  INSTALL_DISMISSED:'mirest_install_dismissed',
  IOS_HINT_SEEN:    'mirest_ios_hint_seen',
  VISITS:           'mirest_visits',
  SESSION:          'mirest_pedidos_session',
  APP_SESSION:      'mirest_app_session',
};

// ── localStorage helpers ──────────────────────────────────────────

/**
 * Guardar un objeto en localStorage.
 * @param {string} key
 * @param {any} value
 */
export function lsSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('[storage] lsSet error:', e);
  }
}

/**
 * Leer un objeto de localStorage.
 * @param {string} key
 * @param {any} [defaultValue]
 */
export function lsGet(key, defaultValue = null) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return defaultValue;
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

/**
 * Eliminar una key de localStorage.
 * @param {string} key
 */
export function lsRemove(key) {
  try {
    localStorage.removeItem(key);
  } catch { /* noop */ }
}

function normalizeOnboardingCompleted(value) {
  if (value === true) return { completed: true };
  if (!value || typeof value !== 'object') return null;
  return {
    ...value,
    completed: value.completed !== false,
  };
}

export function getOnboardingCompleted() {
  return normalizeOnboardingCompleted(lsGet(STORAGE_KEYS.ONBOARDING_COMPLETED, null));
}

export function markOnboardingCompleted(data = {}) {
  const previous = getOnboardingCompleted() || {};
  const completedAt = previous.completedAt || data.completedAt || Date.now();
  lsSet(STORAGE_KEYS.ONBOARDING_COMPLETED, {
    ...previous,
    ...data,
    completed: true,
    completedAt,
    updatedAt: Date.now(),
  });
}

export function clearOnboardingCompleted() {
  lsRemove(STORAGE_KEYS.ONBOARDING_COMPLETED);
}

// ── Onboarding state ──────────────────────────────────────────────

/**
 * @typedef {{
 *   name: string,
 *   role: 'mesero' | 'cajero' | 'dueno' | 'cocina',
 *   dailySalary: number,
 *   payFrequency: 'semanal' | 'quincenal' | 'mensual',
 *   completedAt: number
 * }} OnboardingPreData
 */

/**
 * Guardar datos del onboarding PRE.
 * @param {OnboardingPreData} data
 */
export function saveOnboardingPre(data) {
  const payload = { ...data, completedAt: Date.now() };
  lsSet(STORAGE_KEYS.ONBOARDING_PRE, payload);
  markOnboardingCompleted(payload);
}

/**
 * Obtener datos del onboarding PRE.
 * @returns {OnboardingPreData | null}
 */
export function getOnboardingPre() {
  const legacy = lsGet(STORAGE_KEYS.ONBOARDING_PRE, null);
  if (legacy) return legacy;

  const completed = getOnboardingCompleted();
  if (!completed?.completed) return null;

  return {
    name: completed.name || 'Equipo',
    role: completed.role || 'mesero',
    dailySalary: Number(completed.dailySalary) || 45,
    payFrequency: completed.payFrequency || 'semanal',
    completedAt: completed.completedAt || completed.updatedAt || Date.now(),
  };
}

/** Obtener el rol persistido del usuario actual. */
export function getPersistedUserRole() {
  return getOnboardingPre()?.role || 'mesero';
}

/** Obtener el nombre persistido del usuario actual. */
export function getPersistedUserName() {
  return getOnboardingPre()?.name || 'Equipo';
}

/** Guardar la sesión completa de la app por rol/módulo. */
export function saveAppSession(snapshot) {
  lsSet(STORAGE_KEYS.APP_SESSION, {
    ...snapshot,
    savedAt: Date.now(),
  });
}

/** Restaurar la sesión completa de la app si sigue vigente. */
export function restoreAppSession() {
  const snap = lsGet(STORAGE_KEYS.APP_SESSION, null);
  if (!snap) return null;

  const eightHours = 8 * 60 * 60 * 1000;
  if (Date.now() - snap.savedAt > eightHours) {
    lsRemove(STORAGE_KEYS.APP_SESSION);
    return null;
  }

  return snap;
}

/** Limpiar la sesión completa de la app. */
export function clearAppSession() {
  lsRemove(STORAGE_KEYS.APP_SESSION);
}

/** ¿El usuario completó el onboarding PRE? */
export function hasCompletedOnboardingPre() {
  return getOnboardingPre() !== null || getOnboardingCompleted()?.completed === true;
}

export function hasCompletedOnboarding() {
  return hasCompletedOnboardingPre();
}

/** Marcar el tutorial PRO como visto. */
export function markOnboardingProSeen() {
  lsSet(STORAGE_KEYS.ONBOARDING_SEEN, true);
}

/** ¿El usuario ya vio el tutorial PRO? */
export function hasSeenOnboardingPro() {
  return lsGet(STORAGE_KEYS.ONBOARDING_SEEN, false) === true;
}

// ── Sesión de turno ───────────────────────────────────────────────

/**
 * Guardar snapshot de sesión (modo, zona, timestamp).
 * @param {{ mode: string, activeZone: string }} snap
 */
export function saveSession(snap) {
  lsSet(STORAGE_KEYS.SESSION, { ...snap, savedAt: Date.now() });
}

/**
 * Restaurar sesión si tiene menos de 8 horas.
 * @returns {{ mode: string, activeZone: string } | null}
 */
export function restoreSession() {
  const snap = lsGet(STORAGE_KEYS.SESSION, null);
  if (!snap) return null;
  const eightHours = 8 * 60 * 60 * 1000;
  if (Date.now() - snap.savedAt > eightHours) {
    lsRemove(STORAGE_KEYS.SESSION);
    return null;
  }
  return snap;
}

/**
 * Registrar visita y devolver el número de visitas actuales.
 * @returns {number}
 */
export function incrementVisitCount() {
  const count = (lsGet(STORAGE_KEYS.VISITS, 0) || 0) + 1;
  lsSet(STORAGE_KEYS.VISITS, count);
  return count;
}

/**
 * Actualizar timestamp de último ingreso.
 */
export function updateLastSeen() {
  lsSet(STORAGE_KEYS.LAST_SEEN, Date.now());
}

/**
 * ¿Pasaron más de N horas desde el último ingreso?
 * @param {number} [hours=4]
 * @returns {boolean}
 */
export function isLongAbsence(hours = 4) {
  const last = lsGet(STORAGE_KEYS.LAST_SEEN, 0);
  return Date.now() - last > hours * 60 * 60 * 1000;
}

// ═══════════════════════════════════════════════════════════════
// 2. INDEXEDDB (offline-first)
// ═══════════════════════════════════════════════════════════════

const DB_NAME    = 'mirest-pedidos-v1';
const DB_VERSION = 1;

/** @type {IDBDatabase | null} */
let _db = null;

/**
 * Abrir la base de datos IndexedDB.
 * @returns {Promise<IDBDatabase>}
 */
export function openDatabase() {
  if (_db) return Promise.resolve(_db);

  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = event => {
      const db = /** @type {IDBOpenDBRequest} */ (event.target).result;

      // Store de menú (cache offline completo)
      if (!db.objectStoreNames.contains('menu')) {
        const menuStore = db.createObjectStore('menu', { keyPath: 'id' });
        menuStore.createIndex('category', 'category');
      }

      // Store de pedidos del día (operación)
      if (!db.objectStoreNames.contains('orders')) {
        const ordersStore = db.createObjectStore('orders', {
          keyPath: 'id',
          autoIncrement: true,
        });
        ordersStore.createIndex('status', 'status');
        ordersStore.createIndex('source', 'source');
        ordersStore.createIndex('tableId', 'tableId');
        ordersStore.createIndex('createdAt', 'createdAt');
      }

      // Cola de sincronización (pedidos sin conexión)
      if (!db.objectStoreNames.contains('pending-sync')) {
        db.createObjectStore('pending-sync', {
          keyPath: 'id',
          autoIncrement: true,
        });
      }

      // Preferencias del device
      if (!db.objectStoreNames.contains('device-prefs')) {
        db.createObjectStore('device-prefs', { keyPath: 'key' });
      }

      console.info('[IDB] Schema creado/actualizado ✓');
    };

    req.onsuccess = event => {
      _db = /** @type {IDBOpenDBRequest} */ (event.target).result;
      _db.onerror = e => console.error('[IDB] Error global:', e);
      console.info('[IDB] Base de datos abierta ✓');
      resolve(_db);
    };

    req.onerror = event => {
      console.error('[IDB] No se pudo abrir:', event);
      reject(new Error('IDB open failed'));
    };

    req.onblocked = () => {
      console.warn('[IDB] Apertura bloqueada. Cierra otras pestañas del sistema.');
    };
  });
}

/**
 * Helper: ejecutar una transacción y devolver resultado.
 * @param {string} storeName
 * @param {'readonly' | 'readwrite'} mode
 * @param {(store: IDBObjectStore) => IDBRequest} operation
 * @returns {Promise<any>}
 */
async function idbTransaction(storeName, mode, operation) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    const req = operation(store);
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

// ── API de Menú (cache offline) ───────────────────────────────────

/**
 * Cachear todos los productos del menú.
 * @param {Array<any>} products
 */
export async function cacheMenu(products) {
  try {
    const db = await openDatabase();
    const tx = db.transaction('menu', 'readwrite');
    const store = tx.objectStore('menu');
    for (const p of products) store.put(p);
    await new Promise((res, rej) => {
      tx.oncomplete = res;
      tx.onerror = () => rej(tx.error);
    });
    console.info(`[IDB] ${products.length} productos cacheados ✓`);
  } catch (e) {
    console.warn('[IDB] cacheMenu error:', e);
  }
}

/**
 * Obtener todos los productos del menú cacheado.
 * @returns {Promise<Array<any>>}
 */
export async function getCachedMenu() {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('menu', 'readonly');
      const req = tx.objectStore('menu').getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror   = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

// ── API de Pedidos (operación offline) ───────────────────────────

/**
 * Guardar un pedido en IDB.
 * @param {any} order
 * @returns {Promise<IDBValidKey>}
 */
export async function saveOrder(order) {
  return idbTransaction('orders', 'readwrite', store =>
    store.put({ ...order, savedAt: Date.now() })
  );
}

/**
 * Obtener pedidos por estado.
 * @param {string} status
 * @returns {Promise<Array<any>>}
 */
export async function getOrdersByStatus(status) {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('orders', 'readonly');
      const req = tx.objectStore('orders').index('status').getAll(status);
      req.onsuccess = () => resolve(req.result || []);
      req.onerror   = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

// ── Cola de sincronización ────────────────────────────────────────

/**
 * Encolar un pedido para sync cuando vuelva la conexión.
 * @param {any} order
 */
export async function enqueuePendingSync(order) {
  await idbTransaction('pending-sync', 'readwrite', store =>
    store.add({ order, queuedAt: Date.now() })
  );
  console.info('[IDB] Pedido encolado para sync offline.');

  // Intentar Background Sync en Android
  if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
    const reg = await navigator.serviceWorker.ready;
    try {
      await reg.sync.register('sync-pedidos');
      console.info('[IDB] Background Sync registrado ✓');
    } catch {
      console.warn('[IDB] Background Sync no disponible.');
    }
  }
}

/**
 * Obtener todos los pedidos pendientes de sync.
 * @returns {Promise<Array<any>>}
 */
export async function getPendingSyncQueue() {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('pending-sync', 'readonly');
      const req = tx.objectStore('pending-sync').getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror   = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

/**
 * Limpiar la cola de sync después de sincronizar exitosamente.
 */
export async function clearSyncQueue() {
  const db = await openDatabase();
  db.transaction('pending-sync', 'readwrite').objectStore('pending-sync').clear();
  console.info('[IDB] Cola de sync limpiada ✓');
}

// ── Sync online/offline ───────────────────────────────────────────

/**
 * Inicializar listener de reconexión (fallback iOS).
 * Cuando vuelve la conexión, intentar sincronizar la cola.
 * @param {() => Promise<void>} syncFn
 */
export function initOfflineSync(syncFn) {
  window.addEventListener('online', async () => {
    console.info('[IDB] Conexión restaurada. Sincronizando...');
    try {
      await syncFn();
    } catch (e) {
      console.warn('[IDB] Error en sync de reconexión:', e);
    }
  });
}

// ── Init ──────────────────────────────────────────────────────────

/**
 * Inicializar el sistema de storage.
 * Llamar una vez desde bootstrap.js.
 */
export async function initStorage() {
  try {
    await openDatabase();
    updateLastSeen();
    console.info('[storage] Sistema de persistencia listo ✓');
  } catch (e) {
    console.warn('[storage] IDB no disponible, usando solo localStorage:', e);
  }
}
