/**
 * Toast Notification System
 * Provides simple, non-intrusive notifications
 */

class ToastManager {
  constructor() {
    this.container = document.getElementById('toast-container');
    this.toasts = [];
    this.defaultDuration = 3000; // 3 seconds
  }
  
  /**
   * Show a toast notification
   * @param {string} message - Message to display
   * @param {string} type - Type of toast (success, error, info, warning)
   * @param {number} duration - Duration in milliseconds
   */
  show(message, type = 'info', duration = this.defaultDuration) {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Add icon based on type
    let icon = '';
    switch (type) {
      case 'success':
        icon = '<i class="fas fa-check-circle"></i>';
        break;
      case 'error':
        icon = '<i class="fas fa-exclamation-circle"></i>';
        break;
      case 'warning':
        icon = '<i class="fas fa-exclamation-triangle"></i>';
        break;
      case 'info':
      default:
        icon = '<i class="fas fa-info-circle"></i>';
        break;
    }
    
    // Set toast content
    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-message">${message}</div>
      <button class="toast-close">&times;</button>
    `;
    
    // Add close button event
    const closeButton = toast.querySelector('.toast-close');
    closeButton.addEventListener('click', () => {
      this.hide(toast);
    });
    
    // Add to container
    this.container.appendChild(toast);
    
    // Add to toasts array
    this.toasts.push(toast);
    
    // Show toast with animation
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);
    
    // Auto hide after duration
    const timeoutId = setTimeout(() => {
      this.hide(toast);
    }, duration);
    
    // Store timeout ID
    toast.timeoutId = timeoutId;
    
    return toast;
  }
  
  /**
   * Hide a toast notification
   * @param {HTMLElement} toast - Toast element to hide
   */
  hide(toast) {
    // Clear timeout
    if (toast.timeoutId) {
      clearTimeout(toast.timeoutId);
    }
    
    // Remove show class
    toast.classList.remove('show');
    
    // Remove from DOM after animation
    setTimeout(() => {
      if (toast.parentNode === this.container) {
        this.container.removeChild(toast);
      }
      
      // Remove from toasts array
      const index = this.toasts.indexOf(toast);
      if (index > -1) {
        this.toasts.splice(index, 1);
      }
    }, 300);
  }
  
  /**
   * Show a success toast
   * @param {string} message - Message to display
   * @param {number} duration - Duration in milliseconds
   */
  success(message, duration = this.defaultDuration) {
    return this.show(message, 'success', duration);
  }
  
  /**
   * Show an error toast
   * @param {string} message - Message to display
   * @param {number} duration - Duration in milliseconds
   */
  error(message, duration = this.defaultDuration) {
    return this.show(message, 'error', duration);
  }
  
  /**
   * Show a warning toast
   * @param {string} message - Message to display
   * @param {number} duration - Duration in milliseconds
   */
  warning(message, duration = this.defaultDuration) {
    return this.show(message, 'warning', duration);
  }
  
  /**
   * Show an info toast
   * @param {string} message - Message to display
   * @param {number} duration - Duration in milliseconds
   */
  info(message, duration = this.defaultDuration) {
    return this.show(message, 'info', duration);
  }
  
  /**
   * Hide all toasts
   */
  hideAll() {
    [...this.toasts].forEach(toast => {
      this.hide(toast);
    });
  }
}

// Initialize toast manager
const toastManager = new ToastManager();

// Export for use in other modules
window.toastManager = toastManager;
