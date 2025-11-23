/**
 * Product Repository
 * Central data management hub for products
 * Coordinates DataLoader, Renderer, and Filter
 */

class ProductRepository {
    constructor() {
        this.dataLoader = new ProductDataLoader();
        this.filter = new ProductFilter();
        this.renderer = null;
        this.currentProducts = [];
        this.displayedCount = 0;
    }

    /**
     * Initialize the repository with a renderer
     * @param {string} containerSelector - CSS selector for product container
     */
    initRenderer(containerSelector) {
        this.renderer = new ProductCardRenderer(containerSelector);
        console.log('✓ ProductRepository initialized');
    }

    /**
     * Load and display initial products
     * @param {number} initialCount - Number of products to load initially
     * @returns {Promise<void>}
     */
    async loadInitialProducts(initialCount = 8) {
        try {
            const products = await this.dataLoader.loadWithLimit(initialCount, 0);
            this.currentProducts = products;
            this.displayedCount = products.length;

            if (this.renderer) {
                this.renderer.renderCards(products);
            }

            console.log(`✓ Loaded ${products.length} initial products`);
        } catch (error) {
            console.error('✗ Error loading initial products:', error);
        }
    }

    /**
     * Load more products (pagination)
     * @param {number} count - Number of additional products to load
     * @returns {Promise<number>} Number of products loaded
     */
    async loadMore(count = 8) {
        try {
            const allProducts = await this.dataLoader.loadAll();
            const nextProducts = allProducts.slice(
                this.displayedCount,
                this.displayedCount + count
            );

            if (nextProducts.length === 0) {
                console.log('✓ No more products to load');
                return 0;
            }

            this.currentProducts = [...this.currentProducts, ...nextProducts];
            this.displayedCount += nextProducts.length;

            if (this.renderer) {
                this.renderer.appendCards(nextProducts);
            }

            console.log(`✓ Loaded ${nextProducts.length} more products`);
            return nextProducts.length;
        } catch (error) {
            console.error('✗ Error loading more products:', error);
            return 0;
        }
    }

    /**
     * Apply filters and display filtered products
     * @returns {Promise<void>}
     */
    async applyFilters() {
        try {
            const allProducts = await this.dataLoader.loadAll();
            const filtered = this.filter.apply(allProducts);
            this.currentProducts = filtered;
            this.displayedCount = filtered.length;

            if (this.renderer) {
                this.renderer.renderCards(filtered);
            }

            console.log(`✓ Applied filters, showing ${filtered.length} products`);
        } catch (error) {
            console.error('✗ Error applying filters:', error);
        }
    }

    /**
     * Search products by query
     * @param {string} query - Search query
     * @returns {Promise<void>}
     */
    async searchProducts(query) {
        try {
            const results = await this.dataLoader.searchProducts(query);
            this.currentProducts = results;
            this.displayedCount = results.length;

            if (this.renderer) {
                this.renderer.renderCards(results);
            }

            console.log(`✓ Search results: ${results.length} products found`);
        } catch (error) {
            console.error('✗ Error searching products:', error);
        }
    }

    /**
     * Load products by category
     * @param {string} category - Category name
     * @returns {Promise<void>}
     */
    async loadCategory(category) {
        try {
            const products = await this.dataLoader.getProductsByCategory(category);
            this.currentProducts = products;
            this.displayedCount = products.length;

            if (this.renderer) {
                this.renderer.renderCards(products);
            }

            console.log(`✓ Loaded ${products.length} products from ${category}`);
        } catch (error) {
            console.error(`✗ Error loading category ${category}:`, error);
        }
    }

    /**
     * Get a single product by ID
     * @param {string} id - Product ID
     * @returns {Promise<Object|null>} Product object or null
     */
    async getProductById(id) {
        return await this.dataLoader.getProductById(id);
    }

    /**
     * Get filter instance for configuration
     * @returns {ProductFilter} Filter instance
     */
    getFilter() {
        return this.filter;
    }

    /**
     * Get renderer instance
     * @returns {ProductCardRenderer|null} Renderer instance
     */
    getRenderer() {
        return this.renderer;
    }

    /**
     * Get data loader instance
     * @returns {ProductDataLoader} Data loader instance
     */
    getDataLoader() {
        return this.dataLoader;
    }

    /**
     * Get current displayed products
     * @returns {Array} Array of current products
     */
    getCurrentProducts() {
        return [...this.currentProducts];
    }

    /**
     * Get statistics
     * @returns {Promise<Object>} Statistics object
     */
    async getStats() {
        const total = await this.dataLoader.getCount();
        return {
            totalProducts: total,
            displayedProducts: this.displayedCount,
            remainingProducts: total - this.displayedCount
        };
    }

    /**
     * Reset to initial state
     * @returns {Promise<void>}
     */
    async reset() {
        this.filter.reset();
        this.currentProducts = [];
        this.displayedCount = 0;

        if (this.renderer) {
            this.renderer.clear();
        }

        console.log('✓ Repository reset');
    }

    /**
     * Check if there are more products to load
     * @returns {Promise<boolean>} Whether more products are available
     */
    async hasMore() {
        const total = await this.dataLoader.getCount();
        return this.displayedCount < total;
    }
}

// Export
if (typeof window !== 'undefined') {
    window.ProductRepository = ProductRepository;
}

