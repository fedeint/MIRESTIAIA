import { getDeliveryOrdersMock, getSalonTablesMock, getTakeawayOrdersMock } from '../repositories/orders.repository.js';

export function getDashboardSummaryMock() {
  const tables = getSalonTablesMock();
  const delivery = getDeliveryOrdersMock();
  const takeaway = getTakeawayOrdersMock();

  const occupiedTables = tables.filter((table) => table.status === 'ocupada').length;
  const pendingDelivery = delivery.filter((order) => order.status !== 'entregado').length;
  const pendingTakeaway = takeaway.filter((order) => order.status !== 'entregado').length;

  return {
    greeting: 'Buenos días, Administrador',
    restaurantLabel: 'MiRest con IA · Pedidos',
    pendingCards: [
      {
        id: 'pending-tables',
        label: 'Mesas activas',
        helper: `${occupiedTables} mesas en servicio ahora`,
        cta: 'Revisar salón',
      },
      {
        id: 'pending-delivery',
        label: 'Delivery pendiente',
        helper: `${pendingDelivery} pedidos requieren seguimiento`,
        cta: 'Ver delivery',
      },
      {
        id: 'pending-takeaway',
        label: 'Para llevar',
        helper: `${pendingTakeaway} pedidos por validar`,
        cta: 'Ver recojo',
      },
    ],
    quickStats: {
      sales: 'S/ 1250.00',
      tables: occupiedTables,
      delivery: pendingDelivery,
      takeaway: pendingTakeaway,
    },
  };
}
