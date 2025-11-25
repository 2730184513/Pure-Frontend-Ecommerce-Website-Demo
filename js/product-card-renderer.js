/**
 * Product Card Renderer
 * Handles rendering of product cards
 * Uses ProductPopup for hover interactions
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

// Export
if (typeof window !== 'undefined') {
    window.ProductCardRenderer = ProductCardRenderer;
}

