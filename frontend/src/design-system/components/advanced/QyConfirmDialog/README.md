# QyConfirmDialog

通用确认对话框组件，用于重要操作的二次确认。

## 特性

- 支持多种类型（警告、危险、信息、成功）
- 可自定义标题、消息文本、按钮文本
- 支持显示详细信息列表
- 支持加载状态
- 支持多种尺寸

## 使用示例

### 基础用法

```vue
<template>
  <QyConfirmDialog
    v-model:visible="visible"
    title="确认充值"
    message="确认要充值吗？"
    @confirm="handleConfirm"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { QyConfirmDialog } from '@/design-system/components'

const visible = ref(false)

const handleConfirm = () => {
  // 处理确认逻辑
  visible.value = false
}
</script>
```

### 带详细信息的确认

```vue
<template>
  <QyConfirmDialog
    v-model:visible="visible"
    title="确认充值"
    message="请确认充值信息"
    type="warning"
    :details="[
      { label: '充值金额', value: '¥100.00' },
      { label: '支付方式', value: '支付宝' }
    ]"
    @confirm="handleConfirm"
  />
</template>
```

### 危险操作确认

```vue
<template>
  <QyConfirmDialog
    v-model:visible="visible"
    title="取消会员"
    message="确定要取消会员吗？取消后将无法享受会员权益"
    type="danger"
    confirm-text="确定取消"
    :loading="loading"
    @confirm="handleConfirm"
  />
</template>
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| visible | boolean | false | 对话框可见性 |
| title | string | '确认' | 对话框标题 |
| message | string | '' | 确认消息 |
| type | 'warning' \| 'danger' \| 'info' \| 'success' | 'warning' | 对话框类型 |
| showIcon | boolean | true | 是否显示图标 |
| confirmText | string | '确认' | 确认按钮文本 |
| cancelText | string | '取消' | 取消按钮文本 |
| width | string | '450px' | 对话框宽度 |
| size | 'large' \| 'default' \| 'small' | 'default' | 按钮尺寸 |
| loading | boolean | false | 确认按钮加载状态 |
| details | ConfirmDetail[] | [] | 详细信息列表 |

## Events

| 事件 | 说明 |
|------|------|
| update:visible | 可见性变化事件 |
| confirm | 点击确认按钮 |
| cancel | 点击取消按钮 |

## 类型定义

```typescript
interface ConfirmDetail {
  label: string
  value: string | number
}
```
