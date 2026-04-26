const ORDER_TYPES = ['salon', 'delivery', 'takeaway'];

const OPERATIONAL_FLOWS = {
  delivery: ['pending', 'preparing', 'ready_to_dispatch', 'on_route', 'delivered'],
  takeaway: ['received', 'preparing', 'ready_for_pickup', 'picked_up'],
  salon: ['open', 'in_progress', 'waiting_payment', 'completed'],
};

const TERMINAL_OPERATIONAL_STATUSES = new Set(['delivered', 'picked_up', 'completed', 'cancelled']);

const LEGACY_TO_OPERATIONAL = {
  delivery: { pendiente: 'pending', preparando: 'preparing', 'listo-salir': 'ready_to_dispatch', 'en-ruta': 'on_route', entregado: 'delivered', cancelado: 'cancelled' },
  takeaway: { recibido: 'received', 'en-preparacion': 'preparing', 'listo-recoger': 'ready_for_pickup', entregado: 'picked_up', recogido: 'picked_up', cancelado: 'cancelled' },
  salon: { abierta: 'open', ocupada: 'in_progress', libre: 'completed', reservada: 'open', 'esperando-pago': 'waiting_payment', completada: 'completed', cancelada: 'cancelled' },
};

const OPERATIONAL_TO_LEGACY = {
  delivery: { pending: 'pendiente', preparing: 'preparando', ready_to_dispatch: 'listo-salir', on_route: 'en-ruta', delivered: 'entregado', cancelled: 'cancelado' },
  takeaway: { received: 'recibido', preparing: 'en-preparacion', ready_for_pickup: 'listo-recoger', picked_up: 'entregado', cancelled: 'cancelado' },
  salon: { open: 'abierta', in_progress: 'ocupada', waiting_payment: 'esperando-pago', completed: 'libre', cancelled: 'cancelada' },
};

const OPERATIONAL_LABELS = {
  delivery: { pending: 'Pendiente', preparing: 'Preparando', ready_to_dispatch: 'Listo para despacho', on_route: 'En ruta', delivered: 'Entregado', cancelled: 'Cancelado' },
  takeaway: { received: 'Recibido', preparing: 'Preparando', ready_for_pickup: 'Listo para recoger', picked_up: 'Recogido', cancelled: 'Cancelado' },
  salon: { open: 'Abierta', in_progress: 'En atención', waiting_payment: 'Esperando pago', completed: 'Completada', cancelled: 'Cancelada' },
};

const PAYMENT_LABELS = { unpaid: 'Sin pagar', pending: 'Pago pendiente', paid: 'Pagado', refunded: 'Reembolsado', cancelled: 'Cancelado' };
const INVOICE_LABELS = { not_required: 'Sin comprobante requerido', pending: 'Comprobante pendiente', issued: 'Comprobante emitido', failed: 'Error de comprobante', cancelled: 'Comprobante cancelado' };
const KITCHEN_LABELS = { not_sent: 'No enviado a cocina', sent: 'Enviado a cocina', preparing: 'En preparación', ready: 'Listo', served: 'Servido', cancelled: 'Cancelado' };

const STATUS_TONES = {
  pending: 'warning', preparing: 'info', ready_to_dispatch: 'accent', on_route: 'neutral', delivered: 'success',
  received: 'warning', ready_for_pickup: 'accent', picked_up: 'success', open: 'accent', in_progress: 'info',
  waiting_payment: 'warning', completed: 'success', cancelled: 'danger', unpaid: 'warning', paid: 'success',
  refunded: 'neutral', not_required: 'neutral', issued: 'success', failed: 'danger', not_sent: 'neutral', sent: 'warning',
  ready: 'accent', served: 'success',
};

function normalizeOrderType(orderType = '') {
  return ORDER_TYPES.includes(orderType) ? orderType : 'salon';
}

function normalizeOperationalStatus(order = {}, orderType = 'salon') {
  const type = normalizeOrderType(orderType || order.orderType);
  const explicit = String(order.operationalStatus || '').trim();
  if (OPERATIONAL_LABELS[type]?.[explicit]) return explicit;
  const legacy = String(order.status || '').trim().toLowerCase();
  if (LEGACY_TO_OPERATIONAL[type]?.[legacy]) return LEGACY_TO_OPERATIONAL[type][legacy];
  return OPERATIONAL_FLOWS[type]?.[0] || 'open';
}

export function getLegacyOperationalStatus(orderType, status) {
  const type = normalizeOrderType(orderType);
  const normalized = normalizeOperationalStatus({ operationalStatus: status, status }, type);
  return OPERATIONAL_TO_LEGACY[type]?.[normalized] || normalized;
}

export function normalizePaymentStatus(order = {}) {
  const explicit = String(order.paymentStatus || '').trim();
  if (PAYMENT_LABELS[explicit]) return explicit;
  if (order.paymentConfirmed === true) return 'paid';
  if (String(order.paymentLabel || '').trim().toLowerCase() === 'pendiente') return 'pending';
  if (order.paymentMethod || order.paymentLabel) return 'pending';
  return 'unpaid';
}

export function normalizeInvoiceStatus(order = {}) {
  const explicit = String(order.invoiceStatus || '').trim();
  if (INVOICE_LABELS[explicit]) return explicit;
  if (order.documentIssued === true) return 'issued';
  if (String(order.documentType || '').trim().toLowerCase() === 'factura') return 'pending';
  return 'not_required';
}

export function normalizeKitchenStatus(order = {}) {
  const explicit = String(order.kitchenStatus || '').trim();
  if (KITCHEN_LABELS[explicit]) return explicit;
  if (order.sentToKitchen === true) return 'sent';
  return 'not_sent';
}

export function normalizeOrderState(order = {}, orderType = 'salon') {
  const type = normalizeOrderType(order.orderType || orderType);
  const operationalStatus = normalizeOperationalStatus(order, type);
  const paymentStatus = normalizePaymentStatus(order);
  const invoiceStatus = normalizeInvoiceStatus(order);
  const kitchenStatus = normalizeKitchenStatus(order);
  return { ...order, orderType: type, operationalStatus, paymentStatus, invoiceStatus, kitchenStatus, status: getLegacyOperationalStatus(type, operationalStatus) };
}

export function getNextOperationalStatus(orderType, currentStatus) {
  const type = normalizeOrderType(orderType);
  const status = normalizeOperationalStatus({ operationalStatus: currentStatus, status: currentStatus }, type);
  const flow = OPERATIONAL_FLOWS[type] || [];
  const currentIndex = flow.indexOf(status);
  if (currentIndex < 0 || currentIndex >= flow.length - 1) return null;
  return flow[currentIndex + 1];
}

export function canAdvanceOperationalStatus(order = {}, orderType = 'salon', requestedStatus = null) {
  const normalized = normalizeOrderState(order, orderType);
  const nextStatus = requestedStatus ? normalizeOperationalStatus({ operationalStatus: requestedStatus, status: requestedStatus }, normalized.orderType) : getNextOperationalStatus(normalized.orderType, normalized.operationalStatus);
  if (!nextStatus) return { allowed: false, reason: 'No hay un siguiente estado operativo.', nextStatus: null, order: normalized };
  if (TERMINAL_OPERATIONAL_STATUSES.has(normalized.operationalStatus)) return { allowed: false, reason: 'El pedido ya está en un estado final.', nextStatus: null, order: normalized };
  const expectedStatus = getNextOperationalStatus(normalized.orderType, normalized.operationalStatus);
  if (requestedStatus && nextStatus !== expectedStatus) return { allowed: false, reason: 'Transición operativa no permitida.', nextStatus: expectedStatus, order: normalized };
  return { allowed: true, reason: '', nextStatus, order: normalized };
}

export function advanceOperationalStatus(order = {}, orderType = 'salon', requestedStatus = null) {
  const guard = canAdvanceOperationalStatus(order, orderType, requestedStatus);
  if (!guard.allowed) return { success: false, ...guard };
  const updated = normalizeOrderState({ ...guard.order, operationalStatus: guard.nextStatus, status: getLegacyOperationalStatus(guard.order.orderType, guard.nextStatus), timeline: [...(Array.isArray(guard.order.timeline) ? guard.order.timeline : []), guard.nextStatus] }, guard.order.orderType);
  return { success: true, previousStatus: guard.order.operationalStatus, nextStatus: guard.nextStatus, order: updated };
}

export function getOperationalStatusLabel(orderType, status) {
  const type = normalizeOrderType(orderType);
  const normalized = normalizeOperationalStatus({ operationalStatus: status, status }, type);
  return OPERATIONAL_LABELS[type]?.[normalized] || normalized;
}

export function getPaymentStatusLabel(status) {
  return PAYMENT_LABELS[normalizePaymentStatus({ paymentStatus: status })] || status || 'Sin pagar';
}

export function getInvoiceStatusLabel(status) {
  return INVOICE_LABELS[normalizeInvoiceStatus({ invoiceStatus: status })] || status || 'Sin comprobante requerido';
}

export function getKitchenStatusLabel(status) {
  return KITCHEN_LABELS[normalizeKitchenStatus({ kitchenStatus: status })] || status || 'No enviado a cocina';
}

function makeChip(key, label, tone, type) {
  return { key, label, tone: tone || STATUS_TONES[key] || 'neutral', type };
}

export function getOrderStatusChips(order = {}, orderType = 'salon') {
  const normalized = normalizeOrderState(order, orderType);
  return {
    operational: makeChip(normalized.operationalStatus, getOperationalStatusLabel(normalized.orderType, normalized.operationalStatus), STATUS_TONES[normalized.operationalStatus], 'operational'),
    payment: makeChip(normalized.paymentStatus, getPaymentStatusLabel(normalized.paymentStatus), STATUS_TONES[normalized.paymentStatus], 'payment'),
    invoice: makeChip(normalized.invoiceStatus, getInvoiceStatusLabel(normalized.invoiceStatus), STATUS_TONES[normalized.invoiceStatus], 'invoice'),
    kitchen: makeChip(normalized.kitchenStatus, getKitchenStatusLabel(normalized.kitchenStatus), STATUS_TONES[normalized.kitchenStatus], 'kitchen'),
  };
}

export function isOrderSellable(order = {}, orderType = 'salon') {
  const normalized = normalizeOrderState(order, orderType);
  return normalized.paymentStatus === 'paid' || normalized.invoiceStatus === 'issued';
}

export function isOrderCompleted(order = {}, orderType = 'salon') {
  const normalized = normalizeOrderState(order, orderType);
  return TERMINAL_OPERATIONAL_STATUSES.has(normalized.operationalStatus);
}

export function canReleaseTable(tableOrder = {}) {
  const normalized = normalizeOrderState(tableOrder, 'salon');
  const items = Array.isArray(normalized.items) ? normalized.items : [];
  const hasItems = items.some((item) => Number(item?.quantity) > 0);
  const paidOrDocumented = normalized.paymentStatus === 'paid' || normalized.invoiceStatus === 'issued';
  if (!hasItems) return { allowed: true, reason: 'Mesa sin ítems activos.', order: normalized };
  if (!paidOrDocumented) return { allowed: false, reason: 'No puedes liberar la mesa: el pago sigue pendiente.', order: normalized };
  return { allowed: true, reason: '', order: normalized };
}

export const orderStateMeta = { ORDER_TYPES, OPERATIONAL_FLOWS, LEGACY_TO_OPERATIONAL, OPERATIONAL_TO_LEGACY };
