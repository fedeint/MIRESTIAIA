import {
  courtesyCatalog,
  courtesyDashboard,
  courtesyLimits,
  creditNoteDrafts,
  desktopDeliveryWorkspace,
  desktopPaymentMethods,
  desktopRoundStatusMeta,
  desktopTableJourneys,
  desktopTakeawayWorkspace,
  desktopTipOptions,
  deliveryStatusFlow,
  deliveryStatusMeta,
  deliveryStatusOptions,
  documentTypeOptions,
  paymentMethodOptions,
  staffMealConsumption,
  statusMeta,
  statusOptions,
  takeawaySourceOptions,
  takeawayStatusFlow,
  takeawayStatusMeta,
  takeawayStatusOptions,
  tipsDashboard,
} from './data.js';

export function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(value || 0);
}

export function slugify(value) {
  return String(value).toLowerCase().replace(/\s+/g, '-');
}

export function getModeDefinition(mode) {
  const definitions = {
    salon: {
      eyebrow: 'Pedidos',
      title: 'Salón',
      description: 'Gestión de mesas y pedidos presenciales dentro del módulo Pedidos.',
      heroTitle: 'Salón con foco en toma de pedido, cocina y comprobante.',
      heroDescription: 'Aquí el mesero opera mesas, agrega productos y cierra con boleta o factura sin salir del flujo principal.',
      workspaceTitle: 'Pedidos en salón',
      workspaceDescription: 'Mapa operativo compacto con selección única y acciones limpias.',
      primaryActionLabel: 'Nueva mesa',
      primaryActionIcon: 'plus',
      heroTags: ['Mesas', 'Pedido', 'Comprobante'],
    },
    delivery: {
      eyebrow: 'Pedidos',
      title: 'Delivery',
      description: 'Pizarra observacional de pedidos externos con tiempo, canal y comprobante.',
      heroTitle: 'Delivery para observar, priorizar y facturar sin gestionar cocina.',
      heroDescription: 'El mesero solo monitorea estado, tiempo, canal y monto para emitir boleta o factura cuando corresponda.',
      workspaceTitle: 'Pizarra delivery',
      workspaceDescription: 'Flujo visual tipo board con lectura rápida y detalle lateral.',
      primaryActionLabel: 'Urgentes',
      primaryActionIcon: 'alert',
      heroTags: ['Observación', 'Tiempo', 'Comprobante'],
    },
    takeaway: {
      eyebrow: 'Pedidos',
      title: 'Para llevar',
      description: 'Gestión de pedidos para llevar con recargo, promesa y cierre documental.',
      heroTitle: 'Para llevar operable desde salón o WhatsApp con control de recargo.',
      heroDescription: 'El mesero gestiona preparación, promesa, boleta/factura y salida del pedido sin ruido visual innecesario.',
      workspaceTitle: 'Pedidos para llevar',
      workspaceDescription: 'Flujo visual tipo board con columnas equivalentes a delivery y detalle de recojo.',
      primaryActionLabel: 'Listos',
      primaryActionIcon: 'bag',
      heroTags: ['Recojo', 'Recargo 10%', 'Promesa'],
    },
  };

  return definitions[mode] || definitions.salon;
}

export function getStatusInfo(status) {
  return statusMeta[status] || statusMeta.libre;
}

export function getDeliveryStatusInfo(status) {
  return deliveryStatusMeta[status] || deliveryStatusMeta.pendiente;
}

export function getTakeawayStatusInfo(status) {
  return takeawayStatusMeta[status] || takeawayStatusMeta.recibido;
}

export function getWaiterName(waiters, waiterId) {
  return waiters.find((waiter) => waiter.id === waiterId)?.name || 'Sin asignar';
}

export function getCourierName(couriers, courierId) {
  return couriers.find((courier) => courier.id === courierId)?.name || 'Sin asignar';
}

export function getTableItemsCount(table) {
  return table?.order?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
}

export function getOrderDetails(table, products) {
  const lines = (table?.order?.items || []).map((item) => {
    const product = products.find((entry) => entry.id === item.productId);
    return {
      ...item,
      product,
      subtotal: (product?.price || 0) * item.quantity,
    };
  });

  const baseTotal = lines.reduce((acc, item) => acc + item.subtotal, 0);
  const surchargeTotal = table?.order?.serviceType === 'takeaway' ? roundCurrency(baseTotal * (table?.order?.packagingFeeRate || 0)) : 0;

  return {
    lines,
    baseTotal,
    surchargeTotal,
    total: roundCurrency(baseTotal + surchargeTotal),
  };
}

function roundCurrency(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

function getDocumentTypeLabel(type) {
  return type === 'factura' ? 'Factura' : 'Boleta';
}

function getPaymentMethodLabel(method) {
  return paymentMethodOptions.find((option) => option.value === method)?.label || 'Pendiente';
}

function getDocumentStatusLabel(order) {
  return order?.documentIssued ? `${getDocumentTypeLabel(order.documentType)} emitida` : `${getDocumentTypeLabel(order?.documentType)} pendiente`;
}

function getPaymentStatusLabel(order) {
  return order?.paymentConfirmed ? 'Pago validado' : 'Pago pendiente';
}

function getStatusTone(isOk) {
  return isOk ? 'is-ready' : 'is-pending';
}

function getDesktopRoundStatusInfo(status) {
  return desktopRoundStatusMeta[status] || { label: 'Pendiente', tone: 'neutral' };
}

function getProductById(products, productId) {
  return products.find((product) => product.id === productId) || null;
}

function getDesktopCategoryProducts(products, categoryId) {
  if (!categoryId || categoryId === 'all') return products.slice(0, 4);
  return products.filter((product) => product.category === categoryId).slice(0, 4);
}

function getDesktopPaymentMethodInfo(methodId) {
  return desktopPaymentMethods.find((method) => method.id === methodId) || desktopPaymentMethods[0];
}

function buildFallbackJourneyFromTable(table, lines, total, waiterName) {
  return {
    guests: Math.max(1, Math.min(6, getTableItemsCount(table) || 1)),
    staffSummary: `${Math.max(1, Math.min(6, getTableItemsCount(table) || 1))} personas · Mozo: ${waiterName}`,
    durationLabel: 'Atención activa',
    totalAccumulated: total,
    activeRoundId: 'round-fallback',
    rounds: [
      {
        id: 'round-fallback',
        label: 'Ronda activa',
        createdAt: 'Ahora',
        status: table.status === 'ocupada' ? 'abierta' : 'enviada',
        total,
        items: lines.map((line) => ({
          productId: line.productId,
          quantity: line.quantity,
          subtotal: line.subtotal,
        })),
      },
    ],
    bill: {
      subtotal: total,
      igv: 0,
      total,
      pendingKitchenNote: lines.length ? '' : 'La mesa aún no registra consumo activo.',
    },
    paymentDraft: {
      tipRate: 0,
      documentType: table.order?.documentType || 'boleta',
      method: 'efectivo',
      amount: total,
      discountCode: '',
      proof: null,
    },
  };
}

export function getSummaryStats(tables) {
  const summary = { total: tables.length, libre: 0, ocupada: 0, reservada: 0 };
  tables.forEach((table) => {
    if (summary[table.status] !== undefined) summary[table.status] += 1;
  });

  return [
    { label: 'Mesas', value: summary.total, helper: 'Capacidad activa', tone: 'neutral', icon: 'grid' },
    { label: 'Libres', value: summary.libre, helper: 'Listas para atender', tone: 'success', icon: 'check-circle' },
    { label: 'Ocupadas', value: summary.ocupada, helper: 'Con pedido activo', tone: 'danger', icon: 'utensils' },
    { label: 'Reservas', value: summary.reservada, helper: 'Atención próxima', tone: 'info', icon: 'clock' },
  ];
}

export function getOperationalSummary({ mode, tables, deliveryOrders, takeawayOrders }) {
  if (mode === 'delivery') {
    const active = deliveryOrders.filter((order) => order.status !== 'entregado');
    const delayed = active.filter((order) => getDeliveryRemainingMinutes(order) < 0).length;
    const ready = deliveryOrders.filter((order) => order.status === 'listo-salir').length;
    const onRoute = deliveryOrders.filter((order) => order.status === 'en-ruta').length;
    return [
      { label: 'Activos', value: active.length, helper: 'Board visible', tone: 'neutral', icon: 'bike' },
      { label: 'Listos', value: ready, helper: 'Esperando salida', tone: 'accent', icon: 'package' },
      { label: 'En ruta', value: onRoute, helper: 'Seguimiento', tone: 'info', icon: 'route' },
      { label: 'Tarde', value: delayed, helper: 'Requieren foco', tone: 'danger', icon: 'alert' },
    ];
  }

  if (mode === 'takeaway') {
    const active = takeawayOrders.filter((order) => order.status !== 'entregado');
    const preparing = takeawayOrders.filter((order) => order.status === 'en-preparacion').length;
    const ready = takeawayOrders.filter((order) => order.status === 'listo-recoger').length;
    const delayed = active.filter((order) => order.minutesToPromise < 0).length;
    return [
      { label: 'Para llevar', value: active.length, helper: 'Pendientes de salida', tone: 'neutral', icon: 'bag' },
      { label: 'Preparación', value: preparing, helper: 'Cocina activa', tone: 'info', icon: 'flame' },
      { label: 'Listos', value: ready, helper: 'Esperan recojo', tone: 'accent', icon: 'check-circle' },
      { label: 'Tarde', value: delayed, helper: 'Promesa excedida', tone: 'danger', icon: 'alert' },
    ];
  }

  return getSummaryStats(tables);
}

export function filterTables(tables, filters, waiters) {
  const term = filters.search.trim().toLowerCase();

  return [...tables]
    .filter((table) => {
      const waiterName = getWaiterName(waiters, table.waiterId).toLowerCase();
      const description = `${table.zone} ${table.description}`.toLowerCase();
      const matchesTerm =
        !term || table.number.toLowerCase().includes(term) || waiterName.includes(term) || description.includes(term);
      const matchesZone = filters.zone === 'all' || slugify(table.zone) === filters.zone;
      const matchesStatus = filters.status === 'all' || table.status === filters.status;
      return matchesTerm && matchesZone && matchesStatus;
    })
    .sort((a, b) => Number(a.number) - Number(b.number));
}

export function filterDeliveryOrders(orders, filters, couriers) {
  const term = filters.search.trim().toLowerCase();

  return [...orders]
    .filter((order) => {
      const courierName = getCourierName(couriers, order.courierId).toLowerCase();
      const haystack = `${order.code} ${order.customer} ${order.channel} ${order.address} ${courierName}`.toLowerCase();
      const matchesSearch = !term || haystack.includes(term);
      const matchesStatus = filters.status === 'all' || order.status === filters.status;
      const matchesChannel = filters.channel === 'all' || slugify(order.channel) === filters.channel;
      const remaining = getDeliveryRemainingMinutes(order);
      const matchesQuick =
        filters.quick === 'all'
          ? true
          : filters.quick === 'urgent'
            ? order.status !== 'entregado' && remaining <= 5
            : filters.quick === 'active'
              ? order.status !== 'entregado'
              : filters.quick === 'completed'
                ? order.status === 'entregado'
                : true;
      return matchesSearch && matchesStatus && matchesChannel && matchesQuick;
    })
    .sort((a, b) => {
      const statusDiff = deliveryStatusFlow.indexOf(a.status) - deliveryStatusFlow.indexOf(b.status);
      if (statusDiff !== 0) return statusDiff;
      return getDeliveryRemainingMinutes(a) - getDeliveryRemainingMinutes(b);
    });
}

export function filterTakeawayOrders(orders, filters) {
  const term = filters.search.trim().toLowerCase();

  return [...orders]
    .filter((order) => {
      const haystack = `${order.code} ${order.customer} ${order.channel} ${order.pickupCode}`.toLowerCase();
      const matchesSearch = !term || haystack.includes(term);
      const matchesStatus = filters.status === 'all' || order.status === filters.status;
      const matchesChannel = filters.channel === 'all' || slugify(order.channel) === filters.channel;
      const matchesQuick =
        filters.quick === 'all'
          ? true
          : filters.quick === 'urgent'
            ? order.status !== 'entregado' && order.minutesToPromise <= 5
            : filters.quick === 'ready'
              ? order.status === 'listo-recoger'
              : filters.quick === 'completed'
                ? order.status === 'entregado'
                : true;
      return matchesSearch && matchesStatus && matchesChannel && matchesQuick;
    })
    .sort((a, b) => a.minutesToPromise - b.minutesToPromise);
}

export function getDeliveryRemainingMinutes(order) {
  return (order?.etaMinutes || 0) - (order?.elapsedMinutes || 0);
}

export function getDeliveryTimeText(order) {
  const remaining = getDeliveryRemainingMinutes(order);
  if (remaining < 0) return `${Math.abs(remaining)} min de retraso`;
  if (remaining === 0) return 'Sale ahora';
  return `${remaining} min para ETA`;
}

export function getTakeawayTimeText(order) {
  if (order.minutesToPromise < 0) return `${Math.abs(order.minutesToPromise)} min de retraso`;
  if (order.minutesToPromise === 0) return 'Recojo en puerta';
  return `${order.minutesToPromise} min restantes`;
}

export function getUrgentDeliveryCandidateId(orders) {
  return [...orders]
    .filter((order) => order.status !== 'entregado')
    .sort((a, b) => getDeliveryRemainingMinutes(a) - getDeliveryRemainingMinutes(b))[0]?.id || null;
}

export function getReadyTakeawayCandidateId(orders) {
  return orders.find((order) => order.status === 'listo-recoger')?.id || orders[0]?.id || null;
}

export function getNextStatus(currentStatus, flow) {
  const index = flow.indexOf(currentStatus);
  if (index < 0 || index === flow.length - 1) return null;
  return flow[index + 1];
}

function renderToolbarSkeleton() {
  return `
    <div class="workspace-toolbar workspace-toolbar--loading">
      <div class="skeleton skeleton-pill"></div>
      <div class="skeleton skeleton-pill"></div>
      <div class="skeleton skeleton-pill skeleton-pill--small"></div>
    </div>
  `;
}

function renderStatsSkeleton() {
  return Array.from({ length: 4 })
    .map(
      () => `
        <article class="summary-card summary-card--skeleton">
          <div class="summary-card__icon skeleton"></div>
          <div class="summary-card__body">
            <div class="skeleton skeleton-line skeleton-line--sm"></div>
            <div class="skeleton skeleton-line skeleton-line--lg"></div>
            <div class="skeleton skeleton-line skeleton-line--md"></div>
          </div>
        </article>
      `,
    )
    .join('');
}

function renderPanelSkeleton() {
  return `
    <section class="panel-shell panel-shell--loading">
      <div class="panel-header">
        <div>
          <div class="skeleton skeleton-line skeleton-line--sm"></div>
          <div class="skeleton skeleton-line skeleton-line--lg"></div>
        </div>
      </div>
      <div class="panel-grid">
        <div class="skeleton skeleton-card"></div>
        <div class="skeleton skeleton-card"></div>
        <div class="skeleton skeleton-card"></div>
      </div>
      <div class="skeleton skeleton-block"></div>
      <div class="skeleton skeleton-block"></div>
    </section>
  `;
}

function renderQueueSkeleton(type) {
  if (type === 'delivery') {
    return `
      <section class="queue-board queue-board--loading">
        ${Array.from({ length: 4 })
          .map(
            () => `
              <article class="queue-column">
                <div class="queue-column__header">
                  <div class="skeleton skeleton-line skeleton-line--sm"></div>
                  <div class="skeleton skeleton-badge"></div>
                </div>
                <div class="queue-column__list">
                  ${Array.from({ length: 2 }).map(() => '<div class="skeleton skeleton-card skeleton-card--queue"></div>').join('')}
                </div>
              </article>
            `,
          )
          .join('')}
      </section>
    `;
  }

  return `
    <section class="pickup-stack pickup-stack--loading">
      ${Array.from({ length: 3 })
        .map(
          () => `
            <article class="pickup-section">
              <div class="pickup-section__header">
                <div class="skeleton skeleton-line skeleton-line--sm"></div>
                <div class="skeleton skeleton-badge"></div>
              </div>
              <div class="pickup-section__list">
                ${Array.from({ length: 2 }).map(() => '<div class="skeleton skeleton-card skeleton-card--queue"></div>').join('')}
              </div>
            </article>
          `,
        )
        .join('')}
    </section>
  `;
}

export function renderIcons(container = document) {
  container.querySelectorAll('[data-icon]').forEach((slot) => {
    slot.innerHTML = iconMap[slot.dataset.icon] || '';
  });
}

export function renderStats(stats, { loading = false } = {}) {
  if (loading) return renderStatsSkeleton();

  return stats
    .map(
      (stat) => `
        <article class="summary-card summary-card--${stat.tone}">
          <div class="summary-card__body">
            <p>${escapeHtml(stat.label)}</p>
            <strong>${escapeHtml(stat.value)}</strong>
            <span>${escapeHtml(stat.helper)}</span>
          </div>
        </article>
      `,
    )
    .join('');
}

export function renderModeSwitcher({ activeMode }) {
  const modes = [
    { id: 'salon', label: 'Salón', icon: 'grid' },
    { id: 'delivery', label: 'Delivery', icon: 'bike' },
    { id: 'takeaway', label: 'Para llevar', icon: 'bag' },
  ];

  return `
    <div class="mode-switcher" role="tablist" aria-label="Cambiar modo operativo">
      ${modes
        .map(
          (mode) => `
            <button type="button" class="mode-switch ${activeMode === mode.id ? 'is-active' : ''}" role="tab" aria-selected="${activeMode === mode.id}" data-set-mode="${mode.id}">
              <span class="icon-slot" data-icon="${mode.icon}"></span>
              <span>${escapeHtml(mode.label)}</span>
            </button>
          `,
        )
        .join('')}
    </div>
  `;
}

export function renderModeHero({ mode, dismissed, installPromptAvailable }) {
  const definition = getModeDefinition(mode);
  return `
    <section class="card-surface mode-hero mode-hero--minimal mode-hero--${mode}">
      <div class="mode-hero__content mode-hero__content--minimal">
        <div>
          <h2>${escapeHtml(definition.title)}</h2>
        </div>
      </div>
    </section>
  `;
}

export function renderDesktopAreaTabs(activeArea = 'pedidos') {
  const tabs = [
    { id: 'pedidos', label: 'Pedidos' },
    { id: 'courtesies', label: 'Cortesías' },
    { id: 'tips', label: 'Propinas' },
    { id: 'credit-notes', label: 'Nota de crédito' },
  ];

  return `
    <div class="desktop-area-tabs" role="tablist" aria-label="Áreas operativas desktop">
      ${tabs
        .map(
          (tab) => `
            <button type="button" class="desktop-area-tab ${activeArea === tab.id ? 'is-active' : ''}" role="tab" aria-selected="${activeArea === tab.id}" data-action="set-desktop-area" data-area="${tab.id}">
              ${escapeHtml(tab.label)}
            </button>
          `,
        )
        .join('')}
    </div>
  `;
}

export function renderOnboarding({ open, step, installPromptAvailable }) {
  if (!open) return '';

  const steps = [
    {
      title: 'Pedidos',
      eyebrow: 'Paso 1',
      description: 'Este es el módulo central. Aquí solo cambias entre Salón, Delivery y Para llevar.',
      bullets: ['Tabs del módulo', 'Tema', 'Usuario'],
      focusLabel: 'Barra superior',
      focusTarget: 'Topbar + tabs',
      spotlight: 'topbar',
      accent: 'neutral',
    },
    {
      title: 'Salón',
      eyebrow: 'Paso 2',
      description: 'En salón abres mesa, agregas productos, revisas pedido y facturas.',
      bullets: ['Mesas', 'Pedido', 'Facturar'],
      focusLabel: 'Trabajo en mesas',
      focusTarget: 'Grid + panel',
      spotlight: 'workspace',
      accent: 'accent',
    },
    {
      title: 'Delivery',
      eyebrow: 'Paso 3',
      description: 'Aquí solo observas estado, tiempo y comprobante. No gestionas cocina.',
      bullets: ['Estado', 'Tiempo', 'Boleta/Factura'],
      focusLabel: 'Pizarra delivery',
      focusTarget: 'Board observacional',
      spotlight: 'board',
      accent: 'info',
    },
    {
      title: 'Para llevar',
      eyebrow: 'Paso 4',
      description: 'Gestionas recojo, pago y recargo si el pedido vino por salón o WhatsApp.',
      bullets: ['Recojo', 'Pago', 'Recargo'],
      focusLabel: 'Flujo de recojo',
      focusTarget: 'Pizarra + detalle',
      spotlight: 'board',
      accent: 'success',
    },
  ];

  const currentStep = steps[step] || steps[0];

  return `
    <div class="onboarding-backdrop onboarding-backdrop--figma">
      <div class="onboarding-spotlight onboarding-spotlight--${currentStep.spotlight}"></div>

      <section class="onboarding-popover onboarding-popover--${currentStep.spotlight}" role="dialog" aria-modal="true" aria-label="Guía contextual de Pedidos">
        <div class="onboarding-popover__header">
          <div>
            <p class="eyebrow eyebrow--accent">${escapeHtml(currentStep.eyebrow)}</p>
            <h3>${escapeHtml(currentStep.title)}</h3>
          </div>
          <button type="button" class="icon-button icon-button--ghost" data-action="skip-onboarding" aria-label="Cerrar guía">
            <span class="icon-slot" data-icon="x"></span>
          </button>
        </div>

        <p class="onboarding-popover__description">${escapeHtml(currentStep.description)}</p>
        <div class="onboarding-focus-chip">
          <span class="onboarding-hint__label">${escapeHtml(currentStep.focusLabel)}</span>
          <strong>${escapeHtml(currentStep.focusTarget)}</strong>
        </div>
        <ul class="onboarding-list onboarding-list--popover">
          ${currentStep.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join('')}
        </ul>

        <div class="onboarding-footer">
          <div class="onboarding-dots" aria-label="Progreso de onboarding">
            ${steps
              .map(
                (_, index) => `
                  <button type="button" class="onboarding-dot ${index === step ? 'is-active' : ''}" data-action="jump-onboarding" data-step="${index}" aria-label="Ir al paso ${index + 1}"></button>
                `,
              )
              .join('')}
          </div>
          <div class="onboarding-actions onboarding-actions--inline">
            <button type="button" class="btn btn--ghost btn--sm" data-action="skip-onboarding">Omitir</button>
            <div class="onboarding-actions__group">
              <button type="button" class="btn btn--secondary btn--sm" data-action="prev-onboarding" ${step === 0 ? 'disabled' : ''}>Atrás</button>
              ${step === steps.length - 1
                ? '<button type="button" class="btn btn--primary btn--sm" data-action="complete-onboarding">Listo</button>'
                : '<button type="button" class="btn btn--primary btn--sm" data-action="next-onboarding">Sigue</button>'}
            </div>
          </div>
        </div>
      </section>
    </div>
  `;
}

export function renderWorkspaceHeader({ mode, collapsed, viewMode = 'cards' }) {
  const definition = getModeDefinition(mode);
  return `
    <div class="workspace-heading">
      <div>
        <h3>${escapeHtml(definition.workspaceTitle)}</h3>
      </div>
      ${mode === 'salon'
        ? `
            <div class="workspace-heading__actions">
              <div class="view-toggle" role="group" aria-label="Cambiar vista de mesas">
                <button type="button" class="icon-button icon-button--ghost ${viewMode === 'cards' ? 'is-active' : ''}" data-action="set-salon-view" data-view="cards" aria-label="Vista cards"><span class="icon-slot" data-icon="grid"></span></button>
                <button type="button" class="icon-button icon-button--ghost ${viewMode === 'list' ? 'is-active' : ''}" data-action="set-salon-view" data-view="list" aria-label="Vista lista"><span class="icon-slot" data-icon="list"></span></button>
              </div>
              <button type="button" class="btn btn--secondary btn--sm" data-action="open-create-modal"><span class="icon-slot" data-icon="plus"></span><span>Añadir</span></button>
            </div>
          `
        : ''}
    </div>
  `;
}

export function renderSalonToolbar({ filters, zones, filteredCount, totalCount, loading = false }) {
  if (loading) return renderToolbarSkeleton();

  return `
    <div class="workspace-toolbar workspace-toolbar--salon-refined">
      <div class="toolbar-search toolbar-search--salon">
        <span class="icon-slot" data-icon="search"></span>
        <input id="salonSearch" type="search" placeholder="Buscar por mesa, zona o mesero" value="${escapeHtml(filters.search)}" aria-label="Buscar mesas" />
      </div>
    </div>
  `;
}

export function renderDeliveryToolbar({ filters, filteredCount, totalCount, loading = false }) {
  if (loading) return renderToolbarSkeleton();

  return `
    <div class="workspace-toolbar workspace-toolbar--salon-refined workspace-toolbar--delivery-clean">
      <div class="toolbar-search toolbar-search--salon">
        <span class="icon-slot" data-icon="search"></span>
        <input id="deliverySearch" type="search" placeholder="Buscar por código, cliente o repartidor" value="${escapeHtml(filters.search)}" aria-label="Buscar pedidos delivery" />
      </div>
    </div>
  `;
}

export function renderTakeawayToolbar({ filters, filteredCount, totalCount, loading = false }) {
  if (loading) return renderToolbarSkeleton();

  return `
    <div class="workspace-toolbar workspace-toolbar--salon-refined workspace-toolbar--takeaway-clean">
      <div class="toolbar-search toolbar-search--salon">
        <span class="icon-slot" data-icon="search"></span>
        <input id="takeawaySearch" type="search" placeholder="Buscar por código, cliente o código de recojo" value="${escapeHtml(filters.search)}" aria-label="Buscar pedidos para llevar" />
      </div>
    </div>
  `;
}

const ZONE_CONFIG = {
  interior: { slug: 'interior', icon: '🪑' },
  terraza: { slug: 'terraza', icon: '🌿' },
  barra: { slug: 'barra', icon: '🍸' },
  vip: { slug: 'vip', icon: '⭐' },
};

function getZoneConfig(zone) {
  return ZONE_CONFIG[String(zone).toLowerCase().trim()] || { slug: 'default', icon: '🪑' };
}

export function renderTables({ tables, selectedTableId, waiters, products, viewMode = 'cards' }) {
  if (!tables.length) {
    return `
      <section class="empty-state empty-state--grid">
        <div class="empty-state__icon icon-slot" data-icon="grid"></div>
        <h3>Sin coincidencias</h3>
        <p>Ajusta los filtros o crea una nueva mesa para continuar.</p>
      </section>
    `;
  }

  if (viewMode === 'list') {
    return `
      <section class="table-list">
        ${tables
          .map((table) => {
            const status = getStatusInfo(table.status);
            const waiterName = getWaiterName(waiters, table.waiterId);
            const itemsCount = getTableItemsCount(table);
            const { total } = getOrderDetails(table, products);
            const isSelected = table.id === selectedTableId;
            return `
              <article class="table-list-row ${isSelected ? 'is-selected' : ''}" tabindex="0" role="button" aria-pressed="${isSelected}" data-select-table="${table.id}">
                <div class="table-list-row__main">
                  <strong>Mesa ${escapeHtml(table.number)}</strong>
                  <span>${escapeHtml(table.zone)} · ${escapeHtml(table.description)}</span>
                </div>
                <div class="table-list-row__meta">
                  <span class="badge badge--${status.tone}">${escapeHtml(status.label)}</span>
                  <span>${escapeHtml(waiterName)}</span>
                  <strong>${itemsCount} prod. · ${formatCurrency(total)}</strong>
                </div>
              </article>
            `;
          })
          .join('')}
      </section>
    `;
  }

  return `
    <section class="tables-grid">
      ${tables
        .map((table) => {
          const status = getStatusInfo(table.status);
          const waiterName = getWaiterName(waiters, table.waiterId);
          const itemsCount = getTableItemsCount(table);
          const { total } = getOrderDetails(table, products);
          const isSelected = table.id === selectedTableId;
          const zone = getZoneConfig(table.zone);

          return `
            <article class="table-card table-card--${status.tone} table-card--zone-${zone.slug} ${isSelected ? 'is-selected' : ''}" tabindex="0" role="button" aria-pressed="${isSelected}" data-select-table="${table.id}">
              <div class="table-card__topline table-card__topline--${status.tone}"></div>
              <div class="table-card__inner">
                <div class="table-card__header">
                  <div class="table-card__title-block">
                    <p class="table-card__eyebrow">Mesa</p>
                    <h4>${escapeHtml(table.number)}</h4>
                  </div>
                  <span class="badge badge--${status.tone}">
                    <span class="icon-slot" data-icon="${status.icon}"></span>
                    ${escapeHtml(status.label)}
                  </span>
                </div>
                <div class="table-card__area-row">
                  <span class="table-area-pill table-area-pill--${zone.slug}">
                    <span class="table-card__zone-icon">${zone.icon}</span>
                    <span>${escapeHtml(table.zone)}</span>
                  </span>
                </div>
                <p class="table-card__location">${escapeHtml(table.description)}</p>
                <div class="table-card__info-grid">
                  <div class="table-card__info-box">
                    <span>Mesero asignado</span>
                    <strong>${escapeHtml(waiterName)}</strong>
                  </div>
                  <div class="table-card__info-box">
                    <span>Productos</span>
                    <strong>${itemsCount} registrados</strong>
                  </div>
                </div>
                <div class="table-card__summary-row">
                  <span>Total consumido</span>
                  <strong>${formatCurrency(total)}</strong>
                </div>
              </div>
            </article>
          `;
        })
        .join('')}
    </section>
  `;
}

export function renderTablesSkeleton() {
  return `
    <section class="tables-grid">
      ${Array.from({ length: 8 })
        .map(
          () => `
            <article class="table-card table-card--skeleton">
              <div class="table-card__zone-banner skeleton"></div>
              <div class="table-card__inner">
                <div class="skeleton skeleton-line skeleton-line--sm"></div>
                <div class="skeleton skeleton-line skeleton-line--lg"></div>
                <div class="skeleton skeleton-line skeleton-line--md"></div>
                <div class="skeleton skeleton-line skeleton-line--md"></div>
                <div class="table-card__actions">
                  <div class="skeleton skeleton-pill"></div>
                  <div class="skeleton skeleton-pill"></div>
                </div>
              </div>
            </article>
          `,
        )
        .join('')}
    </section>
  `;
}

export function renderManagementPanel({ table, waiters, products, collapsed = false, loading = false, operationsExpanded = false, desktopWorkbench = null }) {
  if (loading) return renderPanelSkeleton();
  if (collapsed) return renderCollapsedPanel('salon', 'Panel', 'Resumen', 'Ábrelo cuando necesites detalle.');

  if (!table) {
    return `
      <section class="empty-state empty-state--side panel-shell">
        <div class="empty-state__icon icon-slot" data-icon="pointer"></div>
        <h3>Selecciona una mesa</h3>
        <p>Activa una card para ver detalle.</p>
      </section>
    `;
  }

  const status = getStatusInfo(table.status);
  const waiterName = getWaiterName(waiters, table.waiterId);
  const { lines, total } = getOrderDetails(table, products);
  const itemsCount = getTableItemsCount(table);
  const previewLines = lines.slice(0, 4);
  const fallbackJourney = buildFallbackJourneyFromTable(table, lines, total, waiterName);
  const presetJourney = desktopTableJourneys[table.id] || null;
  const journey = presetJourney
    ? {
        ...fallbackJourney,
        ...presetJourney,
        rounds: Array.isArray(presetJourney.rounds) && presetJourney.rounds.length ? presetJourney.rounds : fallbackJourney.rounds,
        bill: {
          ...fallbackJourney.bill,
          ...(presetJourney.bill || {}),
        },
        paymentDraft: {
          ...fallbackJourney.paymentDraft,
          ...(presetJourney.paymentDraft || {}),
        },
      }
    : fallbackJourney;
  const activeRoundId = desktopWorkbench?.salon?.roundId || journey?.activeRoundId || journey?.rounds?.[0]?.id || null;
  const activeRound = journey?.rounds?.find((round) => round.id === activeRoundId) || null;
  const composerCategory = desktopWorkbench?.salon?.composerCategory || 'postres';
  const composerProducts = getDesktopCategoryProducts(products, composerCategory);
  const paymentDraft = journey?.paymentDraft || null;
  const selectedPaymentMethod = getDesktopPaymentMethodInfo(paymentDraft?.method || 'efectivo');
  const tipRate = Number(paymentDraft?.tipRate || 0);
  const proofDraft = desktopWorkbench?.payments?.pendingProofDraft || null;

  return `
    <section class="panel-shell panel-shell--salon">
      <div class="panel-shell__hero">
        <div class="panel-shell__title-row">
          <h3>Mesa ${escapeHtml(table.number)}</h3>
          <div class="panel-shell__header-tools">
            <span class="badge badge--${status.tone}"><span class="icon-slot" data-icon="${status.icon}"></span>${escapeHtml(status.label)}</span>
              <button type="button" class="icon-button icon-button--ghost panel-shell__ghost-toggle" data-action="toggle-salon-operations" aria-label="Gestionar mesa"><span class="icon-slot" data-icon="settings"></span></button>
              <button type="button" class="icon-button icon-button--ghost panel-shell__ghost-toggle" data-toggle-panel="salon" aria-label="Ocultar panel"><span class="icon-slot" data-icon="collapse"></span></button>
            </div>
        </div>
        <p class="panel-shell__location">${escapeHtml(table.zone)} · ${escapeHtml(table.description)}</p>
      </div>
      <div class="detail-actions detail-actions--salon-main">
        <button type="button" class="btn btn--primary btn--block" data-action="inspect-table" data-table-id="${table.id}"><span class="icon-slot" data-icon="list"></span><span>Inspeccionar</span></button>
      </div>
      ${journey
        ? `
            <div class="detail-section">
              <div class="section-title-row"><h4>Servicio</h4><span>${journey.guests} personas</span></div>
              <div class="detail-grid detail-grid--desktop-compact">
                <div class="detail-row"><span>Asignación</span><strong>${escapeHtml(journey.staffSummary || waiterName)}</strong></div>
                <div class="detail-row"><span>Tiempo activo</span><strong>${escapeHtml(journey.durationLabel || '—')}</strong></div>
                <div class="detail-row"><span>Total acumulado</span><strong>${formatCurrency(journey.totalAccumulated || total)}</strong></div>
              </div>
            </div>
            <div class="detail-section">
              <div class="section-title-row"><h4>Rondas</h4><span>${journey.rounds.length} activas</span></div>
              <div class="rounds-list">
                ${journey.rounds
                  .map((round) => {
                    const roundStatus = getDesktopRoundStatusInfo(round.status);
                    return `
                      <button type="button" class="round-card ${round.id === activeRoundId ? 'is-active' : ''}" data-action="select-salon-round" data-round-id="${round.id}" data-table-id="${table.id}">
                        <div class="round-card__top">
                          <div>
                            <strong>${escapeHtml(round.label)}</strong>
                            <span>${escapeHtml(round.createdAt)}</span>
                          </div>
                          <span class="badge badge--${roundStatus.tone}">${escapeHtml(roundStatus.label)}</span>
                        </div>
                        <div class="round-card__items">
                          ${round.items
                            .slice(0, 2)
                            .map((item) => {
                              const product = getProductById(products, item.productId);
                              return `<span>${item.quantity}× ${escapeHtml(product?.name || 'Producto')}</span>`;
                            })
                            .join('')}
                        </div>
                        <div class="round-card__total">${formatCurrency(round.total)}</div>
                      </button>
                    `;
                  })
                  .join('')}
              </div>
            </div>
            ${activeRound
              ? `
                  <div class="detail-section">
                    <div class="section-title-row"><h4>${escapeHtml(activeRound.label)} · Productos</h4><span>${formatCurrency(activeRound.total)}</span></div>
                    <div class="desktop-category-tabs">
                      ${['frecuentes', 'platos', 'postres', 'bebidas']
                        .map((categoryId) => `<button type="button" class="chip ${composerCategory === categoryId ? 'is-active' : ''}" data-action="set-salon-composer-category" data-category-id="${categoryId}">${escapeHtml(categoryId === 'platos' ? 'Fondos' : categoryId.charAt(0).toUpperCase() + categoryId.slice(1))}</button>`)
                        .join('')}
                    </div>
                    <div class="desktop-product-picks">
                      ${composerProducts
                        .map(
                          (product) => `
                            <button type="button" class="desktop-product-card" data-action="add-product" data-product-id="${product.id}">
                              <div class="desktop-product-card__emoji">${escapeHtml(product.emoji)}</div>
                              <div>
                                <strong>${escapeHtml(product.name)}</strong>
                                <span>${formatCurrency(product.price)}</span>
                              </div>
                            </button>
                          `,
                        )
                        .join('')}
                    </div>
                    <button type="button" class="btn btn--primary btn--block" data-action="open-order" data-table-id="${table.id}"><span class="icon-slot" data-icon="send"></span><span>Enviar ${escapeHtml(activeRound.label.toLowerCase())}</span></button>
                  </div>
                `
              : ''}
            <div class="detail-section">
              <div class="section-title-row"><h4>Cuenta</h4><span>${journey.bill?.pendingKitchenNote ? 'Pendiente' : 'Lista'}</span></div>
              <div class="desktop-bill-card">
                <div class="desktop-bill-card__row"><span>Subtotal</span><strong>${formatCurrency(journey.bill?.subtotal || total)}</strong></div>
                <div class="desktop-bill-card__row"><span>IGV 18%</span><strong>${formatCurrency(journey.bill?.igv || 0)}</strong></div>
                <div class="desktop-bill-card__row desktop-bill-card__row--total"><span>Total</span><strong>${formatCurrency(journey.bill?.total || total)}</strong></div>
              </div>
              ${journey.bill?.pendingKitchenNote ? `<div class="alert-inline alert-inline--warning">${escapeHtml(journey.bill.pendingKitchenNote)}</div>` : ''}
              <div class="detail-actions detail-actions--stacked">
                <button type="button" class="btn btn--secondary btn--block" data-action="split-bill" data-table-id="${table.id}"><span class="icon-slot" data-icon="split"></span><span>Dividir cuenta</span></button>
                <button type="button" class="btn btn--primary btn--block" data-action="invoice-order" data-table-id="${table.id}"><span class="icon-slot" data-icon="wallet"></span><span>Cobrar ${formatCurrency(journey.bill?.total || total)}</span></button>
              </div>
            </div>
            <div class="detail-section">
              <div class="section-title-row"><h4>Cobro</h4><span>${escapeHtml(selectedPaymentMethod.label)}</span></div>
              <div class="desktop-tip-grid">
                ${desktopTipOptions
                  .map((option) => `
                    <button type="button" class="desktop-tip-chip ${tipRate === option ? 'is-active' : ''}" data-action="set-desktop-tip-rate" data-tip-rate="${option}" data-table-id="${table.id}">
                      ${option === 0 ? 'Sin propina' : `${option}%`}
                    </button>
                  `)
                  .join('')}
              </div>
              <div class="desktop-payment-methods">
                ${desktopPaymentMethods
                  .map(
                    (method) => `
                      <button type="button" class="desktop-payment-method ${selectedPaymentMethod.id === method.id ? 'is-active' : ''} desktop-payment-method--${method.brand}" data-action="set-desktop-payment-method" data-payment-method="${method.id}" data-table-id="${table.id}">
                        <strong>${escapeHtml(method.shortLabel)}</strong>
                        <span>${method.requiresProof ? 'Requiere evidencia' : 'Sin evidencia'}</span>
                      </button>
                    `,
                  )
                  .join('')}
              </div>
              ${selectedPaymentMethod.requiresProof
                ? `
                    <div class="desktop-proof-card">
                      <div>
                        <strong>Adjuntar prueba</strong>
                        <span>Se convertirá a .webp con compresión para persistencia mock.</span>
                      </div>
                      <button type="button" class="btn btn--secondary" data-action="open-payment-proof-modal" data-table-id="${table.id}"><span class="icon-slot" data-icon="download"></span><span>${proofDraft ? 'Cambiar archivo' : 'Adjuntar archivo'}</span></button>
                    </div>
                  `
                : ''}
            </div>
          `
        : ''}
      ${operationsExpanded
        ? `
            <div class="desktop-gear-menu">
              <button type="button" class="btn btn--ghost btn--sm btn--block" data-action="open-edit-modal" data-table-id="${table.id}"><span class="icon-slot" data-icon="edit"></span><span>Editar</span></button>
              <button type="button" class="btn btn--ghost btn--sm btn--block" data-action="open-assign-modal" data-table-id="${table.id}"><span class="icon-slot" data-icon="user-plus"></span><span>Asignar</span></button>
              <button type="button" class="btn btn--warning btn--sm btn--block" data-action="open-force-release-modal" data-table-id="${table.id}"><span class="icon-slot" data-icon="unlock"></span><span>Liberar forzosamente</span></button>
              <button type="button" class="btn btn--danger btn--sm btn--block" data-action="open-delete-modal" data-table-id="${table.id}"><span class="icon-slot" data-icon="trash"></span><span>Eliminar</span></button>
            </div>
          `
        : ''}
    </section>
  `;
}

function getNextDeliveryAction(order) {
  const nextStatus = getNextStatus(order.status, deliveryStatusFlow);
  if (!nextStatus) return { label: 'Solo lectura', disabled: true };
  const labels = {
    preparando: 'Seguimiento externo',
    'listo-salir': 'Seguimiento externo',
    'en-ruta': 'Seguimiento externo',
    entregado: 'Seguimiento externo',
  };
  return { label: labels[nextStatus], nextStatus, disabled: true };
}

function getNextTakeawayAction(order) {
  const nextStatus = getNextStatus(order.status, takeawayStatusFlow);
  if (!nextStatus) return { label: 'Recojo cerrado', disabled: true };
  const labels = {
    'en-preparacion': 'Iniciar preparación',
    'listo-recoger': 'Marcar listo para recoger',
    entregado: 'Confirmar recojo',
  };
  return { label: labels[nextStatus], nextStatus, disabled: false };
}

export function renderDeliveryBoard({ orders, selectedId, couriers, loading = false }) {
  if (loading) return renderQueueSkeleton('delivery');

  if (!orders.length) {
    return '<section class="empty-state empty-state--grid"><div class="empty-state__icon icon-slot" data-icon="bike"></div><h3>Sin pedidos delivery visibles</h3><p>Ajusta los filtros para revisar otra parte de la cola logística.</p></section>';
  }

  const stages = [
    { key: 'pendiente', title: 'Delivery lista', helper: 'Pedidos recibidos y priorizados' },
    { key: 'preparando', title: 'Detalle delivery', helper: 'Validación de datos y cocina' },
    { key: 'listo-salir', title: 'Pago y comprobante', helper: 'Listo para salida documentada' },
    { key: 'en-ruta', title: 'Entrega', helper: 'Seguimiento hasta cierre' },
  ];

  return `
    <section class="ops-flow-board ops-flow-board--delivery">
      ${stages
        .map((stage, index) => {
          const items = orders.filter((order) => order.status === stage.key || (stage.key === 'listo-salir' && order.status === 'listo-salir'));
          return `
            <article class="ops-flow-stage">
              <header class="ops-flow-stage__header">
                <div>
                  <h4>${escapeHtml(stage.title)}</h4>
                  <p>${escapeHtml(stage.helper)}</p>
                </div>
                <span class="badge badge--neutral">${items.length}</span>
              </header>
              <div class="ops-flow-stage__list">
                ${items.length
                  ? items
                      .map((order) => {
                        const info = getDeliveryStatusInfo(order.status);
                        const isSelected = order.id === selectedId;
                        return `
                          <article class="ops-flow-card ${isSelected ? 'is-selected' : ''}" tabindex="0" role="button" aria-pressed="${isSelected}" data-select-delivery="${order.id}">
                            <div class="ops-flow-card__top">
                              <div><p class="queue-card__eyebrow">${escapeHtml(order.code)}</p><h5>${escapeHtml(order.customer)}</h5></div>
                              <span class="badge badge--${info.tone}"><span class="icon-slot" data-icon="${info.icon}"></span>${escapeHtml(info.label)}</span>
                            </div>
                            <div class="ops-flow-card__meta">
                              <span>${escapeHtml(order.channel)}</span>
                              <span>${escapeHtml(getCourierName(couriers, order.courierId))}</span>
                            </div>
                            <div class="ops-flow-card__meta">
                              <span class="time-pill ${getDeliveryRemainingMinutes(order) < 0 ? 'is-late' : ''}">${escapeHtml(getDeliveryTimeText(order))}</span>
                              <strong>${formatCurrency(order.total)}</strong>
                            </div>
                            <div class="ops-flow-card__status-row">
                              <span class="mini-status ${getStatusTone(order.documentIssued)}">${escapeHtml(getDocumentStatusLabel(order))}</span>
                              <span class="mini-status ${getStatusTone(order.paymentConfirmed)}">${escapeHtml(getPaymentStatusLabel(order))}</span>
                            </div>
                          </article>
                        `;
                      })
                      .join('')
                  : '<div class="queue-column__empty">Sin pedidos en esta etapa.</div>'}
              </div>
            </article>
            ${index < stages.length - 1 ? '<div class="ops-flow-arrow" aria-hidden="true">→</div>' : ''}
          `;
        })
        .join('')}
    </section>
  `;
}

export function renderTakeawayQueue({ orders, selectedId, loading = false }) {
  if (loading) return renderQueueSkeleton('takeaway');

  if (!orders.length) {
    return '<section class="empty-state empty-state--grid"><div class="empty-state__icon icon-slot" data-icon="bag"></div><h3>Sin pedidos para llevar visibles</h3><p>Prueba con otro filtro para revisar la cola de recojo.</p></section>';
  }

  const stages = [
    { key: 'recibido', title: 'Para llevar lista', helper: 'Pedidos recibidos para preparar' },
    { key: 'en-preparacion', title: 'Detalle pedido', helper: 'Seguimiento y preparación activa' },
    { key: 'listo-recoger', title: 'Cobro', helper: 'Validación de pago y comprobante' },
    { key: 'entregado', title: 'Entrega', helper: 'Pedido entregado al cliente' },
  ];

  return `
    <section class="ops-flow-board ops-flow-board--takeaway">
      ${stages
        .map((stage, index) => {
          const items = orders.filter((order) => order.status === stage.key);
          return `
            <article class="ops-flow-stage">
              <header class="ops-flow-stage__header">
                <div>
                  <h4>${escapeHtml(stage.title)}</h4>
                  <p>${escapeHtml(stage.helper)}</p>
                </div>
                <span class="badge badge--neutral">${items.length}</span>
              </header>
              <div class="ops-flow-stage__list">
                ${items.length
                  ? items
                      .map((order) => {
                        const info = getTakeawayStatusInfo(order.status);
                        const action = getNextTakeawayAction(order);
                        const isSelected = order.id === selectedId;
                        return `
                          <article class="ops-flow-card ${isSelected ? 'is-selected' : ''}" tabindex="0" role="button" aria-pressed="${isSelected}" data-select-takeaway="${order.id}">
                            <div class="ops-flow-card__top">
                              <div><p class="queue-card__eyebrow">${escapeHtml(order.code)} · ${escapeHtml(order.pickupCode)}</p><h5>${escapeHtml(order.customer)}</h5></div>
                              <span class="badge badge--${info.tone}"><span class="icon-slot" data-icon="${info.icon}"></span>${escapeHtml(info.label)}</span>
                            </div>
                            <div class="ops-flow-card__meta">
                              <span><span class="icon-slot" data-icon="clock"></span>${escapeHtml(order.promisedAt)}</span>
                              <span><span class="icon-slot" data-icon="bag"></span>${order.itemsCount} items</span>
                            </div>
                            <div class="ops-flow-card__meta">
                              <span class="time-pill ${order.minutesToPromise < 0 ? 'is-late' : ''}">${escapeHtml(getTakeawayTimeText(order))}</span>
                              <span class="channel-pill">${escapeHtml(order.source || order.channel)}</span>
                              ${order.packagingFeeAmount ? `<span class="doc-chip is-pending">+ ${formatCurrency(order.packagingFeeAmount)}</span>` : ''}
                            </div>
                            <div class="ops-flow-card__status-row">
                              <span class="mini-status ${getStatusTone(order.documentIssued)}">${escapeHtml(getDocumentStatusLabel(order))}</span>
                              <span class="mini-status ${getStatusTone(order.paymentConfirmed)}">${escapeHtml(getPaymentStatusLabel(order))}</span>
                            </div>
                            <button type="button" class="btn btn--primary btn--sm btn--block" data-action="advance-takeaway" data-takeaway-id="${order.id}" ${action.disabled ? 'disabled' : ''}><span class="icon-slot" data-icon="bag"></span><span>${escapeHtml(action.label)}</span></button>
                          </article>
                        `;
                      })
                      .join('')
                  : '<div class="queue-column__empty">Sin pedidos en esta etapa.</div>'}
              </div>
            </article>
            ${index < stages.length - 1 ? '<div class="ops-flow-arrow" aria-hidden="true">→</div>' : ''}
          `;
        })
        .join('')}
    </section>
  `;
}

function renderCollapsedPanel(mode, eyebrow, title, description) {
  return `
    <section class="panel-shell panel-shell--collapsed">
      <div class="panel-header">
        <div><p class="eyebrow">${escapeHtml(eyebrow)}</p><h3>${escapeHtml(title)}</h3><p>${escapeHtml(description)}</p></div>
        <button type="button" class="btn btn--ghost btn--sm" data-toggle-panel="${mode}"><span class="icon-slot" data-icon="expand"></span><span>Abrir</span></button>
      </div>
    </section>
  `;
}

function renderPanelHeader(eyebrow, title, description, status, mode) {
  return `
    <div class="panel-header">
      <div><p class="eyebrow">${escapeHtml(eyebrow)}</p><h3>${escapeHtml(title)}</h3><p>${escapeHtml(description)}</p></div>
      <div class="panel-header__actions">
        <span class="badge badge--${status.tone}"><span class="icon-slot" data-icon="${status.icon}"></span>${escapeHtml(status.label)}</span>
        <button type="button" class="icon-button icon-button--ghost" data-toggle-panel="${mode}" aria-label="Ocultar panel"><span class="icon-slot" data-icon="collapse"></span></button>
      </div>
    </div>
  `;
}

export function renderDeliveryPanel({ order, couriers, collapsed = false, loading = false, desktopWorkbench = null }) {
  if (loading) return renderPanelSkeleton();
  if (collapsed) return renderCollapsedPanel('delivery', 'Delivery', 'Resumen', 'Ábrelo para detalle.');

  if (!order) {
    return '<section class="empty-state empty-state--side panel-shell"><div class="empty-state__icon icon-slot" data-icon="bike"></div><h3>Selecciona un delivery</h3><p>Verás detalle y comprobante.</p></section>';
  }

  const status = getDeliveryStatusInfo(order.status);
  const highlightOrderId = desktopWorkbench?.delivery?.highlightOrderId || desktopDeliveryWorkspace.highlightOrderId;
  const proofList = desktopWorkbench?.payments?.proofs || desktopDeliveryWorkspace.proofTemplates;
  const selectedProof = proofList.find((proof) => proof.method === (order.paymentMethod || '').toLowerCase()) || null;
  return `
    <section class="panel-shell">
      ${renderPanelHeader('Pedido activo', `${escapeHtml(order.code)} · ${escapeHtml(order.customer)}`, `${escapeHtml(order.channel)} · ${escapeHtml(getCourierName(couriers, order.courierId))}`, status, 'delivery')}
      <div class="panel-grid">
        <div class="metric-tile"><span>Total</span><strong>${formatCurrency(order.total)}</strong></div>
        <div class="metric-tile"><span>Tiempo</span><strong>${order.elapsedMinutes} min</strong></div>
        <div class="metric-tile"><span>ETA</span><strong>${escapeHtml(getDeliveryTimeText(order))}</strong></div>
      </div>
      <div class="detail-section">
        <div class="section-title-row"><h4>Detalle</h4><span>${order.itemsCount} items</span></div>
        <div class="detail-grid detail-grid--desktop-compact">
          <div class="detail-row"><span>Dirección</span><strong>${escapeHtml(order.address)}</strong></div>
          <div class="detail-row"><span>Teléfono</span><strong>${escapeHtml(order.phone)}</strong></div>
          <div class="detail-row"><span>Responsable</span><strong>${escapeHtml(getCourierName(couriers, order.courierId))}</strong></div>
          <div class="detail-row"><span>Pago</span><strong>${escapeHtml(order.paymentLabel)}</strong></div>
        </div>
      </div>
      <div class="detail-section">
        <div class="section-title-row"><h4>Comprobante</h4><span>SUNAT</span></div>
        <div class="detail-grid">
          <div class="detail-row"><span>Tipo elegido</span><strong>${escapeHtml(getDocumentTypeLabel(order.documentType))}</strong></div>
          <div class="detail-row"><span>Comprobante</span><strong>${escapeHtml(order.documentIssued ? 'Emitido' : 'Pendiente')}</strong></div>
          <div class="detail-row"><span>Pago</span><strong>${escapeHtml(order.paymentConfirmed ? 'Confirmado' : 'Pendiente')}</strong></div>
          <div class="detail-row"><span>Documento cliente</span><strong>${escapeHtml(order.customerDocument || 'Por confirmar')}</strong></div>
        </div>
        <div class="form-grid form-grid--compact">
          <label class="field"><span>Comprobante</span><select name="deliveryDocumentType" data-delivery-id="${order.id}" ${order.documentIssued ? 'disabled' : ''}>${documentTypeOptions.map((option) => `<option value="${option.value}" ${order.documentType === option.value ? 'selected' : ''}>${escapeHtml(option.label)}</option>`).join('')}</select></label>
          <label class="field"><span>Método de pago</span><select name="deliveryPaymentMethod" data-delivery-id="${order.id}" ${order.paymentConfirmed ? 'disabled' : ''}><option value="">Seleccionar método</option>${paymentMethodOptions.map((option) => `<option value="${option.value}" ${order.paymentMethod === option.value ? 'selected' : ''}>${escapeHtml(option.label)}</option>`).join('')}</select></label>
        </div>
        ${order.documentType === 'factura'
          ? `
              <div class="form-grid form-grid--compact">
                <label class="field"><span>RUC</span><input name="deliveryCustomerDocument" data-delivery-id="${order.id}" type="text" maxlength="11" value="${escapeHtml(order.customerDocument || '')}" placeholder="RUC del cliente" /></label>
                <label class="field"><span>Razón social</span><input name="deliveryBusinessName" data-delivery-id="${order.id}" type="text" maxlength="120" value="${escapeHtml(order.businessName || '')}" placeholder="Razón social" /></label>
              </div>
            `
          : ''}
        ${(order.paymentMethod === 'yape-plin' || order.paymentMethod === 'transferencia') && !selectedProof
          ? `<button type="button" class="btn btn--secondary btn--block" data-action="open-delivery-proof-modal" data-delivery-id="${order.id}"><span class="icon-slot" data-icon="download"></span><span>Adjuntar prueba</span></button>`
          : ''}
        ${selectedProof ? `<div class="desktop-proof-card desktop-proof-card--compact"><div><strong>Prueba registrada</strong><span>${escapeHtml(selectedProof.fileName)} · ${selectedProof.sizeKb} KB</span></div><span class="badge badge--success">WEBP</span></div>` : ''}
        ${order.documentType === 'factura' && !order.businessName ? '<div class="alert-inline alert-inline--warning">Completa RUC y razón social para emitir factura.</div>' : ''}
        <div class="detail-actions detail-actions--stacked">
          <button type="button" class="btn btn--secondary btn--block" data-action="issue-delivery-document" data-delivery-id="${order.id}" ${order.documentIssued ? 'disabled' : ''}><span class="icon-slot" data-icon="receipt-check"></span><span>${order.documentIssued ? 'Comprobante emitido' : `Emitir ${escapeHtml(getDocumentTypeLabel(order.documentType))}`}</span></button>
          <button type="button" class="btn btn--secondary btn--block" data-action="confirm-delivery-payment" data-delivery-id="${order.id}" ${order.paymentConfirmed ? 'disabled' : ''}><span class="icon-slot" data-icon="wallet"></span><span>${order.paymentConfirmed ? 'Pago confirmado' : 'Confirmar pago'}</span></button>
        </div>
      </div>
      <div class="detail-section"><div class="section-title-row"><h4>Nota</h4><span>${highlightOrderId === order.id ? 'Prioridad' : 'Local'}</span></div><div class="alert-inline alert-inline--info">${escapeHtml(order.note || 'Sin observaciones.')}</div></div>
      <div class="alert-inline alert-inline--info">Solo observación y comprobante.</div>
    </section>
  `;
}

export function renderTakeawayPanel({ order, collapsed = false, loading = false, desktopWorkbench = null }) {
  if (loading) return renderPanelSkeleton();
  if (collapsed) return renderCollapsedPanel('takeaway', 'Recojo', 'Resumen', 'Ábrelo para detalle.');

  if (!order) {
    return '<section class="empty-state empty-state--side panel-shell"><div class="empty-state__icon icon-slot" data-icon="bag"></div><h3>Selecciona un pedido para llevar</h3><p>Verás promesa, pago y comprobante.</p></section>';
  }

  const status = getTakeawayStatusInfo(order.status);
  const action = getNextTakeawayAction(order);
  const activeOrderId = desktopWorkbench?.takeaway?.orderId || desktopTakeawayWorkspace.activeOrderId;
  const proofList = desktopWorkbench?.payments?.proofs || desktopDeliveryWorkspace.proofTemplates;
  const selectedProof = proofList.find((proof) => proof.method === (order.paymentMethod || '').toLowerCase()) || null;
  return `
    <section class="panel-shell">
      ${renderPanelHeader('Pedido activo', `${escapeHtml(order.code)} · ${escapeHtml(order.customer)}`, `${escapeHtml(order.channel)} · ${escapeHtml(order.pickupCode)}`, status, 'takeaway')}
      <div class="panel-grid">
        <div class="metric-tile"><span>Total</span><strong>${formatCurrency(order.total)}</strong></div>
        <div class="metric-tile"><span>Promesa</span><strong>${escapeHtml(order.promisedAt)}</strong></div>
        <div class="metric-tile"><span>Tiempo</span><strong>${escapeHtml(getTakeawayTimeText(order))}</strong></div>
      </div>
      <div class="detail-section">
        <div class="section-title-row"><h4>Detalle</h4><span>${order.itemsCount} items</span></div>
        <div class="detail-grid detail-grid--desktop-compact">
          <div class="detail-row"><span>Código de recojo</span><strong>${escapeHtml(order.pickupCode)}</strong></div>
          <div class="detail-row"><span>Teléfono</span><strong>${escapeHtml(order.phone)}</strong></div>
          <div class="detail-row"><span>Canal</span><strong>${escapeHtml(order.channel)}</strong></div>
          <div class="detail-row"><span>Pago</span><strong>${escapeHtml(order.paymentLabel)}</strong></div>
        </div>
      </div>
      <div class="detail-section">
        <div class="section-title-row"><h4>Comprobante</h4><span>${escapeHtml(order.source || order.channel)}</span></div>
        <div class="detail-grid">
          <div class="detail-row"><span>Tipo</span><strong>${escapeHtml(getDocumentTypeLabel(order.documentType))}</strong></div>
          <div class="detail-row"><span>Comprobante</span><strong>${escapeHtml(order.documentIssued ? 'Emitido' : 'Pendiente')}</strong></div>
          <div class="detail-row"><span>Pago</span><strong>${escapeHtml(order.paymentConfirmed ? 'Confirmado' : 'Pendiente')}</strong></div>
          <div class="detail-row"><span>Recargo envases</span><strong>${order.packagingFeeAmount ? formatCurrency(order.packagingFeeAmount) : 'No aplica'}</strong></div>
        </div>
        <div class="form-grid form-grid--compact">
          <label class="field"><span>Comprobante</span><select name="takeawayDocumentType" data-takeaway-id="${order.id}" ${order.documentIssued ? 'disabled' : ''}>${documentTypeOptions.map((option) => `<option value="${option.value}" ${order.documentType === option.value ? 'selected' : ''}>${escapeHtml(option.label)}</option>`).join('')}</select></label>
          <label class="field"><span>Método de pago</span><select name="takeawayPaymentMethod" data-takeaway-id="${order.id}" ${order.paymentConfirmed ? 'disabled' : ''}><option value="">Seleccionar método</option>${paymentMethodOptions.map((option) => `<option value="${option.value}" ${order.paymentMethod === option.value ? 'selected' : ''}>${escapeHtml(option.label)}</option>`).join('')}</select></label>
        </div>
        ${order.documentType === 'factura'
          ? `
              <div class="form-grid form-grid--compact">
                <label class="field"><span>RUC</span><input name="takeawayCustomerDocument" data-takeaway-id="${order.id}" type="text" maxlength="11" value="${escapeHtml(order.customerDocument || '')}" placeholder="RUC del cliente" /></label>
                <label class="field"><span>Razón social</span><input name="takeawayBusinessName" data-takeaway-id="${order.id}" type="text" maxlength="120" value="${escapeHtml(order.businessName || '')}" placeholder="Razón social" /></label>
              </div>
            `
          : ''}
        ${(order.paymentMethod === 'yape-plin' || order.paymentMethod === 'transferencia') && !selectedProof
          ? `<button type="button" class="btn btn--secondary btn--block" data-action="open-takeaway-proof-modal" data-takeaway-id="${order.id}"><span class="icon-slot" data-icon="download"></span><span>Adjuntar prueba</span></button>`
          : ''}
        ${selectedProof ? `<div class="desktop-proof-card desktop-proof-card--compact"><div><strong>Prueba registrada</strong><span>${escapeHtml(selectedProof.fileName)} · ${selectedProof.sizeKb} KB</span></div><span class="badge badge--success">WEBP</span></div>` : ''}
        ${order.documentType === 'factura' && !order.businessName ? '<div class="alert-inline alert-inline--warning">Completa RUC y razón social para emitir factura.</div>' : ''}
        <div class="detail-actions detail-actions--stacked">
          <button type="button" class="btn btn--secondary btn--block" data-action="issue-takeaway-document" data-takeaway-id="${order.id}" ${order.documentIssued ? 'disabled' : ''}><span class="icon-slot" data-icon="receipt-check"></span><span>${order.documentIssued ? 'Comprobante emitido' : `Emitir ${escapeHtml(getDocumentTypeLabel(order.documentType))}`}</span></button>
          <button type="button" class="btn btn--secondary btn--block" data-action="confirm-takeaway-payment" data-takeaway-id="${order.id}" ${order.paymentConfirmed ? 'disabled' : ''}><span class="icon-slot" data-icon="wallet"></span><span>${order.paymentConfirmed ? 'Pago confirmado' : 'Confirmar pago'}</span></button>
        </div>
      </div>
      <div class="detail-section"><div class="section-title-row"><h4>Nota</h4><span>${activeOrderId === order.id ? 'Recojo activo' : 'Local'}</span></div><div class="alert-inline alert-inline--info">${escapeHtml(order.note || 'Sin observaciones.')}</div></div>
      <div class="detail-actions"><button type="button" class="btn btn--primary btn--block" data-action="advance-takeaway" data-takeaway-id="${order.id}" ${action.disabled ? 'disabled' : ''}><span class="icon-slot" data-icon="bag"></span><span>${escapeHtml(action.label)}</span></button></div>
    </section>
  `;
}

export function renderCourtesyWorkspace({ desktopWorkbench }) {
  const dashboard = desktopWorkbench?.courtesies?.dashboard || courtesyDashboard;
  const activeType = desktopWorkbench?.courtesies?.activeType || 'cliente';
  const selectedCourtesyId = desktopWorkbench?.courtesies?.selectedCourtesyId || courtesyCatalog[0]?.id;
  const selectedCourtesy = (desktopWorkbench?.courtesies?.catalog || courtesyCatalog).find((item) => item.id === selectedCourtesyId) || courtesyCatalog[0];

  return `
    <section class="desktop-ops-grid">
      <article class="desktop-ops-card">
        <div class="section-title-row"><h4>Cortesías del mes</h4><span>Resumen</span></div>
        <div class="desktop-kpi-grid desktop-kpi-grid--triple">
          <div class="metric-tile"><span>Cortesías</span><strong>${dashboard.monthTotal}</strong></div>
          <div class="metric-tile"><span>Costo</span><strong>${formatCurrency(dashboard.monthCost)}</strong></div>
          <div class="metric-tile"><span>Food cost</span><strong>${dashboard.foodCostImpact}%</strong></div>
        </div>
        <div class="desktop-kpi-grid desktop-kpi-grid--triple">
          <div class="metric-tile"><span>Cliente</span><strong>${dashboard.split.cliente}%</strong></div>
          <div class="metric-tile"><span>Staff</span><strong>${dashboard.split.staff}%</strong></div>
          <div class="metric-tile"><span>Prueba</span><strong>${dashboard.split.prueba}%</strong></div>
        </div>
        <div class="desktop-ranking-card">
          <div class="section-title-row"><h4>Más cortesidados</h4><span>${dashboard.deltaVsPreviousMonth}</span></div>
          ${dashboard.topItems
            .map((item, index) => `
              <div class="desktop-ranking-row">
                <strong>${index + 1}</strong>
                <span>${escapeHtml(item.label)}</span>
                <small>${item.count} veces</small>
              </div>
            `)
            .join('')}
        </div>
      </article>
      <article class="desktop-ops-card">
        <div class="section-title-row"><h4>Registrar cortesía</h4><span>${escapeHtml(activeType)}</span></div>
        <div class="desktop-category-tabs">
          ${['cliente', 'staff', 'prueba']
            .map((type) => `<button type="button" class="chip ${activeType === type ? 'is-active' : ''}" data-action="set-courtesy-type" data-type="${type}">${escapeHtml(type.charAt(0).toUpperCase() + type.slice(1))}</button>`)
            .join('')}
        </div>
        <div class="desktop-proof-card desktop-proof-card--compact">
          <div>
            <strong>${escapeHtml(selectedCourtesy?.label || 'Selecciona un plato')}</strong>
            <span>Costo insumos: ${formatCurrency(selectedCourtesy?.cost || 0)}</span>
          </div>
          <button type="button" class="icon-button icon-button--ghost" data-action="select-courtesy-item" data-courtesy-id="${selectedCourtesy?.id || ''}" aria-label="Seleccionar cortesía"><span class="icon-slot" data-icon="move"></span></button>
        </div>
        <div class="detail-grid detail-grid--desktop-compact">
          <div class="detail-row"><span>Motivo</span><strong>Cliente frecuente, cumpleaños</strong></div>
          <div class="detail-row"><span>Autorizado por</span><strong>Administrador</strong></div>
        </div>
        <button type="button" class="btn btn--primary btn--block" data-action="register-courtesy"><span class="icon-slot" data-icon="check-circle"></span><span>Registrar cortesía</span></button>
      </article>
    </section>
  `;
}

export function renderCourtesyPanel({ desktopWorkbench }) {
  const limits = desktopWorkbench?.courtesies?.limits || courtesyLimits;
  const staffMeals = desktopWorkbench?.courtesies?.staffMealConsumption || staffMealConsumption;

  return `
    <section class="panel-shell">
      <div class="panel-header">
        <div><p class="eyebrow">Operación</p><h3>Límites de cortesías</h3><p>Controla reglas y consumo interno.</p></div>
      </div>
      <div class="detail-section">
        ${limits
          .map(
            (limit) => `
              <div class="desktop-limit-card">
                <div class="desktop-limit-card__top">
                  <strong>${escapeHtml(limit.label)}</strong>
                  <span class="badge ${limit.enabled ? 'badge--success' : 'badge--neutral'}">${limit.enabled ? 'Activo' : 'Inactivo'}</span>
                </div>
                <span>${escapeHtml(limit.limit)}</span>
                ${limit.maxCost ? `<small>${escapeHtml(limit.maxCost)}</small>` : ''}
              </div>
            `,
          )
          .join('')}
      </div>
      <div class="detail-section">
        <div class="section-title-row"><h4>Consumo del personal</h4><span>Hoy</span></div>
        <div class="metric-tile"><span>Acumulado</span><strong>${staffMeals.todayMeals} almuerzos · ${formatCurrency(staffMeals.todayCost)}</strong></div>
        ${staffMeals.staff
          .map(
            (entry) => `
              <div class="detail-row"><span>${escapeHtml(entry.employee)}</span><strong>${formatCurrency(entry.amount)}</strong></div>
            `,
          )
          .join('')}
      </div>
    </section>
  `;
}

export function renderTipsWorkspace({ desktopWorkbench }) {
  const dashboard = desktopWorkbench?.tips?.dashboard || tipsDashboard;
  const distributionMode = desktopWorkbench?.tips?.distributionMode || dashboard.distributionModes?.[0];
  const tipMode = desktopWorkbench?.tips?.tipMode || 'Incluida en pago';

  return `
    <section class="desktop-ops-grid">
      <article class="desktop-ops-card">
        <div class="section-title-row"><h4>Propinas</h4><span>Hoy</span></div>
        <div class="desktop-proof-card desktop-proof-card--compact">
          <div>
            <strong>${formatCurrency(dashboard.todayAmount)}</strong>
            <span>${dashboard.ordersCount} pedidos · Promedio ${formatCurrency(dashboard.avgTicket)}</span>
          </div>
        </div>
        <div class="desktop-kpi-grid desktop-kpi-grid--triple">
          ${dashboard.byMethod.map((method) => `<div class="metric-tile"><span>${escapeHtml(method.label)}</span><strong>${formatCurrency(method.amount)}</strong></div>`).join('')}
        </div>
        <div class="desktop-ranking-card">
          <div class="section-title-row"><h4>Reparto por mesero</h4><span>${escapeHtml(distributionMode)}</span></div>
          ${dashboard.byWaiter
            .map((entry) => `
              <div class="desktop-ranking-row">
                <span>${escapeHtml(entry.waiter)}</span>
                <small>${entry.orders} pedidos · ${escapeHtml(entry.shift)}</small>
                <strong>${formatCurrency(entry.amount)}</strong>
              </div>
            `)
            .join('')}
        </div>
      </article>
      <article class="desktop-ops-card">
        <div class="section-title-row"><h4>Configurar reparto</h4><span>Automático</span></div>
        <div class="desktop-category-tabs">
          ${dashboard.distributionModes
            .map((mode) => `<button type="button" class="chip ${distributionMode === mode ? 'is-active' : ''}" data-action="set-tip-distribution" data-mode-name="${escapeHtml(mode)}">${escapeHtml(mode)}</button>`)
            .join('')}
        </div>
        <div class="desktop-tip-grid">
          ${desktopTipOptions.map((tip) => `<button type="button" class="desktop-tip-chip ${tipMode === (tip === 0 ? '0%' : `${tip}%`) ? 'is-active' : ''}" data-action="set-tip-mode" data-tip-mode="${tip === 0 ? '0%' : `${tip}%`}">${tip === 0 ? '0%' : `${tip}%`}</button>`).join('')}
        </div>
        <div class="detail-row"><span>Modo de propina</span><strong>${escapeHtml(tipMode)}</strong></div>
        <button type="button" class="btn btn--primary btn--block" data-action="save-tip-settings"><span class="icon-slot" data-icon="check-circle"></span><span>Guardar configuración</span></button>
      </article>
    </section>
  `;
}

export function renderTipsPanel({ desktopWorkbench }) {
  const dashboard = desktopWorkbench?.tips?.dashboard || tipsDashboard;
  return `
    <section class="panel-shell">
      <div class="panel-header">
        <div><p class="eyebrow">Resumen</p><h3>Propinas del día</h3><p>Seguimiento operativo y configuración de reparto.</p></div>
      </div>
      ${dashboard.byWaiter
        .map((entry) => `<div class="detail-row"><span>${escapeHtml(entry.waiter)}</span><strong>${formatCurrency(entry.amount)}</strong></div>`)
        .join('')}
      <div class="alert-inline alert-inline--info">Las propinas se pueden cerrar automáticamente al final del día.</div>
    </section>
  `;
}

export function renderCreditNotesWorkspace({ desktopWorkbench }) {
  const drafts = desktopWorkbench?.creditNotes?.drafts || creditNoteDrafts;
  const selectedDraftId = desktopWorkbench?.creditNotes?.selectedDraftId || drafts[0]?.id;
  const selectedDraft = drafts.find((draft) => draft.id === selectedDraftId) || drafts[0];

  return `
    <section class="desktop-ops-grid">
      <article class="desktop-ops-card">
        <div class="section-title-row"><h4>Nota de crédito</h4><span>Búsqueda</span></div>
        <div class="toolbar-search toolbar-search--salon"><span class="icon-slot" data-icon="search"></span><input type="search" value="" placeholder="Buscar boleta o factura" aria-label="Buscar comprobante" /></div>
        <div class="rounds-list">
          ${drafts
            .map(
              (draft) => `
                <button type="button" class="round-card ${draft.id === selectedDraftId ? 'is-active' : ''}" data-action="select-credit-note" data-credit-note-id="${draft.id}">
                  <div class="round-card__top">
                    <div>
                      <strong>${escapeHtml(draft.code)}</strong>
                      <span>${escapeHtml(draft.reference)}</span>
                    </div>
                    <span class="badge badge--neutral">${escapeHtml(draft.channel)}</span>
                  </div>
                </button>
              `,
            )
            .join('')}
        </div>
      </article>
      <article class="desktop-ops-card">
        <div class="section-title-row"><h4>Emitir NC</h4><span>${escapeHtml(selectedDraft?.code || '')}</span></div>
        <div class="desktop-category-tabs">
          ${[
            { id: 'devolucion', label: 'Devolución' },
            { id: 'error-precio', label: 'Error precio' },
            { id: 'anulacion', label: 'Anulación' },
          ]
            .map((motive) => `<button type="button" class="chip ${(desktopWorkbench?.creditNotes?.motive || 'devolucion') === motive.id ? 'is-active' : ''}" data-action="set-credit-note-motive" data-motive="${motive.id}">${escapeHtml(motive.label)}</button>`)
            .join('')}
        </div>
        <div class="desktop-ranking-card">
          ${(selectedDraft?.items || [])
            .map(
              (item) => `
                <label class="desktop-check-row">
                  <input type="checkbox" data-action="toggle-credit-note-item" data-credit-item-id="${item.id}" ${(desktopWorkbench?.creditNotes?.selectedItemIds || []).includes(item.id) ? 'checked' : ''} />
                  <span>${escapeHtml(item.label)}</span>
                  <strong>${formatCurrency(item.amount)}</strong>
                </label>
              `,
            )
            .join('')}
        </div>
        <button type="button" class="btn btn--primary btn--block" data-action="issue-credit-note"><span class="icon-slot" data-icon="receipt-check"></span><span>Emitir nota de crédito</span></button>
      </article>
    </section>
  `;
}

export function renderCreditNotesPanel({ desktopWorkbench }) {
  const drafts = desktopWorkbench?.creditNotes?.drafts || creditNoteDrafts;
  const selectedDraft = drafts.find((draft) => draft.id === (desktopWorkbench?.creditNotes?.selectedDraftId || drafts[0]?.id)) || drafts[0];
  const selectedItems = (desktopWorkbench?.creditNotes?.selectedItemIds || []).length;
  const total = (selectedDraft?.items || [])
    .filter((item) => (desktopWorkbench?.creditNotes?.selectedItemIds || []).includes(item.id))
    .reduce((acc, item) => acc + item.amount, 0);

  return `
    <section class="panel-shell">
      <div class="panel-header">
        <div><p class="eyebrow">Resumen</p><h3>${escapeHtml(selectedDraft?.code || 'NC')}</h3><p>${escapeHtml(selectedDraft?.reference || 'Selecciona un comprobante')}</p></div>
      </div>
      <div class="metric-tile"><span>Items a acreditar</span><strong>${selectedItems}</strong></div>
      <div class="metric-tile"><span>Total NC</span><strong>${formatCurrency(total)}</strong></div>
      <div class="alert-inline alert-inline--warning">Esta operación es mock y se considera emitida inmediatamente.</div>
    </section>
  `;
}

export function renderOrderDrawer({ table, state, products, categories, takeawayOrders, waiters, tables }) {
  if (!state.orderDrawer.open || !table) return '';

  const waiterName = getWaiterName(waiters, table.waiterId);
  const search = state.orderDrawer.search.trim().toLowerCase();
  const activeCategory = state.orderDrawer.category;
  const filteredProducts = products.filter((product) => {
    const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
    const matchesSearch = !search || product.name.toLowerCase().includes(search) || product.categoryLabel.toLowerCase().includes(search);
    return matchesCategory && matchesSearch;
  });
  const { lines, total, baseTotal, surchargeTotal } = getOrderDetails(table, products);
  const isTakeaway = table.order?.serviceType === 'takeaway';
  const linkedTakeaway = takeawayOrders.find((order) => order.id === table.order?.linkedTakeawayId);
  const inlineFeedback = state.orderDrawer.inlineFeedback;

  return `
    <div class="drawer-backdrop" data-close-drawer="true">
      <aside class="order-drawer" role="dialog" aria-modal="true" aria-label="Pedido de mesa">
        <header class="order-drawer__header">
          <div>
            <p class="eyebrow">Pedido</p>
            <h3>Mesa ${escapeHtml(table.number)} · ${escapeHtml(table.zone)}</h3>
            <p>${escapeHtml(waiterName)}</p>
          </div>
          <div class="order-drawer__header-actions"><button type="button" class="icon-button" data-close-drawer="true" aria-label="Cerrar flujo de pedido"><span class="icon-slot" data-icon="x"></span></button></div>
        </header>

        <div class="tabs" role="tablist" aria-label="Secciones de pedido">
          <button type="button" role="tab" class="tab ${state.orderDrawer.tab === 'add' ? 'is-active' : ''}" aria-selected="${state.orderDrawer.tab === 'add'}" data-action="toggle-drawer-tab" data-tab="add"><span class="icon-slot" data-icon="plus-circle"></span>Agregar</button>
          <button type="button" role="tab" class="tab ${state.orderDrawer.tab === 'order' ? 'is-active' : ''}" aria-selected="${state.orderDrawer.tab === 'order'}" data-action="toggle-drawer-tab" data-tab="order"><span class="icon-slot" data-icon="receipt"></span>Pedido</button>
        </div>

        <div class="order-drawer__body" data-drawer-scroll-region="true">
          ${inlineFeedback ? `<div class="inline-feedback inline-feedback--${escapeHtml(inlineFeedback.tone)}">${escapeHtml(inlineFeedback.message)}</div>` : ''}
          ${state.orderDrawer.tab === 'add'
            ? `
                <section class="drawer-add-layout">
                  <aside class="category-panel">
                    <div class="toolbar-search toolbar-search--drawer"><span class="icon-slot" data-icon="search"></span><input id="drawerProductSearch" type="search" placeholder="Buscar productos" value="${escapeHtml(state.orderDrawer.search)}" aria-label="Buscar productos" /></div>
                    <div class="category-list" role="group" aria-label="Categorías de productos">${categories.map((category) => `<button type="button" class="category-item ${activeCategory === category.id ? 'is-active' : ''}" data-category="${category.id}">${escapeHtml(category.name)}</button>`).join('')}</div>
                  </aside>
                  <div>
                    <div class="section-title-row section-title-row--spaced"><div><h4>Productos</h4><span>${filteredProducts.length}</span></div></div>
                    <div class="product-grid">
                      ${filteredProducts.length
                        ? filteredProducts
                            .map(
                              (product) => `
                                <article class="product-card product-card--${product.palette}">
                                  <div class="product-card__media"><span>${escapeHtml(product.emoji)}</span><small>${escapeHtml(product.badge)}</small></div>
                                  <div class="product-card__body">
                                    <div><h5>${escapeHtml(product.name)}</h5><p>${escapeHtml(product.categoryLabel)}</p></div>
                                     <div class="product-card__footer"><strong>${formatCurrency(product.price)}</strong><button type="button" class="btn btn--primary btn--sm" data-action="add-product" data-product-id="${product.id}">+ Agregar</button></div>
                                   </div>
                                 </article>
                               `,
                            )
                            .join('')
                        : '<section class="empty-state empty-state--grid"><div class="empty-state__icon icon-slot" data-icon="search"></div><h3>Sin productos visibles</h3><p>Cambia la búsqueda o la categoría para seguir agregando.</p></section>'}
                    </div>
                  </div>
                </section>
              `
            : `
                <section class="drawer-order-layout">
                  ${lines.length
                    ? `
                        <div class="table-responsive">
                          <table class="data-table">
                            <thead><tr><th>Producto</th><th>Cant.</th><th>Precio</th><th>Subtotal</th><th aria-label="Acciones"></th></tr></thead>
                            <tbody>
                              ${lines
                                .map(
                                  (line) => `
                                    <tr>
                                      <td><div class="table-product-cell"><span>${escapeHtml(line.product?.emoji || '🍽️')}</span><div><strong>${escapeHtml(line.product?.name || 'Producto')}</strong><small>${escapeHtml(line.product?.categoryLabel || 'Sin categoría')}</small></div></div></td>
                                      <td><div class="qty-control"><button type="button" class="icon-button icon-button--ghost" data-action="decrease-product" data-product-id="${line.productId}" aria-label="Disminuir cantidad"><span class="icon-slot" data-icon="minus"></span></button><span>${line.quantity}</span><button type="button" class="icon-button icon-button--ghost" data-action="increase-product" data-product-id="${line.productId}" aria-label="Aumentar cantidad"><span class="icon-slot" data-icon="plus"></span></button></div></td>
                                      <td>${formatCurrency(line.product?.price || 0)}</td>
                                      <td>${formatCurrency(line.subtotal)}</td>
                                      <td><button type="button" class="icon-button icon-button--ghost" data-action="remove-product" data-product-id="${line.productId}" aria-label="Eliminar producto"><span class="icon-slot" data-icon="trash"></span></button></td>
                                    </tr>
                                  `,
                                )
                                .join('')}
                            </tbody>
                          </table>
                        </div>
                      `
                    : '<section class="empty-state empty-state--drawer"><div class="empty-state__icon icon-slot" data-icon="receipt"></div><h3>Pedido vacío</h3><p>Agrega productos desde la pestaña Agregar para iniciar el consumo de la mesa.</p></section>'}

                  <section class="service-options-card">
                    <div class="section-title-row"><h4>Extra</h4><span>${isTakeaway ? 'Para llevar' : 'Salón'}</span></div>
                    <label class="toggle-field">
                      <span>Marcar como para llevar</span>
                      <input type="checkbox" name="tableIsTakeaway" data-table-id="${table.id}" ${isTakeaway ? 'checked' : ''} />
                    </label>
                    ${isTakeaway
                      ? `
                          <div class="form-grid form-grid--compact">
                            <label class="field"><span>Origen</span><select name="tableTakeawayChannel" data-table-id="${table.id}">${takeawaySourceOptions.map((option) => `<option value="${option.value}" ${table.order?.takeawayChannel === option.value ? 'selected' : ''}>${escapeHtml(option.label)}</option>`).join('')}</select></label>
                            <label class="field"><span>Comprobante</span><select name="tableDocumentType" data-table-id="${table.id}" ${table.order?.documentIssued ? 'disabled' : ''}>${documentTypeOptions.map((option) => `<option value="${option.value}" ${table.order?.documentType === option.value ? 'selected' : ''}>${escapeHtml(option.label)}</option>`).join('')}</select></label>
                          </div>
                          <div class="alert-inline alert-inline--info">Recargo: <strong>${formatCurrency(surchargeTotal)}</strong>. ${linkedTakeaway ? `Sync ${escapeHtml(linkedTakeaway.code)}.` : 'Sin sincronizar.'}</div>
                          <button type="button" class="btn btn--secondary btn--block" data-action="sync-takeaway-order" data-table-id="${table.id}" ${!lines.length ? 'disabled' : ''}><span class="icon-slot" data-icon="bag"></span><span>${linkedTakeaway ? 'Actualizar recojo' : 'Enviar a recojo'}</span></button>
                        `
                      : '<div class="empty-inline"><span class="icon-slot" data-icon="bag"></span><p>Activa esta opción si el cliente pidió despacho para llevar desde una mesa del salón.</p></div>'}
                  </section>

                  <section class="order-summary-box">
                    <div class="order-summary-box__top"><div><span>Total</span><strong>${formatCurrency(total)}</strong></div><small>${lines.length ? `${lines.length} líneas` : 'Sin items'}</small></div>
                    ${surchargeTotal ? `<div class="summary-inline-note">Incluye recargo por envases/tapers: <strong>${formatCurrency(surchargeTotal)}</strong></div>` : ''}
                    <div class="order-summary-box__actions">
                      <button type="button" class="btn btn--secondary" data-action="open-move-modal" data-table-id="${table.id}" ${tables.length <= 1 || !lines.length ? 'disabled' : ''}><span class="icon-slot" data-icon="move"></span><span>Trasladar cuenta</span></button>
                      <button type="button" class="btn btn--primary" data-action="send-kitchen" data-table-id="${table.id}" ${!lines.length ? 'disabled' : ''}><span class="icon-slot" data-icon="send"></span><span>Cocina</span></button>
                      <button type="button" class="btn btn--secondary" data-action="invoice-order" data-table-id="${table.id}" ${!lines.length ? 'disabled' : ''}><span class="icon-slot" data-icon="receipt-check"></span><span>Registrar pago</span></button>
                      <button type="button" class="btn btn--ghost" data-action="split-bill" data-table-id="${table.id}" ${!lines.length ? 'disabled' : ''}><span class="icon-slot" data-icon="split"></span><span>Dividir cuenta</span></button>
                    </div>
                  </section>
                </section>
              `}
        </div>
      </aside>
    </div>
  `;
}

export function renderModal({ modal, tables, waiters, products }) {
  if (!modal) return '';

  if (modal.type === 'force-release') {
    const table = tables.find((entry) => entry.id === modal.tableId);
    if (!table) return '';

    const waiterName = getWaiterName(waiters, table.waiterId);
    const itemsCount = getTableItemsCount(table);
    const { total } = getOrderDetails(table, products);

    return `
      <div class="modal-overlay" data-close-modal="true">
        <section class="modal" role="dialog" aria-modal="true" aria-label="Liberar forzosamente mesa ${escapeHtml(table.number)}">
          <form class="modal__content" id="forceReleaseForm">
            <header class="modal__section modal__section--header">
              <div>
                <h3>Liberar forzosamente Mesa ${escapeHtml(table.number)}</h3>
                <p>Esta operación vaciará el pedido activo y dejará la mesa disponible inmediatamente.</p>
              </div>
              <button type="button" class="icon-button icon-button--ghost" data-close-modal="true" aria-label="Cerrar modal"><span class="icon-slot" data-icon="x"></span></button>
            </header>
            <div class="modal__section modal__section--body">
              <div class="modal-summary-strip">
                <span>${itemsCount} productos activos · ${escapeHtml(table.zone)} · ${escapeHtml(table.description)}</span>
                <strong>${formatCurrency(total)}</strong>
              </div>
              <div class="alert-inline alert-inline--warning">Confirma doble validación operativa antes de vaciar el consumo de la mesa.</div>
              <div class="force-release-grid">
                <label class="check-tile ${modal.errors?.confirmWaiter ? 'is-error' : ''}">
                  <input type="checkbox" name="confirmWaiter" ${modal.form?.confirmWaiter ? 'checked' : ''} />
                  <span class="check-tile__copy">
                    <strong>Confirmación 1</strong>
                    <span>Validé con el mesero asignado: ${escapeHtml(waiterName)}.</span>
                  </span>
                </label>
                ${modal.errors?.confirmWaiter ? `<p class="field-error">${escapeHtml(modal.errors.confirmWaiter)}</p>` : ''}
                <label class="check-tile ${modal.errors?.confirmSupervisor ? 'is-error' : ''}">
                  <input type="checkbox" name="confirmSupervisor" ${modal.form?.confirmSupervisor ? 'checked' : ''} />
                  <span class="check-tile__copy">
                    <strong>Confirmación 2</strong>
                    <span>Supervisor o caja autorizó la liberación extraordinaria.</span>
                  </span>
                </label>
                ${modal.errors?.confirmSupervisor ? `<p class="field-error">${escapeHtml(modal.errors.confirmSupervisor)}</p>` : ''}
              </div>
              <label class="field">
                <span>Contraseña final</span>
                <input name="overridePassword" type="password" inputmode="numeric" autocomplete="off" value="${escapeHtml(modal.form?.overridePassword || '')}" placeholder="Ingresa 12345" />
                ${modal.errors?.overridePassword ? `<p class="field-error">${escapeHtml(modal.errors.overridePassword)}</p>` : ''}
              </label>
            </div>
            <footer class="modal__section modal__section--footer">
              <button type="button" class="btn btn--secondary" data-close-modal="true">Cancelar</button>
              <button type="submit" class="btn btn--warning">Confirmar liberación</button>
            </footer>
          </form>
        </section>
      </div>
    `;
  }

  if (modal.type === 'confirm') {
    return `
      <div class="modal-overlay" data-close-modal="true">
        <section class="modal" role="dialog" aria-modal="true" aria-label="${escapeHtml(modal.title)}">
          <header class="modal__header">
            <div class="modal__icon-circle modal__icon-circle--${modal.tone || 'warning'}"><span class="icon-slot" data-icon="alert"></span></div>
            <button type="button" class="icon-button icon-button--ghost" data-close-modal="true" aria-label="Cerrar modal"><span class="icon-slot" data-icon="x"></span></button>
          </header>
          <div class="modal__body modal__body--centered">
            <h3>${escapeHtml(modal.title)}</h3>
            <p>${escapeHtml(modal.message)}</p>
            ${modal.note ? `<div class="alert-inline alert-inline--${modal.tone || 'warning'}">${escapeHtml(modal.note)}</div>` : ''}
          </div>
          <footer class="modal__footer modal__footer--centered">
            <button type="button" class="btn btn--secondary" data-close-modal="true">Cancelar</button>
            <button type="button" class="btn ${modal.confirmVariant || 'btn--primary'}" data-action="confirm-modal">${escapeHtml(modal.confirmLabel || 'Confirmar')}</button>
          </footer>
        </section>
      </div>
    `;
  }

  if (modal.type === 'move') {
    const availableTables = tables.filter((table) => table.id !== modal.tableId);
    return `
      <div class="modal-overlay" data-close-modal="true">
        <section class="modal" role="dialog" aria-modal="true" aria-label="Trasladar cuenta">
          <form class="modal__content" id="moveOrderForm">
            <header class="modal__section modal__section--header"><div><h3>Trasladar cuenta</h3><p>Selecciona la mesa destino para mover la cuenta activa sin perder consumo ni configuración.</p></div><button type="button" class="icon-button icon-button--ghost" data-close-modal="true" aria-label="Cerrar modal"><span class="icon-slot" data-icon="x"></span></button></header>
            <div class="modal__section modal__section--body">
              <label class="field"><span>Mesa destino</span><select name="targetTableId" required><option value="">Seleccionar mesa</option>${availableTables.map((table) => `<option value="${table.id}">Mesa ${escapeHtml(table.number)} · ${escapeHtml(table.zone)}</option>`).join('')}</select></label>
              ${modal.errors?.targetTableId ? `<p class="field-error">${escapeHtml(modal.errors.targetTableId)}</p>` : ''}
            </div>
            <footer class="modal__section modal__section--footer"><button type="button" class="btn btn--secondary" data-close-modal="true">Cancelar</button><button type="submit" class="btn btn--primary">Trasladar cuenta</button></footer>
          </form>
        </section>
      </div>
    `;
  }

  if (modal.type === 'payment') {
    return `
      <div class="modal-overlay" data-close-modal="true">
        <section class="modal" role="dialog" aria-modal="true" aria-label="Registrar pago">
          <form class="modal__content" id="paymentForm">
            <header class="modal__section modal__section--header"><div><h3>Registrar pago</h3><p>Define método de pago y comprobante antes de cerrar la cuenta de la mesa.</p></div><button type="button" class="icon-button icon-button--ghost" data-close-modal="true" aria-label="Cerrar modal"><span class="icon-slot" data-icon="x"></span></button></header>
            <div class="modal__section modal__section--body">
              <div class="modal-summary-strip"><span>Total a cobrar</span><strong>${formatCurrency(modal.total)}</strong></div>
              <div class="form-grid">
                <label class="field"><span>Método de pago</span><select name="paymentMethod" required><option value="">Seleccionar método</option>${paymentMethodOptions.map((option) => `<option value="${option.value}" ${modal.form.paymentMethod === option.value ? 'selected' : ''}>${escapeHtml(option.label)}</option>`).join('')}</select>${modal.errors?.paymentMethod ? `<p class="field-error">${escapeHtml(modal.errors.paymentMethod)}</p>` : ''}</label>
                <label class="field"><span>Comprobante</span><select name="documentType" required>${documentTypeOptions.map((option) => `<option value="${option.value}" ${modal.form.documentType === option.value ? 'selected' : ''}>${escapeHtml(option.label)}</option>`).join('')}</select></label>
              </div>
              <div class="form-grid">
                <label class="field"><span>Monto abonado</span><input name="amountReceived" type="number" min="0" step="0.01" value="${escapeHtml(modal.form.amountReceived)}" />${modal.errors?.amountReceived ? `<p class="field-error">${escapeHtml(modal.errors.amountReceived)}</p>` : ''}</label>
                <label class="field"><span>Documento cliente</span><input name="customerDocument" type="text" maxlength="11" value="${escapeHtml(modal.form.customerDocument || '')}" placeholder="DNI o RUC" />${modal.errors?.customerDocument ? `<p class="field-error">${escapeHtml(modal.errors.customerDocument)}</p>` : ''}</label>
              </div>
              <label class="field"><span>Razón social</span><input name="businessName" type="text" maxlength="120" value="${escapeHtml(modal.form.businessName || '')}" placeholder="Solo si solicita factura" /></label>
              <div class="alert-inline alert-inline--info">Procedimiento ficticio: al registrar el pago, la mesa se libera y el comprobante queda marcado como emitido.</div>
            </div>
            <footer class="modal__section modal__section--footer"><button type="button" class="btn btn--secondary" data-close-modal="true">Cancelar</button><button type="submit" class="btn btn--primary">Registrar pago</button></footer>
          </form>
        </section>
      </div>
    `;
  }

  if (modal.type === 'split-payment') {
    return `
      <div class="modal-overlay" data-close-modal="true">
        <section class="modal modal--wide" role="dialog" aria-modal="true" aria-label="Dividir cuenta">
          <form class="modal__content" id="splitPaymentForm">
            <header class="modal__section modal__section--header"><div><h3>Dividir cuenta</h3><p>Configura las cuotas, cuánto abona cada cliente y con qué método se registra.</p></div><button type="button" class="icon-button icon-button--ghost" data-close-modal="true" aria-label="Cerrar modal"><span class="icon-slot" data-icon="x"></span></button></header>
            <div class="modal__section modal__section--body">
              <div class="modal-summary-strip"><span>Total a repartir</span><strong>${formatCurrency(modal.total)}</strong></div>
              <div class="form-grid">
                <label class="field"><span>Cuotas</span><select name="splitCount">${Array.from({ length: 5 }, (_, index) => index + 2).map((count) => `<option value="${count}" ${Number(modal.form.splitCount) === count ? 'selected' : ''}>${count} cuotas</option>`).join('')}</select></label>
                <label class="field"><span>Comprobante</span><select name="documentType">${documentTypeOptions.map((option) => `<option value="${option.value}" ${modal.form.documentType === option.value ? 'selected' : ''}>${escapeHtml(option.label)}</option>`).join('')}</select></label>
              </div>
              <div class="form-grid">
                <label class="field"><span>Documento cliente</span><input name="customerDocument" type="text" maxlength="11" value="${escapeHtml(modal.form.customerDocument || '')}" placeholder="DNI o RUC" />${modal.errors?.customerDocument ? `<p class="field-error">${escapeHtml(modal.errors.customerDocument)}</p>` : ''}</label>
                <label class="field"><span>Razón social</span><input name="businessName" type="text" maxlength="120" value="${escapeHtml(modal.form.businessName || '')}" placeholder="Solo si solicita factura" /></label>
              </div>
              <div class="split-payment-grid">
                ${modal.form.splits.map((split, index) => `
                  <div class="split-payment-row">
                    <label class="field"><span>Cuota ${index + 1}</span><input name="payer-${index}" type="text" value="${escapeHtml(split.payer)}" /></label>
                    <label class="field"><span>Abona</span><input name="amount-${index}" type="number" min="0" step="0.01" value="${escapeHtml(split.amount)}" />${modal.errors?.[`amount-${index}`] ? `<p class="field-error">${escapeHtml(modal.errors[`amount-${index}`])}</p>` : ''}</label>
                    <label class="field"><span>Método</span><select name="method-${index}"><option value="">Seleccionar</option>${paymentMethodOptions.map((option) => `<option value="${option.value}" ${split.paymentMethod === option.value ? 'selected' : ''}>${escapeHtml(option.label)}</option>`).join('')}</select>${modal.errors?.[`method-${index}`] ? `<p class="field-error">${escapeHtml(modal.errors[`method-${index}`])}</p>` : ''}</label>
                  </div>
                `).join('')}
              </div>
              ${modal.errors?.splitTotal ? `<p class="field-error">${escapeHtml(modal.errors.splitTotal)}</p>` : ''}
              <div class="alert-inline alert-inline--info">Procedimiento ficticio: cada cuota registra su método de pago y luego la cuenta se cierra automáticamente.</div>
            </div>
            <footer class="modal__section modal__section--footer"><button type="button" class="btn btn--secondary" data-close-modal="true">Cancelar</button><button type="submit" class="btn btn--primary">Registrar división</button></footer>
          </form>
        </section>
      </div>
    `;
  }

  const isEdit = modal.type === 'edit';
  const isAssign = modal.type === 'assign';

  return `
    <div class="modal-overlay" data-close-modal="true">
      <section class="modal" role="dialog" aria-modal="true" aria-label="${isEdit ? 'Editar mesa' : isAssign ? 'Asignar mesero' : 'Nueva mesa'}">
        <form class="modal__content" id="tableForm">
          <header class="modal__section modal__section--header">
            <div>
              <h3>${isEdit ? `Editar mesa ${escapeHtml(modal.form.number || '')}` : isAssign ? `Asignar mesero · Mesa ${escapeHtml(modal.tableNumber || '')}` : 'Nueva mesa'}</h3>
              <p>${isAssign ? 'Selecciona al responsable visible en la card y en el flujo de pedido.' : 'Completa los datos mínimos para mantener el mapa de mesas ordenado.'}</p>
            </div>
            <button type="button" class="icon-button icon-button--ghost" data-close-modal="true" aria-label="Cerrar modal"><span class="icon-slot" data-icon="x"></span></button>
          </header>
          <div class="modal__section modal__section--body">
            ${isAssign
              ? `
                  <label class="field">
                    <span>Mesero asignado</span>
                    <select name="waiterId">
                      <option value="">— Sin asignar —</option>
                      ${waiters.map((waiter) => `<option value="${waiter.id}" ${modal.form.waiterId === waiter.id ? 'selected' : ''}>${escapeHtml(waiter.name)} · ${escapeHtml(waiter.shift)}</option>`).join('')}
                    </select>
                  </label>
                `
              : `
                  <div class="form-grid">
                    <label class="field"><span>Número de mesa</span><input name="number" type="text" maxlength="6" required value="${escapeHtml(modal.form.number || '')}" />${modal.errors?.number ? `<p class="field-error">${escapeHtml(modal.errors.number)}</p>` : ''}</label>
                    <label class="field"><span>Zona</span><select name="zone" required><option value="">Seleccionar zona</option>${modal.zones.map((zone) => `<option value="${escapeHtml(zone)}" ${modal.form.zone === zone ? 'selected' : ''}>${escapeHtml(zone)}</option>`).join('')}</select>${modal.errors?.zone ? `<p class="field-error">${escapeHtml(modal.errors.zone)}</p>` : ''}</label>
                  </div>
                  <label class="field"><span>Descripción</span><input name="description" type="text" maxlength="80" required value="${escapeHtml(modal.form.description || '')}" />${modal.errors?.description ? `<p class="field-error">${escapeHtml(modal.errors.description)}</p>` : ''}</label>
                  <label class="field field--file"><span>Imagen de mesa</span><input name="tableImageFile" type="file" accept="image/*" />${modal.form.imageAsset?.dataUrl ? `<img class="table-image-preview" src="${escapeHtml(modal.form.imageAsset.dataUrl)}" alt="Vista previa de mesa" />` : '<small>Se convertirá a .webp automáticamente.</small>'}${modal.errors?.imageAsset ? `<p class="field-error">${escapeHtml(modal.errors.imageAsset)}</p>` : ''}</label>
                  ${isEdit ? `<label class="field"><span>Estado</span><select name="status" required>${statusOptions.map((option) => `<option value="${option.value}" ${modal.form.status === option.value ? 'selected' : ''}>${escapeHtml(option.label)}</option>`).join('')}</select></label>` : ''}
                `}
          </div>
          <footer class="modal__section modal__section--footer"><button type="button" class="btn btn--secondary" data-close-modal="true">Cancelar</button><button type="submit" class="btn btn--primary">${isEdit ? 'Guardar cambios' : isAssign ? 'Asignar mesero' : 'Crear mesa'}</button></footer>
        </form>
      </section>
    </div>
  `;
}

export function renderToasts(toasts) {
  return toasts
    .map(
      (toast) => `
        <article class="toast toast--${toast.tone}">
          <span class="icon-slot" data-icon="${toast.icon || 'info'}"></span>
          <div><strong>${escapeHtml(toast.title)}</strong><p>${escapeHtml(toast.message)}</p></div>
        </article>
      `,
    )
    .join('');
}

const iconMap = {
  home: '<svg viewBox="0 0 24 24"><path d="M3 10.5 12 3l9 7.5"></path><path d="M5 9.5V21h14V9.5"></path></svg>',
  wallet: '<svg viewBox="0 0 24 24"><path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H19a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5.5A2.5 2.5 0 0 1 3 16.5Z"></path><path d="M16 12h5"></path><circle cx="16" cy="12" r="1"></circle></svg>',
  receipt: '<svg viewBox="0 0 24 24"><path d="M7 3h10v18l-2.5-1.5L12 21l-2.5-1.5L7 21Z"></path><path d="M9 8h6M9 12h6M9 16h4"></path></svg>',
  settings: '<svg viewBox="0 0 24 24"><path d="M12 3.5 14 5l2.6-.2.9 2.4 2 1.6-.9 2.4.9 2.4-2 1.6-.9 2.4L14 19l-2 1.5L10 19l-2.6.2-.9-2.4-2-1.6.9-2.4-.9-2.4 2-1.6.9-2.4L10 5Z"></path><circle cx="12" cy="12" r="3.2"></circle></svg>',
  flame: '<svg viewBox="0 0 24 24"><path d="M12 3c2.2 3 5 5.2 5 9a5 5 0 1 1-10 0c0-1.8.8-3.3 2-4.7.8-1 1.2-1.6 1.5-2.5.3-.7.4-1.2.5-1.8Z"></path></svg>',
  grid: '<svg viewBox="0 0 24 24"><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"></path></svg>',
  chart: '<svg viewBox="0 0 24 24"><path d="M4 19V5"></path><path d="M20 19H4"></path><path d="m7 15 4-4 3 3 5-7"></path></svg>',
  box: '<svg viewBox="0 0 24 24"><path d="m3 7 9-4 9 4-9 4Z"></path><path d="M3 7v10l9 4 9-4V7"></path><path d="M12 11v10"></path></svg>',
  bike: '<svg viewBox="0 0 24 24"><circle cx="6" cy="17" r="3"></circle><circle cx="18" cy="17" r="3"></circle><path d="M6 17 9 7h4l3 10"></path><path d="M10 9h5"></path></svg>',
  bag: '<svg viewBox="0 0 24 24"><path d="M6 8h12l1 11H5Z"></path><path d="M9 8a3 3 0 0 1 6 0"></path></svg>',
  book: '<svg viewBox="0 0 24 24"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v18H6.5A2.5 2.5 0 0 0 4 23Z"></path><path d="M4 5.5V21"></path></svg>',
  menu: '<svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"></path></svg>',
  sun: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2.5M12 19.5V22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M2 12h2.5M19.5 12H22M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"></path></svg>',
  moon: '<svg viewBox="0 0 24 24"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z"></path></svg>',
  plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"></path></svg>',
  search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6"></circle><path d="m20 20-3.5-3.5"></path></svg>',
  'check-circle': '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"></circle><path d="m8.5 12 2.5 2.5 4.5-5"></path></svg>',
  'dot-circle': '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"></circle><circle cx="12" cy="12" r="3"></circle></svg>',
  clock: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></svg>',
  utensils: '<svg viewBox="0 0 24 24"><path d="M5 3v8"></path><path d="M8 3v8"></path><path d="M5 7h3"></path><path d="M6.5 11v10"></path><path d="M16 3c0 3-1.5 4.5-3 5v13"></path><path d="M19 3v18"></path></svg>',
  user: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.5"></circle><path d="M5 19a7 7 0 0 1 14 0"></path></svg>',
  play: '<svg viewBox="0 0 24 24"><path d="m8 6 10 6-10 6z"></path></svg>',
  list: '<svg viewBox="0 0 24 24"><path d="M8 6h12M8 12h12M8 18h12"></path><circle cx="4" cy="6" r="1"></circle><circle cx="4" cy="12" r="1"></circle><circle cx="4" cy="18" r="1"></circle></svg>',
  pointer: '<svg viewBox="0 0 24 24"><path d="m7 3 10 10-4 1 2 5-2 1-2-5-3 3Z"></path></svg>',
  edit: '<svg viewBox="0 0 24 24"><path d="M4 20h4l10-10-4-4L4 16Z"></path><path d="m13 5 4 4"></path></svg>',
  'user-plus': '<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"></circle><path d="M3 19a6 6 0 0 1 12 0"></path><path d="M19 8v6M16 11h6"></path></svg>',
  unlock: '<svg viewBox="0 0 24 24"><rect x="4" y="10" width="16" height="10" rx="2"></rect><path d="M8 10V7a4 4 0 0 1 7-2"></path></svg>',
  trash: '<svg viewBox="0 0 24 24"><path d="M4 7h16"></path><path d="M9 7V4h6v3"></path><path d="m8 7 1 13h6l1-13"></path></svg>',
  'plus-circle': '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"></circle><path d="M12 8v8M8 12h8"></path></svg>',
  x: '<svg viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18"></path></svg>',
  minus: '<svg viewBox="0 0 24 24"><path d="M5 12h14"></path></svg>',
  send: '<svg viewBox="0 0 24 24"><path d="M3 11.5 21 4l-7.5 17-2.5-7Z"></path><path d="M11 14 21 4"></path></svg>',
  'receipt-check': '<svg viewBox="0 0 24 24"><path d="M7 3h10v18l-2.5-1.5L12 21l-2.5-1.5L7 21Z"></path><path d="m9 12 2 2 4-4"></path></svg>',
  split: '<svg viewBox="0 0 24 24"><path d="M6 4v16"></path><path d="M18 4v16"></path><path d="m9 8 3-3 3 3"></path><path d="m15 16-3 3-3-3"></path></svg>',
  move: '<svg viewBox="0 0 24 24"><path d="M12 3v18"></path><path d="m8 7 4-4 4 4"></path><path d="m8 17 4 4 4-4"></path><path d="M3 12h18"></path><path d="m7 8-4 4 4 4"></path><path d="m17 8 4 4-4 4"></path></svg>',
  alert: '<svg viewBox="0 0 24 24"><path d="M12 3 2.5 20h19Z"></path><path d="M12 9v4"></path><circle cx="12" cy="16.5" r="1"></circle></svg>',
  info: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"></circle><path d="M12 10v6"></path><circle cx="12" cy="7.5" r="1"></circle></svg>',
  package: '<svg viewBox="0 0 24 24"><path d="m3 8 9-4 9 4-9 4Z"></path><path d="M3 8v8l9 4 9-4V8"></path><path d="M12 12v8"></path></svg>',
  route: '<svg viewBox="0 0 24 24"><circle cx="6" cy="18" r="2"></circle><circle cx="18" cy="6" r="2"></circle><path d="M8 18h4a4 4 0 0 0 4-4V8"></path></svg>',
  download: '<svg viewBox="0 0 24 24"><path d="M12 3v11"></path><path d="m8 10 4 4 4-4"></path><path d="M4 20h16"></path></svg>',
  collapse: '<svg viewBox="0 0 24 24"><path d="M5 12h14"></path><path d="m7 9 5-5 5 5"></path></svg>',
  expand: '<svg viewBox="0 0 24 24"><path d="M5 12h14"></path><path d="m7 15 5 5 5-5"></path></svg>',
};
