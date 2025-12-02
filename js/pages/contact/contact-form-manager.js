/**
 * ContactFormManager - 联系表单管理器
 * 使用 FormRenderer 和 FormFieldFactory 进行声明式表单渲染
 * 负责联系表单的渲染、验证和提交逻辑
 */
class ContactFormManager {
    constructor() {
        this.formContainer = null;
        this.formRenderer = null;
        this.form = null;
        this.validators = new Map();
        this.isInitialized = false;
    }

    /**
     * 获取表单字段配置
     * @returns {Array} 字段配置数组
     */
    getFieldsConfig() {
        return [
            {
                type: 'text',
                id: 'name',
                name: 'name',
                label: 'Your Name',
                required: true,
                pattern: "^[A-Za-z\\s\\-']{2,100}$",
                dataError: 'Name must be 2-100 letters only',
                placeholder: 'Abc'
            },
            {
                type: 'email',
                id: 'email',
                name: 'email',
                label: 'Email Address',
                required: true,
                pattern: '^[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}$',
                dataError: 'Please enter a valid email address',
                placeholder: 'Abc@def.com'
            },
            {
                type: 'text',
                id: 'subject',
                name: 'subject',
                label: 'Subject',
                required: false,
                pattern: '^.{2,200}$',
                dataError: 'Subject must be 2-200 characters',
                placeholder: 'This is optional'
            },
            {
                type: 'textarea',
                id: 'message',
                name: 'message',
                label: 'Message',
                required: true,
                minlength: 10,
                maxlength: 1000,
                rows: 5,
                placeholder: "Hi! I'd like to ask about"
            }
        ];
    }

    /**
     * Initialize the contact form manager
     */
    async initialize() {
        if (this.isInitialized) return;

        try {
            // 获取表单容器
            this.formContainer = document.querySelector('.contact-form-section');
            if (!this.formContainer) {
                throw new Error('Contact form section not found');
            }

            // 初始化表单渲染器
            this.formRenderer = new FormRenderer(this.formContainer);

            // 渲染表单
            this.renderForm();

            // 获取表单元素
            this.form = document.getElementById('contactForm');
            if (!this.form) {
                throw new Error('Contact form not found after rendering');
            }

            // 初始化验证器
            this.initializeValidators();

            // 绑定事件
            this.bindFormEvents();

            this.isInitialized = true;
            console.log('Contact form manager initialized successfully');

        } catch (error) {
            console.error('Failed to initialize contact form manager:', error);
            throw error;
        }
    }

    /**
     * 渲染表单
     */
    renderForm() {
        const fieldsConfig = this.getFieldsConfig();
        
        // 表单头部
        const headerHtml = `
            <div class="contact-form-header">
                <div class="form-title-row">
                    <h2>Send us a message</h2>
                    <span class="required-note"><span class="required">*</span> indicates required field</span>
                </div>
            </div>
        `;

        // 使用 FormFieldFactory 生成字段
        const fieldsHtml = fieldsConfig.map(field => {
            return this.formRenderer.renderField(field);
        }).join('');

        // 提交按钮
        const submitBtnHtml = FormFieldFactory.createSubmitButton({
            text: 'Submit',
            id: 'contactSubmitBtn',
            className: 'form-submit-btn'
        });

        // 组装表单
        const formHtml = `
            ${headerHtml}
            <form id="contactForm" class="contact-form" novalidate>
                ${fieldsHtml}
                ${submitBtnHtml}
            </form>
        `;

        this.formContainer.innerHTML = formHtml;
    }

    /**
     * 初始化字段验证器
     */
    initializeValidators() {
        this.validators.clear();
        
        if (!this.form) return;
        
        const fields = this.form.querySelectorAll('input, textarea');
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
     * Bind form submission and validation events
     */
    bindFormEvents() {
        // Form submission
        this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
    }

    /**
     * Validate all form fields
     * @returns {boolean} True if all fields are valid
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
     * Handle form submission
     * @param {Event} e - Form submit event
     */
    async handleFormSubmit(e) {
        e.preventDefault();

        // Show loading state
        this.formRenderer.setButtonLoading('contactSubmitBtn', true, 'Sending...');
        this.formRenderer.flush();

        try {
            // Validate form
            if (!this.validateAll()) {
                // Show validation error toast
                if (window.toastManager) {
                    window.toastManager.show('Please check the form and fix any errors', 'error');
                }
                return;
            }

            // Get form data
            const formData = this.formRenderer.getFormData();
            const contactData = {
                name: formData.name,
                email: formData.email,
                subject: formData.subject || 'General Inquiry',
                message: formData.message,
                timestamp: new Date().toISOString()
            };

            // Simulate form submission (replace with actual API call)
            await this.submitContactForm(contactData);

            // Show success message and redirect
            this.showSuccessMessage();

            // Reset form
            this.formRenderer.resetForm();

        } catch (error) {
            console.error('Contact form submission error:', error);
            if (window.toastManager) {
                window.toastManager.show('Failed to send message. Please try again.', 'error');
            }
        } finally {
            // Restore button state
            this.formRenderer.setButtonLoading('contactSubmitBtn', false, 'Sending...');
            this.formRenderer.flush();
        }
    }

    /**
     * Submit contact form data (simulate API call)
     * @param {Object} contactData - Contact form data
     */
    async submitContactForm(contactData) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // In real implementation, this would be an actual API call
        console.log('Contact form data:', contactData);

        // Simulate success
        return { success: true, message: 'Contact form submitted successfully' };
    }

    /**
     * Show success message and redirect to home
     */
    showSuccessMessage() {
        if (window.toastManager) {
            window.toastManager.show('Thank you for your message! We will get back to you soon.', 'success');
        }

        // Redirect to home page after 2 seconds
        setTimeout(() => {
            window.location.href = '/201-project/index.html';
        }, 2000);
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.ContactFormManager = ContactFormManager;
}
