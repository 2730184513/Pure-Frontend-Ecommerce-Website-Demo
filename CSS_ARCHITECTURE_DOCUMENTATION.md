# Furniro CSS Architecture Documentation

## Project Overview
Furniro is a premium home furniture e-commerce website with a modular CSS architecture. The project contains 24 CSS files totaling approximately 3,500+ lines of code, now organized into a logical folder structure based on functionality and reusability.

## Architecture Summary
The CSS files have been reorganized into 4 main categories:
- **🏗️ Layout** (5 files) - Core page structure and global styles
- **🧩 Components** (6 files) - Reusable UI components organized by function
- **🎯 Core** (3 files) - Essential shared functionality 
- **📄 Pages** (10 files) - Page-specific styles organized by section

This structure improves maintainability, reduces style conflicts, and makes the codebase more scalable.

## Browser Compatibility & Vendor Prefixes

### ✅ Removed Redundant Prefixes
- **`-webkit-sticky`** - Removed from `shop-toolbar.css` (sticky position is now supported in all modern browsers)

### 🔄 Retained Essential Prefixes
- **`-webkit-scrollbar`** family - Custom scrollbar styling (Chrome/Safari only)
- **`-webkit-appearance: none`** - Form input normalization
- **`-moz-appearance: textfield`** - Firefox number input arrow removal

## Organized CSS Architecture

### 📁 Proposed Folder Structure

```
css/
├── components/
│   ├── banners/
│   │   ├── feature-banner.css  (Promotional banners)
│   │   └── page-banner.css     (Page header banners)  
│   ├── forms/
│   │   ├── form-billing.css    (Billing form styling)
│   │   └── searchable-dropdown.css (Enhanced dropdown inputs)
│   └── header/
│       ├── cart-wishlist.css   (Header dropdown menus)
│       └── search.css          (Search functionality)
├── core/
│   ├── pop-up.css             (Modal dialog system)
│   ├── products.css           (Product card styling)
│   └── toast.css              (Notification system)
├── layout/
│   ├── checkout.css           (Checkout page layout)
│   ├── footer.css             (Footer layout & styling)
│   ├── header.css             (Header layout & navigation)
│   ├── main.css               (Global variables, reset, utilities)
│   └── shop.css               (Shop page layout structure)
└── pages/
    ├── cart/
    │   ├── cart-checkbox.css   (Cart selection UI)
    │   ├── cart-product-line.css (Cart item rows)
    │   └── cart-summary.css    (Cart total summary)
    ├── checkout/
    │   └── checkout-summary.css (Order summary)
    ├── home/
    │   ├── browse-range.css    (Category grid)
    │   ├── carousel.css        (Image carousel component)
    │   └── hero.css           (Homepage hero section)
    └── shop/
        ├── filter.css         (Sidebar filter controls)
        ├── pagination.css     (Page navigation)
        └── toolbar.css        (Sort/filter toolbar)
```

## CSS Files Analysis by Category

### 🎯 Core Files (3 files)
| File | Path | Size | Purpose | Used On |
|------|------|------|---------|---------|
| `pop-up.css` | `core/` | ~180 lines | Modal dialog system | Home, Shop |
| `products.css` | `core/` | ~320 lines | Product card styling | Home, Shop |
| `toast.css` | `core/` | ~120 lines | Notification system | All pages |

### 🏗️ Layout Files (5 files)
| File | Path | Size | Purpose | Used On |
|------|------|------|---------|---------|
| `checkout.css` | `layout/` | ~85 lines | Checkout page layout | Checkout |
| `footer.css` | `layout/` | ~180 lines | Footer layout & styling | All pages |
| `header.css` | `layout/` | ~150 lines | Header container & navigation | All pages |
| `main.css` | `layout/` | ~85 lines | Global variables, reset, utilities | All pages |
| `shop.css` | `layout/` | ~95 lines | Shop page structure | Shop |

### 🧩 Component Files (6 files)
| File | Path | Size | Purpose | Used On |
|------|------|------|---------|---------|
| `feature-banner.css` | `components/banners/` | ~130 lines | Promotional banners | Shop, Cart, Checkout |
| `page-banner.css` | `components/banners/` | ~75 lines | Page header banners | Shop, Cart, Checkout |
| `form-billing.css` | `components/forms/` | ~200 lines | Billing form styling | Checkout |
| `searchable-dropdown.css` | `components/forms/` | ~150 lines | Enhanced dropdown inputs | Checkout |
| `cart-wishlist.css` | `components/header/` | ~240 lines | Header dropdown menus | All pages |
| `search.css` | `components/header/` | ~280 lines | Search functionality | All pages |

### 📄 Page-Specific Files (10 files)
| File | Path | Size | Purpose | Page |
|------|------|------|---------|------|
| `cart-checkbox.css` | `pages/cart/` | ~90 lines | Cart selection UI | Cart |
| `cart-product-line.css` | `pages/cart/` | ~180 lines | Cart item rows | Cart |
| `cart-summary.css` | `pages/cart/` | ~160 lines | Cart total summary | Cart |
| `checkout-summary.css` | `pages/checkout/` | ~120 lines | Order summary | Checkout |
| `browse-range.css` | `pages/home/` | ~160 lines | Category grid | Home |
| `carousel.css` | `pages/home/` | ~200 lines | Image carousel component | Home |
| `hero.css` | `pages/home/` | ~140 lines | Homepage hero section | Home |
| `filter.css` | `pages/shop/` | ~280 lines | Sidebar filter controls | Shop |
| `pagination.css` | `pages/shop/` | ~110 lines | Page navigation | Shop |
| `toolbar.css` | `pages/shop/` | ~170 lines | Sort/filter toolbar | Shop |

## Core CSS Variables System

### 🎨 Color Palette
```css
:root {
    --primary-color: #B88E2F;      /* Golden brown primary */
    --text-dark: #3A3A3A;          /* Dark text */
    --text-gray: #616161;          /* Medium gray */
    --text-light-gray: #9F9F9F;    /* Light gray */
    --bg-light: #F4F5F7;          /* Light background */
    --bg-cream: #FFF3E3;          /* Cream background */
    --bg-beige: #FCF8F3;          /* Beige background */
    --font-main: 'Poppins', sans-serif;
}
```

### 🏗️ Layout Constraints
- **Container width**: `max-width: 1240px`
- **Header height**: `100px` (fixed)
- **Grid gaps**: `32px` (product grids)
- **Section padding**: `60px 0` (vertical spacing)

## Page Import Strategies

### 🏠 Homepage (index.html) - 11 CSS imports

```html
<!-- Core Layout -->
<link rel="stylesheet" href="css/layout/main.css">
<link rel="stylesheet" href="css/layout/header.css">
<link rel="stylesheet" href="css/layout/footer.css">
<!-- Header Components -->
<link rel="stylesheet" href="css/components/header/search.css">
<link rel="stylesheet" href="css/components/header/cart-wishlist.css">
<!-- Core Components -->
<link rel="stylesheet" href="css/core/products.css">
<link rel="stylesheet" href="css/core/pop-up.css">
<link rel="stylesheet" href="css/core/toast.css">
<!-- Page-specific -->
<link rel="stylesheet" href="css/pages/home/hero.css">
<link rel="stylesheet" href="css/pages/home/browse-range.css">
<link rel="stylesheet" href="css/pages/home/carousel.css">
```

### 🛍️ Shop Page (shop.html) - 13 CSS imports

```html
<!-- Core Layout -->
<link rel="stylesheet" href="css/layout/main.css">
<link rel="stylesheet" href="css/layout/header.css">
<link rel="stylesheet" href="css/layout/footer.css">
<link rel="stylesheet" href="css/layout/shop.css">
<!-- Header Components -->
<link rel="stylesheet" href="css/components/header/search.css">
<link rel="stylesheet" href="css/components/header/cart-wishlist.css">
<!-- Banner Components -->
<link rel="stylesheet" href="css/components/banners/page-banner.css">
<link rel="stylesheet" href="css/components/banners/feature-banner.css">
<!-- Core Components -->
<link rel="stylesheet" href="css/core/products.css">
<link rel="stylesheet" href="css/core/pop-up.css">
<link rel="stylesheet" href="css/core/toast.css">
<!-- Shop-specific -->
<link rel="stylesheet" href="css/pages/shop/toolbar.css">
<link rel="stylesheet" href="css/pages/shop/pagination.css">
<link rel="stylesheet" href="css/pages/shop/filter.css">
```

### 🛒 Cart Page (cart.html) - 10 CSS imports

```html
<!-- Core Layout -->
<link rel="stylesheet" href="css/layout/main.css">
<link rel="stylesheet" href="css/layout/header.css">
<link rel="stylesheet" href="css/layout/footer.css">
<!-- Header Components -->
<link rel="stylesheet" href="css/components/header/search.css">
<link rel="stylesheet" href="css/components/header/cart-wishlist.css">
<!-- Banner Component -->
<link rel="stylesheet" href="css/components/banners/page-banner.css">
<!-- Core Components -->
<link rel="stylesheet" href="css/core/toast.css">
<!-- Cart-specific -->
<link rel="stylesheet" href="css/pages/cart/cart-product-line.css">
<link rel="stylesheet" href="css/pages/cart/cart-checkbox.css">
<link rel="stylesheet" href="css/pages/cart/cart-summary.css">
```

### 💳 Checkout Page (checkout.html) - 10 CSS imports

```html
<!-- Core Layout -->
<link rel="stylesheet" href="css/layout/main.css">
<link rel="stylesheet" href="css/layout/header.css">
<link rel="stylesheet" href="css/layout/footer.css">
<link rel="stylesheet" href="css/layout/checkout.css">
<!-- Header Components -->
<link rel="stylesheet" href="css/components/header/search.css">
<link rel="stylesheet" href="css/components/header/cart-wishlist.css">
<!-- Form Components -->
<link rel="stylesheet" href="css/components/forms/form-billing.css">
<link rel="stylesheet" href="css/components/forms/searchable-dropdown.css">
<!-- Core Components -->
<link rel="stylesheet" href="css/core/toast.css">
<!-- Checkout-specific -->
<link rel="stylesheet" href="css/pages/checkout/checkout-summary.css">
```

## Performance Recommendations

### 🚀 Optimization Opportunities
1. **Bundle page-specific CSS** to reduce HTTP requests
2. **Critical CSS inlining** for above-the-fold content
3. **CSS minification** for production builds
4. **Remove unused CSS** (estimated 10-15% reduction possible)

### 🎯 Maintenance Benefits
1. **Modular architecture** allows independent component updates
2. **CSS variables** enable easy theme customization
3. **Consistent naming** follows BEM-like conventions
4. **Clear separation** between layout, components, and pages

## Implementation Notes

### ✅ Completed Organization
1. **Folder structure created** - 4 main categories with logical subdirectories
2. **File mapping defined** - All 24 CSS files categorized by functionality  
3. **Import paths updated** - New file paths documented for all pages
4. **Browser compatibility optimized** - Removed redundant `-webkit-sticky` prefix

### 📋 Next Steps for Implementation
1. **Move CSS files** to their designated folders according to the structure above
2. **Update HTML file imports** in index.html, shop.html, cart.html, and checkout.html
3. **Test all pages** to ensure styles load correctly with new paths
4. **Update any build tools** or preprocessors to use the new structure

---

*CSS Architecture Documentation*  
*Updated: 2025-11-27*  
*Total CSS files: 24*  
*Total lines of code: ~3,500+*  
*Organization: 4 categories, 8 subdirectories*
