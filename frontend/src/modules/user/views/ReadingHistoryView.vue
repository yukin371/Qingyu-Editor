<template>
  <div class="reading-history-view">
    <div class="container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1 class="page-title">
          <QyIcon name="Clock" />
          阅读历史
        </h1>
        <div class="header-actions">
          <QyButton @click="clearAllHistory" variant="danger">
            <template #icon>
              <QyIcon name="Delete" />
            </template>
            清空历史
          </QyButton>
        </div>
      </div>

      <!-- 筛选和排序 -->
      <Card shadow="hover" class="filter-card">
        <el-row :gutter="16">
          <el-col :xs="24" :sm="8">
            <QySelect
              v-model="filter.sortBy"
              placeholder="排序方式"
              :options="sortByOptions"
              @change="loadHistory"
            />
          </el-col>

          <el-col :xs="24" :sm="8">
            <QySelect
              v-model="filter.period"
              placeholder="时间范围"
              :options="periodOptions"
              clearable
              @change="loadHistory"
            />
          </el-col>

          <el-col :xs="24" :sm="8">
            <Input
              v-model="filter.keyword"
              placeholder="搜索书名或作者"
              clearable
              @change="loadHistory"
            >
              <template #prefix>
                <QyIcon name="Search" />
              </template>
            </Input>
          </el-col>
        </el-row>
      </Card>

      <!-- 历史记录列表 -->
      <QyLoading :loading="loading" class="history-list">
        <template v-if="!loading && historyList.length > 0">
          <Card v-for="item in historyList" :key="item.id" shadow="hover" class="history-item">
            <div class="item-content" @click="continueReading(item)">
              <!-- 书籍封面 -->
              <div class="item-cover">
                <Image :src="item.book?.cover || '/placeholder-book.png'" fit="cover">
                  <template #error>
                    <div class="image-slot">
                      <QyIcon name="Picture" />
                    </div>
                  </template>
                </Image>

                <!-- 阅读进度标签 -->
                <div class="progress-badge">已读</div>
              </div>

              <!-- 书籍信息 -->
              <div class="item-info">
                <h3 class="book-title">{{ item.book?.title }}</h3>
                <p class="book-author">
                  <QyIcon name="User" />
                  {{ item.book?.author }}
                </p>

                <div class="reading-info">
                  <Tag size="sm"> 阅读到：{{ item.chapter?.title || '未知章节' }} </Tag>
                  <span class="reading-time">
                    <QyIcon name="Timer" />
                    阅读时长：{{ formatDuration(item.readDuration || 0) }}
                  </span>
                </div>

                <!-- 阅读进度条 -->
                <QyProgress :percentage="item.progress || 0" :stroke-width="8" :show-text="false" />

                <div class="meta-info">
                  <span class="last-read-time"> 最后阅读：{{ formatTime(item.lastReadAt) }} </span>
                </div>
              </div>

              <!-- 操作按钮 -->
              <div class="item-actions">
                <QyButton variant="primary" @click.stop="continueReading(item)">
                  继续阅读
                </QyButton>
                <QyButton @click.stop="goToBookDetail(item.bookId)"> 查看详情 </QyButton>
                <QyButton variant="danger" text @click.stop="removeHistory(item.id)">
                  <template #icon>
                    <QyIcon name="Delete" />
                  </template>
                  删除
                </QyButton>
              </div>
            </div>
          </Card>

          <!-- 分页 -->
          <div class="pagination">
            <QyPagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50]"
              :total="total"
              @size-change="handleSizeChange"
              @current-change="handlePageChange"
            />
          </div>
        </template>

        <!-- 空状态 -->
        <Empty v-else-if="!loading" description="暂无阅读历史">
          <template #action>
            <QyButton variant="primary" @click="goToBookstore">去书城看看</QyButton>
          </template>
        </Empty>
      </QyLoading>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message, messageBox } from '@/design-system/services'
import {
  QyIcon,
  QyButton,
  QySelect,
  QyProgress,
  QyPagination,
  QyLoading,
} from '@/design-system/components'
import { Tag, Image, Empty, Card, Input } from '@/design-system/base'
import { getReadingHistory, deleteHistory, clearHistory } from '@/modules/reader/api'
import type { ReadingHistory } from '@/types/reader'

// 排序选项
const sortByOptions = [
  { label: '最近阅读', value: 'recent' },
  { label: '阅读时长', value: 'duration' },
  { label: '阅读进度', value: 'progress' },
]

// 时间范围选项
const periodOptions = [
  { label: '全部', value: '' },
  { label: '最近7天', value: '7d' },
  { label: '最近30天', value: '30d' },
  { label: '最近3个月', value: '3m' },
]

const router = useRouter()

// 状态
const loading = ref(false)
const historyList = ref<ReadingHistory[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 筛选条件
const filter = reactive({
  sortBy: 'recent',
  period: '',
  keyword: '',
})

// 格式化时间
const formatTime = (time: string | Date) => {
  if (!time) return '-'

  const date = typeof time === 'string' ? new Date(time) : time
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`

  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 格式化阅读时长
const formatDuration = (seconds: number) => {
  if (seconds < 60) return `${seconds}秒`

  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (minutes < 60) return `${minutes}分钟`

  const remainingMinutes = minutes % 60
  return `${hours}小时${remainingMinutes}分钟`
}

// 加载阅读历史
const loadHistory = async () => {
  loading.value = true
  try {
    // getReadingHistory接受page和size参数
    const response = await getReadingHistory(currentPage.value, pageSize.value)

    // PaginatedResponse结构: { code, message, data: T[], pagination: { total, ... }, timestamp }
    // 使用类型断言处理API返回数据与类型定义不匹配的问题
    historyList.value = (response.data || []) as unknown as ReadingHistory[]
    total.value = response.pagination?.total || 0
  } catch (error: any) {
    console.error('加载阅读历史失败:', error)
    message.error(error.message || '加载阅读历史失败')
  } finally {
    loading.value = false
  }
}

// 继续阅读
const continueReading = (item: ReadingHistory) => {
  if (item.chapterId) {
    router.push(`/reader/${item.chapterId}`)
  } else {
    message.warning('章节信息缺失')
  }
}

// 跳转到书籍详情
const goToBookDetail = (bookId: string) => {
  router.push(`/bookstore/books/${bookId}`)
}

// 删除单条历史
const removeHistory = async (historyId: string) => {
  try {
    await messageBox.confirm('确定要删除这条阅读记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    })

    await deleteHistory(historyId)
    message.success('删除成功')
    await loadHistory()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除历史失败:', error)
      message.error(error.message || '删除失败')
    }
  }
}

// 清空所有历史
const clearAllHistory = async () => {
  try {
    await messageBox.confirm('确定要清空所有阅读历史吗？此操作不可恢复！', '警告', {
      confirmButtonText: '确定清空',
      cancelButtonText: '取消',
    })

    await clearHistory()
    message.success('已清空所有历史')
    historyList.value = []
    total.value = 0
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('清空历史失败:', error)
      message.error(error.message || '清空失败')
    }
  }
}

// 去书城
const goToBookstore = () => {
  router.push('/bookstore')
}

// 分页处理
const handlePageChange = (page: number) => {
  currentPage.value = page
  loadHistory()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  loadHistory()
}

// 页面初始化
onMounted(() => {
  loadHistory()
})
</script>

<style scoped lang="scss">
.reading-history-view {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  .page-title {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 24px;
    font-weight: 700;
    margin: 0;
    color: #303133;
  }

  .header-actions {
    display: flex;
    gap: 12px;
  }
}

.filter-card {
  margin-bottom: 24px;

  :deep(.qy-select),
  :deep(.qy-input) {
    width: 100%;
  }
}

.history-list {
  min-height: 400px;
}

.history-item {
  margin-bottom: 16px;
  transition: all 0.3s;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }

  .item-content {
    display: flex;
    gap: 20px;
  }

  .item-cover {
    position: relative;
    width: 120px;
    height: 160px;
    flex-shrink: 0;
    border-radius: 8px;
    overflow: hidden;

    :deep(.qy-image) {
      width: 100%;
      height: 100%;
    }

    .progress-badge {
      position: absolute;
      top: 8px;
      right: 8px;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
    }
  }

  .item-info {
    flex: 1;
    min-width: 0;

    .book-title {
      margin: 0 0 8px 0;
      font-size: 20px;
      font-weight: 600;
      color: #303133;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .book-author {
      margin: 0 0 12px 0;
      display: flex;
      align-items: center;
      gap: 4px;
      color: #606266;
      font-size: 14px;
    }

    .reading-info {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 12px;

      .reading-time {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 13px;
        color: #909399;
      }
    }

    :deep(.qy-progress) {
      margin-bottom: 12px;
    }

    .meta-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      color: #909399;

      .last-read-time {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }
  }

  .item-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
    justify-content: center;

    :deep(.qy-button) {
      min-width: 100px;
    }
  }
}

.image-slot {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: #f5f7fa;
  color: #909399;
  font-size: 30px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid #e0e0e0;
}

// 响应式
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;

    .header-actions {
      width: 100%;

      :deep(.qy-button) {
        flex: 1;
      }
    }
  }

  .filter-card {
    :deep(.el-col) {
      margin-bottom: 12px;
    }
  }

  .history-item {
    .item-content {
      flex-direction: column;
    }

    .item-cover {
      width: 100%;
      height: auto;
      aspect-ratio: 3/4;
    }

    .item-actions {
      flex-direction: row;
      flex-wrap: wrap;

      :deep(.qy-button) {
        flex: 1;
        min-width: auto;
      }
    }
  }
}
</style>
