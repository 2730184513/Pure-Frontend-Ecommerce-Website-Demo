/**
 * Product Filter
 * Handles filtering logic for products based on various criteria
 */

class ProductFilter {
    constructor() {
        this.filters = {
            category: null,
            priceRange: { min: 0, max: Infinity },
            rating: 0,
            tags: [],
            discount: false,
            inStock: false
        };
    }

    /**
     * Set category filter
     * @param {string|null} category - Category to filter by
     * @returns {ProductFilter} this (for chaining)
     */
    setCategory(category) {
        this.filters.category = category;
        return this;
    }

    /**
     * Set price range filter
     * @param {number} min - Minimum price
     * @param {number} max - Maximum price
     * @returns {ProductFilter} this (for chaining)
     */
    setPriceRange(min, max) {
        this.filters.priceRange = { min, max };
        return this;
    }

    /**
     * Set minimum rating filter
     * @param {number} rating - Minimum rating (0-5)
     * @returns {ProductFilter} this (for chaining)
     */
    setMinRating(rating) {
        this.filters.rating = rating;
        return this;
    }

    /**
     * Set tags filter
     * @param {Array<string>} tags - Array of tags to filter by
     * @returns {ProductFilter} this (for chaining)
     */
    setTags(tags) {
        this.filters.tags = Array.isArray(tags) ? tags : [tags];
        return this;
    }

    /**
     * Filter only discounted products
     * @param {boolean} enabled - Enable discount filter
     * @returns {ProductFilter} this (for chaining)
     */
    setDiscountOnly(enabled) {
        this.filters.discount = enabled;
        return this;
    }

    /**
     * Filter only in-stock products
     * @param {boolean} enabled - Enable in-stock filter
     * @returns {ProductFilter} this (for chaining)
     */
    setInStockOnly(enabled) {
        this.filters.inStock = enabled;
        return this;
    }

    /**
     * Apply all filters to products array
     * @param {Array} products - Array of products to filter
     * @returns {Array} Filtered products
     */
    apply(products) {
        let filtered = [...products];

        // Category filter
        if (this.filters.category) {
            filtered = filtered.filter(product =>
                product.category === this.filters.category
            );
        }

        // Price range filter
        if (this.filters.priceRange.min > 0 || this.filters.priceRange.max < Infinity) {
            filtered = filtered.filter(product => {
                const price = this.getEffectivePrice(product);
                return price >= this.filters.priceRange.min &&
                       price <= this.filters.priceRange.max;
            });
        }

        // Rating filter
        if (this.filters.rating > 0) {
            filtered = filtered.filter(product =>
                (product.average_rate || 0) >= this.filters.rating
            );
        }

        // Tags filter
        if (this.filters.tags.length > 0) {
            filtered = filtered.filter(product => {
                const productTags = (product.tags || '').toLowerCase().split(',');
                return this.filters.tags.some(tag =>
                    productTags.some(pt => pt.trim().includes(tag.toLowerCase()))
                );
            });
        }

        // Discount filter
        if (this.filters.discount) {
            filtered = filtered.filter(product =>
                product.discount && product.discount !== '0%'
            );
        }

        // In-stock filter
        if (this.filters.inStock) {
            filtered = filtered.filter(product =>
                product.number_of_remain > 0
            );
        }

        return filtered;
    }

    /**
     * Get effective price (after discount)
     * @param {Object} product - Product object
     * @returns {number} Effective price
     * @private
     */
    getEffectivePrice(product) {
        const basePrice = product.price || 0;

        if (!product.discount) {
            return basePrice;
        }

        const discountMatch = product.discount.match(/-?(\d+)%/);
        if (discountMatch) {
            const discountPercent = parseInt(discountMatch[1]);
            return basePrice * (1 - discountPercent / 100);
        }

        return basePrice;
    }

    /**
     * Reset all filters
     * @returns {ProductFilter} this (for chaining)
     */
    reset() {
        this.filters = {
            category: null,
            priceRange: { min: 0, max: Infinity },
            rating: 0,
            tags: [],
            discount: false,
            inStock: false
        };
        return this;
    }

    /**
     * Get current filter configuration
     * @returns {Object} Current filters
     */
    getFilters() {
        return { ...this.filters };
    }
}

// Export
if (typeof window !== 'undefined') {
    window.ProductFilter = ProductFilter;
}

