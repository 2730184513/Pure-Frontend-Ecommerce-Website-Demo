/**
 * FieldValidator - 纯验证逻辑
 */
class FieldValidator {
    constructor(field) {
        this.field = field;
        this.hasBeenTouched = false;
    }

    markAsTouched() {
        this.hasBeenTouched = true;
    }

    validate() {
        if (!this.hasBeenTouched) {
            return { valid: true };
        }

        const value = this.field.value.trim();

        const requiredResult = this.checkRequired(value);
        if (!requiredResult.valid) return requiredResult;

        if (value === '' && !this.field.required) {
            return { valid: true };
        }

        // 检查字段匹配（如确认密码）
        const matchResult = this.checkMatch(value);
        if (!matchResult.valid) return matchResult;

        const lengthResult = this.checkLength(value, this.field.minLength, this.field.maxLength);
        if (!lengthResult.valid) return lengthResult;

        const patternResult = this.checkPattern(value, this.field.pattern);
        if (!patternResult.valid) return patternResult;

        return { valid: true };
    }

    checkRequired(value) {
        if (this.field.required && value === '') {
            return {
                valid: false,
                message: `${this.getFieldLabel()} is required`
            };
        }
        return { valid: true };
    }

    /**
     * 检查字段是否与另一个字段匹配
     * 使用 data-match 属性指定要匹配的字段 ID
     */
    checkMatch(value) {
        const matchFieldId = this.field.dataset.match;
        if (!matchFieldId) return { valid: true };

        const matchField = document.getElementById(matchFieldId);
        if (!matchField) return { valid: true };

        if (value !== matchField.value) {
            return {
                valid: false,
                message: this.field.dataset.matchError || 'Passwords do not match'
            };
        }

        return { valid: true };
    }

    checkLength(value, minLength, maxLength) {
        if (minLength > 0 && value.length < minLength) {
            return {
                valid: false,
                message: `${this.getFieldLabel()} must be at least ${minLength} characters`
            };
        }

        if (maxLength > 0 && value.length > maxLength) {
            return {
                valid: false,
                message: `${this.getFieldLabel()} must be no more than ${maxLength} characters`
            };
        }

        return { valid: true };
    }

    checkPattern(value, pattern) {
        if (!pattern) return { valid: true };

        if (!this.matchPattern(value, pattern)) {
            return {
                valid: false,
                message: this.field.dataset.error || `${this.getFieldLabel()} format is invalid`
            };
        }

        return { valid: true };
    }

    matchPattern(value, pattern) {
        try {
            const regex = new RegExp(pattern);
            return regex.test(value);
        } catch (e) {
            console.error('Invalid pattern:', pattern, e);
            return true;
        }
    }

    getFieldLabel() {
        const label = this.field.parentElement.querySelector('label');
        return label ? label.textContent.replace('*', '').trim() : 'This field';
    }

    reset() {
        this.hasBeenTouched = false;
    }

    /**
     * Static method to validate a field (for compatibility with existing code)
     * @param {HTMLElement} field - The field to validate
     * @returns {boolean} True if field is valid
     */
    static validateField(field) {
        const validator = new FieldValidator(field);
        validator.markAsTouched();
        const result = validator.validate();

        // Display error message
        const errorSpan = field.parentNode.querySelector('.error-message');
        if (errorSpan) {
            if (result.valid) {
                errorSpan.classList.remove('show');
                errorSpan.textContent = '';
            } else {
                errorSpan.textContent = result.message;
                errorSpan.classList.add('show');
            }
        }

        return result.valid;
    }

    /**
     * Instance method for compatibility
     * @param {HTMLElement} field - The field to validate
     * @returns {boolean} True if field is valid
     */
    validateField(field) {
        return FieldValidator.validateField(field);
    }
}

// Export to window
if (typeof window !== 'undefined') {
    window.FieldValidator = FieldValidator;
}

