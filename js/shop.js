/**
 * Shop Manager
 * Central controller for shop page
 * Aggregates toolbar, highlighting, and paging managers
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
    }

    async init() {
        if (this.isInitialized) return;

        // Get search keyword and category from localStorage
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
        });

        // 3. Initialize highlighting manager
        this.highlighting = new HighlightingManager();
        if (this.searchKeyword) {
            this.highlighting.setKeyword(this.searchKeyword);
        }

        // 4. Initialize paging manager
        this.paging = new PagingManager();
        this.paging.init(() => {
            this.shouldResetPage = false; // Don't reset page when user clicks page button
            this.executePipeline();
        });

        // 5. Restore initial state
        if (this.searchKeyword) {
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

        this.isInitialized = true;
        console.log('✓ Shop Manager initialized');
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
