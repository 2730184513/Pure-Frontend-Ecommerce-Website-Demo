/**
 * Product Detail Manager
 * Page-level coordinator for the product detail page
 * Holds and coordinates section managers: breadcrumb, product info, description, related products
 */

class ProductDetailManager {
    constructor() {
        // Current product data
        this.product = null;
        this.productId = null;
        this.sourcePage = null;

        // Section managers
        this.managers = {
            breadcrumb: null,      // BreadcrumbRenderer (no separate manager needed)
            productInfo: null,     // ProductInfoManager
            description: null,     // ProductDescriptionManager
            relatedProducts: null  // RelatedProductsManager
        };
    }

    /**
     * Initialize the product detail page
     * @returns {Promise<void>}
     */
    async init() {
        console.log('🚀 Initializing Product Detail Manager...');

        try {
            // Load session data (product ID and source page)
            this.loadSessionData();

            // Load product data from repository
            await this.loadProductData();

            if (!this.product) {
                this.handleProductNotFound();
                return;
            }

            // Initialize all section managers
            await this.initializeSectionManagers();

            console.log('✓ Product Detail Manager initialized successfully');
        } catch (error) {
            console.error('✗ Error initializing Product Detail Manager:', error);
            throw error;
        }
    }

    /**
     * Load product ID and source page from sessionStorage
     * @private
     */
    loadSessionData() {
        this.productId = sessionStorage.getItem('productDetailId');
        this.sourcePage = sessionStorage.getItem('productDetailSource') || 'home';
        
        console.log(`📦 Loading product: ${this.productId} from ${this.sourcePage}`);
    }

    /**
     * Load product data from repository
     * @private
     * @returns {Promise<void>}
     */
    async loadProductData() {
        if (!this.productId) {
            console.warn('No product ID found in sessionStorage');
            return;
        }

        // Ensure product repository is loaded
        if (!window.productRepository.dataLoaded) {
            await window.productRepository.loadAll();
        }

        this.product = window.productRepository.getById(this.productId);

        if (this.product) {
            console.log(`✓ Product loaded: ${this.product.name}`);
            // Update page title
            document.title = `${this.product.name} - Furniro`;
        }
    }

    /**
     * Handle case when product is not found
     * @private
     */
    handleProductNotFound() {
        console.error('Product not found');
        
        if (window.toast) {
            window.toast.error('Product not found. Redirecting to shop...');
        }

        // Redirect to shop page after a delay
        setTimeout(() => {
            window.location.href = './shop.html';
        }, 2000);
    }

    /**
     * Initialize all section managers
     * @private
     */
    async initializeSectionManagers() {
        // 1. Breadcrumb (uses renderer directly, no manager needed)
        this.initBreadcrumb();

        // 2. Product Info Section
        this.initProductInfoSection();

        // 3. Product Description Section
        this.initDescriptionSection();

        // 4. Related Products Section
        await this.initRelatedProductsSection();
    }

    /**
     * Initialize breadcrumb navigation
     * @private
     */
    initBreadcrumb() {
        if (window.BreadcrumbRenderer) {
            this.managers.breadcrumb = new BreadcrumbRenderer('#product-breadcrumb .breadcrumb');
            this.managers.breadcrumb.render({
                sourcePage: this.sourcePage,
                productName: this.product.name
            });
            console.log('✓ Breadcrumb initialized');
        } else {
            console.warn('BreadcrumbRenderer not found');
        }
    }

    /**
     * Initialize product info section
     * @private
     */
    initProductInfoSection() {
        if (window.ProductInfoManager) {
            this.managers.productInfo = new ProductInfoManager('#product-info');
            this.managers.productInfo.init(this.product);
        } else {
            console.warn('ProductInfoManager not found');
        }
    }

    /**
     * Initialize description section
     * @private
     */
    initDescriptionSection() {
        if (window.ProductDescriptionManager) {
            this.managers.description = new ProductDescriptionManager('#product-description');
            this.managers.description.init(this.product);
        } else {
            console.warn('ProductDescriptionManager not found');
        }
    }

    /**
     * Initialize related products section
     * @private
     */
    async initRelatedProductsSection() {
        if (window.RelatedProductsManager) {
            this.managers.relatedProducts = new RelatedProductsManager('#related-products');
            await this.managers.relatedProducts.init(this.product);
        } else {
            console.warn('RelatedProductsManager not found');
        }
    }

    /**
     * Get current product data
     * @returns {Object|null} Current product data
     */
    getProduct() {
        return this.product;
    }

    /**
     * Get a specific section manager
     * @param {string} name - Manager name ('breadcrumb', 'productInfo', 'description', 'relatedProducts')
     * @returns {Object|null} Manager instance
     */
    getManager(name) {
        return this.managers[name] || null;
    }

    /**
     * Get all section managers
     * @returns {Object} All managers
     */
    getAllManagers() {
        return { ...this.managers };
    }
}

// Export to global scope
if (typeof window !== 'undefined') {
    window.ProductDetailManager = ProductDetailManager;
}
