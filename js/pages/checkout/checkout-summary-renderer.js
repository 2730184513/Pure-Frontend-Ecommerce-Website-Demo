/**
 * Checkout Summary Renderer
 * Handles all UI rendering for the checkout summary section
 * Follows Single Responsibility Principle: Only handles rendering, no business logic
 */
class CheckoutSummaryRenderer {
    constructor() {
        this.productContainer = document.querySelector('.summary-products');
        this.itemCountSpan = document.querySelector('.summary-item-count');
        this.subtotalElement = document.getElementById('summary-subtotal');
        this.discountElement = document.getElementById('summary-discount');
        this.totalElement = document.getElementById('summary-total');
        this.bankDescription = document.querySelector('.bank-description');
        this.cashDescription = document.querySelector('.cash-description');
    }

    /**
     * Render products in summary section
     * @param {Array} items - Selected cart items
     */
    renderProducts(items) {
        if (!this.productContainer) {
            console.error('.summary-products container not found');
            return;
        }

        // Update item count in header
        this._updateItemCount(items.length);

        // Clear container
        this.productContainer.innerHTML = '';

        // Show empty state if no items
        if (items.length === 0) {
            this._renderEmptyState();
            return;
        }

        // Render each product
        items.forEach((item) => {
            const productEl = this._createProductElement(item);
            this.productContainer.appendChild(productEl);
        });

        // Lazy load images
        this._lazyLoadImages();
    }

    /**
     * Render calculation summary (subtotal, discount, total)
     * @param {Object} calculations - {subtotal, discount, grandTotal}
     */
    renderCalculations(calculations) {
        if (this.subtotalElement) {
            this.subtotalElement.textContent = `RM ${calculations.subtotal.toFixed(1)}`;
        }
        if (this.discountElement) {
            this.discountElement.textContent = `RM ${calculations.discount.toFixed(1)}`;
        }
        if (this.totalElement) {
            this.totalElement.textContent = `RM ${calculations.grandTotal.toFixed(1)}`;
        }
    }

    /**
     * Update payment method description visibility
     * @param {string} paymentMethod - 'bank-transfer' or 'cash-on-delivery'
     */
    updatePaymentMethodDescription(paymentMethod) {
        if (!this.bankDescription || !this.cashDescription) {
            console.error('Payment description elements not found');
            return;
        }

        const showBank = paymentMethod === 'bank-transfer';

        if (showBank) {
            this.bankDescription.classList.remove('hidden');
            this.bankDescription.classList.add('visible');
            this.cashDescription.classList.remove('visible');
            this.cashDescription.classList.add('hidden');
        } else {
            this.bankDescription.classList.remove('visible');
            this.bankDescription.classList.add('hidden');
            this.cashDescription.classList.remove('hidden');
            this.cashDescription.classList.add('visible');
        }
    }

    // ============================================================================
    // Private Helper Methods
    // ============================================================================

    /**
     * Update item count display
     * @param {number} count - Number of items
     * @private
     */
    _updateItemCount(count) {
        if (this.itemCountSpan) {
            this.itemCountSpan.textContent = `(${count} item${count !== 1 ? 's' : ''})`;
        }
    }

    /**
     * Render empty state
     * @private
     */
    _renderEmptyState() {
        this.productContainer.innerHTML = '<div class="summary-empty">No items selected for checkout</div>';
    }

    /**
     * Create product element
     * @param {Object} item - Cart item
     * @returns {HTMLElement}
     * @private
     */
    _createProductElement(item) {
        const el = document.createElement('div');
        el.className = 'summary-product-item';

        // Get color display name
        const colorDisplay = Object.keys(item.color || {}).find(k => item.color[k] === item.selectedColor)
            || item.selectedColor;

        // Use placeholder first
        const placeholderSrc = '/201-project/images/products/placeholder.jpg';

        // Calculate prices
        const originalPrice = item.price;
        const discountedPrice = this._calculateDisplayPrice(item);
        const hasDiscount = discountedPrice < originalPrice;

        // Build price HTML - show both original and discounted if applicable
        let priceHtml;
        if (hasDiscount) {
            priceHtml = `
                <span class="summary-product-price">
                    <span class="discounted-price">RM ${discountedPrice.toFixed(1)}</span>
                    <span class="original-price">RM ${originalPrice.toFixed(1)}</span>
                </span>
            `;
        } else {
            priceHtml = `<span class="summary-product-price">RM ${originalPrice.toFixed(1)}</span>`;
        }

        el.innerHTML = `
            <img src="${placeholderSrc}" 
                 class="summary-product-img" 
                 alt="${item.name}"
                 data-src="${item.product_picture}">
            <div class="summary-product-info">
                <div class="summary-product-header">
                    <span class="summary-product-name">${item.name}</span>
                    <span class="summary-product-qty">x${item.qty}</span>
                </div>
                <span class="summary-product-variant">${item.selectedSize} / ${colorDisplay}</span>
                ${priceHtml}
            </div>
        `;

        return el;
    }

    /**
     * Calculate the display price for an item (applying discount if available)
     * @param {Object} item - Cart item
     * @returns {number} The discounted price
     * @private
     */
    _calculateDisplayPrice(item) {
        if (!item.discount || item.discount === '0') {
            return item.price;
        }
        const match = item.discount.match(/-?(\d+)%/);
        if (match) {
            const discountPercent = parseInt(match[1]);
            return Math.round(item.price * (1 - discountPercent / 100) * 10) / 10;
        }
        return item.price;
    }

    /**
     * Lazy load images in product container
     * @private
     */
    _lazyLoadImages() {
        const images = this.productContainer.querySelectorAll('img[data-src]');

        images.forEach(img => {
            const actualSrc = img.dataset.src;

            const loader = new Image();
            loader.onload = () => {
                img.src = actualSrc;
            };
            loader.onerror = () => {
                console.warn('Failed to load image:', actualSrc);
            };
            loader.src = actualSrc;
        });
    }
}

// Export to window
if (typeof window !== 'undefined') {
    window.CheckoutSummaryRenderer = CheckoutSummaryRenderer;
}

