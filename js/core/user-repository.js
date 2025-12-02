/**
 * User Repository - Global Singleton
 * Pure data access layer for user accounts
 * Uses LocalStorage for persistence
 * Passwords are hashed using SHA-256 before storage
 */

class UserRepository {
    constructor() {
        this.STORAGE_KEY = 'furniro_users';
        this.users = [];
        this.dataLoaded = false;
        
        // Hardcoded Admin account configuration
        this.ADMIN_CONFIG = {
            email: 'admin@admin.com',
            username: 'Admin',
            phone: '123456789',
            // Pre-computed SHA-256 hash of 'Admin@admin'
            passwordHash: '11d13c2116b4439b7afc9b1d2cd2b40e1c25e84a48d26e70501af38287d2da8b',
            id: 'admin-system',
            isAdmin: true,
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z'
        };
    }

    /**
     * Check if email is the admin email
     * @param {string} email - Email to check
     * @returns {boolean} True if admin email
     */
    isAdminEmail(email) {
        return email.toLowerCase() === this.ADMIN_CONFIG.email.toLowerCase();
    }

    /**
     * Check if user is admin
     * @param {Object} user - User object
     * @returns {boolean} True if admin
     */
    static isAdmin(user) {
        return user && (user.isAdmin === true || user.email?.toLowerCase() === 'admin@admin.com');
    }

    /**
     * Simple SHA-256 hash implementation using Web Crypto API
     * @param {string} message - The string to hash
     * @returns {Promise<string>} Hex-encoded hash
     */
    async hashPassword(message) {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }

    /**
     * Load all user data from LocalStorage
     */
    loadAll() {
        if (this.dataLoaded) {
            return;
        }

        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            this.users = stored ? JSON.parse(stored) : [];
            this.dataLoaded = true;
            console.log(`✓ UserRepository loaded ${this.users.length} users`);
        } catch (error) {
            console.error('✗ Error loading user data:', error);
            this.users = [];
            this.dataLoaded = true;
        }
    }

    /**
     * Save all user data to LocalStorage
     */
    saveAll() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.users));
        } catch (error) {
            console.error('✗ Error saving user data:', error);
            throw error;
        }
    }

    /**
     * Get all users (returns a copy without password hashes for security)
     * @returns {Array} Array of all users (without password hashes)
     */
    getAll() {
        return this.users.map(user => {
            const { passwordHash, ...safeUser } = user;
            return safeUser;
        });
    }

    /**
     * Get user by email (primary key)
     * @param {string} email - User email
     * @returns {Object|null} User object (without password hash) or null
     */
    getByEmail(email) {
        const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (!user) return null;
        
        const { passwordHash, ...safeUser } = user;
        return safeUser;
    }

    /**
     * Check if email exists
     * @param {string} email - Email to check
     * @returns {boolean} True if email exists
     */
    emailExists(email) {
        return this.users.some(u => u.email.toLowerCase() === email.toLowerCase());
    }

    /**
     * Register a new user
     * @param {Object} userData - User data { username, email, password, phone }
     * @returns {Promise<Object>} Result { success, message, user }
     */
    async register(userData) {
        const { username, email, password, phone } = userData;

        // Check if trying to register with admin email
        if (this.isAdminEmail(email)) {
            return {
                success: false,
                message: 'This email is reserved and cannot be used for registration'
            };
        }

        // Check if email already exists
        if (this.emailExists(email)) {
            return {
                success: false,
                message: 'This email is already registered'
            };
        }

        // Hash the password
        const passwordHash = await this.hashPassword(password);

        // Create new user
        const newUser = {
            id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            username,
            email: email.toLowerCase(),
            passwordHash,
            phone,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.users.push(newUser);
        this.saveAll();

        console.log(`✓ User registered: ${email}`);

        const { passwordHash: _, ...safeUser } = newUser;
        return {
            success: true,
            message: 'Registration successful',
            user: safeUser
        };
    }

    /**
     * Authenticate a user (login)
     * @param {string} email - User email
     * @param {string} password - User password (plain text)
     * @returns {Promise<Object>} Result { success, message, user }
     */
    async authenticate(email, password) {
        // Check if logging in as Admin
        if (this.isAdminEmail(email)) {
            const passwordHash = await this.hashPassword(password);
            
            if (passwordHash !== this.ADMIN_CONFIG.passwordHash) {
                return {
                    success: false,
                    message: 'Incorrect password. Please try again.',
                    errorType: 'wrong_password'
                };
            }

            console.log(`✓ Admin authenticated: ${email}`);

            const { passwordHash: _, ...safeAdmin } = this.ADMIN_CONFIG;
            return {
                success: true,
                message: 'Login successful',
                user: safeAdmin
            };
        }

        const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (!user) {
            return {
                success: false,
                message: 'No account found with this email address',
                errorType: 'email_not_found'
            };
        }

        // Hash the provided password and compare
        const passwordHash = await this.hashPassword(password);

        if (user.passwordHash !== passwordHash) {
            return {
                success: false,
                message: 'Incorrect password. Please try again.',
                errorType: 'wrong_password'
            };
        }

        console.log(`✓ User authenticated: ${email}`);

        const { passwordHash: _, ...safeUser } = user;
        return {
            success: true,
            message: 'Login successful',
            user: safeUser
        };
    }

    /**
     * Verify user identity for password reset
     * @param {string} email - User email
     * @param {string} phone - User phone
     * @returns {Object} Result { exists, matches, user }
     */
    verifyUserIdentity(email, phone) {
        const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (!user) {
            return {
                exists: false,
                matches: false,
                message: 'No account found with this email address'
            };
        }

        // Normalize phone numbers for comparison (remove spaces, dashes, etc.)
        const normalizePhone = (p) => p.replace(/[\s\-\(\)]/g, '');
        const userPhone = normalizePhone(user.phone);
        const inputPhone = normalizePhone(phone);

        if (userPhone !== inputPhone) {
            return {
                exists: true,
                matches: false,
                message: 'Email and phone number do not match our records'
            };
        }

        return {
            exists: true,
            matches: true,
            user: { email: user.email, username: user.username }
        };
    }

    /**
     * Reset user password
     * @param {string} email - User email
     * @param {string} phone - User phone (for verification)
     * @param {string} newPassword - New password (plain text)
     * @returns {Promise<Object>} Result { success, message }
     */
    async resetPassword(email, phone, newPassword) {
        // Check if trying to reset admin password
        if (this.isAdminEmail(email)) {
            return {
                success: false,
                message: 'Admin password cannot be changed'
            };
        }

        // First verify identity
        const verification = this.verifyUserIdentity(email, phone);
        
        if (!verification.exists) {
            return {
                success: false,
                message: 'No account found with this email address'
            };
        }

        if (!verification.matches) {
            return {
                success: false,
                message: 'Email and phone number do not match our records'
            };
        }

        const userIndex = this.users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
        const user = this.users[userIndex];

        // Hash the new password
        const newPasswordHash = await this.hashPassword(newPassword);

        // Check if new password is same as old password
        if (user.passwordHash === newPasswordHash) {
            return {
                success: false,
                message: 'New password cannot be the same as the old password'
            };
        }

        // Update password
        this.users[userIndex] = {
            ...user,
            passwordHash: newPasswordHash,
            updatedAt: new Date().toISOString()
        };

        this.saveAll();

        console.log(`✓ Password reset for: ${email}`);

        return {
            success: true,
            message: 'Password reset successful'
        };
    }

    /**
     * Update user profile
     * @param {string} email - User email (primary key)
     * @param {Object} updates - Updates to apply
     * @returns {Object|null} Updated user or null if not found
     */
    update(email, updates) {
        const index = this.users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
        
        if (index === -1) {
            return null;
        }

        // Don't allow updating email or password through this method
        const { email: _, passwordHash: __, password: ___, ...safeUpdates } = updates;

        this.users[index] = {
            ...this.users[index],
            ...safeUpdates,
            updatedAt: new Date().toISOString()
        };

        this.saveAll();

        const { passwordHash, ...safeUser } = this.users[index];
        return safeUser;
    }

    /**
     * Delete a user
     * @param {string} email - User email
     * @returns {boolean} True if deleted, false if not found
     */
    delete(email) {
        const index = this.users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
        
        if (index === -1) {
            return false;
        }

        this.users.splice(index, 1);
        this.saveAll();

        console.log(`✓ User deleted: ${email}`);
        return true;
    }

    /**
     * Get total count of users
     * @returns {number} Total number of users
     */
    getCount() {
        return this.users.length;
    }

    /**
     * Clear all data (for testing/reset purposes)
     */
    clear() {
        this.users = [];
        this.saveAll();
        console.log('✓ User repository cleared');
    }
}

// Create and expose global singleton instance
if (typeof window !== 'undefined') {
    window.UserRepository = UserRepository;
    window.userRepository = new UserRepository();
    // Load data immediately
    window.userRepository.loadAll();
}
