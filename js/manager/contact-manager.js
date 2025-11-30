/**
 * Contact Manager
 * Main manager for the contact page
 */
class ContactManager {
    constructor() {
        this.contactFormManager = null;
        this.isInitialized = false;
    }

    /**
     * Initialize the contact page manager
     */
    async initialize() {
        if (this.isInitialized) return;

        try {
            console.log('Initializing Contact Manager...');

            // Initialize contact form manager
            this.contactFormManager = new ContactFormManager();
            await this.contactFormManager.initialize();

            this.isInitialized = true;
            console.log('Contact Manager initialized successfully');

        } catch (error) {
            console.error('Failed to initialize Contact Manager:', error);
            throw error;
        }
    }

    /**
     * Get contact form manager instance
     * @returns {ContactFormManager} Contact form manager instance
     */
    getFormManager() {
        return this.contactFormManager;
    }

    /**
     * Check if manager is initialized
     * @returns {boolean} True if initialized
     */
    isReady() {
        return this.isInitialized && this.contactFormManager?.isInitialized;
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.ContactManager = ContactManager;
}
