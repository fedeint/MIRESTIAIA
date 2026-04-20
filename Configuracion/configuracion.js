const DEFAULT_CONFIG = {
  dallIA: {
    nombre: "DallIA",
    trato: "Tú",
    personalidad: "Amigable",
    capacidades: {
      chat: true,
      voice: true,
      alerts: true,
      daily: false
    }
  },
  alertas: {
    canales: {
      urgente: true,
      ops: true,
      ai: true,
      rep: false,
      sunat: false,
      per: false
    },
    dnd: { activo: false, desde: "22:00", hasta: "07:00" }
  },
  modulos: {
    pedidosMesas: true,
    cocinaKDS: true,
    paraLlevar: true,
    delivery: false,
    descuentosPromos: true,
    cortesias: true,
    productosCarta: true,
    almacenInventario: true,
    recetasCostos: true,
    clientesFidelidad: false,
    administracionGeneral: true,
    facturacionSUNAT: true,
    sunatIGV: true,
    reportes: true,
    whatsappBusiness: false,
    impresoraTicket: false,
    accesoAudioVoz: false,
    accesoFotosCamara: false,
    pedidosYaRappi: false,
    pagosYapePlin: false,
    usuarios: true,
    configuracion: true,
    soporte: true
  },
  horarios: {
    lunes: { cerrado: false, apertura: "08:00", cierre: "22:00" },
    martes: { cerrado: false, apertura: "08:00", cierre: "22:00" },
    miercoles: { cerrado: false, apertura: "08:00", cierre: "22:00" },
    jueves: { cerrado: false, apertura: "08:00", cierre: "22:00" },
    viernes: { cerrado: false, apertura: "08:00", cierre: "22:00" },
    sabado: { cerrado: true, apertura: "08:00", cierre: "22:00" },
    domingo: { cerrado: true, apertura: "08:00", cierre: "22:00" }
  },
  tour: {
    completado: false,
    pasos: {
      dashboard: { label: "Dashboard y KPIs", estado: "Pendiente" },
      mesas: { label: "Mesas y Pedidos", estado: "Pendiente" },
      dallia: { label: "Chat con DallIA", estado: "Pendiente" },
      cocina: { label: "Módulo Cocina", estado: "Pendiente" },
      caja: { label: "Módulo Caja", estado: "Pendiente" },
      almacen: { label: "Módulo Almacén", estado: "Pendiente" },
      configuracion: { label: "Configuración del Sistema", estado: "Pendiente" }
    }
  },
  usuarios: [
    {
      id: "usr_superadmin_default",
      nombre: "Super Admin",
      email: "admin@mirest.pe",
      rol: "Super Admin",
      activo: true,
      pin: "0000"
    }
  ],
  restaurante: {
    nombre: "",
    direccion: "",
    ruc: "",
    logo: "",
    moneda: "PEN",
    zonaHoraria: "America/Lima"
  }
};

const ConfigStore = {
  STORAGE_KEY: "mirest_config",
  state: null,

  load() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.state = JSON.parse(stored);
      } else {
        this.state = structuredClone(DEFAULT_CONFIG);
        this.persist();
      }
    } catch (e) {
      console.error("Error parsing config:", e);
      this.state = structuredClone(DEFAULT_CONFIG);
    }
  },

  persist() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error("QuotaExceededError o fallo de guardado:", e);
      alert("Error guardando la configuración. Espacio insuficiente en localStorage.");
    }
  }
};

const ConfigUI = {
  init() {
    ConfigStore.load();
    this.hydrate();
    this.setupNavigation();
    this.setupDallIAHandlers();
    this.setupAlertsHandlers();
    this.setupModulesHandlers();
    this.setupHorariosHandlers();
    this.setupTourHandlers();
    this.setupUsuariosHandlers();
    this.setupRestauranteHandlers();
  },

  updateTopbarName(name) {
    const el = document.getElementById("cfgTopbarAssitantName");
    if (el) el.textContent = name || "DallIA";
  },

  updateTopbarRestaurante(name) {
    const el = document.getElementById("pageSubtitle");
    if (el && name) {
      el.textContent = name;
    }
  },

  setupNavigation() {
    const navItems = document.querySelectorAll(".cfg-nav-item");
    navItems.forEach(btn => {
      btn.addEventListener("click", () => {
        navItems.forEach(n => n.classList.remove("active"));
        btn.classList.add("active");

        const target = btn.dataset.target;
        document.querySelectorAll(".cfg-section").forEach(s => s.classList.remove("active"));
        const sec = document.getElementById(`cfg-sect-${target}`);
        if(sec) sec.classList.add("active");
      });
    });
  },

  hydrate() {
    const st = ConfigStore.state;
    // DallIA
    document.getElementById("cfg-ia-name").value = st.dallIA.nombre;
    this.updateTopbarName(st.dallIA.nombre);

    document.querySelectorAll("#cfg-ia-trato .cfg-segmented-btn").forEach(b => {
      b.classList.toggle("active", b.dataset.val === st.dallIA.trato);
    });
    document.querySelectorAll("#cfg-ia-person .cfg-segmented-btn").forEach(b => {
      b.classList.toggle("active", b.dataset.val === st.dallIA.personalidad);
    });

    document.getElementById("cfg-ia-cap-chat").checked = st.dallIA.capacidades.chat;
    document.getElementById("cfg-ia-cap-voice").checked = st.dallIA.capacidades.voice;
    document.getElementById("cfg-ia-cap-alerts").checked = st.dallIA.capacidades.alerts;
    document.getElementById("cfg-ia-cap-daily").checked = st.dallIA.capacidades.daily;

    // Alertas
    document.getElementById("cfg-alt-urgente").checked = st.alertas.canales.urgente;
    document.getElementById("cfg-alt-ops").checked = st.alertas.canales.ops;
    document.getElementById("cfg-alt-ai").checked = st.alertas.canales.ai;
    document.getElementById("cfg-alt-rep").checked = st.alertas.canales.rep;
    document.getElementById("cfg-alt-sunat").checked = st.alertas.canales.sunat;
    document.getElementById("cfg-alt-per").checked = st.alertas.canales.per;
    
    document.getElementById("cfg-alt-dnd").checked = st.alertas.dnd.activo;
    document.getElementById("cfg-alt-dnd-from").value = st.alertas.dnd.desde;
    document.getElementById("cfg-alt-dnd-to").value = st.alertas.dnd.hasta;
    this.refreshDNDState(st.alertas.dnd.activo);

    // Módulos
    document.querySelectorAll(".cfg-mod-toggle").forEach(cb => {
      cb.checked = !!st.modulos[cb.dataset.mod];
    });

    // Restaurante
    document.getElementById("cfg-rest-nombre").value = st.restaurante.nombre;
    document.getElementById("cfg-rest-dir").value = st.restaurante.direccion;
    document.getElementById("cfg-rest-ruc").value = st.restaurante.ruc;
    this.updateTopbarRestaurante(st.restaurante.nombre);

    // Render dynamically sections
    this.renderHorarios();
    this.renderTour();
    this.renderUsuarios();
  },

  // ── DALL IA HANDLERS
  setupDallIAHandlers() {
    // Segmented selection
    const attachSeg = (id) => {
      document.querySelectorAll(`#${id} .cfg-segmented-btn`).forEach(btn => {
        btn.addEventListener("click", (e) => {
          document.querySelectorAll(`#${id} .cfg-segmented-btn`).forEach(b => b.classList.remove("active"));
          e.target.classList.add("active");
        });
      });
    };
    attachSeg("cfg-ia-trato");
    attachSeg("cfg-ia-person");

    document.getElementById("btnSaveDallia").addEventListener("click", () => {
      const name = document.getElementById("cfg-ia-name").value.trim();
      if (!name) {
        document.getElementById("err-ia-name").style.display = "block";
        return;
      }
      document.getElementById("err-ia-name").style.display = "none";
      
      ConfigStore.state.dallIA.nombre = name;
      ConfigStore.state.dallIA.trato = document.querySelector("#cfg-ia-trato .active").dataset.val;
      ConfigStore.state.dallIA.personalidad = document.querySelector("#cfg-ia-person .active").dataset.val;
      ConfigStore.state.dallIA.capacidades.chat = document.getElementById("cfg-ia-cap-chat").checked;
      ConfigStore.state.dallIA.capacidades.voice = document.getElementById("cfg-ia-cap-voice").checked;
      ConfigStore.state.dallIA.capacidades.alerts = document.getElementById("cfg-ia-cap-alerts").checked;
      ConfigStore.state.dallIA.capacidades.daily = document.getElementById("cfg-ia-cap-daily").checked;
      
      ConfigStore.persist();
      this.updateTopbarName(name);

      const btn = document.getElementById("btnSaveDallia");
      const html = btn.innerHTML;
      btn.innerHTML = `<i data-lucide="check"></i> Guardado`;
      if (window.lucide) window.lucide.createIcons();
      setTimeout(() => btn.innerHTML = html, 1500);
    });
  },

  // ── ALERTAS HANDLERS
  refreshDNDState(isActive) {
    const cont = document.getElementById("cfg-alt-dnd-times");
    if (isActive) {
      cont.style.opacity = "1";
      cont.style.pointerEvents = "auto";
    } else {
      cont.style.opacity = "0.5";
      cont.style.pointerEvents = "none";
    }
  },
  
  setupAlertsHandlers() {
    document.getElementById("cfg-alt-dnd").addEventListener("change", (e) => {
      this.refreshDNDState(e.target.checked);
    });

    document.getElementById("btnSaveAlertas").addEventListener("click", () => {
      const dnd = document.getElementById("cfg-alt-dnd").checked;
      const tFrom = document.getElementById("cfg-alt-dnd-from").value;
      const tTo = document.getElementById("cfg-alt-dnd-to").value;

      if (dnd && (!tFrom || !tTo)) {
        document.getElementById("err-dnd").style.display = "block";
        return;
      }
      document.getElementById("err-dnd").style.display = "none";

      ConfigStore.state.alertas.canales.urgente = document.getElementById("cfg-alt-urgente").checked;
      ConfigStore.state.alertas.canales.ops = document.getElementById("cfg-alt-ops").checked;
      ConfigStore.state.alertas.canales.ai = document.getElementById("cfg-alt-ai").checked;
      ConfigStore.state.alertas.canales.rep = document.getElementById("cfg-alt-rep").checked;
      ConfigStore.state.alertas.canales.sunat = document.getElementById("cfg-alt-sunat").checked;
      ConfigStore.state.alertas.canales.per = document.getElementById("cfg-alt-per").checked;

      ConfigStore.state.alertas.dnd.activo = dnd;
      ConfigStore.state.alertas.dnd.desde = tFrom;
      ConfigStore.state.alertas.dnd.hasta = tTo;

      ConfigStore.persist();
      
      const btn = document.getElementById("btnSaveAlertas");
      btn.innerHTML = `<i data-lucide="check"></i> Guardado`;
      if (window.lucide) window.lucide.createIcons();
      setTimeout(() => btn.innerHTML = `<i data-lucide="save"></i> Guardar`, 1500);
    });
  },

  // ── Modulos
  setupModulesHandlers() {
    document.getElementById("btnSaveModulos").addEventListener("click", () => {
      document.querySelectorAll(".cfg-mod-toggle").forEach(cb => {
        ConfigStore.state.modulos[cb.dataset.mod] = cb.checked;
      });
      ConfigStore.persist();
      
      const btn = document.getElementById("btnSaveModulos");
      btn.innerHTML = `<i data-lucide="check"></i> Guardado`;
      if (window.lucide) window.lucide.createIcons();
      setTimeout(() => btn.innerHTML = `<i data-lucide="save"></i> Guardar`, 1500);
    });
  },

  // ── Horarios
  renderHorarios() {
    const list = ['lunes','martes','miercoles','jueves','viernes','sabado','domingo'];
    const container = document.getElementById("horarios-container");
    container.innerHTML = "";

    list.forEach(day => {
      const dData = ConfigStore.state.horarios[day];
      const row = document.createElement("div");
      row.className = "cfg-horario-row";
      row.innerHTML = `
        <div class="cfg-horario-day">${day}</div>
        <div>
          <label style="display:flex;align-items:center;gap:6px;font-size:12px;font-weight:600;color:var(--color-text-muted);">
            Cerrado <input type="checkbox" class="cfg-toggle" id="cfg-hr-t-${day}" style="transform:scale(0.8);" ${dData.cerrado ? 'checked' : ''}>
          </label>
        </div>
        <div class="cfg-time-col" style="${dData.cerrado ? 'opacity:0.3;pointer-events:none;' : ''}" id="hr-grp-apertura-${day}">
          <label>Apertura</label>
          <input type="time" class="cfg-input" id="cfg-hr-ap-${day}" value="${dData.apertura}">
        </div>
        <div class="cfg-time-col" style="${dData.cerrado ? 'opacity:0.3;pointer-events:none;' : ''}" id="hr-grp-cierre-${day}">
          <label>Cierre</label>
          <input type="time" class="cfg-input" id="cfg-hr-cl-${day}" value="${dData.cierre}">
        </div>
      `;
      container.appendChild(row);

      row.querySelector(`#cfg-hr-t-${day}`).addEventListener("change", (e) => {
        const checked = e.target.checked;
        document.getElementById(`hr-grp-apertura-${day}`).style.opacity = checked ? "0.3" : "1";
        document.getElementById(`hr-grp-apertura-${day}`).style.pointerEvents = checked ? "none" : "auto";
        document.getElementById(`hr-grp-cierre-${day}`).style.opacity = checked ? "0.3" : "1";
        document.getElementById(`hr-grp-cierre-${day}`).style.pointerEvents = checked ? "none" : "auto";
      });
    });
  },

  setupHorariosHandlers() {
    document.getElementById("btnSaveHorarios").addEventListener("click", () => {
      const list = ['lunes','martes','miercoles','jueves','viernes','sabado','domingo'];
      list.forEach(day => {
        ConfigStore.state.horarios[day].cerrado = document.getElementById(`cfg-hr-t-${day}`).checked;
        ConfigStore.state.horarios[day].apertura = document.getElementById(`cfg-hr-ap-${day}`).value;
        ConfigStore.state.horarios[day].cierre = document.getElementById(`cfg-hr-cl-${day}`).value;
      });
      ConfigStore.persist();
      const btn = document.getElementById("btnSaveHorarios");
      btn.innerHTML = `<i data-lucide="check"></i> Guardado`;
      if (window.lucide) window.lucide.createIcons();
      setTimeout(() => btn.innerHTML = `<i data-lucide="save"></i> Guardar`, 1500);
    });
  },

  // ── Tour / Onboarding
  renderTour() {
    const st = ConfigStore.state.tour.pasos;
    const entries = Object.entries(st);
    let completed = 0;
    const cont = document.getElementById("tourStepsContainer");
    cont.innerHTML = "";

    entries.forEach(([key, val]) => {
      if(val.estado === "Completado") completed++;
      const el = document.createElement("div");
      el.style.display = "flex";
      el.style.justifyContent = "space-between";
      el.style.alignItems = "center";
      el.style.padding = "12px 0";
      el.style.borderBottom = "1px solid var(--cfg-border)";
      
      const isOk = val.estado === "Completado";
      el.innerHTML = `
        <div style="font-weight:600; color:var(--color-text);"><i data-lucide="${isOk ? 'check-circle-2':'circle'}" style="color:${isOk? 'var(--color-success)' : 'var(--color-text-muted)'}; margin-right:8px; vertical-align:middle; width:20px;height:20px;"></i> ${val.label}</div>
        <button class="cfg-btn-save" style="background:var(--color-surface);color:var(--color-text);box-shadow:none;border:1px solid var(--cfg-border);font-size:12px;padding:6px 12px;" onclick="window.mockCompleter('${key}')">${isOk ? 'Rehacer' : 'Hacer Tour'}</button>
      `;
      cont.appendChild(el);
    });

    const percent = Math.round((completed / entries.length) * 100);
    document.getElementById("tourProgressFill").style.width = percent + "%";
    document.getElementById("tourProgressText").textContent = percent + "% Completado";
    if (window.lucide) window.lucide.createIcons();
  },

  setupTourHandlers() {
    document.getElementById("btnRestartTour").addEventListener("click", () => {
       const pasos = ConfigStore.state.tour.pasos;
       Object.values(pasos).forEach(p => p.estado = "Pendiente");
       ConfigStore.persist();
       this.renderTour();
    });
    
    // global helper para el mock
    window.mockCompleter = (key) => {
       ConfigStore.state.tour.pasos[key].estado = "Completado";
       ConfigStore.persist();
       this.renderTour();
    };
  },

  // ── Usuarios
  renderUsuarios() {
    const list = ConfigStore.state.usuarios;
    const cont = document.getElementById("usersListContainer");
    cont.innerHTML = "";

    list.forEach(usr => {
      const row = document.createElement("div");
      row.style.background = "var(--color-surface-muted)";
      row.style.border = "1px solid var(--cfg-border)";
      row.style.borderRadius = "12px";
      row.style.padding = "16px";
      row.style.display = "flex";
      row.style.justifyContent = "space-between";
      row.style.alignItems = "center";
      
      row.innerHTML = `
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="width:40px;height:40px;border-radius:50%;background:var(--color-accent-soft);color:var(--color-accent-dark);display:grid;place-items:center;font-weight:700;">
            ${usr.nombre.charAt(0)}${usr.nombre.split(' ').length>1 ? usr.nombre.split(' ')[1].charAt(0) : ''}
          </div>
          <div>
            <div style="font-weight:700;color:var(--color-text)">${usr.nombre} <span style="font-size:10px;background:var(--color-border-strong);color:var(--color-text-muted);padding:2px 6px;border-radius:10px;margin-left:6px;">${usr.rol}</span></div>
            <div style="font-size:12px;color:var(--color-text-muted)">${usr.email} • PIN: ****</div>
          </div>
        </div>
        <button class="cfg-btn-save" style="background:transparent;color:var(--color-red);box-shadow:none;padding:5px;" onclick="window.mockDelUser('${usr.id}')"><i data-lucide="trash"></i></button>
      `;
      cont.appendChild(row);
    });
    if (window.lucide) window.lucide.createIcons();
  },

  setupUsuariosHandlers() {
    document.getElementById("btnAddUser").addEventListener("click", () => {
       const u = prompt("Nombre del nuevo administrador:");
       if(u) {
          ConfigStore.state.usuarios.push({
             id: 'usr_' + Date.now().toString(36),
             nombre: u,
             email: u.toLowerCase().replace(' ','') + "@mirest.pe",
             rol: "Admin",
             activo: true,
             pin: "1234"
          });
          ConfigStore.persist();
          this.renderUsuarios();
      }
    });

    window.mockDelUser = (id) => {
       if(ConfigStore.state.usuarios.length <= 1) {
          alert("No puedes eliminar al único administrador del sistema.");
          return;
       }
       ConfigStore.state.usuarios = ConfigStore.state.usuarios.filter(u => u.id !== id);
       ConfigStore.persist();
       this.renderUsuarios();
    };
  },

  // ── Restaurante
  setupRestauranteHandlers() {
    document.getElementById("btnSaveRest").addEventListener("click", () => {
      const ruc = document.getElementById("cfg-rest-ruc").value.trim();
      const errRuc = document.getElementById("err-rest-ruc");

      if (ruc && ruc.length !== 11) {
         errRuc.style.display = "block";
         return;
      }
      errRuc.style.display = "none";

      ConfigStore.state.restaurante.nombre = document.getElementById("cfg-rest-nombre").value.trim();
      ConfigStore.state.restaurante.direccion = document.getElementById("cfg-rest-dir").value.trim();
      ConfigStore.state.restaurante.ruc = ruc;

      ConfigStore.persist();
      this.updateTopbarRestaurante(ConfigStore.state.restaurante.nombre);
      const btn = document.getElementById("btnSaveRest");
      btn.innerHTML = `<i data-lucide="check"></i> Guardado`;
      if (window.lucide) window.lucide.createIcons();
      setTimeout(() => btn.innerHTML = `<i data-lucide="save"></i> Guardar`, 1500);
    });
  }

};

document.addEventListener("DOMContentLoaded", () => {
  ConfigUI.init();
});
