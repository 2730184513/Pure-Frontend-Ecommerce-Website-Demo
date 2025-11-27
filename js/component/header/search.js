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
     * Perform search and redirect to shop page
     */
    performSearch() {
        // Allow empty string (means "All Products")
        const term = this.input.value.trim();
        localStorage.setItem('shop_search_query', term);
        window.location.href = 'shop.html';
    }

    /**
     * Get current search term
     * @returns {string} Current search term
     */
    getSearchTerm() {
        return this.input ? this.input.value.trim() : '';
    }

    /**
     * Set search term
     * @param {string} term - Search term to set
     */
    setSearchTerm(term) {
        if (this.input) {
            this.input.value = term;
        }
    }
}

if (typeof window !== 'undefined') {
    window.SearchManager = SearchManager;
}

