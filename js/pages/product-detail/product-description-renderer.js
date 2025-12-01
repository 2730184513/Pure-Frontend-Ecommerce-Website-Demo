/**
 * Product Description Renderer
 * Renders the product description tabs section (Description, Additional Info, Reviews)
 */

class ProductDescriptionRenderer {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
    }

    /**
     * Render the complete description section
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
     * Build complete HTML for description section
     * @param {Object} product - Product data
     * @returns {string} HTML string
     * @private
     */
    buildHTML(product) {
        const reviewCount = product.review ? Object.keys(product.review).length : 0;

        return `
            <div class="description-tabs-container">
                ${this.buildTabsNavigation(reviewCount)}
                ${this.buildTabsContent(product)}
            </div>
        `;
    }

    /**
     * Build tabs navigation HTML
     * @param {number} reviewCount - Number of reviews
     * @returns {string} HTML string
     * @private
     */
    buildTabsNavigation(reviewCount) {
        return `
            <nav class="tabs-navigation">
                <button class="tab-btn active" data-tab="description">Description</button>
                <button class="tab-btn" data-tab="additional">Additional Information</button>
                <button class="tab-btn" data-tab="reviews">Reviews [${reviewCount}]</button>
            </nav>
        `;
    }

    /**
     * Build tabs content HTML
     * @param {Object} product - Product data
     * @returns {string} HTML string
     * @private
     */
    buildTabsContent(product) {
        return `
            <div class="tabs-content">
                ${this.buildDescriptionTab(product)}
                ${this.buildAdditionalInfoTab(product)}
                ${this.buildReviewsTab(product)}
            </div>
        `;
    }

    /**
     * Build description tab content
     * @param {Object} product - Product data
     * @returns {string} HTML string
     * @private
     */
    buildDescriptionTab(product) {
        const descriptionImages = this.buildDescriptionImages(product);

        return `
            <div class="tab-pane active" id="tab-description">
                <div class="description-text">
                    <p>${this.escapeHTML(product.detail || '')}</p>
                    <p>${this.escapeHTML(product.description || '')}</p>
                </div>
                ${descriptionImages}
            </div>
        `;
    }

    /**
     * Build description images section
     * @param {Object} product - Product data
     * @returns {string} HTML string
     * @private
     */
    buildDescriptionImages(product) {
        // Check for description pictures
        if (!product.description_picture) return '';

        // Handle both array and single image
        const pictures = Array.isArray(product.description_picture) 
            ? product.description_picture 
            : [product.description_picture];

        if (pictures.length === 0) return '';

        const imagesHTML = pictures.map(pic => `
            <div class="description-image">
                <img src="${pic}" alt="Product description" loading="lazy">
            </div>
        `).join('');

        return `<div class="description-images">${imagesHTML}</div>`;
    }

    /**
     * Build additional information tab content
     * @param {Object} product - Product data
     * @returns {string} HTML string
     * @private
     */
    buildAdditionalInfoTab(product) {
        const hasInfo = product.additional_information && product.additional_information.trim();
        
        const content = hasInfo 
            ? `<p>${this.escapeHTML(product.additional_information)}</p>`
            : `<p class="empty-state">No additional information available.</p>`;

        return `
            <div class="tab-pane" id="tab-additional">
                <div class="additional-info-content">
                    ${content}
                </div>
            </div>
        `;
    }

    /**
     * Build reviews tab content
     * @param {Object} product - Product data
     * @returns {string} HTML string
     * @private
     */
    buildReviewsTab(product) {
        if (!product.review || Object.keys(product.review).length === 0) {
            return `
                <div class="tab-pane" id="tab-reviews">
                    <p class="empty-state">No reviews yet.</p>
                </div>
            `;
        }

        const reviewsHTML = Object.entries(product.review).map(([name, review]) => {
            return this.buildReviewItem(name, review);
        }).join('');

        return `
            <div class="tab-pane" id="tab-reviews">
                <div class="reviews-list">
                    ${reviewsHTML}
                </div>
            </div>
        `;
    }

    /**
     * Build single review item HTML
     * @param {string} name - Reviewer name
     * @param {Object} review - Review data
     * @returns {string} HTML string
     * @private
     */
    buildReviewItem(name, review) {
        const stars = this.generateStarRating(review.rate);

        return `
            <article class="review-item">
                <div class="review-header">
                    <span class="reviewer-name">${this.escapeHTML(name)}</span>
                    <div class="reviewer-rating">${stars}</div>
                </div>
                <div class="review-content">
                    <p class="review-comment">${this.escapeHTML(review.comment)}</p>
                    <a href="javascript:void(0)" class="expand-review-link">Expand</a>
                </div>
            </article>
        `;
    }

    /**
     * Check review overflow and hide expand links if not needed
     * Call this after render and tab switch
     */
    checkReviewOverflow() {
        const reviewComments = this.container.querySelectorAll('.review-comment');
        
        reviewComments.forEach(comment => {
            const expandLink = comment.closest('.review-content')?.querySelector('.expand-review-link');
            if (!expandLink) return;

            // Check if content overflows
            const isOverflowing = comment.scrollHeight > comment.clientHeight;
            
            if (isOverflowing) {
                expandLink.classList.remove('hidden');
            } else {
                // No overflow - hide expand link and remove max-height restriction
                expandLink.classList.add('hidden');
                comment.classList.add('no-overflow');
            }
        });
    }

    /**
     * Generate star rating HTML
     * @param {number} rating - Rating value
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
            html += '<img src="/201-project/images/icons/star.png" alt="star" class="star-icon">';
        }
        
        if (hasHalfStar && totalFull < 5) {
            html += '<img src="/201-project/images/icons/half-star.png" alt="half star" class="star-icon">';
        }

        return html;
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
     * Switch to specified tab
     * @param {string} tabId - Tab identifier
     */
    switchTab(tabId) {
        // Update tab buttons
        this.container.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
        });

        // Update tab panes
        this.container.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.toggle('active', pane.id === `tab-${tabId}`);
        });
    }

    /**
     * Toggle review expand state
     * @param {HTMLElement} reviewItem - Review item element
     * @param {boolean} expanded - Expand state
     */
    toggleReviewExpand(reviewItem, expanded) {
        const comment = reviewItem.querySelector('.review-comment');
        const link = reviewItem.querySelector('.expand-review-link');

        if (comment && link) {
            comment.classList.toggle('expanded', expanded);
            link.textContent = expanded ? 'Collapse' : 'Expand';
        }
    }
}

// Export to global scope
if (typeof window !== 'undefined') {
    window.ProductDescriptionRenderer = ProductDescriptionRenderer;
}
