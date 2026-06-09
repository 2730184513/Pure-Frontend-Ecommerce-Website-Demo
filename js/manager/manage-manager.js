/**
 * ManageManager - 库存管理页面主控制器
 * 协调 ManageFormRenderer 和 ManageFormManager
 * 处理产品添加和修改
 */
class ManageManager {
    constructor(formId) {
        this.formId = formId;
        this.form = null;
        this.renderer = null;
        this.formManager = null;
    }

    /**
     * Initialize the manager
     */
    async initialize() {
        console.log('🔧 Initializing Manage Manager...');

        this.form = document.getElementById(this.formId);
        if (!this.form) {
            throw new Error('Form not found: ' + this.formId);
        }

        // Wait for product repository to be ready
        if (window.productRepository && !window.productRepository.dataLoaded) {
            await window.productRepository.loadAll();
        }

        // Initialize renderer (handles UI)
        this.renderer = new ManageFormRenderer(this.form);
        this.renderer.initialize();

        // Initialize form manager (handles business logic)
        this.formManager = new ManageFormManager(this.form, this.renderer);

        // Bind form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Bind clear all button
        this._bindClearAllButton();

        // Bind delete button
        this._bindDeleteButton();

        // Listen for modify product events from pop-up
        window.addEventListener('modifyProduct', (e) => this.handleModifyProduct(e));

        // Check URL for edit mode
        this.checkUrlForEditMode();

        console.log('✓ Manage Manager initialized');
    }

    /**
     * Bind clear all button event
     * @private
     */
    _bindClearAllButton() {
        const clearAllBtn = document.getElementById('clearAllBtn');
        if (!clearAllBtn) return;

        clearAllBtn.addEventListener('click', async () => {
            if (!window.confirmDialog) return;

            const confirmed = await window.confirmDialog.confirm({
                title: 'Clear All Data',
                message: 'Are you sure you want to clear all form data? This action cannot be undone.',
                confirmText: 'Clear All',
                cancelText: 'Cancel',
                danger: true
            });

            if (confirmed) {
                this.formManager.reset();
                if (window.toast) {
                    window.toast.info('Form cleared');
                }
            }
        });
    }

    /**
     * Bind delete button event
     * @private
     */
    _bindDeleteButton() {
        const deleteBtn = document.getElementById('deleteProductBtn');
        if (!deleteBtn) return;

        deleteBtn.addEventListener('click', async () => {
            if (!this.formManager.isEditMode() || !this.formManager.editingProduct) {
                return;
            }

            if (!window.confirmDialog) return;

            const product = this.formManager.editingProduct;
            const confirmed = await window.confirmDialog.confirmDeleteProduct(product);

            if (confirmed) {
                try {
                    // Delete product from repository
                    const deleted = window.productRepository.delete(product.id);
                    
                    if (deleted) {
                        window.productRepository.saveToLocalStorage();
                        
                        if (window.toast) {
                            window.toast.success(`Product "${product.name}" deleted successfully!`);
                        }

                        // Redirect to home page
                        setTimeout(() => {
                            window.location.href = './index.html';
                        }, 1500);
                    } else {
                        if (window.toast) {
                            window.toast.error('Failed to delete product');
                        }
                    }
                } catch (error) {
                    console.error('Failed to delete product:', error);
                    if (window.toast) {
                        window.toast.error('Failed to delete product: ' + error.message);
                    }
                }
            }
        });
    }

    /**
     * Update UI buttons based on edit mode
     * @private
     */
    _updateButtonsForMode(isEditMode) {
        const clearAllBtn = document.getElementById('clearAllBtn');
        const deleteBtn = document.getElementById('deleteProductBtn');

        if (clearAllBtn) {
            clearAllBtn.style.display = isEditMode ? 'none' : 'inline-block';
        }
        if (deleteBtn) {
            deleteBtn.style.display = isEditMode ? 'inline-block' : 'none';
        }
    }

    /**
     * Check URL parameters for edit mode
     */
    checkUrlForEditMode() {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('edit');
        
        if (productId && window.productRepository) {
            // Product ID is a string like "chair-0", "sofa-1", etc.
            // Do not parse as integer
            const product = window.productRepository.getById(productId);
            if (product) {
                console.log('📝 Loading product for edit:', product.name);
                this.formManager.loadProductForEdit(product);
                this._updateButtonsForMode(true);
                if (window.toast) {
                    window.toast.info(`Editing: ${product.name}`);
                }
            } else {
                console.warn('⚠️ Product not found with ID:', productId);
                this._updateButtonsForMode(false);
                if (window.toast) {
                    window.toast.warning(`Product not found: ${productId}`);
                }
            }
        } else {
            this._updateButtonsForMode(false);
        }
    }

    /**
     * Handle modify product event from pop-up
     */
    handleModifyProduct(event) {
        const product = event.detail?.product;
        if (!product) return;

        // Store product ID in sessionStorage and redirect to manage page
        sessionStorage.setItem('editProductId', product.id);
        window.location.href = `./manage.html?edit=${product.id}`;
    }

    /**
     * Handle form submission
     */
    async handleSubmit(event) {
        event.preventDefault();

        // Validate form
        if (!this.formManager.validate()) {
            if (window.toast) {
                window.toast.error('Please fix the errors in the form');
            }
            return;
        }

        // Collect form data
        const productData = this.formManager.collectFormData();

        // Disable submit button
        const submitBtn = this.form.querySelector('.form-submit-btn');
        const isEditMode = this.formManager.isEditMode();
        
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = isEditMode ? 'Updating Product...' : 'Adding Product...';
        }

        try {
            if (isEditMode) {
                // Update existing product
                const productId = this.formManager.getEditingProductId();
                productData.id = productId;
                
                window.productRepository.update(productId, productData);
                window.productRepository.saveToLocalStorage();

                console.log('✓ Product updated:', productData);

                if (window.toast) {
                    window.toast.success(`Product "${productData.name}" updated successfully!`);
                }

                // 成功后延迟返回首页
                setTimeout(() => {
                    window.location.href = './index.html';
                }, 1500);
                return;

            } else {
                // Add new product
                const newProduct = window.productRepository.add(productData);
                window.productRepository.saveToLocalStorage();

                console.log('✓ Product added:', newProduct);

                if (window.toast) {
                    window.toast.success(`Product "${productData.name}" added successfully! SKU: ${productData.SKU}`);
                }

                // 成功后延迟返回首页
                setTimeout(() => {
                    window.location.href = './index.html';
                }, 1500);
                return;
            }

        } catch (error) {
            console.error('Failed to save product:', error);
            if (window.toast) {
                window.toast.error('Failed to save product: ' + error.message);
            }
        } finally {
            // Re-enable submit button
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = this.formManager.isEditMode() ? 'Update Product' : 'Add Product';
            }
        }
    }
}

// Export to window
if (typeof window !== 'undefined') {
    window.ManageManager = ManageManager;
}
