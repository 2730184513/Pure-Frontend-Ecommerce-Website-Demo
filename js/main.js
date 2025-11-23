/**
 * Furniro E-commerce - Main Application Controller
 */

class FurniroApp {
    constructor() {
        this.modules = {
            categoryRotator: null,
            carousel: null,
            productRepository: null
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
            // Load header and footer components
            await this.loadComponents();

            // Initialize product repository
            await this.initProductRepository();

            // Initialize "Show More" functionality
            this.initShowMore();

            this.isInitialized = true;
            console.log('✓ Furniro Application initialized successfully');
        } catch (error) {
            console.error('✗ Error initializing application:', error);
        }
    }

    async loadComponents() {
        console.log('📦 Loading components...');
        await ComponentLoader.initCommonComponents();
    }

    async initProductRepository() {
        console.log('🛍️ Initializing product repository...');

        this.modules.productRepository = new ProductRepository();
        this.modules.productRepository.initRenderer('.product-grid');

        // Load initial products
        await this.modules.productRepository.loadInitialProducts(
            this.config.initialProductCount
        );
    }

    initShowMore() {
        const showMoreBtn = document.querySelector('.show-more-container .btn-outline');

        if (!showMoreBtn) {
            console.warn('Show More button not found');
            return;
        }

        showMoreBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await this.handleShowMore();
        });

        console.log('✓ Show More functionality initialized');
    }

    async handleShowMore() {
        const repository = this.modules.productRepository;

        if (!repository) {
            console.error('Product repository not initialized');
            return;
        }

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

    getModule(name) {
        return this.modules[name];
    }

    getProductRepository() {
        return this.modules.productRepository;
    }

    async destroy() {
        Object.values(this.modules).forEach(module => {
            if (module && typeof module.destroy === 'function') {
                module.destroy();
            }
        });

        this.modules = {};
        this.isInitialized = false;
        console.log('Application destroyed');
    }

    async restart() {
        await this.destroy();
        await this.init();
    }
}

// Bootstrap
const app = new FurniroApp();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
} else {
    app.init();
}

window.FurniroApp = app;
