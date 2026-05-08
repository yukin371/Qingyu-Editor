# Message 组件

消息提示组件，用于显示操作反馈信息。

## 特性

- ✅ 四种消息类型 (success, info, warning, error)
- ✅ 自动关闭功能，可自定义时长
- ✅ 可手动关闭
- ✅ 支持居中显示
- ✅ 支持 HTML 内容（谨慎使用）
- ✅ 可自定义偏移量
- ✅ 全局调用方法
- ✅ 多条消息堆叠显示
- ✅ 流畅的进入/退出动画

## 使用方法

### 基础用法

```vue
<script setup>
import Message from '@/design-system/feedback/Message/Message.vue'
</script>

<template>
  <Message message="这是一条消息提示" />
</template>
```

### 消息类型

```vue
<template>
  <div class="space-y-2">
    <Message type="success" message="操作成功！" />
    <Message type="info" message="这是一条信息" />
    <Message type="warning" message="请注意！" />
    <Message type="error" message="操作失败！" />
  </div>
</template>
```

### 自动关闭

```vue
<template>
  <!-- 3秒后自动关闭 -->
  <Message message="3秒后自动关闭" :duration="3000" />

  <!-- 不自动关闭 -->
  <Message message="不会自动关闭" :duration="0" :show-close="true" />
</template>
```

### 可关闭

```vue
<template>
  <Message message="可以关闭的消息" :show-close="true" />
</template>
```

### 居中显示

```vue
<template>
  <Message message="居中显示的消息" :center="true" />
</template>
```

### HTML 内容

> ⚠️ **注意**：使用 HTML 内容时请确保内容安全，避免 XSS 攻击

```vue
<template>
  <Message
    message="这是一条包含 <strong>加粗文本</strong> 的消息"
    :dangerously-use-h-t-m-l-string="true"
  />
</template>
```

### 自定义偏移

```vue
<template>
  <Message message="距离顶部 100px" :offset="100" />
</template>
```

## 全局调用

使用 `useMessage` Hook 可以在任何地方调用消息提示：

```vue
<script setup>
import { useMessage } from '@/design-system/feedback/Message/useMessage'

const message = useMessage()

const showSuccess = () => {
  message.success('操作成功！')
}

const showInfo = () => {
  message.info('这是一条信息')
}

const showWarning = () => {
  message.warning('请注意！')
}

const showError = () => {
  message.error('操作失败！')
}

const showWithOptions = () => {
  message.info('带选项的消息', {
    duration: 5000,
    showClose: true,
    center: true,
  })
}

const closable = message.info('这条消息可以手动关闭', {
  duration: 0,
  showClose: true,
})

// 手动关闭
closable.close()
</script>

<template>
  <div class="space-x-2">
    <button @click="showSuccess">Success</button>
    <button @click="showInfo">Info</button>
    <button @click="showWarning">Warning</button>
    <button @click="showError">Error</button>
    <button @click="showWithOptions">自定义选项</button>
  </div>
</template>
```

## API

### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `message` | `string \| VNode` | - | 消息内容（支持 VNode） |
| `type` | `'success' \| 'info' \| 'warning' \| 'error'` | `'info'` | 消息类型 |
| `duration` | `number` | `3000` | 显示时长（毫秒），0 表示不自动关闭 |
| `showClose` | `boolean` | `false` | 是否显示关闭按钮 |
| `center` | `boolean` | `false` | 文字是否居中 |
| `dangerouslyUseHTMLString` | `boolean` | `false` | 是否将 message 属性作为 HTML 片段处理 |
| `offset` | `number` | `20` | 距离顶部的偏移量 |

### Events

| 事件 | 参数 | 说明 |
|------|------|------|
| `close` | - | 关闭时触发 |

### useMessage API

```typescript
interface MessageHandler {
  close: () => void  // 关闭消息
}

interface MessageOptions {
  message?: string | VNode
  type?: 'success' | 'info' | 'warning' | 'error'
  duration?: number
  showClose?: boolean
  center?: boolean
  dangerouslyUseHTMLString?: boolean
  offset?: number
  onClose?: () => void
}

const message = {
  // 基础调用
  show(options: MessageOptions): MessageHandler

  // 快捷方法
  success(message: string | VNode, options?: Omit<MessageOptions, 'message' | 'type'>): MessageHandler
  info(message: string | VNode, options?: Omit<MessageOptions, 'message' | 'type'>): MessageHandler
  warning(message: string | VNode, options?: Omit<MessageOptions, 'message' | 'type'>): MessageHandler
  error(message: string | VNode, options?: Omit<MessageOptions, 'message' | 'type'>): MessageHandler
}
```

## 样式定制

### CSS 变量

组件使用 Tailwind CSS 类名，可以通过以下方式定制：

```css
/* 自定义消息容器 */
.qy-message-container {
  z-index: 9999;
}

/* 自定义消息样式 */
.qy-message {
  /* 你的样式 */
}
```

## 设计规范

### 类型规范

| 类型 | 背景色 | 边框色 | 文字色 | 图标 |
|------|--------|--------|--------|------|
| success | emerald-50 | emerald-500 | emerald-800 | ✓ |
| info | info-50 | info-500 | info-800 | ℹ |
| warning | amber-50 | amber-500 | amber-800 | ⚠ |
| error | red-50 | red-500 | red-800 | ✕ |

### 尺寸规范

| 属性 | 值 |
|------|-----|
| 最小宽度 | 300px |
| 最大宽度 | 500px |
| 内边距 | 12px 16px |
| 圆角 | 6px |
| 图标大小 | 20px |
| 消息间距 | 16px |

### 动画规范

| 状态 | 时长 | 缓动 |
|------|------|------|
| 进入 | 300ms | ease-out |
| 退出 | 200ms | ease-in |

## 最佳实践

### 1. 选择合适的类型

- **success**: 用于操作成功的反馈
- **info**: 用于一般信息提示
- **warning**: 用于需要注意的警告信息
- **error**: 用于操作失败的错误提示

### 2. 合理设置时长

```vue
<!-- 不重要的信息可以快速关闭 -->
<Message message="保存成功" :duration="2000" />

<!-- 重要信息应该显示更长时间 -->
<Message message="请注意查收邮件" :duration="5000" />

<!-- 需要用户确认的信息不要自动关闭 -->
<Message message="请确认您的操作" :duration="0" :show-close="true" />
```

### 3. 多条消息处理

当需要显示多条消息时，建议使用全局调用方式：

```vue
<script setup>
import { useMessage } from '@/design-system/feedback/Message/useMessage'

const message = useMessage()

const batchOperation = () => {
  // 多条消息会自动堆叠
  message.success('操作 1 完成')
  message.info('操作 2 完成')
  message.warning('操作 3 有警告')
}
</script>
```

### 4. 安全使用 HTML

```vue
<!-- ❌ 不要使用不受信任的 HTML -->
<Message :message="userInput" :dangerously-use-h-t-m-l-string="true" />

<!-- ✅ 只使用安全的 HTML -->
<Message message="请 <strong>点击确认</strong> 继续" :dangerously-use-h-t-m-l-string="true" />
```

## 可访问性

- 使用语义化的 HTML 结构
- 支持键盘操作（关闭按钮）
- 提供适当的 ARIA 标签
- 支持屏幕阅读器
