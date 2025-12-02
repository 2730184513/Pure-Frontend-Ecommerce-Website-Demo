/**
 * FormFieldFactory - 表单字段工厂类
 * 负责生成各类表单元素的 HTML 结构
 * 支持原子级别的表单组件：input, textarea, select, checkbox, radio, password-with-strength 等
 */
class FormFieldFactory {
    /**
     * 转义 HTML 特殊字符
     */
    static escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * 生成表单组容器
     * @param {string} content - 内部内容
     * @param {string} extraClass - 额外的类名
     * @returns {string} HTML 字符串
     */
    static wrapFormGroup(content, extraClass = '') {
        return `<div class="form-group ${extraClass}">${content}</div>`;
    }

    /**
     * 生成 Label 标签
     * @param {Object} config - 配置对象
     * @param {string} config.id - 关联的 input id
     * @param {string} config.text - 标签文本
     * @param {boolean} config.required - 是否必填
     * @returns {string} HTML 字符串
     */
    static createLabel(config) {
        const { id, text, required = false } = config;
        const requiredMark = required ? '<span class="required">*</span>' : '';
        return `<label for="${this.escapeHtml(id)}">${this.escapeHtml(text)}${requiredMark}</label>`;
    }

    /**
     * 生成错误消息元素
     * @returns {string} HTML 字符串
     */
    static createErrorMessage() {
        return '<span class="error-message"></span>';
    }

    /**
     * 生成文本输入框
     * @param {Object} config - 配置对象
     * @param {string} config.id - 元素 ID
     * @param {string} config.name - 元素 name
     * @param {string} config.type - 输入类型 (text, email, tel, etc.)
     * @param {string} config.label - 标签文本
     * @param {boolean} config.required - 是否必填
     * @param {string} config.placeholder - 占位符
     * @param {string} config.pattern - 验证正则
     * @param {string} config.dataError - 错误提示
     * @param {number} config.minlength - 最小长度
     * @param {number} config.maxlength - 最大长度
     * @param {boolean} config.disabled - 是否禁用
     * @param {string} config.value - 默认值
     * @param {string} config.extraClass - 额外类名
     * @returns {string} HTML 字符串
     */
    static createInput(config) {
        const {
            id,
            name,
            type = 'text',
            label,
            required = false,
            placeholder = '',
            pattern = '',
            dataError = '',
            minlength = '',
            maxlength = '',
            disabled = false,
            value = '',
            extraClass = ''
        } = config;

        const attrs = [
            `type="${type}"`,
            `id="${this.escapeHtml(id)}"`,
            `name="${this.escapeHtml(name || id)}"`,
            required ? 'required' : '',
            placeholder ? `placeholder="${this.escapeHtml(placeholder)}"` : '',
            pattern ? `pattern="${this.escapeHtml(pattern)}"` : '',
            dataError ? `data-error="${this.escapeHtml(dataError)}"` : '',
            minlength ? `minlength="${minlength}"` : '',
            maxlength ? `maxlength="${maxlength}"` : '',
            disabled ? 'disabled' : '',
            value ? `value="${this.escapeHtml(value)}"` : '',
            extraClass ? `class="${extraClass}"` : ''
        ].filter(Boolean).join(' ');

        const labelHtml = label ? this.createLabel({ id, text: label, required }) : '';
        const inputHtml = `<input ${attrs}>`;
        const errorHtml = this.createErrorMessage();

        return this.wrapFormGroup(`${labelHtml}${inputHtml}${errorHtml}`);
    }

    /**
     * 生成密码输入框（带强度指示器）
     * @param {Object} config - 配置对象
     * @param {string} config.id - 元素 ID
     * @param {string} config.name - 元素 name
     * @param {string} config.label - 标签文本
     * @param {boolean} config.required - 是否必填
     * @param {boolean} config.showStrength - 是否显示强度指示器
     * @param {boolean} config.showRequirements - 是否显示要求列表
     * @param {string} config.dataError - 错误提示
     * @param {string} config.matchField - 要匹配的字段 ID（用于确认密码）
     * @param {string} config.matchError - 不匹配时的错误消息
     * @returns {string} HTML 字符串
     */
    static createPasswordInput(config) {
        const {
            id,
            name,
            label = 'Password',
            required = true,
            showStrength = false,
            showRequirements = false,
            dataError = 'Password must meet the strength requirements',
            minlength = 8,
            matchField = '',
            matchError = 'Passwords do not match'
        } = config;

        const labelHtml = this.createLabel({ id, text: label, required });
        
        const inputAttrs = [
            'type="password"',
            `id="${this.escapeHtml(id)}"`,
            `name="${this.escapeHtml(name || id)}"`,
            required ? 'required' : '',
            // 只有非确认密码字段才需要 minlength
            !matchField && minlength ? `minlength="${minlength}"` : '',
            `data-error="${this.escapeHtml(dataError)}"`,
            matchField ? `data-match="${this.escapeHtml(matchField)}"` : '',
            matchField ? `data-match-error="${this.escapeHtml(matchError)}"` : ''
        ].filter(Boolean).join(' ');

        const inputHtml = `<input ${inputAttrs}>`;

        let strengthHtml = '';
        if (showStrength) {
            strengthHtml = `
                <div class="password-strength" id="${id}Strength">
                    <div class="strength-bar">
                        <div class="strength-fill" id="${id}StrengthFill"></div>
                    </div>
                    <span class="strength-text" id="${id}StrengthText">Password strength</span>
                </div>
            `;
        }

        let requirementsHtml = '';
        if (showRequirements) {
            requirementsHtml = `
                <ul class="password-requirements" id="${id}Requirements">
                    <li id="${id}-req-length"><span class="req-icon">○</span> At least 8 characters</li>
                    <li id="${id}-req-uppercase"><span class="req-icon">○</span> One uppercase letter</li>
                    <li id="${id}-req-lowercase"><span class="req-icon">○</span> One lowercase letter</li>
                    <li id="${id}-req-number"><span class="req-icon">○</span> One number</li>
                    <li id="${id}-req-special"><span class="req-icon">○</span> One special character (!@#$%^&*)</li>
                </ul>
            `;
        }

        const errorHtml = this.createErrorMessage();

        return this.wrapFormGroup(`${labelHtml}${inputHtml}${strengthHtml}${requirementsHtml}${errorHtml}`);
    }

    /**
     * 生成文本域
     * @param {Object} config - 配置对象
     * @param {string} config.id - 元素 ID
     * @param {string} config.name - 元素 name
     * @param {string} config.label - 标签文本
     * @param {boolean} config.required - 是否必填
     * @param {string} config.placeholder - 占位符
     * @param {number} config.maxlength - 最大长度
     * @param {number} config.rows - 行数
     * @returns {string} HTML 字符串
     */
    static createTextarea(config) {
        const {
            id,
            name,
            label,
            required = false,
            placeholder = '',
            maxlength = '',
            rows = 4
        } = config;

        const labelHtml = label ? this.createLabel({ id, text: label, required }) : '';
        
        const attrs = [
            `id="${this.escapeHtml(id)}"`,
            `name="${this.escapeHtml(name || id)}"`,
            required ? 'required' : '',
            placeholder ? `placeholder="${this.escapeHtml(placeholder)}"` : '',
            maxlength ? `maxlength="${maxlength}"` : '',
            `rows="${rows}"`
        ].filter(Boolean).join(' ');

        const textareaHtml = `<textarea ${attrs}></textarea>`;
        const errorHtml = this.createErrorMessage();

        return this.wrapFormGroup(`${labelHtml}${textareaHtml}${errorHtml}`);
    }

    /**
     * 生成可搜索下拉框的输入框（下拉列表由 SearchableDropdown 组件管理）
     * @param {Object} config - 配置对象
     * @param {string} config.id - 元素 ID
     * @param {string} config.name - 元素 name
     * @param {string} config.label - 标签文本
     * @param {boolean} config.required - 是否必填
     * @param {boolean} config.disabled - 是否禁用
     * @returns {string} HTML 字符串
     */
    static createSearchableSelect(config) {
        const {
            id,
            name,
            label,
            required = false,
            disabled = false
        } = config;

        const labelHtml = label ? this.createLabel({ id, text: label, required }) : '';
        
        const attrs = [
            'type="text"',
            `id="${this.escapeHtml(id)}"`,
            `name="${this.escapeHtml(name || id)}"`,
            'class="searchable-input"',
            required ? 'required' : '',
            disabled ? 'disabled' : ''
        ].filter(Boolean).join(' ');

        const inputHtml = `<input ${attrs}>`;
        const errorHtml = this.createErrorMessage();

        return this.wrapFormGroup(`${labelHtml}${inputHtml}${errorHtml}`);
    }

    /**
     * 生成复选框
     * @param {Object} config - 配置对象
     * @param {string} config.id - 元素 ID
     * @param {string} config.name - 元素 name
     * @param {string} config.label - 标签文本
     * @param {boolean} config.checked - 是否选中
     * @param {boolean} config.required - 是否必填
     * @returns {string} HTML 字符串
     */
    static createCheckbox(config) {
        const {
            id,
            name,
            label,
            checked = false,
            required = false
        } = config;

        const attrs = [
            'type="checkbox"',
            `id="${this.escapeHtml(id)}"`,
            `name="${this.escapeHtml(name || id)}"`,
            checked ? 'checked' : '',
            required ? 'required' : ''
        ].filter(Boolean).join(' ');

        const inputHtml = `<input ${attrs}>`;
        const labelHtml = `<label for="${this.escapeHtml(id)}">${this.escapeHtml(label)}</label>`;

        return `<div class="form-group form-group--checkbox">${inputHtml}${labelHtml}</div>`;
    }

    /**
     * 生成单选框组
     * @param {Object} config - 配置对象
     * @param {string} config.name - 组名
     * @param {string} config.legend - 组标题
     * @param {Array} config.options - 选项数组 [{id, value, label, checked}]
     * @param {boolean} config.required - 是否必填
     * @returns {string} HTML 字符串
     */
    static createRadioGroup(config) {
        const {
            name,
            legend = '',
            options = [],
            required = false
        } = config;

        const legendHtml = legend ? `<legend>${this.escapeHtml(legend)}</legend>` : '';

        const optionsHtml = options.map(option => {
            const attrs = [
                'type="radio"',
                `id="${this.escapeHtml(option.id)}"`,
                `name="${this.escapeHtml(name)}"`,
                `value="${this.escapeHtml(option.value)}"`,
                option.checked ? 'checked' : '',
                required ? 'required' : ''
            ].filter(Boolean).join(' ');

            return `
                <div class="radio-option">
                    <input ${attrs}>
                    <label for="${this.escapeHtml(option.id)}">${this.escapeHtml(option.label)}</label>
                </div>
            `;
        }).join('');

        return `<fieldset class="form-group form-group--radio">${legendHtml}${optionsHtml}</fieldset>`;
    }

    /**
     * 生成两列布局的表单行
     * @param {string} leftContent - 左侧内容
     * @param {string} rightContent - 右侧内容
     * @returns {string} HTML 字符串
     */
    static createFormRow(leftContent, rightContent) {
        return `<div class="form-row">${leftContent}${rightContent}</div>`;
    }

    /**
     * 生成表单头部
     * @param {Object} config - 配置对象
     * @param {string} config.title - 标题
     * @param {string} config.subtitle - 副标题
     * @param {boolean} config.showBackButton - 是否显示返回按钮
     * @param {string} config.backButtonId - 返回按钮 ID
     * @returns {string} HTML 字符串
     */
    static createFormHeader(config) {
        const {
            title,
            subtitle = '',
            showBackButton = false,
            backButtonId = 'backBtn'
        } = config;

        let backButtonHtml = '';
        if (showBackButton) {
            backButtonHtml = `
                <button type="button" class="back-button" id="${backButtonId}" title="Back">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                </button>
            `;
        }

        const subtitleHtml = subtitle ? `<p class="form-subtitle">${this.escapeHtml(subtitle)}</p>` : '';

        return `
            <div class="form-header">
                ${backButtonHtml}
                <h2 class="form-title">${this.escapeHtml(title)}</h2>
                ${subtitleHtml}
            </div>
        `;
    }

    /**
     * 生成提交按钮
     * @param {Object} config - 配置对象
     * @param {string} config.text - 按钮文本
     * @param {string} config.id - 按钮 ID
     * @param {string} config.className - 额外类名
     * @returns {string} HTML 字符串
     */
    static createSubmitButton(config) {
        const {
            text = 'Submit',
            id = 'submitBtn',
            className = 'form-submit-btn'
        } = config;

        return `<button type="submit" id="${id}" class="${className}">${this.escapeHtml(text)}</button>`;
    }

    /**
     * 生成表单底部提示链接
     * @param {Object} config - 配置对象
     * @param {string} config.text - 提示文本
     * @param {string} config.linkText - 链接文本
     * @param {string} config.linkId - 链接 ID
     * @returns {string} HTML 字符串
     */
    static createFormFooterLink(config) {
        const {
            text = '',
            linkText,
            linkId
        } = config;

        return `
            <div class="form-footer-link">
                ${text ? this.escapeHtml(text) + ' ' : ''}<a href="#" id="${linkId}" class="form-link">${this.escapeHtml(linkText)}</a>
            </div>
        `;
    }

    /**
     * 生成表单容器
     * @param {Object} config - 配置对象
     * @param {string} config.id - 表单 ID
     * @param {string} config.className - 类名
     * @param {string} config.content - 表单内容
     * @returns {string} HTML 字符串
     */
    static createForm(config) {
        const {
            id,
            className = 'form',
            content = ''
        } = config;

        return `<form id="${id}" class="${className}" novalidate>${content}</form>`;
    }
}

// Export to window
if (typeof window !== 'undefined') {
    window.FormFieldFactory = FormFieldFactory;
}
