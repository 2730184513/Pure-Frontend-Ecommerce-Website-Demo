# Furniro 家具电商网页开发规范

## 📋 目录
- [1. 技术栈约束](#1-技术栈约束)
- [2. 项目结构规范](#2-项目结构规范)
- [3. HTML 开发规范](#3-html-开发规范)
- [4. CSS 开发规范](#4-css-开发规范)
- [5. JavaScript 开发规范](#5-javascript-开发规范)
- [6. 数据交互规范](#6-数据交互规范)
- [7. 组件化开发规范](#7-组件化开发规范)
- [8. 文件路径规范](#8-文件路径规范)
- [9. 命名规范](#9-命名规范)
- [10. 代码组织与架构](#10-代码组织与架构)

---

## 1. 技术栈约束

### 1.1 核心技术
- **HTML5**: 页面结构与语义化标签
- **CSS3**: 样式设计与布局
- **ES6+ JavaScript**: 业务逻辑与交互

### 1.2 技术限制
- ✅ **允许**: 原生 JavaScript (ES6+)、Fetch API、Promise、Class
- ❌ **禁止**: 任何前端框架（React、Vue、Angular）
- ❌ **禁止**: jQuery 或其他第三方库
- ❌ **禁止**: Node.js 后端服务
- ❌ **禁止**: 使用残障辅助标签（如 `aria-*`，但允许 `alt` 属性）

### 1.3 数据交互
- 所有数据通过 **JSON 文件** 存储和读取
- 使用 `fetch()` API 进行数据加载
- 数据存放于 `/data/` 目录

---

## 2. 项目结构规范

### 2.1 标准目录结构
```
201-project/
├── index.html              # 首页
├── shop.html               # 商店页面
├── product-detail.html     # 产品详情页
├── DEVELOPMENT_GUIDELINES.md  # 开发规范文档
├── components/             # 可复用组件
│   ├── header.html
│   ├── footer.html
│   ├── product-card.html
│   └── ...
├── css/                    # 样式文件（按组件/Section分离）
│   ├── index.css           # 全局样式
│   ├── header.css
│   ├── footer.css
│   ├── hero.css
│   ├── browse-range.css
│   ├── products.css
│   ├── carousel.css
│   └── ...
├── js/                     # JavaScript 文件（按功能模块分离）
│   ├── main.js             # 应用主入口
│   ├── component-loader.js # 组件加载器
│   ├── product-repository.js
│   ├── product-data-loader.js
│   ├── product-filter.js
│   ├── product-card-renderer.js
│   ├── browse-range.js
│   ├── carousel.js
│   └── ...
├── data/                   # JSON 数据文件
│   ├── chair.json
│   ├── table.json
│   ├── sofa.json
│   └── lamp.json
└── images/                 # 图片资源
    ├── hero.png
    ├── icons/
    └── products/
```

### 2.2 文件命名规则
- **HTML**: `kebab-case.html` (如 `product-detail.html`)
- **CSS**: `kebab-case.css` (如 `browse-range.css`)
- **JavaScript**: `kebab-case.js` (如 `product-repository.js`)
- **JSON**: `lowercase.json` (如 `chair.json`)
- **图片**: `PascalCase.jpg/png` (产品图) 或 `kebab-case.png` (图标)

---

## 3. HTML 开发规范

### 3.1 基本原则
- 使用 **HTML5** 语义化标签
- 每个页面必须包含完整的 `<!DOCTYPE html>` 声明
- 使用现代浏览器标准（Chrome、Edge、Firefox、Safari 最新版）
- 不需要添加 `aria-*` 等残障辅助标签

### 3.2 语义化标签使用
```html
<!-- ✅ 推荐 -->
<header>        <!-- 页头 -->
<nav>           <!-- 导航 -->
<main>          <!-- 主内容 -->
<section>       <!-- 内容区块 -->
<article>       <!-- 独立内容 -->
<aside>         <!-- 侧边栏 -->
<footer>        <!-- 页脚 -->

<!-- ❌ 避免过度使用 div -->
<div class="header">...</div>
```

### 3.3 页面结构模板
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page Title - Furniro</title>

    <!-- CSS Files -->
    <link rel="stylesheet" href="/201-project/css/index.css">
    <link rel="stylesheet" href="/201-project/css/header.css">
    <!-- 按需加载其他 CSS -->

    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>

<!-- 组件占位符 -->
<div id="header-placeholder"></div>

<!-- 页面主内容 -->
<main>
    <section class="hero">
        <!-- Section 内容 -->
    </section>
    
    <section class="products" id="products">
        <!-- Section 内容 -->
    </section>
</main>

<!-- Footer 占位符 -->
<div id="footer-placeholder"></div>

<!-- JavaScript Files -->
<script src="/201-project/js/component-loader.js"></script>
<script src="/201-project/js/main.js"></script>
</body>
</html>
```

### 3.4 组件化开发
- 重复使用的模块（Header、Footer）提取为独立 HTML 组件
- 组件存放在 `/components/` 目录
- 通过 JavaScript 动态加载组件

```html
<!-- components/header.html -->
<header class="header">
    <div class="container header-container">
        <div class="logo">
            <img src="/201-project/images/icons/Logo.png" alt="Furniro Logo">
            <span class="logo-text">Furniro</span>
        </div>
        <nav class="navbar">
            <!-- 导航内容 -->
        </nav>
    </div>
</header>
```

---

## 4. CSS 开发规范

### 4.1 文件组织原则
- **按组件/Section 分离**: 每个独立的模块拥有自己的 CSS 文件
- **避免单一巨大文件**: 不要将整个页面的样式写在一个 CSS 中

#### 文件分离示例
```
css/
├── index.css           # 全局通用样式（reset, 变量, 字体）
├── header.css          # Header 组件样式
├── footer.css          # Footer 组件样式
├── hero.css            # Hero Section 样式
├── browse-range.css    # Browse Range Section 样式
├── products.css        # Products Section 样式
├── carousel.css        # Carousel 组件样式
└── ...
```

### 4.2 全局样式文件 (index.css)
```css
/* 1. CSS Reset */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

/* 2. CSS 变量定义 */
:root {
    /* 颜色系统 */
    --primary-color: #B88E2F;
    --text-primary: #333333;
    --text-secondary: #666666;
    --bg-light: #F9F1E7;
    
    /* 字体系统 */
    --font-primary: 'Poppins', sans-serif;
    --font-secondary: 'Montserrat', sans-serif;
    
    /* 间距系统 */
    --spacing-xs: 8px;
    --spacing-sm: 16px;
    --spacing-md: 24px;
    --spacing-lg: 48px;
    --spacing-xl: 80px;
}

/* 3. 全局字体和基础样式 */
body {
    font-family: var(--font-primary);
    color: var(--text-primary);
    line-height: 1.6;
}

/* 4. 通用工具类 */
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

.section-padding {
    padding: var(--spacing-xl) 0;
}
```

### 4.3 组件样式文件规范
每个 CSS 文件应该：
1. **明确注释文件用途**
2. **使用 BEM 命名规范**
3. **避免嵌套过深**（最多 3 层）
4. **使用 CSS 变量**

```css
/* ========================================
   Header Component Styles
   ======================================== */

/* Header Container */
.header {
    position: fixed;
    top: 0;
    width: 100%;
    background: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    z-index: 1000;
}

.header-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 0;
}

/* Logo */
.logo {
    display: flex;
    align-items: center;
    gap: 8px;
}

.logo-text {
    font-size: 24px;
    font-weight: 700;
    color: var(--text-primary);
}

/* Navigation */
.navbar ul {
    display: flex;
    gap: var(--spacing-md);
    list-style: none;
}

.nav-link-text {
    color: var(--text-primary);
    text-decoration: none;
    font-weight: 500;
}
```

### 4.4 响应式布局
- 当前阶段 **不需要复杂的响应式布局**
- 优先保证 **设计稿精准还原**
- 使用 Flexbox / Grid 进行布局
- 避免使用 `float`

```css
/* 推荐使用 Flexbox */
.product-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
}

/* 推荐使用 Grid */
.category-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
}
```

---

## 5. JavaScript 开发规范

### 5.1 ES6+ 开发标准
- **必须使用 ES6+ 语法**: `class`, `const/let`, 箭头函数, 解构赋值
- **禁止使用 `var`**
- **使用 `async/await` 处理异步操作**

### 5.2 面向对象编程（OOP）
所有功能模块必须使用 **类（Class）** 进行封装，体现：
- **单一职责原则**: 每个类只负责一个功能
- **低耦合**: 类之间依赖最小化
- **高复用性**: 类可独立使用

#### 类的设计规范
```javascript
/**
 * ClassName - 类的简要说明
 * 详细说明类的职责和使用方式
 */

class ClassName {
    // 1. 构造函数
    constructor(config) {
        this.property1 = config.property1;
        this.property2 = [];
        this.isInitialized = false;
    }

    // 2. 公共方法
    async init() {
        if (this.isInitialized) return;
        // 初始化逻辑
        this.isInitialized = true;
    }

    publicMethod() {
        // 公共方法逻辑
    }

    // 3. 私有方法（使用 _ 前缀表示）
    _privateMethod() {
        // 私有方法逻辑
    }

    // 4. 静态方法
    static staticMethod() {
        // 静态方法逻辑
    }
}
```

### 5.3 文件组织规范
每个 JavaScript 文件对应一个功能模块或一个 Section：

```
js/
├── main.js                     # 应用主入口，协调所有模块
├── component-loader.js         # 组件加载器（独立功能）
├── product-repository.js       # 产品仓库（数据中心）
├── product-data-loader.js      # 数据加载器
├── product-filter.js           # 产品筛选器
├── product-card-renderer.js    # 产品卡片渲染器
├── browse-range.js             # Browse Range Section
└── carousel.js                 # Carousel Section
```

### 5.4 代码示例：应用主入口
```javascript
/**
 * Furniro E-commerce - Main Application Controller
 * 应用主入口，负责协调所有模块的初始化
 */

class FurniroApp {
    constructor() {
        this.modules = {
            productRepository: null,
            carousel: null
        };
        this.config = {
            initialProductCount: 8,
            loadMoreCount: 8
        };
        this.isInitialized = false;
    }

    async init() {
        if (this.isInitialized) {
            console.warn('Application already initialized');
            return;
        }

        console.log('🚀 Initializing Furniro Application...');

        try {
            // 加载组件
            await this.loadComponents();

            // 初始化产品仓库
            await this.initProductRepository();

            // 初始化轮播图
            this.initCarousel();

            this.isInitialized = true;
            console.log('✓ Application initialized successfully');
        } catch (error) {
            console.error('✗ Error initializing application:', error);
        }
    }

    async loadComponents() {
        console.log('📦 Loading components...');
        await ComponentLoader.initCommonComponents();
    }

    async initProductRepository() {
        console.log('🛍️ Initializing product repository...');
        this.modules.productRepository = new ProductRepository();
        this.modules.productRepository.initRenderer('.product-grid');
        await this.modules.productRepository.loadInitialProducts(
            this.config.initialProductCount
        );
    }

    initCarousel() {
        console.log('🎠 Initializing carousel...');
        this.modules.carousel = new Carousel('.carousel-container');
        this.modules.carousel.init();
    }
}

// 应用启动
document.addEventListener('DOMContentLoaded', () => {
    const app = new FurniroApp();
    app.init();
});
```

### 5.5 代码示例：组件加载器
```javascript
/**
 * Component Loader
 * 动态加载 HTML 组件（Header、Footer 等）
 */

class ComponentLoader {
    /**
     * 加载单个组件
     * @param {string} componentName - 组件文件名（不含 .html）
     * @param {string} targetSelector - 目标容器选择器
     * @returns {Promise<void>}
     */
    static async loadComponent(componentName, targetSelector) {
        try {
            const response = await fetch(`/201-project/components/${componentName}.html`);

            if (!response.ok) {
                throw new Error(`Failed to load component: ${componentName}`);
            }

            const html = await response.text();
            const targetElement = document.querySelector(targetSelector);

            if (!targetElement) {
                throw new Error(`Target element not found: ${targetSelector}`);
            }

            targetElement.innerHTML = html;
            console.log(`✓ Component loaded: ${componentName}`);
        } catch (error) {
            console.error(`✗ Error loading component ${componentName}:`, error);
            throw error;
        }
    }

    /**
     * 加载多个组件（并行）
     * @param {Array<{name: string, target: string}>} components
     * @returns {Promise<void[]>}
     */
    static async loadComponents(components) {
        const loadPromises = components.map(component =>
            this.loadComponent(component.name, component.target)
        );
        return Promise.all(loadPromises);
    }

    /**
     * 初始化通用组件（Header + Footer）
     * @returns {Promise<void>}
     */
    static async initCommonComponents() {
        return this.loadComponents([
            { name: 'header', target: '#header-placeholder' },
            { name: 'footer', target: '#footer-placeholder' }
        ]);
    }
}
```

### 5.6 代码示例：产品仓库（数据管理中心）
```javascript
/**
 * Product Repository
 * 产品数据管理中心，协调数据加载、筛选、渲染
 */

class ProductRepository {
    constructor() {
        this.dataLoader = new ProductDataLoader();
        this.filter = new ProductFilter();
        this.renderer = null;
        this.currentProducts = [];
        this.displayedCount = 0;
    }

    /**
     * 初始化渲染器
     * @param {string} containerSelector - 产品容器选择器
     */
    initRenderer(containerSelector) {
        this.renderer = new ProductCardRenderer(containerSelector);
        console.log('✓ ProductRepository initialized');
    }

    /**
     * 加载初始产品
     * @param {number} initialCount - 初始加载数量
     * @returns {Promise<void>}
     */
    async loadInitialProducts(initialCount = 8) {
        try {
            const products = await this.dataLoader.loadWithLimit(initialCount, 0);
            this.currentProducts = products;
            this.displayedCount = products.length;

            if (this.renderer) {
                this.renderer.renderCards(products);
            }

            console.log(`✓ Loaded ${products.length} initial products`);
        } catch (error) {
            console.error('✗ Error loading initial products:', error);
        }
    }

    /**
     * 加载更多产品
     * @param {number} count - 加载数量
     * @returns {Promise<number>}
     */
    async loadMore(count = 8) {
        try {
            const newProducts = await this.dataLoader.loadWithLimit(
                count,
                this.displayedCount
            );

            this.currentProducts = [...this.currentProducts, ...newProducts];
            this.displayedCount += newProducts.length;

            if (this.renderer) {
                this.renderer.appendCards(newProducts);
            }

            console.log(`✓ Loaded ${newProducts.length} more products`);
            return newProducts.length;
        } catch (error) {
            console.error('✗ Error loading more products:', error);
            return 0;
        }
    }

    /**
     * 按类别筛选产品
     * @param {string} category - 产品类别
     * @returns {Promise<void>}
     */
    async filterByCategory(category) {
        try {
            const allProducts = await this.dataLoader.loadAllProducts();
            const filtered = this.filter.filterByCategory(allProducts, category);
            
            this.currentProducts = filtered;
            this.displayedCount = filtered.length;

            if (this.renderer) {
                this.renderer.renderCards(filtered);
            }

            console.log(`✓ Filtered ${filtered.length} products by category: ${category}`);
        } catch (error) {
            console.error('✗ Error filtering products:', error);
        }
    }
}
```

### 5.7 命名规范
- **类名**: `PascalCase` (如 `ProductRepository`)
- **方法名/变量名**: `camelCase` (如 `loadInitialProducts`)
- **常量**: `UPPER_SNAKE_CASE` (如 `MAX_PRODUCTS`)
- **私有方法**: `_camelCase` (如 `_privateMethod`)

### 5.8 注释规范
```javascript
/**
 * 函数/方法的简要说明
 * @param {type} paramName - 参数说明
 * @returns {type} 返回值说明
 */
```

---

## 6. 数据交互规范

### 6.1 JSON 文件结构
所有产品数据存储在 `/data/` 目录下，按类别分文件：

```
data/
├── chair.json      # 椅子类产品
├── table.json      # 桌子类产品
├── sofa.json       # 沙发类产品
└── lamp.json       # 灯具类产品
```

### 6.2 JSON 数据格式标准
```json
{
  "products": [
    {
      "name": "Product Name",
      "product_picture": "/201-project/images/products/Product Name.jpg",
      "description_picture": "/201-project/images/products/Product Name description.jpg",
      "brief": "产品简介",
      "detail": "产品详细描述",
      "description": "产品长描述",
      "price": 1850,
      "discount": "-20%",
      "size": {
        "Standard": "75 * 80 * 110"
      },
      "color": {
        "Navy Blue": "#000080",
        "Emerald Green": "#50C878"
      },
      "SKU": "CH001",
      "number_of_remain": 35,
      "launch_time": "18-01-2025",
      "category": "chair",
      "tags": "chair,living,home,shop,classic",
      "additional_information": "附加信息",
      "average_rate": 4.6,
      "review": {
        "ReviewerName": {
          "rate": 4.7,
          "comment": "评论内容"
        }
      }
    }
  ]
}
```

### 6.3 数据加载规范
- 使用 `fetch()` API 加载数据
- 所有数据加载必须异步处理（`async/await`）
- 错误处理必须完善

```javascript
class ProductDataLoader {
    async loadProductsByCategory(category) {
        try {
            const response = await fetch(`/201-project/data/${category}.json`);
            
            if (!response.ok) {
                throw new Error(`Failed to load ${category} data`);
            }

            const data = await response.json();
            return data.products;
        } catch (error) {
            console.error(`Error loading ${category} products:`, error);
            return [];
        }
    }
}
```

---

## 7. 组件化开发规范

### 7.1 组件分类
1. **全局组件**: Header、Footer（复用于所有页面）
2. **功能组件**: Product Card、Carousel、Filter（在特定 Section 中使用）

### 7.2 组件开发流程
1. **创建 HTML 组件文件** (`components/component-name.html`)
2. **创建对应 CSS 文件** (`css/component-name.css`)
3. **创建对应 JS 类** (`js/component-name.js`)
4. **通过 ComponentLoader 加载** 或直接实例化类

### 7.3 组件示例：Product Card
```html
<!-- components/product-card.html (可选，如果需要模板) -->
<div class="product-card" data-product-id="{{id}}">
    <div class="product-image-wrapper">
        <img src="{{image}}" alt="{{name}}" class="product-image">
        <div class="product-badge">{{discount}}</div>
    </div>
    <div class="product-info">
        <h3 class="product-name">{{name}}</h3>
        <p class="product-brief">{{brief}}</p>
        <div class="product-price">
            <span class="price-current">${{price}}</span>
            <span class="price-original">${{originalPrice}}</span>
        </div>
    </div>
</div>
```

```javascript
// js/product-card-renderer.js
class ProductCardRenderer {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
    }

    renderCards(products) {
        if (!this.container) return;
        
        this.container.innerHTML = '';
        products.forEach(product => {
            const card = this._createCard(product);
            this.container.appendChild(card);
        });
    }

    _createCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-image-wrapper">
                <img src="${product.product_picture}" alt="${product.name}">
                ${product.discount ? `<div class="product-badge">${product.discount}</div>` : ''}
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-brief">${product.brief}</p>
                <div class="product-price">
                    <span class="price-current">$${product.price}</span>
                </div>
            </div>
        `;
        return card;
    }
}
```

---

## 8. 文件路径规范

### 8.1 绝对路径规则
**所有资源引用必须使用绝对路径，以 `/201-project/` 开头**，确保项目上传 GitHub Pages 后正常运行。

#### ✅ 正确示例
```html
<!-- HTML 中的资源引用 -->
<link rel="stylesheet" href="/201-project/css/index.css">
<script src="/201-project/js/main.js"></script>
<img src="/201-project/images/hero.png" alt="Hero">
```

```javascript
// JavaScript 中的资源引用
fetch('/201-project/data/chair.json')
fetch('/201-project/components/header.html')
```

```css
/* CSS 中的资源引用 */
background-image: url('/201-project/images/hero.png');
```

```json
// JSON 中的资源引用
{
  "product_picture": "/201-project/images/products/Product Name.jpg"
}
```

#### ❌ 错误示例

```html
<!-- 禁止使用相对路径 -->
<link rel="stylesheet" href="css/main.css">
<link rel="stylesheet" href="../css/index.css">
<img src="images/hero.png" alt="Hero">
```

### 8.2 路径检查清单
在提交代码前，必须检查以下位置的路径：
- [ ] HTML `<link>` 标签
- [ ] HTML `<script>` 标签
- [ ] HTML `<img>` 标签
- [ ] CSS `url()` 引用
- [ ] JavaScript `fetch()` 调用
- [ ] JSON 文件中的图片路径

---

## 9. 命名规范

### 9.1 文件命名
| 类型 | 规范 | 示例 |
|------|------|------|
| HTML | kebab-case | `product-detail.html` |
| CSS | kebab-case | `browse-range.css` |
| JavaScript | kebab-case | `product-repository.js` |
| JSON | lowercase | `chair.json` |
| 图片（产品） | PascalCase + 描述 | `Asgaard sofa.jpg` |
| 图片（图标） | kebab-case | `shopping_cart.png` |

### 9.2 代码命名
| 类型 | 规范 | 示例 |
|------|------|------|
| 类名 | PascalCase | `ProductRepository` |
| 方法/函数 | camelCase | `loadInitialProducts()` |
| 变量 | camelCase | `currentProducts` |
| 常量 | UPPER_SNAKE_CASE | `MAX_PRODUCT_COUNT` |
| CSS 类 | kebab-case | `.product-card` |
| CSS BEM | block__element--modifier | `.card__title--large` |

### 9.3 语义化命名原则
- **名称应清晰表达意图**: `loadProducts()` 而非 `load()`
- **避免缩写**: `productRepository` 而非 `prodRepo`
- **布尔值使用 is/has 前缀**: `isInitialized`, `hasDiscount`

---

## 10. 代码组织与架构

### 10.1 分层架构
```
┌─────────────────────────────────────┐
│    Presentation Layer (HTML/CSS)   │  # 视图层
├─────────────────────────────────────┤
│    Application Layer (main.js)     │  # 应用层（协调器）
├─────────────────────────────────────┤
│    Business Logic Layer             │  # 业务逻辑层
│    - ProductRepository              │
│    - ProductFilter                  │
│    - Carousel                       │
├─────────────────────────────────────┤
│    Data Access Layer                │  # 数据访问层
│    - ProductDataLoader              │
│    - ComponentLoader                │
├─────────────────────────────────────┤
│    Data Layer (JSON Files)          │  # 数据层
└─────────────────────────────────────┘
```

### 10.2 职责划分示例
| 类名 | 职责 | 依赖 |
|------|------|------|
| `FurniroApp` | 应用主入口，协调所有模块 | 所有模块 |
| `ComponentLoader` | 加载 HTML 组件 | 无 |
| `ProductDataLoader` | 从 JSON 加载数据 | 无 |
| `ProductFilter` | 产品筛选逻辑 | 无 |
| `ProductCardRenderer` | 产品卡片渲染 | 无 |
| `ProductRepository` | 产品数据管理中心 | Loader, Filter, Renderer |
| `Carousel` | 轮播图功能 | 无 |
| `BrowseRange` | Browse Range 交互 | 无 |

### 10.3 模块依赖原则
- **高层模块不依赖低层模块**: `FurniroApp` 依赖 `ProductRepository`，但 `ProductRepository` 不依赖 `FurniroApp`
- **单向依赖**: 避免循环依赖
- **依赖注入**: 通过构造函数传递依赖

```javascript
// ✅ 推荐：依赖注入
class ProductRepository {
    constructor(dataLoader, filter, renderer) {
        this.dataLoader = dataLoader || new ProductDataLoader();
        this.filter = filter || new ProductFilter();
        this.renderer = renderer;
    }
}

// ❌ 避免：硬编码依赖
class ProductRepository {
    constructor() {
        this.dataLoader = new ProductDataLoader(); // 紧耦合
    }
}
```

---

## 📝 开发检查清单

### 提交代码前必须检查：
- [ ] 所有路径使用 `/201-project/` 绝对路径
- [ ] HTML 使用语义化标签
- [ ] CSS 按组件/Section 分文件
- [ ] JavaScript 使用 ES6+ 和 Class
- [ ] 每个类有明确的单一职责
- [ ] 所有异步操作使用 `async/await`
- [ ] 代码有适当的注释
- [ ] 组件可复用、低耦合
- [ ] JSON 数据格式符合规范
- [ ] 命名符合规范（kebab-case/camelCase/PascalCase）

---

## 🔧 开发工具推荐

### 浏览器
- Google Chrome / Microsoft Edge (开发者工具)

### 编辑器
- Visual Studio Code
- WebStorm

### 浏览器插件
- JSON Viewer
- Lighthouse (性能测试)

### 本地服务器
```bash
# Python
python -m http.server 8000

# Node.js (http-server)
npx http-server -p 8000

# VS Code 插件
Live Server
```

---

## 📚 参考资源

- **MDN Web Docs**: https://developer.mozilla.org/
- **ES6 规范**: https://es6.ruanyifeng.com/
- **CSS Grid 指南**: https://css-tricks.com/snippets/css/complete-guide-grid/
- **Flexbox 指南**: https://css-tricks.com/snippets/css/a-guide-to-flexbox/

---

## 🚀 快速开始

### 1. 克隆项目
```bash
git clone https://github.com/yourusername/201-project.git
cd 201-project
```

### 2. 启动本地服务器
```bash
python -m http.server 8000
```

### 3. 访问项目
```
http://localhost:8000/201-project/index.html
```

---

**版本**: 1.0.0  
**更新日期**: 2025-11-25  
**维护者**: Furniro Development Team

