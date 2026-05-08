<template>
  <div
    class="editor-panel"
    :class="{
      'editor-panel--center': true,
      'full-width': !leftPanelWidth && !rightPanelWidth,
      'is-mobile': isMobile,
      'is-tablet': isTablet,
      'is-desktop': isDesktop,
      'focus-mode': isFocusMode,
      'preview-mode': showPreview,
    }"
    :style="panelStyle"
  >
    <div class="editor-toolbar" v-if="!isFocusMode">
      <div class="toolbar-left">
        <div class="breadcrumb">
          <span class="breadcrumb-item">{{ projectName || '未命名项目' }}</span>
          <span class="breadcrumb-separator">/</span>
          <span class="breadcrumb-item current">{{ chapterTitle || '新章节' }}</span>
        </div>
      </div>

      <div class="toolbar-center">
        <EditorToolbar
          :show-preview="showPreview"
          @command="handleToolbarCommand"
          @togglePreview="emit('togglePreview')"
        />
      </div>

      <div class="toolbar-right">
        <button
          class="toolbar-button"
          data-action="save"
          :aria-label="t('editor.save', '保存 (Ctrl+S)')"
          :title="t('editor.save', '保存 (Ctrl+S)')"
          @click="handleSave"
        >
          <QyIcon name="Check" />
        </button>

        <button
          class="toolbar-button"
          :aria-label="t('editor.aiAssistant', 'AI助手 (Ctrl+Shift+A)')"
          :title="t('editor.aiAssistant', 'AI助手 (Ctrl+Shift+A)')"
          @click="handleAIAssistant"
        >
          <QyIcon name="MagicStick" />
        </button>

        <button
          class="toolbar-button"
          :aria-label="t('editor.focusMode', '专注模式 (F11)')"
          :title="t('editor.focusMode', '专注模式 (F11)')"
          @click="toggleFocusMode"
        >
          <QyIcon :name="isFocusMode ? 'FullScreen' : 'View'" />
        </button>
      </div>
    </div>

    <div class="editor-main" :style="editorStyle">
      <!-- 横向大纲导航 -->
      <FishboneNav
        v-if="!isFocusMode && showFishbone"
        :volumes="volumesData"
        :current-volume-id="currentVolumeId"
        :current-chapter-id="currentChapterId"
        @volume-click="handleVolumeClick"
        @chapter-click="handleChapterClick"
      />

      <!-- 角色关系图谱已移除，使用全屏工具面板 (Ctrl+G) -->

      <section v-if="isBoardMode && !isFocusMode" class="story-board">
        <div class="story-board__grid">
          <article
            v-for="item in boardItems"
            :key="item.id"
            class="board-card"
            :class="{ 'board-card--active': item.isActive }"
          >
            <header class="board-card__header">
              <h3>{{ item.title }}</h3>
              <span>{{ item.words }} words</span>
            </header>
            <div class="board-card__body">
              <p>{{ item.summary }}</p>
            </div>
          </article>
        </div>
      </section>

      <div v-else class="editor-workspace" :class="{ 'editor-workspace--focus': isFocusMode }">
        <section class="editor-writing-card" :class="{ 'dual-view': showPreview }">
          <section class="editor-pane editor-pane--editor">
            <header class="section-title">场景正文</header>
            <div
              class="editor-content"
              role="textbox"
              :aria-label="t('editor.contentArea', '编辑器内容区域')"
              tabindex="0"
              :contenteditable="!readonly"
              @input="handleContentChange"
              @keydown="handleKeyDown"
              @mouseup="handleEditorSelectionChange"
              @keyup="handleEditorSelectionChange"
              @contextmenu="handleContextMenu"
              ref="editorContentRef"
            >
              {{ editorText }}
            </div>
            <button
              v-if="selectionAddButton.visible"
              class="selection-add-btn"
              :style="selectionAddButtonStyle"
              @mousedown.prevent
              @click.stop="handleAddSelectionToChat"
            >
              添加到对话
            </button>
          </section>

          <section
            v-if="showPreview"
            class="editor-pane editor-pane--preview preview-pane markdown-body"
          >
            <header class="section-title">预览</header>
            <div class="preview-content" v-safe-html="renderedContent"></div>
          </section>
        </section>
      </div>
    </div>

    <div class="timeline-panel" v-if="showTimeline && !isFocusMode">
      <TimelineBar v-if="timelineId" :timeline-id="timelineId" />
    </div>

    <div class="editor-statusbar" v-if="!isFocusMode">
      <div class="statusbar-left">
        <span class="word-count"> {{ t('editor.wordCount', '字数') }}: {{ wordCount }} </span>

        <span class="read-time"> {{ t('editor.readTime', '阅读时间') }}: {{ readTime }} </span>

        <span class="save-status" :class="saveStatusClass">
          {{ saveStatusText }}
        </span>
      </div>

      <div class="statusbar-right">
        <span class="quick-overview"> 总字数 {{ wordCount }} · 阅读 {{ readTime }} </span>
        <span class="cursor-position">
          {{ t('editor.line', '行') }} {{ cursorPosition.line }} : {{ cursorPosition.column }}
        </span>
        <button class="statusbar-action" @click="handleSave">保存</button>
        <button class="statusbar-action" @click="emit('togglePreview')">预览</button>
        <button class="statusbar-action" @click="handleAIAssistant">AI</button>
        <span class="encoding">UTF-8</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import QyIcon from '@/design-system/components/basic/QyIcon/QyIcon.vue'
import { debounce } from '@/utils/performance'
import { useI18n } from '@/composables/useI18n'
import { useBreakpoints } from '@/composables/useBreakpoints'
import EditorToolbar from '@/modules/writer/components/EditorToolbar.vue'
import TimelineBar from '@/modules/writer/components/TimelineBar.vue'
import FishboneNav from './FishboneNav.vue'
import { renderMarkdown } from '@/modules/writer/utils/markdown'
import { calculateWordCount } from '@/modules/writer/utils/editor'

interface Props {
  content?: string
  projectName?: string
  chapterTitle?: string
  activeTool?: string
  readonly?: boolean
  leftPanelWidth?: number
  rightPanelWidth?: number
  showPreview?: boolean
  showTimeline?: boolean
  timelineId?: string
  showFishbone?: boolean
  volumes?: Array<{
    id: string
    title: string
    wordCount: number
    status: 'done' | 'active' | 'pending'
    chapters: Array<{
      id: string
      title: string
      wordCount: number
      status: 'done' | 'active' | 'pending'
    }>
  }>
  currentVolumeId?: string
  currentChapterId?: string
  characters?: Array<{
    id: string
    name: string
    avatar?: string
    importance?: number
  }>
  characterRelations?: Array<{
    source: string
    target: string
    type: string
    strength: number
  }>
}

interface Emits {
  (e: 'update:content', _value: string): void
  (e: 'save'): void
  (e: 'undo'): void
  (e: 'redo'): void
  (e: 'aiAssistant'): void
  (e: 'togglePreview'): void
  (e: 'formatCommand', _command: string): void
  (e: 'contextmenu', _event: MouseEvent, _selectedText: string): void
  (e: 'addToAIContext', _selectedText: string): void
  (e: 'volumeClick', _volumeId: string): void
  (e: 'chapterClick', _chapterId: string): void
}

const props = withDefaults(defineProps<Props>(), {
  content: '',
  projectName: '',
  chapterTitle: '',
  activeTool: 'writing',
  readonly: false,
  leftPanelWidth: 280,
  rightPanelWidth: 320,
  showPreview: false,
  showTimeline: false,
  timelineId: '',
  showFishbone: true,
  volumes: () => [],
  currentVolumeId: '',
  currentChapterId: '',
  characters: () => [],
  characterRelations: () => [],
})

const emit = defineEmits<Emits>()
const { t } = useI18n()

const editorContentRef = ref<HTMLDivElement>()
const isFocusMode = ref(false)
const saveStatus = ref<'saved' | 'saving' | 'unsaved'>('saved')
const cursorPosition = ref({ line: 1, column: 1 })
const selectionAddButton = ref({
  visible: false,
  text: '',
  top: 0,
  left: 0,
})

const selectionAddButtonStyle = computed(() => ({
  top: `${selectionAddButton.value.top}px`,
  left: `${selectionAddButton.value.left}px`,
}))

const breakpoints = useBreakpoints({
  mobile: 768,
  tablet: 1024,
  desktop: 1200,
})

const isMobile = breakpoints.smaller('mobile')
const isTablet = breakpoints.between('mobile', 'desktop')
const isDesktop = breakpoints.greaterOrEqual('desktop')

const editorText = computed(() => {
  if (!props.content) return ''
  return props.content
})

const panelStyle = computed(() => ({}))

const wordCount = computed(() => {
  return calculateWordCount(props.content)
})

const readTime = computed(() => {
  const wordsPerMinute = 500
  const minutes = Math.ceil(wordCount.value / wordsPerMinute)
  return minutes > 0
    ? `${minutes} ${t('editor.minutes', '分钟')}`
    : `0 ${t('editor.minutes', '分钟')}`
})

const renderedContent = computed(() => {
  return renderMarkdown(props.content)
})

const isBoardMode = computed(() => props.activeTool === 'outline')

// 大纲导航数据
const volumesData = computed(() => props.volumes || [])

function handleVolumeClick(volume: { id: string }) {
  emit('volumeClick', volume.id)
}

function handleChapterClick(chapter: { id: string }) {
  emit('chapterClick', chapter.id)
}

const boardItems = computed(() => {
  const summary = (props.content || '').trim().replace(/\s+/g, ' ')
  const shortSummary = summary.length > 120 ? `${summary.slice(0, 120)}...` : summary
  const chapterName = props.chapterTitle || '第1章'

  return [
    {
      id: 'current',
      title: chapterName,
      words: wordCount.value,
      summary: shortSummary || '输入场景摘要...',
      isActive: true,
    },
    {
      id: 'next',
      title: '第2章',
      words: 0,
      summary: '输入场景摘要...',
      isActive: false,
    },
    {
      id: 'new',
      title: '新章节',
      words: 0,
      summary: '输入场景摘要...',
      isActive: false,
    },
  ]
})

const saveStatusText = computed(() => {
  switch (saveStatus.value) {
    case 'saved':
      return t('editor.saved', '已保存')
    case 'saving':
      return t('editor.saving', '保存中...')
    case 'unsaved':
      return t('editor.unsaved', '未保存')
    default:
      return ''
  }
})

const saveStatusClass = computed(() => {
  return `save-status--${saveStatus.value}`
})

const editorStyle = computed(() => ({
  minWidth: '400px',
  minHeight: 0,
  height: '100%',
}))

const debouncedUpdate = debounce((newContent: string) => {
  emit('update:content', newContent)
  saveStatus.value = 'unsaved'
}, 300)

const handleContentChange = (event: Event) => {
  const target = event.target as HTMLDivElement
  const newContent = target.textContent || ''
  debouncedUpdate(newContent)
}

const handleKeyDown = (event: KeyboardEvent) => {
  updateCursorPosition()

  if (event.ctrlKey || event.metaKey) {
    switch (event.key.toLowerCase()) {
      case 's':
        event.preventDefault()
        handleSave()
        break
      case 'z':
        event.preventDefault()
        emit('undo')
        break
      case 'y':
        event.preventDefault()
        emit('redo')
        break
      default:
        break
    }
  }

  if (event.key === 'Tab') {
    event.preventDefault()
    insertText('  ')
  }

  if (event.key === 'F11') {
    event.preventDefault()
    toggleFocusMode()
  }
}

const insertText = (text: string) => {
  if (!editorContentRef.value) return

  const selection = window.getSelection()
  if (!selection || !selection.rangeCount) return

  const range = selection.getRangeAt(0)
  const textNode = document.createTextNode(text)
  range.insertNode(textNode)
  range.setStartAfter(textNode)
  range.collapse(true)
  selection.removeAllRanges()
  selection.addRange(range)

  handleContentChange({ target: editorContentRef.value } as unknown as Event)
}

const updateCursorPosition = () => {
  if (!editorContentRef.value) return

  const selection = window.getSelection()
  if (!selection || !selection.rangeCount) return

  const range = selection.getRangeAt(0)
  const preCaretRange = range.cloneRange()
  preCaretRange.selectNodeContents(editorContentRef.value)
  preCaretRange.setEnd(range.endContainer, range.endOffset)
  const text = preCaretRange.toString()
  const lines = text.split('\n')

  cursorPosition.value = {
    line: lines.length,
    column: lines[lines.length - 1].length + 1,
  }
}

const handleContextMenu = (event: MouseEvent) => {
  const selection = window.getSelection()
  const selectedText = selection?.toString() || ''
  if (selectedText) {
    emit('contextmenu', event, selectedText)
  }
}

const handleEditorSelectionChange = () => {
  window.setTimeout(() => {
    updateSelectionAddButton()
  }, 0)
}

const hideSelectionAddButton = () => {
  selectionAddButton.value.visible = false
}

const updateSelectionAddButton = () => {
  const selection = window.getSelection()
  const editorEl = editorContentRef.value
  if (!selection || !editorEl || selection.rangeCount === 0 || selection.isCollapsed) {
    hideSelectionAddButton()
    return
  }

  const range = selection.getRangeAt(0)
  const targetNode = range.commonAncestorContainer
  if (!editorEl.contains(targetNode)) {
    hideSelectionAddButton()
    return
  }

  const selectedText = selection.toString().trim()
  if (!selectedText) {
    hideSelectionAddButton()
    return
  }

  const rect = range.getBoundingClientRect()
  if (!rect.width && !rect.height) {
    hideSelectionAddButton()
    return
  }

  const buttonTop = Math.max(8, rect.top - 34)
  const buttonLeft = Math.min(window.innerWidth - 132, Math.max(8, rect.right - 124))
  selectionAddButton.value = {
    visible: true,
    text: selectedText,
    top: buttonTop,
    left: buttonLeft,
  }
}

const handleAddSelectionToChat = () => {
  const selectedText = selectionAddButton.value.text.trim()
  if (!selectedText) return
  emit('addToAIContext', selectedText)
  hideSelectionAddButton()
}

const handleToolbarCommand = (cmd: string) => {
  emit('formatCommand', cmd)
}

const handleSave = () => {
  saveStatus.value = 'saving'
  emit('save')

  setTimeout(() => {
    saveStatus.value = 'saved'
  }, 500)
}

const handleAIAssistant = () => {
  emit('aiAssistant')
}

const toggleFocusMode = () => {
  isFocusMode.value = !isFocusMode.value
}

onMounted(() => {
  document.addEventListener('selectionchange', updateSelectionAddButton)
  window.addEventListener('resize', updateSelectionAddButton)
  window.addEventListener('scroll', updateSelectionAddButton, true)
  editorContentRef.value?.addEventListener('scroll', updateSelectionAddButton)
})

onBeforeUnmount(() => {
  if (saveStatus.value === 'unsaved') {
    handleSave()
  }
  document.removeEventListener('selectionchange', updateSelectionAddButton)
  window.removeEventListener('resize', updateSelectionAddButton)
  window.removeEventListener('scroll', updateSelectionAddButton, true)
  editorContentRef.value?.removeEventListener('scroll', updateSelectionAddButton)
})

watch(
  () => props.content,
  () => {
    if (props.content) {
      saveStatus.value = 'unsaved'
    }
  },
)

watch(
  () => props.content,
  (newContent) => {
    if (editorContentRef.value && editorContentRef.value.textContent !== newContent) {
      const selection = window.getSelection()
      const hasSelection = !!selection && selection.rangeCount > 0
      const range = hasSelection ? selection!.getRangeAt(0) : null
      const selectionInEditor = !!range && editorContentRef.value.contains(range.startContainer)
      const offset = selectionInEditor
        ? startOffsetInNode(editorContentRef.value, range!.startContainer, range!.startOffset)
        : 0

      editorContentRef.value.textContent = newContent || ''

      if (selectionInEditor && selection) {
        const newRange = document.createRange()
        const { node, offset: newOffset } = restoreCaretPosition(editorContentRef.value, offset)
        newRange.setStart(node, newOffset)
        newRange.collapse(true)
        selection.removeAllRanges()
        selection.addRange(newRange)
      }
    }
    hideSelectionAddButton()
  },
)

watch(
  () => props.showPreview,
  () => {},
)

watch(
  () => props.showTimeline,
  () => {},
)

watch(
  () => props.timelineId,
  () => {},
)

function startOffsetInNode(container: Node, node: Node, offset: number): number {
  const range = document.createRange()
  range.selectNodeContents(container)
  try {
    range.setEnd(node, offset)
    return range.toString().length
  } catch {
    return container.textContent?.length || 0
  }
}

function restoreCaretPosition(
  container: Node,
  targetOffset: number,
): { node: Node; offset: number } {
  const textNodes: Text[] = []
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT)
  let current = walker.nextNode()
  while (current) {
    textNodes.push(current as Text)
    current = walker.nextNode()
  }

  if (textNodes.length === 0) {
    const maxOffset = container.childNodes.length
    return { node: container, offset: Math.max(0, Math.min(targetOffset, maxOffset)) }
  }

  let currentOffset = 0
  for (const textNode of textNodes) {
    const nodeLength = textNode.textContent?.length || 0
    if (currentOffset + nodeLength >= targetOffset) {
      return {
        node: textNode,
        offset: Math.max(0, Math.min(targetOffset - currentOffset, nodeLength)),
      }
    }
    currentOffset += nodeLength
  }

  const lastNode = textNodes[textNodes.length - 1]
  return { node: lastNode, offset: lastNode.textContent?.length || 0 }
}
</script>

<style scoped lang="scss">
.editor-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  height: 100%;
  background: #f8fafc;
  color: #0f172a;
  overflow: hidden;
  border-radius: 12px;
}

.editor-toolbar {
  height: 52px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 12px;
  border-bottom: 1px solid #e2e8f0;
  background: #ffffff;

  .toolbar-left {
    min-width: 0;

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #64748b;
      font-size: 12px;

      .breadcrumb-item.current {
        color: #0f172a;
        font-weight: 600;
      }
    }
  }

  .toolbar-center {
    flex: 1;
    min-width: 0;
    display: flex;
    justify-content: center;
  }

  .toolbar-right {
    display: flex;
    gap: 6px;

    .toolbar-button {
      width: 32px;
      height: 32px;
      border: 1px solid #dbe3ef;
      border-radius: 8px;
      background: #fff;
      color: #475569;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.16s ease;

      &:hover {
        border-color: #93c5fd;
        background: #eff6ff;
        color: #1d4ed8;
      }

      &--active {
        border-color: #c9a962;
        background: linear-gradient(135deg, #c9a962 0%, #e8b54a 100%);
        color: #fff;
        
        &:hover {
          background: linear-gradient(135deg, #e8b54a 0%, #c9a962 100%);
        }
      }
    }
  }
}

.editor-main {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  padding: 14px;
}

.editor-workspace {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 12px;
  flex: 1;
  min-height: 0;
}

.editor-workspace--focus {
  grid-template-columns: minmax(0, 1fr);
}

.story-board {
  flex: 1;
  min-height: 0;
  overflow: auto;
  border: 1px solid #dbe3ef;
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
  padding: 14px;
}

.story-board__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.board-card {
  border: 1px solid #dbe3ef;
  border-radius: 12px;
  background: #f8fafc;
  display: grid;
  grid-template-rows: auto 1fr auto;
  min-height: 220px;
  transition: all 0.16s ease;
}

.board-card--active {
  border-color: #93c5fd;
  background: #eff6ff;
  box-shadow: 0 6px 18px rgba(37, 99, 235, 0.15);
}

.board-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e2e8f0;
  padding: 10px 12px;
}

.board-card__header h3 {
  margin: 0;
  font-size: 14px;
  color: #0f172a;
  font-weight: 700;
}

.board-card__header span {
  color: #64748b;
  font-size: 12px;
}

.board-card__body {
  padding: 12px;
}

.board-card__body p {
  margin: 0;
  font-size: 14px;
  line-height: 1.8;
  color: #334155;
}

.editor-writing-card {
  min-height: 0;
  height: 100%;
  background: #ffffff;
  border: 1px solid #dbe3ef;
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
  display: grid;
  grid-template-columns: 1fr;
  overflow: hidden;

  &.dual-view {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }

  .section-title {
    margin: 0;
    padding: 8px 12px;
    font-size: 12px;
    font-weight: 700;
    color: #334155;
    border-bottom: 1px solid #e2e8f0;
    background: #f8fafc;
  }
}

.editor-pane {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.selection-add-btn {
  position: fixed;
  z-index: 1200;
  height: 28px;
  padding: 0 10px;
  border: 1px solid #93c5fd;
  border-radius: 8px;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(37, 99, 235, 0.2);
}

.editor-content {
  flex: 1;
  min-height: 0;
  height: 100%;
  font-family: 'Noto Serif SC', 'Source Han Serif SC', Georgia, serif;
  font-size: 17px;
  line-height: 1.9;
  color: #0f172a;
  outline: none;
  white-space: pre-wrap;
  word-break: break-word;
  padding: 14px 16px;
  caret-color: #2563eb;
  overflow: auto;

  &:focus {
    background: #fffeff;
  }

  &[contenteditable='true']:empty::before {
    content: '输入场景正文...';
    color: #94a3b8;
    pointer-events: none;
  }
}

.preview-pane {
  min-height: 0;
  min-width: 0;
  border-left: 1px solid #e2e8f0;
  overflow: hidden;
  background: #fcfdff;
}

.preview-content {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 18px 22px 26px;
}

.timeline-panel {
  border-top: 1px solid #e2e8f0;
  background: #ffffff;
}

.editor-statusbar {
  height: 28px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #64748b;
  font-size: 12px;

  .statusbar-left,
  .statusbar-right {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .save-status {
    &--saved {
      color: #16a34a;
    }
    &--saving {
      color: #2563eb;
    }
    &--unsaved {
      color: #dc2626;
    }
  }

  .quick-overview {
    color: #64748b;
    white-space: nowrap;
  }

  .statusbar-action {
    height: 22px;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    background: #fff;
    color: #475569;
    font-size: 12px;
    padding: 0 8px;
    cursor: pointer;
  }
}

@media (max-width: 1280px) {
  .story-board__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .editor-workspace {
    grid-template-columns: 1fr;
  }

  .editor-statusbar .quick-overview {
    display: none;
  }
}

@media (max-width: 1024px) {
  .editor-toolbar .toolbar-left {
    display: none;
  }

  .editor-main {
    padding: 10px;
  }

  .editor-writing-card.dual-view {
    grid-template-columns: 1fr;
  }

  .story-board__grid {
    grid-template-columns: 1fr;
  }

  .preview-pane {
    border-left: none;
    border-top: 1px solid #e2e8f0;
  }

  .editor-content {
    min-height: 0;
    padding: 18px 20px;
  }

  .editor-statusbar .read-time,
  .editor-statusbar .encoding {
    display: none;
  }
}

.editor-main::-webkit-scrollbar,
.editor-content::-webkit-scrollbar,
.preview-content::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

.editor-main::-webkit-scrollbar-thumb,
.editor-content::-webkit-scrollbar-thumb,
.preview-content::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: #cbd5e1;
}

.editor-main::-webkit-scrollbar-track,
.editor-content::-webkit-scrollbar-track,
.preview-content::-webkit-scrollbar-track {
  background: #f1f5f9;
}
</style>
