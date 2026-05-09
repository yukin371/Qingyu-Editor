<template>
  <div
    class="tiptap-editor-view"
    :class="{ 'tiptap-editor-view--without-ref': !showReferencePanel }"
    :style="appearanceStore.cssVariables"
    data-testid="tiptap-editor-view"
  >
    <div class="tiptap-editor-view__body">
      <header class="editor-toolbar" v-if="showReferencePanel">
        <div class="editor-toolbar__meta">
          <span class="keyword-badge">🔑 {{ referenceSummary.length }}</span>
        </div>
      </header>

      <div class="tiptap-editor-view__content">
        <QyTipTapEditor
          :model-value="modelValue"
          :project-id="projectId"
          :document-id="documentId"
          :readonly="readonly"
          :placeholder="placeholder"
          :toolbar-preset="appearanceStore.compactToolbar ? 'writer' : 'default'"
          @update:model-value="(val) => $emit('update:modelValue', val)"
          @save="handleSave"
          @keyword-click="(kw) => $emit('keyword-click', kw)"
          @ready="handleEditorReady"
          @selection-change="handleSelectionChange"
          @entity-scan="handleEntityScan"
        />

        <div
          v-if="selectionState.visible"
          class="selection-toolbar"
          :style="{ left: `${selectionState.x}px`, top: `${selectionState.y}px` }"
        >
          <button
            type="button"
            class="selection-toolbar__action"
            data-action="continue"
            @click="emitSelectionAction('continue')"
          >
            <span class="selection-toolbar__action-label">续写</span>
            <span class="selection-toolbar__action-hint">后接片段</span>
          </button>
          <button
            type="button"
            class="selection-toolbar__action"
            data-action="polish"
            @click="emitSelectionAction('polish')"
          >
            <span class="selection-toolbar__action-label">润色</span>
            <span class="selection-toolbar__action-hint">提纯语气</span>
          </button>
          <button
            type="button"
            class="selection-toolbar__action"
            data-action="rewrite"
            @click="emitSelectionAction('rewrite')"
          >
            <span class="selection-toolbar__action-label">改写</span>
            <span class="selection-toolbar__action-hint">重组表达</span>
          </button>
          <button
            type="button"
            class="selection-toolbar__action"
            data-action="add_to_chat"
            @click="emitSelectionAction('add_to_chat')"
          >
            <span class="selection-toolbar__action-label">加入对话</span>
            <span class="selection-toolbar__action-hint">交给右栏</span>
          </button>
        </div>
      </div>
    </div>

    <aside class="tiptap-editor-view__ref" v-if="showReferencePanel">
      <div class="ref-header">
        <p class="kicker">Reference Assistant</p>
        <h4 class="title">智能引用库</h4>
        <p class="hint">本文档已识别 {{ referenceSummary.length }} 个关键词，按频次排序显示。</p>
      </div>

      <!-- 实体扫描面板 -->
      <QyEntityScanPanel
        v-if="showEntityScan"
        :entities="scannedEntities"
        :is-scanning="isScanning"
        class="entity-scan-section"
        @ignore="handleIgnoreEntity"
        @ignore-all="ignoreAll"
      />

      <div class="ref-stats">
        <div class="stat">
          <span class="label">角色</span>
          <span class="value">{{ referenceStats.character }}</span>
        </div>
        <div class="stat stat--location">
          <span class="label">地点</span>
          <span class="value">{{ referenceStats.location }}</span>
        </div>
        <div class="stat stat--item">
          <span class="label">物品</span>
          <span class="value">{{ referenceStats.item }}</span>
        </div>
      </div>

      <ul class="ref-list" v-if="referenceSummary.length > 0">
        <li
          v-for="item in referenceSummary"
          :key="`${item.type}-${item.name}`"
          :class="`is-${item.type}`"
        >
          <span class="type">{{ typeLabel(item.type) }}</span>
          <span class="name">{{ item.name }}</span>
          <span class="count">x{{ item.count }}</span>
        </li>
      </ul>
      <div v-else class="ref-empty">还没有识别到关键词，输入 <code>@</code> 试试。</div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, watch, ref, onUnmounted } from 'vue'
import type { Editor } from '@tiptap/core'
import { QyTipTapEditor } from '@/design-system/components/editor'
import type { KeywordInfo } from '@/design-system/components/editor'
import { QyEntityScanPanel } from '@/design-system/components/editor'
import type { ScannedEntity } from '@/modules/writer/composables/useEntityScanner'
import { useEntityScanner } from '@/modules/writer/composables/useEntityScanner'
import type { ParagraphContent } from '@/modules/writer/api/wrapper'
import { useEditorAppearanceStore } from '@/modules/writer/stores/editorAppearanceStore'
import { useEditorStore } from '@/modules/writer/stores/editorStore'
import { extractPlainTextFromEditorContent } from '@/modules/writer/utils/editorContent'

const AUTOSAVE_DEBOUNCE = 300 // 300ms debounce

const props = withDefaults(
  defineProps<{
    modelValue: string
    projectId: string
    documentId?: string
    readonly?: boolean
    placeholder?: string
    showReferencePanel?: boolean
    showEntityScan?: boolean
  }>(),
  {
    documentId: '',
    readonly: false,
    placeholder: '输入 @ 触发实体补全…',
    showReferencePanel: true,
    showEntityScan: true,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'save', contents: ParagraphContent[]): void
  (e: 'keyword-click', keyword: KeywordInfo): void
  (
    e: 'selection-action',
    payload: {
      action: string
      text: string
      from: number
      to: number
      applyMode?: 'replace_selection' | 'insert_after_selection'
    },
  ): void
}>()

const editorStore = useEditorStore()
const appearanceStore = useEditorAppearanceStore()
const { scannedEntities, isScanning, scheduleScan, ignoreEntity, ignoreAll } = useEntityScanner()
const plainTextContent = computed(() => extractPlainTextFromEditorContent(props.modelValue || ''))

// 自动保存跟踪状态
const trackedDocumentId = ref<string>('')
const lastPersistedContent = ref<string>('')
let contentChangeTimer: ReturnType<typeof setTimeout> | null = null

/**
 * 清理待执行的自动保存任务
 */
function clearPendingAutoSave() {
  if (contentChangeTimer) {
    clearTimeout(contentChangeTimer)
    contentChangeTimer = null
  }
}

/**
 * 同步最近一次已持久化的正文快照
 */
function syncPersistedSnapshot(serializedContent: string) {
  lastPersistedContent.value = serializedContent || ''
}

/**
 * 当前序列化内容是否与已保存版本不同
 */
function hasPersistedChange(serializedContent: string): boolean {
  return serializedContent !== lastPersistedContent.value
}

/**
 * 处理内容变化 - 标记为未保存但延迟保存
 */
function handleContentChange(serializedContent: string) {
  // 标记为未保存
  editorStore.markDirty()

  if (!editorStore.autosaveEnabled) {
    return
  }

  // 清除之前的定时器
  clearPendingAutoSave()

  // 设置新的定时器，debounce 300ms
  contentChangeTimer = setTimeout(() => {
    void triggerAutoSave(serializedContent)
  }, AUTOSAVE_DEBOUNCE)
}

/**
 * 触发自动保存
 */
async function triggerAutoSave(serializedContent: string) {
  if (!hasPersistedChange(serializedContent)) return

  const contents: ParagraphContent[] = [
    {
      paragraphId: 'main',
      order: 0,
      content: serializedContent,
      contentType: 'tiptap_json',
    },
  ]

  try {
    await editorStore.saveParagraphs(contents)
    syncPersistedSnapshot(serializedContent)
  } catch (error) {
    console.error('[TipTapEditorView] 自动保存失败:', error)
  }
}

// 监听内容变化，触发实体扫描
watch(plainTextContent, (text) => {
  if (text.length > 0) {
    scheduleScan(text)
  }
})

watch(
  () => props.documentId,
  (documentId) => {
    trackedDocumentId.value = documentId || ''
    syncPersistedSnapshot(props.modelValue || '')
    clearPendingAutoSave()
  },
  { immediate: true },
)

// 监听 modelValue 变化，检测内容变化
watch(
  () => props.modelValue,
  (newValue) => {
    const serializedContent = newValue || ''

    if (trackedDocumentId.value !== (props.documentId || '')) {
      trackedDocumentId.value = props.documentId || ''
      syncPersistedSnapshot(serializedContent)
      clearPendingAutoSave()
      return
    }

    // 外部同步（加载文档、切换章节、手动标记已保存）只更新基线，不触发自动保存
    if (!editorStore.isDirty) {
      syncPersistedSnapshot(serializedContent)
      return
    }

    if (!hasPersistedChange(serializedContent)) {
      return
    }

    handleContentChange(serializedContent)
  },
)
const selectionState = reactive({
  text: '',
  from: 0,
  to: 0,
  x: 0,
  y: 0,
  visible: false,
})

function handleEditorReady(editor: Editor) {
  editorStore.setTipTapEditor(editor)
}

async function handleSave(contents: ParagraphContent[]) {
  if (!contents || !contents[0]?.content) return

  const serializedContent = contents[0].content || ''

  if (!hasPersistedChange(serializedContent)) return

  clearPendingAutoSave()
  await editorStore.saveParagraphs(contents)
  syncPersistedSnapshot(serializedContent)
  emit('save', contents)
}

onUnmounted(() => {
  clearPendingAutoSave()
})

const referenceSummary = computed(() => {
  try {
    const json = props.modelValue ? JSON.parse(props.modelValue) : null
    const text = JSON.stringify(json || '')
    return collectKeywordSummary(text)
  } catch {
    return collectKeywordSummary(props.modelValue || '')
  }
})

const referenceStats = computed(() => ({
  character: referenceSummary.value.filter((item) => item.type === 'character').length,
  location: referenceSummary.value.filter((item) => item.type === 'location').length,
  item: referenceSummary.value.filter((item) => item.type === 'item').length,
}))

function collectKeywordSummary(text: string) {
  const patterns: Array<{ type: KeywordInfo['type']; regex: RegExp }> = [
    { type: 'character', regex: /@([\u4e00-\u9fa5\w-]{1,30})/g },
    { type: 'location', regex: /#([\u4e00-\u9fa5\w-]{1,30})/g },
    { type: 'item', regex: /%([\u4e00-\u9fa5\w-]{1,30})/g },
  ]
  const summary = new Map<string, { type: KeywordInfo['type']; name: string; count: number }>()
  for (const p of patterns) {
    for (const match of text.matchAll(p.regex)) {
      const name = match[1]
      const key = `${p.type}:${name}`
      const prev = summary.get(key)
      if (prev) prev.count += 1
      else summary.set(key, { type: p.type, name, count: 1 })
    }
  }
  return Array.from(summary.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 30)
}

function typeLabel(type: KeywordInfo['type']) {
  if (type === 'character') return '角色'
  if (type === 'location') return '地点'
  return '物品'
}

function handleSelectionChange(payload: {
  text: string
  from: number
  to: number
  x: number
  y: number
  visible: boolean
}) {
  selectionState.text = payload.text
  selectionState.from = payload.from
  selectionState.to = payload.to
  selectionState.x = payload.x
  selectionState.y = payload.y
  selectionState.visible = payload.visible
}

function emitSelectionAction(action: string) {
  if (!selectionState.text.trim()) return
  emit('selection-action', {
    action,
    text: selectionState.text,
    from: selectionState.from,
    to: selectionState.to,
    applyMode: action === 'continue' ? 'insert_after_selection' : 'replace_selection',
  })
  selectionState.visible = false
}

function handleIgnoreEntity(entity: ScannedEntity) {
  ignoreEntity(entity.name)
}

function handleEntityScan(refs: Array<{ id?: string; name: string; type: string }>) {
  // 更新引用摘要 - 使用扫描结果刷新右侧面板
  // refs 是从 entityParser 解析出的实体引用列表
  // 直接更新 scannedEntities 或 referenceSummary
  if (refs.length > 0) {
    // 触发侧边栏更新
    // 调用已有的 scheduleScan 刷新
    scheduleScan(plainTextContent.value)
  }
}
</script>

<style scoped>
.tiptap-editor-view {
  height: 100%;
  display: flex;
  gap: 0;
  padding: 0;
  background: #fff;
}

.tiptap-editor-view--without-ref {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 0;
  padding: 0;
  background: #fff;
}

.tiptap-editor-view__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  border: none;
  overflow: hidden;
  background: var(--editor-bg-base);
  height: 100%;
}

.editor-toolbar {
  border-bottom: 1px solid var(--editor-border);
  background: #fff;
  padding: 8px 16px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  min-height: 36px;
}

.editor-toolbar__meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.meta-chip {
  font-size: 12px;
  font-weight: 700;
  color: var(--editor-accent);
  border-radius: 999px;
  padding: 4px 10px;
  background: var(--editor-accent-soft);
}

.meta-chip--soft {
  color: var(--editor-accent);
  background: var(--editor-accent-soft);
}

.keyword-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  color: var(--brand, var(--editor-accent));
  border-radius: var(--editor-radius-sm, 4px);
  padding: 3px 8px;
  background: var(--editor-accent-soft);
  white-space: nowrap;
}

.tiptap-editor-view__content {
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  padding: 0;
  background: #fff;
  position: relative;
  display: flex;
  flex-direction: column;
}

.selection-toolbar {
  position: absolute;
  z-index: 12;
  transform: translate(-50%, calc(-100% - 12px));
  display: inline-flex;
  gap: 6px;
  padding: 6px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(148, 163, 184, 0.22);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.12);
  backdrop-filter: blur(14px);
}

.selection-toolbar::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: -7px;
  width: 14px;
  height: 14px;
  background: rgba(255, 255, 255, 0.96);
  border-right: 1px solid rgba(148, 163, 184, 0.18);
  border-bottom: 1px solid rgba(148, 163, 184, 0.18);
  transform: translateX(-50%) rotate(45deg);
}

.selection-toolbar__action {
  min-width: 78px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: var(--editor-text-primary);
  padding: 8px 12px 9px;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    background 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.selection-toolbar__action-label {
  font-size: 12px;
  font-weight: 700;
  line-height: 1.2;
}

.selection-toolbar__action-hint {
  font-size: 10px;
  line-height: 1.1;
  color: var(--editor-text-tertiary, rgba(15, 23, 42, 0.56));
}

.selection-toolbar__action:hover {
  transform: translateY(-1px);
  background: rgba(15, 23, 42, 0.035);
  border-color: rgba(148, 163, 184, 0.24);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.64);
}

.selection-toolbar__action:focus-visible {
  outline: none;
  border-color: var(--editor-accent);
  box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.16);
}

.selection-toolbar__action[data-action='continue'] {
  border-color: rgba(14, 165, 233, 0.12);
}

.selection-toolbar__action[data-action='continue'] .selection-toolbar__action-label {
  color: #0f766e;
}

.selection-toolbar__action[data-action='polish'] {
  border-color: rgba(99, 102, 241, 0.1);
}

.selection-toolbar__action[data-action='polish'] .selection-toolbar__action-label {
  color: #4338ca;
}

.selection-toolbar__action[data-action='rewrite'] {
  border-color: rgba(249, 115, 22, 0.12);
}

.selection-toolbar__action[data-action='rewrite'] .selection-toolbar__action-label {
  color: #c2410c;
}

.selection-toolbar__action[data-action='add_to_chat'] {
  border-color: rgba(34, 197, 94, 0.12);
}

.selection-toolbar__action[data-action='add_to_chat'] .selection-toolbar__action-label {
  color: #15803d;
}

.tiptap-editor-view__ref {
  width: 320px;
  flex-shrink: 0;
  border-left: 1px solid var(--editor-border);
  padding: 14px 14px 18px;
  overflow: auto;
  background: #fff;
}

.ref-header {
  padding-bottom: 10px;
  border-bottom: 1px solid var(--editor-border);
}

.entity-scan-section {
  margin-top: 12px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--editor-border);
}

.title {
  margin: 2px 0 4px;
  font-size: 18px;
  font-weight: 700;
  color: var(--editor-text-primary);
}

.hint {
  margin: 0;
  color: var(--editor-text-secondary);
  font-size: 12px;
  line-height: 1.5;
}

.ref-stats {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.stat {
  border-radius: 6px;
  padding: 8px;
  border: 1px solid #e5e7eb;
  background: #f8fafc;
  text-align: center;
}

.stat .label {
  display: block;
  font-size: 11px;
  color: var(--editor-accent);
  font-weight: 700;
}

.stat .value {
  display: block;
  margin-top: 2px;
  font-size: 18px;
  font-weight: 700;
  color: var(--editor-text-primary);
}

.stat--location {
  border-color: var(--editor-accent-soft-border);
  background: var(--editor-accent-soft);
}

.stat--location .label {
  color: var(--editor-accent);
}

.stat--item {
  border-color: var(--editor-accent-soft-border);
  background: var(--editor-accent-soft);
}

.stat--item .label {
  color: var(--editor-accent);
}

.ref-list {
  list-style: none;
  margin: 12px 0 0;
  padding: 0;
  display: grid;
  gap: 8px;
}

.ref-list li {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 8px 10px;
  border-bottom: 1px solid var(--editor-border);
  background: transparent;
}

.ref-list li.is-character {
  border-left: 3px solid var(--editor-color-brand, var(--editor-accent));
}

.ref-list li.is-location {
  border-left: 3px solid var(--editor-color-mint, var(--editor-accent));
}

.ref-list li.is-item {
  border-left: 3px solid var(--editor-color-warm, var(--editor-accent));
}

.type {
  font-size: 11px;
  width: 30px;
  color: var(--editor-text-muted);
  font-weight: 700;
}

.name {
  flex: 1;
  min-width: 0;
  color: var(--editor-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
}

.count {
  font-size: 11px;
  color: var(--editor-text-muted);
}

.ref-empty {
  margin-top: 12px;
  padding: 12px 0 0;
  border-top: 1px dashed var(--editor-border);
  color: var(--editor-text-muted);
  font-size: 12px;
  line-height: 1.5;
}

.ref-empty code {
  color: var(--editor-accent);
  background: var(--editor-accent-soft);
  border-radius: 4px;
  padding: 1px 4px;
}

:deep(.qy-tiptap-editor) {
  position: relative;
  z-index: 1;
  height: 100%;
  background: transparent;
}

:deep(.qy-tiptap-toolbar) {
  margin: 0;
  width: 100%;
  border: none;
  border-bottom: 1px solid var(--editor-border);
  border-radius: 0;
  background: #fff;
  padding: 8px 18px 6px;
  gap: 4px;
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
}

:deep(.qy-tiptap-toolbar button) {
  min-width: 28px;
  height: 28px;
  border-radius: 6px;
  border-color: transparent;
  background: transparent;
  color: var(--editor-text-secondary);
  font-weight: 700;
  transition:
    background 0.18s ease,
    color 0.18s ease,
    border-color 0.18s ease;
}

:deep(.qy-tiptap-toolbar button:hover) {
  background: #f3f4f6;
  border-color: #e5e7eb;
  color: var(--editor-text-primary);
}

:deep(.qy-tiptap-toolbar button.active) {
  background: var(--editor-accent-soft);
  border-color: var(--editor-accent-soft-border);
  color: var(--editor-accent);
}

:deep(.qy-tiptap-toolbar .sep) {
  height: 18px;
  background: var(--editor-border);
}

:deep(.qy-tiptap-editor__content) {
  padding: 0;
  background: #fff;
}

:deep(.ProseMirror) {
  min-height: calc(100% - 4px);
  max-width: var(--writer-content-width, 860px);
  margin: 0 auto;
  padding: 26px 8px 96px;
  color: var(--editor-content-fg);
  font-size: var(--writer-font-size, 19px);
  line-height: var(--writer-line-height, 1.95);
  font-family: var(--writer-font-family);
}

:deep(.ProseMirror p.is-editor-empty:first-child::before) {
  color: var(--editor-content-placeholder-color);
  font-style: normal;
}

@media (max-width: 1200px) {
  .tiptap-editor-view {
    flex-direction: column;
  }

  .tiptap-editor-view__ref {
    max-height: 280px;
    width: 100%;
  }
}

@media (max-width: 768px) {
  .tiptap-editor-view {
    padding: 0;
  }

  .editor-toolbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .ref-stats {
    grid-template-columns: 1fr;
  }

  :deep(.qy-tiptap-toolbar) {
    padding-left: 12px;
    padding-right: 12px;
    overflow-x: auto;
  }

  :deep(.ProseMirror) {
    padding-top: 18px;
  }
}

@media (prefers-reduced-motion: reduce) {
  :deep(.qy-tiptap-toolbar button) {
    transition: none;
  }

}
</style>
