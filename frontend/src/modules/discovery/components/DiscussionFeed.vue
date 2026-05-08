<template>
  <div class="discussion-feed">
    <div v-if="posts.length === 0" class="empty-state">
      <el-icon :size="64" color="#ddd">
        <ChatDotRound />
      </el-icon>
      <p>暂无讨论内容</p>
    </div>

    <div v-else class="feed-list">
      <PostCard
        v-for="post in posts"
        :key="post.id"
        :post="post"
        @click="handlePostClick"
        @like="handleLike"
        @comment="handleComment"
        @share="handleShare"
        @topic="handleTopicClick"
      />
    </div>

    <!-- 加载更多 -->
    <div v-if="hasMore" class="load-more">
      <el-button @click="loadMore" :loading="loading"> 加载更多 </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ChatDotRound } from '@element-plus/icons-vue'
import PostCard from '@/modules/community/components/PostCard.vue'
import type { Post } from '@/types/community'

const route = useRoute()
const isTestMode = computed(() => route.query.test === 'true')

// Mock数据（仅在test模式使用）
const mockPosts: Post[] = [
  {
    id: '1',
    userId: 'u1',
    user: {
      id: 'u1',
      username: 'booklover1',
      nickname: '书虫小王',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
      level: 5,
    },
    type: 'text',
    content:
      '最近读完《百年孤独》，真的被马尔克斯的想象力震撼到了！家族七代人的传奇故事，充满了魔幻现实主义的色彩。强烈推荐给喜欢文学的朋友们！',
    topics: ['读书笔记', '文学经典'],
    likeCount: 128,
    commentCount: 32,
    shareCount: 15,
    isLiked: false,
    isBookmarked: false,
    createdAt: '2025-02-05T10:30:00Z',
    updatedAt: '2025-02-05T10:30:00Z',
  },
  {
    id: '2',
    userId: 'u2',
    user: {
      id: 'u2',
      username: 'readingfan',
      nickname: '阅读达人',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
      level: 8,
    },
    type: 'book_recommendation',
    content: '分享一本最近读到的好书《三体》！刘慈欣的科幻巨作，让人思考宇宙的无限可能。',
    book: {
      bookId: 'b1',
      title: '三体',
      cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&h=280&fit=crop',
      author: '刘慈欣',
    },
    topics: ['科幻', '推荐'],
    likeCount: 256,
    commentCount: 48,
    shareCount: 32,
    isLiked: true,
    isBookmarked: false,
    createdAt: '2025-02-05T08:15:00Z',
    updatedAt: '2025-02-05T08:15:00Z',
  },
  {
    id: '3',
    userId: 'u3',
    user: {
      id: 'u3',
      username: 'nightowl',
      nickname: '夜猫子',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
      level: 3,
    },
    type: 'image',
    content: '今天在书店发现这本珍藏版，装帧太美了！忍不住拍下来分享给大家~',
    images: [
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop',
    ],
    topics: ['书店', '收藏'],
    likeCount: 89,
    commentCount: 18,
    shareCount: 8,
    isLiked: false,
    isBookmarked: false,
    createdAt: '2025-02-04T20:45:00Z',
    updatedAt: '2025-02-04T20:45:00Z',
  },
  {
    id: '4',
    userId: 'u4',
    user: {
      id: 'u4',
      username: 'philosopher',
      nickname: '思考者',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4',
      level: 6,
    },
    type: 'text',
    content:
      '有没有人和我一样，喜欢在雨天窝在沙发上看书？这种感觉太惬意了~大家雨天都喜欢读什么类型的书呢？',
    topics: ['闲聊', '读书日常'],
    likeCount: 167,
    commentCount: 56,
    shareCount: 12,
    isLiked: false,
    isBookmarked: true,
    createdAt: '2025-02-04T16:20:00Z',
    updatedAt: '2025-02-04T16:20:00Z',
  },
]

const posts = ref<Post[]>([])
const loading = ref(false)
const hasMore = ref(false)

onMounted(async () => {
  if (isTestMode.value) {
    posts.value = mockPosts
    return
  }
  // TODO: 调用真实 API
  // try {
  //   const res = await fetchDiscussionFeed()
  //   posts.value = res
  // } catch (e) {
  //   error.value = true
  // }
})

function handlePostClick(post: Post) {
  console.log('点击帖子:', post)
  // 跳转到帖子详情
}

function handleLike(postId: string) {
  const post = posts.value.find((p) => p.id === postId)
  if (post) {
    post.isLiked = !post.isLiked
    post.likeCount += post.isLiked ? 1 : -1
  }
}

function handleComment(postId: string) {
  console.log('评论帖子:', postId)
}

function handleShare(postId: string) {
  console.log('分享帖子:', postId)
}

function handleTopicClick(topic: string) {
  console.log('点击话题:', topic)
}

function loadMore() {
  loading.value = true
  // 模拟加载
  setTimeout(() => {
    loading.value = false
    hasMore.value = false
  }, 1000)
}
</script>

<style scoped lang="scss">
.discussion-feed {
  min-height: 400px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: #999;

  p {
    margin-top: 16px;
    font-size: 14px;
  }
}

.feed-list {
  display: flex;
  flex-direction: column;
}

.load-more {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  padding: 20px 0;

  .el-button {
    min-width: 120px;
  }
}
</style>
