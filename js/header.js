/**
 * Header Manager
 * Central manager for all header components
 * Coordinates navigation, search, cart, and wishlist
 */
class HeaderManager {
    constructor() {
        this.navigation = null;
        this.search = null;
        this.cart = null;
        this.wishlist = null;
        this.isInitialized = false;
    }

    /**
     * Initialize all header components
     */
    init() {
        if (this.isInitialized) return;

        // Initialize navigation
        this.navigation = new NavigationManager();
        this.navigation.init();

        // Initialize search
        this.search = new SearchManager();
        this.search.init();

        // Initialize cart
        this.cart = new CartManager();
        this.cart.init();

        // Initialize wishlist
        this.wishlist = new WishlistManager();
        this.wishlist.init();

        this.isInitialized = true;
        console.log('✓ Header Manager initialized');
    }

    /**
     * Get navigation manager
     * @returns {NavigationManager}
     */
    getNavigation() {
        return this.navigation;
    }

    /**
     * Get search manager
     * @returns {SearchManager}
     */
    getSearch() {
        return this.search;
    }

    /**
     * Get cart manager
     * @returns {CartManager}
     */
    getCart() {
        return this.cart;
    }

    /**
     * Get wishlist manager
     * @returns {WishlistManager}
     */
    getWishlist() {
        return this.wishlist;
    }

    /**
     * Close all dropdowns
     */
    closeAllDropdowns() {
        document.querySelectorAll('.header-dropdown').forEach(d => {
            d.classList.remove('active');
        });
    }
}

if (typeof window !== 'undefined') {
    window.HeaderManager = HeaderManager;
}

