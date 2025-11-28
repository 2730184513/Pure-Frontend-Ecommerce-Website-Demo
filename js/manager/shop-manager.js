/**
 * Shop Manager
 * Central controller for shop page
 */
class ShopManager {
    constructor() {
        this.repo = null;
        this.toolbar = null;
        this.highlighting = null;
        this.paging = null;

        this.searchKeyword = '';
        this.initialCategory = null;
        this.shouldResetPage = false;

        this.isInitialized = false;
        this.navStateManager = new NavigationStateManager();
    }

    async init() {
        if (this.isInitialized) return;

        // 1. 检查和获取恢复状态
        const savedState = this._checkAndGetSavedState();

        // 2. 获取传统的搜索和分类参数
        this._loadLegacyParams();

        // 3. 初始化核心组件
        await this._initializeCoreComponents();

        // 4. 恢复状态或应用初始过滤器
        await this._applyInitialState(savedState);

        // 5. 绑定全局事件监听
        this._bindGlobalEvents();

        // 6. 检查购物车重定向
        this.checkEmptyCartRedirect();

        // 7. 保存初始状态
        this.saveCurrentState();

        this.isInitialized = true;
        console.log('✓ Shop Manager initialized');
    }

    /**
     * 检查并获取保存的状态
     * @private
     * @returns {Object|null}
     */
    _checkAndGetSavedState() {
        const shouldRestore = this.navStateManager.shouldRestoreShopState() ||
            this.navStateManager.checkShopNavigationMarker();

        return shouldRestore ? this.navStateManager.getShopState() : null;
    }

    /**
     * 加载传统的 localStorage 参数（向后兼容）
     * @private
     */
    _loadLegacyParams() {
        this.searchKeyword = localStorage.getItem('shop_search_query') || '';
        this.initialCategory = localStorage.getItem('shop_filter_category') || null;

        // 清理临时存储
        localStorage.removeItem('shop_search_query');
    }

    /**
     * 初始化核心组件（仓库、工具栏、高亮、分页）
     * @private
     */
    async _initializeCoreComponents() {
        // 初始化产品仓库并加载数据
        this.repo = new ProductRepository();
        await this.repo.getDataLoader().loadAll();

        // 初始化工具栏
        this.toolbar = new ToolbarManager();
        this.toolbar.init(() => {
            this.shouldResetPage = true;
            this.executePipeline();
            this.saveCurrentState();
        });

        // 初始化高亮管理器
        this.highlighting = new HighlightingManager();

        // 初始化分页管理器
        this.paging = new PagingManager();
        this.paging.init(() => {
            this.shouldResetPage = false;
            this.executePipeline();
            this.saveCurrentState();
        });
    }

    /**
     * 应用初始状态（恢复或使用传统参数）
     * @private
     * @param {Object|null} savedState
     */
    async _applyInitialState(savedState) {
        if (savedState) {
            await this.restoreState(savedState);
        } else if (this.searchKeyword || this.initialCategory) {
            this._applyLegacyFilters();
        } else {
            this.executePipeline();
        }
    }

    /**
     * 应用传统过滤器（搜索关键词和分类）
     * @private
     */
    _applyLegacyFilters() {
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
    }

    /**
     * 绑定全局事件监听器
     * @private
     */
    _bindGlobalEvents() {
        document.addEventListener('filterClearAll', () => {
            this.handleClearAll();
        });
    }

    /**
     * 保存当前商店状态到 session storage
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

            if (this.toolbar) {
                this.toolbar.updateFilterCount();
            }
        } catch (e) {
            console.warn('Failed to save shop state:', e);
        }
    }

    /**
     * 从保存的数据恢复商店状态
     * @param {Object} state - 保存的状态对象
     */
    async restoreState(state) {
        console.log('🔄 Restoring shop state...');

        try {
            this._restoreSearchKeyword(state);
            this._restoreFilters(state);
            this._restoreShowSortSettings(state);
            this._restoreCurrentPage(state);

            // 执行管道，不重置页码
            this.shouldResetPage = false;
            this.executePipeline();

            // 更新过滤器计数显示
            if (this.toolbar) {
                this.toolbar.updateFilterCount();
            }

            this._showRestoreSuccessToast();

            console.log('✓ Shop state restored successfully');
        } catch (e) {
            console.error('Failed to restore shop state:', e);
            this.executePipeline(); // 降级处理
        }
    }

    /**
     * 恢复搜索关键词
     * @private
     * @param {Object} state
     */
    _restoreSearchKeyword(state) {
        if (!state.searchKeyword) return;

        this.searchKeyword = state.searchKeyword;
        this.highlighting.setKeyword(state.searchKeyword);
        this.toolbar.setSearchKeyword(state.searchKeyword);

        const searchInput = document.getElementById('global-search-input');
        if (searchInput) {
            searchInput.value = state.searchKeyword;
        }
    }

    /**
     * 恢复过滤器（分类、价格、评分、日期范围）
     * @private
     * @param {Object} state
     */
    _restoreFilters(state) {
        const filterSidebar = this.toolbar.getFilterSidebar();

        if (state.categories && state.categories.length > 0) {
            filterSidebar.restoreCategories(state.categories);
        }

        if (state.priceRange) {
            filterSidebar.restorePriceRange(state.priceRange.min, state.priceRange.max);
        }

        if (state.ratingRange) {
            filterSidebar.restoreRatingRange(state.ratingRange.min, state.ratingRange.max);
        }

        if (state.dateRange && (state.dateRange.from || state.dateRange.to)) {
            filterSidebar.restoreDateRange(state.dateRange.from, state.dateRange.to);
        }
    }

    /**
     * 恢复显示和排序设置
     * @private
     * @param {Object} state
     */
    _restoreShowSortSettings(state) {
        const showSort = this.toolbar.getShowSort();

        if (state.itemsPerPage) {
            showSort.setItemsPerPage(state.itemsPerPage);
        }

        if (state.sorting && state.sorting.key) {
            showSort.setSorting(state.sorting.key, state.sorting.order);
        }
    }

    /**
     * 恢复当前页码
     * @private
     * @param {Object} state
     */
    _restoreCurrentPage(state) {
        if (state.currentPage) {
            this.paging.setCurrentPage(state.currentPage);
        }
    }

    /**
     * 显示恢复成功的提示
     * @private
     */
    _showRestoreSuccessToast() {
        if (window.toast) {
            window.toast.show('Previous shop state restored successfully!', 'success', 3000);
        }
    }

    /**
     * 检查是否从空购物车重定向并显示欢迎消息
     */
    checkEmptyCartRedirect() {
        const redirectFlag = sessionStorage.getItem('cart_empty_redirect');
        if (redirectFlag === 'true') {
            sessionStorage.removeItem('cart_empty_redirect');
            if (window.toast) {
                window.toast.show('Your cart is empty. Pick your favorite products and add them to cart. Have a great shopping experience! 🛒', 'info', 3000);
            }
        }
    }

    /**
     * 处理 Clear All 按钮点击
     * 重置过滤器、显示设置、排序和搜索关键词为默认值
     */
    handleClearAll() {
        this.searchKeyword = '';
        this.toolbar.setSearchKeyword('');
        this.highlighting.setKeyword('');

        if (this.toolbar.getShowSort()) {
            this.toolbar.getShowSort().resetToDefaults();
        }

        this.shouldResetPage = true;
        this.executePipeline();
        this.saveCurrentState();
    }

    /**
     * 执行过滤 → 排序 → 渲染管道
     */
    executePipeline() {
        const allProducts = this.repo.getDataLoader().allProducts;
        const filtered = this.toolbar.applyFilters(allProducts);
        const sorted = this.toolbar.applySorting(filtered);
        this.render(sorted);
    }

    /**
     * 渲染产品（带分页和高亮）
     * @param {Array} products - 已过滤和排序的产品
     */
    render(products) {
        const total = products.length;
        const itemsPerPage = this.toolbar.getItemsPerPage();

        const currentPage = this.shouldResetPage ? 1 : this.paging.getCurrentPage();
        this.paging.setConfig(total, itemsPerPage, currentPage);
        this.shouldResetPage = false;

        const { start, end } = this.paging.getPageSlice();
        const pageProducts = products.slice(start, end);

        const resultsText = document.getElementById('showing-results-text');
        if (resultsText) {
            resultsText.textContent = this.paging.getDisplayText();
        }

        const container = document.getElementById('shop-product-grid');
        if (container) {
            container.innerHTML = '';
            const renderer = new ProductCardRenderer('#shop-product-grid');

            pageProducts.forEach(p => {
                const card = renderer.renderCard(p);
                container.appendChild(card);
            });

            if (this.searchKeyword) {
                this.highlighting.highlightInContainer('#shop-product-grid');
            }
        }

        this.paging.render('#pagination-container');
    }
}

if (typeof window !== 'undefined') {
    window.ShopManager = ShopManager;
}
