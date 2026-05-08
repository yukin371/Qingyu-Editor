<template>
  <div class="book-detail-view">
    <div class="page-shell">
      <Spinner v-if="loading" size="lg" class="loading-spinner" />

      <template v-else-if="book">
        <div class="back-row">
          <Button @click="router.back()">
            <Icon name="arrow-left" size="sm" class="mr-1" />
            返回
          </Button>
        </div>

        <section class="panel intro-panel" data-testid="book-detail">
          <div class="cover-block">
            <img :src="coverSrc" :alt="book.title" class="book-cover" @error="handleCoverError" />
          </div>

          <div class="info-block">
            <div class="title-row">
              <h1 class="title" data-testid="book-title">{{ book.title }}</h1>
              <span class="author">{{ book.author || '未知作者' }} 著</span>
            </div>

            <div class="tags-row">
              <Tag class="meta-tag" size="sm">{{ book.categoryName || book.category || '未分类' }}</Tag>
              <Tag class="meta-tag" size="sm">{{ statusText }}</Tag>
              <Tag v-for="tag in displayTags" :key="tag" class="meta-tag" size="sm">{{ tag }}</Tag>
            </div>

            <div class="meta-row">
              <span class="status">{{ statusText }}{{ bookSourceText }}</span>
              <span class="updated">最后更新：{{ lastUpdateText }}</span>
            </div>

            <div class="stat-row">
              <span>总点击：<b>{{ formatNumber(book.viewCount) }}</b></span>
              <span>总收藏：<b>{{ formatNumber(book.favoriteCount) }}</b></span>
              <span>总字数：<b>{{ formatRawNumber(book.wordCount) }}</b></span>
            </div>

            <div class="chapter-info-row">
              <span>章节总数：{{ book.chapterCount || chapters.length || 0 }} 章</span>
              <span>最新章节：{{ latestChapterTitle }}</span>
            </div>

            <div class="rating-row">
              <span class="rating-label">评分概览</span>
              <Rate :model-value="book.rating ?? 0" disabled allow-half size="sm" />
              <span class="rating-value">{{ Number(book.rating ?? 0).toFixed(1) }}</span>
              <span class="rating-count">{{ book.ratingCount || 0 }} 人评分</span>
            </div>

            <div class="action-row">
              <Button
                variant="primary"
                size="lg"
                :data-testid="hasProgress ? 'continue-reading' : 'start-reading'"
                @click="startReading"
              >
                <Icon name="book-open" size="md" class="mr-1" />
                {{ hasProgress ? '继续阅读' : '立即阅读' }}
              </Button>
              <Button size="lg" data-testid="add-to-bookshelf" @click="addToShelf">
                <Icon name="folder-plus" size="md" class="mr-1" />
                放入书架
              </Button>
              <Button
                size="lg"
                :loading="checkingFavorite"
                :data-testid="isFavorited ? 'unfavorite-button' : 'favorite-button'"
                @click="toggleFavorite"
              >
                <Icon name="star" size="md" class="mr-1" />
                {{ isFavorited ? '已收藏' : '收藏作品' }}
              </Button>
              <Button size="lg" @click="jumpToRating">去评分</Button>
              <Button size="lg" @click="jumpToComment">写评论</Button>
            </div>

            <div class="intro-text">
              <h3>作品简介</h3>
              <p>{{ displayDescription }}</p>
            </div>
          </div>
        </section>

        <section class="panel chapter-panel">
          <div class="panel-title-row">
            <h2>章节目录</h2>
            <Button variant="text" @click="reverseChapterOrder">
              {{ isReversed ? '正序' : '倒序' }}
            </Button>
          </div>

          <div class="chapter-grid">
            <button
              v-for="chapter in visibleChapters"
              :key="chapter.id"
              class="chapter-item"
              type="button"
              @click="readChapter(chapter.id)"
            >
              <span class="chapter-title">{{ chapter.title }}</span>
              <span class="chapter-meta">
                <Icon v-if="!chapter.isFree" name="lock-closed" size="xs" />
                {{ formatRawNumber(chapter.wordCount || 0) }}字
              </span>
            </button>
          </div>

          <div v-if="canExpandChapters" class="more-row">
            <Button variant="text" @click="expandedChapters = true">展开更多目录</Button>
          </div>
        </section>

        <section ref="ratingSectionRef" class="panel rating-panel">
          <div class="panel-title-row">
            <h2>评分区</h2>
            <span>评分与评价会实时同步到详情头部</span>
          </div>
          <RatingSection :book-id="bookId" />
        </section>

        <section class="panel comment-panel">
          <div class="panel-title-row">
            <h2>书评区</h2>
            <span>书评总数量：{{ commentCountText }} 条</span>
          </div>

          <div ref="commentEditorRef" class="comment-editor">
            <template v-if="authStore.isLoggedIn">
              <Textarea
                v-model="newComment"
                :rows="5"
                placeholder="快来吐槽这本书吧，注意文明用语哦"
                :maxlength="1000"
                show-word-limit
              />
              <div class="editor-action">
                <Button variant="primary" :loading="submittingComment" @click="submitComment">
                  发表
                </Button>
              </div>
            </template>
            <div v-else class="login-hint">
              <p>登录后可查看并发表书评。</p>
              <Button variant="primary" @click="goToLogin">前往登录</Button>
            </div>
          </div>

          <div class="comment-list">
            <Spinner v-if="commentsLoading" size="md" class="loading-spinner" />
            <template v-else>
              <div v-if="comments.length === 0" class="empty-comments">
                <Empty :title="authStore.isLoggedIn ? '暂无评论，来发表第一条评论吧' : '登录后查看书评内容'" />
              </div>
              <CommentItem
                v-for="comment in comments"
                :key="comment.id"
                :comment="comment"
                @delete="handleDeleteComment"
                @update="onCommentUpdated"
              />
              <div v-if="hasMoreComments" class="load-more">
                <Button :loading="loadingMore" @click="loadMoreComments">加载更多</Button>
              </div>
            </template>
          </div>
        </section>

        <section v-if="recommendedBooks.length" class="panel recommend-panel">
          <div class="panel-title-row">
            <h2>相似推荐</h2>
          </div>
          <div class="recommend-grid">
            <button
              v-for="item in recommendedBooks"
              :key="item.id"
              type="button"
              class="recommend-card"
              @click="goToBook(item.id)"
            >
              <Image :src="item.cover" fit="cover" class="recommend-cover">
                <template #error>
                  <div class="cover-fallback compact">
                    <Icon name="photo" size="md" />
                  </div>
                </template>
              </Image>
              <h4>{{ item.title }}</h4>
              <p>{{ item.author || '未知作者' }}</p>
            </button>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBookstoreStore } from '../stores/bookstore.store'
import { useReaderStore } from '@/stores/reader'
import { useAuthStore } from '@/stores/auth'
import { message, messageBox } from '@/design-system/services'
import { Button, Rate, Empty, Image, Tag, Spinner } from '@/design-system'
import { Icon } from '@/design-system'
import { Textarea } from '@/design-system'
import RatingSection from '@/components/RatingSection.vue'
import CommentItem from '@/components/CommentItem.vue'
import { getBookComments, createComment, deleteComment } from '@/modules/reader/api'
import { addToBookshelf } from '@/modules/reader/api'
import { getBookRating as getBookRatingSummary } from '@/modules/reader/api/manual/rating'
import { collectionsAPI, type Collection } from '@/modules/reader/api/manual/collections'
import type { ChapterListItem, BookBrief } from '@/types/models'
import { getBookChapters as getBookChaptersApi } from '@/modules/bookstore/api/wrapper'
import {
  getPublishedBookDetail,
  type PublishedBridgeBookDetail,
} from '@/modules/workflow/publishedBridge'
import defaultBookCover from '@/assets/default-book-cover.svg'

interface Comment {
  id: string
  userId: string
  userName: string
  content: string
  rating?: number
  createdAt: string
  updatedAt?: string
}

interface Book {
  id: string
  title: string
  author: string
  cover: string
  description?: string
  introduction?: string
  categoryName?: string
  category?: string
  status: string
  rating: number
  ratingCount?: number
  viewCount: number
  favoriteCount: number
  collectCount?: number
  wordCount: number
  chapterCount: number
  tags?: string[]
  lastUpdateAt?: string
  updatedAt?: string
  publishedAt?: string
}

const route = useRoute()
const router = useRouter()
const bookstoreStore = useBookstoreStore()
const readerStore = useReaderStore()
const authStore = useAuthStore()

const bookId = route.params.id as string
const loading = ref(false)
const isReversed = ref(false)
const expandedChapters = ref(false)
const isFavorited = ref(false)
const collectionId = ref<string | null>(null)
const checkingFavorite = ref(false)
const chapters = ref<ChapterListItem[]>([])
const recommendedBooks = ref<BookBrief[]>([])
const publishedBookDetail = ref<PublishedBridgeBookDetail | null>(null)
const commentEditorRef = ref<HTMLElement | null>(null)
const ratingSectionRef = ref<HTMLElement | null>(null)
const coverErrored = ref(false)

const comments = ref<Comment[]>([])
const commentsLoading = ref(false)
const newComment = ref('')
const submittingComment = ref(false)
const commentPage = ref(1)
const commentPageSize = ref(20)
const commentTotal = ref(0)
const loadingMore = ref(false)

const hasMoreComments = computed(() => comments.value.length < commentTotal.value)

// 检查是否是 mock/本地数据（不需要调用后端 API）
const isMockBook = computed(() => publishedBookDetail.value !== null)

const book = computed(() => {
  if (publishedBookDetail.value) {
    return {
      ...publishedBookDetail.value.book,
      description: publishedBookDetail.value.book.description,
    } as unknown as Book
  }
  return bookstoreStore.currentBook ? ({ ...bookstoreStore.currentBook } as unknown as Book) : null
})

const statusText = computed(() => {
  if (!book.value) return ''
  const statusMap: Record<string, string> = {
    serializing: '连载中',
    ongoing: '连载中',
    completed: '已完结',
    paused: '暂停',
  }
  const key = String(book.value.status)
  return statusMap[key] || key
})

const displayTags = computed(() => (book.value?.tags || []).slice(0, 5))

const displayDescription = computed(() => {
  const description = book.value?.description || book.value?.introduction
  return description || '暂无简介'
})

const showcaseCoverAliases: Record<string, string> = {
  '/images/covers/showcase-yunhai.jpg': '/images/covers/yunlan-cover.png',
}

const coverSrc = computed(() => {
  if (coverErrored.value) return defaultBookCover
  const source = book.value?.cover
  if (!source) return defaultBookCover
  return showcaseCoverAliases[source] || source
})

const latestChapterTitle = computed(() => {
  const chapterList = displayedChaptersSource.value
  return chapterList[chapterList.length - 1]?.title || '暂无章节'
})

const lastUpdateText = computed(() => {
  const target = book.value?.lastUpdateAt || book.value?.updatedAt || book.value?.publishedAt
  return formatDateTime(target)
})

const bookSourceText = computed(() => {
  return publishedBookDetail.value ? ' · 发布预览' : ''
})

const hasProgress = computed(() => false)

const displayedChaptersSource = computed(() => {
  return isReversed.value ? [...chapters.value].reverse() : chapters.value
})

const visibleChapters = computed(() => {
  return expandedChapters.value
    ? displayedChaptersSource.value
    : displayedChaptersSource.value.slice(0, 18)
})

const canExpandChapters = computed(() => {
  return !expandedChapters.value && displayedChaptersSource.value.length > 18
})

const commentCountText = computed(() => {
  return commentTotal.value || comments.value.length
})

const formatNumber = (num?: number): string => {
  const safeNumber = typeof num === 'number' && !Number.isNaN(num) ? num : 0
  if (safeNumber >= 10000) {
    return `${(safeNumber / 10000).toFixed(1)}万`
  }
  return safeNumber.toString()
}

const formatRawNumber = (num?: number): string => {
  const safeNumber = typeof num === 'number' && !Number.isNaN(num) ? num : 0
  return safeNumber.toString()
}

const formatDateTime = (value?: string): string => {
  if (!value) return '暂无更新'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '暂无更新'
  return parsed.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

const handleCoverError = () => {
  coverErrored.value = true
}

const normalizeChapterItem = (chapter: any): ChapterListItem => ({
  id: String(chapter?.id ?? ''),
  title: String(chapter?.title ?? '未命名章节'),
  chapterNum: Number(chapter?.chapterNum ?? chapter?.chapter_num ?? 0),
  isFree: Boolean(chapter?.isFree ?? chapter?.is_free ?? false),
  wordCount: Number(chapter?.wordCount ?? chapter?.word_count ?? 0),
  price: Number(chapter?.price ?? 0),
  publishTime: String(chapter?.publishedAt ?? chapter?.publishTime ?? chapter?.publish_time ?? new Date().toISOString()),
  isRead: Boolean(chapter?.isRead ?? chapter?.is_read ?? false),
} as any)

const startReading = async () => {
  try {
    if (chapters.value.length > 0) {
      ;(readerStore as any).setCurrentBookId(bookId)
      if (publishedBookDetail.value) {
        router.push({
          path: `/reader/${chapters.value[0].id}`,
          query: { source: 'published', bookId },
        })
      } else {
        router.push(`/reader/${chapters.value[0].id}`)
      }
    } else {
      message.warning('暂无章节')
    }
  } catch {
    message.error('加载阅读失败')
  }
}

const readChapter = (chapterId: string) => {
  ;(readerStore as any).setCurrentBookId(bookId)
  if (publishedBookDetail.value) {
    router.push({ path: `/reader/${chapterId}`, query: { source: 'published', bookId } })
    return
  }
  router.push(`/reader/${chapterId}`)
}

const addToShelf = async () => {
  if (!authStore.isLoggedIn) {
    message.warning('请先登录')
    goToLogin()
    return
  }

  try {
    await addToBookshelf(bookId)
    message.success('已加入书架')
  } catch {
    message.error('添加失败')
  }
}

const toggleFavorite = async () => {
  if (!authStore.isLoggedIn) {
    message.warning('请先登录')
    goToLogin()
    return
  }

  try {
    if (isFavorited.value) {
      if (collectionId.value) {
        await collectionsAPI.deleteCollection(collectionId.value)
        isFavorited.value = false
        collectionId.value = null
        message.success('取消收藏')
      }
    } else {
      const response = await collectionsAPI.addCollection(bookId)
      if (response) {
        isFavorited.value = true
        collectionId.value = response.id || (response as any).collection_id || null
        message.success('收藏成功')
      }
    }
  } catch (error) {
    const errorMsg =
      (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data
        ?.message ||
      (error as Error).message ||
      '操作失败'
    if (errorMsg.includes('已经收藏') || errorMsg.includes('already')) {
      if (!isFavorited.value) {
        isFavorited.value = true
        message.success('已收藏')
        checkFavoriteStatus().catch((err) => console.error('获取收藏状态失败:', err))
      }
    } else {
      message.error(errorMsg)
    }
  }
}

const checkFavoriteStatus = async () => {
  if (!authStore.isLoggedIn) {
    isFavorited.value = false
    collectionId.value = null
    return
  }

  // Mock 数据不需要调用后端 API
  if (isMockBook.value) {
    isFavorited.value = false
    collectionId.value = null
    return
  }

  try {
    checkingFavorite.value = true
    const response = await collectionsAPI.checkCollected(bookId)
    if (response.is_collected) {
      isFavorited.value = true
      if (!collectionId.value) {
        const collections = await collectionsAPI.getCollections({ page: 1, pageSize: 100 })
        if (Array.isArray(collections)) {
          const currentBookCollection = collections.find(
            (c: Collection) => c.bookId === bookId || (c as { book_id?: string }).book_id === bookId,
          )
          if (currentBookCollection) {
            collectionId.value = currentBookCollection.id
          }
        }
      }
    } else {
      isFavorited.value = false
      collectionId.value = null
    }
  } catch (error) {
    console.error('检查收藏状态失败:', error)
    isFavorited.value = false
    collectionId.value = null
  } finally {
    checkingFavorite.value = false
  }
}

const loadComments = async (reset = false) => {
  if (!authStore.isLoggedIn) {
    if (reset) {
      comments.value = []
      commentTotal.value = 0
      commentPage.value = 1
    }
    return
  }

  // Mock 数据不需要调用后端 API
  if (isMockBook.value) {
    if (reset) {
      comments.value = []
      commentTotal.value = 0
      commentPage.value = 1
    }
    return
  }

  if (reset) {
    commentPage.value = 1
    comments.value = []
  }

  commentsLoading.value = true
  try {
    const response = await getBookComments({
      bookId,
      page: commentPage.value,
      size: commentPageSize.value,
    })

    const payload = response as any
    const commentList = Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload)
        ? payload
        : payload?.data?.comments || payload?.comments || []

    if (reset) {
      comments.value = commentList
    } else {
      comments.value.push(...commentList)
    }

    commentTotal.value = Number(payload?.pagination?.total ?? payload?.total ?? commentList.length)
  } catch (error: any) {
    if (error?.response?.status !== 401) {
      message.error('加载评论失败')
    }
  } finally {
    commentsLoading.value = false
  }
}

const loadMoreComments = async () => {
  loadingMore.value = true
  commentPage.value += 1
  await loadComments()
  loadingMore.value = false
}

const submitComment = async () => {
  if (!authStore.isLoggedIn) {
    message.warning('请先登录')
    goToLogin()
    return
  }

  if (!newComment.value.trim()) {
    message.warning('请输入评论内容')
    return
  }

  submittingComment.value = true
  try {
    await createComment({ bookId, content: newComment.value })
    message.success('发表成功')
    newComment.value = ''
    await loadComments(true)
  } catch {
    message.error('发表失败')
  } finally {
    submittingComment.value = false
  }
}

const handleDeleteComment = async (commentId: string) => {
  try {
    await messageBox.confirm('确定要删除这条评论吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    })
    await deleteComment(commentId)
    message.success('删除成功')
    await loadComments(true)
  } catch (error) {
    if (error !== 'cancel') {
      message.error('删除失败')
    }
  }
}

const reverseChapterOrder = () => {
  isReversed.value = !isReversed.value
}

const goToBook = (id: string) => {
  router.push({ name: 'book-detail', params: { id } })
}

const loadBookDetail = async () => {
  loading.value = true
  try {
    coverErrored.value = false
    const localDetail = getPublishedBookDetail(bookId)
    if (localDetail) {
      publishedBookDetail.value = localDetail
      chapters.value = localDetail.chapters.map((chapter) => ({
        id: chapter.id,
        title: chapter.title,
        chapterNum: chapter.chapterNum || 0,
        isFree: chapter.isFree,
        wordCount: chapter.wordCount,
        price: 0,
        publishTime: chapter.publishedAt || new Date().toISOString(),
        isRead: false,
      }))
      recommendedBooks.value = []
      return
    }

    publishedBookDetail.value = null
    await bookstoreStore.fetchBookDetail(bookId)

    if (bookstoreStore.currentBook) {
      bookstoreStore.currentBook = {
        ...bookstoreStore.currentBook,
        favoriteCount: Number(
          (bookstoreStore.currentBook as any).favoriteCount ??
            (bookstoreStore.currentBook as any).collectCount ??
            0
        ),
      } as any
    }

    try {
      const ratingResponse = await getBookRatingSummary(bookId)
      const ratingData = ratingResponse.data || ratingResponse
      if (bookstoreStore.currentBook) {
        bookstoreStore.currentBook = {
          ...bookstoreStore.currentBook,
          rating: Number((ratingData as any).averageRating ?? (ratingData as any).averageScore ?? 0),
          ratingCount: Number((ratingData as any).totalRatings ?? (ratingData as any).totalCount ?? 0),
        } as any
      }
    } catch {
      // ignore rating failure
    }

    await loadChapters()
    await loadRecommendations()
  } catch (error: any) {
    const status = error?.response?.status
    if (status === 404) {
      message.error('书籍不存在或数据已刷新，请返回列表页重新进入')
    } else {
      message.error('加载失败')
    }
  } finally {
    loading.value = false
  }
}

const loadChapters = async () => {
  if (publishedBookDetail.value) {
    chapters.value = publishedBookDetail.value.chapters.map(normalizeChapterItem)
    return
  }

  try {
    const initialResponse = await getBookChaptersApi(bookId)
    const initialPayload = initialResponse as any
    const initialList = Array.isArray(initialPayload?.data)
      ? initialPayload.data
      : Array.isArray(initialPayload)
        ? initialPayload
        : []

    const totalCount = Number(book.value?.chapterCount || initialList.length)
    if (initialList.length === 0) {
      chapters.value = []
      return
    }

    if (initialList.length >= totalCount || totalCount <= 20) {
      chapters.value = initialList.map(normalizeChapterItem)
      return
    }

    const pageSize = 100
    const totalPages = Math.ceil(totalCount / pageSize)
    const merged = [...initialList]

    for (let page = 2; page <= totalPages; page += 1) {
      const response = await fetch(
        `/api/v1/bookstore/books/${bookId}/chapters?page=${page}&size=${pageSize}`,
      )
      if (!response.ok) break
      const payload = await response.json()
      const pageItems = Array.isArray(payload?.data) ? payload.data : []
      if (pageItems.length === 0) break
      merged.push(...pageItems)
    }

    chapters.value = merged.map(normalizeChapterItem)
  } catch {
    message.error('加载章节失败')
    chapters.value = []
  }
}

const loadRecommendations = async () => {
  try {
    const { getSimilarBooks } = await import('@/modules/bookstore/api')
    const response = await getSimilarBooks(bookId, 6)
    recommendedBooks.value = Array.isArray(response) ? response : []
  } catch {
    recommendedBooks.value = []
  }
}

const jumpToComment = async () => {
  await nextTick()
  commentEditorRef.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

const jumpToRating = async () => {
  await nextTick()
  ratingSectionRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const goToLogin = () => {
  router.push({ path: '/auth', query: { redirect: route.fullPath } })
}

const onCommentUpdated = async (): Promise<void> => {
  await loadComments(true)
}

onMounted(async () => {
  await loadBookDetail()
  loadComments(true)
  checkFavoriteStatus()
})
</script>

<style scoped lang="scss">
.book-detail-view {
  min-height: 100vh;
  background: #f3f4f6;
  padding: 20px 0 28px;
}

.page-shell {
  width: min(1120px, calc(100vw - 32px));
  margin: 0 auto;
}

.panel {
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  padding: 24px;
  margin-bottom: 14px;
}

.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 80px 20px;
}

.back-row {
  margin-bottom: 14px;
}

.intro-panel {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 24px;
}

.book-cover {
  width: 220px;
  height: 310px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #dcdfe6;
  background: #f5f7fa;
}

.cover-fallback {
  display: grid;
  place-items: center;
  gap: 8px;
  height: 100%;
  color: #909399;
  background: #f5f7fa;
}

.cover-fallback.compact {
  gap: 0;
}

.title-row {
  display: flex;
  align-items: baseline;
  gap: 14px;
  margin-bottom: 10px;
}

.title {
  margin: 0;
  font-size: 34px;
  line-height: 1.1;
  color: #111827;
}

.author {
  color: #409eff;
  font-size: 22px;
}

.tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.meta-tag {
  background: #fff7e6;
  border-color: #f3d19e;
  color: #8a5a00;
}

.meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  color: #606266;
  margin-bottom: 12px;
}

.status {
  color: #e6a23c;
  font-weight: 700;
}

.stat-row {
  display: flex;
  flex-wrap: wrap;
  gap: 22px;
  color: #606266;
  margin-bottom: 12px;
}

.stat-row b {
  color: #f56c6c;
  font-size: 28px;
  font-style: italic;
}

.chapter-info-row {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  color: #606266;
  margin-bottom: 10px;
}

.rating-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin: 10px 0 16px;
}

.rating-label {
  color: #606266;
  min-width: 64px;
}

.rating-value {
  color: #303133;
  font-weight: 600;
}

.rating-count {
  color: #909399;
}

.action-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 12px 0 14px;
}

.intro-text h3 {
  margin: 0 0 6px;
  font-size: 18px;
}

.intro-text p {
  margin: 0;
  color: #303133;
  line-height: 1.75;
  white-space: pre-wrap;
}

.panel-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.panel-title-row h2 {
  margin: 0;
  font-size: 28px;
  color: #111827;
}

.panel-title-row span {
  color: #909399;
  font-size: 14px;
}

.chapter-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px 18px;
}

.chapter-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  text-align: left;
  background: transparent;
  border: 0;
  color: #303133;
  font-size: 16px;
  line-height: 1.4;
  padding: 8px 0;
  cursor: pointer;
}

.chapter-item:hover .chapter-title {
  color: #e6a23c;
}

.chapter-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chapter-meta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #909399;
  font-size: 13px;
  flex-shrink: 0;
}

.more-row {
  margin-top: 10px;
  text-align: center;
}

.rating-panel :deep(.rating-section) {
  padding: 0;
}

.comment-editor {
  width: min(100%, 1040px);
  margin: 0 auto 14px;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #ffffff;
}

.editor-action {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

.login-hint {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.login-hint p {
  margin: 0;
  color: #606266;
}

.comment-list {
  border-top: 1px solid #ebeef5;
}

.empty-comments {
  padding: 32px 0;
}

.load-more {
  text-align: center;
  padding: 20px 0 8px;
}

.recommend-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 18px;
}

.recommend-card {
  text-align: left;
  background: transparent;
  border: 0;
  cursor: pointer;
  padding: 0;
}

.recommend-card:hover h4 {
  color: #e6a23c;
}

.recommend-cover {
  width: 100%;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
  background: #f5f7fa;
  margin-bottom: 8px;
}

.recommend-card h4 {
  margin: 0 0 4px;
  font-size: 14px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recommend-card p {
  margin: 0;
  color: #909399;
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 1080px) {
  .recommend-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .intro-panel {
    grid-template-columns: 1fr;
  }

  .book-cover {
    width: 180px;
    height: 250px;
  }

  .title {
    font-size: 26px;
  }

  .author {
    font-size: 20px;
  }

  .panel-title-row h2 {
    font-size: 22px;
  }

  .chapter-grid {
    grid-template-columns: 1fr;
  }

  .recommend-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .page-shell {
    width: min(100vw - 20px, 100%);
  }

  .panel {
    padding: 18px;
  }

  .title-row,
  .meta-row,
  .stat-row,
  .chapter-info-row,
  .rating-row,
  .action-row,
  .panel-title-row,
  .login-hint {
    flex-direction: column;
    align-items: flex-start;
  }

  .action-row :deep(.button),
  .action-row :deep(button) {
    width: 100%;
  }

  .recommend-grid {
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }
}
</style>
