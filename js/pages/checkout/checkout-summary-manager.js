/**
 * Checkout Summary Manager
 * Manages business logic for the checkout summary section
 * Follows Single Responsibility Principle: Handles logic, delegates rendering to renderer
 */
class CheckoutSummaryManager {
    constructor(cartManager) {
        this.cartManager = cartManager;
        this.selectedItems = [];
        this.renderer = new window.CheckoutSummaryRenderer();
    }

    /**
     * Initialize the summary manager
     */
    initialize() {
        this.loadSelectedItems();
        this.render();
        this.bindPaymentMethodEvents();
    }

    /**
     * Load selected items from cart
     */
    loadSelectedItems() {
        const rawData = localStorage.getItem('checkout_selected_items');
        const selectedVariantIds = JSON.parse(rawData || '[]');
        const cart = this.cartManager.getCart();
        this.selectedItems = cart.filter(item => selectedVariantIds.includes(item.variantId));
    }

    /**
     * Render all summary components
     */
    render() {
        this.renderer.renderProducts(this.selectedItems);

        const calculations = this.calculateTotals();
        this.renderer.renderCalculations(calculations);
    }

    /**
     * Calculate totals (subtotal, discount, grand total)
     * @returns {Object} {subtotal, discount, grandTotal}
     */
    calculateTotals() {
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

        return { subtotal, discount, grandTotal };
    }

    /**
     * Bind payment method change events
     */
    bindPaymentMethodEvents() {
        const radios = document.querySelectorAll('input[name="paymentMethod"]');

        radios.forEach((radio) => {
            radio.addEventListener('change', (e) => {
                this.renderer.updatePaymentMethodDescription(e.target.value);
            });
        });
    }

    /**
     * Get selected payment method
     * @returns {string|null}
     */
    getPaymentMethod() {
        const checked = document.querySelector('input[name="paymentMethod"]:checked');
        return checked ? checked.value : null;
    }

    /**
     * Get selected items
     * @returns {Array}
     */
    getSelectedItems() {
        return this.selectedItems;
    }

    /**
     * Calculate grand total
     * @returns {number}
     */
    calculateGrandTotal() {
        return this.calculateTotals().grandTotal;
    }
}

// Export to window
if (typeof window !== 'undefined') {
    window.CheckoutSummaryManager = CheckoutSummaryManager;
}

