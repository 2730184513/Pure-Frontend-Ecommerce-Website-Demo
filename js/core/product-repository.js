/**
 * Product Repository - Global Singleton
 * Pure data access layer for products
 * Provides CRUD operations, query filtering, and sorting functionality
 * 
 * Data Persistence Strategy:
 * - First checks localStorage for existing product data
 * - If not found, loads from JSON files and persists to localStorage
 * - All subsequent modifications are persisted to localStorage
 * - This ensures data persistence across sessions in static website environment
 */

class ProductRepository {
    constructor() {
        this.products = [];
        this.dataLoaded = false;
        this.dataPath = 'data/';
        this.categories = ['chair', 'lamp', 'sofa', 'table'];
        this.STORAGE_KEY = 'furniro_products_data';
    }

    /**
     * Load all product data - first tries localStorage, then falls back to JSON files
     * @returns {Promise<void>}
     */
    async loadAll() {
        if (this.dataLoaded) {
            return;
        }

        try {
            // First, try to load from localStorage
            const storedData = localStorage.getItem(this.STORAGE_KEY);
            
            if (storedData) {
                // Use data from localStorage
                this.products = JSON.parse(storedData);
                this.dataLoaded = true;
                console.log(`✓ ProductRepository loaded ${this.products.length} products from localStorage`);
                return;
            }

            // If no localStorage data, load from JSON files
            const loadPromises = this.categories.map(category =>
                this.loadCategoryData(category)
            );

            const results = await Promise.all(loadPromises);
            this.products = results.flat();
            this.dataLoaded = true;

            // Save to localStorage for future use
            this.saveToLocalStorage();

            console.log(`✓ ProductRepository loaded ${this.products.length} products from JSON files and saved to localStorage`);
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
        this.saveToLocalStorage();
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
        this.saveToLocalStorage();
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
        localStorage.removeItem(this.STORAGE_KEY);
    }

    /**
     * Save current products data to localStorage
     * @private
     */
    saveToLocalStorage() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.products));
            console.log('✓ Products data saved to localStorage');
        } catch (error) {
            console.error('✗ Error saving products to localStorage:', error);
        }
    }

    /**
     * Update product stock quantity
     * @param {string} productId - Product ID
     * @param {number} quantityChange - Quantity to subtract (positive number)
     * @returns {boolean} True if successful, false if insufficient stock or product not found
     */
    updateStock(productId, quantityChange) {
        const product = this.products.find(p => p.id === productId);
        if (!product) {
            console.error(`Product not found: ${productId}`);
            return false;
        }

        const currentStock = product.number_of_remain || 0;
        const newStock = currentStock - quantityChange;

        if (newStock < 0) {
            console.error(`Insufficient stock for product ${productId}: current=${currentStock}, requested=${quantityChange}`);
            return false;
        }

        product.number_of_remain = newStock;
        this.saveToLocalStorage();

        // Dispatch event to notify other components about stock change
        window.dispatchEvent(new CustomEvent('stockUpdated', {
            detail: { productId, newStock, previousStock: currentStock }
        }));

        console.log(`✓ Stock updated for ${productId}: ${currentStock} -> ${newStock}`);
        return true;
    }

    /**
     * Check if product has available stock
     * @param {string} productId - Product ID
     * @returns {number} Available stock quantity (0 if product not found)
     */
    getStock(productId) {
        const product = this.products.find(p => p.id === productId);
        return product ? (product.number_of_remain || 0) : 0;
    }

    /**
     * Check if product is out of stock
     * @param {string} productId - Product ID
     * @returns {boolean} True if out of stock or product not found
     */
    isOutOfStock(productId) {
        return this.getStock(productId) <= 0;
    }

    /**
     * Batch update stock for multiple products (used in checkout)
     * @param {Array} items - Array of {productId, quantity} objects
     * @returns {boolean} True if all updates successful
     */
    batchUpdateStock(items) {
        // First validate all items have sufficient stock
        for (const item of items) {
            const currentStock = this.getStock(item.productId);
            if (currentStock < item.quantity) {
                console.error(`Insufficient stock for product ${item.productId}`);
                return false;
            }
        }

        // If all validations pass, perform updates
        for (const item of items) {
            this.updateStock(item.productId, item.quantity);
        }

        return true;
    }

    /**
     * Reset product data from JSON files (useful for demo/testing)
     * Clears localStorage and reloads from JSON
     * @returns {Promise<void>}
     */
    async resetToOriginal() {
        localStorage.removeItem(this.STORAGE_KEY);
        this.products = [];
        this.dataLoaded = false;
        await this.loadAll();
        console.log('✓ Product data reset to original JSON values');
    }
}

// Create and expose global singleton instance
if (typeof window !== 'undefined') {
    window.ProductRepository = ProductRepository;
    window.productRepository = new ProductRepository();
}

