/**
 * Product Card Renderer
 * Handles rendering of product cards
 * Uses ProductPopup for hover interactions
 */

class ProductCardRenderer {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        this.popups = new Map();

        // Performance optimization settings
        this.batchSize = 12; // Render products in batches
        this.renderTimeout = 16; // 60fps timing

        // Intersection observer for lazy loading
        this.intersectionObserver = null;
        this.initIntersectionObserver();

        if (!this.container) {
            console.error(`Container not found: ${containerSelector}`);
        }
    }

    /**
     * Initialize intersection observer for lazy image loading
     * @private
     */
    initIntersectionObserver() {
        if ('IntersectionObserver' in window) {
            this.intersectionObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                            this.intersectionObserver.unobserve(img);
                        }
                    }
                });
            }, {
                rootMargin: '50px'
            });
        }
    }

    /**
     * Render all products with batch processing for better performance
     * @param {Array} products - Product array
     * @param {string} containerSelector - Target container selector
     * @param {string} keyword - Optional search keyword for highlighting
     */
    async renderAll(products, containerSelector, keyword = '') {
        if (!products || products.length === 0) {
            this.renderEmpty();
            return;
        }

        // Clear container and show loading state
        this.container.innerHTML = this.createLoadingPlaceholders(Math.min(products.length, 12));

        // Use document fragment for better performance
        const fragment = document.createDocumentFragment();

        // Batch render products to avoid blocking UI
        await this.batchRenderProducts(products, fragment, keyword);

        // Replace loading placeholders with actual content
        this.container.innerHTML = '';
        this.container.appendChild(fragment);

        console.log(`✓ Rendered ${products.length} products`);
    }

    /**
     * Create loading placeholders for better UX
     * @param {number} count - Number of placeholders to create
     * @returns {string} HTML string for placeholders
     * @private
     */
    createLoadingPlaceholders(count) {
        let placeholders = '';
        for (let i = 0; i < count; i++) {
            placeholders += `
                <div class="product-card loading-placeholder">
                    <div class="product-image placeholder-shimmer"></div>
                    <div class="product-info">
                        <div class="placeholder-line placeholder-shimmer"></div>
                        <div class="placeholder-line placeholder-shimmer short"></div>
                        <div class="placeholder-line placeholder-shimmer"></div>
                    </div>
                </div>
            `;
        }
        return placeholders;
    }

    /**
     * Batch render products to avoid blocking the UI
     * @param {Array} products - Products to render
     * @param {DocumentFragment} fragment - Target fragment
     * @param {string} keyword - Search keyword
     * @private
     */
    async batchRenderProducts(products, fragment, keyword) {
        for (let i = 0; i < products.length; i += this.batchSize) {
            const batch = products.slice(i, i + this.batchSize);

            // Render batch
            batch.forEach(product => {
                const card = this.renderCard(product, keyword);
                fragment.appendChild(card);
            });

            // Yield control to browser for smooth UI
            if (i + this.batchSize < products.length) {
                await new Promise(resolve => setTimeout(resolve, this.renderTimeout));
            }
        }
    }

    /**
     * Render a single product card
     * @param {Object} product - Product data
     * @param {string} keyword - Optional keyword for highlighting
     * @returns {HTMLElement} Product card element
     */
    renderCard(product, keyword) {
        const article = document.createElement('article');
        const isOutOfStock = this.isProductOutOfStock(product);
        article.className = 'product-card' + (isOutOfStock ? ' out-of-stock' : '');
        article.dataset.productId = product.id;

        // Compose card from independent sections
        article.appendChild(this.createImageSection(product));
        article.appendChild(this.createInfoSection(product, keyword));

        // Attach interactive behavior
        this.attachPopup(article, product);

        return article;
    }

    /**
     * Check if product is out of stock
     * @param {Object} product - Product data
     * @returns {boolean} True if out of stock
     * @private
     */
    isProductOutOfStock(product) {
        if (window.productRepository) {
            return window.productRepository.isOutOfStock(product.id);
        }
        return (product.number_of_remain || 0) <= 0;
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

        // Add sold out overlay if product is out of stock
        if (this.isProductOutOfStock(product)) {
            const overlay = this.createSoldOutOverlay();
            imageDiv.appendChild(overlay);
        }

        return imageDiv;
    }

    /**
     * Create sold out overlay for out of stock products
     * @returns {HTMLElement} Overlay element
     * @private
     */
    createSoldOutOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'sold-out-overlay';
        
        const icon = document.createElement('img');
        icon.src = '/201-project/images/icons/sold-out.png';
        icon.alt = 'Sold Out';
        icon.className = 'sold-out-icon';
        
        overlay.appendChild(icon);
        return overlay;
    }

    /**
     * Create product image element with lazy loading and error handling
     * @param {Object} product - Product data
     * @returns {HTMLImageElement} Image element
     */
    createProductImage(product) {
        const img = document.createElement('img');

        // Implement lazy loading if intersection observer is available
        if (this.intersectionObserver) {
            img.dataset.src = product.product_picture;
            img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlZWVlZWUiLz48L3N2Zz4='; // Placeholder SVG
            img.alt = product.name;
            this.intersectionObserver.observe(img);
        } else {
            img.src = product.product_picture;
            img.alt = product.name;
        }

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
     * @param {string} keyword - Optional keyword for highlighting
     * @returns {HTMLElement} Info section element
     */
    createInfoSection(product, keyword) {
        const infoDiv = document.createElement('div');
        infoDiv.className = 'product-info';

        infoDiv.appendChild(this.createProductName(product.name, keyword));
        infoDiv.appendChild(this.createProductDescription(product.brief, keyword));
        infoDiv.appendChild(this.createPriceBox(product));

        return infoDiv;
    }

    /**
     * Create product name element
     * @param {string} name - Product name
     * @param {string} keyword - Optional keyword for highlighting
     * @returns {HTMLElement} Name element
     */
    createProductName(name, keyword) {
        const nameSpan = document.createElement('span');
        nameSpan.className = 'product-name';

        if (keyword && keyword.trim()) {
            nameSpan.innerHTML = this.highlightKeyword(name, keyword);
        } else {
            nameSpan.textContent = name;
        }

        return nameSpan;
    }

    /**
     * Create product description element
     * @param {string} description - Product description
     * @param {string} keyword - Optional keyword for highlighting
     * @returns {HTMLElement} Description element
     */
    createProductDescription(description, keyword) {
        const descSpan = document.createElement('span');
        descSpan.className = 'product-desc';

        if (keyword && keyword.trim()) {
            descSpan.innerHTML = this.highlightKeyword(description, keyword);
        } else {
            descSpan.textContent = description;
        }

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
     * Render multiple products (legacy method for backward compatibility)
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

        // Attach double-click navigation event
        this.attachDoubleClickNavigation(card, product);
    }

    /**
     * Attach double-click event for navigating to product detail page
     * @param {HTMLElement} card - Product card element
     * @param {Object} product - Product data
     * @private
     */
    attachDoubleClickNavigation(card, product) {
        card.addEventListener('dblclick', (event) => {
            // Exclude button areas from triggering navigation
            const target = event.target;
            const isButton = target.closest('.btn-add-cart') || 
                            target.closest('.action-item') ||
                            target.tagName === 'BUTTON';
            
            if (isButton) {
                return;
            }

            // Check login status
            if (window.AuthGuard && !window.AuthGuard.isLoggedIn()) {
                window.AuthGuard.requireLogin('view product details');
                return;
            }

            // Store product ID and source page to sessionStorage
            sessionStorage.setItem('productDetailId', product.id);
            
            // Determine source page
            const currentPath = window.location.pathname;
            let sourcePage = 'home';
            if (currentPath.includes('shop.html')) {
                sourcePage = 'shop';
            } else if (currentPath.includes('product-detail.html')) {
                sourcePage = 'product-detail';
            }
            sessionStorage.setItem('productDetailSource', sourcePage);

            // Navigate to product detail page
            window.location.href = '/201-project/product-detail.html';
        });
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
     * Highlight keyword in text using mark tags
     * @param {string} text - Text to highlight in
     * @param {string} keyword - Keyword to highlight
     * @returns {string} HTML string with highlighted keyword
     * @private
     */
    highlightKeyword(text, keyword) {
        if (!text || !keyword) return text;

        // Escape special regex characters in keyword
        const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Create regex for case-insensitive global matching
        const regex = new RegExp(`(${escapedKeyword})`, 'gi');

        // Replace matches with mark tags
        return text.replace(regex, '<mark class="highlight-red">$1</mark>');
    }

    /**
     * Render empty state when no products are found
     */
    renderEmpty() {
        if (!this.container) {
            console.error('Container not available for empty state');
            return;
        }

        this.container.innerHTML = `
            <div class="empty-products-state">
                <div class="empty-icon">🔍</div>
                <h3 class="empty-title">No products found</h3>
                <p class="empty-message">Try adjusting your filters or search terms to find what you're looking for.</p>
            </div>
        `;

        console.log('✓ Rendered empty products state');
    }
}

// Export
if (typeof window !== 'undefined') {
    window.ProductCardRenderer = ProductCardRenderer;
}
