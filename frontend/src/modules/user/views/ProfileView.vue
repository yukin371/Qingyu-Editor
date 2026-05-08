<template>
  <div class="profile-container">
    <!-- 布局容器 -->
    <div class="profile-layout">
      <!-- 左侧：个人信息与操作 (Sticky 布局) -->
      <aside class="profile-sidebar">
        <Card :class="userCardClass">
          <div class="user-header-bg"></div>

          <div class="user-content">
            <!-- 头像区 -->
            <div class="avatar-section">
              <div class="avatar-wrapper">
                <QyAvatar size="xl" :src="avatarUrl" class="main-avatar">
                  {{ displayName.slice(0, 1) }}
                </QyAvatar>
              </div>
              <el-upload
                class="avatar-uploader"
                :action="uploadAction"
                :show-file-list="false"
                :before-upload="beforeAvatarUpload"
                :on-success="handleAvatarSuccess"
                :on-error="handleAvatarError"
                accept="image/*"
              >
                <QyButton class="avatar-edit-btn" variant="outline">
                  <QyIcon name="Upload" />
                  编辑头像
                </QyButton>
              </el-upload>
            </div>

            <!-- 展示状态 -->
            <div v-if="!isEditing" class="info-display">
              <h2 class="user-name">{{ displayName || '读者用户' }}</h2>
              <p class="user-handle">@{{ username || 'reader' }}</p>

              <div class="bio-box">
                {{ profileForm.bio || '这个人很懒，什么都没写~' }}
              </div>

              <div class="meta-tags">
                <span class="tag" v-if="email">{{ email }}</span>
                <span class="tag role-tag">{{ roleLabel }}</span>
                <span class="tag vip-tag">{{ vipLevelLabel }}</span>
              </div>

              <div class="action-buttons">
                <QyButton class="btn-block" variant="primary" @click="toggleEdit">
                  编辑资料
                </QyButton>
                <div class="secondary-actions">
                  <QyButton class="btn-half" variant="ghost" @click="goToSettings"
                    >账户设置</QyButton
                  >
                  <QyButton class="btn-half" variant="ghost" @click="goToSecurity"
                    >修改密码</QyButton
                  >
                </div>
              </div>
            </div>

            <!-- 编辑状态 -->
            <div v-else class="edit-form-wrap">
              <div class="form-title">编辑资料</div>
              <QyForm :model-value="profileForm" class="compact-form">
                <QyFormItem label="昵称">
                  <Input
                    v-model="profileForm.nickname"
                    :maxlength="20"
                    placeholder="怎么称呼你？"
                  />
                </QyFormItem>
                <QyFormItem label="简介">
                  <Textarea
                    v-model="profileForm.bio"
                    :rows="4"
                    :maxlength="100"
                    show-count
                    placeholder="写一段话介绍自己..."
                  />
                </QyFormItem>
                <div class="form-actions">
                  <QyButton
                    class="btn-block"
                    variant="primary"
                    :loading="savingProfile"
                    @click="saveProfile"
                    >保存</QyButton
                  >
                  <QyButton class="btn-block" variant="ghost" @click="cancelEdit">取消</QyButton>
                </div>
              </QyForm>
            </div>
          </div>
        </Card>
      </aside>

      <!-- 右侧：数据与内容 -->
      <main class="profile-main">
        <Card class="content-section account-overview-card">
          <template #header>
            <div class="section-header">
              <div class="title-group">
                <h3>账号信息</h3>
              </div>
              <QyButton text @click="goToSettings">编辑资料 <QyIcon name="ArrowRight" /></QyButton>
            </div>
          </template>

          <div class="account-grid">
            <div class="account-item">
              <span class="item-label">用户名</span>
              <span class="item-value">{{ username || 'reader' }}</span>
            </div>
            <div class="account-item">
              <span class="item-label">邮箱</span>
              <span class="item-value">{{ email || '暂未绑定' }}</span>
            </div>
            <div class="account-item">
              <span class="item-label">角色</span>
              <span class="item-value">{{ roleLabel }}</span>
            </div>
            <div class="account-item">
              <span class="item-label">VIP等级</span>
              <span class="item-value">{{ vipLevelLabel }}</span>
            </div>
          </div>

          <div class="account-actions">
            <QyButton variant="ghost" @click="goToSecurity">修改密码</QyButton>
            <QyButton variant="ghost" @click="goToHistory">阅读历史</QyButton>
            <QyButton variant="ghost" @click="goToCollections">收藏管理</QyButton>
            <QyButton variant="ghost" @click="goToWallet">我的钱包</QyButton>
          </div>
        </Card>

        <!-- 统计数据栏 -->
        <div class="stats-overview">
          <div class="stat-card">
            <div class="stat-icon icon-blue"><QyIcon name="Reading" /></div>
            <div class="stat-info">
              <span class="stat-value">{{ readingStats.totalBooks }}</span>
              <span class="stat-label">藏书</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon icon-green"><QyIcon name="Finished" /></div>
            <div class="stat-info">
              <span class="stat-value">{{ readingStats.totalChapters }}</span>
              <span class="stat-label">已读章节</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon icon-purple"><QyIcon name="TrendCharts" /></div>
            <div class="stat-info">
              <span class="stat-value">{{ readingStats.totalWords }}<small>w</small></span>
              <span class="stat-label">阅读字数</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon icon-orange"><QyIcon name="Calendar" /></div>
            <div class="stat-info">
              <span class="stat-value">{{ readingStats.totalDays }}</span>
              <span class="stat-label">活跃天数</span>
            </div>
          </div>
        </div>

        <!-- 最近阅读 -->
        <Card class="content-section">
          <template #header>
            <div class="section-header">
              <div class="title-group">
                <h3>继续阅读</h3>
                <span class="badge" v-if="readingHistory.length">{{ readingHistory.length }}</span>
              </div>
              <QyButton text @click="goToHistory">全部记录 <QyIcon name="ArrowRight" /></QyButton>
            </div>
          </template>

          <div v-if="historyLoading" class="skeleton-loader">
            <QyLoading />
          </div>
          <div v-else-if="readingHistory.length === 0" class="empty-state">
            <Empty description="最近没有阅读记录，快去探索吧" />
          </div>

          <div v-else class="history-grid">
            <div
              v-for="item in readingHistory"
              :key="item.id"
              class="history-card-item"
              @click="goToBook(item.bookId)"
            >
              <div class="cover-box">
                <Image :src="item.coverUrl" fit="cover" class="book-cover" />
                <div class="progress-overlay">
                  <span class="progress-text">已读 {{ item.progress }}%</span>
                  <div class="progress-bar-mini" :style="{ width: item.progress + '%' }"></div>
                </div>
              </div>
              <div class="book-info">
                <h4>{{ item.title }}</h4>
                <p class="chapter-link">{{ item.chapterTitle }}</p>
                <span class="time-ago">上次阅读: {{ formatTime(item.lastReadTime) }}</span>
              </div>
            </div>
          </div>
        </Card>

        <!-- 我的书架 -->
        <Card class="content-section">
          <template #header>
            <div class="section-header">
              <div class="title-group">
                <h3>我的书架</h3>
              </div>
              <QyButton text @click="goToShelf">进入书架 <QyIcon name="ArrowRight" /></QyButton>
            </div>
          </template>

          <div v-if="shelfLoading" class="skeleton-loader">
            <QyLoading />
          </div>
          <div v-else-if="shelfPreview.length === 0" class="empty-state">
            <Empty description="书架空空如也" />
          </div>

          <div v-else class="shelf-grid-wrapper">
            <div
              v-for="book in shelfPreview"
              :key="book.id"
              class="shelf-book-item"
              @click="goToBook(book.id)"
            >
              <div class="book-cover-3d">
                <Image :src="book.coverUrl" fit="cover" />
              </div>
              <div class="book-meta">
                <h4 :title="book.title">{{ book.title }}</h4>
                <p>{{ book.author }}</p>
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { UploadProps } from 'element-plus'
import { message } from '@/design-system/services'
import {
  QyAvatar,
  QyButton,
  QyForm,
  QyFormItem,
  QyLoading,
  QyIcon, // 确保你有这个组件，或者直接用 el-icon
} from '@/design-system/components'
import { Empty, Card, Textarea, Image, Input } from '@/design-system/base'
import { useUserStore } from '@/stores/user'
import { userAPI } from '@/modules/user/api'
import * as readerAPI from '@/modules/reader/api'

// --- Interfaces ---
interface ShelfBook {
  id: string
  title: string
  author: string
  coverUrl: string
  totalChapters: number
  wordCount: number
}

interface RecentReadItem {
  id: string
  bookId: string
  title: string
  author: string
  coverUrl: string
  chapterTitle: string
  progress: number
  lastReadTime: string
}

interface ReadingStats {
  totalBooks: number
  totalChapters: number
  totalWords: number
  totalDays: number
}

// --- Setup ---
const router = useRouter()
const userStore = useUserStore()

const loadingProfile = ref(false)
const savingProfile = ref(false)
const shelfLoading = ref(false)
const historyLoading = ref(false)
const isEditing = ref(false)
const userCardClass = computed(() => (isEditing.value ? 'user-card is-editing' : 'user-card'))

const uploadAction = '' // 实际接口或保持空

const profileForm = reactive({
  nickname: '',
  bio: '',
  email: '',
  avatar: '',
})

const shelfBooks = ref<ShelfBook[]>([])
const readingHistory = ref<RecentReadItem[]>([])
const readingStats = ref<ReadingStats>({
  totalBooks: 0,
  totalChapters: 0,
  totalWords: 0,
  totalDays: 0,
})

const shelfPreview = computed(() => shelfBooks.value.slice(0, 8)) // 改为8本
const isTestMode = computed(() => new URLSearchParams(window.location.search).has('test'))
const displayName = computed(() => (userStore.displayName as unknown as string) || '用户')
const username = computed(() => (userStore.username as unknown as string) || '')
const email = computed(() => (userStore.email as unknown as string) || '')
const avatar = computed(() => (userStore.avatar as unknown as string) || '')
const avatarUrl = computed(() => avatar.value || profileForm.avatar)
const profile = computed<any>(() => userStore.profile as any)
const roleLabel = computed(() => {
  const role = (profile.value?.role || (userStore.userInfo as any)?.role || '')
    .toString()
    .toLowerCase()
  if (role === 'admin') return '管理员'
  if (role === 'writer' || role === 'author') return '作者'
  return '读者'
})
const vipLevelLabel = computed(() => {
  const vipLevel =
    profile.value?.vipLevel ?? profile.value?.vip_level ?? profile.value?.membershipLevel
  if (vipLevel === undefined || vipLevel === null || vipLevel === '') {
    return isTestMode.value ? 'VIP 2' : '普通会员'
  }
  return `VIP ${vipLevel}`
})

onMounted(async () => {
  await Promise.all([loadProfile(), loadShelf(), loadRecentReading()])
  buildReadingStats()
})

// --- API Methods ---
async function loadProfile() {
  loadingProfile.value = true
  try {
    await userStore.fetchProfile()
    profileForm.nickname = profile.value?.nickname || profile.value?.username || ''
    profileForm.bio = profile.value?.bio || ''
    profileForm.email = profile.value?.email || ''
    profileForm.avatar = profile.value?.avatar || ''
  } catch (error: any) {
    if (isTestMode.value) {
      profileForm.nickname = profileForm.nickname || '测试读者'
      profileForm.bio = profileForm.bio || '热爱长篇小说与悬疑题材，偏好深夜阅读。'
      profileForm.email = profileForm.email || 'reader@qingyu.com'
      return
    }
    // message.error(error?.message || '加载个人信息失败') // 可选：静默失败
  } finally {
    loadingProfile.value = false
  }
}

async function loadShelf() {
  shelfLoading.value = true
  try {
    const response = await readerAPI.booksAPI.getBookshelf({ page: 1, pageSize: 12 })
    const data = (response as any)?.data || response
    const list = data?.books || data?.list || data?.items || data?.data || []
    shelfBooks.value = normalizeShelfBooks(list)
    if (shelfBooks.value.length === 0 && isTestMode.value) shelfBooks.value = buildMockShelfBooks()
  } catch {
    if (isTestMode.value) shelfBooks.value = buildMockShelfBooks()
  } finally {
    shelfLoading.value = false
  }
}

async function loadRecentReading() {
  historyLoading.value = true
  try {
    const response = await readerAPI.getRecentReading(4) // 获取前4个
    const data = (response as any)?.data || response
    const list = Array.isArray(data) ? data : data?.list || data?.items || data?.data || []
    readingHistory.value = normalizeRecentReading(list)
    if (readingHistory.value.length === 0 && isTestMode.value)
      readingHistory.value = buildMockRecentReading()
  } catch {
    if (isTestMode.value) readingHistory.value = buildMockRecentReading()
  } finally {
    historyLoading.value = false
  }
}

// --- Helpers & Mocks ---
function normalizeShelfBooks(list: any[]): ShelfBook[] {
  return (list || [])
    .filter((item) => item?.id || item?.bookId)
    .map((item) => ({
      id: item.id || item.bookId,
      title: item.title || '未命名书籍',
      author: item.author || '未知作者',
      coverUrl: item.cover || item.coverUrl || '/images/placeholders/book-cover.svg',
      totalChapters: Number(item.totalChapters || 0),
      wordCount: Number(item.wordCount || 0),
    }))
}

function normalizeRecentReading(list: any[]): RecentReadItem[] {
  return (list || [])
    .filter((item) => item?.id || item?.bookId)
    .map((item, idx) => ({
      id: item.id || `recent-${idx}`,
      bookId: item.bookId || item.id,
      title: item.title || item.book?.title || '未命名书籍',
      author: item.author || item.book?.author || '未知作者',
      coverUrl:
        item.cover || item.coverUrl || item.book?.coverUrl || '/images/placeholders/book-cover.svg',
      chapterTitle: item.lastReadChapter || item.chapterTitle || '最新章节',
      progress: normalizeProgress(item.progress),
      lastReadTime: item.lastReadTime || item.updatedAt || new Date().toISOString(),
    }))
}

function normalizeProgress(progress: any): number {
  const value = Number(progress || 0)
  if (value <= 1) return Math.round(value * 100)
  if (value > 100) return 100
  return Math.round(value)
}

function buildReadingStats() {
  // 简单统计逻辑
  const totalBooks = shelfBooks.value.length
  const totalChapters =
    shelfBooks.value.reduce((sum, item) => sum + (item.totalChapters || 0), 0) +
    readingHistory.value.length * 15 // Mock data addition
  const totalWordsRaw = shelfBooks.value.reduce((sum, item) => sum + (item.wordCount || 0), 0)
  const totalWords = Math.round(totalWordsRaw / 10000)

  // 简单的日期去重逻辑 (Mock)
  const activeDays = 12

  readingStats.value = {
    totalBooks,
    totalChapters,
    totalWords,
    totalDays: activeDays,
  }
}

// --- Mocks Data ---
function buildMockShelfBooks(): ShelfBook[] {
  return [
    {
      id: '1',
      title: '三体全集',
      author: '刘慈欣',
      coverUrl:
        'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=300&q=80',
      totalChapters: 102,
      wordCount: 900000,
    },
    {
      id: '2',
      title: '百年孤独',
      author: '马尔克斯',
      coverUrl:
        'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=300&q=80',
      totalChapters: 20,
      wordCount: 300000,
    },
    {
      id: '3',
      title: '沉默的大多数',
      author: '王小波',
      coverUrl:
        'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=300&q=80',
      totalChapters: 40,
      wordCount: 250000,
    },
    {
      id: '4',
      title: '设计心理学',
      author: '唐纳德',
      coverUrl:
        'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=300&q=80',
      totalChapters: 12,
      wordCount: 180000,
    },
    {
      id: '5',
      title: '人类简史',
      author: '赫拉利',
      coverUrl:
        'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=300&q=80',
      totalChapters: 30,
      wordCount: 400000,
    },
  ]
}

function buildMockRecentReading(): RecentReadItem[] {
  return [
    {
      id: 'r1',
      bookId: '1',
      title: '三体：死神永生',
      author: '刘慈欣',
      coverUrl:
        'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=300&q=80',
      chapterTitle: '第三部 第5章',
      progress: 65,
      lastReadTime: new Date().toISOString(),
    },
    {
      id: 'r2',
      bookId: '2',
      title: '设计模式之禅',
      author: '秦小波',
      coverUrl:
        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=300&q=80',
      chapterTitle: '第23章 单例模式',
      progress: 12,
      lastReadTime: new Date(Date.now() - 86400000).toISOString(),
    },
  ]
}

// --- Actions ---
function toggleEdit() {
  isEditing.value = !isEditing.value
}
function cancelEdit() {
  isEditing.value = false
  profileForm.nickname = profile.value?.nickname || profile.value?.username || ''
  profileForm.bio = profile.value?.bio || ''
}

async function saveProfile() {
  savingProfile.value = true
  try {
    await userStore.updateProfile({
      nickname: profileForm.nickname.trim(),
      bio: profileForm.bio.trim(),
    })
    isEditing.value = false
    message.success('资料已更新')
  } catch (error: any) {
    message.error(error?.message || '保存失败')
  } finally {
    savingProfile.value = false
  }
}

const beforeAvatarUpload: UploadProps['beforeUpload'] = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isImage || !isLt2M) {
    message.warning('请上传2MB以内的图片')
    return false
  }
  handleAvatarUpload(file)
  return false
}

async function handleAvatarUpload(file: File) {
  try {
    const res = await userAPI.uploadAvatar(file)
    if ((res as any)?.url) {
      await userStore.fetchProfile()
      profileForm.avatar = (res as any).url
      message.success('头像更新成功')
    }
  } catch {
    message.error('上传失败')
  }
}
const handleAvatarSuccess = () => {}
const handleAvatarError = () => {}

// --- Navigation & Utils ---
function goToBook(id: string) {
  router.push(`/bookstore/books/${id}`)
}
function goToShelf() {
  router.push('/reading/bookshelf')
}
function goToCollections() {
  router.push('/reading/collections')
}
function goToHistory() {
  router.push('/reading/history')
}
function goToSettings() {
  router.push('/account/settings/account')
}
function goToSecurity() {
  router.push('/account/settings/security')
}
function goToWallet() {
  router.push('/account/wallet')
}

function formatTime(isoStr: string) {
  const date = new Date(isoStr)
  const now = new Date()
  const diff = (now.getTime() - date.getTime()) / 1000
  if (diff < 60) return '刚刚'
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`
  return `${date.getMonth() + 1}月${date.getDate()}日`
}
</script>

<style scoped lang="scss">
/* --- 布局容器 --- */
.profile-container {
  min-height: calc(100vh - 80px); /* 减去 Header 高度 */
  background-color: #f6f8fc;
  padding: 30px 20px;
}

.profile-layout {
  max-width: 1240px;
  margin: 0 auto;
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

/* --- 左侧 Sidebar --- */
.profile-sidebar {
  width: 340px;
  flex-shrink: 0;
  position: sticky;
  top: 90px; /* 滚动吸顶 */
}

.user-card {
  padding: 0 !important;
  overflow: hidden;
  border: none;
  background: #fff;
  transition: all 0.3s ease;

  :deep(.el-card__body) {
    padding: 0;
  }
}

.user-header-bg {
  height: 120px;
  background: linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%);
  position: relative;
}

.user-content {
  padding: 0 24px 30px;
  text-align: center;
  position: relative;
  margin-top: -50px; /* 头像上浮 */
}

.avatar-wrapper {
  position: relative;
  display: inline-block;

  .main-avatar {
    width: 120px !important;
    height: 120px !important;
    border: 4px solid #fff;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
    background: #fff;
  }
}

.avatar-uploader {
  margin-top: 14px;
}

.avatar-uploader :deep(input[type='file']) {
  display: none !important;
}

.avatar-edit-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 42px;
  padding: 10px 18px;
  font-size: 12px;
  line-height: 1;
  font-weight: 500;
  border-radius: 999px;
}

.avatar-edit-btn :deep(.qy-icon),
.avatar-edit-btn :deep(.el-icon) {
  font-size: 15px;
}

.info-display {
  margin-top: 16px;

  .user-name {
    margin: 0;
    font-size: 22px;
    color: #1a1a1a;
    font-weight: 700;
  }

  .user-handle {
    margin: 4px 0 16px;
    color: #909399;
    font-size: 14px;
  }

  .bio-box {
    background: #f8f9fb;
    padding: 12px;
    border-radius: 8px;
    color: #606266;
    font-size: 14px;
    line-height: 1.6;
    margin-bottom: 20px;
    text-align: left;
  }

  .meta-tags {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-bottom: 24px;

    .tag {
      font-size: 12px;
      padding: 2px 8px;
      border-radius: 4px;
      background: #f0f2f5;
      color: #606266;

      &.vip-tag {
        background: #fff8e6;
        color: #bfa34c;
      }
    }
  }

  .action-buttons {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .btn-block {
      width: 100%;
    }

    .secondary-actions {
      display: flex;
      gap: 12px;

      .btn-half {
        flex: 1;
      }
    }
  }
}

.account-overview-card {
  .account-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 14px;
  }

  .account-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
    border: 1px solid #edf1f7;
    border-radius: 10px;
    background: #f9fbff;
    padding: 12px;
  }

  .item-label {
    font-size: 12px;
    color: #8d98a9;
  }

  .item-value {
    font-size: 14px;
    color: #273142;
    font-weight: 600;
    line-height: 1.3;
    word-break: break-all;
  }

  .account-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
}

.edit-form-wrap {
  margin-top: 16px;
  text-align: left;

  .form-title {
    font-weight: bold;
    margin-bottom: 12px;
    text-align: center;
  }

  .compact-form {
    :deep(.el-form-item) {
      margin-bottom: 16px;
    }
  }

  .form-actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 24px;

    .btn-block {
      width: 100%;
      margin: 0;
    }
  }
}

/* --- 右侧 Main --- */
.profile-main {
  flex: 1;
  min-width: 0; /* 防止 grid 撑开 */
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 统计卡片 */
.stats-overview {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.02);
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-3px);
  }

  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;

    &.icon-blue {
      background: #ecf5ff;
      color: #409eff;
    }
    &.icon-green {
      background: #f0f9eb;
      color: #67c23a;
    }
    &.icon-purple {
      background: #f4f4f5;
      color: #909399;
    }
    &.icon-orange {
      background: #fdf6ec;
      color: #e6a23c;
    }
  }

  .stat-info {
    display: flex;
    flex-direction: column;

    .stat-value {
      font-size: 24px;
      font-weight: 800;
      color: #1a1a1a;
      line-height: 1.2;

      small {
        font-size: 14px;
        font-weight: normal;
        margin-left: 2px;
      }
    }

    .stat-label {
      font-size: 12px;
      color: #909399;
      margin-top: 4px;
    }
  }
}

/* 内容通用样式 */
.content-section {
  border: none;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.02);

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .title-group {
      display: flex;
      align-items: center;
      gap: 8px;

      h3 {
        margin: 0;
        font-size: 18px;
        color: #303133;
      }
      .badge {
        background: #f2f3f5;
        color: #606266;
        padding: 1px 8px;
        border-radius: 10px;
        font-size: 12px;
        font-weight: bold;
      }
    }
  }
}

/* 最近阅读 */
.history-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.history-card-item {
  display: flex;
  gap: 16px;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid #f0f2f5;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #fcfcfd;
    border-color: #e4e7ed;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  .cover-box {
    width: 80px;
    height: 106px;
    border-radius: 6px;
    overflow: hidden;
    position: relative;
    flex-shrink: 0;

    .book-cover {
      width: 100%;
      height: 100%;
    }

    .progress-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 24px;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(2px);
      display: flex;
      flex-direction: column;
      justify-content: center;

      .progress-text {
        color: #fff;
        font-size: 10px;
        text-align: center;
        line-height: 1;
        margin-bottom: 2px;
      }

      .progress-bar-mini {
        height: 2px;
        background: #409eff;
      }
    }
  }

  .book-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;

    h4 {
      margin: 0 0 6px;
      font-size: 16px;
      color: #303133;
      line-height: 1.4;
    }

    .chapter-link {
      font-size: 13px;
      color: #606266;
      margin: 0 0 12px;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .time-ago {
      font-size: 12px;
      color: #909399;
    }
  }
}

/* 书架网格 */
.shelf-grid-wrapper {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 20px;
  row-gap: 24px;
}

.shelf-book-item {
  cursor: pointer;

  .book-cover-3d {
    width: 100%;
    aspect-ratio: 2/3;
    border-radius: 6px;
    overflow: hidden;
    box-shadow: 2px 4px 10px rgba(0, 0, 0, 0.15);
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);

    :deep(img) {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .book-meta {
    margin-top: 10px;

    h4 {
      margin: 0;
      font-size: 14px;
      color: #303133;
      line-height: 1.4;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    p {
      margin: 4px 0 0;
      font-size: 12px;
      color: #909399;
    }
  }

  &:hover .book-cover-3d {
    transform: translateY(-5px);
    box-shadow: 4px 8px 16px rgba(0, 0, 0, 0.2);
  }
}

.skeleton-loader {
  padding: 40px;
  display: flex;
  justify-content: center;
}

/* --- 响应式 --- */
@media (max-width: 960px) {
  .profile-layout {
    flex-direction: column;
    gap: 20px;
  }

  .profile-sidebar {
    width: 100%;
    position: static;
  }

  .user-content {
    padding-bottom: 20px;
  }

  .stats-overview {
    grid-template-columns: repeat(2, 1fr);
  }

  .history-grid {
    grid-template-columns: 1fr;
  }

  .account-overview-card .account-grid {
    grid-template-columns: 1fr;
  }
}
</style>
