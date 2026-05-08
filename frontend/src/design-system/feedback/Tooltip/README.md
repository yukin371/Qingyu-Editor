# Tooltip 组件

用于显示鼠标悬停时的提示信息，提供额外的上下文说明。

## 功能特性

- **四种触发方式**: hover（悬停）、click（点击）、focus（焦点）、manual（手动控制）
- **十二个位置选项**: top/bottom/left/right 及其 start/end 变体
- **两种主题**: dark（暗色）、light（亮色）
- **箭头支持**: 可配置显示/隐藏箭头
- **延迟控制**: 支持自定义显示/隐藏延迟
- **自定义内容**: 支持插槽自定义内容
- **禁用状态**: 支持禁用提示
- **可访问性**: 符合 WCAG 可访问性标准
- **事件回调**: 支持 beforeShow、afterShow、beforeHide、afterHide 事件

## 安装使用

```vue
<script setup lang="ts">
import { Tooltip } from '@/design-system/feedback'
</script>

<template>
  <Tooltip content="这是一个提示信息">
    <button>鼠标悬停查看提示</button>
  </Tooltip>
</template>
```

## API

### Props

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------------|
| `trigger` | `'hover' \| 'click' \| 'focus' \| 'manual'` | `'hover'` | 触发方式 |
| `placement` | `TooltipPlacement` | `'bottom'` | 显示位置 |
| `content` | `string` | `undefined` | 提示内容 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `effect` | `'dark' \| 'light'` | `'dark'` | 主题 |
| `showArrow` | `boolean` | `true` | 是否显示箭头 |
| `offset` | `number` | `12` | 偏移距离（px） |
| `popperClass` | `string` | `undefined` | 自定义 Popper 类名 |
| `transition` | `string` | `'tooltip-fade'` | 过渡动画名称 |
| `openDelay` | `number` | `0` | 显示延迟（毫秒） |
| `closeDelay` | `number` | `200` | 隐藏延迟（毫秒） |
| `destroyOnClose` | `boolean` | `false` | 关闭后销毁 DOM |
| `modelValue` | `boolean` | `undefined` | 显示状态（仅 manual 模式） |
| `class` | `any` | `undefined` | 自定义类名 |

### TooltipPlacement 类型

```typescript
type TooltipPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end'
```

### Events

| 事件 | 参数 | 描述 |
|------|------|------|
| `update:modelValue` | `(value: boolean)` | 显示状态变化时触发 |
| `beforeShow` | `()` | 显示前触发 |
| `afterShow` | `()` | 显示后触发 |
| `beforeHide` | `()` | 隐藏前触发 |
| `afterHide` | `()` | 隐藏后触发 |

### Slots

| 插槽 | 描述 |
|------|------|
| `default` | 触发元素 |
| `content` | 自定义提示内容 |

### 暴露方法

| 方法 | 参数 | 返回值 | 描述 |
|------|------|--------|------|
| `show` | - | `void` | 显示提示 |
| `hide` | - | `void` | 隐藏提示 |
| `toggle` | - | `void` | 切换显示状态 |

## 基础用法

### 默认提示

```vue
<Tooltip content="这是一个提示信息">
  <button>鼠标悬停查看提示</button>
</Tooltip>
```

### 不同位置

```vue
<!-- 上方 -->
<Tooltip placement="top" content="上方提示">
  <button>Top</button>
</Tooltip>

<!-- 右侧 -->
<Tooltip placement="right" content="右侧提示">
  <button>Right</button>
</Tooltip>

<!-- 左侧 -->
<Tooltip placement="left" content="左侧提示">
  <button>Left</button>
</Tooltip>

<!-- 下方 -->
<Tooltip placement="bottom" content="下方提示">
  <button>Bottom</button>
</Tooltip>
```

### 主题

```vue
<!-- 暗色主题（默认） -->
<Tooltip effect="dark" content="暗色提示">
  <button>Dark</button>
</Tooltip>

<!-- 亮色主题 -->
<Tooltip effect="light" content="亮色提示">
  <button>Light</button>
</Tooltip>
```

## 触发方式

### 悬停触发（默认）

```vue
<Tooltip trigger="hover" content="鼠标悬停触发">
  <button>Hover me</button>
</Tooltip>
```

### 点击触发

```vue
<Tooltip trigger="click" content="点击触发提示">
  <button>Click me</button>
</Tooltip>
```

### 焦点触发

适用于表单元素：

```vue
<Tooltip trigger="focus" content="请输入您的用户名">
  <input type="text" placeholder="用户名" />
</Tooltip>
```

### 手动控制

```vue
<script setup lang="ts">
import { ref } from 'vue'

const visible = ref(false)
</script>

<template>
  <div>
    <button @click="visible = true">显示</button>
    <button @click="visible = false">隐藏</button>

    <Tooltip trigger="manual" v-model="visible" content="手动控制的提示">
      <button>Target</button>
    </Tooltip>
  </div>
</template>
```

## 高级用法

### 延迟显示

```vue
<!-- 延迟 500ms 显示 -->
<Tooltip :open-delay="500" content="延迟显示">
  <button>延迟显示</button>
</Tooltip>

<!-- 延迟显示，延迟隐藏 -->
<Tooltip :open-delay="300" :close-delay="500" content="双向延迟">
  <button>双向延迟</button>
</Tooltip>
```

### 自定义偏移量

```vue
<Tooltip placement="bottom" :offset="20" content="偏移 20px">
  <button>自定义偏移</button>
</Tooltip>
```

### 无箭头

```vue
<Tooltip :show-arrow="false" content="不显示箭头">
  <button>无箭头提示</button>
</Tooltip>
```

### 禁用状态

```vue
<script setup lang="ts">
import { ref } from 'vue'

const disabled = ref(false)
</script>

<template>
  <Tooltip :disabled="disabled" content="可能被禁用的提示">
    <button>Tooltip</button>
  </Tooltip>
</template>
```

### 自定义内容

使用 `content` 插槽：

```vue
<Tooltip>
  <template #content>
    <div class="space-y-1">
      <div class="font-semibold">自定义标题</div>
      <div class="text-xs opacity-80">自定义内容</div>
    </div>
  </template>
  <button>自定义内容</button>
</Tooltip>
```

### 带图标的提示

```vue
<Tooltip>
  <template #content>
    <div class="flex items-center gap-2">
      <span class="text-green-400">✓</span>
      <span>操作成功</span>
    </div>
  </template>
  <button>带图标</button>
</Tooltip>
```

### 快捷键提示

```vue
<Tooltip>
  <template #content>
    <div class="space-y-1">
      <div>保存快捷键</div>
      <div class="text-xs font-mono bg-gray-700 px-2 py-1 rounded">Ctrl + S</div>
    </div>
  </template>
  <button>保存</button>
</Tooltip>
```

## 事件回调

```vue
<script setup lang="ts">
const handleBeforeShow = () => {
  console.log('即将显示提示')
  return true // 返回 false 可以阻止显示
}

const handleAfterShow = () => {
  console.log('提示已显示')
}

const handleBeforeHide = () => {
  console.log('即将隐藏提示')
  return true // 返回 false 可以阻止隐藏
}

const handleAfterHide = () => {
  console.log('提示已隐藏')
}
</script>

<template>
  <Tooltip
    content="带事件回调的提示"
    @before-show="handleBeforeShow"
    @after-show="handleAfterShow"
    @before-hide="handleBeforeHide"
    @after-hide="handleAfterHide"
  >
    <button>Hover me</button>
  </Tooltip>
</template>
```

## 实际应用场景

### 工具栏按钮提示

```vue
<div class="flex gap-2">
  <Tooltip content="保存 (Ctrl+S)">
    <button class="p-2">
      <SaveIcon />
    </button>
  </Tooltip>

  <Tooltip content="编辑 (Ctrl+E)">
    <button class="p-2">
      <EditIcon />
    </button>
  </Tooltip>

  <Tooltip content="删除 (Del)">
    <button class="p-2">
      <DeleteIcon />
    </button>
  </Tooltip>
</div>
```

### 表单字段说明

```vue
<div>
  <label class="flex items-center gap-2">
    用户名
    <Tooltip placement="right" content="用户名必须是唯一的，用于登录系统">
      <HelpIcon class="w-4 h-4 text-gray-400 cursor-help" />
    </Tooltip>
  </label>
  <input type="text" placeholder="请输入用户名" />
</div>
```

### 状态指示

```vue
<Tooltip content="文件已同步">
  <div class="flex items-center gap-2">
    <span class="w-2 h-2 bg-green-500 rounded-full"></span>
    <span>已同步</span>
  </div>
</Tooltip>

<Tooltip content="正在同步中...">
  <div class="flex items-center gap-2">
    <span class="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
    <span>同步中</span>
  </div>
</Tooltip>

<Tooltip content="同步失败，点击重试">
  <div class="flex items-center gap-2">
    <span class="w-2 h-2 bg-red-500 rounded-full"></span>
    <span>失败</span>
  </div>
</Tooltip>
```

### 输入框焦点提示

```vue
<Tooltip trigger="focus" placement="top" content="密码长度 8-20 位，必须包含字母和数字">
  <input type="password" placeholder="请输入密码" />
</Tooltip>
```

## 样式定制

使用 `popperClass` 属性添加自定义样式：

```vue
<Tooltip
  content="自定义样式的提示"
  popper-class="max-w-md text-base"
>
  <button>自定义样式</button>
</Tooltip>
```

## 可访问性

- 使用 `role="tooltip"` 标识为提示组件
- 支持键盘导航（Tab、Enter、Space）
- 支持焦点触发，便于键盘用户
- 箭头元素通过 CSS 伪元素实现，不影响语义
- 符合 WCAG 2.1 AA 标准

## 设计规范

### 颜色系统

| 主题 | 背景色 | 文字色 | 边框色 |
|------|--------|--------|--------|
| Dark | Gray 800 | White | - |
| Light | White | Gray 800 | Gray 200 |

### 间距

- Popper 内边距: `px-3 py-2` (12px × 8px)
- 默认偏移: `12px`
- 箭头大小: `8px`

### 圆角

- 使用 `rounded-lg` 实现圆角效果

### 动画

- 进入/退出动画时长: 200ms
- 缩放效果: 0.95 ↔ 1
- 透明度: 0 ↔ 1

### 字体

- 文字大小: `text-sm` (14px)
- 最大宽度: `max-w-xs` (320px)

## 注意事项

1. **内容长度**: 建议控制提示内容长度，过长的文本可能影响用户体验
2. **触发方式选择**:
   - 按钮工具栏使用 `hover`
   - 表单元素使用 `focus`
   - 需要确认的操作使用 `click`
   - 需要程序控制时使用 `manual`
3. **位置选择**: 根据页面布局和可用空间选择合适的位置
4. **延迟设置**: 适当的延迟可以避免误触发，但不宜过长
5. **禁用状态**: 在不需要提示时及时禁用，提升性能
6. **可访问性**: 确保提示内容对于屏幕阅读器用户也是可访问的

## 浏览器支持

- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)

## 相关组件

- [Popover](../Popover/README.md) - 弹出框组件
- [Dropdown](../Dropdown/README.md) - 下拉菜单组件
