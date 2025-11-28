# Checkout Page 结账页模块 JavaScript 文件分析文档

> **目录位置**: `js/pages/checkout/`
> **生成时间**: 2025-11-28
> **文件总数**: 4

---

## 📋 目录

1. [checkout-summary-manager.js - 订单汇总逻辑](#1-checkout-summary-managerjs---订单汇总逻辑)
2. [checkout-summary-renderer.js - 订单汇总渲染](#2-checkout-summary-rendererjs---订单汇总渲染)
3. [form-manager.js - 表单管理器](#3-form-managerjs---表单管理器)
4. [location-data-service.js - 地址数据服务](#4-location-data-servicejs---地址数据服务)
5. [模块协作流程](#5-模块协作流程)

---

## 1. checkout-summary-manager.js - 订单汇总逻辑

### 核心功能
负责结账页面右侧 "Product Summary" 区域的**业务逻辑**。遵循单一职责原则，只处理数据和逻辑，不直接操作 DOM。

### 主要类: `CheckoutSummaryManager`

#### 职责范围
- ✅ 加载选中的结账商品 (从 `localStorage` 读取 `checkout_selected_items`)
- ✅ 计算金额 (小计、折扣、总计)
- ✅ 管理支付方式的选择状态
- ✅ 协调渲染器进行界面更新

#### 核心逻辑
- **数据加载**: 结合 `CartManager` 的购物车数据和 `localStorage` 中的选中 ID，筛选出当前要结账的商品。
- **金额计算**:
  - Subtotal: 现价 * 数量
  - Original Total: 原价 * 数量
  - Discount: Original Total - Subtotal
  - Grand Total: Subtotal

#### 依赖关系
- **依赖**: `CartManager` (获取商品详情)
- **依赖**: `CheckoutSummaryRenderer` (负责 UI 渲染)

---

## 2. checkout-summary-renderer.js - 订单汇总渲染

### 核心功能
负责结账页面右侧 "Product Summary" 区域的**UI 渲染**。

### 主要类: `CheckoutSummaryRenderer`

#### 职责范围
- ✅ 渲染商品列表 (图片懒加载、名称、变体、价格)
- ✅ 更新金额显示 (Subtotal, Total)
- ✅ 切换支付方式说明 (Bank Transfer / Cash On Delivery)
- ✅ 处理空状态

#### 渲染细节
- **图片懒加载**: 使用 `data-src` 机制，确保图片加载不阻塞页面渲染。
- **支付说明切换**: 根据选择的支付方式，动态显示/隐藏对应的说明文本。

---

## 3. form-manager.js - 表单管理器

### 核心功能
负责结账页面左侧 "Billing Details" 表单的**交互管理和验证**。这是一个复杂的表单控制器，集成了下拉搜索、级联选择和实时验证。

### 主要类: `FormManager`

#### 职责范围
- ✅ 初始化表单组件 (下拉框、验证器)
- ✅ 国家/省份级联选择逻辑
- ✅ 字段实时验证 (Focus, Blur, Input)
- ✅ 表单提交时的全量验证
- ✅ 收集表单数据

#### 核心交互
- **级联选择**:
  1. 用户选择国家 -> 触发 `handleCountrySelection`
  2. 调用 `LocationDataService` 获取对应省份
  3. 更新省份下拉框 (有数据则填充并启用，无数据则禁用并填 "Not applicable")
- **验证机制**:
  - 使用 `FieldValidator` (组件) 进行字段级验证。
  - 维护 `validators` Map 管理所有字段的验证状态。
  - 提交时滚动到第一个错误字段。

#### 依赖关系
- **依赖**: `LocationDataService` (获取地址数据)
- **依赖**: `FormRenderer` (表单 UI 操作)
- **依赖**: `SearchableDropdown` (自定义下拉组件)
- **依赖**: `FieldValidator` (验证逻辑)

---

## 4. location-data-service.js - 地址数据服务

### 核心功能
提供国家和省份数据的高性能查询服务。

### 主要类: `LocationDataService`

#### 职责范围
- ✅ 异步加载 `countries.json` 和 `states.json`
- ✅ 构建高性能索引 (首字母索引、国家-省份索引)
- ✅ 提供前缀搜索功能

#### 性能优化
- **首字母索引 (`countriesByFirstLetter`)**: 将国家按首字母分组，搜索时直接定位到对应分组，避免遍历整个数组。
- **Map 查找**: 使用 `Map` 存储国家-省份关系，实现 O(1) 复杂度的省份查找。

---

## 5. 模块协作流程

1. **页面初始化**:
   - `CheckoutManager` (主控) 初始化 `CheckoutSummaryManager` 和 `FormManager`。
   - `FormManager` 初始化 `LocationDataService` 并加载地址数据。

2. **显示订单汇总**:
   - `CheckoutSummaryManager` 从 `localStorage` 读取选中商品 ID。
   - 调用 `CartManager` 获取商品详情。
   - 计算金额。
   - 调用 `CheckoutSummaryRenderer` 渲染界面。

3. **填写表单**:
   - 用户输入国家 -> `FormManager` 调用 `LocationDataService` 搜索。
   - 用户选择国家 -> `FormManager` 更新省份下拉框。
   - 用户输入其他信息 -> `FormManager` 调用 `FieldValidator` 实时验证。

4. **提交订单**:
   - 用户点击 "Place Order"。
   - `FormManager.validateAll()` 执行全量验证。
   - 验证通过 -> 收集数据 -> 提交 (后续流程)。
