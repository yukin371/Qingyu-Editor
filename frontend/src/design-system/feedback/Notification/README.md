# Notification 通知提醒组件

全局通知提醒组件，用于显示操作反馈、系统消息等重要信息。

## 特性

- ✅ 四种类型：success、info、warning、error
- ✅ 四个位置：top-right、top-left、bottom-right、bottom-left
- ✅ 自动关闭，可配置时长
- ✅ 支持手动关闭
- ✅ 支持标题
- ✅ 支持点击事件
- ✅ 支持关闭回调
- ✅ 支持自定义图标
- ✅ 支持全局配置
- ✅ 支持多条通知同时显示
- ✅ 深色模式支持

## 基础用法

### 直接使用组件

```vue
<template>
  <Notification
    type="success"
    title="成功"
    message="操作成功！"
    :duration="3000"
  />
</template>

<script setup>
import Notification from '@/design-system/feedback/Notification'
</script>
```

### 全局调用（推荐）

```typescript
import { useNotification } from '@/design-system/feedback/Notification'

const notification = useNotification()

// 显示成功通知
notification.success('操作成功！')

// 显示信息通知
notification.info('这是一条信息提示')

// 显示警告通知
notification.warning('请注意，这是一条警告')

// 显示错误通知
notification.error('操作失败，请重试')

// 使用对象形式调用
notification({
  type: 'success',
  title: '成功',
  message: '您的更改已成功保存',
  duration: 3000,
})
```

## API

### Notification Props

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| title | string | - | 通知标题 |
| message | string \| VNode | - | 通知内容（必填） |
| type | 'success' \| 'info' \| 'warning' \| 'error' | 'info' | 通知类型 |
| duration | number | 4500 | 显示时长（毫秒），0 表示不自动关闭 |
| position | 'top-right' \| 'top-left' \| 'bottom-right' \| 'bottom-left' | 'top-right' | 显示位置 |
| showClose | boolean | true | 是否显示关闭按钮 |
| onClick | () => void | - | 点击通知时的回调函数 |
| onClose | () => void | - | 关闭时的回调函数 |
| dangerouslyUseHTMLString | boolean | false | 是否将 message 作为 HTML 处理 |
| customIcon | string \| VNode | - | 自定义图标 |
| class | string | - | 自定义类名 |

### useNotification API

#### 方法

- `notification(options)` - 显示通知
- `notification.success(message, options?)` - 显示成功通知
- `notification.info(message, options?)` - 显示信息通知
- `notification.warning(message, options?)` - 显示警告通知
- `notification.error(message, options?)` - 显示错误通知
- `notification.closeAll()` - 关闭所有通知
- `notification.config(config)` - 配置全局选项

#### NotificationOptions

```typescript
interface NotificationOptions {
  message?: string | VNode    // 通知内容
  type?: NotificationType     // 通知类型
  title?: string              // 通知标题
  duration?: number           // 显示时长
  position?: NotificationPosition  // 显示位置
  showClose?: boolean         // 是否显示关闭按钮
  onClick?: () => void        // 点击回调
  onClose?: () => void        // 关闭回调
  dangerouslyUseHTMLString?: boolean  // 是否作为HTML处理
  customIcon?: string | VNode // 自定义图标
}
```

#### NotificationConfig

```typescript
interface NotificationConfig {
  position?: NotificationPosition  // 默认显示位置
  duration?: number               // 默认显示时长
  maxCount?: number              // 最大同时显示数量
  offset?: number                // 偏移量（像素）
}
```

## 示例

### 带标题的通知

```typescript
notification({
  type: 'success',
  title: '成功',
  message: '您的更改已成功保存',
})
```

### 不自动关闭

```typescript
notification({
  type: 'warning',
  title: '警告',
  message: '这条通知需要手动关闭',
  duration: 0,
})
```

### 点击事件

```typescript
notification({
  type: 'info',
  message: '点击我查看详情',
  onClick: () => {
    console.log('通知被点击')
  },
})
```

### 关闭回调

```typescript
notification({
  type: 'success',
  message: '操作成功',
  onClose: () => {
    console.log('通知已关闭')
  },
})
```

### 自定义图标

```typescript
notification({
  type: 'info',
  message: '自定义图标',
  customIcon: '<svg>...</svg>',
})
```

### 全局配置

```typescript
import { useNotification } from '@/design-system/feedback/Notification'

const notification = useNotification()

// 配置全局选项
notification.config({
  position: 'top-left',
  duration: 3000,
  maxCount: 5,
})

// 之后的通知都会使用这些配置
notification.success('这条通知会显示在左上角，3秒后自动关闭')
```

### 手动关闭特定通知

```typescript
const instance = notification.info('这条通知可以手动关闭')

// 2秒后关闭
setTimeout(() => {
  instance.close()
}, 2000)
```

### 关闭所有通知

```typescript
notification.closeAll()
```

## 设计指南

### 使用场景

- **success**：操作成功、数据保存、提交完成等
- **info**：系统消息、新消息提醒、一般提示等
- **warning**：警告信息、即将过期、注意事项等
- **error**：操作失败、错误提示、异常情况等

### 使用建议

1. 通知应该简洁明了，突出重点信息
2. 成功通知通常可以自动关闭，时长建议 2-3 秒
3. 错误和警告通知建议设置较长时长或不自动关闭
4. 重要信息建议添加标题
5. 同一时刻显示的通知数量不宜过多（建议不超过 5 条）
6. 避免频繁弹出通知，以免打扰用户

### 与其他组件的区别

- **Message**：轻量级消息提示，通常显示在页面顶部中央，适用于简单的操作反馈
- **Alert**：页面内警告提示，不会自动关闭，需要用户手动关闭
- **Notification**：全局通知提醒，显示在角落，适用于重要的系统消息和操作反馈

## 样式定制

组件使用 Tailwind CSS 构建，可以通过 `class` 属性进行样式定制：

```vue
<Notification
  message="自定义样式"
  class="border-2 border-info-500"
/>
```

## 无障碍支持

- 组件使用 `role="alert"` 属性，符合无障碍标准
- 关闭按钮包含 `aria-label` 属性
- 支持键盘操作

## 浏览器支持

- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)
