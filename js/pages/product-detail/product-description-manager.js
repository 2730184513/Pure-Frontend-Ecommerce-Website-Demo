/**
 * Product Description Manager
 * Manages the product description tabs section
 * Handles tab switching and review expand/collapse
 */

class ProductDescriptionManager {
    constructor(containerSelector = '#product-description') {
        this.containerSelector = containerSelector;
        this.container = document.querySelector(containerSelector);
        
        // Product data
        this.product = null;

        // Renderer instance
        this.renderer = null;

        // Track expanded reviews
        this.expandedReviews = new Set();
    }

    /**
     * Initialize the description section
     * @param {Object} product - Product data
     */
    init(product) {
        if (!product) {
            console.error('Product data is required');
            return;
        }

        this.product = product;

        // Initialize renderer and render
        this.renderer = new ProductDescriptionRenderer(this.containerSelector);
        this.renderer.render(product);

        // Attach event listeners
        this.attachEventListeners();

        // Check review overflow after render (need to wait for DOM update)
        requestAnimationFrame(() => {
            this.renderer.checkReviewOverflow();
        });

        console.log('✓ Product Description Manager initialized');
    }

    /**
     * Attach all event listeners
     * @private
     */
    attachEventListeners() {
        if (!this.container) return;

        // Tab navigation
        this.container.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleTabClick(e));
        });

        // Review expand/collapse
        this.container.querySelectorAll('.expand-review-link').forEach(link => {
            link.addEventListener('click', (e) => this.handleReviewToggle(e));
        });
    }

    /**
     * Handle tab button click
     * @param {Event} e - Click event
     * @private
     */
    handleTabClick(e) {
        const tabId = e.currentTarget.dataset.tab;
        this.renderer.switchTab(tabId);

        // Check review overflow when switching to reviews tab
        if (tabId === 'reviews') {
            requestAnimationFrame(() => {
                this.renderer.checkReviewOverflow();
            });
        }
    }

    /**
     * Handle review expand/collapse toggle
     * @param {Event} e - Click event
     * @private
     */
    handleReviewToggle(e) {
        e.preventDefault();
        const link = e.currentTarget;
        const reviewItem = link.closest('.review-item');
        
        if (!reviewItem) return;

        // Get unique identifier for this review
        const reviewIndex = Array.from(this.container.querySelectorAll('.review-item')).indexOf(reviewItem);
        
        // Toggle expanded state
        const isExpanded = this.expandedReviews.has(reviewIndex);
        
        if (isExpanded) {
            this.expandedReviews.delete(reviewIndex);
        } else {
            this.expandedReviews.add(reviewIndex);
        }

        this.renderer.toggleReviewExpand(reviewItem, !isExpanded);
    }

    /**
     * Switch to a specific tab programmatically
     * @param {string} tabId - Tab identifier ('description', 'additional', 'reviews')
     */
    switchToTab(tabId) {
        this.renderer.switchTab(tabId);
    }

    /**
     * Get current active tab
     * @returns {string} Active tab identifier
     */
    getActiveTab() {
        const activeBtn = this.container?.querySelector('.tab-btn.active');
        return activeBtn ? activeBtn.dataset.tab : 'description';
    }
}

// Export to global scope
if (typeof window !== 'undefined') {
    window.ProductDescriptionManager = ProductDescriptionManager;
}
