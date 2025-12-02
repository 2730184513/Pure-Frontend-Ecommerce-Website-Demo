/**
 * ForgotPasswordFormHandler - 忘记密码表单处理器
 * 负责重置密码表单的渲染、验证和提交逻辑
 * 使用 FormRenderer 和 FormFieldFactory 进行声明式表单渲染
 */
class ForgotPasswordFormHandler extends BaseFormHandler {
    constructor(formContentElement, formRenderer, callbacks = {}) {
        super(formContentElement, formRenderer);
        this.onBackClick = callbacks.onBackClick || (() => {});
        this.onResetSuccess = callbacks.onResetSuccess || (() => {});
        this.onResetPassword = callbacks.onResetPassword || (() => Promise.resolve({ success: true }));
        this.onVerifyUser = callbacks.onVerifyUser || (() => ({ exists: false }));
    }

    /**
     * 获取表单ID
     */
    getFormId() {
        return 'forgotForm';
    }

    /**
     * 获取表单字段配置
     * @returns {Array} 字段配置数组
     */
    getFieldsConfig() {
        return [
            {
                type: 'email',
                id: 'forgotEmail',
                name: 'forgotEmail',
                label: 'Email',
                required: true,
                pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
                dataError: 'Please enter a valid email address'
            },
            {
                type: 'tel',
                id: 'forgotTel',
                name: 'forgotTel',
                label: 'Phone',
                required: true,
                pattern: '^[0-9+\\-\\s()]+$',
                minlength: 7,
                dataError: 'Please enter a valid phone number'
            },
            {
                type: 'password',
                id: 'forgotNewPwd',
                name: 'forgotNewPwd',
                label: 'New Password',
                required: true,
                minlength: 8,
                showStrength: true,
                showRequirements: true,
                dataError: 'Password must meet the strength requirements'
            },
            {
                type: 'password',
                id: 'forgotConfirmPwd',
                name: 'forgotConfirmPwd',
                label: 'Confirm Password',
                required: true,
                showStrength: false,
                showRequirements: false,
                dataError: 'Please confirm your password'
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
                text: 'Reset Password',
                id: 'resetSubmitBtn',
                className: 'login-submit-btn'
            },
            footerLink: {
                text: '',
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
        const headerHtml = '<h2 class="login-form-title">Reset Password</h2>';
        
        // 使用 FormFieldFactory 生成字段
        const fieldsHtml = formConfig.fields.map(field => {
            return this.formRenderer.renderField(field);
        }).join('');

        // 提交按钮
        const submitBtnHtml = FormFieldFactory.createSubmitButton(formConfig.submitButton);

        // 底部链接
        const footerLinkHtml = `
            <div class="login-signup-prompt">
                <a href="#" id="${formConfig.footerLink.linkId}" class="login-signup-link">${formConfig.footerLink.linkText}</a>
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
        const passwordInput = document.getElementById('forgotNewPwd');
        if (passwordInput) {
            passwordInput.addEventListener('input', () => this.updatePasswordStrength());
        }

        // 密码确认实时检测
        const confirmInput = document.getElementById('forgotConfirmPwd');
        if (confirmInput) {
            confirmInput.addEventListener('input', () => this.checkPasswordMatch());
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
        const password = document.getElementById('forgotNewPwd')?.value || '';
        const strengthInfo = PasswordStrengthValidator.check(password);
        
        // 使用 FormRenderer 更新密码强度显示
        this.formRenderer.updatePasswordStrength('forgotNewPwd', strengthInfo);
        this.formRenderer.flush();

        return strengthInfo.isStrong;
    }

    /**
     * 检查密码是否匹配
     */
    checkPasswordMatch() {
        const password = document.getElementById('forgotNewPwd')?.value;
        const confirmPassword = document.getElementById('forgotConfirmPwd')?.value;
        const confirmField = document.getElementById('forgotConfirmPwd');

        if (confirmPassword && password !== confirmPassword) {
            confirmField?.classList.add('invalid');
            confirmField?.classList.remove('valid');
        } else if (confirmPassword && password === confirmPassword) {
            confirmField?.classList.remove('invalid');
            confirmField?.classList.add('valid');
        }
    }

    /**
     * 验证密码确认
     */
    validatePasswordMatch() {
        const newPassword = document.getElementById('forgotNewPwd')?.value;
        const confirmPassword = document.getElementById('forgotConfirmPwd')?.value;

        if (newPassword && confirmPassword && newPassword !== confirmPassword) {
            const confirmField = document.getElementById('forgotConfirmPwd');
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
        const password = document.getElementById('forgotNewPwd')?.value || '';
        
        if (!PasswordStrengthValidator.isValid(password)) {
            const passwordField = document.getElementById('forgotNewPwd');
            this.formRenderer.showFieldError(passwordField, 'Password does not meet all requirements');
            this.formRenderer.flush();
            return false;
        }
        return true;
    }

    /**
     * 处理密码重置提交
     */
    async handleSubmit(e) {
        e.preventDefault();

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

        const email = document.getElementById('forgotEmail').value;
        const phone = document.getElementById('forgotTel').value;
        const newPassword = document.getElementById('forgotNewPwd').value;

        this.setButtonLoading(true, 'Resetting...', 'Reset Password');

        try {
            // 调用重置密码函数
            const result = await this.onResetPassword({ email, phone, newPassword });

            if (result.success) {
                this.showToast('Password reset successful! Please login with your new password.', 'success');
                
                // 检查是否与当前登录账号相同，如果相同则清除当前登录状态
                const currentUser = localStorage.getItem('furniro_current_user');
                if (currentUser) {
                    try {
                        const user = JSON.parse(currentUser);
                        if (user.email && user.email.toLowerCase() === email.toLowerCase()) {
                            // 清除当前登录状态，因为密码已改变
                            localStorage.removeItem('furniro_current_user');
                            console.log('✓ Cleared current user session due to password change');
                        }
                    } catch (parseError) {
                        console.error('Error parsing current user:', parseError);
                    }
                }
                
                this.onResetSuccess({ email });
            } else {
                this.showToast(result.message || 'Password reset failed. Please try again.', 'error');
            }

        } catch (error) {
            console.error('Password reset error:', error);
            this.showToast('Password reset failed. Please try again.', 'error');
        } finally {
            this.setButtonLoading(false, 'Resetting...', 'Reset Password');
        }
    }
}

// Export to window
if (typeof window !== 'undefined') {
    window.ForgotPasswordFormHandler = ForgotPasswordFormHandler;
}
