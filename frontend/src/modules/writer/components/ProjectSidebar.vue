<template>
  <div class="sidebar-container chapter-list" data-testid="chapter-list">
    <div class="sidebar-header">
      <div class="project-bar">
        <div class="project-title" :title="currentProjectTitle">
          {{ currentProjectTitle || '未命名项目' }}
        </div>
        <QyDropdown
          :items="projectSwitchItems"
          :disabled="recentProjects.length <= 1"
          @select="handleProjectSwitch"
        >
          <button type="button" class="recent-switch-btn" :disabled="recentProjects.length <= 1">
            最近项目
            <QyIcon name="ArrowDown" :size="12" class="recent-switch-caret" />
          </button>
        </QyDropdown>
      </div>
    </div>

    <div ref="searchPanelRef" class="sidebar-search">
      <div class="search-combobox">
        <span class="search-input-icon">
          <QyIcon name="Search" :size="14" />
        </span>
        <QyInput
          v-model="searchKeyword"
          id="writer-project-search"
          name="writer-project-search"
          placeholder="全书"
          clearable
          size="sm"
          class="search-input"
          @focus="handleSearchFocus"
          @keydown="handleSearchKeydown"
        />

        <div
          v-if="isSuggestionPanelVisible"
          class="search-suggestion-panel"
          data-testid="project-sidebar-suggestions"
        >
          <button
            v-for="item in keywordSuggestions"
            :key="`${item.type}-${item.id || item.value}`"
            type="button"
            class="keyword-option"
            @mousedown.prevent
            @click="handleSuggestionSelect(item)"
          >
            <span class="keyword-option__name">{{ item.value }}</span>
            <span class="keyword-option__meta"
              >{{ item.typeLabel }} · {{ item.matchModeLabel }}</span
            >
          </button>

          <div v-if="isLoadingSuggestions" class="keyword-option keyword-option--status">
            正在搜索…
          </div>
          <div
            v-else-if="searchKeyword.trim() && keywordSuggestions.length === 0"
            class="keyword-option keyword-option--status"
          >
            没有匹配项
          </div>
        </div>
      </div>
    </div>

    <div class="sidebar-actions">
      <button
        type="button"
        class="action-icon-btn action-icon-btn--primary"
        title="新建章节"
        aria-label="新建章节"
        @click="$emit('add-doc')"
      >
        <QyIcon name="Plus" :size="14" />
      </button>
      <button
        type="button"
        class="action-icon-btn"
        title="新建卷"
        aria-label="新建卷"
        @click="$emit('add-volume')"
      >
        <QyIcon name="Folder" :size="14" />
      </button>
    </div>

    <div class="sidebar-tools">
      <span class="sidebar-tools__hint">
        {{ draftOnly ? '仅看草稿' : sortMode === 'updated' ? '最近更新' : '章节顺序' }}
      </span>
      <div class="tool-icons">
        <button
          type="button"
          class="tool-icon-btn"
          :class="{ 'is-active': draftOnly }"
          title="仅看草稿"
          aria-label="仅看草稿"
          @click="draftOnly = !draftOnly"
        >
          <QyIcon name="EditPen" :size="14" />
        </button>
        <button
          type="button"
          class="tool-icon-btn"
          :class="{ 'is-active': sortMode === 'updated' }"
          title="按最近更新排序"
          aria-label="按最近更新排序"
          @click="sortMode = sortMode === 'updated' ? 'chapter' : 'updated'"
        >
          <QyIcon name="Filter" :size="14" />
        </button>
        <button type="button" class="tool-icon-btn" title="重置筛选" @click="resetFilters">
          <QyIcon name="RefreshLeft" :size="14" />
        </button>
        <button
          type="button"
          class="tool-icon-btn"
          :title="isTreeExpanded ? '收起目录' : '展开目录'"
          @click="isTreeExpanded = !isTreeExpanded"
        >
          <QyIcon name="ArrowRight" :size="14" :class="chevronClass" />
        </button>
      </div>
    </div>

    <div class="explorer-header" @click="isTreeExpanded = !isTreeExpanded">
      <div class="explorer-title">
        <span>章节</span>
        <span class="section-count">{{ displayChapters.length }}</span>
      </div>
      <span class="explorer-caption">{{ draftOnly ? '仅看草稿' : '全部章节' }}</span>
    </div>

    <div v-show="isTreeExpanded" class="sidebar-list">
      <div
        v-for="row in visibleRows"
        :key="row.chapter.id"
        class="chapter-item"
        :class="{
          'is-active': row.chapter.id === modelChapterId,
          'is-draft': row.chapter.status === 'draft',
          'is-directory': row.chapter.nodeType === 'directory',
          'is-child': row.depth > 0,
        }"
        :style="{ '--tree-depth': row.depth }"
      >
        <button
          type="button"
          class="chapter-main-zone"
          :title="row.chapter.nodeType === 'directory' ? '打开细纲' : '打开章节'"
          @click="handleRowMainClick(row)"
        >
          <QyIcon
            :name="
              row.chapter.nodeType === 'directory'
                ? isDirectoryCollapsed(row.chapter.id)
                  ? 'Folder'
                  : 'FolderOpened'
                : 'DocumentCopy'
            "
            :size="14"
            class="item-file-icon"
          />

          <div class="item-content">
            <div class="item-title">
              <span
                class="chapter-index"
                v-if="row.chapter.nodeType !== 'directory' && row.chapter.chapterNum"
              >
                {{ row.chapter.chapterNum }}.
              </span>
              <span v-safe-html="highlightText(getDisplayTitle(row.chapter), searchKeyword)"></span>
            </div>

            <div class="item-meta" v-if="row.chapter.nodeType !== 'directory'">
              <span>{{ formatCount(row.chapter.wordCount) }}字</span>
              <span class="dot">·</span>
              <span>{{ fromNow(row.chapter.updatedAt) }}</span>
            </div>
            <div class="item-meta item-meta--directory" v-else>
              <span>{{ row.childrenCount }} 个章节</span>
            </div>
          </div>
        </button>

        <QyGhostButton
          v-if="row.chapter.nodeType === 'directory'"
          class="directory-collapse-zone"
          :active="!isDirectoryCollapsed(row.chapter.id)"
          :title="isDirectoryCollapsed(row.chapter.id) ? '展开目录' : '折叠目录'"
          :aria-label="isDirectoryCollapsed(row.chapter.id) ? '展开目录' : '折叠目录'"
          @click.stop="toggleDirectoryCollapse(row.chapter.id)"
        >
          <QyIcon
            name="ArrowRight"
            :size="12"
            :class="
              isDirectoryCollapsed(row.chapter.id)
                ? 'directory-triangle is-collapsed'
                : 'directory-triangle'
            "
          />
        </QyGhostButton>

        <div class="item-actions" @click.stop>
          <QyDropdown
            :items="chapterActionItems"
            @select="(cmd: string) => handleAction(cmd as 'edit' | 'delete', row.chapter)"
          >
            <div class="action-menu-btn">
              <QyIcon name="MoreFilled" :size="14" />
            </div>
          </QyDropdown>
        </div>
      </div>

      <div v-if="visibleRows.length === 0" class="list-empty">
        <strong>{{ isFilteringList ? '没有匹配结果' : '还没有章节' }}</strong>
        <span>
          {{
            isFilteringList
              ? '清空搜索或筛选后再试。'
              : '先创建章节或卷，再开始整理目录。'
          }}
        </span>
        <div class="list-empty__actions">
          <button
            v-if="isFilteringList"
            type="button"
            class="list-empty__btn"
            @click="resetFilters"
          >
            清空筛选
          </button>
          <template v-else>
            <button
              type="button"
              class="list-empty__btn list-empty__btn--primary"
              @click="$emit('add-doc')"
            >
              新建章
            </button>
            <button type="button" class="list-empty__btn" @click="$emit('add-volume')">
              新建卷
            </button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { QyGhostButton, QyIcon, QyDropdown, QyInput } from '@/design-system/components'
import type { DropdownItem } from '@/design-system/components'
import { messageBox } from '@/design-system/services'
import { useWriterStore } from '@/modules/writer/stores/writerStore'
import { sanitizeText } from '@/utils/sanitize'

interface ProjectSummary {
  id: string
  title: string
  status: string
  wordCount: number
  chapterCount: number
  updatedAt: string
}

interface ChapterSummary {
  id: string
  projectId: string
  chapterNum: number
  title: string
  wordCount: number
  updatedAt: string
  status: 'draft' | 'published'
  nodeType?: 'directory' | 'chapter'
  sortOrder?: number
}

interface DirectoryGroup {
  directory: ChapterSummary
  children: ChapterSummary[]
}

interface ExplorerRow {
  chapter: ChapterSummary
  depth: number
  childrenCount: number
}

interface KeywordSuggestion {
  value: string
  id?: string
  type: string
  typeLabel: string
  matchMode?: string
  matchModeLabel: string
}

interface Props {
  projects: ProjectSummary[]
  chapters: ChapterSummary[]
  projectId?: string
  chapterId?: string
}

const props = withDefaults(defineProps<Props>(), {
  projects: () => [],
  chapters: () => [],
})

const emit = defineEmits<{
  'update:projectId': [id: string]
  'update:chapterId': [id: string]
  'add-doc': []
  'add-volume': []
  'open-directory-outline': [id: string]
  'edit-chapter': [chapter: ChapterSummary]
  'delete-chapter': [id: string]
}>()

const searchKeyword = ref('')
const isTreeExpanded = ref(true)
const draftOnly = ref(false)
const sortMode = ref<'chapter' | 'updated'>('chapter')
const writerStore = useWriterStore()
const collapsedDirectoryIds = ref<Set<string>>(new Set())
const searchPanelRef = ref<HTMLElement | null>(null)
const keywordSuggestions = ref<KeywordSuggestion[]>([])
const isSuggestionOpen = ref(false)
const isLoadingSuggestions = ref(false)
let suggestionTimer: ReturnType<typeof setTimeout> | null = null
const chevronClass = computed(() =>
  isTreeExpanded.value ? 'tree-chevron expanded' : 'tree-chevron',
)

const internalProjectId = computed({
  get: () => props.projectId || '',
  set: (val) => emit('update:projectId', val),
})

const modelChapterId = computed({
  get: () => props.chapterId || '',
  set: (val) => emit('update:chapterId', val),
})

const currentProjectTitle = computed(
  () => props.projects.find((p) => p.id === internalProjectId.value)?.title || '',
)

const recentProjects = computed(() => {
  return [...props.projects].sort((a, b) => {
    const ta = new Date(a.updatedAt).getTime() || 0
    const tb = new Date(b.updatedAt).getTime() || 0
    return tb - ta
  })
})

const projectSwitchItems = computed<DropdownItem[]>(() =>
  recentProjects.value.map((p) => ({
    key: p.id,
    label: p.title,
    disabled: p.id === internalProjectId.value,
  })),
)

const chapterActionItems: DropdownItem[] = [
  { key: 'edit', label: '重命名/设置', icon: 'icon-edit' },
  { key: 'delete', label: '删除章节', icon: 'icon-delete', danger: true, divider: true },
]

const handleProjectSwitch = (projectId: string | number) => {
  internalProjectId.value = String(projectId)
}

const getTypeLabel = (type: string): string => {
  if (type === 'character') return '角色'
  if (type === 'location') return '地点'
  if (type === 'timeline') return '时间线'
  if (type === 'chapter') return '章节'
  return '关键词'
}

const getMatchModeLabel = (matchMode?: string): string => {
  if (matchMode === 'pinyin_prefix') return '拼音前缀'
  if (matchMode === 'fuzzy') return '模糊匹配'
  if (matchMode === 'prefix') return '前缀匹配'
  if (matchMode === 'exact') return '精确匹配'
  return '匹配'
}

const buildKeywordSuggestions = async (queryString: string): Promise<KeywordSuggestion[]> => {
  const query = queryString.trim()
  if (!query) {
    return []
  }

  const remote = await writerStore.searchKeywords(query, 10, internalProjectId.value || undefined)
  const remoteSuggestions: KeywordSuggestion[] = (remote || []).map((item) => ({
    value: item.name,
    id: item.id,
    type: item.type,
    typeLabel: getTypeLabel(item.type),
    matchMode: item.matchMode,
    matchModeLabel: getMatchModeLabel(item.matchMode),
  }))

  const localChapters: KeywordSuggestion[] = displayChapters.value
    .filter((chapter) => getDisplayTitle(chapter).toLowerCase().includes(query.toLowerCase()))
    .slice(0, 8)
    .map((chapter) => ({
      value: getDisplayTitle(chapter),
      id: chapter.id,
      type: 'chapter',
      typeLabel: '章节',
      matchMode: 'local',
      matchModeLabel: '本地匹配',
    }))

  const dedup = new Map<string, KeywordSuggestion>()
  for (const item of [...remoteSuggestions, ...localChapters]) {
    if (!dedup.has(item.value)) {
      dedup.set(item.value, item)
    }
  }

  return Array.from(dedup.values()).slice(0, 12)
}

const isSuggestionPanelVisible = computed(() => {
  return (
    isSuggestionOpen.value &&
    (isLoadingSuggestions.value || keywordSuggestions.value.length > 0 || Boolean(searchKeyword.value.trim()))
  )
})

const handleSearchFocus = () => {
  if (!searchKeyword.value.trim()) {
    return
  }

  isSuggestionOpen.value = true
}

const handleSearchKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    isSuggestionOpen.value = false
  }
}

const handleSuggestionSelect = (item: KeywordSuggestion) => {
  searchKeyword.value = item.value
  isSuggestionOpen.value = false
  if (!item.id) {
    return
  }

  const target = displayChapters.value.find((chapter) => chapter.id === item.id)
  if (target) {
    handleSelectChapter(target)
  }
}

const handlePointerDownOutside = (event: PointerEvent) => {
  if (!searchPanelRef.value?.contains(event.target as Node)) {
    isSuggestionOpen.value = false
  }
}

const resetFilters = () => {
  searchKeyword.value = ''
  draftOnly.value = false
  sortMode.value = 'chapter'
}

const projectChapters = computed(() =>
  props.chapters.filter((chapter) => chapter.projectId === internalProjectId.value),
)

const isFilteringList = computed(
  () => Boolean(searchKeyword.value.trim()) || draftOnly.value || sortMode.value === 'updated',
)

const displayChapters = computed(() => {
  let list = [...projectChapters.value]

  if (draftOnly.value) {
    list = list.filter((c) => c.status === 'draft' || c.nodeType === 'directory')
  }

  if (searchKeyword.value.trim()) {
    const k = searchKeyword.value.toLowerCase()
    list = list.filter(
      (c) => c.title.toLowerCase().includes(k) || c.chapterNum.toString().includes(k),
    )
  }

  if (sortMode.value === 'updated') {
    return list.sort((a, b) => {
      const ta = new Date(a.updatedAt).getTime() || 0
      const tb = new Date(b.updatedAt).getTime() || 0
      return tb - ta
    })
  }

  return list.sort((a, b) => (a.sortOrder || a.chapterNum) - (b.sortOrder || b.chapterNum))
})

const normalizedKeyword = computed(() => searchKeyword.value.trim().toLowerCase())

const groupedChapters = computed<DirectoryGroup[]>(() => {
  const groups: DirectoryGroup[] = []
  let currentDirectory: DirectoryGroup | null = null

  for (const chapter of displayChapters.value) {
    if (chapter.nodeType === 'directory') {
      currentDirectory = { directory: chapter, children: [] }
      groups.push(currentDirectory)
      continue
    }

    if (currentDirectory) {
      currentDirectory.children.push(chapter)
      continue
    }

    groups.push({
      directory: chapter,
      children: [],
    })
  }

  return groups
})

const filteredGroups = computed<DirectoryGroup[]>(() => {
  const keyword = normalizedKeyword.value
  if (!keyword) {
    return groupedChapters.value
  }

  return groupedChapters.value
    .map((group) => {
      const directoryMatched = getDisplayTitle(group.directory).toLowerCase().includes(keyword)
      if (group.directory.nodeType !== 'directory') {
        return directoryMatched ? group : null
      }

      const matchedChildren = group.children.filter((child) => {
        return (
          getDisplayTitle(child).toLowerCase().includes(keyword) ||
          child.chapterNum.toString().includes(keyword)
        )
      })

      if (directoryMatched) {
        return {
          directory: group.directory,
          children: group.children,
        }
      }

      if (matchedChildren.length === 0) {
        return null
      }

      return {
        directory: group.directory,
        children: matchedChildren,
      }
    })
    .filter((group): group is DirectoryGroup => group !== null)
})

const visibleRows = computed<ExplorerRow[]>(() => {
  const rows: ExplorerRow[] = []
  const forceExpandForSearch = normalizedKeyword.value.length > 0

  for (const group of filteredGroups.value) {
    const isDirectory = group.directory.nodeType === 'directory'
    const childrenCount = isDirectory ? group.children.length : 0
    rows.push({
      chapter: group.directory,
      depth: 0,
      childrenCount,
    })

    if (!isDirectory || group.children.length === 0) {
      continue
    }

    const collapsed = collapsedDirectoryIds.value.has(group.directory.id)
    if (collapsed && !forceExpandForSearch) {
      continue
    }

    for (const child of group.children) {
      rows.push({
        chapter: child,
        depth: 1,
        childrenCount: 0,
      })
    }
  }

  return rows
})

const handleSelectChapter = (chapter: ChapterSummary) => {
  modelChapterId.value = chapter.id
}

const handleRowMainClick = (row: ExplorerRow) => {
  handleSelectChapter(row.chapter)
  if (row.chapter.nodeType === 'directory') {
    emit('open-directory-outline', row.chapter.id)
  }
}

const toggleDirectoryCollapse = (directoryId: string) => {
  if (collapsedDirectoryIds.value.has(directoryId)) {
    collapsedDirectoryIds.value.delete(directoryId)
    return
  }
  collapsedDirectoryIds.value.add(directoryId)
}

const isDirectoryCollapsed = (directoryId: string) => {
  return collapsedDirectoryIds.value.has(directoryId)
}

const handleAction = async (cmd: 'edit' | 'delete', chapter: ChapterSummary) => {
  if (cmd === 'edit') {
    emit('edit-chapter', chapter)
  } else if (cmd === 'delete') {
    try {
      await messageBox.confirm(
        `确定删除章节 "第${chapter.chapterNum}章 ${chapter.title}" 吗？`,
        '危险操作',
        { confirmButtonText: '删除', cancelButtonText: '取消' },
      )
      emit('delete-chapter', chapter.id)
    } catch {
      // 用户取消
    }
  }
}

const formatCount = (n: number) => {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}w`
  return n
}

const fromNow = (date: string) => {
  const time = new Date(date).getTime()
  if (!time) return '未知时间'
  const diff = Date.now() - time
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < minute) return '刚刚'
  if (diff < hour) return `${Math.floor(diff / minute)}分钟前`
  if (diff < day) return `${Math.floor(diff / hour)}小时前`
  return `${Math.floor(diff / day)}天前`
}

const stripDirectoryPrefix = (title: string) =>
  title.replace(/^目录[一二三四五六七八九十百千万0-9]+\s*/u, '').trim()

const getDisplayTitle = (chapter: ChapterSummary) =>
  chapter.nodeType === 'directory' ? stripDirectoryPrefix(chapter.title) : chapter.title

const highlightText = (text: string, keyword: string) => {
  if (!keyword) return sanitizeText(text)
  const escapedText = sanitizeText(text)
  const escapedKeyword = sanitizeText(keyword)
  const reg = new RegExp(`(${escapedKeyword})`, 'gi')
  return escapedText.replace(reg, '<span class="text-highlight">$1</span>')
}

watch(
  () => props.projects,
  (newVal) => {
    if (newVal.length > 0 && !internalProjectId.value) {
      internalProjectId.value = newVal[0].id
    }
  },
  { immediate: true },
)

watch(
  searchKeyword,
  (value) => {
    const query = value.trim()

    if (suggestionTimer) {
      clearTimeout(suggestionTimer)
      suggestionTimer = null
    }

    if (!query) {
      keywordSuggestions.value = []
      isLoadingSuggestions.value = false
      isSuggestionOpen.value = false
      return
    }

    isSuggestionOpen.value = true
    isLoadingSuggestions.value = true

    suggestionTimer = setTimeout(async () => {
      keywordSuggestions.value = await buildKeywordSuggestions(query)
      isLoadingSuggestions.value = false
    }, 150)
  },
)

onMounted(() => {
  document.addEventListener('pointerdown', handlePointerDownOutside)
})

watch(
  () => displayChapters.value,
  (chapters) => {
    const directoryIds = new Set(
      chapters.filter((chapter) => chapter.nodeType === 'directory').map((chapter) => chapter.id),
    )

    collapsedDirectoryIds.value = new Set(
      Array.from(collapsedDirectoryIds.value).filter((id) => directoryIds.has(id)),
    )
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (suggestionTimer) {
    clearTimeout(suggestionTimer)
  }
  document.removeEventListener('pointerdown', handlePointerDownOutside)
})
</script>

<style scoped lang="scss">
.sidebar-container {
  width: 100%;
  min-width: 0;
  height: 100%;
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--editor-bg-base, #fff);
}

.sidebar-header,
.sidebar-search,
.sidebar-actions,
.sidebar-tools,
.explorer-header {
  padding-left: 14px;
  padding-right: 14px;
}

.sidebar-header {
  padding-top: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--editor-border, #ebeff5);
}

.project-bar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.project-title {
  flex: 1;
  min-width: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--editor-text-primary, #111827);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.recent-switch-btn {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 26px;
  padding: 0 6px;
  border: none;
  background: transparent;
  color: var(--editor-text-muted, #6b7280);
  font-size: 12px;
  cursor: pointer;

  &:hover:not(:disabled) {
    color: var(--editor-text-primary, #111827);
  }

  &:disabled {
    opacity: 0.45;
    cursor: default;
  }
}

.sidebar-search {
  padding-top: 12px;
  padding-bottom: 10px;
}

.search-combobox {
  position: relative;
}

.search-input {
  width: 100%;
  min-width: 0;
}

.search-input-icon {
  position: absolute;
  top: 50%;
  left: 10px;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--editor-text-ghost, #94a3b8);
  transform: translateY(-50%);
}

.sidebar-search :deep(.search-input .qy-input-wrapper) {
  width: 100%;
}

.sidebar-search :deep(.search-input input) {
  padding-left: 32px;
  font-size: 13px;
  background: var(--editor-bg-surface, #f8fafc);
}

.keyword-option {
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 100%;
  border: none;
  background: transparent;
  padding: 8px 10px;
  text-align: left;
  cursor: pointer;

  &:hover {
    background: var(--editor-bg-surface, #f8fafc);
  }
}

.keyword-option--status {
  color: var(--editor-text-muted, #6b7280);
  cursor: default;

  &:hover {
    background: transparent;
  }
}

.keyword-option__name {
  font-size: 13px;
  color: var(--editor-text-primary, #111827);
}

.keyword-option__meta {
  font-size: 11px;
  color: var(--editor-text-muted, #6b7280);
}

.search-suggestion-panel {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 20;
  overflow: hidden;
  border: 1px solid var(--editor-border, #e2e8f0);
  border-radius: 12px;
  background: color-mix(in srgb, var(--editor-bg-base, #ffffff) 96%, transparent);
  box-shadow: var(--editor-shadow-lg, 0 18px 38px -24px rgba(15, 23, 42, 0.45));
  backdrop-filter: blur(12px);
}

.sidebar-actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 10px;
}

.action-icon-btn {
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--editor-border, #d9dee6);
  border-radius: 4px;
  background: var(--editor-bg-base, #fff);
  color: var(--editor-text-secondary, #4b5563);
  cursor: pointer;
  transition:
    background-color 0.14s ease,
    border-color 0.14s ease,
    color 0.14s ease;

  &:hover {
    background: var(--editor-bg-surface, #f8fafc);
    color: var(--editor-text-primary, #111827);
  }

  &--primary {
    background: var(--editor-accent, #2f6feb);
    border-color: var(--editor-accent, #2f6feb);
    color: var(--editor-text-inverse, #fff);

    &:hover {
      background: var(--editor-accent-hover, #255fd1);
      border-color: var(--editor-accent-hover, #255fd1);
      color: var(--editor-text-inverse, #fff);
    }
  }
}

.sidebar-tools {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-bottom: 10px;
}

.sidebar-tools__hint {
  min-width: 0;
  color: var(--editor-text-ghost, #9ca3af);
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tool-icon-btn {
  width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--editor-text-muted, #6b7280);
  cursor: pointer;

  &:hover {
    background: var(--editor-bg-elevated, #f3f4f6);
    color: var(--editor-text-primary, #111827);
  }

  &.is-active {
    background: var(--editor-accent-soft, #eaf2ff);
    color: var(--editor-accent, #1d4ed8);
  }
}

.tool-icons {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.explorer-header {
  min-height: 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid var(--editor-border, #ebeff5);
  border-bottom: 1px solid var(--editor-border, #ebeff5);
  color: var(--editor-text-secondary, #4b5563);
}

.explorer-title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
}

.section-count,
.explorer-caption {
  color: var(--editor-text-ghost, #9ca3af);
  font-size: 11px;
}

.tree-chevron {
  transition: transform 0.18s ease;

  &.expanded {
    transform: rotate(90deg);
  }
}

.sidebar-list {
  flex: 1;
  overflow-y: auto;
  padding: 6px;
  background: var(--editor-bg-base, #fff);

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(148, 163, 184, 0.35);
    border-radius: 999px;
  }
}

.chapter-item {
  position: relative;
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  margin-bottom: 1px;
  border-left: 2px solid transparent;
  border-radius: 4px;
  background: transparent;
  transition: background-color 0.14s ease;
  margin-left: calc(var(--tree-depth, 0) * 14px);

  &:hover {
    background: var(--editor-bg-surface, #f5f7fb);
    border-left-color: var(--editor-border-light, #d1d5db);

    .item-actions {
      opacity: 1;
    }
  }

  &.is-active {
    background: var(--editor-accent-soft, #eaf2ff);
    border-left-color: var(--editor-accent, #2563eb);

    .item-title {
      color: var(--editor-accent, #1d4ed8);
      font-weight: 700;
    }
  }

  &.is-directory {
    background: color-mix(in srgb, var(--color-warning-50, #fff8e8) 88%, transparent);
    border-left-color: var(--color-warning-400, #d4a72c);

    .item-title {
      color: var(--color-warning-700, #8a5a00);
      font-weight: 700;
    }

    .item-file-icon {
      color: var(--color-warning-500, #c0841a);
    }
  }
}

.chapter-main-zone {
  min-width: 0;
  flex: 1;
  min-height: 32px;
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 5px 6px;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.item-file-icon {
  margin-top: 2px;
  color: var(--editor-text-muted, #6b7280);
  flex-shrink: 0;
}

.item-content {
  min-width: 0;
  flex: 1;
}

.item-title {
  margin-bottom: 2px;
  color: var(--editor-text-primary, #111827);
  font-size: 13px;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chapter-index,
.item-meta {
  color: var(--editor-text-ghost, #9ca3af);
}

.item-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
}

.item-meta--directory {
  color: var(--color-warning-700, #8a5a00);
}

.dot {
  opacity: 0.7;
}

.directory-collapse-zone {
  align-self: center;
  margin-left: 2px;
}

.directory-triangle {
  transition: transform 0.16s ease;

  &.is-collapsed {
    transform: rotate(0deg);
  }
}

.item-actions {
  opacity: 0.15;
  align-self: center;
  margin-left: 2px;
  transition: opacity 0.14s ease;
}

.action-menu-btn {
  width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  color: var(--editor-text-secondary, #4b5563);
}

.list-empty {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px 12px;
  color: var(--editor-text-muted, #6b7280);
  font-size: 12px;

  strong {
    color: var(--editor-text-primary, #111827);
    font-size: 13px;
  }

  span {
    line-height: 1.5;
  }
}

.list-empty__actions {
  display: inline-flex;
  gap: 8px;
  margin-top: 4px;
}

.list-empty__btn {
  height: 26px;
  padding: 0 8px;
  border: 1px solid var(--editor-border, #d9dee6);
  border-radius: 4px;
  background: var(--editor-bg-base, #fff);
  color: var(--editor-text-secondary, #374151);
  font-size: 12px;
  cursor: pointer;

  &--primary {
    color: var(--editor-accent, #2f6feb);
    border-color: var(--editor-accent-soft-border, #bfdbfe);
    background: var(--editor-accent-soft, #eff6ff);
  }
}

:deep(.text-highlight) {
  color: var(--editor-accent, #2563eb);
  font-weight: 700;
}
</style>
