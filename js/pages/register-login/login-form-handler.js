/**
 * LoginFormHandler - 登录表单处理器
 * 负责登录表单的渲染、验证和提交逻辑
 * 使用 FormRenderer 和 FormFieldFactory 进行声明式表单渲染
 */
class LoginFormHandler extends BaseFormHandler {
    constructor(formContentElement, formRenderer, callbacks = {}) {
        super(formContentElement, formRenderer);
        this.onSignUpClick = callbacks.onSignUpClick || (() => {});
        this.onForgotClick = callbacks.onForgotClick || (() => {});
        this.onLoginSuccess = callbacks.onLoginSuccess || (() => {});
        this.onLogin = callbacks.onLogin || (() => Promise.resolve({ success: true }));
    }

    /**
     * 获取表单ID
     */
    getFormId() {
        return 'loginForm';
    }

    /**
     * 获取表单字段配置
     * @returns {Array} 字段配置数组
     */
    getFieldsConfig() {
        return [
            {
                type: 'email',
                id: 'email',
                name: 'email',
                label: 'Email',
                required: true,
                pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
                dataError: 'Please enter a valid email address'
            },
            {
                type: 'password',
                id: 'password',
                name: 'password',
                label: 'Password',
                required: true,
                minlength: 6,
                showStrength: false,
                showRequirements: false,
                dataError: 'Password must be at least 6 characters'
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
                text: 'Log In',
                id: 'loginSubmitBtn',
                className: 'login-submit-btn'
            },
            footerLink: {
                text: "Don't have an account?",
                linkText: 'Sign up',
                linkId: 'signUpBtnFooter'
            }
        };
    }

    /**
     * 获取表单HTML（包含logo和header）
     */
    getFormHTML() {
        const formConfig = this.getFormConfig();
        
        // 自定义头部（包含 logo）
        const headerHtml = `
            <header class="login-header">
                <img src="/201-project/images/icons/Logo.png" alt="Furniro Logo" class="login-logo-img">
                <div class="login-logo-text">Furniro.</div>
            </header>
            <h1 class="login-greeting">Hi there!</h1>
            <div class="login-subtitle">Welcome to Furniro.</div>
        `;
        
        // 使用 FormFieldFactory 生成字段
        const fieldsHtml = formConfig.fields.map(field => {
            return this.formRenderer.renderField(field);
        }).join('');

        // 忘记密码链接
        const forgotLinkHtml = `
            <div class="login-form-footer">
                <a href="#" id="forgotPasswordBtn" class="login-forgot-password">Forgot password?</a>
            </div>
        `;

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
                ${forgotLinkHtml}
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
        // Sign Up 链接
        const signUpBtn = document.getElementById('signUpBtnFooter');
        if (signUpBtn) {
            signUpBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.onSignUpClick();
            });
        }

        // Forgot Password 链接
        const forgotBtn = document.getElementById('forgotPasswordBtn');
        if (forgotBtn) {
            forgotBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.onForgotClick();
            });
        }

        // 表单提交
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    }

    /**
     * 处理登录提交
     */
    async handleSubmit(e) {
        e.preventDefault();

        if (!this.validateAll()) {
            this.showToast('Please check the form and fix any errors', 'error');
            return;
        }

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        this.setButtonLoading(true, 'Logging in...', 'Log In');

        try {
            // 调用登录函数
            const result = await this.onLogin(email, password);

            if (result.success) {
                // 登录成功
                this.showToast('Login successful! Redirecting...', 'success');

                // 存储用户信息（使用与 UserManager 一致的 key）
                localStorage.setItem('furniro_current_user', JSON.stringify(result.user));

                // 触发用户登录事件，通知 UserManager
                window.dispatchEvent(new CustomEvent('userLoggedIn', {
                    detail: { user: result.user }
                }));

                // 通知成功
                this.onLoginSuccess(result.user);

                // 检查是否有待处理的搜索关键词
                const pendingSearchKeyword = sessionStorage.getItem('pending_search_keyword');
                
                if (pendingSearchKeyword) {
                    // 有待搜索的关键词，跳转到 shop 页面
                    // 确保 productFilter 有该关键词（以防页面刷新丢失）
                    if (window.productFilter) {
                        window.productFilter.setSearchKeyword(pendingSearchKeyword);
                    }
                    // 同时保存到 localStorage 供 shop 页面读取
                    localStorage.setItem('shop_search_query', pendingSearchKeyword);
                    // 清除待处理标记
                    sessionStorage.removeItem('pending_search_keyword');
                    
                    setTimeout(() => {
                        window.location.href = '/201-project/shop.html';
                    }, 1500);
                } else {
                    // 没有待搜索关键词，跳转到首页
                    setTimeout(() => {
                        window.location.href = '/201-project/index.html';
                    }, 1500);
                }
            } else {
                // 登录失败，显示具体错误
                this.showToast(result.message, 'error');
                
                // 根据错误类型高亮对应字段
                if (result.errorType === 'email_not_found') {
                    const emailField = document.getElementById('email');
                    this.formRenderer.showFieldError(emailField, result.message);
                    this.formRenderer.flush();
                } else if (result.errorType === 'wrong_password') {
                    const passwordField = document.getElementById('password');
                    this.formRenderer.showFieldError(passwordField, result.message);
                    this.formRenderer.flush();
                }
            }

        } catch (error) {
            console.error('Login error:', error);
            this.showToast('Login failed. Please try again.', 'error');
        } finally {
            this.setButtonLoading(false, 'Logging in...', 'Log In');
        }
    }
}

// Export to window
if (typeof window !== 'undefined') {
    window.LoginFormHandler = LoginFormHandler;
}
