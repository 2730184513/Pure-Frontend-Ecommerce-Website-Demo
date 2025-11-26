/**
 * Cart Product Line Renderer
 * Handles rendering of individual cart product rows
 */
class CartProductLineRenderer {
    constructor(cartManager) {
        this.cartManager = cartManager;
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

        const cartItems = this.cartManager.getCart();
        container.innerHTML = '';

        if (cartItems.length === 0) {
            container.innerHTML = '<p style="text-align:center;padding:20px;color:#9F9F9F">Your cart is empty</p>';
            return;
        }

        cartItems.forEach((item, index) => {
            const lineElement = this.createProductLine(item, index);
            container.appendChild(lineElement);
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
        cartItem.className = 'cart-item';
        cartItem.dataset.variantId = item.variantId;

        // Get color display name
        const colorDisplay = Object.keys(item.color || {}).find(k => item.color[k] === item.selectedColor) || item.selectedColor;

        cartItem.innerHTML = `
            <div class="checkbox-container">
                <input type="checkbox" id="item${index}" class="item-checkbox" data-variant-id="${item.variantId}">
                <label for="item${index}" class="custom-checkbox"></label>
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
                <div class="product-warranty">1 year warranty</div>
            </div>
            
            <div class="price-section">
                <div class="current-price" data-price="${item.price}">RM ${item.price.toLocaleString()}</div>
                <div class="original-price" data-original="${item.price * 1.2}">RM ${(item.price * 1.2).toLocaleString()}</div>
            </div>
            
            <div class="quantity-controls">
                <button class="quantity-btn decrease" ${item.qty === 1 ? 'disabled' : ''}>-</button>
                <input type="number" class="quantity-input" value="${item.qty}" min="1" readonly>
                <button class="quantity-btn increase">+</button>
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
        // Quantity controls
        const decreaseBtn = cartItem.querySelector('.quantity-btn.decrease');
        const increaseBtn = cartItem.querySelector('.quantity-btn.increase');
        const quantityInput = cartItem.querySelector('.quantity-input');

        decreaseBtn.addEventListener('click', () => {
            this.handleQuantityChange(item.variantId, -1);
        });

        increaseBtn.addEventListener('click', () => {
            this.handleQuantityChange(item.variantId, 1);
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
        // Show confirmation with toast
        if (window.toast) {
            window.toast.show('Item removed from cart', 'success');
        }

        this.cartManager.removeProduct(variantId);

        // Trigger re-render
        window.dispatchEvent(new CustomEvent('cartUpdated'));
    }
}

if (typeof window !== 'undefined') {
    window.CartProductLineRenderer = CartProductLineRenderer;
}

