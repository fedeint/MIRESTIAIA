import {
  escapeHtml,
  formatCurrency,
  getOrderItemsCount,
  getOrderTotal,
  renderDocumentTypeButtons,
  renderEmptyState,
  renderPaymentMethodButtons,
  renderTicketPreview,
} from '../../../core/ui-helpers.js';
import { canReleaseTable } from '../../../core/order-state.js';

function findWaiterName(waiterId, waiters) {
  return waiters.find((waiter) => waiter.id === waiterId)?.name || 'Sin asignar';
}

function renderTableCard(table, { selectedTableId, products, waiters, journey }) {
  const items = table.order?.items || [];
  const itemsCount = getOrderItemsCount(items);
  const total = getOrderTotal(items, products);
  const waiterName = findWaiterName(table.waiterId, waiters);
  const activeRound = getActiveRound(journey);
  const hasServicePending = Boolean(journey?.rounds?.some((round) => round.status === 'enviada'));
  const activeOrderId = table.order?.id || journey?.orderId || `PED-${String(table.number).padStart(2, '0')}`;
  const guests = Number(journey?.guests) || (table.status === 'libre' ? 0 : 2);
  const durationLabel = journey?.durationLabel || (table.status === 'libre' ? 'Disponible' : 'Nuevo servicio');

  return `
    <button
      type="button"
      class="table-card table-card--${escapeHtml(table.status)} ${hasServicePending ? 'table-card--service-pending' : ''} ${selectedTableId === table.id ? 'is-selected' : ''}"
      data-select-table="${escapeHtml(table.id)}"
      aria-pressed="${String(selectedTableId === table.id)}"
    >
      <span class="table-card__topline">
        <span class="table-card__state">${escapeHtml(table.status)}</span>
        ${hasServicePending
          ? '<span class="table-card__service-dot" aria-label="Ronda enviada pendiente de servir"></span>'
          : ''}
      </span>
      <span class="table-card__number"><span>Mesa</span> ${escapeHtml(table.number)}</span>
      <span class="table-card__zone">${escapeHtml(table.zone)} · ${escapeHtml(waiterName)}</span>
      <span class="table-card__meta-line">
        <span>${escapeHtml(guests)} pax</span>
        <span>${escapeHtml(activeOrderId)}</span>
      </span>
      <span class="table-card__metrics">
        <span class="table-card__status">${itemsCount} ítems</span>
        <strong class="table-card__total">${formatCurrency(total)}</strong>
      </span>
      <span class="table-card__timer">⏱ ${escapeHtml(durationLabel)} · ${escapeHtml(activeRound?.label || table.description || 'Sin ronda activa')}</span>
    </button>
  `;
}

function getActiveRound(journey) {
  if (!journey?.rounds?.length) return null;

  return journey.rounds.find((round) => round.id === journey.activeRoundId)
    || journey.rounds[journey.rounds.length - 1]
    || null;
}

function getDisplayedRound(journey, selectedRoundId) {
  if (!journey?.rounds?.length) return null;

  return journey.rounds.find((round) => round.id === selectedRoundId)
    || getActiveRound(journey);
}

function getRoundPaymentMeta(round) {
  return round?.isPaid
    ? { label: 'Pagada', tone: 'success', className: 'is-paid' }
    : { label: 'Pendiente', tone: 'warning', className: 'is-unpaid' };
}

function getRoundStatusMeta(round, roundStatusMeta = {}) {
  return roundStatusMeta?.[round?.status] || { label: round?.status || 'Sin estado', tone: 'neutral' };
}

function getKitchenPendingRounds(journey) {
  return (journey?.rounds || []).filter((round) => round.status === 'enviada');
}

function getTipOptions(refData) {
  const baseOptions = Array.isArray(refData.desktopTipOptions) && refData.desktopTipOptions.length
    ? refData.desktopTipOptions
    : [0, 5, 10, 15];

  return [...new Set([0, 5, 10, 15, ...baseOptions])].sort((a, b) => a - b);
}

function renderTipSelector({ refData, paymentDraft, sourceId, baseTotal }) {
  const selectedTip = Number(paymentDraft?.tipRate) || 0;
  const tipAmount = Math.round((Number(baseTotal || 0) * (selectedTip / 100)) * 100) / 100;
  const finalAmount = Math.round((Number(baseTotal || 0) + tipAmount) * 100) / 100;

  return `
    <section class="smart-checkout smart-checkout--tips" aria-label="Selector de propina">
      <div class="smart-checkout__header">
        <div>
          <span>Propina</span>
          <strong>${selectedTip ? `${selectedTip}% agregado` : 'Sin propina'}</strong>
        </div>
        <strong class="smart-checkout__amount">${formatCurrency(tipAmount)}</strong>
      </div>
      <div class="tip-selector" role="group" aria-label="Seleccionar porcentaje de propina">
        ${getTipOptions(refData).map((tip) => `
          <button
            type="button"
            class="tip-selector__btn ${selectedTip === Number(tip) ? 'is-active' : ''}"
            data-payment-tip="${escapeHtml(tip)}"
            data-payment-kind="salon"
            data-payment-id="${escapeHtml(sourceId)}"
            aria-pressed="${String(selectedTip === Number(tip))}"
          >
            ${Number(tip) === 0 ? 'Sin' : `${escapeHtml(tip)}%`}
          </button>
        `).join('')}
      </div>
      <div class="smart-checkout__footer">
        <span>Total con propina</span>
        <strong>${formatCurrency(finalAmount)}</strong>
      </div>
    </section>
  `;
}

function renderRoundInspection(round, products) {
  if (!round) {
    return '<p class="workspace-note">Selecciona una ronda para ver el detalle del pedido.</p>';
  }

  const productMap = new Map(products.map((product) => [product.id, product]));
  return `
    <div class="panel-stack">
      ${(round.items || []).map((item) => `
        <div class="detail-row">
          <span>${escapeHtml(productMap.get(item.productId)?.name || item.productId)} × ${escapeHtml(item.quantity)}</span>
          <strong>${formatCurrency(item.subtotal || 0)}</strong>
        </div>
      `).join('')}
      <div class="detail-row detail-row--total">
        <span>Total de ${escapeHtml(round.label)}</span>
        <strong>${formatCurrency(round.total || 0)}</strong>
      </div>
    </div>
  `;
}

function renderTableRounds(journey, products, roundStatusMeta, selectedRoundId, sourceId) {
  const activeRound = getActiveRound(journey);

  if (!journey?.rounds?.length) {
    return `
      <div class="round-empty-state">
        <p class="workspace-note">Todavía no hay rondas registradas para esta mesa.</p>
        <div class="round-actions">
          <button type="button" class="btn btn--primary" data-open-module="menu">
            Crear primera ronda
          </button>
          <p class="workspace-note">Abre el menú para cargar el primer pedido de esta mesa.</p>
        </div>
      </div>
    `;
  }

  const productMap = new Map(products.map((product) => [product.id, product]));
  return `
    <div class="smart-round-stack" aria-label="Rondas apiladas de la mesa">
      ${journey.rounds.map((round) => {
        const paymentMeta = getRoundPaymentMeta(round);
        const statusMeta = getRoundStatusMeta(round, roundStatusMeta);
        const isSelected = round.id === selectedRoundId || (!selectedRoundId && round.id === journey.activeRoundId);
        const itemsCount = getOrderItemsCount(round.items || []);
        return `
        <button
          type="button"
          class="round-card smart-round-card smart-round-card--${escapeHtml(round.status)} ${round.id === journey.activeRoundId ? 'is-active' : ''} ${isSelected ? 'is-selected' : ''} ${paymentMeta.className}"
          data-select-round="${escapeHtml(round.id)}"
          aria-pressed="${String(isSelected)}"
        >
          <div class="round-card__header">
            <div>
              <strong>${escapeHtml(round.label)}</strong>
              <span>${escapeHtml(round.createdAt || 'Sin hora')} · ${itemsCount} ítems</span>
            </div>
            <div class="round-card__badges">
              <span class="badge badge--${escapeHtml(statusMeta.tone)}">${escapeHtml(statusMeta.label)}</span>
              <span class="badge badge--${paymentMeta.tone}">${paymentMeta.label}</span>
            </div>
          </div>
          <div class="round-card__items">
            ${(round.items || []).map((item) => `
              <div class="detail-row smart-round-line">
                <span>
                  <strong>${escapeHtml(item.quantity)}×</strong>
                  ${escapeHtml(productMap.get(item.productId)?.name || item.productId)}
                  ${item.note ? `<small>${escapeHtml(item.note)}</small>` : ''}
                </span>
                <strong>${formatCurrency(item.subtotal || 0)}</strong>
              </div>
            `).join('')}
          </div>
          <div class="detail-row detail-row--total">
            <span>Total de ronda</span>
            <strong>${formatCurrency(round.total || 0)}</strong>
          </div>
        </button>
      `;
      }).join('')}
    </div>
    <div class="smart-round-actions">
      <button type="button" class="btn btn--primary" data-open-module="menu">
        + Agregar ronda
      </button>
      <button type="button" class="btn btn--secondary" data-smart-checkout="salon" data-source-id="${escapeHtml(sourceId)}">
        Pedir cuenta
      </button>
      <p class="workspace-note">La nueva carga se sumará a ${escapeHtml(activeRound?.label || 'la última ronda')} desde el flujo de menú.</p>
    </div>
  `;
}

export function renderSalonModule({ state, stats, tables, selectedTable, refData }) {
  const zones = ['all', ...new Set(state.tables.map((table) => table.zone))];
  const toolbar = `
    <div class="workspace-toolbar">
      <input
        id="salonSearch"
        class="input toolbar-search--salon"
        type="search"
        value="${escapeHtml(state.searchQuery || '')}"
        placeholder="Buscar mesa, zona o referencia"
        aria-label="Buscar mesa"
      />
      <div class="area-tabs" aria-label="Filtros por zona">
        ${zones.map((zone) => `
          <button
            type="button"
            class="area-tab ${state.activeZone === zone ? 'is-active' : ''}"
            data-set-zone="${escapeHtml(zone)}"
          >
            ${zone === 'all' ? 'Todas' : escapeHtml(zone)}
          </button>
        `).join('')}
      </div>
    </div>
  `;

  const content = tables.length
    ? `<div class="table-grid">${tables.map((table) => renderTableCard(table, {
      selectedTableId: selectedTable?.id,
      products: refData.products,
      waiters: refData.waiters,
      journey: state.tableJourneys?.[table.id] || null,
    })).join('')}</div>`
    : renderEmptyState({
      icon: '🍽️',
      title: 'No hay mesas para este filtro',
      description: 'Ajusta la búsqueda o cambia la zona activa para volver a ver la operación.',
    });

  if (!selectedTable) {
    return {
      toolbar,
      content,
      panel: renderEmptyState({
        icon: '🧭',
        title: 'Selecciona una mesa',
        description: 'La inspección, las rondas apiladas y el pago se gestionan desde esta sección derecha.',
      }),
    };
  }

  const itemsCount = getOrderItemsCount(selectedTable.order?.items || []);
  const total = getOrderTotal(selectedTable.order?.items || [], refData.products);
  const waiterName = findWaiterName(selectedTable.waiterId, refData.waiters);
  const journey = state.tableJourneys?.[selectedTable.id] || null;
  const paymentDraft = journey?.paymentDraft || {
    documentType: selectedTable.order?.documentType || 'boleta',
    method: selectedTable.order?.paymentMethod || 'efectivo',
    amount: journey?.bill?.total || total,
  };
  const ticket = state.paymentReceipts?.salon?.[selectedTable.id] || null;
  const releaseGuard = canReleaseTable(selectedTable.order || {});

  const activeRound = getActiveRound(journey);
  const displayedRound = getDisplayedRound(journey, state.selectedRoundId);
  const displayedRoundPayment = getRoundPaymentMeta(displayedRound);
  const pendingKitchenRounds = getKitchenPendingRounds(journey);
  const billSubtotal = Number(journey?.bill?.subtotal) || total;
  const billIgv = Number(journey?.bill?.iva) || Math.round((billSubtotal * 0.18) * 100) / 100;
  const billTotal = Number(journey?.bill?.total) || Math.round((billSubtotal + billIgv) * 100) / 100;

  const panel = `
    <div class="panel-shell panel-shell--salon">
      <header class="panel-header">
        <div>
          <p class="eyebrow">Mesa seleccionada</p>
          <h3>Mesa ${escapeHtml(selectedTable.number)}</h3>
          <p class="salon-panel-overview__note">${escapeHtml(selectedTable.zone)} · ${escapeHtml(waiterName)} · ${itemsCount} ítems activos</p>
        </div>
        <span class="badge badge--${selectedTable.status === 'ocupada' ? 'danger' : selectedTable.status === 'reservada' ? 'info' : 'success'}">
          ${escapeHtml(selectedTable.status)}
        </span>
      </header>

      <section class="salon-panel-overview">
        <div class="salon-panel-summary-grid">
          <article class="salon-panel-summary-card">
            <span>Zona</span>
            <strong>${escapeHtml(selectedTable.zone)}</strong>
          </article>
          <article class="salon-panel-summary-card">
            <span>Mesero</span>
            <strong>${escapeHtml(waiterName)}</strong>
          </article>
          <article class="salon-panel-summary-card salon-panel-summary-card--wide">
            <span>Descripción</span>
            <strong>${escapeHtml(selectedTable.description || 'Sin descripción')}</strong>
          </article>
          <article class="salon-panel-summary-card">
            <span>Ronda activa</span>
            <strong>${escapeHtml(activeRound?.label || 'Sin ronda')}</strong>
          </article>
          <article class="salon-panel-summary-card salon-panel-summary-card--accent">
            <span>Total estimado</span>
            <strong>${formatCurrency(billTotal)}</strong>
          </article>
        </div>
      </section>

      ${pendingKitchenRounds.length ? `
        <section class="smart-kitchen-warning" role="status" aria-live="polite">
          <strong>⚠ Hay ${pendingKitchenRounds.length} ronda${pendingKitchenRounds.length === 1 ? '' : 's'} en cocina</strong>
          <span>Antes de cobrar, confirma si ${escapeHtml(pendingKitchenRounds.map((round) => round.label).join(', '))} ya fue servida.</span>
        </section>
      ` : ''}

      <section class="panel-stack panel-section-card">
        <div class="panel-section-card__header">
          <h4>Inspección del pedido</h4>
          <span class="panel-section-card__hint">${escapeHtml(displayedRound?.label || 'Sin ronda seleccionada')}</span>
        </div>
        <div class="round-inspection-banner ${displayedRoundPayment.className}">
          <span>Estado de la ronda</span>
          <strong>${displayedRound ? `${escapeHtml(displayedRound.label)} · ${displayedRoundPayment.label}` : 'Selecciona una ronda'}</strong>
        </div>
        ${renderRoundInspection(displayedRound, refData.products)}
      </section>

      <section class="panel-stack panel-section-card">
        <div class="panel-section-card__header">
          <h4>Rondas apiladas</h4>
          <span class="panel-section-card__hint">${escapeHtml(journey?.rounds?.length ? `${journey.rounds.length} registradas` : 'Sin rondas')}</span>
        </div>
        ${renderTableRounds(journey, refData.products, refData.desktopRoundStatusMeta, state.selectedRoundId, selectedTable.id)}
      </section>

      <section class="panel-stack payment-panel-shell salon-payment-shell panel-section-card">
        <div class="panel-section-card__header">
          <h4>Pago desde esta sección</h4>
          <span class="panel-section-card__hint">Cobro rápido</span>
        </div>
        <div>
          <span class="field-label">Comprobante</span>
          ${renderDocumentTypeButtons({ options: refData.documentTypeOptions, selectedId: paymentDraft.documentType, kind: 'salon', sourceId: selectedTable.id })}
        </div>
        <div>
          <span class="field-label">Método de pago</span>
          ${renderPaymentMethodButtons({ methods: refData.desktopPaymentMethods, selectedId: paymentDraft.method, kind: 'salon', sourceId: selectedTable.id })}
        </div>
        ${renderTipSelector({ refData, paymentDraft, sourceId: selectedTable.id, baseTotal: billTotal })}
        <section class="smart-bill-detail" aria-label="Detalle de cuenta">
          <div class="detail-row"><span>Subtotal</span><strong>${formatCurrency(billSubtotal)}</strong></div>
          <div class="detail-row"><span>IGV 18%</span><strong>${formatCurrency(billIgv)}</strong></div>
          <div class="detail-row detail-row--total"><span>Total base</span><strong>${formatCurrency(billTotal)}</strong></div>
        </section>
        <div class="detail-row salon-payment-shell__total"><span>Monto a cobrar</span><strong>${formatCurrency(paymentDraft.amount || billTotal)}</strong></div>
        <button type="button" class="btn btn--primary" data-process-payment="salon" data-source-id="${escapeHtml(selectedTable.id)}">
          ${paymentDraft.documentType === 'factura' ? 'Ir a facturación' : 'Registrar pago en mesa'}
        </button>
      </section>

      ${renderTicketPreview(ticket)}

      <section class="panel-actions panel-actions--salon">
        <button type="button" class="btn btn--secondary" data-open-module="menu">
          ${activeRound ? `Añadir pedido a ${escapeHtml(activeRound.label)}` : 'Añadir pedido'}
        </button>
        <button type="button" class="btn btn--danger btn--sm" data-update-table-status="libre" data-table-id="${escapeHtml(selectedTable.id)}" ${releaseGuard.allowed ? '' : 'disabled'}>Liberar mesa</button>
        ${releaseGuard.allowed ? '' : `<p class="field-error">${escapeHtml(releaseGuard.reason)}</p>`}
      </section>
    </div>
  `;

  return { toolbar, content, panel };
}
