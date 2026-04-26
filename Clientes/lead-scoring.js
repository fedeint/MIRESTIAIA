document.addEventListener('DOMContentLoaded', () => {
    // Elementos del DOM
    const scoringDirectory = document.getElementById('scoringDirectory');
    const detailedProfile = document.getElementById('detailedProfile');
    const btnBack = document.getElementById('btnBackToDirectory');
    const pageTitle = document.getElementById('pageTitle');
    const pageSubtitle = document.getElementById('pageSubtitle');

    // Datos Mock (Array de 5 clientes, idénticos a los requerimientos)
    const mockScoringClients = [
        {
            id: 1,
            nombre: "María García Villanueva",
            dni: "71234567",
            email: "maria.garcia@gmail.com",
            avatar: "MG",
            tipo: "VIP",
            ltv: 1840,
            pedidos: 12,
            ticketPromedio: 153,
            arquetipo: "El Ejecutivo Habitual",
            rfm: { recencia: { v: 30, max: 30, text: "Hace 3 días" }, frecuencia: { v: 30, max: 30, text: "1.25 ped/prom" }, monetario: { v: 27, max: 40, text: "S/ 153 tkt prom" }, engagement: 87 },
            riesgo: { text: "Bajo - 5%", class: "low" },
            telefono: "+51 987 654 321",
            nurturing: { tactica: "Cumpleaños VIP + 2x Puntos", paso: "Paso 3 de 5", proximaAccion: "Enviar campaña cumpleaños el 20 abr (WhatsApp)" },
            comportamiento: { horario: "12:30 - 14:00", dias: "Lun - Vie", frecuencia: "6 visitas/mes", platos: ["Ceviche Mixto", "Lomo Saltado", "Ají de Gallina"] },
            secuencias: [ { nombre: "Bienvenida Automatizada", estado: "Completada", class: "habitual" }, { nombre: "Campaña Cumpleaños VIP", estado: "Activa", class: "vip" }, { nombre: "Reactivación 30 días", estado: "En espera", class: "altovalor" } ]
        },
        { id: 2, nombre: "Carlos Mendoza", dni: "45678912", email: "carlos.m@mail.com", avatar: "CM", tipo: "Cliente", ltv: 1970, pedidos: 8, ticketPromedio: 246, arquetipo: "Visitante de Fin de Semana", rfm: { recencia: { v: 20, max: 30, text: "Hace 1 sem" }, frecuencia: { v: 20, max: 30, text: "0.8 ped/prom" }, monetario: { v: 25, max: 40, text: "S/ 246 tkt prom" }, engagement: 60 }, riesgo: { text: "Medio - 35%", class: "medium" }, telefono: "+51 987 654 321", nurturing: { tactica: "Reactivación 30 días", paso: "Paso 1 de 3", proximaAccion: "Recordatorio de reserva para el viernes" }, comportamiento: { horario: "19:00 - 21:00", dias: "Sáb - Dom", frecuencia: "2 visitas/mes", platos: ["Parrilla Familiar", "Pisco Sour"] }, secuencias: [ { nombre: "Bienvenida Automatizada", estado: "Completada", class: "habitual" }, { nombre: "Reactivación 30 días", estado: "Activa", class: "vip" } ] },
        { id: 3, nombre: "Ana Rivera", dni: "78912345", email: "ana.r@mail.com", avatar: "AR", tipo: "Regular", ltv: 340, pedidos: 15, ticketPromedio: 22, arquetipo: "Cena Corporativa", rfm: { recencia: { v: 10, max: 30, text: "Hace 3 días" }, frecuencia: { v: 15, max: 30, text: "3.5 ped/prom" }, monetario: { v: 15, max: 40, text: "S/ 22 tkt prom" }, engagement: 40 }, riesgo: { text: "Alto - 75%", class: "high" }, telefono: "+51 912 345 678", nurturing: { tactica: "Conversión a VIP", paso: "Paso 0 de 3", proximaAccion: "Ninguna programada" }, comportamiento: { horario: "20:00 - 22:00", dias: "Jueves", frecuencia: "4 visitas/mes", platos: ["Tablas de Quesos", "Vino Tinto"] }, secuencias: [ { nombre: "Bienvenida Automatizada", estado: "Completada", class: "habitual" } ] },
        { id: 4, nombre: "Distribuidora XYZ", dni: "20548976123", email: "ventas@xyz.com", avatar: "DX", tipo: "Proveedor", ltv: 8500, pedidos: 45, ticketPromedio: 188, arquetipo: "Insumos Críticos", rfm: { recencia: { v: 30, max: 30, text: "Ayer" }, frecuencia: { v: 30, max: 30, text: "15 ped/prom" }, monetario: { v: 40, max: 40, text: "S/ 188 tkt prom" }, engagement: 95 }, riesgo: { text: "Bajo - 2%", class: "low" }, telefono: "+51 999 888 777", nurturing: { tactica: "Fidelización B2B", paso: "Paso 5 de 5", proximaAccion: "Renovación de contrato" }, comportamiento: { horario: "08:00 - 10:00", dias: "Lunes", frecuencia: "4 visitas/mes", platos: ["Insumos frescos"] }, secuencias: [ { nombre: "Onboarding Proveedor", estado: "Completada", class: "habitual" }, { nombre: "Renovación Anual", estado: "En espera", class: "altovalor" } ] },
        { id: 5, nombre: "Luis Ramírez", dni: "44556677", email: "luis.ram@mail.com", avatar: "LR", tipo: "VIP", ltv: 2100, pedidos: 20, ticketPromedio: 105, arquetipo: "Familia Frecuente", rfm: { recencia: { v: 25, max: 30, text: "Hace 5 días" }, frecuencia: { v: 28, max: 30, text: "1.5 ped/prom" }, monetario: { v: 30, max: 40, text: "S/ 105 tkt prom" }, engagement: 80 }, riesgo: { text: "Bajo - 10%", class: "low" }, telefono: "+51 922 333 444", nurturing: { tactica: "Promoción Menú Kids", paso: "Paso 2 de 4", proximaAccion: "Enviar cupón familiar domingo" }, comportamiento: { horario: "13:00 - 15:00", dias: "Dom", frecuencia: "4 visitas/mes", platos: ["Pollo a la Brasa", "Chicha Morada"] }, secuencias: [ { nombre: "Bienvenida Automatizada", estado: "Completada", class: "habitual" }, { nombre: "Promoción Fin de Semana", estado: "Activa", class: "vip" } ] }
    ];

    // PASO 1: Renderizar Directorio Minimalista
    function renderDirectory() {
        scoringDirectory.innerHTML = mockScoringClients.map(c => `
            <div class="minimal-card" onclick="abrirPerfilAnalitico(${c.id})">
                <div class="minimal-avatar">${c.avatar}</div>
                <h3 class="minimal-name">${c.nombre}</h3>
                <span class="minimal-id"><i class="fa-regular fa-id-card"></i> ${c.dni}</span>
                <span class="minimal-email"><i class="fa-solid fa-envelope"></i> ${c.email.length > 18 ? c.email.substring(0,18)+'...' : c.email}</span>
            </div>
        `).join('');
    }

    // PASO 2: Inyectar Analítica Detallada
    window.abrirPerfilAnalitico = function(id) {
        const c = mockScoringClients.find(x => x.id === id);
        if(!c) return;

        // Ocultar directorio, mostrar perfil
        scoringDirectory.style.display = 'none';
        detailedProfile.style.display = 'flex';
        btnBack.style.display = 'flex';
        pageTitle.textContent = "Perfil Detallado de Cliente";
        pageSubtitle.textContent = "Analítica profunda y Nurturing IA";

        // Llenar Sidebar Izquierdo
        document.getElementById('detAvatar').textContent = c.avatar;
        document.getElementById('detName').textContent = c.nombre;
        document.getElementById('detStatus').innerHTML = `<i class="fa-solid fa-star"></i> ${c.tipo === 'VIP' ? 'Cliente VIP' : c.tipo}`;
        document.getElementById('detLtv').textContent = `S/ ${c.ltv.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
        document.getElementById('detPedidos').textContent = `${c.pedidos} pedidos`;
        document.getElementById('detTicket').textContent = `S/ ${c.ticketPromedio.toFixed(2)} tkt prom`;
        
        document.getElementById('sumRecencia').textContent = `${Math.round((c.rfm.recencia.v/c.rfm.recencia.max)*5)}/5`;
        document.getElementById('sumFrecuencia').textContent = `${Math.round((c.rfm.frecuencia.v/c.rfm.frecuencia.max)*5)}/5`;
        document.getElementById('sumMonetario').textContent = `${Math.round((c.rfm.monetario.v/c.rfm.monetario.max)*5)}/5`;
        
        document.getElementById('detArquetipo').textContent = c.arquetipo;
        document.getElementById('detChurn').innerHTML = `<i class="fa-solid fa-shield-check"></i> ${c.riesgo.text}`;
        document.getElementById('detChurn').className = `churn-risk-badge ${c.riesgo.class}`;
        document.getElementById('detPhone').textContent = c.telefono;
        document.getElementById('detEmail').textContent = c.email;

        // Llenar BLOQUE 1: KPIs
        document.getElementById('block1-kpis').innerHTML = `
            <div class="analytics-card">
                <span class="segment-label">Recencia</span>
                <h3>${c.rfm.recencia.v}/${c.rfm.recencia.max} pts</h3>
                <div class="progress-container" title="Puntaje: ${c.rfm.recencia.v}"><div class="progress-bg"><div class="progress-fill green" style="width: ${(c.rfm.recencia.v/c.rfm.recencia.max)*100}%;"></div></div></div>
                <span class="activity-meta" style="display:block; margin-top:8px;">${c.rfm.recencia.text}</span>
            </div>
            <div class="analytics-card">
                <span class="segment-label">Frecuencia</span>
                <h3>${c.rfm.frecuencia.v}/${c.rfm.frecuencia.max} pts</h3>
                <div class="progress-container" title="Puntaje: ${c.rfm.frecuencia.v}"><div class="progress-bg"><div class="progress-fill green" style="width: ${(c.rfm.frecuencia.v/c.rfm.frecuencia.max)*100}%;"></div></div></div>
                <span class="activity-meta" style="display:block; margin-top:8px;">${c.pedidos} totales, ${c.rfm.frecuencia.text}</span>
            </div>
            <div class="analytics-card">
                <span class="segment-label">Valor Monetario</span>
                <h3>${c.rfm.monetario.v}/${c.rfm.monetario.max} pts</h3>
                <div class="progress-container" title="Puntaje: ${c.rfm.monetario.v}"><div class="progress-bg"><div class="progress-fill orange" style="width: ${(c.rfm.monetario.v/c.rfm.monetario.max)*100}%;"></div></div></div>
                <span class="activity-meta" style="display:block; margin-top:8px;">${c.rfm.monetario.text}</span>
            </div>
            <div class="analytics-card">
                <span class="segment-label">Engagement App</span>
                <h3 style="color: #9333ea;">${c.rfm.engagement}%</h3>
                <div class="progress-container" title="Engagement: ${c.rfm.engagement}%"><div class="progress-bg"><div class="progress-fill" style="background:#9333ea; width: ${c.rfm.engagement}%;"></div></div></div>
                <span class="activity-meta" style="display:block; margin-top:8px;">Alto (App + interacciones)</span>
            </div>
        `;

        // Llenar BLOQUE 2: Nurturing
        document.getElementById('block2-nurturing-flow').innerHTML = `
            <h3>Táctica de Nurturing Activa</h3>
            <span style="font-size: 14px; font-weight:600; color: #111827;">Secuencia: ${c.nurturing.tactica} - ${c.nurturing.paso}</span>
            <div class="flow-step">
                <span>Prospecto</span> <i class="fa-solid fa-chevron-right"></i>
                <span>Activo</span> <i class="fa-solid fa-chevron-right"></i>
                <span>Fiel</span> <i class="fa-solid fa-chevron-right"></i>
                <span class="active">VIP (Actual)</span>
            </div>
        `;
        document.getElementById('block2-next-action').innerHTML = `
            <h3 style="color: #a16207;">Próxima acción recomendada IA</h3>
            <p style="font-size: 15px; font-weight: 600; color: #111827; margin:0;"><i class="fa-brands fa-whatsapp" style="color:#16a34a; font-size:18px;"></i> ${c.nurturing.proximaAccion}</p>
        `;

        // Llenar BLOQUE 3: Comportamiento & Secuencias
        document.getElementById('block3-sequences').innerHTML = `
            <h3>Secuencias de Nurturing</h3>
            <ul class="behavior-list">
                ${c.secuencias.map(s => `<li><span>${s.nombre}</span> <span class="badge ${s.class}">${s.estado}</span></li>`).join('')}
            </ul>
        `;
        document.getElementById('block3-behavior').innerHTML = `
            <h3>Perfil de Comportamiento</h3>
            <ul class="behavior-list">
                <li><span class="segment-label">Horario Preferido</span> <span>${c.comportamiento.horario}</span></li>
                <li><span class="segment-label">Días Frecuentes</span> <span>${c.comportamiento.dias}</span></li>
                <li><span class="segment-label">Frecuencia Promedio</span> <span>${c.comportamiento.frecuencia}</span></li>
            </ul>
            <div style="margin-top: 16px;">
                <span class="segment-label">Platos Favoritos Detectados:</span>
                <ol style="padding-left: 20px; font-size:14px; color:#111827; font-weight:600; margin-top:8px;">
                    ${c.comportamiento.platos.map(p => `<li>${p}</li>`).join('')}
                </ol>
            </div>
        `;

    };

    // PASO 3: Botón para regresar al directorio
    btnBack.addEventListener('click', () => {
        detailedProfile.style.display = 'none';
        btnBack.style.display = 'none';
        scoringDirectory.style.display = 'grid';
        pageTitle.textContent = "Segmentación RFM";
        pageSubtitle.textContent = "Clasificación inteligente de clientes basada en su Recencia, Frecuencia y Valor Monetario (RFM).";
    });

    // Inicializar app
    renderDirectory();
});