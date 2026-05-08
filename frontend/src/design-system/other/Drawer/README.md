# Drawer 抽屉组件

抽屉组件，从屏幕边缘滑出的面板，用于在不离开当前页面的情况下展示详细信息或进行操作。

## 特性

- 4 个方向 (left, right, top, bottom)
- 自定义尺寸（百分比或固定像素）
- 可配置遮罩层交互
- 支持异步关闭验证
- 完整的键盘导航支持 (ESC 关闭)
- 可访问性 (ARIA) 兼容
- 支持自定义头部和底部
- 支持嵌套抽屉
- 支持销毁内容模式
- 支持 RTL（从右到左）布局
- 响应式设计

## 使用方法

### 基础用法

使用 `v-model` 绑定抽屉的显示状态。

```vue
<script setup>
import { ref } from 'vue'
import Drawer from '@/design-system/other/Drawer/Drawer.vue'
import Button from '@/design-system/base/Button/Button.vue'

const visible = ref(false)
</script>

<template>
  <Button @click="visible = true">打开抽屉</Button>
  <Drawer title="抽屉标题" v-model="visible">
    <p>抽屉内容</p>
  </Drawer>
</template>
```

### 方向

抽屉支持从四个方向滑出：

```vue
<template>
  <!-- 从右侧滑出（默认） -->
  <Drawer title="右侧抽屉" v-model="visible">
    内容
  </Drawer>

  <!-- 从左侧滑出 -->
  <Drawer title="左侧抽屉" direction="left" v-model="visible">
    内容
  </Drawer>

  <!-- 从顶部滑出 -->
  <Drawer title="顶部抽屉" direction="top" v-model="visible">
    内容
  </Drawer>

  <!-- 从底部滑出 -->
  <Drawer title="底部抽屉" direction="bottom" v-model="visible">
    内容
  </Drawer>
</template>
```

### 自定义尺寸

可以使用百分比或固定像素值设置抽屉大小：

```vue
<template>
  <!-- 百分比尺寸 -->
  <Drawer title="20% 宽度" :size="'20%'" v-model="visible">
    内容
  </Drawer>

  <Drawer title="50% 宽度" :size="'50%'" v-model="visible">
    内容
  </Drawer>

  <!-- 固定像素尺寸 -->
  <Drawer title="400px 宽度" :size="400" v-model="visible">
    内容
  </Drawer>

  <!-- 垂直方向设置高度 -->
  <Drawer
    title="300px 高度"
    direction="top"
    :size="300"
    v-model="visible"
  >
    内容
  </Drawer>
</template>
```

### 无标题抽屉

不提供 `title` 属性时，抽屉将不显示头部：

```vue
<Drawer v-model="visible">
  <div class="space-y-4">
    <h3 class="text-xl font-bold">自定义内容</h3>
    <p>这个抽屉没有默认标题栏</p>
    <Button @click="visible = false">关闭</Button>
  </div>
</Drawer>
```

### 自定义头部

使用 `header` 插槽自定义抽屉头部：

```vue
<Drawer v-model="visible">
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
</Drawer>
```

### 自定义底部

使用 `footer` 插槽自定义抽屉底部：

```vue
<Drawer title="自定义底部" v-model="visible">
  <p>抽屉内容</p>

  <template #footer>
    <div class="flex items-center justify-between">
      <span class="text-sm text-neutral-500">提示信息</span>
      <div class="flex gap-3">
        <Button variant="secondary" @click="visible = false">取消</Button>
        <Button @click="visible = false">确定</Button>
      </div>
    </div>
  </template>
</Drawer>
```

### 异步关闭

使用 `beforeClose` 回调实现关闭前的验证：

```vue
<script setup>
const visible = ref(false)
const hasUnsavedChanges = ref(false)

const beforeClose = async () => {
  if (!hasUnsavedChanges.value) {
    return true
  }

  // 执行异步操作，如 API 调用
  const confirmed = confirm('您有未保存的更改，确定要关闭吗？')
  return confirmed
}
</script>

<template>
  <Drawer
    title="关闭前验证"
    :before-close="beforeClose"
    v-model="visible"
  >
    <p>关闭抽屉前会进行验证</p>
  </Drawer>
</template>
```

### 销毁内容

设置 `destroyOnClose` 为 true，抽屉关闭时会销毁内容，重新打开时组件会重新初始化：

```vue
<Drawer
  title="销毁内容"
  :destroy-on-close="true"
  v-model="visible"
>
  <div>
    <p>抽屉关闭时内容会被销毁</p>
    <p>重新打开时组件会重新创建</p>
  </div>
</Drawer>
```

### 禁用遮罩点击

设置 `closeOnClickModal` 为 false 防止点击遮罩关闭：

```vue
<Drawer
  title="不可点击遮罩关闭"
  :close-on-click-modal="false"
  v-model="visible"
>
  只能通过关闭按钮或按 ESC 关闭
</Drawer>
```

### 无遮罩层

设置 `modal` 为 false 隐藏遮罩层：

```vue
<Drawer
  title="无遮罩抽屉"
  :modal="false"
  v-model="visible"
>
  可以看到背后的内容
</Drawer>
```

### 嵌套抽屉

抽屉可以嵌套使用，每个抽屉会自动调整 z-index：

```vue
<Drawer title="第一个抽屉" v-model="visible1">
  <p>第一个抽屉内容</p>
  <Button @click="visible2 = true">打开第二个抽屉</Button>

  <Drawer title="第二个抽屉" v-model="visible2" :size="'25%'">
    第二个抽屉内容
  </Drawer>
</Drawer>
```

### RTL 布局

使用 `rtl` 属性支持从右到左的布局：

```vue
<Drawer
  title="RTL 抽屉"
  :rtl="true"
  v-model="visible"
>
  <p dir="rtl">这是一个 RTL 抽屉</p>
</Drawer>
```

### 表单抽屉

抽屉常用于表单场景：

```vue
<script setup>
const visible = ref(false)
const formData = ref({
  name: '',
  email: '',
  role: '',
})

const handleSubmit = () => {
  console.log('提交表单:', formData.value)
  visible.value = false
}

const resetForm = () => {
  formData.value = { name: '', email: '', role: '' }
}
</script>

<template>
  <Button @click="visible = true">打开表单抽屉</Button>
  <Drawer title="用户信息" v-model="visible" :size="'40%'" @open="resetForm">
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
      <div>
        <label class="block text-sm font-medium mb-1">角色</label>
        <select
          v-model="formData.role"
          class="w-full px-3 py-2 border rounded-md"
        >
          <option value="">请选择角色</option>
          <option value="admin">管理员</option>
          <option value="user">普通用户</option>
        </select>
      </div>
    </form>

    <template #footer>
      <div class="flex justify-end gap-3">
        <Button variant="secondary" @click="visible = false">取消</Button>
        <Button type="submit" @click="handleSubmit">提交</Button>
      </div>
    </template>
  </Drawer>
</template>
```

### 编程式控制

可以通过 ref 调用抽屉的方法：

```vue
<script setup>
import { ref } from 'vue'
import Drawer from '@/design-system/other/Drawer/Drawer.vue'

const drawerRef = ref()

const openDrawer = () => {
  drawerRef.value?.open()
}

const closeDrawer = () => {
  drawerRef.value?.close()
}
</script>

<template>
  <Button @click="openDrawer">打开抽屉</Button>
  <Drawer ref="drawerRef" title="编程式控制">
    <p>通过 ref 控制抽屉</p>
    <Button @click="closeDrawer">关闭抽屉</Button>
  </Drawer>
</template>
```

## API

### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `boolean` | `false` | 抽屉显示状态 (v-model) |
| `title` | `string` | - | 抽屉标题 |
| `direction` | `'left' \| 'right' \| 'top' \| 'bottom'` | `'right'` | 抽屉滑出方向 |
| `size` | `number \| string` | `'30%'` | 抽屉大小 |
| `closable` | `boolean` | `true` | 是否可关闭 |
| `showClose` | `boolean` | `true` | 是否显示关闭按钮 |
| `beforeClose` | `() => boolean \| Promise<boolean>` | - | 关闭前的回调 |
| `destroyOnClose` | `boolean` | `false` | 关闭时是否销毁内容 |
| `modal` | `boolean` | `true` | 是否显示遮罩层 |
| `modalClass` | `string` | - | 遮罩层的自定义类名 |
| `closeOnClickModal` | `boolean` | `true` | 点击遮罩层是否关闭 |
| `closeOnPressEscape` | `boolean` | `true` | 按 ESC 键是否关闭 |
| `lockScroll` | `boolean` | `true` | 是否禁用 body 滚动 |
| `rtl` | `boolean` | `false` | 是否为 RTL 布局 |
| `class` | `any` | - | 抽屉的自定义类名 |

### Events

| 事件 | 参数 | 说明 |
|------|------|------|
| `update:modelValue` | `(value: boolean)` | 显示状态变化时触发 |
| `open` | - | 抽屉打开时触发 |
| `close` | - | 抽屉关闭时触发 |
| `opened` | - | 抽屉打开动画结束时触发 |
| `closed` | - | 抽屉关闭动画结束时触发 |

### Slots

| 插槽 | 说明 |
|------|------|
| `default` | 抽屉内容区域 |
| `header` | 自定义头部 |
| `footer` | 自定义底部 |
| `title` | 自定义标题 |

### Expose

| 方法 | 说明 |
|------|------|
| `open()` | 打开抽屉 |
| `close()` | 关闭抽屉 |

## 可访问性

- 支持键盘导航 (`ESC` 关闭)
- 正确的 ARIA 属性 (`role="dialog"`, `aria-modal="true"`)
- 抽屉打开时禁用背景滚动
- 支持屏幕阅读器
- 支持 RTL 布局

## 设计规范

### 尺寸建议

| 方向 | 推荐尺寸 | 适用场景 |
|------|---------|----------|
| left/right | 20-30% | 小型侧边栏 |
| left/right | 40-50% | 中型表单/详情 |
| left/right | 60-70% | 大型表单/复杂内容 |
| top/bottom | 20-40% | 通知/简要信息 |
| 固定像素 | 300-600px | 需要精确控制宽高的场景 |

### 间距规范

| 区域 | 内边距 |
|------|--------|
| 头部 | 16px 24px (垂直 水平) |
| 内容 | 16px 24px |
| 底部 | 16px 24px |

### 颜色规范

| 元素 | 背景色 | 文字色 | 边框色 |
|------|--------|--------|--------|
| 抽屉 | white | neutral-900 | neutral-200 |
| 遮罩层 | black/50 | - | - |
| 标题 | - | neutral-900 | - |

### 动画规范

| 属性 | 时长 | 缓动函数 |
|------|------|----------|
| 进入/退出 | 300ms | ease-in-out |

## 最佳实践

1. **使用场景**
   - 详情信息展示
   - 表单输入
   - 过滤器/搜索面板
   - 设置选项
   - 导航菜单

2. **方向选择**
   - `right`: 最常用，适合从右到左的阅读习惯
   - `left`: 适合导航菜单或从左到右的阅读习惯
   - `top`: 适合通知或简要信息
   - `bottom`: 移动端友好，适合操作面板

3. **尺寸控制**
   - 避免超过 70% 的屏幕空间
   - 确保内容有足够的呼吸空间
   - 移动端建议使用更大的尺寸（80%以上）

4. **不要过度使用**
   - 简单提示考虑使用 Alert 或 Message
   - 避免嵌套超过 2 层
   - 考虑使用 Dialog 进行模态交互

5. **提供明确的关闭方式**
   - 保持默认的关闭按钮
   - 底部提供明确的操作按钮
   - 支持 ESC 键关闭
   - 支持点击遮罩关闭（除非有特殊需求）

6. **关注可访问性**
   - 确保键盘可操作
   - 提供清晰的标题
   - 抽屉打开时禁用背景滚动
   - 支持 RTL 布局（针对阿拉伯语等语言）

7. **性能优化**
   - 使用 `destroyOnClose` 销毁大型内容
   - 避免在抽屉中执行大量初始化逻辑
   - 使用懒加载优化内容渲染
