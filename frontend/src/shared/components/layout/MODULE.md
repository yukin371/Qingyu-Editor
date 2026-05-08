# 布局组件 (Layout Components)

## 模块职责

提供应用级布局容器，包含顶部导航、主内容区、底部和移动端菜单。

## 数据流

1. **路由变化** → 更新 `activeMenu` 状态 → 高亮当前导航项
2. **用户登录** → 更新 `isLoggedIn` 和用户信息 → 显示用户头像/下拉菜单
3. **移动端菜单点击** → 设置 `drawerVisible` → 展开抽屉导航

## 约定&陷阱

### ⚠️ Element Plus 抽屉渲染陷阱（CRITICAL）

**问题**：`el-drawer` 若未正确配置，会被渲染到父容器内，受布局流影响导致定位错误（如被推到页面底部）。

**解决方案**：

```vue
<el-drawer
  v-model="drawerVisible"
  :append-to-body="true"   <!-- 必须：渲染到 body 下，避免父容器影响 -->
  :modal="false"           <!-- 推荐：不显示遮罩层 -->
  :z-index="9999"         <!-- 推荐：确保在最顶层 -->
  class="mobile-navigation-drawer"
>
```

**必须检查的配置**：

- ✅ `:append-to-body="true"` - **必须**，否则抽屉会被渲染在组件内
- ✅ 自定义样式确保 `position: fixed` 生效
- ✅ `z-index` 高于页面其他元素

### 导航组件区分

| 组件               | 用途                 | 位置                            |
| ------------------ | -------------------- | ------------------------------- |
| `MainLayout.vue`   | 书城、阅读等主要页面 | `src/shared/components/layout/` |
| `AdminLayout.vue`  | 后台管理页面         | `src/shared/components/layout/` |
| `WriterLayout.vue` | 创作中心页面         | `src/layouts/WriterLayout.vue`  |

**注意**：修改导航相关功能时，确认目标页面使用的是哪个布局组件！

### 移动端断点

- **隐藏桌面元素**: `md:hidden` (768px 以下隐藏)
- **隐藏移动端元素**: `hidden md:flex` (768px 以上显示)
- **抽屉触发**: 仅在移动端显示汉堡菜单图标

## 文档同步触发条件

- 修改导航菜单项时 → 更新 `menuItems` 数组
- 新增布局容器时 → 同步更新此文件的组件列表
- 修改抽屉/弹窗配置时 → 记录到"约定&陷阱"部分
