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
        try {
            const rawData = localStorage.getItem('checkout_selected_items');
            if (!rawData) {
                console.warn('No selected items found in localStorage');
                this.selectedItems = [];
                return;
            }

            const selectedVariantIds = JSON.parse(rawData);
            if (!Array.isArray(selectedVariantIds)) {
                console.warn('Invalid selected items data format');
                this.selectedItems = [];
                return;
            }

            const cart = this.cartManager.getCart();
            this.selectedItems = cart.filter(item => selectedVariantIds.includes(item.variantId));

            // Log for debugging
            console.log(`Loaded ${this.selectedItems.length} selected items for checkout`);

            // If no valid items found but we had IDs, it means items were removed from cart
            if (this.selectedItems.length === 0 && selectedVariantIds.length > 0) {
                console.warn('Selected items no longer exist in cart');
                // Clear the invalid localStorage data
                localStorage.removeItem('checkout_selected_items');
            }
        } catch (error) {
            console.error('Error loading selected items:', error);
            this.selectedItems = [];
            // Clear potentially corrupted localStorage data
            localStorage.removeItem('checkout_selected_items');
        }
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

