# Quick Reference Guide

## 🚀 What Changed?

### Before ❌
```javascript
// main.js - Mixed concerns, repeated code
await ComponentLoader.initCommonComponents(); // Global for all pages
if (isCheckoutPage) {
    // Hide header with CSS hacks
    header.style.visibility = 'hidden';
}

// Initialize components directly
if (NavigationManager) {
    const nav = new NavigationManager();
    nav.init();
}
// Repeated for each component...

// Repeated page detection
const isShopPage = document.getElementById('shop-product-grid');
if (isShopPage) { /* ... */ }
```

### After ✅
```javascript
// main.js - Clean, organized, SOLID
await this._loadPageComponents(); // Per-page loading
this._initHeaderManager();         // Single manager
await this._dispatchPageLogic();   // Utility-based detection

// Uses PageUtility
const pageId = PageUtility.getCurrentPageId(); // Centralized

// Uses managers
this.managers.header = new HeaderManager();  // Encapsulated
this.managers.home = new HomeManager();      // Separated
```

---

## 📁 New Files

### 1. `js/core/page-utility.js`
**Purpose:** Page detection and identification

**Key Usage:**
```javascript
// Get current page
const pageId = PageUtility.getCurrentPageId(); // Returns 1-4

// Check specific page
if (PageUtility.isCheckoutPage()) {
    // Checkout-specific logic
}

// Get page name
const name = PageUtility.getPageName(pageId); // "Home", "Shop", etc.
```

### 2. `js/manager/header-manager.js`
**Purpose:** Manages all header components

**Key Usage:**
```javascript
const headerManager = new HeaderManager();
headerManager.init();

// Access components
const cart = headerManager.getCart();
const search = headerManager.getSearch();
```

### 3. `js/manager/home-manager.js`
**Purpose:** Manages home page functionality

**Key Usage:**
```javascript
const homeManager = new HomeManager({
    initialProductCount: 8,
    loadMoreCount: 8
});
await homeManager.init();

// Access components
const repo = homeManager.getProductRepository();
```

---

## 🔧 Modified Files

### `js/component/component-loader.js`

**Removed:**
- ❌ `initCommonComponents()` - No longer needed

**Improved:**
- ✅ Better structure (sections: Core, Parameters, Helpers)
- ✅ Extracted helper functions
- ✅ Applied SRP

**Usage:**
```javascript
// Load specific components
await ComponentLoader.loadComponents([
    { name: 'header', target: '#header-placeholder' },
    { name: 'footer', target: '#footer-placeholder' }
]);
```

### `js/manager/main.js`

**Changed:**
- ✅ Dynamic component loading per page
- ✅ Uses PageUtility for detection
- ✅ Uses managers instead of direct initialization
- ✅ Cleaner structure

**Flow:**
```javascript
1. _loadPageComponents()     // Load header/footer (or just footer)
2. _initHeaderManager()       // Init header (skip checkout)
3. _dispatchPageLogic()       // Detect page & init manager
```

---

## 📄 Page-Specific Behavior

### Home (index.html)
```
Load: Header + Footer
Init: HeaderManager + HomeManager
Components: Carousel, CategoryRotator, ProductGrid, ShowMore
```

### Shop (shop.html)
```
Load: Header + Footer
Init: HeaderManager + ShopManager
Components: Filters, Toolbar, ProductGrid, Pagination
```

### Cart (cart.html)
```
Load: Header + Footer
Init: HeaderManager + CartManager (inline)
Components: CartItems, Summary, Carousel
```

### Checkout (checkout.html) ⚠️
```
Load: Footer ONLY (NO HEADER)
Init: CheckoutManager (inline)
Components: Form, Summary, Back button
```

---

## 🎯 Key Concepts

### 1. Single Responsibility Principle (SRP)
Each class has ONE job:
- `ComponentLoader` → Loads components
- `PageUtility` → Detects pages
- `HeaderManager` → Manages header
- `HomeManager` → Manages home page
- `FurniroApp` → Coordinates everything

### 2. Page Detection
```javascript
// Old way ❌
const isShopPage = document.getElementById('shop-product-grid');

// New way ✅
const pageId = PageUtility.getCurrentPageId();
const isShop = pageId === PageUtility.PAGE_IDS.SHOP;
```

### 3. Component Loading Strategy
```javascript
// Checkout → Footer only
if (pageId === PageUtility.PAGE_IDS.CHECKOUT) {
    return [{ name: 'footer', target: '#footer-placeholder' }];
}

// Other pages → Header + Footer
return [
    { name: 'header', target: '#header-placeholder' },
    { name: 'footer', target: '#footer-placeholder' }
];
```

### 4. Manager Pattern
```javascript
// Instead of initializing directly
const nav = new NavigationManager();
const search = new SearchManager();
const cart = new CartManager();

// Use a manager
const header = new HeaderManager();
header.init(); // Initializes all above
```

---

## 🔍 How to Debug

### Check Console Output

**Healthy Output:**
```
✅ 🚀 Initializing Furniro Application...
✅ 📦 Loading components...
✅ ✓ Component loaded: header (or just footer for checkout)
✅ ✓ Component loaded: footer
✅ 🎯 Initializing Header Components... (not on checkout)
✅ 📄 Detected page: [PageName] (ID: [Number])
✅ ✓ [Page] manager initialized
✅ ✓ Furniro Application initialized successfully
```

**Problem Indicators:**
```
❌ ComponentLoader not found
❌ Target element not found
❌ Failed to load component
❌ Unable to detect current page
❌ [Manager]Manager not found
```

### Common Issues

**Issue:** Header shows on checkout
**Fix:** Check console - should NOT see "Initializing Header Components"

**Issue:** Components not loading
**Fix:** Verify script order in HTML, check for missing files

**Issue:** Manager not initializing
**Fix:** Check if manager JS file is loaded, verify class exists in window

---

## 📚 Adding New Pages

### Step-by-Step Guide

1. **Add to PageUtility** (`js/core/page-utility.js`):
```javascript
static PAGE_IDS = {
    // ...existing
    ABOUT: 5  // Add new
};

static PAGE_SELECTORS = {
    [this.PAGE_IDS.ABOUT]: '#about-unique-selector'
};

static PAGE_NAMES = {
    [this.PAGE_IDS.ABOUT]: 'About'
};
```

2. **Create Manager** (`js/manager/about-manager.js`):
```javascript
class AboutManager {
    constructor(config = {}) {
        this.config = config;
    }
    
    async init() {
        console.log('📖 Initializing About Page...');
        // Your logic here
        console.log('✓ About page initialized');
    }
}

if (typeof window !== 'undefined') {
    window.AboutManager = AboutManager;
}
```

3. **Register in Main** (`js/manager/main.js`):
```javascript
// In constructor
this.pageIdToManagerMap = {
    // ...existing
    [PageUtility.PAGE_IDS.ABOUT]: 'about'
};

// In _initializePageManager
case PageUtility.PAGE_IDS.ABOUT:
    await this._initAboutManager(managerKey, pageName);
    break;

// Add method
async _initAboutManager(managerKey, pageName) {
    if (window.AboutManager) {
        this.managers[managerKey] = new AboutManager(this.config);
        await this.managers[managerKey].init();
        console.log(`✓ ${pageName} manager initialized`);
    } else {
        console.warn(`${pageName}Manager not found`);
    }
}
```

4. **Create HTML** (`about.html`):
```html
<!-- Add placeholders -->
<div id="header-placeholder"></div>
<div id="about-unique-selector">
    <!-- Your content -->
</div>
<div id="footer-placeholder"></div>

<!-- Load scripts -->
<script src="js/core/page-utility.js"></script>
<script src="js/manager/header-manager.js"></script>
<script src="js/manager/about-manager.js"></script>
<script src="js/manager/main.js"></script>
```

**Done!** The page will automatically be detected and initialized.

---

## 🎓 Best Practices

### DO ✅
- Use PageUtility for page detection
- Create managers for page-specific logic
- Follow SRP - one class, one responsibility
- Use private methods (prefix with _)
- Add proper error handling
- Log initialization steps
- Document public methods

### DON'T ❌
- Mix concerns in one class
- Hardcode page detection
- Use CSS hacks (like hiding header)
- Initialize components directly in main.js
- Repeat code across files
- Skip error handling
- Forget to export to window

---

## 📊 Metrics

### Code Organization
- **Before:** 1 large file (270 lines)
- **After:** 3 focused files (home, header managers + main)

### Maintainability
- **Before:** Hard to understand, modify
- **After:** Clear structure, easy to extend

### SOLID Compliance
- **Before:** Mixed responsibilities
- **After:** Each class has single purpose

### Checkout Header Issue
- **Before:** CSS hacks to hide header
- **After:** Header not loaded at all

---

## 🏁 Quick Start

### To Test Changes:
1. Open any HTML file in browser
2. Open DevTools Console (F12)
3. Check for initialization messages
4. Verify no errors
5. Test page functionality

### To Add New Feature:
1. Identify which manager handles it
2. Add method to that manager
3. Call from appropriate place
4. Test and verify

### To Fix Issues:
1. Check console for error messages
2. Verify script loading order
3. Check if classes exported to window
4. Test in isolation if needed

---

## 📞 Support

### Documentation Files:
- `REFACTORING_SUMMARY.md` - Detailed changes
- `ARCHITECTURE_DIAGRAM.md` - Visual architecture
- `REFACTORING_COMPLETION_CHECKLIST.md` - Testing checklist
- `QUICK_REFERENCE.md` - This file

### Key Classes:
- `ComponentLoader` - Component loading
- `PageUtility` - Page detection
- `HeaderManager` - Header orchestration
- `HomeManager` - Home page logic
- `FurniroApp` - Application coordinator

---

**Last Updated:** 2025-11-27
**Version:** 2.0 (Post-Refactoring)

