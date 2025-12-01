/**
 * SignUpFormHandler - 注册表单处理器
 * 负责注册表单的渲染、验证和提交逻辑
 */
class SignUpFormHandler extends BaseFormHandler {
    constructor(formContentElement, formRenderer, callbacks = {}) {
        super(formContentElement, formRenderer);
        this.onBackClick = callbacks.onBackClick || (() => {});
        this.onSignUpSuccess = callbacks.onSignUpSuccess || (() => {});
    }

    /**
     * 获取表单ID
     */
    getFormId() {
        return 'signUpForm';
    }

    /**
     * 获取表单HTML
     */
    getFormHTML() {
        return `
            <button type="button" class="login-back-btn" id="backToLoginBtn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Back to Login
            </button>
            <h2 class="login-form-title">Create Account</h2>
            <form class="login-form" id="signUpForm" novalidate>
                <div class="form-group">
                    <label for="signupUser">Username<span class="required">*</span></label>
                    <input type="text" id="signupUser" name="signupUser" required minlength="3" maxlength="30"
                           pattern="^[a-zA-Z0-9_]+$" data-error="Username must be 3-30 characters (letters, numbers, underscore)">
                    <span class="error-message"></span>
                </div>
                <div class="form-group">
                    <label for="signupEmail">Email<span class="required">*</span></label>
                    <input type="email" id="signupEmail" name="signupEmail" required
                           pattern="^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$" data-error="Please enter a valid email address">
                    <span class="error-message"></span>
                </div>
                <div class="form-group">
                    <label for="signupPassword">Password<span class="required">*</span></label>
                    <input type="password" id="signupPassword" name="signupPassword" required minlength="6"
                           data-error="Password must be at least 6 characters">
                    <span class="error-message"></span>
                </div>
                <div class="form-group">
                    <label for="signupConfirmPassword">Confirm Password<span class="required">*</span></label>
                    <input type="password" id="signupConfirmPassword" name="signupConfirmPassword" required
                           data-error="Please confirm your password">
                    <span class="error-message"></span>
                </div>
                <div class="form-group">
                    <label for="signupTel">Phone<span class="required">*</span></label>
                    <input type="tel" id="signupTel" name="signupTel" required
                           pattern="^[0-9+\\-\\s()]+$" minlength="7" data-error="Please enter a valid phone number">
                    <span class="error-message"></span>
                </div>
                <button type="submit" class="login-submit-btn">Sign Up</button>
            </form>
        `;
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

        // 表单提交
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
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
     * 处理注册提交
     */
    async handleSubmit(e) {
        e.preventDefault();

        // 先验证密码匹配
        if (!this.validatePasswordMatch()) {
            this.showToast('Passwords do not match', 'error');
            return;
        }

        if (!this.validateAll()) {
            this.showToast('Please check the form and fix any errors', 'error');
            return;
        }

        const username = document.getElementById('signupUser').value;
        const email = document.getElementById('signupEmail').value;
        const tel = document.getElementById('signupTel').value;

        this.setButtonLoading(true, 'Signing up...', 'Sign Up');

        try {
            // 模拟注册请求
            await new Promise(resolve => setTimeout(resolve, 1000));

            this.showToast('Account created successfully! Please login.', 'success');

            // 通知成功
            this.onSignUpSuccess({ username, email, tel });

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
