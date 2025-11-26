/**
 * Cart Summary Manager
 * Handles the bottom summary bar with calculations and selected items preview
 */
class CartSummaryManager {
    constructor(cartManager) {
        this.cartManager = cartManager;
        this.carouselPosition = 0;
        this.previewExpanded = false;
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

        // Carousel buttons
        const prevBtn = document.querySelector('.carousel-btn:first-child');
        const nextBtn = document.querySelector('.carousel-btn:last-child');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.scrollCarousel(-1));
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.scrollCarousel(1));
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

        // Clear carousel
        if (this.carouselTrack) {
            this.carouselTrack.innerHTML = '';
        }

        itemCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                selectedCount++;

                const cartItem = checkbox.closest('.cart-item');
                const quantity = parseInt(cartItem.querySelector('.quantity-input').value);
                const currentPrice = parseFloat(cartItem.querySelector('.current-price').dataset.price);
                const originalPrice = parseFloat(cartItem.querySelector('.original-price').dataset.original);

                productTotal += currentPrice * quantity;
                originalTotal += originalPrice * quantity;

                // Add image to carousel
                if (this.carouselTrack) {
                    const imgSrc = cartItem.querySelector('.product-image').src;
                    const previewItem = document.createElement('div');
                    previewItem.className = 'preview-item';
                    previewItem.innerHTML = `<img src="${imgSrc}" alt="Selected product">`;
                    this.carouselTrack.appendChild(previewItem);
                }
            }
        });

        const discount = originalTotal - productTotal;

        // Update display
        if (this.selectedCountSpan) this.selectedCountSpan.textContent = selectedCount;
        if (this.checkoutCountSpan) this.checkoutCountSpan.textContent = selectedCount;
        if (this.productTotalSpan) this.productTotalSpan.textContent = `RM ${productTotal.toFixed(2)}`;
        if (this.discountSpan) this.discountSpan.textContent = `RM ${discount.toFixed(2)}`;
        if (this.totalPriceSpan) this.totalPriceSpan.textContent = `RM ${productTotal.toFixed(2)}`;

        // Update select all checkbox state
        this.updateSelectAllState(selectedCount, itemCheckboxes.length);

        // Reset carousel position
        this.carouselPosition = 0;
        this.updateCarouselPosition();
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
     * Scroll carousel
     * @param {number} direction - Scroll direction (-1 for left, 1 for right)
     */
    scrollCarousel(direction) {
        if (!this.carouselTrack) return;

        const itemWidth = 70; // 60px + 10px gap
        const visibleItems = Math.floor(this.carouselTrack.parentElement.offsetWidth / itemWidth);
        const totalItems = this.carouselTrack.children.length;
        const maxPosition = Math.max(0, totalItems - visibleItems);

        this.carouselPosition = Math.max(0, Math.min(maxPosition, this.carouselPosition + direction));
        this.updateCarouselPosition();
    }

    /**
     * Update carousel transform position
     */
    updateCarouselPosition() {
        if (!this.carouselTrack) return;

        const itemWidth = 70;
        this.carouselTrack.style.transform = `translateX(-${this.carouselPosition * itemWidth}px)`;
    }
}

if (typeof window !== 'undefined') {
    window.CartSummaryManager = CartSummaryManager;
}

