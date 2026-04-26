import { CLIENTES_MOCK_DATA } from './clientes-data.js';

document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // RENDERIZAR FUNNEL DE CONVERSIÓN
    // ==========================================
    const funnelData = [
        { label: "Enviados", value: 5000, percent: 100, class: "bg-f1" },
        { label: "Leídos", value: 3450, percent: 69, class: "bg-f2" },
        { label: "Respondieron", value: 1150, percent: 23, class: "bg-f3" },
        { label: "Visitaron / Compraron", value: 600, percent: 12, class: "bg-f4" }
    ];

    const funnelArea = document.getElementById('funnelRenderArea');
    if (funnelArea) {
        funnelArea.innerHTML = funnelData.map(step => `
            <div class="funnel-step">
                <div class="funnel-label">
                    <span>${step.label}</span>
                    <span>${step.value.toLocaleString()} (${step.percent}%)</span>
                </div>
                <div class="funnel-bar-bg">
                    <div class="funnel-bar-fill ${step.class}" style="width: 0%;" data-target="${step.percent}%"></div>
                </div>
            </div>
        `).join('');

        // Animación progresiva de las barras al cargar
        setTimeout(() => {
            document.querySelectorAll('.funnel-bar-fill').forEach(bar => {
                bar.style.width = bar.getAttribute('data-target');
            });
        }, 100);
    }

    // ==========================================
    // CONECTAR A DB Y RENDERIZAR TOP 10
    // ==========================================
    
    // Clonar la BD y generar datos de relleno para llegar a 10 (solo para propósitos visuales de este demo)
    let topClients = [...CLIENTES_MOCK_DATA].filter(c => (c.tipo || '').toLowerCase() !== 'proveedor');
    
    // Lógica para rellenar hasta 10 clientes si tu mock tiene poquitos
    if (topClients.length < 10) {
        const names = ["Roberto Sánchez", "Lucía Gómez", "Jorge Díaz", "Carmen Vega", "Miguel Castro", "Sofía Luna", "Andrés Silva", "Elena Roca"];
        for (let i = topClients.length; i < 10; i++) {
            topClients.push({
                id: 100 + i,
                nombre: names[i % names.length],
                email: names[i % names.length].toLowerCase().replace(' ', '.') + "@mail.com",
                ltv: 1500 - (i * 100),
                pedidos: 10 - i,
                tipo: i < 3 ? "VIP" : (i < 6 ? "Frecuente" : "Regular"),
                avatar: names[i % names.length].substring(0, 2).toUpperCase()
            });
        }
    }

    // Ordenar de mayor a menor por LTV
    topClients.sort((a, b) => (b.ltv || 0) - (a.ltv || 0));
    const top10 = topClients.slice(0, 10);

    // Pintar tabla conectada al modal de Perfil 360 global
    const tableBody = document.getElementById('topClientsTable');
    if (tableBody) {
        tableBody.innerHTML = top10.map((c, index) => {
            const rankClass = index < 3 ? `rank-${index + 1}` : '';
            const badgeClass = c.tipo === 'VIP' ? 'vip' : (c.tipo === 'Frecuente' ? 'nuevo' : 'habitual');
            return `
            <tr class="client-row-clickable" onclick='window.openProfileView(${JSON.stringify(c).replace(/'/g, "&apos;")})'>
                <td><div class="rank-number ${rankClass}">${index + 1}</div></td>
                <td><strong style="color:#0f172a; font-size:14px; display:block;">${c.nombre}</strong><span style="color:#64748b; font-size:12px;">${c.email}</span></td>
                <td><strong style="color:#ea580c; font-size:15px;">S/ ${(c.ltv || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></td>
                <td><span style="color:#334155; font-size:14px; font-weight:500;">${c.pedidos} pedidos</span></td>
                <td><span class="status-badge ${badgeClass}">${c.tipo}</span></td>
            </tr>`;
        }).join('');
    }
});