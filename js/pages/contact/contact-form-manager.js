/**
 * Contact Form Manager
 * Handles contact form validation, submission, and user interactions
 */
class ContactFormManager {
    constructor() {
        this.form = null;
        this.validator = null;
        this.isInitialized = false;
    }

    /**
     * Initialize the contact form manager
     */
    async initialize() {
        if (this.isInitialized) return;

        try {
            this.form = document.getElementById('contactForm');
            if (!this.form) {
                throw new Error('Contact form not found');
            }

            // Initialize form validator
            this.validator = new FieldValidator();

            // Bind form events
            this.bindFormEvents();

            // Initialize form validation
            this.initializeValidation();

            this.isInitialized = true;
            console.log('Contact form manager initialized successfully');

        } catch (error) {
            console.error('Failed to initialize contact form manager:', error);
            throw error;
        }
    }

    /**
     * Bind form submission and validation events
     */
    bindFormEvents() {
        // Form submission
        this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));

        // Real-time validation
        const inputs = this.form.querySelectorAll('input[required], textarea[required]');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });

        // Optional field validation (for proper format even if not required)
        const optionalInputs = this.form.querySelectorAll('input:not([required])');
        optionalInputs.forEach(input => {
            if (input.hasAttribute('pattern')) {
                input.addEventListener('blur', () => this.validateField(input));
                input.addEventListener('input', () => this.clearFieldError(input));
            }
        });
    }

    /**
     * Initialize field validation setup (simplified - patterns are now in HTML)
     */
    initializeValidation() {
        // Validation patterns and errors are now defined directly in HTML
        // This method is kept for compatibility but no longer needed
        console.log('✓ Field validation patterns loaded from HTML');
    }

    /**
     * Validate a single form field
     * @param {HTMLElement} field - The field to validate
     */
    validateField(field) {
        if (!this.validator) return false;

        const isValid = this.validator.validateField(field);

        if (isValid) {
            field.classList.remove('invalid');
            field.classList.add('valid');
        } else {
            field.classList.remove('valid');
            field.classList.add('invalid');
        }

        return isValid;
    }

    /**
     * Clear field error state
     * @param {HTMLElement} field - The field to clear errors for
     */
    clearFieldError(field) {
        field.classList.remove('invalid', 'valid');
        const errorSpan = field.parentNode.querySelector('.error-message');
        if (errorSpan) {
            errorSpan.classList.remove('show');
            errorSpan.textContent = '';
        }
    }

    /**
     * Validate entire form
     * @returns {boolean} - True if form is valid
     */
    validateForm() {
        if (!this.validator) return false;

        const requiredFields = this.form.querySelectorAll('input[required], textarea[required]');
        const optionalFields = this.form.querySelectorAll('input:not([required])[pattern], textarea:not([required])[pattern]');

        let isFormValid = true;

        // Validate required fields
        requiredFields.forEach(field => {
            const isValid = this.validateField(field);
            if (!isValid) {
                isFormValid = false;
            }
        });

        // Validate optional fields that have content
        optionalFields.forEach(field => {
            if (field.value.trim()) {
                const isValid = this.validateField(field);
                if (!isValid) {
                    isFormValid = false;
                }
            }
        });

        return isFormValid;
    }

    /**
     * Validate all form fields (simplified method like checkout)
     * @returns {boolean} True if all fields are valid
     */
    validateAll() {
        const allInputs = this.form.querySelectorAll('input, textarea');
        let isValid = true;

        allInputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        return isValid;
    }

    /**
     * Handle form submission
     * @param {Event} e - Form submit event
     */
    async handleFormSubmit(e) {
        e.preventDefault();

        // Show loading state
        const submitBtn = this.form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
        }

        try {
            // Validate form (simplified validation like checkout)
            if (!this.validateAll()) {
                // Show validation error toast
                if (window.toastManager) {
                    window.toastManager.show('Please check the form and fix any errors', 'error');
                }
                return;
            }

            // Get form data
            const formData = new FormData(this.form);
            const contactData = {
                name: formData.get('name'),
                email: formData.get('email'),
                subject: formData.get('subject') || 'General Inquiry',
                message: formData.get('message'),
                timestamp: new Date().toISOString()
            };

            // Simulate form submission (replace with actual API call)
            await this.submitContactForm(contactData);

            // Show success message and redirect
            this.showSuccessMessage();

            // Reset form
            this.resetForm();

        } catch (error) {
            console.error('Contact form submission error:', error);
            if (window.toastManager) {
                window.toastManager.show('Failed to send message. Please try again.', 'error');
            }
        } finally {
            // Restore button state
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit';
            }
        }
    }

    /**
     * Submit contact form data (simulate API call)
     * @param {Object} contactData - Contact form data
     */
    async submitContactForm(contactData) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // In real implementation, this would be an actual API call
        console.log('Contact form data:', contactData);

        // Simulate success
        return { success: true, message: 'Contact form submitted successfully' };
    }

    /**
     * Show validation errors
     */
    showValidationErrors() {
        const firstInvalidField = this.form.querySelector('.invalid');
        if (firstInvalidField) {
            firstInvalidField.focus();
            firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        // Show toast notification
        if (window.toastManager) {
            window.toastManager.show('Please check the form and fix any errors', 'error');
        }
    }

    /**
     * Show success message and redirect to home
     */
    showSuccessMessage() {
        if (window.toastManager) {
            window.toastManager.show('Thank you for your message! We will get back to you soon.', 'success');
        }

        // Redirect to home page after 2 seconds
        setTimeout(() => {
            window.location.href = '/201-project/index.html';
        }, 2000);
    }

    /**
     * Show error message
     * @param {string} message - Error message to show
     */
    showErrorMessage(message) {
        if (window.toastManager) {
            window.toastManager.show(message, 'error');
        }
    }

    /**
     * Reset form to initial state
     */
    resetForm() {
        this.form.reset();

        // Clear all validation classes
        const fields = this.form.querySelectorAll('.valid, .invalid');
        fields.forEach(field => {
            field.classList.remove('valid', 'invalid');
        });

        // Clear all error messages
        const errorMessages = this.form.querySelectorAll('.error-message.show');
        errorMessages.forEach(error => {
            error.classList.remove('show');
            error.textContent = '';
        });
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.ContactFormManager = ContactFormManager;
}
