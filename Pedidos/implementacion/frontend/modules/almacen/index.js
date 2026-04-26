export function renderAlmacenModule() {
  const sections = [
    { title: 'Productos extras', description: 'Bebidas, postres, adicionales y productos listos para venta.' },
    { title: 'Platos tipo receta', description: 'Lomito de pollo, arroz con pollo y preparaciones compuestas.' },
    { title: 'Insumos', description: 'Cebolla, ají, pescado, arroz y componentes de cocina.' },
  ];

  return `
    <section class="module-shell module-shell--almacen">
      <section class="module-section-card">
        <header class="module-section-card__header">
          <div>
            <p class="eyebrow">Almacén</p>
            <h3>Control de inventario por secciones</h3>
          </div>
        </header>
        <div class="settings-grid">
          ${sections.map((section) => `
            <article class="settings-card">
              <div class="settings-card__header"><div><h3>${section.title}</h3></div></div>
              <p class="workspace-note">${section.description}</p>
              <button type="button" class="btn btn--secondary btn--sm">Gestionar sección</button>
            </article>
          `).join('')}
        </div>
      </section>
    </section>
  `;
}
