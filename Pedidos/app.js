import {
    TAKEAWAY_PACKAGING_RATE,
    categories,
    courtesyCatalog,
    courtesyDashboard,
    courtesyLimits,
    creditNoteDrafts,
    couriers,
    desktopDeliveryWorkspace,
    desktopPaymentMethods,
    desktopRoundStatusMeta,
    desktopTableJourneys,
    desktopTakeawayWorkspace,
    desktopTipOptions,
    deliveryStatusFlow,
    initialDeliveryOrders,
    initialTables,
    initialTakeawayOrders,
    paymentMethodOptions,
    products,
    staffMealConsumption,
    takeawayStatusFlow,
    tipsDashboard,
    waiters,
    zones,
} from './data.js';
import {
    filterDeliveryOrders,
    filterTables,
    filterTakeawayOrders,
    formatCurrency,
    getModeDefinition,
    getOperationalSummary,
    getOrderDetails,
    getReadyTakeawayCandidateId,
    getTableItemsCount,
    getUrgentDeliveryCandidateId,
    renderDeliveryBoard,
    renderCreditNotesPanel,
    renderCreditNotesWorkspace,
    renderCourtesyPanel,
    renderCourtesyWorkspace,
    renderDeliveryPanel,
    renderDesktopAreaTabs,
    renderIcons,
    renderManagementPanel,
    renderModal,
    renderModeHero,
    renderOnboarding,
    renderModeSwitcher,
    renderOrderDrawer,
    renderSalonToolbar,
    renderStats,
    renderTables,
    renderTablesSkeleton,
    renderTakeawayPanel,
    renderTakeawayQueue,
    renderTakeawayToolbar,
    renderTipsPanel,
    renderTipsWorkspace,
    renderToasts,
    renderWorkspaceHeader,
    renderDeliveryToolbar,
} from './ui.js';

const THEME_STORAGE_KEY = 'mirest-theme';
const UI_STORAGE_KEY = 'mirest-pos-ui';
const DATA_STORAGE_KEY = 'mirest-pos-demo-state';
const ONBOARDING_STORAGE_KEY = 'mirest-onboarding-v1';
const BACKEND_DATA_PATHS = {
    staff: './backend/data/staff.json',
    catalog: './backend/data/catalog.json',
    salon: './backend/data/orders-salon.json',
    delivery: './backend/data/orders-delivery.json',
    takeaway: './backend/data/orders-takeaway.json',
};

const persistedUi = readStorage(UI_STORAGE_KEY, {});
const persistedData = readStorage(DATA_STORAGE_KEY, {});
const persistedOnboarding = readStorage(ONBOARDING_STORAGE_KEY, {});
const hasPersistedOperationalData = Boolean(persistedData.tables || persistedData.deliveryOrders || persistedData.takeawayOrders);

function roundCurrency(value) {
    return Math.round((Number(value) || 0) * 100) / 100;
}

function shouldApplyPackagingFee(source) {
    return ['salon', 'whatsapp'].includes(String(source || '').trim().toLowerCase());
}

function createEmptyTableOrder(overrides = {}) {
    return {
        sentToKitchen: false,
        items: [],
        serviceType: 'salon',
        takeawayChannel: 'Salon',
        documentType: 'boleta',
        documentIssued: false,
        paymentConfirmed: false,
        paymentMethod: '',
        paymentLabel: 'Pendiente',
        customerDocument: '',
        businessName: '',
        paymentBreakdown: [],
        packagingFeeRate: 0,
        linkedTakeawayId: null,
        syncedAt: null,
        ...overrides,
    };
}

function normalizeTableOrder(order) {
    const serviceType = order?.serviceType === 'takeaway' ? 'takeaway' : 'salon';
    const takeawayChannel = order?.takeawayChannel || 'Salon';
    const paymentMethod = normalizePaymentMethod(order?.paymentMethod || order?.paymentLabel);

    return createEmptyTableOrder({
        ...order,
        items: Array.isArray(order?.items) ? order.items : [],
        sentToKitchen: Boolean(order?.sentToKitchen),
        serviceType,
        takeawayChannel,
        paymentMethod,
        paymentLabel: order?.paymentLabel || getPaymentMethodLabel(paymentMethod, 'Pendiente'),
        packagingFeeRate: serviceType === 'takeaway' && shouldApplyPackagingFee(takeawayChannel) ? TAKEAWAY_PACKAGING_RATE : 0,
        paymentBreakdown: Array.isArray(order?.paymentBreakdown) ? order.paymentBreakdown : [],
    });
}

function normalizeTable(table) {
    return {
        ...table,
        lastSettlement: table?.lastSettlement || null,
        order: normalizeTableOrder(table?.order),
    };
}

function ensureTimeline(timeline, status) {
    const list = Array.isArray(timeline) ? timeline.filter(Boolean) : [];
    if (!list.length && status) list.push(status);
    else if (status && list[list.length - 1] !== status) list.push(status);
    return list;
}

function normalizeDeliveryOrder(order) {
    const paymentMethod = normalizePaymentMethod(order?.paymentMethod || order?.paymentLabel);
    return {
        documentType: 'boleta',
        documentIssued: false,
        paymentConfirmed: false,
        paymentMethod,
        paymentLabel: order?.paymentLabel || getPaymentMethodLabel(paymentMethod, 'Pendiente'),
        customerDocument: '',
        businessName: '',
        timeline: [order?.status || 'pendiente'],
        ...order,
        timeline: ensureTimeline(order?.timeline, order?.status || 'pendiente'),
    };
}

function normalizeTakeawayOrder(order) {
    const source = order?.source || order?.channel || 'Caja';
    const paymentMethod = normalizePaymentMethod(order?.paymentMethod || order?.paymentLabel);
    const packagingFeeRate = Number.isFinite(order?.packagingFeeRate)
        ? order.packagingFeeRate
        : shouldApplyPackagingFee(source)
            ? TAKEAWAY_PACKAGING_RATE
            : 0;
    const baseTotal = roundCurrency(order?.baseTotal ?? order?.total ?? 0);
    const packagingFeeAmount = roundCurrency(order?.packagingFeeAmount ?? baseTotal * packagingFeeRate);
    const total = roundCurrency(order?.total ?? baseTotal + packagingFeeAmount);

    return {
        documentType: 'boleta',
        documentIssued: false,
        paymentConfirmed: false,
        paymentMethod,
        paymentLabel: order?.paymentLabel || getPaymentMethodLabel(paymentMethod, 'Pendiente'),
        source,
        baseTotal,
        packagingFeeRate,
        packagingFeeAmount,
        total,
        linkedTableId: null,
        customerDocument: '',
        businessName: '',
        timeline: [order?.status || 'recibido'],
        ...order,
        source,
        baseTotal,
        packagingFeeRate,
        packagingFeeAmount,
        total,
        timeline: ensureTimeline(order?.timeline, order?.status || 'recibido'),
    };
}

function ensureTableOrderShape(table) {
    if (!table) return null;
    table.order = normalizeTableOrder(table.order);
    return table.order;
}

function canCloseOperationalOrder(order) {
    return Boolean(order?.documentIssued && order?.paymentConfirmed && Array.isArray(order?.timeline) && order.timeline.length >= 1);
}

function hasInvoiceFiscalData(order) {
    const ruc = String(order?.customerDocument || '').replace(/\D/g, '');
    return ruc.length === 11 && String(order?.businessName || '').trim().length >= 4;
}

function normalizePaymentMethod(value) {
    const normalized = String(value || '').trim().toLowerCase();
    if (!normalized) return '';
    if (normalized.includes('yape') || normalized.includes('plin')) return 'yape-plin';
    if (normalized.includes('efect')) return 'efectivo';
    if (normalized.includes('tarje')) return 'tarjeta';
    if (normalized.includes('trans')) return 'transferencia';
    return paymentMethodOptions.some((option) => option.value === normalized) ? normalized : '';
}

function getPaymentMethodLabel(method, fallback = 'Pendiente') {
    return paymentMethodOptions.find((option) => option.value === method)?.label || fallback;
}

function getDocumentTypeLabel(type) {
    return type === 'factura' ? 'Factura' : 'Boleta';
}

function buildSplitDrafts(total, splitCount) {
    const safeCount = Math.max(2, Math.min(6, Number(splitCount) || 2));
    const baseAmount = roundCurrency(total / safeCount);
    return Array.from({ length: safeCount }, (_, index) => ({
        payer: `Cliente ${index + 1}`,
        amount: index === safeCount - 1 ? roundCurrency(total - baseAmount * (safeCount - 1)) : baseAmount,
        paymentMethod: '',
    }));
}

function getPromisedTimeLabel(minutesAhead) {
    const now = new Date();
    now.setMinutes(now.getMinutes() + minutesAhead);
    return now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function getDesktopJourney(tableId) {
    return desktopTableJourneys[tableId] || null;
}

function getInitialDesktopWorkbench() {
    const initialSalonTableId = initialTables.find((table) => table.status === 'ocupada')?.id || initialTables[0]?.id || null;
    const initialSalonJourney = getDesktopJourney(initialSalonTableId);

    return {
        activeArea: 'pedidos',
        salon: {
            tableId: initialSalonTableId,
            roundId: initialSalonJourney?.activeRoundId || initialSalonJourney?.rounds?.[0]?.id || null,
            view: 'overview',
            composerCategory: 'postres',
        },
        delivery: {
            highlightOrderId: desktopDeliveryWorkspace.highlightOrderId,
            view: 'overview',
        },
        takeaway: {
            orderId: desktopTakeawayWorkspace.activeOrderId,
            view: 'overview',
        },
        payments: {
            methods: structuredClone(desktopPaymentMethods),
            tipOptions: structuredClone(desktopTipOptions),
            proofs: structuredClone(desktopDeliveryWorkspace.proofTemplates),
            pendingProofDraft: null,
        },
        courtesies: {
            catalog: structuredClone(courtesyCatalog),
            dashboard: structuredClone(courtesyDashboard),
            staffMealConsumption: structuredClone(staffMealConsumption),
            limits: structuredClone(courtesyLimits),
            activeType: 'cliente',
            selectedCourtesyId: courtesyCatalog[0]?.id || null,
        },
        tips: {
            dashboard: structuredClone(tipsDashboard),
            distributionMode: tipsDashboard.distributionModes?.[0] || 'Partes iguales',
            tipMode: 'Incluida en pago',
        },
        creditNotes: {
            drafts: structuredClone(creditNoteDrafts),
            selectedDraftId: creditNoteDrafts[0]?.id || null,
            motive: 'devolucion',
            selectedItemIds: creditNoteDrafts[0]?.items?.map((item) => item.id) || [],
        },
    };
}

function ensureDesktopSalonContext(tableId) {
    const journey = getDesktopJourney(tableId);
    state.desktopWorkbench.salon.tableId = tableId;
    if (!journey) {
        state.desktopWorkbench.salon.roundId = null;
        return;
    }

    const roundStillExists = journey.rounds.some((round) => round.id === state.desktopWorkbench.salon.roundId);
    if (!roundStillExists) {
        state.desktopWorkbench.salon.roundId = journey.activeRoundId || journey.rounds[0]?.id || null;
    }
}

const state = {
    theme: localStorage.getItem(THEME_STORAGE_KEY) || 'light',
    mode: persistedUi.mode || 'salon',
    sidebarOpen: false,
    waiters: structuredClone(waiters),
    couriers: structuredClone(couriers),
    zones: structuredClone(zones),
    categories: structuredClone(categories),
    products: structuredClone(products),
    filters: {
        salon: { search: '', zone: 'all', status: 'all', ...(persistedUi.filters?.salon || {}) },
        delivery: { search: '', status: 'all', channel: 'all', quick: 'all', ...(persistedUi.filters?.delivery || {}) },
        takeaway: { search: '', status: 'all', channel: 'all', quick: 'all', ...(persistedUi.filters?.takeaway || {}) },
    },
    selectedIds: {
        salon: persistedUi.selectedIds?.salon || persistedData.tables?.[0]?.id || initialTables[0]?.id || null,
        delivery: persistedUi.selectedIds?.delivery || persistedData.deliveryOrders?.[0]?.id || initialDeliveryOrders[0]?.id || null,
        takeaway: persistedUi.selectedIds?.takeaway || persistedData.takeawayOrders?.[0]?.id || initialTakeawayOrders[0]?.id || null,
    },
    panelsCollapsed: { salon: false, delivery: false, takeaway: false, ...(persistedUi.panelsCollapsed || {}) },
    hintsDismissed: { salon: false, delivery: false, takeaway: false, ...(persistedUi.hintsDismissed || {}) },
    salonOperationsExpanded: false,
    onboarding: {
        open: !persistedOnboarding.completed,
        completed: Boolean(persistedOnboarding.completed),
        step: 0,
    },
    activeModal: null,
    orderDrawer: {
        open: false,
        tableId: null,
        tab: 'add',
        search: '',
        category: 'all',
        inlineFeedback: null,
    },
    uiLoading: true,
    tables: structuredClone((persistedData.tables || initialTables).map((table) => normalizeTable(table))),
    deliveryOrders: structuredClone((persistedData.deliveryOrders || initialDeliveryOrders).map((order) => normalizeDeliveryOrder(order))),
    takeawayOrders: structuredClone((persistedData.takeawayOrders || initialTakeawayOrders).map((order) => normalizeTakeawayOrder(order))),
    desktopWorkbench: getInitialDesktopWorkbench(),
    toasts: [],
};

let loadingTimer = null;
let pendingInlineFeedbackTimer = null;
let postRenderFrame = null;
let queuedStorageTimer = null;
let staticIconsHydrated = false;
let lastPersistedTheme = '';
let lastPersistedUiSnapshot = '';
let lastPersistedOperationalSnapshot = '';
let lastPersistedOnboardingSnapshot = '';
const queuedStoragePayloads = new Map();

const refs = {
    body: document.body,
    appShell: document.getElementById('appShell'),
    sidebarBackdrop: document.getElementById('sidebarBackdrop'),
    topbarEyebrow: document.getElementById('topbarEyebrow'),
    topbarTitle: document.getElementById('topbarTitle'),
    modeSwitcher: document.getElementById('modeSwitcher'),
    modeHero: document.getElementById('modeHero'),
    summaryStats: document.getElementById('summaryStats'),
    workspaceLayout: document.getElementById('workspaceLayout'),
    workspaceHeader: document.getElementById('workspaceHeader'),
    workspaceToolbar: document.getElementById('workspaceToolbar'),
    workspaceContent: document.getElementById('workspaceContent'),
    managementPanel: document.getElementById('managementPanel'),
    modalRoot: document.getElementById('modalRoot'),
    drawerRoot: document.getElementById('drawerRoot'),
    onboardingRoot: document.getElementById('onboardingRoot'),
    toastRoot: document.getElementById('toastRoot'),
    themeToggle: document.getElementById('themeToggle'),
    mobileSidebarToggle: document.getElementById('mobileSidebarToggle'),
    themeColorMeta: document.querySelector('meta[name="theme-color"]'),
};

init();

function init() {
    refs.body.dataset.theme = state.theme;
    refs.body.dataset.mode = state.mode;
    refs.themeToggle.checked = state.theme === 'dark';
    handleWindowScroll();
    window.addEventListener('scroll', handleWindowScroll, { passive: true });
    window.addEventListener('beforeunload', flushQueuedStorageWrites);
    bindEvents();
    state.uiLoading = false;
    render();
    void hydrateBackendData().then(() => {
        render();
    });
}

function handleWindowScroll() {
    refs.body.classList.toggle('has-scrolled', window.scrollY > 12);
}

async function hydrateBackendData() {
    if (location.protocol === 'file:') return;

    try {
        const [staffPayload, catalogPayload, salonPayload, deliveryPayload, takeawayPayload] = await Promise.all([
            fetchJson(BACKEND_DATA_PATHS.staff),
            fetchJson(BACKEND_DATA_PATHS.catalog),
            fetchJson(BACKEND_DATA_PATHS.salon),
            fetchJson(BACKEND_DATA_PATHS.delivery),
            fetchJson(BACKEND_DATA_PATHS.takeaway),
        ]);

        if (Array.isArray(staffPayload?.waiters)) state.waiters = structuredClone(staffPayload.waiters);
        if (Array.isArray(staffPayload?.couriers)) state.couriers = structuredClone(staffPayload.couriers);
        if (Array.isArray(staffPayload?.zones)) state.zones = structuredClone(staffPayload.zones);
        if (Array.isArray(catalogPayload?.categories)) state.categories = structuredClone(catalogPayload.categories);
        if (Array.isArray(catalogPayload?.products)) state.products = structuredClone(catalogPayload.products);

        if (!hasPersistedOperationalData) {
            if (Array.isArray(salonPayload?.tables)) state.tables = structuredClone(salonPayload.tables.map((table) => normalizeTable(table)));
            if (Array.isArray(deliveryPayload?.orders)) state.deliveryOrders = structuredClone(deliveryPayload.orders.map((order) => normalizeDeliveryOrder(order)));
            if (Array.isArray(takeawayPayload?.orders)) state.takeawayOrders = structuredClone(takeawayPayload.orders.map((order) => normalizeTakeawayOrder(order)));
        }
    } catch {
        // Fallback silencioso a mocks JS cuando no se puede leer JSON.
    }
}

async function fetchJson(path) {
    const response = await fetch(path, { cache: 'no-store' });
    if (!response.ok) throw new Error(`No se pudo cargar ${path}`);
    return response.json();
}

function bindEvents() {
    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeydown);
    document.addEventListener('input', handleInput);
    document.addEventListener('change', handleChange);
    document.addEventListener('submit', handleSubmit);
}

function pickImageFile() {
    return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.addEventListener('change', () => resolve(input.files?.[0] || null), { once: true });
        input.click();
    });
}

function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error || new Error('No se pudo leer el archivo.'));
        reader.readAsDataURL(file);
    });
}

function canvasToBlob(canvas, quality = 0.82) {
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error('No se pudo generar blob WEBP.'));
        }, 'image/webp', quality);
    });
}

async function convertImageFileToWebpAsset(file, prefix = 'asset') {
    if (!(file instanceof File) || !file.type.startsWith('image/')) return null;
    const sourceDataUrl = await readFileAsDataUrl(file);
    const image = await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('No se pudo cargar la imagen.'));
        img.src = sourceDataUrl;
    });

    const maxWidth = 1280;
    const scale = Math.min(1, maxWidth / image.width);
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('No se pudo inicializar canvas.');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = await canvasToBlob(canvas, 0.82);
    const webpFile = new File([blob], `${prefix}-${Date.now()}.webp`, { type: 'image/webp' });
    const dataUrl = await readFileAsDataUrl(webpFile);

    return {
        id: `${prefix}-${Date.now()}`,
        fileName: webpFile.name,
        mimeType: webpFile.type,
        sizeKb: Math.max(1, Math.round(webpFile.size / 1024)),
        width: canvas.width,
        height: canvas.height,
        dataUrl,
        sourceName: file.name,
    };
}

function render() {
    const transientUiState = captureTransientUiState();
    const modeDefinition = getModeDefinition(state.mode);
    const filteredTables = filterTables(state.tables, state.filters.salon, state.waiters);
    const filteredDelivery = filterDeliveryOrders(state.deliveryOrders, state.filters.delivery, state.couriers);
    const filteredTakeaway = filterTakeawayOrders(state.takeawayOrders, state.filters.takeaway);

    syncSelectedItems({ filteredTables, filteredDelivery, filteredTakeaway });

    refs.body.dataset.mode = state.mode;
    refs.appShell.dataset.mode = state.mode;
    refs.workspaceLayout.dataset.mode = state.mode;
    refs.topbarEyebrow.textContent = modeDefinition.eyebrow;
    refs.topbarTitle.textContent = 'Pedidos';
    refs.modeSwitcher.innerHTML = renderModeSwitcher({ activeMode: state.mode });
    refs.modeHero.innerHTML = renderModeHero({
        mode: state.mode,
        dismissed: state.hintsDismissed[state.mode],
    });
    refs.workspaceHeader.innerHTML = renderWorkspaceHeader({
        mode: state.mode,
        collapsed: state.panelsCollapsed[state.mode],
        viewMode: state.desktopWorkbench.salon.view,
    });
    if (state.mode === 'salon') {
        refs.workspaceHeader.insertAdjacentHTML('beforeend', renderDesktopAreaTabs(state.desktopWorkbench.activeArea));
    }
    refs.summaryStats.innerHTML = renderStats(
        getOperationalSummary({
            mode: state.mode,
            tables: state.tables,
            deliveryOrders: state.deliveryOrders,
            takeawayOrders: state.takeawayOrders,
        }),
        { loading: state.uiLoading },
    );

    if (state.mode === 'salon') {
        refs.workspaceToolbar.innerHTML = renderSalonToolbar({
            filters: state.filters.salon,
            zones: state.zones,
            filteredCount: filteredTables.length,
            totalCount: state.tables.length,
            loading: state.uiLoading,
        });
        if (state.desktopWorkbench.activeArea === 'pedidos') {
            refs.workspaceContent.innerHTML = state.uiLoading
                ? renderTablesSkeleton()
                : renderTables({
                    tables: filteredTables,
                    selectedTableId: state.selectedIds.salon,
                    waiters: state.waiters,
                    products: state.products,
                    viewMode: state.desktopWorkbench.salon.view,
                });
            refs.managementPanel.innerHTML = renderManagementPanel({
                table: getTableById(state.selectedIds.salon),
                waiters: state.waiters,
                products: state.products,
                collapsed: state.panelsCollapsed.salon,
                operationsExpanded: state.salonOperationsExpanded,
                desktopWorkbench: state.desktopWorkbench,
                loading: state.uiLoading,
            });
        }

        if (state.desktopWorkbench.activeArea === 'courtesies') {
            refs.workspaceContent.innerHTML = renderCourtesyWorkspace({ desktopWorkbench: state.desktopWorkbench });
            refs.managementPanel.innerHTML = renderCourtesyPanel({ desktopWorkbench: state.desktopWorkbench });
        }

        if (state.desktopWorkbench.activeArea === 'tips') {
            refs.workspaceContent.innerHTML = renderTipsWorkspace({ desktopWorkbench: state.desktopWorkbench });
            refs.managementPanel.innerHTML = renderTipsPanel({ desktopWorkbench: state.desktopWorkbench });
        }

        if (state.desktopWorkbench.activeArea === 'credit-notes') {
            refs.workspaceContent.innerHTML = renderCreditNotesWorkspace({ desktopWorkbench: state.desktopWorkbench });
            refs.managementPanel.innerHTML = renderCreditNotesPanel({ desktopWorkbench: state.desktopWorkbench });
        }
    }

    if (state.mode === 'delivery') {
        refs.workspaceToolbar.innerHTML = renderDeliveryToolbar({
            filters: state.filters.delivery,
            filteredCount: filteredDelivery.length,
            totalCount: state.deliveryOrders.length,
            loading: state.uiLoading,
        });
        refs.workspaceContent.innerHTML = renderDeliveryBoard({
            orders: filteredDelivery,
            selectedId: state.selectedIds.delivery,
            couriers: state.couriers,
            loading: state.uiLoading,
        });
        refs.managementPanel.innerHTML = renderDeliveryPanel({
            order: getDeliveryById(state.selectedIds.delivery),
            couriers: state.couriers,
            collapsed: state.panelsCollapsed.delivery,
            desktopWorkbench: state.desktopWorkbench,
            loading: state.uiLoading,
        });
    }

    if (state.mode === 'takeaway') {
        refs.workspaceToolbar.innerHTML = renderTakeawayToolbar({
            filters: state.filters.takeaway,
            filteredCount: filteredTakeaway.length,
            totalCount: state.takeawayOrders.length,
            loading: state.uiLoading,
        });
        refs.workspaceContent.innerHTML = renderTakeawayQueue({
            orders: filteredTakeaway,
            selectedId: state.selectedIds.takeaway,
            loading: state.uiLoading,
        });
        refs.managementPanel.innerHTML = renderTakeawayPanel({
            order: getTakeawayById(state.selectedIds.takeaway),
            collapsed: state.panelsCollapsed.takeaway,
            desktopWorkbench: state.desktopWorkbench,
            loading: state.uiLoading,
        });
    }

    refs.modalRoot.innerHTML = renderModal({
        modal: state.activeModal,
        tables: state.tables,
        waiters: state.waiters,
        products: state.products,
        desktopWorkbench: state.desktopWorkbench,
    });
    refs.drawerRoot.innerHTML = renderOrderDrawer({
        table: getTableById(state.orderDrawer.tableId),
        state,
        products: state.products,
        categories: state.categories,
        takeawayOrders: state.takeawayOrders,
        waiters: state.waiters,
        tables: state.tables,
    });
    refs.onboardingRoot.innerHTML = renderOnboarding({
        open: state.onboarding.open,
        step: state.onboarding.step,
    });
    refs.toastRoot.innerHTML = renderToasts(state.toasts);
    refs.body.classList.toggle('sidebar-open', state.sidebarOpen);
    refs.body.classList.toggle('drawer-open', state.orderDrawer.open);
    refs.body.classList.toggle('modal-open', Boolean(state.activeModal));
    refs.body.classList.toggle('onboarding-open', state.onboarding.open);
    refs.mobileSidebarToggle.setAttribute('aria-expanded', String(state.sidebarOpen));
    refs.themeColorMeta?.setAttribute('content', getThemeColor());
    document.title = `MiRest con IA · ${modeDefinition.title}`;

    document.querySelectorAll('[data-nav-mode], [data-nav-module]').forEach((item) => {
        const mode = item.dataset.navMode || item.dataset.navModule;
        const isActive = mode === 'pedidos'; // Only Pedidos is active in this specialization
        item.classList.toggle('is-active', isActive);
        if (isActive) item.setAttribute('aria-current', 'page');
        else item.removeAttribute('aria-current');
    });

    persistUiState();
    if (!staticIconsHydrated) {
        renderIcons(document);
        staticIconsHydrated = true;
    } else {
        [
            refs.modeSwitcher,
            refs.modeHero,
            refs.summaryStats,
            refs.workspaceHeader,
            refs.workspaceToolbar,
            refs.workspaceContent,
            refs.managementPanel,
            refs.modalRoot,
            refs.drawerRoot,
            refs.onboardingRoot,
            refs.toastRoot,
        ].forEach((container) => {
            if (container) renderIcons(container);
        });
    }
    restoreTransientUiState(transientUiState);
}

function captureTransientUiState() {
    const snapshot = {
        drawerScrollTop: 0,
        drawerSearchSelection: null,
    };

    if (!state.orderDrawer.open) return snapshot;

    const drawerScrollRegion = refs.drawerRoot.querySelector('[data-drawer-scroll-region]');
    if (drawerScrollRegion) snapshot.drawerScrollTop = drawerScrollRegion.scrollTop;

    const activeElement = document.activeElement;
    if (activeElement?.id === 'drawerProductSearch') {
        snapshot.drawerSearchSelection = {
            start: activeElement.selectionStart ?? activeElement.value.length,
            end: activeElement.selectionEnd ?? activeElement.value.length,
        };
    }

    return snapshot;
}

function restoreTransientUiState(snapshot) {
    if (!snapshot || !state.orderDrawer.open) return;

    const restore = () => {
        const drawerScrollRegion = refs.drawerRoot.querySelector('[data-drawer-scroll-region]');
        if (drawerScrollRegion) drawerScrollRegion.scrollTop = snapshot.drawerScrollTop || 0;

        if (snapshot.drawerSearchSelection) {
            const searchInput = refs.drawerRoot.querySelector('#drawerProductSearch');
            if (searchInput) {
                searchInput.focus({ preventScroll: true });
                searchInput.setSelectionRange(snapshot.drawerSearchSelection.start, snapshot.drawerSearchSelection.end);
            }
        }
    };

    restore();
    window.cancelAnimationFrame(postRenderFrame);
    postRenderFrame = window.requestAnimationFrame(restore);
}

function syncSelectedItems({ filteredTables, filteredDelivery, filteredTakeaway }) {
    const salonExists = filteredTables.some((table) => table.id === state.selectedIds.salon);
    if (!salonExists) state.selectedIds.salon = filteredTables[0]?.id || state.tables[0]?.id || null;

    const deliveryExists = filteredDelivery.some((order) => order.id === state.selectedIds.delivery);
    if (!deliveryExists) state.selectedIds.delivery = filteredDelivery[0]?.id || state.deliveryOrders[0]?.id || null;

    const takeawayExists = filteredTakeaway.some((order) => order.id === state.selectedIds.takeaway);
    if (!takeawayExists) state.selectedIds.takeaway = filteredTakeaway[0]?.id || state.takeawayOrders[0]?.id || null;
}

function handleClick(event) {
    const target = event.target;

    if (target.matches('.modal-overlay')) {
        closeModal();
        return;
    }

    if (target.matches('.drawer-backdrop')) {
        closeDrawer();
        return;
    }

    if (target.id === 'sidebarBackdrop') {
        state.sidebarOpen = false;
        render();
        return;
    }

    const modalCloser = target.closest('[data-close-modal="true"]');
    if (modalCloser && modalCloser.closest('.modal')) {
        closeModal();
        return;
    }

    const drawerCloser = target.closest('[data-close-drawer="true"]');
    if (drawerCloser && drawerCloser.closest('.order-drawer')) {
        closeDrawer();
        return;
    }

    const tableCard = target.closest('[data-select-table]');
    if (tableCard && !target.closest('button')) {
        state.selectedIds.salon = tableCard.dataset.selectTable;
        state.salonOperationsExpanded = false;
        ensureDesktopSalonContext(tableCard.dataset.selectTable);
        render();
        return;
    }

    const deliveryCard = target.closest('[data-select-delivery]');
    if (deliveryCard && !target.closest('button')) {
        state.selectedIds.delivery = deliveryCard.dataset.selectDelivery;
        state.desktopWorkbench.delivery.highlightOrderId = deliveryCard.dataset.selectDelivery;
        render();
        return;
    }

    const takeawayCard = target.closest('[data-select-takeaway]');
    if (takeawayCard && !target.closest('button')) {
        state.selectedIds.takeaway = takeawayCard.dataset.selectTakeaway;
        state.desktopWorkbench.takeaway.orderId = takeawayCard.dataset.selectTakeaway;
        render();
        return;
    }

    const modeSwitch = target.closest('[data-set-mode], [data-nav-mode]');
    if (modeSwitch) {
        setMode(modeSwitch.dataset.setMode || modeSwitch.dataset.navMode);
        return;
    }

    const dismissHint = target.closest('[data-dismiss-hint]');
    if (dismissHint) {
        state.hintsDismissed[state.mode] = true;
        render();
        return;
    }

    const onboardingJump = target.closest('[data-step][data-action="jump-onboarding"]');
    if (onboardingJump) {
        state.onboarding.step = Number(onboardingJump.dataset.step || 0);
        render();
        return;
    }

    const panelToggle = target.closest('[data-toggle-panel]');
    if (panelToggle) {
        const mode = panelToggle.dataset.togglePanel;
        state.panelsCollapsed[mode] = !state.panelsCollapsed[mode];
        render();
        return;
    }

    const zoneFilter = target.closest('[data-filter-zone]');
    if (zoneFilter) {
        state.filters.salon.zone = zoneFilter.dataset.filterZone;
        render();
        return;
    }

    const statusFilter = target.closest('[data-filter-status]');
    if (statusFilter) {
        state.filters.salon.status = statusFilter.dataset.filterStatus;
        render();
        return;
    }

    const deliveryStatusFilter = target.closest('[data-delivery-status]');
    if (deliveryStatusFilter) {
        state.filters.delivery.status = deliveryStatusFilter.dataset.deliveryStatus;
        render();
        return;
    }

    const deliveryQuickFilter = target.closest('[data-delivery-quick]');
    if (deliveryQuickFilter) {
        state.filters.delivery.quick = deliveryQuickFilter.dataset.deliveryQuick;
        render();
        return;
    }

    const deliveryChannelFilter = target.closest('[data-delivery-channel]');
    if (deliveryChannelFilter) {
        state.filters.delivery.channel = deliveryChannelFilter.dataset.deliveryChannel;
        render();
        return;
    }

    const takeawayStatusFilter = target.closest('[data-takeaway-status]');
    if (takeawayStatusFilter) {
        state.filters.takeaway.status = takeawayStatusFilter.dataset.takeawayStatus;
        render();
        return;
    }

    const takeawayQuickFilter = target.closest('[data-takeaway-quick]');
    if (takeawayQuickFilter) {
        state.filters.takeaway.quick = takeawayQuickFilter.dataset.takeawayQuick;
        render();
        return;
    }

    const takeawayChannelFilter = target.closest('[data-takeaway-channel]');
    if (takeawayChannelFilter) {
        state.filters.takeaway.channel = takeawayChannelFilter.dataset.takeawayChannel;
        render();
        return;
    }

    const categoryTrigger = target.closest('[data-category]');
    if (categoryTrigger) {
        state.orderDrawer.category = categoryTrigger.dataset.category;
        render();
        return;
    }

    if (target.id === 'mobileSidebarToggle' || target.closest('#mobileSidebarToggle')) {
        state.sidebarOpen = !state.sidebarOpen;
        render();
        return;
    }

    const actionTrigger = target.closest('[data-action]');
    if (!actionTrigger) return;

    const { action, tableId, tab, productId } = actionTrigger.dataset;
    switch (action) {
        case 'open-onboarding':
            openOnboarding();
            break;
        case 'set-desktop-area':
            state.desktopWorkbench.activeArea = actionTrigger.dataset.area || 'pedidos';
            render();
            break;
        case 'next-onboarding':
            nextOnboardingStep();
            break;
        case 'prev-onboarding':
            prevOnboardingStep();
            break;
        case 'skip-onboarding':
            completeOnboarding(true);
            break;
        case 'complete-onboarding':
            completeOnboarding(false);
            break;
        case 'open-create-modal':
            openCreateModal();
            break;
        case 'set-salon-view':
            state.desktopWorkbench.salon.view = actionTrigger.dataset.view || 'cards';
            render();
            break;
        case 'open-edit-modal':
            openEditModal(tableId);
            break;
        case 'open-assign-modal':
            openAssignModal(tableId);
            break;
        case 'open-release-modal':
            openReleaseModal(tableId);
            break;
        case 'open-force-release-modal':
            openForceReleaseModal(tableId);
            break;
        case 'open-delete-modal':
            openDeleteModal(tableId);
            break;
        case 'inspect-table':
            openOrder(tableId, 'order');
            break;
        case 'toggle-salon-operations':
            state.salonOperationsExpanded = !state.salonOperationsExpanded;
            render();
            break;
        case 'open-order':
            openOrder(tableId, 'add');
            break;
        case 'view-order':
            openOrder(tableId, 'order');
            break;
        case 'toggle-drawer-tab':
            state.orderDrawer.tab = tab;
            render();
            break;
        case 'add-product':
            addProductToCurrentTable(productId);
            break;
        case 'increase-product':
            changeProductQuantity(productId, 1);
            break;
        case 'decrease-product':
            changeProductQuantity(productId, -1);
            break;
        case 'remove-product':
            removeProduct(productId);
            break;
        case 'confirm-modal':
            confirmModal();
            break;
        case 'open-move-modal':
            openMoveModal(tableId);
            break;
        case 'send-kitchen':
            sendKitchen(tableId);
            break;
        case 'invoice-order':
            invoiceOrder(tableId);
            break;
        case 'split-bill':
            splitBill(tableId);
            break;
        case 'advance-delivery':
            advanceDelivery(actionTrigger.dataset.deliveryId);
            break;
        case 'advance-takeaway':
            advanceTakeaway(actionTrigger.dataset.takeawayId);
            break;
        case 'issue-delivery-document':
            issueDeliveryDocument(actionTrigger.dataset.deliveryId);
            break;
        case 'confirm-delivery-payment':
            confirmDeliveryPayment(actionTrigger.dataset.deliveryId);
            break;
        case 'issue-takeaway-document':
            issueTakeawayDocument(actionTrigger.dataset.takeawayId);
            break;
        case 'confirm-takeaway-payment':
            confirmTakeawayPayment(actionTrigger.dataset.takeawayId);
            break;
        case 'sync-takeaway-order':
            syncTableOrderToTakeaway(actionTrigger.dataset.tableId);
            break;
        case 'select-salon-round':
            setActiveSalonRound(tableId, actionTrigger.dataset.roundId);
            break;
        case 'set-salon-composer-category':
            state.desktopWorkbench.salon.composerCategory = actionTrigger.dataset.categoryId || 'all';
            render();
            break;
        case 'set-desktop-tip-rate':
            setDesktopTipRate(tableId, Number(actionTrigger.dataset.tipRate || 0));
            break;
        case 'set-desktop-payment-method':
            setDesktopPaymentMethod(tableId, actionTrigger.dataset.paymentMethod);
            break;
        case 'open-payment-proof-modal':
            attachDesktopPaymentProof(tableId);
            break;
        case 'open-delivery-proof-modal':
            attachDeliveryPaymentProof(actionTrigger.dataset.deliveryId);
            break;
        case 'open-takeaway-proof-modal':
            attachTakeawayPaymentProof(actionTrigger.dataset.takeawayId);
            break;
        case 'set-courtesy-type':
            state.desktopWorkbench.courtesies.activeType = actionTrigger.dataset.type || 'cliente';
            render();
            break;
        case 'select-credit-note':
            state.desktopWorkbench.creditNotes.selectedDraftId = actionTrigger.dataset.creditNoteId || state.desktopWorkbench.creditNotes.selectedDraftId;
            render();
            break;
        case 'set-credit-note-motive':
            state.desktopWorkbench.creditNotes.motive = actionTrigger.dataset.motive || 'devolucion';
            render();
            break;
        case 'toggle-credit-note-item':
            toggleCreditNoteItem(actionTrigger.dataset.creditItemId);
            break;
        case 'select-courtesy-item':
            state.desktopWorkbench.courtesies.selectedCourtesyId = actionTrigger.dataset.courtesyId || state.desktopWorkbench.courtesies.selectedCourtesyId;
            render();
            break;
        case 'set-tip-distribution':
            state.desktopWorkbench.tips.distributionMode = actionTrigger.dataset.modeName || state.desktopWorkbench.tips.distributionMode;
            render();
            break;
        case 'register-courtesy':
            pushToast('Cortesía registrada', 'La cortesía quedó registrada en modo mock para el flujo desktop.', 'success', 'check-circle');
            break;
        case 'issue-credit-note':
            pushToast('Nota de crédito emitida', 'La nota de crédito se generó en modo mock con trazabilidad local.', 'success', 'receipt-check');
            break;
        case 'save-tip-settings':
            state.desktopWorkbench.tips.savedAt = new Date().toISOString();
            pushToast('Configuración guardada', `Reparto ${state.desktopWorkbench.tips.distributionMode} con propina ${state.desktopWorkbench.tips.tipMode}.`, 'success', 'check-circle');
            render();
            break;
        case 'set-tip-mode':
            state.desktopWorkbench.tips.tipMode = actionTrigger.dataset.tipMode || 'Incluida en pago';
            render();
            break;
        case 'dummy-click':
            showToast({
                title: 'Módulo no disponible',
                message: `El módulo "${actionTrigger.dataset.module}" es ficticio en esta implementación.`,
                tone: 'info',
            });
            break;
        default:
            break;
    }
}

function handleInput(event) {
    if (event.target.id === 'salonSearch') {
        state.filters.salon.search = event.target.value;
        render();
    }

    if (event.target.id === 'deliverySearch') {
        state.filters.delivery.search = event.target.value;
        render();
    }

    if (event.target.id === 'takeawaySearch') {
        state.filters.takeaway.search = event.target.value;
        render();
    }

    if (event.target.id === 'drawerProductSearch') {
        state.orderDrawer.search = event.target.value;
        render();
    }
}

function handleChange(event) {
    if (event.target.id === 'themeToggle') {
        state.theme = event.target.checked ? 'dark' : 'light';
        refs.body.dataset.theme = state.theme;
        render();
        return;
    }

    if (event.target.name === 'tableIsTakeaway') {
        updateTableServiceType(event.target.dataset.tableId, event.target.checked ? 'takeaway' : 'salon');
        return;
    }

    if (event.target.name === 'tableTakeawayChannel') {
        updateTableTakeawayChannel(event.target.dataset.tableId, event.target.value);
        return;
    }

    if (event.target.name === 'tableDocumentType') {
        updateTableDocumentType(event.target.dataset.tableId, event.target.value);
        return;
    }

    if (event.target.name === 'deliveryPaymentMethod') {
        updateDeliveryPaymentMethod(event.target.dataset.deliveryId, event.target.value);
        return;
    }

    if (event.target.name === 'deliveryDocumentType') {
        updateDeliveryDocumentType(event.target.dataset.deliveryId, event.target.value);
        return;
    }

    if (event.target.name === 'deliveryCustomerDocument') {
        updateDeliveryFiscalField(event.target.dataset.deliveryId, 'customerDocument', event.target.value);
        return;
    }

    if (event.target.name === 'deliveryBusinessName') {
        updateDeliveryFiscalField(event.target.dataset.deliveryId, 'businessName', event.target.value);
        return;
    }

    if (event.target.name === 'takeawayPaymentMethod') {
        updateTakeawayPaymentMethod(event.target.dataset.takeawayId, event.target.value);
        return;
    }

    if (event.target.name === 'takeawayDocumentType') {
        updateTakeawayDocumentType(event.target.dataset.takeawayId, event.target.value);
        return;
    }

    if (event.target.name === 'takeawayCustomerDocument') {
        updateTakeawayFiscalField(event.target.dataset.takeawayId, 'customerDocument', event.target.value);
        return;
    }

    if (event.target.name === 'takeawayBusinessName') {
        updateTakeawayFiscalField(event.target.dataset.takeawayId, 'businessName', event.target.value);
        return;
    }

    if (state.activeModal?.type === 'split-payment' && event.target.name === 'splitCount') {
        state.activeModal = {
            ...state.activeModal,
            form: {
                ...state.activeModal.form,
                splitCount: Math.max(2, Math.min(6, Number(event.target.value) || 2)),
                splits: buildSplitDrafts(state.activeModal.total, Number(event.target.value) || 2),
            },
        };
        render();
    }
}

function handleKeydown(event) {
    if (event.key === 'Escape') {
        if (state.onboarding.open) {
            completeOnboarding(true);
            return;
        }
        if (state.activeModal) {
            closeModal();
            return;
        }
        if (state.orderDrawer.open) {
            closeDrawer();
            return;
        }
        if (state.sidebarOpen) {
            state.sidebarOpen = false;
            render();
        }
    }

    const tableCard = event.target.closest('[data-select-table]');
    if (tableCard && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        state.selectedIds.salon = tableCard.dataset.selectTable;
        state.salonOperationsExpanded = false;
        ensureDesktopSalonContext(tableCard.dataset.selectTable);
        render();
    }

    const deliveryCard = event.target.closest('[data-select-delivery]');
    if (deliveryCard && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        state.selectedIds.delivery = deliveryCard.dataset.selectDelivery;
        render();
    }

    const takeawayCard = event.target.closest('[data-select-takeaway]');
    if (takeawayCard && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        state.selectedIds.takeaway = takeawayCard.dataset.selectTakeaway;
        render();
    }
}

async function handleSubmit(event) {
    if (event.target.id === 'tableForm') {
        event.preventDefault();
        await submitTableForm(new FormData(event.target));
        return;
    }

    if (event.target.id === 'moveOrderForm') {
        event.preventDefault();
        submitMoveOrderForm(new FormData(event.target));
        return;
    }

    if (event.target.id === 'paymentForm') {
        event.preventDefault();
        submitPaymentForm(new FormData(event.target));
        return;
    }

    if (event.target.id === 'splitPaymentForm') {
        event.preventDefault();
        submitSplitPaymentForm(new FormData(event.target));
        return;
    }

    if (event.target.id === 'forceReleaseForm') {
        event.preventDefault();
        submitForceReleaseForm(new FormData(event.target));
    }
}

function openCreateModal() {
    state.activeModal = {
        type: 'create',
        form: { number: '', zone: state.zones[0], description: '', imageAsset: null },
        zones: state.zones,
        errors: {},
    };
    render();
}

function openEditModal(tableId) {
    const table = getTableById(tableId);
    if (!table) return;
    state.activeModal = {
        type: 'edit',
        tableId,
        form: {
            number: table.number,
            zone: table.zone,
            description: table.description,
            status: table.status,
            imageAsset: table.imageAsset || null,
        },
        zones: state.zones,
        errors: {},
    };
    render();
}

function openAssignModal(tableId) {
    const table = getTableById(tableId);
    if (!table) return;
    state.activeModal = {
        type: 'assign',
        tableId,
        tableNumber: table.number,
        form: { waiterId: table.waiterId || '' },
        errors: {},
    };
    render();
}

function openReleaseModal(tableId) {
    const table = getTableById(tableId);
    if (!table) return;
    const itemsCount = getTableItemsCount(table);
    state.activeModal = itemsCount
        ? {
            type: 'confirm',
            title: `No se puede liberar la mesa ${table.number}`,
            message: 'La mesa aún tiene items activos en el pedido actual.',
            note: 'Retira, factura o mueve el pedido antes de marcarla como libre.',
            confirmLabel: 'Entendido',
            confirmVariant: 'btn--secondary',
            onConfirm: 'close-only',
            tone: 'warning',
        }
        : {
            type: 'confirm',
            tableId,
            title: `¿Liberar mesa ${table.number}?`,
            message: 'La mesa quedará disponible para una nueva atención.',
            confirmLabel: 'Sí, liberar',
            confirmVariant: 'btn--primary',
            onConfirm: 'release-table',
            tone: 'warning',
        };
    render();
}

function openForceReleaseModal(tableId) {
    const table = getTableById(tableId);
    if (!table) return;
    state.activeModal = {
        type: 'force-release',
        tableId,
        form: {
            confirmWaiter: false,
            confirmSupervisor: false,
            overridePassword: '',
        },
        errors: {},
    };
    render();
}

function openDeleteModal(tableId) {
    const table = getTableById(tableId);
    if (!table) return;
    state.activeModal = {
        type: 'confirm',
        tableId,
        title: `¿Eliminar mesa ${table.number}?`,
        message: 'Esta acción es destructiva y no se puede deshacer.',
        note: 'Usa esta opción solo si la mesa fue creada por error.',
        confirmLabel: 'Sí, eliminar',
        confirmVariant: 'btn--danger',
        onConfirm: 'delete-table',
        tone: 'danger',
    };
    render();
}

function openMoveModal(tableId) {
    const table = getTableById(tableId);
    if (!table) return;
    state.activeModal = {
        type: 'move',
        tableId,
        errors: {},
    };
    render();
}

function openRegisterPaymentModal(tableId) {
    const table = getTableById(tableId);
    if (!table || !getTableItemsCount(table)) return;
    ensureTableOrderShape(table);
    const { total } = getOrderDetails(table, state.products);
    state.activeModal = {
        type: 'payment',
        tableId,
        total,
        form: {
            amountReceived: total,
            paymentMethod: table.order.paymentMethod || '',
            documentType: table.order.documentType || 'boleta',
            customerDocument: table.order.customerDocument || '',
            businessName: table.order.businessName || '',
        },
        errors: {},
    };
    render();
}

function openSplitBillModal(tableId) {
    const table = getTableById(tableId);
    if (!table || !getTableItemsCount(table)) return;
    ensureTableOrderShape(table);
    const { total } = getOrderDetails(table, state.products);
    const splitCount = 2;
    state.activeModal = {
        type: 'split-payment',
        tableId,
        total,
        form: {
            splitCount,
            documentType: table.order.documentType || 'boleta',
            customerDocument: table.order.customerDocument || '',
            businessName: table.order.businessName || '',
            splits: buildSplitDrafts(total, splitCount),
        },
        errors: {},
    };
    render();
}

function openOrder(tableId, tab) {
    const table = getTableById(tableId);
    if (!table) return;
    state.selectedIds.salon = tableId;
    ensureDesktopSalonContext(tableId);
    state.orderDrawer = {
        open: true,
        tableId,
        tab,
        search: '',
        category: 'all',
        inlineFeedback: null,
        scrollTop: 0,
    };
    render();
}

function closeModal() {
    state.activeModal = null;
    render();
}

function closeDrawer() {
    closeDrawerSilently();
    render();
}

function closeDrawerSilently() {
    window.clearTimeout(pendingInlineFeedbackTimer);
    state.orderDrawer = {
        open: false,
        tableId: null,
        tab: 'add',
        search: '',
        category: 'all',
        inlineFeedback: null,
        scrollTop: 0,
    };
}

function setOrderInlineFeedback(message, tone = 'success') {
    if (!state.orderDrawer.open) return;
    window.clearTimeout(pendingInlineFeedbackTimer);
    state.orderDrawer.inlineFeedback = { message, tone };
    pendingInlineFeedbackTimer = window.setTimeout(() => {
        if (state.orderDrawer.inlineFeedback?.message === message) {
            state.orderDrawer.inlineFeedback = null;
            render();
        }
    }, 1100);
}

async function submitTableForm(formData) {
    if (!state.activeModal) return;

    if (state.activeModal.type === 'assign') {
        const table = getTableById(state.activeModal.tableId);
        if (!table) return;
        table.waiterId = formData.get('waiterId') || null;
        pushToast('Mesero actualizado', `Mesa ${table.number} actualizada correctamente.`, 'info', 'user-plus');
        persistOperationalData();
        closeModal();
        return;
    }

    const payload = {
        number: String(formData.get('number') || '').trim(),
        zone: String(formData.get('zone') || '').trim(),
        description: String(formData.get('description') || '').trim(),
        status: String(formData.get('status') || 'libre').trim(),
        imageAsset: state.activeModal.form?.imageAsset || null,
    };

    const imageFile = formData.get('tableImageFile');
    if (imageFile instanceof File && imageFile.size > 0) {
        try {
            payload.imageAsset = await convertImageFileToWebpAsset(imageFile, `mesa-${payload.number || 'nueva'}`);
        } catch (error) {
            console.warn('Error al convertir imagen de mesa a WEBP', error);
            state.activeModal = {
                ...state.activeModal,
                form: payload,
                errors: { ...state.activeModal.errors, imageAsset: 'No se pudo procesar la imagen. Usa otro archivo.' },
            };
            render();
            return;
        }
    }

    const errors = validateTablePayload(payload, state.activeModal.tableId);
    if (Object.keys(errors).length) {
        state.activeModal = { ...state.activeModal, form: payload, errors };
        render();
        return;
    }

    if (state.activeModal.type === 'create') {
        const newTable = {
            id: `table-${Date.now()}`,
            number: payload.number,
            zone: payload.zone,
            description: payload.description,
            status: 'libre',
            waiterId: null,
            order: createEmptyTableOrder(),
            imageAsset: payload.imageAsset,
        };
        state.tables.push(newTable);
        state.selectedIds.salon = newTable.id;
        pushToast('Mesa creada', `Mesa ${newTable.number} registrada correctamente.`, 'success', 'check-circle');
    }

    if (state.activeModal.type === 'edit') {
        const table = getTableById(state.activeModal.tableId);
        if (!table) return;
        table.number = payload.number;
        table.zone = payload.zone;
        table.description = payload.description;
        table.status = payload.status;
        table.imageAsset = payload.imageAsset;
        if (payload.status === 'libre' && getTableItemsCount(table) === 0) {
            table.order.sentToKitchen = false;
        }
        pushToast('Mesa actualizada', `Mesa ${table.number} actualizada correctamente.`, 'success', 'check-circle');
    }

    persistOperationalData();
    closeModal();
}

function validateTablePayload(payload, tableId) {
    const errors = {};
    if (!payload.number) errors.number = 'El número de mesa es obligatorio.';
    if (!payload.zone) errors.zone = 'Selecciona una zona válida.';
    if (!payload.description) errors.description = 'La descripción es obligatoria.';

    const targetTable = tableId ? getTableById(tableId) : null;
    if (targetTable && payload.status === 'libre' && getTableItemsCount(targetTable) > 0) {
        errors.status = 'No puedes marcar la mesa como libre mientras tenga un pedido activo.';
    }

    const duplicated = state.tables.some(
        (table) => table.number.toLowerCase() === payload.number.toLowerCase() && table.id !== tableId,
    );
    if (duplicated) errors.number = 'Ese número de mesa ya existe.';
    return errors;
}

function confirmModal() {
    if (!state.activeModal) return;
    switch (state.activeModal.onConfirm) {
        case 'release-table':
            releaseTable(state.activeModal.tableId);
            break;
        case 'delete-table':
            deleteTable(state.activeModal.tableId);
            break;
        default:
            closeModal();
            break;
    }
}

function submitForceReleaseForm(formData) {
    if (state.activeModal?.type !== 'force-release') return;

    const payload = {
        confirmWaiter: formData.get('confirmWaiter') === 'on',
        confirmSupervisor: formData.get('confirmSupervisor') === 'on',
        overridePassword: String(formData.get('overridePassword') || '').trim(),
    };
    const errors = {};

    if (!payload.confirmWaiter) errors.confirmWaiter = 'Debes confirmar con el mesero asignado.';
    if (!payload.confirmSupervisor) errors.confirmSupervisor = 'Debes confirmar autorización del supervisor.';
    if (payload.overridePassword !== '12345') errors.overridePassword = 'La contraseña final no coincide.';

    if (Object.keys(errors).length) {
        state.activeModal = {
            ...state.activeModal,
            form: payload,
            errors,
        };
        render();
        return;
    }

    releaseTable(state.activeModal.tableId, { forced: true });
}

function releaseTable(tableId, { forced = false } = {}) {
    const table = getTableById(tableId);
    if (!table) return;

    if (forced) {
        const journey = desktopTableJourneys[tableId];
        if (journey) {
            journey.rounds = [];
            journey.totalAccumulated = 0;
            journey.bill = { subtotal: 0, igv: 0, total: 0, pendingKitchenNote: '' };
            journey.paymentDraft = { tipRate: 0, documentType: 'boleta', method: 'efectivo', amount: 0, discountCode: '', proof: null };
        }
    }

    table.status = 'libre';
    table.order = createEmptyTableOrder();
    pushToast(forced ? 'Mesa liberada forzosamente' : 'Mesa liberada', `Mesa ${table.number} lista para una nueva atención.`, forced ? 'warning' : 'success', forced ? 'alert' : 'check-circle');
    persistOperationalData();
    closeModal();
}

function setActiveSalonRound(tableId, roundId) {
    if (!tableId || !roundId) return;
    state.selectedIds.salon = tableId;
    ensureDesktopSalonContext(tableId);
    state.desktopWorkbench.salon.roundId = roundId;
    render();
}

function calculateDesktopChargeAmount(total, tipRate) {
    const baseTotal = roundCurrency(total || 0);
    const tipAmount = roundCurrency(baseTotal * ((Number(tipRate) || 0) / 100));
    return roundCurrency(baseTotal + tipAmount);
}

function setDesktopTipRate(tableId, tipRate) {
    const journey = desktopTableJourneys[tableId];
    if (!journey) return;
    journey.paymentDraft.tipRate = tipRate;
    journey.paymentDraft.amount = calculateDesktopChargeAmount(journey.bill?.total || journey.totalAccumulated || 0, tipRate);
    render();
}

function setDesktopPaymentMethod(tableId, methodId) {
    const journey = desktopTableJourneys[tableId];
    const table = getTableById(tableId);
    if (!journey || !table) return;

    const methodMeta = desktopPaymentMethods.find((method) => method.id === methodId);
    if (!methodMeta) return;

    journey.paymentDraft.method = methodId;
    if (!methodMeta.requiresProof) {
        journey.paymentDraft.proof = null;
        state.desktopWorkbench.payments.pendingProofDraft = null;
    }

    const normalizedPaymentMethod = methodId === 'yape' || methodId === 'plin' ? 'yape-plin' : methodId;
    table.order.paymentMethod = normalizedPaymentMethod;
    table.order.paymentLabel = methodMeta.label;
    persistOperationalData();
    render();
}

function attachDesktopPaymentProof(tableId) {
    const journey = desktopTableJourneys[tableId];
    if (!journey) return;

    const methodId = journey.paymentDraft.method;
    const methodMeta = desktopPaymentMethods.find((method) => method.id === methodId);
    if (!methodMeta?.requiresProof) {
        showOperationalBlocker('No requiere prueba', 'El método seleccionado no exige adjuntar evidencia.', 'Solo Yape, Plin y Transferencia generan comprobante visual en este flujo mock.');
        return;
    }

    const proofTemplate = desktopDeliveryWorkspace.proofTemplates.find((proof) => proof.method === methodId)
        || {
            id: `proof-${Date.now()}`,
            method: methodId,
            fileName: `${methodId}-${tableId}.webp`,
            mimeType: 'image/webp',
            sizeKb: 180,
        };

    journey.paymentDraft.proof = { ...proofTemplate, attachedAt: new Date().toISOString() };
    state.desktopWorkbench.payments.pendingProofDraft = journey.paymentDraft.proof;
    pushToast('Prueba adjunta', `${proofTemplate.fileName} quedó lista en formato WEBP para persistencia mock.`, 'success', 'download');
    render();
}

function toggleCreditNoteItem(itemId) {
    if (!itemId) return;
    const selectedIds = state.desktopWorkbench.creditNotes.selectedItemIds;
    const exists = selectedIds.includes(itemId);
    state.desktopWorkbench.creditNotes.selectedItemIds = exists
        ? selectedIds.filter((entry) => entry !== itemId)
        : [...selectedIds, itemId];
    render();
}

function deleteTable(tableId) {
    const table = getTableById(tableId);
    if (!table) return;
    state.tables = state.tables.filter((entry) => entry.id !== tableId);
    state.selectedIds.salon = state.tables[0]?.id || null;
    if (state.orderDrawer.tableId === tableId) closeDrawerSilently();
    pushToast('Mesa eliminada', `Mesa ${table.number} eliminada del módulo.`, 'danger', 'trash');
    persistOperationalData();
    closeModal();
}

function submitMoveOrderForm(formData) {
    const targetTableId = String(formData.get('targetTableId') || '').trim();
    if (!targetTableId) {
        state.activeModal = { ...state.activeModal, errors: { targetTableId: 'Selecciona una mesa destino.' } };
        render();
        return;
    }

    const sourceTable = getTableById(state.activeModal?.tableId);
    const targetTable = getTableById(targetTableId);
    if (!sourceTable || !targetTable) return;

    ensureTableOrderShape(sourceTable);
    ensureTableOrderShape(targetTable);

    if (getTableItemsCount(targetTable) > 0 || targetTable.status === 'reservada') {
        state.activeModal = {
            ...state.activeModal,
            errors: { targetTableId: 'Solo puedes mover el pedido a una mesa libre y sin consumo activo.' },
        };
        render();
        return;
    }

    sourceTable.order.items.forEach((item) => {
        const existing = targetTable.order.items.find((entry) => entry.productId === item.productId);
        if (existing) existing.quantity += item.quantity;
        else targetTable.order.items.push({ ...item });
    });
    targetTable.order.sentToKitchen = false;
    targetTable.status = 'ocupada';
    if (!targetTable.waiterId) targetTable.waiterId = sourceTable.waiterId;

    if (sourceTable.order.serviceType === 'takeaway') {
        targetTable.order.serviceType = 'takeaway';
        targetTable.order.takeawayChannel = sourceTable.order.takeawayChannel;
        targetTable.order.packagingFeeRate = sourceTable.order.packagingFeeRate;
        targetTable.order.linkedTakeawayId = sourceTable.order.linkedTakeawayId;
        targetTable.order.syncedAt = sourceTable.order.syncedAt;
    }

    targetTable.order.documentType = sourceTable.order.documentType;
    targetTable.order.documentIssued = sourceTable.order.documentIssued;
    targetTable.order.paymentConfirmed = sourceTable.order.paymentConfirmed;
    targetTable.order.paymentMethod = sourceTable.order.paymentMethod;
    targetTable.order.paymentLabel = sourceTable.order.paymentLabel;
    targetTable.order.customerDocument = sourceTable.order.customerDocument;
    targetTable.order.businessName = sourceTable.order.businessName;
    targetTable.order.paymentBreakdown = structuredClone(sourceTable.order.paymentBreakdown || []);

    sourceTable.order = createEmptyTableOrder();
    sourceTable.status = 'libre';

    state.selectedIds.salon = targetTable.id;
    state.orderDrawer = { ...state.orderDrawer, tableId: targetTable.id, tab: 'order' };
    pushToast('Cuenta trasladada', `La cuenta se trasladó a la mesa ${targetTable.number}.`, 'info', 'move');
    persistOperationalData();
    closeModal();
}

function addProductToCurrentTable(productId) {
    const table = getTableById(state.orderDrawer.tableId);
    const product = state.products.find((entry) => entry.id === productId);
    if (!table || !product) return;

    ensureTableOrderShape(table);

    const current = table.order.items.find((item) => item.productId === productId);
    if (current) current.quantity += 1;
    else table.order.items.push({ productId, quantity: 1 });
    table.status = 'ocupada';
    setOrderInlineFeedback(`${product.name} agregado`, 'success');
    persistOperationalData();
    render();
}

function changeProductQuantity(productId, amount) {
    const table = getTableById(state.orderDrawer.tableId);
    if (!table) return;
    ensureTableOrderShape(table);
    const line = table.order.items.find((item) => item.productId === productId);
    if (!line) return;
    line.quantity += amount;
    if (line.quantity <= 0) table.order.items = table.order.items.filter((item) => item.productId !== productId);
    else setOrderInlineFeedback('Cantidad actualizada', 'info');
    persistOperationalData();
    render();
}

function removeProduct(productId) {
    const table = getTableById(state.orderDrawer.tableId);
    if (!table) return;
    ensureTableOrderShape(table);
    table.order.items = table.order.items.filter((item) => item.productId !== productId);
    setOrderInlineFeedback('Producto retirado', 'info');
    persistOperationalData();
    render();
}

function sendKitchen(tableId) {
    const table = getTableById(tableId);
    if (!table || !getTableItemsCount(table)) return;
    ensureTableOrderShape(table);
    table.order.sentToKitchen = true;
    pushToast('Pedido enviado', `Mesa ${table.number} enviada a cocina.`, 'success', 'send');
    persistOperationalData();
    render();
}

function invoiceOrder(tableId) {
    openRegisterPaymentModal(tableId);
}

function splitBill(tableId) {
    openSplitBillModal(tableId);
}

function submitPaymentForm(formData) {
    const table = getTableById(state.activeModal?.tableId);
    if (!table) return;
    ensureTableOrderShape(table);
    const { total } = getOrderDetails(table, state.products);

    const documentType = String(formData.get('documentType') || 'boleta').trim();
    const paymentMethod = normalizePaymentMethod(formData.get('paymentMethod'));
    const amountReceived = roundCurrency(formData.get('amountReceived'));
    const customerDocument = String(formData.get('customerDocument') || '').trim();
    const businessName = String(formData.get('businessName') || '').trim();
    const errors = {};

    if (!paymentMethod) errors.paymentMethod = 'Selecciona un método de pago.';
    if (!Number.isFinite(amountReceived) || amountReceived < total) errors.amountReceived = `El abono debe cubrir al menos ${formatCurrency(total)}.`;
    if (documentType === 'factura' && !hasInvoiceFiscalData({ customerDocument, businessName })) {
        errors.customerDocument = 'La factura necesita RUC válido y razón social.';
    }

    if (Object.keys(errors).length) {
        state.activeModal = {
            ...state.activeModal,
            form: { amountReceived, paymentMethod, documentType, customerDocument, businessName },
            errors,
        };
        render();
        return;
    }

    const paymentLabel = getPaymentMethodLabel(paymentMethod);
    table.lastSettlement = {
        type: 'single',
        registeredAt: new Date().toISOString(),
        total,
        documentType,
        paymentMethod,
        paymentLabel,
        payments: [{ payer: 'Titular', amount: total, paymentMethod, paymentLabel }],
    };

    if (table.order.serviceType === 'takeaway' && table.order.linkedTakeawayId) {
        const takeawayOrder = getTakeawayById(table.order.linkedTakeawayId);
        if (takeawayOrder) {
            takeawayOrder.documentType = documentType;
            takeawayOrder.documentIssued = true;
            takeawayOrder.paymentConfirmed = true;
            takeawayOrder.paymentMethod = paymentMethod;
            takeawayOrder.paymentLabel = paymentLabel;
            takeawayOrder.customerDocument = customerDocument;
            takeawayOrder.businessName = businessName;
            takeawayOrder.timeline = ensureTimeline(takeawayOrder.timeline, takeawayOrder.status);
            takeawayOrder.note = `${takeawayOrder.note || ''} · Pago registrado desde mesa ${table.number}.`.trim().replace(/^·\s*/, '');
        }
    }

    table.order = createEmptyTableOrder();
    table.status = 'libre';
    state.activeModal = null;
    closeDrawerSilently();
    pushToast('Pago registrado', `${getDocumentTypeLabel(documentType)} por ${formatCurrency(total)} vía ${paymentLabel} en mesa ${table.number}.`, 'success', 'wallet');
    persistOperationalData();
    render();
}

function submitSplitPaymentForm(formData) {
    const table = getTableById(state.activeModal?.tableId);
    if (!table || !state.activeModal) return;
    ensureTableOrderShape(table);
    const { total } = getOrderDetails(table, state.products);
    const splitCount = Math.max(2, Math.min(6, Number(formData.get('splitCount')) || state.activeModal.form.splitCount || 2));
    const documentType = String(formData.get('documentType') || 'boleta').trim();
    const customerDocument = String(formData.get('customerDocument') || '').trim();
    const businessName = String(formData.get('businessName') || '').trim();

    const splits = Array.from({ length: splitCount }, (_, index) => ({
        payer: String(formData.get(`payer-${index}`) || `Cliente ${index + 1}`).trim(),
        amount: roundCurrency(formData.get(`amount-${index}`)),
        paymentMethod: normalizePaymentMethod(formData.get(`method-${index}`)),
    }));

    const errors = {};
    if (documentType === 'factura' && !hasInvoiceFiscalData({ customerDocument, businessName })) {
        errors.customerDocument = 'La factura necesita RUC válido y razón social.';
    }

    splits.forEach((split, index) => {
        if (!split.paymentMethod) errors[`method-${index}`] = 'Selecciona el tipo de pago.';
        if (!Number.isFinite(split.amount) || split.amount <= 0) errors[`amount-${index}`] = 'Ingresa un abono válido.';
    });

    const splitTotal = roundCurrency(splits.reduce((acc, split) => acc + split.amount, 0));
    if (splitTotal !== roundCurrency(total)) {
        errors.splitTotal = `La suma de cuotas debe ser ${formatCurrency(total)}.`;
    }

    if (Object.keys(errors).length) {
        state.activeModal = {
            ...state.activeModal,
            form: {
                splitCount,
                documentType,
                customerDocument,
                businessName,
                splits,
            },
            errors,
        };
        render();
        return;
    }

    const payments = splits.map((split) => ({
        ...split,
        paymentLabel: getPaymentMethodLabel(split.paymentMethod),
    }));

    table.lastSettlement = {
        type: 'split',
        registeredAt: new Date().toISOString(),
        total,
        documentType,
        paymentLabel: `Mixto · ${splitCount} cuotas`,
        payments,
    };

    if (table.order.serviceType === 'takeaway' && table.order.linkedTakeawayId) {
        const takeawayOrder = getTakeawayById(table.order.linkedTakeawayId);
        if (takeawayOrder) {
            takeawayOrder.documentType = documentType;
            takeawayOrder.documentIssued = true;
            takeawayOrder.paymentConfirmed = true;
            takeawayOrder.paymentMethod = '';
            takeawayOrder.paymentLabel = `Mixto · ${splitCount} cuotas`;
            takeawayOrder.customerDocument = customerDocument;
            takeawayOrder.businessName = businessName;
            takeawayOrder.timeline = ensureTimeline(takeawayOrder.timeline, takeawayOrder.status);
            takeawayOrder.note = `${takeawayOrder.note || ''} · Cuenta dividida desde mesa ${table.number}.`.trim().replace(/^·\s*/, '');
        }
    }

    table.order = createEmptyTableOrder();
    table.status = 'libre';
    state.activeModal = null;
    closeDrawerSilently();
    pushToast('Cuenta dividida', `${splitCount} cuotas registradas por ${formatCurrency(total)} en mesa ${table.number}.`, 'success', 'split');
    persistOperationalData();
    render();
}

function advanceDelivery(deliveryId) {
    const order = getDeliveryById(deliveryId);
    if (!order) return;
    const currentIndex = deliveryStatusFlow.indexOf(order.status);
    if (currentIndex < 0 || currentIndex === deliveryStatusFlow.length - 1) return;
    const nextStatus = deliveryStatusFlow[currentIndex + 1];

    if (nextStatus === 'entregado' && !canCloseOperationalOrder(order)) {
        showOperationalBlocker(
            `No se puede cerrar ${order.code}`,
            'Antes de marcar el delivery como entregado debes confirmar pago y emitir boleta o factura.',
            'Referencia SUNAT: la factura requiere RUC válido y razón social, mientras que la boleta exige comprobante emitido antes del cierre.',
        );
        return;
    }

    order.status = nextStatus;
    order.timeline = ensureTimeline(order.timeline, nextStatus);
    pushToast('Delivery actualizado', `${order.code} pasó a ${order.status.replaceAll('-', ' ')}.`, 'success', 'route');
    persistOperationalData();
    render();
}

function advanceTakeaway(takeawayId) {
    const order = getTakeawayById(takeawayId);
    if (!order) return;
    const currentIndex = takeawayStatusFlow.indexOf(order.status);
    if (currentIndex < 0 || currentIndex === takeawayStatusFlow.length - 1) return;
    const nextStatus = takeawayStatusFlow[currentIndex + 1];

    if (nextStatus === 'entregado' && !canCloseOperationalOrder(order)) {
        showOperationalBlocker(
            `No se puede entregar ${order.code}`,
            'Antes de completar el recojo debes confirmar pago y emitir el comprobante correspondiente.',
            'El flujo exige trazabilidad mínima: pedido registrado, comprobante emitido y pago confirmado antes de entregar.',
        );
        return;
    }

    order.status = nextStatus;
    order.timeline = ensureTimeline(order.timeline, nextStatus);
    pushToast('Para llevar actualizado', `${order.code} pasó a ${order.status.replaceAll('-', ' ')}.`, 'success', 'bag');
    persistOperationalData();
    render();
}

function issueDeliveryDocument(deliveryId) {
    const order = getDeliveryById(deliveryId);
    if (!order) return;

    if (order.documentIssued) {
        pushToast('Comprobante ya emitido', `${order.code} ya tiene ${order.documentType}.`, 'info', 'receipt-check');
        return;
    }

    if (order.documentType === 'factura' && !hasInvoiceFiscalData(order)) {
        showOperationalBlocker(
            `Factura incompleta en ${order.code}`,
            'Para emitir factura debes contar con RUC válido y razón social del cliente.',
            'Referencia SUNAT: la factura electrónica requiere identificación tributaria completa antes de emitir el comprobante.',
        );
        return;
    }

    order.documentIssued = true;
    pushToast('Comprobante emitido', `${order.code} ya cuenta con ${order.documentType}.`, 'success', 'receipt-check');
    persistOperationalData();
    render();
}

function confirmDeliveryPayment(deliveryId) {
    const order = getDeliveryById(deliveryId);
    if (!order) return;
    order.paymentConfirmed = true;
    pushToast('Pago confirmado', `${order.code} quedó validado para cierre operativo.`, 'success', 'wallet');
    persistOperationalData();
    render();
}

function issueTakeawayDocument(takeawayId) {
    const order = getTakeawayById(takeawayId);
    if (!order) return;

    if (order.documentIssued) {
        pushToast('Comprobante ya emitido', `${order.code} ya tiene ${order.documentType}.`, 'info', 'receipt-check');
        return;
    }

    if (order.documentType === 'factura' && !hasInvoiceFiscalData(order)) {
        showOperationalBlocker(
            `Factura incompleta en ${order.code}`,
            'El pedido para llevar necesita RUC y razón social antes de emitir factura.',
            'Puedes continuar con boleta si el cliente no requiere factura.',
        );
        return;
    }

    order.documentIssued = true;
    pushToast('Boleta/Factura emitida', `${order.code} ya quedó documentado para recojo.`, 'success', 'receipt-check');
    persistOperationalData();
    render();
}

function confirmTakeawayPayment(takeawayId) {
    const order = getTakeawayById(takeawayId);
    if (!order) return;
    order.paymentConfirmed = true;
    pushToast('Pago confirmado', `${order.code} quedó listo para continuar el flujo.`, 'success', 'wallet');
    persistOperationalData();
    render();
}

function updateTableServiceType(tableId, serviceType) {
    const table = getTableById(tableId);
    if (!table) return;
    ensureTableOrderShape(table);
    table.order.serviceType = serviceType;
    table.order.takeawayChannel = table.order.takeawayChannel || 'Salon';
    table.order.packagingFeeRate = serviceType === 'takeaway' && shouldApplyPackagingFee(table.order.takeawayChannel) ? TAKEAWAY_PACKAGING_RATE : 0;
    if (serviceType === 'salon') {
        table.order.documentType = 'boleta';
        table.order.linkedTakeawayId = null;
        table.order.syncedAt = null;
        table.order.documentIssued = false;
        table.order.paymentConfirmed = false;
    }
    persistOperationalData();
    render();
}

function updateTableTakeawayChannel(tableId, channel) {
    const table = getTableById(tableId);
    if (!table) return;
    ensureTableOrderShape(table);
    table.order.takeawayChannel = channel || 'Salon';
    table.order.packagingFeeRate = table.order.serviceType === 'takeaway' && shouldApplyPackagingFee(table.order.takeawayChannel) ? TAKEAWAY_PACKAGING_RATE : 0;
    persistOperationalData();
    render();
}

function updateTableDocumentType(tableId, documentType) {
    const table = getTableById(tableId);
    if (!table) return;
    ensureTableOrderShape(table);
    if (table.order.documentIssued) return;
    table.order.documentType = documentType || 'boleta';
    persistOperationalData();
    render();
}

function updateDeliveryDocumentType(deliveryId, documentType) {
    const order = getDeliveryById(deliveryId);
    if (!order || order.documentIssued) return;
    order.documentType = documentType || 'boleta';
    persistOperationalData();
    render();
}

function updateDeliveryPaymentMethod(deliveryId, paymentMethod) {
    const order = getDeliveryById(deliveryId);
    if (!order || order.paymentConfirmed) return;
    order.paymentMethod = normalizePaymentMethod(paymentMethod);
    order.paymentLabel = getPaymentMethodLabel(order.paymentMethod, 'Pendiente');
    persistOperationalData();
    render();
}

function updateDeliveryFiscalField(deliveryId, field, value) {
    const order = getDeliveryById(deliveryId);
    if (!order) return;
    order[field] = String(value || '').trim();
    persistOperationalData();
    render();
}

function updateTakeawayDocumentType(takeawayId, documentType) {
    const order = getTakeawayById(takeawayId);
    if (!order || order.documentIssued) return;
    order.documentType = documentType || 'boleta';
    persistOperationalData();
    render();
}

function updateTakeawayPaymentMethod(takeawayId, paymentMethod) {
    const order = getTakeawayById(takeawayId);
    if (!order || order.paymentConfirmed) return;
    order.paymentMethod = normalizePaymentMethod(paymentMethod);
    order.paymentLabel = getPaymentMethodLabel(order.paymentMethod, 'Pendiente');
    persistOperationalData();
    render();
}

function updateTakeawayFiscalField(takeawayId, field, value) {
    const order = getTakeawayById(takeawayId);
    if (!order) return;
    order[field] = String(value || '').trim();
    persistOperationalData();
    render();
}

async function attachDeliveryPaymentProof(deliveryId) {
    const order = getDeliveryById(deliveryId);
    if (!order) return;
    const file = await pickImageFile();
    if (!file) return;
    const method = order.paymentMethod === 'transferencia' ? 'transferencia' : 'yape';
    let proof;
    try {
        proof = await convertImageFileToWebpAsset(file, `${deliveryId}-${method}`);
    } catch (error) {
        console.warn('Error al convertir prueba de delivery', error);
        pushToast('Error de imagen', 'No se pudo procesar la prueba de pago.', 'danger', 'alert');
        return;
    }
    proof.method = method;
    state.desktopWorkbench.payments.proofs = [
        ...state.desktopWorkbench.payments.proofs.filter((entry) => entry.method !== method),
        proof,
    ];
    pushToast('Prueba adjunta', `${proof.fileName} quedó registrada para ${order.code}.`, 'success', 'download');
    render();
}

async function attachTakeawayPaymentProof(takeawayId) {
    const order = getTakeawayById(takeawayId);
    if (!order) return;
    const file = await pickImageFile();
    if (!file) return;
    const method = order.paymentMethod === 'transferencia' ? 'transferencia' : 'yape';
    let proof;
    try {
        proof = await convertImageFileToWebpAsset(file, `${takeawayId}-${method}`);
    } catch (error) {
        console.warn('Error al convertir prueba de takeaway', error);
        pushToast('Error de imagen', 'No se pudo procesar la prueba de pago.', 'danger', 'alert');
        return;
    }
    proof.method = method;
    state.desktopWorkbench.payments.proofs = [
        ...state.desktopWorkbench.payments.proofs.filter((entry) => entry.method !== method),
        proof,
    ];
    pushToast('Prueba adjunta', `${proof.fileName} quedó registrada para ${order.code}.`, 'success', 'download');
    render();
}

function syncTableOrderToTakeaway(tableId) {
    const table = getTableById(tableId);
    if (!table) return;
    ensureTableOrderShape(table);

    if (table.order.serviceType !== 'takeaway') {
        showOperationalBlocker(
            `Mesa ${table.number} aún no es para llevar`,
            'Activa la opción “Para llevar” para registrar este pedido en la cola de recojo.',
            'El recargo del 10% solo aplica cuando el pedido se marca como para llevar desde salón o WhatsApp.',
        );
        return;
    }

    const itemsCount = getTableItemsCount(table);
    if (!itemsCount) {
        showOperationalBlocker(
            `Mesa ${table.number} sin productos`,
            'Necesitas al menos un item para registrar el pedido en la cola de para llevar.',
            'Primero agrega productos y luego sincroniza el pedido para llevar.',
        );
        return;
    }

    const orderTotals = getOrderDetails(table, state.products);
    const existingOrder = table.order.linkedTakeawayId ? getTakeawayById(table.order.linkedTakeawayId) : null;
    const promisedAt = existingOrder?.promisedAt || getPromisedTimeLabel(20);
    const payload = normalizeTakeawayOrder({
        ...(existingOrder || {}),
        id: existingOrder?.id || `takeaway-${Date.now()}`,
        code: existingOrder?.code || `TL-${String(Date.now()).slice(-3)}`,
        customer: existingOrder?.customer || `Mesa ${table.number}`,
        status: existingOrder?.status || 'recibido',
        promisedAt,
        minutesToPromise: existingOrder?.minutesToPromise ?? 20,
        channel: table.order.takeawayChannel,
        source: table.order.takeawayChannel,
        pickupCode: existingOrder?.pickupCode || `SAL-${table.number}`,
        phone: existingOrder?.phone || 'Cliente presencial',
        paymentMethod: table.order.paymentMethod || existingOrder?.paymentMethod || '',
        paymentLabel: table.order.paymentLabel || existingOrder?.paymentLabel || 'Pendiente en caja',
        itemsCount,
        baseTotal: orderTotals.baseTotal,
        total: orderTotals.total,
        documentType: table.order.documentType,
        documentIssued: table.order.documentIssued,
        paymentConfirmed: table.order.paymentConfirmed,
        customerDocument: table.order.customerDocument,
        businessName: table.order.businessName,
        packagingFeeRate: table.order.packagingFeeRate,
        packagingFeeAmount: orderTotals.surchargeTotal,
        linkedTableId: table.id,
        note: existingOrder?.note || `Sincronizado desde mesa ${table.number}.`,
    });

    if (existingOrder) Object.assign(existingOrder, payload);
    else state.takeawayOrders.unshift(payload);

    table.order.linkedTakeawayId = payload.id;
    table.order.syncedAt = new Date().toISOString();
    state.selectedIds.takeaway = payload.id;
    pushToast('Pedido para llevar sincronizado', `Mesa ${table.number} ya está visible en Para llevar con recargo logístico aplicado.`, 'success', 'bag');
    persistOperationalData();
    render();
}

function showOperationalBlocker(title, message, note) {
    state.activeModal = {
        type: 'confirm',
        title,
        message,
        note,
        confirmLabel: 'Entendido',
        confirmVariant: 'btn--secondary',
        onConfirm: 'close-only',
        tone: 'warning',
    };
    render();
}

function getTableById(tableId) {
    return state.tables.find((table) => table.id === tableId) || null;
}

function getDeliveryById(deliveryId) {
    return state.deliveryOrders.find((order) => order.id === deliveryId) || null;
}

function getTakeawayById(takeawayId) {
    return state.takeawayOrders.find((order) => order.id === takeawayId) || null;
}

function pushToast(title, message, tone = 'info', icon = 'info') {
    const id = `toast-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`;
    state.toasts.push({ id, title, message, tone, icon });
    render();
    window.setTimeout(() => {
        state.toasts = state.toasts.filter((toast) => toast.id !== id);
        render();
    }, 2600);
}

function openOnboarding() {
    state.onboarding.open = true;
    state.onboarding.step = 0;
    render();
}

function nextOnboardingStep() {
    state.onboarding.step = Math.min(state.onboarding.step + 1, 3);
    render();
}

function prevOnboardingStep() {
    state.onboarding.step = Math.max(state.onboarding.step - 1, 0);
    render();
}

function completeOnboarding(skipped = false) {
    state.onboarding.open = false;
    state.onboarding.completed = true;
    persistOnboardingState();
    if (!skipped) {
        pushToast('Guía completada', 'El sistema quedó listo para operar con la ayuda inicial aplicada.', 'success', 'check-circle');
    }
    render();
}

function setMode(mode) {
    if (!mode || state.mode === mode) {
        state.sidebarOpen = false;
        render();
        return;
    }

    state.mode = mode;
    state.sidebarOpen = false;
    state.salonOperationsExpanded = false;
    state.desktopWorkbench.activeArea = 'pedidos';
    if (mode !== 'salon') closeDrawerSilently();
    state.uiLoading = false;
    render();
}

function requestVisualRefresh(delay = 140) {
    window.clearTimeout(loadingTimer);
    state.uiLoading = true;
    render();
    loadingTimer = window.setTimeout(() => {
        state.uiLoading = false;
        render();
    }, delay);
}

function persistUiState() {
    if (state.theme !== lastPersistedTheme) {
        lastPersistedTheme = state.theme;
        queueStorageWrite(THEME_STORAGE_KEY, state.theme);
    }

    const uiSnapshot = JSON.stringify({
        mode: state.mode,
        filters: state.filters,
        selectedIds: state.selectedIds,
        panelsCollapsed: state.panelsCollapsed,
        hintsDismissed: state.hintsDismissed,
        desktopWorkbench: {
            activeArea: state.desktopWorkbench.activeArea,
            salon: state.desktopWorkbench.salon,
            delivery: state.desktopWorkbench.delivery,
            takeaway: state.desktopWorkbench.takeaway,
            courtesies: {
                activeType: state.desktopWorkbench.courtesies.activeType,
                selectedCourtesyId: state.desktopWorkbench.courtesies.selectedCourtesyId,
            },
            tips: {
                distributionMode: state.desktopWorkbench.tips.distributionMode,
                tipMode: state.desktopWorkbench.tips.tipMode,
            },
            creditNotes: {
                selectedDraftId: state.desktopWorkbench.creditNotes.selectedDraftId,
                motive: state.desktopWorkbench.creditNotes.motive,
                selectedItemIds: state.desktopWorkbench.creditNotes.selectedItemIds,
            },
        },
    });

    if (uiSnapshot === lastPersistedUiSnapshot) return;
    lastPersistedUiSnapshot = uiSnapshot;
    queueStorageWrite(UI_STORAGE_KEY, uiSnapshot);
}

function persistOperationalData() {
    const operationalSnapshot = JSON.stringify({
        tables: state.tables,
        deliveryOrders: state.deliveryOrders,
        takeawayOrders: state.takeawayOrders,
    });

    if (operationalSnapshot === lastPersistedOperationalSnapshot) return;
    lastPersistedOperationalSnapshot = operationalSnapshot;
    queueStorageWrite(DATA_STORAGE_KEY, operationalSnapshot);
}

function persistOnboardingState() {
    const onboardingSnapshot = JSON.stringify({
        completed: state.onboarding.completed,
    });

    if (onboardingSnapshot === lastPersistedOnboardingSnapshot) return;
    lastPersistedOnboardingSnapshot = onboardingSnapshot;
    queueStorageWrite(ONBOARDING_STORAGE_KEY, onboardingSnapshot);
}

function queueStorageWrite(key, value) {
    queuedStoragePayloads.set(key, value);
    if (queuedStorageTimer) return;

    queuedStorageTimer = window.setTimeout(() => {
        flushQueuedStorageWrites();
    }, 96);
}

function flushQueuedStorageWrites() {
    if (queuedStorageTimer) {
        window.clearTimeout(queuedStorageTimer);
        queuedStorageTimer = null;
    }

    queuedStoragePayloads.forEach((value, key) => {
        localStorage.setItem(key, value);
    });
    queuedStoragePayloads.clear();
}

function readStorage(key, fallback) {
    try {
        const rawValue = localStorage.getItem(key);
        return rawValue ? JSON.parse(rawValue) : fallback;
    } catch {
        return fallback;
    }
}

function getThemeColor() {
    if (state.theme === 'dark') return '#0f1220';
    if (state.mode === 'delivery') return '#2563eb';
    if (state.mode === 'takeaway') return '#0f766e';
    return '#de5a25';
}
