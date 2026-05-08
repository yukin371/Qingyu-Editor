# QyBookCover - 青羽书籍封面组件

青羽风格的书籍封面组件，用于展示书籍封面，支持玻璃拟态边框、阴影效果和悬停缩放。

## 功能特性

- ✨ 玻璃拟态边框效果
- 🎨 可选阴影效果
- 📏 三种尺寸规格（sm、md、lg）
- 🔍 悬停放大效果
- 🖼️ 封面缺失时的 fallback 图标
- 🖱️ 点击事件支持

## 基础用法

```vue
<template>
  <QyBookCover
    src="https://example.com/cover.jpg"
    title="凡人修仙传"
    size="md"
    :shadow="true"
    @click="handleCoverClick"
  />
</template>

<script setup lang="ts">
import QyBookCover from '@/design-system/components/business'

const handleCoverClick = () => {
  console.log('查看书籍详情')
}
</script>
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| src | `string` | - | **必填** - 封面图片 URL |
| title | `string` | - | **必填** - 书籍标题 |
| size | `'sm' \| 'md' \| 'lg'` | `'md'` | 尺寸规格 |
| shadow | `boolean` | `true` | 是否显示阴影 |
| clickAction | `() => void` | - | 点击回调函数 |

## Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| click | `(event: MouseEvent)` | 封面被点击时触发 |

## 尺寸规格

| 尺寸 | 宽度 | 高度 | 圆角 | 用途 |
|------|------|------|------|------|
| sm | 96px (w-24) | 128px (h-32) | rounded-lg | 列表项、小卡片 |
| md | 128px (w-32) | 176px (h-44) | rounded-xl | 网格布局、卡片 |
| lg | 192px (w-48) | 256px (h-64) | rounded-2xl | 详情页、大图展示 |

## 样式特性

### 玻璃拟态效果
```css
bg-white/60 backdrop-blur-xl border border-white/50
```

### 悬停效果
- 图片缩放: `hover:scale-110`
- 阴影增强: `group-hover:shadow-xl group-hover:shadow-cyan-500/20`

### 渐变叠加层
```css
bg-gradient-to-br from-cyan-500/5 to-blue-500/5
```

## 完整示例

```vue
<template>
  <div class="space-y-8">
    <!-- 小尺寸封面 -->
    <div class="flex items-center space-x-4">
      <QyBookCover
        src="https://example.com/cover1.jpg"
        title="凡人修仙传"
        size="sm"
        @click="goToDetail('book1')"
      />
      <div>
        <h3 class="text-lg font-bold">凡人修仙传</h3>
        <p class="text-sm text-slate-600">忘语</p>
      </div>
    </div>

    <!-- 中等尺寸封面（网格布局） -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
      <QyBookCover
        v-for="book in books"
        :key="book.id"
        :src="book.cover"
        :title="book.title"
        size="md"
        @click="goToDetail(book.id)"
      />
    </div>

    <!-- 大尺寸封面（详情页） -->
    <div class="flex justify-center">
      <QyBookCover
        src="https://example.com/cover.jpg"
        title="遮天"
        size="lg"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { QyBookCover } from '@/design-system/components/business'

const books = ref([
  { id: '1', title: '凡人修仙传', cover: 'https://example.com/cover1.jpg' },
  { id: '2', title: '遮天', cover: 'https://example.com/cover2.jpg' },
  { id: '3', title: '圣墟', cover: 'https://example.com/cover3.jpg' },
  { id: '4', title: '完美世界', cover: 'https://example.com/cover4.jpg' }
])

const goToDetail = (bookId: string) => {
  console.log('导航到书籍详情:', bookId)
}
</script>
```

## Fallback 处理

当 `src` 为空或图片加载失败时，组件会显示一个默认的书籍图标：

```vue
<QyBookCover
  title="未命名书籍"
  size="md"
  src=""
/>
```

## 无障碍支持

- 图片包含 `alt` 属性（使用 title 属性值）
- 语义化的 HTML 结构
- 键盘可访问（点击事件）

## 响应式设计

### 移动端
- 使用 sm 尺寸：适合列表项
- 使用 md 尺寸：2 列网格

### 平板
- 使用 md 尺寸：3-4 列网格
- 使用 lg 尺寸：2 列网格

### 桌面
- 使用 md 尺寸：4-6 列网格
- 使用 lg 尺寸：3-4 列网格

## 使用场景

1. **书籍列表**: 使用 sm 尺寸，配合标题并排显示
2. **书籍网格**: 使用 md 尺寸，多列布局
3. **书籍详情**: 使用 lg 尺寸，突出显示封面
4. **推荐书籍**: 使用 md 或 lg 尺寸，带阴影效果

## 注意事项

1. 建议封面图片使用 3:4 比例（与组件尺寸匹配）
2. 大尺寸图片建议使用 WebP 格式以优化加载
3. 可以通过 `shadow` 属性控制阴影显示
4. sm 尺寸会在封面下方显示标题
