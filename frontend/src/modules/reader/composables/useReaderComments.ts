/**
 * 阅读器段落评论 composable
 * 管理段落评论的显示、提交、交互等
 */
import { ref, type ComputedRef } from 'vue'
import { useCommentStore } from '@/stores/comment'

export interface ReaderParagraph {
  id: string
  paragraphOrder: number
  content: string
  format?: string
  wordCount?: number
}

export interface ParagraphRef {
  paragraphId: string
  chapterId: string
  paragraphIndex: number
}

export interface ChapterInfo {
  id: string
  bookId?: string
  title: string
}

export interface UseReaderCommentsOptions {
  currentChapter: ComputedRef<ChapterInfo | null>
  displayParagraphs: ComputedRef<ReaderParagraph[]>
}

export function useReaderComments(options: UseReaderCommentsOptions) {
  const { currentChapter, displayParagraphs } = options
  const commentStore = useCommentStore()

  // 段落评论相关状态
  const highlightedParagraphIndex = ref<number | null>(null)
  const commentDrawerVisible = ref(false)

  // 获取段落引用
  const getParagraphRef = (paragraphIndex: number): ParagraphRef | null => {
    if (!currentChapter.value) return null

    const paragraph = displayParagraphs.value[paragraphIndex]
    if (!paragraph) return null

    return {
      paragraphId: paragraph.id || `${currentChapter.value.id}-${paragraphIndex}`,
      chapterId: currentChapter.value.id,
      paragraphIndex
    }
  }

  // 获取段落评论数量
  const getParagraphCommentCount = (paragraphIndex: number | string): number => {
    const paragraphRef = getParagraphRef(Number(paragraphIndex))
    if (!paragraphRef) return 0
    return commentStore.summaries.get(paragraphRef.paragraphId)?.commentCount || 0
  }

  // 处理段落点击
  const handleParagraphClick = (index: number | string) => {
    const numIndex = Number(index)
    if (highlightedParagraphIndex.value === numIndex) {
      highlightedParagraphIndex.value = null
      commentDrawerVisible.value = false
      commentStore.clearSelection()
      return
    }

    highlightedParagraphIndex.value = numIndex
  }

  // 处理评论徽章点击
  const handleCommentBadgeClick = async (index: number | string) => {
    const numIndex = Number(index)
    highlightedParagraphIndex.value = numIndex
    await openCommentDrawer(numIndex)
  }

  // 打开评论抽屉
  const openCommentDrawer = async (paragraphIndex: number) => {
    const paragraphRef = getParagraphRef(paragraphIndex)
    if (!paragraphRef) return

    commentStore.selectParagraph(paragraphRef.paragraphId)
    await commentStore.loadParagraphComments(paragraphRef)
    commentDrawerVisible.value = true
  }

  // 处理评论提交
  const handleCommentSubmit = async (data: { content: string; emoji?: string; replyToCommentId?: string; replyToUsername?: string }) => {
    if (highlightedParagraphIndex.value === null || !currentChapter.value) return

    const paragraphRef = getParagraphRef(highlightedParagraphIndex.value)
    if (!paragraphRef) return

    await commentStore.addComment({
      paragraphId: paragraphRef.paragraphId,
      chapterId: paragraphRef.chapterId,
      bookId: currentChapter.value.bookId || '',
      paragraphIndex: paragraphRef.paragraphIndex,
      content: data.content,
      emoji: data.emoji,
      replyToCommentId: data.replyToCommentId,
      replyToUsername: data.replyToUsername
    })
  }

  // 加载章节评论摘要
  const loadChapterCommentSummaries = async () => {
    if (!currentChapter.value) return

    await commentStore.loadChapterSummaries(
      currentChapter.value.id,
      displayParagraphs.value.map((paragraph, index) => ({
        paragraphId: paragraph.id || `${currentChapter.value!.id}-${index}`,
        chapterId: currentChapter.value!.id,
        paragraphIndex: index
      }))
    )
  }

  // 清理评论选择状态
  const clearCommentSelection = () => {
    highlightedParagraphIndex.value = null
    commentStore.clearSelection()
  }

  return {
    // 状态
    highlightedParagraphIndex,
    commentDrawerVisible,

    // 方法
    getParagraphRef,
    getParagraphCommentCount,
    handleParagraphClick,
    handleCommentBadgeClick,
    openCommentDrawer,
    handleCommentSubmit,
    loadChapterCommentSummaries,
    clearCommentSelection,

    // Store 访问
    commentStore
  }
}
