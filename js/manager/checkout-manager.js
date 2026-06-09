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
        // Check if accessed from valid source (cart page or product detail page)
        const referrer = document.referrer;
        let isFromCart = false;
        let isFromProductDetail = false;
        
        if (referrer) {
            try {
                const referrerUrl = new URL(referrer);
                const referrerPage = referrerUrl.pathname.split('/').pop() || 'index.html';
                isFromCart = referrerPage === 'cart.html';
                isFromProductDetail = referrerPage === 'product-detail.html';
            } catch (e) {
                console.warn('Could not parse referrer:', e);
            }
        }

        // Also check if we have direct checkout item (from product detail)
        const hasDirectCheckout = localStorage.getItem('direct_checkout_item') !== null;
        const hasCartCheckout = localStorage.getItem('checkout_selected_items') !== null;

        // If not from valid source and no checkout data, redirect to cart
        if (!isFromCart && !isFromProductDetail && !hasDirectCheckout && !hasCartCheckout) {
            if (window.toast) {
                window.toast.show('Please access checkout from your cart or product page', 'info');
            }
            setTimeout(() => {
                window.location.href = './cart.html';
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

            // Check if we actually have items to checkout after loading
            // This handles the case where localStorage has IDs but cart items were removed
            const selectedItems = this.summaryManager.getSelectedItems();
            if (selectedItems.length === 0) {
                console.warn('No valid items for checkout after initialization');
                if (window.toastManager) {
                    window.toastManager.show('No items selected for checkout. Redirecting to cart...', 'info');
                }
                this.clearCheckoutData();
                setTimeout(() => {
                    window.location.href = './cart.html';
                }, 1500);
                return;
            }

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
                this.clearCheckoutData();
                window.location.href = './cart.html';
            });
        }
    }

    /**
     * Bind page cleanup events
     */
    bindPageCleanupEvents() {
        // Use a flag to track if we're navigating away (not refreshing)
        let isNavigatingAway = false;

        // Detect actual navigation (clicking links)
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.href && !link.href.includes('checkout.html')) {
                isNavigatingAway = true;
            }
        });

        // Clear data only when actually navigating away, not on refresh
        window.addEventListener('pagehide', (e) => {
            // persisted = true means page is being cached (back/forward cache)
            // If persisted is false and we're navigating away, clear data
            if (isNavigatingAway || !e.persisted) {
                // Don't clear on refresh - check if we're staying on same page
                // pagehide with !persisted can be navigation or close, but not refresh
            }
        });

        // Handle browser back/forward navigation
        window.addEventListener('popstate', () => {
            this.clearCheckoutData();
        });

        // Clear when form is successfully submitted (handled in handleSubmit)
        // or when user clicks back button (handled in bindBackButton)
    }

    /**
     * Clear checkout-related localStorage data
     */
    clearCheckoutData() {
        try {
            localStorage.removeItem('checkout_selected_items');
            localStorage.removeItem('direct_checkout_item');
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
        // Show loading state
        const submitBtn = this.form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Processing...';
        }

        try {
            // Validate form
            if (!this.formManager.validateAll()) {
                // Show validation error toast
                if (window.toastManager) {
                    window.toastManager.show('Please check the form and fix any errors', 'error');
                }
                return;
            }

            // Get selected items
            const selectedItems = this.summaryManager.getSelectedItems();
            const isDirectCheckout = this.summaryManager.getIsDirectCheckout();

            // Simulate processing delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Update product stock in repository (this affects all users globally)
            const stockUpdateItems = selectedItems.map(item => ({
                productId: item.id,
                quantity: item.qty
            }));
            
            if (window.productRepository) {
                const stockUpdateSuccess = window.productRepository.batchUpdateStock(stockUpdateItems);
                if (!stockUpdateSuccess) {
                    if (window.toastManager) {
                        window.toastManager.show('Some items are out of stock. Please update your cart.', 'error');
                    }
                    return;
                }
                console.log('✓ Stock updated successfully for purchased items');
            }

            // Only remove from cart if this is a cart-based checkout (not direct checkout)
            if (!isDirectCheckout) {
                // Remove ordered items from cart (silent mode - no individual notifications)
                selectedItems.forEach(item => {
                    this.cartManager.removeProduct(item.variantId, true);
                });
            }
            // For direct checkout, we don't modify the cart at all

            // Clear all checkout data since order is complete
            localStorage.removeItem('checkout_selected_items');
            localStorage.removeItem('direct_checkout_item');

            // Clear order success flag if exists
            sessionStorage.removeItem('order_placed_success');

            // Show success toast
            if (window.toastManager) {
                window.toastManager.show('Order placed successfully! Thank you for your purchase.', 'success');
            }

            // Redirect to home page after 2 seconds
            setTimeout(() => {
                window.location.href = './index.html';
            }, 2000);

        } catch (error) {
            console.error('Checkout submission error:', error);
            if (window.toastManager) {
                window.toastManager.show('Failed to place order. Please try again.', 'error');
            }
        } finally {
            // Restore button state
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Place Order';
            }
        }
    }
}

// Export to window
if (typeof window !== 'undefined') {
    window.CheckoutManager = CheckoutManager;
}

