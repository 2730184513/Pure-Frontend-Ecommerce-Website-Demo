/**
 * Cart Summary Carousel
 * Handles the selected items preview carousel with queue-based management
 */
class CartSummaryCarousel {
    constructor() {
        this.carouselTrack = null;
        this.prevBtn = null;
        this.nextBtn = null;
        this.items = [];
        this.currentIndex = 0;
        this.visibleCount = 0;
    }

    /**
     * Initialize carousel
     * @param {HTMLElement} carouselTrack - Carousel track element
     * @param {HTMLElement} prevBtn - Previous button
     * @param {HTMLElement} nextBtn - Next button
     */
    init(carouselTrack, prevBtn, nextBtn) {
        this.carouselTrack = carouselTrack;
        this.prevBtn = prevBtn;
        this.nextBtn = nextBtn;

        this.bindEvents();
        this.calculateVisibleCount();

        // Recalculate on window resize
        window.addEventListener('resize', () => this.calculateVisibleCount());
    }

    /**
     * Calculate how many items can fit in viewport
     */
    calculateVisibleCount() {
        if (!this.carouselTrack) return;

        const container = this.carouselTrack.parentElement;
        if (!container) return;

        const containerWidth = container.offsetWidth;
        const itemWidth = 70; // 60px + 10px gap

        this.visibleCount = Math.floor(containerWidth / itemWidth);

        // Ensure at least 1 item is visible if container has width
        if (this.visibleCount === 0 && containerWidth > 0) {
            this.visibleCount = 1;
        }
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.scrollPrevious());
        }

        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.scrollNext());
        }
    }

    /**
     * Update carousel with new items
     * @param {Array} items - Array of item objects with variantId property
     */
    update(items) {
        if (!this.carouselTrack) return;

        // Check if items actually changed
        if (this.itemsEqual(items, this.items)) {
            this.updateCarouselButtons();
            return;
        }

        this.items = items;
        this.currentIndex = 0;

        // Calculate how many items can be visible
        this.calculateVisibleCount();

        // Render
        this.render();
    }

    /**
     * Render carousel items (like carousel.js)
     */
    render() {
        if (!this.carouselTrack) return;

        this.carouselTrack.innerHTML = '';

        // Calculate visible count if not set
        if (this.visibleCount === 0) {
            this.calculateVisibleCount();

            // If still 0, wait for next frame and retry
            if (this.visibleCount === 0) {
                // Render all items temporarily
                this.items.forEach((item, index) => {
                    const element = this.createPreviewItemFromExisting(item, index);
                    this.carouselTrack.appendChild(element);
                });

                // Retry in next frame when container is ready
                requestAnimationFrame(() => {
                    this.calculateVisibleCount();
                    this.render();
                });

                return;
            }
        }

        // Render visible items starting from currentIndex
        const itemsToShow = Math.min(this.visibleCount, this.items.length);

        for (let i = 0; i < itemsToShow; i++) {
            const itemIndex = this.currentIndex + i;

            // Don't wrap around - stop at the end
            if (itemIndex >= this.items.length) break;

            const item = this.items[itemIndex];
            const element = this.createPreviewItemFromExisting(item, itemIndex);
            this.carouselTrack.appendChild(element);
        }

        this.updateCarouselButtons();
    }

    /**
     * Check if two item arrays are equal
     * @param {Array} items1
     * @param {Array} items2
     * @returns {boolean}
     */
    itemsEqual(items1, items2) {
        if (items1.length !== items2.length) return false;

        for (let i = 0; i < items1.length; i++) {
            if (items1[i].variantId !== items2[i].variantId) {
                return false;
            }
        }

        return true;
    }

    /**
     * Create preview item by reusing existing cart item image
     * @param {Object} item - Item object with variantId
     * @param {number} index - Item index
     * @returns {HTMLElement}
     */
    createPreviewItemFromExisting(item, index) {
        const previewItem = document.createElement('div');
        previewItem.className = 'preview-item';
        previewItem.dataset.index = index;
        previewItem.dataset.variantId = item.variantId;

        // Find the existing cart item image
        const cartItemElement = document.querySelector(`.cart-item[data-variant-id="${item.variantId}"]`);

        if (cartItemElement) {
            const existingImg = cartItemElement.querySelector('.product-image');

            if (existingImg) {
                // Create new img element with existing src (avoid cloning styles)
                const newImg = document.createElement('img');
                newImg.src = existingImg.src;
                newImg.alt = existingImg.alt || 'Selected product';
                newImg.className = 'preview-img';

                previewItem.appendChild(newImg);

                return previewItem;
            }
        }

        // Fallback: use placeholder if cart item not found
        const placeholderSrc = './images/products/placeholder.jpg';
        const img = document.createElement('img');
        img.src = placeholderSrc;
        img.alt = 'Selected product';
        img.className = 'preview-img';
        previewItem.appendChild(img);

        return previewItem;
    }

    /**
     * Scroll to previous item (like carousel.js prev())
     */
    scrollPrevious() {
        if (this.currentIndex === 0) return;

        this.currentIndex--;
        this.render();
    }

    /**
     * Scroll to next item (like carousel.js next())
     */
    scrollNext() {
        const maxIndex = this.items.length - this.visibleCount;
        if (this.currentIndex >= maxIndex) return;

        this.currentIndex++;
        this.render();
    }


    /**
     * Update carousel button states
     */
    updateCarouselButtons() {
        if (!this.prevBtn || !this.nextBtn) return;

        const totalItems = this.items.length;
        const maxIndex = Math.max(0, totalItems - this.visibleCount);

        // Update prev button
        if (this.currentIndex === 0) {
            this.prevBtn.disabled = true;
            this.prevBtn.style.opacity = '0.3';
            this.prevBtn.style.cursor = 'not-allowed';
        } else {
            this.prevBtn.disabled = false;
            this.prevBtn.style.opacity = '1';
            this.prevBtn.style.cursor = 'pointer';
        }

        // Update next button
        if (this.currentIndex >= maxIndex) {
            this.nextBtn.disabled = true;
            this.nextBtn.style.opacity = '0.3';
            this.nextBtn.style.cursor = 'not-allowed';
        } else {
            this.nextBtn.disabled = false;
            this.nextBtn.style.opacity = '1';
            this.nextBtn.style.cursor = 'pointer';
        }
    }

    /**
     * Clear carousel
     */
    clear() {
        if (this.carouselTrack) {
            this.carouselTrack.innerHTML = '';
        }
        this.items = [];
        this.currentIndex = 0;
    }

    /**
     * Reset position
     */
    reset() {
        this.currentIndex = 0;
        this.render();
    }
}

if (typeof window !== 'undefined') {
    window.CartSummaryCarousel = CartSummaryCarousel;
}

