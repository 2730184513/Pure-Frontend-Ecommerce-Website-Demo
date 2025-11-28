# Core 核心模块 JavaScript 文件分析文档

> **目录位置**: `js/core/`
> **生成时间**: 2025-11-28
> **文件总数**: 8

---

## 📋 目录

1. [toast.js - Toast 通知系统](#1-toastjs---toast-通知系统)
2. [product-data-loader.js - 商品数据加载器](#2-product-data-loaderjs---商品数据加载器)
3. [product-card-renderer.js - 商品卡片渲染器](#3-product-card-rendererjs---商品卡片渲染器)
4. [pop-up.js - 商品弹窗管理器](#4-pop-upjs---商品弹窗管理器)
5. [product-repository.js - 商品仓储](#5-product-repositoryjs---商品仓储)
6. [page-utility.js - 页面工具类](#6-page-utilityjs---页面工具类)
7. [navigate.js - 导航管理器](#7-navigatejs---导航管理器)
8. [navigation-state-manager.js - 导航状态管理器](#8-navigation-state-managerjs---导航状态管理器)
9. [模块依赖关系图](#模块依赖关系图)
10. [架构层次分析](#架构层次分析)

---

## 1. toast.js - Toast 通知系统

### 核心功能
提供全局的 Toast 通知功能，支持多种类型的提示信息，具有自动消失、悬停暂停等交互特性。

### 主要类: `ToastManager`

#### 职责范围
- ✅ 显示各类通知消息（成功、错误、信息、警告）
- ✅ 自动消失机制
- ✅ 悬停暂停/恢复
- ✅ 通知堆叠显示
- ✅ 优雅的动画效果

#### 核心方法

| 方法名 | 参数 | 功能描述 |
|--------|------|----------|
| `init()` | 无 | 初始化 Toast 容器，添加到 body |
| `show(message, type, duration)` | `message`: 消息内容<br>`type`: 通知类型<br>`duration`: 持续时间(ms) | 显示通知 |
| `success(message)` | `message`: 消息内容 | 显示成功通知 |
| `error(message)` | `message`: 消息内容 | 显示错误通知 |
| `info(message)` | `message`: 消息内容 | 显示信息通知 |
| `warning(message)` | `message`: 消息内容 | 显示警告通知 |
| `dismiss(toast)` | `toast`: Toast 元素 | 手动关闭通知 |
| `createToast(message, type)` | `message`: 消息<br>`type`: 类型 | 创建 Toast DOM 元素 |
| `pauseAllTimers()` | 无 | 暂停所有自动消失计时器 |
| `resumeAllTimers()` | 无 | 恢复所有计时器 |
| `startTimer(toast)` | `toast`: Toast 元素 | 启动单个 Toast 的计时器 |

#### 通知类型与图标

| 类型 | CSS 类名 | 图标路径 | 用途 |
|------|----------|----------|------|
| `success` | `toast-success` | `/images/icons/success.png` | 操作成功 |
| `error` | `toast-error` | `/images/icons/error.png` | 操作失败 |
| `info` | `toast-info` | `/images/icons/info.png` | 一般信息 |
| `warning` | `toast-warning` | `/images/icons/attention.png` | 警告提示 |

#### 交互特性

**自动消失**
- 默认持续时间: 3000ms (3秒)
- 可自定义持续时间
- 使用 `setTimeout` 实现

**悬停暂停**
```javascript
// 悬停时
pauseAllTimers() {
    // 1. 标记悬停状态
    // 2. 清除所有定时器
    // 3. 计算剩余时间
    // 4. 保存剩余时间
}

// 离开时
resumeAllTimers() {
    // 1. 取消悬停状态
    // 2. 使用剩余时间重启定时器
}
```

**堆叠显示**
- 新通知插入到容器顶部
- 从上到下堆叠
- 使用 `insertBefore(toast, container.firstChild)`

#### 计时器管理

**数据结构**
```javascript
this.timers = new Map();
// Key: toast 元素
// Value: {
//     remainingTime: number,  // 剩余时间
//     startTime: number,      // 开始时间
//     timerId: number|null    // setTimeout ID
// }
```

#### 动画效果

**进入动画**
```javascript
// 1. 创建元素
// 2. 添加到 DOM
// 3. 10ms 后添加 'show' 类
toast.classList.add('show');
```

**退出动画**
```javascript
// 1. 添加 'dismissing' 类
toast.classList.add('dismissing');
// 2. 300ms 后移除元素
setTimeout(() => removeFromDOM(), 300);
```

#### 全局实例
```javascript
// 自动创建全局实例
window.toast = new ToastManager();

// 使用方式
window.toast.success('操作成功！');
window.toast.error('发生错误！');
```

#### 依赖关系

**依赖的模块**
- 无外部依赖（纯 JavaScript 实现）

**被依赖的模块**
- `CartManager` - 购物车通知
- `WishlistManager` - 心愿单通知
- `CartDropdownRenderer` - 数量验证通知
- 以及其他需要用户反馈的模块

---

## 2. product-data-loader.js - 商品数据加载器

### 核心功能
负责从 JSON 文件加载商品数据，提供数据缓存和各种查询方法。

### 主要类: `ProductDataLoader`

#### 职责范围
- ✅ 从 JSON 文件加载商品数据
- ✅ 数据缓存管理
- ✅ 商品查询和搜索
- ✅ 分页数据支持
- ✅ 分类数据管理

#### 核心方法

| 方法名 | 参数 | 功能描述 |
|--------|------|----------|
| `loadCategory(category)` | `category`: 分类名 | 加载指定分类的商品 |
| `loadAll()` | 无 | 加载所有分类的商品 |
| `loadWithLimit(limit, offset)` | `limit`: 数量限制<br>`offset`: 起始偏移 | 分页加载商品 |
| `getProductById(id)` | `id`: 商品 ID | 根据 ID 获取单个商品 |
| `getProductsByCategory(category)` | `category`: 分类名 | 获取指定分类的商品 |
| `searchProducts(query)` | `query`: 搜索关键词 | 搜索商品 |
| `getCount()` | 无 | 获取商品总数 |
| `clearCache()` | 无 | 清空缓存 |

#### 数据结构

**商品分类**
```javascript
this.categories = ['chair', 'lamp', 'sofa', 'table'];
```

**数据路径**
```javascript
this.dataPath = 'data/';
// 实际路径: data/chair.json, data/lamp.json, etc.
```

**增强的商品对象**
```javascript
{
    ...originalProduct,      // 原始商品数据
    id: "chair-0",          // 生成的唯一 ID (category-index)
    category: "chair"       // 添加分类信息
}
```

#### 缓存机制

**缓存结构**
```javascript
this.cache = new Map();
// Key: category (string)
// Value: products array
```

**缓存策略**
- 按分类缓存
- 首次加载后缓存
- 后续访问直接返回缓存
- 可手动清除缓存

#### 加载流程

**单个分类加载**
```javascript
loadCategory(category) {
    1. 检查缓存
    2. 如有缓存，直接返回
    3. 无缓存，fetch JSON 文件
    4. 增强商品数据（添加 id 和 category）
    5. 存入缓存
    6. 返回商品数组
}
```

**全部加载**
```javascript
loadAll() {
    1. 检查是否已全部加载
    2. 使用 Promise.all 并行加载所有分类
    3. flat() 合并数组
    4. 保存到 allProducts
    5. 返回所有商品
}
```

#### 搜索功能

**搜索范围**
- 商品名称 (`name`)
- 商品简介 (`brief`)
- 商品标签 (`tags`)

**搜索逻辑**
```javascript
searchProducts(query) {
    const lowerQuery = query.toLowerCase();
    return products.filter(product =>
        product.name.toLowerCase().includes(lowerQuery) ||
        product.brief.toLowerCase().includes(lowerQuery) ||
        product.tags.toLowerCase().includes(lowerQuery)
    );
}
```

#### 分页支持

```javascript
loadWithLimit(limit = 8, offset = 0) {
    await this.loadAll();
    return this.allProducts.slice(offset, offset + limit);
}
```
- 默认每页 8 个商品
- 支持自定义偏移量

#### 错误处理

```javascript
try {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to load ${category} data`);
    }
    // ...
} catch (error) {
    console.error(`✗ Error loading ${category}:`, error);
    return []; // 返回空数组而非抛出异常
}
```

#### 依赖关系

**依赖的模块**
- 无外部依赖（纯 JavaScript + Fetch API）

**被依赖的模块**
- `ProductRepository` - 商品仓储

**数据依赖**
- `data/chair.json`
- `data/lamp.json`
- `data/sofa.json`
- `data/table.json`

---

## 3. product-card-renderer.js - 商品卡片渲染器

### 核心功能
负责商品卡片的 DOM 渲染，将商品数据转换为可视化的卡片元素。

### 主要类: `ProductCardRenderer`

#### 职责范围
- ✅ 商品卡片 DOM 生成
- ✅ 商品图片、价格、徽章渲染
- ✅ 批量渲染和追加渲染
- ✅ 悬停弹窗集成
- ✅ 价格计算和格式化

#### 核心方法

| 方法名 | 参数 | 功能描述 |
|--------|------|----------|
| `renderCard(product)` | `product`: 商品对象 | 渲染单个商品卡片 |
| `renderCards(products, clearContainer)` | `products`: 商品数组<br>`clearContainer`: 是否清空 | 批量渲染商品卡片 |
| `appendCards(products)` | `products`: 商品数组 | 追加渲染（不清空） |
| `createImageSection(product)` | `product`: 商品对象 | 创建图片区域 |
| `createInfoSection(product)` | `product`: 商品对象 | 创建信息区域 |
| `createBadges(product)` | `product`: 商品对象 | 创建徽章容器 |
| `createPriceBox(product)` | `product`: 商品对象 | 创建价格区域 |
| `attachPopup(card, product)` | `card`: 卡片元素<br>`product`: 商品对象 | 附加悬停弹窗 |
| `calculateDiscountedPrice(price, discount)` | `price`: 原价<br>`discount`: 折扣 | 计算折扣价 |
| `formatPrice(price)` | `price`: 价格 | 格式化价格 |
| `isNewProduct(launchTime)` | `launchTime`: 上架日期 | 判断是否新品 |
| `clear()` | 无 | 清空所有卡片 |

#### DOM 结构

**商品卡片结构**
```html
<article class="product-card" data-product-id="chair-0">
    <!-- 图片区域 -->
    <div class="product-image">
        <img src="..." alt="...">
        <div class="badge-container">
            <span class="badge badge-discount">-30%</span>
            <span class="badge badge-new">New</span>
        </div>
    </div>
    
    <!-- 信息区域 -->
    <div class="product-info">
        <span class="product-name">Product Name</span>
        <span class="product-desc">Description</span>
        <div class="price-box">
            <span class="current-price">RM 1,299</span>
            <span class="old-price">RM 1,899</span>
        </div>
    </div>
    
    <!-- 悬停弹窗（由 ProductPopup 管理） -->
</article>
```

#### 徽章系统

**折扣徽章**
- 条件: `product.discount && product.discount !== '0'`
- 显示: 折扣百分比（如 "-30%"）
- 样式: `badge-discount`

**新品徽章**
- 条件: 上架时间在 6 个月内
- 显示: "New"
- 样式: `badge-new`

**日期判断逻辑**
```javascript
isNewProduct(launchTime) {
    // launchTime 格式: "DD-MM-YYYY"
    const [day, month, year] = launchTime.split('-');
    const launchDate = new Date(`${year}-${month}-${day}`);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return launchDate >= sixMonthsAgo;
}
```

#### 价格系统

**价格计算**
```javascript
calculateDiscountedPrice(price, discount) {
    // discount 格式: "-30%" 或 "0"
    const match = discount.match(/-?(\d+)%/);
    if (match) {
        const discountPercent = parseInt(match[1]);
        return Math.round(price * (1 - discountPercent / 100));
    }
    return price;
}
```

**价格格式化**
```javascript
formatPrice(price) {
    // 使用马来西亚地区格式
    const formattedNumber = price.toLocaleString('en-MY');
    return `RM ${formattedNumber}`;
}
// 输出示例: "RM 1,299"
```

**价格显示规则**
- 无折扣: 只显示当前价格
- 有折扣: 显示折扣价 + 原价（划线）

#### 图片错误处理

```javascript
img.onerror = () => {
    img.src = '/201-project/images/products/placeholder.jpg';
};
```
- 图片加载失败时自动替换为占位图

#### 弹窗集成

```javascript
attachPopup(card, product) {
    const popup = new ProductPopup(card, product);
    popup.render();
    this.popups.set(product.id, popup);
}
```
- 为每个卡片创建弹窗实例
- 使用 Map 管理所有弹窗
- 清空时销毁所有弹窗

#### 批量渲染

**清空重渲染**
```javascript
renderCards(products, clearContainer = true)
```
- 默认清空容器
- 逐个渲染商品
- 输出日志信息

**追加渲染**
```javascript
appendCards(products) {
    this.renderCards(products, false);
}
```
- 不清空容器
- 适用于分页加载

#### 依赖关系

**依赖的模块**
- `ProductPopup` - 商品弹窗

**被依赖的模块**
- `ProductRepository` - 商品仓储

---

## 4. pop-up.js - 商品弹窗管理器

### 核心功能
管理商品卡片的悬停弹窗，提供添加到购物车、分享、收藏等快捷操作。

### 主要类: `ProductPopup`

#### 职责范围
- ✅ 弹窗 DOM 渲染
- ✅ 添加到购物车
- ✅ 添加到心愿单（Like）
- ✅ 分享功能
- ✅ 事件分发

#### 核心方法

| 方法名 | 参数 | 功能描述 |
|--------|------|----------|
| `render()` | 无 | 渲染弹窗浮层 |
| `createPopupElement()` | 无 | 创建弹窗 DOM 元素 |
| `attachEvents()` | 无 | 附加事件监听器 |
| `handleAddToCart(event)` | `event`: 点击事件 | 处理添加到购物车 |
| `handleShare(event)` | `event`: 点击事件 | 处理分享操作 |
| `handleLike(event)` | `event`: 点击事件 | 处理收藏操作 |
| `destroy()` | 无 | 销毁弹窗 |

#### DOM 结构

```html
<div class="pop-up">
    <div class="overlay"></div>
    <div class="popup-actions">
        <!-- 添加到购物车按钮 -->
        <button class="btn-add-cart">
            <span class="addtocart-span">Add to cart</span>
        </button>
        
        <!-- 快捷操作 -->
        <div class="action-links">
            <div class="action-item action-share">
                <div class="icon-share"></div>
                <span>Share</span>
            </div>
            <div class="action-item action-like">
                <div class="icon-like"></div>
                <span>Like</span>
            </div>
        </div>
    </div>
</div>
```

#### 事件处理

**添加到购物车**
```javascript
handleAddToCart(event) {
    event.stopPropagation();
    window.dispatchEvent(new CustomEvent('addToCart', {
        detail: { product: this.product }
    }));
}
```
- 阻止事件冒泡
- 分发自定义事件
- 由 `CartManager` 处理

**添加到心愿单**
```javascript
handleLike(event) {
    event.stopPropagation();
    window.dispatchEvent(new CustomEvent('addToWishlist', {
        detail: { product: this.product }
    }));
}
```
- 阻止事件冒泡
- 分发自定义事件
- 由 `WishlistManager` 处理

**分享功能**
```javascript
handleShare(event) {
    event.stopPropagation();
    if (navigator.share) {
        navigator.share({
            title: this.product.name,
            text: `Check out ${this.product.name} - ${this.product.brief}`,
            url: window.location.href
        }).catch(() => {
            // 用户取消分享 - 静默失败
        });
    } else {
        // 不支持 Web Share API
        window.toast.info(`Share ${this.product.name} - Feature coming soon!`);
    }
}
```
- 优先使用 Web Share API
- 降级为 Toast 提示

#### 构造与销毁

**构造函数**
```javascript
constructor(card, product) {
    this.card = card;       // 商品卡片元素
    this.product = product; // 商品数据
    this.element = null;    // 弹窗元素
}
```

**销毁方法**
```javascript
destroy() {
    if (this.element && this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
}
```

#### 防重复渲染

```javascript
render() {
    if (this.card.querySelector('.pop-up')) {
        return; // 已存在，跳过
    }
    // 继续渲染...
}
```

#### 依赖关系

**依赖的模块**
- `window.toast` (ToastManager) - 显示通知

**被依赖的模块**
- `ProductCardRenderer` - 卡片渲染器

**触发的事件**
- `addToCart` → `CartManager`
- `addToWishlist` → `WishlistManager`

---

## 5. product-repository.js - 商品仓储

### 核心功能
商品数据管理的**中心枢纽**，协调数据加载器、渲染器和过滤器，提供统一的数据访问接口。

### 主要类: `ProductRepository`

#### 职责范围
- ✅ 协调数据加载器和渲染器
- ✅ 统一的数据访问接口
- ✅ 过滤和搜索协调
- ✅ 分页管理
- ✅ 状态追踪

#### 核心方法

| 方法名 | 参数 | 功能描述 |
|--------|------|----------|
| `initRenderer(containerSelector)` | `containerSelector`: 容器选择器 | 初始化渲染器 |
| `loadInitialProducts(initialCount)` | `initialCount`: 初始数量 | 加载初始商品 |
| `loadMore(count)` | `count`: 加载数量 | 加载更多商品（分页） |
| `applyFilters()` | 无 | 应用过滤器 |
| `searchProducts(query)` | `query`: 搜索关键词 | 搜索商品 |
| `loadCategory(category)` | `category`: 分类名 | 加载指定分类 |
| `getProductById(id)` | `id`: 商品 ID | 获取单个商品 |
| `getFilter()` | 无 | 获取过滤器实例 |
| `getRenderer()` | 无 | 获取渲染器实例 |
| `getDataLoader()` | 无 | 获取数据加载器实例 |
| `getCurrentProducts()` | 无 | 获取当前显示的商品 |
| `getStats()` | 无 | 获取统计信息 |
| `reset()` | 无 | 重置到初始状态 |
| `hasMore()` | 无 | 检查是否有更多商品 |

#### 状态管理

**内部状态**
```javascript
{
    dataLoader: ProductDataLoader,    // 数据加载器
    filter: ProductFilter,            // 过滤器
    renderer: ProductCardRenderer,    // 渲染器
    currentProducts: [],              // 当前显示的商品
    displayedCount: 0                 // 已显示的商品数量
}
```

#### 初始化流程

```javascript
const repository = new ProductRepository();

// 1. 初始化渲染器
repository.initRenderer('#product-grid');

// 2. 加载初始商品
await repository.loadInitialProducts(8);
```

#### 分页加载

```javascript
async loadMore(count = 8) {
    const allProducts = await this.dataLoader.loadAll();
    const nextProducts = allProducts.slice(
        this.displayedCount,
        this.displayedCount + count
    );
    
    if (nextProducts.length === 0) {
        return 0; // 没有更多商品
    }
    
    this.currentProducts = [...this.currentProducts, ...nextProducts];
    this.displayedCount += nextProducts.length;
    
    this.renderer.appendCards(nextProducts);
    
    return nextProducts.length;
}
```

#### 过滤流程

```javascript
async applyFilters() {
    // 1. 加载所有商品
    const allProducts = await this.dataLoader.loadAll();
    
    // 2. 应用过滤器
    const filtered = this.filter.apply(allProducts);
    
    // 3. 更新状态
    this.currentProducts = filtered;
    this.displayedCount = filtered.length;
    
    // 4. 重新渲染
    this.renderer.renderCards(filtered);
}
```

#### 搜索流程

```javascript
async searchProducts(query) {
    // 1. 使用数据加载器搜索
    const results = await this.dataLoader.searchProducts(query);
    
    // 2. 更新状态
    this.currentProducts = results;
    this.displayedCount = results.length;
    
    // 3. 重新渲染
    this.renderer.renderCards(results);
}
```

#### 统计信息

```javascript
async getStats() {
    const total = await this.dataLoader.getCount();
    return {
        totalProducts: total,
        displayedProducts: this.displayedCount,
        remainingProducts: total - this.displayedCount
    };
}

// 使用示例
const stats = await repository.getStats();
console.log(`显示 ${stats.displayedProducts} / ${stats.totalProducts}`);
```

#### 重置功能

```javascript
async reset() {
    this.filter.reset();             // 重置过滤器
    this.currentProducts = [];       // 清空当前商品
    this.displayedCount = 0;         // 重置计数
    this.renderer.clear();           // 清空渲染
}
```

#### 依赖关系

**依赖的模块**
- `ProductDataLoader` - 数据加载器
- `ProductCardRenderer` - 卡片渲染器
- `ProductFilter` - 过滤器（代码中引用但未提供）

**被依赖的模块**
- 商店页面 (shop.html)
- 首页 (index.html)

**架构角色**
- **Facade 模式**: 为复杂子系统提供简单接口
- **Mediator 模式**: 协调多个组件之间的交互

---

## 6. page-utility.js - 页面工具类

### 核心功能
提供页面检测功能，根据 DOM 结构识别当前页面类型。

### 主要类: `PageUtility`（静态类）

#### 职责范围
- ✅ 页面类型检测
- ✅ 页面标识符管理
- ✅ 提供便捷的页面判断方法

#### 页面定义

**页面 ID 常量**
```javascript
static PAGE_IDS = {
    HOME: 1,
    SHOP: 2,
    CART: 3,
    CHECKOUT: 4
};
```

**页面选择器**
```javascript
static PAGE_SELECTORS = {
    1: '#inspirationsCarousel, #browseRange',  // 首页特征
    2: '#shop-product-grid',                   // 商店页特征
    3: '#cart-items-container',                // 购物车特征
    4: '#checkoutForm'                         // 结账页特征
};
```

**页面名称**
```javascript
static PAGE_NAMES = {
    1: 'Home',
    2: 'Shop',
    3: 'Cart',
    4: 'Checkout'
};
```

#### 核心方法

| 方法名 | 返回值 | 功能描述 |
|--------|--------|----------|
| `detectPage(pageSelectors)` | `number\|null` | 检测当前页面类型 |
| `getCurrentPageId()` | `number\|null` | 获取当前页面 ID |
| `getPageName(pageId)` | `string` | 获取页面名称 |
| `isCurrentPage(pageId)` | `boolean` | 检查是否为指定页面 |
| `isHomePage()` | `boolean` | 检查是否为首页 |
| `isShopPage()` | `boolean` | 检查是否为商店页 |
| `isCartPage()` | `boolean` | 检查是否为购物车页 |
| `isCheckoutPage()` | `boolean` | 检查是否为结账页 |

#### 检测逻辑

```javascript
static detectPage(pageSelectors) {
    for (const pageId in this.PAGE_SELECTORS) {
        const selectors = this.PAGE_SELECTORS[pageId]
            .split(',')
            .map(s => s.trim());
        
        const exists = selectors.some(selector => 
            document.querySelector(selector)
        );
        
        if (exists) {
            return parseInt(pageId);
        }
    }
    return null;
}
```

#### 使用示例

```javascript
// 获取当前页面
const pageId = PageUtility.getCurrentPageId();
console.log(`Current page: ${PageUtility.getPageName(pageId)}`);

// 条件判断
if (PageUtility.isShopPage()) {
    // 商店页面特定逻辑
}

if (PageUtility.isCartPage()) {
    // 购物车页面特定逻辑
}
```

#### 设计模式

**策略模式**
- 每个页面有独特的检测策略（选择器组合）
- 统一的检测接口

**单一职责原则**
- 只负责页面检测
- 不涉及业务逻辑

#### 依赖关系

**依赖的模块**
- 无外部依赖

**被依赖的模块**
- 需要页面检测的任何模块

---

## 7. navigate.js - 导航管理器

### 核心功能
管理导航栏的激活状态和导航跳转行为。

### 主要类: `NavigationManager`

#### 职责范围
- ✅ 设置导航链接激活状态
- ✅ 监听导航点击事件
- ✅ 标记商店页导航（用于状态恢复）

#### 核心方法

| 方法名 | 参数 | 功能描述 |
|--------|------|----------|
| `init()` | 无 | 初始化导航管理器 |
| `setActiveNavLink()` | 无 | 根据当前 URL 设置激活链接 |
| `bindNavigationEvents()` | 无 | 绑定导航点击事件 |
| `clearActiveStates()` | 无 | 清除所有激活状态 |
| `setActivePage(page)` | `page`: 页面名称 | 程序化设置激活页面 |

#### 激活状态管理

**自动设置激活状态**
```javascript
setActiveNavLink() {
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';
    
    const links = document.querySelectorAll('.nav-links a');
    links.forEach(link => {
        const href = link.getAttribute('href');
        if (href === page || (page === '' && href === 'index.html')) {
            const textSpan = link.querySelector('.nav-link-text');
            if (textSpan) {
                textSpan.classList.add('active');
            }
        }
    });
}
```

**DOM 结构假设**
```html
<nav class="nav-links">
    <a href="index.html">
        <span class="nav-link-text">Home</span>
    </a>
    <a href="shop.html">
        <span class="nav-link-text active">Shop</span>
    </a>
    <!-- ... -->
</nav>
```

#### 商店页导航标记

```javascript
bindNavigationEvents() {
    const navStateManager = new NavigationStateManager();
    const links = document.querySelectorAll('.nav-links a');
    
    links.forEach(link => {
        const href = link.getAttribute('href');
        
        // 只拦截商店页导航
        if (href === 'shop.html') {
            link.addEventListener('click', () => {
                // 标记导航到商店（用于状态恢复）
                navStateManager.markShopNavigation();
            });
        }
    });
}
```

**标记目的**
- 在用户点击导航链接前往商店页时标记
- 商店页可据此恢复之前的过滤/搜索状态

#### 依赖关系

**依赖的模块**
- `NavigationStateManager` - 导航状态管理器

**被依赖的模块**
- 所有页面的导航栏

---

## 8. navigation-state-manager.js - 导航状态管理器

### 核心功能
管理页面间导航的状态保存和恢复，包括面包屑路径、商店页状态、购物车选择等。

### 主要类: `NavigationStateManager`

#### 职责范围
- ✅ 面包屑路径管理
- ✅ 商店页状态保存和恢复
- ✅ 购物车选择状态管理
- ✅ 页面来源追踪

#### 存储键定义

```javascript
STORAGE_KEYS = {
    BREADCRUMB_PATH: 'nav_breadcrumb_path',
    SHOP_STATE: 'nav_shop_state',
    CART_SELECTIONS: 'nav_cart_selections'
};
```

---

### 面包屑管理

#### 核心方法

| 方法名 | 参数 | 功能描述 |
|--------|------|----------|
| `saveBreadcrumbPath(currentPage, breadcrumb)` | `currentPage`: 当前页<br>`breadcrumb`: 面包屑数组 | 保存面包屑路径 |
| `getBreadcrumbPath()` | 无 | 获取保存的面包屑 |
| `clearBreadcrumbPath()` | 无 | 清除面包屑 |
| `buildDynamicBreadcrumb(currentPage, referrerPage)` | `currentPage`: 当前页<br>`referrerPage`: 来源页 | 构建动态面包屑 |

#### 面包屑数据结构

```javascript
{
    page: "cart.html",
    breadcrumb: [
        {text: 'Home', href: '/201-project/index.html'},
        {text: 'Shop', href: '/201-project/shop.html'},
        {text: 'Cart'}  // 当前页无 href
    ],
    timestamp: 1732795200000
}
```

#### 动态面包屑构建

**购物车页面**
```javascript
// 正常导航到购物车
Home → Cart

// 从商店导航到购物车
Home → Shop → Cart

// 从结账返回购物车（恢复之前的路径）
Home → Shop → Cart （恢复）
```

**结账页面**
```javascript
// 继承购物车的完整路径
Home → Shop → Cart → Checkout
```

**关键逻辑**
```javascript
buildDynamicBreadcrumb(currentPage, referrerPage) {
    let breadcrumb = [{text: 'Home', href: '/201-project/index.html'}];
    
    if (currentPage === 'cart.html') {
        const returningFromCheckout = 
            sessionStorage.getItem('returning_from_checkout') === 'true';
        
        if (returningFromCheckout) {
            // 恢复之前的路径
            const savedPath = this.getBreadcrumbPath();
            if (savedPath) breadcrumb = savedPath.breadcrumb;
        } else {
            // 正常构建
            if (referrerPage && referrerPage !== 'index.html') {
                breadcrumb.push({text: pageNames[referrerPage], href: ...});
            }
            breadcrumb.push({text: 'Cart'});
        }
        
        this.saveBreadcrumbPath('cart.html', breadcrumb);
    }
    // ...
}
```

---

### 商店页状态管理

#### 核心方法

| 方法名 | 参数 | 功能描述 |
|--------|------|----------|
| `saveShopState(state)` | `state`: 商店状态对象 | 保存商店页状态 |
| `getShopState()` | 无 | 获取保存的商店状态 |
| `clearShopState()` | 无 | 清除商店状态 |
| `shouldRestoreShopState()` | 无 | 检查是否应该恢复状态 |
| `markShopNavigation()` | 无 | 标记商店页导航 |
| `checkShopNavigationMarker()` | 无 | 检查并清除导航标记 |

#### 商店状态数据结构

```javascript
{
    searchKeyword: "chair",
    categories: ["chair", "table"],
    priceRange: {min: 0, max: 5000},
    ratingRange: {min: 0, max: 5},
    dateRange: {from: "2024-01-01", to: "2024-12-31"},
    itemsPerPage: 16,
    sorting: {key: "price", order: "asc"},
    currentPage: 1,
    timestamp: 1732795200000
}
```

#### 状态恢复逻辑

**何时恢复状态**
```javascript
shouldRestoreShopState() {
    const referrer = document.referrer;
    if (!referrer) return false;
    
    const referrerPage = new URL(referrer).pathname.split('/').pop();
    
    // 从购物车或结账返回时恢复
    return referrerPage === 'cart.html' || referrerPage === 'checkout.html';
}
```

**状态过期机制**
- 最大有效期: 30 分钟
- 超时自动清除

```javascript
getShopState() {
    const state = JSON.parse(sessionStorage.getItem(this.STORAGE_KEYS.SHOP_STATE));
    
    const maxAge = 30 * 60 * 1000; // 30 分钟
    if (Date.now() - state.timestamp > maxAge) {
        this.clearShopState();
        return null;
    }
    
    return state;
}
```

---

### 购物车选择管理

#### 核心方法

| 方法名 | 参数 | 功能描述 |
|--------|------|----------|
| `saveCartSelections(selectedIds)` | `selectedIds`: 选中商品 ID 数组 | 保存购物车选择 |
| `getCartSelections()` | 无 | 获取保存的选择 |
| `clearCartSelections()` | 无 | 清除选择 |

#### 使用场景

**进入结账前**
```javascript
// 保存用户在购物车中选中的商品
const selectedIds = getSelectedProductIds();
navStateManager.saveCartSelections(selectedIds);
```

**从结账返回购物车后**
```javascript
// 恢复之前的选择状态
const savedSelections = navStateManager.getCartSelections();
if (savedSelections) {
    restoreSelections(savedSelections);
}
```

#### 数据结构

```javascript
{
    selectedIds: ["chair-0-L-#FFFFFF", "table-1-M-#000000"],
    timestamp: 1732795200000
}
```

#### 过期机制
- 最大有效期: 1 小时
- 超时自动清除

---

### 工具方法

| 方法名 | 返回值 | 功能描述 |
|--------|--------|----------|
| `getCurrentPage()` | `string` | 获取当前页面文件名 |
| `getReferrerPage()` | `string\|null` | 获取来源页面文件名 |
| `clearAll()` | 无 | 清除所有导航状态 |

#### 实现细节

```javascript
getCurrentPage() {
    return window.location.pathname.split('/').pop() || 'index.html';
}

getReferrerPage() {
    const referrer = document.referrer;
    if (!referrer) return null;
    
    try {
        const referrerUrl = new URL(referrer);
        return referrerUrl.pathname.split('/').pop() || 'index.html';
    } catch (e) {
        return null;
    }
}
```

---

### 存储位置

所有状态保存在 `sessionStorage`：
- **生命周期**: 浏览器标签页关闭时清除
- **作用域**: 当前标签页
- **适用场景**: 页面间导航状态

---

### 依赖关系

**依赖的模块**
- 无外部依赖

**被依赖的模块**
- `NavigationManager` - 导航管理器
- 购物车页面管理器
- 商店页面管理器
- 结账页面管理器

---

## 模块依赖关系图

```
┌─────────────────────────────────────────────────────────────┐
│                      Core Modules                            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    通知系统（独立）                           │
│  ┌──────────────────┐                                        │
│  │    toast.js      │                                        │
│  │  ToastManager    │                                        │
│  │                  │                                        │
│  │ • 全局单例实例    │                                        │
│  │ • window.toast   │                                        │
│  └──────────────────┘                                        │
│           ▲                                                  │
│           │ 被所有需要通知的模块使用                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    商品展示系统                               │
│                                                               │
│  ┌─────────────────────────────────────────────────┐        │
│  │         ProductRepository (Facade/Mediator)     │        │
│  │                  商品仓储中心                     │        │
│  └──┬───────────────────┬──────────────────────┬───┘        │
│     │ manages           │ manages              │ manages    │
│     ↓                   ↓                      ↓            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ProductData   │  │ProductCard   │  │ProductFilter │     │
│  │Loader        │  │Renderer      │  │(未提供)       │     │
│  │              │  │              │  │              │     │
│  │• 加载JSON     │  │• 渲染卡片     │  │• 过滤商品     │     │
│  │• 缓存管理     │  │• DOM生成      │  │• 价格/分类    │     │
│  │• 搜索查询     │  │• 图片处理     │  │• 日期/评分    │     │
│  └──────────────┘  └──────┬───────┘  └──────────────┘     │
│                           │ creates                         │
│                           ↓                                 │
│                    ┌──────────────┐                         │
│                    │ProductPopup  │                         │
│                    │              │                         │
│                    │• 悬停浮层     │                         │
│                    │• 快捷操作     │                         │
│                    │• 事件分发     │                         │
│                    └──────┬───────┘                         │
│                           │ dispatches events               │
│                           ↓                                 │
│                    ┌──────────────────┐                     │
│                    │ addToCart        │                     │
│                    │ addToWishlist    │                     │
│                    └──────────────────┘                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    导航系统                                   │
│                                                               │
│  ┌──────────────────┐         ┌──────────────────────────┐  │
│  │   navigate.js    │         │navigation-state-         │  │
│  │ Navigation       │◄────────│  manager.js              │  │
│  │ Manager          │  uses   │NavigationStateManager    │  │
│  │                  │         │                          │  │
│  │• 激活状态管理     │         │• 面包屑管理               │  │
│  │• 导航事件        │         │• 商店状态保存/恢复         │  │
│  │• 商店页标记      │         │• 购物车选择管理           │  │
│  └──────────────────┘         │• sessionStorage          │  │
│                                └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    工具模块                                   │
│  ┌──────────────────┐                                        │
│  │ page-utility.js  │                                        │
│  │  PageUtility     │                                        │
│  │  (静态类)         │                                        │
│  │                  │                                        │
│  │• 页面检测         │                                        │
│  │• DOM选择器匹配    │                                        │
│  └──────────────────┘                                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    数据流向                                   │
│                                                               │
│  JSON Files                                                  │
│  (chair.json, lamp.json, sofa.json, table.json)             │
│       │                                                      │
│       ↓ fetch                                                │
│  ProductDataLoader                                           │
│       │                                                      │
│       ↓ provides data                                        │
│  ProductRepository                                           │
│       │                                                      │
│       ↓ manages rendering                                    │
│  ProductCardRenderer                                         │
│       │                                                      │
│       ↓ creates                                              │
│  Product Cards + ProductPopup                                │
│       │                                                      │
│       ↓ user interaction                                     │
│  Custom Events (addToCart, addToWishlist)                   │
│       │                                                      │
│       ↓ handled by                                           │
│  Header Components (CartManager, WishlistManager)           │
└─────────────────────────────────────────────────────────────┘
```

---

## 架构层次分析

### 1. 表现层 (Presentation Layer)
```
ProductCardRenderer ──┬─→ DOM 渲染
ProductPopup         ─┴─→ 用户交互
ToastManager         ───→ 用户反馈
```
- 负责视图渲染和用户交互
- 不包含业务逻辑
- 纯 UI 组件

### 2. 业务层 (Business Layer)
```
ProductRepository ───→ 数据协调
NavigationManager ───→ 导航逻辑
```
- 业务逻辑处理
- 状态管理
- 组件协调

### 3. 数据层 (Data Layer)
```
ProductDataLoader ────────→ 数据获取
NavigationStateManager ───→ 状态持久化
```
- 数据加载和缓存
- 数据持久化
- 数据查询和过滤

### 4. 工具层 (Utility Layer)
```
PageUtility ───→ 页面检测
```
- 通用工具函数
- 无状态
- 可复用

---

## 设计模式应用

### 1. **Facade 模式**
- **应用**: `ProductRepository`
- **目的**: 为复杂的商品系统提供简单接口
- **好处**: 降低系统复杂度

### 2. **Mediator 模式**
- **应用**: `ProductRepository`
- **目的**: 协调 DataLoader、Renderer、Filter
- **好处**: 解耦组件间的直接依赖

### 3. **Singleton 模式**
- **应用**: `ToastManager` (`window.toast`)
- **目的**: 全局唯一的通知管理器
- **好处**: 统一的用户反馈机制

### 4. **Observer 模式**
- **应用**: `ProductPopup` → `CartManager`
- **目的**: 通过自定义事件进行通信
- **好处**: 松耦合的组件协作

### 5. **Strategy 模式**
- **应用**: `PageUtility` 页面检测
- **目的**: 不同页面不同的检测策略
- **好处**: 易于扩展新页面类型

### 6. **Repository 模式**
- **应用**: `ProductRepository`
- **目的**: 抽象数据访问逻辑
- **好处**: 数据源变更不影响业务层

---

## 性能优化策略

### 1. **数据缓存**
```javascript
// ProductDataLoader
this.cache = new Map();
// 按分类缓存，避免重复加载
```

### 2. **懒加载**
```javascript
// 初始加载 8 个商品
await repository.loadInitialProducts(8);

// 滚动加载更多
await repository.loadMore(8);
```

### 3. **批量操作**
```javascript
// 使用 Promise.all 并行加载
Promise.all(categories.map(cat => loadCategory(cat)))
```

### 4. **状态追踪**
```javascript
// 避免重复加载
if (this.allProducts.length > 0) {
    return this.allProducts;
}
```

### 5. **智能过期**
```javascript
// 商店状态 30 分钟过期
// 购物车选择 1 小时过期
```

---

## 代码质量

### ✅ 优点

1. **清晰的职责划分**
   - 每个类专注单一功能
   - 高内聚、低耦合

2. **完善的文档**
   - 详细的 JSDoc 注释
   - 清晰的方法说明

3. **错误处理**
   - try-catch 异常捕获
   - 降级处理策略

4. **可扩展性**
   - 模块化设计
   - 易于添加新功能

5. **性能意识**
   - 缓存机制
   - 懒加载
   - 批量操作

### ⚠️ 改进建议

1. **类型安全**
   - 考虑 TypeScript 迁移
   - 添加类型定义

2. **依赖注入**
   - 减少对全局对象的依赖
   - 提高可测试性

3. **单元测试**
   - 为核心逻辑编写测试
   - 提升代码可靠性

4. **配置管理**
   - 提取硬编码的配置
   - 集中管理常量

5. **错误边界**
   - 全局错误处理
   - 用户友好的错误提示

---

## 使用指南

### 快速开始

#### 1. 初始化商品展示

```javascript
// 创建仓储
const repository = new ProductRepository();

// 初始化渲染器
repository.initRenderer('#product-grid');

// 加载商品
await repository.loadInitialProducts(8);
```

#### 2. 加载更多商品

```javascript
const loadMoreBtn = document.getElementById('load-more');
loadMoreBtn.addEventListener('click', async () => {
    const loaded = await repository.loadMore(8);
    if (loaded === 0) {
        loadMoreBtn.disabled = true;
        loadMoreBtn.textContent = 'No More Products';
    }
});
```

#### 3. 搜索商品

```javascript
const searchBtn = document.getElementById('search-btn');
searchBtn.addEventListener('click', async () => {
    const query = document.getElementById('search-input').value;
    await repository.searchProducts(query);
});
```

#### 4. 显示通知

```javascript
// 使用全局 toast 实例
window.toast.success('操作成功！');
window.toast.error('发生错误！');
window.toast.info('提示信息');
window.toast.warning('警告提示');
```

#### 5. 页面检测

```javascript
if (PageUtility.isShopPage()) {
    // 商店页面逻辑
    initShopPage();
}

if (PageUtility.isCartPage()) {
    // 购物车页面逻辑
    initCartPage();
}
```

#### 6. 导航状态管理

```javascript
// 保存商店状态
const navStateManager = new NavigationStateManager();
navStateManager.saveShopState({
    searchKeyword: 'chair',
    categories: ['chair'],
    currentPage: 1
});

// 恢复商店状态
if (navStateManager.shouldRestoreShopState()) {
    const savedState = navStateManager.getShopState();
    if (savedState) {
        restoreShopPage(savedState);
    }
}
```

---

## 最佳实践总结

### 1. **模块化开发**
- 单一职责
- 接口明确
- 低耦合

### 2. **事件驱动**
- 使用 CustomEvent 通信
- 解耦组件依赖

### 3. **状态管理**
- 集中管理状态
- 持久化关键数据
- 过期机制

### 4. **用户体验**
- 即时反馈（Toast）
- 懒加载优化性能
- 错误友好提示

### 5. **代码质量**
- 详细注释
- 错误处理
- 性能优化

---

**文档版本**: 1.0  
**最后更新**: 2025-11-28  
**维护者**: GitHub Copilot

