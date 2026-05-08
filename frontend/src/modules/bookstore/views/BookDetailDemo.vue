<template>
  <div class="book-detail-demo">
    <div class="page-shell">
      <section class="panel intro-panel">
        <div class="cover-block">
          <el-image :src="book.cover" fit="cover" :alt="book.title" class="book-cover" @error="onCoverError">
            <template #error>
              <div class="cover-fallback">封面加载失败</div>
            </template>
          </el-image>
        </div>

        <div class="info-block">
          <div class="title-row">
            <h1 class="title">{{ book.title }}</h1>
            <span class="author">{{ book.author }} 著</span>
          </div>

          <div class="tags-row">
            <el-tag v-for="tag in book.tags" :key="tag" type="warning" effect="plain" round>{{ tag }}</el-tag>
          </div>

          <div class="meta-row">
            <span class="status">{{ book.statusText }}</span>
            <span class="updated">最后更新：{{ book.lastUpdate }}</span>
          </div>

          <div class="stat-row">
            <span>总点击：<b>{{ formatCompact(book.viewCount) }}</b></span>
            <span>总收藏：<b>{{ formatCompact(book.favoriteCount) }}</b></span>
            <span>总字数：<b>{{ book.wordCount }}</b></span>
          </div>

          <div class="chapter-info-row">
            <span>章节总数：{{ chapters.length }} 章</span>
            <span>最新章节：{{ latestChapterTitle }}</span>
          </div>

          <div class="rating-row">
            <span class="rating-label">评分概览</span>
            <div class="star-readonly star-summary" aria-label="评分概览">
              <span v-for="i in 5" :key="`sum-${i}`" class="star-slot">
                <span class="star-bg">★</span>
                <span class="star-fg" :style="{ width: `${starFillPercent(i, toHalfStar(avgRating))}%` }">★</span>
              </span>
            </div>
            <span class="rating-value">{{ avgRating.toFixed(1) }}</span>
            <span class="rating-count">{{ ratingCount }} 人评分</span>
          </div>

          <div class="rating-action-row">
            <span class="rating-label">我的评分</span>
            <el-rate v-model="userRating" allow-half class="rate-control rate-action" />
            <el-button type="warning" plain @click="submitRating">提交评分</el-button>
          </div>

          <div class="action-row">
            <el-button type="danger" size="large" @click="startReading">立即阅读</el-button>
            <el-button size="large" @click="addShelf">放入书架</el-button>
            <el-button size="large" :type="isFavorited ? 'warning' : 'default'" @click="toggleFavorite">
              {{ isFavorited ? '已收藏' : '收藏作品' }}
            </el-button>
            <el-button size="large" @click="subscribeBook">订阅</el-button>
            <el-button size="large" plain @click="jumpToRating">去评分</el-button>
            <el-button size="large" plain @click="jumpToComment">写评论</el-button>
          </div>

          <div class="intro-text">
            <h3>作品简介</h3>
            <p>{{ book.introduction }}</p>
          </div>
        </div>
      </section>

      <section class="panel chapter-panel">
        <div class="panel-title-row">
          <h2>章节目录</h2>
          <el-button text @click="toggleOrder">{{ reverseOrder ? '正序' : '倒序' }}</el-button>
        </div>
        <div class="chapter-grid">
          <button
            v-for="chapter in visibleChapters"
            :key="chapter.id"
            class="chapter-item"
            type="button"
            @click="openChapter(chapter.id)"
          >
            {{ chapter.title }}
          </button>
        </div>
        <div class="more-row" v-if="!expanded">
          <el-button text type="warning" @click="expanded = true">展开更多目录</el-button>
        </div>
      </section>

      <section class="panel comment-panel">
        <div class="panel-title-row">
          <h2>书评区</h2>
          <span>书评总数量：{{ comments.length }} 条</span>
        </div>

        <div ref="commentEditorRef" class="comment-editor">
          <div class="comment-rating-row">
            <span>我的评分（1-5星）</span>
            <el-rate v-model="commentRating" allow-half :max="5" class="rate-control rate-comment-input" />
          </div>
          <el-input
            v-model="commentInput"
            type="textarea"
            :rows="5"
            resize="none"
            maxlength="1000"
            show-word-limit
            placeholder="快来吐槽这本书吧，注意文明用语哦"
          />
          <div class="editor-action">
            <el-button type="warning" @click="submitComment">发表</el-button>
          </div>
        </div>

        <div class="comment-list">
          <article v-for="item in comments" :key="item.id" class="comment-item">
            <header>
              <strong>{{ item.user }}</strong>
              <span>{{ item.time }}</span>
            </header>
            <div class="comment-meta">
              <div class="star-readonly star-comment" aria-label="评论评分">
                <span v-for="i in 5" :key="`${item.id}-${i}`" class="star-slot">
                  <span class="star-bg">★</span>
                  <span class="star-fg" :style="{ width: `${starFillPercent(i, toHalfStar(item.rating))}%` }">★</span>
                </span>
              </div>
            </div>
            <p>{{ item.content }}</p>
            <div class="comment-actions-row">
              <el-button text type="primary" @click="toggleReplyEditor(item.id)">
                {{ activeReplyId === item.id ? '取消回复' : '回复' }}
              </el-button>
              <el-button text @click="collectComment(item.id)">
                收藏({{ item.collectCount }})
              </el-button>
            </div>
            <div v-if="activeReplyId === item.id" class="reply-editor">
              <el-input
                v-model="replyDraft"
                type="textarea"
                :rows="2"
                resize="none"
                maxlength="300"
                show-word-limit
                placeholder="请输入回复内容"
              />
              <div class="reply-editor-action">
                <el-button type="warning" size="small" @click="submitReply(item.id)">发送回复</el-button>
              </div>
            </div>
            <div v-if="item.replies.length" class="reply-list">
              <div v-for="reply in item.replies" :key="reply.id" class="reply-item">
                <span class="reply-user">{{ reply.user }}：</span>
                <span class="reply-content">{{ reply.content }}</span>
                <span class="reply-time">{{ reply.time }}</span>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from '@/design-system/services'
import defaultBookCover from '@/assets/default-book-cover.svg'
import {
  createYunlanChapterList,
  yunlanBookMeta
} from '@/modules/bookstore/yunlanDemo.mock'
import { yunlanInitialComments, type YunlanComment } from '@/modules/bookstore/comment.mock'

interface CommentReply {
  id: string
  user: string
  content: string
  time: string
}

const router = useRouter()

const book = ref({ ...yunlanBookMeta })
const chapters = ref(createYunlanChapterList())

const reverseOrder = ref(false)
const expanded = ref(false)
const visibleChapters = computed(() => {
  const base = reverseOrder.value ? [...chapters.value].reverse() : chapters.value
  return expanded.value ? base : base.slice(0, 18)
})
const latestChapterTitle = computed(() => {
  const last = chapters.value[chapters.value.length - 1]
  return last ? last.title : '暂无章节'
})

const userRating = ref(4.5)
const avgRating = ref(4.7)
const ratingCount = ref(1573)
const isFavorited = ref(false)

const commentInput = ref('')
const commentRating = ref(4)
const commentEditorRef = ref<HTMLElement | null>(null)
const activeReplyId = ref<string | null>(null)
const replyDraft = ref('')
const comments = ref<YunlanComment[]>(
  yunlanInitialComments.map(item => ({
    ...item,
    replies: item.replies.map((reply: CommentReply) => ({ ...reply }))
  }))
)

const formatCompact = (value: number): string => {
  if (value >= 10000) return `${(value / 10000).toFixed(1)}万`
  return String(value)
}

const startReading = async () => {
  const firstId = chapters.value[0]?.id
  if (!firstId) {
    message.warning('暂无章节')
    return
  }
  await router.push({ path: `/reader/${firstId}`, query: { demo: 'yunlan', from: 'bookstore-demo' } })
}
const addShelf = () => message.success('已加入书架（演示）')
const subscribeBook = () => message.success('订阅成功（演示）')
const toggleFavorite = () => {
  isFavorited.value = !isFavorited.value
  book.value.favoriteCount += isFavorited.value ? 1 : -1
  message.success(isFavorited.value ? '收藏成功（演示）' : '已取消收藏（演示）')
}
const openChapter = (id: string) => {
  const idx = chapters.value.findIndex(ch => ch.id === id)
  if (idx < 0) {
    message.warning('章节不存在')
    return
  }
  void router.push({ path: `/reader/${id}`, query: { demo: 'yunlan', from: 'bookstore-demo' } })
}
const toggleOrder = () => (reverseOrder.value = !reverseOrder.value)
const onCoverError = () => {
  book.value.cover = defaultBookCover
}

const submitRating = () => {
  avgRating.value = Number(((avgRating.value * ratingCount.value + userRating.value) / (ratingCount.value + 1)).toFixed(1))
  ratingCount.value += 1
  message.success('评分成功（演示）')
}

const submitComment = () => {
  const content = commentInput.value.trim()
  if (!content) {
    message.warning('请输入评论内容')
    return
  }
  if (!commentRating.value) {
    message.warning('请先进行1-5星评分')
    return
  }
  comments.value.unshift({
    id: `c-${Date.now()}`,
    user: '当前用户',
    time: '刚刚',
    content,
    rating: commentRating.value,
    collectCount: 0,
    replies: []
  })
  commentInput.value = ''
  commentRating.value = 4
  message.success('评论已发布（演示）')
}

const toggleReplyEditor = (commentId: string) => {
  if (activeReplyId.value === commentId) {
    activeReplyId.value = null
    replyDraft.value = ''
    return
  }
  activeReplyId.value = commentId
  replyDraft.value = ''
}

const submitReply = (commentId: string) => {
  const content = replyDraft.value.trim()
  if (!content) {
    message.warning('请输入回复内容')
    return
  }
  const target = comments.value.find(item => item.id === commentId)
  if (!target) return
  target.replies.push({
    id: `r-${Date.now()}`,
    user: '当前用户',
    content,
    time: '刚刚'
  })
  replyDraft.value = ''
  activeReplyId.value = null
  message.success('回复成功（演示）')
}

const collectComment = (commentId: string) => {
  const target = comments.value.find(item => item.id === commentId)
  if (!target) return
  target.collectCount += 1
  message.success('已收藏该评论（演示）')
}

const toHalfStar = (value: number): number => {
  if (!Number.isFinite(value) || value <= 0) return 0
  if (value < 1) return 0.5
  return Math.floor(value * 2) / 2
}

const starFillPercent = (index: number, value: number): number => {
  const fill = value - (index - 1)
  if (fill >= 1) return 100
  if (fill <= 0) return 0
  return fill * 100
}

const jumpToComment = async () => {
  await nextTick()
  commentEditorRef.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

const jumpToRating = async () => {
  await jumpToComment()
}
</script>

<style scoped lang="scss">
.book-detail-demo {
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

.intro-panel {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 24px;
}

.book-cover {
  width: 220px;
  height: 310px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

.cover-fallback {
  display: grid;
  place-items: center;
  height: 100%;
  color: #909399;
  background: #f5f7fa;
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

.action-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 12px 0 14px;
}

.rating-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin: 10px 0 6px;
}

.rating-action-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 8px;
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

.star-readonly {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  line-height: 1;
}

.star-slot {
  position: relative;
  display: inline-block;
  width: 1em;
  height: 1em;
  line-height: 1em;
}

.star-bg,
.star-fg {
  position: absolute;
  top: 0;
  left: 0;
  display: inline-block;
  width: 100%;
  height: 100%;
  line-height: 1em;
}

.star-bg {
  color: #d4d7de;
}

.star-fg {
  color: #f5b301;
  overflow: hidden;
  white-space: nowrap;
}

.star-summary {
  font-size: 16px;
}

.star-comment {
  font-size: 14px;
}

.rate-control {
  --el-rate-icon-size: 18px;
  --el-rate-fill-color: #f5b301;
  --el-rate-void-color: #d4d7de;
  --el-rate-disabled-void-color: #d4d7de;
}

.rate-summary {
  --el-rate-icon-size: 16px;
}

.rate-comment-item {
  --el-rate-icon-size: 14px;
}

.rate-comment-input {
  --el-rate-icon-size: 18px;
}

.rate-action {
  --el-rate-icon-size: 20px;
  --el-rate-void-color: #d4d7de;
  --el-rate-disabled-void-color: #d4d7de;
}

.rate-control :deep(.el-rate__icon.is-active),
.rate-control :deep(.el-rate__icon.is-half) {
  color: #f5b301 !important;
}

.rating-action-row :deep(.el-rate) {
  display: inline-flex;
  align-items: center;
  line-height: 1;
  vertical-align: middle;
}

.rating-action-row :deep(.el-rate__item) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--el-rate-icon-size);
  height: var(--el-rate-icon-size);
  line-height: 1;
}

.rating-action-row :deep(.el-rate__icon) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  transform: none;
}

.rating-action-row :deep(.el-rate__icon .el-icon),
.rating-action-row :deep(.el-rate__icon .el-icon svg) {
  width: 1em;
  height: 1em;
  vertical-align: middle;
}

.rating-action-row :deep(.el-rate__icon:not(.is-active):not(.is-half)) {
  color: #d4d7de !important;
}

.intro-text h3 {
  margin: 0 0 6px;
  font-size: 18px;
}

.intro-text p {
  margin: 0;
  color: #303133;
  line-height: 1.75;
}

.panel-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.panel-title-row h2 {
  margin: 0;
  font-size: 28px;
  color: #111827;
}

.chapter-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px 18px;
}

.chapter-item {
  text-align: left;
  background: transparent;
  border: 0;
  color: #303133;
  font-size: 17px;
  line-height: 1.4;
  padding: 7px 0;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chapter-item:hover {
  color: #e6a23c;
}

.more-row {
  margin-top: 10px;
  text-align: center;
}

.comment-editor {
  width: min(100%, 1040px);
  margin: 0 auto 14px;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #ffffff;
}

.comment-rating-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
  color: #606266;
}

.comment-editor :deep(.el-textarea) {
  width: 100%;
}

.comment-editor :deep(.el-textarea__inner) {
  width: 100%;
  resize: none;
  min-height: 160px;
  border: 1px solid #cbd5e1 !important;
  border-radius: 8px;
  box-shadow: none;
}

.comment-editor :deep(.el-textarea__inner:focus) {
  border-color: #e6a23c !important;
}

.editor-action {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

.comment-list {
  border-top: 1px solid #ebeef5;
}

.comment-item {
  padding: 12px 0;
  border-bottom: 1px solid #ebeef5;
}

.comment-item header {
  display: flex;
  justify-content: space-between;
  color: #606266;
  margin-bottom: 6px;
}

.comment-item p {
  margin: 0;
  color: #303133;
}

.comment-meta {
  margin: 6px 0 8px;
}

.comment-actions-row {
  display: flex;
  gap: 8px;
  margin-top: 6px;
}

.reply-editor {
  margin-top: 8px;
  padding: 10px;
  background: #f9fafb;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.reply-editor-action {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

.reply-list {
  margin-top: 8px;
  padding: 8px 10px;
  background: #f8fafc;
  border: 1px solid #eef2f7;
  border-radius: 4px;
}

.reply-item {
  font-size: 14px;
  color: #4b5563;
  line-height: 1.6;
}

.reply-user {
  color: #1f2937;
  font-weight: 600;
}

.reply-time {
  margin-left: 8px;
  color: #9ca3af;
  font-size: 12px;
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

  .chapter-item {
    font-size: 16px;
  }
}
</style>
