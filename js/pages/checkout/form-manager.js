/**
 * FormManager - 结账表单管理器
 * 使用 FormRenderer 和 FormFieldFactory 进行声明式表单渲染
 * 管理账单详情表单（结账页面左侧）
 */
class FormManager {
    constructor(formElement) {
        // 使用 querySelector 向下查找子元素（不是 closest 向上查找）
        this.formContainer = formElement.querySelector('.billing-section');
        this.form = formElement;
        this.renderer = new window.FormRenderer(this.formContainer);
        this.countryDropdown = null;
        this.provinceDropdown = null;
        this.validators = new Map();
        this.dropdownValidators = new Map();
    }

    /**
     * 获取表单字段配置
     * @returns {Array} 字段配置数组
     */
    getFieldsConfig() {
        return [
            {
                row: {
                    left: {
                        type: 'text',
                        id: 'firstName',
                        name: 'firstName',
                        label: 'First Name',
                        required: true,
                        pattern: "^[A-Za-z\\s\\-']{2,50}$",
                        dataError: 'First name must be 2-50 letters only'
                    },
                    right: {
                        type: 'text',
                        id: 'lastName',
                        name: 'lastName',
                        label: 'Last Name',
                        required: true,
                        pattern: "^[A-Za-z\\s\\-']{2,50}$",
                        dataError: 'Last name must be 2-50 letters only'
                    }
                }
            },
            {
                type: 'text',
                id: 'companyName',
                name: 'companyName',
                label: 'Company Name',
                required: false,
                pattern: '^[A-Za-z0-9\\s\\-.,&()]{2,100}$',
                dataError: 'Company name contains invalid characters'
            },
            {
                type: 'searchable-select',
                id: 'country',
                name: 'country',
                label: 'Country / Region',
                required: true
            },
            {
                type: 'searchable-select',
                id: 'province',
                name: 'province',
                label: 'Province / State',
                required: true,
                disabled: true
            },
            {
                type: 'text',
                id: 'city',
                name: 'city',
                label: 'Town / City',
                required: true,
                pattern: "^[A-Za-z\\s\\-']{2,50}$",
                dataError: 'City name must be 2-50 letters only'
            },
            {
                type: 'text',
                id: 'streetAddress',
                name: 'streetAddress',
                label: 'Street Address',
                required: true,
                minlength: 5,
                pattern: '^[A-Za-z0-9\\s\\-.,#/]{5,100}$',
                dataError: 'Street address must be 5-100 characters (letters, numbers, spaces, and -.,#/ allowed)'
            },
            {
                type: 'text',
                id: 'zipCode',
                name: 'zipCode',
                label: 'ZIP code',
                required: true,
                pattern: '^[A-Za-z0-9\\s\\-]{3,10}$',
                dataError: 'ZIP code must be 3-10 alphanumeric characters'
            },
            {
                type: 'tel',
                id: 'phone',
                name: 'phone',
                label: 'Phone',
                required: true,
                pattern: '^[\\+]?[0-9\\s\\-\\(\\)]{8,20}$',
                dataError: 'Phone must be 8-20 characters (numbers, +, -, spaces, and parentheses allowed)'
            },
            {
                type: 'email',
                id: 'email',
                name: 'email',
                label: 'Email address',
                required: true,
                pattern: '^[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}$',
                dataError: 'Please enter a valid email address'
            },
            {
                type: 'textarea',
                id: 'additionalInfo',
                name: 'additionalInfo',
                label: 'Additional information',
                required: false,
                maxlength: 500,
                rows: 4,
                placeholder: 'Notes about your order (max 500 characters)'
            }
        ];
    }

    async initialize() {
        // Ensure location data is loaded
        await window.locationRepository.loadData();

        // 渲染表单
        this.renderForm();

        // 重新获取表单引用（因为已被重新渲染）
        this.form = document.getElementById('checkoutForm');

        // Initialize components
        this.initializeDropdowns();
        this.initializeValidators();

        // Bind events
        this.bindEvents();
    }

    /**
     * 渲染表单
     */
    renderForm() {
        const fieldsConfig = this.getFieldsConfig();
        
        // 表单头部
        const headerHtml = `
            <div class="billing-header">
                <button type="button" class="back-button" title="Back to Cart">
                    <img src="/201-project/images/icons/arrow-left.png" alt="Back">
                </button>
                <div class="billing-header-content">
                    <h1>Billing details</h1>
                    <p class="required-note"><span class="required">*</span> indicates required field</p>
                </div>
            </div>
        `;

        // 使用 FormFieldFactory 生成字段
        const fieldsHtml = fieldsConfig.map(field => {
            return this.renderer.renderField(field);
        }).join('');

        // 组装表单内容
        const formContentHtml = `
            ${headerHtml}
            ${fieldsHtml}
        `;

        this.formContainer.innerHTML = formContentHtml;
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
            searchFunction: (query) => window.locationRepository.searchCountries(query),
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
        const fields = this.formContainer.querySelectorAll(
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
        const states = window.locationRepository.getProvincesByCountry(countryName);
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
        return window.locationRepository.getAllCountries();
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

