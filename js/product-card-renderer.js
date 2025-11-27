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
    /**
     * Render a single product card
     * @param {Object} product - Product data
     * @returns {HTMLElement} Product card element
     */
    renderCard(product) {
        const article = document.createElement('article');
        article.className = 'product-card';
        article.dataset.productId = product.id;

        // Compose card from independent sections
        article.appendChild(this.createImageSection(product));
        article.appendChild(this.createInfoSection(product));

        // Attach interactive behavior
        this.attachPopup(article, product);

        return article;
    }

    /**
     * Create product image section with badges
     * @param {Object} product - Product data
     * @returns {HTMLElement} Image section element
     */
    createImageSection(product) {
        const imageDiv = document.createElement('div');
        imageDiv.className = 'product-image';

        const img = this.createProductImage(product);
        imageDiv.appendChild(img);

        const badges = this.createBadges(product);
        if (badges) {
            imageDiv.appendChild(badges);
        }

        return imageDiv;
    }

    /**
     * Create product image element with error handling
     * @param {Object} product - Product data
     * @returns {HTMLImageElement} Image element
     */
    createProductImage(product) {
        const img = document.createElement('img');
        img.src = product.product_picture;
        img.alt = product.name;
        img.onerror = () => {
            img.src = '/201-project/images/products/placeholder.jpg';
        };
        return img;
    }

    /**
     * Create badge container with discount and new badges
     * @param {Object} product - Product data
     * @returns {HTMLElement|null} Badge container or null if no badges
     */
    createBadges(product) {
        const hasDiscount = product.discount && product.discount !== '0';
        const isNew = this.isNewProduct(product.launch_time);

        if (!hasDiscount && !isNew) {
            return null;
        }

        const badgeContainer = document.createElement('div');
        badgeContainer.className = 'badge-container';

        if (hasDiscount) {
            badgeContainer.appendChild(this.createDiscountBadge(product.discount));
        }

        if (isNew) {
            badgeContainer.appendChild(this.createNewBadge());
        }

        return badgeContainer;
    }

    /**
     * Create discount badge element
     * @param {string} discount - Discount text
     * @returns {HTMLElement} Discount badge
     */
    createDiscountBadge(discount) {
        const badge = document.createElement('span');
        badge.className = 'badge badge-discount';
        badge.textContent = discount;
        return badge;
    }

    /**
     * Create new product badge element
     * @returns {HTMLElement} New badge
     */
    createNewBadge() {
        const badge = document.createElement('span');
        badge.className = 'badge badge-new';
        badge.textContent = 'New';
        return badge;
    }

    /**
     * Create product info section with name, description, and price
     * @param {Object} product - Product data
     * @returns {HTMLElement} Info section element
     */
    createInfoSection(product) {
        const infoDiv = document.createElement('div');
        infoDiv.className = 'product-info';

        infoDiv.appendChild(this.createProductName(product.name));
        infoDiv.appendChild(this.createProductDescription(product.brief));
        infoDiv.appendChild(this.createPriceBox(product));

        return infoDiv;
    }

    /**
     * Create product name element
     * @param {string} name - Product name
     * @returns {HTMLElement} Name element
     */
    createProductName(name) {
        const nameSpan = document.createElement('span');
        nameSpan.className = 'product-name';
        nameSpan.textContent = name;
        return nameSpan;
    }

    /**
     * Create product description element
     * @param {string} description - Product description
     * @returns {HTMLElement} Description element
     */
    createProductDescription(description) {
        const descSpan = document.createElement('span');
        descSpan.className = 'product-desc';
        descSpan.textContent = description;
        return descSpan;
    }

    /**
     * Create price box with current and optional old price
     * @param {Object} product - Product data
     * @returns {HTMLElement} Price box element
     */
    createPriceBox(product) {
        const priceBox = document.createElement('div');
        priceBox.className = 'price-box';

        const currentPrice = this.calculateDiscountedPrice(product.price, product.discount);
        priceBox.appendChild(this.createCurrentPrice(currentPrice));

        const hasDiscount = product.discount && product.discount !== '0';
        if (hasDiscount) {
            priceBox.appendChild(this.createOldPrice(product.price));
        }

        return priceBox;
    }

    /**
     * Create current price element
     * @param {number} price - Current price value
     * @returns {HTMLElement} Current price element
     */
    createCurrentPrice(price) {
        const priceSpan = document.createElement('span');
        priceSpan.className = 'current-price';
        priceSpan.textContent = this.formatPrice(price);
        return priceSpan;
    }

    /**
     * Create old price element (strikethrough)
     * @param {number} price - Original price value
     * @returns {HTMLElement} Old price element
     */
    createOldPrice(price) {
        const priceSpan = document.createElement('span');
        priceSpan.className = 'old-price';
        priceSpan.textContent = this.formatPrice(price);
        return priceSpan;
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

