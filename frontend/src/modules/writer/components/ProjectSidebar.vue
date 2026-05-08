<template>
  <div class="sidebar-container chapter-list" data-testid="chapter-list">
    <!-- 1. 顶部区域：单行标题 + 最近项目快速切换 -->
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

    <!-- 2. 工具栏：搜索 -->
    <div class="sidebar-toolbar">
      <el-autocomplete
        v-model="searchKeyword"
        :fetch-suggestions="fetchKeywordSuggestions"
        placeholder="搜索章节/角色/地点..."
        clearable
        class="search-input"
        @select="handleSuggestionSelect"
      >
        <template #prefix><QyIcon name="Search" :size="14" /></template>
        <template #default="{ item }">
          <div class="keyword-option">
            <span class="keyword-option__name">{{ item.value }}</span>
            <span class="keyword-option__meta"
              >{{ item.typeLabel }} · {{ item.matchModeLabel }}</span
            >
          </div>
        </template>
      </el-autocomplete>
    </div>

    <!-- 4. VSCode风格目录树 -->
    <div class="explorer-header" @click="isTreeExpanded = !isTreeExpanded">
      <div class="explorer-title">
        <QyIcon name="ArrowRight" :size="14" :class="chevronClass" />
        <span>目录</span>
        <span class="section-count">{{ displayChapters.length }}</span>
      </div>
      <div class="explorer-actions" @click.stop>
        <button
          class="explorer-action-btn explorer-action-btn--primary"
          title="新增文档"
          data-testid="add-document-button"
          @click="$emit('add-doc')"
        >
          <QyIcon name="Plus" :size="12" style="margin-right: 2px" />
          添加
        </button>
      </div>
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
              <!-- 搜索高亮处理 -->
              <span v-safe-html="highlightText(getDisplayTitle(row.chapter), searchKeyword)"></span>
            </div>

            <div class="item-meta" v-if="row.chapter.nodeType !== 'directory'">
              <span>{{ formatCount(row.chapter.wordCount) }}字</span>
              <span class="dot">·</span>
              <span>{{ fromNow(row.chapter.updatedAt) }}</span>
            </div>
            <div class="item-meta item-meta--directory" v-else>
              <span>{{ row.childrenCount }} 个章节 · 点击左侧查看细纲</span>
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

        <!-- 操作菜单 -->
        <div class="item-actions" @click.stop>
          <QyDropdown
            :items="chapterActionItems"
            @select="(cmd: string) => handleAction(cmd as 'edit' | 'delete', row.chapter)"
          >
            <div class="action-btn">
              <QyIcon name="MoreFilled" :size="14" />
            </div>
          </QyDropdown>
        </div>
      </div>

      <!-- 空状态 -->
      <Empty v-if="visibleRows.length === 0" description="暂无章节" size="sm" class="list-empty" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { QyGhostButton, QyIcon, QyDropdown } from '@/design-system/components'
import { Empty } from '@/design-system/base'
import type { DropdownItem } from '@/design-system/components'
import { messageBox } from '@/design-system/services'
import { useWriterStore } from '@/modules/writer/stores/writerStore'
import { sanitizeText } from '@/utils/sanitize'

// 定义类型 (建议从 types/project.ts 引入)
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
  projectId?: string // v-model:projectId
  chapterId?: string // v-model:chapterId
}

const props = withDefaults(defineProps<Props>(), {
  projects: () => [],
  chapters: () => [],
})

const emit = defineEmits<{
  'update:projectId': [id: string]
  'update:chapterId': [id: string]
  'add-doc': []
  'open-directory-outline': [id: string]
  'edit-chapter': [chapter: ChapterSummary]
  'delete-chapter': [id: string]
}>()

// 状态
const searchKeyword = ref('')
const isTreeExpanded = ref(true)
const writerStore = useWriterStore()
const collapsedDirectoryIds = ref<Set<string>>(new Set())
let suggestionTimer: ReturnType<typeof setTimeout> | null = null
const chevronClass = computed(() =>
  isTreeExpanded.value ? 'tree-chevron expanded' : 'tree-chevron',
)

// 双向绑定代理
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

// 项目切换菜单项
const projectSwitchItems = computed<DropdownItem[]>(() =>
  recentProjects.value.map((p) => ({
    key: p.id,
    label: p.title,
    disabled: p.id === internalProjectId.value,
  })),
)

// 章节操作菜单项
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

const fetchKeywordSuggestions = async (
  queryString: string,
  cb: (items: KeywordSuggestion[]) => void,
) => {
  const query = queryString.trim()
  if (!query) {
    cb([])
    return
  }

  if (suggestionTimer) {
    clearTimeout(suggestionTimer)
  }

  suggestionTimer = setTimeout(async () => {
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
    cb(Array.from(dedup.values()).slice(0, 12))
  }, 150)
}

const handleSuggestionSelect = (item: KeywordSuggestion) => {
  searchKeyword.value = item.value
  if (!item.id) {
    return
  }

  const target = displayChapters.value.find((chapter) => chapter.id === item.id)
  if (target) {
    handleSelectChapter(target)
  }
}

// 章节列表逻辑（筛选项目 + 排序，不含目录折叠）
const displayChapters = computed(() => {
  // 1. 筛选项目
  let list = props.chapters.filter((c) => c.projectId === internalProjectId.value)

  // 2. 搜索过滤
  if (searchKeyword.value.trim()) {
    const k = searchKeyword.value.toLowerCase()
    list = list.filter(
      (c) => c.title.toLowerCase().includes(k) || c.chapterNum.toString().includes(k),
    )
  }

  // 3. 排序：优先 sortOrder，再回退 chapterNum
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

// 操作处理
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
      // 用户取消删除操作，无需处理
    }
  }
}

// 工具函数
const formatCount = (n: number) => {
  if (n >= 10000) return (n / 10000).toFixed(1) + 'w'
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
  // 先转义HTML特殊字符，防止XSS攻击
  const escapedText = sanitizeText(text)
  const escapedKeyword = sanitizeText(keyword)
  const reg = new RegExp(`(${escapedKeyword})`, 'gi')
  return escapedText.replace(reg, '<span class="text-highlight">$1</span>')
}

// 自动选择第一个项目
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
  background: transparent;
  transition: width 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
  position: relative;
}

// 1. 头部
.sidebar-header {
  padding: 10px 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  background: transparent;

  .project-bar {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .project-title {
    flex: 1;
    min-width: 0;
    display: block;
    font-size: 16px;
    font-weight: 700;
    color: #0f172a;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .recent-switch-btn {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 6px;
    height: 30px;
    padding: 0 10px;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    background: #ffffff;
    color: #334155;
    font-size: 12px;
    cursor: pointer;

    &:hover:not(:disabled) {
      border-color: #93c5fd;
      background: #eff6ff;
      color: #1d4ed8;
    }

    &:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }
  }

  .recent-switch-caret {
    opacity: 0.85;
  }
}

:deep(.keyword-option) {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

:deep(.keyword-option__name) {
  font-size: 13px;
  color: #0f172a;
  line-height: 1.3;
}

:deep(.keyword-option__meta) {
  font-size: 11px;
  color: #64748b;
  line-height: 1.2;
}

// 2. 工具栏
.sidebar-toolbar {
  padding: 10px 12px;
  display: flex;
  gap: 8px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  background: transparent;

  .search-input {
    flex: 1;
    min-width: 0;
  }
}

// 图谱模式：顶部全局图谱入口
.graph-mode-header {
  padding: 8px 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  background: transparent;
}

.graph-entry {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #e2e8f0;

  &:hover {
    background: #f5f7fa;
    border-color: #93c5fd;
  }

  &.active {
    background: #eff6ff;
    border-color: #60a5fa;
    border-left: 3px solid #2563eb;
  }

  .graph-entry-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    margin-right: 10px;
    flex-shrink: 0;
  }

  .graph-entry-name {
    flex: 1;
    font-size: 14px;
    font-weight: 500;
    color: #0f172a;
  }
}

.sidebar-toolbar :deep(.el-input__wrapper) {
  min-width: 0;
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
}

.sidebar-toolbar :deep(.el-input__prefix) {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
}

.sidebar-toolbar :deep(.el-input__prefix-inner) {
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
}

.sidebar-toolbar :deep(.el-input__inner) {
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

// 3. 目录树
.explorer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  border-top: 1px solid rgba(0, 0, 0, 0.04);
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  background: transparent;
}

.explorer-title {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 700;
  color: #334155;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.tree-chevron {
  transition: transform 0.18s ease;

  &.expanded {
    transform: rotate(90deg);
  }
}

.explorer-actions {
  display: inline-flex;
  gap: 6px;
}

.explorer-action-btn {
  height: 24px;
  padding: 0 8px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: #f8fafc;
  color: #334155;
  font-size: 11px;
  cursor: pointer;

  &:hover {
    border-color: #94a3b8;
    background: #f1f5f9;
  }
}

.explorer-action-btn--primary {
  border-color: #93c5fd;
  background: #eff6ff;
  color: #1d4ed8;

  &:hover {
    border-color: #60a5fa;
    background: #dbeafe;
  }
}

.sidebar-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 8px 10px;
  background: transparent;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.08);
    border-radius: 999px;
  }

  .chapter-item {
    position: relative;
    padding: 4px;
    margin-bottom: 6px;
    transition: all 0.16s ease;
    border: 1px solid #e2e8f0;
    border-left: 2px solid #cbd5e1;
    border-radius: 10px;
    background: #ffffff;
    display: flex;
    justify-content: space-between;
    align-items: stretch;
    box-shadow: none;
    margin-left: calc(var(--tree-depth, 0) * 16px);

    &:hover {
      border-color: #93c5fd;
      border-left-color: #60a5fa;
      background: #f8fbff;

      .item-actions {
        opacity: 1;
      }
    }

    &.is-active {
      background: #eff6ff;
      border-color: #93c5fd;
      border-left-color: #2563eb;
      box-shadow: inset 0 0 0 1px rgba(59, 130, 246, 0.08);

      .item-title {
        color: #1d4ed8;
        font-weight: 600;
      }
    }

    .chapter-main-zone {
      border: none;
      background: transparent;
      flex: 1;
      min-width: 0;
      display: flex;
      align-items: flex-start;
      text-align: left;
      border-radius: 8px;
      padding: 6px 8px;
      color: inherit;
      cursor: pointer;
      transition: background-color 0.16s ease;
      min-height: 36px;

      &:hover {
        background: rgba(148, 163, 184, 0.12);
      }
    }

    .item-file-icon {
      margin-right: 8px;
      margin-top: 2px;
      color: #64748b;
      flex-shrink: 0;
    }

    .item-content {
      flex: 1;
      overflow: hidden;
      min-width: 0;
    }

    .item-title {
      font-size: 13px;
      color: #0f172a;
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;

      .chapter-index {
        margin-right: 4px;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        color: #64748b;
      }
    }

    .item-meta {
      font-size: 11px;
      color: #64748b;
      display: flex;
      align-items: center;
      min-width: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;

      .dot {
        margin: 0 4px;
        flex-shrink: 0;
      }

      span {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      &.item-meta--directory {
        color: #b45309;
      }
    }

    .item-actions {
      opacity: 0.45;
      transition: opacity 0.2s;
      margin-left: 6px;
      align-self: center;

      .action-btn {
        padding: 4px;
        border-radius: 8px;
        color: #64748b;

        &:hover {
          background-color: #dbeafe;
          color: #1d4ed8;
        }
      }
    }

    &:hover .item-actions,
    &.is-active .item-actions {
      opacity: 1;
    }

    &.is-directory {
      border-left-color: #f59e0b;
      background: #fffaf0;

      .item-title {
        color: #92400e;
        font-weight: 700;
      }

      .item-file-icon {
        color: #d97706;
      }
    }

    &.is-child {
      border-left-color: #bfdbfe;
      background: #fbfdff;
      margin-left: 14px;
    }
  }
}

.directory-collapse-zone {
  width: 44px;
  min-width: 44px;
  height: auto;
  margin-left: 6px;
  align-self: stretch;
  flex-shrink: 0;
  border-radius: 8px;
}

.directory-triangle {
  width: 12px;
  height: 12px;
  color: #64748b;
  transform: rotate(90deg);
  transition: transform 0.16s ease;
  flex-shrink: 0;
}

.directory-triangle.is-collapsed {
  transform: rotate(0deg);
}

.section-count {
  min-width: 20px;
  height: 18px;
  padding: 0 6px;
  border-radius: 999px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  color: #64748b;
  font-size: 11px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

// 搜索高亮样式 (通过 v-html 插入)
:deep(.text-highlight) {
  color: #1d4ed8;
  font-weight: bold;
  background-color: #fef3c7;
}
</style>
