/**
 * 阅读器导航 composable
 * 管理章节导航（上一章、下一章、跳转）、进度保存、滚动等
 */
import { ref, computed, type Ref, type ComputedRef } from 'vue'
import { useRouter } from 'vue-router'
import { useReaderStore } from '@/stores/reader'
import * as readerAPI from '@/modules/reader/api'

export interface ChapterInfo {
  id: string
  bookId?: string
  title: string
  prevChapterId?: string | null
  nextChapterId?: string | null
  hasPrevious?: boolean
  hasNext?: boolean
}

/**
 * 章节导航响应数据类型
 */
interface ChapterNavigationData {
  chapterId?: string
  id?: string
}

/**
 * 从 API 响应中提取章节导航数据
 * 处理 API 返回的包装格式
 */
function extractChapterData(response: unknown): ChapterNavigationData | null {
  if (!response) return null

  // 如果响应本身就有 chapterId 或 id，直接返回
  const directData = response as ChapterNavigationData
  if (directData.chapterId || directData.id) {
    return directData
  }

  // 如果响应有 data 字段，尝试从 data 中提取
  const wrappedResponse = response as { data?: unknown }
  if (wrappedResponse.data) {
    const data = wrappedResponse.data as ChapterNavigationData
    if (data.chapterId || data.id) {
      return data
    }
  }

  return null
}

export interface UseReaderNavigationOptions {
  currentChapter: ComputedRef<ChapterInfo | null>
  chapterId: Ref<string>
  isDemoMode: ComputedRef<boolean>
  isPublishedMode: ComputedRef<boolean>
  publishedBookId: ComputedRef<string>
}

export function useReaderNavigation(options: UseReaderNavigationOptions) {
  const { currentChapter, chapterId, isDemoMode, isPublishedMode, publishedBookId } = options

  const router = useRouter()
  const readerStore = useReaderStore()

  // 进度状态
  const readProgress = ref(0)
  const startTime = ref(Date.now())
  const readingTimer = ref<number | null>(null)
  const isFullscreen = ref(false)

  // 是否有上一章
  const hasPreviousChapter = computed(() => {
    return (
      !!currentChapter.value?.prevChapterId || !!(currentChapter.value as ChapterInfo)?.hasPrevious
    )
  })

  // 是否有下一章
  const hasNextChapter = computed(() => {
    return !!currentChapter.value?.nextChapterId || !!(currentChapter.value as ChapterInfo)?.hasNext
  })

  // 进度文本
  const progressText = computed(() => {
    if (!currentChapter.value) return '0%'
    return `${readProgress.value}%`
  })

  // 是否显示返回顶部按钮
  const showBackTop = computed(() => readProgress.value > 15)

  // 滚动到顶部
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 保存当前进度
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

      // 保存阅读时长
      const duration = Math.floor((Date.now() - startTime.value) / 1000)
      if (duration > 0 && currentChapter.value.bookId) {
        await readerStore.updateReadingTime(currentChapter.value.bookId, duration)
      }
    } catch {
      // 静默失败，避免影响阅读体验
    }
  }

  // 上一章
  const previousChapter = async (loadChapter: () => Promise<void>) => {
    if (!hasPreviousChapter.value) return
    await saveCurrentProgress()

    // 如果有导航ID，直接使用
    if (currentChapter.value?.prevChapterId) {
      chapterId.value = currentChapter.value.prevChapterId
      await loadChapter()
      scrollToTop()
      return
    }

    // Demo/Published模式且有导航ID
    if ((isDemoMode.value || isPublishedMode.value) && currentChapter.value?.prevChapterId) {
      chapterId.value = currentChapter.value.prevChapterId
      await loadChapter()
      scrollToTop()
      return
    }

    // 没有导航ID时，调用后端API获取上一章信息
    try {
      const bookId = currentChapter.value?.bookId || publishedBookId.value
      if (!bookId || !chapterId.value) {
        console.warn('无法获取上一章：缺少bookId或chapterId')
        return
      }

      const prevChapterInfo = await readerAPI.getPreviousChapter(bookId, chapterId.value)
      const prevData = extractChapterData(prevChapterInfo)
      const targetChapterId = prevData?.chapterId || prevData?.id

      if (targetChapterId) {
        chapterId.value = targetChapterId
        await loadChapter()
      } else {
        console.warn('没有上一章')
      }
    } catch (error) {
      console.error('获取上一章失败:', error)
    }
    scrollToTop()
  }

  // 下一章
  const nextChapter = async (loadChapter: () => Promise<void>) => {
    if (!hasNextChapter.value) return
    await saveCurrentProgress()

    // 如果有导航ID，直接使用
    if (currentChapter.value?.nextChapterId) {
      chapterId.value = currentChapter.value.nextChapterId
      await loadChapter()
      scrollToTop()
      return
    }

    // Demo/Published模式且有导航ID
    if ((isDemoMode.value || isPublishedMode.value) && currentChapter.value?.nextChapterId) {
      chapterId.value = currentChapter.value.nextChapterId
      await loadChapter()
      scrollToTop()
      return
    }

    // 没有导航ID时，调用后端API获取下一章信息
    try {
      const bookId = currentChapter.value?.bookId || publishedBookId.value
      if (!bookId || !chapterId.value) {
        console.warn('无法获取下一章：缺少bookId或chapterId')
        return
      }

      const nextChapterInfo = await readerAPI.getNextChapter(bookId, chapterId.value)
      const nextData = extractChapterData(nextChapterInfo)
      const targetChapterId = nextData?.chapterId || nextData?.id

      if (targetChapterId) {
        chapterId.value = targetChapterId
        await loadChapter()
      } else {
        console.warn('没有下一章')
      }
    } catch (error) {
      console.error('获取下一章失败:', error)
    }
    scrollToTop()
  }

  // 处理内容滚动
  const handleContentScroll = (showChapterEndRecommendation: Ref<boolean>) => {
    const scrollTop = window.scrollY
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight

    if (scrollHeight > 0) {
      readProgress.value = Math.round((scrollTop / scrollHeight) * 100)

      // 检测是否滚动到底部（进度>=95%）
      if (readProgress.value >= 95 && !showChapterEndRecommendation.value) {
        showChapterEndRecommendation.value = true
      }
    }
  }

  // 处理进度条变化
  const handleProgressChange = (value: number) => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
    window.scrollTo(0, (scrollHeight * value) / 100)
  }

  // 返回书籍详情
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

  // 返回首页
  const goHome = () => {
    router.push('/bookstore')
  }

  // 跳转到推荐书籍
  const goToBook = (bookId: string) => {
    router.push(`/bookstore/books/${bookId}`)
  }

  // 切换全屏
  const toggleHeaderFooter = () => {
    isFullscreen.value = !isFullscreen.value
  }

  // 键盘快捷键处理
  const handleKeyPress = (
    e: KeyboardEvent,
    settingsVisible: Ref<boolean>,
    loadChapter: () => Promise<void>,
  ) => {
    if (settingsVisible.value) return

    switch (e.key) {
      case 'ArrowLeft':
        previousChapter(loadChapter)
        break
      case 'ArrowRight':
        nextChapter(loadChapter)
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

  // 启动定时保存
  const startAutoSave = () => {
    readingTimer.value = setInterval(saveCurrentProgress, 30000) as unknown as number
  }

  // 停止定时保存
  const stopAutoSave = () => {
    if (readingTimer.value) {
      clearInterval(readingTimer.value)
      readingTimer.value = null
    }
  }

  return {
    // 状态
    readProgress,
    startTime,
    readingTimer,
    isFullscreen,

    // 计算属性
    hasPreviousChapter,
    hasNextChapter,
    progressText,
    showBackTop,

    // 导航方法
    previousChapter,
    nextChapter,
    goBackToBookDetail,
    goHome,
    goToBook,
    jumpToChapter: async (
      id: string,
      loadChapter: () => Promise<void>,
      catalogVisible: Ref<boolean>,
    ) => {
      if (id === chapterId.value) return
      await saveCurrentProgress()
      chapterId.value = id
      await loadChapter()
      catalogVisible.value = false
      scrollToTop()
    },

    // 滚动和进度方法
    scrollToTop,
    handleContentScroll,
    handleProgressChange,
    saveCurrentProgress,
    toggleHeaderFooter,
    handleKeyPress,

    // 定时器方法
    startAutoSave,
    stopAutoSave,
  }
}
