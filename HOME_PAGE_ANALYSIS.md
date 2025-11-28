好的，让我严格按照实际JS代码内容重新撰写Home页面的分析报告：

# Home Page 首页模块 JavaScript 文件分析文档

> **目录位置**: `js/pages/home/`
> **生成时间**: 2025-11-28
> **文件总数**: 3

***

## 📋 目录

1. [home-manager.js - 首页管理器](#1-home-managerjs---首页管理器)
2. [carousel.js - 轮播图管理器](#2-carouseljs---轮播图管理器)
3. [browse-range.js - 浏览范围管理器](#3-browse-rangejs---浏览范围管理器)
4. [模块依赖关系图](#模块依赖关系图)
5. [架构层次分析](#架构层次分析)

***

## 1. home-manager.js - 首页管理器

### 核心功能
首页的顶层控制器，协调轮播图和浏览范围组件。

### 主要类: `HomeManager`

#### 职责范围
- ✅ 协调子模块初始化
- ✅ 加载商品数据
- ✅ 初始化轮播图
- ✅ 初始化浏览范围

#### 核心方法

| 方法名 | 参数 | 功能描述 |
|--------|------|----------|
| `init()` | 无 | 初始化首页 |
| `initializeComponents()` | 无 | 初始化轮播图和浏览范围组件 |

#### 初始化流程

创建 ProductRepository 实例并调用 `loadAll()` 加载所有商品数据。加载完成后调用 `initializeComponents()` 初始化子组件。初始化 Carousel 实例并调用 `init()`。初始化 BrowseRangeManager 实例并调用 `init()`。

#### 依赖关系

**依赖的模块**
- `ProductRepository` - 商品仓储
- `Carousel` - 轮播图管理器
- `BrowseRangeManager` - 浏览范围管理器

***

## 2. carousel.js - 轮播图管理器

### 核心功能
管理首页Hero区域的产品轮播图，支持自动播放和手动导航。

### 主要类: `Carousel`

#### 职责范围
- ✅ 加载轮播商品数据
- ✅ 渲染轮播幻灯片
- ✅ 自动播放控制
- ✅ 手动导航控制
- ✅ 指示器更新

#### 核心方法

| 方法名 | 参数 | 功能描述 |
|--------|------|----------|
| `init()` | 无 | 初始化轮播图 |
| `cacheDOM()` | 无 | 缓存DOM元素 |
| `bindEvents()` | 无 | 绑定导航和指示器事件 |
| `loadProducts()` | 无 | 加载轮播商品数据 |
| `render()` | 无 | 渲染所有幻灯片 |
| `createSlide(product, index)` | `product, index` | 创建单个幻灯片 |
| `showSlide(index)` | `index`: 幻灯片索引 | 显示指定幻灯片 |
| `nextSlide()` | 无 | 显示下一个幻灯片 |
| `prevSlide()` | 无 | 显示上一个幻灯片 |
| `startAutoPlay()` | 无 | 开始自动播放 |
| `stopAutoPlay()` | 无 | 停止自动播放 |
| `updateIndicators()` | 无 | 更新指示器状态 |
| `formatPrice(price)` | `price`: 价格 | 格式化价格显示 |

#### 配置参数

autoPlayInterval 为 5000 毫秒（5秒），maxSlides 为 5。

#### 初始化流程

缓存DOM元素（轮播容器、轨道、上一个/下一个按钮、指示器容器）。调用 `loadProducts()` 加载商品数据。绑定导航按钮和指示器点击事件。绑定容器的鼠标进入/离开事件（暂停/恢复自动播放）。

#### 数据加载

创建 ProductDataLoader 实例，调用 `loadAll()` 加载所有商品数据。随机选择5个商品（使用 `sort(() => 0.5 - Math.random()).slice(0, 5)`）。调用 `render()` 渲染幻灯片，显示第一个幻灯片，开始自动播放。

#### 幻灯片创建

创建幻灯片容器，包含背景图片、内容区域（标题、描述、价格、Shop Now按钮）。价格显示折扣价（如果有）。按钮点击跳转到 `/201-project/pages/shop.html`。为第一个幻灯片添加 active 类。

#### 幻灯片切换

`showSlide()` 限制索引范围，移除所有幻灯片的 active 类，为指定索引添加 active 类，更新 currentIndex，更新指示器。

#### 自动播放

使用 setInterval 每5秒调用 `nextSlide()`。鼠标进入容器时调用 `stopAutoPlay()`，离开时调用 `startAutoPlay()`。

#### 手动导航

点击上一个按钮调用 `prevSlide()`，索引减1并循环。点击下一个按钮调用 `nextSlide()`，索引加1并循环。点击指示器直接跳转到对应幻灯片。

#### 指示器更新

清空指示器容器，根据幻灯片数量创建指示器点，为当前索引添加 active 类，绑定点击事件。

#### 价格格式化

使用 `toLocaleString('en-MY')` 格式化，添加千位分隔符和 RM 前缀。如果有折扣显示折扣价，否则显示原价。

#### 依赖关系

**依赖的模块**
- `ProductDataLoader` - 商品数据加载器

***

## 3. browse-range.js - 浏览范围管理器

### 核心功能
管理首页"Browse The Range"区域，显示产品分类卡片。

### 主要类: `BrowseRangeManager`

#### 职责范围
- ✅ 加载分类数据
- ✅ 渲染分类卡片
- ✅ 处理分类点击跳转

#### 核心方法

| 方法名 | 参数 | 功能描述 |
|--------|------|----------|
| `init()` | 无 | 初始化浏览范围组件 |
| `cacheDOM()` | 无 | 缓存DOM元素 |
| `loadCategories()` | 无 | 加载分类数据 |
| `render()` | 无 | 渲染分类卡片 |
| `createCategoryCard(category)` | `category`: 分类对象 | 创建分类卡片 |
| `handleCategoryClick(categoryName)` | `categoryName`: 分类名 | 处理分类点击 |

#### 分类数据

分类数组包含：Dining（餐厅家具）、Living（客厅家具）、Bedroom（卧室家具）。每个分类包含 name、image 和 description 字段。

#### 初始化流程

缓存容器元素 `#browse-range-container`。调用 `loadCategories()` 设置分类数据。调用 `render()` 渲染分类卡片。

#### 分类卡片创建

创建卡片容器，包含分类图片、分类名称和描述。绑定点击事件调用 `handleCategoryClick()`。

#### 分类点击处理

将分类名称保存到 localStorage（键名 `shop_filter_category`）。跳转到 `/201-project/pages/shop.html`。商店页面会读取 localStorage 并应用分类过滤。

#### 依赖关系

**依赖的模块**
- 无外部依赖

***

## 模块依赖关系图

```
┌─────────────────────────────────────────────────────────────┐
│                      HomeManager                             │
│                 (Top-Level Controller)                       │
│                                                               │
│  ┌──────────────┐                  ┌──────────────────────┐ │
│  │  Carousel    │                  │ BrowseRangeManager   │ │
│  │              │                  │                      │ │
│  │• 轮播幻灯片  │                  │• 分类卡片渲染        │ │
│  │• 自动播放    │                  │• 分类点击跳转        │ │
│  │• 手动导航    │                  │                      │ │
│  │• 指示器      │                  │                      │ │
│  └──────────────┘                  └──────────────────────┘ │
│         │                                                    │
│         ↓                                                    │
│  ProductDataLoader                                           │
└─────────────────────────────────────────────────────────────┘
```

***

## 架构层次分析

### 1. 控制层
- **HomeManager**: 页面顶层控制器

### 2. 渲染层
- **Carousel**: 轮播图渲染和交互
- **BrowseRangeManager**: 分类卡片渲染和交互

### 3. 数据层
- **ProductDataLoader**: 商品数据加载
- **ProductRepository**: 商品数据管理

***

## 设计模式应用

### 1. Mediator 模式
HomeManager 协调 Carousel 和 BrowseRangeManager

### 2. Observer 模式
鼠标进入/离开事件控制自动播放

***

## 交互流程

### 页面初始化
1. HomeManager 加载商品数据
2. 初始化 Carousel 加载轮播商品并开始自动播放
3. 初始化 BrowseRangeManager 渲染分类卡片

### 轮播交互
1. 每5秒自动切换到下一个幻灯片
2. 用户点击导航按钮手动切换
3. 用户点击指示器直接跳转
4. 鼠标悬停时暂停自动播放

### 分类跳转
1. 用户点击分类卡片
2. 保存分类名到 localStorage
3. 跳转到商店页面
4. 商店页面应用分类过滤

***

**文档版本**: 2.0  
**最后更新**: 2025-11-28  
**维护者**: AI Assistant