import { formatCurrency } from '../../core/ui-helpers.js';

export function renderVentasModule({ state }) {
  const totalSales = [
    ...state.deliveryOrders.map((order) => Number(order.total) || 0),
    ...state.takeawayOrders.map((order) => Number(order.total) || 0),
  ].reduce((sum, amount) => sum + amount, 0);
  const estimatedProfit = totalSales * 0.28;

  return `
    <section class="module-shell module-shell--ventas">
      <section class="module-section-card">
        <header class="module-section-card__header">
          <div>
            <p class="eyebrow">Ventas</p>
            <h3>Ganancia del día</h3>
          </div>
        </header>
        <div class="summary-grid summary-grid--module">
          <article class="summary-card summary-card--accent"><div class="summary-card__body"><strong>${formatCurrency(totalSales)}</strong><p>Ventas registradas</p><span>Salón, delivery y para llevar</span></div></article>
          <article class="summary-card summary-card--success"><div class="summary-card__body"><strong>${formatCurrency(estimatedProfit)}</strong><p>Ganancia estimada</p><span>Margen mock referencial</span></div></article>
        </div>
      </section>
    </section>
  `;
}
