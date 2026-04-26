import { CLIENTES_MOCK_DATA } from './clientes-data.js';

document.addEventListener('DOMContentLoaded', () => {
    // Datos Integrados con el sistema central
    const inboxData = CLIENTES_MOCK_DATA.map((c, index) => {
        const isProv = (c.tipo || '').toLowerCase() === 'proveedor';
        
        let mensajes = [];
        if (isProv) {
            mensajes = [
                { text: "Buenos días, le envié la lista de precios actualizada.", time: "Ayer 08:00", type: "received", status: "" },
                { text: "Gracias, reviso y te paso el pedido al mediodía.", time: "Ayer 08:15", type: "sent", status: "read" },
                { text: "Necesito un nuevo lote de insumos para mañana a primera hora.", time: "Ayer 12:00", type: "sent", status: "delivered" }
            ];
        } else {
            mensajes = [
                { text: "Hola, quisiera reservar una mesa para 4 personas.", time: "10:30", type: "received", status: "" },
                { text: `¡Hola ${c.nombre.split(' ')[0]}! Claro que sí, ¿a qué hora te esperamos?`, time: "10:32", type: "sent", status: "read" },
                { text: "A las 8:00 PM por favor.", time: "10:35", type: "received", status: "" }
            ];
        }

        return {
            ...c, // Heredamos data original para el modal 360°
            id: c.id,
            nombre: c.nombre,
            telefono: c.telefono || "+51 987 654 321",
            email: c.email,
            tipo: isProv ? "proveedor" : "cliente",
            avatar: c.avatar || c.nombre.substring(0, 2).toUpperCase(),
            color: isProv ? "#10b981" : "linear-gradient(135deg, #fb923c, #f97316)",
            isOnline: index % 2 === 0,
            isBot: false,
            unread: index === 1 ? 1 : 0,
            
            // Propiedades Cliente adaptadas
            ltv: c.ltv || 0,
            pedidos: c.pedidos || 0,
            ticketPromedio: c.ticketPromedio || 0,
            ultimaVisita: c.ultimaVisita || "Hace unos días",
            fav: c.comportamiento?.platos?.[0] || "-",
            statusText: c.tipo || "Regular",
            
            // Propiedades Proveedor adaptadas
            deuda: isProv ? (c.ltv * 0.15) : 0,
            creditDias: "15 días",
            proxVencimiento: "15/05/2026",
            tiempoEntrega: "~24 hrs",
            mensajes: mensajes
        };
    });

    const chatListContainer = document.getElementById('chatListContainer');
    const chatHeader = document.getElementById('chatHeader');
    const chatMessages = document.getElementById('chatMessages');
    const chatContextPanel = document.getElementById('chatContextPanel');
    const filterPills = document.querySelectorAll('.inbox-pill');
    const searchInput = document.getElementById('chatSearchInput');

    let activeFilter = 'todos';
    let activeChatId = null; // Inicia sin un chat seleccionado por defecto

    // RENDER LISTA DE CHATS
    function renderList() {
        const term = searchInput.value.toLowerCase();
        const filtered = inboxData.filter(c => {
            const matchFilter = activeFilter === 'todos' || c.tipo === activeFilter;
            const matchSearch = c.nombre.toLowerCase().includes(term) || c.mensajes[c.mensajes.length-1].text.toLowerCase().includes(term);
            return matchFilter && matchSearch;
        });

        chatListContainer.innerHTML = filtered.map(c => {
            const lastMsg = c.mensajes[c.mensajes.length - 1];
            const badgeHTML = c.tipo === 'proveedor' ? '<span class="badge-prov">Proveedor</span>' : (c.isBot ? '<span class="badge-bot"><i class="fa-solid fa-robot"></i> Bot</span>' : '');
            const unreadHTML = c.unread > 0 ? `<div class="badge-unread">${c.unread}</div>` : '';
            
            return `
            <div class="chat-item ${c.id === activeChatId ? 'active' : ''}" data-id="${c.id}">
                <div class="chat-avatar" style="background: ${c.tipo==='cliente'? c.color : c.color}; color:white;">
                    ${c.avatar}
                    ${c.isOnline ? '<span class="online-dot"></span>' : ''}
                </div>
                <div class="chat-info">
                    <div class="chat-name-row">
                        <span class="chat-name">${c.nombre} ${badgeHTML}</span>
                        <span class="chat-time">${lastMsg.time}</span>
                    </div>
                    <div class="chat-preview-row">
                        <span class="chat-preview">${lastMsg.text}</span>
                        ${unreadHTML}
                    </div>
                </div>
            </div>`;
        }).join('');
    }

    // RENDER CHAT ACTIVO Y MINI CRM
    function renderActiveChat() {
        const c = inboxData.find(x => x.id === activeChatId);
        const inputContainer = document.querySelector('.chat-input-container');
        
        // ESTADO VACÍO (Si no hay chat seleccionado)
        if (!c) {
            chatHeader.innerHTML = '';
            chatMessages.innerHTML = `
                <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; color:#94a3b8; text-align:center;">
                    <i class="fa-regular fa-comments" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
                    <p style="font-size: 16px; font-weight: 500;">Selecciona una conversación para empezar</p>
                </div>`;
            if (inputContainer) inputContainer.style.display = 'none';
            chatContextPanel.innerHTML = `
                <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; color:#94a3b8; text-align:center;">
                    <i class="fa-solid fa-address-card" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
                    <p style="font-size: 14px; font-weight: 500;">Perfil del contacto</p>
                </div>`;
            return;
        }
        if (inputContainer) inputContainer.style.display = 'flex';

        // Cabecera
        chatHeader.innerHTML = `
            <div class="chat-header-info">
                <div class="chat-avatar" style="background: ${c.color}; color:white;">${c.avatar}</div>
                <div class="chat-header-text">
                    <h3>${c.nombre} <i class="fa-brands fa-whatsapp" style="color:#25d366;"></i></h3>
                    <p>${c.telefono} · ${c.isOnline ? '<span style="color:#16a34a; font-weight:600;">En línea</span>' : 'Desconectado'}</p>
                </div>
            </div>
            <button class="btn-secondary" id="btnOpenProfile" style="padding: 8px 16px; font-size:13px; border-radius:8px;">Ver perfil 360°</button>
        `;

        document.getElementById('btnOpenProfile').addEventListener('click', () => {
            if (typeof window.openProfileView === 'function') window.openProfileView(c);
        });

        // Mensajes
        chatMessages.innerHTML = c.mensajes.map(m => {
            const checkIcon = m.type === 'sent' ? (m.status === 'read' ? '<i class="fa-solid fa-check-double read"></i>' : '<i class="fa-solid fa-check-double"></i>') : '';
            return `
            <div class="msg-wrapper ${m.type}">
                <div class="msg-bubble">${m.text}</div>
                <div class="msg-meta">${m.time} ${checkIcon}</div>
            </div>`;
        }).join('');
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Mini CRM (Panel Derecho)
        if (c.tipo === 'cliente') {
            chatContextPanel.innerHTML = `
                <div class="context-card">
                    <div class="context-avatar" style="background: ${c.color};">${c.avatar}</div>
                    <h3>${c.nombre}</h3>
                    <span class="badge ${c.statusText === 'VIP' ? 'vip' : 'habitual'}">${c.statusText}</span>
                </div>
                <div class="context-kpi-block kpi-client"><span>Lifetime Value</span><strong>S/ ${(c.ltv).toLocaleString('en-US', {minimumFractionDigits:2})}</strong><p>${c.pedidos} pedidos históricos</p></div>
                <ul class="context-info-list">
                    <li><span>Ticket Promedio</span><strong>S/ ${c.ticketPromedio.toFixed(2)}</strong></li>
                    <li><span>Última Visita</span><strong>${c.ultimaVisita}</strong></li>
                    <li><span>Favorito</span><strong>${c.fav}</strong></li>
                </ul>
                <div class="context-actions"><button class="btn-orange-gradient" style="justify-content:center;"><i class="fa-solid fa-plus"></i> Crear Pedido</button><button class="btn-secondary" style="justify-content:center;"><i class="fa-regular fa-note-sticky"></i> Agregar Nota</button></div>
            `;
        } else {
            chatContextPanel.innerHTML = `
                <div class="context-card">
                    <div class="context-avatar" style="background: ${c.color};"><i class="fa-solid fa-truck"></i></div>
                    <h3>${c.nombre}</h3>
                    <span class="badge" style="background:#dcfce7; color:#16a34a;">${c.statusText}</span>
                </div>
                <div class="context-kpi-block kpi-prov" style="background:#fefce8; border:1px solid #fef08a; color:#854d0e;"><span>Deuda Pendiente</span><strong>S/ ${(c.deuda).toFixed(2)}</strong><p>Crédito: ${c.creditDias}</p></div>
                <ul class="context-info-list">
                    <li><span>Próx. Vencimiento</span><strong style="color:#ea580c;">${c.proxVencimiento}</strong></li>
                    <li><span>Tiempo Entrega</span><strong>${c.tiempoEntrega}</strong></li>
                </ul>
                <div class="context-actions"><button class="btn-orange-gradient" style="justify-content:center;"><i class="fa-solid fa-file-invoice"></i> Orden de Compra</button><button class="btn-secondary" style="justify-content:center;"><i class="fa-solid fa-money-bill-wave"></i> Registrar Pago</button></div>
            `;
        }
    }

    // Event Listeners
    filterPills.forEach(p => p.addEventListener('click', (e) => { filterPills.forEach(btn => btn.classList.remove('active')); e.target.classList.add('active'); activeFilter = e.target.dataset.filter; renderList(); }));
    searchInput.addEventListener('input', renderList);
    chatListContainer.addEventListener('click', (e) => { const item = e.target.closest('.chat-item'); if(item) { activeChatId = parseInt(item.dataset.id); renderList(); renderActiveChat(); } });

    // Init
    renderList();
    renderActiveChat();
});