/**
 * CheckoutManager - Main controller for checkout page
 * Coordinates form manager and summary manager
 */
class CheckoutManager {
    constructor(formId) {
        this.form = document.getElementById(formId);
        this.formManager = null;
        this.summaryManager = null;
        this.cartManager = null;
    }

    async initialize() {
        // Check if accessed from cart page
        const referrer = document.referrer;
        let isFromCart = false;
        if (referrer) {
            try {
                const referrerUrl = new URL(referrer);
                const referrerPage = referrerUrl.pathname.split('/').pop() || 'index.html';
                isFromCart = referrerPage === 'cart.html';
            } catch (e) {
                console.warn('Could not parse referrer:', e);
            }
        }

        // If not from cart, redirect to cart
        if (!isFromCart) {
            if (window.toast) {
                window.toast.show('Please access checkout from your cart', 'info');
            }
            setTimeout(() => {
                window.location.href = '/201-project/cart.html';
            }, 1000);
            return;
        }

        // Get cart manager instance
        this.cartManager = window.cartManagerInstance;
        if (!this.cartManager) {
            console.error('Cart manager not found');
            alert('Cart manager not initialized. Please refresh the page.');
            return;
        }

        // Check if form exists
        if (!this.form) {
            console.error('Form element not found');
            return;
        }

        try {
            // Initialize form manager (left side)
            this.formManager = new window.FormManager(this.form);
            await this.formManager.initialize();

            // Initialize summary manager (right side)
            this.summaryManager = new window.CheckoutSummaryManager(this.cartManager);
            this.summaryManager.initialize();

            // Bind form submit
            this.bindFormSubmit();

            // Bind back button
            this.bindBackButton();

            // Bind page cleanup events
            this.bindPageCleanupEvents();
        } catch (error) {
            console.error('Error during checkout initialization:', error);
            alert('Failed to initialize checkout page: ' + error.message);
        }
   }

    /**
     * Bind back button
     */
    bindBackButton() {
        const backBtn = document.querySelector('.back-button');

        if (backBtn) {
            backBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = '/201-project/cart.html';
            });
        }
    }

    /**
     * Bind page cleanup events
     */
    bindPageCleanupEvents() {
        // Clear selected items when navigating away from checkout
        window.addEventListener('beforeunload', () => {
            this.clearCheckoutData();
        });

        // Also clear when clicking back button or other navigation
        window.addEventListener('pagehide', () => {
            this.clearCheckoutData();
        });

        // Handle browser back/forward navigation
        window.addEventListener('popstate', () => {
            this.clearCheckoutData();
        });
    }

    /**
     * Clear checkout-related localStorage data
     */
    clearCheckoutData() {
        try {
            localStorage.removeItem('checkout_selected_items');
            console.log('Checkout data cleared from localStorage');
        } catch (error) {
            console.warn('Error clearing checkout data:', error);
        }
    }

    /**
     * Bind form submit
     */
    bindFormSubmit() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
    }

    /**
     * Handle form submission
     */
    async handleSubmit() {
        // Validate form
        if (!this.formManager.validateAll()) {
            return;
        }

        // Get selected items for removal from cart
        const selectedItems = this.summaryManager.getSelectedItems();

        // Note: formData, paymentMethod, and grandTotal would be used here
        // for actual order processing in a real application


        // Remove ordered items from cart (silent mode - no individual notifications)
        selectedItems.forEach(item => {
            this.cartManager.removeProduct(item.variantId, true);
        });

        // Clear checkout selected items since order is complete
        localStorage.removeItem('checkout_selected_items');

        // Clear order success flag if exists
        sessionStorage.removeItem('order_placed_success');

        // Set a flag in sessionStorage to show success message after redirect
        sessionStorage.setItem('order_placed_success', 'true');

        // Redirect to cart page immediately
        window.location.href = '/201-project/cart.html';
    }
}

// Export to window
if (typeof window !== 'undefined') {
    window.CheckoutManager = CheckoutManager;
}

