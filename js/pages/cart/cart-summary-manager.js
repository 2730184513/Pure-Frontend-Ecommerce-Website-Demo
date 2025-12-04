/**
 * Cart Summary Manager
 * Handles the bottom summary bar with calculations and selected items preview
 */
class CartSummaryManager {
    constructor(cartManager) {
        this.cartManager = cartManager;
        this.previewExpanded = false;
        this.carousel = new CartSummaryCarousel();
    }

    /**
     * Initialize the summary section
     */
    init() {
        this.cacheDOM();
        this.bindEvents();
        this.update();
    }

    /**
     * Cache DOM elements
     */
    cacheDOM() {
        this.selectAllCheckbox = document.getElementById('selectAll');
        this.selectedCountSpan = document.getElementById('selectedCount');
        this.checkoutCountSpan = document.getElementById('checkoutCount');
        this.productTotalSpan = document.getElementById('productTotal');
        this.discountSpan = document.getElementById('discount');
        this.totalPriceSpan = document.getElementById('totalPrice');
        this.carouselTrack = document.getElementById('carouselTrack');
        this.previewSection = document.getElementById('selectedItemsPreview');
        this.arrowIcon = document.getElementById('arrowIcon');
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Select all checkbox
        if (this.selectAllCheckbox) {
            this.selectAllCheckbox.addEventListener('change', () => this.toggleSelectAll());
        }

        // Listen for checkbox changes
        window.addEventListener('cartCheckboxChanged', () => this.update());
        window.addEventListener('cartUpdated', () => this.update());

        // Preview toggle button
        const toggleBtn = document.querySelector('.selected-count-btn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.togglePreview());
        }

        // Initialize carousel component
        const prevBtn = document.querySelector('.carousel-btn:first-child');
        const nextBtn = document.querySelector('.carousel-btn:last-child');

        if (this.carouselTrack && prevBtn && nextBtn) {
            this.carousel.init(this.carouselTrack, prevBtn, nextBtn);
        }

        // Checkout button
        const checkoutBtn = document.querySelector('.checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.handleCheckout());
        }
    }

    /**
     * Toggle select all checkboxes
     */
    toggleSelectAll() {
        const itemCheckboxes = document.querySelectorAll('.item-checkbox');
        const isChecked = this.selectAllCheckbox.checked;

        itemCheckboxes.forEach(checkbox => {
            checkbox.checked = isChecked;
        });

        this.update();
    }

    /**
     * Update summary calculations and display
     */
    update() {
        const itemCheckboxes = document.querySelectorAll('.item-checkbox');
        let selectedCount = 0;
        let productTotal = 0;
        let originalTotal = 0;
        const carouselItems = [];

        itemCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                selectedCount++;

                const cartItem = checkbox.closest('.cart-item');
                const quantity = parseInt(cartItem.querySelector('.quantity-input').value);
                const currentPrice = parseFloat(cartItem.querySelector('.current-price').dataset.price);
                const originalPrice = parseFloat(cartItem.querySelector('.original-price').dataset.original);

                productTotal += currentPrice * quantity;
                originalTotal += originalPrice * quantity;

                // Collect variantId for carousel (to find existing cart item)
                const variantId = cartItem.dataset.variantId;
                carouselItems.push({ variantId });
            }
        });

        const discount = originalTotal - productTotal;

        // Update display
        if (this.selectedCountSpan) this.selectedCountSpan.textContent = selectedCount;
        if (this.checkoutCountSpan) this.checkoutCountSpan.textContent = selectedCount;
        if (this.productTotalSpan) this.productTotalSpan.textContent = `RM ${productTotal.toFixed(1)}`;
        if (this.discountSpan) this.discountSpan.textContent = `RM ${discount.toFixed(1)}`;
        if (this.totalPriceSpan) this.totalPriceSpan.textContent = `RM ${productTotal.toFixed(1)}`;

        // Update select all checkbox state
        this.updateSelectAllState(selectedCount, itemCheckboxes.length);

        // Update carousel with collected items
        this.carousel.update(carouselItems);
    }

    /**
     * Update select all checkbox state (checked, indeterminate, unchecked)
     * @param {number} selectedCount - Number of selected items
     * @param {number} totalCount - Total number of items
     */
    updateSelectAllState(selectedCount, totalCount) {
        if (!this.selectAllCheckbox) return;

        const allChecked = selectedCount === totalCount && selectedCount > 0;
        const someChecked = selectedCount > 0 && selectedCount < totalCount;

        this.selectAllCheckbox.checked = allChecked;
        this.selectAllCheckbox.indeterminate = someChecked;
    }

    /**
     * Toggle preview section visibility
     */
    togglePreview() {
        const selectedCount = document.querySelectorAll('.item-checkbox:checked').length;

        if (selectedCount > 0 && this.previewSection) {
            this.previewExpanded = !this.previewExpanded;
            this.previewSection.classList.toggle('active');

            if (this.arrowIcon) {
                this.arrowIcon.classList.toggle('rotated');
            }
        }
    }

    /**
     * Handle checkout button click
     */
    handleCheckout() {
        // Check if cart is empty first
        const cart = this.cartManager.getCart();
        if (!cart || cart.length === 0) {
            console.warn('Cart is empty, redirecting to shop...');
            // Set flag for shop page to show message
            sessionStorage.setItem('cart_empty_redirect', 'true');
            window.location.href = 'shop.html';
            return;
        }

        const itemCheckboxes = document.querySelectorAll('.item-checkbox:checked');

        if (itemCheckboxes.length === 0) {
            console.warn('No items selected for checkout');
            if (window.toast) {
                window.toast.show('Please select at least one item to checkout', 'warning');
            } else {
                alert('Please select at least one item to checkout');
            }
            return;
        }

        // Collect selected variantIds
        const selectedVariantIds = [];
        itemCheckboxes.forEach(checkbox => {
            const cartItem = checkbox.closest('.cart-item');
            const variantId = cartItem.dataset.variantId;
            selectedVariantIds.push(variantId);
        });

        // Save selected items to localStorage for checkout page
        localStorage.setItem('checkout_selected_items', JSON.stringify(selectedVariantIds));
        // Navigate to checkout
        window.location.href = 'checkout.html';
    }

}

if (typeof window !== 'undefined') {
    window.CartSummaryManager = CartSummaryManager;
}

