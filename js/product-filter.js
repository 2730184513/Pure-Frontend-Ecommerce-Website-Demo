/**
 * Product Filter
 * Handles filtering logic for products based on various criteria
 * Pure Logic Class - No UI dependencies
 */

class ProductFilter {
    constructor() {
        this.reset(); // Initialize default state
    }

    reset() {
        this.filters = {
            keyword: '', // Name, Brief, Tags
            categories: [],
            priceRange: { min: 0, max: Infinity },
            ratingRange: { min: 0, max: 5 },
            dateRange: { from: null, to: null },
            tags: [],
            discount: false,
            inStock: false
        };
        return this;
    }

    // --- Setters ---

    setKeyword(keyword) {
        this.filters.keyword = (keyword || '').toLowerCase();
        return this;
    }

    setCategories(categories) {
        this.filters.categories = Array.isArray(categories) ? categories : [categories];
        return this;
    }

    setPriceRange(min, max) {
        this.filters.priceRange = { min, max };
        return this;
    }

    setRatingRange(min, max) {
        this.filters.ratingRange = { min, max };
        return this;
    }

    setDateRange(from, to) {
        this.filters.dateRange = { from, to };
        return this;
    }

    // --- Main Apply Method ---

    apply(products) {
        if (!products || products.length === 0) return [];

        return products.filter(product => {
            // 1. Keyword Filter
            if (this.filters.keyword && !this._checkKeyword(product)) return false;

            // 2. Category Filter
            if (this.filters.categories.length > 0 && !this.filters.categories.includes(product.category)) return false;

            // 3. Price Filter
            if (!this._checkPrice(product)) return false;

            // 4. Rating Filter
            if (!this._checkRating(product)) return false;

            // 5. Date Filter
            if (!this._checkDate(product)) return false;

            return true;
        });
    }

    // --- Helper Checkers ---

    _checkKeyword(product) {
        const k = this.filters.keyword;
        return (
            product.name.toLowerCase().includes(k) ||
            product.brief.toLowerCase().includes(k) ||
            (product.tags && product.tags.toLowerCase().includes(k))
        );
    }

    _checkPrice(product) {
        const price = this.getEffectivePrice(product);
        return price >= this.filters.priceRange.min && price <= this.filters.priceRange.max;
    }

    _checkRating(product) {
        const rate = product.average_rate || 0;
        return rate >= this.filters.ratingRange.min && rate <= this.filters.ratingRange.max;
    }

    _checkDate(product) {
        const { from, to } = this.filters.dateRange;
        if (!from && !to) return true;
        if (!product.launch_time) return false;

        // Assuming launch_time is "dd-mm-yyyy" from JSON
        const [d, m, y] = product.launch_time.split('-');
        // Note: Months are 0-indexed in JS Date
        const pDate = new Date(y, m - 1, d);

        if (from) {
            const fromDate = new Date(from);
            // Reset time to ensure fair comparison
            fromDate.setHours(0,0,0,0);
            if (pDate < fromDate) return false;
        }

        if (to) {
            const toDate = new Date(to);
            toDate.setHours(0,0,0,0);
            if (pDate > toDate) return false;
        }

        return true;
    }

    getEffectivePrice(product) {
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
}

if (typeof window !== 'undefined') {
    window.ProductFilter = ProductFilter;
}