/**
 * SignUpFormHandler - 注册表单处理器
 * 负责注册表单的渲染、验证和提交逻辑
 * 使用 FormRenderer 和 FormFieldFactory 进行声明式表单渲染
 */
class SignUpFormHandler extends BaseFormHandler {
    constructor(formContentElement, formRenderer, callbacks = {}) {
        super(formContentElement, formRenderer);
        this.onBackClick = callbacks.onBackClick || (() => {});
        this.onSignUpSuccess = callbacks.onSignUpSuccess || (() => {});
        this.onRegister = callbacks.onRegister || (() => Promise.resolve({ success: true }));
        this.onCheckEmail = callbacks.onCheckEmail || (() => false);
    }

    /**
     * 获取表单ID
     */
    getFormId() {
        return 'signUpForm';
    }

    /**
     * 获取表单字段配置
     * @returns {Array} 字段配置数组
     */
    getFieldsConfig() {
        return [
            {
                type: 'text',
                id: 'signupUser',
                name: 'signupUser',
                label: 'Username',
                required: true,
                minlength: 3,
                maxlength: 30,
                pattern: '^[a-zA-Z0-9_]+$',
                dataError: 'Username must be 3-30 characters (letters, numbers, underscore)'
            },
            {
                type: 'email',
                id: 'signupEmail',
                name: 'signupEmail',
                label: 'Email',
                required: true,
                pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
                dataError: 'Please enter a valid email address'
            },
            {
                type: 'password',
                id: 'signupPassword',
                name: 'signupPassword',
                label: 'Password',
                required: true,
                minlength: 8,
                showStrength: true,
                showRequirements: true,
                dataError: 'Password must meet the strength requirements'
            },
            {
                type: 'password',
                id: 'signupConfirmPassword',
                name: 'signupConfirmPassword',
                label: 'Confirm Password',
                required: true,
                showStrength: false,
                showRequirements: false,
                matchField: 'signupPassword',
                matchError: 'Passwords do not match',
                dataError: 'Please confirm your password'
            },
            {
                type: 'tel',
                id: 'signupTel',
                name: 'signupTel',
                label: 'Phone',
                required: true,
                pattern: '^[0-9+\\-\\s()]+$',
                minlength: 7,
                dataError: 'Please enter a valid phone number'
            }
        ];
    }

    /**
     * 获取表单配置
     * @returns {Object} 表单配置对象
     */
    getFormConfig() {
        return {
            id: this.getFormId(),
            className: 'login-form',
            fields: this.getFieldsConfig(),
            submitButton: {
                text: 'Sign Up',
                id: 'signupSubmitBtn',
                className: 'login-submit-btn'
            },
            footerLink: {
                text: 'Already have an account?',
                linkText: 'Back to Login',
                linkId: 'backToLoginBtn'
            }
        };
    }

    /**
     * 获取表单HTML
     */
    getFormHTML() {
        const formConfig = this.getFormConfig();
        
        // 标题
        const headerHtml = '<h2 class="login-form-title">Create Account</h2>';
        
        // 使用 FormFieldFactory 生成字段
        const fieldsHtml = formConfig.fields.map(field => {
            return this.formRenderer.renderField(field);
        }).join('');

        // 提交按钮
        const submitBtnHtml = FormFieldFactory.createSubmitButton(formConfig.submitButton);

        // 底部链接
        const footerLinkHtml = `
            <div class="login-signup-prompt">
                ${formConfig.footerLink.text} <a href="#" id="${formConfig.footerLink.linkId}" class="login-signup-link">${formConfig.footerLink.linkText}</a>
            </div>
        `;

        // 组装表单
        const formHtml = `
            ${headerHtml}
            <form class="${formConfig.className}" id="${formConfig.id}" novalidate>
                ${fieldsHtml}
                ${submitBtnHtml}
            </form>
            ${footerLinkHtml}
        `;

        return formHtml;
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 返回按钮
        const backBtn = document.getElementById('backToLoginBtn');
        if (backBtn) {
            backBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.onBackClick();
            });
        }

        // 密码强度检测
        const passwordInput = document.getElementById('signupPassword');
        if (passwordInput) {
            passwordInput.addEventListener('input', () => this.updatePasswordStrength());
        }

        // 密码确认实时检测
        const confirmInput = document.getElementById('signupConfirmPassword');
        if (confirmInput) {
            confirmInput.addEventListener('input', () => this.checkPasswordMatch());
        }

        // 邮箱检查
        const emailInput = document.getElementById('signupEmail');
        if (emailInput) {
            emailInput.addEventListener('blur', () => this.checkEmailExists());
        }

        // 表单提交
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    }

    /**
     * 更新密码强度显示
     */
    updatePasswordStrength() {
        const password = document.getElementById('signupPassword')?.value || '';
        const strengthInfo = PasswordStrengthValidator.check(password);
        
        // 使用 FormRenderer 更新密码强度显示
        this.formRenderer.updatePasswordStrength('signupPassword', strengthInfo);
        this.formRenderer.flush();

        return strengthInfo.isStrong;
    }

    /**
     * 检查密码是否匹配
     */
    checkPasswordMatch() {
        const password = document.getElementById('signupPassword')?.value;
        const confirmPassword = document.getElementById('signupConfirmPassword')?.value;
        const confirmField = document.getElementById('signupConfirmPassword');

        if (confirmPassword && password !== confirmPassword) {
            confirmField?.classList.add('invalid');
            confirmField?.classList.remove('valid');
        } else if (confirmPassword && password === confirmPassword) {
            confirmField?.classList.remove('invalid');
            confirmField?.classList.add('valid');
        }
    }

    /**
     * 检查邮箱是否已存在
     */
    checkEmailExists() {
        const email = document.getElementById('signupEmail')?.value;
        if (!email) return;

        const exists = this.onCheckEmail(email);
        if (exists) {
            const emailField = document.getElementById('signupEmail');
            this.formRenderer.showFieldError(emailField, 'This email is already registered');
            this.formRenderer.flush();
        }
    }

    /**
     * 验证密码确认
     */
    validatePasswordMatch() {
        const password = document.getElementById('signupPassword')?.value;
        const confirmPassword = document.getElementById('signupConfirmPassword')?.value;

        if (password && confirmPassword && password !== confirmPassword) {
            const confirmField = document.getElementById('signupConfirmPassword');
            this.formRenderer.showFieldError(confirmField, 'Passwords do not match');
            this.formRenderer.flush();
            return false;
        }
        return true;
    }

    /**
     * 验证密码强度
     */
    validatePasswordStrength() {
        const password = document.getElementById('signupPassword')?.value || '';
        
        if (!PasswordStrengthValidator.isValid(password)) {
            const passwordField = document.getElementById('signupPassword');
            this.formRenderer.showFieldError(passwordField, 'Password does not meet all requirements');
            this.formRenderer.flush();
            return false;
        }
        return true;
    }

    /**
     * 处理注册提交
     */
    async handleSubmit(e) {
        e.preventDefault();

        // 验证邮箱是否已存在
        const email = document.getElementById('signupEmail').value;
        if (this.onCheckEmail(email)) {
            this.showToast('This email is already registered', 'error');
            return;
        }

        // 验证密码强度
        if (!this.validatePasswordStrength()) {
            this.showToast('Password does not meet the strength requirements', 'error');
            return;
        }

        // 验证密码匹配
        if (!this.validatePasswordMatch()) {
            this.showToast('Passwords do not match', 'error');
            return;
        }

        if (!this.validateAll()) {
            this.showToast('Please check the form and fix any errors', 'error');
            return;
        }

        const username = document.getElementById('signupUser').value;
        const password = document.getElementById('signupPassword').value;
        const tel = document.getElementById('signupTel').value;

        this.setButtonLoading(true, 'Signing up...', 'Sign Up');

        try {
            // 调用注册函数
            const result = await this.onRegister({ username, email, password, phone: tel });

            if (result.success) {
                this.showToast('Account created successfully! Please login.', 'success');
                this.onSignUpSuccess({ username, email, tel });
            } else {
                this.showToast(result.message || 'Sign up failed. Please try again.', 'error');
            }

        } catch (error) {
            console.error('Sign up error:', error);
            this.showToast('Sign up failed. Please try again.', 'error');
        } finally {
            this.setButtonLoading(false, 'Signing up...', 'Sign Up');
        }
    }
}

// Export to window
if (typeof window !== 'undefined') {
    window.SignUpFormHandler = SignUpFormHandler;
}
