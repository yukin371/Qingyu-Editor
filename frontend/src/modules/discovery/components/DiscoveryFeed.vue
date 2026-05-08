<template>
  <div class="discovery-feed">
    <!-- 推荐Banner -->
    <div class="banner-section">
      <h1 class="page-title">发现</h1>
      <p class="page-subtitle">探索更多精彩内容</p>
    </div>

    <!-- 个性化推荐 -->
    <section class="section">
      <h2 class="section-title">猜你喜欢</h2>
      <div class="book-grid">
        <div
          v-for="book in recommendedBooks"
          :key="book.id"
          class="book-card"
          @click="goToBook(book.id)"
        >
          <div class="book-cover">
            <img :src="book.cover" :alt="book.title" />
            <div class="book-rating">
              <el-icon><StarFilled /></el-icon>
              <span>{{ book.rating }}</span>
            </div>
          </div>
          <div class="book-info">
            <h3 class="book-title">{{ book.title }}</h3>
            <p class="book-author">{{ book.author }}</p>
            <p class="book-desc">{{ book.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 新书上架 -->
    <section class="section">
      <h2 class="section-title">新书上架</h2>
      <div class="book-list">
        <div v-for="book in newBooks" :key="book.id" class="book-item" @click="goToBook(book.id)">
          <img :src="book.cover" :alt="book.title" class="book-item-cover" />
          <div class="book-item-info">
            <h3 class="book-item-title">{{ book.title }}</h3>
            <p class="book-item-author">{{ book.author }}</p>
            <div class="book-item-meta">
              <span class="book-category">{{ book.category }}</span>
              <span class="book-date">{{ formatDate(book.publishDate) }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 编辑推荐 -->
    <section class="section">
      <h2 class="section-title">编辑推荐</h2>
      <div class="editor-picks">
        <div
          v-for="pick in editorPicks"
          :key="pick.id"
          class="editor-pick-card"
          @click="goToBook(pick.id)"
        >
          <div class="pick-cover">
            <img :src="pick.cover" :alt="pick.title" />
            <div class="pick-badge">编辑推荐</div>
          </div>
          <div class="pick-content">
            <h3 class="pick-title">{{ pick.title }}</h3>
            <p class="pick-reason">{{ pick.reason }}</p>
            <div class="pick-stats">
              <span
                ><el-icon><View /></el-icon> {{ pick.viewCount }}</span
              >
              <span
                ><el-icon><Collection /></el-icon> {{ pick.collectCount }}</span
              >
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { StarFilled, View, Collection } from '@element-plus/icons-vue'

interface Book {
  id: string
  title: string
  author: string
  cover: string
  description: string
  rating: number
  category?: string
  publishDate?: string
}

interface EditorPick {
  id: string
  title: string
  author?: string
  cover: string
  description?: string
  reason: string
  viewCount: number
  collectCount: number
  [key: string]: unknown
}

const route = useRoute()
const isTestMode = computed(() => route.query.test === 'true')

const recommendedBooks = ref<Book[]>([])
const newBooks = ref<Book[]>([])
const editorPicks = ref<EditorPick[]>([])

if (isTestMode.value) {
  recommendedBooks.value = [
    {
      id: 'b1',
      title: '三体',
      author: '刘慈欣',
      cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&h=280&fit=crop',
      description: '中国科幻基石之作',
      rating: 9.4,
    },
    {
      id: 'b2',
      title: '百年孤独',
      author: '加西亚·马尔克斯',
      cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&h=280&fit=crop',
      description: '魔幻现实主义经典',
      rating: 9.3,
    },
    {
      id: 'b3',
      title: '解忧杂货店',
      author: '东野圭吾',
      cover: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=200&h=280&fit=crop',
      description: '温暖治愈的故事',
      rating: 8.9,
    },
    {
      id: 'b4',
      title: '白夜行',
      author: '东野圭吾',
      cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200&h=280&fit=crop',
      description: '推理小说巅峰之作',
      rating: 9.2,
    },
  ]

  newBooks.value = [
    {
      id: 'b5',
      title: '活着',
      author: '余华',
      cover: 'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=200&h=280&fit=crop',
      description: '生命的力量',
      rating: 9.5,
      category: '文学',
      publishDate: '2025-01-15',
    },
    {
      id: 'b6',
      title: '追风筝的人',
      author: '卡勒德·胡赛尼',
      cover: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=200&h=280&fit=crop',
      description: '关于爱与救赎',
      rating: 8.8,
      category: '文学',
      publishDate: '2025-01-10',
    },
    {
      id: 'b7',
      title: '小王子',
      author: '圣埃克苏佩里',
      cover: 'https://images.unsplash.com/photo-1495631342678-477851d94a5c?w=200&h=280&fit=crop',
      description: '写给大人的童话',
      rating: 9.1,
      category: '童话',
      publishDate: '2025-01-08',
    },
  ]

  editorPicks.value = [
    {
      id: 'b8',
      title: '平凡的世界',
      author: '路遥',
      cover: 'https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=200&h=280&fit=crop',
      description: '茅盾文学奖获奖作品',
      rating: 9.3,
      reason:
        '这是一部全景式地表现中国当代城乡社会生活的长篇小说，深刻展现了普通人在大时代历史进程中所走过的艰难曲折的道路。',
      viewCount: 12800,
      collectCount: 5600,
    },
    {
      id: 'b9',
      title: '围城',
      author: '钱钟书',
      cover: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=200&h=280&fit=crop',
      description: '中国现代文学经典',
      rating: 9.0,
      reason:
        '钱钟书所著的长篇小说，是中国现代文学史上一部风格独特的讽刺小说，被誉为"新儒林外史"。',
      viewCount: 9600,
      collectCount: 4200,
    },
    {
      id: 'b10',
      title: '挪威的森林',
      author: '村上春树',
      cover: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=200&h=280&fit=crop',
      description: '日本文学经典',
      rating: 8.7,
      reason:
        '村上春树的代表作，一部动人心弦的青春恋爱小说，以其细腻的情感描写和独特的叙事风格打动无数读者。',
      viewCount: 15200,
      collectCount: 6800,
    },
  ]
}

onMounted(() => {
  console.log('发现区feed加载')
})

function goToBook(bookId: string) {
  console.log('跳转到书籍详情:', bookId)
  // 后续实现跳转逻辑
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / 86400000)

  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  if (days < 30) return `${Math.floor(days / 7)}周前`
  return date.toLocaleDateString('zh-CN')
}
</script>

<style scoped lang="scss">
.discovery-feed {
  padding: 20px 0;
}

.banner-section {
  text-align: center;
  padding: 40px 20px;
  margin-bottom: 32px;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.08) 0%, rgba(102, 177, 255, 0.05) 100%);
  border-radius: 20px;

  .page-title {
    font-size: 36px;
    font-weight: 700;
    color: #2c3e50;
    margin: 0 0 8px 0;
  }

  .page-subtitle {
    font-size: 16px;
    color: #666;
    margin: 0;
  }
}

.section {
  margin-bottom: 40px;
  padding: 24px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.05);

  .section-title {
    font-size: 20px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 20px 0;
  }
}

/* 猜你喜欢 - 网格布局 */
.book-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
}

.book-card {
  cursor: pointer;
  transition: transform 0.3s;

  &:hover {
    transform: translateY(-4px);
  }

  .book-cover {
    position: relative;
    margin-bottom: 12px;

    img {
      width: 100%;
      aspect-ratio: 3 / 4;
      object-fit: cover;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .book-rating {
      position: absolute;
      top: 8px;
      right: 8px;
      display: flex;
      align-items: center;
      gap: 4px;
      background: rgba(255, 255, 255, 0.95);
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      color: #f7ba2a;

      .el-icon {
        font-size: 14px;
      }
    }
  }

  .book-info {
    .book-title {
      font-size: 14px;
      font-weight: 500;
      color: #1a1a1a;
      margin: 0 0 4px 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .book-author {
      font-size: 12px;
      color: #999;
      margin: 0 0 4px 0;
    }

    .book-desc {
      font-size: 12px;
      color: #666;
      margin: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

/* 新书上架 - 列表布局 */
.book-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.book-item {
  display: flex;
  gap: 16px;
  padding: 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background: #f8f9fb;
  }

  .book-item-cover {
    width: 80px;
    height: 107px;
    object-fit: cover;
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .book-item-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 4px 0;

    .book-item-title {
      font-size: 16px;
      font-weight: 500;
      color: #1a1a1a;
      margin: 0 0 4px 0;
    }

    .book-item-author {
      font-size: 14px;
      color: #666;
      margin: 0 0 8px 0;
    }

    .book-item-meta {
      display: flex;
      gap: 12px;
      font-size: 12px;
      color: #999;

      .book-category {
        color: #409eff;
      }
    }
  }
}

/* 编辑推荐 */
.editor-picks {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.editor-pick-card {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #f8f9fb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: #f0f2f5;
    transform: translateX(4px);
  }

  .pick-cover {
    position: relative;

    img {
      width: 100px;
      height: 133px;
      object-fit: cover;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .pick-badge {
      position: absolute;
      top: -8px;
      left: -8px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-size: 11px;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
    }
  }

  .pick-content {
    flex: 1;
    display: flex;
    flex-direction: column;

    .pick-title {
      font-size: 16px;
      font-weight: 600;
      color: #1a1a1a;
      margin: 0 0 8px 0;
    }

    .pick-reason {
      font-size: 13px;
      color: #666;
      line-height: 1.6;
      margin: 0 0 12px 0;
      flex: 1;
    }

    .pick-stats {
      display: flex;
      gap: 16px;
      font-size: 12px;
      color: #999;

      span {
        display: flex;
        align-items: center;
        gap: 4px;

        .el-icon {
          font-size: 14px;
        }
      }
    }
  }
}

/* 响应式 */
@media (max-width: 768px) {
  .book-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .book-item {
    .book-item-cover {
      width: 60px;
      height: 80px;
    }
  }

  .editor-pick-card {
    .pick-cover img {
      width: 80px;
      height: 107px;
    }
  }
}
</style>
