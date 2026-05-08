# Alert 组件

用于显示页面中的警告、成功、错误和消息提示的反馈组件。

## 功能特性

- **四种类型**: 支持 success、info、warning、error 四种类型
- **可关闭**: 支持关闭按钮，可移除提示
- **图标支持**: 内置图标，支持显示/隐藏
- **标题支持**: 可选标题，支持自定义
- **居中显示**: 支持文字居中
- **深色模式**: 自动适配深色主题
- **自定义内容**: 支持插槽自定义标题和内容
- **过渡动画**: 平滑的进入和退出动画
- **可访问性**: 符合 WCAG 可访问性标准

## 安装使用

```vue
<script setup lang="ts">
import { Alert } from '@/design-system/feedback'
</script>

<template>
  <Alert type="info" description="这是一条信息提示" />
</template>
```

## API

### Props

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------------|
| `type` | `'success' \| 'info' \| 'warning' \| 'error'` | `'info'` | Alert 类型 |
| `title` | `string` | `undefined` | 标题 |
| `description` | `string` | `undefined` | 描述内容 |
| `closable` | `boolean` | `false` | 是否可关闭 |
| `showIcon` | `boolean` | `true` | 是否显示图标 |
| `center` | `boolean` | `false` | 文字是否居中 |
| `effect` | `'light' \| 'dark'` | `'light'` | 主题 |
| `class` | `any` | `undefined` | 自定义类名 |

### Events

| 事件 | 参数 | 描述 |
|------|------|------|
| `close` | `()` | 关闭 Alert 时触发 |
| `afterClose` | `()` | 关闭动画结束后触发 |

### Slots

| 插槽 | 描述 |
|------|------|
| `default` | 描述内容 |
| `title` | 自定义标题 |

## 类型

### Success

成功提示，用于表示操作成功、完成等正面状态。

```vue
<Alert type="success" description="操作成功！" />
```

### Info

信息提示，用于一般性信息通知。

```vue
<Alert type="info" description="这是一条信息提示" />
```

### Warning

警告提示，用于表示警告、需要注意的状态。

```vue
<Alert type="warning" description="请注意检查您的输入" />
```

### Error

错误提示，用于表示错误、失败等负面状态。

```vue
<Alert type="error" description="操作失败，请重试" />
```

## 基础用法

### 简单提示

```vue
<Alert type="info" description="这是一条信息提示" />
```

### 带标题

```vue
<Alert
  type="success"
  title="成功"
  description="您的更改已成功保存"
/>
```

### 可关闭

```vue
<Alert
  type="info"
  description="这条提示可以关闭"
  :closable="true"
  @close="handleClose"
/>
```

```typescript
const handleClose = () => {
  console.log('Alert closed')
}
```

### 居中显示

```vue
<Alert
  type="warning"
  title="注意"
  description="这是一条居中的警告提示"
  :center="true"
/>
```

### 隐藏图标

```vue
<Alert
  type="info"
  description="不显示图标的提示"
  :show-icon="false"
/>
```

## 自定义内容

### 自定义标题

```vue
<Alert type="info">
  <template #title>
    <span class="flex items-center gap-2">
      自定义标题
      <span class="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">New</span>
    </span>
  </template>
  <template #default>
    这是自定义的描述内容
  </template>
</Alert>
```

### 带链接

```vue
<Alert type="success">
  操作成功！<a href="#" class="underline font-semibold">查看详情</a>
</Alert>
```

### 带操作按钮

```vue
<Alert type="warning" :closable="true">
  <template #default>
    <div class="flex items-center gap-3">
      <span>警告：此操作可能会影响其他用户</span>
      <button class="px-3 py-1 bg-amber-600 text-white rounded text-sm hover:bg-amber-700">
        确认
      </button>
    </div>
  </template>
</Alert>
```

### 带列表

```vue
<Alert type="error" title="提交失败">
  <ul class="list-disc list-inside space-y-1">
    <li>用户名不能为空</li>
    <li>邮箱格式不正确</li>
    <li>密码长度至少为 8 位</li>
  </ul>
</Alert>
```

## 实际应用场景

### 表单提交成功

```vue
<Alert type="success" :closable="true">
  您的更改已成功保存！
</Alert>
```

### 系统通知

```vue
<Alert type="info" title="系统维护通知" :closable="true">
  系统将于今晚 22:00 - 24:00 进行维护，请提前保存您的工作。
</Alert>
```

### 表单校验错误

```vue
<Alert type="error" title="提交失败" :closable="true">
  <ul class="list-disc list-inside space-y-1">
    <li>用户名不能为空</li>
    <li>邮箱格式不正确</li>
    <li>密码长度至少为 8 位</li>
  </ul>
</Alert>
```

### 操作确认

```vue
<Alert type="warning" title="删除确认" :closable="true">
  此操作不可恢复，请确认是否继续删除该文件？
</Alert>
```

## 交互示例

### 动态添加和移除

```vue
<script setup lang="ts">
import { ref } from 'vue'

const alerts = ref([
  { id: 1, type: 'success', title: '成功', description: '操作已完成' },
  { id: 2, type: 'info', title: '信息', description: '您有新消息' },
])

const handleClose = (id: number) => {
  alerts.value = alerts.value.filter(a => a.id !== id)
}
</script>

<template>
  <div class="space-y-4">
    <Alert
      v-for="alert in alerts"
      :key="alert.id"
      :type="alert.type"
      :title="alert.title"
      :description="alert.description"
      :closable="true"
      @close="handleClose(alert.id)"
    />
  </div>
</template>
```

## 样式定制

使用 `class` 属性添加自定义样式。

```vue
<Alert
  type="info"
  description="自定义样式的 Alert"
  class="shadow-lg rounded-xl"
/>
```

## 可访问性

- 使用 `role="alert"` 标识为警告组件
- 使用 `aria-live` 属性告知屏幕阅读器何时读取内容
- 关闭按钮包含 `aria-label` 属性
- 支持键盘导航和屏幕阅读器
- 符合 WCAG 2.1 AA 标准

## 设计规范

### 颜色系统

| 类型 | 背景色 | 边框色 | 文字色 |
|------|--------|--------|--------|
| Success | Emerald 50 | Emerald 200 | Emerald 800 |
| Info | Sky 50 | Sky 200 | Sky 800 |
| Warning | Amber 50 | Amber 200 | Amber 800 |
| Error | Red 50 | Red 200 | Red 800 |

### 间距

- 内边距: `p-4` (16px)
- 内容间距: `space-y-4` (16px)
- 图标与文字: `mr-3` (12px)

### 圆角

- 使用 `rounded-lg` 实现圆角效果

### 动画

- 进入/退出动画时长: 300ms
- 缩放效果: 0.95 ↔ 1
- 透明度: 0 ↔ 1

## 注意事项

1. **内容长度**: 建议控制描述内容长度，过长的文本可能影响用户体验
2. **关闭时机**: 只有在用户可以自行关闭的情况下才设置 `closable`
3. **类型选择**: 根据场景选择合适的类型，避免过度使用 `error` 类型
4. **动画**: 关闭动画时长为 300ms，`afterClose` 事件在动画结束后触发
5. **图标**: 默认显示图标，如需隐藏设置 `showIcon` 为 `false`

## 浏览器支持

- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)

## 相关组件

- [Notification](../Notification/README.md) - 通知提醒组件
- [Message](../Message/README.md) - 消息提示组件
- [Dialog](../Dialog/README.md) - 对话框组件
