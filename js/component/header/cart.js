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
     * Also validates cart items against current stock levels
     */
    loadCart() {
        const stored = localStorage.getItem(this.getStorageKey());
        this.cart = stored ? JSON.parse(stored) : [];
        
        // Validate and adjust cart quantities based on current stock
        this.validateCartStock();
    }

    /**
     * Validate cart items against current stock and adjust if necessary
     * Shows notifications for items that were adjusted
     * @private
     */
    validateCartStock() {
        if (!window.productRepository || !window.productRepository.dataLoaded) {
            // Repository not ready yet, skip validation
            // Will be called again when repository is loaded
            return;
        }

        const adjustedItems = [];
        const outOfStockItems = [];
        let cartModified = false;

        this.cart.forEach(item => {
            const currentStock = window.productRepository.getStock(item.id);
            
            if (currentStock <= 0) {
                // Product is out of stock
                if (item.qty !== 1) {
                    item.qty = 1; // Set to 1 to keep in cart but frozen
                    cartModified = true;
                }
                outOfStockItems.push(item.name);
            } else if (item.qty > currentStock) {
                // Quantity exceeds current stock
                const oldQty = item.qty;
                item.qty = currentStock;
                cartModified = true;
                adjustedItems.push({
                    name: item.name,
                    oldQty: oldQty,
                    newQty: currentStock
                });
            }
        });

        // Save cart if modified
        if (cartModified) {
            this.saveCart();
        }

        // Show notifications after a short delay to ensure toast is ready
        // Only notify about quantity adjustments when stock > 0 but quantity exceeds stock
        // Don't notify about out-of-stock items to avoid repeated notifications on page load
        if (adjustedItems.length > 0) {
            setTimeout(() => {
                adjustedItems.forEach(item => {
                    if (window.toast) {
                        window.toast.warning(
                            `"${item.name}" quantity adjusted from ${item.oldQty} to ${item.newQty} due to stock changes.`
                        );
                    }
                });
            }, 500);
        }
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

        // Listen for stock updates to re-validate cart
        window.addEventListener('stockUpdated', () => {
            this.validateCartStock();
            // Update dropdown if visible
            if (this.dropdownRenderer) {
                this.dropdownRenderer.render();
            }
        });
    }


    /**
     * Add product to cart
     * @param {Object} product - Product to add (should include selectedSize and selectedColor if pre-selected)
     */
    addProduct(product) {
        // Check if product is out of stock (using real-time stock from repository)
        let currentStock = product.number_of_remain || 9999;
        if (window.productRepository) {
            currentStock = window.productRepository.getStock(product.id);
        }

        if (currentStock <= 0) {
            window.toast.warning('This product is currently out of stock. Please wait for restock.');
            return;
        }

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
            
            // Use real-time stock as max limit
            if (newQty > currentStock) {
                window.toast.error(`Maximum available quantity is ${currentStock}!`);
                return;
            }
            existing.qty = newQty;
            message = `${product.name} quantity increased in cart!`;
        } else {
            // Check if requested quantity exceeds stock
            const qtyToAdd = product.qty || 1;
            if (qtyToAdd > currentStock) {
                window.toast.error(`Only ${currentStock} items available in stock!`);
                return;
            }
            this.cart.push({
                ...product,
                variantId,
                selectedSize: size,
                selectedColor: color,
                qty: qtyToAdd
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

            // Get real-time stock from repository for max limit
            let maxQty = item.number_of_remain || 9999;
            if (window.productRepository) {
                maxQty = window.productRepository.getStock(item.id);
            }

            // Enforce maximum quantity based on real-time stock
            if (newQty > maxQty) {
                if (!silent && window.toast) {
                    window.toast.warning(`Maximum available quantity is ${maxQty}`);
                }
                return;
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

