好的，让我严格按照实际JS代码内容重新撰写Shop页面的分析报告：

# Shop Page 商店页面模块 JavaScript 文件分析文档

> **目录位置**: `js/pages/shop/`
> **生成时间**: 2025-11-28
> **文件总数**: 7

***

## 📋 目录

1. [shop-manager.js - 商店页面管理器](#1-shop-managerjs---商店页面管理器)
2. [toolbar.js - 工具栏管理器](#2-toolbarjs---工具栏管理器)
3. [filter-sidebar.js - 过滤侧边栏](#3-filter-sidebarjs---过滤侧边栏)
4. [product-filter.js - 商品过滤器](#4-product-filterjs---商品过滤器)
5. [show-sort.js - 显示与排序管理器](#5-show-sortjs---显示与排序管理器)
6. [highlighting.js - 高亮管理器](#6-highlightingjs---高亮管理器)
7. [paging.js - 分页管理器](#7-pagingjs---分页管理器)
8. [模块依赖关系图](#模块依赖关系图)
9. [架构层次分析](#架构层次分析)

***

## 1. shop-manager.js - 商店页面管理器

### 核心功能
商店页面的顶层控制器，协调工具栏、高亮和分页管理器。

### 主要类: `ShopManager`

#### 职责范围
- ✅ 协调子模块初始化
- ✅ 执行过滤→排序→渲染管道
- ✅ 状态保存与恢复
- ✅ 搜索关键词管理
- ✅ 处理清空所有过滤器

#### 核心方法

| 方法名 | 参数 | 功能描述 |
|--------|------|----------|
| `init()` | 无 | 初始化商店页面 |
| `executePipeline()` | 无 | 执行过滤→排序→渲染管道 |
| `render(products)` | `products`: 商品数组 | 渲染商品卡片和分页 |
| `saveCurrentState()` | 无 | 保存当前商店状态 |
| `restoreState(state)` | `state`: 状态对象 | 恢复商店状态 |
| `handleClearAll()` | 无 | 处理清空所有过滤器 |
| `checkEmptyCartRedirect()` | 无 | 检查空购物车重定向标记 |

#### 初始化流程

检查是否需要恢复状态，获取搜索关键词和初始分类（从 localStorage）。初始化 ProductRepository 并加载数据。初始化 ToolbarManager、HighlightingManager 和 PagingManager。如果有保存的状态则恢复，否则应用初始过滤或执行管道。监听 `filterClearAll` 事件。检查空购物车重定向标记并显示提示。

#### 状态管理

状态对象包含搜索关键词、选中分类、价格范围、评分范围、日期范围、每页显示数量、排序配置和当前页码。状态保存到 NavigationStateManager。恢复时设置搜索关键词、过滤器、显示排序设置和当前页码，然后执行管道渲染。

#### 管道流程

获取所有商品，通过 ToolbarManager 应用过滤器得到过滤后的商品，再应用排序，最后调用 `render()` 渲染结果。

#### 渲染流程

获取每页显示数量，配置分页（总数、每页数量、当前页），获取当前页切片，更新结果文本，渲染商品卡片，应用搜索高亮（如果有关键词），渲染分页控件。

#### 清空所有

清空搜索关键词，重置显示排序设置，设置页面重置标志，执行管道，保存清空后的状态。

#### 依赖关系

**依赖的模块**
- `ProductRepository` - 商品仓储
- `ToolbarManager` - 工具栏管理器
- `HighlightingManager` - 高亮管理器
- `PagingManager` - 分页管理器
- `NavigationStateManager` - 导航状态管理器
- `ProductCardRenderer` - 商品卡片渲染器

***

## 2. toolbar.js - 工具栏管理器

### 核心功能
聚合过滤侧边栏、商品过滤器和显示排序管理器，提供统一接口。

### 主要类: `ToolbarManager`

#### 职责范围
- ✅ 聚合三个子模块
- ✅ 提供统一的配置接口
- ✅ 应用过滤和排序逻辑
- ✅ 更新过滤器计数显示

#### 核心方法

| 方法名 | 参数 | 功能描述 |
|--------|------|----------|
| `init(onChangeCallback)` | `onChangeCallback`: 变化回调 | 初始化所有子模块 |
| `getFilterConfig()` | 无 | 获取完整的过滤配置 |
| `getShowSortConfig()` | 无 | 获取显示和排序配置 |
| `applyFilters(products)` | `products`: 商品数组 | 应用过滤器 |
| `applySorting(products)` | `products`: 商品数组 | 应用排序 |
| `setSearchKeyword(keyword)` | `keyword`: 搜索关键词 | 设置搜索关键词 |
| `setCategory(category)` | `category`: 分类名 | 设置分类选择 |
| `updateFilterCount()` | 无 | 更新过滤器计数显示 |
| `getFilterSidebar()` | 无 | 获取过滤侧边栏实例 |
| `getShowSort()` | 无 | 获取显示排序实例 |

#### 初始化流程

创建 FilterSidebar 实例并传递 `onFilterChange` 回调（回调中更新计数并触发变化）。创建 ProductFilter 实例。创建 ShowSortManager 实例并传递变化回调。更新过滤器计数显示。

#### 过滤应用

获取过滤侧边栏的 UI 状态，将状态同步到 ProductFilter（设置分类、价格范围、评分范围、日期范围），调用 ProductFilter 的 `apply()` 方法返回过滤后的商品数组。

#### 排序应用

获取排序模式，如果是 'default' 直接返回原数组。解析排序字段和方向，根据字段类型排序：price 使用 `getEffectivePrice()` 获取折扣后价格，rate 使用 `average_rate`，name 转为小写字符串。

#### 过滤器计数更新

调用 FilterSidebar 的 `getActiveFilterCount()` 获取计数，更新按钮文本为 "Filter" 或 "Filter (N)"。

#### 依赖关系

**依赖的模块**
- `FilterSidebar` - 过滤侧边栏 UI
- `ProductFilter` - 商品过滤逻辑
- `ShowSortManager` - 显示排序管理

***

## 3. filter-sidebar.js - 过滤侧边栏

### 核心功能
过滤侧边栏的视图层，负责UI交互和状态收集。

### 主要类: `FilterSidebar`

#### 职责范围
- ✅ 侧边栏显示/隐藏控制
- ✅ 分类复选框管理
- ✅ 价格双滑块控制
- ✅ 评分双滑块控制
- ✅ 日期选择器管理
- ✅ Clear All 按钮
- ✅ 过滤器状态收集
- ✅ 状态恢复功能

#### 核心方法

| 方法名 | 参数 | 功能描述 |
|--------|------|----------|
| `init()` | 无 | 初始化侧边栏 |
| `cacheDOM()` | 无 | 缓存 DOM 元素 |
| `bindToggleEvents()` | 无 | 绑定侧边栏开关事件 |
| `bindCategoryEvents()` | 无 | 绑定分类复选框事件 |
| `initSliders()` | 无 | 初始化双滑块 |
| `setupDualSlider(config)` | `config`: 滑块配置 | 设置单个双滑块 |
| `initDatePickers()` | 无 | 初始化日期选择器 |
| `getFilterValues()` | 无 | 获取当前过滤器值 |
| `setCategorySelection(category)` | `category`: 分类名 | 设置分类选择 |
| `restoreCategories(categories)` | `categories`: 分类数组 | 恢复分类选择 |
| `restorePriceRange(min, max)` | `min, max` | 恢复价格范围 |
| `restoreRatingRange(min, max)` | `min, max` | 恢复评分范围 |
| `restoreDateRange(from, to)` | `from, to` | 恢复日期范围 |
| `getActiveFilterCount()` | 无 | 获取活动过滤器数量 |
| `bindClearAllButton()` | 无 | 绑定清空按钮 |
| `clearAll()` | 无 | 清空所有过滤器 |
| `triggerChange()` | 无 | 触发变化回调 |

#### 侧边栏切换

点击切换按钮时，切换布局容器的 `sidebar-open` 类，同时切换图标（filter.png ↔ arrow-left.png）。

#### 双滑块系统

价格滑块范围 0-10000，评分滑块范围 0-5。最小间隔为最大值的 5%。滑块和输入框双向绑定。滑块移动或输入框改变时更新轨道视觉（渐变色背景），触发变化回调。

#### 日期选择器

输入框默认为 text 类型。获得焦点时切换为 date 类型并尝试调用 `showPicker()`。失去焦点时如果无值恢复为 text 类型。阻止事件冒泡避免影响其他元素。

#### 过滤器值收集

返回对象包含：选中的分类数组、价格范围对象、评分范围对象、日期范围对象。

#### 状态恢复

`restoreCategories()` 先取消所有复选框，再勾选指定分类。`restorePriceRange()` 和 `restoreRatingRange()` 设置滑块和输入框值，并更新轨道视觉。`restoreDateRange()` 设置日期输入框的类型和值。

#### 活动过滤器计数

计算规则：每个选中分类 +1，价格最小值 > 0 +1，价格最大值 < 10000 +1，评分最小值 > 0 +1，评分最大值 < 5 +1，日期起始已设置 +1，日期结束已设置 +1。

#### 清空所有

取消所有分类复选框，重置价格范围为 0-10000，重置评分范围为 0-5，清空日期输入框，清空搜索输入框（如果存在），分发 `filterClearAll` 事件，显示成功提示（如果 toast 存在），触发变化回调。

#### 依赖关系

**依赖的模块**
- 无外部依赖

**分发的事件**
- `filterClearAll` - 清空所有过滤器事件

***

## 4. product-filter.js - 商品过滤器

### 核心功能
商品过滤的纯逻辑层，不涉及 UI。

### 主要类: `ProductFilter`

#### 职责范围
- ✅ 关键词过滤
- ✅ 分类过滤
- ✅ 价格范围过滤
- ✅ 评分范围过滤
- ✅ 日期范围过滤
- ✅ 链式调用 API

#### 核心方法

| 方法名 | 参数 | 功能描述 |
|--------|------|----------|
| `reset()` | 无 | 重置所有过滤条件 |
| `setKeyword(keyword)` | `keyword`: 搜索关键词 | 设置关键词过滤 |
| `setCategories(categories)` | `categories`: 分类数组 | 设置分类过滤 |
| `setPriceRange(min, max)` | `min, max` | 设置价格范围 |
| `setRatingRange(min, max)` | `min, max` | 设置评分范围 |
| `setDateRange(from, to)` | `from, to` | 设置日期范围 |
| `apply(products)` | `products`: 商品数组 | 应用所有过滤条件 |
| `getEffectivePrice(product)` | `product`: 商品对象 | 计算折扣后价格 |
| `_checkKeyword(product)` | `product`: 商品对象 | 检查关键词匹配 |
| `_checkPrice(product)` | `product`: 商品对象 | 检查价格范围 |
| `_checkRating(product)` | `product`: 商品对象 | 检查评分范围 |
| `_checkDate(product)` | `product`: 商品对象 | 检查日期范围 |

#### 过滤器状态

默认状态：keyword 空字符串，categories 空数组，priceRange {min: 0, max: Infinity}，ratingRange {min: 0, max: 5}，dateRange {from: null, to: null}。

#### 过滤逻辑

所有 setter 方法返回 this 支持链式调用。`apply()` 方法对商品数组使用 filter，依次检查关键词、分类、价格、评分、日期，全部通过才返回 true。

#### 关键词检查

将关键词和商品的 name、brief、tags 转为小写，检查是否包含关键词。

#### 价格检查

使用 `getEffectivePrice()` 计算折扣后价格，检查是否在范围内。折扣价格计算：解析 discount 字符串中的百分比，计算 `price * (1 - percent / 100)` 并四舍五入。

#### 评分检查

获取 average_rate 字段（默认0），检查是否在范围内。

#### 日期检查

解析 launch_time 字段（格式 dd-mm-yyyy），创建 Date 对象时月份减1。分别检查 from 和 to 边界，时间设置为 00:00:00。

#### 依赖关系

**依赖的模块**
- 无外部依赖

***

## 5. show-sort.js - 显示与排序管理器

### 核心功能
管理每页显示数量和排序方式两个下拉菜单。

### 主要类: `ShowSortManager`

#### 职责范围
- ✅ 每页显示数量选择
- ✅ 排序方式选择
- ✅ 三态循环排序
- ✅ 下拉菜单交互

#### 核心方法

| 方法名 | 参数 | 功能描述 |
|--------|------|----------|
| `init(onChangeCallback)` | `onChangeCallback`: 变化回调 | 初始化控件 |
| `bindShowPerPageEvents()` | 无 | 绑定显示数量下拉菜单事件 |
| `bindSortDropdownEvents()` | 无 | 绑定排序下拉菜单事件 |
| `handleShowChange(value, element)` | `value, element` | 处理显示数量变化 |
| `handleCustomSort(key, element)` | `key, element` | 处理排序选项点击 |
| `updateSortVisuals(key, state, element)` | `key, state, element` | 更新排序视觉状态 |
| `getItemsPerPage()` | 无 | 获取每页显示数量 |
| `getSortMode()` | 无 | 获取排序模式字符串 |
| `getConfig()` | 无 | 获取配置对象 |
| `setItemsPerPage(value)` | `value`: 数量 | 设置显示数量 |
| `setSorting(key, order)` | `key, order` | 设置排序 |
| `resetSort()` | 无 | 重置排序为默认 |
| `resetToDefaults()` | 无 | 重置所有为默认 |
| `capitalize(s)` | `s`: 字符串 | 首字母大写 |
| `triggerChange()` | 无 | 触发变化回调 |

#### 初始状态

itemsPerPage 默认 16，sortMode 默认 'default'，sortState 对象 {name: 0, price: 0, rate: 0}。

#### 显示数量控制

支持选项：16、32、64、128。点击下拉框切换 open 类，点击选项更新 itemsPerPage，更新标签文本和 active 状态，触发变化回调。点击外部关闭下拉框。

#### 排序控制

支持字段：name、price、rate。三态循环：0（默认）→ 1（升序）→ 2（降序）→ 0。点击选项时重置其他键状态，循环当前键状态，更新视觉和 sortMode。

#### 排序视觉更新

重置所有选项的 active 类和图标。State 1（升序）：sortMode 为 `{key}-asc`，添加 active 类，图标显示 ↑，标签显示 "{Key} (Asc)"。State 2（降序）：sortMode 为 `{key}-desc`，添加 active 类，图标显示 ↓，标签显示 "{Key} (Desc)"。State 0（默认）：sortMode 为 'default'，标签显示 "Default"。

#### 配置接口

`getConfig()` 返回 {itemsPerPage, sortMode}。`getShowSortConfig()` 解析 sortMode 为 {key, order} 对象。

#### 程序化设置

`setItemsPerPage()` 更新 itemsPerPage 和 UI 标签及 active 状态。`setSorting()` 设置排序状态并更新视觉。`resetToDefaults()` 重置 itemsPerPage 为 16，重置排序，触发变化。

#### 依赖关系

**依赖的模块**
- 无外部依赖

***

## 6. highlighting.js - 高亮管理器

### 核心功能
管理商品卡片中搜索关键词的高亮显示。

### 主要类: `HighlightingManager`

#### 职责范围
- ✅ 设置搜索关键词
- ✅ 高亮商品卡片
- ✅ 移除高亮
- ✅ 正则转义

#### 核心方法

| 方法名 | 参数 | 功能描述 |
|--------|------|----------|
| `setKeyword(keyword)` | `keyword`: 关键词 | 设置关键词 |
| `highlightCard(card, keyword)` | `card, keyword` | 高亮单个卡片 |
| `highlightCards(cards, keyword)` | `cards, keyword` | 高亮多个卡片 |
| `highlightInContainer(containerSelector, keyword)` | `containerSelector, keyword` | 高亮容器内所有卡片 |
| `removeHighlightFromCard(card)` | `card`: 卡片元素 | 移除单个卡片高亮 |
| `removeHighlightsFromCards(cards)` | `cards`: 卡片数组 | 移除多个卡片高亮 |
| `clear()` | 无 | 清空关键词 |
| `escapeRegex(string)` | `string`: 字符串 | 转义正则特殊字符 |

#### 高亮逻辑

使用关键词（可选参数覆盖实例关键词）创建不区分大小写的正则表达式。查找卡片中的 `.product-name` 和 `.product-desc` 元素，用正则替换匹配文本为 `<span class="highlight-red">$1</span>`。

#### 容器高亮

查找容器中所有 `.product-card` 元素，遍历调用 `highlightCard()`。

#### 移除高亮

查找卡片中所有 `.highlight-red` 元素，用文本节点替换 span 元素，调用 `normalize()` 合并文本节点。

#### 正则转义

替换字符串中的正则特殊字符：`.*+?^${}()|[\]\\`。

#### 依赖关系

**依赖的模块**
- 无外部依赖

***

## 7. paging.js - 分页管理器

### 核心功能
管理分页控件和分页逻辑。

### 主要类: `PagingManager`

#### 职责范围
- ✅ 分页配置管理
- ✅ 当前页跟踪
- ✅ 页码切片计算
- ✅ 分页控件渲染
- ✅ 页码按钮生成

#### 核心方法

| 方法名 | 参数 | 功能描述 |
|--------|------|----------|
| `init(onPageChangeCallback)` | `onPageChangeCallback`: 回调 | 初始化分页管理器 |
| `setConfig(totalItems, itemsPerPage, currentPage)` | 总数、每页数、当前页 | 设置分页配置 |
| `getCurrentPage()` | 无 | 获取当前页码 |
| `setCurrentPage(page)` | `page`: 页码 | 设置当前页码 |
| `getPageSlice()` | 无 | 获取当前页切片索引 |
| `getDisplayText()` | 无 | 获取结果显示文本 |
| `render(containerSelector)` | `containerSelector`: 容器选择器 | 渲染分页控件 |
| `getPageRange()` | 无 | 获取显示的页码范围 |
| `createButton(text, page, isActive)` | 文本、页码、是否激活 | 创建页码按钮 |
| `createIconButton(type, page)` | 类型、页码 | 创建图标按钮 |
| `triggerPageChange()` | 无 | 触发页面变化回调 |
| `reset()` | 无 | 重置到第一页 |

#### 配置参数

currentPage 默认 1，totalPages 默认 1，totalItems 默认 0，itemsPerPage 默认 16。

#### 配置设置

`setConfig()` 设置 totalItems 和 itemsPerPage，计算 totalPages，确保 currentPage 在有效范围内。

#### 页码切片

计算起始索引 `(currentPage - 1) * itemsPerPage`，结束索引 `start + itemsPerPage`，返回 {start, end} 对象用于数组切片。

#### 显示文本

总数为 0 返回 "Showing 0 results"。否则计算显示范围，返回 "Showing {start}–{end} of {total} results"。

#### 页码范围算法

delta 值为 2（当前页前后显示2页）。遍历所有页码，保留第一页、最后页、当前页前后 delta 范围内的页码。其他位置插入省略号（避免连续省略号）。

#### 分页渲染

总页数 ≤ 1 不显示分页。添加上一页按钮（如果不是第一页）。遍历页码范围，省略号显示为 span 元素，页码显示为按钮。添加下一页按钮（如果不是最后页）。

#### 按钮创建

页码按钮：非激活状态绑定点击事件，调用 `setCurrentPage()` 并平滑滚动到顶部。图标按钮：使用 left.png 或 right.png 图标，绑定相同的点击事件。

#### 页面切换

`setCurrentPage()` 限制页码在有效范围内，如果改变则更新 currentPage 并触发回调。

#### 依赖关系

**依赖的模块**
- 无外部依赖

***

## 模块依赖关系图

```
┌─────────────────────────────────────────────────────────────┐
│                      ShopManager                             │
│                 (Top-Level Controller)                       │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ToolbarManager│  │Highlighting  │  │ PagingManager    │  │
│  │              │  │Manager       │  │                  │  │
│  │              │  └──────────────┘  └──────────────────┘  │
│  │              │                                           │
│  │  ┌─────────┐ │                                           │
│  │  │Filter   │ │                                           │
│  │  │Sidebar  │ │                                           │
│  │  └─────────┘ │                                           │
│  │  ┌─────────┐ │                                           │
│  │  │Product  │ │                                           │
│  │  │Filter   │ │                                           │
│  │  └─────────┘ │                                           │
│  │  ┌─────────┐ │                                           │
│  │  │ShowSort │ │                                           │
│  │  │Manager  │ │                                           │
│  │  └─────────┘ │                                           │
│  └──────────────┘                                           │
│         │                                                    │
│         ↓                                                    │
│  ProductRepository                                           │
└─────────────────────────────────────────────────────────────┘
```

***

## 架构层次分析

### 1. 控制层
- **ShopManager**: 页面顶层控制器

### 2. 聚合层
- **ToolbarManager**: 工具栏聚合器

### 3. 视图层
- **FilterSidebar**: 过滤器 UI
- **ShowSortManager**: 显示排序 UI
- **PagingManager**: 分页 UI

### 4. 逻辑层
- **ProductFilter**: 过滤逻辑
- **HighlightingManager**: 高亮逻辑

### 5. 数据层
- **ProductRepository**: 商品数据管理
- **NavigationStateManager**: 状态持久化

***

## 设计模式应用

### 1. Facade 模式
ToolbarManager 为复杂的过滤、显示、排序系统提供简单接口

### 2. Mediator 模式
ShopManager 协调多个子模块之间的交互

### 3. Strategy 模式
排序策略（名称、价格、评分）

### 4. Observer 模式
onChange 回调机制

### 5. Memento 模式
状态保存与恢复

***

## 交互流程

### 页面初始化
1. ShopManager 检查状态恢复需求
2. 加载商品数据
3. 初始化工具栏、高亮、分页管理器
4. 恢复状态或执行管道

### 过滤排序
1. 用户修改过滤器或排序
2. 触发 ToolbarManager 的 onChange 回调
3. ShopManager 执行管道
4. 重新渲染商品和分页

### 分页
1. 用户点击页码按钮
2. PagingManager 更新当前页
3. 触发 onPageChange 回调
4. ShopManager 执行管道（不重置页码）

### 清空所有
1. 用户点击 Clear All
2. FilterSidebar 分发 filterClearAll 事件
3. ShopManager 处理清空逻辑
4. 执行管道刷新显示

***

**文档版本**: 3.0  
**最后更新**: 2025-11-28  
**维护者**: AI Assistant