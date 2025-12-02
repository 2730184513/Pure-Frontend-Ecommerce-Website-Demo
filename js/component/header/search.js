/**
 * Search Manager
 * Handles search overlay and search functionality
 */
class SearchManager {
    constructor() {
        this.searchIcon = null;
        this.overlay = null;
        this.input = null;
        this.btn = null;
        this.isInitialized = false;
    }

    init() {
        if (this.isInitialized) return;

        this.cacheDOM();
        if (!this.searchIcon || !this.overlay) {
            console.warn('Search elements not found');
            return;
        }

        this.bindEvents();
        this.isInitialized = true;
    }

    /**
     * Cache DOM elements
     */
    cacheDOM() {
        this.searchIcon = document.querySelector('#icon-search');
        this.overlay = document.getElementById('search-overlay');
        this.input = document.getElementById('global-search-input');
        this.btn = document.getElementById('global-search-btn');
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Open search overlay (always allowed, login check happens on search)
        this.searchIcon.addEventListener('click', () => this.openSearch());

        // Close on overlay click
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.closeSearch();
            }
        });

        // Search button click
        this.btn.addEventListener('click', () => this.performSearch());

        // Enter key to search
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });
    }

    /**
     * Open search overlay
     */
    openSearch() {
        this.overlay.classList.remove('hidden');
        setTimeout(() => {
            if (this.input) {
                this.input.focus();
            }
        }, 100);
    }

    /**
     * Close search overlay
     */
    closeSearch() {
        this.overlay.classList.add('hidden');
        if (this.input) {
            this.input.value = '';
        }
    }

    /**
     * Perform search
     * 未登录用户：保存关键词到 filter，直接跳转登录页
     * 已登录用户：正常搜索
     */
    performSearch() {
        const term = this.input.value.trim();

        // 检查登录状态
        const isLoggedIn = window.AuthGuard ? window.AuthGuard.isLoggedIn() : false;

        if (!isLoggedIn) {
            // 未登录：保存搜索关键词到 productFilter，然后直接跳转登录页
            this._saveSearchKeywordForLater(term);
            this.closeSearch();

            // 直接跳转到登录页
            window.location.href = '/201-project/register-login.html';
            return;
        }

        // 已登录：正常搜索流程
        // Check if we're already on shop page
        if (window.location.pathname.includes('shop.html')) {
            // Direct search on shop page
            this._performDirectSearch(term);
        } else {
            // Redirect to shop page with search term
            this._redirectToShop(term);
        }

        this.closeSearch();
    }

    /**
     * Perform direct search on current shop page
     * @param {string} term - Search term
     * @private
     */
    _performDirectSearch(term) {
        if (window.productFilter) {
            window.productFilter.setSearchKeyword(term);

            // Trigger shop manager to re-render if available
            if (window.shopManager && typeof window.shopManager.render === 'function') {
                window.shopManager.render();
            }
        } else {
            // Fallback to localStorage method
            this._redirectToShop(term);
        }
    }

    /**
     * Redirect to shop page with search term
     * @param {string} term - Search term
     * @private
     */
    _redirectToShop(term) {
        localStorage.setItem('shop_search_query', term);
        window.location.href = 'shop.html';
    }

    /**
     * Save search keyword for later (when user logs in)
     * @param {string} term - Search term
     * @private
     */
    _saveSearchKeywordForLater(term) {
        if (!term) return;

        // 保存到 productFilter（如果存在）
        if (window.productFilter) {
            window.productFilter.setSearchKeyword(term);
        }

        // 同时保存到 sessionStorage 作为备份
        // 因为 productFilter 可能在跳转页面后丢失
        sessionStorage.setItem('pending_search_keyword', term);
    }
}

if (typeof window !== 'undefined') {
    window.SearchManager = SearchManager;
}

