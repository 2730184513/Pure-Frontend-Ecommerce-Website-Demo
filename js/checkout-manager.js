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
                window.location.href = 'cart.html';
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

                // Set flag to indicate user is returning from incomplete checkout
                sessionStorage.setItem('returning_from_checkout', 'true');

                window.location.href = 'cart.html';
            });
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

        // Get form data
        const formData = this.formManager.getFormData();
        const paymentMethod = this.summaryManager.getPaymentMethod();
        const selectedItems = this.summaryManager.getSelectedItems();
        const grandTotal = this.summaryManager.calculateGrandTotal();


        // Remove ordered items from cart (silent mode - no individual notifications)
        selectedItems.forEach(item => {
            this.cartManager.removeProduct(item.variantId, true);
        });

        // Clear checkout selection
        localStorage.removeItem('checkout_selected_items');

        // Clear returning flag (order completed successfully)
        sessionStorage.removeItem('returning_from_checkout');

        // Set a flag in sessionStorage to show success message after redirect
        sessionStorage.setItem('order_placed_success', 'true');

        // Redirect to cart page immediately
        window.location.href = 'cart.html';
    }
}

// Export to window
if (typeof window !== 'undefined') {
    window.CheckoutManager = CheckoutManager;
}

