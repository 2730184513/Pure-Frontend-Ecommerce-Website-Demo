/**
 * About Page Manager
 * Manages about page specific functionality including paragraph reveal animations
 */
class AboutManager {
    constructor() {
        this.isInitialized = false;
        this.paragraphReveal = null;
    }

    /**
     * Initialize about page manager
     * @returns {Promise<void>}
     */
    async init() {
        if (this.isInitialized) {
            console.warn('AboutManager already initialized');
            return;
        }

        try {
            console.log('🚀 Initializing About Manager...');

            // Initialize paragraph reveal animation
            this._initParagraphReveal();

            this.isInitialized = true;
            console.log('✓ About Manager initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing About Manager:', error);
            throw error;
        }
    }

    /**
     * Initialize paragraph reveal animation effect
     * @private
     */
    _initParagraphReveal() {
        if (window.ParagraphReveal) {
            this.paragraphReveal = new ParagraphReveal();
            console.log('✓ Paragraph reveal animation initialized');
        } else {
            console.warn('ParagraphReveal class not found');
        }
    }

    /**
     * Cleanup resources when leaving page
     */
    destroy() {
        if (this.paragraphReveal) {
            this.paragraphReveal.destroy?.();
            this.paragraphReveal = null;
        }
        this.isInitialized = false;
    }

    /**
     * Check if manager is ready
     * @returns {boolean}
     */
    isReady() {
        return this.isInitialized;
    }
}

// Export for global access
if (typeof window !== 'undefined') {
    window.AboutManager = AboutManager;
}
