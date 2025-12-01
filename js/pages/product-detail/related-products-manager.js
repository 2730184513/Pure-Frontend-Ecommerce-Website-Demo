/**
 * Related Products Manager
 * Manages the related products section on product detail page
 * Uses ProductCardRenderer for rendering product cards
 */

class RelatedProductsManager {
    constructor(containerSelector = '#related-products') {
        this.containerSelector = containerSelector;
        this.container = document.querySelector(containerSelector);
        
        // Product data
        this.relatedProducts = [];
        this.displayedCount = 0;
        this.productsPerLoad = 4;

        // DOM elements
        this.gridElement = null;
        this.showMoreButton = null;

        // Product card renderer instance
        this.productCardRenderer = null;
    }

    /**
     * Initialize the related products section
     * @param {Object} currentProduct - Current product data
     */
    async init(currentProduct) {
        if (!this.container) {
            console.error('Related products container not found');
            return;
        }

        this.cacheElements();
        await this.loadRelatedProducts(currentProduct);
        this.render();
        this.attachEventListeners();
    }

    /**
     * Cache DOM element references
     * @private
     */
    cacheElements() {
        this.gridElement = this.container.querySelector('.product-grid');
        this.showMoreButton = this.container.querySelector('.btn-show-more');
    }

    /**
     * Load related products from repository
     * @param {Object} currentProduct - Current product data
     * @private
     */
    async loadRelatedProducts(currentProduct) {
        if (!currentProduct) return;

        // Ensure product repository is loaded
        if (!window.productRepository.dataLoaded) {
            await window.productRepository.loadAll();
        }

        // Query products with same category, excluding current product
        this.relatedProducts = window.productRepository.query(product => {
            return product.category === currentProduct.category && 
                   product.id !== currentProduct.id;
        });

        console.log(`✓ Found ${this.relatedProducts.length} related products`);
    }

    /**
     * Render related products grid
     */
    render() {
        if (!this.gridElement) return;

        // Initialize product card renderer
        if (!this.productCardRenderer) {
            this.productCardRenderer = new ProductCardRenderer(`${this.containerSelector} .product-grid`);
        }

        // Clear grid and reset counter
        this.gridElement.innerHTML = '';
        this.displayedCount = 0;

        // Show initial batch of products
        this.showMoreProducts();
    }

    /**
     * Show more related products
     */
    showMoreProducts() {
        const startIndex = this.displayedCount;
        const endIndex = Math.min(startIndex + this.productsPerLoad, this.relatedProducts.length);
        const productsToShow = this.relatedProducts.slice(startIndex, endIndex);

        if (productsToShow.length === 0) return;

        // Render products
        productsToShow.forEach(product => {
            const card = this.productCardRenderer.renderCard(product);
            this.gridElement.appendChild(card);
        });

        this.displayedCount = endIndex;

        // Update show more button visibility
        this.updateShowMoreButtonVisibility();
    }

    /**
     * Update show more button visibility
     * @private
     */
    updateShowMoreButtonVisibility() {
        if (!this.showMoreButton) return;

        // Hide button if all products are displayed or no related products
        const shouldHide = this.displayedCount >= this.relatedProducts.length || 
                          this.relatedProducts.length <= this.productsPerLoad;

        if (shouldHide) {
            this.showMoreButton.classList.add('hidden');
        } else {
            this.showMoreButton.classList.remove('hidden');
        }
    }

    /**
     * Attach event listeners
     * @private
     */
    attachEventListeners() {
        if (this.showMoreButton) {
            this.showMoreButton.addEventListener('click', () => {
                this.showMoreProducts();
            });
        }
    }

    /**
     * Get related products
     * @returns {Array} Related products array
     */
    getRelatedProducts() {
        return [...this.relatedProducts];
    }

    /**
     * Get displayed count
     * @returns {number} Number of displayed products
     */
    getDisplayedCount() {
        return this.displayedCount;
    }
}

// Export to global scope
if (typeof window !== 'undefined') {
    window.RelatedProductsManager = RelatedProductsManager;
}
