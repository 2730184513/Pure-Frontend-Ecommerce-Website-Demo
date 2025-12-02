/**
 * Wishlist Manager
 * Handles wishlist business logic - data management, storage, and state
 * Wishlist data is isolated per user (by email)
 */
class WishlistManager {
    constructor() {
        this.wishlist = [];
        this.dropdownRenderer = null;
        this.isInitialized = false;
        this.STORAGE_KEY_PREFIX = 'furniro_wishlist_';
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

        this.loadWishlist();
        this.setupEventListeners();

        // Initialize dropdown renderer
        this.dropdownRenderer = new WishlistDropdownRenderer(this);
        this.dropdownRenderer.init();

        this.isInitialized = true;
    }

    /**
     * Load wishlist from localStorage (user-specific)
     */
    loadWishlist() {
        const stored = localStorage.getItem(this.getStorageKey());
        this.wishlist = stored ? JSON.parse(stored) : [];
    }

    /**
     * Reload wishlist for current user (call when user changes)
     */
    reloadForCurrentUser() {
        this.loadWishlist();
        if (this.dropdownRenderer) {
            this.dropdownRenderer.updateBadge();
            this.dropdownRenderer.render();
        }
    }

    /**
     * Setup global event listeners
     */
    setupEventListeners() {
        window.addEventListener('addToWishlist', (e) => {
            this.addProduct(e.detail.product);
        });

        // Listen for wishlist updates from other sources (e.g., product detail page)
        window.addEventListener('wishlistUpdated', () => {
            this.loadWishlist();
            if (this.dropdownRenderer) {
                this.dropdownRenderer.updateBadge();
                this.dropdownRenderer.render();
            }
        });

        // Listen for user state changes to reload wishlist
        window.addEventListener('userStateChanged', () => {
            this.reloadForCurrentUser();
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
            window.toast.error('This item is already in your wishlist!');
            return false;
        }

        this.wishlist.push(product);
        this.saveWishlist();
        window.toast.success(`${product.name} added to wishlist!`);

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
     * Save wishlist to localStorage (user-specific)
     */
    saveWishlist() {
        localStorage.setItem(this.getStorageKey(), JSON.stringify(this.wishlist));
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
}

if (typeof window !== 'undefined') {
    window.WishlistManager = WishlistManager;
}

