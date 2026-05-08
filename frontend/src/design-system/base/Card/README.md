# Card 组件

基础卡片组件，用于内容分组展示，支持多种变体和插槽。

## 特性

- ✅ 3 种视觉变体 (default, bordered, elevated)
- ✅ 支持 header, default, footer 插槽
- ✅ 可选的 hover 交互效果
- ✅ 灵活的内容布局
- ✅ 完整的过渡动画
- ✅ 可访问性友好

## 使用方法

### 基础用法

```vue
<script setup>
import Card from '@/design-system/base/Card/Card.vue'
</script>

<template>
  <Card>
    <p>这是一个基础卡片。</p>
  </Card>
</template>
```

### 变体

```vue
<template>
  <div class="space-y-4">
    <!-- 默认样式 -->
    <Card variant="default">
      <p>默认样式卡片</p>
    </Card>

    <!-- 带边框 -->
    <Card variant="bordered">
      <p>带边框样式卡片</p>
    </Card>

    <!-- 带阴影 -->
    <Card variant="elevated">
      <p>带阴影样式卡片</p>
    </Card>
  </div>
</template>
```

### 带标题和底部

```vue
<template>
  <Card variant="bordered">
    <template #header>
      <h3 class="text-lg font-semibold">卡片标题</h3>
    </template>

    <p class="text-slate-600">
      这是卡片的主体内容区域。
    </p>

    <template #footer>
      <div class="flex justify-end gap-2">
        <button class="px-3 py-1 text-sm text-slate-600">取消</button>
        <button class="px-3 py-1 text-sm bg-primary-500 text-white rounded">确定</button>
      </div>
    </template>
  </Card>
</template>
```

### 悬停效果

```vue
<template>
  <Card variant="elevated" :hoverable="true">
    <h3 class="text-lg font-semibold">悬停查看效果</h3>
    <p class="text-slate-600">鼠标悬停时会有阴影和位移动画</p>
  </Card>
</template>
```

### 内容卡片

```vue
<template>
  <Card variant="elevated" :hoverable="true">
    <template #header>
      <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <h3 class="text-lg font-semibold">快速部署</h3>
    </template>
    <p class="text-slate-600 text-sm">一键部署你的应用到云端，省时省力。</p>
  </Card>
</template>
```

### 用户卡片

```vue
<template>
  <Card variant="bordered" class="max-w-sm">
    <template #header>
      <div class="flex items-center gap-4">
        <div class="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
          JD
        </div>
        <div>
          <h3 class="text-lg font-semibold">John Doe</h3>
          <p class="text-slate-500 text-sm">前端开发工程师</p>
        </div>
      </div>
    </template>
    <p class="text-slate-600">专注于 Vue.js 和现代前端技术栈。</p>
    <template #footer>
      <div class="flex gap-2">
        <button class="flex-1 px-3 py-2 text-sm border border-slate-200 rounded">关注</button>
        <button class="flex-1 px-3 py-2 text-sm bg-primary-500 text-white rounded">私信</button>
      </div>
    </template>
  </Card>
</template>
```

### 事件处理

```vue
<script setup>
const handleClick = () => {
  console.log('Card clicked!')
}
</script>

<template>
  <Card variant="elevated" :hoverable="true" @click="handleClick">
    <p>点击这个卡片触发事件</p>
  </Card>
</template>
```

## API

### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `variant` | `'default' \| 'bordered' \| 'elevated'` | `'default'` | 卡片变体 |
| `hoverable` | `boolean` | `false` | 是否启用悬停效果 |
| `class` | `any` | - | 自定义类名 |

### Slots

| 插槽 | 说明 |
|------|------|
| `header` | 卡片头部内容 |
| `default` | 卡片主体内容 |
| `footer` | 卡片底部内容 |

### Events

| 事件 | 参数 | 说明 |
|------|------|------|
| `click` | `(event: MouseEvent)` | 点击事件 |

## 设计规范

### 尺寸规范

| 属性 | 值 | 说明 |
|------|-----|------|
| 内边距 | p-6 | 1.5rem (24px) |
| 圆角 | rounded-lg | 0.5rem (8px) |
| 头部间距 | mb-4 | 1rem (16px) |
| 底部间距 | mt-4 | 1rem (16px) |

### 颜色规范

| 变体 | 背景色 | 边框 | 阴影 |
|------|--------|------|------|
| default | white | 无 | 无 |
| bordered | white | border-slate-200 | 无 |
| elevated | white | 无 | shadow-md |

### 悬停效果

| 属性 | 值 | 说明 |
|------|-----|------|
| 阴影 | hover:shadow-lg | 悬停时增强阴影 |
| 位移 | hover:-translate-y-1 | 悬停时向上移动 4px |
| 过渡 | transition-all duration-200 | 200ms 过渡动画 |

## 可访问性

- 使用语义化的 HTML 结构
- 支持键盘导航和鼠标交互
- 正确的 ARIA 属性
- 适当的对比度
