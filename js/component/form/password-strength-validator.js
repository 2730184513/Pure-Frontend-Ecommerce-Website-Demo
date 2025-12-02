/**
 * PasswordStrengthValidator - 密码强度验证器
 * 提供密码强度检测和验证功能
 */
class PasswordStrengthValidator {
    /**
     * 密码要求配置
     */
    static REQUIREMENTS = {
        length: {
            test: (pwd) => pwd.length >= 8,
            text: 'At least 8 characters'
        },
        uppercase: {
            test: (pwd) => /[A-Z]/.test(pwd),
            text: 'One uppercase letter'
        },
        lowercase: {
            test: (pwd) => /[a-z]/.test(pwd),
            text: 'One lowercase letter'
        },
        number: {
            test: (pwd) => /[0-9]/.test(pwd),
            text: 'One number'
        },
        special: {
            test: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
            text: 'One special character (!@#$%^&*)'
        }
    };

    /**
     * 强度级别配置
     */
    static STRENGTH_LEVELS = [
        { minScore: 5, label: 'Strong', level: 'strong' },
        { minScore: 4, label: 'Good', level: 'good' },
        { minScore: 3, label: 'Fair', level: 'fair' },
        { minScore: 2, label: 'Weak', level: 'weak' },
        { minScore: 0, label: 'Too weak', level: 'weak' }
    ];

    /**
     * 检查密码强度
     * @param {string} password - 密码
     * @returns {Object} 强度信息
     */
    static check(password) {
        const pwd = password || '';
        
        // 检查各项要求
        const requirements = {};
        Object.keys(this.REQUIREMENTS).forEach(key => {
            requirements[key] = this.REQUIREMENTS[key].test(pwd);
        });

        // 计算满足的要求数量
        const metCount = Object.values(requirements).filter(Boolean).length;

        // 确定强度级别
        const level = this.STRENGTH_LEVELS.find(l => metCount >= l.minScore);

        return {
            score: metCount,
            maxScore: Object.keys(this.REQUIREMENTS).length,
            label: level.label,
            level: level.level,
            requirements,
            isStrong: metCount >= 4, // Good or above is acceptable
            percentage: (metCount / 5) * 100
        };
    }

    /**
     * 验证密码是否满足所有要求
     * @param {string} password - 密码
     * @returns {boolean}
     */
    static isValid(password) {
        return this.check(password).score >= 4; // Good (4 points) or above
    }

    /**
     * 获取密码要求列表
     * @returns {Array}
     */
    static getRequirements() {
        return Object.entries(this.REQUIREMENTS).map(([key, config]) => ({
            key,
            text: config.text
        }));
    }
}

// Export to window
if (typeof window !== 'undefined') {
    window.PasswordStrengthValidator = PasswordStrengthValidator;
}
