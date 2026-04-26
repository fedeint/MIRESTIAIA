import { escapeHtml, formatCurrency, renderEmptyState } from '../../core/ui-helpers.js';

function buildKitchenCards(state) {
  const fromTables = state.tables
    .filter((table) => (table.order?.items || []).length)
    .map((table) => ({
      id: `kitchen-salon-${table.id}`,
      source: 'Salón',
      code: `Mesa ${table.number}`,
      status: table.status === 'ocupada' ? 'en proceso' : 'pendiente',
      elapsed: '12 min',
      target: table.order?.serviceType === 'takeaway' ? 'Mesero / Recojo' : 'Mesero',
      total: (table.order?.items || []).length * 12,
    }));

  const fromTakeaway = state.takeawayOrders.map((order) => ({
    id: `kitchen-takeaway-${order.id}`,
    source: 'Caja / WhatsApp',
    code: order.code,
    status: order.status === 'entregado' ? 'listo' : 'en proceso',
    elapsed: `${order.minutesToPromise || 0} min`,
    target: (order.source || '').toLowerCase().includes('whatsapp') ? 'Motorizado' : 'Mesero',
    total: order.total,
  }));

  return [...fromTables, ...fromTakeaway];
}

export function renderCocinaModule({ state }) {
  const cards = buildKitchenCards(state);

  return `
    <section class="module-shell module-shell--cocina">
      <section class="module-section-card">
        <header class="module-section-card__header">
          <div>
            <p class="eyebrow">Cocina</p>
            <h3>Cola operativa</h3>
          </div>
        </header>
        ${cards.length ? `
          <div class="kitchen-board-grid">
            ${cards.map((card) => `
              <article class="board-card">
                <div class="board-card__header">
                  <strong>${escapeHtml(card.code)}</strong>
                  <span class="badge badge--${card.status === 'listo' ? 'success' : 'warning'}">${escapeHtml(card.status)}</span>
                </div>
                <p>${escapeHtml(card.source)} → ${escapeHtml(card.target)}</p>
                <div class="board-card__meta">
                  <span>${escapeHtml(card.elapsed)}</span>
                  <span>${formatCurrency(card.total)}</span>
                </div>
                <div class="module-inline-actions">
                  <button type="button" class="btn btn--secondary btn--sm">En proceso</button>
                  <button type="button" class="btn btn--primary btn--sm">Listo</button>
                </div>
              </article>
            `).join('')}
          </div>
        ` : renderEmptyState({
          icon: '🍳',
          title: 'Sin pedidos en cocina',
          description: 'Cuando lleguen pedidos desde mesero o caja, aparecerán aquí.',
        })}
      </section>
    </section>
  `;
}
