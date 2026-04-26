import { getPedidosBootstrapPayload } from '../services/orders.service.js';

export function buildPedidosBootstrapResponse() {
  return {
    ok: true,
    generatedAt: new Date().toISOString(),
    data: getPedidosBootstrapPayload(),
  };
}
