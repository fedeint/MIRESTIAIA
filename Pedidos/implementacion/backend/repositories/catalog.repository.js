import catalogData from '../data/catalog.json' with { type: 'json' };
import staffData from '../data/staff.json' with { type: 'json' };
import { deliveryPartners, kitchenBoardSeed, recipeAvailability, takeawayChatFeed } from '../../data.js';

export function getCatalogMock() {
  return structuredClone(catalogData);
}

export function getStaffMock() {
  return structuredClone(staffData);
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
