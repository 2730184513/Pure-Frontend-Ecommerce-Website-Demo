/**
 * LoginManager - 登录/注册页面主控制器
 * 持有并协调三个表单处理器：LoginFormHandler, SignUpFormHandler, ForgotPasswordFormHandler
 * 负责动画控制和页面切换逻辑
 */
class LoginManager {
    constructor() {
        // DOM 元素
        this.container = null;
        this.formContent = null;
        
        // 表单渲染器
        this.formRenderer = null;
        
        // 表单处理器
        this.loginHandler = null;
        this.signUpHandler = null;
        this.forgotHandler = null;
        
        // 当前面板状态: 'login' | 'signup' | 'forgot'
        this.currentPanel = 'login';
    }

    /**
     * 初始化管理器
     */
    async init() {
        console.log('🔐 Initializing Login Manager...');
        
        // 获取 DOM 元素
        this.container = document.getElementById('login-container');
        this.formContent = document.getElementById('login-form-content');
        
        if (!this.container || !this.formContent) {
            console.error('Required DOM elements not found');
            return;
        }
        
        // 初始化表单渲染器
        this.formRenderer = new window.FormRenderer(this.formContent);
        
        // 初始化表单处理器
        this.initializeHandlers();
        
        // 渲染登录表单
        this.loginHandler.render();
        
        // 绑定右侧面板事件
        this.bindImagePanelEvents();
        
        // 绑定键盘事件
        this.bindKeyboardEvents();
        
        console.log('✓ Login Manager initialized');
    }

    /**
     * 初始化三个表单处理器
     */
    initializeHandlers() {
        // 登录表单处理器
        this.loginHandler = new window.LoginFormHandler(
            this.formContent,
            this.formRenderer,
            {
                onSignUpClick: () => this.showSignUp(),
                onForgotClick: () => this.showForgotPassword(),
                onLoginSuccess: (data) => this.handleLoginSuccess(data)
            }
        );

        // 注册表单处理器
        this.signUpHandler = new window.SignUpFormHandler(
            this.formContent,
            this.formRenderer,
            {
                onBackClick: () => this.showLogin(),
                onSignUpSuccess: (data) => this.handleSignUpSuccess(data)
            }
        );

        // 忘记密码表单处理器
        this.forgotHandler = new window.ForgotPasswordFormHandler(
            this.formContent,
            this.formRenderer,
            {
                onBackClick: () => this.showLogin(),
                onResetSuccess: (data) => this.handleResetSuccess(data)
            }
        );
    }

    /**
     * 绑定右侧图片面板事件
     */
    bindImagePanelEvents() {
        // Sign Up 链接 (右侧面板)
        const signUpBtnHeader = document.getElementById('signUpBtnHeader');
        if (signUpBtnHeader) {
            signUpBtnHeader.addEventListener('click', (e) => {
                e.preventDefault();
                this.showSignUp();
            });
        }
        
        // Join Us 按钮
        const joinUsBtn = document.getElementById('joinUsBtn');
        if (joinUsBtn) {
            joinUsBtn.addEventListener('click', () => {
                window.location.href = '/201-project/about.html';
            });
        }
    }

    /**
     * 绑定键盘事件
     */
    bindKeyboardEvents() {
        document.addEventListener('keydown', (e) => {
            if ((this.currentPanel === 'signup' || this.currentPanel === 'forgot') && 
                (e.key === 'Escape' || e.key === 'Esc')) {
                this.showLogin();
            }
        });
    }

    /**
     * 显示登录表单
     */
    showLogin() {
        // 先移除动画类
        this.swapBack();
        
        // 等待动画完成后再渲染
        setTimeout(() => {
            this.loginHandler.render();
            this.currentPanel = 'login';
        }, 350); // 动画一半时切换内容，使过渡更流畅
    }

    /**
     * 显示注册表单
     */
    showSignUp() {
        // 渲染表单
        this.signUpHandler.render();
        this.currentPanel = 'signup';
        
        // 触发动画：图片滑到左侧，表单滑到右侧
        this.swapPanels();
    }

    /**
     * 显示忘记密码表单
     */
    showForgotPassword() {
        // 渲染表单
        this.forgotHandler.render();
        this.currentPanel = 'forgot';
        
        // 触发动画：图片滑到左侧，表单滑到右侧
        this.swapPanels();
    }

    /**
     * 交换两个面板位置（图片到左，表单到右）
     */
    swapPanels() {
        if (this.container) {
            this.container.classList.add('swapped');
        }
    }

    /**
     * 恢复原始位置（表单到左，图片到右）
     */
    swapBack() {
        if (this.container) {
            this.container.classList.remove('swapped');
        }
    }

    /**
     * 处理登录成功
     */
    handleLoginSuccess(data) {
        console.log('Login success:', data);
        // 可以在这里添加额外的登录成功处理逻辑
    }

    /**
     * 处理注册成功
     */
    handleSignUpSuccess(data) {
        console.log('Sign up success:', data);
        // 延迟返回登录页
        setTimeout(() => {
            this.showLogin();
        }, 1500);
    }

    /**
     * 处理密码重置成功
     */
    handleResetSuccess(data) {
        console.log('Password reset success:', data);
        // 延迟返回登录页
        setTimeout(() => {
            this.showLogin();
        }, 1500);
    }

    /**
     * 获取当前面板状态
     */
    getCurrentPanel() {
        return this.currentPanel;
    }

    /**
     * 销毁管理器
     */
    destroy() {
        if (this.loginHandler) this.loginHandler.destroy();
        if (this.signUpHandler) this.signUpHandler.destroy();
        if (this.forgotHandler) this.forgotHandler.destroy();
    }
}

// Export to window
if (typeof window !== 'undefined') {
    window.LoginManager = LoginManager;
}
