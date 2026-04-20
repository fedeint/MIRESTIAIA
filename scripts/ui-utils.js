/**
 * MiRest con IA - Shared UI & PWA Utilities
 */

const THEME_KEY = "mirest-ui-theme";

/**
 * Aplica el tema (light/dark) y lo persiste en localStorage
 */
export function applyTheme(theme, themeIconId) {
  document.documentElement.dataset.theme = theme;
  document.body.dataset.theme = theme;
  localStorage.setItem(THEME_KEY, theme);
  
  const themeIcon = document.getElementById(themeIconId);
  if (themeIcon) {
    themeIcon.setAttribute('data-lucide', theme === 'dark' ? 'sun' : 'moon');
  }
  
  // Sincronizar el botón de la topbar si existe
  const themeBtn = document.getElementById('themeToggle');
  if (themeBtn) {
    if (themeBtn.classList.contains('theme-fab')) {
      // Si es un FAB, no poner texto, asegurar icono
      themeBtn.textContent = '';
      let icon = themeBtn.querySelector('[data-lucide]');
      if (!icon) {
        themeBtn.innerHTML = `<i data-lucide="${theme === 'dark' ? 'sun' : 'moon'}"></i>`;
      } else {
        icon.setAttribute('data-lucide', theme === 'dark' ? 'sun' : 'moon');
      }
    } else {
      // Estilo antiguo con texto
      themeBtn.textContent = theme === 'dark' ? 'Modo claro' : 'Modo oscuro';
    }
  }

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

/**
 * Inicializa el tema guardado
 */
export function initTheme(themeToggleId, themeIconId) {
  const themeToggle = document.getElementById(themeToggleId);
  const savedTheme = localStorage.getItem(THEME_KEY) || document.body.dataset.theme || 'dark';
  
  applyTheme(savedTheme, themeIconId);

  if (themeToggle) {
    themeToggle.addEventListener('click', (e) => {
      e.preventDefault();
      const currentTheme = document.documentElement.dataset.theme || 'light';
      const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
      applyTheme(nextTheme, themeIconId);
    });
  }
}

/**
 * Muestra una notificación estilo Toast
 */
export function showToast(toastId, msgId, message, iconId, iconName = 'alert-circle') {
  const toast = document.getElementById(toastId);
  const span = document.getElementById(msgId);
  const icon = document.getElementById(iconId);
  
  if (!toast || !span) {
    console.warn('Toast elements not found');
    return;
  }

  span.innerHTML = message;
  if (icon) {
    icon.setAttribute('data-lucide', iconName);
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }
  
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

/**
 * Muestra un modal con animaciones profesionales
 */
export function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  
  const modalContent = modal.querySelector('.cj-modal') || modal.querySelector('.ck-modal');
  
  modal.classList.add('open');
  if (modalContent) {
    modalContent.classList.remove('fade-out');
    modalContent.classList.add('puff-in-center');
  }
}

/**
 * Cierra un modal con animaciones profesionales
 */
export function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  
  const modalContent = modal.querySelector('.cj-modal') || modal.querySelector('.ck-modal');
  
  if (modalContent) {
    modalContent.classList.remove('puff-in-center');
    modalContent.classList.add('puff-out-center');
    
    // Esperar a que termine la animación antes de ocultar el overlay
    setTimeout(() => {
      modal.classList.remove('open');
      modalContent.classList.remove('puff-out-center');
    }, 450); // Un poco menos que la duración de la animación (0.5s)
  } else {
    modal.classList.remove('open');
  }
}

/**
 * Activar Screen Wake Lock API
 */
export async function requestWakeLock() {
  if ('wakeLock' in navigator) {
    try {
      const wakeLock = await navigator.wakeLock.request('screen');
      console.log('Wake Lock activo');
      return wakeLock;
    } catch (err) {
      console.error('Wake Lock denegado:', err);
    }
  }
  return null;
}
