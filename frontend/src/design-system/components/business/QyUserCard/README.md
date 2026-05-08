# QyUserCard - 青羽用户卡片组件

青羽风格的用户卡片组件，用于在社交场景中展示用户信息，支持头像、等级徽章、统计数据和关注按钮。

## 功能特性

- 👤 头像展示（带光环效果）
- 🏆 等级徽章（渐变背景）
- 📝 用户简介
- 📊 关注者/关注中统计
- 💙 关注按钮
- 🎭 悬停上浮效果
- ✨ 玻璃拟态设计

## 基础用法

```vue
<template>
  <QyUserCard
    avatar="https://example.com/avatar.jpg"
    username="书虫小明"
    bio="热爱阅读，喜欢玄幻小说"
    :follower-count="1234"
    :following-count="567"
    :level="25"
    @click="goToUserProfile"
    @follow="handleFollow"
  />
</template>

<script setup lang="ts">
import QyUserCard from '@/design-system/components/business'

const goToUserProfile = () => {
  console.log('跳转到用户主页')
}

const handleFollow = () => {
  console.log('关注用户')
}
</script>
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| avatar | `string` | - | **必填** - 头像 URL |
| username | `string` | - | **必填** - 用户名 |
| bio | `string` | `''` | 用户简介 |
| followerCount | `number` | `undefined` | 关注者数量 |
| followingCount | `number` | `undefined` | 关注中数量 |
| level | `number` | `undefined` | 用户等级 |
| clickAction | `() => void` | - | 点击卡片回调 |
| followAction | `() => void` | - | 关注按钮回调 |

## Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| click | `(event: MouseEvent)` | 卡片被点击时触发 |
| follow | - | 关注按钮被点击时触发 |

## 样式特性

### 玻璃拟态效果
```css
bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl
```

### 头像光环
- 默认: `ring-4 ring-cyan-500/20`
- 悬停: `group-hover:ring-cyan-500/40`

### 等级徽章
- 渐变背景: `bg-gradient-to-r from-cyan-500 to-blue-500`
- 阴影: `shadow-lg`
- 圆角: `rounded-full`

### 悬停效果
- 卡片上浮: `hover:-translate-y-1`
- 阴影增强: `hover:shadow-xl hover:shadow-cyan-500/10`

## 数字格式化

组件会自动格式化大数字：
- `1,234` → `1.2K`
- `1,000,000` → `1.0M`

## 完整示例

```vue
<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <!-- 完整信息的用户卡片 -->
    <QyUserCard
      avatar="https://example.com/avatar1.jpg"
      username="书虫小明"
      bio="热爱阅读，喜欢玄幻小说，每天都要看书"
      :follower-count="12345"
      :following-count="567"
      :level="25"
      @click="viewProfile('user1')"
      @follow="followUser('user1')"
    />

    <!-- 简化信息的用户卡片 -->
    <QyUserCard
      avatar="https://example.com/avatar2.jpg"
      username="阅读达人"
      bio="分享阅读心得"
      :follower-count="8900"
      :level="30"
      @click="viewProfile('user2')"
    />

    <!-- 最简信息的用户卡片 -->
    <QyUserCard
      avatar="https://example.com/avatar3.jpg"
      username="新书推荐官"
      :level="15"
      @click="viewProfile('user3')"
      @follow="followUser('user3')"
    />
  </div>
</template>

<script setup lang="ts">
import { QyUserCard } from '@/design-system/components/business'

const viewProfile = (userId: string) => {
  console.log('查看用户主页:', userId)
}

const followUser = (userId: string) => {
  console.log('关注用户:', userId)
}
</script>
```

## 使用场景

### 1. 作者展示
```vue
<QyUserCard
  avatar="https://example.com/author-avatar.jpg"
  username="忘语"
  bio="《凡人修仙传》作者"
  :follower-count="500000"
  :level="99"
/>
```

### 2. 书友推荐
```vue
<QyUserCard
  avatar="https://example.com/user-avatar.jpg"
  username="书虫小明"
  bio="喜欢看玄幻小说"
  :follower-count="1234"
  :following-count="567"
  :level="25"
  @follow="handleFollow"
/>
```

### 3. 关注列表
```vue
<div class="grid grid-cols-2 gap-4">
  <QyUserCard
    v-for="user in following"
    :key="user.id"
    :avatar="user.avatar"
    :username="user.username"
    :bio="user.bio"
    :level="user.level"
    @click="viewProfile(user.id)"
  />
</div>
```

## 无障碍支持

- 头像包含 `alt` 属性（使用 username）
- 语义化的 HTML 结构
- 键盘可访问（点击事件）

## 响应式设计

### 移动端
- 单列布局
- 头像尺寸保持不变
- 内边距适当减小

### 平板
- 2 列布局
- 标准间距

### 桌面
- 3-4 列布局
- 标准间距和内边距

## 注意事项

1. 头像建议使用正方形图片（1:1 比例）
2. 简介最多显示 2 行，超出会截断
3. `followerAction` 存在时才显示关注按钮
4. 等级徽章只在 `level` 有值时显示
5. 数字格式化：≥1000 显示 K，≥1000000 显示 M
