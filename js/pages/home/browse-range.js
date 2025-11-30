/**
 * Category Image Rotator Module
 */

class CategoryRotator {
    constructor(config = {}) {
        this.config = {
            categories: ['dining', 'living', 'bedroom'],
            imageBasePath: '/201-project/images/',
            imageExtension: '.png',
            totalImagesPerCategory: 3,
            rotationInterval: 5000,
            ...config
        };

        this.timers = [];
        this.currentIndexes = new Map();
        this.section = null;
    }

    init() {
        this.section = document.getElementById('browseRange');
        if (!this.section) {
            console.warn('Browse Range section not found');
            return;
        }

        this.config.categories.forEach(category => {
            this.initCategory(category);
        });

        console.log('CategoryRotator initialized');
    }

    initCategory(category) {
        const card = this.section.querySelector(`[data-category="${category}"]`);
        if (!card) {
            console.warn(`Category card not found: ${category}`);
            return;
        }

        this.currentIndexes.set(category, 1);

        const timer = setInterval(() => {
            this.rotateImage(card, category);
        }, this.config.rotationInterval);

        this.timers.push(timer);
    }

    rotateImage(card, category) {
        let currentIndex = this.currentIndexes.get(category);
        currentIndex = (currentIndex % this.config.totalImagesPerCategory) + 1;
        this.currentIndexes.set(category, currentIndex);

        this.updateImage(card, category, currentIndex);
    }

    updateImage(card, category, index) {
        const img = card.querySelector('.category-image');
        if (!img) return;

        const imagePath = `${this.config.imageBasePath}${category}${index}${this.config.imageExtension}`;
        img.src = imagePath;
        img.alt = `${this.capitalize(category)} Room Furniture ${index}`;
    }

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    destroy() {
        this.timers.forEach(timer => clearInterval(timer));
        this.timers = [];
        this.currentIndexes.clear();
        console.log('CategoryRotator destroyed');
    }
}

// Export class to global scope for HomeManager
if (typeof window !== 'undefined') {
    window.CategoryRotator = CategoryRotator;
}
