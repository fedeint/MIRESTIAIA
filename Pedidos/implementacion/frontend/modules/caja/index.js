import { escapeHtml, formatCurrency, renderEmptyState } from '../../core/ui-helpers.js';

function renderAndroidMockup() {
  return `
    <section class="android-mockup-card">
      <header class="android-mockup-card__top">
        <span>9:41</span>
        <span>📶 100%</span>
      </header>
      <div class="android-mockup-card__body">
        <div class="android-mockup-card__notif is-whatsapp">
          <strong>WhatsApp</strong>
          <p>Nuevo pedido para llevar · Cliente pide 2 ceviches y 1 chicha.</p>
        </div>
        <div class="android-mockup-card__notif">
          <strong>Pedidos</strong>
          <p>Motorizado espera confirmación de boleta para delivery DL-103.</p>
        </div>
        <div class="android-mockup-card__notif is-muted">
          <strong>Caja</strong>
          <p>Última actualización hace 2 minutos.</p>
        </div>
      </div>
    </section>
  `;
}

function renderTakeawayForm() {
  return `
    <section class="module-section-card">
      <header class="module-section-card__header">
        <div>
          <p class="eyebrow">Caja</p>
          <h3>Nuevo pedido para llevar</h3>
        </div>
      </header>

      <div class="invoice-module-grid">
        <label>
          <span class="field-label">Cliente</span>
          <input class="input" type="text" placeholder="Nombre del cliente">
        </label>
        <label>
          <span class="field-label">Teléfono</span>
          <input class="input" type="text" placeholder="999 999 999">
        </label>
        <label>
          <span class="field-label">Canal</span>
          <select class="input">
            <option>WhatsApp</option>
            <option>Mostrador</option>
            <option>Llamada</option>
          </select>
        </label>
        <label>
          <span class="field-label">Promesa</span>
          <input class="input" type="text" placeholder="Ej: 20 min">
        </label>
        <label class="invoice-module-grid__full">
          <span class="field-label">Pedido</span>
          <textarea class="input textarea-lite" rows="4" placeholder="Detalle lo que pide el cliente..."></textarea>
        </label>
      </div>

      <div class="module-inline-actions">
        <button type="button" class="btn btn--primary">Registrar pedido</button>
        <button type="button" class="btn btn--secondary" data-open-module="menu">Menú</button>
      </div>
    </section>
  `;
}

export function renderCajaModule() {
  return `
    <section class="module-shell module-shell--caja">
      ${renderAndroidMockup()}
      ${renderTakeawayForm()}
    </section>
  `;
}
