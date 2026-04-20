/**
 * Clientes/clientes.js
 * Lógica principal para el módulo de Clientes
 */

import { CLIENTES_MOCK_DATA } from './clientes-data.js';
import { renderClientCard, renderClientRow } from './clientes-components.js';

class ClientesController {
    constructor() {
        this.clientes = [...CLIENTES_MOCK_DATA];
        this.modoVista = 'grid';
        this.filtroTipoActual = 'todos';
        this.busquedaActual = '';
        this.idAEliminar = null;

        this.init();
    }

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.renderizar();
        this.actualizarStats();
    }

    cacheDOM() {
        this.gridClientes = document.getElementById('gridClientes');
        this.listClientes = document.getElementById('listClientes');
        this.containerGrid = document.getElementById('container-clientes-grid');
        this.containerLista = document.getElementById('container-clientes-lista');
        this.btnViewList = document.getElementById('btnViewList');
        this.btnViewGrid = document.getElementById('btnViewGrid');
        this.searchInput = document.getElementById('inputBusquedaClientes');
        this.filtroTipo = document.getElementById('filtroTipoCliente');
        this.countTotal = document.getElementById('count-total-clientes');
        this.countVip = document.getElementById('count-vip-clientes');

        // Modales
        this.modalEdit = document.getElementById('modalEditCliente');
        this.modalConfirm = document.getElementById('modalConfirmDelete');
        this.formEdit = document.getElementById('formEditCliente');
        this.modalTitle = document.querySelector('#modalEditCliente h3');
        
        // Botones de Modales
        this.btnCloseModal = document.getElementById('btnCloseModal');
        this.btnCancelEdit = document.getElementById('btnCancelEdit');
        this.btnCancelDelete = document.getElementById('btnCancelDelete');
        this.btnConfirmDeleteAction = document.getElementById('btnConfirmDeleteAction');

        // Sidebar
        this.sidebarOverlay = document.getElementById('clientSidebarOverlay');
        this.clientSidebar = document.getElementById('clientSidebar');
        this.btnCloseSidebar = document.getElementById('btnCloseSidebar');
        this.sidebarTabs = document.querySelectorAll('.sidebar-tab');
        this.sidebarPanels = document.querySelectorAll('.sidebar-panel');
        
        this.sidebarClientInitials = document.getElementById('sidebarClientInitials');
        this.sidebarClientName = document.getElementById('sidebarClientName');
        this.sidebarClientPhone = document.getElementById('sidebarClientPhone');
        this.sidebarClientVisits = document.getElementById('sidebarClientVisits');
        this.sidebarClientSpent = document.getElementById('sidebarClientSpent');
        this.chatClientName = document.getElementById('chatClientName');
        this.chatNameInserts = document.querySelectorAll('.chat-name-insert');
    }

    bindEvents() {
        this.btnViewList?.addEventListener('click', () => this.cambiarVista('lista'));
        this.btnViewGrid?.addEventListener('click', () => this.cambiarVista('grid'));

        this.searchInput?.addEventListener('input', (e) => {
            this.busquedaActual = e.target.value.toLowerCase();
            this.renderizar();
        });

        this.filtroTipo?.addEventListener('change', (e) => {
            this.filtroTipoActual = e.target.value;
            this.renderizar();
        });

        document.getElementById('btnRefreshClientes')?.addEventListener('click', () => {
            location.reload();
        });

        this.btnCloseModal?.addEventListener('click', () => this.cerrarModal());
        this.btnCancelEdit?.addEventListener('click', () => this.cerrarModal());
        
        this.btnCancelDelete?.addEventListener('click', () => this.cerrarModalConfirm());
        this.btnConfirmDeleteAction?.addEventListener('click', () => {
            if (this.idAEliminar !== null) {
                this.clientes = this.clientes.filter(c => c.id !== this.idAEliminar);
                this.renderizar();
                this.actualizarStats();
                this.cerrarModalConfirm();
            }
        });

        window.addEventListener('click', (e) => {
            if (e.target === this.modalEdit) this.cerrarModal();
            if (e.target === this.modalConfirm) this.cerrarModalConfirm();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.cerrarModal();
                this.cerrarModalConfirm();
                this.cerrarSidebar();
            }
        });

        this.formEdit?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.guardarCambios();
        });

        document.getElementById('btnNuevoRegistro')?.addEventListener('click', () => {
            this.abrirModalNuevo();
        });

        this.btnCloseSidebar?.addEventListener('click', () => this.cerrarSidebar());
        this.sidebarOverlay?.addEventListener('click', () => this.cerrarSidebar());

        this.sidebarTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.sidebarTabs.forEach(t => t.classList.remove('active'));
                this.sidebarPanels.forEach(p => p.classList.remove('active'));
                tab.classList.add('active');
                const targetId = tab.getAttribute('data-target');
                document.getElementById(targetId)?.classList.add('active');
            });
        });

        // Delegación de eventos para botones en cards y filas
        document.addEventListener('click', (e) => {
            const btnEdit = e.target.closest('.btn-card-action.edit');
            const btnDel = e.target.closest('.btn-card-action.del');
            const btnPreview = e.target.closest('.preview-hint') || e.target.closest('.btn-card-action.preview');

            if (btnEdit) {
                const id = parseInt(btnEdit.closest('[data-id]').dataset.id);
                this.editarCliente(id);
            } else if (btnDel) {
                const id = parseInt(btnDel.closest('[data-id]').dataset.id);
                this.eliminarCliente(id);
            } else if (btnPreview) {
                const id = parseInt(btnPreview.closest('[data-id]').dataset.id);
                this.abrirSidebarCliente(id);
            }
        });
    }

    cambiarVista(nuevaVista) {
        this.modoVista = nuevaVista;
        if (this.modoVista === 'lista') {
            this.btnViewList?.classList.add('active');
            this.btnViewGrid?.classList.remove('active');
            this.containerLista.style.display = 'block';
            this.containerGrid.style.display = 'none';
        } else {
            this.btnViewGrid?.classList.add('active');
            this.btnViewList?.classList.remove('active');
            this.containerGrid.style.display = 'grid';
            this.containerLista.style.display = 'none';
        }
        this.renderizar();
    }

    renderizar() {
        const filtered = this.clientes.filter(c => {
            const matchesSearch = c.nombre.toLowerCase().includes(this.busquedaActual) || 
                                 c.documento.includes(this.busquedaActual);
            let matchesType = true;
            if (this.filtroTipoActual === 'clientes') matchesType = c.tipo === 'cliente';
            if (this.filtroTipoActual === 'proveedores') matchesType = c.tipo === 'proveedor';
            if (this.filtroTipoActual === 'fiel') matchesType = c.estado === 'VIP';
            return matchesSearch && matchesType;
        });

        if (this.modoVista === 'lista') {
            if (this.listClientes) this.listClientes.innerHTML = filtered.map(c => renderClientRow(c)).join('');
        } else {
            if (this.gridClientes) this.gridClientes.innerHTML = filtered.map(c => renderClientCard(c)).join('');
        }

        if (window.lucide) window.lucide.createIcons();
    }

    actualizarStats() {
        if (this.countTotal) this.countTotal.textContent = this.clientes.length;
        if (this.countVip) this.countVip.textContent = this.clientes.filter(c => c.estado === 'VIP').length;
    }

    editarCliente(id) {
        const cliente = this.clientes.find(c => c.id === id);
        if (!cliente) return;
        if (this.modalTitle) this.modalTitle.innerHTML = '<i class="fa-solid fa-user-pen"></i> Editar Registro';
        document.getElementById('editClientId').value = cliente.id;
        document.getElementById('editNombre').value = cliente.nombre;
        document.getElementById('editDocumento').value = cliente.documento;
        document.getElementById('editEmail').value = cliente.email;
        document.getElementById('editTelefono').value = cliente.telefono;
        document.getElementById('editTipo').value = cliente.tipo;
        document.getElementById('editEstado').value = cliente.estado;
        this.modalEdit?.classList.add('show');
    }

    abrirModalNuevo() {
        if (this.modalTitle) this.modalTitle.innerHTML = '<i class="fa-solid fa-user-plus"></i> Nuevo Registro';
        this.formEdit.reset();
        document.getElementById('editClientId').value = '';
        document.getElementById('editTipo').value = 'cliente';
        document.getElementById('editEstado').value = 'Regular';
        this.modalEdit?.classList.add('show');
    }

    eliminarCliente(id) {
        this.idAEliminar = id;
        this.modalConfirm?.classList.add('show');
    }

    cerrarModal() {
        this.modalEdit?.classList.remove('show');
    }

    cerrarModalConfirm() {
        this.modalConfirm?.classList.remove('show');
        this.idAEliminar = null;
    }

    guardarCambios() {
        const idStr = document.getElementById('editClientId').value;
        
        if (idStr === '') {
            const nuevoId = this.clientes.length > 0 ? Math.max(...this.clientes.map(c => c.id)) + 1 : 1;
            const nuevoCliente = {
                id: nuevoId,
                nombre: document.getElementById('editNombre').value,
                documento: document.getElementById('editDocumento').value,
                email: document.getElementById('editEmail').value,
                telefono: document.getElementById('editTelefono').value,
                tipo: document.getElementById('editTipo').value,
                estado: document.getElementById('editEstado').value,
                compras: 0,
                gastado: 0.00
            };
            this.clientes.push(nuevoCliente);
        } else {
            const id = parseInt(idStr);
            const index = this.clientes.findIndex(c => c.id === id);
            if (index !== -1) {
                this.clientes[index] = {
                    ...this.clientes[index],
                    nombre: document.getElementById('editNombre').value,
                    documento: document.getElementById('editDocumento').value,
                    email: document.getElementById('editEmail').value,
                    telefono: document.getElementById('editTelefono').value,
                    tipo: document.getElementById('editTipo').value,
                    estado: document.getElementById('editEstado').value
                };
            }
        }
        
        this.cerrarModal();
        this.renderizar();
        this.actualizarStats();
    }

    abrirSidebarCliente(id) {
        const cliente = this.clientes.find(c => c.id === id);
        if (!cliente) return;

        this.sidebarClientInitials.textContent = cliente.nombre.substring(0, 2).toUpperCase();
        this.sidebarClientName.textContent = cliente.nombre;
        this.sidebarClientPhone.innerHTML = `<i class="fa-solid fa-phone" style="font-size:0.8rem; margin-right:4px; color:var(--color-text-soft);"></i> ${cliente.telefono}`;
        
        this.sidebarClientVisits.textContent = cliente.compras || '0';
        this.sidebarClientSpent.textContent = `S/ ${cliente.gastado.toFixed(2)}`;
        
        this.chatClientName.textContent = cliente.nombre;
        this.chatNameInserts.forEach(el => el.textContent = cliente.nombre.split(' ')[0]);

        this.sidebarTabs.forEach(t => t.classList.remove('active'));
        this.sidebarPanels.forEach(p => p.classList.remove('active'));
        document.querySelector('.sidebar-tab[data-target="panelHistory"]').classList.add('active');
        document.getElementById('panelHistory').classList.add('active');

        this.sidebarOverlay?.classList.add('show');
        this.clientSidebar?.classList.add('open');
        
        if (window.lucide) window.lucide.createIcons();
    }

    cerrarSidebar() {
        this.sidebarOverlay?.classList.remove('show');
        this.clientSidebar?.classList.remove('open');
    }
}

// Inicializar controlador
document.addEventListener('DOMContentLoaded', () => {
    new ClientesController();
});
