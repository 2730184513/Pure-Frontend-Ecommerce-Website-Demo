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
        console.log('🛒 Initializing Checkout Page...');

        // Get cart manager instance
        this.cartManager = window.cartManagerInstance;
        if (!this.cartManager) {
            console.error('❌ Cart manager not found');
            alert('Cart manager not initialized. Please refresh the page.');
            return;
        }
        console.log('✓ Cart manager found:', this.cartManager);

        // Check if form exists
        if (!this.form) {
            console.error('❌ Form element not found');
            return;
        }
        console.log('✓ Form element found');

        try {
            // Initialize form manager (left side)
            console.log('Initializing form manager...');
            this.formManager = new window.FormManager(this.form);
            await this.formManager.initialize();
            console.log('✓ Form manager initialized');

            // Initialize summary manager (right side)
            console.log('Initializing summary manager...');
            this.summaryManager = new window.CheckoutSummaryManager(this.cartManager);
            this.summaryManager.initialize();
            console.log('✓ Summary manager initialized');

            // Bind form submit
            console.log('Binding form submit...');
            this.bindFormSubmit();
            console.log('✓ Form submit bound');

            // Bind back button
            console.log('Binding back button...');
            this.bindBackButton();
            console.log('✓ Back button bound');

            console.log('✅ Checkout page fully initialized');
        } catch (error) {
            console.error('❌ Error during initialization:', error);
            alert('Failed to initialize checkout page: ' + error.message);
        }
    }

    /**
     * Bind back button
     */
    bindBackButton() {
        const backBtn = document.querySelector('.back-button');
        console.log('Back button element:', backBtn);

        if (backBtn) {
            backBtn.addEventListener('click', (e) => {
                console.log('Back button clicked');
                e.preventDefault();
                window.location.href = 'cart.html';
            });
            console.log('✓ Back button click event bound');
        } else {
            console.warn('⚠ Back button not found in DOM');
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

        // Log order details
        console.log('=== Order Submitted Successfully ===');
        console.log('Form Data:', formData);
        console.log('Payment Method:', paymentMethod);
        console.log('Items:', selectedItems);
        console.log('Grand Total:', grandTotal);

        // Remove ordered items from cart (silent mode - no individual notifications)
        selectedItems.forEach(item => {
            this.cartManager.removeProduct(item.variantId, true);
        });

        // Clear checkout selection
        localStorage.removeItem('checkout_selected_items');

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

