/**
 * 阅读器状态管理
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Chapter, ChapterContent, ReaderSettings } from '@/types/reader'
import readerAPI from '@/modules/reader/api/reader'
import { useAuthStore } from './auth'

export const useReaderStore = defineStore('reader', () => {
  // 状态
  const currentBookId = ref<string | null>(null)
  const currentChapter = ref<Chapter | null>(null)
  const chapterContent = ref<ChapterContent | null>(null)
  const chapterList = ref<Chapter[]>([])
  const settings = ref<ReaderSettings>({
    userId: '',
    fontSize: 16,
    fontFamily: 'system-ui',
    lineHeight: 1.8,
    letterSpacing: 0,
    theme: 'light',
    pageMode: 'scroll',
    autoSave: true,
    enableAnimation: true,
    showProgress: true,
    pageWidth: 800,
    updatedAt: new Date().toISOString(),
  })
  const isLoading = ref(false)
  const readingProgress = ref(0) // 当前章节阅读进度 0-100

  // 计算属性
  const hasNextChapter = computed(() => {
    // 优先使用 hasNavigation 标志，其次检查 nextChapterId
    return !!(currentChapter.value as any)?.hasNext || !!currentChapter.value?.nextChapterId
  })
  const hasPrevChapter = computed(() => {
    // 优先使用 hasNavigation 标志，其次检查 prevChapterId
    return !!(currentChapter.value as any)?.hasPrevious || !!currentChapter.value?.prevChapterId
  })

  function setCurrentBookId(bookId: string | null) {
    currentBookId.value = bookId
  }

  function normalizeChapterList(list: any[]): Chapter[] {
    const normalized = list
      .map((item: any) => ({
        id: item.id ?? item.chapterId ?? item._id,
        bookId: item.book_id ?? item.bookId ?? currentBookId.value ?? '',
        chapterNum: item.chapter_num ?? item.chapterNum ?? item.chapterNumber ?? 0,
        chapterNumber: item.chapter_num ?? item.chapterNum ?? item.chapterNumber ?? 0,
        title: item.title ?? '',
        wordCount: item.word_count ?? item.wordCount ?? 0,
        isFree: item.is_free ?? item.isFree ?? true,
        price: item.price ?? 0,
        canAccess: item.canAccess ?? item.can_access ?? true,
        accessReason: item.accessReason ?? item.access_reason ?? '',
        publishedAt: item.publish_time ?? item.publishTime ?? item.publishedAt,
        createdAt: item.created_at ?? item.createdAt,
        updatedAt: item.updated_at ?? item.updatedAt,
      }))
      .filter((item: any) => !!item.id)
      .sort((a: any, b: any) => (a.chapterNum || 0) - (b.chapterNum || 0)) as unknown as Chapter[]

    return normalized.map((item: any, index) => ({
      ...item,
      prevChapterId: index > 0 ? normalized[index - 1].id : null,
      nextChapterId: index < normalized.length - 1 ? normalized[index + 1].id : null,
    })) as Chapter[]
  }

  function patchChapterNavigation(targetChapterId: string) {
    if (!currentChapter.value || chapterList.value.length === 0) return

    const currentIndex = chapterList.value.findIndex((item: any) => item.id === targetChapterId)
    if (currentIndex < 0) return

    const prev = currentIndex > 0 ? chapterList.value[currentIndex - 1] : null
    const next =
      currentIndex < chapterList.value.length - 1 ? chapterList.value[currentIndex + 1] : null

    currentChapter.value = {
      ...currentChapter.value,
      prevChapterId: currentChapter.value.prevChapterId ?? prev?.id ?? null,
      nextChapterId: currentChapter.value.nextChapterId ?? next?.id ?? null,
      hasPrevious: (currentChapter.value as any).hasPrevious || !!prev,
      hasNext: (currentChapter.value as any).hasNext || !!next,
    } as any
  }

  /**
   * 加载章节内容
   */
  async function loadChapter(chapterId: string, _bookId?: string) {
    try {
      isLoading.value = true

      // 检测测试模式
      const authStore = useAuthStore()
      const token = authStore.token as any
      const isMockToken =
        token && (typeof token === 'string' ? token : JSON.stringify(token)).includes('mock')

      if (isMockToken) {
        // 测试模式：使用模拟数据

        // 模拟章节信息
        currentChapter.value = {
          id: chapterId,
          bookId: 'test-book-001',
          chapterNumber: 1,
          title: '第一章：初入江湖',
          wordCount: 2500,
          publishedAt: new Date().toISOString(),
          prevChapterId: null,
          nextChapterId: 'chapter-002',
        } as any

        const mockParagraphs = [
          '清晨的阳光透过树叶的缝隙洒在地面上，形成斑驳的光影。李明站在村口的老槐树下，望着远处连绵起伏的群山，心中充满了期待和忐忑。',
          '今天是他踏上江湖之路的第一天。从小听着村里的老人讲述江湖中的传说，他早已对外面的世界充满了向往。',
          '少年郎，此去江湖，路途遥远，生死未卜，你可想好了？',
          '老人的声音在耳边回响，李明握紧了手中的剑，那是一把普通的铁剑，却是他父亲留给他的唯一遗物。',
          '我想好了。李明轻声说道，声音坚定而有力。',
          '就在这时，远处传来了马蹄声。李明抬头望去，只见几个身穿黑衣的骑手正朝村庄疾驰而来，他们的衣袖上绣着一个血红色的骷髅图案。',
          '血骷髅帮！李明心中一惊，这个江湖臭名昭著的杀手组织怎么会出现在这种偏僻的小村庄？',
          '少年郎，看来你的江湖之路，从现在就开始了...',
          '李明深吸一口气，握紧了手中的铁剑。无论前方有多少艰险，他都要勇往直前，这是他的选择，也是他的命运。',
          '黑衣骑手们越来越近，马蹄声如雷鸣般震撼着整个村庄。李明能感受到村民们惊恐的目光，但他没有退缩。',
          '"站住！"李明大喝一声，挡在了村口。',
          '为首的黑衣人冷笑一声："小子，让开，别找死！"',
        ]

        // 模拟章节内容
        chapterContent.value = {
          chapter: currentChapter.value,
          content: mockParagraphs.join('\n\n'),
          paragraphs: mockParagraphs.map((content, index) => ({
            id: `mock-paragraph-${index + 1}`,
            paragraphOrder: index + 1,
            content,
            format: 'markdown',
            wordCount: content.length,
          })),
          nextChapter: {
            id: 'chapter-002',
            bookId: 'test-book-001',
            chapterNumber: 2,
            title: '第二章：意外相遇',
            wordCount: 2800,
          } as any,
          prevChapter: null,
        } as any

        readingProgress.value = 0

        // 模拟网络延迟
        await new Promise((resolve) => setTimeout(resolve, 500))

        return { chapter: currentChapter.value, content: chapterContent.value }
      }

      // 生产模式：优先走 reader 受控接口，确保付费章节能触发权限校验
      const chapterRes = await readerAPI.getChapterInfo(chapterId)
      const chapterInfo = (chapterRes as any)?.data ?? (chapterRes as any)
      const resolvedBookId =
        _bookId ||
        chapterInfo.book_id ||
        chapterInfo.bookId ||
        currentBookId.value ||
        ''
      const previousBookId = currentBookId.value

      let contentData: any = {
        content: '',
        paragraphs: [],
        hasPrevious: false,
        hasNext: false,
        canAccess: chapterInfo.canAccess ?? true,
        accessReason: chapterInfo.accessReason ?? '',
      }

      if ((chapterInfo.canAccess ?? true) && resolvedBookId) {
        const contentRes = await readerAPI.getChapterContent(resolvedBookId, chapterId)
        contentData = (contentRes as any)?.data ?? (contentRes as any)
      }

      const chapter: any = {
        id: chapterInfo.id ?? chapterInfo.chapterId,
        bookId: chapterInfo.book_id ?? chapterInfo.bookId ?? resolvedBookId,
        title: chapterInfo.title,
        chapterNumber: chapterInfo.chapter_num ?? chapterInfo.chapterNum,
        wordCount: chapterInfo.word_count ?? chapterInfo.wordCount,
        isFree: chapterInfo.is_free ?? chapterInfo.isFree,
        price: chapterInfo.price ?? contentData.price ?? 0,
        publishedAt: chapterInfo.publish_time ?? chapterInfo.publishTime ?? chapterInfo.publishedAt,
        createdAt: chapterInfo.created_at ?? chapterInfo.createdAt,
        updatedAt: chapterInfo.updated_at ?? chapterInfo.updatedAt,
        prevChapterId: chapterInfo.prev_chapter_id ?? chapterInfo.prevChapterId ?? null,
        nextChapterId: chapterInfo.next_chapter_id ?? chapterInfo.nextChapterId ?? null,
        hasPrevious: chapterInfo.hasPrevious ?? contentData.hasPrevious ?? false,
        hasNext: chapterInfo.hasNext ?? contentData.hasNext ?? false,
        canAccess: chapterInfo.canAccess ?? contentData.canAccess ?? true,
        accessReason: chapterInfo.accessReason ?? contentData.accessReason ?? '',
        content: contentData.content || '',
        paragraphs: Array.isArray(contentData.paragraphs) ? contentData.paragraphs : [],
      }

      if (chapter.bookId) {
        setCurrentBookId(chapter.bookId)
      }

      currentChapter.value = chapter
      chapterContent.value = chapter
      readingProgress.value = 0

      const needsNavigationPatch =
        !chapter.prevChapterId && !chapter.nextChapterId && !chapter.hasPrevious && !chapter.hasNext

      if (chapter.bookId && (chapterList.value.length === 0 || previousBookId !== chapter.bookId)) {
        await loadChapterList(chapter.bookId)
      }

      if (needsNavigationPatch || chapterList.value.length > 0) {
        patchChapterNavigation(chapter.id)
      }

      return { chapter: currentChapter.value, content: chapterContent.value }
    } catch (error) {
      console.error('加载章节失败:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 跳转到下一章
   */
  async function nextChapter() {
    if (!currentChapter.value?.nextChapterId) {
      throw new Error('没有下一章')
    }

    // 保存当前阅读进度
    await saveReadingProgress()

    return loadChapter(currentChapter.value.nextChapterId)
  }

  /**
   * 跳转到上一章
   */
  async function prevChapter() {
    if (!currentChapter.value?.prevChapterId) {
      throw new Error('没有上一章')
    }

    // 保存当前阅读进度
    await saveReadingProgress()

    return loadChapter(currentChapter.value.prevChapterId)
  }

  /**
   * 加载章节列表
   */
  async function loadChapterList(bookId: string) {
    try {
      // 检测测试模式
      const authStore = useAuthStore()
      const token = authStore.token as any
      const isMockToken =
        token && (typeof token === 'string' ? token : JSON.stringify(token)).includes('mock')

      if (isMockToken) {
        // 测试模式：使用模拟数据

        const mockChapters = [
          { id: 'chapter-001', chapterNumber: 1, title: '第一章：初入江湖', wordCount: 2500 },
          { id: 'chapter-002', chapterNumber: 2, title: '第二章：意外相遇', wordCount: 2800 },
          { id: 'chapter-003', chapterNumber: 3, title: '第三章：危机四伏', wordCount: 3000 },
          { id: 'chapter-004', chapterNumber: 4, title: '第四章：绝地反击', wordCount: 3200 },
          { id: 'chapter-005', chapterNumber: 5, title: '第五章：真相大白', wordCount: 3500 },
        ]

        chapterList.value = mockChapters as any
        return mockChapters
      }

      // 生产模式：调用真实API
      const response = await readerAPI.getBookChapters(bookId)
      const rawList = Array.isArray(response)
        ? response
        : Array.isArray((response as any)?.data)
          ? (response as any).data
          : (response as any)?.data?.chapters || (response as any)?.chapters || []
      const normalized = normalizeChapterList(rawList as any[])
      chapterList.value = normalized as any
      if (bookId) {
        setCurrentBookId(bookId)
      }
      if (currentChapter.value?.id) {
        patchChapterNavigation(currentChapter.value.id)
      }
      return normalized
    } catch (error) {
      console.error('加载章节列表失败:', error)
      chapterList.value = []
      return []
    }
  }

  /**
   * 获取阅读设置
   */
  async function loadSettings() {
    try {
      // 检测测试模式
      const authStore = useAuthStore()
      const token = authStore.token as any
      const isMockToken =
        token && (typeof token === 'string' ? token : JSON.stringify(token)).includes('mock')

      if (isMockToken) {
        // 测试模式：使用默认设置，不调用API
        return settings.value
      }

      // 生产模式：调用真实API
      const res = await readerAPI.getSettings()
      const data = res.data as any
      settings.value = { ...settings.value, ...data }
      return data
    } catch (error) {
      console.error('获取阅读设置失败:', error)
      // 继续使用默认设置
      return settings.value
    }
  }

  /**
   * 更新阅读设置
   */
  async function updateSettings(newSettings: Partial<ReaderSettings>) {
    try {
      settings.value = { ...settings.value, ...newSettings }

      // 检测测试模式
      const authStore = useAuthStore()
      const token = authStore.token as any
      const isMockToken =
        token && (typeof token === 'string' ? token : JSON.stringify(token)).includes('mock')

      if (isMockToken) {
        // 测试模式：仅本地更新，不调用API
        return settings.value
      }

      // 生产模式：调用真实API
      const res = await readerAPI.updateSettings(newSettings as any)
      return res.data as any
    } catch (error) {
      console.error('更新阅读设置失败:', error)
      // 仍然保持本地更新
      return settings.value
    }
  }

  /**
   * 重置阅读设置
   */
  function resetSettings() {
    settings.value = getDefaultSettings()
  }

  /**
   * 保存阅读进度
   */
  async function saveReadingProgress() {
    if (!currentChapter.value) {
      return
    }

    try {
      // 检测测试模式
      const authStore = useAuthStore()
      const token = authStore.token as any
      const isMockToken =
        token && (typeof token === 'string' ? token : JSON.stringify(token)).includes('mock')

      if (isMockToken) {
        // 测试模式：仅本地保存，不调用API
        return
      }

      // 生产模式：调用真实API
      await readerAPI.saveProgress({
        bookId: currentChapter.value.bookId,
        chapterId: currentChapter.value.id,
        progress: Math.max(0, Math.min(1, readingProgress.value / 100)),
      } as any)
    } catch (error) {
      console.error('保存阅读进度失败:', error)
      // 不抛出错误，避免影响阅读体验
    }
  }

  /**
   * 保存进度（带位置信息）
   */
  async function saveProgress(
    bookId: string,
    chapterId: string,
    progress: number,
    _scrollPosition: number,
  ) {
    try {
      // 检测测试模式
      const authStore = useAuthStore()
      const token = authStore.token as any
      const isMockToken =
        token && (typeof token === 'string' ? token : JSON.stringify(token)).includes('mock')

      if (isMockToken) {
        // 测试模式：仅本地保存，不调用API
        return
      }

      // 生产模式：调用真实API
      await readerAPI.saveProgress({
        bookId,
        chapterId,
        progress: Math.max(0, Math.min(1, progress / 100)),
      } as any)
    } catch (error) {
      console.error('保存进度失败:', error)
    }
  }

  /**
   * 更新阅读时长
   */
  async function updateReadingTime(bookId: string, duration: number) {
    if (!bookId || duration <= 0) return
    try {
      await readerAPI.updateReadingTime({
        bookId,
        chapterId: currentChapter.value?.id || '',
        duration,
      } as any)
    } catch (error) {
      console.error('更新阅读时长失败:', error)
    }
  }

  /**
   * 更新阅读进度
   */
  function updateProgress(progress: number) {
    readingProgress.value = Math.max(0, Math.min(100, progress))
  }

  /**
   * 跳转到上一章（别名）
   */
  async function loadPreviousChapter() {
    return prevChapter()
  }

  /**
   * 跳转到下一章（别名）
   */
  async function loadNextChapter() {
    return nextChapter()
  }

  /**
   * 获取默认设置
   */
  function getDefaultSettings(): ReaderSettings {
    return {
      userId: '',
      fontSize: 16,
      fontFamily: 'system-ui',
      lineHeight: 1.8,
      letterSpacing: 0,
      theme: 'light',
      pageMode: 'scroll',
      autoSave: true,
      enableAnimation: true,
      showProgress: true,
      pageWidth: 800,
      updatedAt: new Date().toISOString(),
    }
  }

  /**
   * 清除当前章节
   */
  function clearChapter() {
    currentChapter.value = null
    chapterContent.value = null
    readingProgress.value = 0
  }

  /**
   * 清除当前章节（别名）
   */
  function clearCurrentChapter() {
    clearChapter()
  }

  return {
    // 状态
    currentBookId,
    setCurrentBookId,
    currentChapter,
    chapterContent,
    chapterList,
    settings,
    isLoading,
    readingProgress,

    // 计算属性
    hasNextChapter,
    hasPrevChapter,

    // 方法
    loadChapter,
    nextChapter,
    prevChapter,
    loadPreviousChapter,
    loadNextChapter,
    loadChapterList,
    loadSettings,
    updateSettings,
    resetSettings,
    saveReadingProgress,
    saveProgress,
    updateReadingTime,
    updateProgress,
    clearChapter,
    clearCurrentChapter,
  }
})
