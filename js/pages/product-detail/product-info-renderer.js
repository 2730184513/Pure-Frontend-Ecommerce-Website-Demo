/**
 * Product Info Renderer
 * Renders the product information section (left: images, right: product details)
 */

class ProductInfoRenderer {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
    }

    /**
     * Render the complete product info section
     * @param {Object} product - Product data
     */
    render(product) {
        if (!this.container || !product) {
            console.error('Container or product not found');
            return;
        }

        this.container.innerHTML = this.buildHTML(product);
    }

    /**
     * Build complete HTML for product info section
     * @param {Object} product - Product data
     * @returns {string} HTML string
     * @private
     */
    buildHTML(product) {
        return `
            <div class="product-info-container">
                ${this.buildImageSection(product)}
                ${this.buildDetailsSection(product)}
            </div>
        `;
    }

    /**
     * Build product image section HTML
     * @param {Object} product - Product data
     * @returns {string} HTML string
     * @private
     */
    buildImageSection(product) {
        return `
            <div class="product-images">
                <div class="main-image-container">
                    <img src="${product.product_picture}" alt="${this.escapeHTML(product.name)}" class="main-image" id="main-product-image" onerror="this.onerror=null;this.src='./images/products/placeholder.jpg';">
                </div>
            </div>
        `;
    }

    /**
     * Build product details section HTML
     * @param {Object} product - Product data
     * @returns {string} HTML string
     * @private
     */
    buildDetailsSection(product) {
        return `
            <div class="product-details">
                ${this.buildNameSection(product)}
                ${this.buildPriceSection(product)}
                ${this.buildRatingSection(product)}
                ${this.buildDescriptionSection(product)}
                ${this.buildSizeSection(product)}
                ${this.buildColorSection(product)}
                ${this.buildActionsSection(product)}
                ${this.buildRemainSection(product)}
                ${this.buildDivider()}
                ${this.buildMetaSection(product)}
            </div>
        `;
    }

    /**
     * Build product name HTML
     * @param {Object} product - Product data
     * @returns {string} HTML string
     * @private
     */
    buildNameSection(product) {
        return `<h1 class="product-title">${this.escapeHTML(product.name)}</h1>`;
    }

    /**
     * Build price section HTML
     * @param {Object} product - Product data
     * @returns {string} HTML string
     * @private
     */
    buildPriceSection(product) {
        const hasDiscount = product.discount && product.discount !== '0';
        const currentPrice = hasDiscount ? this.calculateDiscountedPrice(product.price, product.discount) : product.price;

        let priceHTML = `<div class="product-price-section">`;
        priceHTML += `<span class="current-price">${this.formatPrice(currentPrice)}</span>`;
        
        if (hasDiscount) {
            priceHTML += `<span class="original-price">${this.formatPrice(product.price)}</span>`;
        }

        // Out of stock indicator
        if (product.number_of_remain === 0) {
            priceHTML += `<span class="out-of-stock-badge">Out of Stock</span>`;
        }

        priceHTML += `</div>`;
        return priceHTML;
    }

    /**
     * Build rating and review section HTML
     * @param {Object} product - Product data
     * @returns {string} HTML string
     * @private
     */
    buildRatingSection(product) {
        const stars = this.generateStarRating(product.average_rate);
        const reviewCount = product.review ? Object.keys(product.review).length : 0;
        const reviewText = reviewCount === 1 ? 'Customer Review' : 'Customer Reviews';
        const ratingScore = (product.average_rate || 0).toFixed(1);

        return `
            <div class="product-rating-section">
                <div class="stars-container">${stars}</div>
                <span class="rating-divider">|</span>
                <span class="rating-score">(${ratingScore})</span>
                <span class="review-count">${reviewCount} ${reviewText}</span>
            </div>
        `;
    }

    /**
     * Generate star rating HTML
     * @param {number} rating - Average rating
     * @returns {string} HTML string
     * @private
     */
    generateStarRating(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = (rating - fullStars) >= 0.25 && (rating - fullStars) < 0.75;
        const roundUp = (rating - fullStars) >= 0.75;
        
        let html = '';
        const totalFull = roundUp ? fullStars + 1 : fullStars;
        
        for (let i = 0; i < totalFull && i < 5; i++) {
            html += '<img src="./images/icons/star.png" alt="star" class="star-icon" onerror="this.onerror=null;this.src=\'./images/products/placeholder.jpg\';">';
        }
        
        if (hasHalfStar && totalFull < 5) {
            html += '<img src="./images/icons/half-star.png" alt="half star" class="star-icon" onerror="this.onerror=null;this.src=\'./images/products/placeholder.jpg\';">';
        }

        return html;
    }

    /**
     * Build description section HTML with expand/collapse
     * @param {Object} product - Product data
     * @returns {string} HTML string
     * @private
     */
    buildDescriptionSection(product) {
        return `
            <div class="product-description-text-section">
                <p class="product-detail-text" id="product-detail-text">${this.escapeHTML(product.detail)}</p>
                <a href="javascript:void(0)" class="expand-link" id="description-expand-link">Expand</a>
            </div>
        `;
    }

    /**
     * Build size selection section HTML
     * @param {Object} product - Product data
     * @returns {string} HTML string
     * @private
     */
    buildSizeSection(product) {
        if (!product.size || typeof product.size !== 'object') return '';

        const sizes = Object.entries(product.size);
        if (sizes.length === 0) return '';

        let buttonsHTML = sizes.map(([name, value], index) => {
            const isSelected = index === 0 ? 'selected' : '';
            return `
                <button class="size-btn ${isSelected}" data-size="${this.escapeHTML(name)}" data-value="${this.escapeHTML(value)}">
                    ${this.escapeHTML(name)}
                    <span class="size-tooltip">${this.escapeHTML(value)}</span>
                </button>
            `;
        }).join('');

        return `
            <div class="product-size-section">
                <span class="section-label">Size</span>
                <div class="size-options">${buttonsHTML}</div>
            </div>
        `;
    }

    /**
     * Build color selection section HTML
     * @param {Object} product - Product data
     * @returns {string} HTML string
     * @private
     */
    buildColorSection(product) {
        if (!product.color || typeof product.color !== 'object') return '';

        const colors = Object.entries(product.color);
        if (colors.length === 0) return '';

        let buttonsHTML = colors.map(([name, code], index) => {
            const isSelected = index === 0 ? 'selected' : '';
            return `
                <button class="color-btn ${isSelected}" data-color="${this.escapeHTML(name)}" data-code="${code}" style="background-color: ${code}">
                    <span class="color-tooltip">${this.escapeHTML(name)}</span>
                </button>
            `;
        }).join('');

        return `
            <div class="product-color-section">
                <span class="section-label">Color</span>
                <div class="color-options">${buttonsHTML}</div>
            </div>
        `;
    }

    /**
     * Build actions section (counter, checkout, add to cart, like)
     * @param {Object} product - Product data
     * @returns {string} HTML string
     * @private
     */
    buildActionsSection(product) {
        const isOutOfStock = product.number_of_remain === 0;
        const disabledAttr = isOutOfStock ? 'disabled' : '';
        const disabledClass = isOutOfStock ? 'disabled' : '';
        const maxQty = product.number_of_remain || 9999;

        return `
            <div class="product-actions-section">
                <div class="quantity-counter ${disabledClass}">
                    <button class="qty-btn minus" ${disabledAttr}>-</button>
                    <input type="number" class="quantity-input" id="qty-input" value="1" min="1" max="${maxQty}" ${disabledAttr}>
                    <button class="qty-btn plus" ${disabledAttr}>+</button>
                </div>
                <button class="btn-checkout ${disabledClass}" id="btn-checkout" ${disabledAttr}>
                    Checkout
                </button>
                <button class="btn-add-to-cart ${disabledClass}" id="btn-add-to-cart" ${disabledAttr} title="Add to Cart">
                    <img src="./images/icons/add-cart.png" alt="Add to Cart" class="cart-icon">
                </button>
                <button class="btn-like" id="btn-like" data-product-id="${product.id}" title="Like">
                    <img src="./images/icons/heart.png" alt="Like" class="like-icon" id="like-icon">
                </button>
            </div>
        `;
    }

    /**
     * Build remain quantity section
     * @param {Object} product - Product data
     * @returns {string} HTML string
     * @private
     */
    buildRemainSection(product) {
        return `
            <div class="product-remain-section">
                <span class="remain-text">Remain: ${product.number_of_remain}</span>
            </div>
        `;
    }

    /**
     * Build divider HTML
     * @returns {string} HTML string
     * @private
     */
    buildDivider() {
        return '<hr class="product-divider">';
    }

    /**
     * Build meta information section (SKU, Category, Tags, Share)
     * @param {Object} product - Product data
     * @returns {string} HTML string
     * @private
     */
    buildMetaSection(product) {
        const tags = product.tags ? product.tags.split(',').map(t => t.trim()).join(', ') : '';

        return `
            <div class="product-meta-section">
                <div class="meta-row">
                    <span class="meta-label">SKU</span>
                    <span class="meta-separator">:</span>
                    <span class="meta-value">${this.escapeHTML(product.SKU || '')}</span>
                </div>
                <div class="meta-row">
                    <span class="meta-label">Category</span>
                    <span class="meta-separator">:</span>
                    <span class="meta-value">${this.escapeHTML(product.category || '')}</span>
                </div>
                <div class="meta-row">
                    <span class="meta-label">Tags</span>
                    <span class="meta-separator">:</span>
                    <span class="meta-value">${this.escapeHTML(tags)}</span>
                </div>
                <div class="meta-row">
                    <span class="meta-label">Share</span>
                    <span class="meta-separator">:</span>
                    <div class="social-icons">
                        <a href="https://facebook.com" target="_blank" class="social-link">
                            <img src="./images/icons/facebook.png" alt="Facebook" onerror="this.onerror=null;this.src='./images/products/placeholder.jpg';">
                        </a>
                        <a href="https://linkedin.com" target="_blank" class="social-link">
                            <img src="./images/icons/linkedin.png" alt="LinkedIn" onerror="this.onerror=null;this.src='./images/products/placeholder.jpg';">
                        </a>
                        <a href="https://twitter.com" target="_blank" class="social-link">
                            <img src="./images/icons/twitter.png" alt="Twitter" onerror="this.onerror=null;this.src='./images/products/placeholder.jpg';">
                        </a>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Calculate discounted price
     * @param {number} price - Original price
     * @param {string} discount - Discount string (e.g., "-30%")
     * @returns {number} Discounted price (rounded to 1 decimal place)
     * @private
     */
    calculateDiscountedPrice(price, discount) {
        const match = discount.match(/-?(\d+)%/);
        if (match) {
            const discountPercent = parseInt(match[1]);
            // Round to 1 decimal place
            return Math.round(price * (1 - discountPercent / 100) * 10) / 10;
        }
        return price;
    }

    /**
     * Format price
     * @param {number} price - Price value
     * @returns {string} Formatted price
     * @private
     */
    formatPrice(price) {
        // Format with 1 decimal place
        const roundedPrice = Math.round(price * 10) / 10; // Round to 1 decimal
        return `RM ${roundedPrice.toLocaleString('en-MY', {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1
        })}`;
    }

    /**
     * Escape HTML special characters
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     * @private
     */
    escapeHTML(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Update like button state
     * @param {boolean} isLiked - Whether product is liked
     */
    updateLikeState(isLiked) {
        const likeBtn = this.container?.querySelector('#btn-like');
        const likeIcon = this.container?.querySelector('#like-icon');
        
        if (likeBtn && likeIcon) {
            if (isLiked) {
                likeBtn.classList.add('liked');
                likeIcon.src = './images/icons/red-heart.png';
            } else {
                likeBtn.classList.remove('liked');
                likeIcon.src = './images/icons/heart.png';
            }
        }
    }

    /**
     * Update quantity display
     * @param {number} qty - New quantity
     */
    updateQuantityDisplay(qty) {
        const qtyInput = this.container?.querySelector('#qty-input');
        if (qtyInput) {
            qtyInput.value = qty;
        }
    }

    /**
     * Check if description text overflows and hide expand link if not
     */
    checkDescriptionOverflow() {
        const textElement = this.container?.querySelector('#product-detail-text');
        const expandLink = this.container?.querySelector('#description-expand-link');
        
        if (textElement && expandLink) {
            // Temporarily remove max-height to measure actual height
            const originalMaxHeight = textElement.style.maxHeight;
            textElement.style.maxHeight = 'none';
            const actualHeight = textElement.scrollHeight;
            textElement.style.maxHeight = originalMaxHeight;
            
            // If actual height is less than or equal to max-height (60px), hide expand link
            if (actualHeight <= 60) {
                expandLink.classList.add('hidden');
                textElement.classList.add('no-overflow');
            } else {
                expandLink.classList.remove('hidden');
                textElement.classList.remove('no-overflow');
            }
        }
    }
}

// Export to global scope
if (typeof window !== 'undefined') {
    window.ProductInfoRenderer = ProductInfoRenderer;
}
