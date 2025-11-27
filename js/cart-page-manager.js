/**
 * Cart Page Manager
 * Main controller for the cart.html page
 */
class CartPageManager {
    constructor() {
        this.cartManager = null;
        this.lineRenderer = null;
        this.summaryManager = null;
        this.container = null;
    }

    /**
     * Initialize the cart page
     */
    async init() {
        console.log('🛒 Initializing Cart Page...');

        // Wait for cart manager to be available
        if (!window.CartManager) {
            console.error('CartManager not found');
            return;
        }

        // Get the existing cart manager instance or create new one
        this.cartManager = window.cartManagerInstance || new CartManager();

        if (!window.cartManagerInstance) {
            this.cartManager.init();
            window.cartManagerInstance = this.cartManager;
        }

        // Cache DOM
        this.container = document.getElementById('cart-items-container');

        if (!this.container) {
            console.error('Cart items container not found');
            return;
        }

        // Initialize renderers
        this.lineRenderer = new CartProductLineRenderer(this.cartManager);
        this.summaryManager = new CartSummaryManager(this.cartManager);

        // Bind events
        this.bindEvents();

        // Initial render (don't check empty cart here - only check on checkout)
        this.render();

        // Initialize summary
        this.summaryManager.init();

        // Check if redirected from successful order placement
        this.checkOrderSuccess();

        // Check if returning from incomplete checkout and restore selection
        this.restoreCheckoutSelection();

        console.log('✓ Cart Page initialized');
    }

    /**
     * Check if cart is empty and redirect to shop page
     * @returns {boolean} True if cart is empty and redirect happened
     */
    checkEmptyCart() {
        const cart = this.cartManager.getCart();
        if (!cart || cart.length === 0) {
            console.log('Cart is empty, redirecting to shop...');
            // Set flag for shop page to show message
            sessionStorage.setItem('cart_empty_redirect', 'true');
            window.location.href = 'shop.html';
            return true;
        }
        return false;
    }

    /**
     * Check if order was successfully placed and show notification
     */
    checkOrderSuccess() {
        const orderSuccess = sessionStorage.getItem('order_placed_success');
        if (orderSuccess === 'true') {
            // Clear the flag
            sessionStorage.removeItem('order_placed_success');

            // Show success toast
            if (window.toast) {
                window.toast.show('Order placed successfully! Thank you for your purchase🎉', 'success', 3000);
            }
        }
    }

    /**
     * Restore selected items when returning from incomplete checkout
     */
    restoreCheckoutSelection() {
        const returningFromCheckout = sessionStorage.getItem('returning_from_checkout');

        if (returningFromCheckout === 'true') {
            console.log('🔄 Returning from incomplete checkout, restoring selection...');

            // Clear the flag
            sessionStorage.removeItem('returning_from_checkout');

            // Get previously selected items from localStorage
            const selectedItemsJson = localStorage.getItem('checkout_selected_items');

            if (selectedItemsJson) {
                try {
                    const selectedVariantIds = JSON.parse(selectedItemsJson);
                    console.log('Restoring selection for:', selectedVariantIds);

                    // Wait for DOM to be ready, then restore checkboxes
                    setTimeout(() => {
                        selectedVariantIds.forEach(variantId => {
                            const checkbox = document.querySelector(`.item-checkbox[data-variant-id="${variantId}"]`);
                            if (checkbox) {
                                checkbox.checked = true;
                                console.log('✓ Restored checkbox for:', variantId);
                            }
                        });

                        // Update summary after restoring selections
                        if (this.summaryManager) {
                            this.summaryManager.update();
                        }

                        console.log('✓ Selection restored successfully');
                    }, 200);
                } catch (e) {
                    console.error('Failed to restore checkout selection:', e);
                }
            }
        }
    }

    /**
     * Bind global events
     */
    bindEvents() {
        // Listen for cart updates
        window.addEventListener('cartUpdated', () => {
            this.render();
        });

        // Listen for storage changes (sync across tabs)
        window.addEventListener('storage', (e) => {
            if (e.key === 'furniro_cart') {
                this.render();
            }
        });
    }

    /**
     * Render the cart page
     */
    render() {
        if (!this.lineRenderer || !this.container) return;


        this.lineRenderer.renderAll(this.container);

        // Trigger summary update after render
        setTimeout(() => {
            if (this.summaryManager) {
                this.summaryManager.update();
            }
        }, 0);
    }
}

if (typeof window !== 'undefined') {
    window.CartPageManager = CartPageManager;
}

