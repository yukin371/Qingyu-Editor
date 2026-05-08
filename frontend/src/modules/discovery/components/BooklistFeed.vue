<template>
  <div class="booklist-feed">
    <div v-if="booklists.length === 0" class="empty-state">
      <el-icon :size="64" color="#ddd">
        <Collection />
      </el-icon>
      <p>暂无书单</p>
    </div>

    <div v-else class="booklist-grid">
      <div
        v-for="booklist in booklists"
        :key="booklist.id"
        class="booklist-card"
        @click="handleBooklistClick(booklist)"
      >
        <!-- 封面区域 -->
        <div class="booklist-cover">
          <div class="cover-images">
            <img
              v-for="(book, index) in booklist.books.slice(0, 3)"
              :key="index"
              :src="book.cover"
              :alt="book.title"
              class="cover-image"
              :style="{ transform: `rotate(${index * 5}deg) translateY(${index * 2}px)` }"
            />
          </div>
          <div class="cover-badge">{{ booklist.bookCount }}本书</div>
        </div>

        <!-- 内容区域 -->
        <div class="booklist-content">
          <h3 class="booklist-title">{{ booklist.title }}</h3>
          <p class="booklist-description">{{ booklist.description }}</p>

          <!-- 创建者信息 -->
          <div class="creator-info">
            <Avatar size="sm" :src="booklist.creator.avatar" :alt="booklist.creator.nickname" />
            <span class="creator-name">{{ booklist.creator.nickname }}</span>
          </div>

          <!-- 统计信息 -->
          <div class="booklist-stats">
            <div class="stat-item">
              <el-icon><View /></el-icon>
              <span>{{ formatCount(booklist.viewCount) }}</span>
            </div>
            <div class="stat-item">
              <el-icon><Star /></el-icon>
              <span>{{ formatCount(booklist.favoriteCount) }}</span>
            </div>
            <div class="stat-item">
              <el-icon><Collection /></el-icon>
              <span>{{ formatCount(booklist.bookCount) }}</span>
            </div>
          </div>

          <!-- 标签 -->
          <div v-if="booklist.tags?.length" class="booklist-tags">
            <el-tag v-for="tag in booklist.tags.slice(0, 3)" :key="tag" size="small" type="info">
              {{ tag }}
            </el-tag>
          </div>
        </div>
      </div>
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
import { Collection, View, Star } from '@element-plus/icons-vue'
import { Avatar } from '@/design-system/base'

interface Book {
  bookId: string
  title: string
  cover: string
  author: string
}

interface Creator {
  id: string
  username: string
  nickname: string
  avatar: string
}

interface Booklist {
  id: string
  title: string
  description: string
  cover: string
  books: Book[]
  bookCount: number
  creator: Creator
  viewCount: number
  favoriteCount: number
  isFavorited: boolean
  tags: string[]
  createdAt: string
  updatedAt: string
}

// Mock数据
const mockBooklists: Booklist[] = [
  {
    id: 'bl1',
    title: '科幻迷必读经典',
    description: '精选20本科幻小说，从三体到沙丘，带你领略宇宙的无限可能',
    cover: '',
    books: [
      {
        bookId: 'b1',
        title: '三体',
        cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&h=280&fit=crop',
        author: '刘慈欣',
      },
      {
        bookId: 'b2',
        title: '沙丘',
        cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&h=280&fit=crop',
        author: '弗兰克·赫伯特',
      },
      {
        bookId: 'b3',
        title: '银河帝国',
        cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200&h=280&fit=crop',
        author: '阿西莫夫',
      },
    ],
    bookCount: 20,
    creator: {
      id: 'u1',
      username: 'scififan',
      nickname: '科幻迷小张',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=scifi',
    },
    viewCount: 12580,
    favoriteCount: 2340,
    isFavorited: false,
    tags: ['科幻', '经典', '太空'],
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
  },
  {
    id: 'bl2',
    title: '治愈系书单｜缓解焦虑',
    description: '当你感到焦虑不安时，这些书能给你力量和慰藉',
    cover: '',
    books: [
      {
        bookId: 'b4',
        title: '小王子',
        cover: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=200&h=280&fit=crop',
        author: '圣埃克苏佩里',
      },
      {
        bookId: 'b5',
        title: '解忧杂货店',
        cover: 'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=200&h=280&fit=crop',
        author: '东野圭吾',
      },
    ],
    bookCount: 12,
    creator: {
      id: 'u2',
      username: 'bookhealer',
      nickname: '治愈系书单',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=healer',
    },
    viewCount: 8960,
    favoriteCount: 1560,
    isFavorited: true,
    tags: ['治愈', '心理', '成长'],
    createdAt: '2025-01-20T14:30:00Z',
    updatedAt: '2025-01-20T14:30:00Z',
  },
  {
    id: 'bl3',
    title: '2024年度最佳推理小说',
    description: '年度最佳推理小说榜单，挑战你的智商！',
    cover: '',
    books: [
      {
        bookId: 'b6',
        title: '白夜行',
        cover: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=200&h=280&fit=crop',
        author: '东野圭吾',
      },
      {
        bookId: 'b7',
        title: '嫌疑人X的献身',
        cover: 'https://images.unsplash.com/photo-1495631342678-477851d94a5c?w=200&h=280&fit=crop',
        author: '东野圭吾',
      },
    ],
    bookCount: 15,
    creator: {
      id: 'u3',
      username: 'detective',
      nickname: '推理达人',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=detective',
    },
    viewCount: 15620,
    favoriteCount: 3120,
    isFavorited: false,
    tags: ['推理', '悬疑', '烧脑'],
    createdAt: '2025-01-10T09:00:00Z',
    updatedAt: '2025-01-10T09:00:00Z',
  },
  {
    id: 'bl4',
    title: '历史爱好者的书架',
    description: '从古代到现代，了解历史的必读书单',
    cover: '',
    books: [
      {
        bookId: 'b8',
        title: '万历十五年',
        cover: 'https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=200&h=280&fit=crop',
        author: '黄仁宇',
      },
    ],
    bookCount: 18,
    creator: {
      id: 'u4',
      username: 'historian',
      nickname: '历史爱好者',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=history',
    },
    viewCount: 9230,
    favoriteCount: 1780,
    isFavorited: false,
    tags: ['历史', '人文', '经典'],
    createdAt: '2025-01-25T16:20:00Z',
    updatedAt: '2025-01-25T16:20:00Z',
  },
]

const route = useRoute()
const isTestMode = computed(() => route.query.test === 'true')

const booklists = ref<Booklist[]>([])
const loading = ref(false)
const hasMore = ref(false)

onMounted(async () => {
  if (isTestMode.value) {
    booklists.value = mockBooklists
    return
  }
  // TODO: 调用真实 API
})

function handleBooklistClick(booklist: Booklist) {
  console.log('点击书单:', booklist)
  // 跳转到书单详情
}

function formatCount(count: number): string {
  if (count >= 10000) {
    return `${(count / 10000).toFixed(1)}万`
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`
  }
  return count.toString()
}

function loadMore() {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    hasMore.value = false
  }, 1000)
}
</script>

<style scoped lang="scss">
.booklist-feed {
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

.booklist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.booklist-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
}

.booklist-cover {
  position: relative;
  height: 160px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  .cover-images {
    display: flex;
    gap: 12px;
    padding: 20px;
  }

  .cover-image {
    width: 60px;
    height: 84px;
    object-fit: cover;
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    transition: transform 0.3s;
  }

  .cover-badge {
    position: absolute;
    top: 12px;
    right: 12px;
    background: rgba(255, 255, 255, 0.95);
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
    color: #667eea;
  }
}

.booklist-content {
  padding: 16px;
}

.booklist-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 8px 0;
  line-height: 1.4;

  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.booklist-description {
  font-size: 13px;
  color: #666;
  margin: 0 0 12px 0;
  line-height: 1.5;

  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.creator-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;

  .creator-name {
    font-size: 12px;
    color: #999;
  }
}

.booklist-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;

  .stat-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #999;

    .el-icon {
      font-size: 14px;
    }
  }
}

.booklist-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;

  .el-tag {
    border: none;
    background: #f5f5f5;
  }
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
