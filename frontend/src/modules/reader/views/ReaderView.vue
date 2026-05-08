<template>
  <div class="reader-page">
    <!-- 页面过渡动画 -->
    <transition name="reader-fade" mode="out-in">
      <div
        v-show="true"
        class="reader-view"
        :class="themeClass"
        key="reader"
        data-testid="reader-view"
      >
        <el-container v-loading="loading" data-testid="reader-container">
          <!-- 顶部导航栏 -->
          <ReaderHeader
            :is-fullscreen="isFullscreen"
            :has-previous-chapter="hasPreviousChapter"
            :has-next-chapter="hasNextChapter"
            @previous="handlePreviousChapter"
            @next="handleNextChapter"
            @back-to-catalog="goBackToBookDetail"
            @go-home="goHome"
            @toggle-settings="toggleSettings"
          />

          <!-- 阅读内容区 -->
          <ReaderContent
            :chapter-title="currentChapter?.title"
            :paragraphs="displayParagraphs"
            :container-style="containerStyle"
            :highlighted-paragraph-index="highlightedParagraphIndex"
            :show-recommendation="showChapterEndRecommendation"
            :reading-time-text="formatReadingTime"
            :is-in-bookshelf="isInBookshelf"
            :recommended-books="recommendedBooks"
            :get-comment-count="getParagraphCommentCount"
            @toggle-fullscreen="toggleHeaderFooter"
            @paragraph-click="handleParagraphClick"
            @comment-badge-click="handleCommentBadgeClick"
            @add-to-bookshelf="addToBookshelf"
            @go-to-book="goToBook"
            @scroll="handleScroll"
          />

          <div v-if="isLockedChapter" class="chapter-lock-shell">
            <div class="chapter-lock-card">
              <span class="lock-kicker">Paid Chapter</span>
              <h3>{{ currentChapter?.title }}</h3>
              <p>{{ lockReason }}</p>
              <div class="lock-price">
                <span>解锁价格</span>
                <strong>¥{{ formatMoney(currentChapterPrice) }}</strong>
              </div>
              <div class="lock-actions">
                <QyButton v-if="!isLoggedIn" variant="primary" @click="goToLogin">
                  登录后购买
                </QyButton>
                <template v-else>
                  <QyButton variant="primary" :loading="purchasing" @click="handlePurchaseChapter">
                    立即购买章节
                  </QyButton>
                  <QyButton @click="goToWallet">先去充值</QyButton>
                </template>
              </div>
            </div>
          </div>

          <!-- 底部导航栏 -->
          <ReaderFooter
            :is-fullscreen="isFullscreen"
            :has-previous-chapter="hasPreviousChapter"
            :has-next-chapter="hasNextChapter"
            :progress-text="progressText"
            :progress="readProgress"
            @previous="handlePreviousChapter"
            @next="handleNextChapter"
            @back-to-catalog="goBackToBookDetail"
            @go-home="goHome"
            @progress-change="handleProgressChange"
          />
        </el-container>
      </div>
    </transition>

    <!-- 目录抽屉 -->
    <ReaderTocDrawer
      v-model:visible="catalogVisible"
      :chapters="chapterList"
      :current-chapter-id="chapterId"
      @jump="handleJumpToChapter"
    />

    <!-- 设置浮层卡片 -->
    <ReaderSettings
      :visible="settingsVisible"
      :settings="settings"
      :themes="themes"
      :line-height-min="lineHeightMin"
      :line-height-max="lineHeightMax"
      :line-height-step="lineHeightStep"
      :line-height-marks="lineHeightMarks"
      :page-width-min="pageWidthMin"
      :page-width-max="pageWidthMax"
      :page-width-step="pageWidthStep"
      :page-width-marks="pageWidthMarks"
      @close="settingsVisible = false"
      @increase-font="increaseFontSize"
      @decrease-font="decreaseFontSize"
      @update:line-height="setLineHeight"
      @update:page-width="setPageWidth"
      @update:theme="changeTheme"
      @reset="resetSettings"
    />

    <!-- 段落评论抽屉 -->
    <CommentDrawer
      v-model="commentDrawerVisible"
      :paragraph-index="highlightedParagraphIndex ?? 0"
      :comments="commentStore.currentComments"
      :loading="commentStore.isLoading"
      @like="commentStore.toggleLike"
      @submit="handleCommentSubmit"
    />

    <QyButton
      v-if="showBackTop"
      class="back-to-top-btn"
      variant="secondary"
      @click="scrollToTop"
      data-testid="reader-back-to-top-btn"
    >
      ↑
    </QyButton>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useReaderStore } from '@/stores/reader'
import { useCommentStore } from '@/stores/comment'
import { useWalletStore } from '@/stores/wallet'
import { useAuthStore } from '@/stores/auth'
import { useTouch } from '@/composables/useTouch'
import { useResponsive } from '@/composables/useResponsive'
import { message } from '@/design-system/services'
import { QyButton } from '@/design-system/components'
import CommentDrawer from '../components/comments/CommentDrawer.vue'
import {
  YUNLAN_TOTAL_CHAPTERS,
  createYunlanReaderChapters,
} from '@/modules/bookstore/yunlanDemo.mock'
import {
  getPublishedBookDetail,
  shouldUsePublishedBridge,
} from '@/modules/workflow/publishedBridge'
import * as readerAPI from '@/modules/reader/api'

// 子组件
import ReaderHeader from '../components/reader/ReaderHeader.vue'
import ReaderContent from '../components/reader/ReaderContent.vue'
import ReaderFooter from '../components/reader/ReaderFooter.vue'
import ReaderTocDrawer from '../components/reader/ReaderTocDrawer.vue'
import ReaderSettings from '../components/reader/ReaderSettings.vue'

// Composables
import { useReaderSettings } from '../composables/useReaderSettings'
import { useReaderComments, type ReaderParagraph } from '../composables/useReaderComments'

interface Chapter {
  id: string
  bookId?: string
  title: string
  chapterNum?: number
  price?: number
  canAccess?: boolean
  accessReason?: string
  content?: string
  paragraphs?: ReaderParagraph[]
  isRead?: boolean
  isFree?: boolean
  prevChapterId?: string | null
  nextChapterId?: string | null
  hasPrevious?: boolean
  hasNext?: boolean
}

const route = useRoute()
const router = useRouter()
const readerStore = useReaderStore()
const commentStore = useCommentStore()
const walletStore = useWalletStore()
const authStore = useAuthStore()
const { isMobile } = useResponsive()

// 使用设置 composable
const {
  settings,
  themeClass,
  containerStyle,
  themes,
  lineHeightMin,
  lineHeightMax,
  lineHeightStep,
  lineHeightMarks,
  pageWidthMin,
  pageWidthMax,
  pageWidthStep,
  pageWidthMarks,
  increaseFontSize,
  decreaseFontSize,
  changeTheme,
  setLineHeight,
  setPageWidth,
  resetSettings,
} = useReaderSettings()

// 基础状态
const chapterId = ref(route.params.chapterId as string)
const isDemoMode = computed(() => route.query.demo === 'yunlan')
const publishedBookId = computed(() =>
  String(
    route.query.bookId || (readerStore as unknown as { currentBookId: string }).currentBookId || '',
  ),
)
const publishedBridgeDetail = computed(() =>
  shouldUsePublishedBridge(route.query.source, publishedBookId.value)
    ? getPublishedBookDetail(publishedBookId.value)
    : null,
)
const isPublishedMode = computed(() => !!publishedBridgeDetail.value)
const loading = ref(false)
const catalogVisible = ref(false)
const settingsVisible = ref(false)
const isFullscreen = ref(false)
const readProgress = ref(0)
const readingTimer = ref<number | null>(null)
const startTime = ref(Date.now())
const readerContainerRef = ref()

// 阅读时长累加追踪（用于向后端发送增量秒数）
let lastReadingSyncTime = 0 // 上次同步时的累加秒数
const READING_SYNC_INTERVAL = 30000 // 30秒同步一次

// 阅读流程优化相关状态
const showChapterEndRecommendation = ref(false)
const isInBookshelf = ref(false)
const readingDuration = ref(0)
const readingDurationTimer = ref<number | null>(null)
const hasAddedToBookshelfThisSession = ref(false)
const recommendedBooks = ref<Array<{
  id: string
  title: string
  author: string
  cover: string
  reason?: string
}>>([])
const demoChapterList = ref(createYunlanReaderChapters())
const demoCurrentChapter = ref<Chapter | null>(null)
const publishedChapterList = ref<Chapter[]>([])
const publishedCurrentChapter = ref<Chapter | null>(null)

// 段落处理函数
const splitContentToParagraphs = (content?: string): ReaderParagraph[] => {
  if (!content) return []
  const normalized = content.replace(/\r\n/g, '\n').trim()
  if (!normalized) return []
  return normalized
    .split(/\n\s*\n/)
    .map((paragraph, index) => ({
      id: `fallback-paragraph-${index + 1}`,
      paragraphOrder: index + 1,
      content: paragraph.trim(),
      format: 'markdown',
      wordCount: paragraph.trim().length,
    }))
    .filter((paragraph) => paragraph.content.length > 0)
}

// 当前章节
const currentChapter = computed(() => {
  if (isDemoMode.value) return demoCurrentChapter.value
  if (isPublishedMode.value) return publishedCurrentChapter.value
  return readerStore.currentChapter as unknown as Chapter | null
})

// 章节列表
const chapterList = computed(() => {
  if (isDemoMode.value) return demoChapterList.value
  if (isPublishedMode.value) return publishedChapterList.value
  return readerStore.chapterList as unknown as Chapter[]
})

// 显示的段落
const displayParagraphs = computed<ReaderParagraph[]>(() => {
  const paragraphs = currentChapter.value?.paragraphs
  if (Array.isArray(paragraphs) && paragraphs.length > 0) {
    return paragraphs
      .filter((paragraph): paragraph is ReaderParagraph => !!paragraph?.content)
      .slice()
      .sort((a, b) => (a.paragraphOrder || 0) - (b.paragraphOrder || 0))
  }
  return splitContentToParagraphs(currentChapter.value?.content)
})

// 使用评论 composable
const {
  highlightedParagraphIndex,
  commentDrawerVisible,
  getParagraphCommentCount,
  handleParagraphClick,
  handleCommentBadgeClick,
  handleCommentSubmit,
  loadChapterCommentSummaries,
  clearCommentSelection,
} = useReaderComments({
  currentChapter,
  displayParagraphs,
})

// 导航计算属性
const hasPreviousChapter = computed(() => {
  return !!currentChapter.value?.prevChapterId || !!currentChapter.value?.hasPrevious
})

const hasNextChapter = computed(() => {
  return !!currentChapter.value?.nextChapterId || !!currentChapter.value?.hasNext
})

const progressText = computed(() => {
  if (!currentChapter.value) return '0%'
  return `${readProgress.value}%`
})

const showBackTop = computed(() => readProgress.value > 15)
const isLockedChapter = computed(() => {
  if (isDemoMode.value || isPublishedMode.value) return false
  return !!currentChapter.value && (currentChapter.value as any).canAccess === false
})
const lockReason = computed(() => (currentChapter.value as any)?.accessReason || '该章节需要购买后阅读')
const currentChapterPrice = computed(() => Number(currentChapter.value?.price || 0) / 100)
const isLoggedIn = computed(() => Boolean(authStore.token))
const purchasing = ref(false)

// 阅读时长格式化
const formatReadingTime = computed(() => {
  const minutes = Math.floor(readingDuration.value / 60)
  const seconds = readingDuration.value % 60
  if (minutes > 0) {
    return `${minutes}分${seconds}秒`
  }
  return `${seconds}秒`
})

const formatMoney = (value: number) => Number(value || 0).toFixed(2)

// 方法
const toggleHeaderFooter = () => {
  isFullscreen.value = !isFullscreen.value
}

const toggleSettings = () => {
  settingsVisible.value = !settingsVisible.value
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleScroll = () => {
  const scrollTop = window.scrollY
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
  if (scrollHeight > 0) {
    readProgress.value = Math.round((scrollTop / scrollHeight) * 100)
    if (readProgress.value >= 95 && !showChapterEndRecommendation.value) {
      showChapterEndRecommendation.value = true
    }
  }
}

const handleProgressChange = (value: number) => {
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
  window.scrollTo(0, (scrollHeight * value) / 100)
}

const saveCurrentProgress = async () => {
  if (!currentChapter.value) return
  try {
    const scrollPercent = Math.round(
      (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100,
    )
    await readerStore.saveProgress(
      currentChapter.value.bookId || '',
      chapterId.value,
      scrollPercent,
      window.scrollY,
    )
    // 计算自上次同步以来的增量秒数
    const totalSeconds = Math.floor((Date.now() - startTime.value) / 1000)
    const deltaSeconds = totalSeconds - lastReadingSyncTime
    lastReadingSyncTime = totalSeconds
    if (deltaSeconds > 0 && currentChapter.value.bookId) {
      await readerStore.updateReadingTime(currentChapter.value.bookId, deltaSeconds)
    }
  } catch {
    // 静默失败
  }
}

const handlePreviousChapter = async () => {
  if (!hasPreviousChapter.value) return
  await saveCurrentProgress()

  if (currentChapter.value?.prevChapterId) {
    chapterId.value = currentChapter.value.prevChapterId
    await loadChapter()
    scrollToTop()
    return
  }

  try {
    const bookId = currentChapter.value?.bookId || publishedBookId.value
    if (!bookId || !chapterId.value) return

    const prevChapterInfo = await readerAPI.getPreviousChapter(bookId, chapterId.value)
    const prevData = ((prevChapterInfo as { data?: unknown }).data ?? prevChapterInfo) as {
      chapterId?: string
      id?: string
    }

    if (prevData?.chapterId || prevData?.id) {
      chapterId.value = prevData.chapterId || prevData.id || ''
      await loadChapter()
    }
  } catch (error) {
    console.error('获取上一章失败:', error)
  }
  scrollToTop()
}

const handleNextChapter = async () => {
  if (!hasNextChapter.value) return
  await saveCurrentProgress()

  if (currentChapter.value?.nextChapterId) {
    chapterId.value = currentChapter.value.nextChapterId
    await loadChapter()
    scrollToTop()
    return
  }

  try {
    const bookId = currentChapter.value?.bookId || publishedBookId.value
    if (!bookId || !chapterId.value) return

    const nextChapterInfo = await readerAPI.getNextChapter(bookId, chapterId.value)
    const nextData = ((nextChapterInfo as { data?: unknown }).data ?? nextChapterInfo) as {
      chapterId?: string
      id?: string
    }

    if (nextData?.chapterId || nextData?.id) {
      chapterId.value = nextData.chapterId || nextData.id || ''
      await loadChapter()
    }
  } catch (error) {
    console.error('获取下一章失败:', error)
  }
  scrollToTop()
}

const handleJumpToChapter = async (id: string) => {
  if (id === chapterId.value) return
  await saveCurrentProgress()
  chapterId.value = id
  await loadChapter()
  catalogVisible.value = false
  scrollToTop()
}

const goBackToBookDetail = () => {
  if (isDemoMode.value) {
    router.push('/bookstore/books-demo')
    return
  }
  if (isPublishedMode.value && publishedBookId.value) {
    router.push(`/bookstore/books/${publishedBookId.value}`)
    return
  }
  if (currentChapter.value?.bookId) {
    router.push(`/bookstore/books/${currentChapter.value.bookId}`)
  } else {
    router.back()
  }
}

const goHome = () => {
  router.push('/bookstore')
}

const goToWallet = () => {
  router.push('/user/wallet')
}

const goToLogin = () => {
  router.push({
    path: '/auth',
    query: {
      redirect: route.fullPath,
    },
  })
}

const goToBook = (bookId: string) => {
  router.push(`/bookstore/books/${bookId}`)
}

const addToBookshelf = async () => {
  if (hasAddedToBookshelfThisSession.value || isInBookshelf.value) return
  try {
    await new Promise((resolve) => setTimeout(resolve, 500))
    hasAddedToBookshelfThisSession.value = true
    isInBookshelf.value = true
    message.success('已添加到书架')
  } catch {
    console.error('添加到书架失败')
  }
}

const checkBookshelfStatus = async () => {
  if (!currentChapter.value?.bookId) return
  try {
    isInBookshelf.value = false
  } catch {
    console.error('检查书架状态失败')
  }
}

const loadRecommendedBooks = async () => {
  try {
    // 获取当前书籍 ID
    const currentBookId = currentChapter.value?.bookId || publishedBookId.value

    if (!currentBookId) {
      // 如果没有书籍ID，使用空数组
      recommendedBooks.value = []
      return
    }

    // 调用 bookstore 的相似书籍 API
    const response = await fetch(`/api/v1/bookstore/books/${currentBookId}/similar?limit=6`)

    // 检查 HTTP 状态码
    if (!response.ok) {
      console.error('推荐 API 请求失败:', response.status)
      await loadFallbackRecommendedBooks()
      return
    }

    const result = await response.json()

    // 检查业务状态码
    if (result?.code !== 0) {
      console.error('推荐 API 业务错误:', result?.message)
      await loadFallbackRecommendedBooks()
      return
    }

    // 解析响应数据
    const books = result?.data

    if (books && books.length > 0) {
      // 转换为推荐书籍格式（包含推荐理由）
      recommendedBooks.value = books.map((book: {
        id: string
        title: string
        author: string
        cover?: string
        categories?: string[]
        tags?: string[]
        rating?: number
      }) => ({
        id: book.id,
        title: book.title || '未知书名',
        author: book.author || '未知作者',
        cover: book.cover || '',
        // 推荐理由：基于分类和评分生成
        reason: generateRecommendationReason(book),
      }))
    } else {
      // API 返回空数据时，使用备用的热门书籍
      await loadFallbackRecommendedBooks()
    }
  } catch (error) {
    console.error('加载推荐书籍失败:', error)
    // API 调用失败时，使用备用的热门书籍
    await loadFallbackRecommendedBooks()
  }
}

// 生成推荐理由
const generateRecommendationReason = (book: {
  categories?: string[]
  tags?: string[]
  rating?: number
}): string => {
  if (book.rating && book.rating >= 9.0) {
    return '高分神作'
  }
  if (book.rating && book.rating >= 8.0) {
    return '口碑佳作'
  }
  if (book.categories && book.categories.length > 0) {
    return `${book.categories[0]}力作`
  }
  if (book.tags && book.tags.length > 0) {
    return `标签: ${book.tags[0]}`
  }
  return '热门推荐'
}

// 加载备用推荐书籍（当 API 失败时使用）
const loadFallbackRecommendedBooks = async () => {
  try {
    // 调用书店首页 API 获取推荐书籍
    const response = await fetch('/api/v1/bookstore/books?page=1&pageSize=6')

    if (!response.ok) {
      console.error('备用推荐 API 请求失败:', response.status)
      recommendedBooks.value = []
      return
    }

    const result = await response.json()
    const books = result?.data

    if (books && books.length > 0) {
      // 从首页书籍中获取前 6 本作为推荐
      recommendedBooks.value = books.slice(0, 6).map((book: {
        id: string
        title: string
        author: string
        cover?: string
        categories?: string[]
        rating?: number
      }) => ({
        id: book.id,
        title: book.title || '推荐书籍',
        author: book.author || '青羽平台',
        cover: book.cover || '',
        reason: book.rating && book.rating >= 9.0 ? '高分神作' : '热门推荐',
      }))
    } else {
      // 如果 API 也为空，设置空数组
      recommendedBooks.value = []
    }
  } catch {
    console.error('加载备用推荐书籍失败')
    recommendedBooks.value = []
  }
}

const startReadingTimer = () => {
  readingDuration.value = 0
  readingDurationTimer.value = setInterval(() => {
    readingDuration.value++
  }, 1000) as unknown as number
}

const stopReadingTimer = () => {
  if (readingDurationTimer.value) {
    clearInterval(readingDurationTimer.value)
    readingDurationTimer.value = null
  }
}

// 进度自动保存计时器
const startProgressTimer = () => {
  stopProgressTimer()
  readingTimer.value = setInterval(saveCurrentProgress, READING_SYNC_INTERVAL) as unknown as number
}

const stopProgressTimer = () => {
  if (readingTimer.value) {
    clearInterval(readingTimer.value)
    readingTimer.value = null
  }
}

// 页面可见性变化处理
const handleVisibilityChange = () => {
  if (document.hidden) {
    // 页面不可见：暂停计时器，立即保存当前进度
    stopProgressTimer()
    stopReadingTimer()
    saveCurrentProgress()
  } else {
    // 页面可见：恢复计时器
    startReadingTimer()
    startProgressTimer()
  }
}

// 页面关闭前最后一次保存
const handleBeforeUnload = () => {
  if (!currentChapter.value?.bookId) return
  const totalSeconds = Math.floor((Date.now() - startTime.value) / 1000)
  const deltaSeconds = totalSeconds - lastReadingSyncTime
  if (deltaSeconds > 0) {
    // 使用 sendBeacon 发送最后的阅读时长
    const payload = JSON.stringify({
      book_id: currentChapter.value.bookId,
      chapter_id: chapterId.value,
      duration: deltaSeconds,
    })
    navigator.sendBeacon('/api/v1/reader/progress/reading-time', payload)
    lastReadingSyncTime = totalSeconds
  }
}

const ensureDemoChapterList = () => {
  if (demoChapterList.value.length > 0) return
  demoChapterList.value = createYunlanReaderChapters(YUNLAN_TOTAL_CHAPTERS)
}

const loadDemoChapter = (id: string) => {
  ensureDemoChapterList()
  const target = demoChapterList.value.find((ch) => ch.id === id) || demoChapterList.value[0]
  demoCurrentChapter.value = target || null
}

const loadChapter = async () => {
  loading.value = true
  try {
    if (isDemoMode.value) {
      loadDemoChapter(chapterId.value)
      readProgress.value = 0
      startTime.value = Date.now()
      lastReadingSyncTime = 0
      return
    }
    if (isPublishedMode.value) {
      const detail = publishedBridgeDetail.value
      if (!detail) {
        message.error('未找到已发布内容，请先在发布管理中发布章节')
        return
      }

      const mapped = detail.chapters
        .slice()
        .sort((a, b) => a.chapterNum - b.chapterNum)
        .map((chapter, index, list) => ({
          id: chapter.id,
          chapterNum: chapter.chapterNum,
          title: chapter.title,
          content: chapter.content,
          paragraphs: splitContentToParagraphs(chapter.content),
          bookId: detail.book.id,
          bookTitle: detail.book.title,
          isRead: false,
          isFree: chapter.isFree,
          prevChapterId: index > 0 ? list[index - 1].id : '',
          nextChapterId: index < list.length - 1 ? list[index + 1].id : '',
        }))

      publishedChapterList.value = mapped
      const target = mapped.find((chapter) => chapter.id === chapterId.value) || mapped[0] || null
      if (target) {
        publishedCurrentChapter.value = target
        chapterId.value = target.id
      }
      readProgress.value = 0
      startTime.value = Date.now()
      lastReadingSyncTime = 0
      return
    }

    await readerStore.loadChapter(chapterId.value)
    readProgress.value = 0
    startTime.value = Date.now()
    lastReadingSyncTime = 0

    const chapterListValue = Array.isArray(chapterList.value)
      ? chapterList.value
      : (chapterList.value as unknown as { value: Chapter[] }).value || []
    if (chapterListValue.length === 0 && currentChapter.value) {
      await readerStore.loadChapterList(currentChapter.value.bookId || '')
    }
  } catch (error: unknown) {
    const err = error as { message?: string }
    message.error(err.message || '加载章节失败')
  } finally {
    loading.value = false
  }
}

const handlePurchaseChapter = async () => {
  if (!chapterId.value) return
  if (!isLoggedIn.value) {
    goToLogin()
    return
  }

  purchasing.value = true
  try {
    await readerAPI.purchaseChapter(chapterId.value)
    await walletStore.fetchBalance().catch(() => undefined)
    message.success('章节已解锁')
    await loadChapter()
  } catch (error) {
    const err = error as { message?: string }
    const errorMessage = err?.message || '购买章节失败'
    if (errorMessage.includes('余额') || errorMessage.toLowerCase().includes('balance')) {
      message.warning('余额不足，请先充值后再购买')
    } else {
      message.error(errorMessage)
    }
  } finally {
    purchasing.value = false
  }
}

const handleKeyPress = (e: KeyboardEvent) => {
  if (settingsVisible.value) return
  switch (e.key) {
    case 'ArrowLeft':
      handlePreviousChapter()
      break
    case 'ArrowRight':
      handleNextChapter()
      break
    case 'ArrowUp':
      window.scrollBy({ top: -100, behavior: 'smooth' })
      break
    case 'ArrowDown':
      window.scrollBy({ top: 100, behavior: 'smooth' })
      break
    case 'Escape':
      isFullscreen.value = false
      break
  }
}

// 生命周期
onMounted(async () => {
  await loadChapter()
  await readerStore.loadSettings()
  await checkBookshelfStatus()
  await loadRecommendedBooks()

  if (currentChapter.value) {
    await loadChapterCommentSummaries()
  }

  startReadingTimer()
  startProgressTimer()
  window.addEventListener('scroll', handleScroll)
  window.addEventListener('keydown', handleKeyPress)
  document.addEventListener('visibilitychange', handleVisibilityChange)
  window.addEventListener('beforeunload', handleBeforeUnload)

  if (isMobile.value && readerContainerRef.value) {
    useTouch(readerContainerRef, {
      onSwipeLeft: () => {
        if (hasNextChapter.value) handleNextChapter()
      },
      onSwipeRight: () => {
        if (hasPreviousChapter.value) handlePreviousChapter()
      },
      onTap: toggleHeaderFooter,
      threshold: 100,
    })
  }
})

onUnmounted(() => {
  saveCurrentProgress()
  stopReadingTimer()
  stopProgressTimer()
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('keydown', handleKeyPress)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  window.removeEventListener('beforeunload', handleBeforeUnload)
  readerStore.clearCurrentChapter()
})

watch(
  () => route.params.chapterId,
  (newId) => {
    if (newId && newId !== chapterId.value) {
      chapterId.value = newId as string
      loadChapter()
    }
  },
)

watch(commentDrawerVisible, (visible) => {
  if (!visible) {
    clearCommentSelection()
  }
})
</script>

<style scoped lang="scss">
.reader-view {
  min-height: 100vh;
  transition:
    background-color 0.3s,
    color 0.3s;

  &.theme-light {
    background-color: var(--reader-light-bg, #ffffff);
    color: var(--reader-light-text, #303133);
  }

  &.theme-sepia {
    background-color: var(--reader-sepia-bg, #f4ecd8);
    color: var(--reader-sepia-text, #5c4a2f);
  }

  &.theme-night {
    background-color: var(--reader-night-bg, #1a1a1a);
    color: var(--reader-night-text, #c9c9c9);
  }

  &.theme-dark {
    background-color: var(--reader-dark-bg, #121212);
    color: var(--reader-dark-text, #e0e0e0);
  }
}

.back-to-top-btn {
  position: fixed;
  right: 18px;
  bottom: 92px;
  width: 34px;
  height: 34px;
  min-width: 34px;
  border-radius: 50%;
  padding: 0;
  font-size: 16px;
  line-height: 34px;
  text-align: center;
  opacity: 0.58;
  backdrop-filter: blur(2px);
  transition: opacity 0.2s ease;
  z-index: 1200;

  &:hover {
    opacity: 0.9;
  }
}

.reader-fade-enter-active,
.reader-fade-leave-active {
  transition: all 0.3s ease;
}

.reader-fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.reader-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.chapter-lock-shell {
  display: flex;
  justify-content: center;
  padding: 0 20px 24px;
}

.chapter-lock-card {
  width: min(560px, 100%);
  padding: 28px;
  border-radius: 24px;
  border: 1px solid rgba(217, 119, 6, 0.22);
  background:
    linear-gradient(145deg, rgba(255, 247, 237, 0.96), rgba(255, 255, 255, 0.94));
  box-shadow: 0 18px 42px rgba(217, 119, 6, 0.12);
  text-align: center;

  h3 {
    margin: 10px 0 12px;
    font-size: 28px;
    color: #7c2d12;
  }

  p {
    margin: 0;
    color: #9a3412;
    line-height: 1.7;
  }
}

.lock-kicker {
  display: inline-flex;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(217, 119, 6, 0.12);
  color: #b45309;
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.lock-price {
  margin: 18px 0;
  padding: 18px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.82);
  display: flex;
  flex-direction: column;
  gap: 6px;

  span {
    color: #92400e;
    font-size: 13px;
  }

  strong {
    font-size: 34px;
    color: #b45309;
  }
}

.lock-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

@media (max-width: 768px) {
  .lock-actions {
    flex-direction: column;
  }
}
</style>
