/**
 * Cart Dropdown Renderer
 * Handles the visual rendering and interactions of the cart dropdown in header
 */
class CartDropdownRenderer {
    constructor(cartManager) {
        this.cartManager = cartManager;
        this.icon = null;
        this.dropdown = null;
        this.badge = null;
        this.hoverTimer = null;
        this.hoverDelay = 500; // 0.5s hover delay
    }

    /**
     * Initialize the dropdown renderer
     */
    init() {
        this.cacheDOM();
        this.createDropdown();
        this.createBadge();
        this.bindEvents();
        this.updateBadge();
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

        // Double-click to navigate to cart page
        this.icon.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            window.location.href = '/201-project/cart.html';
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
     * Update badge display
     */
    updateBadge() {
        if (!this.badge) return;

        // Count unique variants (distinct name+color+size combinations), not total quantity
        const count = this.cartManager.getCount();

        if (count > 0) {
            this.badge.style.display = 'flex';
            this.badge.textContent = count > 99 ? '99+' : count;
        } else {
            this.badge.style.display = 'none';
        }
    }

    /**
     * Play cart icon animation
     */
    playIconAnimation() {
        if (!this.icon) return;

        // Remove animation class if already exists
        this.icon.classList.remove('cart-icon-animate');

        // Force reflow to restart animation
        void this.icon.offsetWidth;

        // Add animation class
        this.icon.classList.add('cart-icon-animate');

        // Remove class after animation completes
        setTimeout(() => {
            this.icon.classList.remove('cart-icon-animate');
        }, 1000);
    }

    /**
     * Lazy load images after rendering
     * @param {HTMLElement} container - Container with images
     */
    lazyLoadImages(container) {
        const images = container.querySelectorAll('img[data-src]');

        images.forEach(img => {
            const actualSrc = img.dataset.src;

            // Load image
            const loader = new Image();
            loader.onload = () => {
                img.src = actualSrc;
            };
            loader.onerror = () => {
                console.warn('Failed to load cart image:', actualSrc);
                // Keep placeholder on error
            };
            loader.src = actualSrc;
        });
    }

    /**
     * Render cart items in dropdown
     */
    render() {
        const container = this.dropdown.querySelector('.cart-items');
        if (!container) return;

        container.innerHTML = '';

        const cart = this.cartManager.getCart();

        if (cart.length === 0) {
            container.innerHTML = '<p style="text-align:center;padding:20px;color:#9F9F9F">Your cart is empty</p>';
            return;
        }

        cart.forEach(item => {
            const el = document.createElement('div');
            el.className = 'cart-item';

            // Get color display name
            const colorDisplay = Object.keys(item.color || {}).find(k => item.color[k] === item.selectedColor) || item.selectedColor;

            // Use placeholder first for instant display
            const placeholderSrc = '/201-project/images/products/placeholder.jpg';

            el.innerHTML = `
                <img src="${placeholderSrc}" 
                     class="cart-item-img" 
                     alt="${item.name}"
                     data-src="${item.product_picture}">
                <div class="cart-item-info">
                    <span class="cart-item-title">${item.name}</span>
                    <span class="cart-item-variant">${item.selectedSize} / ${colorDisplay}</span>
                    <span class="cart-item-price">RM ${item.price.toLocaleString()}</span>
                    <div class="cart-controls">
                        <div class="cart-qty-group">
                            <button class="qty-btn minus" data-id="${item.variantId}" ${item.qty <= 1 ? 'disabled' : ''}>-</button>
                            <span class="qty-display">${item.qty}</span>
                            <button class="qty-btn plus" data-id="${item.variantId}">+</button>
                        </div>
                        <button class="qty-btn delete" data-id="${item.variantId}" title="Remove from cart">Delete</button>
                    </div>
                </div>
            `;
            container.appendChild(el);
        });

        // Lazy load actual images after render
        this.lazyLoadImages(container);

        // Bind quantity control buttons
        container.querySelectorAll('.minus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const variantId = btn.dataset.id;
                const item = this.cartManager.getCart().find(i => i.variantId === variantId);
                if (item && item.qty > 1) {
                    this.cartManager.updateQuantity(variantId, -1);
                    this.render();
                    this.updateBadge();
                }
            });
        });

        container.querySelectorAll('.plus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.cartManager.updateQuantity(btn.dataset.id, 1);
                this.render();
                this.updateBadge();
            });
        });

        // Bind delete buttons
        container.querySelectorAll('.delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const variantId = btn.dataset.id;
                const item = this.cartManager.getCart().find(i => i.variantId === variantId);
                if (item) {
                    this.cartManager.removeProduct(variantId);
                    this.cartManager.showNotification(`${item.name} removed from cart`, 'info');
                    this.render();
                    this.updateBadge();
                }
            });
        });
    }
}

if (typeof window !== 'undefined') {
    window.CartDropdownRenderer = CartDropdownRenderer;
}

