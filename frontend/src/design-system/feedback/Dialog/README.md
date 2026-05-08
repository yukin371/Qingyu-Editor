# Dialog 组件

对话框组件，用于在保留当前页面状态的情况下，展示重要信息或收集用户输入。

## 特性

- 5 种尺寸预设 (sm, md, lg, xl, full)
- 居中或顶部对齐显示
- 可配置遮罩层交互
- 支持异步关闭验证
- 完整的键盘导航支持 (ESC 关闭)
- 可访问性 (ARIA) 兼容
- 支持自定义头部和底部
- 支持嵌套对话框
- 响应式设计

## 使用方法

### 基础用法

使用 `v-model:visible` 绑定对话框的显示状态。

```vue
<script setup>
import { ref } from 'vue'
import Dialog from '@/design-system/feedback/Dialog/Dialog.vue'
import Button from '@/design-system/base/Button/Button.vue'

const visible = ref(false)
</script>

<template>
  <Button @click="visible = true">打开对话框</Button>
  <Dialog title="对话框标题" v-model:visible="visible">
    <p>对话框内容</p>
  </Dialog>
</template>
```

### 尺寸

对话框提供 5 种尺寸：

```vue
<template>
  <Dialog title="小对话框" size="sm" v-model:visible="visible">
    内容
  </Dialog>

  <Dialog title="中等对话框" size="md" v-model:visible="visible">
    内容
  </Dialog>

  <Dialog title="大对话框" size="lg" v-model:visible="visible">
    内容
  </Dialog>

  <Dialog title="超大对话框" size="xl" v-model:visible="visible">
    内容
  </Dialog>

  <Dialog title="全屏对话框" size="full" v-model:visible="visible">
    内容
  </Dialog>
</template>
```

### 居中显示

使用 `center` 属性让对话框垂直居中：

```vue
<Dialog title="居中对话框" :center="true" v-model:visible="visible">
  内容
</Dialog>
```

### 自定义头部

使用 `header` 插槽自定义对话框头部：

```vue
<Dialog v-model:visible="visible">
  <template #header>
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
        <svg class="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div>
        <h3 class="text-lg font-semibold">自定义头部</h3>
        <p class="text-sm text-neutral-500">带有图标和描述</p>
      </div>
    </div>
  </template>
  内容
</Dialog>
```

### 自定义底部

使用 `footer` 插槽自定义对话框底部按钮：

```vue
<Dialog title="自定义底部" v-model:visible="visible">
  <p>对话框内容</p>

  <template #footer>
    <div class="flex items-center justify-between">
      <span class="text-sm text-neutral-500">提示信息</span>
      <div class="flex gap-3">
        <Button variant="secondary" @click="visible = false">取消</Button>
        <Button @click="visible = false">确定</Button>
      </div>
    </div>
  </template>
</Dialog>
```

### 异步关闭

使用 `beforeClose` 回调实现关闭前的验证：

```vue
<script setup>
const visible = ref(false)
const loading = ref(false)

const beforeClose = async () => {
  loading.value = true
  // 执行异步操作，如 API 调用
  await new Promise(resolve => setTimeout(resolve, 1500))
  loading.value = false

  // 返回 true 允许关闭，返回 false 阻止关闭
  const confirmed = confirm('确定要关闭吗？')
  return confirmed
}
</script>

<template>
  <Dialog
    title="异步关闭"
    :before-close="beforeClose"
    v-model:visible="visible"
  >
    <p>关闭对话框前会进行验证</p>
    <p v-if="loading" class="text-primary-600">正在验证...</p>
  </Dialog>
</template>
```

### 禁用遮罩点击

设置 `closeOnClickModal` 为 false 防止点击遮罩关闭：

```vue
<Dialog
  title="不可点击遮罩关闭"
  :close-on-click-modal="false"
  v-model:visible="visible"
>
  只能通过关闭按钮或按 ESC 关闭
</Dialog>
```

### 无遮罩层

设置 `modal` 为 false 隐藏遮罩层：

```vue
<Dialog
  title="无遮罩对话框"
  :modal="false"
  v-model:visible="visible"
>
  可以看到背后的内容
</Dialog>
```

### 嵌套对话框

对话框可以嵌套使用，每个对话框会自动调整 z-index：

```vue
<Dialog title="第一个对话框" v-model:visible="visible1">
  <p>第一个对话框内容</p>
  <Button @click="visible2 = true">打开第二个对话框</Button>

  <Dialog title="第二个对话框" v-model:visible="visible2">
    第二个对话框内容
  </Dialog>
</Dialog>
```

### 表单对话框

对话框常用于表单场景：

```vue
<script setup>
const visible = ref(false)
const formData = ref({
  name: '',
  email: '',
})

const handleSubmit = () => {
  console.log('提交表单:', formData.value)
  visible.value = false
}
</script>

<template>
  <Dialog title="用户信息" v-model:visible="visible">
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label class="block text-sm font-medium mb-1">姓名</label>
        <input
          v-model="formData.name"
          type="text"
          class="w-full px-3 py-2 border rounded-md"
          placeholder="请输入姓名"
        />
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">邮箱</label>
        <input
          v-model="formData.email"
          type="email"
          class="w-full px-3 py-2 border rounded-md"
          placeholder="请输入邮箱"
        />
      </div>
    </form>

    <template #footer>
      <div class="flex justify-end gap-3">
        <Button variant="secondary" @click="visible = false">取消</Button>
        <Button @click="handleSubmit">提交</Button>
      </div>
    </template>
  </Dialog>
</template>
```

## API

### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `visible` | `boolean` | `false` | 对话框显示状态 (v-model) |
| `title` | `string` | - | 对话框标题 |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'` | `'md'` | 对话框尺寸 |
| `center` | `boolean` | `false` | 是否居中显示 |
| `modal` | `boolean` | `true` | 是否显示遮罩层 |
| `showClose` | `boolean` | `true` | 是否显示关闭按钮 |
| `closeOnClickModal` | `boolean` | `true` | 点击遮罩层是否关闭 |
| `closeOnPressEscape` | `boolean` | `true` | 按 ESC 键是否关闭 |
| `beforeClose` | `() => boolean \| Promise<boolean>` | - | 关闭前的回调 |
| `lockScroll` | `boolean` | `true` | 是否禁用 body 滚动 |
| `modalClass` | `string` | - | 遮罩层的自定义类名 |
| `class` | `any` | - | 对话框的自定义类名 |

### Events

| 事件 | 参数 | 说明 |
|------|------|------|
| `update:visible` | `(value: boolean)` | 显示状态变化时触发 |
| `open` | - | 对话框打开时触发 |
| `close` | - | 对话框关闭时触发 |
| `opened` | - | 对话框打开动画结束时触发 |
| `closed` | - | 对话框关闭动画结束时触发 |

### Slots

| 插槽 | 说明 |
|------|------|
| `default` | 对话框内容区域 |
| `header` | 自定义头部 |
| `footer` | 自定义底部 |
| `title` | 自定义标题 |

### Expose

| 方法 | 说明 |
|------|------|
| `open()` | 打开对话框 |
| `close()` | 关闭对话框 |

## 可访问性

- 支持键盘导航 (`ESC` 关闭)
- 正确的 ARIA 属性 (`role="dialog"`, `aria-modal="true"`)
- 自动管理焦点（打开时聚焦，关闭时恢复）
- 对话框打开时禁用背景滚动
- 支持屏幕阅读器

## 设计规范

### 尺寸规范

| 尺寸 | 最大宽度 | 适用场景 |
|------|---------|----------|
| sm | 384px | 简单确认对话框 |
| md | 448px | 表单、信息展示（默认） |
| lg | 512px | 复杂表单、多媒体内容 |
| xl | 576px | 大型表单、详细内容 |
| full | 100% | 全屏操作、大量内容 |

### 间距规范

| 区域 | 内边距 |
|------|--------|
| 头部 | 16px 24px (垂直 水平) |
| 内容 | 16px 24px |
| 底部 | 16px 24px |

### 颜色规范

| 元素 | 背景色 | 文字色 | 边框色 |
|------|--------|--------|--------|
| 对话框 | white | neutral-900 | neutral-200 |
| 遮罩层 | black/50 | - | - |
| 标题 | - | neutral-900 | - |

### 动画规范

| 属性 | 时长 | 缓动函数 |
|------|------|----------|
| 进入/退出 | 300ms | ease-in-out |
| 缩放 | 0.95 - 1 | - |

## 最佳实践

1. **使用场景**
   - 确认操作（删除、保存等）
   - 表单输入
   - 重要信息展示
   - 复杂操作流程

2. **不要过度使用**
   - 简单提示考虑使用 Alert 或 Message
   - 避免嵌套超过 2 层

3. **提供明确的关闭方式**
   - 保持默认的关闭按钮
   - 底部提供明确的操作按钮
   - 支持 ESC 键关闭

4. **关注可访问性**
   - 确保键盘可操作
   - 提供清晰的标题
   - 对话框打开时禁用背景滚动

5. **异步操作**
   - 使用 `beforeClose` 进行数据验证
   - 在异步操作中显示加载状态
   - 防止用户在操作未完成时关闭对话框
