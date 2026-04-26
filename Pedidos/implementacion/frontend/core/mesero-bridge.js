/**
 * mesero-bridge.js — MiRest con IA
 * Puente entre el runtime modular y las capas PWA.
 *
 * Se encarga de:
 *  1. FAB mobile: mostrar/ocultar según selección activa
 *  2. Panel sheet: abrir #managementPanel como bottom-sheet en mobile
 *  3. Cierre del panel al hacer tap en el backdrop
 *  4. Sincronización del label del FAB con la tabla/pedido activo
 *  5. Deep-link por query param (?mode=salon/delivery/takeaway)
 *  6. Clic en notificación push → navegar automáticamente al modo correcto
 */

// ── Elementos del DOM ─────────────────────────────────────────────
const fab       = () => document.getElementById('orderFAB');
const panel     = () => document.getElementById('managementPanel');
const body      = document.body;
const VALID_MODES = new Set(['salon', 'delivery', 'takeaway']);

// Detectar si está en modo PWA (pwa-shell activa)
const isPWAShell = () => body.classList.contains('pwa-shell');

// ── 1. Crear backdrop del panel sheet ──────────────────────────────
const sheetBackdrop = document.createElement('button');
sheetBackdrop.id = 'panelSheetBackdrop';
sheetBackdrop.className = 'panel-sheet-backdrop';
sheetBackdrop.setAttribute('aria-label', 'Cerrar panel de pedido');
sheetBackdrop.setAttribute('type', 'button');
sheetBackdrop.style.cssText = `
  display: none;
  position: fixed;
  inset: 0;
  z-index: 38;
  background: rgba(0,0,0,0.45);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  border: none;
  cursor: pointer;
`;
document.body.appendChild(sheetBackdrop);

// ── 2. FAB click → abrir panel como sheet ─────────────────────────
document.body.addEventListener('click', (e) => {
  // Clic en FAB
  if (e.target.closest('#orderFAB')) {
    if (!isPWAShell()) return;
    openPanelSheet();
    return;
  }

  // Clic en backdrop → cerrar
  if (e.target === sheetBackdrop || e.target.id === 'panelSheetBackdrop') {
    closePanelSheet();
    return;
  }

  // Clic en botón de cierre del panel sheet
  if (e.target.closest('[data-close-panel-sheet]')) {
    closePanelSheet();
    return;
  }

  // Clic en una mesa / card de delivery / takeaway → actualizar FAB
  const tableCard   = e.target.closest('[data-select-table]');
  const delivCard   = e.target.closest('[data-select-delivery]');
  const takeawCard  = e.target.closest('[data-select-takeaway]');

  if ((tableCard || delivCard || takeawCard) && isPWAShell()) {
    // Esperar a que el runtime actualice el panel (next microtask)
    requestAnimationFrame(() => updateFAB());
  }
});

// ── 3. Abrir panel como bottom-sheet ──────────────────────────────
function openPanelSheet() {
  const panelEl = panel();
  if (!panelEl) return;

  if (!hasActionablePanelContent(panelEl)) {
    window._mirestShowToast?.({
      title: 'Selecciona un pedido',
      message: 'Elige una mesa o pedido para abrir el detalle.',
      tone: 'info',
    });
    updateFAB();
    return;
  }

  // Añadir handle bar si no existe
  if (!panelEl.querySelector('.bottom-sheet__handle')) {
    const handle = document.createElement('div');
    handle.className = 'bottom-sheet__handle';
    panelEl.insertAdjacentElement('afterbegin', handle);
  }

  // Añadir botón cerrar si no existe
  if (!panelEl.querySelector('[data-close-panel-sheet]')) {
    const closeBtn = document.createElement('button');
    closeBtn.className = 'icon-btn icon-btn--ghost';
    closeBtn.setAttribute('data-close-panel-sheet', '');
    closeBtn.setAttribute('aria-label', 'Cerrar panel');
    closeBtn.setAttribute('type', 'button');
    closeBtn.innerHTML = `<span style="font-size:18px;line-height:1">×</span>`;
    closeBtn.style.cssText = `
      position: absolute;
      top: 16px;
      right: 16px;
      z-index: 2;
    `;
    panelEl.style.position = 'relative';
    panelEl.insertAdjacentElement('afterbegin', closeBtn);
  }

  body.classList.add('panel-sheet-open');
  sheetBackdrop.style.display = 'block';

  // Vibración háptica (Android)
  if (navigator.vibrate) navigator.vibrate(40);
}

// ── 4. Cerrar panel sheet ─────────────────────────────────────────
function closePanelSheet() {
  body.classList.remove('panel-sheet-open');
  sheetBackdrop.style.display = 'none';
}

function hasActionablePanelContent(panelEl) {
  if (!panelEl || !panelEl.innerHTML.trim()) return false;
  if (panelEl.querySelector('.panel-shell')) return true;
  return Boolean(panelEl.querySelector('[data-process-payment], [data-advance-delivery], [data-advance-takeaway], [data-update-table-status]'));
}

// ── 5. Actualizar FAB según estado del panel ──────────────────────
function updateFAB() {
  const fabEl   = fab();
  const panelEl = panel();
  if (!fabEl || !isPWAShell()) return;

  const panelHasContent = hasActionablePanelContent(panelEl);

  // Detectar el modo actual
  const mode = body.dataset.mode || 'salon';

  // Leer contexto del panel para el label
  let label = 'Ver pedido';
  if (panelEl) {
    const tableNum  = panelEl.querySelector('[data-table-number], .panel-table-number, h3');
    const itemCount = panelEl.querySelectorAll('.order-line-item, [data-product-id], .item-row').length;
    const tableName = tableNum?.textContent?.trim();

    if (mode === 'salon' && tableName) {
      label = itemCount > 0
        ? `Mesa ${tableName} · ${itemCount} ${itemCount === 1 ? 'ítem' : 'ítems'}`
        : `Mesa ${tableName}`;
    } else if (mode === 'delivery') {
      label = 'Ver pedido delivery';
    } else if (mode === 'takeaway') {
      label = 'Ver para llevar';
    }
  }

  // Mostrar u ocultar FAB
  fabEl.hidden = !panelHasContent;

  const labelEl = fabEl.querySelector('#orderFABLabel');
  if (labelEl) labelEl.textContent = label;
}

// ── 6. MutationObserver: detectar cambios en el panel ────────────
// Cuando el runtime hace render() y actualiza #managementPanel,
// actualizamos el FAB automáticamente.
const panelObserver = new MutationObserver(() => {
  if (isPWAShell()) {
    updateFAB();
    // Si el panel sheet estaba abierto, mantener abierto con contenido nuevo
    if (body.classList.contains('panel-sheet-open')) {
      // Volver a añadir los controles del sheet si fueron borrados por el re-render
      openPanelSheet();
    }
  }
});

// Observar el contenedor del panel cuando esté disponible
function startObservingPanel() {
  const panelEl = panel();
  if (panelEl) {
    panelObserver.observe(panelEl, { childList: true, subtree: false });
    return;
  }
  // Panel aún no existe en DOM → reintentar
  setTimeout(startObservingPanel, 400);
}
startObservingPanel();

// ── 7. Observar cambios de modo ───────────────────────────────────
// Cuando el runtime cambia data-mode en body, cerrar el panel sheet
// y actualizar el FAB.
new MutationObserver((mutations) => {
  for (const m of mutations) {
    if (m.attributeName === 'data-mode') {
      closePanelSheet();
      requestAnimationFrame(updateFAB);
    }
  }
}).observe(body, { attributes: true, attributeFilter: ['data-mode'] });

// ── 8. Deep-link por query param ─────────────────────────────────
// Si la URL tiene ?mode=delivery, simular clic en el mode-switch correcto
// (funciona tanto en PWA installada con shortcuts como en browser normal)
(function handleModeQueryParam() {
  const params = new URLSearchParams(location.search);
  const modeParam = params.get('mode');
  if (!modeParam) return;

  if (!VALID_MODES.has(modeParam)) {
    const clean = new URL(location.href);
    clean.searchParams.delete('mode');
    history.replaceState({}, '', clean.toString());
    return;
  }

  // Esperar a que el runtime renderice el mode-switcher
  const tryClick = (attempt = 0) => {
    const modeBtn = document.querySelector(`[data-set-mode="${modeParam}"]`);
    if (modeBtn) {
      modeBtn.click();
      // Limpiar el param de la URL para no disparar en recargas
      const clean = new URL(location.href);
      clean.searchParams.delete('mode');
      history.replaceState({}, '', clean.toString());
    } else if (attempt < 10) {
      setTimeout(() => tryClick(attempt + 1), 200);
    }
  };
  setTimeout(tryClick, 300);
})();

// ── 9. Share target handler ───────────────────────────────────────
// Si la app fue abierta via share (desde WhatsApp)
(function handleShareTarget() {
  const params = new URLSearchParams(location.search);
  const shareText = params.get('share_text') || params.get('text');
  if (!shareText) return;

  // Esperar a que el runtime esté listo y mostrar un toast informativo
  setTimeout(() => {
    const toastFn = window._mirestShowToast;
    if (toastFn) {
      toastFn({
        title: 'Contenido recibido',
        message: `Recibido por compartir: "${shareText.slice(0, 60)}"`,
        tone: 'info',
      });
    }
  }, 800);
})();

// ── 10. Exponer showToast globalmente ─────────────────────────────
// El runtime modular usa este wrapper global para que otros módulos puedan emitir toasts.
window._mirestShowToast = ({ title = '', message = '', tone = 'info' } = {}) => {
  const toastRoot = document.getElementById('toastRoot');
  if (!toastRoot) return;

  const toast = document.createElement('div');
  toast.className = `toast toast--${tone}`;
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `
    <div>
      <strong style="display:block;font-size:13px;margin-bottom:2px">${title}</strong>
      <p style="font-size:12px;opacity:.85">${message}</p>
    </div>
  `;
  toastRoot.appendChild(toast);
  setTimeout(() => {
    toast.style.transition = 'all 0.3s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};

// ── Init: actualizar FAB al cargar ────────────────────────────────
// Esperar a que el runtime haga su primer render
setTimeout(updateFAB, 600);

console.info('[bridge] Mesero bridge activo ✓');
