export const waiters = [
    { id: 'waiter-1', name: 'Carlos', shift: 'Mañana' },
    { id: 'waiter-2', name: 'María', shift: 'Tarde' },
    { id: 'waiter-3', name: 'Pedro', shift: 'Noche' },
    { id: 'waiter-4', name: 'Lucía', shift: 'Part time' },
];

export const couriers = [
    { id: 'courier-1', name: 'Javier', vehicle: 'Moto 1' },
    { id: 'courier-2', name: 'Pamela', vehicle: 'Moto 2' },
    { id: 'courier-3', name: 'Renzo', vehicle: 'Bici urbana' },
    { id: 'courier-4', name: 'Mónica', vehicle: 'Auto' },
];

export const zones = ['Interior', 'Terraza', 'Barra', 'VIP'];

export const statusOptions = [
    { value: 'libre', label: 'Libre' },
    { value: 'ocupada', label: 'Ocupada' },
    { value: 'reservada', label: 'Reservada' },
];

export const documentTypeOptions = [
    { value: 'boleta', label: 'Boleta' },
    { value: 'factura', label: 'Factura' },
];

export const paymentMethodOptions = [
    { value: 'yape-plin', label: 'Yape/Plin' },
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

export const categories = [
    { id: 'all', name: 'Todos' },
    { id: 'frecuentes', name: 'Frecuentes' },
    { id: 'platos', name: 'Platos de fondo' },
    { id: 'entradas', name: 'Sopas y entradas' },
    { id: 'bebidas', name: 'Bebidas' },
    { id: 'postres', name: 'Postres' },
    { id: 'extras', name: 'Extras' },
];

/** Catálogo vacío: rellenar desde Supabase / API cuando exista capa de datos. */
export const products = [];

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
    { id: 'table-1', number: '1', zone: 'Interior', description: 'Ventana principal', status: 'libre', waiterId: null, order: createTableOrder() },
    { id: 'table-2', number: '2', zone: 'Interior', description: 'Cerca a caja', status: 'libre', waiterId: null, order: createTableOrder() },
    { id: 'table-10', number: '10', zone: 'Interior', description: 'Pasillo central', status: 'libre', waiterId: null, order: createTableOrder() },
    { id: 'table-11', number: '11', zone: 'Terraza', description: 'Vista exterior', status: 'libre', waiterId: null, order: createTableOrder() },
    { id: 'table-12', number: '12', zone: 'Terraza', description: 'Zona norte', status: 'libre', waiterId: null, order: createTableOrder() },
    { id: 'table-13', number: '13', zone: 'Terraza', description: 'Zona norte', status: 'libre', waiterId: null, order: createTableOrder() },
    { id: 'table-14', number: '14', zone: 'Terraza', description: 'Esquina', status: 'libre', waiterId: null, order: createTableOrder() },
    { id: 'table-15', number: '15', zone: 'Barra', description: 'Frente a barra', status: 'libre', waiterId: null, order: createTableOrder() },
    { id: 'table-16', number: '16', zone: 'Terraza', description: 'Zona sur', status: 'libre', waiterId: null, order: createTableOrder() },
    { id: 'table-17', number: '17', zone: 'VIP', description: 'Sala privada', status: 'libre', waiterId: null, order: createTableOrder() },
    { id: 'table-18', number: '18', zone: 'VIP', description: 'Sala privada', status: 'libre', waiterId: null, order: createTableOrder() },
    { id: 'table-19', number: '19', zone: 'Barra', description: 'Barra lateral', status: 'libre', waiterId: null, order: createTableOrder() },
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
    'listo-recoger': { label: 'Listo para recoger', tone: 'accent', icon: 'bag', helper: 'Listo para recojo' },
    entregado: { label: 'Entregado', tone: 'success', icon: 'check-circle', helper: 'Recojo completado' },
};

export const initialDeliveryOrders = [];

export const initialTakeawayOrders = [];

export const desktopPaymentMethods = [
    { id: 'efectivo', label: 'Efectivo', shortLabel: 'Efectivo', brand: 'cash', requiresProof: false, icon: 'wallet' },
    { id: 'yape', label: 'Yape', shortLabel: 'Yape', brand: 'yape', requiresProof: true, icon: 'qr' },
    { id: 'plin', label: 'Plin', shortLabel: 'Plin', brand: 'plin', requiresProof: true, icon: 'smartphone' },
    { id: 'transferencia', label: 'Transferencia', shortLabel: 'Transferencia', brand: 'bank', requiresProof: true, icon: 'bank' },
];

export const desktopTipOptions = [5, 10, 15, 0];

export const desktopRoundStatusMeta = {
    enviada: { label: 'En cocina', tone: 'warning' },
    servida: { label: 'Servido', tone: 'success' },
    abierta: { label: 'Abierta', tone: 'accent' },
};

export const desktopTableJourneys = {};

export const desktopDeliveryWorkspace = {
    highlightOrderId: null,
    proofTemplates: [
        { id: 'proof-yape-1', method: 'yape', fileName: 'yape-ana-torres.webp', mimeType: 'image/webp', sizeKb: 164 },
        { id: 'proof-plin-1', method: 'plin', fileName: 'plin-bruno-cruz.webp', mimeType: 'image/webp', sizeKb: 151 },
        { id: 'proof-transfer-1', method: 'transferencia', fileName: 'transferencia-mesa15.webp', mimeType: 'image/webp', sizeKb: 212 },
    ],
};

export const desktopTakeawayWorkspace = {
    activeOrderId: null,
    pickupReadyMessage: 'Listo para entregar',
};

export const courtesyCatalog = [];

export const courtesyDashboard = {
    monthTotal: 0,
    monthCost: 0,
    foodCostImpact: 0,
    split: {
        cliente: 0,
        staff: 0,
        prueba: 0,
    },
    topItems: [],
    deltaVsPreviousMonth: '—',
};

export const staffMealConsumption = {
    todayMeals: 0,
    todayCost: 0,
    dailyLimit: 50,
    remaining: 50,
    staff: [],
};

export const courtesyLimits = [
    { id: 'limit-clientes', label: 'Cortesías a clientes', enabled: true, limit: '5 por día', maxCost: 'S/ 50' },
    { id: 'limit-staff', label: 'Consumo de personal', enabled: true, limit: '1 por turno', maxCost: 'S/ 10' },
    { id: 'limit-prueba', label: 'Degustación / Prueba', enabled: true, limit: '3 por día', maxCost: '' },
];

export const tipsDashboard = {
    todayAmount: 127.5,
    ordersCount: 22,
    avgTicket: 5.8,
    byMethod: [
        { id: 'tips-efectivo', label: 'Efectivo', amount: 85 },
        { id: 'tips-tarjeta', label: 'Tarjeta', amount: 32.5 },
        { id: 'tips-yape', label: 'Yape', amount: 10 },
    ],
    byWaiter: [
        { id: 'tip-waiter-1', waiter: 'Carlos García', orders: 8, shift: 'Turno 1', amount: 45 },
        { id: 'tip-waiter-2', waiter: 'María López', orders: 9, shift: 'Turno 2', amount: 52.5 },
        { id: 'tip-waiter-3', waiter: 'Juan Ruiz', orders: 5, shift: 'Turno 3', amount: 30 },
    ],
    distributionModes: ['Partes iguales', 'Por horas trabajadas', 'Personalizado'],
};

export const creditNoteDrafts = [];
