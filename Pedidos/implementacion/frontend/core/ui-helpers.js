import { getOrderStatusChips } from './order-state.js';

const currencyFormatter = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function formatCurrency(value = 0) {
  return currencyFormatter.format(Number(value) || 0);
}

export function humanizeLabel(value = '') {
  return String(value)
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\p{L}/gu, (letter) => letter.toUpperCase());
}

export function getOrderItemsCount(items = []) {
  return items.reduce((total, item) => total + (Number(item?.quantity) || 0), 0);
}

export function getOrderTotal(items = [], products = []) {
  const productMap = new Map(products.map((product) => [product.id, product]));
  return items.reduce((total, item) => {
    const price = Number(productMap.get(item?.productId)?.price) || 0;
    const quantity = Number(item?.quantity) || 0;
    return total + (price * quantity);
  }, 0);
}

export function getNextStatus(currentStatus, flow = []) {
  const currentIndex = flow.indexOf(currentStatus);
  if (currentIndex < 0 || currentIndex >= flow.length - 1) return null;
  return flow[currentIndex + 1];
}

export { getOrderStatusChips };

export function getDocumentWorkflowStatus(order = {}, ticket = null) {
  const orderType = order?.orderType || (order?.pickupCode ? 'takeaway' : order?.address ? 'delivery' : 'salon');
  const chips = getOrderStatusChips({ ...order, documentIssued: Boolean(order?.documentIssued || ticket) }, orderType);

  return chips.invoice;
}

export function renderEmptyState({ icon = '•', title, description }) {
  return `
    <div class="empty-state">
      <div class="empty-state__icon" aria-hidden="true">${escapeHtml(icon)}</div>
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(description)}</p>
    </div>
  `;
}

const PAYMENT_BRAND_ASSETS = {
  efectivo: './assets/logo/Efectivo.png',
  yape: './assets/logo/yape.avif',
  plin: './assets/logo/plin.png',
  transferencia: './assets/logo/transferencia.png',
};

const PAYMENT_BRAND_EMOJI = {
  efectivo: '💵',
  codi: '📱',
  spei: '📲',
  transferencia: '🏦',
  tarjeta: '💳',
};

export function normalizePaymentMethodId(value = '') {
  const normalized = String(value).trim().toLowerCase();
  if (!normalized) return 'efectivo';
  if (normalized.includes('codi')) return 'yape';
  if (normalized.includes('spei')) return 'plin';
  if (normalized.includes('yape')) return 'yape';
  if (normalized.includes('plin')) return 'plin';
  if (normalized.includes('transfer')) return 'transferencia';
  if (normalized.includes('tarjeta')) return 'tarjeta';
  if (normalized.includes('efectivo')) return 'efectivo';
  return normalized;
}

export function getPaymentMethodLabel(value = '') {
  const methodId = normalizePaymentMethodId(value);
  if (methodId === 'tarjeta') return 'Tarjeta';
  return humanizeLabel(methodId);
}

export function getPaymentMethodAsset(value = '') {
  return PAYMENT_BRAND_ASSETS[normalizePaymentMethodId(value)] || null;
}

export function getPrinterStatusLabel(status = 'disconnected') {
  return status === 'connected' ? 'Conectado' : 'Desconectado';
}

export function formatDateTime(value = Date.now()) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Sin fecha';
  return parsed.toLocaleString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function renderPaymentMethodButtons({ methods = [], selectedId = '', kind = '', sourceId = '' }) {
  const selected = normalizePaymentMethodId(selectedId);
  return `
    <div class="payment-method-grid">
      ${methods.map((method) => {
        const methodId = normalizePaymentMethodId(method.id || method.value || method.label);
        const label = method.shortLabel || method.label || getPaymentMethodLabel(methodId);
        const asset = getPaymentMethodAsset(methodId);
        return `
          <button
            type="button"
            class="payment-method-btn ${selected === methodId ? 'is-active' : ''}"
            data-payment-kind="${escapeHtml(kind)}"
            data-payment-id="${escapeHtml(sourceId)}"
            data-payment-method="${escapeHtml(methodId)}"
            aria-pressed="${String(selected === methodId)}"
          >
            ${asset
              ? `<img class="payment-method-btn__logo" src="${escapeHtml(asset)}" alt="${escapeHtml(label)}" loading="lazy" decoding="async">`
              : `<span class="payment-method-btn__fallback" aria-hidden="true">${escapeHtml(PAYMENT_BRAND_EMOJI[methodId] || '💳')}</span>`}
            <span class="payment-method-btn__label">${escapeHtml(label)}</span>
          </button>
        `;
      }).join('')}
    </div>
  `;
}

export function renderDocumentTypeButtons({ options = [], selectedId = 'boleta', kind = '', sourceId = '' }) {
  return `
    <div class="document-type-switch" role="tablist" aria-label="Tipo de comprobante">
      ${options.map((option) => `
        <button
          type="button"
          class="document-type-switch__btn ${selectedId === option.value ? 'is-active' : ''}"
          data-document-type="${escapeHtml(option.value)}"
          data-payment-kind="${escapeHtml(kind)}"
          data-payment-id="${escapeHtml(sourceId)}"
          aria-pressed="${String(selectedId === option.value)}"
        >
          ${escapeHtml(option.label)}
        </button>
      `).join('')}
    </div>
  `;
}

export function renderTicketPreview(ticket) {
  if (!ticket) return '';

  return `
    <section class="ticket-preview" aria-label="Vista previa del ticket">
      <header class="ticket-preview__header">
        <div>
          <p class="eyebrow">Ticket de pago</p>
          <strong>${escapeHtml(ticket.orderCode || 'Pedido')}</strong>
        </div>
        <span class="ticket-preview__status">${escapeHtml(ticket.documentTypeLabel || humanizeLabel(ticket.documentType || 'ticket'))}</span>
      </header>

      <div class="ticket-preview__meta">
        <div class="ticket-preview__line"><span>Cliente</span><strong>${escapeHtml(ticket.customer || 'Consumo interno')}</strong></div>
        <div class="ticket-preview__line"><span>Fecha</span><strong>${escapeHtml(formatDateTime(ticket.createdAt))}</strong></div>
        <div class="ticket-preview__line"><span>Método</span><strong>${escapeHtml(ticket.methodLabel || 'Pendiente')}</strong></div>
      </div>

      <div class="ticket-preview__divider"></div>

      <div class="ticket-preview__body">
        ${(ticket.lines || []).map((line) => `
          <div class="ticket-preview__line">
            <span>${escapeHtml(line.label)}</span>
            <strong>${escapeHtml(line.value)}</strong>
          </div>
        `).join('')}
      </div>

      <div class="ticket-preview__divider"></div>

      <footer class="ticket-preview__footer">
        <span>Imprimir ticket</span>
        <strong>${escapeHtml(ticket.printerName || 'Ticketera')} · ${escapeHtml(ticket.printerStatus || 'Desconectado')}</strong>
      </footer>
    </section>
  `;
}
