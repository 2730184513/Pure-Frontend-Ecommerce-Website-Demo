/**
 * Checkout Summary Manager
 * Manages the right side order summary section
 */
class CheckoutSummaryManager {
    constructor(cartManager) {
        this.cartManager = cartManager;
        this.selectedItems = [];
    }

    /**
     * Initialize the summary manager
     */
    initialize() {
        this.loadSelectedItems();
        this.renderProducts();
        this.renderCalculations();
        this.initializePaymentMethods();
    }

    /**
     * Load selected items from cart
     */
    loadSelectedItems() {
        // Get selected items from localStorage (set by cart page)
        const rawData = localStorage.getItem('checkout_selected_items');
        const selectedVariantIds = JSON.parse(rawData || '[]');
        const cart = this.cartManager.getCart();
        this.selectedItems = cart.filter(item => selectedVariantIds.includes(item.variantId));
    }

    /**
     * Render products in summary section
     */
    renderProducts() {
        const container = document.querySelector('.summary-products');
        const itemCountSpan = document.querySelector('.summary-item-count');

        if (!container) {
            console.error('.summary-products container not found');
            return;
        }

        // Update item count in header (count product types, not total quantity)
        if (itemCountSpan) {
            const itemCount = this.selectedItems.length;
            itemCountSpan.textContent = `(${itemCount} item${itemCount !== 1 ? 's' : ''})`;
        }

        // Clear container
        container.innerHTML = '';

        // If no items, show empty state
        if (this.selectedItems.length === 0) {
            container.innerHTML = '<div class="summary-empty">No items selected for checkout</div>';
            return;
        }

        // Render each product
        this.selectedItems.forEach((item) => {
            const productEl = this.createProductElement(item);
            container.appendChild(productEl);
        });

        // Lazy load images
        this.lazyLoadImages(container);
    }

    /**
     * Create product element
     */
    createProductElement(item) {
        const el = document.createElement('div');
        el.className = 'summary-product-item';

        // Get color display name
        const colorDisplay = Object.keys(item.color || {}).find(k => item.color[k] === item.selectedColor) || item.selectedColor;

        // Use placeholder first (fallback if image doesn't load)
        const placeholderSrc = 'images/products/placeholder.jpg';

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
                <span class="summary-product-price">RM ${item.price.toLocaleString()}</span>
            </div>
        `;

        return el;
    }

    /**
     * Lazy load images
     */
    lazyLoadImages(container) {
        const images = container.querySelectorAll('img[data-src]');

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

    /**
     * Render calculations (Subtotal, Discount, Grand Total)
     */
    renderCalculations() {
        let subtotal = 0;
        let originalTotal = 0;

        this.selectedItems.forEach(item => {
            const currentPrice = item.price;
            const originalPrice = item.original_price || item.price;

            subtotal += currentPrice * item.qty;
            originalTotal += originalPrice * item.qty;
        });

        const discount = originalTotal - subtotal;
        const grandTotal = subtotal;

        // Update DOM
        const subtotalEl = document.querySelector('.summary-row:nth-of-type(1) p:last-child');
        const discountEl = document.querySelector('.summary-row:nth-of-type(2) p:last-child');
        const totalEl = document.querySelector('.total-price');

        if (subtotalEl) subtotalEl.textContent = `RM ${subtotal.toFixed(2)}`;
        if (discountEl) discountEl.textContent = `RM ${discount.toFixed(2)}`;
        if (totalEl) totalEl.textContent = `RM ${grandTotal.toFixed(2)}`;
    }

    /**
     * Initialize payment methods
     */
    initializePaymentMethods() {
        const radios = document.querySelectorAll('input[name="paymentMethod"]');
        const bankDesc = document.querySelector('.bank-description');
        const cashDesc = document.querySelector('.cash-description');

        if (!bankDesc || !cashDesc) {
            console.error('Payment description elements not found');
            return;
        }

        radios.forEach((radio) => {
            radio.addEventListener('change', (e) => {
                const showBank = e.target.value === 'bank-transfer';

                if (showBank) {
                    bankDesc.classList.remove('hidden');
                    bankDesc.classList.add('visible');
                    cashDesc.classList.remove('visible');
                    cashDesc.classList.add('hidden');
                } else {
                    bankDesc.classList.remove('visible');
                    bankDesc.classList.add('hidden');
                    cashDesc.classList.remove('hidden');
                    cashDesc.classList.add('visible');
                }
            });
        });
    }

    /**
     * Get selected payment method
     */
    getPaymentMethod() {
        const checked = document.querySelector('input[name="paymentMethod"]:checked');
        return checked ? checked.value : null;
    }

    /**
     * Get selected items
     */
    getSelectedItems() {
        return this.selectedItems;
    }

    /**
     * Calculate grand total
     */
    calculateGrandTotal() {
        return this.selectedItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
    }
}

// Export to window
if (typeof window !== 'undefined') {
    window.CheckoutSummaryManager = CheckoutSummaryManager;
}

