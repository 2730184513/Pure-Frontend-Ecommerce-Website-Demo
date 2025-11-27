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
     * Create popup DOM element
     * @returns {HTMLElement} Popup element
     * @private
     */
    createPopupElement() {
        const popup = document.createElement('div');
        popup.className = 'pop-up';

        popup.innerHTML = `
            <div class="overlay"></div>
            <div class="popup-actions">
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

        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', (e) => this.handleAddToCart(e));
        }

        if (shareBtn) {
            shareBtn.addEventListener('click', (e) => this.handleShare(e));
        }

        if (likeBtn) {
            likeBtn.addEventListener('click', (e) => this.handleLike(e));
        }
    }

    /**
     * Handle add to cart action
     * @param {Event} event - Click event
     * @private
     */
    handleAddToCart(event) {
        event.stopPropagation();

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

        // Dispatch custom event for wishlist management
        // The WishlistManager will handle user feedback
        window.dispatchEvent(new CustomEvent('addToWishlist', {
            detail: { product: this.product }
        }));
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

    /**
     * Get the popup element
     * @returns {HTMLElement|null}
     */
    getElement() {
        return this.element;
    }
}

if (typeof window !== 'undefined') {
    window.ProductPopup = ProductPopup;
}

