/**
 * NavigationStateManager - Manages navigation state and shop page state restoration
 * Handles:
 * 1. Breadcrumb path preservation across pages
 * 2. Shop page state (filters, search, pagination, sorting) restoration
 */
class NavigationStateManager {
    constructor() {
        this.STORAGE_KEYS = {
            BREADCRUMB_PATH: 'nav_breadcrumb_path',
            SHOP_STATE: 'nav_shop_state',
            CART_SELECTIONS: 'nav_cart_selections'
        };
    }

    // ============================================
    // Breadcrumb Management
    // ============================================

    /**
     * Save breadcrumb path for the current page
     * @param {string} currentPage - Current page name (e.g., 'cart.html')
     * @param {Array} breadcrumb - Breadcrumb array [{text: 'Home', href: 'index.html'}, ...]
     */
    saveBreadcrumbPath(currentPage, breadcrumb) {
        const pathData = {
            page: currentPage,
            breadcrumb: breadcrumb,
            timestamp: Date.now()
        };
        sessionStorage.setItem(this.STORAGE_KEYS.BREADCRUMB_PATH, JSON.stringify(pathData));
    }

    /**
     * Get saved breadcrumb path
     * @returns {Object|null} {page: string, breadcrumb: Array, timestamp: number}
     */
    getBreadcrumbPath() {
        try {
            const data = sessionStorage.getItem(this.STORAGE_KEYS.BREADCRUMB_PATH);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.warn('Failed to parse breadcrumb path:', e);
            return null;
        }
    }

    /**
     * Clear breadcrumb path
     */
    clearBreadcrumbPath() {
        sessionStorage.removeItem(this.STORAGE_KEYS.BREADCRUMB_PATH);
    }

    /**
     * Build dynamic breadcrumb for current page
     * Preserves full path when returning from checkout
     * @param {string} currentPage - Current page name
     * @param {string} referrerPage - Referrer page name
     * @returns {Array} Breadcrumb array
     */
    buildDynamicBreadcrumb(currentPage, referrerPage) {
        const pageNames = {
            'index.html': 'Home',
            'shop.html': 'Shop',
            'cart.html': 'Cart',
            'checkout.html': 'Checkout'
        };

        let breadcrumb = [{text: 'Home', href: '/201-project/index.html'}];

        if (currentPage === 'cart.html') {
            breadcrumb = this._buildCartBreadcrumb(referrerPage, pageNames);
        } else if (currentPage === 'checkout.html') {
            breadcrumb = this._buildCheckoutBreadcrumb(referrerPage, pageNames);
        } else if (pageNames[currentPage] && currentPage !== 'index.html') {
            breadcrumb.push({text: pageNames[currentPage]});
        }

        return breadcrumb;
    }

    /**
     * 专门处理 Cart 页面的面包屑逻辑
     * @private
     * @param {string} referrerPage
     * @param {Object} pageNames
     * @returns {Array}
     */
    _buildCartBreadcrumb(referrerPage, pageNames) {
        let breadcrumb = [{text: 'Home', href: '/201-project/index.html'}];
        const returningFromCheckout = sessionStorage.getItem('returning_from_checkout') === 'true';
        if (returningFromCheckout) {
            const savedPath = this.getBreadcrumbPath();
            if (savedPath && savedPath.page === 'cart.html') {
                breadcrumb = savedPath.breadcrumb;
            } else {
                if (
                    referrerPage &&
                    referrerPage !== 'index.html' &&
                    referrerPage !== 'cart.html' &&
                    referrerPage !== 'checkout.html' &&
                    pageNames[referrerPage]
                ) {
                    breadcrumb.push({text: pageNames[referrerPage], href: `/201-project/${referrerPage}`});
                }
                breadcrumb.push({text: 'Cart'});
            }
        } else {
            if (
                referrerPage &&
                referrerPage !== 'index.html' &&
                referrerPage !== 'cart.html' &&
                referrerPage !== 'checkout.html' &&
                pageNames[referrerPage]
            ) {
                breadcrumb.push({text: pageNames[referrerPage], href: `/201-project/${referrerPage}`});
            }
            breadcrumb.push({text: 'Cart'});
        }
        // 保存以便 checkout 继承
        this.saveBreadcrumbPath('cart.html', breadcrumb);
        return breadcrumb;
    }

    /**
     * 专门处理 Checkout 页面的面包屑逻辑
     * @private
     * @param {string} referrerPage
     * @param {Object} pageNames
     * @returns {Array}
     */
    _buildCheckoutBreadcrumb(referrerPage, pageNames) {
        let breadcrumb = [];
        const savedPath = this.getBreadcrumbPath();
        if (savedPath && savedPath.page === 'cart.html' && referrerPage === 'cart.html') {
            // 继承 Cart 页路径
            breadcrumb = JSON.parse(JSON.stringify(savedPath.breadcrumb));
            // 让 Cart 可点击
            const lastItem = breadcrumb[breadcrumb.length - 1];
            if (lastItem && lastItem.text === 'Cart') {
                lastItem.href = '/201-project/cart.html';
            }
        } else {
            breadcrumb = [
                {text: 'Home', href: '/201-project/index.html'},
                {text: 'Cart', href: '/201-project/cart.html'}
            ];
        }
        breadcrumb.push({text: 'Checkout'});
        return breadcrumb;
    }

    // ============================================
    // Shop State Management
    // ============================================

    /**
     * Save complete shop page state
     * @param {Object} state - Shop state object
     * @param {string} state.searchKeyword - Current search keyword
     * @param {Array} state.categories - Selected categories
     * @param {Object} state.priceRange - {min, max}
     * @param {Object} state.ratingRange - {min, max}
     * @param {Object} state.dateRange - {from, to}
     * @param {number} state.itemsPerPage - Items per page
     * @param {Object} state.sorting - {key: string, order: 'asc'|'desc'}
     * @param {number} state.currentPage - Current page number
     */
    saveShopState(state) {
        const shopState = {
            ...state,
            timestamp: Date.now()
        };
        sessionStorage.setItem(this.STORAGE_KEYS.SHOP_STATE, JSON.stringify(shopState));
    }

    /**
     * Get saved shop state
     * @returns {Object|null} Shop state object
     */
    getShopState() {
        try {
            const data = sessionStorage.getItem(this.STORAGE_KEYS.SHOP_STATE);
            if (!data) return null;

            const state = JSON.parse(data);

            // Check if state is too old (older than 30 minutes)
            const maxAge = 30 * 60 * 1000; // 30 minutes
            if (Date.now() - state.timestamp > maxAge) {
                this.clearShopState();
                return null;
            }

            return state;
        } catch (e) {
            console.warn('Failed to parse shop state:', e);
            return null;
        }
    }

    /**
     * Clear shop state
     */
    clearShopState() {
        sessionStorage.removeItem(this.STORAGE_KEYS.SHOP_STATE);
    }

    /**
     * Check if should restore shop state
     * Returns true if navigating to shop from cart/checkout via breadcrumb or header
     * @returns {boolean}
     */
    shouldRestoreShopState() {
        const referrer = document.referrer;
        if (!referrer) return false;

        try {
            const referrerUrl = new URL(referrer);
            const referrerPage = referrerUrl.pathname.split('/').pop() || 'index.html';

            // Restore state when coming from cart or checkout
            return referrerPage === 'cart.html' || referrerPage === 'checkout.html';
        } catch (e) {
            return false;
        }
    }

    /**
     * Mark navigation source for shop restoration
     * Call this before navigating to shop to ensure state restoration
     */
    markShopNavigation() {
        sessionStorage.setItem('nav_to_shop', 'true');
    }

    /**
     * Check and clear shop navigation marker
     * @returns {boolean} True if marked for restoration
     */
    checkShopNavigationMarker() {
        const marked = sessionStorage.getItem('nav_to_shop') === 'true';
        sessionStorage.removeItem('nav_to_shop');
        return marked;
    }

    // ============================================
    // Cart Selections Management (for checkout return)
    // ============================================

    /**
     * Save cart selections before checkout
     * @param {Array} selectedIds - Array of selected product IDs
     */
    saveCartSelections(selectedIds) {
        const data = {
            selectedIds: selectedIds,
            timestamp: Date.now()
        };
        sessionStorage.setItem(this.STORAGE_KEYS.CART_SELECTIONS, JSON.stringify(data));
    }

    /**
     * Get saved cart selections
     * @returns {Array|null} Array of selected product IDs
     */
    getCartSelections() {
        try {
            const data = sessionStorage.getItem(this.STORAGE_KEYS.CART_SELECTIONS);
            if (!data) return null;

            const parsed = JSON.parse(data);

            // Check if too old (older than 1 hour)
            const maxAge = 60 * 60 * 1000; // 1 hour
            if (Date.now() - parsed.timestamp > maxAge) {
                this.clearCartSelections();
                return null;
            }

            return parsed.selectedIds;
        } catch (e) {
            console.warn('Failed to parse cart selections:', e);
            return null;
        }
    }

    /**
     * Clear cart selections
     */
    clearCartSelections() {
        sessionStorage.removeItem(this.STORAGE_KEYS.CART_SELECTIONS);
    }

    // ============================================
    // Utility Methods
    // ============================================

    /**
     * Get current page name
     * @returns {string} Current page filename
     */
    getCurrentPage() {
        return window.location.pathname.split('/').pop() || 'index.html';
    }

    /**
     * Get referrer page name
     * @returns {string|null} Referrer page filename or null
     */
    getReferrerPage() {
        const referrer = document.referrer;
        if (!referrer) return null;

        try {
            const referrerUrl = new URL(referrer);
            return referrerUrl.pathname.split('/').pop() || 'index.html';
        } catch (e) {
            console.warn('Could not parse referrer:', e);
            return null;
        }
    }

    /**
     * Clear all navigation state
     */
    clearAll() {
        this.clearBreadcrumbPath();
        this.clearShopState();
        this.clearCartSelections();
    }
}

// Export to window
if (typeof window !== 'undefined') {
    window.NavigationStateManager = NavigationStateManager;
}

