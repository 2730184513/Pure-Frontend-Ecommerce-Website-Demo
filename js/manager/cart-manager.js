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

        // Wait for cart manager to be available (CartManager from header/cart.js)
        if (!window.CartManager) {
            console.error('CartManager not found');
            return;
        }

        // Get the existing cart manager instance (created by HeaderManager)
        if (!window.cartManagerInstance) {
            console.error('CartManager instance not found. HeaderManager should have initialized it.');
            return;
        }

        this.cartManager = window.cartManagerInstance;

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

        // Initial render
        this.render();

        // Initialize summary (this will call update() once)
        this.summaryManager.init();

        // Check if redirected from successful order placement
        this.checkOrderSuccess();


        console.log('✓ Cart Page initialized');
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

