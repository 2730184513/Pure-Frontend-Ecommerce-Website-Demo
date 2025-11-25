/**
 * Paging Manager
 * Manages pagination controls and page navigation
 */
class PagingManager {
    constructor() {
        this.currentPage = 1;
        this.totalPages = 1;
        this.totalItems = 0;
        this.itemsPerPage = 16;
        this.onPageChangeCallback = null;
        this.isInitialized = false;
    }

    /**
     * Initialize paging manager
     * @param {Function} onPageChangeCallback - Callback when page changes
     */
    init(onPageChangeCallback) {
        this.onPageChangeCallback = onPageChangeCallback || (() => {});
        this.isInitialized = true;
    }

    /**
     * Set configuration
     * @param {number} totalItems - Total number of items
     * @param {number} itemsPerPage - Items per page
     * @param {number} currentPage - Current page (optional)
     */
    setConfig(totalItems, itemsPerPage, currentPage = 1) {
        this.totalItems = totalItems;
        this.itemsPerPage = itemsPerPage;
        this.totalPages = Math.ceil(totalItems / itemsPerPage);
        this.currentPage = Math.max(1, Math.min(currentPage, this.totalPages));
    }

    /**
     * Get current page number
     * @returns {number}
     */
    getCurrentPage() {
        return this.currentPage;
    }

    /**
     * Set current page
     * @param {number} page - Page number
     */
    setCurrentPage(page) {
        const newPage = Math.max(1, Math.min(page, this.totalPages));
        if (newPage !== this.currentPage) {
            this.currentPage = newPage;
            this.triggerPageChange();
        }
    }

    /**
     * Go to next page
     */
    nextPage() {
        if (this.currentPage < this.totalPages) {
            this.setCurrentPage(this.currentPage + 1);
        }
    }

    /**
     * Go to previous page
     */
    prevPage() {
        if (this.currentPage > 1) {
            this.setCurrentPage(this.currentPage - 1);
        }
    }

    /**
     * Get page slice indices
     * @returns {Object} Object with start and end indices
     */
    getPageSlice() {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        return { start, end };
    }

    /**
     * Get display text (e.g., "Showing 1–16 of 64 results")
     * @returns {string}
     */
    getDisplayText() {
        if (this.totalItems === 0) {
            return 'Showing 0 results';
        }

        const { start, end } = this.getPageSlice();
        const showStart = start + 1;
        const showEnd = Math.min(end, this.totalItems);

        return `Showing ${showStart}–${showEnd} of ${this.totalItems} results`;
    }

    /**
     * Render pagination controls
     * @param {string} containerSelector - Container selector for pagination
     */
    render(containerSelector = '#pagination-container') {
        const container = document.querySelector(containerSelector);
        if (!container) {
            console.warn('Pagination container not found');
            return;
        }

        container.innerHTML = '';

        // Don't show pagination if only one page or less
        if (this.totalPages <= 1) {
            return;
        }

        // Previous button (with icon)
        if (this.currentPage > 1) {
            container.appendChild(this.createIconButton('prev', this.currentPage - 1));
        }

        // Page number buttons
        this.getPageRange().forEach(page => {
            if (page === '...') {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'page-ellipsis';
                ellipsis.textContent = '...';
                container.appendChild(ellipsis);
            } else {
                container.appendChild(
                    this.createButton(page, page, page === this.currentPage)
                );
            }
        });

        // Next button (with icon)
        if (this.currentPage < this.totalPages) {
            container.appendChild(this.createIconButton('next', this.currentPage + 1));
        }
    }

    /**
     * Get page range to display
     * @returns {Array} Array of page numbers and ellipsis
     * @private
     */
    getPageRange() {
        const range = [];
        const delta = 2; // Number of pages to show around current page

        for (let i = 1; i <= this.totalPages; i++) {
            if (
                i === 1 || // First page
                i === this.totalPages || // Last page
                (i >= this.currentPage - delta && i <= this.currentPage + delta) // Around current
            ) {
                range.push(i);
            } else if (range[range.length - 1] !== '...') {
                range.push('...');
            }
        }

        return range;
    }

    /**
     * Create pagination button
     * @param {string|number} text - Button text
     * @param {number} page - Target page
     * @param {boolean} isActive - Whether button is active
     * @returns {HTMLElement} Button element
     * @private
     */
    createButton(text, page, isActive = false) {
        const btn = document.createElement('button');
        btn.className = `page-btn ${isActive ? 'active' : ''}`;
        btn.textContent = text;

        if (!isActive) {
            btn.addEventListener('click', () => {
                this.setCurrentPage(page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        return btn;
    }

    /**
     * Create icon button (for prev/next)
     * @param {string} type - Button type ('prev' or 'next')
     * @param {number} page - Target page
     * @returns {HTMLElement} Button element with icon
     * @private
     */
    createIconButton(type, page) {
        const btn = document.createElement('button');
        btn.className = `page-btn page-btn-icon page-btn-${type}`;

        const icon = document.createElement('img');
        if (type === 'prev') {
            icon.src = '/201-project/images/icons/left.png';
            icon.alt = 'Previous page';
        } else {
            icon.src = '/201-project/images/icons/right.png';
            icon.alt = 'Next page';
        }
        icon.className = 'page-icon';

        btn.appendChild(icon);

        btn.addEventListener('click', () => {
            this.setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        return btn;
    }

    /**
     * Trigger page change callback
     * @private
     */
    triggerPageChange() {
        if (this.onPageChangeCallback) {
            this.onPageChangeCallback(this.currentPage);
        }
    }

    /**
     * Reset to first page
     */
    reset() {
        this.currentPage = 1;
    }

    /**
     * Get paging info object
     * @returns {Object}
     */
    getInfo() {
        return {
            currentPage: this.currentPage,
            totalPages: this.totalPages,
            totalItems: this.totalItems,
            itemsPerPage: this.itemsPerPage,
            displayText: this.getDisplayText()
        };
    }
}

if (typeof window !== 'undefined') {
    window.PagingManager = PagingManager;
}

