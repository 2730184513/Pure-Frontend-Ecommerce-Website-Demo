/**
 * Shop Manager
 * Central controller for shop page
 */
class ShopManager {
    constructor() {
        this.filterSidebar = null;
        this.showSort = null;
        this.paging = null;
        this.toolbar = null;
        this.renderer = null;

        this.isInitialized = false;
    }

    async init() {
        if (this.isInitialized) return;

        // 1. 确保数据层已加载
        await window.productRepository.loadAll();

        // 2. 处理外部传入的搜索关键词（从其他页面跳转过来）
        this._handleExternalSearchKeyword();

        // 3. 初始化所有UI组件
        this._initializeUIComponents();

        // 4. 从 productFilter 恢复 UI 状态
        this._restoreUIState();

        // 5. 绑定全局事件
        this._bindGlobalEvents();

        // 6. 执行初始渲染
        this.render();

        this.isInitialized = true;
        console.log('✓ Shop Manager initialized');
    }

    /**
     * Handle external search keyword from localStorage
     * This handles redirects from login page or other pages
     * @private
     */
    _handleExternalSearchKeyword() {
        const externalKeyword = localStorage.getItem('shop_search_query');
        if (externalKeyword !== null) {
            // Apply to productFilter
            if (window.productFilter) {
                window.productFilter.setSearchKeyword(externalKeyword);
            }
            // Clear the localStorage flag to prevent re-applying on refresh
            localStorage.removeItem('shop_search_query');
            console.log(`✓ Applied external search keyword: ${externalKeyword}`);
        }
    }

    /**
     * Restore UI state from productFilter
     * This ensures UI matches saved filter state when returning to shop page
     * @private
     */
    _restoreUIState() {
        // 1. Restore filter sidebar UI
        if (this.filterSidebar && typeof this.filterSidebar.restoreFromProductFilter === 'function') {
            this.filterSidebar.restoreFromProductFilter();
        }

        // 2. Restore show/sort dropdown UI
        if (this.showSort) {
            const itemsPerPage = window.productFilter.getItemsPerPage();
            const sortKey = window.productFilter.getSortKey();
            const sortOrder = window.productFilter.getSortOrder();

            this.showSort.setItemsPerPage(itemsPerPage);
            if (sortKey && sortKey !== 'default' && sortOrder) {
                this.showSort.setSorting(sortKey, sortOrder);
            }
        }

        // 3. Restore search input in header (if exists)
        const searchKeyword = window.productFilter.getSearchKeyword();
        const searchInput = document.getElementById('global-search-input');
        if (searchInput && searchKeyword) {
            searchInput.value = searchKeyword;
        }

        // 4. Auto-open sidebar if there are active filters (excluding search keyword)
        const activeFilterCount = window.productFilter.getActiveFilterCount();
        if (activeFilterCount > 0 && this.toolbar && typeof this.toolbar.setSidebarState === 'function') {
            // Use setTimeout to ensure DOM is ready and animation can be applied
            setTimeout(() => {
                this.toolbar.setSidebarState(true);
            }, 100);
        }

        console.log('✓ UI state restored from productFilter');
    }

    /**
     * 初始化所有UI组件
     * @private
     */
    _initializeUIComponents() {
        // 初始化过滤侧边栏
        this.filterSidebar = new FilterSidebar({
            onFilterChange: () => this.render()
        });

        // 初始化排序显示组件
        this.showSort = new ShowSortManager(() => this.render());

        // 初始化分页组件
        this.paging = new PagingManager(() => this.render());

        // 初始化工具栏
        this.toolbar = new ToolbarManager();
        this.toolbar.init();

        // 初始化渲染器
        this.renderer = new ProductCardRenderer('#shop-product-grid');

        console.log('✓ All UI components initialized');
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
     * 重置所有过滤器、显示设置、排序和搜索关键词为默认值
     */
    handleClearAll() {
        // productFilter.reset() 会自动重置所有字段
        window.productFilter.reset();

        // 重置UI组件显示
        this.showSort.resetToDefaults();

        // 清空搜索输入框
        const searchInput = document.getElementById('global-search-input');
        if (searchInput) {
            searchInput.value = '';
        }

        // 重置页码到第一页
        this.paging.setCurrentPage(1);

        // 重新渲染
        this.render();

        if (window.toastManager) {
            window.toastManager.show('All filters cleared', 'success', 3000);
        }
    }

    /**
     * 执行完整的数据查询-排序-分页-渲染流程
     * 优化版本：支持loading状态和批处理
     */
    async render() {
        // Show loading state for better UX
        this._showLoadingState();

        try {
            // 1. 从 productRepository 获取过滤后的数据
            const filteredProducts = window.productRepository.query(window.productFilter.toFilterFunction());

            // 2. 对数据进行排序
            const sortedProducts = this._applySorting(filteredProducts);

            // 3. 计算分页数据
            const totalResults = sortedProducts.length;
            const itemsPerPage = window.productFilter.getItemsPerPage();

            // 4. 初始化/更新分页组件
            this.paging.init(totalResults, itemsPerPage);

            // 5. 计算数据窗口并切片
            const currentPage = this.paging.getCurrentPage();
            const start = (currentPage - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            const pageData = sortedProducts.slice(start, end);

            // 6. 调用 renderer 渲染卡片（传入 keyword）- 使用异步渲染
            const keyword = window.productFilter.getSearchKeyword();
            await this.renderer.renderAll(pageData, '#shop-product-grid', keyword);

            // 7. 更新 toolbar UI
            this.toolbar.updateFilterCount();

            const actualEnd = Math.min(end, totalResults);
            const displayStart = totalResults === 0 ? 0 : start + 1;
            this.toolbar.updateResultsText(displayStart, actualEnd, totalResults, keyword);

            console.log(`✓ Rendered ${pageData.length} products (${displayStart}-${actualEnd} of ${totalResults})`);
        } catch (error) {
            console.error('Error during render:', error);
            this._showErrorState();
        } finally {
            this._hideLoadingState();
        }
    }

    /**
     * Show loading state for better UX
     * @private
     */
    _showLoadingState() {
        const container = document.getElementById('shop-product-grid');
        if (container) {
            container.classList.add('loading');
        }
    }

    /**
     * Hide loading state
     * @private
     */
    _hideLoadingState() {
        const container = document.getElementById('shop-product-grid');
        if (container) {
            container.classList.remove('loading', 'error');
        }
    }

    /**
     * Show error state
     * @private
     */
    _showErrorState() {
        const container = document.getElementById('shop-product-grid');
        if (container) {
            container.classList.add('error');
            container.innerHTML = `
                <div class="error-message">
                    <p>Oops! Something went wrong while loading products.</p>
                    <button onclick="window.shopManager.render()" class="retry-btn">Try Again</button>
                </div>
            `;
        }
    }

    /**
     * 应用排序逻辑
     * @param {Array} products - 产品数组
     * @returns {Array} 排序后的产品数组
     * @private
     */
    _applySorting(products) {
        const sortKey = window.productFilter.getSortKey();
        const sortOrder = window.productFilter.getSortOrder();

        if (sortKey === 'default' || !sortOrder) {
            return products;
        }

        const sortFunction = this._getSortFunction(sortKey, sortOrder);
        return window.productRepository.sort(products, sortFunction);
    }

    /**
     * 获取排序函数
     * @param {string} sortKey - 排序字段
     * @param {string} sortOrder - 排序方向
     * @returns {Function} 排序函数
     * @private
     */
    _getSortFunction(sortKey, sortOrder) {
        return (a, b) => {
            let valA, valB;

            if (sortKey === 'price') {
                valA = window.productFilter._getEffectivePrice(a);
                valB = window.productFilter._getEffectivePrice(b);
            } else if (sortKey === 'rate') {
                valA = a.average_rate || 0;
                valB = b.average_rate || 0;
            } else if (sortKey === 'name') {
                valA = a.name.toLowerCase();
                valB = b.name.toLowerCase();
            } else {
                return 0;
            }

            const comparison = valA < valB ? -1 : valA > valB ? 1 : 0;
            return sortOrder === 'asc' ? comparison : -comparison;
        };
    }
}

if (typeof window !== 'undefined') {
    window.ShopManager = ShopManager;
}
