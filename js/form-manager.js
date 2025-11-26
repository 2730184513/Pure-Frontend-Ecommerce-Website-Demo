/**
 * Form Manager
 * Manages the billing details form (left side of checkout page)
 */
class FormManager {
    constructor(formElement) {
        this.form = formElement;
        // Use window global objects
        this.dataService = new window.LocationDataService();
        this.renderer = new window.FormRenderer(this.form);
        this.countryDropdown = null;
        this.provinceDropdown = null;
        this.validators = new Map();
        this.dropdownValidators = new Map();
    }

    async initialize() {
        // Load data first
        await this.dataService.initialize();

        // Initialize components
        this.initializeDropdowns();
        this.initializeValidators();

        // Bind events
        this.bindEvents();

        console.log('✓ Form manager initialized');
    }

    /**
     * Initialize dropdowns
     */
    initializeDropdowns() {
        const countryInput = document.getElementById('country');
        const provinceInput = document.getElementById('province');

        // Load all countries after data service is initialized
        const allCountries = this.loadAllCountries();

        // Create country dropdown
        this.countryDropdown = new window.SearchableDropdown(countryInput, {
            searchFunction: (query) => this.dataService.searchCountries(query),
            allItems: allCountries,
            placeholder: 'Search or select a country...'
        });

        // Create province dropdown
        this.provinceDropdown = new window.SearchableDropdown(provinceInput, {
            placeholder: 'Select country first',
            allItems: []
        });

        // Initial render
        this.renderer.renderDropdownItems(this.countryDropdown, this.countryDropdown.getAllItems());
        this.renderer.disableField(provinceInput);
        this.renderer.flush();

        // Create validators
        this.dropdownValidators.set('country', new window.FieldValidator(countryInput));
        this.dropdownValidators.set('province', new window.FieldValidator(provinceInput));
    }

    /**
     * Initialize field validators
     */
    initializeValidators() {
        const fields = this.form.querySelectorAll(
            'input:not([type="radio"]):not([type="checkbox"]), textarea'
        );

        fields.forEach(field => {
            if (field.id && field.id !== 'country' && field.id !== 'province') {
                const validator = new window.FieldValidator(field);
                this.validators.set(field.id, validator);
                this.bindFieldValidation(field, validator);
            }
        });
    }

    /**
     * Bind field validation events
     */
    bindFieldValidation(field, validator) {
        field.addEventListener('focus', () => {
            this.renderer.clearFieldError(field);
            this.renderer.flush();
        });

        field.addEventListener('blur', () => {
            validator.markAsTouched();
            this.validateField(field, validator);
        });

        field.addEventListener('input', () => {
            if (field.classList.contains('invalid')) {
                this.validateField(field, validator);
            }
        });
    }

    /**
     * Validate single field
     */
    validateField(field, validator) {
        const result = validator.validate();

        if (!result.valid) {
            this.renderer.showFieldError(field, result.message);
        } else {
            this.renderer.clearFieldError(field);
        }

        this.renderer.flush();
    }

    /**
     * Bind events
     */
    bindEvents() {
        this.bindCountryDropdownEvents();
        this.bindProvinceDropdownEvents();
    }

    /**
     * Bind country dropdown events
     */
    bindCountryDropdownEvents() {
        const input = this.countryDropdown.getInputElement();
        const dropdown = this.countryDropdown.getDropdownElement();

        input.addEventListener('focus', () => {
            const items = this.countryDropdown.getAllItems();
            this.renderer.renderDropdownItems(this.countryDropdown, items);
            this.renderer.showDropdown(this.countryDropdown);
            this.renderer.clearFieldError(input);
            this.renderer.flush();
        });

        input.addEventListener('input', (e) => {
            const filteredItems = this.countryDropdown.filterItems(e.target.value);
            this.renderer.renderDropdownItems(this.countryDropdown, filteredItems);
            this.renderer.flush();
        });

        input.addEventListener('blur', () => {
            setTimeout(() => {
                this.renderer.hideDropdown(this.countryDropdown);
                this.renderer.flush();

                const validator = this.dropdownValidators.get('country');
                validator.markAsTouched();
                this.validateField(input, validator);
            }, 200);
        });

        dropdown.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('dropdown-item') && !e.target.classList.contains('no-results')) {
                e.preventDefault();
                const value = e.target.dataset.value;
                this.handleCountrySelection(value);
            }
        });
    }

    /**
     * Handle country selection
     */
    handleCountrySelection(countryName) {
        this.countryDropdown.setSelected(countryName);
        this.renderer.hideDropdown(this.countryDropdown);
        this.renderer.flush();

        // Update provinces
        this.updateProvinces(countryName);
    }

    /**
     * Bind province dropdown events
     */
    bindProvinceDropdownEvents() {
        const input = this.provinceDropdown.getInputElement();
        const dropdown = this.provinceDropdown.getDropdownElement();

        input.addEventListener('focus', () => {
            if (!input.disabled) {
                const items = this.provinceDropdown.getAllItems();
                this.renderer.renderDropdownItems(this.provinceDropdown, items);
                this.renderer.showDropdown(this.provinceDropdown);
                this.renderer.clearFieldError(input);
                this.renderer.flush();
            }
        });

        input.addEventListener('input', (e) => {
            const filteredItems = this.provinceDropdown.filterItems(e.target.value);
            this.renderer.renderDropdownItems(this.provinceDropdown, filteredItems);
            this.renderer.flush();
        });

        input.addEventListener('blur', () => {
            setTimeout(() => {
                this.renderer.hideDropdown(this.provinceDropdown);
                this.renderer.flush();

                const validator = this.dropdownValidators.get('province');
                validator.markAsTouched();
                this.validateField(input, validator);
            }, 200);
        });

        dropdown.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('dropdown-item') && !e.target.classList.contains('no-results')) {
                e.preventDefault();
                const value = e.target.dataset.value;
                this.handleProvinceSelection(value);
            }
        });
    }

    /**
     * Handle province selection
     */
    handleProvinceSelection(provinceName) {
        this.provinceDropdown.setSelected(provinceName);
        this.renderer.hideDropdown(this.provinceDropdown);
        this.renderer.flush();
    }

    /**
     * Update provinces
     */
    updateProvinces(countryName) {
        const states = this.dataService.getStates(countryName);
        const provinceInput = this.provinceDropdown.getInputElement();

        if (states.length > 0) {
            this.provinceDropdown.loadItems(states);
            this.provinceDropdown.reset();
            this.renderer.enableField(provinceInput);
            this.renderer.renderDropdownItems(this.provinceDropdown, states);
        } else {
            this.provinceDropdown.reset();
            this.renderer.setFieldValue(provinceInput, 'Not applicable');
            this.renderer.disableField(provinceInput);
        }

        this.renderer.flush();

        // Reset validation state
        const validator = this.dropdownValidators.get('province');
        validator.reset();
    }

    /**
     * Load all countries
     */
    loadAllCountries() {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        const countries = [];
        letters.forEach(letter => {
            const items = this.dataService.searchCountries(letter);
            countries.push(...items);
        });
        return countries;
    }

    /**
     * Validate all fields
     */
    validateAll() {
        let isValid = true;
        let firstInvalidField = null;

        // Validate dropdowns
        this.dropdownValidators.forEach((validator, name) => {
            validator.markAsTouched();
            const dropdown = name === 'country' ? this.countryDropdown : this.provinceDropdown;
            const field = dropdown.getInputElement();
            const result = validator.validate();

            if (!result.valid) {
                this.renderer.showFieldError(field, result.message);
                isValid = false;
                if (!firstInvalidField) firstInvalidField = field;
            }
        });

        // Validate other fields
        this.validators.forEach((validator) => {
            validator.markAsTouched();
            const result = validator.validate();

            if (!result.valid) {
                this.renderer.showFieldError(validator.field, result.message);
                isValid = false;
                if (!firstInvalidField) firstInvalidField = validator.field;
            }
        });

        // Batch render
        this.renderer.flush();

        // Scroll to error field
        if (!isValid && firstInvalidField) {
            setTimeout(() => {
                this.renderer.scrollToField(firstInvalidField);
            }, 100);
        }

        return isValid;
    }

    /**
     * Get form data
     */
    getFormData() {
        const formData = new FormData(this.form);
        return Object.fromEntries(formData.entries());
    }
}

// Export to window
if (typeof window !== 'undefined') {
    window.FormManager = FormManager;
}

