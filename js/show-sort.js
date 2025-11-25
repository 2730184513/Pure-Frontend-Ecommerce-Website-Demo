/**
 * Show Sort Manager
 * Manages items-per-page dropdown and sort dropdown in toolbar
 */
class ShowSortManager {
    constructor() {
        this.itemsPerPage = 16;
        this.sortMode = 'default';
        this.sortState = { name: 0, price: 0, rate: 0 };
        this.isInitialized = false;
        this.onChangeCallback = null;
    }

    /**
     * Initialize show-sort controls
     * @param {Function} onChangeCallback - Callback when settings change
     */
    init(onChangeCallback) {
        if (this.isInitialized) return;

        this.onChangeCallback = onChangeCallback || (() => {});
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

        // Toggle dropdown open/close
        showDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
            showDropdown.classList.toggle('open');
        });

        // Close on click outside
        document.addEventListener('click', () => {
            showDropdown.classList.remove('open');
        });

        // Handle item clicks
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
        this.itemsPerPage = value;

        // Update visuals
        const label = document.getElementById('current-show-label');
        const items = document.querySelectorAll('#show-dropdown .dropdown-item');

        // Reset visual state of all items
        items.forEach(i => i.classList.remove('active'));

        // Set active state
        element.classList.add('active');
        if (label) {
            label.textContent = value;
        }

        this.triggerChange();
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

        // Toggle dropdown open/close
        sortDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
            sortDropdown.classList.toggle('open');
        });

        // Close on click outside
        document.addEventListener('click', () => {
            sortDropdown.classList.remove('open');
        });

        // Handle item clicks
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
        // Reset other keys state
        Object.keys(this.sortState).forEach(k => {
            if (k !== key) this.sortState[k] = 0;
        });

        // Cycle state: 0 -> 1 (Asc) -> 2 (Desc) -> 0 (Default)
        this.sortState[key] = (this.sortState[key] + 1) % 3;
        const state = this.sortState[key];

        // Update visuals
        this.updateSortVisuals(key, state, element);

        // Trigger change callback
        this.triggerChange();
    }

    /**
     * Update sort dropdown visuals
     * @param {string} key - Sort key
     * @param {number} state - Sort state (0, 1, 2)
     * @param {HTMLElement} element - Active element
     */
    updateSortVisuals(key, state, element) {
        const label = document.getElementById('current-sort-label');
        const items = document.querySelectorAll('.dropdown-item');

        // Reset visual state of all items
        items.forEach(i => {
            i.classList.remove('active');
            const icon = i.querySelector('.sort-state-icon');
            if (icon) {
                icon.textContent = '';
            }
        });

        if (state === 1) {
            // Ascending
            this.sortMode = `${key}-asc`;
            element.classList.add('active');
            const icon = element.querySelector('.sort-state-icon');
            if (icon) {
                icon.textContent = '↑';
            }
            if (label) {
                label.textContent = `${this.capitalize(key)} (Asc)`;
            }
        } else if (state === 2) {
            // Descending
            this.sortMode = `${key}-desc`;
            element.classList.add('active');
            const icon = element.querySelector('.sort-state-icon');
            if (icon) {
                icon.textContent = '↓';
            }
            if (label) {
                label.textContent = `${this.capitalize(key)} (Desc)`;
            }
        } else {
            // Default
            this.sortMode = 'default';
            if (label) {
                label.textContent = 'Default';
            }
        }
    }

    /**
     * Capitalize first letter of string
     * @param {string} s - String to capitalize
     * @returns {string} Capitalized string
     */
    capitalize(s) {
        return s.charAt(0).toUpperCase() + s.slice(1);
    }

    /**
     * Trigger change callback
     */
    triggerChange() {
        if (this.onChangeCallback) {
            this.onChangeCallback();
        }
    }

    /**
     * Get current items per page
     * @returns {number}
     */
    getItemsPerPage() {
        return this.itemsPerPage;
    }

    /**
     * Get current sort mode
     * @returns {string} Sort mode (e.g., 'price-asc', 'default')
     */
    getSortMode() {
        return this.sortMode;
    }

    /**
     * Set items per page
     * @param {number} count - Items per page
     */
    setItemsPerPage(count) {
        this.itemsPerPage = count;
        const select = document.getElementById('items-per-page');
        if (select) {
            select.value = count;
        }
    }

    /**
     * Reset sort to default
     */
    resetSort() {
        this.sortMode = 'default';
        this.sortState = { name: 0, price: 0, rate: 0 };
        this.updateSortVisuals('', 0, null);
    }

    /**
     * Get configuration object
     * @returns {Object} Configuration with itemsPerPage and sortMode
     */
    getConfig() {
        return {
            itemsPerPage: this.itemsPerPage,
            sortMode: this.sortMode
        };
    }
}

if (typeof window !== 'undefined') {
    window.ShowSortManager = ShowSortManager;
}

