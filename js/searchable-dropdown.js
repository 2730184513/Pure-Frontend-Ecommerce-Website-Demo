/**
 * SearchableDropdown - 负责生成下拉框的HTML结构和选项过滤逻辑
 */
export class SearchableDropdown {
    constructor(inputElement, options = {}) {
        this.input = inputElement;
        this.searchFunction = options.searchFunction;
        this.allItems = options.allItems || [];
        this.placeholder = options.placeholder || 'Search or select...';
        this.dropdownList = null;
        this.selectedValue = null;

        this.initializeStructure();
    }

    /**
     * 初始化HTML结构
     */
    initializeStructure() {
        // 添加通用类名
        this.input.classList.add('searchable-input');
        this.input.setAttribute('autocomplete', 'off');
        this.input.setAttribute('placeholder', this.placeholder);
        this.dropdownList = this.createDropdownElement();
    }


    /**
     * 创建下拉列表元素
     */
    createDropdownElement() {
        const dropdown = document.createElement('div');
        dropdown.className = 'custom-dropdown-list';
        this.input.parentNode.appendChild(dropdown);
        return dropdown;
    }

    /**
     * 生成选项HTML
     */
    generateItemsHTML(items) {
        if (items.length === 0) {
            return '<div class="dropdown-item no-results">No results found</div>';
        }

        return items.map(item =>
            `<div class="dropdown-item" data-value="${this.escapeHtml(item)}">${this.escapeHtml(item)}</div>`
        ).join('');
    }

    /**
     * 转义HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * 格式化输入
     */
    formatInput(value) {
        if (!value) return '';
        return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    }

    /**
     * 过滤选项
     */
    filterItems(query) {
        if (!query) return this.allItems;

        const formatted = this.formatInput(query);

        if (this.searchFunction) {
            return this.searchFunction(formatted);
        }

        return this.allItems.filter(item =>
            item.toLowerCase().startsWith(formatted.toLowerCase())
        );
    }

    /**
     * 加载所有选项
     */
    loadItems(items) {
        this.allItems = items;
    }

    /**
     * 获取所有选项
     */
    getAllItems() {
        return this.allItems;
    }

    /**
     * 设置选中值
     */
    setSelected(value) {
        this.selectedValue = value;
        this.input.value = value;
    }

    /**
     * 获取选中值
     */
    getSelected() {
        return this.selectedValue;
    }

    /**
     * 重置
     */
    reset() {
        this.selectedValue = null;
        this.input.value = '';
    }

    /**
     * 获取下拉列表元素
     */
    getDropdownElement() {
        return this.dropdownList;
    }

    /**
     * 获取输入框元素
     */
    getInputElement() {
        return this.input;
    }

    /**
     * 启用
     */
    enable() {
        this.input.disabled = false;
    }

    /**
     * 禁用
     */
    disable() {
        this.input.disabled = true;
    }
}
