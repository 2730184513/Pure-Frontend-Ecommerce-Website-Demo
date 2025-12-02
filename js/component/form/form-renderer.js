/**
 * FormRenderer - 通用表单 UI 渲染器
 * 负责表单的渲染、字段状态管理、密码强度更新等
 * 与 FormFieldFactory 配合使用
 */
class FormRenderer {
    constructor(containerElement) {
        this.container = containerElement;
        this.form = null;
        this.renderQueue = [];
        this.fieldElements = new Map(); // 存储字段元素引用
    }

    // ==================== 表单构建方法 ====================

    /**
     * 根据字段配置渲染完整表单
     * @param {Object} formConfig - 表单配置
     * @param {string} formConfig.id - 表单 ID
     * @param {string} formConfig.className - 表单类名
     * @param {Object} formConfig.header - 表单头部配置
     * @param {Array} formConfig.fields - 字段配置数组
     * @param {Object} formConfig.submitButton - 提交按钮配置
     * @param {Object} formConfig.footerLink - 底部链接配置
     */
    renderForm(formConfig) {
        const {
            id,
            className = 'form',
            header,
            fields = [],
            submitButton,
            footerLink
        } = formConfig;

        let contentHtml = '';

        // 渲染头部
        if (header) {
            contentHtml += FormFieldFactory.createFormHeader(header);
        }

        // 渲染字段
        contentHtml += this.renderFields(fields);

        // 渲染提交按钮
        if (submitButton) {
            contentHtml += FormFieldFactory.createSubmitButton(submitButton);
        }

        // 渲染底部链接
        if (footerLink) {
            contentHtml += FormFieldFactory.createFormFooterLink(footerLink);
        }

        // 生成表单 HTML
        const formHtml = FormFieldFactory.createForm({
            id,
            className,
            content: contentHtml
        });

        // 渲染到容器
        this.container.innerHTML = formHtml;
        this.form = this.container.querySelector(`#${id}`);

        // 缓存字段元素引用
        this.cacheFieldElements(fields);

        return this.form;
    }

    /**
     * 渲染字段列表
     * @param {Array} fields - 字段配置数组
     * @returns {string} HTML 字符串
     */
    renderFields(fields) {
        return fields.map(field => this.renderField(field)).join('');
    }

    /**
     * 渲染单个字段
     * @param {Object} fieldConfig - 字段配置
     * @returns {string} HTML 字符串
     */
    renderField(fieldConfig) {
        const { type, row } = fieldConfig;

        // 处理表单行（两列布局）
        if (row) {
            const leftHtml = this.renderField(row.left);
            const rightHtml = this.renderField(row.right);
            return FormFieldFactory.createFormRow(leftHtml, rightHtml);
        }

        // 根据类型渲染不同字段
        switch (type) {
            case 'text':
            case 'email':
            case 'tel':
            case 'number':
            case 'date':
                return FormFieldFactory.createInput({ ...fieldConfig, type });

            case 'password':
                return FormFieldFactory.createPasswordInput(fieldConfig);

            case 'textarea':
                return FormFieldFactory.createTextarea(fieldConfig);

            case 'searchable-select':
                return FormFieldFactory.createSearchableSelect(fieldConfig);

            case 'checkbox':
                return FormFieldFactory.createCheckbox(fieldConfig);

            case 'radio':
                return FormFieldFactory.createRadioGroup(fieldConfig);

            default:
                return FormFieldFactory.createInput(fieldConfig);
        }
    }

    /**
     * 缓存字段元素引用
     * @param {Array} fields - 字段配置数组
     */
    cacheFieldElements(fields) {
        this.fieldElements.clear();
        
        const collectFieldIds = (fieldList) => {
            fieldList.forEach(field => {
                if (field.row) {
                    collectFieldIds([field.row.left, field.row.right]);
                } else if (field.id) {
                    const element = this.container.querySelector(`#${field.id}`);
                    if (element) {
                        this.fieldElements.set(field.id, element);
                    }
                } else if (field.options) {
                    // Radio group
                    field.options.forEach(option => {
                        const element = this.container.querySelector(`#${option.id}`);
                        if (element) {
                            this.fieldElements.set(option.id, element);
                        }
                    });
                }
            });
        };

        collectFieldIds(fields);
    }

    /**
     * 获取字段元素
     * @param {string} fieldId - 字段 ID
     * @returns {HTMLElement|null}
     */
    getField(fieldId) {
        return this.fieldElements.get(fieldId) || this.container.querySelector(`#${fieldId}`);
    }

    /**
     * 获取表单元素
     * @returns {HTMLFormElement}
     */
    getForm() {
        return this.form;
    }

    // ==================== 下拉框渲染方法 ====================

    /**
     * 渲染下拉框选项
     */
    renderDropdownItems(dropdown, items) {
        const html = dropdown.generateItemsHTML(items);
        this.queueRender(() => {
            dropdown.getDropdownElement().innerHTML = html;
        });
    }

    /**
     * 显示下拉框
     */
    showDropdown(dropdown) {
        this.queueRender(() => {
            dropdown.getDropdownElement().classList.add('open');
        });
    }

    /**
     * 隐藏下拉框
     */
    hideDropdown(dropdown) {
        this.queueRender(() => {
            dropdown.getDropdownElement().classList.remove('open');
        });
    }

    // ==================== 字段状态渲染方法 ====================

    /**
     * 显示字段错误
     */
    showFieldError(field, message) {
        const targetField = typeof field === 'string' ? this.getField(field) : field;
        if (!targetField) return;

        const errorElement = targetField.parentElement.querySelector('.error-message');

        this.queueRender(() => {
            targetField.classList.add('invalid');
            targetField.classList.remove('valid');

            if (errorElement) {
                errorElement.textContent = message;
                errorElement.classList.add('show');
            }
        });
    }

    /**
     * 清除字段错误
     */
    clearFieldError(field) {
        const targetField = typeof field === 'string' ? this.getField(field) : field;
        if (!targetField) return;

        const errorElement = targetField.parentElement.querySelector('.error-message');
        const hasValue = targetField.value && targetField.value.trim() !== '';

        this.queueRender(() => {
            targetField.classList.remove('invalid');

            if (hasValue) {
                targetField.classList.add('valid');
            } else {
                targetField.classList.remove('valid');
            }

            if (errorElement) {
                errorElement.classList.remove('show');
                errorElement.textContent = '';
            }
        });
    }

    /**
     * 启用字段
     */
    enableField(field) {
        const targetField = typeof field === 'string' ? this.getField(field) : field;
        if (!targetField) return;

        this.queueRender(() => {
            targetField.disabled = false;
        });
    }

    /**
     * 禁用字段
     */
    disableField(field) {
        const targetField = typeof field === 'string' ? this.getField(field) : field;
        if (!targetField) return;

        this.queueRender(() => {
            targetField.disabled = true;
        });
    }

    /**
     * 设置字段值
     */
    setFieldValue(field, value) {
        const targetField = typeof field === 'string' ? this.getField(field) : field;
        if (!targetField) return;

        this.queueRender(() => {
            targetField.value = value;
        });
    }

    // ==================== 密码强度渲染方法 ====================

    /**
     * 更新密码强度指示器
     * @param {string} fieldId - 密码字段 ID
     * @param {Object} strengthInfo - 强度信息
     * @param {number} strengthInfo.score - 强度分数 (0-5)
     * @param {string} strengthInfo.label - 强度标签
     * @param {string} strengthInfo.level - 强度级别 (weak, fair, good, strong)
     * @param {Object} strengthInfo.requirements - 各项要求满足情况
     */
    updatePasswordStrength(fieldId, strengthInfo) {
        const { score, label, level, requirements } = strengthInfo;

        const strengthFill = this.container.querySelector(`#${fieldId}StrengthFill`);
        const strengthText = this.container.querySelector(`#${fieldId}StrengthText`);

        this.queueRender(() => {
            if (strengthFill) {
                // 清除之前的强度类
                strengthFill.classList.remove('strength-weak', 'strength-fair', 'strength-good', 'strength-strong');
                
                if (score > 0 && level) {
                    strengthFill.classList.add(`strength-${level}`);
                    // score 是 0-5，转换为百分比
                    strengthFill.style.width = `${(score / 5) * 100}%`;
                } else {
                    strengthFill.style.width = '0%';
                }
            }

            if (strengthText) {
                strengthText.textContent = label || 'Password strength';
                // 根据强度级别设置颜色
                const colors = {
                    weak: '#e74c3c',
                    fair: '#f39c12',
                    good: '#8bc34a',
                    strong: '#27ae60'
                };
                strengthText.style.color = colors[level] || 'inherit';
            }

            // 更新要求列表
            if (requirements) {
                Object.keys(requirements).forEach(key => {
                    const reqElement = this.container.querySelector(`#${fieldId}-req-${key}`);
                    if (reqElement) {
                        const icon = reqElement.querySelector('.req-icon');
                        if (requirements[key]) {
                            reqElement.classList.add('met');
                            if (icon) icon.textContent = '✓';
                        } else {
                            reqElement.classList.remove('met');
                            if (icon) icon.textContent = '○';
                        }
                    }
                });
            }
        });
    }

    // ==================== 按钮状态渲染方法 ====================

    /**
     * 设置按钮加载状态
     * @param {string|HTMLElement} button - 按钮元素或 ID
     * @param {boolean} isLoading - 是否加载中
     * @param {string} loadingText - 加载中的文本
     */
    setButtonLoading(button, isLoading, loadingText = 'Loading...') {
        const targetButton = typeof button === 'string' 
            ? this.container.querySelector(`#${button}`) 
            : button;
        if (!targetButton) return;

        this.queueRender(() => {
            if (isLoading) {
                targetButton.dataset.originalText = targetButton.textContent;
                targetButton.textContent = loadingText;
                targetButton.disabled = true;
                targetButton.classList.add('loading');
            } else {
                targetButton.textContent = targetButton.dataset.originalText || targetButton.textContent;
                targetButton.disabled = false;
                targetButton.classList.remove('loading');
            }
        });
    }

    /**
     * 启用按钮
     */
    enableButton(button) {
        const targetButton = typeof button === 'string' 
            ? this.container.querySelector(`#${button}`) 
            : button;
        if (!targetButton) return;

        this.queueRender(() => {
            targetButton.disabled = false;
        });
    }

    /**
     * 禁用按钮
     */
    disableButton(button) {
        const targetButton = typeof button === 'string' 
            ? this.container.querySelector(`#${button}`) 
            : button;
        if (!targetButton) return;

        this.queueRender(() => {
            targetButton.disabled = true;
        });
    }

    // ==================== 渲染队列管理 ====================

    /**
     * 将渲染任务加入队列
     */
    queueRender(renderFn) {
        this.renderQueue.push(renderFn);
    }

    /**
     * 批量执行所有渲染任务
     */
    flush() {
        if (this.renderQueue.length === 0) return;

        requestAnimationFrame(() => {
            // 使用文档片段减少重排
            const batch = [...this.renderQueue];
            this.renderQueue = [];

            batch.forEach(renderFn => renderFn());
        });
    }

    /**
     * 立即执行所有渲染任务（同步）
     */
    flushSync() {
        if (this.renderQueue.length === 0) return;

        const batch = [...this.renderQueue];
        this.renderQueue = [];
        batch.forEach(renderFn => renderFn());
    }

    // ==================== 辅助方法 ====================

    /**
     * 滚动到字段
     */
    scrollToField(field) {
        const targetField = typeof field === 'string' ? this.getField(field) : field;
        if (!targetField) return;

        requestAnimationFrame(() => {
            targetField.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
            targetField.focus();
        });
    }

    /**
     * 重置表单
     */
    resetForm() {
        if (this.form) {
            this.form.reset();
            
            // 清除所有字段的验证状态
            this.fieldElements.forEach((element, id) => {
                this.clearFieldError(element);
            });
            
            this.flush();
        }
    }

    /**
     * 获取表单数据
     * @returns {Object} 表单数据对象
     */
    getFormData() {
        if (!this.form) return {};

        const formData = new FormData(this.form);
        const data = {};

        formData.forEach((value, key) => {
            // 处理同名字段（如复选框组）
            if (data[key]) {
                if (Array.isArray(data[key])) {
                    data[key].push(value);
                } else {
                    data[key] = [data[key], value];
                }
            } else {
                data[key] = value;
            }
        });

        return data;
    }

    /**
     * 设置表单数据
     * @param {Object} data - 表单数据对象
     */
    setFormData(data) {
        Object.entries(data).forEach(([key, value]) => {
            const field = this.container.querySelector(`[name="${key}"]`);
            if (field) {
                if (field.type === 'checkbox') {
                    field.checked = Boolean(value);
                } else if (field.type === 'radio') {
                    const radio = this.container.querySelector(`[name="${key}"][value="${value}"]`);
                    if (radio) radio.checked = true;
                } else {
                    field.value = value;
                }
            }
        });
    }

    /**
     * 显示/隐藏字段
     * @param {string|HTMLElement} field - 字段元素或 ID
     * @param {boolean} visible - 是否可见
     */
    setFieldVisible(field, visible) {
        const targetField = typeof field === 'string' ? this.getField(field) : field;
        if (!targetField) return;

        const formGroup = targetField.closest('.form-group');
        if (formGroup) {
            this.queueRender(() => {
                formGroup.style.display = visible ? '' : 'none';
            });
        }
    }
}

// Export to window
if (typeof window !== 'undefined') {
    window.FormRenderer = FormRenderer;
}

