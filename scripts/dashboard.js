import { MODULES, toHref, getModulesByRole } from "./navigation.js";

export function initializeDashboard() {
  renderMetrics();
  renderModuleGrid();
  renderSystemHighlights();
  renderInsights();
}

function renderMetrics() {
  const target = document.getElementById("dashboardMetrics");
  if (!target) return;

  const role = window.currentUserRole || 'admin';
  const allowed = getModulesByRole(role).filter(m => m.key !== 'dashboard');

  const metrics = [
    {
      value: String(allowed.length),
      label: "Módulos Asignados",
    },
    {
      value: "1",
      label: "Shell global",
    },
    {
      value: "100%",
      label: "Navegación base",
    },
    {
      value: "0",
      label: "Lógica de negocio",
    },
  ];

  target.innerHTML = metrics
    .map(
      (metric) => `
        <article class="stat-card">
          <strong>${metric.value}</strong>
          <span>${metric.label}</span>
        </article>
      `,
    )
    .join("");
}

function renderModuleGrid() {
  const target = document.getElementById("moduleGrid");
  if (!target) return;

  const role = window.currentUserRole || 'admin';
  const allowed = getModulesByRole(role).filter(m => m.key !== 'dashboard');

  target.innerHTML = allowed.map(
    (module) => {
      const iconName = module.icon || "circle";
      return `
      <a class="module-card" href="${toHref(module.path)}">
        <div class="module-card__header">
          <span class="module-card__token">
            <i data-lucide="${iconName}" style="width:32px;height:32px;color:var(--color-accent)"></i>
          </span>
          <span class="chip chip--soft">Módulo activo</span>
        </div>
        <h3>${module.label}</h3>
        <p style="font-size: 13px; color: var(--color-text-muted); line-height: 1.4; margin-top: 4px;">
          ${module.description}
        </p>
        <div class="module-card__footer" style="margin-top: 12px;">
          <span class="module-card__cta">Entrar al módulo →</span>
        </div>
      </a>
    `;
    },
  ).join("");
  
  // Re-inicializar iconos de Lucide
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function renderSystemHighlights() {
  const target = document.getElementById("systemHighlights");
  if (!target) return;

  const cards = [
    {
      value: `${MODULES.length}/9`,
      label: "Secciones definidas",
    },
    {
      value: "Root",
      label: "Frontend general",
    },
    {
      value: "PR",
      label: "Trabajo colaborativo",
    },
  ];

  target.innerHTML = cards
    .map(
      (card) => `
        <article class="highlight-card">
          <strong>${card.value}</strong>
          <span>${card.label}</span>
        </article>
      `,
    )
    .join("");
}

function renderInsights() {
  const target = document.getElementById("insightsList");
  if (!target) return;

  const insights = [
    "Cada módulo evoluciona en su carpeta.",
    "Reutiliza tokens globales.",
    "Eleva al root solo mejoras compartidas.",
  ];

  target.innerHTML = insights.map((insight) => `<li>${insight}</li>`).join("");
}
