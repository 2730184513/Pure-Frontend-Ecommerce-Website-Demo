/**
 * Toast Notification System
 * Displays modern toast notifications with auto-dismiss and stacking
 */
class ToastManager {
    constructor() {
        this.container = null;
        this.toasts = [];
        this.timers = new Map(); // Store timers and remaining time for each toast
        this.isHovering = false;
        this.init();
    }

    /**
     * Initialize toast container
     */
    init() {
        if (this.container) return;

        this.container = document.createElement('div');
        this.container.id = 'toast-container';
        this.container.className = 'toast-container';
        document.body.appendChild(this.container);
    }

    /**
     * Show a toast notification
     * @param {string} message - Message to display
     * @param {string} type - Toast type: 'success', 'error', 'info', 'warning'
     * @param {number} duration - Duration in milliseconds (default: 3000)
     */
    show(message, type = 'info', duration = 3000) {
        const toast = this.createToast(message, type);
        this.container.insertBefore(toast, this.container.firstChild);
        this.toasts.unshift(toast);

        // Setup hover listeners
        this.setupHoverListeners(toast);

        // Trigger animation
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        // Store timer info for this toast
        this.timers.set(toast, {
            remainingTime: duration,
            startTime: Date.now(),
            timerId: null
        });

        // Start auto dismiss timer
        this.startTimer(toast);

        return toast;
    }

    /**
     * Create toast element
     * @param {string} message - Message text
     * @param {string} type - Toast type
     * @returns {HTMLElement} Toast element
     * @private
     */
    createToast(message, type) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const iconSrc = this.getIcon(type);

        toast.innerHTML = `
            <div class="toast-icon">
                <img src="${iconSrc}" alt="${type}" class="toast-icon-img">
            </div>
            <div class="toast-message">${message}</div>
        `;

        return toast;
    }

    /**
     * Get icon path for toast type
     * @param {string} type - Toast type
     * @returns {string} Icon image path
     * @private
     */
    getIcon(type) {
        const icons = {
            success: './images/icons/success.png',
            error: './images/icons/error.png',
            info: './images/icons/info.png',
            warning: './images/icons/attention.png'
        };
        return icons[type] || icons.info;
    }

    /**
     * Setup hover listeners for a toast
     * @param {HTMLElement} toast - Toast element
     * @private
     */
    setupHoverListeners(toast) {
        toast.addEventListener('mouseenter', () => {
            this.pauseAllTimers();
        });

        toast.addEventListener('mouseleave', () => {
            this.resumeAllTimers();
        });
    }

    /**
     * Start timer for a toast
     * @param {HTMLElement} toast - Toast element
     * @private
     */
    startTimer(toast) {
        const timerInfo = this.timers.get(toast);
        if (!timerInfo) return;

        timerInfo.startTime = Date.now();
        timerInfo.timerId = setTimeout(() => {
            this.dismiss(toast);
        }, timerInfo.remainingTime);
    }

    /**
     * Pause all timers when hovering
     * @private
     */
    pauseAllTimers() {
        if (this.isHovering) return;
        this.isHovering = true;

        this.toasts.forEach(toast => {
            const timerInfo = this.timers.get(toast);
            if (!timerInfo || !timerInfo.timerId) return;

            // Clear the timer
            clearTimeout(timerInfo.timerId);

            // Calculate remaining time
            const elapsed = Date.now() - timerInfo.startTime;
            timerInfo.remainingTime = Math.max(0, timerInfo.remainingTime - elapsed);
            timerInfo.timerId = null;
        });
    }

    /**
     * Resume all timers when mouse leaves
     * @private
     */
    resumeAllTimers() {
        if (!this.isHovering) return;
        this.isHovering = false;

        this.toasts.forEach(toast => {
            const timerInfo = this.timers.get(toast);
            if (!timerInfo || timerInfo.remainingTime <= 0) return;

            // Restart the timer with remaining time
            this.startTimer(toast);
        });
    }

    /**
     * Dismiss a toast
     * @param {HTMLElement} toast - Toast element to dismiss
     */
    dismiss(toast) {
        if (!toast || !toast.parentNode) return;

        // Clear timer if exists
        const timerInfo = this.timers.get(toast);
        if (timerInfo && timerInfo.timerId) {
            clearTimeout(timerInfo.timerId);
        }
        this.timers.delete(toast);

        // Add dismiss animation
        toast.classList.add('dismissing');

        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
            this.toasts = this.toasts.filter(t => t !== toast);
        }, 300); // Match CSS animation duration
    }

    /**
     * Show success toast
     * @param {string} message - Message to display
     */
    success(message) {
        return this.show(message, 'success');
    }

    /**
     * Show error toast
     * @param {string} message - Message to display
     */
    error(message) {
        return this.show(message, 'error');
    }

    /**
     * Show info toast
     * @param {string} message - Message to display
     */
    info(message) {
        return this.show(message, 'info');
    }

    /**
     * Show warning toast
     * @param {string} message - Message to display
     */
    warning(message) {
        return this.show(message, 'warning');
    }
}

// Create global instance
if (typeof window !== 'undefined') {
    window.ToastManager = ToastManager;
    window.toast = new ToastManager();
    window.toastManager = window.toast; // Alias for compatibility
}

