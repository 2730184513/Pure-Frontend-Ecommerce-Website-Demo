/**
 * Furniro E-commerce - Main Application Controller
 * Central controller: manages component loading, global initialization, and page routing
 */

class FurniroApp {
    constructor() {
        this.pageManagers = {
            header: null,
            shop: null,
            index: null,
            cart: null,      // Cart page manager (initialized in cart.html)
            checkout: null   // Checkout page manager (initialized in checkout.html)
            // Future page managers will be registered here
        };
        this.config = {
            initialProductCount: 8,
            loadMoreCount: 8
        };
        this.isInitialized = false;
    }

    /**
     * Get dynamic breadcrumb for current page based on referrer
     * @returns {Array} Breadcrumb array [{text: 'Home', href: 'index.html'}, ...]
     */
    static getDynamicBreadcrumb() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const referrer = document.referrer;
        let referrerPage = '';

        if (referrer) {
            try {
                const referrerUrl = new URL(referrer);
                referrerPage = referrerUrl.pathname.split('/').pop() || 'index.html';
            } catch (e) {
                console.warn('Could not parse referrer:', e);
            }
        }

        console.log('Current page:', currentPage, '| Referrer page:', referrerPage);

        // Define page names
        const pageNames = {
            'index.html': 'Home',
            'shop.html': 'Shop',
            'cart.html': 'Cart',
            'checkout.html': 'Checkout'
        };

        // Build breadcrumb based on current page
        const breadcrumb = [{text: 'Home', href: 'index.html'}];

        // For cart page, add referrer if it's not home
        if (currentPage === 'cart.html') {
            if (referrerPage && referrerPage !== 'index.html' && referrerPage !== 'cart.html' && pageNames[referrerPage]) {
                breadcrumb.push({text: pageNames[referrerPage], href: referrerPage});
            }
            breadcrumb.push({text: 'Cart'});
        }
        // For checkout page, build from cart
        else if (currentPage === 'checkout.html') {
            if (referrerPage === 'cart.html') {
                breadcrumb.push({text: 'Cart', href: 'cart.html'});
            }
            breadcrumb.push({text: 'Checkout'});
        }
        // For other pages, simple breadcrumb
        else if (pageNames[currentPage] && currentPage !== 'index.html') {
            breadcrumb.push({text: pageNames[currentPage]});
        }

        return breadcrumb;
    }

    async init() {
        if (this.isInitialized) {
            console.warn('Application already initialized');
            return;
        }

        console.log('🚀 Initializing Furniro Application...');

        try {
            // 1. 优先加载 Header 和 Footer 组件
            // 必须等待 HTML 注入完成后，才能初始化 Header 的交互逻辑
            await this.loadComponents();

            // 2. 初始化全局 Header 功能 (Search, Cart, Wishlist)
            this.initHeaderManager();

            // 3. 路由/页面逻辑分发
            await this.dispatchPageLogic();

            this.isInitialized = true;
            console.log('✓ Furniro Application initialized successfully');
        } catch (error) {
            console.error('✗ Error initializing application:', error);
        }
    }

    async loadComponents() {
        console.log('📦 Loading components...');
        // 确保 ComponentLoader 已加载
        if (window.ComponentLoader) {
            await ComponentLoader.initCommonComponents();
        } else {
            console.error('ComponentLoader not found');
        }
    }

    /**
     * Initialize header components directly
     * Cart, Wishlist, Search, and Navigation are auto-initialized on load
     */
    initHeaderManager() {
        console.log('🎯 Initializing Header Components...');

        // Initialize individual header components
        if (window.NavigationManager) {
            const navigation = new NavigationManager();
            navigation.init();
        }

        if (window.SearchManager) {
            const search = new SearchManager();
            search.init();
        }

        if (window.CartManager) {
            const cart = new CartManager();
            cart.init();
            // Save to window for checkout page to access
            window.cartManagerInstance = cart;
        }

        if (window.WishlistManager) {
            const wishlist = new WishlistManager();
            wishlist.init();
        }

        console.log('✓ Header components initialized');
    }

    /**
     * Route logic based on current page
     * Prevents running index page logic on shop page
     */
    async dispatchPageLogic() {
        // A. Shop Page Logic
        const isShopPage = document.getElementById('shop-product-grid');
        if (isShopPage && window.ShopManager) {
            this.pageManagers.shop = new ShopManager();
            await this.pageManagers.shop.init();
            return;
        }

        // B. Cart Page Logic
        const isCartPage = document.getElementById('cart-items-container');
        if (isCartPage && window.CartPageManager) {
            // Cart page manager is initialized in cart.html inline script
            // No need to initialize here as it's handled separately
            console.log('✓ Cart page detected - manager will be initialized by inline script');
            return;
        }

        // C. Checkout Page Logic
        const isCheckoutPage = document.getElementById('checkoutForm');
        if (isCheckoutPage) {
            // Checkout page manager is initialized in checkout.html inline script
            console.log('✓ Checkout page detected - manager will be initialized by inline script');
            return;
        }

        // D. Index Page Logic
        // Check for carousel
        if (document.querySelector('#inspirationsCarousel')) {
            this.initCarousel();
        }

        // Check for Browse Range
        if (document.querySelector('#browseRange')) {
            this.initCategoryRotator();
        }

        // Generic product list logic (only for non-Shop pages)
        const hasProductGrid = document.querySelector('.product-grid');
        if (hasProductGrid && !isShopPage) {
            await this.initProductRepository();
            this.initShowMore(); // Index page "Show More" button
        }
    }

    async initProductRepository() {
        console.log('🛍️ Initializing generic product repository...');

        this.pageManagers.productRepository = new ProductRepository();
        // 渲染到通用的 .product-grid
        this.pageManagers.productRepository.initRenderer('.product-grid');

        // 加载初始产品
        await this.pageManagers.productRepository.loadInitialProducts(
            this.config.initialProductCount
        );
    }

    initShowMore() {
        const showMoreBtn = document.querySelector('.show-more-container .btn-outline');

        if (!showMoreBtn) {
            return;
        }

        showMoreBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await this.handleShowMore();
        });

        console.log('✓ Show More functionality initialized');
    }

    async handleShowMore() {
        const repository = this.pageManagers.productRepository;

        if (!repository) return;

        // Check if there are more products
        const hasMore = await repository.hasMore();

        if (!hasMore) {
            alert('No more products to display!');
            return;
        }

        // Load more products
        const loaded = await repository.loadMore(this.config.loadMoreCount);

        if (loaded === 0) {
            alert('No more products to display!');
        }

        // Hide button if no more products
        const stillHasMore = await repository.hasMore();
        if (!stillHasMore) {
            const showMoreBtn = document.querySelector('.show-more-container');
            if (showMoreBtn) {
                showMoreBtn.style.display = 'none';
            }
        }
    }

    initCarousel() {
        if (window.InspirationsCarousel) {
            console.log('🎠 Initializing carousel...');
            this.pageManagers.carousel = new InspirationsCarousel();
            this.pageManagers.carousel.init();
        }
    }

    initCategoryRotator() {
        if (window.CategoryRotator) {
            console.log('🔄 Initializing category rotator...');
            this.pageManagers.categoryRotator = new CategoryRotator();
            this.pageManagers.categoryRotator.init();
        }
    }

    // 辅助方法：获取页面管理器
    getPageManager(name) {
        return this.pageManagers[name];
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