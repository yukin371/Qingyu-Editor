<template>
  <div class="qy-tiptap-editor" @click="handleEditorClick">
    <div class="qy-tiptap-toolbar">
      <button type="button" :class="{ active: isActive('bold') }" @click="run('toggleBold')">
        <strong>B</strong>
      </button>
      <button type="button" :class="{ active: isActive('italic') }" @click="run('toggleItalic')">
        <em>I</em>
      </button>
      <button
        type="button"
        :class="{ active: isActive('underline') }"
        @click="run('toggleUnderline')"
      >
        <u>U</u>
      </button>
      <span class="sep" />
      <button
        type="button"
        :class="{ active: isActive('heading', { level: 1 }) }"
        @click="run('toggleHeading1')"
      >
        H1
      </button>
      <button
        type="button"
        :class="{ active: isActive('heading', { level: 2 }) }"
        @click="run('toggleHeading2')"
      >
        H2
      </button>
      <button
        type="button"
        :class="{ active: isActive('heading', { level: 3 }) }"
        @click="run('toggleHeading3')"
      >
        H3
      </button>
      <button
        type="button"
        :class="{ active: isActive('blockquote') }"
        @click="run('toggleBlockquote')"
      >
        引用
      </button>
      <button
        type="button"
        :class="{ active: isActive('codeBlock') }"
        @click="run('toggleCodeBlock')"
      >
        代码
      </button>
      <span class="sep" />
      <button
        type="button"
        :class="{ active: isActive('bulletList') }"
        @click="run('toggleBulletList')"
      >
        无序
      </button>
      <button
        type="button"
        :class="{ active: isActive('orderedList') }"
        @click="run('toggleOrderedList')"
      >
        有序
      </button>
      <span class="sep" />
      <button
        type="button"
        :class="{ active: isActive('image') }"
        @click="run('insertImage')"
        :disabled="isUploadingImage"
      >
        {{ isUploadingImage ? '上传中...' : '图片' }}
      </button>
      <span class="sep" />
      <button type="button" @click="run('undo')">撤销</button>
      <button type="button" @click="run('redo')">重做</button>
    </div>

    <!-- 隐藏的文件输入框 -->
    <input
      ref="imageInputRef"
      type="file"
      accept="image/*"
      style="display: none"
      @change="handleImageSelect"
    />

    <EditorContent v-if="editor" class="qy-tiptap-editor__content" :editor="editor" />

    <QyCompletionPopover
      :visible="completion.visible"
      :x="completion.x"
      :y="completion.y"
      :items="completion.items"
      :active-index="completion.activeIndex"
      :query="completion.query"
      @select="insertCompletion"
      @create="handleCompletionCreate"
    />

    <QyKeywordPopover
      :visible="keywordCard.visible"
      :x="keywordCard.x"
      :y="keywordCard.y"
      :keyword="keywordCard.keyword"
      :relations="keywordCardRelations"
      @jump="(kw: any) => emit('keyword-click', kw)"
    />

    <QyEntityCreateDialog
      :visible="entityCreateDialog.visible"
      :initial-name="entityCreateDialog.initialName"
      @close="entityCreateDialog.visible = false"
      @create="handleEntityCreate"
    />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch, onBeforeUnmount } from 'vue'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import type { Editor as CoreEditor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import QyKeywordPopover from '../QySmartKeyword/QyKeywordPopover.vue'
import QyCompletionPopover from '../QySmartKeyword/QyCompletionPopover.vue'
import QyEntityCreateDialog from '../QySmartKeyword/QyEntityCreateDialog.vue'
import { SmartKeyword, type KeywordInfo } from '../QySmartKeyword/extensions/SmartKeyword'
import { ParagraphWithId } from '../QySmartKeyword/extensions/ParagraphWithId'
import { AiDiffExtension } from '../QySmartKeyword/extensions/AiDiffExtension'
import { searchProjectKeywords, type ParagraphContent } from '@/modules/writer/api/wrapper'
import { storageAPI } from '@/modules/shared/api/storage'

const props = withDefaults(
  defineProps<{
    modelValue: string
    projectId: string
    readonly?: boolean
    documentId?: string
    placeholder?: string
  }>(),
  {
    readonly: false,
    documentId: '',
    placeholder: '开始写作，输入 @ 触发实体补全…',
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'save', contents: ParagraphContent[]): void
  (e: 'keyword-click', keyword: KeywordInfo): void
  (e: 'ready', editor: CoreEditor): void
  (
    e: 'selection-change',
    payload: { text: string; from: number; to: number; x: number; y: number; visible: boolean },
  ): void
  (e: 'entity-scan', refs: Array<{ id?: string; name: string; type: string }>): void
  (e: 'open-tool-overlay'): void
}>()

type ToolbarCommand =
  | 'toggleBold'
  | 'toggleItalic'
  | 'toggleUnderline'
  | 'toggleHeading1'
  | 'toggleHeading2'
  | 'toggleHeading3'
  | 'toggleBlockquote'
  | 'toggleCodeBlock'
  | 'toggleBulletList'
  | 'toggleOrderedList'
  | 'insertImage'
  | 'undo'
  | 'redo'

// 图片上传相关
const imageInputRef = ref<HTMLInputElement | null>(null)
const isUploadingImage = ref(false)

function parseInitialContent() {
  console.log('[QyTipTapEditor] parseInitialContent 输入:', props.modelValue?.substring(0, 200))

  if (!props.modelValue) {
    console.log('[QyTipTapEditor] modelValue为空，返回默认段落')
    return '<p></p>'
  }

  try {
    const parsed = JSON.parse(props.modelValue)
    console.log('[QyTipTapEditor] JSON解析成功:', parsed)
    return parsed
  } catch (error) {
    console.log('[QyTipTapEditor] JSON解析失败，返回原始内容:', error)
    return props.modelValue
  }
}

function run(command: ToolbarCommand) {
  if (!editor.value) return
  const chain = editor.value.chain().focus()

  switch (command) {
    case 'toggleBold':
      chain.toggleBold().run()
      break
    case 'toggleItalic':
      chain.toggleItalic().run()
      break
    case 'toggleUnderline':
      chain.toggleUnderline().run()
      break
    case 'toggleHeading1':
      chain.toggleHeading({ level: 1 }).run()
      break
    case 'toggleHeading2':
      chain.toggleHeading({ level: 2 }).run()
      break
    case 'toggleHeading3':
      chain.toggleHeading({ level: 3 }).run()
      break
    case 'toggleBlockquote':
      chain.toggleBlockquote().run()
      break
    case 'toggleCodeBlock':
      chain.toggleCodeBlock().run()
      break
    case 'toggleBulletList':
      chain.toggleBulletList().run()
      break
    case 'toggleOrderedList':
      chain.toggleOrderedList().run()
      break
    case 'insertImage':
      // 触发文件选择
      imageInputRef.value?.click()
      break
    case 'undo':
      chain.undo().run()
      break
    case 'redo':
      chain.redo().run()
      break
  }
}

/**
 * 处理图片选择
 */
async function handleImageSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    alert('请选择图片文件')
    return
  }

  // 验证文件大小（限制10MB）
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    alert('图片大小不能超过10MB')
    return
  }

  isUploadingImage.value = true

  try {
    // 上传图片到服务器
    const response = await storageAPI.uploadFile(file, `writer/${props.projectId}/images`, 'image')
    const uploadData = response.data

    if (!uploadData?.file?.fileId) {
      throw new Error('上传失败：未获取到文件ID')
    }

    // 获取文件访问URL
    const urlResponse = await storageAPI.getFileURL(uploadData.file.fileId, 86400 * 365) // 1年有效期
    const imageUrl = urlResponse.data?.url

    if (!imageUrl) {
      throw new Error('获取图片URL失败')
    }

    // 在编辑器中插入图片
    editor.value?.chain().focus().setImage({ src: imageUrl, alt: file.name }).run()

    // 清空 input 以便重复选择同一文件
    input.value = ''
  } catch (error) {
    console.error('图片上传失败:', error)
    alert('图片上传失败，请重试')
  } finally {
    isUploadingImage.value = false
  }
}

function isActive(name: string, attrs?: Record<string, unknown>) {
  if (!editor.value) return false
  return attrs ? editor.value.isActive(name, attrs) : editor.value.isActive(name)
}

const completion = reactive<{
  visible: boolean
  x: number
  y: number
  items: KeywordInfo[]
  activeIndex: number
  prefix: '@' // 统一使用 @ 前缀
  query: string
  from: number
  to: number
}>({
  visible: false,
  x: 0,
  y: 0,
  items: [],
  activeIndex: 0,
  prefix: '@',
  query: '',
  from: 0,
  to: 0,
})

const keywordCard = reactive<{
  visible: boolean
  x: number
  y: number
  keyword: KeywordInfo | null
}>({
  visible: false,
  x: 0,
  y: 0,
  keyword: null,
})

const keywordCardRelations = ref<Array<{ targetName: string; type: string; strength: number }>>([])

// 实体创建对话框状态
const entityCreateDialog = reactive({
  visible: false,
  initialName: '',
})

// 跟踪 @query 在编辑器中的位置，用于创建实体后替换
const entityCreateRange = reactive({ from: 0, to: 0 })

let completionTimer: ReturnType<typeof setTimeout> | undefined

const editor = useEditor({
  editable: !props.readonly,
  content: parseInitialContent(),
  extensions: [
    StarterKit,
    Underline,
    Link,
    Image,
    CharacterCount,
    Placeholder.configure({ placeholder: props.placeholder }),
    ParagraphWithId,
    AiDiffExtension,
    SmartKeyword.configure({ projectId: props.projectId }),
  ],
  editorProps: {
    attributes: {
      class: 'qy-editor-content',
      'data-document-id': props.documentId || '',
    },
    handleKeyDown: (_view: unknown, event: KeyboardEvent) => {
      // 优先处理补全导航
      if (handleCompletionKeydown(event)) {
        return true
      }

      // Ctrl+G: 打开全屏工具面板
      if ((event.ctrlKey || event.metaKey) && !event.shiftKey && event.key.toLowerCase() === 'g') {
        event.preventDefault()
        emit('open-tool-overlay')
        return true
      }

      // Ctrl+Shift+E: 打开实体创建对话框
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'e') {
        event.preventDefault()
        const selectedText = getSelectedText()
        entityCreateDialog.initialName = selectedText
        entityCreateDialog.visible = true
        return true
      }

      // Ctrl+S: 保存
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault()
        if (editor.value) {
          const doc = editor.value.getJSON()
          emit('save', extractParagraphs(doc))
          // 保存后扫描实体引用
          scanAndNotifyEntities(doc)
        }
        return true
      }
      return false
    },
  },
  onCreate({ editor: currentEditor }: { editor: CoreEditor }) {
    console.log('[QyTipTapEditor] ========== 编辑器创建成功 ==========')
    console.log('[QyTipTapEditor] 编辑器实例:', currentEditor)
    console.log('[QyTipTapEditor] 编辑器是否可编辑:', currentEditor.isEditable)

    // 检查编辑器的初始内容
    const initialContent = currentEditor.getJSON()
    console.log('[QyTipTapEditor] 初始内容:', initialContent)

    // 检查DOM是否正确渲染
    setTimeout(() => {
      const editorElement = document.querySelector('.ProseMirror')
      console.log('[QyTipTapEditor] ProseMirror DOM元素:', editorElement)
      console.log('[QyTipTapEditor] ProseMirror HTML:', editorElement?.innerHTML?.substring(0, 500))
    }, 100)

    emit('ready', currentEditor)
  },
  onUpdate({ editor: currentEditor }: { editor: CoreEditor }) {
    const json = currentEditor.getJSON()
    // 清理内容去除开头空格，避免与 text-indent 冲突
    const cleanedJson = cleanParagraphLeadingSpaces(json)
    emit('update:modelValue', JSON.stringify(cleanedJson))
    scheduleCompletionUpdate(currentEditor)
  },
  onBlur({ editor: currentEditor }: { editor: CoreEditor }) {
    const doc = currentEditor.getJSON()
    emit('save', extractParagraphs(doc))
    // 失焦保存后也扫描实体
    scanAndNotifyEntities(doc)
  },
  onSelectionUpdate({ editor: currentEditor }: { editor: CoreEditor }) {
    scheduleCompletionUpdate(currentEditor)
    emitSelectionChange(currentEditor)
  },
})

function handleCompletionKeydown(event: KeyboardEvent): boolean {
  // 补全列表可见且有匹配项时，处理导航
  if (completion.visible && completion.items.length > 0) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      completion.activeIndex = (completion.activeIndex + 1) % completion.items.length
      return true
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      completion.activeIndex =
        (completion.activeIndex - 1 + completion.items.length) % completion.items.length
      return true
    }
    if (event.key === 'Enter' || event.key === 'Tab') {
      event.preventDefault()
      insertCompletion(completion.items[completion.activeIndex])
      return true
    }
    if (event.key === 'Escape') {
      completion.visible = false
      return true
    }
    return false
  }

  // 补全列表可见但无匹配项时，检查是否在@上下文中按Enter
  if (completion.visible && event.key === 'Enter') {
    const editorInstance = editor.value
    if (!editorInstance) return false
    const { from } = editorInstance.state.selection
    const textBefore = editorInstance.state.doc.textBetween(Math.max(0, from - 64), from, ' ')
    const match = textBefore.match(/@([\u4e00-\u9fa5\w-]{0,30})$/)
    if (match) {
      event.preventDefault()
      entityCreateDialog.initialName = match[1] || ''
      entityCreateDialog.visible = true
      // 保存 @query 的位置，以便创建后替换
      entityCreateRange.from = from - match[0].length + (match[0].startsWith(' ') ? 1 : 0)
      entityCreateRange.to = from
      completion.visible = false
      return true
    }
  }

  return false
}

watch(
  () => props.readonly,
  (val) => {
    editor.value?.setEditable(!val)
  },
)

// 监听 modelValue 变化，同步更新编辑器内容
watch(
  () => props.modelValue,
  (value) => {
    console.log('[QyTipTapEditor] ========== modelValue changed ==========')
    console.log('[QyTipTapEditor] 新value长度:', value?.length || 0)
    console.log('[QyTipTapEditor] 新value预览:', value?.substring(0, 200) + '...')

    if (!editor.value) {
      console.log('[QyTipTapEditor] editor not ready yet')
      return
    }

    const next = value || ''
    if (!next) {
      console.log('[QyTipTapEditor] value is empty, skipping')
      return
    }

    try {
      // 尝试解析为 JSON
      const nextJson = JSON.parse(next)
      console.log('[QyTipTapEditor] JSON解析成功，类型:', typeof nextJson)
      console.log('[QyTipTapEditor] nextJson:', nextJson)

      const currentJson = editor.value.getJSON()
      console.log('[QyTipTapEditor] 当前编辑器内容:', currentJson)

      // 比较内容是否相同
      if (JSON.stringify(nextJson) !== JSON.stringify(currentJson)) {
        console.log('[QyTipTapEditor] 内容不同，更新编辑器')
        editor.value.commands.setContent(nextJson, { emitUpdate: false })
        console.log('[QyTipTapEditor] 编辑器更新完成')

        // 检查更新后的DOM
        setTimeout(() => {
          const proseMirror = document.querySelector('.ProseMirror')
          console.log(
            '[QyTipTapEditor] 更新后的ProseMirror HTML:',
            proseMirror?.innerHTML?.substring(0, 500),
          )
        }, 100)
      } else {
        console.log('[QyTipTapEditor] 内容相同，跳过更新')
      }
    } catch (error) {
      console.log('[QyTipTapEditor] JSON解析失败:', error)
      console.log('[QyTipTapEditor] 尝试作为纯文本处理')
      // 不是 JSON，可能是纯文本，直接设置
      const currentText = editor.value.getText()
      if (next !== currentText) {
        console.log('[QyTipTapEditor] 纯文本模式，更新编辑器')
        editor.value.commands.setContent(next, { emitUpdate: false })
      }
    }
    console.log('[QyTipTapEditor] ===================')
  },
)

function scheduleCompletionUpdate(currentEditor: CoreEditor) {
  if (completionTimer) clearTimeout(completionTimer)
  completionTimer = setTimeout(() => {
    void updateCompletionFromSelection(currentEditor)
  }, 200)
}

async function updateCompletionFromSelection(currentEditor: CoreEditor) {
  const { from } = currentEditor.state.selection
  const textBefore = currentEditor.state.doc.textBetween(Math.max(0, from - 64), from, ' ')

  // 统一使用 @ 前缀触发补全
  const match = textBefore.match(/@([\u4e00-\u9fa5\w-]{0,30})$/)
  if (!match) {
    completion.visible = false
    return
  }

  completion.prefix = '@'
  completion.query = match[1] || ''
  completion.from = Math.max(0, from - (completion.query.length + 1))
  completion.to = from

  const coords = currentEditor.view.coordsAtPos(from)
  completion.x = coords.left
  completion.y = coords.bottom + 6

  // 搜索所有类型的实体
  const items = await searchAllEntities(completion.query)
  completion.items = items
  completion.activeIndex = 0
  completion.visible = true // 始终显示，包括无匹配时
}

async function searchAllEntities(query: string): Promise<KeywordInfo[]> {
  if (!props.projectId) {
    return buildMockAllEntities(query)
  }

  try {
    // 调用统一的搜索API，返回所有类型的实体
    const keyword = `@${query}`
    const resp = await searchProjectKeywords(props.projectId, keyword, 10)
    const payload = resp as unknown as {
      data?: {
        suggestions?: Array<{ type?: string; id?: string; name?: string; summary?: string }>
      }
      suggestions?: Array<{ type?: string; id?: string; name?: string; summary?: string }>
    }
    const suggestions = payload.data?.suggestions || payload.suggestions || []

    return suggestions
      .map((item) => ({
        id: item.id,
        type: normalizeKeywordType(item.type, 'character'),
        name: item.name || '',
        summary: item.summary,
      }))
      .filter((item) => item.name)
      .slice(0, 10)
  } catch {
    return buildMockAllEntities(query)
  }
}

function normalizeKeywordType(
  rawType: string | undefined,
  fallback: KeywordInfo['type'],
): KeywordInfo['type'] {
  if (
    rawType === 'character' ||
    rawType === 'location' ||
    rawType === 'item' ||
    rawType === 'concept'
  ) {
    return rawType
  }
  return fallback
}

function buildMockAllEntities(query: string): KeywordInfo[] {
  // 混合所有类型的模拟数据
  const allEntities = [
    { type: 'character' as const, name: '李明', summary: '主角' },
    { type: 'character' as const, name: '王芳', summary: '配角' },
    { type: 'location' as const, name: '青石镇', summary: '开场地点' },
    { type: 'location' as const, name: '北境雪原', summary: '第二章场景' },
    { type: 'item' as const, name: '古卷', summary: '神秘道具' },
    { type: 'item' as const, name: '青铜钥匙', summary: '开启宝库' },
  ]

  return allEntities
    .filter((e) => {
      if (!query) return true
      return e.name.includes(query) || (e.summary && e.summary.includes(query))
    })
    .slice(0, 10)
    .map((e, idx) => ({ ...e, id: `${e.type}-${idx}` }))
}

function insertCompletion(item: KeywordInfo) {
  if (!editor.value) return

  const from = completion.from || editor.value.state.selection.from
  const to = completion.to || editor.value.state.selection.from

  // 插入带 SmartKeyword mark 的内容
  editor.value
    .chain()
    .focus()
    .insertContentAt({ from, to }, [
      {
        type: 'text',
        text: `@${item.name}`,
        marks: [
          {
            type: 'smartKeyword',
            attrs: {
              keywordId: item.id || null,
              keywordType: item.type,
              keywordName: item.name,
            },
          },
        ],
      },
      { type: 'text', text: ' ' },
    ])
    .run()
  completion.visible = false
}

function handleEditorClick(event: MouseEvent) {
  const target = event.target as HTMLElement | null
  if (!target) return
  const keywordEl = target.closest('[data-smart-keyword]') as HTMLElement | null
  if (!keywordEl) {
    keywordCard.visible = false
    return
  }

  if (!(event.ctrlKey || event.metaKey)) {
    keywordCard.visible = false
    return
  }

  const type = (keywordEl.getAttribute('data-keyword-type') || 'character') as KeywordInfo['type']
  const name = keywordEl.getAttribute('data-keyword-name') || keywordEl.textContent || ''
  const id = keywordEl.getAttribute('data-keyword-id') || undefined
  keywordCard.keyword = { id, type, name }
  keywordCard.visible = true
  keywordCard.x = event.clientX + 12
  keywordCard.y = event.clientY + 12
}

function emitSelectionChange(currentEditor: CoreEditor) {
  const { from, to } = currentEditor.state.selection
  const text = currentEditor.state.doc.textBetween(from, to, '\n').trim()
  if (!text || from === to) {
    emit('selection-change', { text: '', from, to, x: 0, y: 0, visible: false })
    return
  }

  const coords = currentEditor.view.coordsAtPos(to)
  emit('selection-change', {
    text,
    from,
    to,
    x: coords.left,
    y: coords.top - 8,
    visible: true,
  })
}

function extractParagraphs(doc: unknown): ParagraphContent[] {
  // 清理内容，去除段落开头的多余空格，让 CSS text-indent 统一处理首行缩进
  const cleanedDoc = cleanParagraphLeadingSpaces(doc)
  const jsonString = JSON.stringify(cleanedDoc)

  // 返回单个段落，包含 TipTap JSON字符串
  return [
    {
      paragraphId: 'main',
      order: 0,
      content: jsonString,
      contentType: 'tiptap_json',
    },
  ]
}

/**
 * 清理段落开头的多余空格
 * 问题：用户输入的空格 + CSS text-indent 会导致双重缩进
 * 解决：去除段落开头的空格字符，让 text-indent 单独处理首行缩进
 */
function cleanParagraphLeadingSpaces(doc: unknown): unknown {
  if (!doc || typeof doc !== 'object') return doc

  const docObj = doc as { type?: string; content?: unknown[]; text?: string; marks?: unknown[] }

  // 如果是文本节点，去除开头空格
  if (docObj.type === 'text' && typeof docObj.text === 'string') {
    return {
      ...docObj,
      text: docObj.text.replace(/^ +/, ''),
    }
  }

  // 如果是段落节点，递归处理其内容
  if (docObj.type === 'paragraph' && Array.isArray(docObj.content)) {
    return {
      ...docObj,
      content: docObj.content.map(cleanParagraphLeadingSpaces),
    }
  }

  // 如果是文档节点，处理所有子节点
  if (Array.isArray(docObj.content)) {
    return {
      ...docObj,
      content: docObj.content.map(cleanParagraphLeadingSpaces),
    }
  }

  return doc
}

async function scanAndNotifyEntities(doc: unknown) {
  try {
    const { extractEntitiesFromTipTapContent } = await import('@/modules/writer/utils/entityParser')
    const refs = extractEntitiesFromTipTapContent(doc)
    emit('entity-scan', refs)
  } catch {
    // 静默失败，不影响保存流程
  }
}

// 获取选中的文本
function getSelectedText(): string {
  if (!editor.value) return ''
  const { from, to } = editor.value.state.selection
  return editor.value.state.doc.textBetween(from, to, ' ').trim()
}

// 处理补全中的创建请求
function handleCompletionCreate(query: string) {
  // 保存 @query 的位置，以便创建后替换
  entityCreateRange.from = completion.from
  entityCreateRange.to = completion.to
  completion.visible = false
  entityCreateDialog.initialName = query
  entityCreateDialog.visible = true
}

// 处理实体创建
async function handleEntityCreate(entity: {
  name: string
  type: string
  summary?: string
  alias?: string[]
  traits?: string[]
  roleTag?: string
  category?: string
}) {
  entityCreateDialog.visible = false
  if (!editor.value) return

  let createdId: string | undefined

  try {
    switch (entity.type) {
      case 'character': {
        const { characterApi } = await import('@/modules/writer/api/character')
        const resp = await characterApi.create(props.projectId, {
          projectId: props.projectId,
          name: entity.name,
          alias: entity.alias,
          traits: [...(entity.traits || []), ...(entity.roleTag ? [entity.roleTag] : [])],
          summary: entity.summary,
        })
        createdId = (resp as any)?.data?.id || (resp as any)?.id
        break
      }
      case 'location': {
        const { locationApi } = await import('@/modules/writer/api/location')
        const resp = await locationApi.create(props.projectId, {
          projectId: props.projectId,
          name: entity.name,
          description: entity.summary,
        })
        createdId = (resp as any)?.data?.id || (resp as any)?.id
        break
      }
      case 'concept': {
        const { conceptApi } = await import('@/modules/writer/api/concept')
        const resp = await conceptApi.create(props.projectId, {
          projectId: props.projectId,
          name: entity.name,
          summary: entity.summary,
          category: entity.category,
          alias: entity.alias,
        })
        createdId = (resp as any)?.data?.id || (resp as any)?.id
        break
      }
      default:
        console.warn('[QyTipTapEditor] 不支持的实体类型:', entity.type)
    }
  } catch (err) {
    console.error('[QyTipTapEditor] 创建实体失败:', err)
    // toast 提示
    try {
      const { message } = await import('@/design-system/services')
      message.error(`创建实体「${entity.name}」失败`)
    } catch {
      /* ignore */
    }
  }

  // 插入带 mark 的内容
  insertEntityMark(entity.name, entity.type, createdId)
}

function insertEntityMark(name: string, type: string, id?: string) {
  if (!editor.value) return

  const insertFrom = entityCreateRange.from
  const insertTo = entityCreateRange.to

  const markAttrs: Record<string, unknown> = {
    keywordType: type,
    keywordName: name,
  }
  if (id) markAttrs.keywordId = id

  const content = [
    {
      type: 'text' as const,
      text: `@${name}`,
      marks: [{ type: 'smartKeyword', attrs: markAttrs }],
    },
    { type: 'text' as const, text: ' ' },
  ]

  if (insertFrom > 0 && insertTo > insertFrom) {
    editor.value
      .chain()
      .focus()
      .deleteRange({ from: insertFrom, to: insertTo })
      .insertContentAt({ from: insertFrom, to: insertFrom }, content)
      .run()
  } else {
    editor.value.chain().focus().insertContent(content).run()
  }
}

onBeforeUnmount(() => {
  if (completionTimer) clearTimeout(completionTimer)
  editor.value?.destroy()
})
</script>

<style scoped>
.qy-tiptap-editor {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--editor-content-bg);
}
.qy-tiptap-toolbar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px;
  border-bottom: 1px solid var(--editor-border);
  background: var(--editor-bg-surface);
}
.qy-tiptap-toolbar button {
  border: 1px solid var(--editor-border);
  border-radius: 6px;
  background: var(--editor-content-bg);
  padding: 4px 8px;
  font-size: 12px;
  cursor: pointer;
}
.qy-tiptap-toolbar button.active {
  color: #fff;
  background: var(--editor-accent);
  border-color: var(--editor-accent);
}
.sep {
  width: 1px;
  height: 20px;
  background: var(--editor-bg-elevated);
}
.qy-tiptap-editor__content {
  flex: 1;
  overflow: auto;
  padding: 14px;
}
:deep(.ProseMirror) {
  min-height: 380px;
  outline: none;
  line-height: 1.75;
  color: var(--editor-content-fg);
  white-space: pre-wrap;
  word-break: break-word;
}
:deep(.ProseMirror p) {
  margin: 0;
  text-indent: 2em;
}
:deep(.ProseMirror h1),
:deep(.ProseMirror h2),
:deep(.ProseMirror h3),
:deep(.ProseMirror h4),
:deep(.ProseMirror h5),
:deep(.ProseMirror h6),
:deep(.ProseMirror blockquote),
:deep(.ProseMirror pre),
:deep(.ProseMirror ul),
:deep(.ProseMirror ol) {
  text-indent: 0;
}
:deep(.qy-smart-keyword) {
  border-bottom: 1px dashed var(--editor-accent);
  color: var(--editor-accent);
  cursor: pointer;
}
:deep(.qy-smart-keyword--character) {
  border-bottom-color: #3b82f6;
  color: #1d4ed8;
}
:deep(.qy-smart-keyword--location) {
  border-bottom-color: #10b981;
  color: #047857;
}
:deep(.qy-smart-keyword--item) {
  border-bottom-color: #f59e0b;
  color: #b45309;
}
</style>
