/**
 * Product Info Manager
 * Manages business logic for the product info section
 * Handles user interactions: size/color selection, quantity, cart, wishlist
 */

class ProductInfoManager {
    constructor(containerSelector = '#product-info') {
        this.containerSelector = containerSelector;
        this.container = document.querySelector(containerSelector);
        
        // Product data
        this.product = null;
        this.selectedSize = null;
        this.selectedColor = null;
        this.quantity = 1;
        this.maxQuantity = 1;

        // Renderer instance
        this.renderer = null;

        // Description expand state
        this.isDescriptionExpanded = false;

        // Tooltip timeout
        this.tooltipTimeout = null;
    }

    /**
     * Initialize the product info section
     * @param {Object} product - Product data
     */
    init(product) {
        if (!product) {
            console.error('Product data is required');
            return;
        }

        this.product = product;
        this.maxQuantity = product.number_of_remain || 9999;

        // Set default selections
        this.initDefaultSelections();

        // Initialize renderer and render
        this.renderer = new ProductInfoRenderer(this.containerSelector);
        this.renderer.render(product);

        // Attach event listeners
        this.attachEventListeners();

        // Check wishlist state
        this.checkWishlistState();

        // Check description overflow after render
        setTimeout(() => this.renderer.checkDescriptionOverflow(), 0);

        console.log('✓ Product Info Manager initialized');
    }

    /**
     * Initialize default selections
     * @private
     */
    initDefaultSelections() {
        // Default to first size
        if (this.product.size && typeof this.product.size === 'object') {
            const sizes = Object.keys(this.product.size);
            this.selectedSize = sizes.length > 0 ? sizes[0] : null;
        }

        // Default to first color
        if (this.product.color && typeof this.product.color === 'object') {
            const colors = Object.keys(this.product.color);
            this.selectedColor = colors.length > 0 ? colors[0] : null;
        }
    }

    /**
     * Attach all event listeners
     * @private
     */
    attachEventListeners() {
        if (!this.container) return;

        // Size selection
        this.container.querySelectorAll('.size-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleSizeClick(e));
            btn.addEventListener('mouseenter', (e) => this.handleTooltipShow(e));
            btn.addEventListener('mouseleave', () => this.handleTooltipHide());
        });

        // Color selection
        this.container.querySelectorAll('.color-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleColorClick(e));
            btn.addEventListener('mouseenter', (e) => this.handleTooltipShow(e));
            btn.addEventListener('mouseleave', () => this.handleTooltipHide());
        });

        // Quantity controls
        const minusBtn = this.container.querySelector('.qty-btn.minus');
        const plusBtn = this.container.querySelector('.qty-btn.plus');
        const qtyInput = this.container.querySelector('#qty-input');
        
        if (minusBtn) minusBtn.addEventListener('click', () => this.handleQuantityChange(-1));
        if (plusBtn) plusBtn.addEventListener('click', () => this.handleQuantityChange(1));
        if (qtyInput) {
            qtyInput.addEventListener('change', () => this.handleQuantityInputChange(qtyInput));
            qtyInput.addEventListener('blur', () => this.handleQuantityInputChange(qtyInput));
        }

        // Action buttons
        const addToCartBtn = this.container.querySelector('#btn-add-to-cart');
        const checkoutBtn = this.container.querySelector('#btn-checkout');
        const likeBtn = this.container.querySelector('#btn-like');

        if (addToCartBtn) addToCartBtn.addEventListener('click', () => this.handleAddToCart());
        if (checkoutBtn) checkoutBtn.addEventListener('click', () => this.handleCheckout());
        if (likeBtn) likeBtn.addEventListener('click', () => this.handleLike());

        // Description expand/collapse
        const expandLink = this.container.querySelector('#description-expand-link');
        if (expandLink) expandLink.addEventListener('click', () => this.handleDescriptionToggle());
    }

    /**
     * Handle size button click
     * @param {Event} e - Click event
     * @private
     */
    handleSizeClick(e) {
        const btn = e.currentTarget;
        const size = btn.dataset.size;

        // Toggle selection
        if (btn.classList.contains('selected')) {
            btn.classList.remove('selected');
            this.selectedSize = null;
        } else {
            // Deselect all others
            this.container.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            this.selectedSize = size;
        }
    }

    /**
     * Handle color button click
     * @param {Event} e - Click event
     * @private
     */
    handleColorClick(e) {
        const btn = e.currentTarget;
        const color = btn.dataset.color;

        // Toggle selection
        if (btn.classList.contains('selected')) {
            btn.classList.remove('selected');
            this.selectedColor = null;
        } else {
            // Deselect all others
            this.container.querySelectorAll('.color-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            this.selectedColor = color;
        }
    }

    /**
     * Handle tooltip show (with 1 second delay)
     * @param {Event} e - Mouse event
     * @private
     */
    handleTooltipShow(e) {
        const btn = e.currentTarget;
        const tooltip = btn.querySelector('.size-tooltip, .color-tooltip');
        
        if (tooltip) {
            this.tooltipTimeout = setTimeout(() => {
                tooltip.classList.add('visible');
            }, 1000);
        }
    }

    /**
     * Handle tooltip hide
     * @private
     */
    handleTooltipHide() {
        if (this.tooltipTimeout) {
            clearTimeout(this.tooltipTimeout);
            this.tooltipTimeout = null;
        }

        this.container.querySelectorAll('.size-tooltip, .color-tooltip').forEach(tooltip => {
            tooltip.classList.remove('visible');
        });
    }

    /**
     * Handle quantity change
     * @param {number} delta - Change amount (+1 or -1)
     * @private
     */
    handleQuantityChange(delta) {
        const newQty = this.quantity + delta;

        // Clamp to valid range
        if (newQty < 1) {
            if (window.toast) {
                window.toast.warning(`Quantity cannot be less than 1`);
            }
            return; // Don't go below 1
        } else if (newQty > this.maxQuantity) {
            if (window.toast) {
                window.toast.warning(`Maximum available quantity is ${this.maxQuantity}`);
            }
            return;
        } else {
            this.quantity = newQty;
        }

        this.renderer.updateQuantityDisplay(this.quantity);
    }

    /**
     * Handle quantity input field changes with validation
     * @param {HTMLInputElement} input - The quantity input field
     * @private
     */
    handleQuantityInputChange(input) {
        let value = parseInt(input.value, 10);
        
        // Handle invalid input
        if (isNaN(value) || value < 1) {
            value = 1;
        }
        
        // Enforce maximum
        if (value > this.maxQuantity) {
            value = this.maxQuantity;
            if (window.toast) {
                window.toast.warning(`Maximum available quantity is ${this.maxQuantity}`);
            }
        }
        
        this.quantity = value;
        this.renderer.updateQuantityDisplay(this.quantity);
    }

    /**
     * Handle add to cart
     * @private
     */
    handleAddToCart() {
        // Validate selections
        if (!this.validateSelections()) return;

        // Create cart item
        const cartItem = this.createCartItem();

        // Add to cart via event
        window.dispatchEvent(new CustomEvent('addToCart', {
            detail: { product: cartItem }
        }));
    }

    /**
     * Handle checkout
     * Creates a direct checkout session without modifying the cart
     * This approach avoids quantity conflicts with existing cart items
     * @private
     */
    handleCheckout() {
        // Validate selections
        if (!this.validateSelections()) return;

        // Create the variant ID
        const size = this.selectedSize || 'Standard';
        const color = this.selectedColor || 'Default';
        const variantId = `${this.product.id}-${size.replace(/\s/g, '')}-${color.replace(/#/g, '')}`;

        // Create a direct checkout item (not added to cart)
        const checkoutItem = {
            ...this.product,
            variantId,
            selectedSize: size,
            selectedColor: color,
            qty: this.quantity,
            // Mark as direct checkout item (not from cart)
            isDirectCheckout: true
        };

        // Store checkout item directly for checkout page
        // Use a separate key to distinguish from cart-based checkout
        localStorage.setItem('direct_checkout_item', JSON.stringify(checkoutItem));
        
        // Clear the cart-based checkout selection to avoid confusion
        localStorage.removeItem('checkout_selected_items');

        // Navigate to checkout
        window.location.href = '/201-project/checkout.html';
    }

    /**
     * Handle like button click - toggle wishlist
     * @private
     */
    handleLike() {
        // Check current wishlist state
        const wishlistData = localStorage.getItem('furniro_wishlist');
        const wishlist = wishlistData ? JSON.parse(wishlistData) : [];
        const isCurrentlyLiked = wishlist.some(item => item.id === this.product.id);

        if (isCurrentlyLiked) {
            // Remove from wishlist
            this.removeFromWishlist();
        } else {
            // Add to wishlist
            this.addToWishlist();
        }

        // Update visual state
        this.checkWishlistState();
    }

    /**
     * Add product to wishlist
     * @private
     */
    addToWishlist() {
        window.dispatchEvent(new CustomEvent('addToWishlist', {
            detail: { product: this.product }
        }));
    }

    /**
     * Remove product from wishlist
     * @private
     */
    removeFromWishlist() {
        const wishlistData = localStorage.getItem('furniro_wishlist');
        const wishlist = wishlistData ? JSON.parse(wishlistData) : [];
        const updatedWishlist = wishlist.filter(item => item.id !== this.product.id);
        localStorage.setItem('furniro_wishlist', JSON.stringify(updatedWishlist));
        
        if (window.toast) {
            window.toast.info(`${this.product.name} removed from wishlist`);
        }

        // Update wishlist dropdown if available
        if (window.cartManagerInstance && window.cartManagerInstance.dropdownRenderer) {
            // The wishlist manager needs to be updated
        }
        
        // Dispatch event for wishlist manager to sync
        window.dispatchEvent(new CustomEvent('wishlistUpdated'));
    }

    /**
     * Handle description expand/collapse
     * @private
     */
    handleDescriptionToggle() {
        const textElement = this.container.querySelector('#product-detail-text');
        const linkElement = this.container.querySelector('#description-expand-link');

        if (!textElement || !linkElement) return;

        this.isDescriptionExpanded = !this.isDescriptionExpanded;

        if (this.isDescriptionExpanded) {
            textElement.classList.add('expanded');
            linkElement.textContent = 'Collapse';
        } else {
            textElement.classList.remove('expanded');
            linkElement.textContent = 'Expand';
        }
    }

    /**
     * Validate size and color selections
     * @returns {boolean} Whether selections are valid
     * @private
     */
    validateSelections() {
        const hasSizeOptions = this.product.size && Object.keys(this.product.size).length > 0;
        const hasColorOptions = this.product.color && Object.keys(this.product.color).length > 0;

        if (hasSizeOptions && !this.selectedSize) {
            if (window.toast) {
                window.toast.warning('Please select a size');
            }
            return false;
        }

        if (hasColorOptions && !this.selectedColor) {
            if (window.toast) {
                window.toast.warning('Please select a color');
            }
            return false;
        }

        return true;
    }

    /**
     * Create cart item object
     * @returns {Object} Cart item
     * @private
     */
    createCartItem() {
        return {
            ...this.product,
            selectedSize: this.selectedSize || 'Standard',
            selectedColor: this.selectedColor || 'Default',
            qty: this.quantity
        };
    }

    /**
     * Check and update wishlist state
     * @private
     */
    checkWishlistState() {
        // Check if product is in wishlist
        const wishlistData = localStorage.getItem('furniro_wishlist');
        const wishlist = wishlistData ? JSON.parse(wishlistData) : [];
        const isLiked = wishlist.some(item => item.id === this.product.id);

        this.renderer.updateLikeState(isLiked);
    }

    /**
     * Get current selections
     * @returns {Object} Current selections
     */
    getSelections() {
        return {
            size: this.selectedSize,
            color: this.selectedColor,
            quantity: this.quantity
        };
    }
}

// Export to global scope
if (typeof window !== 'undefined') {
    window.ProductInfoManager = ProductInfoManager;
}
