/**
 * Wishlist Manager
 * Handles wishlist content management and dropdown interactions
 */
class WishlistManager {
    constructor() {
        this.wishlist = [];
        this.icon = null;
        this.dropdown = null;
        this.hoverTimer = null;
        this.hoverDelay = 500; // 0.5s hover delay
        this.isInitialized = false;
    }

    init() {
        if (this.isInitialized) return;

        this.loadWishlist();
        this.cacheDOM();
        this.createDropdown();
        this.bindEvents();
        this.setupEventListeners();

        this.isInitialized = true;
    }

    /**
     * Load wishlist from localStorage
     */
    loadWishlist() {
        const stored = localStorage.getItem('furniro_wishlist');
        this.wishlist = stored ? JSON.parse(stored) : [];
    }

    /**
     * Cache DOM elements
     */
    cacheDOM() {
        this.icon = document.querySelector('#icon-wishlist');
        this.dropdown = document.getElementById('wishlist-dropdown');
    }

    /**
     * Create dropdown structure if not exists
     */
    createDropdown() {
        if (!this.dropdown) {
            const headerContainer = document.querySelector('.header-container');
            if (headerContainer) {
                const wishDrop = document.createElement('div');
                wishDrop.id = 'wishlist-dropdown';
                wishDrop.className = 'header-dropdown wishlist-dropdown';
                wishDrop.innerHTML = '<div class="wishlist-items"></div>';
                headerContainer.appendChild(wishDrop);
                this.dropdown = wishDrop;
            }
        }
    }

    /**
     * Bind event listeners for hover and click
     */
    bindEvents() {
        if (!this.icon || !this.dropdown) {
            console.warn('Wishlist elements not found');
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
        window.addEventListener('addToWishlist', (e) => {
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
     * Close other dropdowns (cart, etc)
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
     * Add product to wishlist
     * @param {Object} product - Product to add
     * @returns {boolean} Success status
     */
    addProduct(product) {
        // Check for duplicates
        if (this.wishlist.some(i => i.id === product.id)) {
            this.showNotification('This item is already in your wishlist!', 'error');
            return false;
        }

        this.wishlist.push(product);
        this.saveWishlist();
        this.showDropdown();
        this.showNotification(`${product.name} added to wishlist!`, 'success');
        return true;
    }

    /**
     * Remove product from wishlist
     * @param {string} productId - Product ID to remove
     */
    removeProduct(productId) {
        this.wishlist = this.wishlist.filter(i => i.id !== productId);
        this.saveWishlist();
        this.render();
    }

    /**
     * Clear all wishlist items
     */
    clearWishlist() {
        this.wishlist = [];
        this.saveWishlist();
        this.render();
    }

    /**
     * Save wishlist to localStorage
     */
    saveWishlist() {
        localStorage.setItem('furniro_wishlist', JSON.stringify(this.wishlist));
    }

    /**
     * Render wishlist items
     */
    render() {
        const container = this.dropdown.querySelector('.wishlist-items');
        if (!container) return;

        container.innerHTML = '';

        if (this.wishlist.length === 0) {
            container.innerHTML = '<p style="text-align:center;padding:20px;color:#9F9F9F">Wishlist is empty</p>';
            return;
        }

        this.wishlist.forEach(item => {
            const el = document.createElement('div');
            el.className = 'wishlist-item';
            el.innerHTML = `
                <img src="${item.product_picture}" 
                     class="wishlist-item-img" 
                     alt="${item.name}"
                     onerror="this.src='images/products/placeholder.jpg'">
                <div class="cart-item-info">
                    <span class="cart-item-title">${item.name}</span>
                    <span class="cart-item-variant" style="font-size:12px">${item.brief.substring(0, 30)}...</span>
                </div>
                <button class="remove-wish-btn" 
                        data-id="${item.id}" 
                        style="border:none;background:transparent;cursor:pointer;font-size:16px;">✕</button>
            `;
            container.appendChild(el);
        });

        // Bind remove buttons
        container.querySelectorAll('.remove-wish-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeProduct(btn.dataset.id);
            });
        });
    }

    /**
     * Get wishlist items
     * @returns {Array} Wishlist items
     */
    getWishlist() {
        return [...this.wishlist];
    }

    /**
     * Get wishlist count
     * @returns {number} Number of items in wishlist
     */
    getCount() {
        return this.wishlist.length;
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
    window.WishlistManager = WishlistManager;
}

