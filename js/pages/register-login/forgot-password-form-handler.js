/**
 * ForgotPasswordFormHandler - 忘记密码表单处理器
 * 负责重置密码表单的渲染、验证和提交逻辑
 */
class ForgotPasswordFormHandler extends BaseFormHandler {
    constructor(formContentElement, formRenderer, callbacks = {}) {
        super(formContentElement, formRenderer);
        this.onBackClick = callbacks.onBackClick || (() => {});
        this.onResetSuccess = callbacks.onResetSuccess || (() => {});
    }

    /**
     * 获取表单ID
     */
    getFormId() {
        return 'forgotForm';
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
            <h2 class="login-form-title">Reset Password</h2>
            <form class="login-form" id="forgotForm" novalidate>
                <div class="form-group">
                    <label for="forgotEmail">Email<span class="required">*</span></label>
                    <input type="email" id="forgotEmail" name="forgotEmail" required
                           pattern="^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$" data-error="Please enter a valid email address">
                    <span class="error-message"></span>
                </div>
                <div class="form-group">
                    <label for="forgotTel">Phone<span class="required">*</span></label>
                    <input type="tel" id="forgotTel" name="forgotTel" required
                           pattern="^[0-9+\\-\\s()]+$" minlength="7" data-error="Please enter a valid phone number">
                    <span class="error-message"></span>
                </div>
                <div class="form-group">
                    <label for="forgotNewPwd">New Password<span class="required">*</span></label>
                    <input type="password" id="forgotNewPwd" name="forgotNewPwd" required minlength="6"
                           data-error="Password must be at least 6 characters">
                    <span class="error-message"></span>
                </div>
                <div class="form-group">
                    <label for="forgotConfirmPwd">Confirm Password<span class="required">*</span></label>
                    <input type="password" id="forgotConfirmPwd" name="forgotConfirmPwd" required
                           data-error="Please confirm your password">
                    <span class="error-message"></span>
                </div>
                <button type="submit" class="login-submit-btn">Reset Password</button>
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
     * 处理密码重置提交
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

        const email = document.getElementById('forgotEmail').value;

        this.setButtonLoading(true, 'Resetting...', 'Reset Password');

        try {
            // 模拟重置密码请求
            await new Promise(resolve => setTimeout(resolve, 1000));

            this.showToast('Password reset successful! Please login with your new password.', 'success');

            // 通知成功
            this.onResetSuccess({ email });

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
