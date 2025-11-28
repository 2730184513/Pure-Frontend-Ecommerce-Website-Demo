# Cart Page 购物车页面模块 JavaScript 文件分析文档

> **目录位置**: `js/pages/cart/`
>  **生成时间**: 2025-11-28
>  **文件总数**: 4

------



## 📋 目录

1. [cart-manager.js - 购物车页面管理器](https://www.perplexity.ai/search/qing-ni-wei-wo-ji-yu-dang-qian-SLmgqV17SWaarIdhCKYLaQ#1-cart-managerjs---购物车页面管理器)
2. [cart-product-line-renderer.js - 购物车商品行渲染器](https://www.perplexity.ai/search/qing-ni-wei-wo-ji-yu-dang-qian-SLmgqV17SWaarIdhCKYLaQ#2-cart-product-line-rendererjs---购物车商品行渲染器)
3. [cart-summary-manager.js - 购物车摘要管理器](https://www.perplexity.ai/search/qing-ni-wei-wo-ji-yu-dang-qian-SLmgqV17SWaarIdhCKYLaQ#3-cart-summary-managerjs---购物车摘要管理器)
4. [cart-summary-carousel.js - 购物车摘要轮播](https://www.perplexity.ai/search/qing-ni-wei-wo-ji-yu-dang-qian-SLmgqV17SWaarIdhCKYLaQ#4-cart-summary-carouseljs---购物车摘要轮播)
5. [模块依赖关系图](https://www.perplexity.ai/search/qing-ni-wei-wo-ji-yu-dang-qian-SLmgqV17SWaarIdhCKYLaQ#模块依赖关系图)
6. [架构层次分析](https://www.perplexity.ai/search/qing-ni-wei-wo-ji-yu-dang-qian-SLmgqV17SWaarIdhCKYLaQ#架构层次分析)

------

## 1. cart-manager.js - 购物车页面管理器

## 核心功能

购物车页面的顶层控制器，协调商品行渲染和摘要管理。

## 主要类: `CartPageManager`

## 职责范围

- ✅ 协调子模块初始化
- ✅ 检测空购物车并重定向
- ✅ 监听购物车更新事件
- ✅ 刷新购物车显示

## 核心方法

| 方法名                   | 参数 | 功能描述                       |
| ------------------------ | ---- | ------------------------------ |
| `init()`                 | 无   | 初始化购物车页面               |
| `initializeComponents()` | 无   | 初始化商品行渲染器和摘要管理器 |
| `checkEmptyCart()`       | 无   | 检查购物车是否为空             |
| `refreshCart()`          | 无   | 刷新购物车显示                 |
| `setupEventListeners()`  | 无   | 设置购物车更新事件监听         |

## 初始化流程

获取全局购物车管理器实例，检查购物车是否为空。如果为空，设置 sessionStorage 标记 `cart_empty_redirect` 为 true 并重定向到 shop.html。如果不为空，初始化商品行渲染器和摘要管理器，然后设置事件监听器。

## 事件监听

监听全局 `cartUpdated` 事件，触发时调用 `refreshCart()` 方法重新渲染商品行和摘要。

## 依赖关系

**依赖的模块**

- `window.cartManager` - 全局购物车管理器
- `CartProductLineRenderer` - 商品行渲染器
- `CartSummaryManager` - 摘要管理器

------

## 2. cart-product-line-renderer.js - 购物车商品行渲染器

## 核心功能

渲染购物车商品列表，处理数量修改和商品删除。

## 主要类: `CartProductLineRenderer`

## 职责范围

- ✅ 渲染购物车商品列表
- ✅ 创建商品行 DOM 元素
- ✅ 处理数量增减
- ✅ 处理商品删除
- ✅ 处理数量输入框变化
- ✅ 图片懒加载

## 核心方法

| 方法名                                   | 参数                  | 功能描述               |
| ---------------------------------------- | --------------------- | ---------------------- |
| `init()`                                 | 无                    | 初始化渲染器并渲染商品 |
| `cacheDOM()`                             | 无                    | 缓存容器元素           |
| `render()`                               | 无                    | 渲染所有购物车商品     |
| `createProductLine(item)`                | `item`: 购物车商品    | 创建单个商品行元素     |
| `createImageSection(item)`               | `item`: 购物车商品    | 创建图片区域           |
| `createDetailsSection(item)`             | `item`: 购物车商品    | 创建详情区域           |
| `createQuantitySection(item)`            | `item`: 购物车商品    | 创建数量控制区域       |
| `createDeleteSection(item)`              | `item`: 购物车商品    | 创建删除按钮           |
| `handleQuantityChange(variantId, delta)` | `variantId, delta`    | 处理数量变化           |
| `handleQuantityInput(input, variantId)`  | `input, variantId`    | 处理输入框数量变化     |
| `handleDelete(variantId)`                | `variantId`: 变体ID   | 处理删除商品           |
| `lazyLoadImages(container)`              | `container`: 容器元素 | 懒加载商品图片         |
| `formatPrice(price)`                     | `price`: 价格         | 格式化价格显示         |
| `getColorName(hex)`                      | `hex`: 颜色代码       | 获取颜色名称           |

## 商品行创建

创建包含图片、详情、数量控制和删除按钮的商品行容器。详情部分包含商品名称、选中的尺寸和颜色、价格。颜色显示包含色块和颜色名称。

## 数量控制

数量输入框范围为 1-9999。点击增减按钮调用 `handleQuantityChange` 传入 +1 或 -1。输入框失焦时调用 `handleQuantityInput` 验证输入值并计算差值更新数量。

## 删除处理

显示确认对话框 "Are you sure you want to remove this item?"，用户确认后调用购物车管理器的 `removeProduct` 方法，传入 silent 参数为 false。

## 图片懒加载

查找所有带 `data-src` 属性的图片元素，使用占位图显示，异步加载实际图片，加载成功后替换 src。

## 价格格式化

使用 `toLocaleString('en-MY')` 格式化，添加千位分隔符和 RM 前缀。

## 依赖关系

**依赖的模块**

- `window.cartManager` - 全局购物车管理器

------

## 3. cart-summary-manager.js - 购物车摘要管理器

## 核心功能

管理购物车摘要的计算和显示。

## 主要类: `CartSummaryManager`

## 职责范围

- ✅ 计算购物车总价
- ✅ 更新摘要显示
- ✅ 处理结账按钮点击
- ✅ 初始化推荐商品轮播

## 核心方法

| 方法名                 | 参数          | 功能描述            |
| ---------------------- | ------------- | ------------------- |
| `init()`               | 无            | 初始化摘要管理器    |
| `cacheDOM()`           | 无            | 缓存摘要区域DOM元素 |
| `calculate()`          | 无            | 计算购物车总价      |
| `updateDisplay()`      | 无            | 更新摘要显示        |
| `bindCheckoutButton()` | 无            | 绑定结账按钮事件    |
| `handleCheckout()`     | 无            | 处理结账操作        |
| `formatPrice(price)`   | `price`: 价格 | 格式化价格显示      |

## 计算逻辑

遍历购物车商品数组，累加每个商品的价格乘以数量得到总价。

## 结账处理

检查 `window.navStateManager` 是否存在，如果存在调用 `markNavigationFromShop()` 方法保存导航状态。然后跳转到 `/201-project/pages/checkout.html`。

## 轮播初始化

检查 `window.CartSummaryCarousel` 是否存在，如果存在创建实例并调用 `init()` 方法。

## 依赖关系

**依赖的模块**

- `window.cartManager` - 全局购物车管理器
- `CartSummaryCarousel` - 推荐商品轮播（可选）
- `window.navStateManager` - 导航状态管理器（可选）

------

## 4. cart-summary-carousel.js - 购物车摘要轮播

## 核心功能

在购物车摘要区域显示推荐商品轮播，支持手动导航。

## 主要类: `CartSummaryCarousel`

## 职责范围

- ✅ 加载推荐商品数据
- ✅ 渲染轮播商品卡片
- ✅ 手动导航控制
- ✅ 处理添加到购物车

## 核心方法

| 方法名                               | 参数                | 功能描述             |
| ------------------------------------ | ------------------- | -------------------- |
| `init()`                             | 无                  | 初始化轮播组件       |
| `cacheDOM()`                         | 无                  | 缓存轮播相关DOM元素  |
| `bindEvents()`                       | 无                  | 绑定导航按钮事件     |
| `loadProducts()`                     | 无                  | 加载推荐商品数据     |
| `render()`                           | 无                  | 渲染当前商品卡片     |
| `createProductCard(product)`         | `product`: 商品对象 | 创建商品卡片元素     |
| `next()`                             | 无                  | 显示下一个商品       |
| `prev()`                             | 无                  | 显示上一个商品       |
| `handleAddToCart(product)`           | `product`: 商品对象 | 处理添加到购物车     |
| `formatPrice(price)`                 | `price`: 价格       | 格式化价格显示       |
| `getRandomProducts(products, count)` | `products, count`   | 随机选择指定数量商品 |

## 初始化流程

缓存 DOM 元素（轨道容器、上一个按钮、下一个按钮），绑定按钮点击事件，调用 `loadProducts()` 加载商品数据。

## 数据加载

创建 `ProductDataLoader` 实例，调用 `loadAll()` 加载所有商品数据，然后调用 `getRandomProducts()` 随机选择 5 个商品，最后调用 `render()` 渲染第一个商品。

## 随机选择

使用 `sort(() => Math.random() - 0.5)` 打乱商品数组顺序，然后使用 `slice(0, count)` 取前 N 个商品。

## 轮播渲染

清空轨道容器，根据当前索引获取商品，创建商品卡片并添加到轨道。

## 商品卡片创建

创建包含商品图片、名称、价格和"Add to Cart"按钮的卡片。价格显示使用折扣价（如果有）。按钮点击调用 `handleAddToCart`。

## 手动导航

点击"Next"按钮调用 `next()` 方法，索引加1并循环到开头。点击"Prev"按钮调用 `prev()` 方法，索引减1并循环到末尾。索引改变后重新渲染。

## 添加到购物车

构建包含默认变体信息的商品对象（使用第一个尺寸和颜色，数量为1），调用 `window.cartManager.addProduct()`，如果 `window.toast` 存在则显示成功提示。

## 依赖关系

**依赖的模块**

- `ProductDataLoader` - 商品数据加载器
- `window.cartManager` - 全局购物车管理器
- `window.toast` - 通知系统（可选）

------

## 模块依赖关系图

```
text┌─────────────────────────────────────────────────────────────┐
│                    CartPageManager                           │
│                 (Top-Level Controller)                       │
│                                                               │
│  ┌──────────────────────┐    ┌─────────────────────────┐   │
│  │ CartProductLine      │    │ CartSummaryManager      │   │
│  │ Renderer             │    │                         │   │
│  │                      │    │  ┌──────────────────┐   │   │
│  │• 商品行渲染          │    │  │ CartSummary      │   │   │
│  │• 数量控制            │    │  │ Carousel         │   │   │
│  │• 删除商品            │    │  │                  │   │   │
│  │• 图片懒加载          │    │  │• 推荐商品轮播    │   │   │
│  │                      │    │  │• 手动导航        │   │   │
│  └──────────────────────┘    │  └──────────────────┘   │   │
│         │                    │                         │   │
│         │                    │• 总价计算               │   │
│         │                    │• 结账按钮               │   │
│         │                    └─────────────────────────┘   │
│         │                              │                   │
│         └──────────┬───────────────────┘                   │
│                    ↓                                       │
│         window.cartManager (CartManager)                   │
└─────────────────────────────────────────────────────────────┘
```

------

## 架构层次分析

## 1. 控制层

- **CartPageManager**: 页面顶层控制器，协调渲染器和摘要管理器

## 2. 渲染层

- **CartProductLineRenderer**: 商品行渲染和交互处理
- **CartSummaryCarousel**: 推荐商品轮播渲染

## 3. 业务逻辑层

- **CartSummaryManager**: 总价计算和结账流程

## 4. 数据层

- **CartManager**: 购物车数据管理（全局组件）
- **ProductDataLoader**: 商品数据加载（用于轮播）

------

## 设计模式应用

## 1. Mediator 模式

CartPageManager 协调 CartProductLineRenderer 和 CartSummaryManager

## 2. Observer 模式

监听全局 `cartUpdated` 事件自动刷新页面

## 3. Lazy Loading 模式

商品图片使用懒加载提升性能

------

## 交互流程

## 页面初始化

1. CartPageManager 检查购物车是否为空
2. 初始化 CartProductLineRenderer 渲染商品列表
3. 初始化 CartSummaryManager 计算并显示总价
4. CartSummaryCarousel 加载并显示推荐商品

## 数量修改

1. 用户点击增减按钮或修改输入框
2. CartProductLineRenderer 调用全局 cartManager 更新数量
3. cartManager 触发 `cartUpdated` 事件
4. CartPageManager 刷新商品列表和摘要

## 轮播导航

1. 用户点击上一个/下一个按钮
2. CartSummaryCarousel 更新当前索引
3. 重新渲染当前商品卡片

## 结账

1. 用户点击结账按钮
2. 保存导航状态（如果状态管理器存在）
3. 跳转到结账页面

------

**文档版本**: 3.0
**最后更新**: 2025-11-28
**维护者**: AI Assistant