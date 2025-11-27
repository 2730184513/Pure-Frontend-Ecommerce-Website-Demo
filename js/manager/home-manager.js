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
        this.productRepository = null;
        this.carousel = null;
        this.categoryRotator = null;
    }

    /**
     * Initialize home page components
     * @returns {Promise<void>}
     */
    async init() {
        console.log('🏠 Initializing Home Page...');

        try {
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
     * Initialize product repository and load initial products
     * @private
     */
    async _initProductDisplay() {
        console.log('🛍️ Initializing product display...');

        if (!window.ProductRepository) {
            console.warn('ProductRepository not found');
            return;
        }

        this.productRepository = new ProductRepository();
        this.productRepository.initRenderer('.product-grid');

        // Load initial products
        await this.productRepository.loadInitialProducts(
            this.config.initialProductCount
        );
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

        showMoreBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await this._handleShowMore();
        });

        console.log('✓ Show More functionality initialized');
    }

    /**
     * Handle show more button click
     * @private
     */
    async _handleShowMore() {
        if (!this.productRepository) return;

        // Check if there are more products
        const hasMore = await this.productRepository.hasMore();

        if (!hasMore) {
            this._showNoMoreProductsMessage();
            return;
        }

        // Load more products
        const loaded = await this.productRepository.loadMore(this.config.loadMoreCount);

        if (loaded === 0) {
            this._showNoMoreProductsMessage();
        }

        // Hide button if no more products
        const stillHasMore = await this.productRepository.hasMore();
        if (!stillHasMore) {
            this._hideShowMoreButton();
        }
    }

    /**
     * Show "no more products" message
     * @private
     */
    _showNoMoreProductsMessage() {
        alert('No more products to display!');
    }

    /**
     * Hide show more button
     * @private
     */
    _hideShowMoreButton() {
        const showMoreBtn = document.querySelector('.show-more-container');
        if (showMoreBtn) {
            showMoreBtn.style.display = 'none';
        }
    }

    // ============================================================================
    // Public Accessors
    // ============================================================================

    /**
     * Get product repository instance
     * @returns {ProductRepository|null}
     */
    getProductRepository() {
        return this.productRepository;
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

