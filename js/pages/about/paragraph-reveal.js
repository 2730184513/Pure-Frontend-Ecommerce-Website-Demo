/**
 * Paragraph Reveal Animation Controller
 * Controls paragraph fade-in animations with scroll-based timing
 */
class ParagraphReveal {
    constructor() {
        this.paragraphs = [];
        this.paragraphOffset = 250; // Offset for trigger timing
        this.isDestroyed = false;

        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.paragraphs = Array.from(document.querySelectorAll('.reveal-paragraph'));

        if (this.paragraphs.length === 0) {
            console.warn('No .reveal-paragraph elements found');
            return;
        }

        // Bind scroll event with passive listening
        this.scrollHandler = () => this.checkParagraphsVisibility();
        window.addEventListener('scroll', this.scrollHandler, { passive: true });

        // Delayed initial check to avoid page load trigger
        setTimeout(() => {
            if (!this.isDestroyed) {
                this.checkParagraphsVisibility();
            }
        }, 100);

        console.log(`✓ ParagraphReveal initialized with ${this.paragraphs.length} paragraphs`);
    }

    /**
     * Check if paragraphs should be revealed
     * Only triggers when paragraphs are fully or mostly in viewport
     */
    checkParagraphsVisibility() {
        if (this.isDestroyed) return;

        const windowHeight = window.innerHeight;
        const scrollTop = window.scrollY;

        this.paragraphs.forEach((paragraph, index) => {
            // Skip if already visible
            if (paragraph.classList.contains('visible')) {
                return;
            }

            // Get paragraph position
            const rect = paragraph.getBoundingClientRect();
            const paragraphTop = rect.top + scrollTop;

            // Calculate trigger point: paragraph top distance from viewport bottom
            // Only show when paragraph top is close to viewport bottom minus offset
            const triggerPoint = scrollTop + windowHeight - this.paragraphOffset;

            // Additional check: ensure paragraph is actually near viewport
            // (not just in viewport due to initial page load)
            const isInViewport = rect.top < windowHeight && rect.bottom > 0;
            const shouldTrigger = paragraphTop < triggerPoint && isInViewport;

            if (shouldTrigger) {
                // Add delay to create sequential appearance effect
                // Only apply delay for current batch of paragraphs
                const delay = this.getSequentialDelay(index);

                setTimeout(() => {
                    if (!this.isDestroyed && !paragraph.classList.contains('visible')) {
                        paragraph.classList.add('visible');
                        console.log(`Paragraph ${index + 1} revealed`);
                    }
                }, delay);
            }
        });
    }

    /**
     * Get sequential delay for paragraph appearance
     * Only applies incremental delay for continuously showing paragraphs
     * @param {number} currentIndex - Current paragraph index
     * @returns {number} Delay in milliseconds
     */
    getSequentialDelay(currentIndex) {
        // Count how many previous paragraphs are already visible
        let visibleCount = 0;
        for (let i = 0; i < currentIndex; i++) {
            if (this.paragraphs[i].classList.contains('visible')) {
                visibleCount++;
            }
        }

        // If all previous paragraphs are visible, use delay relative to last shown paragraph
        // Otherwise use delay relative to start
        const baseDelay = visibleCount === currentIndex ? 0 : 0;
        return baseDelay + (currentIndex - visibleCount) * 150;
    }

    /**
     * Cleanup resources
     */
    destroy() {
        this.isDestroyed = true;
        if (this.scrollHandler) {
            window.removeEventListener('scroll', this.scrollHandler);
            this.scrollHandler = null;
        }
        this.paragraphs = [];
    }
}

// Export for global access
if (typeof window !== 'undefined') {
    window.ParagraphReveal = ParagraphReveal;
}
