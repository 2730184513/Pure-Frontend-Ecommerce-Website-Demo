/**
 * Cart Manager
 * Handles cart business logic - data management, storage, and state
 * Cart data is isolated per user (by email)
 */
class CartManager {
    constructor() {
        this.cart = [];
        this.dropdownRenderer = null;
        this.isInitialized = false;
        this.STORAGE_KEY_PREFIX = 'furniro_cart_';
    }

    /**
     * Get current user email for storage key
     * @returns {string} User email or 'guest'
     */
    getCurrentUserEmail() {
        const stored = localStorage.getItem('furniro_current_user');
        if (stored) {
            try {
                const user = JSON.parse(stored);
                return user.email || 'guest';
            } catch (e) {
                return 'guest';
            }
        }
        return 'guest';
    }

    /**
     * Get storage key for current user
     * @returns {string} Storage key
     */
    getStorageKey() {
        return this.STORAGE_KEY_PREFIX + this.getCurrentUserEmail();
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
     * Load cart from localStorage (user-specific)
     */
    loadCart() {
        const stored = localStorage.getItem(this.getStorageKey());
        this.cart = stored ? JSON.parse(stored) : [];
    }

    /**
     * Reload cart for current user (call when user changes)
     */
    reloadForCurrentUser() {
        this.loadCart();
        if (this.dropdownRenderer) {
            this.dropdownRenderer.updateBadge();
            this.dropdownRenderer.render();
        }
    }

    /**
     * Setup global event listeners
     */
    setupEventListeners() {
        window.addEventListener('addToCart', (e) => {
            this.addProduct(e.detail.product);
        });

        // Listen for user state changes to reload cart
        window.addEventListener('userStateChanged', () => {
            this.reloadForCurrentUser();
        });
    }


    /**
     * Add product to cart
     * @param {Object} product - Product to add (should include selectedSize and selectedColor if pre-selected)
     */
    addProduct(product) {
        // Use pre-selected size/color if provided, otherwise use first option or default
        const size = product.selectedSize || (product.size ? Object.keys(product.size)[0] : 'Standard');
        const color = product.selectedColor || (product.color ? Object.keys(product.color)[0] : 'Default');
        const variantId = `${product.id}-${size.replace(/\s/g, '')}-${color.replace(/#/g, '')}`;

        const existing = this.cart.find(item => item.variantId === variantId);

        let message;
        if (existing) {
            // If product already exists, add the quantity (default to 1 if not specified)
            const qtyToAdd = product.qty || 1;
            const newQty = existing.qty + qtyToAdd;
            
            // Use remaining stock as max limit, fallback to 9999
            const maxQty = product.number_of_remain || 9999;
            if (newQty > maxQty) {
                window.toast.error(`Maximum available quantity is ${maxQty}!`);
                return;
            }
            existing.qty = newQty;
            message = `${product.name} quantity increased in cart!`;
        } else {
            this.cart.push({
                ...product,
                variantId,
                selectedSize: size,
                selectedColor: color,
                qty: product.qty || 1
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
     * Save cart to localStorage (user-specific)
     */
    saveCart() {
        localStorage.setItem(this.getStorageKey(), JSON.stringify(this.cart));
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

