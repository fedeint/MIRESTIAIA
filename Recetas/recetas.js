/**
 * Recetas/recetas.js
 * Lógica principal para el módulo de Recetas
 */

import { RECETAS_MOCK_DATA } from './recetas-data.js';
import { renderRecipeCard, renderRecipeRow } from './recetas-components.js';

class RecetasController {
    constructor() {
        this.recetas = [...RECETAS_MOCK_DATA];
        this.modoVista = 'grid';
        this.filtroActual = 'Todos';
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
        this.gridRecetas = document.getElementById('gridRecetas');
        this.containerGrid = document.getElementById('container-recetas-grid');
        this.containerLista = document.getElementById('container-recetas-lista');
        this.btnViewList = document.getElementById('btnViewList');
        this.btnViewGrid = document.getElementById('btnViewGrid');
        this.inputBusqueda = document.getElementById('inputBusqueda');
        this.filterPills = document.querySelectorAll('.pill');
        this.countTotal = document.getElementById('count-total');
        this.countActivas = document.getElementById('count-activas');

        // Modales
        this.modalEdit = document.getElementById('modalEditReceta');
        this.modalConfirm = document.getElementById('modalConfirmDelete');
        this.modalPlantillaImport = document.getElementById('modalPlantillaImport');
        this.formEdit = document.getElementById('formEditReceta');
        
        // Botones de Modales
        this.btnCloseModal = document.getElementById('btnCloseModal');
        this.btnCancelEdit = document.getElementById('btnCancelEdit');
        this.btnCancelDelete = document.getElementById('btnCancelDelete');
        this.btnConfirmDeleteAction = document.getElementById('btnConfirmDeleteAction');
        this.btnClosePlantillaImport = document.getElementById('btnClosePlantillaImport');
        this.btnCancelPlantillaImport = document.getElementById('btnCancelPlantillaImport');
        this.btnDescargarPlantilla = document.getElementById('btnDescargarPlantilla');
        this.btnAbrirImport = document.getElementById('btnAbrirImport');
        this.fileImportar = document.getElementById('fileImportar');
    }

    bindEvents() {
        this.btnViewList?.addEventListener('click', () => this.cambiarVista('lista'));
        this.btnViewGrid?.addEventListener('click', () => this.cambiarVista('grid'));

        this.inputBusqueda?.addEventListener('input', (e) => {
            this.busquedaActual = e.target.value.toLowerCase();
            this.renderizar();
        });

        this.filterPills.forEach(pill => {
            pill.addEventListener('click', () => {
                this.filterPills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                this.filtroActual = pill.dataset.filter;
                this.renderizar();
            });
        });

        document.getElementById('btnNuevaReceta')?.addEventListener('click', () => {
            this.abrirModalPlantillaImport();
        });

        this.btnClosePlantillaImport?.addEventListener('click', () => this.cerrarModalPlantillaImport());
        this.btnCancelPlantillaImport?.addEventListener('click', () => this.cerrarModalPlantillaImport());

        this.btnDescargarPlantilla?.addEventListener('click', () => this.descargarPlantillaExcel());
        this.btnAbrirImport?.addEventListener('click', () => this.fileImportar?.click());

        this.fileImportar?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) this.importarRecetasExcel(file);
            this.fileImportar.value = '';
            this.cerrarModalPlantillaImport();
        });

        this.btnCloseModal?.addEventListener('click', () => this.cerrarModal());
        this.btnCancelEdit?.addEventListener('click', () => this.cerrarModal());
        
        this.btnCancelDelete?.addEventListener('click', () => this.cerrarModalConfirm());
        this.btnConfirmDeleteAction?.addEventListener('click', () => {
            if (this.idAEliminar !== null) {
                this.recetas = this.recetas.filter(r => r.id !== this.idAEliminar);
                this.renderizar();
                this.actualizarStats();
                this.cerrarModalConfirm();
            }
        });

        window.addEventListener('click', (e) => {
            if (e.target === this.modalEdit) this.cerrarModal();
            if (e.target === this.modalConfirm) this.cerrarModalConfirm();
            if (e.target === this.modalPlantillaImport) this.cerrarModalPlantillaImport();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.cerrarModal();
                this.cerrarModalConfirm();
                this.cerrarModalPlantillaImport();
            }
        });

        this.formEdit?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.guardarCambiosReceta();
        });

        // Delegación de eventos para botones en cards y filas
        document.addEventListener('click', (e) => {
            const btnEdit = e.target.closest('.edit');
            const btnDel = e.target.closest('.del');

            if (btnEdit) {
                const id = parseInt(btnEdit.closest('[data-id]').dataset.id);
                this.editarReceta(id);
            } else if (btnDel) {
                const id = parseInt(btnDel.closest('[data-id]').dataset.id);
                this.eliminarReceta(id);
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
        const avgPrecio = this.recetas.length > 0
            ? this.recetas.reduce((sum, r) => sum + (Number(r.precioVenta) || 0), 0) / this.recetas.length
            : 0;

        let filtered = [...this.recetas];

        if (this.filtroActual === 'MasRentables') {
            filtered = filtered
                .filter(r => Number(r.precioVenta) > 0)
                .sort((a, b) => {
                    const rentA = ((a.precioVenta - a.costo) / a.precioVenta) * 100;
                    const rentB = ((b.precioVenta - b.costo) / b.precioVenta) * 100;
                    return rentB - rentA;
                });
        } else if (this.filtroActual === 'PlatosCaros') {
            filtered = filtered.filter(r => Number(r.precioVenta) > avgPrecio);
        } else if (this.filtroActual === 'PlatosMódicos') {
            filtered = filtered.filter(r => Number(r.precioVenta) <= avgPrecio);
        }

        if (this.busquedaActual) {
            filtered = filtered.filter(r => 
                r.nombre.toLowerCase().includes(this.busquedaActual) ||
                r.categoria.toLowerCase().includes(this.busquedaActual)
            );
        }

        if (this.modoVista === 'lista') {
            if (this.gridRecetas) this.gridRecetas.innerHTML = filtered.map(r => renderRecipeRow(r)).join('');
        } else {
            if (this.containerGrid) this.containerGrid.innerHTML = filtered.map(r => renderRecipeCard(r)).join('');
        }

        this.actualizarCounts();
        if (window.lucide) window.lucide.createIcons();
    }

    actualizarCounts() {
        const counts = {
            Todos: this.recetas.length,
            MasRentables: 0,
            PlatosCaros: 0,
            PlatosMódicos: 0
        };

        const avgPrecio = this.recetas.length > 0
            ? this.recetas.reduce((sum, r) => sum + (Number(r.precioVenta) || 0), 0) / this.recetas.length
            : 0;

        this.recetas.forEach(r => {
            if (Number(r.precioVenta) > 0) counts.MasRentables++;
            if (Number(r.precioVenta) > avgPrecio) counts.PlatosCaros++;
            else counts.PlatosMódicos++;
        });

        this.filterPills.forEach(pill => {
            const f = pill.dataset.filter;
            const countSpan = pill.querySelector('.pill-count');
            if (countSpan) countSpan.textContent = counts[f] || 0;
        });
    }

    actualizarStats() {
        if (this.countTotal) this.countTotal.textContent = this.recetas.length;
        if (this.countActivas) this.countActivas.textContent = this.recetas.filter(r => r.estado === 'Activa').length;
    }

    editarReceta(id) {
        const receta = this.recetas.find(r => r.id === id);
        if (!receta) return;
        
        document.getElementById('editRecipeId').value = receta.id;
        document.getElementById('editNombre').value = receta.nombre;
        document.getElementById('editCategoria').value = receta.categoria;
        document.getElementById('editCosto').value = receta.costo;
        document.getElementById('editPrecioVenta').value = receta.precioVenta;
        document.getElementById('editTiempo').value = receta.tiempo;
        document.getElementById('editPorciones').value = receta.porciones;
        document.getElementById('editEstado').value = receta.estado;
        document.getElementById('editVersion').value = receta.version;
        
        this.modalEdit?.classList.add('show');
    }

    eliminarReceta(id) {
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

    abrirModalPlantillaImport() {
        this.modalPlantillaImport?.classList.add('show');
    }

    cerrarModalPlantillaImport() {
        this.modalPlantillaImport?.classList.remove('show');
    }

    guardarCambiosReceta() {
        const id = parseInt(document.getElementById('editRecipeId').value);
        const index = this.recetas.findIndex(r => r.id === id);
        
        if (index !== -1) {
            const costo = parseFloat(document.getElementById('editCosto').value);
            const precio = parseFloat(document.getElementById('editPrecioVenta').value);
            
            this.recetas[index] = {
                ...this.recetas[index],
                nombre: document.getElementById('editNombre').value,
                categoria: document.getElementById('editCategoria').value,
                costo: costo,
                precioVenta: precio,
                foodCost: precio > 0 ? (costo / precio * 100) : 0,
                tiempo: document.getElementById('editTiempo').value,
                porciones: document.getElementById('editPorciones').value,
                estado: document.getElementById('editEstado').value,
                version: document.getElementById('editVersion').value
            };
            
            this.cerrarModal();
            this.renderizar();
            this.actualizarStats();
        }
    }

    descargarPlantillaExcel() {
        const data = [
            ["nombre", "categoria", "costo", "precioVenta", "tiempo", "porciones", "version", "estado"],
        ];
        
        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "PlantillaRecetas");
        XLSX.writeFile(wb, "Plantilla_Recetas.xlsx");
    }

    importarRecetasExcel(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet);
            
            let maxId = this.recetas.length > 0 ? Math.max(...this.recetas.map(r => r.id)) : 0;
            
            const nuevasRecetas = jsonData.map(item => ({
                id: ++maxId,
                nombre: item.nombre || "Sin nombre",
                categoria: item.categoria || "Otros",
                costo: parseFloat(item.costo) || 0,
                precioVenta: parseFloat(item.precioVenta) || 0,
                foodCost: (parseFloat(item.costo) / parseFloat(item.precioVenta) * 100) || 0,
                tiempo: item.tiempo || "15 min",
                porciones: item.porciones || "1",
                version: item.version || "v1",
                estado: item.estado || "Activa",
                ingredientes: "0",
                detalleIngredientes: []
            }));
            
            this.recetas = [...this.recetas, ...nuevasRecetas];
            this.renderizar();
            this.actualizarStats();
            alert(`Se importaron ${nuevasRecetas.length} recetas exitosamente.`);
        };
        reader.readAsArrayBuffer(file);
    }
}

// Inicializar controlador
document.addEventListener('DOMContentLoaded', () => {
    new RecetasController();
});
