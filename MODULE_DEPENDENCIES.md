# 📊 模块依赖关系图

## 🗺️ 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                         main.js                              │
│                    (Global Controller)                       │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ↓                   ↓                   ↓
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  header.js   │    │   shop-manager.js    │    │  index page  │
│ (Aggregator) │    │ (Aggregator) │    │   modules    │
└──────────────┘    └──────────────┘    └──────────────┘
        │                   │                   │
        │                   │                   ├─ carousel.js
        │                   │                   └─ browse-range.js
        │                   │
        ├─ navigate.js      ├─ toolbar.js
        ├─ search.js        │    │
        ├─ cart.js          │    ├─ filter-sidebar.js
        └─ wishlist.js      │    ├─ product-filter.js
                            │    └─ show-sort.js
                            │
                            ├─ highlighting.js
                            ├─ paging.js
                            └─ product-card-renderer.js
                                 └─ pop-up.js
```

---

## 📁 详细依赖树

### Level 0: 基础工具层
```
component-loader.js (独立)
product-data-loader.js (独立)
```

### Level 1: 数据层
```
product-filter.js
    └─ 依赖: 无

product-repository.js
    ├─ 依赖: product-data-loader.js
    └─ 依赖: product-filter.js
```

### Level 2: UI 组件层

#### Header 组件
```
navigate.js (独立)
    └─ 依赖: 无

search.js (独立)
    └─ 依赖: 无

cart.js (独立)
    └─ 依赖: 无

wishlist.js (独立)
    └─ 依赖: 无
```

#### Product 组件
```
pop-up.js (独立)
    └─ 依赖: 无

product-card-renderer.js
    └─ 依赖: pop-up.js
```

#### Shop 组件
```
filter-sidebar.js (独立)
    └─ 依赖: 无

show-sort.js (独立)
    └─ 依赖: 无

highlighting.js (独立)
    └─ 依赖: 无

paging.js (独立)
    └─ 依赖: 无
```

### Level 3: 聚合层
```
header.js
    ├─ 依赖: navigate.js
    ├─ 依赖: search.js
    ├─ 依赖: cart.js
    └─ 依赖: wishlist.js

toolbar.js
    ├─ 依赖: filter-sidebar.js
    ├─ 依赖: product-filter.js
    └─ 依赖: show-sort.js
```

### Level 4: 页面控制器层
```
shop-manager.js
    ├─ 依赖: toolbar.js
    ├─ 依赖: highlighting.js
    ├─ 依赖: paging.js
    ├─ 依赖: product-repository.js
    └─ 依赖: product-card-renderer.js
```

### Level 5: 应用控制器层
```
main.js
    ├─ 依赖: component-loader.js
    ├─ 依赖: header.js
    ├─ 依赖: shop-manager.js
    ├─ 依赖: carousel.js (仅 index)
    ├─ 依赖: browse-range.js (仅 index)
    └─ 依赖: product-repository.js (仅 index)
```

---

## 🔗 模块间通信方式

### 1. 事件系统（Event-Driven）
```
ProductPopup → CustomEvent → CartManager
ProductPopup → CustomEvent → WishlistManager

事件名称:
- 'addToCart' - 添加到购物车
- 'addToWishlist' - 添加到收藏夹
```

### 2. 回调函数（Callback）
```
FilterSidebar → callback → ToolbarManager → callback → ShopManager
ShowSortManager → callback → ToolbarManager → callback → ShopManager
PagingManager → callback → ShopManager
```

### 3. 直接调用（Direct Call）
```
ShopManager → ToolbarManager.applyFilters()
ShopManager → ToolbarManager.applySorting()
ShopManager → PagingManager.render()
ShopManager → HighlightingManager.highlightInContainer()

ToolbarManager → FilterSidebar.getFilterValues()
ToolbarManager → ProductFilter.apply()
ToolbarManager → ShowSortManager.getConfig()

HeaderManager → Navigation.init()
HeaderManager → Search.init()
HeaderManager → Cart.init()
HeaderManager → Wishlist.init()
```

---

## 📦 文件加载顺序（shop.html）

```
1. component-loader.js         (加载 header/footer)
2. product-data-loader.js      (数据加载器)
3. product-filter.js           (过滤逻辑)
4. product-repository.js       (数据仓库)
   ↓
5. navigate.js                 (导航管理)
6. search.js                   (搜索管理)
7. cart.js                     (购物车管理)
8. wishlist.js                 (收藏夹管理)
9. header.js                   (Header 聚合器)
   ↓
10. pop-up.js                  (弹出层)
11. product-card-renderer.js   (卡片渲染器)
    ↓
12. filter-sidebar.js          (过滤侧边栏)
13. show-sort.js               (显示/排序)
14. highlighting.js            (高亮管理)
15. paging.js                  (分页管理)
16. toolbar.js                 (Toolbar 聚合器)
17. shop-manager.js                    (Shop 页面控制器)
    ↓
18. main.js                    (全局控制器)
```

**规则**: 
- 被依赖的文件必须先加载
- 聚合器必须在其依赖的模块之后加载
- 页面控制器必须在所有依赖之后加载
- main.js 必须最后加载

---

## 🎯 数据流向

### Shop 页面完整数据流

```
User Interaction
    ↓
┌─────────────────────────────────────┐
│          ShopManager                │
│     executePipeline()               │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│        ToolbarManager               │
│     applyFilters(products)          │
└─────────────────────────────────────┘
    ↓                    ↓
FilterSidebar      ProductFilter
getFilterValues()  apply(products)
    ↓                    ↓
    └────────┬───────────┘
             ↓
    Filtered Products
             ↓
┌─────────────────────────────────────┐
│        ToolbarManager               │
│     applySorting(products)          │
└─────────────────────────────────────┘
    ↓                    ↓
ShowSortManager    ProductFilter
getSortMode()      getEffectivePrice()
    ↓                    ↓
    └────────┬───────────┘
             ↓
    Sorted Products
             ↓
┌─────────────────────────────────────┐
│        PagingManager                │
│     setConfig(), getPageSlice()     │
└─────────────────────────────────────┘
             ↓
    Page Products (subset)
             ↓
┌─────────────────────────────────────┐
│    ProductCardRenderer              │
│     renderCard() for each           │
└─────────────────────────────────────┘
             ↓
    DOM Elements (cards)
             ↓
┌─────────────────────────────────────┐
│      HighlightingManager            │
│   highlightInContainer()            │
└─────────────────────────────────────┘
             ↓
    Highlighted Cards
             ↓
┌─────────────────────────────────────┐
│        PagingManager                │
│     render(pagination)              │
└─────────────────────────────────────┘
             ↓
        Final UI
```

### Cart 添加数据流

```
User clicks "Add to Cart"
    ↓
ProductPopup.handleAddToCart()
    ↓
window.dispatchEvent('addToCart')
    ↓
CartManager (listening)
    ↓
CartManager.addProduct(product)
    ↓
    ├─ Check existing variant
    ├─ Update qty or add new
    ├─ saveCart() → localStorage
    ├─ updateBadge() → DOM
    ├─ render() → DOM
    └─ showNotification() → alert
    ↓
UI Updated
```

---

## 🔄 状态管理

### LocalStorage Keys
```javascript
'furniro_cart'          // Cart items
'furniro_wishlist'      // Wishlist items
'shop_search_query'     // Temporary: search keyword
'shop_filter_category'  // Temporary: selected category
```

### 状态所有者
```
CartManager
    ├─ cart: Array<CartItem>
    └─ Methods: addProduct, updateQuantity, removeProduct

WishlistManager
    ├─ wishlist: Array<Product>
    └─ Methods: addProduct, removeProduct

ToolbarManager
    ├─ FilterSidebar (UI state)
    ├─ ProductFilter (filter logic)
    └─ ShowSortManager (UI state)

ShopManager
    ├─ searchKeyword: string
    └─ initialCategory: string

PagingManager
    ├─ currentPage: number
    ├─ totalPages: number
    └─ itemsPerPage: number
```

---

## 🎨 CSS 依赖

### 全局样式
```
index.css (全局变量和基础样式)
    ↓
所有其他 CSS 文件
```

### 页面特定样式
```
shop.html:
    ├─ index.css (全局)
    ├─ header.css
    ├─ footer.css
    ├─ products.css (产品卡片)
    ├─ toolbar.css (工具栏)
    ├─ filter.css (过滤侧边栏)
    └─ feature-banner.css

index.html:
    ├─ index.css (全局)
    ├─ header.css
    ├─ footer.css
    ├─ hero.css
    ├─ browse-range.css
    ├─ products.css
    ├─ carousel.css
    └─ feature-banner.css
```

---

## 🧩 接口定义

### CartManager
```typescript
interface CartManager {
    init(): void
    addProduct(product: Product): void
    updateQuantity(variantId: string, delta: number): void
    removeProduct(variantId: string): void
    render(): void
    updateBadge(): void
    getCart(): Array<CartItem>
    getCount(): number
}
```

### WishlistManager
```typescript
interface WishlistManager {
    init(): void
    addProduct(product: Product): boolean
    removeProduct(productId: string): void
    render(): void
    getWishlist(): Array<Product>
    getCount(): number
}
```

### ToolbarManager
```typescript
interface ToolbarManager {
    init(callback: Function): void
    applyFilters(products: Array<Product>): Array<Product>
    applySorting(products: Array<Product>): Array<Product>
    setSearchKeyword(keyword: string): void
    setCategory(category: string): void
    getItemsPerPage(): number
}
```

### PagingManager
```typescript
interface PagingManager {
    init(callback: Function): void
    setConfig(totalItems: number, itemsPerPage: number): void
    setCurrentPage(page: number): void
    getPageSlice(): {start: number, end: number}
    render(containerSelector: string): void
    getDisplayText(): string
}
```

### ShopManager
```typescript
interface ShopManager {
    init(): Promise<void>
    executePipeline(): void
    render(products: Array<Product>): void
    getToolbar(): ToolbarManager
}
```

---

## 🔍 调试指南

### 查看模块初始化
打开浏览器控制台，应该看到：
```
✓ Header Manager initialized
✓ Toolbar Manager initialized
✓ Shop Manager initialized
```

### 查看数据流
在关键方法中添加断点：
```
ShopManager.executePipeline()
ToolbarManager.applyFilters()
ToolbarManager.applySorting()
PagingManager.render()
```

### 查看状态
在控制台中：
```javascript
// 查看全局实例
window.furniroApp.pageManagers.header
window.furniroApp.pageManagers.shop

// 查看 localStorage
localStorage.getItem('furniro_cart')
localStorage.getItem('furniro_wishlist')
```

---

## 📈 性能优化点

### 1. 事件监听器
- 使用事件委托减少监听器数量
- 组件销毁时清理监听器

### 2. DOM 操作
- 批量更新 DOM（使用 DocumentFragment）
- 避免强制同步布局

### 3. 数据处理
- 过滤和排序使用缓存
- 分页减少渲染的元素数量

### 4. 加载优化
- 按需加载模块
- 使用 defer 或 async 加载非关键脚本

---

**最后更新**: 2025-11-25  
**版本**: 2.0 - 模块化架构

