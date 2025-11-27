# Checkout Page Initialization Flow

## Sequence Diagram

```
User Opens checkout.html
         │
         ▼
1. HTML Loads
   - CSS files loaded
   - Script files loaded in order:
     * component-loader.js
     * page-utility.js
     * toast.js
     * navigation-state-manager.js
     * product-data-loader.js
     * product-repository.js
     * navigate.js
     * header components
     * cart.js
     * checkout dependencies
     * checkout-summary-renderer.js
     * checkout-summary-manager.js
     * header-manager.js
     * checkout-manager.js
     * main.js (FurniroApp)
         │
         ▼
2. main.js Executes
   - FurniroApp instance created
   - Waits for DOMContentLoaded
         │
         ▼
3. FurniroApp.init()
   - Loads components (footer only for checkout)
   - Initializes header manager (skipped for checkout)
   - Dispatches page logic
   - Sets isInitialized = true
         │
         ▼
4. Checkout Inline Script Executes
   - waitForApp() waits for FurniroApp.isInitialized
   - Gets dynamic breadcrumb
   - Loads page-banner component
   - Loads feature-banner component
         │
         ▼
5. CheckoutManager.initialize()
   - Validates referrer (must be from cart)
   - Gets cart manager instance
   - Initializes FormManager
   - Initializes CheckoutSummaryManager
   - Binds form submit handler
   - Binds back button handler
         │
         ▼
6. FormManager.initialize()
   - Loads location data
   - Initializes dropdowns (country, province)
   - Initializes field validators
   - Binds events
         │
         ▼
7. CheckoutSummaryManager.initialize()
   - Loads selected items from localStorage
   - Calls renderer.renderProducts()
   - Calls renderer.renderCalculations()
   - Binds payment method events
         │
         ▼
✓ Page Ready for User Interaction
```

## Key Components

### 1. FurniroApp (main.js)
- **Role**: Main application controller
- **Responsibilities**:
  - Loads common components (header/footer)
  - Initializes page-specific managers
  - Sets `isInitialized` flag when ready
- **Note**: Checkout page is special - initialized by inline script

### 2. CheckoutManager
- **Role**: Page coordinator
- **Responsibilities**:
  - Validates access (must be from cart)
  - Coordinates FormManager and CheckoutSummaryManager
  - Handles form submission
  - Manages navigation (back button)

### 3. FormManager
- **Role**: Billing form controller
- **Responsibilities**:
  - Manages form fields and validation
  - Handles country/province dropdowns
  - Provides form data access

### 4. CheckoutSummaryManager
- **Role**: Order summary controller
- **Responsibilities**:
  - Loads selected cart items
  - Calculates totals
  - Manages payment method selection
  - Delegates rendering to CheckoutSummaryRenderer

### 5. CheckoutSummaryRenderer
- **Role**: Summary UI renderer
- **Responsibilities**:
  - Renders product list
  - Renders calculations
  - Updates payment descriptions
  - Lazy loads images

## Important Timing Details

### Why waitForApp()?
The checkout page needs to ensure FurniroApp has:
1. Loaded all required scripts
2. Initialized cart manager
3. Set up global instances

Without waiting, the checkout would try to access `window.cartManagerInstance` before it exists.

### Why Inline Script?
The checkout page needs custom initialization that differs from other pages:
1. No header component
2. Custom breadcrumb from cart page
3. Requires cart manager to be ready
4. Different component loading pattern

### Script Load Order Matters
Scripts must load in dependency order:
1. Core utilities (component-loader, page-utility, etc.)
2. Data layer (product-data-loader, product-repository)
3. UI components (header components, cart)
4. Page-specific (form-manager, summary-manager/renderer)
5. Managers (checkout-manager)
6. Main app (main.js)

## Error Prevention

### Problem: "Timeout: Required components not ready"
**Cause**: Trying to initialize before scripts loaded
**Solution**: Use `waitForApp()` to ensure FurniroApp.isInitialized

### Problem: "Cart manager not found"
**Cause**: Accessing window.cartManagerInstance too early
**Solution**: Wait for FurniroApp initialization which creates cart manager

### Problem: Banner at wrong position
**Cause**: Loading banner before page structure ready
**Solution**: Load banner after waitForApp() completes

### Problem: Components not loading
**Cause**: Incorrect fetch paths (relative vs absolute)
**Solution**: Use absolute paths from project root `/201-project/`

## Best Practices

1. **Always wait for FurniroApp initialization**
   ```javascript
   const waitForApp = () => {
       return new Promise((resolve) => {
           if (window.FurniroApp && window.FurniroApp.isInitialized) {
               resolve();
           } else {
               const checkInterval = setInterval(() => {
                   if (window.FurniroApp && window.FurniroApp.isInitialized) {
                       clearInterval(checkInterval);
                       resolve();
                   }
               }, 50);
           }
       });
   };
   ```

2. **Use absolute paths for all resources**
   ```javascript
   // ✓ Good
   fetch('/201-project/components/header.html')
   window.location.href = '/201-project/cart.html'
   
   // ✗ Bad
   fetch('components/header.html')
   window.location.href = 'cart.html'
   ```

3. **Separate concerns: Manager vs Renderer**
   ```javascript
   // Manager: business logic
   class CheckoutSummaryManager {
       initialize() {
           this.loadSelectedItems();
           this.renderer.renderProducts(this.selectedItems);
       }
   }
   
   // Renderer: UI updates
   class CheckoutSummaryRenderer {
       renderProducts(items) {
           // DOM manipulation here
       }
   }
   ```

4. **Handle errors gracefully**
   ```javascript
   try {
       const manager = new CheckoutManager('checkoutForm');
       await manager.initialize();
   } catch (error) {
       console.error('Failed to initialize checkout:', error);
       alert('Failed to load checkout page: ' + error.message);
   }
   ```

## Debugging Tips

### Check initialization state
```javascript
console.log('FurniroApp:', window.FurniroApp);
console.log('isInitialized:', window.FurniroApp?.isInitialized);
console.log('cartManager:', window.cartManagerInstance);
```

### Monitor component loading
```javascript
// ComponentLoader logs each component load:
// "✓ Component loaded: footer"
// "✓ Component loaded: page-banner"
```

### Verify page detection
```javascript
// main.js logs page detection:
// "📄 Detected page: Checkout (ID: 4)"
```

### Check manager initialization
```javascript
// CheckoutManager logs:
console.log('Cart manager instance:', this.cartManager);
console.log('Form manager:', this.formManager);
console.log('Summary manager:', this.summaryManager);
```

---

**Last Updated**: 2025-11-27

