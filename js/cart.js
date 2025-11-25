/**
 * Cart Manager
 * Handles cart content management, quantity updates, and dropdown interactions
 */
class CartManager {
    constructor() {
        this.cart = [];
        this.icon = null;
        this.dropdown = null;
        this.badge = null;
        this.hoverTimer = null;
        this.hoverDelay = 500; // 0.5s hover delay
        this.isInitialized = false;
    }

    init() {
        if (this.isInitialized) return;

        this.loadCart();
        this.cacheDOM();
        this.createDropdown();
        this.createBadge();
        this.bindEvents();
        this.setupEventListeners();
        this.updateBadge();

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
     * Cache DOM elements
     */
    cacheDOM() {
        this.icon = document.querySelector('#icon-cart');
        this.dropdown = document.getElementById('cart-dropdown');
        this.badge = document.getElementById('cart-badge');
    }

    /**
     * Create dropdown structure if not exists
     */
    createDropdown() {
        if (!this.dropdown) {
            const headerContainer = document.querySelector('.header-container');
            if (headerContainer) {
                const cartDrop = document.createElement('div');
                cartDrop.id = 'cart-dropdown';
                cartDrop.className = 'header-dropdown cart-dropdown';
                cartDrop.innerHTML = '<div class="cart-items"></div>';
                headerContainer.appendChild(cartDrop);
                this.dropdown = cartDrop;
            }
        }
    }

    /**
     * Create badge element
     */
    createBadge() {
        if (!this.badge && this.icon) {
            const badge = document.createElement('div');
            badge.className = 'icon-badge';
            badge.id = 'cart-badge';
            badge.style.display = 'none';
            this.icon.appendChild(badge);
            this.badge = badge;
        }
    }

    /**
     * Bind event listeners for hover and click
     */
    bindEvents() {
        if (!this.icon || !this.dropdown) {
            console.warn('Cart elements not found');
            return;
        }

        // Click to show immediately
        this.icon.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showDropdown();
        });

        // Hover to show (0.5s delay)
        this.icon.addEventListener('mouseenter', () => {
            this.hoverTimer = setTimeout(() => {
                this.showDropdown();
            }, this.hoverDelay);
        });

        // Cancel timer if mouse leaves before delay
        this.icon.addEventListener('mouseleave', () => {
            if (this.hoverTimer) {
                clearTimeout(this.hoverTimer);
                this.hoverTimer = null;
            }
        });

        // Keep dropdown open when hovering over it
        this.dropdown.addEventListener('mouseenter', () => {
            this.dropdown.classList.add('active');
        });

        this.dropdown.addEventListener('mouseleave', () => {
            this.dropdown.classList.remove('active');
        });

        // Close dropdown when mouse leaves both icon and dropdown
        const hideDropdown = () => {
            setTimeout(() => {
                if (!this.icon.matches(':hover') && !this.dropdown.matches(':hover')) {
                    this.dropdown.classList.remove('active');
                }
            }, 100);
        };

        this.icon.addEventListener('mouseleave', hideDropdown);
        this.dropdown.addEventListener('mouseleave', hideDropdown);

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!this.dropdown.contains(e.target) && !this.icon.contains(e.target)) {
                this.dropdown.classList.remove('active');
            }
        });
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
     * Show dropdown
     */
    showDropdown() {
        this.closeOtherDropdowns();
        this.render();
        this.dropdown.classList.add('active');
    }

    /**
     * Close other dropdowns (wishlist, etc)
     */
    closeOtherDropdowns() {
        const dropdowns = document.querySelectorAll('.header-dropdown');
        dropdowns.forEach(d => {
            if (d !== this.dropdown) {
                d.classList.remove('active');
            }
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
        this.updateBadge();
        this.showDropdown();
        this.showNotification(message, 'success');
    }

    /**
     * Update product quantity
     * @param {string} variantId - Variant ID
     * @param {number} delta - Quantity change (+1 or -1)
     */
    updateQuantity(variantId, delta) {
        const item = this.cart.find(i => i.variantId === variantId);
        if (item) {
            item.qty += delta;
            if (item.qty <= 0) {
                this.cart = this.cart.filter(i => i.variantId !== variantId);
            }
            this.saveCart();
            this.render();
            this.updateBadge();
        }
    }

    /**
     * Remove product from cart
     * @param {string} variantId - Variant ID to remove
     */
    removeProduct(variantId) {
        this.cart = this.cart.filter(i => i.variantId !== variantId);
        this.saveCart();
        this.render();
        this.updateBadge();
    }

    /**
     * Clear all cart items
     */
    clearCart() {
        this.cart = [];
        this.saveCart();
        this.render();
        this.updateBadge();
    }

    /**
     * Save cart to localStorage
     */
    saveCart() {
        localStorage.setItem('furniro_cart', JSON.stringify(this.cart));
    }

    /**
     * Update badge display
     */
    updateBadge() {
        if (!this.badge) return;

        // Count unique variants (distinct name+color+size combinations), not total quantity
        const count = this.cart.length;

        if (count > 0) {
            this.badge.style.display = 'flex';
            this.badge.textContent = count > 99 ? '99+' : count;
        } else {
            this.badge.style.display = 'none';
        }
    }

    /**
     * Render cart items
     */
    render() {
        const container = this.dropdown.querySelector('.cart-items');
        if (!container) return;

        container.innerHTML = '';

        if (this.cart.length === 0) {
            container.innerHTML = '<p style="text-align:center;padding:20px;color:#9F9F9F">Your cart is empty</p>';
            return;
        }

        this.cart.forEach(item => {
            const el = document.createElement('div');
            el.className = 'cart-item';

            // Get color display name
            const colorDisplay = Object.keys(item.color || {}).find(k => item.color[k] === item.selectedColor) || item.selectedColor;

            el.innerHTML = `
                <img src="${item.product_picture}" 
                     class="cart-item-img" 
                     alt="${item.name}"
                     onerror="this.src='images/products/placeholder.jpg'">
                <div class="cart-item-info">
                    <span class="cart-item-title">${item.name}</span>
                    <span class="cart-item-variant">${item.selectedSize} / ${colorDisplay}</span>
                    <span class="cart-item-price">RM ${item.price.toLocaleString()}</span>
                </div>
                <div class="cart-controls">
                    <button class="qty-btn minus" data-id="${item.variantId}">-</button>
                    <span>${item.qty}</span>
                    <button class="qty-btn plus" data-id="${item.variantId}">+</button>
                </div>
            `;
            container.appendChild(el);
        });

        // Bind quantity control buttons
        container.querySelectorAll('.minus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.updateQuantity(btn.dataset.id, -1);
            });
        });

        container.querySelectorAll('.plus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.updateQuantity(btn.dataset.id, 1);
            });
        });
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

    /**
     * Get total quantity (sum of all quantities)
     * @returns {number} Total quantity
     */
    getTotalQuantity() {
        return this.cart.reduce((sum, item) => sum + item.qty, 0);
    }

    /**
     * Show notification
     * @param {string} message - Message to display
     * @param {string} type - Notification type
     */
    showNotification(message, type = 'info') {
        // Simple alert for now, can be enhanced with toast notifications
        alert(message);
    }
}

if (typeof window !== 'undefined') {
    window.CartManager = CartManager;
}

