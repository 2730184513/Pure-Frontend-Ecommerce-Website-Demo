/**
 * User Manager
 * Handles user authentication state and session management
 * Provides global authentication guard functionality for all components
 */
class UserManager {
    constructor() {
        this.currentUser = null;
        this.dropdownRenderer = null;
        this.isInitialized = false;
        this.storageKey = 'furniro_current_user';
    }

    /**
     * Initialize user manager
     */
    init() {
        if (this.isInitialized) return;

        this.loadCurrentUser();
        this.setupEventListeners();

        // Initialize dropdown renderer
        this.dropdownRenderer = new UserDropdownRenderer(this);
        this.dropdownRenderer.init();

        // 暴露实例到全局，供 AuthGuard 代理层和其他组件使用
        window.userManagerInstance = this;

        this.isInitialized = true;
    }

    /**
     * Load current user from localStorage
     */
    loadCurrentUser() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            try {
                this.currentUser = JSON.parse(stored);
            } catch (e) {
                console.error('Failed to parse stored user data:', e);
                this.currentUser = null;
                localStorage.removeItem(this.storageKey);
            }
        }
    }

    /**
     * Setup global event listeners
     */
    setupEventListeners() {
        // Listen for login events
        window.addEventListener('userLoggedIn', (e) => {
            this.setCurrentUser(e.detail.user);
        });

        // Listen for logout events
        window.addEventListener('userLoggedOut', () => {
            this.logout();
        });
    }

    /**
     * Check if user is logged in
     * @returns {boolean} True if user is logged in
     */
    isLoggedIn() {
        return this.currentUser !== null && this.currentUser.email;
    }

    /**
     * Get current user
     * @returns {Object|null} Current user object or null
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Get current user email
     * @returns {string} User email or 'guest'
     */
    getCurrentUserEmail() {
        return this.currentUser?.email || 'guest';
    }

    /**
     * Set current user (login)
     * @param {Object} user - User object with username, email, etc.
     */
    setCurrentUser(user) {
        this.currentUser = user;
        this.saveCurrentUser();
        
        // Update dropdown
        if (this.dropdownRenderer) {
            this.dropdownRenderer.render();
        }

        // Dispatch event for other components (cart, wishlist reload)
        window.dispatchEvent(new CustomEvent('userStateChanged', {
            detail: { user: this.currentUser, isLoggedIn: true }
        }));
    }

    /**
     * Save current user to localStorage
     */
    saveCurrentUser() {
        if (this.currentUser) {
            localStorage.setItem(this.storageKey, JSON.stringify(this.currentUser));
        } else {
            localStorage.removeItem(this.storageKey);
        }
    }

    /**
     * Logout current user
     */
    logout() {
        this.currentUser = null;
        localStorage.removeItem(this.storageKey);
        
        // Update dropdown
        if (this.dropdownRenderer) {
            this.dropdownRenderer.render();
        }

        // Dispatch event for other components
        window.dispatchEvent(new CustomEvent('userStateChanged', {
            detail: { user: null, isLoggedIn: false }
        }));
    }

    /**
     * Get user display name
     * @returns {string} Display name or 'Guest'
     */
    getDisplayName() {
        return this.currentUser?.username || 'Guest';
    }

    // ============================================================================
    // Auth Guard Methods - 登录校验功能
    // ============================================================================

    /**
     * 要求登录 - 如果未登录则直接跳转到登录页
     * @param {string} actionName - 操作名称（用于提示信息）
     * @returns {boolean} 是否已登录
     */
    requireLogin(actionName = 'this feature') {
        if (this.isLoggedIn()) {
            return true;
        }

        // 直接跳转到登录页
        window.location.href = '/201-project/register-login.html';
        return false;
    }

    /**
     * 检查登录状态，不跳转，只返回结果
     * @param {string} actionName - 操作名称
     * @returns {boolean} 是否已登录
     */
    checkLoginWithToast(actionName = 'this feature') {
        return this.isLoggedIn();
    }
}

if (typeof window !== 'undefined') {
    window.UserManager = UserManager;
}
