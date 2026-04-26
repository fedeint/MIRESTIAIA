const waiters = [
    { id: 'waiter-1', name: 'Carlos', shift: 'Mañana' },
    { id: 'waiter-2', name: 'María', shift: 'Tarde' },
    { id: 'waiter-3', name: 'Pedro', shift: 'Noche' },
    { id: 'waiter-4', name: 'Lucía', shift: 'Part time' },
];

const couriers = [
    { id: 'courier-1', name: 'Javier', vehicle: 'Moto 1' },
    { id: 'courier-2', name: 'Pamela', vehicle: 'Moto 2' },
    { id: 'courier-3', name: 'Renzo', vehicle: 'Bici urbana' },
    { id: 'courier-4', name: 'Mónica', vehicle: 'Auto' },
];

const deliveryPartners = [
    { id: 'partner-rappi', name: 'Rappi', contractStatus: 'activo', settlementModel: 'Comisión variable' },
    { id: 'partner-didifood', name: 'Didi Food', contractStatus: 'activo', settlementModel: 'Comisión fija' },
    { id: 'partner-whatsapp', name: 'WhatsApp', contractStatus: 'canal directo', settlementModel: 'Sin comisión' },
    { id: 'partner-mirest', name: 'App MiRest', contractStatus: 'propio', settlementModel: 'Canal interno' },
];

const zones = ['Interior', 'Terraza', 'Barra', 'VIP'];

const statusOptions = [
    { value: 'libre', label: 'Libre' },
    { value: 'ocupada', label: 'Ocupada' },
    { value: 'reservada', label: 'Reservada' },
];

const documentTypeOptions = [
    { value: 'boleta', label: 'Ticket' },
    { value: 'factura', label: 'Factura' },
];

const paymentMethodOptions = [
    { value: 'codi', label: 'CoDi/Transferencia' },
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'tarjeta', label: 'Tarjeta' },
    { value: 'transferencia', label: 'SPEI' },
];

const takeawaySourceOptions = [
    { value: 'Salon', label: 'Desde salón' },
    { value: 'WhatsApp', label: 'WhatsApp' },
];

const TAKEAWAY_PACKAGING_RATE = 0.1;

const deliveryStatusFlow = ['pendiente', 'preparando', 'listo-salir', 'en-ruta', 'entregado'];

const takeawayStatusFlow = ['recibido', 'en-preparacion', 'listo-recoger', 'entregado'];

const deliveryStatusOptions = [
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'preparando', label: 'Preparando' },
    { value: 'listo-salir', label: 'Listo para salir' },
    { value: 'en-ruta', label: 'En ruta' },
    { value: 'entregado', label: 'Entregado' },
];

const takeawayStatusOptions = [
    { value: 'recibido', label: 'Recibido' },
    { value: 'en-preparacion', label: 'En preparación' },
    { value: 'listo-recoger', label: 'Listo para recoger' },
    { value: 'entregado', label: 'Entregado' },
];

const categories = [
    { id: 'all', name: 'Todos' },
    { id: 'frecuentes', name: 'Frecuentes' },
    { id: 'platos', name: 'Platos fuertes' },
    { id: 'entradas', name: 'Antojitos y entradas' },
    { id: 'bebidas', name: 'Bebidas' },
    { id: 'postres', name: 'Postres' },
    { id: 'extras', name: 'Extras' },
];

const products = [
    { id: 'prod-1', name: 'Tacos al Pastor (5 pzs)', category: 'platos', categoryLabel: 'Platos fuertes', price: 95, badge: 'Más pedido', emoji: '🌮', palette: 'sunset' },
    { id: 'prod-2', name: 'Chilaquiles con Pollo', category: 'platos', categoryLabel: 'Platos fuertes', price: 110, badge: 'Disponible', emoji: '🥘', palette: 'amber' },
    { id: 'prod-3', name: 'Enchiladas Suizas', category: 'platos', categoryLabel: 'Platos fuertes', price: 125, badge: 'Destacado', emoji: '🌯', palette: 'mint' },
    { id: 'prod-4', name: 'Sopa de Tortilla', category: 'entradas', categoryLabel: 'Antojitos y entradas', price: 65, badge: 'Caliente', emoji: '🥣', palette: 'sand' },
    { id: 'prod-5', name: 'Guacamole con Totopos', category: 'entradas', categoryLabel: 'Antojitos y entradas', price: 85, badge: 'Para compartir', emoji: '🥑', palette: 'lime' },
    { id: 'prod-6', name: 'Coca-Cola 600ml', category: 'bebidas', categoryLabel: 'Bebidas', price: 35, badge: 'Fría', emoji: '🥤', palette: 'ocean' },
    { id: 'prod-7', name: 'Agua de Jamaica (Jarra)', category: 'bebidas', categoryLabel: 'Bebidas', price: 75, badge: 'Compartible', emoji: '🍹', palette: 'berry' },
    { id: 'prod-8', name: 'Margarita Clásica', category: 'bebidas', categoryLabel: 'Bebidas', price: 120, badge: 'Barra', emoji: '🍸', palette: 'gold' },
    { id: 'prod-9', name: 'Flan Napolitano', category: 'postres', categoryLabel: 'Postres', price: 55, badge: 'Dulce', emoji: '🍮', palette: 'rose' },
    { id: 'prod-10', name: 'Porción de Frijoles', category: 'extras', categoryLabel: 'Extras', price: 25, badge: 'Extra', emoji: '🥣', palette: 'sand' },
    { id: 'prod-11', name: 'Papas a la Francesa', category: 'extras', categoryLabel: 'Extras', price: 45, badge: 'Rápido', emoji: '🍟', palette: 'amber' },
    { id: 'prod-12', name: 'Tostadas de Camarón', category: 'frecuentes', categoryLabel: 'Frecuentes', price: 135, badge: 'Premium', emoji: '🍤', palette: 'ocean' },
];

const recipeAvailability = {
    'prod-1': { recipeId: 'recipe-1', inStock: true, kitchenStation: 'trompo' },
    'prod-2': { recipeId: 'recipe-2', inStock: true, kitchenStation: 'calientes' },
    'prod-3': { recipeId: 'recipe-3', inStock: true, kitchenStation: 'calientes' },
    'prod-4': { recipeId: 'recipe-4', inStock: true, kitchenStation: 'calientes' },
    'prod-5': { recipeId: 'recipe-5', inStock: true, kitchenStation: 'fríos' },
    'prod-6': { recipeId: 'recipe-6', inStock: true, kitchenStation: 'barra' },
    'prod-7': { recipeId: 'recipe-7', inStock: true, kitchenStation: 'barra' },
    'prod-8': { recipeId: 'recipe-8', inStock: true, kitchenStation: 'barra' },
    'prod-9': { recipeId: 'recipe-9', inStock: true, kitchenStation: 'postres' },
    'prod-10': { recipeId: 'recipe-10', inStock: true, kitchenStation: 'calientes' },
    'prod-11': { recipeId: 'recipe-11', inStock: false, kitchenStation: 'freidora' },
    'prod-12': { recipeId: 'recipe-12', inStock: true, kitchenStation: 'fríos' },
};

const kitchenBoardSeed = [
    { id: 'kitchen-ticket-1', source: 'salon', refCode: 'Mesa 1 · Ronda 1', status: 'preparando', station: 'trompo', itemsCount: 3, etaLabel: '7 min' },
    { id: 'kitchen-ticket-2', source: 'delivery', refCode: 'DL-103', status: 'cola', station: 'calientes', itemsCount: 4, etaLabel: '12 min' },
    { id: 'kitchen-ticket-3', source: 'takeaway', refCode: 'TL-203', status: 'listo', station: 'barra', itemsCount: 1, etaLabel: 'Retirar' },
];

const takeawayChatFeed = [
    {
        id: 'wa-seed-1',
        channel: 'WhatsApp',
        customer: 'Pamela Silva',
        message: 'Hola, deseo 1 Flan y 1 Jarra de Jamaica para recoger en 20 minutos.',
        suggestedItems: ['prod-9', 'prod-7'],
        createdAt: '12:44 PM',
    },
    {
        id: 'wa-seed-2',
        channel: 'WhatsApp',
        customer: 'Rosa Méndez',
        message: '¿Tienen algún paquete? Quiero 1 Chilaquiles y 1 Coca para llevar.',
        suggestedItems: ['prod-2', 'prod-6'],
        createdAt: '1:08 PM',
    },
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

const initialTables = [
    {
        id: 'table-1',
        number: '1',
        zone: 'Interior',
        description: 'Cerca de la entrada',
        status: 'ocupada',
        waiterId: 'waiter-1',
        order: createTableOrder({ sentToKitchen: false, items: [{ productId: 'prod-1', quantity: 1 }, { productId: 'prod-6', quantity: 2 }] }),
    },
    { id: 'table-2', number: '2', zone: 'Interior', description: 'Cerca de caja', status: 'libre', waiterId: 'waiter-2', order: createTableOrder() },
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
];

const statusMeta = {
    libre: { label: 'Libre', tone: 'success', icon: 'check-circle', helper: 'Disponible para nueva atención' },
    ocupada: { label: 'Ocupada', tone: 'danger', icon: 'dot-circle', helper: 'Tiene un pedido activo' },
    reservada: { label: 'Reservada', tone: 'info', icon: 'clock', helper: 'Preparada para atención próxima' },
};

const deliveryStatusMeta = {
    pendiente: { label: 'Pendiente', tone: 'warning', icon: 'clock', helper: 'Aún no inicia preparación' },
    preparando: { label: 'Preparando', tone: 'info', icon: 'flame', helper: 'Pedido en cocina' },
    'listo-salir': { label: 'Listo para salir', tone: 'accent', icon: 'package', helper: 'Esperando salida' },
    'en-ruta': { label: 'En ruta', tone: 'neutral', icon: 'bike', helper: 'Pedido asignado a reparto' },
    entregado: { label: 'Entregado', tone: 'success', icon: 'check-circle', helper: 'Pedido finalizado' },
};

const takeawayStatusMeta = {
    recibido: { label: 'Recibido', tone: 'warning', icon: 'clock', helper: 'Pedido recién confirmado' },
    'en-preparacion': { label: 'En preparación', tone: 'info', icon: 'flame', helper: 'Cocina trabajando' },
    'listo-recoger': { label: 'Listo para recoger', tone: 'accent', icon: 'bag', helper: 'Listo para entrega' },
    entregado: { label: 'Entregado', tone: 'success', icon: 'check-circle', helper: 'Entrega completada' },
};

const initialDeliveryOrders = [
    createDeliveryOrder({
        id: 'delivery-101',
        code: 'DL-101',
        customer: 'Ana Torres',
        status: 'pendiente',
        courierId: 'courier-1',
        placedAt: '12:10',
        elapsedMinutes: 8,
        etaMinutes: 28,
        total: 245,
        channel: 'Rappi',
        address: 'Col. Roma Norte, Calle Puebla 123',
        phone: '55 1234 5678',
        paymentLabel: 'CoDi',
        itemsCount: 3,
        documentType: 'boleta',
        customerDocument: 'XAXX010101000',
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
        total: 180,
        channel: 'WhatsApp',
        address: 'Col. Condesa, Av. Mazatlán 45',
        phone: '55 9876 5432',
        paymentLabel: 'Efectivo',
        itemsCount: 2,
        documentType: 'boleta',
        paymentConfirmed: true,
        customerDocument: 'XAXX010101000',
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
        total: 340,
        channel: 'App MiRest',
        address: 'Col. Polanco, Homero 240',
        phone: '55 4433 2211',
        paymentLabel: 'Tarjeta',
        itemsCount: 4,
        documentType: 'factura',
        documentIssued: true,
        paymentConfirmed: true,
        customerDocument: 'MARE010101ABC',
        businessName: 'Mar Azul Eventos S.A. de C.V.',
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
        total: 195,
        channel: 'Llamada',
        address: 'Col. Del Valle, Adolfo Prieto 114',
        phone: '55 2211 4433',
        paymentLabel: 'SPEI',
        itemsCount: 3,
        documentType: 'boleta',
        documentIssued: true,
        paymentConfirmed: true,
        customerDocument: 'XAXX010101000',
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
        total: 420,
        channel: 'Didi Food',
        address: 'Col. Juárez, Hamburgo 455',
        phone: '55 6677 8899',
        paymentLabel: 'Tarjeta',
        itemsCount: 5,
        documentType: 'factura',
        paymentConfirmed: true,
        customerDocument: 'VELA010101XYZ',
        businessName: 'Vela Distribuciones S.A. de C.V.',
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
        total: 155,
        channel: 'WhatsApp',
        address: 'Col. Narvarte, Cumbres de Maltrata',
        phone: '55 1122 3344',
        paymentLabel: 'Efectivo',
        itemsCount: 2,
        documentType: 'boleta',
        documentIssued: true,
        paymentConfirmed: true,
        customerDocument: 'XAXX010101000',
        note: 'Pedido entregado sin incidencia.',
    }),
];

const initialTakeawayOrders = [
    createTakeawayOrder({
        id: 'takeaway-201',
        code: 'TL-201',
        customer: 'Rosa Méndez',
        status: 'recibido',
        promisedAt: '12:40',
        minutesToPromise: 18,
        baseTotal: 125,
        channel: 'Caja',
        source: 'Caja',
        pickupCode: 'RC-201',
        phone: '55 1234 9900',
        paymentLabel: 'Efectivo',
        itemsCount: 2,
        documentType: 'boleta',
        customerDocument: 'XAXX010101000',
        note: 'Cliente regresa desde banco.',
    }),
    createTakeawayOrder({
        id: 'takeaway-202',
        code: 'TL-202',
        customer: 'Jhon Pérez',
        status: 'en-preparacion',
        promisedAt: '12:28',
        minutesToPromise: 6,
        baseTotal: 210,
        channel: 'Web',
        source: 'Web',
        pickupCode: 'WEB-52',
        phone: '55 9800 7741',
        paymentLabel: 'Tarjeta',
        itemsCount: 3,
        documentType: 'boleta',
        documentIssued: true,
        paymentConfirmed: true,
        customerDocument: 'XAXX010101000',
        note: 'Agregar cubiertos y servilletas.',
    }),
    createTakeawayOrder({
        id: 'takeaway-203',
        code: 'TL-203',
        customer: 'Pamela Silva',
        status: 'listo-recoger',
        promisedAt: '12:20',
        minutesToPromise: -4,
        baseTotal: 85,
        channel: 'WhatsApp',
        source: 'WhatsApp',
        pickupCode: 'PICK-88',
        phone: '55 4567 1234',
        paymentLabel: 'CoDi',
        itemsCount: 1,
        documentType: 'boleta',
        paymentConfirmed: true,
        customerDocument: 'XAXX010101000',
        note: 'Pedido listo esperando entrega.',
    }),
    createTakeawayOrder({
        id: 'takeaway-204',
        code: 'TL-204',
        customer: 'Bruno Cruz',
        status: 'en-preparacion',
        promisedAt: '12:33',
        minutesToPromise: 10,
        baseTotal: 285,
        channel: 'App MiRest',
        source: 'App MiRest',
        pickupCode: 'APP-64',
        phone: '55 9112 2033',
        paymentLabel: 'SPEI',
        itemsCount: 4,
        documentType: 'factura',
        customerDocument: 'CRUZ010101UVW',
        businessName: 'Cruz Inversiones S.A. de C.V.',
        note: 'Cliente llegará en moto.',
    }),
    createTakeawayOrder({
        id: 'takeaway-205',
        code: 'TL-205',
        customer: 'Erika Valle',
        status: 'entregado',
        promisedAt: '12:05',
        minutesToPromise: -18,
        baseTotal: 145,
        channel: 'Caja',
        source: 'Caja',
        pickupCode: 'FAST-12',
        phone: '55 6688 1909',
        paymentLabel: 'Efectivo',
        itemsCount: 2,
        documentType: 'boleta',
        documentIssued: true,
        paymentConfirmed: true,
        customerDocument: 'XAXX010101000',
        note: 'Entrega completada a tiempo.',
    }),
];

const desktopPaymentMethods = [
    { id: 'efectivo', label: 'Efectivo', shortLabel: 'Efectivo', brand: 'cash', requiresProof: false, icon: 'wallet' },
    { id: 'codi', label: 'CoDi', shortLabel: 'CoDi', brand: 'yape', requiresProof: true, icon: 'qr' },
    { id: 'spei', label: 'SPEI', shortLabel: 'SPEI', brand: 'plin', requiresProof: true, icon: 'smartphone' },
    { id: 'transferencia', label: 'Transferencia', shortLabel: 'Transferencia', brand: 'bank', requiresProof: true, icon: 'bank' },
];

const desktopTipOptions = [10, 15, 20, 0];

const desktopRoundStatusMeta = {
    enviada: { label: 'En cocina', tone: 'warning' },
    servida: { label: 'Servido', tone: 'success' },
    abierta: { label: 'Abierta', tone: 'accent' },
};

const desktopTableJourneys = {
    'table-1': {
        guests: 4,
        staffSummary: '4 personas · Capitán: Carlos',
        durationLabel: '1h 23m',
        totalAccumulated: 845,
        activeRoundId: 'round-3',
        rounds: [
            {
                id: 'round-1',
                label: 'Ronda 1',
                createdAt: '2:52 PM',
                status: 'servida',
                isPaid: true,
                total: 480,
                items: [
                    { productId: 'prod-1', quantity: 2, note: 'Sin cebolla', subtotal: 190 },
                    { productId: 'prod-3', quantity: 1, note: 'Compartir', subtotal: 125 },
                    { productId: 'prod-6', quantity: 2, note: '', subtotal: 70 },
                    { productId: 'prod-10', quantity: 1, note: '', subtotal: 25 },
                ],
            },
            {
                id: 'round-2',
                label: 'Ronda 2',
                createdAt: '3:30 PM',
                status: 'enviada',
                isPaid: false,
                total: 245,
                items: [
                    { productId: 'prod-7', quantity: 2, note: '', subtotal: 150 },
                    { productId: 'prod-10', quantity: 2, note: '', subtotal: 50 },
                    { productId: 'prod-11', quantity: 1, note: '', subtotal: 45 },
                ],
            },
            {
                id: 'round-3',
                label: 'Ronda 3',
                createdAt: '4:18 PM',
                status: 'abierta',
                isPaid: false,
                total: 55,
                items: [{ productId: 'prod-9', quantity: 1, note: '', subtotal: 55 }],
            },
        ],
        bill: {
            subtotal: 780,
            iva: 124.8,
            total: 904.8,
            pendingKitchenNote: 'Ronda 3 aún en cocina (1x Flan)',
        },
        paymentDraft: {
            tipRate: 10,
            documentType: 'boleta',
            method: 'efectivo',
            amount: 995.28,
            discountCode: '',
            proof: null,
        },
    },
};

const desktopDeliveryWorkspace = {
    highlightOrderId: 'delivery-101',
    proofTemplates: [
        { id: 'proof-codi-1', method: 'codi', fileName: 'codi-ana-torres.webp', mimeType: 'image/webp', sizeKb: 164 },
        { id: 'proof-spei-1', method: 'spei', fileName: 'spei-bruno-cruz.webp', mimeType: 'image/webp', sizeKb: 151 },
        { id: 'proof-transfer-1', method: 'transferencia', fileName: 'transferencia-mesa15.webp', mimeType: 'image/webp', sizeKb: 212 },
    ],
};

const desktopTakeawayWorkspace = {
    activeOrderId: 'takeaway-203',
    pickupReadyMessage: 'Listo para entrega',
};

const courtesyCatalog = [
    { id: 'courtesy-prod-1', productId: 'prod-9', label: 'Flan Napolitano', cost: 15, type: 'cliente' },
    { id: 'courtesy-prod-2', productId: 'prod-7', label: 'Agua de Jamaica', cost: 12, type: 'staff' },
    { id: 'courtesy-prod-3', productId: 'prod-10', label: 'Tostada de cortesía', cost: 8, type: 'prueba' },
];

const courtesyDashboard = {
    monthTotal: 45,
    monthCost: 1250,
    foodCostImpact: 2.1,
    split: {
        cliente: 60,
        staff: 30,
        prueba: 10,
    },
    topItems: [
        { label: 'Flan Napolitano', count: 12 },
        { label: 'Agua de Jamaica', count: 8 },
        { label: 'Tostadas', count: 6 },
    ],
    deltaVsPreviousMonth: '+5 cortesías (+$ 145)',
};

const staffMealConsumption = {
    todayMeals: 5,
    todayCost: 175,
    dailyLimit: 250,
    remaining: 75,
    staff: [
        { id: 'meal-1', employee: 'Carlos · Capitán', dish: 'Tacos Pastor', amount: 35 },
        { id: 'meal-2', employee: 'María · Cajera', dish: 'Chilaquiles', amount: 40 },
        { id: 'meal-3', employee: 'Pedro · Cocina', dish: 'Tacos Pastor', amount: 35 },
    ],
};

const courtesyLimits = [
    { id: 'limit-clientes', label: 'Cortesías a clientes', enabled: true, limit: '5 por día', maxCost: '$ 250' },
    { id: 'limit-staff', label: 'Consumo de personal', enabled: true, limit: '1 por turno', maxCost: '$ 80' },
    { id: 'limit-prueba', label: 'Degustación / Prueba', enabled: true, limit: '3 por día', maxCost: '' },
];

const tipsDashboard = {
    todayAmount: 850,
    ordersCount: 22,
    avgTicket: 38.6,
    byMethod: [
        { id: 'tips-efectivo', label: 'Efectivo', amount: 450 },
        { id: 'tips-tarjeta', label: 'Tarjeta', amount: 300 },
        { id: 'tips-codi', label: 'CoDi', amount: 100 },
    ],
    byWaiter: [
        { id: 'tip-waiter-1', waiter: 'Carlos García', orders: 8, shift: 'Turno 1', amount: 245 },
        { id: 'tip-waiter-2', waiter: 'María López', orders: 9, shift: 'Turno 2', amount: 350 },
        { id: 'tip-waiter-3', waiter: 'Juan Ruiz', orders: 5, shift: 'Turno 3', amount: 255 },
    ],
    distributionModes: ['Partes iguales', 'Por horas trabajadas', 'Personalizado'],
};

const creditNoteDrafts = [
    {
        id: 'cn-source-1',
        code: 'T001-00048',
        customer: 'Mesa 1',
        reference: 'Mesa 1 · $ 904.80',
        issuedAt: '4:22 PM',
        channel: 'salon',
        total: 904.8,
        items: [
            { id: 'cn-item-1', label: '2x Tacos al Pastor', amount: 190 },
            { id: 'cn-item-2', label: '1x Enchiladas Suizas', amount: 125 },
            { id: 'cn-item-3', label: 'IVA proporcional', amount: 50.4 },
        ],
    },
];

module.exports = { waiters, couriers, deliveryPartners, zones, statusOptions, documentTypeOptions, paymentMethodOptions, takeawaySourceOptions, TAKEAWAY_PACKAGING_RATE, deliveryStatusFlow, takeawayStatusFlow, deliveryStatusOptions, takeawayStatusOptions, categories, products, recipeAvailability, kitchenBoardSeed, takeawayChatFeed, initialTables, statusMeta, deliveryStatusMeta, takeawayStatusMeta, initialDeliveryOrders, initialTakeawayOrders, desktopPaymentMethods, desktopTipOptions, desktopRoundStatusMeta, desktopTableJourneys, desktopDeliveryWorkspace, desktopTakeawayWorkspace, courtesyCatalog, courtesyDashboard, staffMealConsumption, courtesyLimits, tipsDashboard, creditNoteDrafts };
