/**
 * Show Sort Manager
 * Manages items-per-page dropdown and sort dropdown in toolbar
 * 依赖: SortStateStrategy (需要先加载 SortStrategy.js)
 */
class ShowSortManager {
    constructor(onChangeCallback) {
        this.sortState = {name: 0, price: 0, rate: 0};
        this.isInitialized = false;
        this.onChangeCallback = onChangeCallback || (() => {
        });
        this.init();
    }

    /**
     * Initialize show-sort controls
     */
    init() {
        if (this.isInitialized) return;

        this.bindShowPerPageEvents();
        this.bindSortDropdownEvents();

        this.isInitialized = true;
    }

    /**
     * Bind items-per-page dropdown events
     */
    bindShowPerPageEvents() {
        const showDropdown = document.getElementById('show-dropdown');
        if (!showDropdown) {
            console.warn('show-dropdown not found');
            return;
        }

        showDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
            showDropdown.classList.toggle('open');
        });

        document.addEventListener('click', () => {
            showDropdown.classList.remove('open');
        });

        showDropdown.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const value = parseInt(item.dataset.value);
                this.handleShowChange(value, item);
            });
        });
    }

    /**
     * Handle show per page change
     * @param {number} value - Items per page value
     * @param {HTMLElement} element - Dropdown item element
     */
    handleShowChange(value, element) {
        // Update productFilter
        window.productFilter.setItemsPerPage(value);

        const label = document.getElementById('current-show-label');
        const items = document.querySelectorAll('#show-dropdown .dropdown-item');

        items.forEach(i => i.classList.remove('active'));
        element.classList.add('active');

        if (label) {
            label.textContent = value;
        }

        this.triggerChangeCallback();
    }

    /**
     * Bind sort dropdown events
     */
    bindSortDropdownEvents() {
        const sortDropdown = document.getElementById('sort-dropdown');
        if (!sortDropdown) {
            console.warn('sort-dropdown not found');
            return;
        }

        sortDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
            sortDropdown.classList.toggle('open');
        });

        document.addEventListener('click', () => {
            sortDropdown.classList.remove('open');
        });

        sortDropdown.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const key = item.dataset.key;
                this.handleCustomSort(key, item);
            });
        });
    }

    /**
     * Handle custom sort option click
     * @param {string} key - Sort key (name, price, rate)
     * @param {HTMLElement} element - Dropdown item element
     */
    handleCustomSort(key, element) {
        this._resetOtherSortKeys(key);
        this._cycleSortState(key);

        // Update productFilter based on sort state
        const state = this.sortState[key];
        if (state === 0) {
            // Default state
            window.productFilter.setSortKey('default').setSortOrder(null);
        } else if (state === 1) {
            // Ascending
            window.productFilter.setSortKey(key).setSortOrder('asc');
        } else if (state === 2) {
            // Descending
            window.productFilter.setSortKey(key).setSortOrder('desc');
        }

        this.updateSortVisuals(key, state, element);
        this.triggerChangeCallback();
    }

    /**
     * 重置其他排序键的状态
     * @private
     * @param {string} currentKey - 当前激活的键
     */
    _resetOtherSortKeys(currentKey) {
        Object.keys(this.sortState).forEach(k => {
            if (k !== currentKey) {
                this.sortState[k] = 0;
            }
        });
    }

    /**
     * 循环切换排序状态
     * @private
     * @param {string} key - 排序键
     */
    _cycleSortState(key) {
        this.sortState[key] = (this.sortState[key] + 1) % 3;
    }

    /**
     * Update sort dropdown visuals using Strategy Pattern
     * @param {string} key - Sort key
     * @param {number} state - Sort state (0, 1, 2)
     * @param {HTMLElement} element - Active element
     */
    updateSortVisuals(key, state, element) {
        // 获取对应状态的策略
        const strategy = window.SortStateStrategy.getStrategy(state);

        // 重置所有项的视觉状态
        this._resetAllSortItemsVisuals();


        // 使用策略更新 UI
        this._applySortStrategy(strategy, key, element);
    }

    /**
     * 重置所有排序项的视觉状态
     * @private
     */
    _resetAllSortItemsVisuals() {
        const items = document.querySelectorAll('.dropdown-item');
        items.forEach(i => {
            i.classList.remove('active');
            const icon = i.querySelector('.sort-state-icon');
            if (icon) {
                icon.textContent = '';
            }
        });
    }

    /**
     * 应用策略来更新 UI
     * @private
     * @param {Object} strategy - 排序策略对象
     * @param {string} key - 排序键
     * @param {HTMLElement} element - 当前元素
     */
    _applySortStrategy(strategy, key, element) {
        const label = document.getElementById('current-sort-label');

        // 更新标签文本
        if (label) {
            label.textContent = strategy.getLabelText(key);
        }

        // 如果策略是激活状态，更新元素
        if (strategy.isActive() && element) {
            element.classList.add('active');
            const icon = element.querySelector('.sort-state-icon');
            if (icon) {
                icon.textContent = strategy.getIconText();
            }
        }
    }

    /**
     * Trigger change callback
     */
    triggerChangeCallback() {
        if (this.onChangeCallback) {
            this.onChangeCallback();
        }
    }

    /**
     * Reset sort to default (for UI state restoration)
     */
    resetSortUI() {
        this.sortState = {name: 0, price: 0, rate: 0};
        this.updateSortVisuals('', 0, null);
    }

    /**
     * Set items per page programmatically (for state restoration)
     * @param {number} value - Items per page value
     */
    setItemsPerPage(value) {
        const label = document.getElementById('current-show-label');
        if (label) {
            label.textContent = value;
        }

        const items = document.querySelectorAll('#show-dropdown .dropdown-item');
        items.forEach(item => {
            if (parseInt(item.dataset.value) === value) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    /**
     * Set sorting programmatically (for state restoration)
     * @param {string} key - Sort key (name, price, rate)
     * @param {string} order - Sort order ('asc' or 'desc')
     */
    setSorting(key, order) {
        if (!key || !order) {
            this.resetSortUI();
            return;
        }

        Object.keys(this.sortState).forEach(k => {
            this.sortState[k] = 0;
        });

        this.sortState[key] = order === 'asc' ? 1 : 2;

        const sortDropdown = document.getElementById('sort-dropdown');
        if (!sortDropdown) return;

        const element = sortDropdown.querySelector(`.dropdown-item[data-key="${key}"]`);
        if (element) {
            this.updateSortVisuals(key, this.sortState[key], element);
        }
    }

    /**
     * Reset all settings to defaults (for Clear All functionality)
     */
    resetToDefaults() {
        this.setItemsPerPage(16);
        this.resetSortUI();
        this.triggerChangeCallback();
    }
}

// 导出到全局命名空间（保持原接口名称）
if (typeof window !== 'undefined') {
    window.ShowSortManager = ShowSortManager;
}
