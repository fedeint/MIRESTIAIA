import {
  escapeHtml,
  formatCurrency,
  formatDateTime,
  renderEmptyState,
} from '../../core/ui-helpers.js';

function renderSunatHeader() {
  return `
    <div class="sunat-banner">
      <div>
        <p class="eyebrow">Facturación electrónica</p>
        <h2>Comprobante tipo Factura</h2>
        <p>Formulario preparado con estructura tributaria local: RUC, razón social, operación gravada, IGV y total.</p>
      </div>
      <div class="sunat-banner__meta">
        <span class="badge badge--warning">IGV 18%</span>
        <span class="badge badge--info">Régimen general mock</span>
      </div>
    </div>
  `;
}

function renderInvoiceForm(draft) {
  const total = Number(draft.total) || 0;
  const taxable = total > 0 ? (total / 1.18) : 0;
  const igv = total > 0 ? total - taxable : 0;

  return `
    <section class="module-section-card invoice-module-form">
      <div class="invoice-module-grid">
        <label>
          <span class="field-label">Serie</span>
          <input class="input" type="text" value="F001" disabled>
        </label>
        <label>
          <span class="field-label">Correlativo sugerido</span>
          <input class="input" type="text" value="Auto" disabled>
        </label>
        <label>
          <span class="field-label">Pedido origen</span>
          <input class="input" type="text" value="${escapeHtml(draft.orderCode || '')}" data-invoice-field="orderCode" placeholder="Código del pedido">
        </label>
        <label>
          <span class="field-label">Cliente</span>
          <input class="input" type="text" value="${escapeHtml(draft.customer || '')}" data-invoice-field="customer" placeholder="Nombre del cliente o empresa">
        </label>
        <label>
          <span class="field-label">RUC</span>
          <input class="input" type="text" value="${escapeHtml(draft.documentNumber || '')}" data-invoice-field="documentNumber" placeholder="20123456789" maxlength="11">
        </label>
        <label>
          <span class="field-label">Razón social</span>
          <input class="input" type="text" value="${escapeHtml(draft.businessName || '')}" data-invoice-field="businessName" placeholder="Razón social">
        </label>
        <label>
          <span class="field-label">Operación</span>
          <select class="input" data-invoice-field="taxRegime">
            <option value="gravada" ${draft.taxRegime === 'gravada' || !draft.taxRegime ? 'selected' : ''}>Gravada</option>
            <option value="exonerada" ${draft.taxRegime === 'exonerada' ? 'selected' : ''}>Exonerada</option>
            <option value="inafecta" ${draft.taxRegime === 'inafecta' ? 'selected' : ''}>Inafecta</option>
          </select>
        </label>
        <label>
          <span class="field-label">Moneda</span>
          <input class="input" type="text" value="PEN" disabled>
        </label>
        <label>
          <span class="field-label">Total</span>
          <input class="input" type="number" value="${escapeHtml(total || 0)}" data-invoice-field="total" min="0" step="0.01">
        </label>
      </div>

      <div class="invoice-sunat-summary">
        <div class="detail-row"><span>Valor de venta</span><strong>${formatCurrency(taxable)}</strong></div>
        <div class="detail-row"><span>IGV (18%)</span><strong>${formatCurrency(igv)}</strong></div>
        <div class="detail-row detail-row--total"><span>Importe total</span><strong>${formatCurrency(total)}</strong></div>
      </div>

      <div class="invoice-module-actions">
        <button type="button" class="btn btn--primary" data-issue-invoice>Realizar factura</button>
        <button type="button" class="btn btn--secondary" data-facturas-view="history">Ver historial</button>
      </div>
    </section>
  `;
}

function renderInvoiceHistory(history) {
  if (!history.length) {
    return renderEmptyState({
      icon: '🧾',
      title: 'Todavía no hay facturas emitidas',
      description: 'Cuando generes facturas desde pedidos o desde este módulo, aparecerán en este historial.',
    });
  }

  return `
    <section class="module-section-card invoice-module-history">
      <header class="module-section-card__header">
        <div>
          <p class="eyebrow">Historial</p>
          <h3>Facturas emitidas</h3>
        </div>
        <strong>${history.length}</strong>
      </header>
      <div class="invoice-history-list invoice-history-list--page">
        ${history.map((invoice) => `
          <article class="invoice-history-item">
            <div class="invoice-history-item__header">
              <div>
                <strong>${escapeHtml(invoice.code)}</strong>
                <p class="invoice-history-item__subtitle">${escapeHtml(invoice.sourceLabel)}</p>
              </div>
              <div class="invoice-history-item__actions">
                <span class="badge badge--${invoice.status === 'Emitida' ? 'success' : 'warning'}">${escapeHtml(invoice.status)}</span>
                <button
                  type="button"
                  class="icon-btn icon-btn--surface"
                  data-print-invoice="${escapeHtml(invoice.id)}"
                  aria-label="Imprimir ${escapeHtml(invoice.code)}"
                  title="Mandar a imprimir al facturero"
                >
                  🖨
                </button>
              </div>
            </div>
            <div class="detail-row"><span>Cliente</span><strong>${escapeHtml(invoice.customer)}</strong></div>
            <div class="detail-row"><span>RUC</span><strong>${escapeHtml(invoice.documentNumber)}</strong></div>
            <div class="detail-row"><span>Origen</span><strong>${escapeHtml(invoice.sourceLabel)}</strong></div>
            <div class="detail-row"><span>Total</span><strong>${formatCurrency(invoice.total)}</strong></div>
            <div class="detail-row"><span>Fecha</span><strong>${escapeHtml(formatDateTime(invoice.issuedAt))}</strong></div>
            <div class="invoice-history-item__footer">
              <span>Facturero</span>
              <strong>${escapeHtml(invoice.printerName || 'Facturador Epson')} · ${escapeHtml(invoice.printerStatus || 'Desconectado')}</strong>
            </div>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

export function renderFacturasModule({ state }) {
  return `
    <section class="module-shell module-shell--facturas">
      ${renderSunatHeader()}
      ${renderInvoiceForm(state.invoiceDraft)}
      ${renderInvoiceHistory(state.invoiceHistory)}
    </section>
  `;
}
