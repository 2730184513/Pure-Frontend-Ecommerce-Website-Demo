/**
 * Product Data Loader
 * Handles loading and managing product data from JSON files
 */

class ProductDataLoader {
    constructor() {
        this.dataPath = 'data/';
        this.categories = ['chair', 'lamp', 'sofa', 'table'];
        this.cache = new Map();
        this.allProducts = [];
    }

    /**
     * Load products from a specific category
     * @param {string} category - Category name (chair, lamp, sofa, table)
     * @returns {Promise<Array>} Array of products
     */
    async loadCategory(category) {
        if (this.cache.has(category)) {
            return this.cache.get(category);
        }

        try {
            const response = await fetch(`${this.dataPath}${category}.json`);

            if (!response.ok) {
                throw new Error(`Failed to load ${category} data`);
            }

            const data = await response.json();
            const products = data.products || [];

            // Add category info to each product and generate unique ID
            const enhancedProducts = products.map((product, index) => ({
                ...product,
                id: `${category}-${index}`,
                category: category
            }));

            this.cache.set(category, enhancedProducts);
            console.log(`✓ Loaded ${enhancedProducts.length} products from ${category}`);

            return enhancedProducts;
        } catch (error) {
            console.error(`✗ Error loading ${category}:`, error);
            return [];
        }
    }

    /**
     * Load all products from all categories
     * @returns {Promise<Array>} Array of all products
     */
    async loadAll() {
        if (this.allProducts.length > 0) {
            return this.allProducts;
        }

        const loadPromises = this.categories.map(category =>
            this.loadCategory(category)
        );

        const results = await Promise.all(loadPromises);
        this.allProducts = results.flat();

        console.log(`✓ Total products loaded: ${this.allProducts.length}`);
        return this.allProducts;
    }

    /**
     * Load products with limit
     * @param {number} limit - Maximum number of products to return
     * @param {number} offset - Starting offset (for pagination)
     * @returns {Promise<Array>} Limited array of products
     */
    async loadWithLimit(limit = 8, offset = 0) {
        await this.loadAll();
        return this.allProducts.slice(offset, offset + limit);
    }

    /**
     * Get product by ID
     * @param {string} id - Product ID
     * @returns {Promise<Object|null>} Product object or null
     */
    async getProductById(id) {
        await this.loadAll();
        return this.allProducts.find(product => product.id === id) || null;
    }

    /**
     * Get products by category
     * @param {string} category - Category name
     * @returns {Promise<Array>} Array of products in category
     */
    async getProductsByCategory(category) {
        return await this.loadCategory(category);
    }

    /**
     * Search products by name
     * @param {string} query - Search query
     * @returns {Promise<Array>} Array of matching products
     */
    async searchProducts(query) {
        await this.loadAll();
        const lowerQuery = query.toLowerCase();
        return this.allProducts.filter(product =>
            product.name.toLowerCase().includes(lowerQuery) ||
            product.brief.toLowerCase().includes(lowerQuery) ||
            product.tags.toLowerCase().includes(lowerQuery)
        );
    }

    /**
     * Get total count of products
     * @returns {Promise<number>} Total number of products
     */
    async getCount() {
        await this.loadAll();
        return this.allProducts.length;
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
        this.allProducts = [];
        console.log('✓ Cache cleared');
    }
}

// Export
if (typeof window !== 'undefined') {
    window.ProductDataLoader = ProductDataLoader;
}

