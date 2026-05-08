<template>
  <section class="collections-view">
    <div class="stats-grid">
      <article class="stat-card">
        <p class="label">收藏总数</p>
        <el-tooltip content="按 bookId 合并重复收藏后的总数" placement="top">
          <p class="value">{{ total }}</p>
        </el-tooltip>
      </article>
      <article class="stat-card">
        <p class="label">合并重复</p>
        <el-tooltip content="原始数据中被合并的重复记录数量" placement="top">
          <p class="value">{{ mergedDuplicateCount }}</p>
        </el-tooltip>
      </article>
      <article class="stat-card">
        <p class="label">备注覆盖率</p>
        <el-tooltip content="当前筛选结果中已备注的占比" placement="top">
          <p class="value">{{ noteCoverage }}%</p>
        </el-tooltip>
      </article>
      <article class="stat-card">
        <p class="label">当前已选</p>
        <el-tooltip content="可用于批量打标签/备注/取消收藏" placement="top">
          <p class="value">{{ selectedIds.length }}</p>
        </el-tooltip>
      </article>
    </div>

    <section class="query-panel">
      <Input v-model="keyword" :placeholder="searchScope === 'title' ? '按书名搜索' : '按作者搜索'" clearable class="search-input" />
      <Select v-model="searchScope" :options="searchScopeSelectOptions" class="scope-select" />
      <Select v-model="selectedTags" :options="tagSelectOptions" multiple clearable placeholder="标签筛选" class="filter-select" />
      <Select v-model="selectedAuthors" :options="authorSelectOptions" multiple clearable placeholder="作者筛选" class="filter-select" />
      <Select v-model="sortBy" :options="sortSelectOptions" class="sort-select" />
      <el-button text @click="resetFilters">重置</el-button>
    </section>

    <section class="batch-toolbar">
      <div class="left">
        <el-checkbox :indeterminate="isPartialSelected" :model-value="isAllPageSelected" @change="toggleSelectAllPage">本页全选</el-checkbox>
        <span class="tip">筛选结果 {{ total }} 本</span>
      </div>
      <div class="right">
        <el-button :disabled="selectedIds.length === 0" @click="openBatchTagDialog = true">批量打标签</el-button>
        <el-button :disabled="selectedIds.length === 0" @click="openBatchNoteEditor">批量备注</el-button>
        <el-button type="danger" :disabled="selectedIds.length === 0" @click="batchRemoveSelected">批量取消</el-button>
      </div>
    </section>

    <el-skeleton :loading="loading" :rows="4" animated>
      <el-empty v-if="pagedCollections.length === 0" description="暂无收藏结果" />

      <div v-else class="collections-grid">
        <CollectionBookCard
          v-for="item in pagedCollections"
          :key="item.id"
          :item="item"
          :selected="selectedIds.includes(item.id)"
          :expanded="expandedNoteIds.includes(item.id)"
          :formatted-date="formatDate(item.createdAt)"
          @update:selected="(v:boolean) => toggleSelect(item.id, v)"
          @open-book="goToBook(item.bookId)"
          @command="(cmd:string) => handleMoreCommand(item, cmd)"
          @toggle-note="toggleNote(item.id)"
        />
      </div>
    </el-skeleton>

    <el-pagination
      v-if="total > pageSize"
      v-model:current-page="currentPage"
      :page-size="pageSize"
      :total="total"
      layout="prev, pager, next"
      class="pagination"
    />

    <el-dialog v-model="noteDialogVisible" title="编辑备注" width="520px">
      <el-input v-model="noteDialogValue" type="textarea" :rows="5" maxlength="500" show-word-limit />
      <template #footer>
        <el-button @click="noteDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveSingleNote">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="openBatchTagDialog" title="批量打标签" width="520px">
      <el-select v-model="batchTagValues" multiple filterable allow-create default-first-option placeholder="选择或输入标签" style="width: 100%">
        <el-option v-for="tag in tagOptions" :key="tag" :label="tag" :value="tag" />
      </el-select>
      <template #footer>
        <el-button @click="openBatchTagDialog = false">取消</el-button>
        <el-button type="primary" @click="applyBatchTags">应用到所选 {{ selectedIds.length }} 项</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="batchNoteDialogVisible" title="批量编辑备注" width="560px">
      <div class="batch-note-mode">
        <el-radio-group v-model="batchNoteMode">
          <el-radio label="replace">覆盖备注</el-radio>
          <el-radio label="append">追加备注</el-radio>
        </el-radio-group>
      </div>
      <el-input v-model="batchNoteText" type="textarea" :rows="6" maxlength="500" show-word-limit placeholder="输入批量备注内容" />
      <template #footer>
        <el-button @click="batchNoteDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="applyBatchNote">应用到所选 {{ selectedIds.length }} 项</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { message, messageBox } from '@/design-system/services'
import { Input, Select } from '@/design-system/form'
import { collectionsAPI, type Collection } from '@/modules/reader/api/manual/collections'
import CollectionBookCard from '@/modules/reader/components/CollectionBookCard.vue'
import { getBookDetail } from '@/modules/bookstore/api'
import defaultBookCover from '@/assets/default-book-cover.svg'

type SortBy = 'latest' | 'oldest' | 'title' | 'author'
type NoteMode = 'replace' | 'append'

const router = useRouter()

const pageSize = 12
const currentPage = ref(1)
const sortBy = ref<SortBy>('latest')
const loading = ref(false)

const keyword = ref('')
const searchScope = ref<'title' | 'author'>('title')
const selectedTags = ref<string[]>([])
const selectedAuthors = ref<string[]>([])

const allCollections = ref<Collection[]>([])
const rawCollectionCount = ref(0)

const selectedIds = ref<string[]>([])
const expandedNoteIds = ref<string[]>([])

const noteDialogVisible = ref(false)
const noteDialogItemId = ref<string | null>(null)
const noteDialogValue = ref('')

const openBatchTagDialog = ref(false)
const batchTagValues = ref<string[]>([])

const batchNoteDialogVisible = ref(false)
const batchNoteMode = ref<NoteMode>('replace')
const batchNoteText = ref('')

const searchScopeSelectOptions = [
  { label: '搜书名', value: 'title' },
  { label: '搜作者', value: 'author' }
]

const sortSelectOptions = [
  { label: '最近收藏', value: 'latest' },
  { label: '最早收藏', value: 'oldest' },
  { label: '书名 A-Z', value: 'title' },
  { label: '作者 A-Z', value: 'author' }
]

const authorOptions = computed(() => [...new Set(allCollections.value.map((x) => x.author))].sort((a, b) => a.localeCompare(b)))
const tagOptions = computed(() => [...new Set(allCollections.value.flatMap((x) => x.tags || []))].sort((a, b) => a.localeCompare(b)))
const authorSelectOptions = computed(() => authorOptions.value.map((author) => ({ label: author, value: author })))
const tagSelectOptions = computed(() => tagOptions.value.map((tag) => ({ label: tag, value: tag })))

const filteredCollections = computed(() => {
  const kw = keyword.value.trim().toLowerCase()

  let list = allCollections.value.filter((item) => {
    if (kw) {
      const target = searchScope.value === 'title' ? item.title : item.author
      if (!target.toLowerCase().includes(kw)) return false
    }

    if (selectedAuthors.value.length > 0 && !selectedAuthors.value.includes(item.author)) return false

    if (selectedTags.value.length > 0) {
      const tags = item.tags || []
      if (!selectedTags.value.some((tag) => tags.includes(tag))) return false
    }

    return true
  })

  if (sortBy.value === 'latest') {
    list = list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
  } else if (sortBy.value === 'oldest') {
    list = list.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt))
  } else if (sortBy.value === 'author') {
    list = list.sort((a, b) => a.author.localeCompare(b.author))
  } else {
    list = list.sort((a, b) => a.title.localeCompare(b.title))
  }

  return list
})

const total = computed(() => filteredCollections.value.length)
const pagedCollections = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredCollections.value.slice(start, start + pageSize)
})

const mergedDuplicateCount = computed(() => Math.max(0, rawCollectionCount.value - allCollections.value.length))
const noteCoverage = computed(() => {
  if (total.value === 0) return 0
  const noted = filteredCollections.value.filter((x) => Boolean(x.description?.trim())).length
  return Math.round((noted / total.value) * 100)
})

const isAllPageSelected = computed(() => {
  const pageIds = pagedCollections.value.map((x) => x.id)
  return pageIds.length > 0 && pageIds.every((id) => selectedIds.value.includes(id))
})

const isPartialSelected = computed(() => {
  const pageIds = pagedCollections.value.map((x) => x.id)
  if (pageIds.length === 0) return false
  const selectedCount = pageIds.filter((id) => selectedIds.value.includes(id)).length
  return selectedCount > 0 && selectedCount < pageIds.length
})

onMounted(async () => {
  await loadCollections()
})

watch([keyword, searchScope, selectedTags, selectedAuthors, sortBy], () => {
  currentPage.value = 1
})

watch(total, () => {
  const maxPage = Math.max(1, Math.ceil(total.value / pageSize))
  if (currentPage.value > maxPage) currentPage.value = maxPage
})

watch(allCollections, () => {
  const idSet = new Set(allCollections.value.map((x) => x.id))
  selectedIds.value = selectedIds.value.filter((id) => idSet.has(id))
  expandedNoteIds.value = expandedNoteIds.value.filter((id) => idSet.has(id))
})

async function loadCollections() {
  loading.value = true
  try {
    const response = await collectionsAPI.getCollections({ page: 1, pageSize: 100 })
    const payload = (response as any)?.data ?? response
    const rawList = Array.isArray(payload)
      ? payload
      : (payload?.collections || payload?.items || payload?.list || payload?.data || [])

    const uniqueBookIds = [...new Set((Array.isArray(rawList) ? rawList : []).map((item: any) => item.bookId || item.book_id).filter(Boolean))]
    const detailEntries = await Promise.all(
      uniqueBookIds.map(async (id) => {
        try {
          const detailResponse = await getBookDetail(String(id))
          return [String(id), (detailResponse as any)?.data ?? detailResponse] as const
        } catch {
          return [String(id), null] as const
        }
      }),
    )
    const details = new Map(detailEntries)

    const normalized = (Array.isArray(rawList) ? rawList : []).map((item: any) => {
      const bookId = String(item.bookId || item.book_id || '')
      const detail = details.get(bookId)
      return {
        id: String(item.id || item.collection_id || `${bookId}-collection`),
        bookId,
        title: detail?.title || item.title || `作品 ${bookId.slice(-6)}`,
        author: detail?.author || item.author || '未知作者',
        cover: detail?.cover || item.cover || defaultBookCover,
        description: item.description || item.note || '',
        tags: item.tags || detail?.tags || [],
        isPublic: Boolean(item.isPublic ?? item.is_public ?? false),
        createdAt: item.createdAt || item.created_at || new Date().toISOString(),
        updatedAt: item.updatedAt || item.updated_at || item.createdAt || new Date().toISOString(),
      } satisfies Collection
    })

    rawCollectionCount.value = Number((response as any)?.pagination?.total ?? payload?.pagination?.total ?? normalized.length)
    allCollections.value = mergeCollections(normalized)
  } catch (error: any) {
    message.error(error.message || '加载收藏失败')
    rawCollectionCount.value = 0
    allCollections.value = []
  } finally {
    loading.value = false
  }
}

function mergeCollections(list: Collection[]): Collection[] {
  const map = new Map<string, Collection>()

  list.forEach((item) => {
    const existing = map.get(item.bookId)
    if (!existing) {
      map.set(item.bookId, { ...item, tags: [...new Set(item.tags || [])] })
      return
    }

    const newer = +new Date(item.createdAt) > +new Date(existing.createdAt) ? item : existing
    const mergedTags = [...new Set([...(existing.tags || []), ...(item.tags || [])])]
    const note = (newer.description || existing.description || '').trim()

    map.set(item.bookId, {
      ...existing,
      ...newer,
      id: existing.id,
      tags: mergedTags,
      description: note
    })
  })

  return [...map.values()]
}

function toggleSelect(id: string, checked: boolean) {
  if (checked) {
    if (!selectedIds.value.includes(id)) selectedIds.value.push(id)
  } else {
    selectedIds.value = selectedIds.value.filter((x) => x !== id)
  }
}

function toggleSelectAllPage(checked: boolean) {
  const pageIds = pagedCollections.value.map((x) => x.id)
  if (checked) {
    const set = new Set([...selectedIds.value, ...pageIds])
    selectedIds.value = [...set]
  } else {
    selectedIds.value = selectedIds.value.filter((id) => !pageIds.includes(id))
  }
}

function handleMoreCommand(item: Collection, cmd: string) {
  if (cmd === 'edit-note') {
    noteDialogItemId.value = item.id
    noteDialogValue.value = item.description || ''
    noteDialogVisible.value = true
    return
  }
  if (cmd === 'toggle-note') {
    toggleNote(item.id)
    return
  }
  if (cmd === 'remove') {
    handleRemove(item)
  }
}

function toggleNote(id: string) {
  if (expandedNoteIds.value.includes(id)) {
    expandedNoteIds.value = expandedNoteIds.value.filter((x) => x !== id)
  } else {
    expandedNoteIds.value.push(id)
  }
}

function saveSingleNote() {
  if (!noteDialogItemId.value) return
  const target = allCollections.value.find((x) => x.id === noteDialogItemId.value)
  if (!target) return
  collectionsAPI.updateCollection(target.id, {
    description: noteDialogValue.value.trim(),
    note: noteDialogValue.value.trim(),
  } as any).then(() => {
    target.description = noteDialogValue.value.trim()
    target.updatedAt = new Date().toISOString()
    noteDialogVisible.value = false
    message.success('备注已保存')
  }).catch((error: any) => {
    message.error(error.message || '备注保存失败')
  })
}

async function handleRemove(item: Collection) {
  try {
    await messageBox.confirm(`确认取消收藏《${item.title}》吗？`, '取消收藏', {
      confirmButtonText: '确认',
      cancelButtonText: '保留'
    })
    await collectionsAPI.deleteCollection(item.id)
    allCollections.value = allCollections.value.filter((x) => x.id !== item.id)
    selectedIds.value = selectedIds.value.filter((id) => id !== item.id)
    message.success('已取消收藏')
  } catch (e: any) {
    if (e !== 'cancel') message.error('取消收藏失败')
  }
}

function applyBatchTags() {
  if (selectedIds.value.length === 0 || batchTagValues.value.length === 0) {
    message.warning('请选择收藏并设置标签')
    return
  }
  const idSet = new Set(selectedIds.value)
  const tasks = allCollections.value
    .filter((item) => idSet.has(item.id))
    .map((item) => {
      const tags = [...new Set([...(item.tags || []), ...batchTagValues.value])]
      return collectionsAPI.updateCollection(item.id, { tags } as any).then(() => {
        item.tags = tags
        item.updatedAt = new Date().toISOString()
      })
    })
  Promise.all(tasks).then(() => {
    openBatchTagDialog.value = false
    message.success(`已为 ${selectedIds.value.length} 项添加标签`)
  }).catch((error: any) => {
    message.error(error.message || '批量打标签失败')
  })
}

function openBatchNoteEditor() {
  batchNoteText.value = ''
  batchNoteMode.value = 'replace'
  batchNoteDialogVisible.value = true
}

function applyBatchNote() {
  if (selectedIds.value.length === 0) {
    message.warning('请先选择收藏项')
    return
  }
  const text = batchNoteText.value.trim()
  if (!text) {
    message.warning('请输入备注内容')
    return
  }

  const idSet = new Set(selectedIds.value)
  const tasks = allCollections.value
    .filter((item) => idSet.has(item.id))
    .map((item) => {
      const nextDescription = batchNoteMode.value === 'append'
        ? (item.description?.trim() ? `${item.description.trim()}\n${text}` : text)
        : text
      return collectionsAPI.updateCollection(item.id, {
        description: nextDescription,
        note: nextDescription,
      } as any).then(() => {
        item.description = nextDescription
        item.updatedAt = new Date().toISOString()
      })
    })

  Promise.all(tasks).then(() => {
    batchNoteDialogVisible.value = false
    message.success(`已更新 ${selectedIds.value.length} 项备注`)
  }).catch((error: any) => {
    message.error(error.message || '批量备注失败')
  })
}

async function batchRemoveSelected() {
  if (selectedIds.value.length === 0) return
  try {
    await messageBox.confirm(`确认批量取消收藏 ${selectedIds.value.length} 项吗？`, '批量取消收藏', {
      confirmButtonText: '确认',
      cancelButtonText: '保留'
    })
    const set = new Set(selectedIds.value)
    await Promise.all(allCollections.value.filter((x) => set.has(x.id)).map((item) => collectionsAPI.deleteCollection(item.id)))
    allCollections.value = allCollections.value.filter((x) => !set.has(x.id))
    selectedIds.value = []
    message.success('批量取消收藏成功')
  } catch (e: any) {
    if (e !== 'cancel') message.error('批量取消收藏失败')
  }
}

function resetFilters() {
  keyword.value = ''
  searchScope.value = 'title'
  selectedTags.value = []
  selectedAuthors.value = []
  sortBy.value = 'latest'
}

function goToBook(bookId: string) {
  router.push(`/bookstore/books/${bookId}`)
}

function formatDate(date: string) {
  const d = new Date(date)
  return `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, '0')}-${`${d.getDate()}`.padStart(2, '0')}`
}
</script>

<style scoped lang="scss">
.collections-view {
  max-width: 1240px;
  margin: 0 auto;
  padding: 18px 20px 24px;
  background: radial-gradient(circle at top right, #ecf4ff 0%, #f8fafc 42%, #ffffff 100%);
  border-radius: 16px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 12px;
}

.stat-card {
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: #fff;
}

.stat-card .label {
  margin: 0;
  color: #64748b;
  font-size: 12px;
}

.stat-card .value {
  margin: 4px 0 0;
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
  width: fit-content;
}

.query-panel {
  display: grid;
  grid-template-columns: minmax(260px, 1.3fr) 110px 1fr 1fr 130px auto;
  gap: 8px;
  align-items: center;
  border: 1px solid #e2e8f0;
  background: #fff;
  border-radius: 12px;
  padding: 8px;
  margin-bottom: 10px;
}

.scope-select,
.sort-select,
.filter-select,
.search-input {
  width: 100%;
}

.query-panel :deep(.search-input),
.query-panel :deep(.scope-select),
.query-panel :deep(.filter-select),
.query-panel :deep(.sort-select) {
  min-height: 36px;
}

.query-panel :deep(.search-input:focus),
.query-panel :deep(.scope-select:focus-visible),
.query-panel :deep(.filter-select:focus-visible),
.query-panel :deep(.sort-select:focus-visible) {
  outline: none;
}

.batch-toolbar {
  border: 1px dashed #cbd5e1;
  border-radius: 10px;
  padding: 8px 10px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.batch-toolbar .left,
.batch-toolbar .right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.batch-toolbar .tip {
  font-size: 12px;
  color: #64748b;
}

.collections-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.pagination {
  margin-top: 16px;
  justify-content: center;
}

.batch-note-mode {
  margin-bottom: 10px;
}

@media (max-width: 1200px) {
  .query-panel {
    grid-template-columns: 1fr 100px 1fr 1fr;
  }

  .sort-select {
    grid-column: span 1;
  }

  .collections-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 860px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .query-panel {
    grid-template-columns: 1fr;
  }

  .batch-toolbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .collections-grid {
    grid-template-columns: 1fr;
  }
}
</style>
