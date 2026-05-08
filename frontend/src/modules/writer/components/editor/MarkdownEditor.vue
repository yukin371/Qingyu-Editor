<template>
  <div class="markdown-editor" :class="{ 'is-readonly': readonly }">
    <!-- 编辑器头部 -->
    <header class="editor-header">
      <div class="header-left">
        <QyIcon name="Document" class="chapter-icon" />
        <h2 class="chapter-title">{{ displayTitle }}</h2>
      </div>
      <div class="header-right">
        <!-- 保存状态 -->
        <div class="save-status" :class="saveStatusClass">
          <QyIcon v-if="saveStatus === 'saving'" name="Loading" class="is-loading" />
          <QyIcon v-else-if="saveStatus === 'saved'" name="Check" />
          <QyIcon v-else-if="saveStatus === 'error'" name="Close" />
          <QyIcon v-else-if="saveStatus === 'unsaved'" name="Warning" />
          <span class="status-text">{{ saveStatusText }}</span>
        </div>
        <!-- 字数统计 -->
        <div class="word-count">
          <span class="count-value">{{ formattedWordCount }}</span>
          <span class="count-unit">万字</span>
        </div>
      </div>
    </header>

    <!-- 编辑器主体 -->
    <div class="editor-body">
      <MdEditor
        v-model="content"
        :theme="editorTheme"
        :preview="false"
        :toolbars="toolbars"
        :placeholder="placeholder"
        :disabled="readonly"
        :style="{ height: '100%' }"
        :previewOnly="false"
        @onChange="handleChange"
        @onSave="handleSave"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import QyIcon from '@/design-system/components/basic/QyIcon/QyIcon.vue'
import { useEditorStore } from '@/modules/writer/stores/editorStore'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'

// 保存状态类型
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'unsaved'

// Props 定义
interface Props {
  modelValue?: string
  title?: string
  placeholder?: string
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  title: '',
  placeholder: '开始创作...',
  readonly: false,
})

// Emits 定义
interface Emits {
  (e: 'update:modelValue', val: string): void
  (e: 'save', val: string): void
  (e: 'wordCountChange', cnt: number): void
}

const emit = defineEmits<Emits>()

// Store
const editorStore = useEditorStore()

// Refs
const content = ref(props.modelValue)
const wordCount = ref(0)
const saveStatus = ref<SaveStatus>('saved')
const editorTheme = ref<'light' | 'dark'>('light')

let saveTimeout: ReturnType<typeof setTimeout> | null = null

// 工具栏配置（精简版）

const toolbars: any[] = [
  'bold',
  'italic',
  'strikeThrough',
  '-',
  'title',
  'quote',
  'unorderedList',
  'orderedList',
  '-',
  'undo',
  'redo',
]

// 计算属性
const displayTitle = computed(() => props.title || '未命名章节')

const saveStatusText = computed(() => {
  switch (saveStatus.value) {
    case 'saved':
      return '已保存'
    case 'saving':
      return '保存中...'
    case 'unsaved':
      return '未保存'
    case 'error':
      return '保存失败'
    case 'idle':
    default:
      return ''
  }
})

const saveStatusClass = computed(() => `status-${saveStatus.value}`)

const formattedWordCount = computed(() => {
  const wan = wordCount.value / 10000
  return wan.toFixed(2)
})

// 计算字数（中文按字计算，英文按词计算）
function calculateWordCount(text: string): number {
  if (!text) return 0

  // 移除 Markdown 语法标记
  const cleanText = text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '')
    .replace(/\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/[#*_~>`|-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  // 中文字符数
  const chineseChars = (cleanText.match(/[\u4e00-\u9fa5]/g) || []).length

  // 英文单词数
  const englishWords = cleanText
    .replace(/[\u4e00-\u9fa5]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 0).length

  return chineseChars + englishWords
}

// 处理内容变化
function handleChange(value: string) {
  emit('update:modelValue', value)

  // 更新字数
  const count = calculateWordCount(value)
  wordCount.value = count
  emit('wordCountChange', count)

  // 标记未保存
  saveStatus.value = 'unsaved'
  editorStore.markDirty()

  // 防抖自动保存（300ms debounce）
  if (saveTimeout) {
    clearTimeout(saveTimeout)
  }
  saveTimeout = setTimeout(() => {
    handleSave(value)
  }, 300)
}

// 处理保存
function handleSave(value: string) {
  saveStatus.value = 'saving'
  editorStore.setSaving(true)

  emit('save', value)

  // 模拟保存成功
  setTimeout(() => {
    saveStatus.value = 'saved'
    editorStore.markSaved()
    editorStore.setSaving(false)
  }, 500)
}

// 手动设置保存状态
function setSaveStatus(status: SaveStatus) {
  saveStatus.value = status
  if (status === 'saved') {
    editorStore.markSaved()
    editorStore.setSaving(false)
  } else if (status === 'saving') {
    editorStore.setSaving(true)
  }
}

// 获取编辑器内容
function getContent(): string {
  return content.value
}

// 设置编辑器内容
function setContent(value: string) {
  content.value = value
}

// 聚焦编辑器
function focus() {
  // md-editor-v3 没有直接的 focus 方法，通过 DOM 操作
  const textarea = document.querySelector('.md-editor-v3 textarea') as HTMLTextAreaElement
  textarea?.focus()
}

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue !== content.value) {
      content.value = newValue
      const count = calculateWordCount(newValue)
      wordCount.value = count
      emit('wordCountChange', count)
    }
  },
)

// 生命周期
onMounted(() => {
  if (props.modelValue) {
    const count = calculateWordCount(props.modelValue)
    wordCount.value = count
    emit('wordCountChange', count)
  }
})

onBeforeUnmount(() => {
  if (saveTimeout) {
    clearTimeout(saveTimeout)
    saveTimeout = null
  }
})

// 暴露方法给父组件
defineExpose({
  getContent,
  setContent,
  focus,
  setSaveStatus,
})
</script>

<style scoped lang="scss">
.markdown-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--el-bg-color, #ffffff);
  border-radius: 8px;
  overflow: hidden;

  &.is-readonly {
    opacity: 0.85;
  }
}

// 编辑器头部
.editor-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 1px solid var(--el-border-color-lighter, #e4e7ed);
  background: var(--el-bg-color, #ffffff);

  .header-left {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;

    .chapter-icon {
      color: var(--el-color-primary, #409eff);
      font-size: 14px;
      flex-shrink: 0;
    }

    .chapter-title {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      color: var(--el-text-color-primary, #303133);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }
}

// 保存状态
.save-status {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 12px;
  transition: all 0.3s ease;

  .status-text {
    white-space: nowrap;
  }

  &.status-saved {
    color: #67c23a;
    background: rgba(103, 194, 58, 0.1);
  }

  &.status-saving {
    color: #409eff;
    background: rgba(64, 158, 255, 0.1);

    .is-loading {
      animation: rotating 1.5s linear infinite;
    }
  }

  &.status-unsaved {
    color: #e6a23c;
    background: rgba(230, 162, 60, 0.1);
  }

  &.status-error {
    color: #f56c6c;
    background: rgba(245, 108, 108, 0.1);
  }

  &.status-idle {
    color: #909399;
    background: transparent;
  }
}

// 字数统计
.word-count {
  display: flex;
  align-items: baseline;
  gap: 2px;
  padding: 2px 8px;
  background: var(--el-fill-color-light, #f5f7fa);
  border-radius: 8px;

  .count-value {
    font-size: 12px;
    font-weight: 600;
    color: var(--el-text-color-primary, #303133);
    font-family: var(--el-font-family-monospace, monospace);
  }

  .count-unit {
    font-size: 11px;
    color: var(--el-text-color-secondary, #909399);
  }
}

// 编辑器主体
.editor-body {
  flex: 1;
  min-height: 0;
  overflow: hidden;

  :deep(.md-editor-v3) {
    height: 100%;
    border: none;
    border-radius: 0;

    .md-editor-toolbar-wrapper {
      border-bottom: 1px solid var(--el-border-color-lighter, #e4e7ed);
      background: var(--el-fill-color-light, #f5f7fa);
    }

    .md-editor-content {
      height: calc(100% - 40px);

      .md-editor-input {
        padding: 10px 12px;
        font-family: 'Noto Serif SC', 'Source Han Serif SC', Georgia, serif;
        font-size: 15px;
        line-height: 1.75;
      }
    }
  }
}

// 加载动画
@keyframes rotating {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

// 暗色模式支持
@media (prefers-color-scheme: dark) {
  .markdown-editor {
    background: var(--el-bg-color-overlay, #1d1e1f);
  }

  .editor-header {
    background: var(--el-bg-color-overlay, #1d1e1f);
    border-bottom-color: var(--el-border-color-darker, #4c4d4f);
  }

  .editor-body {
    :deep(.md-editor-v3) {
      background: var(--el-bg-color-overlay, #1d1e1f);

      .md-editor-toolbar-wrapper {
        background: var(--el-fill-color-darker, #252627);
        border-bottom-color: var(--el-border-color-darker, #4c4d4f);
      }

      .md-editor-input {
        background: var(--el-bg-color-overlay, #1d1e1f);
        color: var(--el-text-color-primary, #e5eaf3);
      }
    }
  }
}
</style>
