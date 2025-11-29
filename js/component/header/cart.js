/**
 * Cart Manager
 * Handles cart business logic - data management, storage, and state
 */
class CartManager {
    constructor() {
        this.cart = [];
        this.dropdownRenderer = null;
        this.isInitialized = false;
    }

    init() {
        if (this.isInitialized) return;

        this.loadCart();
        this.setupEventListeners();

        // Initialize dropdown renderer
        this.dropdownRenderer = new CartDropdownRenderer(this);
        this.dropdownRenderer.init();

        this.isInitialized = true;
    }

    /**
     * Load cart from localStorage
     */
    loadCart() {
        const stored = localStorage.getItem('furniro_cart');
        this.cart = stored ? JSON.parse(stored) : [];
    }

    /**
     * Setup global event listeners
     */
    setupEventListeners() {
        window.addEventListener('addToCart', (e) => {
            this.addProduct(e.detail.product);
        });
    }


    /**
     * Add product to cart
     * @param {Object} product - Product to add
     */
    addProduct(product) {
        const size = product.size ? Object.keys(product.size)[0] : 'Standard';
        const color = product.color ? Object.keys(product.color)[0] : 'Default';
        const variantId = `${product.id}-${size.replace(/\s/g, '')}-${color.replace(/#/g, '')}`;

        const existing = this.cart.find(item => item.variantId === variantId);

        let message;
        if (existing) {
            if (existing.qty === 9999) {
                window.toast.error(`Maximum quantity for ${product.name} reached!`);
                return;
            }
            existing.qty++;
            message = `${product.name} quantity increased in cart!`;
        } else {
            this.cart.push({
                ...product,
                variantId,
                selectedSize: size,
                selectedColor: color,
                qty: 1
            });
            message = `${product.name} has been added to your cart!`;
        }

        this.saveCart();
        window.toast.success(message);

        // Update renderer and play animation
        if (this.dropdownRenderer) {
            this.dropdownRenderer.updateBadge();
            this.dropdownRenderer.playIconAnimation();
        }

        // Dispatch event for cart page to sync
        window.dispatchEvent(new CustomEvent('cartUpdated'));
    }

    /**
     * Update product quantity
     * @param {string} variantId - Variant ID
     * @param {number} delta - Quantity change (+1 or -1)
     * @param {boolean} silent - If true, don't show notifications (default: false)
     */
    updateQuantity(variantId, delta, silent = false) {
        const item = this.cart.find(i => i.variantId === variantId);
        if (item) {
            const newQty = item.qty + delta;

            // Enforce minimum quantity of 1
            if (newQty < 1) {
                return; // Don't allow quantity below 1
            }

            item.qty = newQty;
            this.saveCart();

            // Update renderer
            if (this.dropdownRenderer) {
                this.dropdownRenderer.updateBadge();
            }

            // Dispatch event for cart page to sync
            window.dispatchEvent(new CustomEvent('cartUpdated'));

            // Note: silent parameter is reserved for future use in preventing notifications
        }
    }

    /**
     * Remove product from cart
     * @param {string} variantId - Variant ID to remove
     * @param {boolean} silent - If true, don't show notification (default: false)
     */
    removeProduct(variantId, silent = false) {
        const item = this.cart.find(i => i.variantId === variantId);

        this.cart = this.cart.filter(i => i.variantId !== variantId);
        this.saveCart();

        // Update renderer
        if (this.dropdownRenderer) {
            this.dropdownRenderer.updateBadge();
            this.dropdownRenderer.render();
        }

        // Show notification (unless silent mode)
        if (item && !silent) {
            window.toast.info(`${item.name} removed from cart`);
        }

        // Dispatch event for cart page to sync
        window.dispatchEvent(new CustomEvent('cartUpdated'));
    }

    /**
     * Save cart to localStorage
     */
    saveCart() {
        localStorage.setItem('furniro_cart', JSON.stringify(this.cart));
    }


    /**
     * Get cart items
     * @returns {Array} Cart items
     */
    getCart() {
        return [...this.cart];
    }

    /**
     * Get cart count (unique variants)
     * @returns {number} Number of unique variants in cart
     */
    getCount() {
        return this.cart.length;
    }
}

if (typeof window !== 'undefined') {
    window.CartManager = CartManager;
}

