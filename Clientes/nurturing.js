document.addEventListener('DOMContentLoaded', () => {
    const directory = document.getElementById('nurturingDirectory');
    const panel = document.getElementById('nurturingPanel');
    const overlay = document.getElementById('nurturingPanelOverlay');
    const btnClose = document.getElementById('btnCloseNPanel');

    const modalSeq = document.getElementById('modalNewSequence');
    const btnNewSeq = document.getElementById('btnNewSequence');
    const btnCloseSeq = document.getElementById('btnCloseSeqModal');
    const btnCancelSeq = document.getElementById('btnCancelSeq');
    const formSeq = document.getElementById('formNewSequence');

    const mockNurturingClients = [
        {
            id: 1,
            nombre: "María García Ruiz",
            email: "maria.garcia@email.com",
            avatar: "MG",
            pedidos: 72,
            estado: "VIP",
            actividad: "Cliente Activo",
            ultimaVisita: "hace 3 días",
            clienteDesde: "2023",
            ltv: "8,640",
            puntos: "4,320",
            arquetipo: {
                nombre: "El Ejecutivo Habitual",
                desc: "Cliente de alta frecuencia en horarios de almuerzo corporativo.",
                tags: ["Almuerzo ejecutivo", "Pide por app", "Paga puntual"]
            },
            churn: { text: "Bajo - 8%", width: 8, score: 92 },
            comportamiento: {
                horario: "12:30 PM - 2:00 PM",
                dias: "Lunes a Jueves",
                freq: "3 veces por semana",
                ticket: "S/ 120",
                favs: [
                    { nombre: "Lomo Saltado Clásico", cant: 45 },
                    { nombre: "Ceviche Carretillero", cant: 20 },
                    { nombre: "Chicha Morada 1L", cant: 15 }
                ]
            },
            secuencias: [
                { nombre: "Cumpleaños VIP", desc: "Regalo de postre + 20% dcto", estado: "Activa", clase: "vip" },
                { nombre: "Post-visita agradecimiento", desc: "Email enviado 24h después", estado: "Completada", clase: "habitual" },
                { nombre: "Reactivación 30 días", desc: "Si no visita en 30 días", estado: "En espera", clase: "altovalor" }
            ]
        },
        { id: 2, nombre: "Carlos Mendoza", email: "carlos.m@mail.com", avatar: "CM", pedidos: 12, estado: "Nuevo", actividad: "En Riesgo", ultimaVisita: "hace 25 días", clienteDesde: "2024", ltv: "1,250", puntos: "600", arquetipo: { nombre: "Visitante Ocasional", desc: "Viene en grupos los fines de semana.", tags: ["Fin de semana", "Grupos grandes"] }, churn: { text: "Medio - 35%", width: 35, score: 65 }, comportamiento: { horario: "20:00 PM - 22:00 PM", dias: "Sábados", freq: "1 vez al mes", ticket: "S/ 250", favs: [ { nombre: "Parrilla Familiar", cant: 8 }, { nombre: "Pisco Sour", cant: 4 } ] }, secuencias: [ { nombre: "Bienvenida Automatizada", desc: "Email al registrarse", estado: "Completada", clase: "habitual" }, { nombre: "Reactivación Finde", desc: "Promo para Sábado", estado: "Activa", clase: "vip" } ] },
        { id: 3, nombre: "Ana Rivera", email: "ana.r@mail.com", avatar: "AR", pedidos: 35, estado: "Regular", actividad: "Cliente Activo", ultimaVisita: "hace 7 días", clienteDesde: "2023", ltv: "3,100", puntos: "1,550", arquetipo: { nombre: "Fan del Delivery", desc: "Pide comida para llevar a su oficina.", tags: ["Delivery", "Oficina", "App"] }, churn: { text: "Bajo - 12%", width: 12, score: 88 }, comportamiento: { horario: "13:00 PM - 14:00 PM", dias: "Martes y Jueves", freq: "2 veces por semana", ticket: "S/ 85", favs: [ { nombre: "Ají de Gallina", cant: 20 }, { nombre: "Menu Ejecutivo", cant: 15 } ] }, secuencias: [ { nombre: "Promo Delivery Jueves", desc: "Envío gratis", estado: "Activa", clase: "vip" } ] }
    ];

    function renderCards() {
        directory.innerHTML = mockNurturingClients.map(c => `
            <div class="n-card" onclick="openNurturingProfile(${c.id})">
                <div class="n-avatar">${c.avatar}</div>
                <h3 class="n-name">${c.nombre}</h3>
                <p class="n-email"><i class="fa-solid fa-envelope"></i> ${c.email}</p>
                <div class="n-metrics">
                    <span class="badge habitual">${c.pedidos} Pedidos</span>
                    <span class="badge ${c.estado === 'VIP' ? 'vip' : 'altovalor'}">${c.estado}</span>
                </div>
            </div>
        `).join('');
    }

    window.openNurturingProfile = function(id) {
        const c = mockNurturingClients.find(x => x.id === id);
        if(!c) return;

        document.getElementById('np-name').textContent = c.nombre.split(' ')[0] + ' ' + (c.nombre.split(' ')[1] || '');
        document.getElementById('np-visit').textContent = c.ultimaVisita;
        const statusTag = document.getElementById('np-status-tag');
        statusTag.textContent = c.actividad;
        statusTag.className = `badge ${c.actividad === 'Cliente Activo' ? 'active-client' : 'altovalor'}`;

        document.getElementById('np-avatar').textContent = c.avatar;
        document.getElementById('np-full-name').textContent = c.nombre;
        document.getElementById('np-badge').textContent = c.estado;
        document.getElementById('np-pedidos-badge').textContent = `${c.pedidos} Pedidos`;
        document.getElementById('np-desde').textContent = c.clienteDesde;
        document.getElementById('np-pedidos').textContent = c.pedidos;
        document.getElementById('np-ltv').textContent = `S/ ${c.ltv}`;
        document.getElementById('np-puntos').textContent = c.puntos;
        document.getElementById('np-arq-name').textContent = c.arquetipo.nombre;
        document.getElementById('np-arq-desc').textContent = c.arquetipo.desc;
        document.getElementById('np-arq-tags').innerHTML = c.arquetipo.tags.map(t => `<span>${t}</span>`).join('');
        document.getElementById('np-churn-bar').style.width = `${c.churn.width}%`;
        document.getElementById('np-churn-text').textContent = c.churn.text;
        document.getElementById('np-retention').textContent = c.churn.score;
        document.getElementById('np-b-horario').textContent = c.comportamiento.horario;
        document.getElementById('np-b-dias').textContent = c.comportamiento.dias;
        document.getElementById('np-b-freq').textContent = c.comportamiento.freq;
        document.getElementById('np-b-ticket').textContent = c.comportamiento.ticket;
        document.getElementById('np-fav-pedidos').textContent = c.pedidos;
        document.getElementById('np-fav-list').innerHTML = c.comportamiento.favs.map((f, i) => `<li><span class="rank">#${i+1}</span> ${f.nombre} <span class="count">${f.cant} pedidos</span></li>`).join('');
        document.getElementById('np-seq-list').innerHTML = c.secuencias.map(s => `<div class="seq-item"><div class="seq-info"><strong>${s.nombre}</strong><p>${s.desc}</p></div><span class="badge ${s.clase}">${s.estado}</span></div>`).join('');

        panel.classList.add('open');
        overlay.classList.add('show');
    };

    const closePanel = () => { panel.classList.remove('open'); overlay.classList.remove('show'); };
    btnClose.addEventListener('click', closePanel);
    overlay.addEventListener('click', closePanel);

    // Modal
    btnNewSeq.addEventListener('click', () => modalSeq.classList.add('show'));
    const closeModalSeq = () => { modalSeq.classList.remove('show'); formSeq.reset(); };
    btnCloseSeq.addEventListener('click', closeModalSeq);
    btnCancelSeq.addEventListener('click', closeModalSeq);
    formSeq.addEventListener('submit', (e) => { e.preventDefault(); alert('Nueva secuencia guardada y activada con éxito (Simulación)'); closeModalSeq(); });

    renderCards();
});