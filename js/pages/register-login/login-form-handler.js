/**
 * LoginFormHandler - 登录表单处理器
 * 负责登录表单的渲染、验证和提交逻辑
 */
class LoginFormHandler extends BaseFormHandler {
    constructor(formContentElement, formRenderer, callbacks = {}) {
        super(formContentElement, formRenderer);
        this.onSignUpClick = callbacks.onSignUpClick || (() => {});
        this.onForgotClick = callbacks.onForgotClick || (() => {});
        this.onLoginSuccess = callbacks.onLoginSuccess || (() => {});
    }

    /**
     * 获取表单ID
     */
    getFormId() {
        return 'loginForm';
    }

    /**
     * 获取表单HTML
     */
    getFormHTML() {
        return `
            <header class="login-header">
                <img src="/201-project/images/icons/Logo.png" alt="Furniro Logo" class="login-logo-img">
                <div class="login-logo-text">Furniro.</div>
            </header>
            <h1 class="login-greeting">Hi there!</h1>
            <div class="login-subtitle">Welcome to Furniro.</div>
            <form class="login-form" id="loginForm" novalidate>
                <div class="form-group">
                    <label for="email">Email<span class="required">*</span></label>
                    <input type="email" id="email" name="email" required
                           pattern="^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$" data-error="Please enter a valid email address">
                    <span class="error-message"></span>
                </div>
                <div class="form-group">
                    <label for="password">Password<span class="required">*</span></label>
                    <input type="password" id="password" name="password" required minlength="6"
                           data-error="Password must be at least 6 characters">
                    <span class="error-message"></span>
                </div>
                <div class="login-form-footer">
                    <a href="#" id="forgotPasswordBtn" class="login-forgot-password">Forgot password?</a>
                </div>
                <button type="submit" class="login-submit-btn">Log In</button>
            </form>
            <div class="login-signup-prompt">
                Don't have an account? <a href="#" id="signUpBtnFooter" class="login-signup-link">Sign up</a>
            </div>
        `;
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
            // 模拟登录请求
            await new Promise(resolve => setTimeout(resolve, 1000));

            // 登录成功
            this.showToast('Login successful! Redirecting...', 'success');

            // 存储用户信息（模拟）
            localStorage.setItem('user', JSON.stringify({ email }));

            // 通知成功
            this.onLoginSuccess({ email });

            // 跳转到首页
            setTimeout(() => {
                window.location.href = '/201-project/index.html';
            }, 1500);

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
