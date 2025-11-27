/**
 * Page Utility
 * Utility functions for page detection and management
 * Follows Single Responsibility Principle: Only handles page detection logic
 */

class PageUtility {
    /**
     * Page identifiers mapping
     * Maps page identifiers to page IDs
     */
    static PAGE_IDS = {
        HOME: 1,
        SHOP: 2,
        CART: 3,
        CHECKOUT: 4
    };

    /**
     * Page detection selectors
     * Each page has unique identifiers used for detection
     */
    static PAGE_SELECTORS = {
        [this.PAGE_IDS.HOME]: '#inspirationsCarousel, #browseRange',
        [this.PAGE_IDS.SHOP]: '#shop-product-grid',
        [this.PAGE_IDS.CART]: '#cart-items-container',
        [this.PAGE_IDS.CHECKOUT]: '#checkoutForm'
    };

    /**
     * Page names for logging
     */
    static PAGE_NAMES = {
        [this.PAGE_IDS.HOME]: 'Home',
        [this.PAGE_IDS.SHOP]: 'Shop',
        [this.PAGE_IDS.CART]: 'Cart',
        [this.PAGE_IDS.CHECKOUT]: 'Checkout'
    };

    /**
     * Detect current page based on DOM selectors
     * @param {Array<string>} pageSelectors - Array of CSS selectors to check
     * @returns {number|null} Page ID if detected, null otherwise
     */
    static detectPage(pageSelectors) {
        for (const pageId in this.PAGE_SELECTORS) {
            const selectors = this.PAGE_SELECTORS[pageId].split(',').map(s => s.trim());
            const exists = selectors.some(selector => document.querySelector(selector));

            if (exists) {
                return parseInt(pageId);
            }
        }
        return null;
    }

    /**
     * Get current page ID
     * @returns {number|null} Current page ID or null if not detected
     */
    static getCurrentPageId() {
        return this.detectPage(Object.values(this.PAGE_SELECTORS));
    }

    /**
     * Get page name by ID
     * @param {number} pageId - Page ID
     * @returns {string} Page name
     */
    static getPageName(pageId) {
        return this.PAGE_NAMES[pageId] || 'Unknown';
    }

    /**
     * Check if current page matches a specific page ID
     * @param {number} pageId - Page ID to check
     * @returns {boolean}
     */
    static isCurrentPage(pageId) {
        return this.getCurrentPageId() === pageId;
    }

    /**
     * Check if current page is home
     * @returns {boolean}
     */
    static isHomePage() {
        return this.isCurrentPage(this.PAGE_IDS.HOME);
    }

    /**
     * Check if current page is shop
     * @returns {boolean}
     */
    static isShopPage() {
        return this.isCurrentPage(this.PAGE_IDS.SHOP);
    }

    /**
     * Check if current page is cart
     * @returns {boolean}
     */
    static isCartPage() {
        return this.isCurrentPage(this.PAGE_IDS.CART);
    }

    /**
     * Check if current page is checkout
     * @returns {boolean}
     */
    static isCheckoutPage() {
        return this.isCurrentPage(this.PAGE_IDS.CHECKOUT);
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.PageUtility = PageUtility;
}

