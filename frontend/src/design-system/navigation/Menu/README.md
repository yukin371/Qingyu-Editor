# Menu 菜单组件

为页面和功能提供导航的菜单列表，支持水平/垂直模式、子菜单嵌套、折叠等多种功能。

## 功能特性

- 水平/垂直两种模式
- 支持多级子菜单嵌套
- 折叠模式（仅垂直菜单）
- 手风琴模式（只保持一个子菜单展开）
- 菜单分组
- 图标支持
- 禁用状态
- 自定义主题色

## 基础用法

### 垂直菜单

```vue
<Menu default-active="1">
  <MenuItem index="1">首页</MenuItem>
  <MenuItem index="2">用户管理</MenuItem>
  <MenuItem index="3">系统设置</MenuItem>
</Menu>
```

### 水平菜单

```vue
<Menu mode="horizontal" default-active="1">
  <MenuItem index="1">首页</MenuItem>
  <MenuItem index="2">产品中心</MenuItem>
  <MenuItem index="3">解决方案</MenuItem>
  <MenuItem index="4">关于我们</MenuItem>
</Menu>
```

## 带图标的菜单

使用 `icon` 插槽可以添加图标。

```vue
<Menu default-active="1">
  <MenuItem index="1">
    <template #icon>
      <HomeIcon />
    </template>
    首页
  </MenuItem>
  <MenuItem index="2">
    <template #icon>
      <UserIcon />
    </template>
    用户管理
  </MenuItem>
</Menu>
```

## 子菜单

使用 `MenuSub` 组件创建子菜单。

```vue
<Menu default-active="1" default-openeds=["2"]>
  <MenuItem index="1">首页</MenuItem>
  <MenuSub index="2">
    <template #title>产品中心</template>
    <MenuItem index="2-1">产品列表</MenuItem>
    <MenuItem index="2-2">产品分类</MenuItem>
    <MenuItem index="2-3">产品标签</MenuItem>
  </MenuSub>
</Menu>
```

## 多级嵌套

支持多级菜单嵌套。

```vue
<Menu default-active="1">
  <MenuItem index="1">首页</MenuItem>
  <MenuSub index="2">
    <template #title>系统管理</template>
    <MenuItem index="2-1">用户管理</MenuItem>
    <MenuSub index="2-2">
      <template #title>权限管理</template>
      <MenuItem index="2-2-1">角色管理</MenuItem>
      <MenuItem index="2-2-2">权限分配</MenuItem>
    </MenuSub>
  </MenuSub>
</Menu>
```

## 折叠模式

垂直菜单支持折叠模式。

```vue
<Menu mode="vertical" collapse>
  <MenuItem index="1">
    <template #icon>
      <HomeIcon />
    </template>
    首页
  </MenuItem>
  <MenuItem index="2">
    <template #icon>
      <UserIcon />
    </template>
    用户管理
  </MenuItem>
</Menu>
```

## 手风琴模式

设置 `unique-opened` 属性，只保持一个子菜单展开。

```vue
<Menu unique-opened>
  <MenuSub index="2">
    <template #title>系统管理</template>
    <MenuItem index="2-1">用户管理</MenuItem>
  </MenuSub>
  <MenuSub index="3">
    <template #title>业务管理</template>
    <MenuItem index="3-1">订单管理</MenuItem>
  </MenuSub>
</Menu>
```

## 菜单分组

使用 `MenuItemGroup` 组件对菜单项进行分组。

```vue
<Menu default-active="1">
  <MenuItem index="1">首页</MenuItem>
  <MenuItemGroup title="系统管理">
    <MenuItem index="2-1">用户管理</MenuItem>
    <MenuItem index="2-2">角色管理</MenuItem>
  </MenuItemGroup>
  <MenuItemGroup title="业务管理">
    <MenuItem index="3-1">订单管理</MenuItem>
    <MenuItem index="3-2">客户管理</MenuItem>
  </MenuItemGroup>
</Menu>
```

## 禁用状态

菜单项可以设置禁用状态。

```vue
<Menu default-active="1">
  <MenuItem index="1">正常菜单项</MenuItem>
  <MenuItem index="2" :disabled="true">禁用菜单项</MenuItem>
</Menu>
```

## 自定义主题

支持自定义背景色、文字颜色和激活文字颜色。

```vue
<Menu
  background-color="#1e293b"
  text-color="#f1f5f9"
  active-text-color="#60a5fa"
>
  <MenuItem index="1">自定义主题</MenuItem>
</Menu>
```

## 事件

```vue
<Menu
  @select="handleSelect"
  @open="handleOpen"
  @close="handleClose"
>
  <MenuItem index="1">菜单项</MenuItem>
</Menu>
```

### 事件说明

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| select | 菜单激活时触发 | index: 菜单项索引, indexPath: 菜单项路径 |
| open | 子菜单展开时触发 | index: 子菜单索引 |
| close | 子菜单收起时触发 | index: 子菜单索引 |

## API

### Menu Props

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| mode | `'vertical' \| 'horizontal'` | `'vertical'` | 菜单模式 |
| default-active | `string` | `''` | 默认激活的菜单项 |
| default-openeds | `string[]` | `[]` | 默认展开的子菜单 |
| collapse | `boolean` | `false` | 是否折叠（仅垂直模式） |
| unique-opened | `boolean` | `false` | 是否只保持一个子菜单展开 |
| background-color | `string` | - | 背景色 |
| text-color | `string` | - | 文字颜色 |
| active-text-color | `string` | - | 激活文字颜色 |

### MenuItem Props

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| index | `string` | - | 唯一标识（必填） |
| disabled | `boolean` | `false` | 是否禁用 |

### MenuSub Props

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| index | `string` | - | 唯一标识（必填） |
| popper-class | `string` | - | 弹出框类名 |
| show-timeout | `number` | `300` | 展开延迟（毫秒） |
| hide-timeout | `number` | `300` | 收起延迟（毫秒） |

### MenuItemGroup Props

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| title | `string` | - | 分组标题（必填） |

## 样式定制

Menu 组件使用 Tailwind CSS 构建，可以通过以下方式定制样式：

### 使用默认样式变体

组件已内置 Tailwind 类名，自动适配设计令牌。

### 自定义类名

所有组件都支持 `class` 属性来添加自定义样式：

```vue
<Menu class="shadow-lg">
  <MenuItem class="text-red-500">自定义样式</MenuItem>
</Menu>
```

## 无障碍访问

- 菜单容器使用 `role="menu"` 属性
- 菜单项使用 `role="menuitem"` 属性
- 支持键盘导航（Tab、Enter 键）
- 适当的 ARIA 属性标记

## 设计令牌

Menu 组件使用以下设计令牌：

- `primary-*` - 主色调
- `slate-*` - 中性色
- 设计规范的间距、圆角、阴影等

## 注意事项

1. 水平菜单不支持折叠模式
2. 子菜单展开/收起动画在水平模式下使用 hover 触发
3. 折叠模式下建议为菜单项配置图标
4. 菜单项的 `index` 属性必须唯一
