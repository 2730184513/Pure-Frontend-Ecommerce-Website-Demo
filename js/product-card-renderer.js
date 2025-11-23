/**
 * Product Card Renderer
 * Handles rendering of product cards and their interactions
 * Incorporates hover/popup functionality
 */

class ProductCardRenderer {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        this.popups = new Map();

        if (!this.container) {
            console.error(`Container not found: ${containerSelector}`);
        }
    }

    /**
     * Render a single product card
     * @param {Object} product - Product data
     * @returns {HTMLElement} Product card element
     */
    renderCard(product) {
        const article = document.createElement('article');
        article.className = 'product-card';
        article.dataset.productId = product.id;

        // Product image section
        const imageDiv = document.createElement('div');
        imageDiv.className = 'product-image';

        const img = document.createElement('img');
        img.src = product.product_picture;
        img.alt = product.name;
        img.onerror = () => {
            img.src = '/201-project/images/products/placeholder.jpg';
        };
        imageDiv.appendChild(img);

        // Add badges (discount and/or new)
        const hasDiscount = product.discount && product.discount !== '0';
        const isNew = this.isNewProduct(product.launch_time);

        if (hasDiscount || isNew) {
            const badgeContainer = document.createElement('div');
            badgeContainer.className = 'badge-container';

            // Add discount badge first (top)
            if (hasDiscount) {
                const discountBadge = document.createElement('span');
                discountBadge.className = 'badge badge-discount';
                discountBadge.textContent = product.discount;
                badgeContainer.appendChild(discountBadge);
            }

            // Add new badge second (bottom)
            if (isNew) {
                const newBadge = document.createElement('span');
                newBadge.className = 'badge badge-new';
                newBadge.textContent = 'New';
                badgeContainer.appendChild(newBadge);
            }

            imageDiv.appendChild(badgeContainer);
        }

        article.appendChild(imageDiv);

        // Product info section
        const infoDiv = document.createElement('div');
        infoDiv.className = 'product-info';

        const nameSpan = document.createElement('span');
        nameSpan.className = 'product-name';
        nameSpan.textContent = product.name;
        infoDiv.appendChild(nameSpan);

        const descSpan = document.createElement('span');
        descSpan.className = 'product-desc';
        descSpan.textContent = product.brief;
        infoDiv.appendChild(descSpan);

        // Price section
        const priceBox = document.createElement('div');
        priceBox.className = 'price-box';

        const currentPrice = this.calculateDiscountedPrice(product.price, product.discount);
        const currentPriceSpan = document.createElement('span');
        currentPriceSpan.className = 'current-price';
        currentPriceSpan.textContent = this.formatPrice(currentPrice);
        priceBox.appendChild(currentPriceSpan);

        // Show old price if discounted
        if (product.discount && product.discount !== '0') {
            const oldPriceSpan = document.createElement('span');
            oldPriceSpan.className = 'old-price';
            oldPriceSpan.textContent = this.formatPrice(product.price);
            priceBox.appendChild(oldPriceSpan);
        }

        infoDiv.appendChild(priceBox);
        article.appendChild(infoDiv);

        // Add hover popup
        this.attachPopup(article, product);

        return article;
    }

    /**
     * Render multiple products
     * @param {Array} products - Array of product data
     * @param {boolean} clearContainer - Whether to clear container first
     */
    renderCards(products, clearContainer = true) {
        if (!this.container) {
            console.error('Container not available');
            return;
        }

        if (clearContainer) {
            this.container.innerHTML = '';
            this.popups.clear();
        }

        products.forEach(product => {
            const card = this.renderCard(product);
            this.container.appendChild(card);
        });

        console.log(`✓ Rendered ${products.length} product cards`);
    }

    /**
     * Append products without clearing existing ones
     * @param {Array} products - Array of product data
     */
    appendCards(products) {
        this.renderCards(products, false);
    }

    /**
     * Attach popup/hover functionality to a card
     * @param {HTMLElement} card - Product card element
     * @param {Object} product - Product data
     * @private
     */
    attachPopup(card, product) {
        const popup = new ProductPopup(card, product);
        popup.render();
        this.popups.set(product.id, popup);
    }

    /**
     * Calculate discounted price
     * @param {number} price - Original price
     * @param {string} discount - Discount string (e.g., "-30%")
     * @returns {number} Discounted price
     * @private
     */
    calculateDiscountedPrice(price, discount) {
        if (!discount) return price;

        const match = discount.match(/-?(\d+)%/);
        if (match) {
            const discountPercent = parseInt(match[1]);
            return Math.round(price * (1 - discountPercent / 100));
        }

        return price;
    }

    /**
     * Format price in Malaysian Ringgit
     * @param {number} price - Price value
     * @returns {string} Formatted price string
     * @private
     */
    formatPrice(price) {
        // Format with comma as thousand separator
        const formattedNumber = price.toLocaleString('en-MY');
        return `RM ${formattedNumber}`;
    }

    /**
     * Check if product is new (launched within 6 months)
     * @param {string} launchTime - Launch date string (DD-MM-YYYY)
     * @returns {boolean} Whether product is new
     * @private
     */
    isNewProduct(launchTime) {
        if (!launchTime) return false;

        try {
            const [day, month, year] = launchTime.split('-');
            const launchDate = new Date(`${year}-${month}-${day}`);
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

            return launchDate >= sixMonthsAgo;
        } catch (error) {
            return false;
        }
    }

    /**
     * Clear all rendered cards
     */
    clear() {
        if (this.container) {
            this.container.innerHTML = '';
        }
        this.popups.forEach(popup => popup.destroy());
        this.popups.clear();
    }

    /**
     * Get container element
     * @returns {HTMLElement|null} Container element
     */
    getContainer() {
        return this.container;
    }
}

/**
 * Product Popup
 * Handles the hover overlay and actions for a product card
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
                    <div class="action-item action-compare">
                        <div class="icon-compare"></div>
                        <span>Compare</span>
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
        const compareBtn = this.element.querySelector('.action-compare');
        const likeBtn = this.element.querySelector('.action-like');

        addToCartBtn?.addEventListener('click', (e) => this.handleAddToCart(e));
        shareBtn?.addEventListener('click', (e) => this.handleShare(e));
        compareBtn?.addEventListener('click', (e) => this.handleCompare(e));
        likeBtn?.addEventListener('click', (e) => this.handleLike(e));
    }

    /**
     * Handle add to cart action
     * @param {Event} event - Click event
     * @private
     */
    handleAddToCart(event) {
        event.stopPropagation();
        console.log(`[Cart] Added: ${this.product.name} (ID: ${this.product.id})`);

        // Dispatch custom event for cart management
        window.dispatchEvent(new CustomEvent('addToCart', {
            detail: { product: this.product }
        }));

        alert(`${this.product.name} has been added to your cart!`);
    }

    /**
     * Handle share action
     * @param {Event} event - Click event
     * @private
     */
    handleShare(event) {
        event.stopPropagation();
        console.log(`[Share] Product: ${this.product.name}`);

        if (navigator.share) {
            navigator.share({
                title: this.product.name,
                text: `Check out ${this.product.name} - ${this.product.brief}`,
                url: window.location.href
            }).catch(err => console.log('Share cancelled'));
        } else {
            alert(`Share ${this.product.name} - Feature coming soon!`);
        }
    }

    /**
     * Handle compare action
     * @param {Event} event - Click event
     * @private
     */
    handleCompare(event) {
        event.stopPropagation();
        console.log(`[Compare] Product: ${this.product.name}`);

        // Dispatch custom event for comparison management
        window.dispatchEvent(new CustomEvent('addToCompare', {
            detail: { product: this.product }
        }));

        alert(`${this.product.name} added to comparison!`);
    }

    /**
     * Handle like action
     * @param {Event} event - Click event
     * @private
     */
    handleLike(event) {
        event.stopPropagation();
        console.log(`[Like] Product: ${this.product.name}`);

        // Dispatch custom event for wishlist management
        window.dispatchEvent(new CustomEvent('addToWishlist', {
            detail: { product: this.product }
        }));

        alert(`You liked ${this.product.name}!`);
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

// Export
if (typeof window !== 'undefined') {
    window.ProductCardRenderer = ProductCardRenderer;
    window.ProductPopup = ProductPopup;
}

