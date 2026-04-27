/** Se rellenan con Accesos / operadores (API), no datos de demostración. */
export const waiters = [];
export const couriers = [];
export const deliveryPartners = [];

export const zones = ['Interior', 'Terraza', 'Barra', 'VIP'];

export const statusOptions = [
    { value: 'libre', label: 'Libre' },
    { value: 'ocupada', label: 'Ocupada' },
    { value: 'reservada', label: 'Reservada' },
];

export const documentTypeOptions = [
    { value: 'boleta', label: 'Ticket' },
    { value: 'factura', label: 'Factura' },
];

export const paymentMethodOptions = [
    { value: 'yape', label: 'Yape' },
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'tarjeta', label: 'Tarjeta' },
    { value: 'transferencia', label: 'Transferencia' },
];

export const takeawaySourceOptions = [
    { value: 'Salon', label: 'Desde salón' },
    { value: 'WhatsApp', label: 'WhatsApp' },
];

export const TAKEAWAY_PACKAGING_RATE = 0.1;

export const deliveryStatusFlow = ['pendiente', 'preparando', 'listo-salir', 'en-ruta', 'entregado'];

export const takeawayStatusFlow = ['recibido', 'en-preparacion', 'listo-recoger', 'entregado'];

export const deliveryStatusOptions = [
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'preparando', label: 'Preparando' },
    { value: 'listo-salir', label: 'Listo para salir' },
    { value: 'en-ruta', label: 'En ruta' },
    { value: 'entregado', label: 'Entregado' },
];

export const takeawayStatusOptions = [
    { value: 'recibido', label: 'Recibido' },
    { value: 'en-preparacion', label: 'En preparación' },
    { value: 'listo-recoger', label: 'Listo para recoger' },
    { value: 'entregado', label: 'Entregado' },
];

/** Categoría “Todos” + se completan con product_categories (Supabase) vía `loadOperationalCatalog` en `app-state`. */
export const categories = [{ id: 'all', name: 'Todos' }];

export const products = [];
export const recipeAvailability = {};
export const kitchenBoardSeed = [];
export const takeawayChatFeed = [];

const TAXED_TAKEAWAY_SOURCES = new Set(['salon', 'whatsapp']);

function roundAmount(value) {
    return Math.round((Number(value) || 0) * 100) / 100;
}

function shouldApplyPackagingFee(source) {
    return TAXED_TAKEAWAY_SOURCES.has(String(source || '').trim().toLowerCase());
}

function createTableOrder({
    sentToKitchen = false,
    items = [],
    serviceType = 'salon',
    takeawayChannel = 'Salon',
    documentType = 'boleta',
    documentIssued = false,
    paymentConfirmed = false,
    paymentMethod = '',
    paymentLabel = 'Pendiente',
    customerDocument = '',
    businessName = '',
    paymentBreakdown = [],
    linkedTakeawayId = null,
    syncedAt = null,
} = {}) {
    const packagingFeeRate = serviceType === 'takeaway' && shouldApplyPackagingFee(takeawayChannel) ? TAKEAWAY_PACKAGING_RATE : 0;

    return {
        sentToKitchen,
        items,
        serviceType,
        takeawayChannel,
        documentType,
        documentIssued,
        paymentConfirmed,
        paymentMethod,
        paymentLabel,
        customerDocument,
        businessName,
        paymentBreakdown,
        packagingFeeRate,
        linkedTakeawayId,
        syncedAt,
    };
}

function createDeliveryOrder(config) {
    return {
        documentType: 'boleta',
        documentIssued: false,
        paymentConfirmed: false,
        paymentMethod: '',
        paymentLabel: 'Pendiente',
        customerDocument: '',
        businessName: '',
        timeline: [],
        ...config,
        timeline: config.timeline || [config.status],
    };
}

function createTakeawayOrder(config) {
    const source = config.source || config.channel || 'Caja';
    const packagingFeeRate = config.packagingFeeRate ?? (shouldApplyPackagingFee(source) ? TAKEAWAY_PACKAGING_RATE : 0);
    const baseTotal = config.baseTotal ?? config.total ?? 0;
    const packagingFeeAmount = roundAmount(baseTotal * packagingFeeRate);
    const total = roundAmount(baseTotal + packagingFeeAmount);

    return {
        documentType: 'boleta',
        documentIssued: false,
        paymentConfirmed: false,
        paymentMethod: '',
        paymentLabel: 'Pendiente',
        source,
        baseTotal,
        packagingFeeRate,
        packagingFeeAmount,
        total,
        linkedTableId: null,
        customerDocument: '',
        businessName: '',
        timeline: [],
        ...config,
        baseTotal,
        packagingFeeRate,
        packagingFeeAmount,
        total,
        timeline: config.timeline || [config.status],
    };
}

export const initialTables = [
    { id: 'table-1', number: '1', zone: 'Interior', description: '', status: 'libre', waiterId: null, order: createTableOrder() },
];

export const statusMeta = {
    libre: { label: 'Libre', tone: 'success', icon: 'check-circle', helper: 'Disponible para nueva atención' },
    ocupada: { label: 'Ocupada', tone: 'danger', icon: 'dot-circle', helper: 'Tiene un pedido activo' },
    reservada: { label: 'Reservada', tone: 'info', icon: 'clock', helper: 'Preparada para atención próxima' },
};

export const deliveryStatusMeta = {
    pendiente: { label: 'Pendiente', tone: 'warning', icon: 'clock', helper: 'Aún no inicia preparación' },
    preparando: { label: 'Preparando', tone: 'info', icon: 'flame', helper: 'Pedido en cocina' },
    'listo-salir': { label: 'Listo para salir', tone: 'accent', icon: 'package', helper: 'Esperando salida' },
    'en-ruta': { label: 'En ruta', tone: 'neutral', icon: 'bike', helper: 'Pedido asignado a reparto' },
    entregado: { label: 'Entregado', tone: 'success', icon: 'check-circle', helper: 'Pedido finalizado' },
};

export const takeawayStatusMeta = {
    recibido: { label: 'Recibido', tone: 'warning', icon: 'clock', helper: 'Pedido recién confirmado' },
    'en-preparacion': { label: 'En preparación', tone: 'info', icon: 'flame', helper: 'Cocina trabajando' },
    'listo-recoger': { label: 'Listo para recoger', tone: 'accent', icon: 'bag', helper: 'Listo para entrega' },
    entregado: { label: 'Entregado', tone: 'success', icon: 'check-circle', helper: 'Entrega completada' },
};

export const initialDeliveryOrders = [];

export const initialTakeawayOrders = [];

export const desktopPaymentMethods = [
    { id: 'efectivo', label: 'Efectivo', shortLabel: 'Efectivo', brand: 'cash', requiresProof: false, icon: 'wallet' },
    { id: 'yape', label: 'Yape', shortLabel: 'Yape', brand: 'yape', requiresProof: true, icon: 'qr' },
    { id: 'plin', label: 'Plin', shortLabel: 'Plin', brand: 'plin', requiresProof: true, icon: 'smartphone' },
    { id: 'transferencia', label: 'Transferencia', shortLabel: 'Transferencia', brand: 'bank', requiresProof: true, icon: 'bank' },
];

export const desktopTipOptions = [10, 15, 20, 0];

export const desktopRoundStatusMeta = {
    enviada: { label: 'En cocina', tone: 'warning' },
    servida: { label: 'Servido', tone: 'success' },
    abierta: { label: 'Abierta', tone: 'accent' },
};

export const desktopTableJourneys = {};
export const desktopDeliveryWorkspace = { highlightOrderId: null, proofTemplates: [] };
export const desktopTakeawayWorkspace = { activeOrderId: null, pickupReadyMessage: '' };
export const courtesyCatalog = [];
export const courtesyDashboard = { monthTotal: 0, monthCost: 0, foodCostImpact: 0, split: { cliente: 0, staff: 0, prueba: 0 }, topItems: [], deltaVsPreviousMonth: '—' };
export const staffMealConsumption = { todayMeals: 0, todayCost: 0, dailyLimit: 0, remaining: 0, staff: [] };

export const courtesyLimits = [
    { id: 'limit-clientes', label: 'Cortesías a clientes', enabled: true, limit: '5 por día', maxCost: '$ 250' },
    { id: 'limit-staff', label: 'Consumo de personal', enabled: true, limit: '1 por turno', maxCost: '$ 80' },
    { id: 'limit-prueba', label: 'Degustación / Prueba', enabled: true, limit: '3 por día', maxCost: '' },
];

export const tipsDashboard = {
    todayAmount: 0,
    ordersCount: 0,
    avgTicket: 0,
    byMethod: [],
    byWaiter: [],
    distributionModes: ['Partes iguales', 'Por horas trabajadas', 'Personalizado'],
};

export const creditNoteDrafts = [];
