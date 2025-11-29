/**
 * Filter Sidebar UI Manager
 */
class FilterSidebar {
    constructor(options = {}) {
        this.containerId = 'filter-sidebar';
        this.onFilterChange = options.onFilterChange || (() => {
        });

        // Debounce timer for slider changes
        this.sliderDebounceTimer = null;
        this.sliderDebounceDelay = 500; // 500ms delay for better performance

        this.init();
    }

    init() {
        this.cacheDOM();
        if (!this.sidebar) {
            console.warn('Filter Sidebar elements not found');
            return;
        }
        this.bindCategoryEvents();
        this.initSliders();
        this.initDatePickers();
        this.bindClearAllButton();
    }

    cacheDOM() {
        this.sidebar = document.getElementById(this.containerId);
    }



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

    /**
     * 设置双向滑块（价格或评分范围）
     * @param {Object} config - 滑块配置对象
     */
    setupDualSlider(config) {
        const elements = this._getDualSliderElements(config);
        if (!elements) return;

        const {minR, maxR, minI, maxI, track} = elements;
        const minGap = config.maxVal * 0.05;

        // 更新轨道视觉效果的函数
        const updateTrack = () => this._updateSliderTrack(minR, maxR, track, config.maxVal);

        // 绑定滑块输入事件
        this._bindSliderRangeEvents(minR, maxR, minI, maxI, minGap, updateTrack);

        // 绑定数字输入框事件
        this._bindSliderInputEvents(minR, maxR, minI, maxI, minGap, config.maxVal, updateTrack);

        // 初始化轨道显示
        updateTrack();
    }

    /**
     * 获取双向滑块的所有 DOM 元素
     * @private
     * @param {Object} config
     * @returns {Object|null} 包含所有元素的对象或 null
     */
    _getDualSliderElements(config) {
        const minR = document.getElementById(config.minRangeId);
        const maxR = document.getElementById(config.maxRangeId);
        const minI = document.getElementById(config.minInputId);
        const maxI = document.getElementById(config.maxInputId);
        const track = document.getElementById(config.trackId);

        if (!minR || !maxR || !minI || !maxI || !track) {
            return null;
        }

        return {minR, maxR, minI, maxI, track};
    }

    /**
     * 更新滑块轨道的视觉效果
     * @private
     */
    _updateSliderTrack(minRange, maxRange, track, maxVal) {
        const minV = parseFloat(minRange.value);
        const maxV = parseFloat(maxRange.value);
        const percent1 = (minV / maxVal) * 100;
        const percent2 = (maxV / maxVal) * 100;
        track.style.background = `linear-gradient(to right, #ddd ${percent1}%, var(--primary-color) ${percent1}%, var(--primary-color) ${percent2}%, #ddd ${percent2}%)`;
    }

    /**
     * 绑定滑块范围输入事件（拖动滑块）
     * @private
     */
    _bindSliderRangeEvents(minR, maxR, minI, maxI, minGap, updateTrack) {
        const onSliderInput = (isMin) => {
            let minV = parseFloat(minR.value);
            let maxV = parseFloat(maxR.value);

            // 保持最小间隔
            if (maxV - minV <= minGap) {
                if (isMin) {
                    minR.value = maxV - minGap;
                } else {
                    maxR.value = minV + minGap;
                }
            }

            // 同步输入框
            minI.value = minR.value;
            maxI.value = maxR.value;

            updateTrack();
            this.triggerChangeDebounced(); // Use debounced version for smooth dragging
        };

        minR.addEventListener('input', () => onSliderInput(true));
        maxR.addEventListener('input', () => onSliderInput(false));
    }

    /**
     * 绑定滑块数字输入框事件
     * @private
     */
    _bindSliderInputEvents(minR, maxR, minI, maxI, minGap, maxVal, updateTrack) {
        minI.addEventListener('change', () => {
            let val = parseFloat(minI.value);
            if (val < 0) val = 0;
            if (val > parseFloat(maxR.value) - minGap) {
                val = parseFloat(maxR.value) - minGap;
            }
            minR.value = val;
            minI.value = val;
            updateTrack();
            this.triggerChange();
        });

        maxI.addEventListener('change', () => {
            let val = parseFloat(maxI.value);
            if (val > maxVal) val = maxVal;
            if (val < parseFloat(minR.value) + minGap) {
                val = parseFloat(minR.value) + minGap;
            }
            maxR.value = val;
            maxI.value = val;
            updateTrack();
            this.triggerChange();
        });
    }

    /**
     * 初始化日期选择器
     * 注意：handle*** 函数依赖闭包捕获特定的 DOM 元素，保持内联以避免增加复杂度
     */
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
        };

        const handleMouseDown = (e) => {
            e.stopPropagation();
        };

        [fromInput, toInput].forEach(input => {
            if (!input) return;
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

    /**
     * Collect current filter values from UI and update productFilter
     */
    updateProductFilter() {
        // Collect categories
        const checkedCats = Array.from(this.sidebar.querySelectorAll('.category-options input:checked')).map(cb => cb.value);
        window.productFilter.setCategories(checkedCats);

        // Collect price range
        const minP = parseFloat(document.getElementById('price-min-input').value) || 0;
        const maxP = parseFloat(document.getElementById('price-max-input').value) || 10000;
        window.productFilter.setMinPrice(minP).setMaxPrice(maxP);

        // Collect rating range
        const minR = parseFloat(document.getElementById('rate-min-input').value) || 0;
        const maxR = parseFloat(document.getElementById('rate-max-input').value) || 5;
        window.productFilter.setMinRate(minR).setMaxRate(maxR);

        // Collect date range
        const dFrom = document.getElementById('date-from').value;
        const dTo = document.getElementById('date-to').value;
        window.productFilter.setFrom(dFrom || null).setTo(dTo || null);
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
        const allCheckboxes = this.sidebar.querySelectorAll('.category-options input[type="checkbox"]');
        allCheckboxes.forEach(cb => cb.checked = false);

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
     */
    clearAll() {
        // Reset productFilter to defaults
        window.productFilter.reset();

        // Reset UI to reflect defaults
        const checkboxes = this.sidebar.querySelectorAll('.category-options input[type="checkbox"]');
        checkboxes.forEach(cb => cb.checked = false);

        this.restorePriceRange(0, 10000);
        this.restoreRatingRange(0, 5);

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

        const searchInput = document.getElementById('global-search-input');
        if (searchInput) {
            searchInput.value = '';
            // Also update productFilter's searchKeyword
            window.productFilter.setSearchKeyword('');
        }

        const clearEvent = new CustomEvent('filterClearAll');
        document.dispatchEvent(clearEvent);

        if (window.toastManager) {
            window.toastManager.show('All filters cleared', 'success', 3000);
        }

        // Notify shop-manager to refresh
        this.onFilterChange();
    }

    triggerChange() {
        // Update productFilter with current UI values
        this.updateProductFilter();
        // Notify shop-manager to refresh
        this.onFilterChange();
    }

    /**
     * Trigger change with debounce for sliders
     * Prevents excessive triggering during slider dragging
     */
    triggerChangeDebounced() {
        // Clear existing timer
        if (this.sliderDebounceTimer) {
            clearTimeout(this.sliderDebounceTimer);
        }

        // Set new timer
        this.sliderDebounceTimer = setTimeout(() => {
            this.triggerChange();
            this.sliderDebounceTimer = null;
        }, this.sliderDebounceDelay);
    }
}

if (typeof window !== 'undefined') window.FilterSidebar = FilterSidebar;
