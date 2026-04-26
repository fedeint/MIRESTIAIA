import { escapeHtml } from '../../core/ui-helpers.js';

function renderPrinterCard(printer, roleKey) {
  const connectionLabel = roleKey === 'boletero' ? 'Bluetooth' : 'Cable USB';
  return `
    <article class="settings-card settings-card--printer">
      <div class="settings-card__header">
        <div>
          <p class="sidebar__label">${escapeHtml(printer.role)}</p>
          <h3>${escapeHtml(printer.name)}</h3>
        </div>
        <span class="badge badge--${printer.status === 'connected' ? 'success' : 'danger'}">
          ${printer.status === 'connected' ? 'Conectado' : 'Desconectado'}
        </span>
      </div>
      <div class="panel-stack">
        <div class="detail-row"><span>Modelo</span><strong>${escapeHtml(printer.model)}</strong></div>
        <div class="detail-row"><span>Ubicación</span><strong>${escapeHtml(printer.location)}</strong></div>
        <div class="detail-row"><span>Conexión</span><strong>${escapeHtml(connectionLabel)}</strong></div>
      </div>
      <button type="button" class="btn btn--secondary btn--sm" data-toggle-printer="${escapeHtml(roleKey)}">
        ${printer.status === 'connected' ? 'Marcar desconectada' : 'Marcar conectada'}
      </button>
    </article>
  `;
}

function renderPrinterManagerPreview() {
  return `
    <section class="module-section-card settings-card settings-card--compact">
      <header class="module-section-card__header">
        <div>
          <p class="eyebrow">Impresoras</p>
          <h3>Gestionar ticketeras</h3>
        </div>
      </header>
      <p class="workspace-note">
        Revisa la ticketera y la facturadora en un panel centrado para validar si están conectadas por bluetooth o cable.
      </p>
      <button type="button" class="btn btn--secondary" data-open-printer-center>
        Gestionar ticketeras
      </button>
    </section>
  `;
}

function renderMeseroTutorials() {
  return `
    <section class="module-section-card settings-card settings-card--compact">
      <header class="module-section-card__header">
        <div>
          <p class="eyebrow">Tutorial</p>
          <h3>Realizar tutorial</h3>
        </div>
      </header>
      <p class="workspace-note">
        Te lleva al modo salón y vuelve a lanzar la guía contextual para repasar el flujo principal.
      </p>
      <div class="settings-actions">
        <button type="button" class="btn btn--ghost btn--sm" data-start-salon-tutorial>Realizar tutorial</button>
      </div>
    </section>
  `;
}

function renderAdminTutorials() {
  return `
    <section class="module-section-card settings-card settings-card--compact">
      <header class="module-section-card__header">
        <div>
          <p class="eyebrow">Tutoriales</p>
          <h3>Realizar tutorial</h3>
        </div>
      </header>
      <div class="settings-actions">
        <button type="button" class="btn btn--ghost btn--sm" data-start-salon-tutorial>Realizar tutorial</button>
        <button type="button" class="btn btn--ghost btn--sm" data-relaunch-onboarding="pre">Ver PRE</button>
        <button type="button" class="btn btn--ghost btn--sm" data-relaunch-onboarding="post">Ver POST</button>
      </div>
    </section>
  `;
}

function renderLogoutCard() {
  return `
    <section class="module-section-card settings-card settings-card--danger">
      <header class="module-section-card__header">
        <div>
          <p class="eyebrow">Sesión</p>
          <h3>Cerrar turno de mesero</h3>
        </div>
      </header>
      <p class="workspace-note">
        Revisa pendientes, confirma que dejas la estación lista y luego limpia esta cuenta del dispositivo.
      </p>
      <button type="button" class="btn btn--danger" data-logout-session>Revisar y cerrar sesión</button>
    </section>
  `;
}

export function renderPrinterCenter(state) {
  return `
    <div class="modal__header">
      <div>
        <p class="eyebrow" style="margin-bottom:4px">Impresoras</p>
        <h3 class="modal__title">Ticketeras y facturadora</h3>
      </div>
      <button type="button" class="icon-btn icon-btn--ghost" data-close-printer-center aria-label="Cerrar">
        ×
      </button>
    </div>
    <div class="modal__body printer-center-modal__body">
      <p class="workspace-note">
        Aquí puedes validar rápidamente qué impresoras están conectadas y si trabajan por bluetooth o cable.
      </p>
      <div class="settings-grid printer-center-modal__grid">
        ${renderPrinterCard(state.printers.boletero, 'boletero')}
        ${renderPrinterCard(state.printers.factura, 'factura')}
      </div>
    </div>
  `;
}

function renderMeseroConfig() {
  return `
    <section class="module-shell module-shell--configuracion">
      ${renderPrinterManagerPreview()}
      ${renderMeseroTutorials()}
      ${renderLogoutCard()}
    </section>
  `;
}

function renderGeneralConfig() {
  return `
    <section class="module-shell module-shell--configuracion">
      ${renderPrinterManagerPreview()}
      ${renderAdminTutorials()}
      ${renderLogoutCard()}
    </section>
  `;
}

export function renderConfiguracionModule({ state }) {
  if (state.userRole === 'mesero') {
    return renderMeseroConfig();
  }

  return renderGeneralConfig(state);
}
