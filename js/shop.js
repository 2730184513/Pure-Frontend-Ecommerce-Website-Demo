/**
 * Shop Manager
 * Central controller for shop page
 * Aggregates toolbar, highlighting, and paging managers
 * Supports state restoration when navigating back from cart/checkout
 */
class ShopManager {
    constructor() {
        this.repo = null;
        this.toolbar = null;
        this.highlighting = null;
        this.paging = null;

        this.searchKeyword = '';
        this.initialCategory = null;
        this.shouldResetPage = false; // Flag to control page reset

        this.isInitialized = false;

        // Navigation state manager for state restoration
        this.navStateManager = new NavigationStateManager();
    }

    async init() {
        if (this.isInitialized) return;

        // Check if we should restore previous shop state
        const shouldRestore = this.navStateManager.shouldRestoreShopState() ||
                             this.navStateManager.checkShopNavigationMarker();

        let savedState = null;
        if (shouldRestore) {
            savedState = this.navStateManager.getShopState();
        }

        // Get search keyword and category (legacy support)
        this.searchKeyword = localStorage.getItem('shop_search_query') || '';
        this.initialCategory = localStorage.getItem('shop_filter_category') || null;

        // Clear temporary storage
        localStorage.removeItem('shop_search_query');

        // 1. Initialize repository and load data
        this.repo = new ProductRepository();
        await this.repo.getDataLoader().loadAll();

        // 2. Initialize toolbar (aggregates filter-sidebar, product-filter, show-sort)
        this.toolbar = new ToolbarManager();
        this.toolbar.init(() => {
            this.shouldResetPage = true; // Reset page when filter/sort changes
            this.executePipeline();
            // Save state after any change
            this.saveCurrentState();
        });

        // 3. Initialize highlighting manager
        this.highlighting = new HighlightingManager();

        // 4. Initialize paging manager
        this.paging = new PagingManager();
        this.paging.init(() => {
            this.shouldResetPage = false; // Don't reset page when user clicks page button
            this.executePipeline();
            // Save state after page change
            this.saveCurrentState();
        });

        // 5. Restore state or apply initial filters
        if (savedState) {
            await this.restoreState(savedState);
        } else if (this.searchKeyword || this.initialCategory) {
            // Legacy restoration
            if (this.searchKeyword) {
                this.highlighting.setKeyword(this.searchKeyword);
                this.toolbar.setSearchKeyword(this.searchKeyword);
                const searchInput = document.getElementById('global-search-input');
                if (searchInput) {
                    searchInput.value = this.searchKeyword;
                }
            }

            if (this.initialCategory) {
                this.toolbar.setCategory(this.initialCategory);
            } else {
                this.executePipeline();
            }
        } else {
            this.executePipeline();
        }

        this.isInitialized = true;
        console.log('✓ Shop Manager initialized');

        // Listen for Clear All event from filter sidebar
        document.addEventListener('filterClearAll', () => {
            this.handleClearAll();
        });

        // Check if redirected from empty cart
        this.checkEmptyCartRedirect();

        // Save initial state
        this.saveCurrentState();
    }

    /**
     * Save current shop state to session storage
     */
    saveCurrentState() {
        try {
            const filterConfig = this.toolbar.getFilterConfig();
            const showSortConfig = this.toolbar.getShowSortConfig();

            const state = {
                searchKeyword: this.searchKeyword,
                categories: filterConfig.categories,
                priceRange: filterConfig.priceRange,
                ratingRange: filterConfig.ratingRange,
                dateRange: filterConfig.dateRange,
                itemsPerPage: showSortConfig.itemsPerPage,
                sorting: showSortConfig.sorting,
                currentPage: this.paging.getCurrentPage()
            };

            this.navStateManager.saveShopState(state);

            // Update filter count display
            if (this.toolbar) {
                this.toolbar.updateFilterCount();
            }
        } catch (e) {
            console.warn('Failed to save shop state:', e);
        }
    }

    /**
     * Restore shop state from saved data
     * @param {Object} state - Saved state object
     */
    async restoreState(state) {
        console.log('🔄 Restoring shop state...');

        try {
            // Restore search keyword
            if (state.searchKeyword) {
                this.searchKeyword = state.searchKeyword;
                this.highlighting.setKeyword(state.searchKeyword);
                this.toolbar.setSearchKeyword(state.searchKeyword);

                const searchInput = document.getElementById('global-search-input');
                if (searchInput) {
                    searchInput.value = state.searchKeyword;
                }
            }

            // Restore filters
            if (state.categories && state.categories.length > 0) {
                this.toolbar.getFilterSidebar().restoreCategories(state.categories);
            }

            if (state.priceRange) {
                this.toolbar.getFilterSidebar().restorePriceRange(state.priceRange.min, state.priceRange.max);
            }

            if (state.ratingRange) {
                this.toolbar.getFilterSidebar().restoreRatingRange(state.ratingRange.min, state.ratingRange.max);
            }

            if (state.dateRange && (state.dateRange.from || state.dateRange.to)) {
                this.toolbar.getFilterSidebar().restoreDateRange(state.dateRange.from, state.dateRange.to);
            }

            // Restore show/sort settings
            if (state.itemsPerPage) {
                this.toolbar.getShowSort().setItemsPerPage(state.itemsPerPage);
            }

            if (state.sorting && state.sorting.key) {
                this.toolbar.getShowSort().setSorting(state.sorting.key, state.sorting.order);
            }

            // Set current page (will be used in render)
            if (state.currentPage) {
                this.paging.setCurrentPage(state.currentPage);
            }

            // Execute pipeline without resetting page
            this.shouldResetPage = false;
            this.executePipeline();

            // Update filter count display
            if (this.toolbar) {
                this.toolbar.updateFilterCount();
            }

            // Show success toast
            if (window.toast) {
                window.toast.show('Previous shop state restored successfully!', 'success', 3000);
            }

            console.log('✓ Shop state restored successfully');
        } catch (e) {
            console.error('Failed to restore shop state:', e);
            // Fallback to default execution
            this.executePipeline();
        }
    }

    /**
     * Check if redirected from empty cart and show welcome message
     */
    checkEmptyCartRedirect() {
        const redirectFlag = sessionStorage.getItem('cart_empty_redirect');
        if (redirectFlag === 'true') {
            sessionStorage.removeItem('cart_empty_redirect');
            if (window.toast) {
                window.toast.show('Your cart is empty. Pick your favorite products and add them to cart. Have a great shopping experience! 🛒', 'info', 5000);
            }
        }
    }

    /**
     * Handle Clear All button click
     * Resets filters, show settings, sort, and search keyword to defaults
     */
    handleClearAll() {
        // Clear search keyword
        this.searchKeyword = '';
        this.toolbar.setSearchKeyword('');
        this.highlighting.setKeyword('');

        // Reset show/sort settings
        if (this.toolbar.getShowSort()) {
            this.toolbar.getShowSort().resetToDefaults();
        }

        // Reset page to 1
        this.shouldResetPage = true;

        // Execute pipeline to refresh display
        this.executePipeline();

        // Save cleared state
        this.saveCurrentState();
    }

    /**
     * Execute filter → sort → render pipeline
     */
    executePipeline() {
        const allProducts = this.repo.getDataLoader().allProducts;

        // Apply filters through toolbar
        const filtered = this.toolbar.applyFilters(allProducts);

        // Apply sorting through toolbar
        const sorted = this.toolbar.applySorting(filtered);

        // Render products
        this.render(sorted);
    }


    /**
     * Render products with pagination and highlighting
     * @param {Array} products - Filtered and sorted products
     */
    render(products) {
        const total = products.length;
        const itemsPerPage = this.toolbar.getItemsPerPage();

        // Configure paging - reset to page 1 if filter/sort changed, otherwise preserve current page
        const currentPage = this.shouldResetPage ? 1 : this.paging.getCurrentPage();
        this.paging.setConfig(total, itemsPerPage, currentPage);
        this.shouldResetPage = false; // Reset flag after use

        // Get page slice
        const { start, end } = this.paging.getPageSlice();
        const pageProducts = products.slice(start, end);

        // Update results text
        const resultsText = document.getElementById('showing-results-text');
        if (resultsText) {
            resultsText.textContent = this.paging.getDisplayText();
        }

        // Render product cards
        const container = document.getElementById('shop-product-grid');
        if (container) {
            container.innerHTML = '';
            const renderer = new ProductCardRenderer('#shop-product-grid');

            pageProducts.forEach(p => {
                const card = renderer.renderCard(p);
                container.appendChild(card);
            });

            // Apply highlighting if there's a search keyword
            if (this.searchKeyword) {
                this.highlighting.highlightInContainer('#shop-product-grid');
            }
        }

        // Render pagination controls
        this.paging.render('#pagination-container');
    }

    /**
     * Get toolbar manager
     * @returns {ToolbarManager}
     */
    getToolbar() {
        return this.toolbar;
    }

    /**
     * Get highlighting manager
     * @returns {HighlightingManager}
     */
    getHighlighting() {
        return this.highlighting;
    }

    /**
     * Get paging manager
     * @returns {PagingManager}
     */
    getPaging() {
        return this.paging;
    }
}

if (typeof window !== 'undefined') {
    window.ShopManager = ShopManager;
}
