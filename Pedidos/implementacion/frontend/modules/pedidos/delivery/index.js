import {
  escapeHtml,
  formatCurrency,
  getDocumentWorkflowStatus,
  getOrderStatusChips,
  renderDocumentTypeButtons,
  renderEmptyState,
  renderPaymentMethodButtons,
  renderTicketPreview,
} from '../../../core/ui-helpers.js';
import {
  canAdvanceOperationalStatus,
  getLegacyOperationalStatus,
  getNextOperationalStatus,
  getOperationalStatusLabel,
  normalizeOrderState,
} from '../../../core/order-state.js';

const DELIVERY_STATUS_COLUMNS = [
  { key: 'pending' },
  { key: 'preparing' },
  { key: 'ready_to_dispatch' },
  { key: 'on_route' },
  { key: 'delivered' },
];

function renderDeliveryCard(order, selectedId, ticket = null) {
  const normalizedOrder = normalizeOrderState(order, 'delivery');
  const chips = getOrderStatusChips(normalizedOrder, 'delivery');
  const guard = canAdvanceOperationalStatus(normalizedOrder, 'delivery');
  const nextStatus = guard.nextStatus;

  return `
    <article class="board-card ${selectedId === order.id ? 'is-selected' : ''}">
      <button type="button" class="board-card__hit" data-select-delivery="${escapeHtml(order.id)}">
        <div class="board-card__header">
          <strong>${escapeHtml(order.code)}</strong>
          <span class="badge badge--${escapeHtml(chips.operational.tone)}">${escapeHtml(chips.operational.label)}</span>
        </div>
        <p>${escapeHtml(order.customer)} · ${escapeHtml(order.channel)}</p>
        <div class="board-card__meta">
          <span>${order.elapsedMinutes || 0} min</span>
          <span>${formatCurrency(order.total)}</span>
        </div>
      </button>
      ${nextStatus ? `
        <button
          type="button"
          class="btn btn--secondary btn--sm"
          data-advance-delivery="${escapeHtml(order.id)}"
          data-next-status="${escapeHtml(nextStatus)}"
        >
          ${escapeHtml(getOperationalStatusLabel('delivery', nextStatus))}
        </button>
      ` : ''}
    </article>
  `;
}

function renderDeliveryPanel(order, refData) {
  if (!order) {
    return renderEmptyState({
      icon: '🛵',
      title: 'Selecciona un delivery',
      description: 'El panel derecho mostrará cliente, dirección, pago y el estado documental del pedido.',
    });
  }

  const ticket = order.__ticket || null;
  const normalizedOrder = normalizeOrderState(order, 'delivery');
  const chips = getOrderStatusChips(normalizedOrder, 'delivery');
  const documentStatus = getDocumentWorkflowStatus(normalizedOrder, ticket);
  const nextStatus = getNextOperationalStatus('delivery', normalizedOrder.operationalStatus);

  return `
    <div class="panel-shell">
      <header class="panel-header">
        <div>
          <p class="eyebrow">Delivery activo</p>
          <h3>${escapeHtml(order.code)}</h3>
        </div>
        <span class="badge badge--${escapeHtml(chips.operational.tone)}">${escapeHtml(chips.operational.label)}</span>
      </header>

      <div class="order-summary-box">
        <div class="detail-row"><span>Cliente</span><strong>${escapeHtml(order.customer)}</strong></div>
        <div class="detail-row"><span>Canal</span><strong>${escapeHtml(order.channel)}</strong></div>
        <div class="detail-row"><span>Dirección</span><strong>${escapeHtml(order.address)}</strong></div>
        <div class="detail-row"><span>Teléfono</span><strong>${escapeHtml(order.phone || 'No registrado')}</strong></div>
        <div class="detail-row"><span>Estado operativo</span><strong>${escapeHtml(chips.operational.label)}</strong></div>
        <div class="detail-row"><span>Pago</span><strong>${escapeHtml(chips.payment.label)}</strong></div>
        <div class="detail-row"><span>Comprobante</span><strong>${escapeHtml(chips.invoice.label)}</strong></div>
        <div class="detail-row detail-row--total"><span>Total</span><strong>${formatCurrency(order.total)}</strong></div>
      </div>

      <div class="panel-stack">
        <div class="detail-row"><span>Items</span><strong>${escapeHtml(order.itemsCount || 0)}</strong></div>
        <div class="detail-row"><span>Promesa</span><strong>${escapeHtml(order.etaMinutes || 0)} min</strong></div>
        <div class="detail-row"><span>Observación</span><strong>${escapeHtml(order.note || 'Sin observación')}</strong></div>
      </div>

      <section class="panel-stack payment-panel-shell">
        <h4>Pago desde esta sección</h4>
        <div>
          <span class="field-label">Comprobante</span>
          ${renderDocumentTypeButtons({ options: refData.documentTypeOptions, selectedId: order.documentType || 'boleta', kind: 'delivery', sourceId: order.id })}
        </div>
        <div>
          <span class="field-label">Método de pago</span>
          ${renderPaymentMethodButtons({ methods: refData.desktopPaymentMethods, selectedId: order.paymentMethod || order.paymentLabel, kind: 'delivery', sourceId: order.id })}
        </div>
        <div class="detail-row"><span>Ticketera</span><strong>${escapeHtml(refData.printers?.boletero?.name || 'Ticketera Epson')} · ${escapeHtml(refData.printers?.boletero?.statusLabel || 'Desconectado')}</strong></div>
        <button type="button" class="btn btn--primary" data-process-payment="delivery" data-source-id="${escapeHtml(order.id)}">
          ${order.documentType === 'factura' ? 'Ir a facturación' : 'Registrar pago y ticket'}
        </button>
      </section>

      ${renderTicketPreview(ticket)}

      <div class="detail-row"><span>Estado del comprobante</span><strong>${escapeHtml(documentStatus.label)}</strong></div>
      ${nextStatus ? `
        <button
          type="button"
          class="btn btn--secondary"
          data-advance-delivery="${escapeHtml(order.id)}"
          data-next-status="${escapeHtml(nextStatus)}"
        >
          Avanzar a ${escapeHtml(getOperationalStatusLabel('delivery', nextStatus))}
        </button>
      ` : ''}
    </div>
  `;
}

export function renderDeliveryModule({ state, selectedOrder, refData }) {
  const enrichedRefData = {
    ...refData,
    printers: {
      boletero: {
        name: state.printers?.boletero?.name,
        statusLabel: state.printers?.boletero?.status === 'connected' ? 'Conectado' : 'Desconectado',
      },
    },
  };
  const orderWithTicket = selectedOrder
    ? { ...selectedOrder, __ticket: state.paymentReceipts?.delivery?.[selectedOrder.id] || null }
    : null;
  const toolbar = '';

  const content = `
    <div class="kanban-board" aria-label="Pizarra de delivery">
      ${DELIVERY_STATUS_COLUMNS.map((column) => {
        const legacyColumnKey = getLegacyOperationalStatus('delivery', column.key);
        const orders = state.deliveryOrders.filter((order) => normalizeOrderState(order, 'delivery').operationalStatus === column.key || order.status === legacyColumnKey);
        return `
          <section class="kanban-col">
            <header class="kanban-col__header">
              <h4 class="kanban-col__title">${escapeHtml(getOperationalStatusLabel('delivery', column.key))}</h4>
              <span class="kanban-col__count">${orders.length}</span>
            </header>
            ${orders.length
              ? orders.map((order) => renderDeliveryCard(
                order,
                selectedOrder?.id,
                state.paymentReceipts?.delivery?.[order.id] || null,
              )).join('')
              : renderEmptyState({
                icon: '📭',
                title: 'Vacío',
                description: 'No hay pedidos en esta etapa.',
              })}
          </section>
        `;
      }).join('')}
    </div>
  `;

  return {
    toolbar,
    content,
    panel: renderDeliveryPanel(orderWithTicket, enrichedRefData),
  };
}
