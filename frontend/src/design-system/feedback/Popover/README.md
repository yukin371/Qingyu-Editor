# Popover 气泡卡片组件

点击或悬停在元素上时，显示弹出气泡卡片。

## 功能特性

- **四种触发方式**: 支持 click、hover、focus、manual 触发
- **十二种位置**: 支持 top、bottom、left、right 及其 start/end 变体
- **自定义宽度**: 支持自定义弹出框宽度
- **延迟控制**: 支持延迟显示和关闭（hover 模式）
- **箭头显示**: 可选显示/隐藏箭头
- **丰富内容**: 支持嵌套复杂内容和操作按钮
- **过渡动画**: 平滑的进入和退出动画
- **深色模式**: 自动适配深色主题
- **可访问性**: 符合 WCAG 可访问性标准
- **事件支持**: 完整的生命周期事件

## 安装使用

```vue
<script setup lang="ts">
import { Popover } from '@/design-system/feedback'
</script>

<template>
  <Popover content="这是一段内容">
    <button>点击我</button>
  </Popover>
</template>
```

## API

### Props

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------------|
| `trigger` | `'click' \| 'hover' \| 'focus' \| 'manual'` | `'click'` | 触发方式 |
| `placement` | `PopoverPlacement` | `'bottom'` | 出现位置 |
| `width` | `string \| number` | `undefined` | 宽度 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `content` | `string` | `undefined` | 内容 |
| `offset` | `number` | `0` | 偏移量 |
| `showArrow` | `boolean` | `true` | 是否显示箭头 |
| `popperClass` | `string` | `undefined` | 弹出框自定义类名 |
| `popperStyle` | `Record<string, any>` | `undefined` | 弹出框自定义样式 |
| `visible` | `boolean` | `undefined` | 是否可见（仅 manual 模式） |
| `openDelay` | `number` | `0` | 延迟显示时间（毫秒） |
| `closeDelay` | `number` | `200` | 延迟关闭时间（毫秒） |
| `closeOnClickOutside` | `boolean` | `true` | 是否在点击外部时关闭 |
| `class` | `any` | `undefined` | 自定义类名 |

### Events

| 事件 | 参数 | 描述 |
|------|------|------|
| `beforeEnter` | `()` | 显示前触发 |
| `afterEnter` | `()` | 显示后触发 |
| `beforeLeave` | `()` | 隐藏前触发 |
| `afterLeave` | `()` | 隐藏后触发 |
| `update:visible` | `(visible: boolean)` | 显示状态变化时触发 |

### Slots

| 插槽 | 描述 |
|------|------|
| `default` | 触发元素 |
| `content` | 弹出框内容 |

### PopoverPlacement 类型

```typescript
type PopoverPlacement =
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

## 触发方式

### Click 点击触发

默认方式，点击触发元素显示/隐藏弹出框。

```vue
<Popover content="这是一段内容">
  <button>点击我</button>
</Popover>
```

### Hover 悬停触发

鼠标悬停时显示弹出框。

```vue
<Popover trigger="hover" content="悬停显示">
  <button>悬停我</button>
</Popover>
```

### Focus 焦点触发

元素获得焦点时显示弹出框。

```vue
<Popover trigger="focus" content="聚焦显示">
  <button>聚焦我</button>
</Popover>
```

### Manual 手动控制

通过 `visible` 属性手动控制显示状态。

```vue
<script setup lang="ts">
import { ref } from 'vue'

const visible = ref(false)

const show = () => { visible.value = true }
const hide = () => { visible.value = false }
</script>

<template>
  <Popover trigger="manual" :visible="visible" content="手动控制">
    <button @mouseenter="show" @mouseleave="hide">
      悬停我
    </button>
  </Popover>
</template>
```

## 位置选项

### 顶部位置

```vue
<!-- 顶部居中 -->
<Popover placement="top" content="Top">Top</Popover>

<!-- 顶部左侧 -->
<Popover placement="top-start" content="Top Start">Top Start</Popover>

<!-- 顶部右侧 -->
<Popover placement="top-end" content="Top End">Top End</Popover>
```

### 底部位置

```vue
<!-- 底部居中 -->
<Popover placement="bottom" content="Bottom">Bottom</Popover>

<!-- 底部左侧 -->
<Popover placement="bottom-start" content="Bottom Start">Bottom Start</Popover>

<!-- 底部右侧 -->
<Popover placement="bottom-end" content="Bottom End">Bottom End</Popover>
```

### 左侧位置

```vue
<!-- 左侧居中 -->
<Popover placement="left" content="Left">Left</Popover>

<!-- 左侧顶部 -->
<Popover placement="left-start" content="Left Start">Left Start</Popover>

<!-- 左侧底部 -->
<Popover placement="left-end" content="Left End">Left End</Popover>
```

### 右侧位置

```vue
<!-- 右侧居中 -->
<Popover placement="right" content="Right">Right</Popover>

<!-- 右侧顶部 -->
<Popover placement="right-start" content="Right Start">Right Start</Popover>

<!-- 右侧底部 -->
<Popover placement="right-end" content="Right End">Right End</Popover>
```

## 自定义内容

### 嵌套信息

```vue
<Popover>
  <template #content>
    <div class="space-y-2">
      <h4 class="font-semibold">标题</h4>
      <p class="text-sm text-slate-600">这是一段详细描述内容。</p>
    </div>
  </template>
  <button>查看详情</button>
</Popover>
```

### 带操作按钮

```vue
<Popover>
  <template #content>
    <div class="space-y-2">
      <p class="text-sm">确定要删除此项目吗？</p>
      <div class="flex justify-end gap-2">
        <button class="px-3 py-1 text-sm text-slate-600">取消</button>
        <button class="px-3 py-1 text-sm bg-red-500 text-white rounded">删除</button>
      </div>
    </div>
  </template>
  <button>删除</button>
</Popover>
```

### 用户卡片

```vue
<Popover>
  <template #content>
    <div class="w-64">
      <div class="flex items-center gap-3 mb-3">
        <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full"></div>
        <div>
          <h4 class="font-semibold">John Doe</h4>
          <p class="text-sm text-slate-500">产品经理</p>
        </div>
      </div>
      <div class="space-y-2 text-sm text-slate-600">
        <p>john.doe@example.com</p>
        <p>+1 234 567 890</p>
      </div>
      <div class="flex gap-2 mt-3">
        <button class="flex-1 px-3 py-1.5 bg-blue-500 text-white text-sm rounded">
          发消息
        </button>
        <button class="flex-1 px-3 py-1.5 bg-slate-200 text-sm rounded">
          查看资料
        </button>
      </div>
    </div>
  </template>
  <button>用户卡片</button>
</Popover>
```

### 菜单列表

```vue
<Popover :show-arrow="false">
  <template #content>
    <div class="min-w-[160px]">
      <div class="px-3 py-2 text-sm font-semibold text-slate-500 border-b">
        账户
      </div>
      <ul class="py-1">
        <li>
          <a href="#" class="block px-3 py-2 text-sm hover:bg-slate-100">
            个人资料
          </a>
        </li>
        <li>
          <a href="#" class="block px-3 py-2 text-sm hover:bg-slate-100">
            账户设置
          </a>
        </li>
        <li>
          <a href="#" class="block px-3 py-2 text-sm hover:bg-slate-100">
            退出登录
          </a>
        </li>
      </ul>
    </div>
  </template>
  <button>账户菜单</button>
</Popover>
```

## 高级用法

### 自定义宽度

```vue
<!-- 数字宽度 -->
<Popover :width="200" content="固定宽度 200px">
  <button>200px</button>
</Popover>

<!-- 字符串宽度 -->
<Popover :width="300" content="固定宽度 300px">
  <button>300px</button>
</Popover>
```

### 延迟控制

适用于 hover 触发方式，避免意外触发。

```vue
<!-- 延迟显示 -->
<Popover
  trigger="hover"
  :open-delay="500"
  content="延迟 500ms 显示"
>
  <button>延迟显示</button>
</Popover>

<!-- 延迟关闭 -->
<Popover
  trigger="hover"
  :close-delay="300"
  content="延迟 300ms 关闭"
>
  <button>延迟关闭</button>
</Popover>

<!-- 双向延迟 -->
<Popover
  trigger="hover"
  :open-delay="500"
  :close-delay="300"
  content="延迟显示和关闭"
>
  <button>双向延迟</button>
</Popover>
```

### 禁用点击外部关闭

```vue
<Popover :close-on-click-outside="false" content="不会点击外部关闭">
  <button>禁用外部点击关闭</button>
</Popover>
```

### 禁用状态

```vue
<Popover :disabled="true" content="禁用的 Popover">
  <button>禁用的按钮</button>
</Popover>
```

### 隐藏箭头

```vue
<Popover :show-arrow="false" content="无箭头的 Popover">
  <button>无箭头</button>
</Popover>
```

### 自定义样式

```vue
<Popover
  popper-class="bg-blue-50 border-blue-200"
  :popper-style="{ boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }"
  content="自定义样式"
>
  <button>自定义样式</button>
</Popover>
```

## 事件监听

```vue
<script setup lang="ts">
const handleBeforeEnter = () => {
  console.log('显示前')
}

const handleAfterEnter = () => {
  console.log('显示后')
}

const handleBeforeLeave = () => {
  console.log('隐藏前')
}

const handleAfterLeave = () => {
  console.log('隐藏后')
}

const handleVisibleChange = (visible: boolean) => {
  console.log('可见性变化:', visible)
}
</script>

<template>
  <Popover
    content="测试事件"
    @before-enter="handleBeforeEnter"
    @after-enter="handleAfterEnter"
    @before-leave="handleBeforeLeave"
    @after-leave="handleAfterLeave"
    @update:visible="handleVisibleChange"
  >
    <button>测试事件</button>
  </Popover>
</template>
```

## 实际应用场景

### 表格行操作

```vue
<table>
  <tbody>
    <tr>
      <td>项目 A</td>
      <td>
        <Popover :show-arrow="false" placement="bottom-start">
          <template #content>
            <ul class="min-w-[120px] py-1">
              <li><button class="w-full px-3 py-2 text-left hover:bg-slate-100">编辑</button></li>
              <li><button class="w-full px-3 py-2 text-left hover:bg-slate-100">复制</button></li>
              <li><button class="w-full px-3 py-2 text-left hover:bg-slate-100 text-red-600">删除</button></li>
            </ul>
          </template>
          <button>•••</button>
        </Popover>
      </td>
    </tr>
  </tbody>
</table>
```

### 帮助提示

```vue
<Popover placement="top" trigger="hover" :open-delay="300">
  <template #content>
    <div class="max-w-xs">
      <p class="text-sm">用户名是您在系统中的唯一标识，长度为 4-20 个字符。</p>
    </div>
  </template>
  <svg class="w-4 h-4 text-slate-400 cursor-help">
    <!-- Question icon -->
  </svg>
</Popover>
```

### 确认操作

```vue
<Popover>
  <template #content>
    <div class="w-48">
      <p class="text-sm mb-3">确定要删除此文件吗？此操作无法撤销。</p>
      <div class="flex justify-end gap-2">
        <button class="px-3 py-1 text-sm text-slate-600">取消</button>
        <button class="px-3 py-1 text-sm bg-red-500 text-white rounded">删除</button>
      </div>
    </div>
  </template>
  <button class="px-4 py-2 bg-red-500 text-white rounded">
    删除文件
  </button>
</Popover>
```

## 样式定制

### 主题颜色

使用 `popperClass` 自定义弹出框样式。

```vue
<Popover
  popper-class="bg-blue-50 border-blue-200"
  content="蓝色主题"
>
  <button>蓝色主题</button>
</Popover>
```

### 尺寸

```vue
<!-- 小尺寸 -->
<Popover :width="150" content="小尺寸">
  <button>小</button>
</Popover>

<!-- 中等尺寸 -->
<Popover :width="250" content="中等尺寸">
  <button>中</button>
</Popover>

<!-- 大尺寸 -->
<Popover :width="400" content="大尺寸">
  <button>大</button>
</Popover>
```

## 可访问性

- 使用 `role="tooltip"` 标识为工具提示组件
- 使用 `aria-hidden` 属性管理可见性状态
- 支持键盘导航和屏幕阅读器
- 符合 WCAG 2.1 AA 标准

## 设计规范

### 间距

- 弹出框内边距: `p-4` (16px)
- 内容间距: 根据需要自定义

### 圆角

- 使用 `rounded-lg` 实现圆角效果
- 箭头使用 `rotate-45` 旋转实现

### 阴影

- 使用 `shadow-lg` 实现阴影效果
- 可通过 `popperStyle` 自定义阴影

### 动画

- 进入/退出动画时长: 200ms
- 缩放效果: 0.95 ↔ 1
- 透明度: 0 ↔ 1

## 注意事项

1. **触发方式选择**: 根据使用场景选择合适的触发方式
2. **延迟设置**: hover 模式下建议设置延迟，避免误触发
3. **位置选择**: 确保弹出框不会超出视口边界
4. **内容长度**: 建议控制内容长度，过长的内容可能影响用户体验
5. **动画**: 动画时长为 200ms，事件在动画结束后触发
6. **手动模式**: 使用 manual 模式时需要完全控制 visible 属性

## 浏览器支持

- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)

## 相关组件

- [Tooltip](../Tooltip/README.md) - 工具提示组件
- [Dropdown](../Dropdown/README.md) - 下拉菜单组件
- [Dialog](../Dialog/README.md) - 对话框组件
