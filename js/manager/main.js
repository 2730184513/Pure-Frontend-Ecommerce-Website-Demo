/**
 * Furniro E-commerce - Main Application Controller
 * Central controller: manages component loading, global initialization, and page routing
 * Follows Single Responsibility Principle: Only handles application bootstrapping and coordination
 */

class FurniroApp {
    constructor() {
        this.managers = {
            header: null,
            home: null,
            shop: null,
            cart: null,      // Cart page manager (initialized in cart.html)
            checkout: null,  // Checkout page manager (initialized in checkout.html)
            contact: null,   // Contact page manager (initialized in contact.html)
            about: null,     // About page manager (initialized here)
            productDetail: null,  // Product detail page manager
            login: null,     // Login page manager (initialized in register-login.html)
            manage: null     // Manage page manager (initialized in manage.html)
        };
        this.config = {
            initialProductCount: 8,
            loadMoreCount: 8
        };
        this.isInitialized = false;

        // Page ID mapping for manager dispatch
        this.pageIdToManagerMap = {
            [PageUtility.PAGE_IDS.HOME]: 'home',
            [PageUtility.PAGE_IDS.SHOP]: 'shop',
            [PageUtility.PAGE_IDS.CART]: 'cart',
            [PageUtility.PAGE_IDS.CHECKOUT]: 'checkout',
            [PageUtility.PAGE_IDS.CONTACT]: 'contact',
            [PageUtility.PAGE_IDS.ABOUT]: 'about',
            [PageUtility.PAGE_IDS.PRODUCT_DETAIL]: 'productDetail',
            [PageUtility.PAGE_IDS.LOGIN]: 'login',
            [PageUtility.PAGE_IDS.MANAGE]: 'manage'
        };


        // References to global singletons (will be initialized)
        this.globalSingletons = {
            productRepository: null,
            locationRepository: null,
            productFilter: null
        };
    }

    /**
     * Get dynamic breadcrumb for current page based on referrer
     * @returns {Array} Breadcrumb array [{text: 'Home', href: 'index.html'}, ...]
     */
    static getDynamicBreadcrumb() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';

        // Simple breadcrumb logic without state management
        const pageNames = {
            'index.html': 'Home',
            'shop.html': 'Shop',
            'cart.html': 'Cart',
            'checkout.html': 'Checkout',
            'contact.html': 'Contact',
            'about.html': 'About',
            'register-login.html': 'Login'
        };

        let breadcrumb = [{text: 'Home', href: './index.html'}];

        if (currentPage === 'cart.html') {
            breadcrumb.push({text: 'Cart'});
        } else if (currentPage === 'checkout.html') {
            breadcrumb.push({text: 'Cart', href: './cart.html'});
            breadcrumb.push({text: 'Checkout'});
        } else if (currentPage === 'contact.html') {
            breadcrumb.push({text: 'Contact'});
        } else if (currentPage === 'about.html') {
            breadcrumb.push({text: 'About'});
        } else if (pageNames[currentPage] && currentPage !== 'index.html') {
            breadcrumb.push({text: pageNames[currentPage]});
        }

        return breadcrumb;
    }

    /**
     * Initialize application
     * @returns {Promise<void>}
     */
    async init() {
        if (this.isInitialized) {
            console.warn('Application already initialized');
            return;
        }

        console.log('🚀 Initializing Furniro Application...');

        try {

            // 1. Initialize global singletons and load data
            await this._initializeGlobalSingletons();

            // 2. Load required components (header/footer) for current page
            await this._loadPageComponents();

            // 3. Initialize header manager (which initializes cart manager)
            this._initHeaderManager();

            // 4. Dispatch page-specific logic
            await this._dispatchPageLogic();

            // 5. Expose app instance globally
            window.FurniroApp = this;

            this.isInitialized = true;
            console.log('✓ Furniro Application initialized successfully');
        } catch (error) {
            console.error('✗ Error initializing application:', error);
            throw error;
        }
    }


    // ============================================================================
    // Component Loading Methods
    // ============================================================================

    /**
     * Load components required for current page
     * @private
     */
    async _loadPageComponents() {
        console.log('📦 Loading components...');

        if (!window.ComponentLoader) {
            console.error('ComponentLoader not found');
            return;
        }

        const pageId = PageUtility.getCurrentPageId();
        const components = this._getComponentsForPage(pageId);

        if (components.length > 0) {
            await ComponentLoader.loadComponents(components);
        }
    }

    /**
     * Get components to load based on page ID
     * @param {number} pageId - Current page ID
     * @returns {Array} Array of component configurations
     * @private
     */
    _getComponentsForPage(pageId) {
        // Checkout page loads header but hides it (needed for cart manager)
        if (pageId === PageUtility.PAGE_IDS.CHECKOUT) {
            this._ensureContainer('header-placeholder');
            this._ensureContainer('footer-placeholder');
            return [
                { name: 'header', target: '#header-placeholder' },
                { name: 'footer', target: '#footer-placeholder' }
            ];
        }

        // All other pages load header and footer normally
        this._ensureContainer('header-placeholder');
        this._ensureContainer('footer-placeholder');

        return [
            { name: 'header', target: '#header-placeholder' },
            { name: 'footer', target: '#footer-placeholder' }
        ];
    }

    /**
     * Ensure a container element exists
     * @param {string} id - Element ID
     * @private
     */
    _ensureContainer(id) {
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

    // ============================================================================
    // Manager Initialization Methods
    // ============================================================================

    /**
     * Initialize header manager
     * @private
     */
    _initHeaderManager() {
        if (window.HeaderManager) {
            this.managers.header = new HeaderManager();
            this.managers.header.init();

            // Hide header on checkout page (but keep it in DOM for cart manager access)
            if (PageUtility.isCheckoutPage()) {
                this._hideHeaderOnCheckout();
            }
        } else {
            console.warn('HeaderManager not found');
        }
    }

    /**
     * Hide header on checkout page while keeping it in DOM
     * @private
     */
    _hideHeaderOnCheckout() {
        const header = document.querySelector('.header');
        if (header) {
            header.style.height = '0';
            header.style.minHeight = '0';
            header.style.overflow = 'hidden';
            header.style.border = 'none';
            header.style.visibility = 'hidden';
            header.style.position = 'absolute';
        }

        // Also hide search overlay
        const searchOverlay = document.getElementById('search-overlay');
        if (searchOverlay) {
            searchOverlay.style.display = 'none';
            searchOverlay.style.visibility = 'hidden';
        }

        // Remove body padding-top to align banner with page top
        document.body.style.paddingTop = '0';
    }

    /**
     * Dispatch page-specific logic based on current page
     * Uses PageUtility for detection and dynamic manager creation
     * @private
     */
    async _dispatchPageLogic() {
        const pageId = PageUtility.getCurrentPageId();

        if (!pageId) {
            console.warn('Unable to detect current page');
            return;
        }

        const pageName = PageUtility.getPageName(pageId);
        const managerKey = this.pageIdToManagerMap[pageId];

        console.log(`📄 Detected page: ${pageName} (ID: ${pageId})`);

        // Create and initialize appropriate manager
        await this._initializePageManager(pageId, managerKey, pageName);
    }

    /**
     * Initialize page-specific manager
     * @param {number} pageId - Page ID
     * @param {string} managerKey - Manager key in managers object
     * @param {string} pageName - Page name for logging
     * @private
     */
    async _initializePageManager(pageId, managerKey, pageName) {
        switch (pageId) {
            case PageUtility.PAGE_IDS.HOME:
                await this._initHomeManager(managerKey, pageName);
                break;

            case PageUtility.PAGE_IDS.SHOP:
                await this._initShopManager(managerKey, pageName);
                break;

            case PageUtility.PAGE_IDS.CART:
                this._logExternalManagerInit(pageName);
                break;

            case PageUtility.PAGE_IDS.CHECKOUT:
                this._logExternalManagerInit(pageName);
                break;

            case PageUtility.PAGE_IDS.CONTACT:
                this._logExternalManagerInit(pageName);
                break;

            case PageUtility.PAGE_IDS.ABOUT:
                await this._initAboutManager(managerKey, pageName);
                break;

            case PageUtility.PAGE_IDS.PRODUCT_DETAIL:
                await this._initProductDetailManager(managerKey, pageName);
                break;

            case PageUtility.PAGE_IDS.LOGIN:
                this._logExternalManagerInit(pageName);
                break;

            case PageUtility.PAGE_IDS.MANAGE:
                this._logExternalManagerInit(pageName);
                break;

            default:
                console.warn(`No manager defined for page: ${pageName}`);
        }
    }

    /**
     * Initialize home page manager
     * @param {string} managerKey - Manager key
     * @param {string} pageName - Page name
     * @private
     */
    async _initHomeManager(managerKey, pageName) {
        if (window.HomeManager) {
            this.managers[managerKey] = new HomeManager(this.config);
            await this.managers[managerKey].init();
            console.log(`✓ ${pageName} manager initialized`);
        } else {
            console.warn(`${pageName}Manager not found`);
        }
    }

    /**
     * Initialize shop page manager
     * @param {string} managerKey - Manager key
     * @param {string} pageName - Page name
     * @private
     */
    async _initShopManager(managerKey, pageName) {
        if (window.ShopManager) {
            this.managers[managerKey] = new ShopManager();
            await this.managers[managerKey].init();

            // Expose shop manager globally for SearchManager to access
            window.shopManager = this.managers[managerKey];

            console.log(`✓ ${pageName} manager initialized`);
        } else {
            console.warn(`${pageName}Manager not found`);
        }
    }

    /**
     * Initialize about page manager
     * @param {string} managerKey - Manager key
     * @param {string} pageName - Page name
     * @private
     */
    async _initAboutManager(managerKey, pageName) {
        if (window.AboutManager) {
            this.managers[managerKey] = new AboutManager();
            await this.managers[managerKey].init();
            console.log(`✓ ${pageName} manager initialized`);
        } else {
            console.warn(`${pageName}Manager not found`);
        }
    }

    /**
     * Initialize product detail page manager
     * @param {string} managerKey - Manager key
     * @param {string} pageName - Page name
     * @private
     */
    async _initProductDetailManager(managerKey, pageName) {
        if (window.ProductDetailManager) {
            this.managers[managerKey] = new ProductDetailManager();
            await this.managers[managerKey].init();
            console.log(`✓ ${pageName} manager initialized`);
        } else {
            console.warn(`${pageName}Manager not found`);
        }
    }

    /**
     * Log external manager initialization
     * @param {string} pageName - Page name
     * @private
     */
    _logExternalManagerInit(pageName) {
        console.log(`✓ ${pageName} page detected - manager will be initialized by inline script`);
    }

    // ============================================================================
    // Global Singletons Initialization
    // ============================================================================

    /**
     * Initialize global singletons and pre-load essential data
     * @private
     */
    async _initializeGlobalSingletons() {
        console.log('🔧 Initializing global singletons...');

        try {
            // Verify global singletons are available
            this._verifyGlobalSingletons();

            // Pre-load data based on page requirements
            await this._preloadData();

            console.log('✓ Global singletons initialized');
        } catch (error) {
            console.error('✗ Error initializing global singletons:', error);
            throw error;
        }
    }

    /**
     * Verify that all required global singletons are available
     * @private
     */
    _verifyGlobalSingletons() {
        // Check if global singletons exist
        if (!window.productRepository) {
            throw new Error('window.productRepository singleton not found');
        }
        if (!window.productFilter) {
            throw new Error('window.productFilter singleton not found');
        }

        // Store references
        this.globalSingletons.productRepository = window.productRepository;
        this.globalSingletons.productFilter = window.productFilter;

        // LocationRepository might not be needed on all pages
        if (window.locationRepository) {
            this.globalSingletons.locationRepository = window.locationRepository;
        }

        console.log('✓ Global singletons verified');
    }

    /**
     * Pre-load data based on current page requirements
     * @private
     */
    async _preloadData() {
        const pageId = PageUtility.getCurrentPageId();

        // Pre-load product data for pages that need it
        // Home, Shop, Product Detail: for displaying products
        // Cart, Checkout: for stock validation when modifying quantities
        if (pageId === PageUtility.PAGE_IDS.HOME || 
            pageId === PageUtility.PAGE_IDS.SHOP ||
            pageId === PageUtility.PAGE_IDS.PRODUCT_DETAIL ||
            pageId === PageUtility.PAGE_IDS.CART ||
            pageId === PageUtility.PAGE_IDS.CHECKOUT) {
            await this.globalSingletons.productRepository.loadAll();
            console.log('✓ Product data pre-loaded');
        }

        // Pre-load location data for checkout page
        if (pageId === PageUtility.PAGE_IDS.CHECKOUT) {
            if (this.globalSingletons.locationRepository) {
                await this.globalSingletons.locationRepository.loadData();
                console.log('✓ Location data pre-loaded');
            }
        }
    }

    // ============================================================================
    // Public Accessors
    // ============================================================================

    /**
     * Get manager by name
     * @param {string} name - Manager name
     * @returns {Object|null}
     */
    getManager(name) {
        return this.managers[name] || null;
    }

    /**
     * Get all managers
     * @returns {Object}
     */
    getAllManagers() {
        return this.managers;
    }

    /**
     * Get global singleton by name
     * @param {string} name - Singleton name (productRepository, locationRepository, productFilter)
     * @returns {Object|null}
     */
    getGlobalSingleton(name) {
        return this.globalSingletons[name] || null;
    }

    /**
     * Get all global singletons
     * @returns {Object}
     */
    getAllGlobalSingletons() {
        return this.globalSingletons;
    }

    /**
     * Check if application is fully initialized
     * @returns {boolean}
     */
    isReady() {
        return this.isInitialized;
    }
}

// Bootstrap Application
const app = new FurniroApp();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
} else {
    app.init();
}

// 暴露给全局，以便调试或其他脚本访问
window.FurniroApp = app;

// 确保可以访问静态方法
window.FurniroApp.getDynamicBreadcrumb = FurniroApp.getDynamicBreadcrumb;
