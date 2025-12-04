/**
 * Data Sync Utilities
 * Provides hash comparison utilities for Cart and Wishlist synchronization
 * Uses djb2 hash algorithm for O(1) data change detection
 */

const DataSyncUtils = {
    /**
     * Fields to compare for Cart synchronization
     * Only these fields trigger cart updates when changed
     */
    CART_SYNC_FIELDS: ['name', 'price', 'discount', 'size', 'color', 'product_picture'],
    
    /**
     * Fields to compare for Wishlist synchronization
     * Only these fields trigger wishlist updates when changed
     */
    WISHLIST_SYNC_FIELDS: ['name', 'brief', 'product_picture'],

    /**
     * Simple djb2 hash function for string hashing
     * Provides O(1) comparison capability
     * @param {string} str - String to hash
     * @returns {number} Hash value
     */
    djb2Hash(str) {
        let hash = 5381;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) + hash) + str.charCodeAt(i);
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash >>> 0; // Convert to unsigned
    },

    /**
     * Extract relevant fields from product for Cart comparison
     * @param {Object} product - Product object
     * @returns {Object} Object containing only cart-relevant fields
     */
    extractCartFields(product) {
        if (!product) return null;
        return {
            name: product.name,
            price: product.price,
            discount: product.discount,
            size: product.size,
            color: product.color,
            product_picture: product.product_picture
        };
    },

    /**
     * Extract relevant fields from product for Wishlist comparison
     * @param {Object} product - Product object
     * @returns {Object} Object containing only wishlist-relevant fields
     */
    extractWishlistFields(product) {
        if (!product) return null;
        return {
            name: product.name,
            brief: product.brief,
            product_picture: product.product_picture
        };
    },

    /**
     * Generate hash for Cart-relevant product fields
     * @param {Object} product - Product object
     * @returns {number} Hash value
     */
    generateCartHash(product) {
        const fields = this.extractCartFields(product);
        if (!fields) return 0;
        const json = JSON.stringify(fields);
        return this.djb2Hash(json);
    },

    /**
     * Generate hash for Wishlist-relevant product fields
     * @param {Object} product - Product object
     * @returns {number} Hash value
     */
    generateWishlistHash(product) {
        const fields = this.extractWishlistFields(product);
        if (!fields) return 0;
        const json = JSON.stringify(fields);
        return this.djb2Hash(json);
    },

    /**
     * Check if Cart-relevant fields have changed between two products
     * @param {Object} oldProduct - Old product data
     * @param {Object} newProduct - New product data
     * @returns {boolean} True if cart-relevant fields have changed
     */
    hasCartFieldsChanged(oldProduct, newProduct) {
        return this.generateCartHash(oldProduct) !== this.generateCartHash(newProduct);
    },

    /**
     * Check if Wishlist-relevant fields have changed between two products
     * @param {Object} oldProduct - Old product data
     * @param {Object} newProduct - New product data
     * @returns {boolean} True if wishlist-relevant fields have changed
     */
    hasWishlistFieldsChanged(oldProduct, newProduct) {
        return this.generateWishlistHash(oldProduct) !== this.generateWishlistHash(newProduct);
    },

    /**
     * Check if selected size still exists in product size options
     * @param {string} selectedSize - Currently selected size (key name like "Standard")
     * @param {Object} sizeOptions - Product size options object {sizeName: dimensions}
     * @returns {boolean} True if size still exists
     */
    isSizeValid(selectedSize, sizeOptions) {
        if (!sizeOptions || typeof sizeOptions !== 'object') return false;
        return Object.keys(sizeOptions).includes(selectedSize);
    },

    /**
     * Check if selected color still exists in product color options
     * Note: selectedColor stores the color NAME (key), not the hex value
     * @param {string} selectedColor - Currently selected color NAME (key like "Navy Blue")
     * @param {Object} colorOptions - Product color options object {colorName: hexValue}
     * @returns {boolean} True if color still exists
     */
    isColorValid(selectedColor, colorOptions) {
        if (!colorOptions || typeof colorOptions !== 'object') return false;
        // selectedColor is the color NAME (key), not the hex value
        return Object.keys(colorOptions).includes(selectedColor);
    },

    /**
     * Validate cart item's selected options against updated product
     * @param {Object} cartItem - Cart item with selectedSize and selectedColor
     * @param {Object} updatedProduct - Updated product data
     * @returns {{sizeValid: boolean, colorValid: boolean, bothValid: boolean}}
     */
    validateCartItemOptions(cartItem, updatedProduct) {
        const sizeValid = this.isSizeValid(cartItem.selectedSize, updatedProduct.size);
        const colorValid = this.isColorValid(cartItem.selectedColor, updatedProduct.color);
        return {
            sizeValid,
            colorValid,
            bothValid: sizeValid && colorValid
        };
    },

    /**
     * Update cart item with new product data while preserving cart-specific fields
     * @param {Object} cartItem - Existing cart item
     * @param {Object} newProductData - New product data from repository
     * @returns {Object} Updated cart item
     */
    mergeCartItemWithProduct(cartItem, newProductData) {
        // Preserve cart-specific fields
        const cartSpecificFields = {
            variantId: cartItem.variantId,
            selectedSize: cartItem.selectedSize,
            selectedColor: cartItem.selectedColor,
            qty: cartItem.qty,
            is_deleted: cartItem.is_deleted
        };

        // Merge new product data with preserved cart fields
        return {
            ...newProductData,
            ...cartSpecificFields
        };
    },

    /**
     * Update wishlist item with new product data while preserving wishlist-specific fields
     * @param {Object} wishlistItem - Existing wishlist item
     * @param {Object} newProductData - New product data from repository
     * @returns {Object} Updated wishlist item
     */
    mergeWishlistItemWithProduct(wishlistItem, newProductData) {
        // Preserve wishlist-specific fields (if any)
        const wishlistSpecificFields = {
            is_deleted: wishlistItem.is_deleted
        };

        // Merge new product data with preserved wishlist fields
        return {
            ...newProductData,
            ...wishlistSpecificFields
        };
    }
};

// Export to window
if (typeof window !== 'undefined') {
    window.DataSyncUtils = DataSyncUtils;
}
