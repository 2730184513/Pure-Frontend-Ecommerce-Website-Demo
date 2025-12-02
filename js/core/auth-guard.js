/**
 * Auth Guard - 登录状态检测工具（代理层）
 * 
 * 设计说明：
 * - UserManager 是用户状态的权威来源，位于 HeaderManager 中
 * - AuthGuard 作为静态代理，方便各组件调用（无需获取 UserManager 实例）
 * - 优先使用 window.userManagerInstance，降级到直接读取 localStorage
 * 
 * 组件结构：
 * main.js → HeaderManager → UserManager (window.userManagerInstance)
 *                              ↑
 * AuthGuard (静态代理) ─────────┘
 */
class AuthGuard {
    /**
     * 获取 UserManager 实例
     * @returns {UserManager|null}
     */
    static getUserManager() {
        return window.userManagerInstance || null;
    }

    /**
     * 检查用户是否已登录
     * @returns {boolean} 是否已登录
     */
    static isLoggedIn() {
        const userManager = this.getUserManager();
        if (userManager) {
            return userManager.isLoggedIn();
        }
        
        // 降级：直接读取 localStorage
        const stored = localStorage.getItem('furniro_current_user');
        if (stored) {
            try {
                const user = JSON.parse(stored);
                return user && user.email;
            } catch (e) {
                return false;
            }
        }
        return false;
    }

    /**
     * 获取当前用户
     * @returns {Object|null} 当前用户对象或 null
     */
    static getCurrentUser() {
        const userManager = this.getUserManager();
        if (userManager) {
            return userManager.getCurrentUser();
        }
        
        // 降级：直接读取 localStorage
        const stored = localStorage.getItem('furniro_current_user');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                return null;
            }
        }
        return null;
    }

    /**
     * 获取当前用户 email
     * @returns {string} 用户 email 或 'guest'
     */
    static getCurrentUserEmail() {
        const userManager = this.getUserManager();
        if (userManager) {
            return userManager.getCurrentUserEmail();
        }
        
        const user = this.getCurrentUser();
        return user?.email || 'guest';
    }

    /**
     * 要求登录 - 如果未登录则直接跳转
     * @param {string} actionName - 操作名称（用于提示信息）
     * @returns {boolean} 是否已登录
     */
    static requireLogin(actionName = 'this feature') {
        const userManager = this.getUserManager();
        if (userManager) {
            return userManager.requireLogin(actionName);
        }
        
        // 降级逻辑
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
    static checkLoginWithToast(actionName = 'this feature') {
        const userManager = this.getUserManager();
        if (userManager) {
            return userManager.checkLoginWithToast(actionName);
        }
        
        // 降级逻辑
        return this.isLoggedIn();
    }
}

// Export to window
if (typeof window !== 'undefined') {
    window.AuthGuard = AuthGuard;
}
