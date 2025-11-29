/**
 * Home Manager
 * Manages index.html page functionality
 * Responsible for: carousel, category rotator, product display, and show more functionality
 * Follows Single Responsibility Principle: Only handles home page logic
 */

class HomeManager {
    constructor(config = {}) {
        this.config = {
            initialProductCount: config.initialProductCount || 8,
            loadMoreCount: config.loadMoreCount || 8
        };
        this.carousel = null;
        this.categoryRotator = null;
        this.renderer = null;
        this.displayedProducts = [];
        this.allProducts = [];
    }

    /**
     * Initialize home page components
     * @returns {Promise<void>}
     */
    async init() {
        console.log('🏠 Initializing Home Page...');

        try {
            // 确保数据层已加载
            await window.productRepository.loadAll();

            await this._initializeComponents();
            console.log('✓ Home page initialized successfully');
        } catch (error) {
            console.error('✗ Error initializing home page:', error);
            throw error;
        }
    }

    /**
     * Initialize all home page components
     * @private
     */
    async _initializeComponents() {
        // Check and initialize carousel
        if (this._hasCarousel()) {
            this._initCarousel();
        }

        // Check and initialize category rotator
        if (this._hasBrowseRange()) {
            this._initCategoryRotator();
        }

        // Check and initialize product grid
        if (this._hasProductGrid()) {
            await this._initProductDisplay();
            this._initShowMoreButton();
        }
    }

    // ============================================================================
    // Carousel Management
    // ============================================================================

    /**
     * Check if carousel exists on page
     * @returns {boolean}
     * @private
     */
    _hasCarousel() {
        return !!document.querySelector('#inspirationsCarousel');
    }

    /**
     * Initialize carousel component
     * @private
     */
    _initCarousel() {
        if (window.InspirationsCarousel) {
            console.log('🎠 Initializing carousel...');
            this.carousel = new InspirationsCarousel();
            this.carousel.init();
        } else {
            console.warn('InspirationsCarousel not found');
        }
    }

    // ============================================================================
    // Category Rotator Management
    // ============================================================================

    /**
     * Check if browse range section exists
     * @returns {boolean}
     * @private
     */
    _hasBrowseRange() {
        return !!document.querySelector('#browseRange');
    }

    /**
     * Initialize category rotator component
     * @private
     */
    _initCategoryRotator() {
        if (window.CategoryRotator) {
            console.log('🔄 Initializing category rotator...');
            this.categoryRotator = new CategoryRotator();
            this.categoryRotator.init();
        } else {
            console.warn('CategoryRotator not found');
        }
    }

    // ============================================================================
    // Product Display Management
    // ============================================================================

    /**
     * Check if product grid exists
     * @returns {boolean}
     * @private
     */
    _hasProductGrid() {
        return !!document.querySelector('.product-grid');
    }

    /**
     * Initialize product display with initial products
     * @private
     */
    async _initProductDisplay() {
        console.log('🛍️ Initializing product display...');

        if (!window.productRepository) {
            console.warn('productRepository not found');
            return;
        }

        // Initialize renderer
        this.renderer = new ProductCardRenderer('.product-grid');

        // Get all products and display initial set
        this.allProducts = window.productRepository.getAll();

        // Display initial products
        this.displayedProducts = this.allProducts.slice(0, this.config.initialProductCount);
        this.renderer.renderAll(this.displayedProducts, '.product-grid');

        console.log(`✓ Displayed ${this.displayedProducts.length} initial products`);
    }

    /**
     * Initialize show more button functionality
     * @private
     */
    _initShowMoreButton() {
        const showMoreBtn = document.querySelector('.show-more-container .btn-outline');

        if (!showMoreBtn) {
            return;
        }

        showMoreBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this._handleShowMore();
        });

        console.log('✓ Show More functionality initialized');
    }

    /**
     * Handle show more button click - redirect to shop page
     * @private
     */
    _handleShowMore() {
        console.log('🔄 Redirecting to shop page...');
        window.location.href = '/201-project/shop.html';
    }



    // ============================================================================
    // Public Accessors
    // ============================================================================

    /**
     * Get renderer instance
     * @returns {ProductCardRenderer|null}
     */
    getRenderer() {
        return this.renderer;
    }

    /**
     * Get displayed products count
     * @returns {number}
     */
    getDisplayedCount() {
        return this.displayedProducts.length;
    }

    /**
     * Get total products count
     * @returns {number}
     */
    getTotalCount() {
        return this.allProducts.length;
    }

    /**
     * Check if more products are available
     * @returns {boolean}
     */
    hasMore() {
        return this.displayedProducts.length < this.allProducts.length;
    }

    /**
     * Get carousel instance
     * @returns {InspirationsCarousel|null}
     */
    getCarousel() {
        return this.carousel;
    }

    /**
     * Get category rotator instance
     * @returns {CategoryRotator|null}
     */
    getCategoryRotator() {
        return this.categoryRotator;
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.HomeManager = HomeManager;
}

