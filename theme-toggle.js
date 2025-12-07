/**
 * Theme Toggle - Modo Oscuro/Claro
 * Este script gestiona el cambio entre modo oscuro y modo claro
 * en todo el sistema de becas
 */

class ThemeToggle {
  constructor() {
    this.currentTheme = localStorage.getItem('theme') || 'dark-mode';
    this.container = null;
    this.button = null;
    this.init();
  }

  init() {
    // Aplicar el tema guardado
    this.applyTheme(this.currentTheme);
    
    // Crear el botón si no existe
    this.createToggleButton();
    
    // Escuchar cambios del sistema operativo (preferencia)
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
          this.currentTheme = e.matches ? 'dark-mode' : 'light-mode';
          this.applyTheme(this.currentTheme);
          this.updateButtonState();
        }
      });
    }
  }

  createToggleButton() {
    // Contenedor para el botón y tooltip
    this.container = document.createElement('div');
    this.container.className = 'theme-toggle-container';
    
    // Botón principal
    this.button = document.createElement('button');
    this.button.className = 'theme-toggle-btn';
    this.button.setAttribute('aria-label', 'Cambiar tema');
    this.button.setAttribute('title', 'Cambiar tema (Modo oscuro/claro)');
    
    this.button.innerHTML = `
      <div class="icon">
        <svg class="sun-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
        <svg class="moon-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      </div>
    `;
    
    this.button.addEventListener('click', () => this.toggleTheme());
    
    // Agregar tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'theme-toggle-tooltip';
    this.updateTooltipText(tooltip);
    
    // Actualizar tooltip al pasar el mouse
    this.button.addEventListener('mouseenter', () => {
      this.updateTooltipText(tooltip);
    });
    
    this.container.appendChild(this.button);
    this.container.appendChild(tooltip);
    
    document.body.appendChild(this.container);
  }

  updateTooltipText(tooltip) {
    tooltip.textContent = this.currentTheme === 'dark-mode' ? '☀️ Modo Claro' : '🌙 Modo Oscuro';
  }

  updateButtonState() {
    if (this.button) {
      const tooltip = this.container.querySelector('.theme-toggle-tooltip');
      this.updateTooltipText(tooltip);
    }
  }

  toggleTheme() {
    this.currentTheme = this.currentTheme === 'dark-mode' ? 'light-mode' : 'dark-mode';
    this.applyTheme(this.currentTheme);
    
    // Guardar la preferencia
    localStorage.setItem('theme', this.currentTheme);
    
    // Efecto de animación
    this.playAnimation();
    
    // Actualizar estado
    this.updateButtonState();
  }

  applyTheme(theme) {
    const html = document.documentElement;
    
    if (theme === 'light-mode') {
      html.classList.add('light-mode');
      html.style.colorScheme = 'light';
    } else {
      html.classList.remove('light-mode');
      html.style.colorScheme = 'dark';
    }
    
    this.currentTheme = theme;
  }

  playAnimation() {
    if (this.button) {
      this.button.classList.remove('spin-animation');
      // Forzar reflow para reiniciar animación
      void this.button.offsetWidth;
      this.button.classList.add('spin-animation');
    }
  }
}

// Agregar estilos de animación
if (document.head) {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { 
        transform: rotate(0deg) scale(1); 
      }
      50% { 
        transform: rotate(180deg) scale(1.05); 
      }
      100% { 
        transform: rotate(360deg) scale(1); 
      }
    }
    
    .theme-toggle-btn.spin-animation {
      animation: spin 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
    }
  `;
  document.head.appendChild(style);
}

// Inicializar cuando el DOM está listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ThemeToggle();
  });
} else {
  new ThemeToggle();
}
