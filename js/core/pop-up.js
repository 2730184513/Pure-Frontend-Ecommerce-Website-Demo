/**
 * Product Popup Manager
 * Handles the hover overlay and action buttons for product cards
 */
class ProductPopup {
    constructor(card, product) {
        this.card = card;
        this.product = product;
        this.element = null;
    }

    /**
     * Render the popup overlay
     */
    render() {
        if (this.card.querySelector('.pop-up')) {
            return;
        }

        this.element = this.createPopupElement();
        this.card.appendChild(this.element);
        this.attachEvents();
    }

    /**
     * Check if current user is admin
     * @returns {boolean} True if admin
     * @private
     */
    isCurrentUserAdmin() {
        if (window.AuthGuard) {
            const user = window.AuthGuard.getCurrentUser();
            return user && (user.isAdmin === true || user.email?.toLowerCase() === 'admin@admin.com');
        }
        return false;
    }

    /**
     * Create popup DOM element
     * @returns {HTMLElement} Popup element
     * @private
     */
    createPopupElement() {
        const popup = document.createElement('div');
        popup.className = 'pop-up';
        
        // Check if current user is admin
        const isAdmin = this.isCurrentUserAdmin();
        const modifyProductBtn = isAdmin 
            ? '<button class="btn-modify-product"><span class="modify-span">Modify Product</span></button>'
            : '';

        popup.innerHTML = `
            <div class="overlay"></div>
            <div class="popup-actions">
                ${modifyProductBtn}
                <button class="btn-add-cart">
                    <span class="addtocart-span">Add to cart</span>
                </button>
                <div class="action-links">
                    <div class="action-item action-share">
                        <div class="icon-share"></div>
                        <span>Share</span>
                    </div>
                    <div class="action-item action-like">
                        <div class="icon-like"></div>
                        <span>Like</span>
                    </div>
                </div>
            </div>
        `;

        return popup;
    }

    /**
     * Attach event listeners to popup actions
     * @private
     */
    attachEvents() {
        if (!this.element) return;

        const addToCartBtn = this.element.querySelector('.btn-add-cart');
        const shareBtn = this.element.querySelector('.action-share');
        const likeBtn = this.element.querySelector('.action-like');
        const modifyProductBtn = this.element.querySelector('.btn-modify-product');

        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', (e) => this.handleAddToCart(e));
        }

        if (shareBtn) {
            shareBtn.addEventListener('click', (e) => this.handleShare(e));
        }

        if (likeBtn) {
            likeBtn.addEventListener('click', (e) => this.handleLike(e));
        }

        if (modifyProductBtn) {
            modifyProductBtn.addEventListener('click', (e) => this.handleModifyProduct(e));
        }
    }

    /**
     * Handle add to cart action
     * @param {Event} event - Click event
     * @private
     */
    handleAddToCart(event) {
        event.stopPropagation();

        // Check login status
        if (window.AuthGuard && !window.AuthGuard.isLoggedIn()) {
            window.AuthGuard.requireLogin('add items to cart');
            return;
        }

        // Check if product is out of stock using real-time data from repository
        if (window.productRepository) {
            const currentStock = window.productRepository.getStock(this.product.id);
            if (currentStock <= 0) {
                if (window.toast) {
                    window.toast.warning('This product is currently out of stock. Please wait for restock.');
                }
                return;
            }
        }

        // Dispatch custom event for cart management
        // The CartManager will handle user feedback
        window.dispatchEvent(new CustomEvent('addToCart', {
            detail: { product: this.product }
        }));
    }

    /**
     * Handle share action
     * @param {Event} event - Click event
     * @private
     */
    handleShare(event) {
        event.stopPropagation();

        if (navigator.share) {
            navigator.share({
                title: this.product.name,
                text: `Check out ${this.product.name} - ${this.product.brief}`,
                url: window.location.href
            }).catch(() => {
                // Share cancelled - silent fail
            });
        } else {
            if (window.toast) {
                window.toast.info(`Share ${this.product.name} - Feature coming soon!`);
            }
        }
    }

    /**
     * Handle like action
     * @param {Event} event - Click event
     * @private
     */
    handleLike(event) {
        event.stopPropagation();

        // Check login status
        if (window.AuthGuard && !window.AuthGuard.isLoggedIn()) {
            window.AuthGuard.requireLogin('add items to wishlist');
            return;
        }

        // Dispatch custom event for wishlist management
        // The WishlistManager will handle user feedback
        window.dispatchEvent(new CustomEvent('addToWishlist', {
            detail: { product: this.product }
        }));
    }

    /**
     * Handle modify product action (Admin only)
     * @param {Event} event - Click event
     * @private
     */
    handleModifyProduct(event) {
        event.stopPropagation();

        // Dispatch custom event for product modification
        window.dispatchEvent(new CustomEvent('modifyProduct', {
            detail: { product: this.product }
        }));

        // TODO: Navigate to product edit page or open edit modal
        if (window.toast) {
            window.toast.info(`Modify Product: ${this.product.name} - Feature coming soon!`);
        }
    }

    /**
     * Destroy the popup
     */
    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        this.element = null;
    }
}

if (typeof window !== 'undefined') {
    window.ProductPopup = ProductPopup;
}

