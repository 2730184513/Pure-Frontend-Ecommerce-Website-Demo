/**
 * FormRenderer - 负责整个Checkout界面的UI渲染
 */
class FormRenderer {
    constructor(formElement) {
        this.form = formElement;
        this.renderQueue = [];
    }

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

    /**
     * 显示字段错误
     */
    showFieldError(field, message) {
        const errorElement = field.parentElement.querySelector('.error-message');

        this.queueRender(() => {
            field.classList.add('invalid');
            field.classList.remove('valid');

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
        const errorElement = field.parentElement.querySelector('.error-message');
        const hasValue = field.value.trim() !== '';

        this.queueRender(() => {
            field.classList.remove('invalid');

            if (hasValue) {
                field.classList.add('valid');
            } else {
                field.classList.remove('valid');
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
        this.queueRender(() => {
            field.disabled = false;
        });
    }

    /**
     * 禁用字段
     */
    disableField(field) {
        this.queueRender(() => {
            field.disabled = true;
        });
    }

    /**
     * 设置字段值
     */
    setFieldValue(field, value) {
        this.queueRender(() => {
            field.value = value;
        });
    }

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
     * 滚动到字段
     */
    scrollToField(field) {
        requestAnimationFrame(() => {
            field.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
            field.focus();
        });
    }
}

// Export to window
if (typeof window !== 'undefined') {
    window.FormRenderer = FormRenderer;
}

