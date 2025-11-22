/**
 * Product Card Hover Module
 */

class ProductPopup {
    constructor(productCard) {
        this.card = productCard;
        this.productId = productCard.dataset.productId;
        this.productName = productCard.querySelector('.product-name')?.textContent || 'Unknown Product';
        this.element = null;

        this.template = `
            <div class="pop-up">
                <div class="overlay"></div>
                <div class="popup-actions">
                    <button class="btn-add-cart">
                        <span class="addtocart-span">Add to cart</span>
                    </button>
                    <div class="action-links">
                        <div class="action-item action-share">
                            <div class="icon-share"></div>
                            <span>Share</span>
                        </div>
                        <div class="action-item action-compare">
                            <div class="icon-compare"></div>
                            <span>Compare</span>
                        </div>
                        <div class="action-item action-like">
                            <div class="icon-like"></div>
                            <span>Like</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    render() {
        if (this.card.querySelector('.pop-up')) {
            return;
        }

        this.element = this.createElement();
        this.card.appendChild(this.element);
        this.attachEvents();
    }

    createElement() {
        const temp = document.createElement('div');
        temp.innerHTML = this.template.trim();
        return temp.firstChild;
    }

    attachEvents() {
        if (!this.element) return;

        const addToCartBtn = this.element.querySelector('.btn-add-cart');
        const shareBtn = this.element.querySelector('.action-share');
        const compareBtn = this.element.querySelector('.action-compare');
        const likeBtn = this.element.querySelector('.action-like');

        addToCartBtn?.addEventListener('click', (e) => this.handleAddToCart(e));
        shareBtn?.addEventListener('click', (e) => this.handleShare(e));
        compareBtn?.addEventListener('click', (e) => this.handleCompare(e));
        likeBtn?.addEventListener('click', (e) => this.handleLike(e));
    }

    handleAddToCart(event) {
        event.stopPropagation();
        console.log(`[Cart] Added: ${this.productName} (ID: ${this.productId})`);
        alert(`${this.productName} has been added to your cart!`);
    }

    handleShare(event) {
        event.stopPropagation();
        console.log(`[Share] Product: ${this.productName}`);

        if (navigator.share) {
            navigator.share({
                title: this.productName,
                text: `Check out ${this.productName} on Furniro!`,
                url: window.location.href
            }).catch(err => console.log('Share cancelled'));
        } else {
            alert(`Share ${this.productName} - Feature coming soon!`);
        }
    }

    handleCompare(event) {
        event.stopPropagation();
        console.log(`[Compare] Product: ${this.productName}`);
        alert(`${this.productName} added to comparison!`);
    }

    handleLike(event) {
        event.stopPropagation();
        console.log(`[Like] Product: ${this.productName}`);
        alert(`You liked ${this.productName}!`);
    }

    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        this.element = null;
    }
}

class ProductHoverManager {
    constructor() {
        this.popups = new Map();
        this.section = null;
    }

    init() {
        this.section = document.getElementById('products');
        if (!this.section) {
            console.warn('Products section not found');
            return;
        }

        this.attachToAllProducts();
        console.log('ProductHoverManager initialized');
    }

    attachToAllProducts() {
        const productCards = this.section.querySelectorAll('.product-card');
        productCards.forEach(card => this.attachToProduct(card));
    }

    attachToProduct(card) {
        const productId = card.dataset.productId;

        if (this.popups.has(productId)) {
            return;
        }

        const popup = new ProductPopup(card);
        popup.render();
        this.popups.set(productId, popup);
    }

    destroy() {
        this.popups.forEach(popup => popup.destroy());
        this.popups.clear();
        console.log('ProductHoverManager destroyed');
    }
}

// Auto-initialize
const productHoverManager = new ProductHoverManager();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => productHoverManager.init());
} else {
    productHoverManager.init();
}

// Register with main app
if (window.FurniroApp) {
    window.FurniroApp.modules.productHover = productHoverManager;
}
