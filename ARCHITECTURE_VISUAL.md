# 🎨 架构可视化图

## 📊 完整系统架构

```
┌─────────────────────────────────────────────────────────────────┐
│                           USER                                   │
│                    (Browser Interface)                          │
└─────────────────────────────────────────────────────────────────┘
                              │
    ┌─────────────────────────┼─────────────────────────┐
    ↓                         ↓                         ↓
┌─────────┐            ┌─────────┐              ┌─────────┐
│ index   │            │  shop   │              │ future  │
│ .html   │            │ .html   │              │ pages   │
└─────────┘            └─────────┘              └─────────┘
    │                         │                         │
    └─────────────────────────┴─────────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │     main.js       │
                    │ (Global Control)  │
                    └─────────┬─────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ↓                     ↓                     ↓
┌───────────────┐   ┌──────────────┐    ┌──────────────┐
│  HeaderMgr    │   │   ShopMgr    │    │  IndexMgr    │
│ (All Pages)   │   │ (shop.html)  │    │ (index.html) │
└───────────────┘   └──────────────┘    └──────────────┘
```

---

## 🏢 Header Manager 详细结构

```
┌────────────────────────────────────────────┐
│            HeaderManager                   │
│         (Central Coordinator)              │
└────────────────────────────────────────────┘
                    │
    ┌───────────────┼───────────────┬───────────────┐
    ↓               ↓               ↓               ↓
┌─────────┐   ┌──────────┐   ┌─────────┐   ┌───────────┐
│Navigate │   │  Search  │   │  Cart   │   │ Wishlist  │
│ Manager │   │ Manager  │   │ Manager │   │  Manager  │
└─────────┘   └──────────┘   └─────────┘   └───────────┘
     │             │               │               │
     │             │               │               │
     ↓             ↓               ↓               ↓
[Nav Links]  [Search Bar]   [Cart Icon]    [Heart Icon]
  Active        Overlay       + Badge        + Badge
  State                       + Dropdown     + Dropdown
```

### Cart Manager 内部流程

```
CartManager
    │
    ├─── State (cart: Array)
    │       └─ [{id, variantId, qty, ...}, ...]
    │
    ├─── UI Components
    │       ├─ Icon (click/hover)
    │       ├─ Badge (unique variants count)
    │       └─ Dropdown (item list)
    │
    ├─── Actions
    │       ├─ addProduct() ─────┐
    │       ├─ updateQuantity()  │
    │       └─ removeProduct()   │
    │                            │
    └─── Side Effects            │
            ├─ saveCart() → localStorage
            ├─ updateBadge() → DOM
            ├─ render() → DOM
            └─ showNotification() → Alert
```

---

## 🛍️ Shop Manager 详细结构

```
┌────────────────────────────────────────────┐
│              ShopManager                   │
│         (Page Coordinator)                 │
└────────────────────────────────────────────┘
                    │
    ┌───────────────┼───────────────┬──────────────┐
    ↓               ↓               ↓              ↓
┌─────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│Toolbar  │   │Highlight │   │  Paging  │   │ Product  │
│Manager  │   │ Manager  │   │ Manager  │   │Repository│
└─────────┘   └──────────┘   └──────────┘   └──────────┘
     │
     └─── Toolbar Manager Details ───┐
                                     │
        ┌────────────────────────────▼─────┐
        │       ToolbarManager              │
        └────────────────────────────────────┘
                     │
    ┌────────────────┼────────────────┐
    ↓                ↓                ↓
┌──────────┐  ┌───────────┐  ┌────────────┐
│  Filter  │  │  Product  │  │  ShowSort  │
│ Sidebar  │  │  Filter   │  │  Manager   │
└──────────┘  └───────────┘  └────────────┘
     │              │                │
     │              │                │
     ↓              ↓                ↓
 [UI State]    [Logic]         [UI State]
Categories   apply()          Items/Page
Price Range  getPrice()       Sort Mode
Rating       ...
Date Range
```

---

## 🔄 数据流 - Shop 完整流程

```
┌─────────────────────────────────────────────────────────┐
│  1. User Interaction                                    │
│     (Filter/Sort/Page Change)                          │
└──────────────────────┬──────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────┐
│  2. ShopManager.executePipeline()                      │
└──────────────────────┬──────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────┐
│  3. Get All Products                                    │
│     ProductRepository.allProducts                       │
└──────────────────────┬──────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────┐
│  4. Apply Filters                                       │
│     ToolbarManager.applyFilters()                       │
│        ├─ FilterSidebar.getFilterValues()              │
│        └─ ProductFilter.apply(products)                │
└──────────────────────┬──────────────────────────────────┘
                       ↓
                 [Filtered Products]
                       ↓
┌─────────────────────────────────────────────────────────┐
│  5. Apply Sorting                                       │
│     ToolbarManager.applySorting()                       │
│        ├─ ShowSortManager.getSortMode()                │
│        └─ Sort by name/price/rate                      │
└──────────────────────┬──────────────────────────────────┘
                       ↓
                 [Sorted Products]
                       ↓
┌─────────────────────────────────────────────────────────┐
│  6. Apply Pagination                                    │
│     PagingManager.setConfig()                           │
│     PagingManager.getPageSlice()                        │
└──────────────────────┬──────────────────────────────────┘
                       ↓
                [Page Products (16 items)]
                       ↓
┌─────────────────────────────────────────────────────────┐
│  7. Render Cards                                        │
│     ProductCardRenderer.renderCard()                    │
│        └─ ProductPopup.render()                         │
└──────────────────────┬──────────────────────────────────┘
                       ↓
                   [DOM Cards]
                       ↓
┌─────────────────────────────────────────────────────────┐
│  8. Apply Highlighting                                  │
│     HighlightingManager.highlightInContainer()          │
└──────────────────────┬──────────────────────────────────┘
                       ↓
              [Highlighted Cards]
                       ↓
┌─────────────────────────────────────────────────────────┐
│  9. Render Pagination                                   │
│     PagingManager.render()                              │
└──────────────────────┬──────────────────────────────────┘
                       ↓
                  [Final UI]
```

---

## 🎯 事件流 - Cart 添加

```
┌──────────────────────────────────────┐
│  User clicks "Add to Cart"           │
│  on Product Card                     │
└───────────────┬──────────────────────┘
                ↓
┌──────────────────────────────────────┐
│  ProductPopup.handleAddToCart()      │
│  - Stop propagation                  │
│  - Log action                        │
└───────────────┬──────────────────────┘
                ↓
┌──────────────────────────────────────┐
│  Dispatch CustomEvent                │
│  window.dispatchEvent({              │
│    type: 'addToCart',                │
│    detail: {product}                 │
│  })                                  │
└───────────────┬──────────────────────┘
                ↓
┌──────────────────────────────────────┐
│  CartManager (Event Listener)        │
│  window.addEventListener(...)        │
└───────────────┬──────────────────────┘
                ↓
┌──────────────────────────────────────┐
│  CartManager.addProduct(product)     │
│  ├─ Create variantId                 │
│  ├─ Check existing?                  │
│  │   ├─ Yes → qty++                  │
│  │   └─ No → push to cart            │
│  ├─ saveCart() → localStorage        │
│  ├─ updateBadge() → unique count     │
│  ├─ render() → dropdown HTML         │
│  ├─ showDropdown()                   │
│  └─ showNotification()               │
└───────────────┬──────────────────────┘
                ↓
┌──────────────────────────────────────┐
│  UI Updated                          │
│  ✅ Badge shows correct count        │
│  ✅ Dropdown displays items          │
│  ✅ Alert notification shown         │
└──────────────────────────────────────┘
```

---

## 🎨 UI 层次结构

```
┌─────────────────────────────────────────────────────────────┐
│                        Body                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                     Header                            │  │
│  │  ┌────────┬──────────┬─────────┬──────────┬────────┐ │  │
│  │  │  Logo  │   Nav    │ Search  │   Cart   │Wishlist│ │  │
│  │  └────────┴──────────┴─────────┴──────────┴────────┘ │  │
│  │                                                        │  │
│  │  Dropdowns (absolute positioned):                     │  │
│  │  ┌──────────────┐          ┌──────────────┐          │  │
│  │  │ Cart Items   │          │ Wishlist     │          │  │
│  │  └──────────────┘          └──────────────┘          │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   Main Content                        │  │
│  │  (shop.html)                                          │  │
│  │  ┌────────────────────────────────────────────────┐   │  │
│  │  │            Shop Toolbar                        │   │  │
│  │  │  Filter | Results | Show [16▾] | Sort [▾]     │   │  │
│  │  └────────────────────────────────────────────────┘   │  │
│  │                                                        │  │
│  │  ┌──────────┬────────────────────────────────────┐   │  │
│  │  │  Filter  │      Product Grid                  │   │  │
│  │  │ Sidebar  │  ┌───┐ ┌───┐ ┌───┐ ┌───┐          │   │  │
│  │  │(slide-in)│  │ 1 │ │ 2 │ │ 3 │ │ 4 │          │   │  │
│  │  │          │  └───┘ └───┘ └───┘ └───┘          │   │  │
│  │  │Categories│  ┌───┐ ┌───┐ ┌───┐ ┌───┐          │   │  │
│  │  │Price     │  │ 5 │ │ 6 │ │ 7 │ │ 8 │          │   │  │
│  │  │Rating    │  └───┘ └───┘ └───┘ └───┘          │   │  │
│  │  │Date      │                                    │   │  │
│  │  │          │  [Pagination: Prev 1 2 3 Next]    │   │  │
│  │  └──────────┴────────────────────────────────────┘   │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                     Footer                            │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 模块加载时序图

```
Browser Loads HTML
        ↓
┌─────────────────────┐
│ component-loader.js │ ──→ Load header.html & footer.html
└─────────────────────┘
        ↓
┌─────────────────────┐
│ Data Layer          │
│ • product-data-     │
│   loader.js         │
│ • product-filter.js │
│ • product-          │
│   repository.js     │
└─────────────────────┘
        ↓
┌─────────────────────┐
│ Header Components   │
│ • navigate.js       │
│ • search.js         │
│ • cart.js           │
│ • wishlist.js       │
│ • header.js         │ ──→ Aggregates above 4
└─────────────────────┘
        ↓
┌─────────────────────┐
│ Product Components  │
│ • pop-up.js         │
│ • product-card-     │
│   renderer.js       │ ──→ Uses pop-up.js
└─────────────────────┘
        ↓
┌─────────────────────┐
│ Shop Components     │
│ (if shop.html)      │
│ • filter-sidebar.js │
│ • show-sort.js      │
│ • highlighting.js   │
│ • paging.js         │
│ • toolbar.js        │ ──→ Aggregates filter, sort
│ • shop.js           │ ──→ Aggregates all shop modules
└─────────────────────┘
        ↓
┌─────────────────────┐
│ main.js             │ ──→ Initializes everything
└─────────────────────┘
        ↓
    DOMContentLoaded
        ↓
   FurniroApp.init()
        ↓
    HeaderManager.init()
        ↓
    Page Logic Dispatch
        ↓
  (ShopManager.init() or IndexManager.init())
        ↓
    Application Ready ✅
```

---

## 🔐 状态管理图

```
┌────────────────────────────────────────────────────────┐
│                   LocalStorage                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │furniro_cart  │  │furniro_      │  │shop_search_  │ │
│  │              │  │wishlist      │  │query         │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└────────────────────────────────────────────────────────┘
         ↑                  ↑                  ↑
         │                  │                  │
    ┌────┴────┐      ┌──────┴──────┐    ┌─────┴─────┐
    │  Cart   │      │  Wishlist   │    │  Search   │
    │ Manager │      │  Manager    │    │  Manager  │
    └─────────┘      └─────────────┘    └───────────┘
         │                  │                  │
         ├─ cart: []        ├─ wishlist: []    ├─ keyword: ''
         └─ methods         └─ methods          └─ methods
```

### State Flow Example: Adding to Cart

```
User Action
    ↓
ProductPopup
    ↓
CustomEvent('addToCart')
    ↓
CartManager
    ├─ cart: []  (in-memory state)
    │     └─ push/update item
    │
    ├─ saveCart()
    │     └─ localStorage.setItem('furniro_cart', JSON.stringify(cart))
    │
    ├─ updateBadge()
    │     └─ DOM update (visual state)
    │
    └─ render()
          └─ DOM update (dropdown)
```

---

## 🎭 设计模式应用

### 1. Aggregator Pattern (聚合器模式)

```
┌──────────────┐
│HeaderManager │  ←─ Aggregates
└──────────────┘
      ↓
   ┌──┴──┬──┬──┐
   ↓     ↓  ↓  ↓
  Nav  Search Cart Wishlist

使用场景:
• HeaderManager 聚合所有 header 组件
• ToolbarManager 聚合所有 toolbar 组件
• ShopManager 聚合所有 shop 页面模块
```

### 2. Observer Pattern (观察者模式 - 通过事件)

```
Subject (Publisher)       Observer (Subscriber)
┌─────────────────┐      ┌──────────────────┐
│  ProductPopup   │      │   CartManager    │
│                 │      │                  │
│  handleLike() ──┼──→───┤  addEventListener│
│                 │event │  ('addToWishlist│
└─────────────────┘      └──────────────────┘

使用场景:
• ProductPopup 发布 'addToCart' 事件
• CartManager 订阅并处理
• 低耦合，易扩展
```

### 3. Strategy Pattern (策略模式)

```
┌──────────────────┐
│  ToolbarManager  │
│   applySorting() │
└──────────────────┘
         │
    ┌────┴────┬────────┬─────────┐
    ↓         ↓        ↓         ↓
  name-asc  price-desc  rate-asc  default
  [策略1]   [策略2]     [策略3]   [策略4]

使用场景:
• 不同排序策略
• 不同过滤策略
• 运行时切换
```

### 4. Facade Pattern (外观模式)

```
┌────────────────┐
│  ShopManager   │  ←─ Facade (简化接口)
└────────────────┘
       │
   ┌───┴────┬────────┬────────┐
   ↓        ↓        ↓        ↓
Toolbar  Highlight Paging  Repo
[复杂子系统]

使用场景:
• ShopManager 提供简单接口
• 隐藏内部复杂性
• executePipeline() 一个方法完成所有操作
```

---

## 🌈 CSS 层级关系

```
z-index 层级 (从低到高):

0-99: 基础层
├─ 0: Page content
├─ 10: Product cards
└─ 50: Hover effects

100-799: 组件层
├─ 100: Filter sidebar (closed)
├─ 700: Dropdowns (select)
└─ 800: Toolbar (sticky)

800-999: 覆盖层
├─ 850: Sort dropdown (open)
├─ 900: Filter sidebar (open)
└─ 950: Search overlay

1000+: 模态层
└─ 1000: Modals
```

---

## 📱 响应式断点 (建议)

```
┌─────────────────────────────────────┐
│  Desktop (> 1200px)                 │
│  ├─ Full layout                     │
│  ├─ Sidebar always visible          │
│  └─ 4 columns product grid          │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Tablet (768px - 1200px)            │
│  ├─ Sidebar slides in/out           │
│  ├─ 3 columns product grid          │
│  └─ Compact toolbar                 │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Mobile (< 768px)                   │
│  ├─ Full-screen sidebar             │
│  ├─ 1-2 columns product grid        │
│  ├─ Hamburger menu                  │
│  └─ Bottom sticky toolbar           │
└─────────────────────────────────────┘
```

---

**文档版本**: 1.0  
**最后更新**: 2025-11-25  
**适用版本**: Frontend Project 2.0

