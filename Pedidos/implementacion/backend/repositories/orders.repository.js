import salonData from '../data/orders-salon.json' with { type: 'json' };
import deliveryData from '../data/orders-delivery.json' with { type: 'json' };
import takeawayData from '../data/orders-takeaway.json' with { type: 'json' };

export function getSalonTablesMock() {
  return structuredClone(salonData.tables || []);
}

export function getDeliveryOrdersMock() {
  return structuredClone(deliveryData.orders || []);
}

export function getTakeawayOrdersMock() {
  return structuredClone(takeawayData.orders || []);
}
