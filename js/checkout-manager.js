/**
 * CheckoutManager - 主管理器，协调所有组件
 */
import { LocationDataService } from './location-data-service.js';
import { FormRenderer } from './form-renderer.js';
import { SearchableDropdown } from './searchable-dropdown.js';
import { FieldValidator } from './field-validator.js';

export class CheckoutManager {
    constructor(formId) {
        this.form = document.getElementById(formId);
        this.dataService = new LocationDataService();
        this.renderer = new FormRenderer(this.form);
        this.countryDropdown = null;
        this.provinceDropdown = null;
        this.validators = new Map();
        this.dropdownValidators = new Map();
    }

    async initialize() {
        // 加载数据
        await this.dataService.initialize();

        // 初始化组件
        this.initializeDropdowns();
        this.initializeValidators();
        this.initializePaymentMethods();

        // 绑定事件
        this.bindEvents();

        console.log('Checkout manager initialized');
    }

    /**
     * 初始化下拉框
     */
    initializeDropdowns() {
        const countryInput = document.getElementById('country');
        const provinceInput = document.getElementById('province');

        // 创建国家下拉框
        this.countryDropdown = new SearchableDropdown(countryInput, {
            searchFunction: (query) => this.dataService.searchCountries(query),
            allItems: this.loadAllCountries(),
            placeholder: 'Search or select a country...'
        });

        // 创建省份下拉框
        this.provinceDropdown = new SearchableDropdown(provinceInput, {
            placeholder: 'Select country first',
            allItems: []
        });

        // 初始渲染
        this.renderer.renderDropdownItems(this.countryDropdown, this.countryDropdown.getAllItems());
        this.renderer.disableField(provinceInput);
        this.renderer.flush();

        // 创建验证器
        this.dropdownValidators.set('country', new FieldValidator(countryInput));
        this.dropdownValidators.set('province', new FieldValidator(provinceInput));
    }

    /**
     * 初始化字段验证器
     */
    initializeValidators() {
        const fields = this.form.querySelectorAll(
            'input:not([type="radio"]):not([type="checkbox"]), textarea'
        );

        fields.forEach(field => {
            if (field.id && field.id !== 'country' && field.id !== 'province') {
                const validator = new FieldValidator(field);
                this.validators.set(field.id, validator);
                this.bindFieldValidation(field, validator);
            }
        });
    }

    /**
     * 绑定字段验证事件
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
     * 验证单个字段
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
     * 初始化付款方式
     */
    initializePaymentMethods() {
        const radios = this.form.querySelectorAll('input[name="paymentMethod"]');
        const bankDesc = this.form.querySelector('.bank-description');
        const cashDesc = this.form.querySelector('.cash-description');

        radios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                const showBank = e.target.value === 'bank-transfer';
                this.renderer.renderPaymentDescriptions(bankDesc, cashDesc, showBank);
                this.renderer.flush();
            });
        });

        // 初始化显示
        const checked = this.form.querySelector('input[name="paymentMethod"]:checked');
        if (checked) {
            const showBank = checked.value === 'bank-transfer';
            this.renderer.renderPaymentDescriptions(bankDesc, cashDesc, showBank);
            this.renderer.flush();
        }
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        this.bindCountryDropdownEvents();
        this.bindProvinceDropdownEvents();
        this.bindFormSubmit();
    }

    /**
     * 绑定国家下拉框事件
     */
    bindCountryDropdownEvents() {
        const input = this.countryDropdown.getInputElement();
        const dropdown = this.countryDropdown.getDropdownElement();

        // 聚焦显示下拉
        input.addEventListener('focus', () => {
            const items = this.countryDropdown.getAllItems();
            this.renderer.renderDropdownItems(this.countryDropdown, items);
            this.renderer.showDropdown(this.countryDropdown);
            this.renderer.clearFieldError(input);
            this.renderer.flush();
        });

        // 输入过滤
        input.addEventListener('input', (e) => {
            const filteredItems = this.countryDropdown.filterItems(e.target.value);
            this.renderer.renderDropdownItems(this.countryDropdown, filteredItems);
            this.renderer.flush();
        });

        // 失焦隐藏和验证
        input.addEventListener('blur', () => {
            setTimeout(() => {
                this.renderer.hideDropdown(this.countryDropdown);
                this.renderer.flush();

                const validator = this.dropdownValidators.get('country');
                validator.markAsTouched();
                this.validateField(input, validator);
            }, 200);
        });

        // 点击选项
        dropdown.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('dropdown-item') && !e.target.classList.contains('no-results')) {
                e.preventDefault();
                const value = e.target.dataset.value;
                this.handleCountrySelection(value);
            }
        });
    }

    /**
     * 处理国家选择
     */
    handleCountrySelection(countryName) {
        this.countryDropdown.setSelected(countryName);
        this.renderer.hideDropdown(this.countryDropdown);
        this.renderer.flush();

        // 更新省份
        this.updateProvinces(countryName);
    }

    /**
     * 绑定省份下拉框事件
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
     * 处理省份选择
     */
    handleProvinceSelection(provinceName) {
        this.provinceDropdown.setSelected(provinceName);
        this.renderer.hideDropdown(this.provinceDropdown);
        this.renderer.flush();
    }

    /**
     * 更新省份选项
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

        // 重置验证状态
        const validator = this.dropdownValidators.get('province');
        validator.reset();
    }

    /**
     * 绑定表单提交
     */
    bindFormSubmit() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
    }

    /**
     * 加载所有国家
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
     * 验证所有字段
     */
    validateAll() {
        let isValid = true;
        let firstInvalidField = null;

        // 验证下拉框
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

        // 验证其他字段
        this.validators.forEach((validator) => {
            validator.markAsTouched();
            const result = validator.validate();

            if (!result.valid) {
                this.renderer.showFieldError(validator.field, result.message);
                isValid = false;
                if (!firstInvalidField) firstInvalidField = validator.field;
            }
        });

        // 批量渲染
        this.renderer.flush();

        // 滚动到错误字段
        if (!isValid && firstInvalidField) {
            setTimeout(() => {
                this.renderer.scrollToField(firstInvalidField);
            }, 100);
        }

        return isValid;
    }

    /**
     * 处理表单提交
     */
    handleSubmit() {
        if (!this.validateAll()) {
            return;
        }

        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData.entries());

        console.log('=== Order Submitted Successfully ===');
        console.table(data);
        alert('Order placed successfully! Thank you for your purchase.');
    }
}
