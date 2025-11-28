/**
 * Cart Page Manager
 * Main controller for the cart.html page
 */
class CartPageManager {
    constructor() {
        this.cartManager = null;
        this.lineRenderer = null;
        this.summaryManager = null;
        this.container = null;
        this.navStateManager = new NavigationStateManager();
    }

    /**
     * Initialize the cart page
     */
    async init() {
        console.log('🛒 Initializing Cart Page...');

        // Wait for cart manager to be available (CartManager from header/cart.js)
        if (!window.CartManager) {
            console.error('CartManager not found');
            return;
        }

        // Get the existing cart manager instance (created by HeaderManager)
        if (!window.cartManagerInstance) {
            console.error('CartManager instance not found. HeaderManager should have initialized it.');
            return;
        }

        this.cartManager = window.cartManagerInstance;

        // Cache DOM
        this.container = document.getElementById('cart-items-container');

        if (!this.container) {
            console.error('Cart items container not found');
            return;
        }

        // Initialize renderers
        this.lineRenderer = new CartProductLineRenderer(this.cartManager);
        this.summaryManager = new CartSummaryManager(this.cartManager);

        // Bind events
        this.bindEvents();

        // Check if returning from incomplete checkout BEFORE rendering
        const shouldRestore = sessionStorage.getItem('returning_from_checkout') === 'true';
        const selectedVariantIds = shouldRestore ? this.navStateManager.getCartSelections() : null;

        // Initial render (don't check empty cart here - only check on checkout)
        this.render();

        // Initialize summary (this will call update() once)
        this.summaryManager.init();

        // Check if redirected from successful order placement
        this.checkOrderSuccess();

        // Restore selection after render and summary init complete
        if (shouldRestore && selectedVariantIds && selectedVariantIds.length > 0) {
            this.restoreCheckoutSelection(selectedVariantIds);
        } else if (shouldRestore) {
            // Clear flag even if no selections to restore
            sessionStorage.removeItem('returning_from_checkout');
        }

        console.log('✓ Cart Page initialized');
    }
    /**
     * Check if order was successfully placed and show notification
     */
    checkOrderSuccess() {
        const orderSuccess = sessionStorage.getItem('order_placed_success');
        if (orderSuccess === 'true') {
            // Clear the flag
            sessionStorage.removeItem('order_placed_success');

            // Show success toast
            if (window.toast) {
                window.toast.show('Order placed successfully! Thank you for your purchase🎉', 'success', 3000);
            }
        }
    }

    /**
     * Restore selected items when returning from incomplete checkout
     * @param {Array} selectedVariantIds - Array of variant IDs to restore
     */
    restoreCheckoutSelection(selectedVariantIds) {
        console.log('🔄 Restoring checkout selections...');

        // 延迟执行确保 DOM 完全渲染
        requestAnimationFrame(() => {
            setTimeout(() => {
                const result = this._restoreCheckboxStates(selectedVariantIds);
                this._updateSummaryAfterRestore();
                this._logRestorationResult(result);
                this._showRestorationToast(result);
                this._cleanupRestorationFlags();
            }, 150);
        });
    }

    /**
     * 恢复所有 checkbox 的选中状态
     * @private
     * @param {Array} selectedVariantIds
     * @returns {Object} {restoredCount, notFoundIds}
     */
    _restoreCheckboxStates(selectedVariantIds) {
        let restoredCount = 0;
        const notFoundIds = [];

        selectedVariantIds.forEach(variantId => {
            const checkbox = document.querySelector(`.item-checkbox[data-variant-id="${variantId}"]`);
            if (checkbox) {
                checkbox.checked = true;
                restoredCount++;
            } else {
                notFoundIds.push(variantId);
            }
        });

        return { restoredCount, notFoundIds, totalCount: selectedVariantIds.length };
    }

    /**
     * 更新购物车摘要
     * @private
     */
    _updateSummaryAfterRestore() {
        if (this.summaryManager) {
            this.summaryManager.update();
        }
    }

    /**
     * 记录恢复结果日志
     * @private
     * @param {Object} result
     */
    _logRestorationResult(result) {
        console.log(`✓ Restored ${result.restoredCount}/${result.totalCount} selections`);
    }

    /**
     * 显示恢复结果的 toast 通知
     * @private
     * @param {Object} result - {restoredCount, notFoundIds, totalCount}
     */
    _showRestorationToast(result) {
        if (!window.toast) return;

        const { restoredCount, notFoundIds, totalCount } = result;

        if (restoredCount > 0) {
            const itemWord = restoredCount > 1 ? 'items' : 'item';
            window.toast.show(`Restored ${restoredCount} selected ${itemWord} from checkout`, 'success', 2000);
        } else if (notFoundIds.length === totalCount) {
            window.toast.show('Previously selected items are no longer in cart', 'warning', 2000);
        }
    }

    /**
     * 清理恢复相关的 sessionStorage 标志
     * @private
     */
    _cleanupRestorationFlags() {
        sessionStorage.removeItem('returning_from_checkout');
        this.navStateManager.clearCartSelections();
    }


    /**
     * Bind global events
     */
    bindEvents() {
        // Listen for cart updates
        window.addEventListener('cartUpdated', () => {
            this.render();
        });

        // Listen for storage changes (sync across tabs)
        window.addEventListener('storage', (e) => {
            if (e.key === 'furniro_cart') {
                this.render();
            }
        });
    }

    /**
     * Render the cart page
     */
    render() {
        if (!this.lineRenderer || !this.container) return;

        this.lineRenderer.renderAll(this.container);

        // Note: Summary will be updated after restoration completes or immediately if no restoration
    }
}

if (typeof window !== 'undefined') {
    window.CartPageManager = CartPageManager;
}

