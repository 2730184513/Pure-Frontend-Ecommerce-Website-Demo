/**
 * Filter Sidebar UI Manager
 */
class FilterSidebar {
    constructor(options = {}) {
        this.containerId = 'filter-sidebar';
        this.toggleBtnId = 'filter-toggle-btn';
        this.layoutId = 'shop-layout';
        this.onFilterChange = options.onFilterChange || (() => {});
        this.init();
    }

    init() {
        this.cacheDOM();
        if (!this.sidebar || !this.toggleBtn) {
            console.warn('Filter Sidebar elements not found');
            return;
        }
        this.bindToggleEvents();
        this.bindCategoryEvents();
        this.initSliders();
        this.initDatePickers();
        this.bindClearAllButton();
    }

    cacheDOM() {
        this.sidebar = document.getElementById(this.containerId);
        this.toggleBtn = document.getElementById(this.toggleBtnId);
        this.layoutWrapper = document.getElementById(this.layoutId);
        this.toggleIcon = this.toggleBtn ? this.toggleBtn.querySelector('.icon-filter') : null;
    }

    bindToggleEvents() {
        this.toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = this.layoutWrapper.classList.toggle('sidebar-open');
            if (this.toggleIcon) {
                this.toggleIcon.src = isOpen ? '/201-project/images/icons/arrow-left.png' : '/201-project/images/icons/filter.png';
            }
        });
    }
    // ... (其余方法 Slider, Date Picker, getFilterValues 保持不变，见上一次回答) ...
    // (务必保留 getFilterValues 和 initSliders 等核心逻辑)

    bindCategoryEvents() {
        const checkboxes = this.sidebar.querySelectorAll('.category-options input[type="checkbox"]');
        checkboxes.forEach(cb => {
            cb.addEventListener('change', () => {
                this.triggerChange();
            });
        });
    }

    initSliders() {
        this.setupDualSlider({
            minRangeId: 'price-min-range', maxRangeId: 'price-max-range',
            minInputId: 'price-min-input', maxInputId: 'price-max-input',
            trackId: 'price-track', maxVal: 10000
        });
        this.setupDualSlider({
            minRangeId: 'rate-min-range', maxRangeId: 'rate-max-range',
            minInputId: 'rate-min-input', maxInputId: 'rate-max-input',
            trackId: 'rate-track', maxVal: 5
        });
    }

    setupDualSlider(config) {
        const minR = document.getElementById(config.minRangeId);
        const maxR = document.getElementById(config.maxRangeId);
        const minI = document.getElementById(config.minInputId);
        const maxI = document.getElementById(config.maxInputId);
        const track = document.getElementById(config.trackId);
        const minGap = config.maxVal * 0.05;

        if (!minR || !maxR || !minI || !maxI || !track) return;

        const updateTrack = () => {
            const minV = parseFloat(minR.value);
            const maxV = parseFloat(maxR.value);
            const percent1 = (minV / config.maxVal) * 100;
            const percent2 = (maxV / config.maxVal) * 100;
            track.style.background = `linear-gradient(to right, #ddd ${percent1}%, var(--primary-color) ${percent1}%, var(--primary-color) ${percent2}%, #ddd ${percent2}%)`;
        };

        const onSliderInput = (isMin) => {
            let minV = parseFloat(minR.value);
            let maxV = parseFloat(maxR.value);
            if (maxV - minV <= minGap) {
                if (isMin) minR.value = maxV - minGap;
                else maxR.value = minV + minGap;
            }
            minI.value = minR.value;
            maxI.value = maxR.value;
            updateTrack();
            this.triggerChange();
        };

        minR.addEventListener('input', () => onSliderInput(true));
        maxR.addEventListener('input', () => onSliderInput(false));

        minI.addEventListener('change', () => {
            let val = parseFloat(minI.value);
            if (val < 0) val = 0;
            if (val > parseFloat(maxR.value) - minGap) val = parseFloat(maxR.value) - minGap;
            minR.value = val; minI.value = val; updateTrack(); this.triggerChange();
        });

        maxI.addEventListener('change', () => {
            let val = parseFloat(maxI.value);
            if (val > config.maxVal) val = config.maxVal;
            if (val < parseFloat(minR.value) + minGap) val = parseFloat(minR.value) + minGap;
            maxR.value = val; maxI.value = val; updateTrack(); this.triggerChange();
        });
        updateTrack();
    }

    initDatePickers() {
        const fromInput = document.getElementById('date-from');
        const toInput = document.getElementById('date-to');

        const handleFocus = (e) => {
            e.stopPropagation();
            e.target.type = 'date';
            // Small delay to ensure type change is applied before opening picker
            setTimeout(() => {
                if (e.target.showPicker) {
                    try {
                        e.target.showPicker();
                    } catch (err) {
                        // showPicker may fail in some browsers
                    }
                }
            }, 0);
        };

        const handleBlur = (e) => {
            if (!e.target.value) {
                e.target.type = 'text';
            }
        };

        const handleClick = (e) => {
            e.stopPropagation();
            // Prevent the click from triggering on other elements
        };

        const handleMouseDown = (e) => {
            e.stopPropagation();
        };

        [fromInput, toInput].forEach(input => {
            if(!input) return;
            input.type = 'text';

            // Remove any existing listeners to prevent duplicates
            const newInput = input.cloneNode(true);
            input.parentNode.replaceChild(newInput, input);

            newInput.addEventListener('focus', handleFocus, true);
            newInput.addEventListener('blur', handleBlur, true);
            newInput.addEventListener('click', handleClick, true);
            newInput.addEventListener('mousedown', handleMouseDown, true);
            newInput.addEventListener('change', () => this.triggerChange());
        });

        // Prevent date field containers from triggering date picker
        const dateFields = document.querySelectorAll('.date-field');
        dateFields.forEach(field => {
            field.addEventListener('click', (e) => {
                // Only trigger if clicking directly on the input
                if (e.target.classList.contains('date-picker')) {
                    return;
                }
                e.stopPropagation();
            });
        });
    }

    getFilterValues() {
        const checkedCats = Array.from(this.sidebar.querySelectorAll('.category-options input:checked')).map(cb => cb.value);
        const minP = parseFloat(document.getElementById('price-min-input').value) || 0;
        const maxP = parseFloat(document.getElementById('price-max-input').value) || 10000;
        const minR = parseFloat(document.getElementById('rate-min-input').value) || 0;
        const maxR = parseFloat(document.getElementById('rate-max-input').value) || 5;
        const dFrom = document.getElementById('date-from').value;
        const dTo = document.getElementById('date-to').value;

        return {
            categories: checkedCats,
            priceRange: { min: minP, max: maxP },
            ratingRange: { min: minR, max: maxR },
            dateRange: { from: dFrom, to: dTo }
        };
    }

    setCategorySelection(category) {
        const cb = this.sidebar.querySelector(`.category-options input[value="${category}"]`);
        if (cb) {
            cb.checked = true;
            this.triggerChange();
        }
    }

    /**
     * Restore category selections (for state restoration)
     * @param {Array} categories - Array of category values to check
     */
    restoreCategories(categories) {
        // First uncheck all
        const allCheckboxes = this.sidebar.querySelectorAll('.category-options input[type="checkbox"]');
        allCheckboxes.forEach(cb => cb.checked = false);

        // Then check the selected ones
        categories.forEach(category => {
            const cb = this.sidebar.querySelector(`.category-options input[value="${category}"]`);
            if (cb) {
                cb.checked = true;
            }
        });
    }

    /**
     * Restore price range (for state restoration)
     * @param {number} min - Minimum price
     * @param {number} max - Maximum price
     */
    restorePriceRange(min, max) {
        const minRange = document.getElementById('price-min-range');
        const maxRange = document.getElementById('price-max-range');
        const minInput = document.getElementById('price-min-input');
        const maxInput = document.getElementById('price-max-input');
        const track = document.getElementById('price-track');

        if (minRange && maxRange && minInput && maxInput && track) {
            minRange.value = min;
            maxRange.value = max;
            minInput.value = min;
            maxInput.value = max;

            // Update track visual
            const percent1 = (min / 10000) * 100;
            const percent2 = (max / 10000) * 100;
            track.style.background = `linear-gradient(to right, #ddd ${percent1}%, var(--primary-color) ${percent1}%, var(--primary-color) ${percent2}%, #ddd ${percent2}%)`;
        }
    }

    /**
     * Restore rating range (for state restoration)
     * @param {number} min - Minimum rating
     * @param {number} max - Maximum rating
     */
    restoreRatingRange(min, max) {
        const minRange = document.getElementById('rate-min-range');
        const maxRange = document.getElementById('rate-max-range');
        const minInput = document.getElementById('rate-min-input');
        const maxInput = document.getElementById('rate-max-input');
        const track = document.getElementById('rate-track');

        if (minRange && maxRange && minInput && maxInput && track) {
            minRange.value = min;
            maxRange.value = max;
            minInput.value = min;
            maxInput.value = max;

            // Update track visual
            const percent1 = (min / 5) * 100;
            const percent2 = (max / 5) * 100;
            track.style.background = `linear-gradient(to right, #ddd ${percent1}%, var(--primary-color) ${percent1}%, var(--primary-color) ${percent2}%, #ddd ${percent2}%)`;
        }
    }

    /**
     * Restore date range (for state restoration)
     * @param {string} from - From date (yyyy-mm-dd)
     * @param {string} to - To date (yyyy-mm-dd)
     */
    restoreDateRange(from, to) {
        const fromInput = document.getElementById('date-from');
        const toInput = document.getElementById('date-to');

        if (fromInput && from) {
            fromInput.type = 'date';
            fromInput.value = from;
        }

        if (toInput && to) {
            toInput.type = 'date';
            toInput.value = to;
        }
    }

    /**
     * Get count of active filters
     * Returns count based on:
     * - Each selected category = 1 filter
     * - Price min != 0 = 1 filter
     * - Price max != 10000 = 1 filter
     * - Rating min != 0 = 1 filter
     * - Rating max != 5 = 1 filter
     * - Date from set = 1 filter
     * - Date to set = 1 filter
     * Max possible: 4 + 2 + 2 + 2 = 10
     * @returns {number} Active filter count
     */
    getActiveFilterCount() {
        let count = 0;

        // Count selected categories
        const checkedCats = this.sidebar.querySelectorAll('.category-options input:checked');
        count += checkedCats.length;

        // Count price filters
        const priceMin = parseFloat(document.getElementById('price-min-input').value) || 0;
        const priceMax = parseFloat(document.getElementById('price-max-input').value) || 10000;
        if (priceMin > 0) count++;
        if (priceMax < 10000) count++;

        // Count rating filters
        const rateMin = parseFloat(document.getElementById('rate-min-input').value) || 0;
        const rateMax = parseFloat(document.getElementById('rate-max-input').value) || 5;
        if (rateMin > 0) count++;
        if (rateMax < 5) count++;

        // Count date filters
        const dateFrom = document.getElementById('date-from').value;
        const dateTo = document.getElementById('date-to').value;
        if (dateFrom) count++;
        if (dateTo) count++;

        return count;
    }

    /**
     * Bind Clear All button event
     */
    bindClearAllButton() {
        const clearBtn = document.getElementById('clear-all-filters-btn');
        if (!clearBtn) return;

        clearBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.clearAll();
        });
    }

    /**
     * Clear all filters and reset to default state
     * This includes categories, price, rating, dates, and also clears show/sort/keyword
     */
    clearAll() {
        // Clear categories
        const checkboxes = this.sidebar.querySelectorAll('.category-options input[type="checkbox"]');
        checkboxes.forEach(cb => cb.checked = false);

        // Reset price range
        this.restorePriceRange(0, 10000);

        // Reset rating range
        this.restoreRatingRange(0, 5);

        // Reset date range
        const fromInput = document.getElementById('date-from');
        const toInput = document.getElementById('date-to');
        if (fromInput) {
            fromInput.value = '';
            fromInput.type = 'text';
        }
        if (toInput) {
            toInput.value = '';
            toInput.type = 'text';
        }

        // Clear search keyword
        const searchInput = document.getElementById('global-search-input');
        if (searchInput) {
            searchInput.value = '';
        }

        // Reset show and sort via event dispatch
        // This will be handled by ShopManager
        const clearEvent = new CustomEvent('filterClearAll');
        document.dispatchEvent(clearEvent);

        // Show success toast
        if (window.toastManager) {
            window.toastManager.show('All filters cleared', 'success', 3000);
        }

        // Trigger change to update the display
        this.triggerChange();
    }

    triggerChange() { this.onFilterChange(); }
}

if (typeof window !== 'undefined') window.FilterSidebar = FilterSidebar;