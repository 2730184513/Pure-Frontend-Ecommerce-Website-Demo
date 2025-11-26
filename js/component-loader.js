/**
 * Component Loader
 * Dynamically loads HTML components (header, footer, etc.)
 */

class ComponentLoader {
    /**
     * Load a component from the components directory
     * @param {string} componentName - Name of the component file (without .html)
     * @param {string} targetSelector - CSS selector for the target container
     * @param {Object} params - Optional parameters to set in the component after loading
     * @returns {Promise<void>}
     */
    static async loadComponent(componentName, targetSelector, params = {}) {
        try {
            const response = await fetch(`components/${componentName}.html`);

            if (!response.ok) {
                throw new Error(`Failed to load component: ${componentName}`);
            }

            const html = await response.text();
            const targetElement = document.querySelector(targetSelector);

            if (!targetElement) {
                throw new Error(`Target element not found: ${targetSelector}`);
            }

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
     * Apply parameters to elements in the loaded component
     * @param {HTMLElement} container - Container element
     * @param {Object} params - Parameters object with element IDs as keys
     * @private
     */
    static applyParameters(container, params) {
        Object.keys(params).forEach(elementId => {
            const element = container.querySelector(`#${elementId}`);
            if (element) {
                element.textContent = params[elementId];
            }
        });
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

    /**
     * Initialize common components (header and footer)
     * @returns {Promise<void>}
     */
    static async initCommonComponents() {
        // Create placeholder containers if they don't exist
        this.ensureContainer('header-placeholder');
        this.ensureContainer('footer-placeholder');

        await this.loadComponents([
            { name: 'header', target: '#header-placeholder' },
            { name: 'footer', target: '#footer-placeholder' }
        ]);
    }

    /**
     * Ensure a container element exists
     * @param {string} id - Element ID
     * @private
     */
    static ensureContainer(id) {
        if (!document.getElementById(id)) {
            const container = document.createElement('div');
            container.id = id;

            if (id === 'header-placeholder') {
                document.body.insertBefore(container, document.body.firstChild);
            } else if (id === 'footer-placeholder') {
                document.body.appendChild(container);
            }
        }
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.ComponentLoader = ComponentLoader;
}

