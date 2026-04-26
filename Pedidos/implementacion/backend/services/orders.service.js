import {
  getCatalogMock,
  getDeliveryPartnersMock,
  getKitchenBoardMock,
  getRecipeAvailabilityMock,
  getStaffMock,
  getTakeawayChatFeedMock,
} from '../repositories/catalog.repository.js';
import { getDeliveryOrdersMock, getSalonTablesMock, getTakeawayOrdersMock } from '../repositories/orders.repository.js';

export function getPedidosBootstrapPayload() {
  return {
    catalog: getCatalogMock(),
    staff: getStaffMock(),
    recipes: getRecipeAvailabilityMock(),
    kitchen: getKitchenBoardMock(),
    deliveryPartners: getDeliveryPartnersMock(),
    takeawayChat: getTakeawayChatFeedMock(),
    salon: { tables: getSalonTablesMock() },
    delivery: { orders: getDeliveryOrdersMock() },
    takeaway: { orders: getTakeawayOrdersMock() },
  };
}
