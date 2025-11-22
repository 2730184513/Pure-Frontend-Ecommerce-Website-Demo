/**
 * Inspirations Carousel Module
 */

class CarouselSlide {
    constructor(data, styleClass = 'carousel-side') {
        this.data = data;
        this.styleClass = styleClass;
        this.element = null;
    }

    render() {
        this.element = document.createElement('div');
        this.element.className = `carousel-slide ${this.styleClass}`;

        const img = document.createElement('img');
        img.src = this.data.url;
        img.alt = this.data.name;
        img.loading = 'lazy';

        this.element.appendChild(img);
        return this.element;
    }

    setStyle(styleClass) {
        this.styleClass = styleClass;
        if (this.element) {
            this.element.className = `carousel-slide ${styleClass}`;
        }
    }
}

class CarouselIndicator {
    constructor(index, isActive = false) {
        this.index = index;
        this.isActive = isActive;
        this.element = null;
        this.clickCallback = null;
    }

    render() {
        this.element = document.createElement('div');
        this.element.className = 'indicator-item';
        this.element.dataset.index = this.index;

        if (this.isActive) {
            this.activate();
        }

        this.element.addEventListener('click', () => {
            if (this.clickCallback) {
                this.clickCallback(this.index);
            }
        });

        return this.element;
    }

    activate() {
        this.isActive = true;
        if (this.element) {
            this.element.className = 'indicator-item indicator-active';
            this.element.innerHTML = '<div class="indicator-inner"></div>';
        }
    }

    deactivate() {
        this.isActive = false;
        if (this.element) {
            this.element.className = 'indicator-item';
            this.element.innerHTML = '';
        }
    }

    onClick(callback) {
        this.clickCallback = callback;
    }
}

class InspirationsCarousel {
    constructor(config = {}) {
        this.config = {
            images: [
                { url: 'images/room1.jpg', room: 'Bedroom', name: 'Inner Peace' },
                { url: 'images/room2.jpg', room: 'Living Room', name: 'Modern Comfort' },
                { url: 'images/room3.jpg', room: 'Dining Room', name: 'Elegant Space' },
                { url: 'images/room4.jpg', room: 'Office', name: 'Productive Haven' },
                { url: 'images/room5.jpg', room: 'Kitchen', name: 'Culinary Bliss' }
            ],
            visibleSlides: 4,
            ...config
        };

        this.currentIndex = 0;
        this.slides = [];
        this.indicators = [];

        this.section = null;
        this.track = null;
        this.indicatorsContainer = null;
        this.prevBtn = null;
        this.nextBtn = null;
        this.roomNumberEl = null;
        this.roomTypeEl = null;
        this.roomNameEl = null;
    }

    init() {
        this.cacheDOM();

        if (!this.validateDOM()) {
            console.warn('Inspirations Carousel: Required DOM elements not found');
            return;
        }

        this.createSlides();
        this.createIndicators();
        this.attachEvents();
        this.render();

        console.log('InspirationsCarousel initialized');
    }

    cacheDOM() {
        this.section = document.getElementById('inspirationsCarousel');
        if (!this.section) return;

        this.track = this.section.querySelector('.carousel-track');
        this.indicatorsContainer = this.section.querySelector('#carouselIndicators');
        this.prevBtn = this.section.querySelector('#prevBtn');
        this.nextBtn = this.section.querySelector('#nextBtn');
        this.roomNumberEl = this.section.querySelector('#roomNumber');
        this.roomTypeEl = this.section.querySelector('#roomType');
        this.roomNameEl = this.section.querySelector('#roomName');
    }

    validateDOM() {
        return !!(this.track && this.indicatorsContainer &&
            this.prevBtn && this.nextBtn);
    }

    createSlides() {
        this.slides = this.config.images.map((data) =>
            new CarouselSlide(data)
        );
    }

    createIndicators() {
        this.indicators = this.config.images.map((_, index) => {
            const indicator = new CarouselIndicator(index, index === 0);
            indicator.onClick((idx) => this.goToSlide(idx));
            return indicator;
        });
    }

    attachEvents() {
        this.nextBtn.addEventListener('click', () => this.next());
        this.prevBtn.addEventListener('click', () => this.prev());
    }

    render() {
        this.renderSlides();
        this.renderIndicators();
        this.updateRoomInfo();
    }

    renderSlides() {
        this.track.innerHTML = '';

        // 渲染4张图片：主图 + 2张完整侧图 + 1张被遮挡图
        for (let i = 0; i < this.config.visibleSlides && i < this.config.images.length; i++) {
            const slideIndex = (this.currentIndex + i) % this.config.images.length;
            const slide = this.slides[slideIndex];

            // 设置样式类
            if (i === 0) {
                slide.setStyle('carousel-main');
            } else if (i === 3) {
                slide.setStyle('carousel-peek');
            } else {
                slide.setStyle('carousel-side');
            }

            this.track.appendChild(slide.render());
        }
    }

    renderIndicators() {
        this.indicatorsContainer.innerHTML = '';

        this.indicators.forEach((indicator, index) => {
            if (index === this.currentIndex) {
                indicator.activate();
            } else {
                indicator.deactivate();
            }
            this.indicatorsContainer.appendChild(indicator.render());
        });
    }

    updateRoomInfo() {
        const currentRoom = this.config.images[this.currentIndex];
        const roomNumber = String(this.currentIndex + 1).padStart(2, '0');

        if (this.roomNumberEl) this.roomNumberEl.textContent = roomNumber;
        if (this.roomTypeEl) this.roomTypeEl.textContent = currentRoom.room;
        if (this.roomNameEl) this.roomNameEl.textContent = currentRoom.name;
    }

    next() {
        this.currentIndex = (this.currentIndex + 1) % this.config.images.length;
        this.render();
    }

    prev() {
        this.currentIndex = (this.currentIndex - 1 + this.config.images.length) % this.config.images.length;
        this.render();
    }

    goToSlide(index) {
        if (index < 0 || index >= this.config.images.length) return;
        this.currentIndex = index;
        this.render();
    }

    destroy() {
        this.slides = [];
        this.indicators = [];
        if (this.track) this.track.innerHTML = '';
        if (this.indicatorsContainer) this.indicatorsContainer.innerHTML = '';
        console.log('InspirationsCarousel destroyed');
    }
}

// Auto-initialize
const inspirationsCarousel = new InspirationsCarousel();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => inspirationsCarousel.init());
} else {
    inspirationsCarousel.init();
}

// Register with main app
if (window.FurniroApp) {
    window.FurniroApp.modules.carousel = inspirationsCarousel;
}
