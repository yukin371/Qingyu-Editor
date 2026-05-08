<template>
  <div class="bookshelf-view" data-testid="bookshelf-view">
    <div class="bookshelf-header">
      <h2>我的书架</h2>

      <!-- 工具栏 -->
      <div class="bookshelf-toolbar">
        <el-tabs v-model="activeTab" @tab-change="handleTabChange">
          <el-tab-pane label="在读" name="reading">
            <template #label>
              <span
                >在读 <el-badge :value="statusCounts.reading" :hidden="!statusCounts.reading"
              /></span>
            </template>
          </el-tab-pane>
          <el-tab-pane label="想读" name="want_to_read">
            <template #label>
              <span
                >想读
                <el-badge :value="statusCounts.want_to_read" :hidden="!statusCounts.want_to_read"
              /></span>
            </template>
          </el-tab-pane>
          <el-tab-pane label="读完" name="completed">
            <template #label>
              <span
                >读完 <el-badge :value="statusCounts.completed" :hidden="!statusCounts.completed"
              /></span>
            </template>
          </el-tab-pane>
        </el-tabs>

        <!-- 批量操作按钮 -->
        <div class="toolbar-actions">
          <el-button v-if="!batchMode" @click="toggleBatchMode"> 批量管理 </el-button>
          <template v-else>
            <el-button type="primary" @click="handleBatchMove">移动到</el-button>
            <el-button type="danger" @click="handleBatchDelete">删除</el-button>
            <el-button @click="toggleBatchMode">取消</el-button>
          </template>
        </div>
      </div>
    </div>

    <el-skeleton :loading="loading" :rows="5" animated>
      <div class="bookshelf-content">
        <!-- 书架列表 -->
        <div class="bookshelf-list" data-testid="bookshelf-list">
          <el-empty v-if="books.length === 0 && !loading" description="书架空空如也">
            <template #extra>
              <el-button type="primary" @click="goToBookstore">去书城逛逛</el-button>
              <el-button @click="goToBookstore">开始阅读</el-button>
            </template>
            <template #image>
              <QyIcon name="Collection" :size="100" />
            </template>
          </el-empty>

          <div
            v-for="book in books"
            :key="book.id"
            class="book-item"
            :class="{ selected: selectedBooks.includes(book.id) }"
            :data-testid="`bookshelf-item-${book.id}`"
          >
            <el-checkbox
              v-if="batchMode"
              v-model="selectedBooks"
              :label="book.id"
              class="book-checkbox"
            />

            <el-image
              :src="book.cover"
              fit="cover"
              class="book-cover"
              @click="!batchMode && goToBook(book.id)"
            >
              <template #error>
                <div class="image-slot">
                  <QyIcon name="Picture" />
                </div>
              </template>
            </el-image>

            <div class="book-info" @click="!batchMode && goToBook(book.id)">
              <h3 class="book-title">{{ book.title }}</h3>
              <p class="book-author">{{ book.author }}</p>
              <div class="book-progress">
                <el-progress
                  :percentage="book.progress || 0"
                  :stroke-width="6"
                  :show-text="false"
                />
                <span class="progress-text">{{ book.progress || 0 }}%</span>
              </div>
              <p class="book-update">{{ book.lastChapterTitle || '暂无更新' }}</p>
            </div>

            <div v-if="!batchMode" class="book-actions">
              <el-button type="primary" size="small" @click.stop="continueReading(book)">
                继续阅读
              </el-button>
              <el-dropdown @command="handleAction($event, book)" data-testid="book-actions-menu">
                <el-button size="small" text data-testid="book-actions-trigger">
                  <QyIcon name="MoreFilled" />
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="reading" data-testid="status-reading"
                      >移至在读</el-dropdown-item
                    >
                    <el-dropdown-item command="want_to_read" data-testid="status-want-read"
                      >移至想读</el-dropdown-item
                    >
                    <el-dropdown-item command="completed" data-testid="status-completed"
                      >移至读完</el-dropdown-item
                    >
                    <el-dropdown-item divided command="remove" data-testid="remove-button"
                      >移出书架</el-dropdown-item
                    >
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </div>

        <!-- 最近阅读 -->
        <div v-if="activeTab === 'recent'" class="recent-list">
          <el-empty v-if="recentBooks.length === 0" description="暂无阅读记录" />
          <div
            v-for="book in recentBooks"
            :key="book.id"
            class="recent-item"
            @click="goToReader(book.id, book.lastChapterId)"
          >
            <el-image :src="book.cover" fit="cover" class="recent-cover">
              <template #error>
                <div class="image-slot">
                  <QyIcon name="Picture" />
                </div>
              </template>
            </el-image>

            <div class="recent-info">
              <h3 class="recent-title">{{ book.title }}</h3>
              <p class="recent-chapter">{{ book.lastChapterTitle }}</p>
              <div class="recent-meta">
                <el-progress :percentage="book.progress" :stroke-width="4" :show-text="false" />
                <span class="recent-time">{{ formatTime(book.lastReadTime) }}</span>
              </div>
            </div>

            <el-button text type="primary" @click.stop="continueReading(book)">
              继续阅读
            </el-button>
          </div>
        </div>

        <!-- 阅读历史 -->
        <div v-if="activeTab === 'history'" class="history-list">
          <el-empty v-if="histories.length === 0" description="暂无阅读历史" />
          <el-timeline>
            <el-timeline-item
              v-for="history in histories"
              :key="history.id"
              :timestamp="formatDate(history.readTime)"
              placement="top"
            >
              <div class="history-item" @click="goToReader(history.bookId, history.chapterId)">
                <div class="history-book">
                  <span class="history-title">{{ history.bookTitle }}</span>
                  <span class="history-chapter">- {{ history.chapterTitle }}</span>
                </div>
                <span class="history-duration">阅读 {{ formatDuration(history.duration) }}</span>
              </div>
            </el-timeline-item>
          </el-timeline>

          <!-- 分页 -->
          <el-pagination
            v-if="historyTotal > historyPageSize"
            :current-page="historyPage"
            :page-size="historyPageSize"
            :total="historyTotal"
            layout="prev, pager, next"
            @update:current-page="historyPage = $event"
            @current-change="loadHistory"
            style="margin-top: 20px; justify-content: center"
          />
        </div>
      </div>
    </el-skeleton>

    <!-- 统计信息 -->
    <div class="bookshelf-stats" v-if="stats">
      <el-card>
        <template #header>
          <span>阅读统计</span>
        </template>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">{{ stats.totalBooks }}</div>
            <div class="stat-label">收藏书籍</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ formatReadingTime(stats.totalTime) }}</div>
            <div class="stat-label">累计阅读</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ stats.finishedBooks }}</div>
            <div class="stat-label">已读完</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ formatReadingTime(stats.todayTime) }}</div>
            <div class="stat-label">今日阅读</div>
          </div>
        </div>
      </el-card>

      <!-- 跨设备同步信息 -->
      <el-card v-if="devices.length > 0" class="devices-card">
        <template #header>
          <span>跨设备同步</span>
        </template>
        <div class="devices-list">
          <div v-for="device in devices" :key="device.deviceId" class="device-item">
            <div class="device-icon">
              <QyIcon :name="getDeviceIcon(device.deviceType)" />
            </div>
            <div class="device-info">
              <div class="device-name">{{ device.deviceName || '未知设备' }}</div>
              <div class="device-meta">
                <el-tag size="small" :type="getDeviceTypeTag(device.deviceType)">
                  {{ getDeviceTypeLabel(device.deviceType) }}
                </el-tag>
                <span class="device-sync-time">最后同步: {{ formatDate(device.lastSyncAt) }}</span>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { QyIcon } from '@/design-system/components'
import { formatDate, formatReadingTime } from '@/utils/format.ts'
import { message, messageBox } from '@/design-system/services'
import { removeFromBookshelf } from '@/modules/reader/api'
import { getReadingHistory } from '@/modules/reader/api'
import { getDevicesProgress } from '@/modules/reader/api/manual/progress'
import { bookshelfService } from '@/modules/reader/services/bookshelf.service'
import { getBookDetail } from '@/modules/bookstore/api'
import defaultBookCover from '@/assets/default-book-cover.svg'
import { getBookshelf } from '@/modules/reader/api/manual/books'

const router = useRouter()

const activeTab = ref<'reading' | 'want_to_read' | 'completed' | 'recent' | 'history'>('reading')
const loading = ref(false)

// 书架书籍
const books = ref<any[]>([])

// 批量操作
const batchMode = ref(false)
const selectedBooks = ref<string[]>([])

// 状态计数
const statusCounts = ref({
  reading: 0,
  want_to_read: 0,
  completed: 0,
})

// 最近阅读（保留旧代码兼容性）
const recentBooks = ref<any[]>([])

// 阅读历史
const histories = ref<any[]>([])
const historyPage = ref(1)
const historyPageSize = ref(20)
const historyTotal = ref(0)

// 统计数据
const stats = ref<any>(null)

// 设备列表（跨设备同步）
const devices = ref<any[]>([])

onMounted(() => {
  loadData()
})

async function loadData(): Promise<void> {
  loading.value = true
  try {
    await loadBooks()
    await loadStats()
    await loadDevices()
  } catch (error) {
    console.error('加载数据失败:', error)
    message.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 加载书架数据
async function loadBooks(): Promise<void> {
  try {
    const response = await getBookshelf({
      page: 1,
      size: 100,
    } as any)

    const payload = (response as any)?.data ?? response
    const rawList =
      payload?.books || payload?.items || payload?.data?.books || payload?.data?.items || []
    const uniqueBookIds = [
      ...new Set(
        (Array.isArray(rawList) ? rawList : [])
          .map((item: any) => item.bookId || item.book_id)
          .filter(Boolean),
      ),
    ]
    const detailEntries = await Promise.all(
      uniqueBookIds.map(async (id) => {
        try {
          const detailResponse = await getBookDetail(String(id))
          return [String(id), (detailResponse as any)?.data ?? detailResponse] as const
        } catch {
          return [String(id), null] as const
        }
      }),
    )
    const details = new Map(detailEntries)

    const normalizedBooks = (Array.isArray(rawList) ? rawList : []).map((item: any) => {
      const bookId = String(item.bookId || item.book_id || item.id || '')
      const detail = details.get(bookId)
      const progressValue = Number(item.progress ?? 0)
      const progress =
        progressValue <= 1 ? Math.round(progressValue * 100) : Math.round(progressValue)
      const status =
        item.status === 'finished'
          ? 'completed'
          : item.status === 'want_read'
            ? 'want_to_read'
            : 'reading'

      return {
        id: bookId,
        shelfId: String(item.id || `${bookId}-shelf`),
        status,
        title: detail?.title || `作品 ${bookId.slice(-6)}`,
        author: detail?.author || '未知作者',
        cover: detail?.cover || detail?.cover_url || defaultBookCover,
        progress,
        lastChapterId: String(
          item.lastReadChapterId ||
            item.last_read_chapter_id ||
            item.chapterId ||
            item.chapter_id ||
            '',
        ),
        lastChapterTitle:
          item.lastReadChapterTitle ||
          item.last_read_chapter_title ||
          item.chapterTitle ||
          `章节 ${String(item.chapterId || item.chapter_id || '').slice(-6)}`,
        lastReadTime: item.lastReadAt || item.updatedAt || item.createdAt || item.addTime || '',
        updateTime:
          detail?.updatedAt ||
          detail?.lastUpdateAt ||
          item.updatedAt ||
          item.createdAt ||
          item.addTime ||
          '',
      }
    })

    books.value = normalizedBooks.filter((item) => {
      if (activeTab.value === 'completed') return item.status === 'completed'
      if (activeTab.value === 'want_to_read') return item.status === 'want_to_read'
      return item.status === 'reading'
    })

    statusCounts.value = {
      reading: normalizedBooks.filter((b) => b.status === 'reading').length,
      want_to_read: normalizedBooks.filter((b) => b.status === 'want_to_read').length,
      completed: normalizedBooks.filter((b) => b.status === 'completed').length,
    }
  } catch (error: any) {
    message.error(error.message || '加载书架失败')
  }
}

async function loadHistory(): Promise<void> {
  try {
    const response = await getReadingHistory(historyPage.value, historyPageSize.value)
    const payload = (response as any)?.data ?? response
    const list =
      payload?.histories ||
      payload?.items ||
      payload?.list ||
      payload?.data?.histories ||
      payload?.data ||
      []
    histories.value = Array.isArray(list) ? list : []
    historyTotal.value = Number(
      payload?.pagination?.total ||
        payload?.data?.pagination?.total ||
        payload?.total ||
        histories.value.length,
    )
  } catch (error: any) {
    message.error(error.message || '加载历史记录失败')
  }
}

async function loadStats(): Promise<void> {
  try {
    // 计算统计信息
    const finishedCount = books.value.filter((b) => b.status === 'completed').length

    stats.value = {
      totalBooks: books.value.length,
      totalTime: 0,
      finishedBooks: finishedCount,
      todayTime: 0,
    }
  } catch (error: any) {
    message.error(error.message || '加载统计数据失败')
    // 使用默认值
    stats.value = {
      totalBooks: books.value.length,
      totalTime: 0,
      finishedBooks: 0,
      todayTime: 0,
    }
  }
}

// 加载设备列表（跨设备同步）
async function loadDevices(): Promise<void> {
  try {
    const response = await getDevicesProgress()
    const payload = (response as any)?.data ?? response
    const deviceList = payload?.devices ?? payload?.data?.devices ?? []
    devices.value = Array.isArray(deviceList) ? deviceList : []
  } catch (error) {
    // 设备信息获取失败不影响主流程
    console.warn('加载设备信息失败:', error)
    devices.value = []
  }
}

// 获取设备图标
function getDeviceIcon(deviceType: string): string {
  switch (deviceType) {
    case 'mobile':
      return 'Mobile'
    case 'tablet':
      return 'Monitor'
    default:
      return 'Desktop'
  }
}

// 获取设备类型标签类型
function getDeviceTypeTag(deviceType: string): string {
  switch (deviceType) {
    case 'mobile':
      return 'success'
    case 'tablet':
      return 'warning'
    default:
      return 'info'
  }
}

// 获取设备类型标签文本
function getDeviceTypeLabel(deviceType: string): string {
  switch (deviceType) {
    case 'mobile':
      return '手机'
    case 'tablet':
      return '平板'
    default:
      return '电脑'
  }
}

// 切换批量模式
function toggleBatchMode(): void {
  batchMode.value = !batchMode.value
  if (!batchMode.value) {
    selectedBooks.value = []
  }
}

// 处理标签页切换
function handleTabChange(): void {
  batchMode.value = false
  selectedBooks.value = []
  loadData()
}

// 跳转到书籍详情
function goToBook(bookId: string): void {
  router.push(`/bookstore/books/${bookId}`)
}

// 跳转到书城首页
function goToBookstore(): void {
  router.push('/bookstore')
}

// 跳转到阅读器
function goToReader(bookId: string, chapterId?: string): void {
  if (chapterId) {
    router.push(`/reader/${chapterId}`)
  } else {
    // 从第一章开始
    router.push(`/bookstore/books/${bookId}`)
  }
}

// 继续阅读
function continueReading(book: any): void {
  if (book.lastChapterId) {
    router.push(`/reader/${book.lastChapterId}`)
  } else {
    goToBook(book.id)
  }
}

// 处理单个书籍操作
async function handleAction(command: string, book: any): Promise<void> {
  if (command === 'remove') {
    await handleRemove(book.id)
  } else {
    await handleMove(book.id, command)
  }
}

// 移动书籍到不同状态
async function handleMove(bookId: string, status: string): Promise<void> {
  try {
    // 映射前端状态到后端状态
    const statusMap: Record<string, 'reading' | 'want_read' | 'finished'> = {
      reading: 'reading',
      want_to_read: 'want_read',
      completed: 'finished',
    }

    const backendStatus = statusMap[status]
    if (!backendStatus) {
      message.error('无效的状态')
      return
    }

    // 调用服务层更新状态
    await bookshelfService.updateBookStatus(bookId, backendStatus)
    message.success('状态更新成功')
    loadBooks() // 重新加载书架数据
  } catch (error: any) {
    message.error(error.message || '操作失败')
  }
}

// 移除书籍
async function handleRemove(bookId: string): Promise<void> {
  try {
    await messageBox.confirm('确定要移出书架吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    })

    await removeFromBookshelf(bookId)
    message.success('已移出书架')
    loadBooks()
  } catch (error: any) {
    if (error !== 'cancel') {
      message.error(error.message || '移除失败')
    }
  }
}

// 批量移动书籍到不同状态
async function handleBatchMove(): Promise<void> {
  if (selectedBooks.value.length === 0) {
    message.warning('请选择要移动的书籍')
    return
  }

  try {
    const value = window.prompt('请输入目标状态: reading / want_read / finished', 'reading')
    if (!value || !['reading', 'want_read', 'finished'].includes(value)) {
      return
    }

    // 调用服务层批量更新状态
    const result = await bookshelfService.batchUpdateBookStatus(
      selectedBooks.value,
      value as 'reading' | 'want_read' | 'finished',
    )
    message.success(`已成功移动 ${result.count} 本书籍`)
    toggleBatchMode()
    loadBooks() // 重新加载书架数据
  } catch (error: any) {
    if (error !== 'cancel' && error !== 'close') {
      message.error(error.message || '批量操作失败')
    }
  }
}

// 批量删除 (循环调用单个删除接口)
async function handleBatchDelete(): Promise<void> {
  if (selectedBooks.value.length === 0) {
    message.warning('请选择要删除的书籍')
    return
  }

  try {
    await messageBox.confirm(`确定要移出所选的 ${selectedBooks.value.length} 本书吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    })

    // 逐个删除书籍
    await Promise.all(selectedBooks.value.map((bookId) => removeFromBookshelf(bookId)))
    message.success('已移出书架')
    toggleBatchMode()
    loadBooks()
  } catch (error: any) {
    if (error !== 'cancel') {
      message.error(error.message || '操作失败')
    }
  }
}

function formatTime(time: string): string {
  return formatDate(time, 'MM-DD HH:mm')
}

function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}分钟`
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`
}
</script>

<style scoped lang="scss">
.bookshelf-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;

  .bookshelf-header {
    margin-bottom: 24px;

    h2 {
      margin: 0 0 16px;
      font-size: 24px;
      font-weight: 500;
      color: #303133;
    }
  }

  .bookshelf-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;

    .el-tabs {
      flex: 1;
    }

    .toolbar-actions {
      display: flex;
      gap: 8px;
    }
  }

  .bookshelf-content {
    min-height: 400px;
  }

  .bookshelf-list {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .book-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: #fff;
      border-radius: 8px;
      border: 2px solid transparent;
      transition: all 0.3s;
      cursor: pointer;

      &:hover {
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
      }

      &.selected {
        border-color: #409eff;
        background: #ecf5ff;
      }

      .book-checkbox {
        margin-right: 8px;
      }

      .book-cover {
        width: 80px;
        height: 106px;
        border-radius: 4px;
        flex-shrink: 0;
        cursor: pointer;
      }

      .book-info {
        flex: 1;
        min-width: 0;

        .book-title {
          margin: 0 0 8px;
          font-size: 16px;
          font-weight: 500;
          color: #303133;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .book-author {
          margin: 0 0 8px;
          font-size: 14px;
          color: #606266;
        }

        .book-progress {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;

          .el-progress {
            flex: 1;
            max-width: 200px;
          }

          .progress-text {
            font-size: 12px;
            color: #909399;
          }
        }

        .book-update {
          margin: 0;
          font-size: 12px;
          color: #909399;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }

      .book-actions {
        display: flex;
        align-items: center;
        gap: 8px;
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
    font-size: 24px;
  }

  .recent-list {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .recent-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: #fff;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
      }

      .recent-cover {
        width: 80px;
        height: 106px;
        border-radius: 4px;
        flex-shrink: 0;
      }

      .recent-info {
        flex: 1;

        .recent-title {
          margin: 0 0 8px;
          font-size: 16px;
          font-weight: 500;
          color: #303133;
        }

        .recent-chapter {
          margin: 0 0 12px;
          font-size: 14px;
          color: #606266;
        }

        .recent-meta {
          display: flex;
          align-items: center;
          gap: 12px;

          .el-progress {
            flex: 1;
          }

          .recent-time {
            font-size: 12px;
            color: #909399;
          }
        }
      }
    }
  }

  .history-list {
    .history-item {
      cursor: pointer;
      padding: 8px;
      border-radius: 4px;
      transition: background 0.3s;

      &:hover {
        background: #f5f7fa;
      }

      .history-book {
        margin-bottom: 4px;

        .history-title {
          font-size: 14px;
          font-weight: 500;
          color: #303133;
        }

        .history-chapter {
          font-size: 14px;
          color: #606266;
        }
      }

      .history-duration {
        font-size: 12px;
        color: #909399;
      }
    }
  }

  .bookshelf-stats {
    margin-top: 24px;

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;

      .stat-item {
        text-align: center;

        .stat-value {
          font-size: 28px;
          font-weight: bold;
          color: #409eff;
          margin-bottom: 8px;
        }

        .stat-label {
          font-size: 14px;
          color: #909399;
        }
      }
    }

    .devices-card {
      margin-top: 16px;

      .devices-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .device-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 0;
        border-bottom: 1px solid #f0f0f0;

        &:last-child {
          border-bottom: none;
        }

        .device-icon {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f5f7fa;
          border-radius: 8px;
          color: #409eff;
        }

        .device-info {
          flex: 1;

          .device-name {
            font-size: 14px;
            font-weight: 500;
            color: #303133;
            margin-bottom: 4px;
          }

          .device-meta {
            display: flex;
            align-items: center;
            gap: 8px;

            .device-sync-time {
              font-size: 12px;
              color: #909399;
            }
          }
        }
      }
    }
  }
}
</style>
