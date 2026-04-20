import { getModulesByRole, toHref } from "./navigation.js";

const DEMO_METRICS = [
  { value: "S/ 2,845", label: "Ventas de hoy", delta: "+12% vs ayer", icon: "banknote", tone: "accent" },
  { value: "18", label: "Pedidos en curso", delta: "8 delivery · 10 salón", icon: "shopping-bag", tone: "info" },
  { value: "S/ 42.10", label: "Ticket promedio", delta: "+S/ 3.40 vs ayer", icon: "receipt", tone: "success" },
  { value: "4", label: "Insumos en riesgo", delta: "Revisar almacén", icon: "package-open", tone: "warning" },
];

const DEMO_OPERATIONS = [
  {
    label: "Mesas activas",
    value: "12/18",
    hint: "Ocupación 67%",
    icon: "utensils-crossed",
    tone: "accent",
    progress: 67,
    delta: "+4 vs hora previa",
    trend: "up",
  },
  {
    label: "Delivery en ruta",
    value: "6",
    hint: "Tiempo estimado 22 min",
    icon: "bike",
    tone: "info",
    progress: null,
    delta: "2 zonas activas",
    trend: "neutral",
  },
  {
    label: "Tiempo cocina",
    value: "14 min",
    hint: "Objetivo < 18 min",
    icon: "timer",
    tone: "success",
    progress: 78,
    delta: "-2 min vs ayer",
    trend: "down",
  },
];

const DEMO_INSIGHTS = {
  admin: [
    { icon: "trending-up", tag: "Oportunidad", text: "Activa el módulo de reportes para ver márgenes por categoría." },
    { icon: "banknote", tag: "Ventas", text: "Tu ticket promedio subió S/ 3.40. Revisa qué promociones ayudaron." },
    { icon: "package-open", tag: "Alerta", text: "Cuatro insumos bajaron del stock mínimo. Genera orden de compra." },
  ],
  caja: [
    { icon: "receipt", tag: "Cierre", text: "Cierra caja con el reporte Z antes de salir de turno." },
    { icon: "wallet", tag: "Conciliación", text: "Reconcilia Yape/Plin con el total cobrado hoy." },
    { icon: "gift", tag: "Control", text: "Registra las cortesías para no descuadrar el inventario." },
  ],
  chef: [
    { icon: "flame", tag: "Prioridad", text: "Prioriza pedidos con más de 12 minutos en cola." },
    { icon: "package", tag: "Stock", text: "Revisa el stock de insumos antes del rush de la noche." },
    { icon: "chef-hat", tag: "Recetas", text: "Usa el módulo de recetas para mantener porciones estándar." },
  ],
  pedidos: [
    { icon: "map-pin", tag: "Ruta", text: "Asigna delivery por zona para reducir tiempos de entrega." },
    { icon: "check-circle", tag: "Seguimiento", text: "Actualiza el estado de los pedidos en cada fase operativa." },
    { icon: "clock", tag: "Alerta", text: "Las rutas largas suman más de 35 min, considera redistribuirlas." },
  ],
  almacen: [
    { icon: "box", tag: "Stock", text: "Revisa el reporte de insumos críticos antes de cerrar el día." },
    { icon: "trash-2", tag: "Mermas", text: "Registra las mermas con motivo para mejorar la trazabilidad." },
    { icon: "calendar", tag: "Planificación", text: "Agenda el conteo cíclico cada lunes al abrir." },
  ],
  marketing: [
    { icon: "heart", tag: "Crecimiento", text: "Los clientes frecuentes crecieron 8% esta semana." },
    { icon: "megaphone", tag: "Campaña", text: "Lanza una promoción para el segundo turno de la noche." },
    { icon: "sparkles", tag: "IA", text: "Activa el módulo de IA para segmentar campañas por historial." },
  ],
  demo: [
    { icon: "sparkles", tag: "Demo", text: "Estás viendo datos de demostración. Conecta tu punto de venta para ver datos reales." },
    { icon: "compass", tag: "Explora", text: "Explora los módulos: Pedidos, Caja, Cocina, Productos y más." },
    { icon: "shield", tag: "Acceso", text: "Los módulos de Configuración y Accesos están reservados al administrador." },
  ],
};

const DEMO_CHECKLIST = {
  demo: [
    { text: "Solicita tu acceso real desde la pantalla de login", done: false, priority: "alta", icon: "user-plus" },
    { text: "Explora Pedidos y Caja con datos de ejemplo", done: true, priority: "media", icon: "compass" },
    { text: "Prueba el asistente IA desde el botón de DalIA", done: false, priority: "baja", icon: "sparkles" },
  ],
  default: [
    { text: "Revisar pedidos pendientes del turno", done: false, priority: "alta", icon: "list-checks" },
    { text: "Reponer insumos marcados como críticos", done: false, priority: "alta", icon: "package" },
    { text: "Cuadrar caja antes del cierre", done: false, priority: "media", icon: "receipt" },
    { text: "Actualizar carta de productos con novedades", done: true, priority: "baja", icon: "menu" },
  ],
};

export function initializeDashboard(profile) {
  const activeProfile = profile || window.currentUserProfile || {
    role: window.currentUserRole || "demo",
    isDemo: true,
    firstName: "Invitado",
  };

  renderDemoBanner(activeProfile);
  renderHeroMetrics();
  renderOperationsSummary();
  renderModuleGrid(activeProfile);
  renderInsights(activeProfile);
  renderChecklist(activeProfile);

  if (window.lucide) window.lucide.createIcons();
}

function renderDemoBanner(profile) {
  const host = document.querySelector(".dashboard");
  if (!host) return;

  const existing = document.getElementById("demoBanner");
  if (!profile.isDemo) {
    existing?.remove();
    return;
  }

  if (existing) return;

  const banner = document.createElement("aside");
  banner.id = "demoBanner";
  banner.className = "demo-banner";
  banner.innerHTML = `
    <div class="demo-banner__icon" aria-hidden="true">
      <i data-lucide="sparkles"></i>
    </div>
    <div class="demo-banner__copy">
      <strong>Estás navegando como cuenta demo</strong>
      <p>Los datos que ves son de ejemplo. Configuración, Accesos, Facturación y Reportes están reservados para administradores con credenciales reales.</p>
    </div>
    <a class="btn btn--secondary" href="${toHref("login.html")}">
      <i data-lucide="user-plus"></i>
      Solicitar acceso real
    </a>
  `;
  host.prepend(banner);
}

function renderHeroMetrics() {
  const target = document.getElementById("dashboardMetrics");
  if (!target) return;

  target.innerHTML = DEMO_METRICS.map((metric) => `
    <article class="stat-card stat-card--${metric.tone}">
      <span class="stat-card__icon" aria-hidden="true">
        <i data-lucide="${metric.icon}"></i>
      </span>
      <strong>${metric.value}</strong>
      <span>${metric.label}</span>
      <small class="stat-card__delta">${metric.delta}</small>
    </article>
  `).join("");
}

function renderOperationsSummary() {
  const target = document.getElementById("systemHighlights");
  if (!target) return;

  const trendIcon = {
    up: "trending-up",
    down: "trending-down",
    neutral: "minus",
  };

  target.innerHTML = DEMO_OPERATIONS.map((item) => {
    const progressBar = typeof item.progress === "number"
      ? `<div class="ops-card__progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${item.progress}">
           <div class="ops-card__progress-bar" style="width: ${Math.min(100, Math.max(0, item.progress))}%;"></div>
         </div>`
      : `<div class="ops-card__progress ops-card__progress--empty"></div>`;

    return `
      <article class="ops-card ops-card--${item.tone}">
        <div class="ops-card__head">
          <span class="ops-card__icon" aria-hidden="true">
            <i data-lucide="${item.icon}"></i>
          </span>
          <span class="ops-card__trend ops-card__trend--${item.trend}">
            <i data-lucide="${trendIcon[item.trend] || "minus"}"></i>
          </span>
        </div>
        <div class="ops-card__body">
          <span class="ops-card__label">${item.label}</span>
          <strong class="ops-card__value">${item.value}</strong>
          <span class="ops-card__hint">${item.hint}</span>
        </div>
        ${progressBar}
        <small class="ops-card__delta">${item.delta}</small>
      </article>
    `;
  }).join("");
}

function renderModuleGrid(profile) {
  const target = document.getElementById("moduleGrid");
  if (!target) return;

  const allowed = getModulesByRole(profile.role, profile.permissions).filter((item) => item.key !== "dashboard");

  if (allowed.length === 0) {
    target.innerHTML = `
      <article class="module-card module-card--empty">
        <h3>Sin módulos asignados</h3>
        <p>Tu rol actual no tiene módulos operativos visibles. Contacta al administrador para ajustar tus permisos.</p>
      </article>
    `;
    return;
  }

  target.innerHTML = allowed.map((module) => {
    const iconName = module.icon || "circle";
    return `
      <a class="module-card" href="${toHref(module.path)}">
        <div class="module-card__header">
          <span class="module-card__token">
            <i data-lucide="${iconName}" style="width:28px;height:28px;color:var(--color-accent)"></i>
          </span>
          <span class="chip chip--soft">Activo</span>
        </div>
        <h3>${module.label}</h3>
        <p style="font-size: 13px; color: var(--color-text-muted); line-height: 1.45; margin-top: 4px;">
          ${module.description}
        </p>
        <div class="module-card__footer" style="margin-top: 12px;">
          <span class="module-card__cta">Entrar al módulo →</span>
        </div>
      </a>
    `;
  }).join("");
}

function renderInsights(profile) {
  const target = document.getElementById("insightsList");
  if (!target) return;

  const insights = DEMO_INSIGHTS[profile.role] || DEMO_INSIGHTS.demo;
  target.innerHTML = insights.map((item) => {
    if (typeof item === "string") {
      return `<li class="insight-chip"><span class="insight-chip__bullet"></span><div class="insight-chip__body"><p>${item}</p></div></li>`;
    }
    return `
      <li class="insight-chip">
        <span class="insight-chip__icon" aria-hidden="true">
          <i data-lucide="${item.icon || "sparkles"}"></i>
        </span>
        <div class="insight-chip__body">
          ${item.tag ? `<span class="insight-chip__tag">${item.tag}</span>` : ""}
          <p>${item.text}</p>
        </div>
      </li>
    `;
  }).join("");
}

function renderChecklist(profile) {
  const target = document.getElementById("operationalChecklist");
  if (!target) return;

  const items = profile.isDemo ? DEMO_CHECKLIST.demo : DEMO_CHECKLIST.default;
  const total = items.length;
  const done = items.filter((item) => item.done).length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  const progressHost = document.getElementById("checklistProgress");
  if (progressHost) {
    progressHost.innerHTML = `
      <div class="checklist-progress__meta">
        <span><strong>${done}</strong> de <strong>${total}</strong> completadas</span>
        <span class="checklist-progress__percent">${percent}%</span>
      </div>
      <div class="checklist-progress__bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percent}">
        <div class="checklist-progress__fill" style="width:${percent}%;"></div>
      </div>
    `;
  }

  target.innerHTML = items.map((item, index) => {
    const priority = item.priority || "media";
    const iconName = item.icon || "circle";
    const checkIcon = item.done ? "check" : "circle";
    return `
      <li class="action-row ${item.done ? "action-row--done" : ""}" data-priority="${priority}">
        <button type="button"
          class="action-row__check ${item.done ? "action-row__check--done" : ""}"
          data-checklist-index="${index}"
          aria-label="${item.done ? "Marcar como pendiente" : "Marcar como completada"}">
          <i data-lucide="${checkIcon}"></i>
        </button>
        <span class="action-row__icon" aria-hidden="true">
          <i data-lucide="${iconName}"></i>
        </span>
        <div class="action-row__body">
          <p>${item.text}</p>
          <span class="action-row__priority action-row__priority--${priority}">
            Prioridad ${priority}
          </span>
        </div>
      </li>
    `;
  }).join("");

  target.querySelectorAll("[data-checklist-index]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.dataset.checklistIndex);
      if (!Number.isInteger(idx)) return;
      items[idx].done = !items[idx].done;
      renderChecklist(profile);
      if (window.lucide) window.lucide.createIcons();
    });
  });
}
