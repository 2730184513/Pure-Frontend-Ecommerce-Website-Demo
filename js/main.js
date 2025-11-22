/**
 * Furniro E-commerce - Main Application Controller
 */

class FurniroApp {
    constructor() {
        this.modules = {
            categoryRotator: null,
            carousel: null,
            productHover: null
        };
        this.isInitialized = false;
    }

    init() {
        if (this.isInitialized) {
            console.warn('Application already initialized');
            return;
        }

        console.log('Initializing Furniro Application...');

        // 初始化各个模块（将从其他文件加载）
        this.isInitialized = true;
        console.log('Furniro Application initialized successfully');
    }

    getModule(name) {
        return this.modules[name];
    }

    destroy() {
        Object.values(this.modules).forEach(module => {
            if (module && typeof module.destroy === 'function') {
                module.destroy();
            }
        });

        this.modules = {};
        this.isInitialized = false;
        console.log('Application destroyed');
    }

    restart() {
        this.destroy();
        this.init();
    }
}

// Bootstrap
const app = new FurniroApp();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
} else {
    app.init();
}

window.FurniroApp = app;
