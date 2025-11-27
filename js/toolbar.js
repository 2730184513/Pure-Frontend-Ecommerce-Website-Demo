/**
 * Toolbar Manager
 * Aggregates filter-sidebar, product-filter, and show-sort
 * Provides unified interface for toolbar operations
 */
class ToolbarManager {
    constructor() {
        this.filterSidebar = null;
        this.productFilter = null;
        this.showSort = null;
        this.isInitialized = false;
        this.onChangeCallback = null;
    }

    /**
     * Initialize toolbar manager
     * @param {Function} onChangeCallback - Callback when any toolbar setting changes
     */
    init(onChangeCallback) {
        if (this.isInitialized) return;

        this.onChangeCallback = onChangeCallback || (() => {});

        // Initialize filter sidebar
        this.filterSidebar = new FilterSidebar({
            onFilterChange: () => {
                this.updateFilterCount();
                this.handleChange();
            }
        });

        // Initialize product filter
        this.productFilter = new ProductFilter();

        // Initialize show-sort
        this.showSort = new ShowSortManager();
        this.showSort.init(() => this.handleChange());

        // Initialize filter count display
        this.updateFilterCount();

        this.isInitialized = true;
        console.log('✓ Toolbar Manager initialized');
    }

    /**
     * Handle change in any toolbar component
     * @private
     */
    handleChange() {
        if (this.onChangeCallback) {
            this.onChangeCallback();
        }
    }

    /**
     * Get filter sidebar manager
     * @returns {FilterSidebar}
     */
    getFilterSidebar() {
        return this.filterSidebar;
    }

    /**
     * Get product filter
     * @returns {ProductFilter}
     */
    getProductFilter() {
        return this.productFilter;
    }

    /**
     * Get show-sort manager
     * @returns {ShowSortManager}
     */
    getShowSort() {
        return this.showSort;
    }

    /**
     * Get complete filter configuration
     * Combines filter sidebar UI state with product filter logic
     * @returns {Object} Complete filter configuration
     */
    getFilterConfig() {
        const uiState = this.filterSidebar.getFilterValues();

        // Apply UI state to product filter
        this.productFilter
            .setCategories(uiState.categories)
            .setPriceRange(uiState.priceRange.min, uiState.priceRange.max)
            .setRatingRange(uiState.ratingRange.min, uiState.ratingRange.max)
            .setDateRange(uiState.dateRange.from, uiState.dateRange.to);

        return {
            categories: uiState.categories,
            priceRange: uiState.priceRange,
            ratingRange: uiState.ratingRange,
            dateRange: uiState.dateRange
        };
    }

    /**
     * Get show-sort configuration
     * @returns {Object} Show-sort configuration
     */
    getShowSortConfig() {
        const config = this.showSort.getConfig();

        // Parse sorting info for easier state restoration
        let sorting = { key: null, order: null };
        if (config.sortMode && config.sortMode !== 'default') {
            const parts = config.sortMode.split('-');
            sorting = {
                key: parts[0],
                order: parts[1]
            };
        }

        return {
            itemsPerPage: config.itemsPerPage,
            sorting: sorting
        };
    }

    /**
     * Get complete toolbar configuration
     * @returns {Object} Complete configuration including filters and sort
     */
    getCompleteConfig() {
        return {
            filter: this.getFilterConfig(),
            showSort: this.getShowSortConfig()
        };
    }

    /**
     * Apply filters to products
     * @param {Array} products - Products to filter
     * @returns {Array} Filtered products
     */
    applyFilters(products) {
        // Get filter config first to ensure product filter is configured
        this.getFilterConfig();

        // Apply filters
        return this.productFilter.apply(products);
    }

    /**
     * Apply sorting to products
     * @param {Array} products - Products to sort
     * @returns {Array} Sorted products
     */
    applySorting(products) {
        const sortMode = this.showSort.getSortMode();

        if (sortMode === 'default') {
            return products;
        }

        const [field, dir] = sortMode.split('-');

        return [...products].sort((a, b) => {
            let valA, valB;

            if (field === 'price') {
                valA = this.productFilter.getEffectivePrice(a);
                valB = this.productFilter.getEffectivePrice(b);
            } else if (field === 'rate') {
                valA = a.average_rate || 0;
                valB = b.average_rate || 0;
            } else {
                // name
                valA = a.name.toLowerCase();
                valB = b.name.toLowerCase();
            }

            if (valA < valB) return dir === 'asc' ? -1 : 1;
            if (valA > valB) return dir === 'asc' ? 1 : -1;
            return 0;
        });
    }

    /**
     * Set search keyword in product filter
     * @param {string} keyword - Search keyword
     */
    setSearchKeyword(keyword) {
        if (this.productFilter) {
            this.productFilter.setKeyword(keyword);
        }
    }

    /**
     * Set category selection in filter sidebar
     * @param {string} category - Category to select
     */
    setCategory(category) {
        if (this.filterSidebar) {
            this.filterSidebar.setCategorySelection(category);
        }
    }

    /**
     * Get items per page
     * @returns {number}
     */
    getItemsPerPage() {
        return this.showSort.getItemsPerPage();
    }

    /**
     * Get sort mode
     * @returns {string}
     */
    getSortMode() {
        return this.showSort.getSortMode();
    }

    /**
     * Update filter count display in the toolbar
     * Shows filter count like "Filter (3)" if there are active filters
     */
    updateFilterCount() {
        if (!this.filterSidebar) return;

        const count = this.filterSidebar.getActiveFilterCount();
        const filterBtn = document.getElementById('filter-toggle-btn');
        const filterSpan = filterBtn ? filterBtn.querySelector('.filter-span') : null;

        if (filterSpan) {
            if (count > 0) {
                filterSpan.textContent = `Filter (${count})`;
            } else {
                filterSpan.textContent = 'Filter';
            }
        }
    }

    /**
     * Reset all toolbar settings
     */
    reset() {
        if (this.productFilter) {
            this.productFilter.reset();
        }
        if (this.showSort) {
            this.showSort.resetSort();
        }
    }
}

if (typeof window !== 'undefined') {
    window.ToolbarManager = ToolbarManager;
}

