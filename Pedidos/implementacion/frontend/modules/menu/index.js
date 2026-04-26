import { escapeHtml } from '../../core/ui-helpers.js';

function renderCategoryTabs(categories) {
  return `
    <div class="menu-category-tabs" aria-label="Categorías del menú">
      ${categories.map((category) => `
        <button type="button" class="menu-category-tab ${category.id === 'all' ? 'is-active' : ''}">
          ${escapeHtml(category.name)}
        </button>
      `).join('')}
    </div>
  `;
}

export function renderMenuModule({ refData, embedded = false, selectedContext = null }) {
  const cards = refData.products.map((product) => {
    const isAvailable = Boolean(refData.recipeAvailability?.[product.id]?.inStock);
    const station = refData.recipeAvailability?.[product.id]?.kitchenStation || 'cocina';
    return `
      <article class="menu-product-card ${isAvailable ? '' : 'is-unavailable'}">
        <div class="menu-product-card__header">
          <strong>${escapeHtml(product.name)}</strong>
          <span>${escapeHtml(product.emoji || '🍽️')}</span>
        </div>
        <p>${escapeHtml(product.categoryLabel || product.category)}</p>
        <div class="detail-row"><span>Estación</span><strong>${escapeHtml(station)}</strong></div>
        <div class="detail-row"><span>Precio</span><strong>S/ ${Number(product.price).toFixed(2)}</strong></div>
        <div class="detail-row"><span>Estado</span><strong>${isAvailable ? 'Disponible' : 'Agotado'}</strong></div>
      </article>
    `;
  }).join('');

  return `
    <section class="module-shell module-shell--menu ${embedded ? 'module-shell--menu-embedded' : ''}">
      <section class="module-section-card">
        <header class="module-section-card__header">
          <div>
            <p class="eyebrow">Menú del día</p>
            <h3>${embedded ? 'Menú disponible para el pedido' : 'Platos y productos disponibles'}</h3>
            ${selectedContext?.tableNumber
              ? `<p class="workspace-note">Mesa ${escapeHtml(String(selectedContext.tableNumber))}${selectedContext.roundLabel ? ` · ${escapeHtml(selectedContext.roundLabel)}` : ''}</p>`
              : ''}
          </div>
        </header>
        ${renderCategoryTabs(refData.categories || [])}
        <div class="menu-grid">${cards}</div>
      </section>
    </section>
  `;
}
