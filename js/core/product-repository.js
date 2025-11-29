/**
 * Product Repository - Global Singleton
 * Pure data access layer for products
 * Provides CRUD operations, query filtering, and sorting functionality
 */

class ProductRepository {
    constructor() {
        this.products = [];
        this.dataLoaded = false;
        this.dataPath = 'data/';
        this.categories = ['chair', 'lamp', 'sofa', 'table'];
    }

    /**
     * Load all product data from JSON files
     * @returns {Promise<void>}
     */
    async loadAll() {
        if (this.dataLoaded) {
            return;
        }

        try {
            const loadPromises = this.categories.map(category =>
                this.loadCategoryData(category)
            );

            const results = await Promise.all(loadPromises);
            this.products = results.flat();
            this.dataLoaded = true;

            console.log(`✓ ProductRepository loaded ${this.products.length} products`);
        } catch (error) {
            console.error('✗ Error loading product data:', error);
            throw error;
        }
    }

    /**
     * Load products from a specific category JSON file
     * @param {string} category - Category name (chair, lamp, sofa, table)
     * @returns {Promise<Array>} Array of products
     */
    async loadCategoryData(category) {
        try {
            const response = await fetch(`${this.dataPath}${category}.json`);

            if (!response.ok) {
                throw new Error(`Failed to load ${category} data`);
            }

            const data = await response.json();
            const products = data.products || [];

            // Add category info to each product and generate unique ID
            return products.map((product, index) => ({
                ...product,
                id: `${category}-${index}`,
                category: category
            }));
        } catch (error) {
            console.error(`✗ Error loading ${category}:`, error);
            return [];
        }
    }

    /**
     * Get all products (returns a copy to prevent external modification)
     * @returns {Array} Array of all products
     */
    getAll() {
        return [...this.products];
    }

    /**
     * Get product by ID
     * @param {string} id - Product ID
     * @returns {Object|null} Product object or null if not found
     */
    getById(id) {
        return this.products.find(product => product.id === id) || null;
    }

    /**
     * Query products with filter function
     * @param {Function} filterFn - Filter function (product) => boolean
     * @returns {Array} Array of filtered products
     */
    query(filterFn) {
        if (typeof filterFn !== 'function') {
            return this.getAll();
        }
        return this.products.filter(filterFn);
    }

    /**
     * Sort products array
     * @param {Array} products - Products array to sort
     * @param {Function} sortFn - Sort function (a, b) => number
     * @returns {Array} New sorted array (does not modify original)
     */
    sort(products, sortFn) {
        if (typeof sortFn !== 'function' || !Array.isArray(products)) {
            return [...products];
        }
        return [...products].sort(sortFn);
    }

    /**
     * Add a product (for future extension)
     * @param {Object} product - Product object to add
     * @returns {Object} Added product with generated ID
     */
    add(product) {
        const newProduct = {
            ...product,
            id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        };
        this.products.push(newProduct);
        return newProduct;
    }

    /**
     * Update a product (for future extension)
     * @param {string} id - Product ID
     * @param {Object} updates - Updates to apply
     * @returns {Object|null} Updated product or null if not found
     */
    update(id, updates) {
        const index = this.products.findIndex(product => product.id === id);
        if (index === -1) {
            return null;
        }

        this.products[index] = { ...this.products[index], ...updates };
        return this.products[index];
    }

    /**
     * Delete a product (for future extension)
     * @param {string} id - Product ID
     * @returns {boolean} True if deleted, false if not found
     */
    delete(id) {
        const index = this.products.findIndex(product => product.id === id);
        if (index === -1) {
            return false;
        }

        this.products.splice(index, 1);
        return true;
    }

    /**
     * Get total count of products
     * @returns {number} Total number of products
     */
    getCount() {
        return this.products.length;
    }

    /**
     * Clear all data (for testing/reset purposes)
     */
    clear() {
        this.products = [];
        this.dataLoaded = false;
    }
}

// Create and expose global singleton instance
if (typeof window !== 'undefined') {
    window.ProductRepository = ProductRepository;
    window.productRepository = new ProductRepository();
}

