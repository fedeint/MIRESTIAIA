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
      label: 'Delivery afiliados',
      helper: 'Empresas vinculadas que nutren pedidos delivery.',
      items: getDeliveryPartnersMock(),
    },
    takeawayChat: {
      label: 'Canal WhatsApp',
      helper: 'Mensajes simulados para crear pedidos de para llevar.',
      feed: getTakeawayChatFeedMock(),
    },
  };
}
