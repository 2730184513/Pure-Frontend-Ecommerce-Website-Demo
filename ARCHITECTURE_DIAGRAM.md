# Refactored Architecture Diagram

## Application Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         HTML Pages                              │
│  index.html | shop.html | cart.html | checkout.html            │
└────────────┬────────────────────────────────────────────────────┘
             │
             │ Load scripts in order
             ↓
┌─────────────────────────────────────────────────────────────────┐
│                     Core Utilities Layer                        │
├─────────────────────────────────────────────────────────────────┤
│  • component-loader.js    - Loads HTML components               │
│  • page-utility.js        - Page detection & identification     │
│  • toast.js              - Toast notifications                  │
│  • navigation-state-manager.js - Navigation state              │
│  • product-data-loader.js - Product data loading               │
│  • product-repository.js  - Product data management            │
└────────────┬────────────────────────────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────────────────────────────┐
│                   Component Layer                               │
├─────────────────────────────────────────────────────────────────┤
│  Header Components:                                             │
│  • search.js             - Search functionality                │
│  • cart.js               - Cart dropdown & logic               │
│  • wishlist.js           - Wishlist functionality              │
│  • navigate.js           - Navigation logic                    │
│                                                                 │
│  Page Components:                                               │
│  • carousel.js           - Home page carousel                  │
│  • browse-range.js       - Category rotator                    │
│  • filter-sidebar.js     - Shop filters                        │
│  • etc...                                                       │
└────────────┬────────────────────────────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Manager Layer                                │
├─────────────────────────────────────────────────────────────────┤
│  • header-manager.js     - Manages all header components       │
│  • home-manager.js       - Manages home page logic             │
│  • shop-manager.js       - Manages shop page logic             │
│  • cart-manager.js       - Manages cart page logic             │
│  • checkout-manager.js   - Manages checkout page logic         │
└────────────┬────────────────────────────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────────────────────────────┐
│                  Application Controller                         │
├─────────────────────────────────────────────────────────────────┤
│                      main.js (FurniroApp)                       │
│                                                                 │
│  Responsibilities:                                              │
│  1. Load required components for current page                  │
│  2. Initialize HeaderManager (if needed)                       │
│  3. Detect current page using PageUtility                      │
│  4. Initialize appropriate page manager                        │
└─────────────────────────────────────────────────────────────────┘
```

## Page-Specific Flow

### Home Page (index.html)
```
FurniroApp.init()
  ↓
1. Load Components
   - ComponentLoader.loadComponents(['header', 'footer'])
   ↓
2. Initialize HeaderManager
   - HeaderManager.init()
     → NavigationManager
     → SearchManager
     → CartManager
     → WishlistManager
   ↓
3. Detect Page
   - PageUtility.getCurrentPageId() → HOME (1)
   ↓
4. Initialize HomeManager
   - HomeManager.init()
     → Carousel
     → CategoryRotator
     → ProductRepository
     → ShowMore button
```

### Shop Page (shop.html)
```
FurniroApp.init()
  ↓
1. Load Components
   - ComponentLoader.loadComponents(['header', 'footer'])
   ↓
2. Initialize HeaderManager
   - HeaderManager.init()
     → All header components
   ↓
3. Detect Page
   - PageUtility.getCurrentPageId() → SHOP (2)
   ↓
4. Initialize ShopManager
   - ShopManager.init()
     → FilterSidebar
     → ProductGrid
     → Pagination
     → etc.
```

### Cart Page (cart.html)
```
FurniroApp.init()
  ↓
1. Load Components
   - ComponentLoader.loadComponents(['header', 'footer'])
   ↓
2. Initialize HeaderManager
   - HeaderManager.init()
     → All header components
   ↓
3. Detect Page
   - PageUtility.getCurrentPageId() → CART (3)
   ↓
4. Log External Init
   - CartManager initialized by inline script
```

### Checkout Page (checkout.html)
```
FurniroApp.init()
  ↓
1. Load Components
   - ComponentLoader.loadComponents(['footer']) ← NO HEADER!
   ↓
2. Skip HeaderManager
   - (Checkout doesn't need header)
   ↓
3. Detect Page
   - PageUtility.getCurrentPageId() → CHECKOUT (4)
   ↓
4. Log External Init
   - CheckoutManager initialized by inline script
```

## Manager Responsibilities

### HeaderManager
```javascript
Manages:
├── NavigationManager    (menu, links)
├── SearchManager        (search overlay, results)
├── CartManager          (cart dropdown, count)
└── WishlistManager      (wishlist dropdown, count)

Single Responsibility: Header component orchestration
```

### HomeManager
```javascript
Manages:
├── InspirationsCarousel (home carousel)
├── CategoryRotator      (browse range)
├── ProductRepository    (product loading)
└── ShowMore Button      (load more products)

Single Responsibility: Home page functionality
```

### ShopManager
```javascript
Manages:
├── FilterSidebar        (category, price filters)
├── Toolbar              (sorting, view options)
├── ProductGrid          (product display)
├── Pagination           (page navigation)
└── Highlighting         (URL state management)

Single Responsibility: Shop page functionality
```

## Component Loading Strategy

### Strategy Pattern
```javascript
_getComponentsForPage(pageId) {
    if (pageId === CHECKOUT) {
        return [{ name: 'footer', target: '#footer-placeholder' }];
    }
    
    // All other pages
    return [
        { name: 'header', target: '#header-placeholder' },
        { name: 'footer', target: '#footer-placeholder' }
    ];
}
```

### Benefits:
- ✅ No CSS hacks needed
- ✅ Clean DOM structure
- ✅ Proper separation of concerns
- ✅ Easy to customize per page

## SOLID Principles Applied

### Single Responsibility Principle (SRP)
```
ComponentLoader   → Only loads components
PageUtility       → Only detects pages
HeaderManager     → Only manages header
HomeManager       → Only manages home page
FurniroApp        → Only coordinates initialization
```

### Open/Closed Principle (OCP)
```
Adding new page:
1. Add to PageUtility.PAGE_IDS
2. Create new manager (no modification of existing)
3. Register in FurniroApp (extension point)
```

### Liskov Substitution Principle (LSP)
```
All managers follow same pattern:
- constructor(config)
- init() method
- Public accessor methods
```

### Interface Segregation Principle (ISP)
```
Each manager has focused interface:
- HeaderManager: getNavigation(), getSearch(), getCart(), getWishlist()
- HomeManager: getProductRepository(), getCarousel(), getCategoryRotator()
- No "god objects" with dozens of methods
```

### Dependency Inversion Principle (DIP)
```
Managers depend on abstractions:
- window.ComponentLoader (not concrete implementation)
- window.NavigationManager (not direct instantiation)
- Graceful degradation if dependencies missing
```

## File Structure

```
201-project/
├── index.html
├── shop.html
├── cart.html
├── checkout.html
├── REFACTORING_SUMMARY.md          ← Documentation
├── ARCHITECTURE_VISUAL.md           ← This file
│
├── js/
│   ├── component/
│   │   ├── component-loader.js     ← Refactored (SRP applied)
│   │   ├── header/
│   │   │   ├── search.js
│   │   │   ├── cart.js
│   │   │   └── wishlist.js
│   │   └── form/
│   │
│   ├── core/
│   │   ├── page-utility.js         ← NEW (Page detection)
│   │   ├── navigation-state-manager.js
│   │   ├── product-repository.js
│   │   └── ...
│   │
│   ├── manager/
│   │   ├── main.js                 ← Refactored (Coordinator)
│   │   ├── header-manager.js       ← NEW (Header orchestration)
│   │   ├── home-manager.js         ← NEW (Home page logic)
│   │   ├── shop-manager.js
│   │   ├── cart-manager.js
│   │   └── checkout-manager.js
│   │
│   └── pages/
│       ├── home/
│       ├── shop/
│       ├── cart/
│       └── checkout/
│
└── css/
    └── ...
```

## Key Improvements Summary

### Before Refactoring:
❌ Mixed concerns in main.js
❌ Repeated page detection code
❌ Global initCommonComponents() not suitable for all pages
❌ CSS hacks to hide header on checkout
❌ Hard to test individual page logic
❌ Difficult to add new pages

### After Refactoring:
✅ Clear separation of concerns
✅ Centralized page detection (PageUtility)
✅ Per-page component loading strategy
✅ No CSS hacks - clean DOM
✅ Easy to test each manager independently
✅ Simple to extend with new pages
✅ Follows SOLID principles
✅ Professional, maintainable architecture

