/**
 * ManageFormRenderer - 表单渲染器
 * 只负责动态行（Size/Color）的渲染和UI交互
 * 验证逻辑交给 FieldValidator，数据由 HTML 属性定义
 */
class ManageFormRenderer {
    constructor(form) {
        this.form = form;
        this.sizeRowCount = 0;
        this.colorRowCount = 0;
        this.categoryDropdown = null;
        this.categories = ['sofa', 'lamp', 'chair', 'table'];
    }

    /**
     * 初始化渲染器
     */
    initialize() {
        this.initCategoryDropdown();
        this.initFileInputs();
        this.initSizeSection();
        this.initColorSection();
        this.initFieldValidation();
        
        // 添加初始行
        this.addSizeRow();
        this.addColorRow();
        
        console.log('✓ ManageFormRenderer initialized');
    }

    /**
     * 初始化字段验证 - 使用 FieldValidator
     */
    initFieldValidation() {
        const fields = this.form.querySelectorAll('input, textarea, select');
        
        fields.forEach(field => {
            // 失焦时验证
            field.addEventListener('blur', () => {
                FieldValidator.validateField(field);
            });
            
            // 输入时清除错误状态（如果之前有错误）
            field.addEventListener('input', () => {
                if (field.classList.contains('invalid')) {
                    FieldValidator.validateField(field);
                }
            });
        });
    }

    /**
     * 初始化分类下拉框
     */
    initCategoryDropdown() {
        const categoryInput = document.getElementById('category');
        if (!categoryInput) return;

        this.categoryDropdown = new SearchableDropdown(categoryInput, {
            allItems: this.categories,
            placeholder: 'Select or search category'
        });

        const dropdownElement = this.categoryDropdown.getDropdownElement();
        
        categoryInput.addEventListener('focus', () => {
            const items = this.categoryDropdown.filterItems('');
            dropdownElement.innerHTML = this.categoryDropdown.generateItemsHTML(items);
            dropdownElement.classList.add('open');
        });

        categoryInput.addEventListener('input', () => {
            const items = this.categoryDropdown.filterItems(categoryInput.value);
            dropdownElement.innerHTML = this.categoryDropdown.generateItemsHTML(items);
            dropdownElement.classList.add('open');
        });

        categoryInput.addEventListener('blur', () => {
            setTimeout(() => dropdownElement.classList.remove('open'), 200);
        });

        dropdownElement.addEventListener('click', (e) => {
            const item = e.target.closest('.dropdown-item');
            if (item && !item.classList.contains('no-results')) {
                this.categoryDropdown.setSelected(item.dataset.value);
                dropdownElement.classList.remove('open');
                FieldValidator.validateField(categoryInput);
            }
        });
    }

    /**
     * 初始化文件输入
     */
    initFileInputs() {
        this.initFileInput('productPicture', 'productPicturePreview');
        this.initFileInput('descriptionPicture', 'descriptionPicturePreview');
    }

    /**
     * 初始化单个文件输入
     */
    initFileInput(inputId, previewId) {
        const input = document.getElementById(inputId);
        const preview = document.getElementById(previewId);
        const wrapper = input?.closest('.file-input-wrapper');
        const placeholder = wrapper?.querySelector('.file-placeholder');

        if (!input) return;

        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            
            if (file && file.type.startsWith('image/')) {
                if (placeholder) {
                    placeholder.textContent = file.name;
                    placeholder.classList.add('has-file');
                }

                const reader = new FileReader();
                reader.onload = (event) => {
                    if (preview) {
                        preview.innerHTML = `<img src="${event.target.result}" alt="Preview">`;
                        preview.classList.add('has-image');
                    }
                };
                reader.readAsDataURL(file);
            } else {
                if (placeholder) {
                    placeholder.textContent = 'Choose an image file...';
                    placeholder.classList.remove('has-file');
                }
                if (preview) {
                    preview.innerHTML = '';
                    preview.classList.remove('has-image');
                }
            }
        });
    }

    /**
     * 初始化 Size 区域
     */
    initSizeSection() {
        const addBtn = document.getElementById('addSizeBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.addSizeRow());
        }
    }

    /**
     * 添加 Size 行
     */
    addSizeRow(data = null) {
        const container = document.getElementById('sizeRowsContainer');
        if (!container) return;

        this.sizeRowCount++;
        const row = document.createElement('div');
        row.className = 'size-row';
        row.id = `sizeRow${this.sizeRowCount}`;
        
        // 解析已有数据
        let name = '', length = '', width = '', height = '';
        if (data) {
            name = data.name || '';
            if (data.dimensions) {
                const parts = data.dimensions.split('*').map(p => p.trim());
                if (parts.length === 3) {
                    length = parts[0];
                    width = parts[1];
                    height = parts[2];
                }
            }
        }

        row.innerHTML = `
            <input type="text" class="size-name-input" 
                   placeholder="L" value="${name}"
                   pattern="^[a-zA-Z0-9]+$">
            <span class="size-separator">:</span>
            <input type="number" class="size-dimension-input" 
                   placeholder="80.00" min="0.01" max="1000" step="0.01" value="${length}">
            <span class="size-separator">*</span>
            <input type="number" class="size-dimension-input" 
                   placeholder="35.00" min="0.01" max="1000" step="0.01" value="${width}">
            <span class="size-separator">*</span>
            <input type="number" class="size-dimension-input" 
                   placeholder="45.00" min="0.01" max="1000" step="0.01" value="${height}">
            <span class="size-unit">cm</span>
            <button type="button" class="remove-row-btn" onclick="this.closest('.size-row').remove()">×</button>
        `;

        container.appendChild(row);
    }

    /**
     * 初始化 Color 区域
     */
    initColorSection() {
        const addBtn = document.getElementById('addColorBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.addColorRow());
        }
    }

    /**
     * 添加 Color 行
     */
    addColorRow(data = null) {
        const container = document.getElementById('colorRowsContainer');
        if (!container) return;

        this.colorRowCount++;
        const row = document.createElement('div');
        row.className = 'color-row';
        row.id = `colorRow${this.colorRowCount}`;

        const colorName = data?.name || '';
        const colorHex = data?.hex || '#000000';

        row.innerHTML = `
            <input type="text" class="color-name-input" 
                   placeholder="Color name (e.g., Navy Blue)" value="${colorName}">
            <input type="text" class="color-hex-input" 
                   value="${colorHex}" placeholder="#000000"
                   pattern="^#[0-9A-Fa-f]{6}$">
            <div class="color-picker-wrapper-new">
                <button type="button" class="color-picker-btn" title="Pick color">
                    <img src="./images/icons/platte.png" alt="Color picker" class="palette-icon">
                </button>
                <input type="color" class="color-picker-hidden" value="${colorHex}">
            </div>
            <button type="button" class="remove-row-btn" onclick="this.closest('.color-row').remove()">×</button>
        `;

        container.appendChild(row);

        // 绑定颜色选择器事件
        const colorPickerBtn = row.querySelector('.color-picker-btn');
        const colorPicker = row.querySelector('.color-picker-hidden');
        const hexInput = row.querySelector('.color-hex-input');

        colorPickerBtn.addEventListener('click', () => colorPicker.click());
        
        colorPicker.addEventListener('input', (e) => {
            hexInput.value = e.target.value.toUpperCase();
        });

        hexInput.addEventListener('input', (e) => {
            if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                colorPicker.value = e.target.value;
            }
        });
    }

    /**
     * 设置图片预览（用于编辑模式）
     */
    setImagePreview(inputId, imageUrl) {
        if (!imageUrl) return;
        
        const preview = document.getElementById(inputId + 'Preview');
        const wrapper = document.getElementById(inputId)?.closest('.file-input-wrapper');
        const placeholder = wrapper?.querySelector('.file-placeholder');

        if (preview) {
            preview.innerHTML = `<img src="${imageUrl}" alt="Preview">`;
            preview.classList.add('has-image');
        }
        if (placeholder) {
            placeholder.textContent = 'Image loaded';
            placeholder.classList.add('has-file');
        }
    }

    /**
     * 清空 Size 行
     */
    clearSizeRows() {
        const container = document.getElementById('sizeRowsContainer');
        if (container) container.innerHTML = '';
        this.sizeRowCount = 0;
    }

    /**
     * 清空 Color 行
     */
    clearColorRows() {
        const container = document.getElementById('colorRowsContainer');
        if (container) container.innerHTML = '';
        this.colorRowCount = 0;
    }

    /**
     * 重置表单UI
     */
    resetUI() {
        // 清空预览
        ['productPicturePreview', 'descriptionPicturePreview'].forEach(id => {
            const preview = document.getElementById(id);
            if (preview) {
                preview.innerHTML = '';
                preview.classList.remove('has-image');
            }
        });

        // 重置文件占位符
        document.querySelectorAll('.file-placeholder').forEach(el => {
            el.textContent = 'Choose an image file...';
            el.classList.remove('has-file');
        });

        // 清空动态行
        this.clearSizeRows();
        this.clearColorRows();

        // 添加初始行
        this.addSizeRow();
        this.addColorRow();

        // 清除验证状态
        document.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
            el.classList.remove('show');
        });
        document.querySelectorAll('.invalid, .valid').forEach(el => {
            el.classList.remove('invalid', 'valid');
        });
    }
}

// Export to window
if (typeof window !== 'undefined') {
    window.ManageFormRenderer = ManageFormRenderer;
}
