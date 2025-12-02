/**
 * ManageFormManager - 表单业务逻辑管理器
 * 负责数据收集、验证、提交和编辑模式处理
 */
class ManageFormManager {
    constructor(form, renderer) {
        this.form = form;
        this.renderer = renderer;
        this.editMode = false;
        this.editingProductId = null;
        this.editingProduct = null; // 保存完整产品对象用于增量修改
        
        // Category 配置
        this.categories = ['sofa', 'lamp', 'chair', 'table'];
        this.skuPrefixes = {
            'sofa': 'SS',
            'lamp': 'LA',
            'chair': 'CH',
            'table': 'TB'
        };
    }

    /**
     * 验证表单
     * @returns {boolean}
     */
    validate() {
        let isValid = true;
        let firstInvalidField = null;
        const invalidFields = [];
        
        // 验证必填字段（排除 file input，单独处理）
        const fields = this.form.querySelectorAll('input[required]:not([type="file"]), textarea[required]');
        
        fields.forEach(field => {
            if (!FieldValidator.validateField(field)) {
                isValid = false;
                invalidFields.push(field);
            }
        });

        // 检查产品图片（编辑模式下如果已有图片则不必须）
        const productPicture = document.getElementById('productPicture');
        const preview = document.getElementById('productPicturePreview');
        const hasExistingImage = preview?.classList.contains('has-image');
        
        if (!hasExistingImage && !productPicture?.files?.length) {
            this.showError(productPicture, 'Product picture is required');
            isValid = false;
            invalidFields.push(productPicture);
        } else {
            this.clearError(productPicture);
        }

        // 检查 Category 是否有效
        const category = document.getElementById('category');
        if (category && !this.categories.includes(category.value.toLowerCase())) {
            this.showError(category, 'Please select a valid category');
            isValid = false;
            invalidFields.push(category);
        }

        // 字符数验证（按5字符=1单词）
        const nameInput = document.getElementById('productName');
        if (nameInput?.value && nameInput.value.length > 50) {
            this.showError(nameInput, 'Maximum 50 characters (10 words) allowed');
            isValid = false;
            invalidFields.push(nameInput);
        }

        const briefInput = document.getElementById('brief');
        if (briefInput?.value && briefInput.value.length > 100) {
            this.showError(briefInput, 'Maximum 100 characters (20 words) allowed');
            isValid = false;
            invalidFields.push(briefInput);
        }

        // 验证 Size 区域
        const sizeValidation = this.validateSizeRows();
        if (!sizeValidation.valid) {
            isValid = false;
            if (sizeValidation.firstInvalidElement) {
                invalidFields.push(sizeValidation.firstInvalidElement);
            }
        }

        // 验证 Color 区域
        const colorValidation = this.validateColorRows();
        if (!colorValidation.valid) {
            isValid = false;
            if (colorValidation.firstInvalidElement) {
                invalidFields.push(colorValidation.firstInvalidElement);
            }
        }

        // 定位到第一个错误字段
        if (!isValid && invalidFields.length > 0) {
            firstInvalidField = invalidFields[0];
            this.scrollToField(firstInvalidField);
        }

        return isValid;
    }

    /**
     * 验证 Size 行
     * @returns {{valid: boolean, firstInvalidElement: HTMLElement|null}}
     */
    validateSizeRows() {
        const container = document.getElementById('sizeRowsContainer');
        const rows = container?.querySelectorAll('.size-row') || [];
        let firstInvalidElement = null;
        
        // 必须至少有一行
        if (rows.length === 0) {
            this.showSectionError('size-section', 'At least one size is required');
            firstInvalidElement = document.getElementById('addSizeBtn');
            return { valid: false, firstInvalidElement };
        }

        let hasValidRow = false;
        let hasError = false;

        rows.forEach(row => {
            const nameInput = row.querySelector('.size-name-input');
            const dimInputs = row.querySelectorAll('.size-dimension-input');
            const name = nameInput?.value.trim();
            const dims = Array.from(dimInputs).map(input => input.value.trim());
            
            // 检查是否所有字段都为空（空行）
            const isEmptyRow = !name && dims.every(d => !d);
            
            // 检查是否所有字段都填写（完整行）
            const isCompleteRow = name && dims.every(d => d);
            
            // 检查是否部分填写（不完整行）
            const isPartialRow = !isEmptyRow && !isCompleteRow;

            if (isPartialRow) {
                // 部分填写，标记错误
                hasError = true;
                row.classList.add('invalid-row');
                
                // 找到第一个无效元素
                if (!firstInvalidElement) {
                    if (!name) {
                        firstInvalidElement = nameInput;
                    } else {
                        firstInvalidElement = Array.from(dimInputs).find(input => !input.value.trim());
                    }
                }
            } else {
                row.classList.remove('invalid-row');
            }

            if (isCompleteRow) {
                hasValidRow = true;
            }
        });

        // 至少需要一个完整的行
        if (!hasValidRow) {
            this.showSectionError('size-section', 'At least one complete size entry is required');
            if (!firstInvalidElement && rows.length > 0) {
                firstInvalidElement = rows[0].querySelector('.size-name-input');
            }
            return { valid: false, firstInvalidElement };
        }

        if (hasError) {
            this.showSectionError('size-section', 'Please complete or remove incomplete size rows');
            return { valid: false, firstInvalidElement };
        }

        this.clearSectionError('size-section');
        return { valid: true, firstInvalidElement: null };
    }

    /**
     * 验证 Color 行
     * @returns {{valid: boolean, firstInvalidElement: HTMLElement|null}}
     */
    validateColorRows() {
        const container = document.getElementById('colorRowsContainer');
        const rows = container?.querySelectorAll('.color-row') || [];
        let firstInvalidElement = null;
        
        // 必须至少有一行
        if (rows.length === 0) {
            this.showSectionError('color-section', 'At least one color is required');
            firstInvalidElement = document.getElementById('addColorBtn');
            return { valid: false, firstInvalidElement };
        }

        let hasValidRow = false;
        let hasError = false;

        rows.forEach(row => {
            const nameInput = row.querySelector('.color-name-input');
            const hexInput = row.querySelector('.color-hex-input');
            const name = nameInput?.value.trim();
            const hex = hexInput?.value.trim();
            
            // 检查是否所有字段都为空（空行）
            const isEmptyRow = !name && (!hex || hex === '#000000');
            
            // 检查是否所有字段都填写（完整行）
            const isCompleteRow = name && hex && /^#[0-9A-Fa-f]{6}$/.test(hex);
            
            // 检查是否部分填写（不完整行）
            const isPartialRow = !isEmptyRow && !isCompleteRow;

            if (isPartialRow) {
                hasError = true;
                row.classList.add('invalid-row');
                
                if (!firstInvalidElement) {
                    if (!name) {
                        firstInvalidElement = nameInput;
                    } else {
                        firstInvalidElement = hexInput;
                    }
                }
            } else {
                row.classList.remove('invalid-row');
            }

            if (isCompleteRow) {
                hasValidRow = true;
            }
        });

        // 至少需要一个完整的行
        if (!hasValidRow) {
            this.showSectionError('color-section', 'At least one complete color entry is required');
            if (!firstInvalidElement && rows.length > 0) {
                firstInvalidElement = rows[0].querySelector('.color-name-input');
            }
            return { valid: false, firstInvalidElement };
        }

        if (hasError) {
            this.showSectionError('color-section', 'Please complete or remove incomplete color rows');
            return { valid: false, firstInvalidElement };
        }

        this.clearSectionError('color-section');
        return { valid: true, firstInvalidElement: null };
    }

    /**
     * 显示区域错误
     */
    showSectionError(sectionClass, message) {
        const section = document.querySelector(`.${sectionClass}`);
        let errorSpan = section?.querySelector('.section-error-message');
        
        if (!errorSpan && section) {
            errorSpan = document.createElement('span');
            errorSpan.className = 'error-message section-error-message';
            section.appendChild(errorSpan);
        }
        
        if (errorSpan) {
            errorSpan.textContent = message;
            errorSpan.classList.add('show');
        }
    }

    /**
     * 清除区域错误
     */
    clearSectionError(sectionClass) {
        const section = document.querySelector(`.${sectionClass}`);
        const errorSpan = section?.querySelector('.section-error-message');
        if (errorSpan) {
            errorSpan.textContent = '';
            errorSpan.classList.remove('show');
        }
    }

    /**
     * 滚动到字段
     */
    scrollToField(field) {
        if (!field) return;
        
        const formGroup = field.closest('.form-group') || field.closest('.size-row') || field.closest('.color-row');
        const target = formGroup || field;
        
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // 聚焦到字段
        setTimeout(() => {
            if (field.focus) field.focus();
        }, 300);
    }

    /**
     * 显示字段错误
     */
    showError(field, message) {
        const formGroup = field?.closest('.form-group');
        const errorSpan = formGroup?.querySelector('.error-message');
        if (errorSpan) {
            errorSpan.textContent = message;
            errorSpan.classList.add('show');
        }
        field?.classList.add('invalid');
        field?.classList.remove('valid');
    }

    /**
     * 清除字段错误
     */
    clearError(field) {
        const formGroup = field?.closest('.form-group');
        const errorSpan = formGroup?.querySelector('.error-message');
        if (errorSpan) {
            errorSpan.textContent = '';
            errorSpan.classList.remove('show');
        }
        field?.classList.remove('invalid');
    }

    /**
     * 收集表单数据
     * @returns {Object}
     */
    collectFormData() {
        const category = document.getElementById('category').value.toLowerCase();
        const now = new Date();
        const launchTime = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;

        // 获取折扣值
        const discountValue = parseInt(document.getElementById('discount').value) || 0;
        const discount = discountValue === 0 ? '0' : `-${discountValue}%`;

        // 获取 tags
        const tagsInput = document.getElementById('tags').value.trim();
        const tags = tagsInput || `${category},home,shop,furniture`;

        // 获取图片URL
        let productPicture = this.getImageDataUrl('productPicture');
        let descriptionPicture = this.getImageDataUrl('descriptionPicture');

        // 基础表单数据（用户可编辑的字段）
        const formData = {
            name: document.getElementById('productName').value.trim(),
            product_picture: productPicture,
            description_picture: descriptionPicture || '',
            brief: document.getElementById('brief').value.trim(),
            detail: document.getElementById('detail').value.trim() || "This product doesn't have a detail.",
            description: document.getElementById('description').value.trim() || "This product doesn't have a description.",
            price: parseFloat(document.getElementById('price').value) || 0,
            discount: discount,
            size: this.collectSizes(),
            color: this.collectColors(),
            number_of_remain: parseInt(document.getElementById('stock').value) || 0,
            category: category,
            tags: tags,
            additional_information: document.getElementById('additionalInfo').value.trim() || "This product doesn't have additional information."
        };

        // 编辑模式：保留原有的不可编辑数据（增量修改）
        if (this.editMode && this.editingProduct) {
            // 保留原有的 SKU、launch_time、review、average_rate
            formData.SKU = this.editingProduct.SKU;
            formData.launch_time = this.editingProduct.launch_time;
            formData.average_rate = this.editingProduct.average_rate ?? 5;
            formData.review = this.editingProduct.review ?? {};
            formData.id = this.editingProduct.id;
            
            // 如果没有新图片，保留原图片
            if (!productPicture && this.editingProduct.product_picture) {
                formData.product_picture = this.editingProduct.product_picture;
            }
            if (!descriptionPicture && this.editingProduct.description_picture) {
                formData.description_picture = this.editingProduct.description_picture;
            }
        } else {
            // 新增模式：使用 ProductRepository 生成 SKU
            formData.SKU = window.productRepository?.generateSKU(category) || this.generateSKU(category);
            formData.launch_time = launchTime;
            formData.average_rate = 5;
            formData.review = {};
        }

        return formData;
    }

    /**
     * 获取图片数据URL
     */
    getImageDataUrl(inputId) {
        const preview = document.getElementById(inputId + 'Preview');
        const img = preview?.querySelector('img');
        return img ? img.src : '';
    }

    /**
     * 收集 Size 数据
     */
    collectSizes() {
        const sizes = {};
        document.querySelectorAll('.size-row').forEach(row => {
            const name = row.querySelector('.size-name-input')?.value.trim();
            const dims = row.querySelectorAll('.size-dimension-input');
            if (name && dims.length === 3) {
                const [l, w, h] = [dims[0].value, dims[1].value, dims[2].value];
                if (l && w && h) {
                    sizes[name] = `${l} * ${w} * ${h}`;
                }
            }
        });
        return sizes;
    }

    /**
     * 收集 Color 数据
     */
    collectColors() {
        const colors = {};
        document.querySelectorAll('.color-row').forEach(row => {
            const name = row.querySelector('.color-name-input')?.value.trim();
            const hex = row.querySelector('.color-hex-input')?.value.trim();
            if (name && hex) {
                colors[name] = hex;
            }
        });
        return colors;
    }

    /**
     * 生成 SKU
     */
    generateSKU(category) {
        const prefix = this.skuPrefixes[category] || 'XX';
        let maxNumber = 0;

        if (window.productRepository) {
            window.productRepository.query(p => p.category === category).forEach(product => {
                if (product.SKU?.startsWith(prefix)) {
                    const num = parseInt(product.SKU.slice(prefix.length), 10);
                    if (!isNaN(num) && num > maxNumber) maxNumber = num;
                }
            });
        }

        return `${prefix}${String(maxNumber + 1).padStart(3, '0')}`;
    }

    /**
     * 进入编辑模式 - 加载产品数据到表单
     */
    loadProductForEdit(product) {
        this.editMode = true;
        this.editingProductId = product.id;
        this.editingProduct = product; // 保存完整产品对象用于增量修改

        // 填充基本字段
        document.getElementById('productName').value = product.name || '';
        document.getElementById('category').value = product.category || '';
        document.getElementById('brief').value = product.brief || '';
        document.getElementById('price').value = product.price || 0;
        
        // 解析折扣
        let discountValue = 0;
        if (product.discount && product.discount !== '0') {
            discountValue = parseInt(product.discount.replace(/[-%]/g, '')) || 0;
        }
        document.getElementById('discount').value = discountValue;
        
        document.getElementById('stock').value = product.number_of_remain || 0;
        document.getElementById('detail').value = product.detail === "This product doesn't have a detail." ? '' : (product.detail || '');
        document.getElementById('description').value = product.description === "This product doesn't have a description." ? '' : (product.description || '');
        document.getElementById('tags').value = product.tags || '';
        document.getElementById('additionalInfo').value = product.additional_information === "This product doesn't have additional information." ? '' : (product.additional_information || '');

        // 加载图片预览
        this.renderer.setImagePreview('productPicture', product.product_picture);
        this.renderer.setImagePreview('descriptionPicture', product.description_picture);

        // 加载 Size 数据
        this.renderer.clearSizeRows();
        if (product.size && Object.keys(product.size).length > 0) {
            Object.entries(product.size).forEach(([name, dimensions]) => {
                this.renderer.addSizeRow({ name, dimensions });
            });
        } else {
            this.renderer.addSizeRow();
        }

        // 加载 Color 数据
        this.renderer.clearColorRows();
        if (product.color && Object.keys(product.color).length > 0) {
            Object.entries(product.color).forEach(([name, hex]) => {
                this.renderer.addColorRow({ name, hex });
            });
        } else {
            this.renderer.addColorRow();
        }

        // 更新表单标题和按钮
        const formTitle = document.querySelector('.form-title');
        const submitBtn = document.querySelector('.form-submit-btn');
        if (formTitle) formTitle.textContent = 'Edit Product';
        if (submitBtn) submitBtn.textContent = 'Update Product';

        // 滚动到表单顶部
        document.querySelector('.manage-container')?.scrollIntoView({ behavior: 'smooth' });
    }

    /**
     * 退出编辑模式
     */
    exitEditMode() {
        this.editMode = false;
        this.editingProductId = null;
        this.editingProduct = null;

        // 恢复表单标题和按钮
        const formTitle = document.querySelector('.form-title');
        const submitBtn = document.querySelector('.form-submit-btn');
        if (formTitle) formTitle.textContent = 'Add New Product';
        if (submitBtn) submitBtn.textContent = 'Add Product';
    }

    /**
     * 重置管理器状态
     */
    reset() {
        this.exitEditMode();
        this.form.reset();
        this.renderer.resetUI();
    }

    /**
     * 是否在编辑模式
     */
    isEditMode() {
        return this.editMode;
    }

    /**
     * 获取正在编辑的产品ID
     */
    getEditingProductId() {
        return this.editingProductId;
    }
}

// Export to window
if (typeof window !== 'undefined') {
    window.ManageFormManager = ManageFormManager;
}
