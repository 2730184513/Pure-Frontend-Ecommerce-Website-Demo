/**
 * User Dropdown Renderer
 * Handles the visual rendering and interactions of the user dropdown in header
 */
class UserDropdownRenderer {
    constructor(userManager) {
        this.userManager = userManager;
        this.icon = null;
        this.dropdown = null;
        this.hoverTimer = null;
        this.hoverDelay = 500; // 0.5s hover delay
    }

    /**
     * Initialize the dropdown renderer
     */
    init() {
        this.cacheDOM();
        this.createDropdown();
        this.bindEvents();
        this.render();
    }

    /**
     * Cache DOM elements
     */
    cacheDOM() {
        this.icon = document.querySelector('#icon-user');
        this.dropdown = document.getElementById('user-dropdown');
    }

    /**
     * Create dropdown structure if not exists
     */
    createDropdown() {
        if (!this.dropdown) {
            const headerContainer = document.querySelector('.header-container');
            if (headerContainer) {
                const userDrop = document.createElement('div');
                userDrop.id = 'user-dropdown';
                userDrop.className = 'header-dropdown user-dropdown';
                userDrop.innerHTML = '<div class="user-content"></div>';
                headerContainer.appendChild(userDrop);
                this.dropdown = userDrop;
            }
        }
    }

    /**
     * Bind event listeners for hover and click
     */
    bindEvents() {
        if (!this.icon || !this.dropdown) {
            console.warn('User elements not found');
            return;
        }

        // Click to show immediately
        this.icon.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showDropdown();
        });

        // Hover to show (0.5s delay)
        this.icon.addEventListener('mouseenter', () => {
            this.hoverTimer = setTimeout(() => {
                this.showDropdown();
            }, this.hoverDelay);
        });

        // Cancel timer if mouse leaves before delay
        this.icon.addEventListener('mouseleave', () => {
            if (this.hoverTimer) {
                clearTimeout(this.hoverTimer);
                this.hoverTimer = null;
            }
        });

        // Keep dropdown open when hovering over it
        this.dropdown.addEventListener('mouseenter', () => {
            this.dropdown.classList.add('active');
        });

        this.dropdown.addEventListener('mouseleave', () => {
            this.dropdown.classList.remove('active');
        });

        // Close dropdown when mouse leaves both icon and dropdown
        const hideDropdown = () => {
            setTimeout(() => {
                if (!this.icon.matches(':hover') && !this.dropdown.matches(':hover')) {
                    this.dropdown.classList.remove('active');
                }
            }, 100);
        };

        this.icon.addEventListener('mouseleave', hideDropdown);
        this.dropdown.addEventListener('mouseleave', hideDropdown);
    }

    /**
     * Show dropdown
     */
    showDropdown() {
        this.closeOtherDropdowns();
        this.render();
        this.dropdown.classList.add('active');
    }

    /**
     * Close other dropdowns (cart, wishlist, etc)
     */
    closeOtherDropdowns() {
        const dropdowns = document.querySelectorAll('.header-dropdown');
        dropdowns.forEach(d => {
            if (d !== this.dropdown) {
                d.classList.remove('active');
            }
        });
    }

    /**
     * Render user dropdown content
     */
    render() {
        const container = this.dropdown.querySelector('.user-content');
        if (!container) return;

        container.innerHTML = '';

        if (this.userManager.isLoggedIn()) {
            this.renderLoggedInContent(container);
        } else {
            this.renderGuestContent(container);
        }

        this.bindActionButtons(container);
    }

    /**
     * Check if current user is admin
     * @returns {boolean} True if admin
     */
    isAdmin() {
        const user = this.userManager.getCurrentUser();
        return user && (user.isAdmin === true || user.email?.toLowerCase() === 'admin@admin.com');
    }

    /**
     * Render content for logged-in users
     * @param {HTMLElement} container - Container element
     */
    renderLoggedInContent(container) {
        const user = this.userManager.getCurrentUser();
        const isAdmin = this.isAdmin();
        
        // Admin shows "Manage Inventory" at the top instead of "Change Password"
        const manageInventoryBtn = isAdmin 
            ? '<button class="user-action-btn admin-btn" id="manageInventoryBtn">Manage Inventory</button>'
            : '';
        const changePasswordBtn = isAdmin 
            ? ''
            : '<button class="user-action-btn" id="changePasswordBtn">Change Password</button>';
        
        container.innerHTML = `
            <div class="user-info">
                <div class="user-avatar">
                    <img src="./images/icons/user_avatar.png" alt="User Avatar">
                </div>
                <div class="user-details">
                    <span class="user-name">${this.escapeHtml(user.username || 'User')}${isAdmin ? ' <span class="admin-badge">Admin</span>' : ''}</span>
                    <span class="user-email">${this.escapeHtml(user.email || '')}</span>
                </div>
            </div>
            <div class="user-actions">
                ${manageInventoryBtn}
                <button class="user-action-btn" id="changeAccountBtn">Change Account</button>
                ${changePasswordBtn}
                <button class="user-action-btn logout-btn" id="logoutBtn">Log Out</button>
            </div>
        `;
    }

    /**
     * Render content for guest users
     * @param {HTMLElement} container - Container element
     */
    renderGuestContent(container) {
        container.innerHTML = `
            <div class="user-guest-message">
                <div class="guest-icon">
                    <img src="./images/icons/user_avatar.png" alt="Guest">
                </div>
                <p class="guest-text">You are not logged in.</p>
                <p class="guest-subtext">Please log in for the complete user experience.</p>
                <button class="user-login-btn" id="loginBtn">Log In</button>
            </div>
        `;
    }

    /**
     * Bind action button events
     * @param {HTMLElement} container - Container element
     */
    bindActionButtons(container) {
        // Login button (guest)
        const loginBtn = container.querySelector('#loginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                window.location.href = './register-login.html';
            });
        }

        // Change account button (logged in)
        const changeAccountBtn = container.querySelector('#changeAccountBtn');
        if (changeAccountBtn) {
            changeAccountBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleChangeAccount();
            });
        }

        // Change password button (logged in, not for admin)
        const changePasswordBtn = container.querySelector('#changePasswordBtn');
        if (changePasswordBtn) {
            changePasswordBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleChangePassword();
            });
        }

        // Manage Inventory button (admin only)
        const manageInventoryBtn = container.querySelector('#manageInventoryBtn');
        if (manageInventoryBtn) {
            manageInventoryBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleManageInventory();
            });
        }

        // Logout button (logged in)
        const logoutBtn = container.querySelector('#logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleLogout();
            });
        }
    }

    /**
     * Handle change account action
     * Does NOT clear localStorage, allows user to go back
     */
    handleChangeAccount() {
        // 不清除 localStorage，只是跳转到登录页
        // 用户可以通过浏览器返回按钮回到之前的页面
        window.location.href = './register-login.html';
    }

    /**
     * Handle change password action
     * Navigate to forgot password form
     */
    handleChangePassword() {
        // 设置标记，让 register-login 页面直接显示 forgot password 表单
        sessionStorage.setItem('show_forgot_password', 'true');
        window.location.href = './register-login.html';
    }

    /**
     * Handle manage inventory action (Admin only)
     * Navigate to inventory management page
     */
    handleManageInventory() {
        window.location.href = './manage.html';
    }

    /**
     * Handle logout action
     * Clears current session but keeps last_logged_account for auto-login
     */
    handleLogout() {
        const username = this.userManager.getCurrentUser()?.username || 'User';
        
        // 只清除当前登录状态，不清除 last_logged_account
        this.userManager.logout();
        
        // Show toast notification
        if (window.toast) {
            window.toast.success(`Goodbye, ${username}! You have been logged out.`);
        }
        
        // Close dropdown and re-render
        this.dropdown.classList.remove('active');
        this.render();
    }

    /**
     * Escape HTML special characters
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

if (typeof window !== 'undefined') {
    window.UserDropdownRenderer = UserDropdownRenderer;
}
