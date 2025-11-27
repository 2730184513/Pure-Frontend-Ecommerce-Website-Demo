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
}

// Export to window
if (typeof window !== 'undefined') {
    window.FieldValidator = FieldValidator;
}

