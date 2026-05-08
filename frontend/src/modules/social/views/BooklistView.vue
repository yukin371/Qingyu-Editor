<template>
  <div class="booklist-view">
    <!-- 顶部操作栏 -->
    <div class="header-actions">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索书单..."
        clearable
        style="width: 300px"
        @input="handleSearch"
      >
        <template #prefix>
          <QyIcon name="Search" />
        </template>
      </el-input>
      <div class="action-buttons">
        <el-button-group>
          <el-button :type="viewMode === 'all' ? 'primary' : ''" @click="switchView('all')">
            全部书单
          </el-button>
          <el-button :type="viewMode === 'my' ? 'primary' : ''" @click="switchView('my')">
            我的书单
          </el-button>
          <el-button
            :type="viewMode === 'official' ? 'primary' : ''"
            @click="switchView('official')"
          >
            官方书单
          </el-button>
        </el-button-group>
        <el-button type="primary" @click="showCreateDialog = true">
          <QyIcon name="Plus" />
          创建书单
        </el-button>
      </div>
    </div>

    <!-- 标签筛选 -->
    <div class="tags-filter">
      <el-tag
        v-for="tag in commonTags"
        :key="tag"
        :type="selectedTag === tag ? 'primary' : 'info'"
        class="tag-item"
        @click="filterByTag(tag)"
        effect="plain"
      >
        {{ tag }}
      </el-tag>
      <el-tag v-if="selectedTag" type="warning" @click="clearTagFilter" class="tag-item">
        清除筛选
      </el-tag>
    </div>

    <!-- 书单列表 -->
    <div v-loading="loading" class="booklist-grid">
      <el-empty v-if="!loading && booklists.length === 0" description="暂无书单" />

      <div
        v-for="booklist in booklists"
        :key="booklist.id"
        class="booklist-card"
        data-testid="booklist-card"
        @click="viewBooklistDetail(booklist.id)"
      >
        <div class="booklist-cover">
          <img :src="booklist.cover_url || '/default-booklist.png'" :alt="booklist.name" />
          <div v-if="booklist.is_official" class="official-badge">
            <el-tag type="danger" size="small">官方</el-tag>
          </div>
        </div>
        <div class="booklist-info">
          <h3 class="booklist-name">{{ booklist.name }}</h3>
          <p class="booklist-desc">{{ booklist.description }}</p>
          <div class="booklist-meta">
            <span class="meta-item">
              <QyIcon name="Collection" />
              {{ booklist.book_count }} 本书
            </span>
            <span class="meta-item">
              <QyIcon name="User" />
              {{ booklist.follower_count }} 关注
            </span>
          </div>
          <div v-if="booklist.tags && booklist.tags.length" class="booklist-tags">
            <el-tag v-for="tag in booklist.tags.slice(0, 3)" :key="tag" size="small" type="info">
              {{ tag }}
            </el-tag>
          </div>
        </div>
        <div v-if="viewMode === 'my'" class="booklist-actions">
          <el-button size="small" @click.stop="editBooklist(booklist)">编辑</el-button>
          <el-button size="small" type="danger" @click.stop="confirmDelete(booklist)"
            >删除</el-button
          >
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="total > 0" class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[12, 24, 48]"
        layout="total, sizes, prev, pager, next"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>

    <!-- 创建/编辑书单对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      :title="editingBooklist ? '编辑书单' : '创建书单'"
      width="600px"
    >
      <el-form
        :model="booklistForm"
        :rules="booklistRules"
        ref="booklistFormRef"
        label-width="100px"
      >
        <el-form-item label="书单名称" prop="name">
          <el-input v-model="booklistForm.name" placeholder="请输入书单名称" />
        </el-form-item>
        <el-form-item label="书单描述" prop="description">
          <el-input
            v-model="booklistForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入书单描述"
          />
        </el-form-item>
        <el-form-item label="封面图片" prop="cover_url">
          <el-input v-model="booklistForm.cover_url" placeholder="请输入封面图片URL" />
        </el-form-item>
        <el-form-item label="标签" prop="tags">
          <el-select
            v-model="booklistForm.tags"
            multiple
            filterable
            allow-create
            placeholder="请选择或创建标签"
            style="width: 100%"
          >
            <el-option v-for="tag in commonTags" :key="tag" :label="tag" :value="tag" />
          </el-select>
        </el-form-item>
        <el-form-item label="公开设置" prop="is_public">
          <el-switch v-model="booklistForm.is_public" active-text="公开" inactive-text="私有" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="submitBooklist" :loading="submitting">
          {{ editingBooklist ? '保存' : '创建' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 书单详情对话框 -->
    <el-dialog v-model="showDetailDialog" title="书单详情" width="800px">
      <div v-if="currentBooklist" class="booklist-detail">
        <div class="detail-header">
          <img :src="currentBooklist.cover_url || '/default-booklist.png'" class="detail-cover" />
          <div class="detail-info">
            <h2>{{ currentBooklist.name }}</h2>
            <p>{{ currentBooklist.description }}</p>
            <div class="detail-meta">
              <span>{{ currentBooklist.book_count }} 本书</span>
              <span>{{ currentBooklist.follower_count }} 关注</span>
              <el-tag v-if="currentBooklist.is_official" type="danger">官方</el-tag>
            </div>
          </div>
        </div>
        <div class="detail-actions">
          <el-button :type="isLiked ? 'primary' : 'default'" @click="toggleLike">
            {{ isLiked ? '已点赞' : '点赞' }}
          </el-button>
          <el-button v-if="viewMode === 'my'" @click="showAddBookDialog = true">添加书籍</el-button>
        </div>
        <div class="detail-books">
          <h3>书单内容</h3>
          <div v-loading="loadingBooks" class="books-grid">
            <div v-for="item in booklistItems" :key="item.id" class="book-item">
              <img :src="item.book_cover" :alt="item.book_title" class="book-cover" />
              <div class="book-info">
                <h4>{{ item.book_title }}</h4>
                <p>{{ item.book_author }}</p>
                <p v-if="item.note" class="book-note">备注: {{ item.note }}</p>
              </div>
              <el-button
                v-if="viewMode === 'my'"
                size="small"
                type="danger"
                link
                @click="removeBook(item.id)"
              >
                移除
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 添加书籍对话框 -->
    <el-dialog v-model="showAddBookDialog" title="添加书籍" width="500px">
      <el-form :model="addBookForm" label-width="100px">
        <el-form-item label="书籍ID" required>
          <el-input v-model="addBookForm.book_id" placeholder="请输入书籍ID" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="addBookForm.note"
            type="textarea"
            :rows="2"
            placeholder="可选备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddBookDialog = false">取消</el-button>
        <el-button type="primary" @click="addBook" :loading="addingBook">添加</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message, messageBox } from '@/design-system/services'
import { QyIcon } from '@/design-system/components'
import {
  getBooklists,
  getBooklistDetail,
  getBookListBooks,
  createBooklist,
  updateBooklist,
  deleteBooklist,
  likeBookList,
  type Booklist,
  type BooklistItem,
} from '@/modules/social/api'

const loading = ref(false)
const booklists = ref<Booklist[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(12)
const searchKeyword = ref('')
const viewMode = ref<'all' | 'my' | 'official'>('all')
const selectedTag = ref('')
const currentUsername = ref('')
const currentUserId = ref('')

const commonTags = ['玄幻', '都市', '仙侠', '科幻', '历史', '军事', '游戏', '悬疑', '武侠', '奇幻']

const showCreateDialog = ref(false)
const showDetailDialog = ref(false)
const showAddBookDialog = ref(false)
const editingBooklist = ref<Booklist | null>(null)
const currentBooklist = ref<Booklist | null>(null)
const booklistItems = ref<BooklistItem[]>([])
const loadingBooks = ref(false)
const isLiked = ref(false)

const submitting = ref(false)
const addingBook = ref(false)

const booklistFormRef = ref()

const booklistForm = reactive({
  name: '',
  description: '',
  cover_url: '',
  tags: [] as string[],
  is_public: true,
})

const booklistRules = {
  name: [{ required: true, message: '请输入书单名称', trigger: 'blur' }],
  description: [{ required: true, message: '请输入书单描述', trigger: 'blur' }],
}

const addBookForm = reactive({
  book_id: '',
  note: '',
})

const normalizeBooklist = (raw: any): Booklist => ({
  id: raw?.id || '',
  creator_id: raw?.creator_id || raw?.userId || raw?.user_id || '',
  creator_name: raw?.creator_name || raw?.userName || '',
  creator_avatar: raw?.creator_avatar || raw?.user_avatar || '',
  name: raw?.name || raw?.title || '',
  description: raw?.description || '',
  cover_url: raw?.cover_url || raw?.cover || '',
  book_count: Number(raw?.book_count ?? raw?.bookCount ?? raw?.books?.length ?? 0),
  follower_count: Number(raw?.follower_count ?? raw?.likeCount ?? raw?.like_count ?? 0),
  is_public: Boolean(raw?.is_public ?? raw?.isPublic ?? false),
  is_official: Boolean(raw?.is_official ?? false),
  tags: Array.isArray(raw?.tags) ? raw.tags : [],
  created_at: raw?.created_at || raw?.createdAt || '',
  updated_at: raw?.updated_at || raw?.updatedAt || '',
})

const normalizeBooklistItem = (raw: any): BooklistItem => ({
  id: raw?.id || raw?.book_id || raw?.bookId || '',
  booklist_id: raw?.booklist_id || '',
  book_id: raw?.book_id || raw?.bookId || '',
  book_title: raw?.book_title || raw?.bookTitle || '',
  book_cover: raw?.book_cover || raw?.bookCover || '',
  book_author: raw?.book_author || raw?.author_name || raw?.bookAuthor || '',
  note: raw?.note || raw?.comment || '',
  order: Number(raw?.order ?? 0),
  added_at: raw?.added_at || raw?.addTime || '',
})

// 加载书单列表
const loadBooklists = async () => {
  loading.value = true
  try {
    const params: any = {
      page: currentPage.value,
      size: pageSize.value,
    }

    if (viewMode.value === 'my') {
      // 获取我的书单
    }

    if (selectedTag.value) {
      params.tag = selectedTag.value
    }

    const res: any = await getBooklists(params)
    const rootPayload = res || {}
    const payload = Array.isArray(rootPayload?.data) ? rootPayload : res?.data || res || {}
    const list =
      payload.items || payload.list || payload.data || (Array.isArray(payload) ? payload : [])
    const allList = Array.isArray(list) ? list.map(normalizeBooklist) : []
    const keyword = searchKeyword.value.trim().toLowerCase()
    const filteredList = allList.filter((item: any) => {
      if (viewMode.value === 'official' && !item?.is_official) {
        return false
      }

      if (viewMode.value === 'my') {
        const isMyBooklist = Boolean(
          (currentUserId.value && item?.creator_id === currentUserId.value) ||
          (currentUsername.value && item?.creator_name === currentUsername.value),
        )
        if (!isMyBooklist) {
          return false
        }
      }

      if (selectedTag.value && !(item?.tags || []).includes(selectedTag.value)) {
        return false
      }

      if (keyword) {
        const haystack = [item?.name, item?.description, ...(item?.tags || [])]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(keyword)) {
          return false
        }
      }

      return true
    })

    booklists.value = filteredList
    total.value = payload.pagination?.total || rootPayload.pagination?.total || filteredList.length
  } catch (error: any) {
    message.error(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}

// 查看书单详情
const viewBooklistDetail = async (id: string) => {
  showDetailDialog.value = true
  loadingBooks.value = true
  try {
    const res: any = await getBooklistDetail(id)
    currentBooklist.value = res?.data || res ? normalizeBooklist(res?.data || res) : null
    const itemsRes: any = await getBookListBooks(id)
    const itemsPayload = itemsRes?.data || itemsRes || {}
    const items = itemsPayload.list || itemsPayload.items || itemsPayload.data || []
    booklistItems.value = Array.isArray(items) ? items.map(normalizeBooklistItem) : []
    isLiked.value = false
  } catch (error: any) {
    message.error(error.message || '加载详情失败')
  } finally {
    loadingBooks.value = false
  }
}

// 切换视图
const switchView = (mode: 'all' | 'my' | 'official') => {
  viewMode.value = mode
  currentPage.value = 1
  loadBooklists()
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  loadBooklists()
}

// 标签筛选
const filterByTag = (tag: string) => {
  selectedTag.value = tag
  currentPage.value = 1
  loadBooklists()
}

 
const clearTagFilter = () => {
  selectedTag.value = ''
  loadBooklists()
}

// 分页
const handlePageChange = () => loadBooklists()
const handleSizeChange = () => {
  currentPage.value = 1
  loadBooklists()
}

// 编辑书单
const editBooklist = (booklist: Booklist) => {
  editingBooklist.value = booklist
  Object.assign(booklistForm, {
    name: booklist.name,
    description: booklist.description,
    cover_url: booklist.cover_url || '',
    tags: booklist.tags || [],
    is_public: booklist.is_public,
  })
  showCreateDialog.value = true
}

// 删除书单
const confirmDelete = (booklist: Booklist) => {
  messageBox.confirm(`确定要删除书单"${booklist.name}"吗？`, '确认删除', {}).then(async () => {
    try {
      await deleteBooklist(booklist.id)
      message.success('删除成功')
      loadBooklists()
    } catch (error: any) {
      message.error(error.message || '删除失败')
    }
  })
}

// 提交书单
const submitBooklist = async () => {
  await booklistFormRef.value?.validate()
  submitting.value = true
  try {
    const data: any = {
      title: booklistForm.name,
      description: booklistForm.description,
      cover: booklistForm.cover_url || undefined,
      tags: booklistForm.tags,
      is_public: booklistForm.is_public,
    }

    if (editingBooklist.value) {
      await updateBooklist(editingBooklist.value.id, data)
      message.success('更新成功')
    } else {
      await createBooklist(data as any)
      message.success('创建成功')
    }

    showCreateDialog.value = false
    loadBooklists()
  } catch (error: any) {
    message.error(error.message || '操作失败')
  } finally {
    submitting.value = false
  }
}

// 关注/取消关注
const toggleLike = async () => {
  if (!currentBooklist.value) return

  try {
    if (isLiked.value) {
      message.info('当前版本暂未开放取消点赞接口')
    } else {
      await likeBookList(currentBooklist.value.id)
      isLiked.value = true
      message.success('点赞成功')
    }
    if (currentBooklist.value) {
      currentBooklist.value.follower_count += isLiked.value ? 1 : 0
    }
  } catch (error: any) {
    message.error(error.message || '操作失败')
  }
}

// 添加书籍
const addBook = async () => {
  if (!currentBooklist.value || !addBookForm.book_id) {
    message.warning('请输入书籍ID')
    return
  }

  addingBook.value = true
  try {
    message.info('当前版本暂未开放书单内添加书籍接口')
    showAddBookDialog.value = false
    addBookForm.book_id = ''
    addBookForm.note = ''
    // 重新加载详情
    await viewBooklistDetail(currentBooklist.value.id)
  } catch (error: any) {
    message.error(error.message || '添加失败')
  } finally {
    addingBook.value = false
  }
}

// 移除书籍
const removeBook = async (itemId: string) => {
  if (!currentBooklist.value) return

  try {
    message.info('当前版本暂未开放书单内移除书籍接口')
    booklistItems.value = booklistItems.value.filter((item) => item.id !== itemId)
    if (currentBooklist.value) {
      currentBooklist.value.book_count--
    }
  } catch (error: any) {
    message.error(error.message || '移除失败')
  }
}

onMounted(() => {
  try {
    const storedUser = localStorage.getItem('qingyu_user') || localStorage.getItem('user')
    const parsedUser = storedUser ? JSON.parse(storedUser) : null
    currentUsername.value = parsedUser?.username || ''
    currentUserId.value = parsedUser?.id || parsedUser?.userId || ''
  } catch {
    currentUsername.value = ''
    currentUserId.value = ''
  }
  loadBooklists()
})
</script>

<style scoped lang="scss">
.booklist-view {
  padding: 20px;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.tags-filter {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.tag-item {
  cursor: pointer;
}

.booklist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.booklist-card {
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
}

.booklist-cover {
  position: relative;
  height: 160px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .official-badge {
    position: absolute;
    top: 8px;
    right: 8px;
  }
}

.booklist-info {
  padding: 16px;
}

.booklist-name {
  margin: 0 0 8px;
  font-size: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.booklist-desc {
  margin: 0 0 12px;
  font-size: 14px;
  color: var(--el-text-color-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.booklist-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
  font-size: 13px;
  color: var(--el-text-color-secondary);

  .meta-item {
    display: flex;
    align-items: center;
    gap: 4px;
  }
}

.booklist-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.booklist-actions {
  padding: 12px 16px;
  border-top: 1px solid var(--el-border-color);
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

.booklist-detail {
  .detail-header {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
  }

  .detail-cover {
    width: 120px;
    height: 160px;
    object-fit: cover;
    border-radius: 8px;
  }

  .detail-info h2 {
    margin: 0 0 8px;
  }

  .detail-meta {
    display: flex;
    gap: 16px;
    margin-top: 12px;
    font-size: 14px;
    color: var(--el-text-color-secondary);
  }

  .detail-actions {
    margin-bottom: 20px;
    display: flex;
    gap: 12px;
  }

  .books-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
  }

  .book-item {
    display: flex;
    gap: 12px;
    padding: 12px;
    border: 1px solid var(--el-border-color);
    border-radius: 8px;
    position: relative;
  }

  .book-cover {
    width: 60px;
    height: 80px;
    object-fit: cover;
    border-radius: 4px;
  }

  .book-info h4 {
    margin: 0 0 4px;
    font-size: 14px;
  }

  .book-info p {
    margin: 0;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .book-note {
    margin-top: 4px;
    font-size: 12px;
    color: var(--el-color-primary);
  }
}
</style>
