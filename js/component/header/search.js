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
        // Open search overlay
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
     */
    performSearch() {
        const term = this.input.value.trim();

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
}

if (typeof window !== 'undefined') {
    window.SearchManager = SearchManager;
}

