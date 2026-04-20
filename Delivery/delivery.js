/**
 * MiRest con IA - Delivery Hub Controller
 */

import { DELIVERY_MOCK_DATA } from "./delivery-data.js";
import { createOrderCard, renderMetricCard } from "./delivery-components.js";

let currentData = [...DELIVERY_MOCK_DATA];

export function initDeliveryHub() {
  updateMetrics(); // Renderizar métricas primero
  renderKanban();
  setupSearch();
  
  if (window.lucide) window.lucide.createIcons();
}

function updateMetrics() {
  const metricsContainer = document.getElementById('metricsContainer');
  if (!metricsContainer) return;

  const metrics = [
    { id: 'statIngresos', label: 'Ingresos del Día', value: 'S/ 4,280', icon: 'dollar-sign', variant: 'accent' },
    { id: 'statMejorCanal', label: 'Mejor Canal', value: 'Rappi · 45%', icon: 'trending-up', variant: 'success' },
    { id: 'statDrivers', label: 'Drivers Activos', value: '12', icon: 'bike', variant: 'info' },
    { id: 'statEstadoApi', label: 'Estado APIs', value: 'Online', icon: 'activity', variant: 'success' }
  ];

  metricsContainer.innerHTML = metrics.map(m => 
    renderMetricCard(m.id, m.label, m.value, m.icon, m.variant)
  ).join('');
}

function renderKanban(filter = "") {
  const columns = {
    pendiente: document.getElementById('colPendiente'),
    preparacion: document.getElementById('colPreparacion'),
    listo: document.getElementById('colListo')
  };

  Object.values(columns).forEach(col => { if (col) col.innerHTML = ""; });

  const filteredData = currentData.filter(order => 
    order.customer.toLowerCase().includes(filter.toLowerCase()) ||
    order.id.toLowerCase().includes(filter.toLowerCase())
  );

  filteredData.forEach(order => {
    const card = createOrderCard(order, handleOrderAction);
    const targetCol = columns[order.status];
    if (targetCol) targetCol.appendChild(card);
  });

  updateCounters(filteredData);
  if (window.lucide) window.lucide.createIcons();
}

function handleOrderAction(orderId, currentStatus) {
  const order = currentData.find(o => o.id === orderId);
  if (!order) return;

  if (currentStatus === 'pendiente') {
    order.status = 'preparacion';
  } else if (currentStatus === 'preparacion') {
    order.status = 'listo';
  } else {
    currentData = currentData.filter(o => o.id !== orderId);
  }
  
  renderKanban(document.getElementById('orderSearch')?.value || "");
}

function updateCounters(data) {
  const counts = {
    pendiente: data.filter(o => o.status === 'pendiente').length,
    preparacion: data.filter(o => o.status === 'preparacion').length,
    listo: data.filter(o => o.status === 'listo').length
  };

  document.getElementById('countPendiente').textContent = counts.pendiente;
  document.getElementById('countPreparacion').textContent = counts.preparacion;
  document.getElementById('countListo').textContent = counts.listo;
}

function setupSearch() {
  const searchInput = document.getElementById('orderSearch');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderKanban(e.target.value);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.body.dataset.moduleKey === 'delivery-afiliados') {
    initDeliveryHub();
  }
});
