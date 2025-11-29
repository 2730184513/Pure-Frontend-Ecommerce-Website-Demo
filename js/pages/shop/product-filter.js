/**
 * Product Filter - Global Singleton
 * Pure business logic layer for managing filter conditions
 * Provides complete getter/setter, persistence, and product matching functionality
 */

class ProductFilter {
    constructor() {
        this.storageKey = 'productFilter';
        this.initializeDefaults();
        this.loadFromStorage();
    }

    /**
     * Initialize default filter values
     */
    initializeDefaults() {
        this.defaults = {
            // Fields that count towards filter count (7 fields)
            categories: [],
            minPrice: 0,
            maxPrice: 10000,
            minRate: 0,
            maxRate: 5,
            from: null,
            to: null,
            // Fields that don't count towards filter count (4 fields)
            searchKeyword: '',
            itemsPerPage: 16,
            sortKey: 'default',
            sortOrder: null
        };

        // Copy defaults to current values
        this.resetToDefaults();
    }

    /**
     * Reset all fields to default values
     */
    resetToDefaults() {
        this.categories = [...this.defaults.categories];
        this.minPrice = this.defaults.minPrice;
        this.maxPrice = this.defaults.maxPrice;
        this.minRate = this.defaults.minRate;
        this.maxRate = this.defaults.maxRate;
        this.from = this.defaults.from;
        this.to = this.defaults.to;
        this.searchKeyword = this.defaults.searchKeyword;
        this.itemsPerPage = this.defaults.itemsPerPage;
        this.sortKey = this.defaults.sortKey;
        this.sortOrder = this.defaults.sortOrder;
    }

    // === GETTERS ===

    getCategories() { return [...this.categories]; }
    getMinPrice() { return this.minPrice; }
    getMaxPrice() { return this.maxPrice; }
    getMinRate() { return this.minRate; }
    getMaxRate() { return this.maxRate; }
    getFrom() { return this.from; }
    getTo() { return this.to; }
    getSearchKeyword() { return this.searchKeyword; }
    getItemsPerPage() { return this.itemsPerPage; }
    getSortKey() { return this.sortKey; }
    getSortOrder() { return this.sortOrder; }

    // === SETTERS (with chain support and auto-save) ===

    setCategories(categories) {
        this.categories = Array.isArray(categories) ? [...categories] : [];
        this.saveToStorage();
        return this;
    }

    setMinPrice(minPrice) {
        this.minPrice = typeof minPrice === 'number' ? minPrice : this.defaults.minPrice;
        this.saveToStorage();
        return this;
    }

    setMaxPrice(maxPrice) {
        this.maxPrice = typeof maxPrice === 'number' ? maxPrice : this.defaults.maxPrice;
        this.saveToStorage();
        return this;
    }

    setMinRate(minRate) {
        this.minRate = typeof minRate === 'number' ? minRate : this.defaults.minRate;
        this.saveToStorage();
        return this;
    }

    setMaxRate(maxRate) {
        this.maxRate = typeof maxRate === 'number' ? maxRate : this.defaults.maxRate;
        this.saveToStorage();
        return this;
    }

    setFrom(from) {
        this.from = from;
        this.saveToStorage();
        return this;
    }

    setTo(to) {
        this.to = to;
        this.saveToStorage();
        return this;
    }

    setSearchKeyword(keyword) {
        this.searchKeyword = keyword || '';
        this.saveToStorage();
        return this;
    }

    setItemsPerPage(itemsPerPage) {
        this.itemsPerPage = typeof itemsPerPage === 'number' ? itemsPerPage : this.defaults.itemsPerPage;
        this.saveToStorage();
        return this;
    }

    setSortKey(sortKey) {
        this.sortKey = sortKey || this.defaults.sortKey;
        this.saveToStorage();
        return this;
    }

    setSortOrder(sortOrder) {
        this.sortOrder = sortOrder;
        this.saveToStorage();
        return this;
    }

    // === FILTER LOGIC ===

    /**
     * Check if a single product matches all filter conditions
     * @param {Object} product - Product object to check
     * @returns {boolean} True if product matches all conditions
     */
    match(product) {
        if (!product) return false;

        // 1. Search keyword filter
        if (this.searchKeyword && !this._matchKeyword(product)) return false;

        // 2. Categories filter
        if (this.categories.length > 0 && !this.categories.includes(product.category)) return false;

        // 3. Price range filter
        if (!this._matchPriceRange(product)) return false;

        // 4. Rating range filter
        if (!this._matchRatingRange(product)) return false;

        // 5. Date range filter
        if (!this._matchDateRange(product)) return false;

        return true;
    }

    /**
     * Return filter function for use with Array.filter or repository.query
     * @returns {Function} Filter function (product) => boolean
     */
    toFilterFunction() {
        return (product) => this.match(product);
    }

    /**
     * Calculate active filter count (only counts 7 specific fields)
     * @returns {number} Number of active filter conditions
     */
    getActiveFilterCount() {
        let count = 0;

        // Count categories (each category counts as 1)
        count += this.categories.length;

        // Count price range (only if different from default)
        if (this.minPrice !== this.defaults.minPrice) count++;
        if (this.maxPrice !== this.defaults.maxPrice) count++;

        // Count rating range (only if different from default)
        if (this.minRate !== this.defaults.minRate) count++;
        if (this.maxRate !== this.defaults.maxRate) count++;

        // Count date range (only if set)
        if (this.from !== null) count++;
        if (this.to !== null) count++;

        // Note: searchKeyword, itemsPerPage, sortKey, sortOrder are NOT counted

        return count;
    }

    // === HELPER METHODS ===

    _matchKeyword(product) {
        const keyword = this.searchKeyword.toLowerCase();
        return (
            product.name.toLowerCase().includes(keyword) ||
            product.brief.toLowerCase().includes(keyword) ||
            (product.tags && product.tags.toLowerCase().includes(keyword))
        );
    }

    _matchPriceRange(product) {
        const price = this._getEffectivePrice(product);
        return price >= this.minPrice && price <= this.maxPrice;
    }

    _matchRatingRange(product) {
        const rate = product.average_rate || 0;
        return rate >= this.minRate && rate <= this.maxRate;
    }

    _matchDateRange(product) {
        if (!this.from && !this.to) return true;
        if (!product.launch_time) return false;

        // Assuming launch_time is "dd-mm-yyyy" format
        const [d, m, y] = product.launch_time.split('-');
        const productDate = new Date(y, m - 1, d);

        if (this.from) {
            const fromDate = new Date(this.from);
            fromDate.setHours(0, 0, 0, 0);
            if (productDate < fromDate) return false;
        }

        if (this.to) {
            const toDate = new Date(this.to);
            toDate.setHours(0, 0, 0, 0);
            if (productDate > toDate) return false;
        }

        return true;
    }

    _getEffectivePrice(product) {
        const basePrice = product.price || 0;
        if (!product.discount || product.discount === '0') {
            return basePrice;
        }
        const discountMatch = product.discount.match(/-?(\d+)%/);
        if (discountMatch) {
            const discountPercent = parseInt(discountMatch[1]);
            return Math.round(basePrice * (1 - discountPercent / 100));
        }
        return basePrice;
    }

    // === PERSISTENCE ===

    /**
     * Save current state to sessionStorage
     */
    saveToStorage() {
        try {
            const state = {
                categories: this.categories,
                minPrice: this.minPrice,
                maxPrice: this.maxPrice,
                minRate: this.minRate,
                maxRate: this.maxRate,
                from: this.from,
                to: this.to,
                searchKeyword: this.searchKeyword,
                itemsPerPage: this.itemsPerPage,
                sortKey: this.sortKey,
                sortOrder: this.sortOrder
            };
            sessionStorage.setItem(this.storageKey, JSON.stringify(state));
        } catch (error) {
            console.warn('Failed to save filter state to storage:', error);
        }
    }

    /**
     * Load state from sessionStorage
     */
    loadFromStorage() {
        try {
            const stored = sessionStorage.getItem(this.storageKey);
            if (stored) {
                const state = JSON.parse(stored);

                // Restore each field safely
                this.categories = Array.isArray(state.categories) ? state.categories : this.defaults.categories;
                this.minPrice = typeof state.minPrice === 'number' ? state.minPrice : this.defaults.minPrice;
                this.maxPrice = typeof state.maxPrice === 'number' ? state.maxPrice : this.defaults.maxPrice;
                this.minRate = typeof state.minRate === 'number' ? state.minRate : this.defaults.minRate;
                this.maxRate = typeof state.maxRate === 'number' ? state.maxRate : this.defaults.maxRate;
                this.from = state.from;
                this.to = state.to;
                this.searchKeyword = state.searchKeyword || this.defaults.searchKeyword;
                this.itemsPerPage = typeof state.itemsPerPage === 'number' ? state.itemsPerPage : this.defaults.itemsPerPage;
                this.sortKey = state.sortKey || this.defaults.sortKey;
                this.sortOrder = state.sortOrder;
            }
        } catch (error) {
            console.warn('Failed to load filter state from storage:', error);
            this.resetToDefaults();
        }
    }

    /**
     * Clear storage
     */
    clearStorage() {
        try {
            sessionStorage.removeItem(this.storageKey);
        } catch (error) {
            console.warn('Failed to clear filter storage:', error);
        }
    }

    /**
     * Reset all fields to defaults and save
     */
    reset() {
        this.resetToDefaults();
        this.saveToStorage();
        return this;
    }
}

// Create and expose global singleton instance
if (typeof window !== 'undefined') {
    window.ProductFilter = ProductFilter;
    window.productFilter = new ProductFilter();
}