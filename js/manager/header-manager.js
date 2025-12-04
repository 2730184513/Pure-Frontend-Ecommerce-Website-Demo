/**
 * Header Manager
 * Manages header components: Navigation, Search, Cart, Wishlist, and User
 * Follows Single Responsibility Principle: Only handles header-related functionality
 */

class HeaderManager {
    constructor() {
        this.components = {
            navigation: null,
            search: null,
            cart: null,
            wishlist: null,
            user: null
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
        this._initUser();
        this._initMobileMenu();
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
        // Create global cart manager instance if it doesn't exist
        if (!window.cartManagerInstance && window.CartManager) {
            window.cartManagerInstance = new CartManager();
            window.cartManagerInstance.init();
            console.log('✓ Global cart manager initialized');
        }

        // Use the global cart manager instance
        if (window.cartManagerInstance) {
            this.components.cart = window.cartManagerInstance;
        } else {
            console.warn('Cart manager could not be initialized');
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

    /**
     * Initialize user component
     * @private
     */
    _initUser() {
        if (window.UserManager) {
            this.components.user = new UserManager();
            this.components.user.init();
        } else {
            console.warn('UserManager not found');
        }
    }

    /**
     * Initialize mobile menu toggle
     * @private
     */
    _initMobileMenu() {
        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        const navbar = document.getElementById('navbar');

        if (mobileMenuToggle && navbar) {
            mobileMenuToggle.addEventListener('click', () => {
                mobileMenuToggle.classList.toggle('active');
                navbar.classList.toggle('active');
            });

            // Close mobile menu when clicking on a nav link
            const navLinks = navbar.querySelectorAll('.nav-link-text');
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    mobileMenuToggle.classList.remove('active');
                    navbar.classList.remove('active');
                });
            });

            // Close mobile menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!navbar.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
                    mobileMenuToggle.classList.remove('active');
                    navbar.classList.remove('active');
                }
            });

            console.log('✓ Mobile menu initialized');
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
     * Get user manager instance
     * @returns {UserManager|null}
     */
    getUser() {
        return this.components.user;
    }

    /**
     * Get specific component by name
     * @param {string} componentName - Name of component ('navigation', 'search', 'cart', 'wishlist', 'user')
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

