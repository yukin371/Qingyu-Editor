# 通用组件使用文档

> **更新日期**: 2025-10-20  
> **组件版本**: v2.0  
> **状态**: ✅ 已完成

---

## 📋 组件概览

本目录包含项目的通用组件，这些组件可以在整个应用中复用，提供一致的用户体验。所有组件均使用 TypeScript 开发。

| 组件名              | 描述         | 文件                  | 状态     |
| ------------------- | ------------ | --------------------- | -------- |
| **BookCard**        | 书籍卡片组件 | `BookCard.vue`        | ✅ 已完成 |
| **ChapterList**     | 章节列表组件 | `ChapterList.vue`     | ✅ 已完成 |
| **ReadingSettings** | 阅读设置组件 | `ReadingSettings.vue` | ✅ 已完成 |
| **Loading**         | 加载状态组件 | `Loading.vue`         | ✅ 已完成 |
| **Empty**           | 空状态组件   | `Empty.vue`           | ✅ 已完成 |

---

## 📖 BookCard 组件

### 功能说明

BookCard 组件用于展示书籍信息，支持垂直和水平两种布局，可用于书籍列表、推荐等场景。

### Props

| 参数           | 类型                         | 默认值       | 说明             |
| -------------- | ---------------------------- | ------------ | ---------------- |
| `book`         | `BookBrief`                  | 必需         | 书籍数据对象     |
| `layout`       | `'vertical' \| 'horizontal'` | `'vertical'` | 布局方式         |
| `showStatus`   | `Boolean`                    | `true`       | 是否显示状态标签 |
| `showMeta`     | `Boolean`                    | `true`       | 是否显示元数据   |
| `showLatest`   | `Boolean`                    | `false`      | 是否显示最新章节 |
| `showActions`  | `Boolean`                    | `false`      | 是否显示操作按钮 |
| `showProgress` | `Boolean`                    | `false`      | 是否显示阅读进度 |
| `progress`     | `Number`                     | -            | 阅读进度(0-100)  |

### Events

| 事件名     | 参数              | 说明               |
| ---------- | ----------------- | ------------------ |
| `click`    | `book: BookBrief` | 点击卡片时触发     |
| `read`     | `book: BookBrief` | 点击阅读按钮时触发 |
| `favorite` | `book: BookBrief` | 点击收藏按钮时触发 |

### Slots

| 插槽名    | 说明               |
| --------- | ------------------ |
| `actions` | 自定义操作按钮区域 |

### 使用示例

```vue
<template>
  <BookCard
    :book="bookData"
    layout="horizontal"
    show-actions
    @click="goToDetail"
    @read="startReading"
  />
</template>

<script setup lang="ts">
import BookCard from '@/components/common/BookCard.vue'
import type { BookBrief } from '@/types/models'

const bookData: BookBrief = {
  id: '1',
  title: '示例书籍',
  author: '作者名',
  cover: '/cover.jpg',
  // ...
}

const goToDetail = (book: BookBrief) => {
  router.push(`/books/${book.id}`)
}
</script>
```

---

## 📚 ChapterList 组件

### 功能说明

ChapterList 组件用于展示书籍章节列表，支持正序/倒序排列、显示阅读状态等功能。

### Props

| 参数              | 类型                | 默认值    | 说明             |
| ----------------- | ------------------- | --------- | ---------------- |
| `chapters`        | `ChapterListItem[]` | 必需      | 章节列表         |
| `activeChapterId` | `String`            | -         | 当前激活的章节ID |
| `maxHeight`       | `String \| Number`  | `'600px'` | 最大高度         |
| `showNumber`      | `Boolean`           | `true`    | 是否显示章节序号 |
| `showWordCount`   | `Boolean`           | `true`    | 是否显示字数     |
| `showTime`        | `Boolean`           | `false`   | 是否显示发布时间 |
| `showSort`        | `Boolean`           | `true`    | 是否显示排序按钮 |
| `defaultReversed` | `Boolean`           | `false`   | 默认是否倒序     |

### Events

| 事件名       | 参数                       | 说明           |
| ------------ | -------------------------- | -------------- |
| `select`     | `chapter: ChapterListItem` | 选择章节时触发 |
| `sortChange` | `isReversed: boolean`      | 排序变化时触发 |

### Slots

| 插槽名           | 说明         |
| ---------------- | ------------ |
| `header-actions` | 头部操作区域 |

### 使用示例

```vue
<template>
  <ChapterList
    :chapters="chapterList"
    :active-chapter-id="currentChapterId"
    @select="handleChapterSelect"
  />
</template>

<script setup lang="ts">
import ChapterList from '@/components/common/ChapterList.vue'
import type { ChapterListItem } from '@/types/models'

const chapterList = ref<ChapterListItem[]>([])
const currentChapterId = ref('chapter-1')

const handleChapterSelect = (chapter: ChapterListItem) => {
  router.push(`/reader/${chapter.id}`)
}
</script>
```

---

## ⚙️ ReadingSettings 组件

### 功能说明

ReadingSettings 组件用于调整阅读器设置，包括字体、主题、行距等。

### Props

| 参数           | 类型              | 默认值 | 说明                    |
| -------------- | ----------------- | ------ | ----------------------- |
| `modelValue`   | `ReadingSettings` | 必需   | 设置数据（支持v-model） |
| `showPageMode` | `Boolean`         | `true` | 是否显示翻页模式        |
| `showAutoSave` | `Boolean`         | `true` | 是否显示自动保存        |
| `showActions`  | `Boolean`         | `true` | 是否显示操作按钮        |

### Events

| 事件名              | 参数                     | 说明               |
| ------------------- | ------------------------ | ------------------ |
| `update:modelValue` | `value: ReadingSettings` | 设置更新时触发     |
| `reset`             | -                        | 点击重置按钮时触发 |

### 使用示例

```vue
<template>
  <ReadingSettings
    v-model="settings"
    @reset="resetToDefault"
  />
</template>

<script setup lang="ts">
import ReadingSettings from '@/components/common/ReadingSettings.vue'
import type { ReadingSettings as Settings } from '@/types/models'

const settings = ref<Settings>({
  fontSize: 16,
  lineHeight: 1.8,
  pageWidth: 800,
  theme: 'light',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  pageMode: 'scroll',
  autoSave: true
})

const resetToDefault = () => {
  settings.value = { /* 默认设置 */ }
}
</script>
```

---

## 🔄 Loading 组件

### 功能说明

Loading组件用于显示加载状态，支持全屏加载、局部加载和骨架屏三种模式。

### Props

| 参数           | 类型      | 默认值        | 说明               |
| -------------- | --------- | ------------- | ------------------ |
| `visible`      | `Boolean` | `true`        | 是否显示加载状态   |
| `fullscreen`   | `Boolean` | `false`       | 是否全屏显示       |
| `text`         | `String`  | `'加载中...'` | 加载提示文本       |
| `size`         | `Number`  | `40`          | 图标大小（px）     |
| `skeleton`     | `Boolean` | `false`       | 是否使用骨架屏模式 |
| `skeletonRows` | `Number`  | `5`           | 骨架屏行数         |

---

## 📦 Empty 组件

### 功能说明

Empty组件用于显示空状态，提供多种预设类型和自定义选项。

### Props

| 参数          | 类型      | 默认值           | 可选值                                         | 说明             |
| ------------- | --------- | ---------------- | ---------------------------------------------- | ---------------- |
| `type`        | `String`  | `'default'`      | `default`, `search`, `data`, `folder`, `error` | 空状态类型       |
| `title`       | `String`  | 根据type自动生成 | -                                              | 标题文本         |
| `description` | `String`  | 根据type自动生成 | -                                              | 描述文本         |
| `iconSize`    | `Number`  | `80`             | -                                              | 图标大小（px）   |
| `showAction`  | `Boolean` | `false`          | -                                              | 是否显示操作按钮 |
| `actionText`  | `String`  | `'返回首页'`     | -                                              | 操作按钮文本     |

---

## 🛠️ 工具函数

### format.ts

格式化工具函数集合，位于 `src/utils/format.ts`

#### 函数列表

| 函数名               | 参数                                                 | 返回值   | 说明                   |
| -------------------- | ---------------------------------------------------- | -------- | ---------------------- |
| `formatNumber`       | `num: number`                                        | `string` | 格式化数字（万为单位） |
| `formatRelativeTime` | `time: string \| Date`                               | `string` | 格式化相对时间         |
| `formatDate`         | `date: string \| Date, format?: string`              | `string` | 格式化日期             |
| `formatFileSize`     | `bytes: number`                                      | `string` | 格式化文件大小         |
| `formatReadingTime`  | `minutes: number`                                    | `string` | 格式化阅读时长         |
| `formatPrice`        | `price: number, currency?: string`                   | `string` | 格式化价格             |
| `truncateText`       | `text: string, maxLength: number, ellipsis?: string` | `string` | 截断文本               |
| `formatPercentage`   | `value: number, decimals?: number`                   | `string` | 格式化百分比           |

#### 使用示例

```typescript
import { formatNumber, formatRelativeTime, formatDate } from '@/utils/format'

// 格式化数字
const readCount = formatNumber(125000) // "12.5万"

// 格式化相对时间
const timeAgo = formatRelativeTime('2024-01-01') // "3个月前"

// 格式化日期
const dateStr = formatDate(new Date(), 'YYYY-MM-DD') // "2025-10-20"

// 格式化阅读时长
const readingTime = formatReadingTime(125) // "2小时5分钟"
```

---

## 🎯 开发指南

### 创建新组件

1. 在 `src/components/common/` 目录下创建新组件文件
2. 组件名使用 PascalCase 命名
3. 使用 `<script setup lang="ts">` 编写TypeScript代码
4. 定义清晰的 Props 和 Events 接口
5. 提供完整的类型定义
6. 编写响应式样式（SCSS）
7. 更新本 README 文件

### 组件规范

- ✅ 所有组件必须使用 TypeScript
- ✅ 使用 Composition API（`<script setup>`）
- ✅ 提供完整的类型定义
- ✅ 支持响应式设计（移动端/桌面端）
- ✅ 遵循无障碍访问标准
- ✅ 提供合理的默认值
- ✅ 使用 Element Plus 组件库
- ✅ 使用 SCSS 编写样式
- ✅ 组件应该可复用且易于维护

### 最佳实践

1. **Props 设计**：提供合理的默认值，使用 `withDefaults` 定义
2. **Events 命名**：使用动词形式，如 `click`、`select`、`change`
3. **类型定义**：充分利用 TypeScript，避免使用 `any`
4. **样式隔离**：使用 `scoped` 样式，避免全局污染
5. **响应式**：使用媒体查询适配不同屏幕尺寸

---

**文档版本**: v2.0  
**最后更新**: 2025年10月20日  
**维护者**: 青羽开发团队
