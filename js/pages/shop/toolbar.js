/**
 * Toolbar Manager
 * Pure UI display manager for toolbar elements
 * Only responsible for updating UI displays, not managing logic
 */
class ToolbarManager {
    constructor() {
        this.isInitialized = false;
        // Animation configuration
        this.ANIMATION_DURATION = 300; // Total animation duration in ms
        this.isAnimating = false;
    }

    /**
     * Initialize toolbar manager
     */
    init() {
        if (this.isInitialized) return;

        // Initialize filter count display
        this.updateFilterCount();

        // Bind filter button active state toggle
        this.bindFilterButtonToggle();

        this.isInitialized = true;
        console.log('✓ Toolbar Manager initialized');
    }

    /**
     * Bind filter button click event and active state based on sidebar open/close
     * Handles both click events and visual state updates with animations
     */
    bindFilterButtonToggle() {
        const filterBtn = document.getElementById('filter-toggle-btn');
        const layoutWrapper = document.getElementById('shop-layout');
        const iconMain = filterBtn ? filterBtn.querySelector('.icon-filter-main') : null;
        const iconAlt = filterBtn ? filterBtn.querySelector('.icon-filter-alt') : null;

        if (!filterBtn || !layoutWrapper || !iconMain || !iconAlt) {
            console.warn('Filter button, layout wrapper, or filter icons not found');
            return;
        }

        // Click event handler with animations
        filterBtn.addEventListener('click', (e) => {
            e.stopPropagation();

            if (this.isAnimating) return;

            const isCurrentlyOpen = layoutWrapper.classList.contains('sidebar-open');
            const willBeOpen = !isCurrentlyOpen;

            // Start animation
            this.animateIconSwitch(iconMain, iconAlt, willBeOpen, () => {
                this.isAnimating = false;
            });

            // Toggle sidebar state
            layoutWrapper.classList.toggle('sidebar-open');

            // Update button active state
            filterBtn.classList.toggle('active', willBeOpen);
        });

        // Create MutationObserver to watch for class changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    const isOpen = layoutWrapper.classList.contains('sidebar-open');
                    filterBtn.classList.toggle('active', isOpen);
                }
            });
        });

        observer.observe(layoutWrapper, {
            attributes: true,
            attributeFilter: ['class']
        });
    }

    /**
     * Animate icon switch between filter and arrow-left
     * Uses stacked icons with opacity and rotation transitions
     * @param {HTMLElement} iconMain - Main filter icon element
     * @param {HTMLElement} iconAlt - Alternative arrow-left icon element
     * @param {boolean} isOpening - True if opening sidebar, false if closing
     * @param {Function} onComplete - Callback when animation completes
     */
    animateIconSwitch(iconMain, iconAlt, isOpening, onComplete) {
        this.isAnimating = true;

        if (isOpening) {
            // Opening: Main icon (filter) rotates counter-clockwise and fades out
            //          Alt icon (arrow-left) fades in without rotation
            iconMain.style.transform = 'rotate(-90deg)';
            iconMain.style.opacity = '0';

            iconAlt.style.transform = 'rotate(0deg)'; // No rotation
            iconAlt.style.opacity = '1';
        } else {
            // Closing: Alt icon (arrow-left) rotates clockwise and fades out
            //          Main icon (filter) fades in without rotation
            iconAlt.style.transform = 'rotate(90deg)';
            iconAlt.style.opacity = '0';

            iconMain.style.transform = 'rotate(0deg)'; // No rotation
            iconMain.style.opacity = '1';
        }

        // Reset animation flag after duration
        setTimeout(() => {
            if (onComplete) onComplete();
        }, this.ANIMATION_DURATION);
    }

    /**
     * Update filter count display in the toolbar
     * Shows filter count like "Filter (3)" if there are active filters
     */
    updateFilterCount() {
        const count = window.productFilter.getActiveFilterCount();
        const filterBtn = document.getElementById('filter-toggle-btn');
        const filterSpan = filterBtn ? filterBtn.querySelector('.filter-span') : null;

        if (filterSpan) {
            if (count > 0) {
                filterSpan.textContent = `Filter (${count})`;
            } else {
                filterSpan.textContent = 'Filter';
            }
        }
    }

    /**
     * Update query results text display
     * @param {number} start - Start position (1-based)
     * @param {number} end - End position
     * @param {number} total - Total results count
     * @param {string} keyword - Search keyword (optional)
     */
    updateResultsText(start, end, total, keyword) {
        const resultsElement = document.getElementById('showing-results-text');
        if (!resultsElement) return;

        let text;
        if (total === 0) {
            text = 'Showing 0 results';
        } else if (!keyword || keyword.trim() === '') {
            text = `Showing ${start}–${end} of ${total} results`;
        } else {
            text = `Showing ${start}–${end} of ${total} results for Keyword: ${keyword}`;

            // Handle long keywords with ellipsis
            if (text.length > 80) {
                const maxKeywordLength = 80 - `Showing ${start}–${end} of ${total} results for Keyword: `.length - 3;
                const truncatedKeyword = keyword.length > maxKeywordLength ?
                    keyword.substring(0, maxKeywordLength) + '...' : keyword;
                text = `Showing ${start}–${end} of ${total} results for Keyword: ${truncatedKeyword}`;
            }
        }

        resultsElement.textContent = text;
    }
}

if (typeof window !== 'undefined') {
    window.ToolbarManager = ToolbarManager;
}
