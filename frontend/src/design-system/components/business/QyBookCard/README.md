# QyBookCard - 青羽书籍卡片组件

青羽风格的书籍卡片组件，用于展示书籍信息，支持封面、评分、标签、阅读进度和状态徽章。

## 功能特性

- ✨ 玻璃拟态设计效果
- 📚 封面图片展示（带 fallback）
- ⭐ 评分星级显示
- 🏷️ 青色/蓝色标签
- 📊 阅读进度条
- 🎯 状态徽章（阅读中=青色，已完成=绿色，计划中=灰色）
- 🎭 悬停上浮效果
- 🖱️ 点击查看详情

## 基础用法

```vue
<template>
  <QyBookCard
    title="凡人修仙传"
    author="忘语"
    cover="https://example.com/cover.jpg"
    :rating="4.5"
    :tags="['玄幻', '修真']"
    :read-progress="75"
    status="reading"
    @click="handleBookClick"
  />
</template>

<script setup lang="ts">
import QyBookCard from '@/design-system/components/business'

const handleBookClick = () => {
  console.log('查看书籍详情')
}
</script>
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| title | `string` | - | **必填** - 书籍标题 |
| author | `string` | - | **必填** - 作者名称 |
| cover | `string` | `''` | 封面图片 URL |
| description | `string` | `''` | 简短描述 |
| rating | `number` | `0` | 评分（0-5） |
| tags | `string[]` | `[]` | 标签数组（如 "玄幻"、"修真"） |
| readProgress | `number` | `undefined` | 阅读进度（0-100） |
| status | `'reading' \| 'completed' \| 'planned'` | `undefined` | 阅读状态 |
| clickAction | `() => void` | - | 点击回调函数 |

## Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| click | `(event: MouseEvent)` | 卡片被点击时触发 |

## 状态说明

- `reading` - 阅读中（青色徽章）
- `completed` - 已完成（绿色徽章）
- `planned` - 计划中（灰色徽章）

## 样式特性

- **玻璃拟态**: `bg-white/60 backdrop-blur-xl border border-white/50`
- **圆角**: `rounded-3xl`（大圆角）
- **悬停效果**: 
  - 阴影增强: `hover:shadow-xl hover:shadow-cyan-500/10`
  - 上移动画: `hover:-translate-y-1`
  - 封面缩放: `hover:scale-105`
- **动画时长**: `duration-500`（流畅动画）

## 完整示例

```vue
<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <!-- 阅读中的书籍 -->
    <QyBookCard
      title="凡人修仙传"
      author="忘语"
      cover="https://example.com/cover1.jpg"
      description="一个普通山村少年，偶然之下跨入到一个江湖小门派..."
      :rating="4.5"
      :tags="['玄幻', '修真', '仙侠']"
      :read-progress="75"
      status="reading"
    />

    <!-- 已完成的书籍 -->
    <QyBookCard
      title="遮天"
      author="辰东"
      cover="https://example.com/cover2.jpg"
      :rating="5.0"
      :tags="['玄幻', '仙侠']"
      :read-progress="100"
      status="completed"
    />

    <!-- 计划阅读的书籍 -->
    <QyBookCard
      title="圣墟"
      author="辰东"
      cover="https://example.com/cover3.jpg"
      description="葬龙之战后，地球灵气枯竭..."
      :rating="4.2"
      :tags="['玄幻', '科幻']"
      status="planned"
    />
  </div>
</template>

<script setup lang="ts">
import { QyBookCard } from '@/design-system/components/business'
</script>
```

## 无障碍支持

- 图片包含 `alt` 属性
- 语义化的 HTML 结构
- 键盘可访问（点击事件）

## 响应式设计

组件完全响应式，可以在不同屏幕尺寸下正常显示：
- 移动端：全宽显示
- 平板：2 列布局
- 桌面：3-4 列布局

## 注意事项

1. `cover` 图片建议使用 16:9 比例
2. `tags` 最多显示 3 个，超出显示 "+N"
3. `rating` 显示 0-5 星，支持半星显示
4. `readProgress` 只在有值时显示进度条
