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

        // Double-click to navigate to cart page (requires login)
        this.icon.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            if (window.AuthGuard && !window.AuthGuard.isLoggedIn()) {
                window.AuthGuard.requireLogin('your shopping cart');
                return;
            }
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
     * Handle quantity input field changes with validation
     * @param {HTMLInputElement} input - The quantity input field
     */
    handleQuantityInputChange(input) {
        const variantId = input.dataset.id;
        const item = this.cartManager.getCart().find(i => i.variantId === variantId);
        if (!item) return;

        // Check if out of stock using real-time data from repository
        let maxQty = item.number_of_remain || 9999;
        if (window.productRepository) {
            const currentStock = window.productRepository.getStock(item.id);
            if (currentStock <= 0) {
                if (window.toast) {
                    window.toast.show('This product is currently out of stock. Please wait for restock.', 'warning');
                }
                input.value = item.qty; // Reset to current value
                return;
            }
            maxQty = currentStock;
        }

        let value = parseInt(input.value);
        let showToast = false;
        let toastMessage = '';

        // Validate input
        if (isNaN(value) || value < 1) {
            showToast = true;
            toastMessage = 'Quantity cannot be less than 1';
            value = 1;
        } else if (value > maxQty) {
            showToast = true;
            toastMessage = `Maximum available quantity is ${maxQty}`;
            value = maxQty;
        }

        // Update input field to corrected value
        input.value = value;

        // Update quantity using silent mode to avoid double notifications
        const delta = value - item.qty;
        if (delta !== 0) {
            this.cartManager.updateQuantity(variantId, delta, true); // Use silent mode
            this.render();
            this.updateBadge();
        }

        // Show validation toast after updating - using unified message format
        if (showToast && window.toast) {
            window.toast.show(toastMessage, 'warning');
        }
    }

    /**
     * Render cart items in dropdown
     */
    /**
     * Render cart items in dropdown
     */
    render() {
        const container = this.dropdown.querySelector('.cart-items');
        if (!container) return;

        container.innerHTML = '';

        const cart = this.cartManager.getCart();

        if (cart.length === 0) {
            container.innerHTML = '<p class="empty-cart-message">Your cart is empty</p>';
            return;
        }

        cart.forEach(item => {
            const el = this.createCartItemElement(item);
            container.appendChild(el);
        });

        // Lazy load actual images after render
        this.lazyLoadImages(container);

        // Bind all event listeners
        this.bindQuantityControls(container);
        this.bindDeleteButtons(container);
    }

    /**
     * Check if product is out of stock
     * @param {string} productId - Product ID
     * @returns {boolean}
     * @private
     */
    isOutOfStock(productId) {
        if (window.productRepository) {
            return window.productRepository.isOutOfStock(productId);
        }
        return false;
    }

    /**
     * Get wishlist storage key for current user
     * @returns {string} Storage key
     * @private
     */
    getWishlistStorageKey() {
        const stored = localStorage.getItem('furniro_current_user');
        let email = 'guest';
        if (stored) {
            try {
                const user = JSON.parse(stored);
                email = user.email || 'guest';
            } catch (e) {
                email = 'guest';
            }
        }
        return 'furniro_wishlist_' + email;
    }

    /**
     * Check if product is in wishlist
     * @param {string} productId - Product ID
     * @returns {boolean}
     * @private
     */
    isInWishlist(productId) {
        const wishlistData = localStorage.getItem(this.getWishlistStorageKey());
        if (!wishlistData) return false;
        try {
            const wishlist = JSON.parse(wishlistData);
            return wishlist.some(item => item.id === productId);
        } catch (e) {
            return false;
        }
    }

    /**
     * Create cart item DOM element
     */
    createCartItemElement(item) {
        const el = document.createElement('div');
        const isOutOfStock = this.isOutOfStock(item.id);
        const isLiked = this.isInWishlist(item.id);
        el.className = 'cart-item' + (isOutOfStock ? ' out-of-stock-item' : '');
        el.dataset.productId = item.id; // Store product ID for navigation

        const colorDisplay = Object.keys(item.color || {}).find(k => item.color[k] === item.selectedColor) || item.selectedColor;
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
                <div class="cart-qty-wrapper">
                    <div class="cart-qty-group ${isOutOfStock ? 'frozen' : ''}">
                        <button class="qty-btn minus" data-id="${item.variantId}" ${isOutOfStock ? 'disabled' : ''}>-</button>
                        <input type="number" class="qty-display qty-input" value="${item.qty}" min="1" max="9999" data-id="${item.variantId}" ${isOutOfStock ? 'disabled' : ''}>
                        <button class="qty-btn plus" data-id="${item.variantId}" ${isOutOfStock ? 'disabled' : ''}>+</button>
                    </div>
                    ${isOutOfStock ? '<span class="dropdown-out-of-stock-label">Out of Stock</span>' : ''}
                </div>
                <div class="cart-action-btns">
                    <button class="cart-like-btn ${isLiked ? 'liked' : ''}" data-id="${item.variantId}" data-product-id="${item.id}" title="${isLiked ? 'Remove from wishlist' : 'Add to wishlist'}">
                        <img src="/201-project/images/icons/${isLiked ? 'red-heart' : 'heart'}.png" alt="Like" class="like-icon">
                    </button>
                    <button class="qty-btn delete" data-id="${item.variantId}" title="Remove from cart">Delete</button>
                </div>
            </div>
        </div>
    `;

        // Add double-click to navigate to product detail
        el.addEventListener('dblclick', (e) => {
            // Prevent navigation if clicking on buttons or inputs
            if (e.target.closest('.qty-btn') || e.target.closest('.qty-input') || e.target.closest('.delete') || e.target.closest('.cart-like-btn')) {
                return;
            }
            this.navigateToProductDetail(item.id);
        });

        // Add cursor style hint
        el.style.cursor = 'pointer';

        return el;
    }

    /**
     * Navigate to product detail page
     * @param {string} productId - Product ID
     */
    navigateToProductDetail(productId) {
        sessionStorage.setItem('productDetailId', productId);
        sessionStorage.setItem('productDetailSource', 'cart');
        window.location.href = '/201-project/product-detail.html';
    }

    /**
     * Bind quantity control event listeners
     */
    bindQuantityControls(container) {
        // Minus button handlers
        container.querySelectorAll('.minus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleDecreaseQuantity(btn.dataset.id);
            });
        });

        // Plus button handlers
        container.querySelectorAll('.plus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleIncreaseQuantity(btn.dataset.id);
            });
        });

        // Quantity input handlers
        container.querySelectorAll('.qty-input').forEach(input => {
            input.addEventListener('change', (e) => {
                e.stopPropagation();
                this.handleQuantityInputChange(input);
            });
        });

        // Like button handlers
        container.querySelectorAll('.cart-like-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleLikeToggle(btn);
            });
        });
    }

    /**
     * Handle like button toggle
     * @param {HTMLElement} btn - Like button element
     */
    handleLikeToggle(btn) {
        const productId = btn.dataset.productId;
        const item = this.cartManager.getCart().find(i => i.id === productId);
        if (!item) return;

        const isCurrentlyLiked = btn.classList.contains('liked');
        const icon = btn.querySelector('.like-icon');

        if (isCurrentlyLiked) {
            // Remove from wishlist
            this.removeFromWishlist(productId, item.name);
            btn.classList.remove('liked');
            icon.src = '/201-project/images/icons/heart.png';
            btn.title = 'Add to wishlist';
        } else {
            // Add to wishlist
            window.dispatchEvent(new CustomEvent('addToWishlist', {
                detail: { product: item }
            }));
            btn.classList.add('liked');
            icon.src = '/201-project/images/icons/red-heart.png';
            btn.title = 'Remove from wishlist';
        }

        // Play heart animation
        this.playHeartAnimation(btn);
    }

    /**
     * Remove product from wishlist
     * @param {string} productId - Product ID
     * @param {string} productName - Product name for notification
     */
    removeFromWishlist(productId, productName) {
        const storageKey = this.getWishlistStorageKey();
        const wishlistData = localStorage.getItem(storageKey);
        const wishlist = wishlistData ? JSON.parse(wishlistData) : [];
        const updatedWishlist = wishlist.filter(item => item.id !== productId);
        localStorage.setItem(storageKey, JSON.stringify(updatedWishlist));
        
        if (window.toast) {
            window.toast.info(`${productName} removed from wishlist`);
        }

        // Dispatch event for wishlist manager to sync
        window.dispatchEvent(new CustomEvent('wishlistUpdated'));
    }

    /**
     * Play heart animation on like button
     * @param {HTMLElement} btn - Like button element
     */
    playHeartAnimation(btn) {
        btn.classList.remove('heart-animate');
        void btn.offsetWidth; // Force reflow
        btn.classList.add('heart-animate');
        
        setTimeout(() => {
            btn.classList.remove('heart-animate');
        }, 300);
    }

    /**
     * Bind delete button event listeners
     */
    bindDeleteButtons(container) {
        container.querySelectorAll('.delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleDeleteItem(btn.dataset.id);
            });
        });
    }

    /**
     * Handle decrease quantity button click
     */
    handleDecreaseQuantity(variantId) {
        const item = this.cartManager.getCart().find(i => i.variantId === variantId);
        if (!item) return;

        // Check if out of stock using real-time data from repository
        if (window.productRepository) {
            const currentStock = window.productRepository.getStock(item.id);
            if (currentStock <= 0) {
                if (window.toast) {
                    window.toast.show('This product is currently out of stock. Please wait for restock.', 'warning');
                }
                return;
            }
        }

        const newQty = item.qty - 1;
        if (newQty < 1) {
            if (window.toast) {
                window.toast.show('Quantity cannot be less than 1', 'warning');
            }
            return;
        }

        this.cartManager.updateQuantity(variantId, -1, true); // Use silent mode
        this.render();
        this.updateBadge();
    }

    /**
     * Handle increase quantity button click
     */
    handleIncreaseQuantity(variantId) {
        const item = this.cartManager.getCart().find(i => i.variantId === variantId);
        if (!item) return;

        // Check if out of stock using real-time data from repository
        let maxQty = item.number_of_remain || 9999;
        if (window.productRepository) {
            const currentStock = window.productRepository.getStock(item.id);
            if (currentStock <= 0) {
                if (window.toast) {
                    window.toast.show('This product is currently out of stock. Please wait for restock.', 'warning');
                }
                return;
            }
            maxQty = currentStock;
        }

        const newQty = item.qty + 1;
        
        if (newQty > maxQty) {
            if (window.toast) {
                window.toast.show(`Maximum available quantity is ${maxQty}`, 'warning');
            }
            return;
        }

        this.cartManager.updateQuantity(variantId, 1, true); // Use silent mode
        this.render();
        this.updateBadge();
    }

    /**
     * Handle delete item button click
     */
    handleDeleteItem(variantId) {
        const item = this.cartManager.getCart().find(i => i.variantId === variantId);
        if (!item) return;

        // Use silent mode to prevent double notifications
        this.cartManager.removeProduct(variantId, true);

        // Show single success notification (consistent with cart page)
        if (window.toast) {
            window.toast.show(`${item.name} removed from cart`, 'success');
        }

        this.render();
        this.updateBadge();
    }

}

if (typeof window !== 'undefined') {
    window.CartDropdownRenderer = CartDropdownRenderer;
}

