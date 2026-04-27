import { deliveryPartners, kitchenBoardSeed, recipeAvailability, takeawayChatFeed } from '../../data.js';

const EMPTY_CATALOG = {
  categories: [{ id: 'all', name: 'Todos' }],
  products: [],
};

const EMPTY_STAFF = { waiters: [], couriers: [], zones: [] };

/**
 * Catálogo vacío: la PWA hoy hidrata desde `loadOperationalCatalog` (Supabase).
 */
export function getCatalogMock() {
  return structuredClone(EMPTY_CATALOG);
}

export function getStaffMock() {
  return structuredClone(EMPTY_STAFF);
}

export function getDeliveryPartnersMock() {
  return structuredClone(deliveryPartners);
}

export function getRecipeAvailabilityMock() {
  return structuredClone(recipeAvailability);
}

export function getKitchenBoardMock() {
  return structuredClone(kitchenBoardSeed);
}

export function getTakeawayChatFeedMock() {
  return structuredClone(takeawayChatFeed);
}
