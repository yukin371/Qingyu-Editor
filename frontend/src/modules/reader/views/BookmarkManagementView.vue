<template>
  <div class="bookmark-management-view">
    <div class="page-header">
      <h1>我的书签</h1>
      <div class="header-actions">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索书签"
          clearable
          style="width: 240px"
          @input="handleSearch"
        >
          <template #prefix>
            <QyIcon name="Search"  />
          </template>
        </el-input>
        <el-select v-model="filterType" placeholder="筛选类型" style="width: 120px" @change="loadBookmarks">
          <el-option label="全部" value="all" />
          <el-option label="有笔记" value="with_note" />
          <el-option label="无笔记" value="without_note" />
        </el-select>
      </div>
    </div>

    <div class="bookmark-content">
      <el-skeleton v-if="loading" :rows="5" animated />

      <el-empty v-else-if="filteredBookmarks.length === 0" description="暂无书签">
        <el-button type="primary" @click="$router.push('/bookstore/books')">
          去书库看看
        </el-button>
      </el-empty>

      <div v-else class="bookmarks-list">
        <div
          v-for="bookmark in filteredBookmarks"
          :key="bookmark.id"
          class="bookmark-item"
        >
          <div class="bookmark-header">
            <div class="book-info" @click="goToBook(bookmark.bookId)">
              <el-image
                :src="bookmark.bookCover"
                class="book-cover"
                fit="cover"
                lazy
              >
                <template #error>
                  <div class="image-slot">
                    <QyIcon name="Picture"  />
                  </div>
                </template>
              </el-image>
              <div class="book-details">
                <div class="book-title">{{ bookmark.bookTitle }}</div>
                <div class="chapter-title">{{ bookmark.chapterTitle }}</div>
              </div>
            </div>
            <div class="bookmark-actions">
              <el-button type="primary" size="small" @click="goToBookmark(bookmark)">
                跳转阅读
              </el-button>
              <el-button size="small" @click="editNote(bookmark)">
                <QyIcon name="Edit"  />
                {{ bookmark.content ? '编辑笔记' : '添加笔记' }}
              </el-button>
              <el-button type="danger" size="small" @click="removeBookmark(bookmark.id)" text>
                <QyIcon name="Delete"  />
              </el-button>
            </div>
          </div>

          <div v-if="bookmark.content" class="bookmark-note">
            <div class="note-label">
              <QyIcon name="Memo"  />
              笔记内容：
            </div>
            <div class="note-content">{{ bookmark.content }}</div>
          </div>

          <div class="bookmark-meta">
            <el-tag size="small">进度: {{ bookmark.progress }}%</el-tag>
            <span class="bookmark-time">{{ formatTime(bookmark.createdAt) }}</span>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="total > pageSize" class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 编辑笔记对话框 -->
    <el-dialog
      v-model="showNoteDialog"
      :title="editingBookmark?.content ? '编辑笔记' : '添加笔记'"
      width="600px"
    >
      <el-input
        v-model="noteContent"
        type="textarea"
        :rows="6"
        placeholder="在这里记录你的想法..."
        maxlength="500"
        show-word-limit
      />
      <template #footer>
        <el-button @click="showNoteDialog = false">取消</el-button>
        <el-button type="primary" @click="saveNote" :loading="saving">
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message, messageBox } from '@/design-system/services'
import { QyIcon } from '@/design-system/components'
import { getUserBookmarks, deleteBookmark, updateBookmark } from '@/modules/reader/api'
import { getBookDetail } from '@/modules/bookstore/api'
import type { Bookmark } from '@/types/models'
import defaultBookCover from '@/assets/default-book-cover.svg'

const router = useRouter()

const loading = ref(false)
const saving = ref(false)
const bookmarks = ref<Bookmark[]>([])
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

const searchKeyword = ref('')
const filterType = ref('all')

const showNoteDialog = ref(false)
const editingBookmark = ref<Bookmark | null>(null)
const noteContent = ref('')

// 过滤后的书签列表
const filteredBookmarks = computed(() => {
  let filtered = bookmarks.value

  // 类型筛选
  if (filterType.value === 'with_note') {
    filtered = filtered.filter(b => b.content)
  } else if (filterType.value === 'without_note') {
    filtered = filtered.filter(b => !b.content)
  }

  // 关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(
      b =>
        b.bookTitle?.toLowerCase().includes(keyword) ||
        b.chapterTitle?.toLowerCase().includes(keyword) ||
        b.content?.toLowerCase().includes(keyword)
    )
  }

  return filtered
})

// 格式化时间
function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

async function hydrateBookmarks(items: any[]): Promise<Bookmark[]> {
  const uniqueBookIds = [...new Set(items.map((item) => item.bookId).filter(Boolean))]
  const detailEntries = await Promise.all(
    uniqueBookIds.map(async (id) => {
      try {
        const response = await getBookDetail(String(id))
        return [String(id), (response as any)?.data ?? response] as const
      } catch {
        return [String(id), null] as const
      }
    }),
  )
  const details = new Map(detailEntries)

  return items.map((item) => {
    const detail = details.get(String(item.bookId))
    return {
      ...item,
      id: String(item.id ?? `${item.bookId}-${item.chapterId}-${item.createdAt ?? ''}`),
      bookId: String(item.bookId ?? ''),
      chapterId: String(item.chapterId ?? ''),
      bookTitle: detail?.title || `作品 ${String(item.bookId ?? '').slice(-6)}`,
      chapterTitle: item.chapterTitle || `章节 ${String(item.chapterId ?? '').slice(-6)}`,
      bookCover: detail?.cover || defaultBookCover,
      content: item.content || item.note || item.quote || '',
      progress: Number(item.progress ?? 0),
      createdAt: item.createdAt || item.updatedAt || new Date().toISOString(),
    } as Bookmark
  })
}

// 加载书签列表
async function loadBookmarks(): Promise<void> {
  loading.value = true
  try {
    const response = await getUserBookmarks({
      page: currentPage.value,
      size: pageSize.value
    })

    const data = (response as any).data || response
    const rawBookmarks = Array.isArray(data)
      ? data
      : ((data as any).bookmarks || (data as any).data || (data as any).list || [])
    bookmarks.value = await hydrateBookmarks(Array.isArray(rawBookmarks) ? rawBookmarks : [])
    total.value = Number((data as any).total || (data as any).pagination?.total || (response as any).total || bookmarks.value.length)
  } catch (error: any) {
    message.error(error.message || '加载书签失败')
  } finally {
    loading.value = false
  }
}

// 搜索处理
function handleSearch(): void {
  // 搜索在计算属性中实现，这里可以添加防抖逻辑
}

// 跳转到书籍详情
function goToBook(bookId: string): void {
  router.push(`/bookstore/books/${bookId}`)
}

// 跳转到书签位置
function goToBookmark(bookmark: Bookmark): void {
  router.push({
    path: `/reader/${bookmark.chapterId}`,
    query: { progress: bookmark.progress }
  })
}

// 编辑笔记
function editNote(bookmark: Bookmark): void {
  editingBookmark.value = bookmark
  noteContent.value = bookmark.content || ''
  showNoteDialog.value = true
}

// 保存笔记
async function saveNote(): Promise<void> {
  if (!editingBookmark.value) return

  saving.value = true
  try {
    await updateBookmark(editingBookmark.value.id, {
      note: noteContent.value
    } as any)

    const index = bookmarks.value.findIndex(b => b.id === editingBookmark.value!.id)
    if (index !== -1) {
      bookmarks.value[index].content = noteContent.value
    }

    message.success('保存成功')
    showNoteDialog.value = false
  } catch (error: any) {
    message.error(error.message || '保存失败')
  } finally {
    saving.value = false
  }
}

// 删除书签
async function removeBookmark(id: string): Promise<void> {
  try {
    await messageBox.confirm('确定要删除这个书签吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deleteBookmark(id)
    bookmarks.value = bookmarks.value.filter(b => b.id !== id)
    message.success('删除成功')
  } catch (error: any) {
    if (error !== 'cancel') {
      message.error(error.message || '删除失败')
    }
  }
}

// 分页处理
function handlePageChange(page: number): void {
  currentPage.value = page
  loadBookmarks()
}

function handleSizeChange(size: number): void {
  pageSize.value = size
  currentPage.value = 1
  loadBookmarks()
}

onMounted(() => {
  loadBookmarks()
})
</script>

<style scoped lang="scss">
.bookmark-management-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: #303133;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }
  }

  .bookmark-content {
    background: #fff;
    border-radius: 8px;
    padding: 24px;
    min-height: 400px;
  }

  .bookmarks-list {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .bookmark-item {
      padding: 20px;
      background: #f5f7fa;
      border-radius: 8px;
      border-left: 4px solid #409EFF;
      transition: all 0.3s;

      &:hover {
        background: #ecf5ff;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
      }

      .bookmark-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        .book-info {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          flex: 1;

          .book-cover {
            width: 60px;
            height: 80px;
            border-radius: 4px;
            flex-shrink: 0;

            .image-slot {
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100%;
              background: #dcdfe6;
              color: #909399;
              font-size: 24px;
            }
          }

          .book-details {
            flex: 1;
            min-width: 0;

            .book-title {
              margin: 0 0 8px;
              font-size: 16px;
              font-weight: 500;
              color: #303133;
              transition: color 0.3s;

              &:hover {
                color: #409EFF;
              }
            }

            .chapter-title {
              font-size: 14px;
              color: #606266;
            }
          }
        }

        .bookmark-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }
      }

      .bookmark-note {
        margin: 12px 0;
        padding: 12px;
        background: #fff;
        border-radius: 4px;

        .note-label {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          font-weight: 500;
          color: #606266;
          margin-bottom: 8px;
        }

        .note-content {
          font-size: 14px;
          color: #303133;
          line-height: 1.6;
          white-space: pre-wrap;
        }
      }

      .bookmark-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .bookmark-time {
          font-size: 12px;
          color: #909399;
        }
      }
    }
  }

  .pagination {
    display: flex;
    justify-content: center;
    margin-top: 32px;
  }
}

@media (max-width: 768px) {
  .bookmark-management-view {
    padding: 16px;

    .page-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;

      .header-actions {
        width: 100%;
        flex-direction: column;
      }
    }

    .bookmark-item {
      .bookmark-header {
        flex-direction: column;
        align-items: flex-start !important;
        gap: 12px;

        .bookmark-actions {
          width: 100%;
          flex-wrap: wrap;
        }
      }
    }
  }
}
</style>
