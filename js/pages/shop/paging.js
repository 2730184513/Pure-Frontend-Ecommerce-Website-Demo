/**
 * Paging Manager
 * Manages pagination controls and page navigation
 */
class PagingManager {
    constructor(onChangeCallback) {
        this.currentPage = 1;
        this.totalPages = 1;
        this.onChangeCallback = onChangeCallback || (() => {});
        this.isInitialized = false;
    }

    /**
     * Initialize paging with total items and items per page
     * @param {number} totalItems - Total number of items
     * @param {number} itemsPerPage - Items per page
     * @param {Function} onChangeCallback - Callback when page changes (optional)
     */
    init(totalItems, itemsPerPage, onChangeCallback) {
        if (onChangeCallback) {
            this.onChangeCallback = onChangeCallback;
        }

        this.totalPages = Math.ceil(totalItems / itemsPerPage);
        this.currentPage = Math.max(1, Math.min(this.currentPage, this.totalPages));

        // Render pagination controls
        this.render();

        this.isInitialized = true;
    }



    /**
     * Get current page number
     * @returns {number}
     */
    getCurrentPage() {
        return this.currentPage;
    }

    /**
     * Get total pages count
     * @returns {number}
     */
    getTotalPages() {
        return this.totalPages;
    }

    /**
     * Set current page
     * @param {number} page - Page number
     */
    setCurrentPage(page) {
        const newPage = Math.max(1, Math.min(page, this.totalPages));
        if (newPage !== this.currentPage) {
            this.currentPage = newPage;
            this.triggerChangeCallback();
        }
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
            icon.src = './images/icons/left.png';
            icon.alt = 'Previous page';
        } else {
            icon.src = './images/icons/right.png';
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
    triggerChangeCallback() {
        if (this.onChangeCallback) {
            this.onChangeCallback();
        }
    }

    /**
     * Reset to first page
     */
    reset() {
        this.currentPage = 1;
    }
}

if (typeof window !== 'undefined') {
    window.PagingManager = PagingManager;
}

