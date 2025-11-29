/**
 * Component Loader
 * Dynamically loads HTML components (header, footer, etc.)
 * Follows Single Responsibility Principle: Only handles component loading and parameter application
 */

class ComponentLoader {
    // ============================================================================
    // Core Loading Methods
    // ============================================================================

    /**
     * Load a component from the components directory
     * @param {string} componentName - Name of the component file (without .html)
     * @param {string} targetSelector - CSS selector for the target container
     * @param {Object} params - Optional parameters to set in the component after loading
     * @returns {Promise<void>}
     */
    static async loadComponent(componentName, targetSelector, params = {}) {
        try {
            const html = await this._fetchComponentHTML(componentName);
            const targetElement = this._getTargetElement(targetSelector);

            targetElement.innerHTML = html;

            // Apply parameters to the loaded component
            if (params && Object.keys(params).length > 0) {
                this.applyParameters(targetElement, params);
            }

            console.log(`✓ Component loaded: ${componentName}`);
        } catch (error) {
            console.error(`✗ Error loading component ${componentName}:`, error);
            throw error;
        }
    }

    /**
     * Load multiple components in parallel
     * @param {Array<{name: string, target: string, params?: Object}>} components - Array of component configs
     * @returns {Promise<void[]>}
     */
    static async loadComponents(components) {
        const loadPromises = components.map(component =>
            this.loadComponent(component.name, component.target, component.params || {})
        );

        return Promise.all(loadPromises);
    }

    // ============================================================================
    // Parameter Application Methods
    // ============================================================================

    /**
     * Apply parameters to elements in the loaded component
     * @param {HTMLElement} container - Container element
     * @param {Object} params - Parameters object with element IDs as keys
     * @private
     */
    static applyParameters(container, params) {
        Object.keys(params).forEach(elementId => {
            const element = container.querySelector(`#${elementId}`);
            if (element) {
                // Special handling for breadcrumb
                if (elementId === 'banner-breadcrumb' && typeof params[elementId] === 'object') {
                    this.applyBreadcrumbStructure(container, params[elementId]);
                } else {
                    element.textContent = params[elementId];
                }
            }
        });
    }

    /**
     * Apply multi-level breadcrumb structure
     * @param {HTMLElement} container - Container element
     * @param {Array} breadcrumbData - Breadcrumb structure array
     * @private
     */
    static applyBreadcrumbStructure(container, breadcrumbData) {
        const breadcrumbContainer = container.querySelector('.breadcrumb');
        if (!breadcrumbContainer || !Array.isArray(breadcrumbData)) return;

        breadcrumbContainer.innerHTML = '';

        breadcrumbData.forEach((item, index) => {
            if (index > 0) {
                this._appendBreadcrumbSeparator(breadcrumbContainer);
            }

            if (item.href) {
                this._appendBreadcrumbLink(breadcrumbContainer, item);
            } else {
                this._appendBreadcrumbCurrent(breadcrumbContainer, item);
            }
        });
    }

    // ============================================================================
    // Private Helper Methods
    // ============================================================================

    /**
     * Fetch component HTML from server
     * @param {string} componentName - Component file name
     * @returns {Promise<string>} HTML content
     * @private
     */
    static async _fetchComponentHTML(componentName) {
        const response = await fetch(`/201-project/components/${componentName}.html`);

        if (!response.ok) {
            throw new Error(`Failed to load component: ${componentName}`);
        }

        return response.text();
    }

    /**
     * Get target element by selector
     * @param {string} targetSelector - CSS selector
     * @returns {HTMLElement}
     * @throws {Error} If element not found
     * @private
     */
    static _getTargetElement(targetSelector) {
        const element = document.querySelector(targetSelector);

        if (!element) {
            throw new Error(`Target element not found: ${targetSelector}`);
        }

        return element;
    }

    /**
     * Append breadcrumb separator
     * @param {HTMLElement} container - Breadcrumb container
     * @private
     */
    static _appendBreadcrumbSeparator(container) {
        const separator = document.createElement('span');
        separator.className = 'breadcrumb-separator';
        separator.textContent = '>';
        container.appendChild(separator);
    }

    /**
     * Append breadcrumb link element
     * @param {HTMLElement} container - Breadcrumb container
     * @param {Object} item - Breadcrumb item {text, href}
     * @private
     */
    static _appendBreadcrumbLink(container, item) {
        const link = document.createElement('a');
        link.href = item.href;
        link.className = 'breadcrumb-link';
        link.textContent = item.text;

        // Apply special click handlers
        this._attachBreadcrumbLinkHandlers(link, item);

        container.appendChild(link);
    }

    /**
     * Attach special event handlers to breadcrumb links
     * @param {HTMLElement} link - Link element
     * @param {Object} item - Breadcrumb item
     * @private
     */
    static _attachBreadcrumbLinkHandlers(link, item) {
        // Special handling for Cart link on checkout page
        if (item.text === 'Cart' && item.href === 'cart.html') {
            this._attachCartLinkHandler(link);
        }

        // Mark shop navigation for state restoration
        if (item.href === 'shop.html') {
            this._attachShopLinkHandler(link);
        }
    }

    /**
     * Attach cart link handler for checkout page
     * @param {HTMLElement} link - Link element
     * @private
     */
    static _attachCartLinkHandler(link) {
        const isCheckoutPage = document.getElementById('checkoutForm');
        if (isCheckoutPage) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                // Set flag to restore selection when returning to cart
                sessionStorage.setItem('returning_from_checkout', 'true');
                window.location.href = '/201-project/cart.html';
            });
        }
    }

    /**
     * Attach shop link handler (simplified)
     * @param {HTMLElement} link - Link element
     * @private
     */
    static _attachShopLinkHandler(link) {
        // Shop navigation handler (no state management needed)
    }

    /**
     * Append current breadcrumb item (non-clickable)
     * @param {HTMLElement} container - Breadcrumb container
     * @param {Object} item - Breadcrumb item {text}
     * @private
     */
    static _appendBreadcrumbCurrent(container, item) {
        const current = document.createElement('span');
        current.className = 'breadcrumb-current';
        current.textContent = item.text;
        container.appendChild(current);
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.ComponentLoader = ComponentLoader;
}

