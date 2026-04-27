import {
  getDeliveryPartnersMock,
  getKitchenBoardMock,
  getRecipeAvailabilityMock,
  getTakeawayChatFeedMock,
} from '../repositories/catalog.repository.js';

export function getPedidosConnectedModulesMock() {
  return {
    kitchen: {
      label: 'Cocina',
      helper: 'Pedidos enviados desde salón, delivery y para llevar.',
      tickets: getKitchenBoardMock(),
    },
    recipes: {
      label: 'Recetas',
      helper: 'Disponibilidad de platos y estaciones de cocina.',
      availability: getRecipeAvailabilityMock(),
    },
    deliveryPartners: {
      label: 'Redes / canales (Pedidos)',
      helper: 'Canales y alianzas asociados al módulo Pedidos (mismo universo que el modo Delivery).',
      items: getDeliveryPartnersMock(),
    },
    takeawayChat: {
      label: 'Canal WhatsApp',
      helper: 'Mensajes simulados para crear pedidos de para llevar.',
      feed: getTakeawayChatFeedMock(),
    },
  };
}
