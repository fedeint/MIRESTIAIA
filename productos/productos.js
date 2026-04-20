/**
 * Controlador principal de la sección de Productos
 */

import { PRODUCT_CATEGORIES, MOCK_PRODUCTS } from './productos-data.js';
import { createProductCard, createCategoryPill, renderMetricCard, createProductDetailModal } from './productos-components.js';

class ProductosController {
  constructor() {
    this.products = MOCK_PRODUCTS;
    this.categories = PRODUCT_CATEGORIES;
    this.currentCategory = 'todos';
    this.searchTerm = '';
    this.activeModal = null;

    this.init();
  }

  init() {
    this.cacheDOM();
    this.bindEvents();
    this.render();
  }

  cacheDOM() {
    this.metricsContainer = document.getElementById('metricsContainer');
    this.categoriesContainer = document.getElementById('categoriesContainer');
    this.productsContainer = document.getElementById('productsContainer');
    this.productSearch = document.getElementById('productSearch');
  }

  bindEvents() {
    this.productSearch.addEventListener('input', (e) => {
      this.searchTerm = e.target.value.toLowerCase();
      this.renderProducts();
    });

    this.categoriesContainer.addEventListener('click', (e) => {
      const pill = e.target.closest('.category-pill');
      if (pill) {
        this.currentCategory = pill.dataset.category;
        this.updateCategoryPills();
        this.renderProducts();
      }
    });

    // Evento para abrir modal al hacer click en una card
    this.productsContainer.addEventListener('click', (e) => {
      const card = e.target.closest('.product-card');
      if (card) {
        const productId = parseInt(card.dataset.id);
        const product = this.products.find(p => p.id === productId);
        if (product) this.openProductModal(product);
      }
    });
  }

  render() {
    this.renderMetrics();
    this.renderCategories();
    this.renderProducts();
  }

  renderMetrics() {
    const available = this.products.filter(p => p.status === 'disponible').length;
    const outOfStock = this.products.filter(p => p.status === 'agotado').length;
    const mostSold = this.products.find(p => p.popular) || this.products[0];

    this.metricsContainer.innerHTML = `
      ${renderMetricCard('metricAvailable', 'Disponibles', available, 'check-circle', 'success')}
      ${renderMetricCard('metricOutOfStock', 'Agotados', outOfStock, 'alert-triangle', 'warning')}
      ${renderMetricCard('metricMostSold', 'Más Vendido', mostSold.name, 'flame', 'accent')}
    `;
    
    if (window.lucide) lucide.createIcons();
  }

  renderCategories() {
    this.categoriesContainer.innerHTML = '';
    this.categories.forEach(cat => {
      const pill = createCategoryPill(cat, cat.id === this.currentCategory);
      this.categoriesContainer.appendChild(pill);
    });
  }

  updateCategoryPills() {
    const pills = this.categoriesContainer.querySelectorAll('.category-pill');
    pills.forEach(pill => {
      pill.classList.toggle('active', pill.dataset.category === this.currentCategory);
    });
  }

  renderProducts() {
    const filtered = this.products.filter(p => {
      const matchesCategory = this.currentCategory === 'todos' || p.category === this.currentCategory;
      const matchesSearch = p.name.toLowerCase().includes(this.searchTerm);
      return matchesCategory && matchesSearch;
    });

    this.productsContainer.innerHTML = '';
    
    if (filtered.length === 0) {
      this.productsContainer.innerHTML = `
        <div class="mod-placeholder">
          <div class="mod-placeholder-icon">
            <i data-lucide="search-x"></i>
          </div>
          <h2>No se encontraron productos</h2>
          <p>Intenta con otros términos de búsqueda o categoría.</p>
        </div>
      `;
    } else {
      filtered.forEach(p => {
        const card = createProductCard(p);
        this.productsContainer.appendChild(card);
      });
    }

    if (window.lucide) lucide.createIcons();
  }

  openProductModal(product) {
    const modalElement = createProductDetailModal(product);
    document.body.appendChild(modalElement);
    document.body.style.overflow = 'hidden'; // Bloquear scroll
    this.activeModal = modalElement;

    if (window.lucide) lucide.createIcons();

    // Lógica de galería (slider)
    let currentSlide = 0;
    const slides = modalElement.querySelectorAll('.modal-slide');
    const indicators = modalElement.querySelectorAll('.slide-indicator');
    const totalSlides = slides.length;
    let autoPlayInterval = null;

    const showSlide = (n) => {
      slides[currentSlide].classList.remove('active');
      indicators[currentSlide].classList.remove('active');
      currentSlide = (n + totalSlides) % totalSlides;
      slides[currentSlide].classList.add('active');
      indicators[currentSlide].classList.add('active');
    };

    const startAutoPlay = () => {
      if (totalSlides <= 1) return;
      autoPlayInterval = setInterval(() => {
        showSlide(currentSlide + 1);
      }, 4000); // Cambiar cada 4 segundos
    };

    const resetAutoPlay = () => {
      clearInterval(autoPlayInterval);
      startAutoPlay();
    };

    modalElement.querySelector('.modal-next').addEventListener('click', () => {
      showSlide(currentSlide + 1);
      resetAutoPlay();
    });

    modalElement.querySelector('.modal-prev').addEventListener('click', () => {
      showSlide(currentSlide - 1);
      resetAutoPlay();
    });
    
    indicators.forEach((ind, idx) => {
      ind.addEventListener('click', () => {
        showSlide(idx);
        resetAutoPlay();
      });
    });

    startAutoPlay();

    // Cerrar modal
    const closeModal = () => {
      clearInterval(autoPlayInterval);
      modalElement.classList.add('fade-out');
      setTimeout(() => {
        modalElement.remove();
        document.body.style.overflow = '';
        this.activeModal = null;
      }, 300);
    };

    modalElement.querySelector('.modal-close').addEventListener('click', closeModal);
    modalElement.querySelector('.modal-overlay').addEventListener('click', closeModal);
    
    // Cerrar con Escape
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', onKeyDown);
      }
    };
    document.addEventListener('keydown', onKeyDown);
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  new ProductosController();
});
