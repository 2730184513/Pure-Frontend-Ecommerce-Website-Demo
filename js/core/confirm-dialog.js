/**
 * ConfirmDialog - 确认弹窗工具类
 * 支持自定义内容、确认输入验证、产品预览等功能
 */
class ConfirmDialog {
    constructor() {
        this.overlay = null;
        this.dialog = null;
        this.resolvePromise = null;
    }

    /**
     * 显示简单确认弹窗
     * @param {Object} options - 配置选项
     * @param {string} options.title - 弹窗标题
     * @param {string} options.message - 提示消息
     * @param {string} options.confirmText - 确认按钮文字
     * @param {string} options.cancelText - 取消按钮文字
     * @param {boolean} options.danger - 是否为危险操作（红色确认按钮）
     * @returns {Promise<boolean>} 用户是否确认
     */
    async confirm(options = {}) {
        const {
            title = 'Confirm',
            message = 'Are you sure?',
            confirmText = 'Confirm',
            cancelText = 'Cancel',
            danger = false
        } = options;

        return new Promise((resolve) => {
            this.resolvePromise = resolve;
            this._createOverlay();
            this._createSimpleDialog({ title, message, confirmText, cancelText, danger });
            this._show();
        });
    }

    /**
     * 显示需要输入确认的弹窗（类似 GitHub 删除仓库）
     * @param {Object} options - 配置选项
     * @param {string} options.title - 弹窗标题
     * @param {string} options.confirmValue - 需要输入的确认值
     * @param {string} options.confirmText - 确认按钮文字
     * @param {string} options.cancelText - 取消按钮文字
     * @param {string} options.customContent - 自定义HTML内容
     * @returns {Promise<boolean>} 用户是否确认
     */
    async confirmWithInput(options = {}) {
        const {
            title = 'Confirm Delete',
            confirmValue = '',
            confirmText = 'Delete',
            cancelText = 'Cancel',
            customContent = ''
        } = options;

        return new Promise((resolve) => {
            this.resolvePromise = resolve;
            this._createOverlay();
            this._createInputDialog({ title, confirmValue, confirmText, cancelText, customContent });
            this._show();
        });
    }

    /**
     * 显示带产品预览的删除确认弹窗
     * @param {Object} product - 产品数据
     * @returns {Promise<boolean>} 用户是否确认删除
     */
    async confirmDeleteProduct(product) {
        const productPreview = this._buildProductPreview(product);
        
        return this.confirmWithInput({
            title: `Delete Product`,
            confirmValue: product.name,
            confirmText: 'Delete this product',
            cancelText: 'Cancel',
            customContent: productPreview
        });
    }

    /**
     * 构建产品预览HTML（只读模式）
     * @param {Object} product - 产品数据
     * @returns {string} HTML字符串
     * @private
     */
    _buildProductPreview(product) {
        const hasDiscount = product.discount && product.discount !== '0';
        const currentPrice = hasDiscount ? this._calculateDiscountedPrice(product.price, product.discount) : product.price;
        const stars = this._generateStarRating(product.average_rate || 5);
        const reviewCount = product.review ? Object.keys(product.review).length : 0;

        return `
            <div class="confirm-product-preview">
                <div class="preview-image-section">
                    <img src="${product.product_picture}" alt="${this._escapeHTML(product.name)}" 
                         class="preview-product-image" 
                         onerror="this.onerror=null;this.src='./images/products/placeholder.jpg';">
                </div>
                <div class="preview-info-section">
                    <h3 class="preview-product-name">${this._escapeHTML(product.name)}</h3>
                    <div class="preview-price-section">
                        <span class="preview-current-price">RM ${currentPrice.toFixed(1)}</span>
                        ${hasDiscount ? `<span class="preview-original-price">RM ${product.price.toFixed(1)}</span>` : ''}
                    </div>
                    <div class="preview-rating-section">
                        <div class="preview-stars">${stars}</div>
                        <span class="preview-review-count">${reviewCount} Reviews</span>
                    </div>
                    <p class="preview-brief">${this._escapeHTML(product.brief)}</p>
                    <div class="preview-meta">
                        <span class="preview-sku">SKU: ${this._escapeHTML(product.SKU || '')}</span>
                        <span class="preview-category">Category: ${this._escapeHTML(product.category || '')}</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 创建遮罩层
     * @private
     */
    _createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'confirm-dialog-overlay';
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this._close(false);
            }
        });
    }

    /**
     * 创建简单确认弹窗
     * @private
     */
    _createSimpleDialog({ title, message, confirmText, cancelText, danger }) {
        this.dialog = document.createElement('div');
        this.dialog.className = 'confirm-dialog';
        this.dialog.innerHTML = `
            <div class="confirm-dialog-header">
                <h3 class="confirm-dialog-title">${this._escapeHTML(title)}</h3>
                <button class="confirm-dialog-close" type="button">&times;</button>
            </div>
            <div class="confirm-dialog-body">
                <p class="confirm-dialog-message">${this._escapeHTML(message)}</p>
            </div>
            <div class="confirm-dialog-footer">
                <button class="confirm-dialog-btn cancel-btn" type="button">${this._escapeHTML(cancelText)}</button>
                <button class="confirm-dialog-btn confirm-btn ${danger ? 'danger' : ''}" type="button">${this._escapeHTML(confirmText)}</button>
            </div>
        `;

        this._bindSimpleEvents();
    }

    /**
     * 创建输入确认弹窗
     * @private
     */
    _createInputDialog({ title, confirmValue, confirmText, cancelText, customContent }) {
        this.dialog = document.createElement('div');
        this.dialog.className = 'confirm-dialog confirm-dialog-wide';
        this.dialog.innerHTML = `
            <div class="confirm-dialog-header">
                <h3 class="confirm-dialog-title">${this._escapeHTML(title)}</h3>
                <button class="confirm-dialog-close" type="button">&times;</button>
            </div>
            <div class="confirm-dialog-body">
                ${customContent}
                <div class="confirm-input-section">
                    <p class="confirm-input-label">To confirm, type "<strong>${this._escapeHTML(confirmValue)}</strong>" in the box below</p>
                    <input type="text" class="confirm-input" id="confirm-input" autocomplete="off" placeholder="">
                </div>
            </div>
            <div class="confirm-dialog-footer">
                <button class="confirm-dialog-btn cancel-btn" type="button">${this._escapeHTML(cancelText)}</button>
                <button class="confirm-dialog-btn confirm-btn danger" type="button" disabled>${this._escapeHTML(confirmText)}</button>
            </div>
        `;

        this._bindInputEvents(confirmValue);
    }

    /**
     * 绑定简单弹窗事件
     * @private
     */
    _bindSimpleEvents() {
        const closeBtn = this.dialog.querySelector('.confirm-dialog-close');
        const cancelBtn = this.dialog.querySelector('.cancel-btn');
        const confirmBtn = this.dialog.querySelector('.confirm-btn');

        closeBtn.addEventListener('click', () => this._close(false));
        cancelBtn.addEventListener('click', () => this._close(false));
        confirmBtn.addEventListener('click', () => this._close(true));

        // ESC 关闭
        this._handleEsc = (e) => {
            if (e.key === 'Escape') this._close(false);
        };
        document.addEventListener('keydown', this._handleEsc);
    }

    /**
     * 绑定输入确认弹窗事件
     * @private
     */
    _bindInputEvents(confirmValue) {
        const closeBtn = this.dialog.querySelector('.confirm-dialog-close');
        const cancelBtn = this.dialog.querySelector('.cancel-btn');
        const confirmBtn = this.dialog.querySelector('.confirm-btn');
        const input = this.dialog.querySelector('.confirm-input');

        closeBtn.addEventListener('click', () => this._close(false));
        cancelBtn.addEventListener('click', () => this._close(false));
        confirmBtn.addEventListener('click', () => this._close(true));

        // 输入验证
        input.addEventListener('input', () => {
            const matches = input.value.trim() === confirmValue;
            confirmBtn.disabled = !matches;
        });

        // 回车提交（如果验证通过）
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !confirmBtn.disabled) {
                this._close(true);
            }
        });

        // ESC 关闭
        this._handleEsc = (e) => {
            if (e.key === 'Escape') this._close(false);
        };
        document.addEventListener('keydown', this._handleEsc);

        // 聚焦输入框
        setTimeout(() => input.focus(), 100);
    }

    /**
     * 显示弹窗
     * @private
     */
    _show() {
        this.overlay.appendChild(this.dialog);
        document.body.appendChild(this.overlay);
        document.body.style.overflow = 'hidden';

        // 触发动画
        requestAnimationFrame(() => {
            this.overlay.classList.add('show');
            this.dialog.classList.add('show');
        });
    }

    /**
     * 关闭弹窗
     * @param {boolean} result - 用户选择结果
     * @private
     */
    _close(result) {
        if (this._handleEsc) {
            document.removeEventListener('keydown', this._handleEsc);
        }

        this.overlay.classList.remove('show');
        this.dialog.classList.remove('show');

        setTimeout(() => {
            if (this.overlay && this.overlay.parentNode) {
                this.overlay.parentNode.removeChild(this.overlay);
            }
            document.body.style.overflow = '';
            
            if (this.resolvePromise) {
                this.resolvePromise(result);
                this.resolvePromise = null;
            }
        }, 200);
    }

    /**
     * 计算折扣价 (rounded to 1 decimal place)
     * @private
     */
    _calculateDiscountedPrice(price, discount) {
        const match = discount.match(/-?(\d+)%/);
        if (match) {
            const discountPercent = parseInt(match[1]);
            // Round to 1 decimal place
            return Math.round(price * (1 - discountPercent / 100) * 10) / 10;
        }
        return price;
    }

    /**
     * 生成星级评分HTML
     * 规则：小数部分 > 0 则显示半星
     * 例如：3.7 = 3个完整星 + 1个半星，4.3 = 4个完整星 + 1个半星
     * @private
     */
    _generateStarRating(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = (rating - fullStars) > 0;
        
        let html = '';
        
        // 完整星
        for (let i = 0; i < fullStars && i < 5; i++) {
            html += '<img src="./images/icons/star.png" alt="star" class="preview-star-icon">';
        }
        
        // 半星（只要有小数部分就显示）
        if (hasHalfStar && fullStars < 5) {
            html += '<img src="./images/icons/half-star.png" alt="half star" class="preview-star-icon">';
        }
        
        return html;
    }

    /**
     * 转义HTML
     * @private
     */
    _escapeHTML(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// 创建全局单例
if (typeof window !== 'undefined') {
    window.ConfirmDialog = ConfirmDialog;
    window.confirmDialog = new ConfirmDialog();
}
