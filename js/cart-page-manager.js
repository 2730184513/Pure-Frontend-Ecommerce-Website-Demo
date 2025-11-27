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
        this.navStateManager = new NavigationStateManager();
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

        // Check if returning from incomplete checkout BEFORE rendering
        const shouldRestore = sessionStorage.getItem('returning_from_checkout') === 'true';
        const selectedVariantIds = shouldRestore ? this.navStateManager.getCartSelections() : null;

        // Initial render (don't check empty cart here - only check on checkout)
        this.render();

        // Initialize summary (this will call update() once)
        this.summaryManager.init();

        // Check if redirected from successful order placement
        this.checkOrderSuccess();

        // Restore selection after render and summary init complete
        if (shouldRestore && selectedVariantIds && selectedVariantIds.length > 0) {
            this.restoreCheckoutSelection(selectedVariantIds);
        } else if (shouldRestore) {
            // Clear flag even if no selections to restore
            sessionStorage.removeItem('returning_from_checkout');
        }

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
     * @param {Array} selectedVariantIds - Array of variant IDs to restore
     */
    restoreCheckoutSelection(selectedVariantIds) {
        console.log('🔄 Restoring checkout selections...');

        // Use requestAnimationFrame + setTimeout to ensure DOM is fully rendered
        requestAnimationFrame(() => {
            setTimeout(() => {
                let restoredCount = 0;
                const notFoundIds = [];

                selectedVariantIds.forEach(variantId => {
                    const checkbox = document.querySelector(`.item-checkbox[data-variant-id="${variantId}"]`);
                    if (checkbox) {
                        checkbox.checked = true;
                        restoredCount++;
                    } else {
                        notFoundIds.push(variantId);
                    }
                });

                // Update summary after restoring selections
                if (this.summaryManager) {
                    this.summaryManager.update();
                }

                console.log(`✓ Restored ${restoredCount}/${selectedVariantIds.length} selections`);

                // Show toast notification
                if (window.toast && restoredCount > 0) {
                    window.toast.show(`Restored ${restoredCount} selected item${restoredCount > 1 ? 's' : ''} from checkout`, 'info', 2000);
                } else if (window.toast && notFoundIds.length === selectedVariantIds.length) {
                    window.toast.show('Previously selected items are no longer in cart', 'warning', 2000);
                }

                // Clear the flag and selections after restoration
                sessionStorage.removeItem('returning_from_checkout');
                this.navStateManager.clearCartSelections();
            }, 150);
        });
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

        // Note: Summary will be updated after restoration completes or immediately if no restoration
    }
}

if (typeof window !== 'undefined') {
    window.CartPageManager = CartPageManager;
}

