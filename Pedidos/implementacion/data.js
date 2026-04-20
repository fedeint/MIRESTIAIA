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

export const products = [
    { id: 'prod-1', name: 'Ceviche clásico', category: 'platos', categoryLabel: 'Platos de fondo', price: 32, badge: 'Más pedido', emoji: '🐟', palette: 'ocean' },
    { id: 'prod-2', name: 'Chaufa de mariscos', category: 'platos', categoryLabel: 'Platos de fondo', price: 28, badge: 'Disponible', emoji: '🍛', palette: 'sunset' },
    { id: 'prod-3', name: 'Jalea mixta', category: 'platos', categoryLabel: 'Platos de fondo', price: 39, badge: 'Destacado', emoji: '🦐', palette: 'amber' },
    { id: 'prod-4', name: 'Leche de tigre', category: 'entradas', categoryLabel: 'Sopas y entradas', price: 18, badge: 'Frío', emoji: '🥣', palette: 'mint' },
    { id: 'prod-5', name: 'Chicharrón de calamar', category: 'entradas', categoryLabel: 'Sopas y entradas', price: 24, badge: 'Para compartir', emoji: '🦑', palette: 'violet' },
    { id: 'prod-6', name: 'Inca Kola 500ml', category: 'bebidas', categoryLabel: 'Bebidas', price: 6, badge: 'Fría', emoji: '🥤', palette: 'lime' },
    { id: 'prod-7', name: 'Chicha morada jarra', category: 'bebidas', categoryLabel: 'Bebidas', price: 12, badge: 'Compartible', emoji: '🍹', palette: 'berry' },
    { id: 'prod-8', name: 'Pisco sour', category: 'bebidas', categoryLabel: 'Bebidas', price: 18, badge: 'Barra', emoji: '🍸', palette: 'gold' },
    { id: 'prod-9', name: 'Suspiro a la limeña', category: 'postres', categoryLabel: 'Postres', price: 16, badge: 'Dulce', emoji: '🍮', palette: 'rose' },
    { id: 'prod-10', name: 'Porción de arroz extra', category: 'extras', categoryLabel: 'Extras', price: 5, badge: 'Extra', emoji: '🍚', palette: 'sand' },
    { id: 'prod-11', name: 'Papas fritas artesanales', category: 'extras', categoryLabel: 'Extras', price: 8, badge: 'Rápido', emoji: '🍟', palette: 'amber' },
    { id: 'prod-12', name: 'Conchitas a la parmesana', category: 'frecuentes', categoryLabel: 'Frecuentes', price: 26, badge: 'Premium', emoji: '🦪', palette: 'ocean' },
];

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
    {
        id: 'table-1',
        number: '1',
        zone: 'Interior',
        description: 'Ventana principal',
        status: 'ocupada',
        waiterId: 'waiter-1',
        order: createTableOrder({ sentToKitchen: false, items: [{ productId: 'prod-1', quantity: 1 }, { productId: 'prod-6', quantity: 2 }] }),
    },
    { id: 'table-2', number: '2', zone: 'Interior', description: 'Cerca a caja', status: 'libre', waiterId: 'waiter-2', order: createTableOrder() },
    { id: 'table-10', number: '10', zone: 'Interior', description: 'Pasillo central', status: 'libre', waiterId: null, order: createTableOrder() },
    { id: 'table-11', number: '11', zone: 'Terraza', description: 'Vista exterior', status: 'reservada', waiterId: null, order: createTableOrder() },
    { id: 'table-12', number: '12', zone: 'Terraza', description: 'Zona norte', status: 'libre', waiterId: null, order: createTableOrder() },
    {
        id: 'table-13',
        number: '13',
        zone: 'Terraza',
        description: 'Zona norte',
        status: 'ocupada',
        waiterId: 'waiter-4',
        order: createTableOrder({
            sentToKitchen: true,
            items: [{ productId: 'prod-3', quantity: 1 }, { productId: 'prod-7', quantity: 1 }, { productId: 'prod-10', quantity: 2 }],
        }),
    },
    { id: 'table-14', number: '14', zone: 'Terraza', description: 'Esquina', status: 'libre', waiterId: null, order: createTableOrder() },
    {
        id: 'table-15',
        number: '15',
        zone: 'Barra',
        description: 'Frente a barra',
        status: 'ocupada',
        waiterId: 'waiter-3',
        order: createTableOrder({
            sentToKitchen: false,
            items: [{ productId: 'prod-8', quantity: 2 }, { productId: 'prod-11', quantity: 1 }],
            serviceType: 'takeaway',
            takeawayChannel: 'Salon',
            documentType: 'boleta',
        }),
    },
    { id: 'table-16', number: '16', zone: 'Terraza', description: 'Zona sur', status: 'libre', waiterId: null, order: createTableOrder() },
    { id: 'table-17', number: '17', zone: 'VIP', description: 'Sala privada', status: 'reservada', waiterId: 'waiter-2', order: createTableOrder() },
    { id: 'table-18', number: '18', zone: 'VIP', description: 'Sala privada', status: 'libre', waiterId: null, order: createTableOrder() },
    {
        id: 'table-19',
        number: '19',
        zone: 'Barra',
        description: 'Barra lateral',
        status: 'ocupada',
        waiterId: 'waiter-1',
        order: createTableOrder({ sentToKitchen: false, items: [{ productId: 'prod-12', quantity: 1 }] }),
    },
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

export const initialDeliveryOrders = [
    createDeliveryOrder({
        id: 'delivery-101',
        code: 'DL-101',
        customer: 'Ana Torres',
        status: 'pendiente',
        courierId: 'courier-1',
        placedAt: '12:10',
        elapsedMinutes: 8,
        etaMinutes: 28,
        total: 74,
        channel: 'Rappi',
        address: 'Av. Pardo 421, Chimbote',
        phone: '999 321 451',
        paymentLabel: 'Yape',
        itemsCount: 3,
        documentType: 'boleta',
        customerDocument: '74219833',
        note: 'Sin cebolla y llamar al llegar.',
    }),
    createDeliveryOrder({
        id: 'delivery-102',
        code: 'DL-102',
        customer: 'Luis Aguirre',
        status: 'preparando',
        courierId: 'courier-2',
        placedAt: '12:02',
        elapsedMinutes: 17,
        etaMinutes: 30,
        total: 49,
        channel: 'WhatsApp',
        address: 'Urb. El Acero Mz. B Lt. 8',
        phone: '975 222 654',
        paymentLabel: 'Efectivo',
        itemsCount: 2,
        documentType: 'boleta',
        paymentConfirmed: true,
        customerDocument: '45877421',
        note: 'Tocar timbre exterior.',
    }),
    createDeliveryOrder({
        id: 'delivery-103',
        code: 'DL-103',
        customer: 'Marisol Peña',
        status: 'listo-salir',
        courierId: 'courier-3',
        placedAt: '11:52',
        elapsedMinutes: 24,
        etaMinutes: 22,
        total: 96,
        channel: 'App MiRest',
        address: 'Malecón Grau 240',
        phone: '944 120 778',
        paymentLabel: 'Tarjeta',
        itemsCount: 4,
        documentType: 'factura',
        documentIssued: true,
        paymentConfirmed: true,
        customerDocument: '20481234567',
        businessName: 'Mar Azul Eventos SAC',
        note: 'Cliente pidió extra limón.',
    }),
    createDeliveryOrder({
        id: 'delivery-104',
        code: 'DL-104',
        customer: 'Kevin Rojas',
        status: 'en-ruta',
        courierId: 'courier-1',
        placedAt: '11:40',
        elapsedMinutes: 31,
        etaMinutes: 34,
        total: 58,
        channel: 'Llamada',
        address: 'Jr. Tumbes 114',
        phone: '987 441 002',
        paymentLabel: 'Plin',
        itemsCount: 3,
        documentType: 'boleta',
        documentIssued: true,
        paymentConfirmed: true,
        customerDocument: '41992221',
        note: 'Entrega por portería.',
    }),
    createDeliveryOrder({
        id: 'delivery-105',
        code: 'DL-105',
        customer: 'Lucía Vela',
        status: 'en-ruta',
        courierId: 'courier-4',
        placedAt: '11:36',
        elapsedMinutes: 39,
        etaMinutes: 30,
        total: 82,
        channel: 'PedidosYa',
        address: 'Los Pinos 455',
        phone: '996 800 210',
        paymentLabel: 'Tarjeta',
        itemsCount: 5,
        documentType: 'factura',
        paymentConfirmed: true,
        customerDocument: '20511888776',
        businessName: 'Vela Distribuciones EIRL',
        note: 'Cliente sensible al picante.',
    }),
    createDeliveryOrder({
        id: 'delivery-106',
        code: 'DL-106',
        customer: 'Raúl Campos',
        status: 'entregado',
        courierId: 'courier-2',
        placedAt: '11:15',
        elapsedMinutes: 44,
        etaMinutes: 38,
        total: 44,
        channel: 'WhatsApp',
        address: 'Nuevo Chimbote · Bruces',
        phone: '977 111 390',
        paymentLabel: 'Efectivo',
        itemsCount: 2,
        documentType: 'boleta',
        documentIssued: true,
        paymentConfirmed: true,
        customerDocument: '70114452',
        note: 'Pedido entregado sin incidencia.',
    }),
];

export const initialTakeawayOrders = [
    createTakeawayOrder({
        id: 'takeaway-201',
        code: 'TL-201',
        customer: 'Rosa Méndez',
        status: 'recibido',
        promisedAt: '12:40',
        minutesToPromise: 18,
        baseTotal: 39,
        channel: 'Caja',
        source: 'Caja',
        pickupCode: 'RC-201',
        phone: '913 321 990',
        paymentLabel: 'Efectivo',
        itemsCount: 2,
        documentType: 'boleta',
        customerDocument: '46612255',
        note: 'Cliente regresa desde banco.',
    }),
    createTakeawayOrder({
        id: 'takeaway-202',
        code: 'TL-202',
        customer: 'Jhon Pérez',
        status: 'en-preparacion',
        promisedAt: '12:28',
        minutesToPromise: 6,
        baseTotal: 52,
        channel: 'Web',
        source: 'Web',
        pickupCode: 'WEB-52',
        phone: '980 774 110',
        paymentLabel: 'Tarjeta',
        itemsCount: 3,
        documentType: 'boleta',
        documentIssued: true,
        paymentConfirmed: true,
        customerDocument: '74400663',
        note: 'Agregar cubiertos y servilletas.',
    }),
    createTakeawayOrder({
        id: 'takeaway-203',
        code: 'TL-203',
        customer: 'Pamela Silva',
        status: 'listo-recoger',
        promisedAt: '12:20',
        minutesToPromise: -4,
        baseTotal: 27,
        channel: 'WhatsApp',
        source: 'WhatsApp',
        pickupCode: 'PICK-88',
        phone: '956 456 712',
        paymentLabel: 'Yape',
        itemsCount: 1,
        documentType: 'boleta',
        paymentConfirmed: true,
        customerDocument: '70885544',
        note: 'Pedido listo esperando recojo.',
    }),
    createTakeawayOrder({
        id: 'takeaway-204',
        code: 'TL-204',
        customer: 'Bruno Cruz',
        status: 'en-preparacion',
        promisedAt: '12:33',
        minutesToPromise: 10,
        baseTotal: 61,
        channel: 'App MiRest',
        source: 'App MiRest',
        pickupCode: 'APP-64',
        phone: '911 220 334',
        paymentLabel: 'Plin',
        itemsCount: 4,
        documentType: 'factura',
        customerDocument: '20555666771',
        businessName: 'Cruz Inversiones SAC',
        note: 'Cliente llegará en moto.',
    }),
    createTakeawayOrder({
        id: 'takeaway-205',
        code: 'TL-205',
        customer: 'Erika Valle',
        status: 'entregado',
        promisedAt: '12:05',
        minutesToPromise: -18,
        baseTotal: 33,
        channel: 'Caja',
        source: 'Caja',
        pickupCode: 'FAST-12',
        phone: '966 881 909',
        paymentLabel: 'Efectivo',
        itemsCount: 2,
        documentType: 'boleta',
        documentIssued: true,
        paymentConfirmed: true,
        customerDocument: '43776691',
        note: 'Recojo completado a tiempo.',
    }),
];

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

export const desktopTableJourneys = {
    'table-1': {
        guests: 4,
        staffSummary: '4 personas · Mozo: Carlos',
        durationLabel: '1h 23m',
        totalAccumulated: 185,
        activeRoundId: 'round-3',
        rounds: [
            {
                id: 'round-1',
                label: 'Ronda 1',
                createdAt: '2:52 PM',
                status: 'servida',
                total: 118,
                items: [
                    { productId: 'prod-1', quantity: 2, note: 'Sin ají', subtotal: 64 },
                    { productId: 'prod-3', quantity: 1, note: 'Compartir', subtotal: 39 },
                    { productId: 'prod-6', quantity: 2, note: '', subtotal: 12 },
                    { productId: 'prod-10', quantity: 1, note: '', subtotal: 5 },
                ],
            },
            {
                id: 'round-2',
                label: 'Ronda 2',
                createdAt: '3:30 PM',
                status: 'enviada',
                total: 52,
                items: [
                    { productId: 'prod-7', quantity: 2, note: '', subtotal: 24 },
                    { productId: 'prod-10', quantity: 2, note: '', subtotal: 10 },
                    { productId: 'prod-5', quantity: 1, note: '', subtotal: 24 },
                ],
            },
            {
                id: 'round-3',
                label: 'Ronda 3',
                createdAt: '4:18 PM',
                status: 'abierta',
                total: 15,
                items: [{ productId: 'prod-9', quantity: 1, note: '', subtotal: 16 }],
            },
        ],
        bill: {
            subtotal: 206,
            igv: 37.08,
            total: 243.08,
            pendingKitchenNote: 'Ronda 3 aún en cocina (2x Tres Leches)',
        },
        paymentDraft: {
            tipRate: 10,
            documentType: 'boleta',
            method: 'efectivo',
            amount: 267.39,
            discountCode: '',
            proof: null,
        },
    },
    'table-15': {
        guests: 2,
        staffSummary: '2 personas · Barra: Pedro',
        durationLabel: '38 min',
        totalAccumulated: 48.4,
        activeRoundId: 'round-15-2',
        rounds: [
            {
                id: 'round-15-1',
                label: 'Ronda 1',
                createdAt: '7:10 PM',
                status: 'servida',
                total: 36,
                items: [
                    { productId: 'prod-8', quantity: 2, note: '', subtotal: 36 },
                ],
            },
            {
                id: 'round-15-2',
                label: 'Ronda 2',
                createdAt: '7:28 PM',
                status: 'abierta',
                total: 8.4,
                items: [{ productId: 'prod-11', quantity: 1, note: '', subtotal: 8 }],
            },
        ],
        bill: {
            subtotal: 41.02,
            igv: 7.38,
            total: 48.4,
            pendingKitchenNote: 'Barra lista para cerrar cuenta.',
        },
        paymentDraft: {
            tipRate: 5,
            documentType: 'boleta',
            method: 'plin',
            amount: 50.82,
            discountCode: '',
            proof: null,
        },
    },
};

export const desktopDeliveryWorkspace = {
    highlightOrderId: 'delivery-101',
    proofTemplates: [
        { id: 'proof-yape-1', method: 'yape', fileName: 'yape-ana-torres.webp', mimeType: 'image/webp', sizeKb: 164 },
        { id: 'proof-plin-1', method: 'plin', fileName: 'plin-bruno-cruz.webp', mimeType: 'image/webp', sizeKb: 151 },
        { id: 'proof-transfer-1', method: 'transferencia', fileName: 'transferencia-mesa15.webp', mimeType: 'image/webp', sizeKb: 212 },
    ],
};

export const desktopTakeawayWorkspace = {
    activeOrderId: 'takeaway-203',
    pickupReadyMessage: 'Listo para entregar',
};

export const courtesyCatalog = [
    { id: 'courtesy-prod-1', productId: 'prod-9', label: 'Tres Leches', cost: 5.4, type: 'cliente' },
    { id: 'courtesy-prod-2', productId: 'prod-7', label: 'Chicha Morada', cost: 3.8, type: 'staff' },
    { id: 'courtesy-prod-3', productId: 'prod-10', label: 'Pan con chicharrón', cost: 2.6, type: 'prueba' },
];

export const courtesyDashboard = {
    monthTotal: 45,
    monthCost: 320,
    foodCostImpact: 2.1,
    split: {
        cliente: 60,
        staff: 30,
        prueba: 10,
    },
    topItems: [
        { label: 'Tres Leches', count: 12 },
        { label: 'Chicha Morada', count: 8 },
        { label: 'Pan con chicharrón', count: 6 },
    ],
    deltaVsPreviousMonth: '+5 cortesías (+S/ 28)',
};

export const staffMealConsumption = {
    todayMeals: 5,
    todayCost: 35,
    dailyLimit: 50,
    remaining: 15,
    staff: [
        { id: 'meal-1', employee: 'Carlos · Mozo', dish: 'Arroz con pollo', amount: 7 },
        { id: 'meal-2', employee: 'María · Cajera', dish: 'Lomo saltado', amount: 8.5 },
        { id: 'meal-3', employee: 'Pedro · Cocina', dish: 'Arroz con pollo', amount: 7 },
    ],
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

export const creditNoteDrafts = [
    {
        id: 'cn-source-1',
        code: 'B001-00048',
        customer: 'Mesa 1',
        reference: 'Mesa 1 · S/ 243.08',
        issuedAt: '4:22 PM',
        channel: 'salon',
        total: 243.08,
        items: [
            { id: 'cn-item-1', label: '2x Ceviche Clásico', amount: 76 },
            { id: 'cn-item-2', label: '1x Lomo Saltado', amount: 42 },
            { id: 'cn-item-3', label: 'IGV proporcional', amount: 13.68 },
        ],
    },
    {
        id: 'cn-source-2',
        code: 'B001-00047',
        customer: 'Delivery',
        reference: '3:15 PM · S/ 142.50',
        issuedAt: '3:15 PM',
        channel: 'delivery',
        total: 142.5,
        items: [{ id: 'cn-item-4', label: 'Combo familiar', amount: 142.5 }],
    },
];
