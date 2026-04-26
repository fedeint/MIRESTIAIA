/**
 * Clientes/clientes.js
 * Lógica principal para el módulo de Clientes
 * ✅ CORREGIDO: IDs del modal alineados con clientes.html
 */

import { CLIENTES_MOCK_DATA } from './clientes-data.js';

document.addEventListener('DOMContentLoaded', () => {

    // --- ELEMENTOS DOM ---
    const kpiContainer       = document.getElementById('kpi-container');
    const tableBody          = document.getElementById('crm-table-body');
    const gridContainer      = document.getElementById('crm-grid-container');
    const btnViewList        = document.getElementById('btnViewList');
    const btnViewGrid        = document.getElementById('btnViewGrid');
    const viewList           = document.getElementById('view-list');
    const viewGrid           = document.getElementById('view-grid');
    const searchInput        = document.getElementById('crmSearch');
    const filterBtns         = document.querySelectorAll('.crm-filter-btn');

    let currentFilter = 'Todos';
    let searchTerm    = '';

    // --- HELPERS ---
    const getBadgeClass = (badge) => {
        if (!badge) return '';
        const b = badge.toLowerCase();
        if (b.includes('vip') || b.includes('fieles') || b.includes('alto valor')) return 'vip';
        if (b.includes('habitual') || b.includes('regular') || b.includes('frecuente')) return 'habitual';
        if (b.includes('nuevo')) return 'nuevo';
        if (b.includes('proveedor')) return 'nuevo';
        return 'habitual';
    };

    // --- KPIs ---
    function renderKPIs(clients) {
        const total       = clients.length;
        const ltvTotal    = clients.reduce((acc, c) => acc + (c.ltv || 0), 0);
        const ltvPromedio = total > 0 ? ltvTotal / total : 0;
        const suscritos   = clients.filter(c => c.suscrito).length;

        const kpis = [
            { label: "Total de Clientes",    value: total.toString(),                        icon: "fa-users",      highlight: false },
            { label: "LTV Promedio",          value: `S/ ${ltvPromedio.toFixed(2)}`,          icon: "fa-sack-dollar", highlight: true  },
            { label: "Suscritos a Campañas", value: suscritos.toString(),                    icon: "fa-bullhorn",   highlight: false },
            { label: "Nuevos este mes",       value: "1",                                     icon: "fa-chart-line", highlight: false }
        ];

        if (kpiContainer) {
            kpiContainer.innerHTML = kpis.map(kpi => `
                <div class="crm-kpi-card">
                    <div class="kpi-icon ${kpi.highlight ? 'highlight' : ''}">
                        <i class="fa-solid ${kpi.icon}"></i>
                    </div>
                    <div class="kpi-data">
                        <span class="kpi-label">${kpi.label}</span>
                        <span class="kpi-value">${kpi.value}</span>
                    </div>
                </div>
            `).join('');
        }
    }

    // --- RENDER TABLA Y GRILLA ---
    function renderViews(clients) {
        // Tabla
        if (tableBody) {
            tableBody.innerHTML = clients.map(c => {
                const badges = [c.tipo, c.arquetipo].filter(Boolean);
                return `
                <tr data-id="${c.id}" style="cursor: pointer;" title="Ver perfil de ${c.nombre}">
                    <td>
                        <div class="td-client">
                            <div class="avatar-circle">${c.avatar || c.nombre.substring(0, 2).toUpperCase()}</div>
                            <div>
                                <span class="client-name">${c.nombre}</span>
                                <span class="client-email">${c.email || ''}</span>
                            </div>
                        </div>
                    </td>
                    <td>
                        <span class="act-date">${c.ultimaVisita || '-'}</span>
                        <span class="act-phone">${c.telefono || '-'}</span>
                    </td>
                    <td>
                        <span class="order-count">${c.pedidos || 0}</span>
                        <span class="order-ticket">Promedio: S/ ${(c.ticketPromedio || 0).toFixed(2)}</span>
                    </td>
                    <td>
                        <span class="ltv-value">S/ ${(c.ltv || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </td>
                    <td>
                        <div class="badges-container">
                            ${badges.map(b => `<span class="badge ${getBadgeClass(b)}">${b}</span>`).join('')}
                        </div>
                    </td>
                </tr>`;
            }).join('');
        }

        // Grilla
        if (gridContainer) {
            gridContainer.innerHTML = clients.map(c => {
                const badges = [c.tipo, c.arquetipo].filter(Boolean);
                return `
                <div class="crm-card" data-id="${c.id}" style="cursor: pointer;" title="Ver perfil de ${c.nombre}">
                    <div class="avatar-circle">${c.avatar || c.nombre.substring(0, 2).toUpperCase()}</div>
                    <span class="client-name">${c.nombre}</span>
                    <span class="client-email">${c.email || ''}</span>
                    <div class="crm-card-stats">
                        <div class="stat-box">
                            <span class="stat-box-label">LTV</span>
                            <span class="stat-box-value">S/ ${(c.ltv || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div class="stat-box">
                            <span class="stat-box-label">Pedidos</span>
                            <span class="stat-box-value">${c.pedidos || 0}</span>
                        </div>
                    </div>
                    <div class="badges-container">
                        ${badges.map(b => `<span class="badge ${getBadgeClass(b)}">${b}</span>`).join('')}
                    </div>
                </div>`;
            }).join('');
        }

        // Re-inicializar iconos Lucide si están disponibles
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    // --- CAMBIO DE VISTA ---
    function switchView(viewType) {
        if (!viewList || !viewGrid) return;
        if (viewType === 'list') {
            viewList.style.display  = 'block';
            viewGrid.style.display  = 'none';
            btnViewList?.classList.add('active');
            btnViewGrid?.classList.remove('active');
        } else {
            viewList.style.display  = 'none';
            viewGrid.style.display  = 'block';
            btnViewGrid?.classList.add('active');
            btnViewList?.classList.remove('active');
        }
    }

    btnViewList?.addEventListener('click', () => switchView('list'));
    btnViewGrid?.addEventListener('click', () => switchView('grid'));

    // --- FILTROS Y BÚSQUEDA ---
    function applyFilters() {
        const term     = searchTerm.toLowerCase();
        const filtered = CLIENTES_MOCK_DATA.filter(c => {
            const matchesSearch =
                c.nombre.toLowerCase().includes(term) ||
                (c.email    || '').toLowerCase().includes(term) ||
                (c.telefono || '').includes(term);

            let matchesFilter = true;
            if (currentFilter === 'Clientes') {
                matchesFilter = (c.tipo || '').toLowerCase() !== 'proveedor';
            } else if (currentFilter === 'Proveedores') {
                matchesFilter = (c.tipo || '').toLowerCase() === 'proveedor';
            } else if (currentFilter === 'Fieles') {
                matchesFilter = (c.tipo || '').toLowerCase() === 'vip' || c.suscrito;
            }

            return matchesSearch && matchesFilter;
        });

        renderViews(filtered);
        renderKPIs(filtered);
    }

    searchInput?.addEventListener('input', (e) => {
        searchTerm = e.target.value;
        applyFilters();
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.textContent.trim();
            applyFilters();
        });
    });

    // ================================================================

    // ✅ Delegación de eventos: captura clicks en filas de tabla Y tarjetas de grilla
    document.addEventListener('click', (e) => {
        // No abrir perfil si el click fue en un botón de acción (editar, eliminar)
        if (e.target.closest('.btn-card-action, .btn-icon')) return;

        const target = e.target.closest('.crm-card[data-id], .crm-table tbody tr[data-id]');
        if (target?.dataset.id) {
            const client = CLIENTES_MOCK_DATA.find(c => c.id === parseInt(target.dataset.id));
            if (client && typeof window.openProfileView === 'function') {
                window.openProfileView(client);
            }
        }
    });

    // --- INICIALIZAR ---
    applyFilters();
    if (typeof lucide !== 'undefined') lucide.createIcons();
});