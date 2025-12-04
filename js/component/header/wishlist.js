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
     * And syncs with product repository for data consistency
     */
    loadWishlist() {
        const stored = localStorage.getItem(this.getStorageKey());
        this.wishlist = stored ? JSON.parse(stored) : [];
        
        // Sync with repository for data consistency
        this.syncWithRepository();
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

        // Listen for product updates from manage page
        window.addEventListener('productUpdated', (e) => {
            this.handleProductUpdated(e.detail);
        });

        // Listen for product deletions from manage page
        window.addEventListener('productDeleted', (e) => {
            this.handleProductDeleted(e.detail);
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

    /**
     * Handle product updated event from ProductRepository
     * Syncs wishlist items with updated product data
     * @param {Object} detail - Event detail containing productId, oldProduct, newProduct
     */
    handleProductUpdated(detail) {
        const { productId, oldProduct, newProduct } = detail;
        
        if (!window.DataSyncUtils) {
            console.warn('DataSyncUtils not available for wishlist sync');
            return;
        }

        // Check if wishlist-relevant fields have changed using hash comparison
        if (!window.DataSyncUtils.hasWishlistFieldsChanged(oldProduct, newProduct)) {
            // No wishlist-relevant changes, skip update
            return;
        }

        let wishlistModified = false;
        const updatedItems = [];

        this.wishlist.forEach((item, index) => {
            if (item.id === productId && !item.is_deleted) {
                // Update item with new product data
                const updatedItem = window.DataSyncUtils.mergeWishlistItemWithProduct(item, newProduct);
                this.wishlist[index] = updatedItem;
                wishlistModified = true;
                updatedItems.push(item.name);
            }
        });

        if (wishlistModified) {
            this.saveWishlist();
            
            // Update UI
            if (this.dropdownRenderer) {
                this.dropdownRenderer.updateBadge();
                this.dropdownRenderer.render();
            }

            // Show notification
            setTimeout(() => {
                if (updatedItems.length > 0 && window.toast) {
                    window.toast.info(`Wishlist updated: ${updatedItems.join(', ')}`);
                }
            }, 100);
        }
    }

    /**
     * Handle product deleted event from ProductRepository
     * Marks wishlist items as logically deleted (frozen)
     * @param {Object} detail - Event detail containing productId, deletedProduct
     */
    handleProductDeleted(detail) {
        const { productId } = detail;
        
        let wishlistModified = false;
        const deletedItems = [];

        this.wishlist.forEach((item, index) => {
            if (item.id === productId && !item.is_deleted) {
                // Mark as logically deleted
                this.wishlist[index].is_deleted = true;
                this.wishlist[index].deletion_reason = 'product_deleted';
                wishlistModified = true;
                deletedItems.push(item.name);
            }
        });

        if (wishlistModified) {
            this.saveWishlist();
            
            // Update UI
            if (this.dropdownRenderer) {
                this.dropdownRenderer.updateBadge();
                this.dropdownRenderer.render();
            }

            // Show notification
            setTimeout(() => {
                if (deletedItems.length > 0 && window.toast) {
                    deletedItems.forEach(name => {
                        window.toast.warning(`"${name}" has been removed from store and frozen in your wishlist.`);
                    });
                }
            }, 100);
        }
    }

    /**
     * Sync wishlist data with ProductRepository on initialization
     * Uses hash comparison for efficient O(1) change detection
     * Called when user switches accounts or on page load
     */
    syncWithRepository() {
        if (!window.productRepository || !window.productRepository.dataLoaded || !window.DataSyncUtils) {
            return;
        }

        let wishlistModified = false;
        const updatedItems = [];
        const frozenItems = [];

        this.wishlist.forEach((item, index) => {
            // Skip already deleted items
            if (item.is_deleted) return;
            
            // Get current product from repository
            const currentProduct = window.productRepository.getById(item.id);
            
            if (!currentProduct) {
                // Product no longer exists, mark as deleted
                this.wishlist[index].is_deleted = true;
                this.wishlist[index].deletion_reason = 'product_deleted';
                wishlistModified = true;
                frozenItems.push({ name: item.name, reason: 'Product no longer available' });
                return;
            }
            
            // Check if wishlist-relevant fields have changed
            if (window.DataSyncUtils.hasWishlistFieldsChanged(item, currentProduct)) {
                // Update item with new product data
                const updatedItem = window.DataSyncUtils.mergeWishlistItemWithProduct(item, currentProduct);
                this.wishlist[index] = updatedItem;
                wishlistModified = true;
                updatedItems.push(item.name);
            }
        });

        if (wishlistModified) {
            this.saveWishlist();
            
            // Show notifications after a delay
            setTimeout(() => {
                if (updatedItems.length > 0 && window.toast) {
                    window.toast.info(`Wishlist synced: ${updatedItems.length} item(s) updated.`);
                }
                if (frozenItems.length > 0 && window.toast) {
                    frozenItems.forEach(item => {
                        window.toast.warning(`"${item.name}": ${item.reason}`);
                    });
                }
            }, 500);
        }

        console.log(`✓ Wishlist sync completed: ${updatedItems.length} updated, ${frozenItems.length} frozen`);
    }

    /**
     * Check if a wishlist item is frozen (logically deleted)
     * @param {Object} item - Wishlist item
     * @returns {boolean} True if item is frozen
     */
    isItemFrozen(item) {
        return item.is_deleted === true;
    }
}

if (typeof window !== 'undefined') {
    window.WishlistManager = WishlistManager;
}

