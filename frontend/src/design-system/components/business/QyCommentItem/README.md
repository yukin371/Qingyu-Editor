# QyCommentItem - 青羽评论项组件

青羽风格的评论项组件，用于在讨论串中展示单条评论，支持头像、用户名、内容、时间戳、点赞和回复功能。

## 功能特性

- 👤 头像展示（带光环）
- 👤 用户名和时间戳
- 💬 评论内容
- ❤️ 点赞功能（带计数）
- ↩️ 回复按钮
- 🎭 悬停高亮效果
- ✨ 玻璃拟态设计

## 基础用法

```vue
<template>
  <QyCommentItem
    avatar="https://example.com/avatar.jpg"
    username="书虫小明"
    content="这本书太精彩了！强烈推荐大家阅读。"
    timestamp="2小时前"
    :like-count="42"
    :is-liked="false"
    @like="handleLike"
    @reply="handleReply"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import QyCommentItem from '@/design-system/components/business'

const handleLike = () => {
  console.log('点赞评论')
}

const handleReply = () => {
  console.log('回复评论')
}
</script>
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| avatar | `string` | - | **必填** - 头像 URL |
| username | `string` | - | **必填** - 用户名 |
| content | `string` | - | **必填** - 评论内容 |
| timestamp | `string` | - | **必填** - 时间戳（如"2小时前"） |
| likeCount | `number` | `undefined` | 点赞数 |
| likeAction | `() => void` | `undefined` | 点赞回调 |
| replyAction | `() => void` | `undefined` | 回复回调 |
| isLiked | `boolean` | `false` | 是否已点赞 |

## Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| like | - | 点赞按钮被点击时触发 |
| reply | - | 回复按钮被点击时触发 |

## 样式特性

### 玻璃拟态效果
```css
bg-white/60 backdrop-blur-xl border border-white/50 rounded-2xl
```

### 头像光环
```css
ring-2 ring-cyan-500/20
```

### 悬停效果
- 阴影增强: `hover:shadow-md hover:shadow-cyan-500/5`
- 背景提亮: `hover:bg-white/70`

### 点赞按钮
- 未点赞: `text-slate-500 hover:text-cyan-600`
- 已点赞: `text-red-500 hover:text-red-600`

### 回复按钮
```css
text-slate-500 hover:text-cyan-600
```

## 完整示例

```vue
<template>
  <div class="space-y-4">
    <!-- 评论列表 -->
    <QyCommentItem
      v-for="comment in comments"
      :key="comment.id"
      :avatar="comment.user.avatar"
      :username="comment.user.name"
      :content="comment.content"
      :timestamp="comment.timestamp"
      :like-count="comment.likes"
      :is-liked="comment.isLiked"
      @like="toggleLike(comment.id)"
      @reply="openReplyDialog(comment.id)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { QyCommentItem } from '@/design-system/components/business'

interface Comment {
  id: string
  user: {
    avatar: string
    name: string
  }
  content: string
  timestamp: string
  likes: number
  isLiked: boolean
}

const comments = ref<Comment[]>([
  {
    id: '1',
    user: {
      avatar: 'https://example.com/avatar1.jpg',
      name: '书虫小明'
    },
    content: '这本书太精彩了！情节跌宕起伏，人物刻画生动。',
    timestamp: '2小时前',
    likes: 42,
    isLiked: true
  },
  {
    id: '2',
    user: {
      avatar: 'https://example.com/avatar2.jpg',
      name: '阅读达人'
    },
    content: '同意楼上的观点，作者的文字功底真的很扎实。',
    timestamp: '1小时前',
    likes: 28,
    isLiked: false
  },
  {
    id: '3',
    user: {
      avatar: 'https://example.com/avatar3.jpg',
      name: '新书推荐官'
    },
    content: '我已经看了三遍了，每次都有新的感悟。',
    timestamp: '30分钟前',
    likes: 15,
    isLiked: false
  }
])

const toggleLike = (commentId: string) => {
  const comment = comments.value.find(c => c.id === commentId)
  if (comment) {
    comment.isLiked = !comment.isLiked
    comment.likes += comment.isLiked ? 1 : -1
  }
}

const openReplyDialog = (commentId: string) => {
  console.log('回复评论:', commentId)
}
</script>
```

## 嵌套评论（回复）

```vue
<template>
  <div class="space-y-4">
    <!-- 主评论 -->
    <QyCommentItem
      avatar="https://example.com/avatar1.jpg"
      username="书虫小明"
      content="这本书太精彩了！"
      timestamp="2小时前"
      :like-count="42"
      @reply="showReplies = !showReplies"
    />

    <!-- 嵌套回复 -->
    <div v-if="showReplies" class="ml-12 space-y-3">
      <QyCommentItem
        v-for="reply in replies"
        :key="reply.id"
        :avatar="reply.avatar"
        :username="reply.username"
        :content="reply.content"
        :timestamp="reply.timestamp"
        :like-count="reply.likes"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { QyCommentItem } from '@/design-system/components/business'

const showReplies = ref(false)
const replies = ref([
  {
    id: '1',
    avatar: 'https://example.com/avatar2.jpg',
    username: '阅读达人',
    content: '同意！',
    timestamp: '1小时前',
    likes: 5
  }
])
</script>
```

## 使用场景

### 1. 书籍评论
```vue
<QyCommentItem
  avatar="https://example.com/avatar.jpg"
  username="书虫小明"
  content="这本书的情节设计太巧妙了，强烈推荐！"
  timestamp="2小时前"
  :like-count="42"
  :is-liked="true"
  @like="handleLike"
  @reply="openReplyBox"
/>
```

### 2. 章节评论
```vue
<QyCommentItem
  avatar="https://example.com/avatar.jpg"
  username="阅读达人"
  content="这一章的伏笔埋得太好了，期待后续发展！"
  timestamp="30分钟前"
  :like-count="15"
  @like="handleLike"
/>
```

### 3. 书评区
```vue
<div class="space-y-4">
  <QyCommentItem
    v-for="review in bookReviews"
    :key="review.id"
    :avatar="review.user.avatar"
    :username="review.user.name"
    :content="review.content"
    :timestamp="review.timestamp"
    :like-count="review.likes"
    :is-liked="review.isLiked"
    @like="toggleLike(review.id)"
    @reply="replyToReview(review.id)"
  />
</div>
```

## 无障碍支持

- 头像包含 `alt` 属性（使用 username）
- 语义化的按钮结构
- 键盘可访问（点击事件）

## 响应式设计

### 移动端
- 头像尺寸保持 40px (w-10 h-10)
- 内边距适当减小
- 文字大小保持不变

### 平板/桌面
- 标准间距和内边距
- 悬停效果更明显

## 注意事项

1. 头像建议使用正方形图片（1:1 比例）
2. `timestamp` 应该是相对时间格式（如"2小时前"、"30分钟前"）
3. `likeAction` 和 `replyAction` 存在时才显示对应按钮
4. `likeCount` 存在时才显示点赞数
5. 已点赞状态下，点赞按钮显示为红色
