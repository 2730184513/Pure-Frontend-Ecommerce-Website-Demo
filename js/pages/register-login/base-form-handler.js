/**
 * BaseFormHandler - 表单处理器基类
 * 提供通用的表单验证、渲染和事件绑定功能
 */
class BaseFormHandler {
    constructor(formContentElement, formRenderer) {
        this.formContent = formContentElement;
        this.formRenderer = formRenderer;
        this.validators = new Map();
        this.form = null;
    }

    /**
     * 渲染表单HTML
     * @returns {string} 表单HTML字符串
     */
    getFormHTML() {
        throw new Error('Subclass must implement getFormHTML()');
    }

    /**
     * 获取表单ID
     * @returns {string}
     */
    getFormId() {
        throw new Error('Subclass must implement getFormId()');
    }

    /**
     * 渲染表单到容器
     */
    render() {
        this.formContent.innerHTML = this.getFormHTML();
        this.form = document.getElementById(this.getFormId());
        this.initializeValidators();
        this.bindEvents();
    }

    /**
     * 初始化字段验证器
     */
    initializeValidators() {
        this.validators.clear();
        
        if (!this.form) return;
        
        const fields = this.form.querySelectorAll('input');
        fields.forEach(field => {
            if (field.id) {
                const validator = new window.FieldValidator(field);
                this.validators.set(field.id, validator);
                this.bindFieldValidation(field, validator);
            }
        });
    }

    /**
     * 绑定字段验证事件
     */
    bindFieldValidation(field, validator) {
        field.addEventListener('focus', () => {
            this.formRenderer.clearFieldError(field);
            this.formRenderer.flush();
        });

        field.addEventListener('blur', () => {
            validator.markAsTouched();
            this.validateField(field, validator);
        });

        field.addEventListener('input', () => {
            if (field.classList.contains('invalid')) {
                this.validateField(field, validator);
            }
        });
    }

    /**
     * 验证单个字段
     */
    validateField(field, validator) {
        const result = validator.validate();

        if (!result.valid) {
            this.formRenderer.showFieldError(field, result.message);
        } else {
            this.formRenderer.clearFieldError(field);
        }

        this.formRenderer.flush();
        return result.valid;
    }

    /**
     * 验证所有字段
     */
    validateAll() {
        let isValid = true;
        let firstInvalidField = null;

        this.validators.forEach((validator, fieldId) => {
            validator.markAsTouched();
            const field = document.getElementById(fieldId);
            const result = validator.validate();

            if (!result.valid) {
                this.formRenderer.showFieldError(field, result.message);
                isValid = false;
                if (!firstInvalidField) firstInvalidField = field;
            }
        });

        this.formRenderer.flush();

        if (!isValid && firstInvalidField) {
            setTimeout(() => {
                this.formRenderer.scrollToField(firstInvalidField);
            }, 100);
        }

        return isValid;
    }

    /**
     * 绑定事件 - 子类实现
     */
    bindEvents() {
        // 子类实现
    }

    /**
     * 处理表单提交 - 子类实现
     */
    async handleSubmit(e) {
        throw new Error('Subclass must implement handleSubmit()');
    }

    /**
     * 设置按钮加载状态
     */
    setButtonLoading(loading, loadingText = 'Processing...', normalText = 'Submit') {
        const submitBtn = this.form?.querySelector('.login-submit-btn');
        if (submitBtn) {
            submitBtn.disabled = loading;
            submitBtn.textContent = loading ? loadingText : normalText;
        }
    }

    /**
     * 显示 Toast 消息
     */
    showToast(message, type = 'info') {
        if (window.toastManager) {
            window.toastManager.show(message, type);
        }
    }

    /**
     * 销毁处理器
     */
    destroy() {
        this.validators.clear();
        this.form = null;
    }
}

// Export to window
if (typeof window !== 'undefined') {
    window.BaseFormHandler = BaseFormHandler;
}
