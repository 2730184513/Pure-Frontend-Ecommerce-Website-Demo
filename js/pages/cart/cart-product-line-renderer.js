/**
 * Cart Product Line Renderer
 * Handles rendering of individual cart product rows
 */
class CartProductLineRenderer {
    constructor(cartManager) {
        this.cartManager = cartManager;
    }

    /**
     * Get current stock for a product from ProductRepository
     * @param {string} productId - Product ID
     * @returns {number} Current stock quantity
     * @private
     */
    getCurrentStock(productId) {
        if (window.productRepository) {
            return window.productRepository.getStock(productId);
        }
        return 9999; // Fallback
    }

    /**
     * Check if product is out of stock
     * @param {string} productId - Product ID
     * @returns {boolean}
     * @private
     */
    isOutOfStock(productId) {
        return this.getCurrentStock(productId) <= 0;
    }

    /**
     * Render all cart items to a container
     * @param {HTMLElement} container - Target container
     * @param {Array} cartItems - Cart items from CartManager
     */
    renderAll(container) {
        if (!container) {
            console.error('Container not found');
            return;
        }

        // Save current checkbox states before re-rendering
        const checkboxStates = {};
        const existingCheckboxes = container.querySelectorAll('.item-checkbox');
        existingCheckboxes.forEach(checkbox => {
            checkboxStates[checkbox.dataset.variantId] = checkbox.checked;
        });

        const cartItems = this.cartManager.getCart();
        container.innerHTML = '';

        if (cartItems.length === 0) {
            container.innerHTML = '<p style="text-align:center;padding:20px;color:#9F9F9F">Your cart is empty</p>';
            return;
        }

        cartItems.forEach((item, index) => {
            const lineElement = this.createProductLine(item, index);
            container.appendChild(lineElement);

            // Restore checkbox state
            const checkbox = lineElement.querySelector('.item-checkbox');
            if (checkbox && checkboxStates[item.variantId] !== undefined) {
                checkbox.checked = checkboxStates[item.variantId];
            }
        });
    }

    /**
     * Create a single product line element
     * @param {Object} item - Cart item
     * @param {number} index - Item index
     * @returns {HTMLElement} Product line element
     */
    createProductLine(item, index) {
        const cartItem = document.createElement('div');
        const isOutOfStock = this.isOutOfStock(item.id);
        cartItem.className = 'cart-item' + (isOutOfStock ? ' out-of-stock-item' : '');
        cartItem.dataset.variantId = item.variantId;
        cartItem.dataset.productId = item.id; // Store product ID for navigation

        // Get color display name
        const colorDisplay = Object.keys(item.color || {}).find(k => item.color[k] === item.selectedColor) || item.selectedColor;

        cartItem.innerHTML = `
            <div class="checkbox-container">
                <input type="checkbox" id="item${index}" class="item-checkbox" data-variant-id="${item.variantId}" ${isOutOfStock ? 'disabled' : ''}>
                <label for="item${index}" class="custom-checkbox ${isOutOfStock ? 'disabled' : ''}"></label>
            </div>
            
            <div class="product-image-container">
                <img src="${item.product_picture}" 
                     class="product-image" 
                     alt="${item.name}"
                     onerror="this.src='images/products/placeholder.jpg'">
                <div class="image-zoom">
                    <img src="${item.product_picture}" alt="${item.name}">
                </div>
            </div>
            
            <div class="product-info">
                <div class="product-title">${item.name}</div>
                <div class="product-variant">${item.selectedSize} / ${colorDisplay}</div>
                <div class="product-warranty">2 year warranty</div>
            </div>
            
            <div class="price-section">
                <div class="current-price" data-price="${item.price}">RM ${item.price.toLocaleString()}</div>
                <div class="original-price" data-original="${item.price * 1.2}">RM ${(item.price * 1.2).toLocaleString()}</div>
            </div>
            
            <div class="quantity-controls-wrapper">
                <div class="quantity-controls ${isOutOfStock ? 'frozen' : ''}">
                    <button class="quantity-btn decrease" ${isOutOfStock ? 'disabled' : ''}>-</button>
                    <input type="number" class="quantity-input" value="${item.qty}" min="1" max="9999" data-variant-id="${item.variantId}" ${isOutOfStock ? 'disabled' : ''}>
                    <button class="quantity-btn increase" ${isOutOfStock ? 'disabled' : ''}>+</button>
                </div>
                ${isOutOfStock ? '<span class="out-of-stock-label">Out of Stock</span>' : ''}
            </div>
            
            <div class="actions">
                <a href="#" class="action-link wishlist-link" data-variant-id="${item.variantId}">Add to wishlist</a>
                <a href="#" class="action-link delete-link" data-variant-id="${item.variantId}">Delete</a>
            </div>
        `;

        this.attachEventListeners(cartItem, item);

        return cartItem;
    }

    /**
     * Attach event listeners to a product line
     * @param {HTMLElement} cartItem - Cart item element
     * @param {Object} item - Cart item data
     */
    attachEventListeners(cartItem, item) {
        // Double-click to navigate to product detail
        cartItem.addEventListener('dblclick', (e) => {
            // Prevent navigation if clicking on interactive elements
            if (e.target.closest('.checkbox-container') || 
                e.target.closest('.quantity-controls') || 
                e.target.closest('.actions')) {
                return;
            }
            this.navigateToProductDetail(item.id);
        });

        // Add cursor style hint for product info area
        const productInfo = cartItem.querySelector('.product-info');
        const productImage = cartItem.querySelector('.product-image-container');
        if (productInfo) productInfo.style.cursor = 'pointer';
        if (productImage) productImage.style.cursor = 'pointer';

        // Quantity controls
        const decreaseBtn = cartItem.querySelector('.quantity-btn.decrease');
        const increaseBtn = cartItem.querySelector('.quantity-btn.increase');
        const quantityInput = cartItem.querySelector('.quantity-input');

        decreaseBtn.addEventListener('click', () => {
            // Check if out of stock
            if (this.isOutOfStock(item.id)) {
                if (window.toast) {
                    window.toast.show('This product is currently out of stock. Please wait for restock.', 'warning');
                }
                return;
            }

            const currentQty = parseInt(quantityInput.value) || item.qty;
            if (currentQty <= 1) {
                if (window.toast) {
                    window.toast.show('Quantity cannot be less than 1', 'warning');
                }
                return;
            }
            this.handleQuantityChange(item.variantId, -1);
        });

        increaseBtn.addEventListener('click', () => {
            // Check if out of stock
            if (this.isOutOfStock(item.id)) {
                if (window.toast) {
                    window.toast.show('This product is currently out of stock. Please wait for restock.', 'warning');
                }
                return;
            }

            const currentQty = parseInt(quantityInput.value) || item.qty;
            // Use real-time stock as max limit
            const maxQty = this.getCurrentStock(item.id);
            if (currentQty >= maxQty) {
                if (window.toast) {
                    window.toast.show(`Maximum available quantity is ${maxQty}`, 'warning');
                }
                return;
            }
            this.handleQuantityChange(item.variantId, 1);
        });

        // Bind quantity input field
        quantityInput.addEventListener('change', () => {
            this.handleQuantityInputChange(quantityInput, item.variantId);
        });

        quantityInput.addEventListener('blur', () => {
            this.handleQuantityInputChange(quantityInput, item.variantId);
        });

        // Checkbox change
        const checkbox = cartItem.querySelector('.item-checkbox');
        checkbox.addEventListener('change', () => {
            window.dispatchEvent(new CustomEvent('cartCheckboxChanged'));
        });

        // Wishlist button
        const wishlistBtn = cartItem.querySelector('.wishlist-link');
        wishlistBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleAddToWishlist(item);
        });

        // Delete button
        const deleteBtn = cartItem.querySelector('.delete-link');
        deleteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleDelete(item.variantId);
        });
    }

    /**
     * Handle quantity change
     * @param {string} variantId - Variant ID
     * @param {number} delta - Change amount (+1 or -1)
     */
    handleQuantityChange(variantId, delta) {
        this.cartManager.updateQuantity(variantId, delta);

        // Trigger re-render
        window.dispatchEvent(new CustomEvent('cartUpdated'));
    }

    /**
     * Handle quantity input field changes with validation
     * @param {HTMLInputElement} input - The quantity input field
     * @param {string} variantId - The variant ID
     */
    handleQuantityInputChange(input, variantId) {
        const item = this.cartManager.getCart().find(i => i.variantId === variantId);
        if (!item) return;

        // Check if out of stock
        if (this.isOutOfStock(item.id)) {
            if (window.toast) {
                window.toast.show('This product is currently out of stock. Please wait for restock.', 'warning');
            }
            input.value = item.qty; // Reset to current value
            return;
        }

        // Use real-time stock as max limit
        const maxQty = this.getCurrentStock(item.id);
        let value = parseInt(input.value);

        // Validate input
        if (isNaN(value) || value < 1) {
            if (window.toast) {
                window.toast.show('Quantity cannot be less than 1. Setting to minimum value.', 'warning');
            }
            value = 1;
            input.value = value;
        } else if (value > maxQty) {
            if (window.toast) {
                window.toast.show(`Maximum available quantity is ${maxQty}. Setting to maximum value.`, 'warning');
            }
            value = maxQty;
            input.value = value;
        }

        // Update quantity
        const delta = value - item.qty;
        if (delta !== 0) {
            this.cartManager.updateQuantity(variantId, delta);
            // Trigger re-render
            window.dispatchEvent(new CustomEvent('cartUpdated'));
        }
    }

    /**
     * Handle add to wishlist
     * @param {Object} item - Cart item
     */
    handleAddToWishlist(item) {
        // Dispatch event for wishlist manager
        window.dispatchEvent(new CustomEvent('addToWishlist', {
            detail: { product: item }
        }));
    }

    /**
     * Handle delete item
     * @param {string} variantId - Variant ID to delete
     */
    handleDelete(variantId) {
        const item = this.cartManager.getCart().find(i => i.variantId === variantId);

        // Use silent mode to prevent duplicate notifications
        this.cartManager.removeProduct(variantId, true);

        // Show single success notification only
        if (window.toast && item) {
            window.toast.show(`${item.name} removed from cart`, 'success');
        }

        // Trigger re-render
        window.dispatchEvent(new CustomEvent('cartUpdated'));
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
}

if (typeof window !== 'undefined') {
    window.CartProductLineRenderer = CartProductLineRenderer;
}

