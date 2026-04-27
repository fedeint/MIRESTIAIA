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
  if (!refData.products || refData.products.length === 0) {
    return `
    <section class="module-shell module-shell--menu ${embedded ? 'module-shell--menu-embedded' : ''}">
      <section class="module-section-card">
        <p class="eyebrow">Menú del día</p>
        <h3>Sin productos aún</h3>
        <p class="workspace-note">No hay filas en <code>productos</code> o la sesión no está vinculada a tu restaurante. Completa el <strong>onboarding</strong> (categorías y platos de venta en <strong>Productos</strong>) o inicia sesión con tenant en el JWT.</p>
      </section>
    </section>`;
  }
  const cards = refData.products.map((product) => {
    const r = refData.recipeAvailability?.[product.id];
    const hasRecipe = Boolean(r);
    const inStock = Boolean(r?.inStock);
    const station = r?.kitchenStation || '—';
    const estado = !hasRecipe ? 'Sin receta' : inStock ? 'Disponible' : 'No disponible';
    return `
      <article class="menu-product-card ${!hasRecipe || !inStock ? 'is-unavailable' : ''}">
        <div class="menu-product-card__header">
          <strong>${escapeHtml(product.name)}</strong>
          <span>${escapeHtml(product.emoji || '🍽️')}</span>
        </div>
        <p>${escapeHtml(product.categoryLabel || product.category)}</p>
        <div class="detail-row"><span>Estación</span><strong>${escapeHtml(station)}</strong></div>
        <div class="detail-row"><span>Precio</span><strong>S/ ${Number(product.price).toFixed(2)}</strong></div>
        <div class="detail-row"><span>Estado</span><strong>${escapeHtml(estado)}</strong></div>
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
