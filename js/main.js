/**
 * Furniro E-commerce - Main Application Controller
 * Central controller: manages component loading, global initialization, and page routing
 */

class FurniroApp {
    constructor() {
        this.pageManagers = {
            header: null,
            shop: null,
            index: null
            // Future page managers will be registered here
        };
        this.config = {
            initialProductCount: 8,
            loadMoreCount: 8
        };
        this.isInitialized = false;
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
     * 初始化头部功能管理器
     * 依赖 js/header-features.js
     */
    /**
     * Initialize header manager with all header components
     */
    initHeaderManager() {
        console.log('🎯 Initializing Header Manager...');
        if (window.HeaderManager) {
            this.pageManagers.header = new HeaderManager();
            this.pageManagers.header.init();
        } else {
            console.warn('HeaderManager not available. Please load header.js and related files');
        }
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

        // B. Index Page Logic
        // Check for carousel
        if (document.querySelector('#inspirationsCarousel')) {
            this.initCarousel();
        }

        // Check for Browse Range
        if (document.querySelector('#browseRange')) {
            this.initCategoryRotator();
        }

        // C. Generic product list logic (only for non-Shop pages)
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