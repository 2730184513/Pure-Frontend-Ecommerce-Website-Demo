/**
 * Header Manager
 * Manages header components: Navigation, Search, Cart, and Wishlist
 * Follows Single Responsibility Principle: Only handles header-related functionality
 */

class HeaderManager {
    constructor() {
        this.components = {
            navigation: null,
            search: null,
            cart: null,
            wishlist: null
        };
        this.isInitialized = false;
    }

    /**
     * Initialize all header components
     */
    init() {
        if (this.isInitialized) {
            console.warn('HeaderManager already initialized');
            return;
        }

        console.log('🎯 Initializing Header Components...');

        try {
            this._initializeComponents();
            this.isInitialized = true;
            console.log('✓ Header components initialized');
        } catch (error) {
            console.error('✗ Error initializing header components:', error);
            throw error;
        }
    }

    /**
     * Initialize all header sub-components
     * @private
     */
    _initializeComponents() {
        this._initNavigation();
        this._initSearch();
        this._initCart();
        this._initWishlist();
    }

    // ============================================================================
    // Component Initialization Methods
    // ============================================================================

    /**
     * Initialize navigation component
     * @private
     */
    _initNavigation() {
        if (window.NavigationManager) {
            this.components.navigation = new NavigationManager();
            this.components.navigation.init();
        } else {
            console.warn('NavigationManager not found');
        }
    }

    /**
     * Initialize search component
     * @private
     */
    _initSearch() {
        if (window.SearchManager) {
            this.components.search = new SearchManager();
            this.components.search.init();
        } else {
            console.warn('SearchManager not found');
        }
    }

    /**
     * Initialize cart component
     * @private
     */
    _initCart() {
        if (window.CartManager) {
            this.components.cart = new CartManager();
            this.components.cart.init();
            // Save to window for checkout page to access
            window.cartManagerInstance = this.components.cart;
        } else {
            console.warn('CartManager not found');
        }
    }

    /**
     * Initialize wishlist component
     * @private
     */
    _initWishlist() {
        if (window.WishlistManager) {
            this.components.wishlist = new WishlistManager();
            this.components.wishlist.init();
        } else {
            console.warn('WishlistManager not found');
        }
    }

    // ============================================================================
    // Public Accessors
    // ============================================================================

    /**
     * Get navigation manager instance
     * @returns {NavigationManager|null}
     */
    getNavigation() {
        return this.components.navigation;
    }

    /**
     * Get search manager instance
     * @returns {SearchManager|null}
     */
    getSearch() {
        return this.components.search;
    }

    /**
     * Get cart manager instance
     * @returns {CartManager|null}
     */
    getCart() {
        return this.components.cart;
    }

    /**
     * Get wishlist manager instance
     * @returns {WishlistManager|null}
     */
    getWishlist() {
        return this.components.wishlist;
    }

    /**
     * Get specific component by name
     * @param {string} componentName - Name of component ('navigation', 'search', 'cart', 'wishlist')
     * @returns {Object|null}
     */
    getComponent(componentName) {
        return this.components[componentName] || null;
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.HeaderManager = HeaderManager;
}

