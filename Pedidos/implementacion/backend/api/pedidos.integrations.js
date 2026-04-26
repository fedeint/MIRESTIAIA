import { getPedidosConnectedModulesMock } from '../services/integration.service.js';

export function buildPedidosIntegrationsResponse() {
  return {
    ok: true,
    generatedAt: new Date().toISOString(),
    data: getPedidosConnectedModulesMock(),
  };
}
