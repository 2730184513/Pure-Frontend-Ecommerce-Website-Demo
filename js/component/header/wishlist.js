/**
 * Wishlist Manager
 * Handles wishlist business logic - data management, storage, and state
 */
class WishlistManager {
    constructor() {
        this.wishlist = [];
        this.dropdownRenderer = null;
        this.isInitialized = false;
    }

    init() {
        if (this.isInitialized) return;

        this.loadWishlist();
        this.setupEventListeners();

        // Initialize dropdown renderer
        this.dropdownRenderer = new WishlistDropdownRenderer(this);
        this.dropdownRenderer.init();

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
     * Setup global event listeners
     */
    setupEventListeners() {
        window.addEventListener('addToWishlist', (e) => {
            this.addProduct(e.detail.product);
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
        this.showNotification(`${product.name} added to wishlist!`, 'success');

        // Update renderer and play animation
        if (this.dropdownRenderer) {
            this.dropdownRenderer.updateBadge();
            this.dropdownRenderer.playIconAnimation();
        }

        return true;
    }

    /**
     * Remove product from wishlist
     * @param {string} productId - Product ID to remove
     */
    removeProduct(productId) {
        this.wishlist = this.wishlist.filter(i => i.id !== productId);
        this.saveWishlist();
    }
    /**
     * Save wishlist to localStorage
     */
    saveWishlist() {
        localStorage.setItem('furniro_wishlist', JSON.stringify(this.wishlist));
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
        if (window.toast) {
            window.toast.show(message, type);
        } else {
            console.warn('Toast manager not available');
        }
    }
}

if (typeof window !== 'undefined') {
    window.WishlistManager = WishlistManager;
}

