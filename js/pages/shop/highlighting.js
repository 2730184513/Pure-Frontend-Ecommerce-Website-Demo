/**
 * Highlighting Manager
 * Manages search keyword highlighting in product cards
 */
class HighlightingManager {
    constructor() {
        this.keyword = '';
    }

    /**
     * Set keyword to highlight
     * @param {string} keyword - Keyword to highlight
     */
    setKeyword(keyword) {
        this.keyword = (keyword || '').toLowerCase();
    }

    /**
     * Get current keyword
     * @returns {string}
     */
    getKeyword() {
        return this.keyword;
    }

    /**
     * Highlight keyword in a single card
     * @param {HTMLElement} card - Product card element
     * @param {string} keyword - Optional keyword override
     */
    highlightCard(card, keyword = null) {
        const searchTerm = keyword !== null ? keyword : this.keyword;

        if (!searchTerm || !card) return;

        const regex = new RegExp(`(${this.escapeRegex(searchTerm)})`, 'gi');

        // Highlight product name
        const nameElement = card.querySelector('.product-name');
        if (nameElement && nameElement.textContent) {
            nameElement.innerHTML = nameElement.textContent.replace(regex, '<span class="highlight-red">$1</span>');
        }

        // Highlight product description
        const descElement = card.querySelector('.product-desc');
        if (descElement && descElement.textContent) {
            descElement.innerHTML = descElement.textContent.replace(regex, '<span class="highlight-red">$1</span>');
        }
    }

    /**
     * Highlight keyword in multiple cards
     * @param {Array<HTMLElement>} cards - Array of product card elements
     * @param {string} keyword - Optional keyword override
     */
    highlightCards(cards, keyword = null) {
        const searchTerm = keyword !== null ? keyword : this.keyword;

        if (!searchTerm || !cards || cards.length === 0) return;

        cards.forEach(card => this.highlightCard(card, searchTerm));
    }

    /**
     * Highlight keyword in container's children
     * @param {string} containerSelector - Container selector
     * @param {string} keyword - Optional keyword override
     */
    highlightInContainer(containerSelector, keyword = null) {
        const container = document.querySelector(containerSelector);
        if (!container) return;

        const cards = container.querySelectorAll('.product-card');
        this.highlightCards(Array.from(cards), keyword);
    }

    /**
     * Remove highlights from a card
     * @param {HTMLElement} card - Product card element
     */
    removeHighlightFromCard(card) {
        if (!card) return;

        const highlighted = card.querySelectorAll('.highlight-red');
        highlighted.forEach(el => {
            const parent = el.parentNode;
            parent.replaceChild(document.createTextNode(el.textContent), el);
            parent.normalize();
        });
    }

    /**
     * Remove all highlights from multiple cards
     * @param {Array<HTMLElement>} cards - Array of product card elements
     */
    removeHighlightsFromCards(cards) {
        if (!cards || cards.length === 0) return;
        cards.forEach(card => this.removeHighlightFromCard(card));
    }

    /**
     * Remove all highlights from container
     * @param {string} containerSelector - Container selector
     */
    removeHighlightsFromContainer(containerSelector) {
        const container = document.querySelector(containerSelector);
        if (!container) return;

        const cards = container.querySelectorAll('.product-card');
        this.removeHighlightsFromCards(Array.from(cards));
    }

    /**
     * Clear keyword and remove all highlights
     */
    clear() {
        this.keyword = '';
    }

    /**
     * Escape special regex characters
     * @param {string} string - String to escape
     * @returns {string} Escaped string
     * @private
     */
    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}

if (typeof window !== 'undefined') {
    window.HighlightingManager = HighlightingManager;
}

