export function renderDeliveryAfiliadosModule({ refData }) {
  return `
    <section class="module-shell module-shell--delivery-afiliados">
      <section class="module-section-card">
        <header class="module-section-card__header">
          <div>
            <p class="eyebrow">Delivery afiliados</p>
            <h3>Empresas con contrato</h3>
          </div>
        </header>
        <div class="settings-grid">
          ${refData.deliveryPartners.map((partner) => `
            <article class="settings-card">
              <div class="settings-card__header"><div><h3>${partner.name}</h3></div></div>
              <div class="detail-row"><span>Contrato</span><strong>${partner.contractStatus}</strong></div>
              <div class="detail-row"><span>Liquidación</span><strong>${partner.settlementModel}</strong></div>
            </article>
          `).join('')}
        </div>
      </section>
    </section>
  `;
}
