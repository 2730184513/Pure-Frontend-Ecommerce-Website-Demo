/**
 * Navigation Manager
 * Handles navigation bar animations and interactions
 */
class NavigationManager {
    constructor() {
        this.isInitialized = false;
    }

    init() {
        if (this.isInitialized) return;

        this.setActiveNavLink();
        this.isInitialized = true;
    }

    /**
     * Set active state on current page navigation link
     */
    setActiveNavLink() {
        const path = window.location.pathname;
        const page = path.split('/').pop() || 'index.html';

        const links = document.querySelectorAll('.nav-links a');
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href && (href === page || (page === '' && href === 'index.html') || href.includes(page))) {
                const textSpan = link.querySelector('.nav-link-text');
                if (textSpan) {
                    textSpan.classList.add('active');
                }
            }
        });
    }

    /**
     * Remove active state from all navigation links
     */
    clearActiveStates() {
        const links = document.querySelectorAll('.nav-links a .nav-link-text');
        links.forEach(link => link.classList.remove('active'));
    }

    /**
     * Programmatically set active link
     * @param {string} page - Page name (e.g., 'shop.html')
     */
    setActivePage(page) {
        this.clearActiveStates();
        const links = document.querySelectorAll('.nav-links a');
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href === page) {
                const textSpan = link.querySelector('.nav-link-text');
                if (textSpan) {
                    textSpan.classList.add('active');
                }
            }
        });
    }
}

if (typeof window !== 'undefined') {
    window.NavigationManager = NavigationManager;
}

