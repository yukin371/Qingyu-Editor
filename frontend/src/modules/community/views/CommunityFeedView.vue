<template>
  <div class="community-feed-view">
    <div class="container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1>社区动态</h1>
        <QyButton variant="primary" @click="goToCreatePost">
          <QyIcon name="Plus" />
          发布动态
        </QyButton>
      </div>

      <!-- 动态列表 -->
      <div v-if="store.hasPosts" class="feed-list">
        <PostCard
          v-for="post in store.posts"
          :key="post.id"
          :post="post"
          @like="handleLike"
          @comment="handleComment"
          @share="handleShare"
          @bookmark="handleBookmark"
        />
      </div>

      <!-- 加载状态 -->
      <div v-else-if="store.loading" class="loading-state">
        <Skeleton v-for="i in 3" :key="i" height="200px" animated />
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <Empty description="还没有动态，快来发布第一条动态吧！">
          <template #image>
            <QyIcon name="ChatDotRound" :size="120" color="#ddd" />
          </template>
          <template #extra>
            <QyButton variant="primary" @click="goToCreatePost">发布动态</QyButton>
          </template>
        </Empty>
      </div>

      <!-- 加载更多 -->
      <div v-if="store.hasPosts" class="load-more">
        <QyButton
          v-if="store.posts.length < store.total"
          variant="outline"
          :loading="store.loading"
          @click="loadMore"
        >
          加载更多
        </QyButton>
        <span v-else class="no-more">— 没有更多动态了 —</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { QyIcon, QyButton } from '@/design-system/components'
import { Empty } from '@/design-system/base'
import { Skeleton } from '@/design-system/base'
import { useCommunityStore } from '../stores/community.store'
import PostCard from '../components/PostCard.vue'

const router = useRouter()
const store = useCommunityStore()

onMounted(async () => {
  if (!store.hasPosts) {
    await store.fetchPosts({ page: 1, size: 15 })
  }
})

const goToCreatePost = () => {
  router.push('/community/post')
}

const handleLike = async (postId: string) => {
  await store.toggleLike(postId)
}

const handleComment = (postId: string) => {
  router.push(`/community/post/${postId}`)
}

const handleShare = (postId: string) => {
  // 分享功能
  console.log('分享动态:', postId)
}

const handleBookmark = (postId: string) => {
  // 收藏功能
  console.log('收藏动态:', postId)
}

const loadMore = async () => {
  const nextPage = Math.floor(store.posts.length / 15) + 1
  await store.fetchPosts({ page: nextPage, size: 15 })
}
</script>

<style scoped lang="scss">
.community-feed-view {
  min-height: 100vh;
  background: #f8f9fb;
  padding: 20px 0;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding: 24px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.05);

  h1 {
    font-size: 28px;
    font-weight: 700;
    color: #2c3e50;
    margin: 0;
  }
}

.feed-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background: #fff;
  border-radius: 20px;
}

.empty-state {
  padding: 60px 20px;
  background: #fff;
  border-radius: 20px;
  text-align: center;
}

.load-more {
  margin-top: 24px;
  text-align: center;
}

.no-more {
  color: #999;
  font-size: 14px;
}
</style>
