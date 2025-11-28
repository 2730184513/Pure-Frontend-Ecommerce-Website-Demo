/**
 * Wishlist Dropdown Renderer
 * Handles the visual rendering and interactions of the wishlist dropdown in header
 */
class WishlistDropdownRenderer {
    constructor(wishlistManager) {
        this.wishlistManager = wishlistManager;
        this.icon = null;
        this.dropdown = null;
        this.badge = null;
        this.hoverTimer = null;
        this.hoverDelay = 500; // 0.5s hover delay
    }

    /**
     * Initialize the dropdown renderer
     */
    init() {
        this.cacheDOM();
        this.createDropdown();
        this.createBadge();
        this.bindEvents();
        this.updateBadge();
    }

    /**
     * Cache DOM elements
     */
    cacheDOM() {
        this.icon = document.querySelector('#icon-wishlist');
        this.dropdown = document.getElementById('wishlist-dropdown');
        this.badge = document.getElementById('wishlist-badge');
    }

    /**
     * Create dropdown structure if not exists
     */
    createDropdown() {
        if (!this.dropdown) {
            const headerContainer = document.querySelector('.header-container');
            if (headerContainer) {
                const wishDrop = document.createElement('div');
                wishDrop.id = 'wishlist-dropdown';
                wishDrop.className = 'header-dropdown wishlist-dropdown';
                wishDrop.innerHTML = '<div class="wishlist-items"></div>';
                headerContainer.appendChild(wishDrop);
                this.dropdown = wishDrop;
            }
        }
    }

    /**
     * Create badge element
     */
    createBadge() {
        if (!this.badge && this.icon) {
            const badge = document.createElement('div');
            badge.className = 'icon-badge';
            badge.id = 'wishlist-badge';
            badge.style.display = 'none';
            this.icon.appendChild(badge);
            this.badge = badge;
        }
    }

    /**
     * Bind event listeners for hover and click
     */
    bindEvents() {
        if (!this.icon || !this.dropdown) {
            console.warn('Wishlist elements not found');
            return;
        }

        // Click to show immediately
        this.icon.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showDropdown();
        });

        // Hover to show (0.5s delay)
        this.icon.addEventListener('mouseenter', () => {
            this.hoverTimer = setTimeout(() => {
                this.showDropdown();
            }, this.hoverDelay);
        });

        // Cancel timer if mouse leaves before delay
        this.icon.addEventListener('mouseleave', () => {
            if (this.hoverTimer) {
                clearTimeout(this.hoverTimer);
                this.hoverTimer = null;
            }
        });

        // Keep dropdown open when hovering over it
        this.dropdown.addEventListener('mouseenter', () => {
            this.dropdown.classList.add('active');
        });

        this.dropdown.addEventListener('mouseleave', () => {
            this.dropdown.classList.remove('active');
        });

        // Close dropdown when mouse leaves both icon and dropdown
        const hideDropdown = () => {
            setTimeout(() => {
                if (!this.icon.matches(':hover') && !this.dropdown.matches(':hover')) {
                    this.dropdown.classList.remove('active');
                }
            }, 100);
        };

        this.icon.addEventListener('mouseleave', hideDropdown);
        this.dropdown.addEventListener('mouseleave', hideDropdown);
    }

    /**
     * Show dropdown
     */
    showDropdown() {
        this.closeOtherDropdowns();
        this.render();
        this.dropdown.classList.add('active');
    }

    /**
     * Close other dropdowns (cart, etc)
     */
    closeOtherDropdowns() {
        const dropdowns = document.querySelectorAll('.header-dropdown');
        dropdowns.forEach(d => {
            if (d !== this.dropdown) {
                d.classList.remove('active');
            }
        });
    }

    /**
     * Update badge display
     */
    updateBadge() {
        if (!this.badge) return;

        const count = this.wishlistManager.getCount();

        if (count > 0) {
            this.badge.style.display = 'flex';
            this.badge.textContent = count > 99 ? '99+' : count;
        } else {
            this.badge.style.display = 'none';
        }
    }

    /**
     * Play wishlist icon animation with red heart swap
     */
    playIconAnimation() {
        if (!this.icon) return;

        // Find the heart image inside the icon
        const heartImg = this.icon.querySelector('img');
        if (!heartImg) return;

        // Store original src
        const originalSrc = heartImg.src;
        const redHeartSrc = '/201-project/images/icons/red-heart.png';

        // Remove animation class if already exists
        this.icon.classList.remove('wishlist-icon-animate');

        // Change to red heart
        heartImg.src = redHeartSrc;

        // Force reflow to restart animation
        void this.icon.offsetWidth;

        // Add animation class
        this.icon.classList.add('wishlist-icon-animate');

        // Restore original icon and remove class after animation completes
        setTimeout(() => {
            heartImg.src = originalSrc;
            this.icon.classList.remove('wishlist-icon-animate');
        }, 1000);
    }

    /**
     * Render wishlist items in dropdown
     */
    render() {
        const container = this.dropdown.querySelector('.wishlist-items');
        if (!container) return;

        container.innerHTML = '';

        const wishlist = this.wishlistManager.getWishlist();

        if (wishlist.length === 0) {
            container.innerHTML = '<p style="text-align:center;padding:20px;color:#9F9F9F">Wishlist is empty</p>';
            return;
        }

        wishlist.forEach(item => {
            const el = document.createElement('div');
            el.className = 'wishlist-item';

            // Use placeholder first for instant display
            const placeholderSrc = '/201-project/images/products/placeholder.jpg';

            el.innerHTML = `
                <img src="${placeholderSrc}" 
                     class="wishlist-item-img" 
                     alt="${item.name}"
                     data-src="${item.product_picture}">
                <div class="cart-item-info">
                    <span class="cart-item-title">${item.name}</span>
                    <span class="cart-item-variant" style="font-size:12px">${item.brief.substring(0, 30)}...</span>
                </div>
                <button class="remove-wish-btn" 
                        data-id="${item.id}" 
                        style="border:none;background:transparent;cursor:pointer;font-size:16px;">✕</button>
            `;
            container.appendChild(el);
        });

        // Lazy load actual images after render
        this.lazyLoadImages(container);

        // Bind remove buttons
        container.querySelectorAll('.remove-wish-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const productId = btn.dataset.id;
                const item = wishlist.find(i => i.id === productId);
                if (item) {
                    this.wishlistManager.removeProduct(productId);
                    this.wishlistManager.showNotification(`${item.name} removed from wishlist`, 'info');
                    this.render();
                    this.updateBadge();
                }
            });
        });
    }

    /**
     * Lazy load images after rendering
     * @param {HTMLElement} container - Container with images
     */
    lazyLoadImages(container) {
        const images = container.querySelectorAll('img[data-src]');

        images.forEach(img => {
            const actualSrc = img.dataset.src;

            // Load image
            const loader = new Image();
            loader.onload = () => {
                img.src = actualSrc;
            };
            loader.onerror = () => {
                console.warn('Failed to load wishlist image:', actualSrc);
                // Keep placeholder on error
            };
            loader.src = actualSrc;
        });
    }
}

if (typeof window !== 'undefined') {
    window.WishlistDropdownRenderer = WishlistDropdownRenderer;
}

