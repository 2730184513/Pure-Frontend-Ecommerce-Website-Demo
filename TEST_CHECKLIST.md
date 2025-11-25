# Test Checklist - Refactored Features

## 🧪 Manual Testing Guide

### 1. Items Per Page Dropdown
- [ ] Navigate to shop.html
- [ ] Locate "Show" dropdown in toolbar
- [ ] Click on the dropdown
- [ ] Verify dropdown list appears (4, 8, 12, 16, 20)
- [ ] Select different value
- [ ] Verify product grid updates with correct number of items
- [ ] Verify pagination updates accordingly

**Expected**: Dropdown should open smoothly and allow selection

---

### 2. Filter Sidebar
- [ ] Navigate to shop.html
- [ ] Click "Filter" button in toolbar
- [ ] Verify sidebar slides in from left with animation
- [ ] Verify all filter content is visible:
  - [ ] Category checkboxes (Chair, Lamp, Sofa, Table)
  - [ ] Price range slider (0 - 50000)
  - [ ] Rating range slider (0 - 5)
  - [ ] Launch time date pickers
- [ ] Toggle categories
- [ ] Adjust price sliders
- [ ] Adjust rating sliders
- [ ] Click Filter button again to close
- [ ] Verify sidebar slides out

**Expected**: Full sidebar with all controls visible and functional

---

### 3. Shop Dropdown Removed
- [ ] Navigate to index.html or any page
- [ ] Hover over "Shop" link in header
- [ ] Click on "Shop" link
- [ ] Verify NO dropdown menu appears
- [ ] Verify clicking navigates directly to shop.html

**Expected**: Simple navigation link, no dropdown

---

### 4. Cart Hover Behavior
- [ ] Navigate to shop.html
- [ ] Add items to cart using product cards
- [ ] Hover over cart icon in header
- [ ] Wait for 1 second
- [ ] Verify cart dropdown appears
- [ ] Move mouse away before 1 second
- [ ] Verify dropdown does NOT appear
- [ ] Hover again and wait 1 second
- [ ] Move mouse into dropdown area
- [ ] Verify dropdown stays open
- [ ] Move mouse away from both icon and dropdown
- [ ] Verify dropdown closes

**Expected**: 1-second hover delay, persistent dropdown on hover

---

### 5. Wishlist Hover Behavior
- [ ] Navigate to shop.html
- [ ] Click "Like" on product cards to add to wishlist
- [ ] Hover over wishlist icon in header
- [ ] Wait for 1 second
- [ ] Verify wishlist dropdown appears
- [ ] Move mouse away before 1 second
- [ ] Verify dropdown does NOT appear
- [ ] Hover again and wait 1 second
- [ ] Move mouse into dropdown area
- [ ] Verify dropdown stays open
- [ ] Move mouse away from both icon and dropdown
- [ ] Verify dropdown closes

**Expected**: Same hover behavior as cart

---

### 6. Cart Badge Count (Unique Variants)
- [ ] Navigate to shop.html
- [ ] Clear cart (if any items exist)
- [ ] Add 1 unit of Product A
- [ ] Verify badge shows "1"
- [ ] Hover over cart and increase quantity to 3
- [ ] Verify badge STILL shows "1" (not 3)
- [ ] Add 1 unit of Product B
- [ ] Verify badge shows "2"
- [ ] Add Product A again but different color/size
- [ ] Verify badge shows "3" (different variant)

**Expected**: Badge counts unique variants, not quantities

---

### 7. Wishlist Duplicate Alert (Single Notification)
- [ ] Navigate to shop.html
- [ ] Find a product card
- [ ] Click "Like" button
- [ ] Count number of alerts shown (should be 1: "Product added to wishlist!")
- [ ] Click "Like" button on SAME product again
- [ ] Count number of alerts shown (should be 1: "Already in wishlist!")
- [ ] Verify NO duplicate alerts appear

**Expected**: Only ONE alert per action, no duplicates

---

### 8. Sort Dropdown Icons
- [ ] Navigate to shop.html
- [ ] Click on "Sort by" dropdown
- [ ] Click "Name" once
- [ ] Verify "↑" icon appears next to Name
- [ ] Verify label shows "Name (Asc)"
- [ ] Click "Name" again
- [ ] Verify "↓" icon appears next to Name
- [ ] Verify label shows "Name (Desc)"
- [ ] Click "Name" third time
- [ ] Verify icon disappears
- [ ] Verify label shows "Default"
- [ ] Test same for "Price" and "Rating"

**Expected**: Icons appear correctly, cycling through 3 states

---

### 9. Filter Animation & Content
- [ ] Navigate to shop.html
- [ ] Click Filter button
- [ ] Verify icon changes from filter icon to arrow-left icon
- [ ] Verify main content shifts right
- [ ] Verify sidebar has proper styling and spacing
- [ ] Click arrow to close
- [ ] Verify icon changes back to filter icon
- [ ] Verify main content shifts back to full width

**Expected**: Smooth animation, proper icon toggle

---

### 10. Add to Cart Notification
- [ ] Navigate to shop.html
- [ ] Hover over any product card
- [ ] Click "Add to cart" button
- [ ] Verify alert shows: "Product Name has been added to your cart!"
- [ ] Hover over cart icon (wait 1s)
- [ ] Verify product appears in cart
- [ ] Add same product again
- [ ] Verify alert shows: "Product Name quantity increased in cart!"

**Expected**: Clear feedback messages

---

## 🔧 Code Quality Checks

### JavaScript
- [ ] No console errors in browser console
- [ ] All event listeners properly attached
- [ ] LocalStorage working correctly
- [ ] No memory leaks (event listeners cleaned up)
- [ ] Functions are pure where appropriate
- [ ] Proper error handling for missing elements

### CSS
- [ ] No layout shifts or jumps
- [ ] Animations smooth (60fps)
- [ ] Responsive behavior intact
- [ ] Z-index layering correct (header > dropdown > sidebar)
- [ ] No styling conflicts

### Architecture
- [ ] Clear separation of concerns
- [ ] Single Responsibility Principle followed
- [ ] No circular dependencies
- [ ] Functions are focused and small
- [ ] Comments explain "why" not "what"

---

## 🐛 Known Issues to Watch

1. **Alt attribute warnings**: Image elements in dynamic HTML need alt attributes (minor)
2. **Unused parameters**: `showNotification(type)` parameter not yet used (planned for toast system)
3. **Browser compatibility**: `appearance: none` needs prefixes for older browsers

---

## 📝 Test Results

Date: ___________
Tester: ___________

### Pass/Fail Summary
- [ ] All functionality tests passed
- [ ] All code quality checks passed
- [ ] No critical bugs found
- [ ] Ready for production

### Notes:
_____________________________________________
_____________________________________________
_____________________________________________

