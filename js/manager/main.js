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
            checkout: null   // Checkout page manager (initialized in checkout.html)
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
            [PageUtility.PAGE_IDS.CHECKOUT]: 'checkout'
        };

        // Initialize navigation state manager
        this.navStateManager = new NavigationStateManager();
    }

    /**
     * Get dynamic breadcrumb for current page based on referrer
     * Uses NavigationStateManager for proper breadcrumb preservation
     * @returns {Array} Breadcrumb array [{text: 'Home', href: 'index.html'}, ...]
     */
    static getDynamicBreadcrumb() {
        const navManager = new NavigationStateManager();
        const currentPage = navManager.getCurrentPage();
        const referrerPage = navManager.getReferrerPage();

        return navManager.buildDynamicBreadcrumb(currentPage, referrerPage);
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
            // 1. Load required components (header/footer) for current page
            await this._loadPageComponents();

            // 2. Initialize header manager (if header is loaded)
            this._initHeaderManager();

            // 3. Dispatch page-specific logic
            await this._dispatchPageLogic();

            this.isInitialized = true;
            console.log('✓ Furniro Application initialized successfully');
        } catch (error) {
            console.error('✗ Error initializing application:', error);
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
        // Checkout page doesn't need header
        if (pageId === PageUtility.PAGE_IDS.CHECKOUT) {
            this._ensureContainer('footer-placeholder');
            return [
                { name: 'footer', target: '#footer-placeholder' }
            ];
        }

        // All other pages load header and footer
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
        // Don't initialize header on checkout page
        if (PageUtility.isCheckoutPage()) {
            return;
        }

        if (window.HeaderManager) {
            this.managers.header = new HeaderManager();
            this.managers.header.init();
        } else {
            console.warn('HeaderManager not found');
        }
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