/**
 * Breadcrumb Renderer for Product Detail Page
 * Renders breadcrumb navigation based on source page
 * Reuses styles from page-banner.css
 */

class BreadcrumbRenderer {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
    }

    /**
     * Render breadcrumb navigation
     * @param {Object} options - Rendering options
     * @param {string} options.sourcePage - Source page identifier ('home', 'shop', 'product-detail')
     * @param {string} options.productName - Current product name
     */
    render({ sourcePage, productName }) {
        if (!this.container) {
            console.error('Breadcrumb container not found');
            return;
        }

        // Build breadcrumb HTML based on source page
        const breadcrumbHTML = this.buildBreadcrumbHTML(sourcePage, productName);
        this.container.innerHTML = breadcrumbHTML;
    }

    /**
     * Build breadcrumb HTML structure
     * @param {string} sourcePage - Source page identifier
     * @param {string} productName - Product name
     * @returns {string} HTML string
     * @private
     */
    buildBreadcrumbHTML(sourcePage, productName) {
        let html = '<a href="./index.html" class="breadcrumb-link">Home</a>';

        // Add Shop link if coming from shop or another product detail page
        if (sourcePage === 'shop' || sourcePage === 'product-detail') {
            html += '<span class="breadcrumb-separator">&gt;</span>';
            html += '<a href="./shop.html" class="breadcrumb-link">Shop</a>';
        }

        // Add separator and product name
        html += '<span class="breadcrumb-separator">|</span>';
        html += `<span class="breadcrumb-current">${this.escapeHTML(productName)}</span>`;

        return html;
    }

    /**
     * Escape HTML special characters
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     * @private
     */
    escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Update product name only
     * @param {string} productName - New product name
     */
    updateProductName(productName) {
        const currentSpan = this.container?.querySelector('.breadcrumb-current');
        if (currentSpan) {
            currentSpan.textContent = productName;
        }
    }
}

// Export to global scope
if (typeof window !== 'undefined') {
    window.BreadcrumbRenderer = BreadcrumbRenderer;
}
