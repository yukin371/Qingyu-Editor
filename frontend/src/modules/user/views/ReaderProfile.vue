<template>
  <div class="reader-profile">
    <div v-if="loading" class="loading-container">
      <QyLoading />
    </div>

    <div v-else-if="!userProfile" class="error-container">
      <Empty description="用户不存在" />
    </div>

    <div v-else class="profile-container">
      <!-- 用户信息卡片 -->
      <UserCard
        :user="userProfile"
        :stats="userStats"
        :is-following="isFollowing"
        :show-message="true"
        :show-follow="!isCurrentUser"
        @follow="handleFollow"
        @unfollow="handleUnfollow"
        @message="handleMessage"
      />

      <!-- 标签页 -->
      <Card class="content-card">
        <el-tabs v-model="activeTab" class="qy-tabs">
          <!-- 书架 -->
          <el-tab-pane label="书架" name="bookshelf">
            <div v-if="loadingBookshelf" class="tab-loading">
              <QyLoading />
            </div>

            <div v-else-if="bookshelfList.length === 0" class="empty-content">
              <Empty description="书架空空如也" />
            </div>

            <div v-else>
              <!-- 批量操作工具栏 -->
              <div class="bookshelf-toolbar">
                <div class="toolbar-left">
                  <Checkbox
                    v-model="selectAll"
                    :indeterminate="isIndeterminate"
                    @change="(val: boolean | string[]) => handleSelectAll(val as boolean)"
                  >
                    全选
                  </Checkbox>
                  <span class="selected-count"> 已选择 {{ selectedBooks.length }} 本 </span>
                </div>
                <div class="toolbar-right">
                  <QyButton :disabled="selectedBooks.length === 0" @click="openMoveDialog">
                    <template v-slot:icon>
                      <QyIcon name="FolderOpened" />
                    </template>
                    移动分类
                  </QyButton>
                  <QyButton :disabled="selectedBooks.length === 0" @click="openExportDialog">
                    <template v-slot:icon>
                      <QyIcon name="Download" />
                    </template>
                    导出书单
                  </QyButton>
                  <QyButton
                    variant="danger"
                    :disabled="selectedBooks.length === 0"
                    @click="handleBatchRemove"
                  >
                    <template v-slot:icon>
                      <QyIcon name="Delete" />
                    </template>
                    移出书架
                  </QyButton>
                </div>
              </div>

              <!-- 书架网格 -->
              <div class="bookshelf-grid">
                <div
                  v-for="item in bookshelfList"
                  :key="item.book_id"
                  class="book-card"
                  :class="{ 'is-selected': selectedBooks.includes(item.book_id) }"
                  @click="handleBookClick(item)"
                >
                  <div class="book-checkbox">
                    <Checkbox
                      :model-value="selectedBooks.includes(item.book_id)"
                      @change="
                        (val: boolean | string[]) => handleSelectBook(item.book_id, val as boolean)
                      "
                      @click.stop
                    />
                  </div>
                  <Image
                    :src="item.book?.cover || '/default-book-cover.jpg'"
                    fit="cover"
                    class="book-cover"
                    lazy
                  >
                    <template #error>
                      <div class="image-slot">
                        <QyIcon name="Picture" />
                      </div>
                    </template>
                  </Image>
                  <div class="book-info">
                    <h4 class="book-title">{{ item.book?.title || '未知书籍' }}</h4>
                    <div class="reading-progress">
                      <QyProgress
                        :percentage="calculateProgress(item)"
                        :strokeWidth="6"
                        :show-text="false"
                      />
                      <span class="progress-text">
                        已读 {{ item.current_chapter || 0 }}/{{ item.book?.total_chapters || 0 }} 章
                      </span>
                    </div>
                    <div class="book-meta">
                      <span class="last-read">
                        <QyIcon name="Clock" />
                        {{ formatTime(item.last_read_at) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 分页 -->
            <div v-if="bookshelfList.length > 0" class="pagination">
              <QyPagination
                v-model="bookshelfPagination.page"
                v-model:page-size="bookshelfPagination.size"
                :total="bookshelfPagination.total"
                :layout="['prev', 'pager', 'next']"
                @current-change="loadBookshelf"
              />
            </div>
          </el-tab-pane>

          <!-- 阅读统计 -->
          <el-tab-pane label="阅读统计" name="stats">
            <div class="stats-content">
              <el-row :gutter="20">
                <el-col :span="12">
                  <QyCard class="stat-card">
                    <div class="stat-item">
                      <div class="stat-icon" style="background-color: #409eff20">
                        <QyIcon name="Reading" :size="32" color="#409eff" />
                      </div>
                      <div class="stat-info">
                        <div class="stat-value">{{ readingStats.totalBooks || 0 }}</div>
                        <div class="stat-label">收藏书籍</div>
                      </div>
                    </div>
                  </QyCard>
                </el-col>

                <el-col :span="12">
                  <QyCard class="stat-card">
                    <div class="stat-item">
                      <div class="stat-icon" style="background-color: #67c23a20">
                        <QyIcon name="Clock" :size="32" color="#67c23a" />
                      </div>
                      <div class="stat-info">
                        <div class="stat-value">{{ readingStats.totalReadingTime || 0 }}h</div>
                        <div class="stat-label">阅读时长</div>
                      </div>
                    </div>
                  </QyCard>
                </el-col>

                <el-col :span="12">
                  <QyCard class="stat-card">
                    <div class="stat-item">
                      <div class="stat-icon" style="background-color: #e6a23c20">
                        <QyIcon name="Document" :size="32" color="#e6a23c" />
                      </div>
                      <div class="stat-info">
                        <div class="stat-value">{{ readingStats.totalChapters || 0 }}</div>
                        <div class="stat-label">已读章节</div>
                      </div>
                    </div>
                  </QyCard>
                </el-col>

                <el-col :span="12">
                  <QyCard class="stat-card">
                    <div class="stat-item">
                      <div class="stat-icon" style="background-color: #f5622120">
                        <QyIcon name="Star" :size="32" color="#f56221" />
                      </div>
                      <div class="stat-info">
                        <div class="stat-value">{{ readingStats.totalComments || 0 }}</div>
                        <div class="stat-label">发表评论</div>
                      </div>
                    </div>
                  </QyCard>
                </el-col>
              </el-row>

              <!-- 最近阅读 -->
              <Card class="recent-reading-card" style="margin-top: 20px">
                <template #header>
                  <div class="card-header">
                    <h3>最近阅读</h3>
                  </div>
                </template>

                <div v-if="recentReadings.length === 0" class="empty-content">
                  <Empty description="暂无阅读记录" iconSize="large" />
                </div>

                <div v-else class="recent-list">
                  <div
                    v-for="item in recentReadings"
                    :key="item.id"
                    class="recent-item"
                    @click="goToReader(item.book_id, item.chapter_id)"
                  >
                    <Image :src="item.book?.cover" fit="cover" class="recent-cover">
                      <template #error>
                        <div class="image-slot-small">
                          <QyIcon name="Picture" />
                        </div>
                      </template>
                    </Image>
                    <div class="recent-info">
                      <div class="recent-title">{{ item.book?.title }}</div>
                      <div class="recent-chapter">读到：{{ item.chapter?.title }}</div>
                      <div class="recent-time">{{ formatTime(item.read_at) }}</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </el-tab-pane>

          <!-- 动态 -->
          <el-tab-pane label="动态" name="activities">
            <div class="empty-content">
              <Empty description="暂无动态" />
            </div>
          </el-tab-pane>
        </el-tabs>
      </Card>

      <!-- 批量移动分类对话框 -->
      <QyModal v-model:visible="moveDialogVisible" title="移动到分类" width="400px">
        <QyForm :modelValue="{ selectedCategory }">
          <QyFormItem label="选择分类">
            <el-select v-model="selectedCategory" placeholder="请选择分类" style="width: 100%">
              <el-option
                v-for="cat in bookCategories"
                :key="cat.value"
                :label="cat.label"
                :value="cat.value"
              />
            </el-select>
          </QyFormItem>
          <QyAlert
            :title="`将移动 ${selectedBooks.length} 本书籍`"
            type="info"
            :closable="false"
            style="margin-top: 12px"
          />
        </QyForm>
        <template #footer>
          <QyButton @click="moveDialogVisible = false">取消</QyButton>
          <QyButton variant="primary" @click="handleBatchMove">确定</QyButton>
        </template>
      </QyModal>

      <!-- 导出书单对话框 -->
      <QyModal v-model:visible="exportDialogVisible" title="导出书单" width="400px">
        <QyAlert
          :title="`将导出 ${selectedBooks.length} 本书籍的信息`"
          type="info"
          :closable="false"
          style="margin-bottom: 20px"
        />
        <el-space direction="vertical" style="width: 100%">
          <QyButton style="width: 100%" @click="handleExport('json')">
            <template v-slot:icon>
              <QyIcon name="Document" />
            </template>
            导出为 JSON
          </QyButton>
          <QyButton style="width: 100%" @click="handleExport('csv')">
            <template v-slot:icon>
              <QyIcon name="Document" />
            </template>
            导出为 CSV
          </QyButton>
        </el-space>
        <template #footer>
          <QyButton @click="exportDialogVisible = false">取消</QyButton>
        </template>
      </QyModal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message, messageBox } from '@/design-system/services'
import {
  QyIcon,
  QyLoading,
  QyProgress,
  QyPagination,
  QyButton,
  QyForm,
  QyFormItem,
  QyModal,
  QyAlert,
} from '@/design-system/components'
import { Checkbox, Image, Empty, Card } from '@/design-system/base'
import UserCard from '@/shared/components/common/UserCard.vue'
import { useAuthStore } from '@/stores/auth'
import { httpService } from '@/core/services/http.service'
import { bookshelfAPI as batchAPI } from '@/modules/reader/api/manual/bookshelf'
import { getRecentReading } from '@/modules/reader/api'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const userId = computed(() => route.params.userId as string)

// 是否为当前用户
const isCurrentUser = computed(() => userId.value === authStore.user?.id)

// 状态
const loading = ref(true)
const loadingBookshelf = ref(false)
const userProfile = ref<any>(null)
const userStats = ref<any>(null)
const isFollowing = ref(false)
const activeTab = ref('bookshelf')

// 书架列表
const bookshelfList = ref<any[]>([])
const bookshelfPagination = ref({
  page: 1,
  size: 12,
  total: 0,
})

// 批量操作状态
const selectedBooks = ref<string[]>([])
const selectAll = ref(false)
const moveDialogVisible = ref(false)
const exportDialogVisible = ref(false)
const selectedCategory = ref('')
const bookCategories = ref([
  { value: 'reading', label: '正在阅读' },
  { value: 'completed', label: '已完成' },
  { value: 'want_to_read', label: '想读' },
  { value: 'abandoned', label: '已弃书' },
])

// 计算属性
const isIndeterminate = computed(() => {
  const selectedCount = selectedBooks.value.length
  const totalCount = bookshelfList.value.length
  return selectedCount > 0 && selectedCount < totalCount
})

// 阅读统计
const readingStats = ref({
  totalBooks: 0,
  totalReadingTime: 0,
  totalChapters: 0,
  totalComments: 0,
})

// 最近阅读
const recentReadings = ref<any[]>([])

// 加载用户信息
const loadUserProfile = async () => {
  loading.value = true
  try {
    // TODO: 调用用户信息API
    // const response = await httpService.get(`/users/${userId.value}/profile`)
    // userProfile.value = response.data

    // 模拟用户信息 - 用于测试书架批量操作功能
    userProfile.value = {
      id: userId.value,
      username: `user_${userId.value}`,
      nickname: '测试用户',
      avatar: 'https://picsum.photos/seed/user/200/200',
      bio: '这是一个测试用户账号，用于演示书架批量操作功能。',
      level: 5,
      exp: 2580,
      follower_count: 128,
      following_count: 45,
    }

    // 模拟统计数据
    userStats.value = {
      followerCount: 128,
      totalBooks: 45,
    }

    // 模拟阅读统计
    readingStats.value = {
      totalBooks: 45,
      totalReadingTime: 128,
      totalChapters: 567,
      totalComments: 89,
    }
  } catch (error: any) {
    console.error('加载用户信息失败:', error)
    message.error('加载用户信息失败')
  } finally {
    loading.value = false
  }
}

// 加载书架
const loadBookshelf = async () => {
  loadingBookshelf.value = true
  try {
    if (isCurrentUser.value) {
      // 查看自己的书架：使用reader API
      // TODO: 处理真实API响应
      // const response = await bookshelfAPI.getBookshelf({
      //   pageSize: bookshelfPagination.value.size
      // })
    }

    // 模拟数据 - 用于测试批量操作功能
    bookshelfList.value = [
      {
        book_id: '1',
        current_chapter: 50,
        last_read_at: new Date(Date.now() - 86400000).toISOString(),
        book: {
          id: '1',
          title: '玄幻世界',
          cover: 'https://picsum.photos/seed/book1/200/280',
          author: '张三',
          category: '玄幻',
          total_chapters: 100,
        },
      },
      {
        book_id: '2',
        current_chapter: 30,
        last_read_at: new Date(Date.now() - 172800000).toISOString(),
        book: {
          id: '2',
          title: '都市传说',
          cover: 'https://picsum.photos/seed/book2/200/280',
          author: '李四',
          category: '都市',
          total_chapters: 200,
        },
      },
      {
        book_id: '3',
        current_chapter: 80,
        last_read_at: new Date(Date.now() - 259200000).toISOString(),
        book: {
          id: '3',
          title: '科幻未来',
          cover: 'https://picsum.photos/seed/book3/200/280',
          author: '王五',
          category: '科幻',
          total_chapters: 150,
        },
      },
      {
        book_id: '4',
        current_chapter: 10,
        last_read_at: new Date(Date.now() - 43200000).toISOString(),
        book: {
          id: '4',
          title: '历史风云',
          cover: 'https://picsum.photos/seed/book4/200/280',
          author: '赵六',
          category: '历史',
          total_chapters: 300,
        },
      },
    ]
    bookshelfPagination.value.total = 4
  } catch (error: any) {
    console.error('加载书架失败:', error)
    message.error('加载书架失败')
    bookshelfList.value = []
    bookshelfPagination.value.total = 0
  } finally {
    loadingBookshelf.value = false
  }
}

// 加载最近阅读
const loadRecentReadings = async () => {
  try {
    if (isCurrentUser.value) {
      // 查看自己的阅读历史：使用reader API
      const response = await getRecentReading(5)
      const data = response.data || response
      const history = Array.isArray(data) ? data : data.data || []

      recentReadings.value = history.map((item: any) => ({
        id: item.id || item._id,
        book: {
          id: item.bookId || item.book?.id,
          title: item.title || item.book?.title,
          cover: item.cover || item.book?.coverUrl,
        },
        chapterTitle: item.chapterTitle || item.last_read_chapter || '未知章节',
        progress: (item.progress || 0) * 100,
        lastReadAt: item.lastReadAt || item.last_read_at || item.updated_at,
      }))
    } else {
      // 查看他人的阅读历史：使用user API（如果后端支持）
      try {
        const response = await httpService.get(`/user/users/${userId.value}/recent-readings`, {
          params: { limit: 5 },
        })

        const history = response.data || []
        recentReadings.value = history.map((item: any) => ({
          id: item.id,
          book: {
            id: item.bookId || item.book?.id,
            title: item.book?.title,
            cover: item.book?.cover,
          },
          chapterTitle: item.chapterTitle || '未知章节',
          progress: (item.progress || 0) * 100,
          lastReadAt: item.lastReadAt,
        }))
      } catch (err) {
        // 如果后端不支持获取他人的阅读历史，返回空数组
        console.log('不支持查看他人的阅读历史')
        recentReadings.value = []
      }
    }
  } catch (error: any) {
    console.error('加载阅读记录失败:', error)
    recentReadings.value = []
  }
}

// 计算阅读进度
const calculateProgress = (item: any): number => {
  if (!item.book?.total_chapters || item.book.total_chapters === 0) {
    return 0
  }
  return Math.round((item.current_chapter / item.book.total_chapters) * 100)
}

// 格式化时间
const formatTime = (dateStr: string): string => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
  if (diff < 604800000) return Math.floor(diff / 86400000) + '天前'

  return date.toLocaleDateString()
}

// 处理关注
const handleFollow = async () => {
  if (!authStore.isLoggedIn) {
    message.warning('请先登录')
    router.push('/auth')
    return
  }

  // 测试模式检测
  const isMockToken = authStore.token?.toString().includes('mock')

  try {
    if (isMockToken) {
      // 测试模式：直接更新状态，不调用API
      console.log('[测试模式] 关注操作')
      await new Promise((resolve) => setTimeout(resolve, 300)) // 模拟网络延迟
      isFollowing.value = true
      message.success('关注成功')
      if (userStats.value) {
        userStats.value.followerCount++
      }
    } else {
      // 生产模式：调用真实API
      await httpService.post(`/users/${userId.value}/follow`)
      isFollowing.value = true
      message.success('关注成功')
      if (userStats.value) {
        userStats.value.followerCount++
      }
    }
  } catch (error: any) {
    console.error('关注失败:', error)
    message.error('关注失败')
  }
}

// 处理取消关注
const handleUnfollow = async () => {
  // 测试模式检测
  const isMockToken = authStore.token?.toString().includes('mock')

  try {
    if (isMockToken) {
      // 测试模式：直接更新状态，不调用API
      console.log('[测试模式] 取消关注操作')
      await new Promise((resolve) => setTimeout(resolve, 300)) // 模拟网络延迟
      isFollowing.value = false
      message.success('已取消关注')
      if (userStats.value && userStats.value.followerCount > 0) {
        userStats.value.followerCount--
      }
    } else {
      // 生产模式：调用真实API
      await httpService.delete(`/users/${userId.value}/follow`)
      isFollowing.value = false
      message.success('已取消关注')
      if (userStats.value && userStats.value.followerCount > 0) {
        userStats.value.followerCount--
      }
    }
  } catch (error: any) {
    console.error('取消关注失败:', error)
    message.error('取消关注失败')
  }
}

// ========== 批量操作方法 ==========

// 全选/取消全选
const handleSelectAll = (checked: boolean) => {
  if (checked) {
    selectedBooks.value = bookshelfList.value.map((item) => item.book_id)
  } else {
    selectedBooks.value = []
  }
}

// 选择单本书籍
const handleSelectBook = (bookId: string, checked: boolean) => {
  if (checked) {
    if (!selectedBooks.value.includes(bookId)) {
      selectedBooks.value.push(bookId)
    }
  } else {
    const index = selectedBooks.value.indexOf(bookId)
    if (index > -1) {
      selectedBooks.value.splice(index, 1)
    }
  }
  // 更新全选状态
  selectAll.value = selectedBooks.value.length === bookshelfList.value.length
}

// 点击书籍卡片
const handleBookClick = (item: any) => {
  // 如果已选中，取消选中
  if (selectedBooks.value.includes(item.book_id)) {
    handleSelectBook(item.book_id, false)
  } else {
    // 否则跳转到书籍详情
    goToBook(item.book_id)
  }
}

// 打开移动分类对话框
const openMoveDialog = () => {
  if (selectedBooks.value.length === 0) {
    message.warning('请先选择要移动的书籍')
    return
  }
  selectedCategory.value = ''
  moveDialogVisible.value = true
}

// 批量移动分类
const handleBatchMove = async () => {
  if (!selectedCategory.value) {
    message.warning('请选择分类')
    return
  }

  try {
    await messageBox.confirm(
      `确定要将选中的 ${selectedBooks.value.length} 本书籍移动到"${bookCategories.value.find((c) => c.value === selectedCategory.value)?.label}"吗？`,
      '移动确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
      },
    )

    // 调用批量更新状态API
    await batchAPI.batchUpdateStatus(selectedBooks.value, selectedCategory.value)

    message.success('移动成功')
    moveDialogVisible.value = false
    selectedBooks.value = []
    selectAll.value = false
    loadBookshelf()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('批量移动失败:', error)
      message.error('移动失败')
    }
  }
}

// 批量移出书架
const handleBatchRemove = async () => {
  try {
    await messageBox.confirm(
      `确定要将选中的 ${selectedBooks.value.length} 本书籍移出书架吗？`,
      '移出确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
      },
    )

    // 调用批量删除API
    const result = await batchAPI.batchRemove(selectedBooks.value)
    if (!result.success && result.message) {
      message.warning(result.message)
    } else {
      message.success('已移出书架')
    }
    selectedBooks.value = []
    selectAll.value = false
    loadBookshelf()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
      message.error('移出失败')
    }
  }
}

// 打开导出对话框
const openExportDialog = () => {
  if (selectedBooks.value.length === 0) {
    message.warning('请先选择要导出的书籍')
    return
  }
  exportDialogVisible.value = true
}

// 导出书单
const handleExport = async (format: string) => {
  try {
    // 客户端导出
    const selectedBooksData = bookshelfList.value.filter((item) =>
      selectedBooks.value.includes(item.book_id),
    )

    const exportData = selectedBooksData.map((item) => ({
      title: item.book?.title,
      author: item.book?.author,
      category: item.book?.category,
      totalChapters: item.book?.total_chapters,
      currentChapter: item.current_chapter,
      progress: calculateProgress(item) + '%',
    }))

    let content = ''
    let filename = ''
    let type = ''

    if (format === 'json') {
      content = JSON.stringify(exportData, null, 2)
      filename = `书单_${new Date().toLocaleDateString()}.json`
      type = 'application/json'
    } else if (format === 'csv') {
      const headers = ['书名', '作者', '分类', '总章节数', '当前章节', '进度']
      const rows = exportData.map(
        (d) =>
          `${d.title},${d.author},${d.category},${d.totalChapters},${d.currentChapter},${d.progress}`,
      )
      content = [headers.join(','), ...rows].join('\n')
      filename = `书单_${new Date().toLocaleDateString()}.csv`
      type = 'text/csv'
    }

    // 创建下载链接
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)

    message.success(`已导出 ${selectedBooks.value.length} 本书籍`)
    exportDialogVisible.value = false
    selectedBooks.value = []
    selectAll.value = false
  } catch (error: any) {
    console.error('导出失败:', error)
    message.error('导出失败')
  }
}

// 处理私信
const handleMessage = () => {
  message.info('私信功能开发中')
}

// 前往书籍详情
const goToBook = (bookId: string) => {
  router.push(`/bookstore/books/${bookId}`)
}

// 前往阅读器
const goToReader = (bookId: string, chapterId: string) => {
  router.push(`/reader/${bookId}/${chapterId}`)
}

// 初始化
onMounted(() => {
  loadUserProfile()
  loadBookshelf()
  loadRecentReadings()
})
</script>

<style scoped lang="scss">
.reader-profile {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.loading-container,
.error-container {
  padding: 60px 0;
  text-align: center;
}

.profile-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.content-card {
  border-radius: 12px;

  :deep(.el-card__body) {
    padding: 20px;
  }

  :deep(.el-tabs__header) {
    margin-bottom: 20px;
  }
}

.tab-loading,
.empty-content {
  padding: 40px 0;
  text-align: center;
}

.bookshelf-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8f9fb;
  border-radius: 8px;
  margin-bottom: 20px;

  .toolbar-left {
    display: flex;
    align-items: center;
    gap: 16px;

    .selected-count {
      font-size: 14px;
      color: #606266;
      font-weight: 500;
    }
  }

  .toolbar-right {
    display: flex;
    gap: 8px;
  }
}

.bookshelf-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.book-card {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
  border: 1px solid #ebeef5;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    transform: translateY(-4px);
  }

  &.is-selected {
    border-color: #409eff;
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
  }

  .book-checkbox {
    position: absolute;
    top: 8px;
    left: 8px;
    z-index: 2;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 4px;
    padding: 4px;
  }
}

.book-cover {
  width: 100%;
  height: 280px;
  display: block;

  .image-slot {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    background-color: #f5f7fa;
    color: #909399;
    font-size: 48px;
  }
}

.book-info {
  padding: 16px;

  .book-title {
    font-size: 15px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 12px 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .reading-progress {
    margin-bottom: 12px;

    .progress-text {
      display: block;
      margin-top: 8px;
      font-size: 12px;
      color: #909399;
    }
  }

  .book-meta {
    .last-read {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: #909399;
    }
  }
}

.stats-content {
  .stat-card {
    border-radius: 12px;
    margin-bottom: 20px;

    .stat-item {
      display: flex;
      align-items: center;
      gap: 16px;

      .stat-icon {
        width: 60px;
        height: 60px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .stat-info {
        flex: 1;

        .stat-value {
          font-size: 28px;
          font-weight: 600;
          color: #303133;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 14px;
          color: #909399;
        }
      }
    }
  }
}

.recent-reading-card {
  .card-header {
    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }
  }

  .recent-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .recent-item {
    display: flex;
    gap: 12px;
    padding: 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s;

    &:hover {
      background-color: #f5f7fa;
    }

    .recent-cover {
      width: 60px;
      height: 80px;
      border-radius: 6px;
      flex-shrink: 0;

      .image-slot-small {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
        background-color: #f5f7fa;
        color: #909399;
        font-size: 24px;
      }
    }

    .recent-info {
      flex: 1;
      min-width: 0;

      .recent-title {
        font-size: 15px;
        font-weight: 500;
        color: #303133;
        margin-bottom: 6px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .recent-chapter {
        font-size: 13px;
        color: #606266;
        margin-bottom: 4px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .recent-time {
        font-size: 12px;
        color: #909399;
      }
    }
  }
}

.pagination {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

@media (max-width: 768px) {
  .reader-profile {
    padding: 16px;
  }

  .bookshelf-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
  }

  .book-cover {
    height: 200px;
  }

  .stats-content {
    :deep(.el-col) {
      margin-bottom: 12px;
    }
  }
}
</style>
