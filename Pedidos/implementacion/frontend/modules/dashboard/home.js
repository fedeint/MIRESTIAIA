export function renderDashboardHome(summary) {
  return `
    <section class="dashboard-home-shell app-surface">
      <header class="dashboard-home-shell__header">
        <div>
          <p class="eyebrow">Vista rápida</p>
          <h2>${summary.greeting}</h2>
          <p>${summary.restaurantLabel}</p>
        </div>
      </header>
      <section class="dashboard-home-grid">
        ${summary.pendingCards
          .map(
            (card) => `
              <article class="dashboard-home-card app-surface">
                <strong>${card.label}</strong>
                <p>${card.helper}</p>
                <span>${card.cta}</span>
              </article>
            `,
          )
          .join('')}
      </section>
      <section class="dashboard-home-stats app-surface">
        <div><span>Ventas</span><strong>${summary.quickStats.sales}</strong></div>
        <div><span>Mesas</span><strong>${summary.quickStats.tables}</strong></div>
        <div><span>Delivery</span><strong>${summary.quickStats.delivery}</strong></div>
        <div><span>Recojo</span><strong>${summary.quickStats.takeaway}</strong></div>
      </section>
    </section>
  `;
}
