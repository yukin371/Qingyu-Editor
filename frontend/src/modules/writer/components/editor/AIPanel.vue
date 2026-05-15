<template>
  <div
    class="ai-panel"
    :class="{
      'is-mobile': isMobile,
      'is-tablet': isTablet,
      'is-desktop': isDesktop,
    }"
    :style="panelStyle"
  >
    <!-- 面板内容 -->
    <div class="ai-content">
      <!-- 对话工具栏 -->
      <AIConversationToolbar
        v-model:currentId="currentConversationId"
        :conversation-list="conversationList"
        :disabled="isTyping"
        @clear="handleClearConversation"
        @create="handleCreateConversation"
        @rename="handleRenameConversation"
        @delete="handleDeleteConversation"
      />

      <!-- 选中内容提示 -->
      <AISelectionNotice :notice="visibleSelectionNotice" />

      <!-- 消息列表区域 -->
      <AIChatMessages
        ref="chatMessagesRef"
        :messages="messages"
        :typing-text="typingText"
        :is-typing="isTyping"
        @select-document-target="handleSelectDocumentTarget"
      />

      <!-- 快捷操作卡片 -->
      <AIQuickActions
        v-if="messages.length === 0"
        :actions="quickActions"
        :disabled="isTyping"
        @select="handleQuickAction"
      />

      <!-- 输入框区域 -->
      <AIInputArea
        v-model="inputText"
        :context="selectedChatContext"
        :target-label="writerTargetLabel"
        :target-detail="writerTargetDetail"
        v-model:mode="interactionMode"
        :can-edit="canEditDirectly"
        :disabled="isTyping"
        :placeholder="t('ai.inputPlaceholder', '输入消息...')"
        :hint="t('ai.hint', '按 Enter 发送，Shift + Enter 换行')"
        @send="handleSend"
        @clear-context="handleClearSelectedContext"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick, onBeforeUnmount } from 'vue'
import { useDebounce } from '@/composables/useDebounce'
import { useI18n } from '@/composables/useI18n'
import { useBreakpoints } from '@/composables/useBreakpoints'
import { useChatHistory } from '@/composables/useChatHistory'
import { useTypewriter } from '@/composables/useTypewriter'
import { message } from '@/design-system/services'
import { QUICK_ACTION_PROMPTS, getQuickActionPrompt } from '@/utils/mockAIResponse'
import {
  chatWithAI,
  continueWriting,
  polishText,
  expandText,
  rewriteText,
  summarizeText,
  proofreadText,
} from '@/modules/ai/api'
import { executeWriterDocumentCommand } from '@/modules/writer/services/documentToolCommands.service'
import {
  writerDocumentAgentService,
  type WriterEditorPlan,
  type WriterResolvedDocumentTarget,
} from '@/modules/writer/services/writerDocumentAgent.service'
import { resolveWriterAIErrorState } from '@/modules/writer/utils/writerAIError'

type EditorApplyMode =
  | 'replace_selection'
  | 'insert_after_selection'
  | 'append_paragraph'
  | 'replace_document'
import type {
  WriterPromptIntent,
  WriterAIActionTrigger,
  WriterRevisionSeed,
  WriterResultCandidate,
  WriterWorkflowContext,
} from '@/modules/writer/types/workflow'
import {
  isWriterEditAction,
  resolveWriterEditApplyMode,
  resolveWriterPromptExecution,
} from '@/modules/writer/types/workflow'
import { mergeWriterAIInstructions } from '@/modules/writer/utils/writerAIContext'
import type { SidebarChapterSummary } from '@/modules/writer/composables/types'

// 子组件
import AIConversationToolbar from './ai/AIConversationToolbar.vue'
import AISelectionNotice from './ai/AISelectionNotice.vue'
import AIChatMessages from './ai/AIChatMessages.vue'
import AIQuickActions from './ai/AIQuickActions.vue'
import AIInputArea from './ai/AIInputArea.vue'

// 类型
import type {
  ChatMessage,
  ConversationMeta,
  SelectionNotice,
  SelectionNoticeStatus,
  ChatContextSnippet,
  QuickAction,
} from './ai/types'

// ==================== 类型定义 ====================
interface Props {
  sessionId?: string
  width?: number
  sourceText?: string
  actionTrigger?: WriterAIActionTrigger | null
  workflowContext?: WriterWorkflowContext | null
  revisionSeed?: WriterRevisionSeed | null
  chapters?: SidebarChapterSummary[]
  aiSummaryContextText?: string
}

interface Emits {
  (
    e: 'applyGeneratedText',
    payload: {
      action: string
      sourceText: string
      generatedText: string
      targetDocumentId?: string
      targetDocumentTitle?: string
      applyMode?:
        | 'replace_selection'
        | 'insert_after_selection'
        | 'append_paragraph'
        | 'replace_document'
    },
  ): void
  (e: 'resultCandidate', payload: WriterResultCandidate): void
}

// ==================== Props & Emits ====================
const props = withDefaults(defineProps<Props>(), {
  sessionId: 'default',
  width: 320,
})

const emit = defineEmits<Emits>()

// ==================== 国际化 ====================
const { t } = useI18n()

// ==================== 响应式断点 ====================
const breakpoints = useBreakpoints({
  mobile: 768,
  tablet: 1024,
  desktop: 1200,
})

const isMobile = breakpoints.smaller('mobile')
const isTablet = breakpoints.between('mobile', 'desktop')
const isDesktop = breakpoints.greaterOrEqual('desktop')

// ==================== 对话历史管理 ====================
const currentConversationId = ref('default')
const conversationList = ref<ConversationMeta[]>([])
const chatSessionKey = computed(() => `${props.sessionId}:${currentConversationId.value}`)
const {
  messages,
  addMessage: addBaseMessage,
  clearHistory,
  save,
  load,
  setSessionId,
} = useChatHistory(chatSessionKey.value)

function addMessage(
  role: ChatMessage['role'],
  content: string,
  typing = false,
  meta?: ChatMessage['meta'],
): ChatMessage {
  return addBaseMessage(
    role,
    content,
    typing,
    meta as Parameters<typeof addBaseMessage>[3],
  ) as ChatMessage
}

// ==================== 打字机效果 ====================
const typingText = ref('')
const typewriter = useTypewriter('', 30)

// ==================== UI状态 ====================
const inputText = ref('')
const isTyping = ref(false)
const interactionMode = ref<'chat' | 'edit'>('chat')
const chatMessagesRef = ref<InstanceType<typeof AIChatMessages>>()
const selectionNotice = ref<SelectionNotice | null>(null)
const selectedChatContext = ref<ChatContextSnippet | null>(null)
const selectedChatContextScope = ref<{
  sessionId: string
  workflowSignature: string
} | null>(null)

// ==================== 快捷操作 ====================
const quickActions = computed<QuickAction[]>(() => [
  { id: 'continue', ...QUICK_ACTION_PROMPTS.continue },
  { id: 'polish', ...QUICK_ACTION_PROMPTS.polish },
  { id: 'summary', ...QUICK_ACTION_PROMPTS.summary },
])

// ==================== 计算属性 ====================
const panelStyle = computed(() => {
  return {
    '--ai-panel-width': `${props.width}px`,
  }
})

const conversationStorageKey = computed(() => `ai-conversation-list-${props.sessionId}`)
const effectiveWorkflowContext = computed(
  () => props.actionTrigger?.context ?? props.workflowContext ?? null,
)
const effectiveWorkflowSignature = computed(() => effectiveWorkflowContext.value?.signature ?? '')
const canEditDirectly = computed(
  () =>
    !!effectiveWorkflowContext.value?.projectId ||
    !!selectedChatContext.value?.text.trim() ||
    !!props.sourceText?.trim(),
)
const visibleSelectionNotice = computed(() =>
  selectionNotice.value?.action === 'chat' ? null : selectionNotice.value,
)
const writerTargetLabel = computed(() => {
  const instruction = inputText.value.trim()
  if (instruction && writerDocumentAgentService.shouldForceCurrentDocumentTarget(instruction)) {
    return effectiveWorkflowContext.value?.chapterTitle
      ? `本章全文：${effectiveWorkflowContext.value.chapterTitle}`
      : '本章全文'
  }

  if (selectedChatContext.value?.kind === 'revision') {
    return interactionMode.value === 'edit' ? '候选稿继续修改' : '候选稿参考'
  }

  if (selectedChatContext.value?.kind === 'selection') {
    return interactionMode.value === 'edit' ? '选区片段' : '选区参考'
  }

  if (effectiveWorkflowContext.value?.chapterTitle) {
    return `本章全文：${effectiveWorkflowContext.value.chapterTitle}`
  }

  if (props.sourceText?.trim()) {
    return '本章全文'
  }

  return ''
})
const writerTargetDetail = computed(() => {
  if (!writerTargetLabel.value) {
    return ''
  }

  if (interactionMode.value === 'edit') {
    return '编辑类请求会生成正文 diff'
  }

  return '分析/聊天不会静默改正文'
})

// ==================== 对话管理方法 ====================
function loadConversations() {
  try {
    const raw = localStorage.getItem(conversationStorageKey.value)
    const parsed = raw ? JSON.parse(raw) : []
    const list = Array.isArray(parsed) ? parsed : []
    const deduped = list.filter((item, index, arr) => {
      if (!item?.id) return false
      return arr.findIndex((x) => x?.id === item.id) === index
    })
    conversationList.value =
      list.length > 0
        ? list
        : [
            {
              id: 'default',
              title: '默认对话',
              updatedAt: Date.now(),
            },
          ]
    if (deduped.length > 0) {
      conversationList.value = deduped
    }
  } catch {
    conversationList.value = [
      {
        id: 'default',
        title: '默认对话',
        updatedAt: Date.now(),
      },
    ]
  }
}

function saveConversations() {
  try {
    localStorage.setItem(conversationStorageKey.value, JSON.stringify(conversationList.value))
  } catch (error) {
    console.warn('[AIPanel] Failed to save conversations:', error)
  }
}

function ensureCurrentConversation() {
  if (!conversationList.value.some((item) => item.id === currentConversationId.value)) {
    currentConversationId.value = conversationList.value[0]?.id || 'default'
  }
}

function touchConversationTitle() {
  const index = conversationList.value.findIndex((item) => item.id === currentConversationId.value)
  if (index < 0) return
  const firstUserMessage = messages.value.find((item) => item.role === 'user')?.content || ''
  const nextTitle = firstUserMessage
    ? firstUserMessage.replace(/\s+/g, ' ').slice(0, 18)
    : `对话 ${index + 1}`
  conversationList.value[index] = {
    ...conversationList.value[index],
    title: nextTitle,
    updatedAt: Date.now(),
  }
  saveConversations()
}

function handleCreateConversation() {
  const id = `chat-${Date.now()}`
  conversationList.value.unshift({
    id,
    title: `新对话 ${conversationList.value.length + 1}`,
    updatedAt: Date.now(),
  })
  saveConversations()
  currentConversationId.value = id
}

function handleRenameConversation() {
  const current = conversationList.value.find((item) => item.id === currentConversationId.value)
  if (!current) return
  const nextTitle = window.prompt('请输入新的会话名称', current.title)?.trim()
  if (!nextTitle) return
  const idx = conversationList.value.findIndex((item) => item.id === currentConversationId.value)
  if (idx < 0) return
  conversationList.value[idx] = {
    ...conversationList.value[idx],
    title: nextTitle,
    updatedAt: Date.now(),
  }
  saveConversations()
}

function handleDeleteConversation() {
  if (conversationList.value.length <= 1) {
    message.warning('至少保留一个会话')
    return
  }
  const current = conversationList.value.find((item) => item.id === currentConversationId.value)
  if (!current) return
  if (!window.confirm(`确定删除会话「${current.title}」吗？`)) return
  const remaining = conversationList.value.filter((item) => item.id !== currentConversationId.value)
  conversationList.value = remaining
  saveConversations()
  currentConversationId.value = remaining[0]?.id || 'default'
}

function handleClearConversation() {
  if (!confirm(t('ai.clearConfirm', '确定要清空当前对话吗？'))) {
    return
  }

  clearHistory()
  inputText.value = ''
  selectionNotice.value = null
  selectedChatContext.value = null
  selectedChatContextScope.value = null
  interactionMode.value = 'chat'
}

// ==================== 选中提示管理 ====================
function updateSelectionNotice(
  action: string,
  selectedText: string,
  instructions: string | undefined,
  status: SelectionNoticeStatus,
) {
  const actionLabelMap: Record<string, string> = {
    continue: '续写',
    polish: '润色',
    expand: '扩写',
    rewrite: '改写',
  }
  const statusLabelMap: Record<SelectionNoticeStatus, string> = {
    pending: '已识别选中内容，等待执行',
    running: '正在处理选中内容...',
    done: '已完成并应用到编辑器',
    error: '处理失败，请重试',
  }
  selectionNotice.value = {
    action,
    actionLabel: actionLabelMap[action] || '处理',
    text: selectedText,
    instructions: instructions?.trim() || undefined,
    status,
    statusText: statusLabelMap[status],
  }
}

function buildAnalysisCandidate(
  intent: WriterPromptIntent,
  generatedText: string,
  sourceText: string,
): WriterResultCandidate {
  if (intent.action === 'summarize') {
    return {
      source: 'summary',
      action: 'summary',
      title: '章节方向提案',
      summary: generatedText.slice(0, 72) || '已生成新的摘要结果。',
      generatedText,
      sourceText,
    }
  }

  return {
    source: 'review',
    action: 'proofread',
    title: '审校建议提案',
    summary: generatedText.slice(0, 72) || '已生成新的审校建议。',
    generatedText,
    sourceText,
  }
}

function isSelectionContext(context: ChatContextSnippet | null | undefined): boolean {
  return context?.kind === 'selection'
}

function buildChatRequestMessage(instruction: string): string {
  const context = selectedChatContext.value
  if (!context?.text.trim()) {
    return instruction
  }

  const prefix = context.kind === 'revision' ? '参考候选稿' : '参考片段'
  return `${prefix}：${context.text}\n\n用户需求：${instruction}`
}

type DocumentTargetRoute = 'edit' | 'analysis'

interface DocumentTargetSelectionPayload {
  instruction: string
  route: DocumentTargetRoute
  documentId: string
  documentTitle?: string
}

function isCrossDocumentTarget(target: WriterResolvedDocumentTarget): boolean {
  const targetDocumentId = target.targetDocumentId?.trim()
  const currentDocumentId = effectiveWorkflowContext.value?.chapterId?.trim() || ''
  return !!targetDocumentId && !!currentDocumentId && targetDocumentId !== currentDocumentId
}

function buildTargetCandidatesMeta(
  instruction: string,
  route: DocumentTargetRoute,
  target: WriterResolvedDocumentTarget,
): ChatMessage['meta'] | undefined {
  if (!target.candidates?.length) {
    return undefined
  }

  return {
    kind: 'document_target_candidates',
    status: 'needs_selection',
    statusText: '命中了多个章节',
    requestLabel: target.requestLabel || '目标章节待确认',
    instruction,
    route,
    candidates: target.candidates,
  }
}

function buildTargetStatusMeta(
  target: WriterResolvedDocumentTarget,
  status: 'loading' | 'switching' | 'ready',
  statusText: string,
  detail?: string,
): ChatMessage['meta'] | undefined {
  const documentLabel = target.targetDocumentTitle?.trim() || target.targetDocumentId?.trim()
  if (!documentLabel) {
    return undefined
  }

  return {
    kind: 'document_target_status',
    status,
    statusText,
    documentLabel: `《${documentLabel}》`,
    detail,
  }
}

function buildWriterPlanMeta(plan: WriterEditorPlan): ChatMessage['meta'] {
  const targetLabel =
    plan.target.requestLabel ||
    plan.target.targetDocumentTitle ||
    plan.target.targetDocumentId ||
    (plan.mutationMode === 'chapter_create_plan' ? '新章节' : '目标章节')
  const operationLabel =
    plan.mutationMode === 'chapter_create_plan'
      ? '新增章节计划'
      : plan.mutationMode === 'multi_document_plan'
        ? '多章节修改计划'
        : plan.route === 'analysis'
          ? '章节分析计划'
          : '章节编辑计划'
  const executionMode =
    plan.route === 'plan_only'
      ? 'plan_only'
      : plan.requiresConfirmation
        ? 'confirm_first'
        : 'direct_apply'

  return {
    kind: 'writer_plan_preview',
    status: plan.requiresConfirmation ? 'needs_confirmation' : 'planned',
    statusText: plan.requiresConfirmation ? '需要确认' : '已规划',
    operationLabel,
    targetLabel,
    executionMode,
    requiresConfirmation: plan.requiresConfirmation,
    nextStep:
      plan.route === 'plan_only'
        ? '当前不会直接创建章节或批量写入正文；请确认目标和步骤后再生成逐章 diff。'
        : plan.userVisibleSummary,
  }
}

function buildWriterRetrievalMeta(plan: WriterEditorPlan): ChatMessage['meta'] | undefined {
  if (plan.retrievals.length === 0) {
    return undefined
  }

  return {
    kind: 'writer_retrieval_summary',
    status: 'ready',
    statusText: `已整理 ${plan.retrievals.length} 个上下文`,
    queryLabel: plan.target.requestLabel || '跨文件查找',
    targetDocumentId: plan.target.targetDocumentId,
    hits: plan.retrievals.map((item) => ({
      documentId: item.documentId || item.kind,
      documentTitle: item.documentTitle,
      reason: item.reason || '纳入本次 AI 上下文',
      excerpt: item.excerpt,
      selected: !!plan.target.targetDocumentId && item.documentId === plan.target.targetDocumentId,
    })),
  }
}

function buildWriterCheckpointMeta(
  target: WriterResolvedDocumentTarget,
  status: 'generated' | 'switching' | 'ready_for_review',
  detail?: string,
): ChatMessage['meta'] {
  const targetLabel =
    target.targetDocumentTitle || target.targetDocumentId || target.requestLabel || '目标章节'
  const isSwitching = status === 'switching'

  return {
    kind: 'writer_apply_checkpoint',
    status,
    statusText: isSwitching ? '切章挂 diff' : '正文 diff 已生成',
    targetLabel: targetLabel.startsWith('《') ? targetLabel : `《${targetLabel}》`,
    detail,
    stages: [
      { stage: 'planned', status: 'done', label: '规划目标' },
      { stage: 'generated', status: 'done', label: '生成正文' },
      {
        stage: 'switching',
        status: isCrossDocumentTarget(target) ? (isSwitching ? 'running' : 'done') : 'pending',
        label: '切换章节',
      },
      {
        stage: 'ready_for_review',
        status: status === 'ready_for_review' ? 'running' : 'pending',
        label: '等待审阅',
      },
    ],
  }
}

function appendTargetResolutionMessage(
  instruction: string,
  route: DocumentTargetRoute,
  target: WriterResolvedDocumentTarget,
) {
  addMessage(
    'assistant',
    target.assistantMessage || '当前没有可用的目标章节。',
    false,
    buildTargetCandidatesMeta(instruction, route, target),
  )
}

async function resolveDocumentTarget(instruction: string) {
  return writerDocumentAgentService.resolveTarget(instruction, buildWriterAgentContext())
}

function buildWriterAgentContext() {
  return {
    projectId: effectiveWorkflowContext.value?.projectId || props.sessionId,
    currentDocumentId: effectiveWorkflowContext.value?.chapterId || null,
    currentDocumentTitle: effectiveWorkflowContext.value?.chapterTitle || null,
    currentSourceText: props.sourceText || '',
    selectedContext: selectedChatContext.value,
  }
}

async function runResolvedAnalysis(
  instruction: string,
  intent: WriterPromptIntent,
  resolvedTarget: WriterResolvedDocumentTarget,
) {
  const sourceText = resolvedTarget.sourceText?.trim() || ''
  if (!sourceText) {
    addMessage('assistant', '当前没有可供分析的正文内容，请先确认目标章节。')
    return
  }

  addMessage('user', instruction)
  inputText.value = ''
  await scrollToBottom()

  isTyping.value = true
  try {
    const projectId = props.sessionId || 'demo-project'
    let generatedText = ''

    if (intent.action === 'proofread') {
      const proofread = await proofreadText(sourceText, {
        projectId,
      })
      generatedText = proofread.issues
        .map((issue, index) => {
          const suggestions =
            Array.isArray(issue.suggestions) && issue.suggestions.length > 0
              ? ` 建议：${issue.suggestions.join('；')}`
              : ''
          return `${index + 1}. ${issue.message || '检测到可优化项。'}${suggestions}`
        })
        .join('\n')
    } else {
      const response = await summarizeText(sourceText, {
        projectId,
        summaryType: 'detailed',
      })
      generatedText = response.summary || response.keyPoints.join('\n')
    }

    if (generatedText.trim()) {
      addMessage(
        'assistant',
        generatedText,
        false,
        isCrossDocumentTarget(resolvedTarget)
          ? buildTargetStatusMeta(
              resolvedTarget,
              'ready',
              '已读取目标章节并完成结果生成',
              '这是基于异章节正文生成的结果；若继续改写，将沿用该目标章节。',
            )
          : undefined,
      )
      emit('resultCandidate', buildAnalysisCandidate(intent, generatedText, sourceText))
    } else {
      addMessage('assistant', '未返回有效结果，请重试。')
    }

    if (selectedChatContext.value) handleClearSelectedContext()
    await scrollToBottom()
  } catch (error) {
    console.error('[AIPanel] Failed to get AI response:', error)
    const resolvedError = resolveWriterAIErrorState(error)
    addMessage('assistant', resolvedError.message, false, resolvedError.meta)
  } finally {
    isTyping.value = false
  }
}

async function requestEditIntent(
  projectId: string,
  sourceText: string,
  instruction: string,
  intent: WriterPromptIntent | null,
  applyMode: EditorApplyMode,
  baseInstructions?: string,
) {
  const action = intent?.action ?? 'rewrite'
  const replacementHint =
    applyMode === 'replace_document'
      ? '请直接输出可替换整章正文的完整版本。'
      : applyMode === 'replace_selection'
        ? '请直接输出可替换当前选中文本的完整版本。'
        : ''
  const mergedInstructions = mergeWriterAIInstructions(
    [
      instruction,
      baseInstructions || '',
      replacementHint,
    ],
    {
      workflowContext: effectiveWorkflowContext.value,
      aiSummaryContextText: props.aiSummaryContextText,
    },
  )

  if (action === 'continue') {
    const response = await continueWriting(
      projectId,
      sourceText,
      intent?.targetLength ?? 300,
      mergedInstructions || undefined,
    )
    return {
      emittedAction: 'continue' as const,
      label: '续写',
      generatedText: response.generated_text || '',
      applyMode,
    }
  }

  if (action === 'expand') {
    const response = await expandText(
      projectId,
      sourceText,
      mergedInstructions || undefined,
      intent?.targetLength,
    )
    return {
      emittedAction: 'expand' as const,
      label: '扩写',
      generatedText: response.expanded_text || response.rewritten_text || '',
      applyMode,
    }
  }

  const response = await rewriteText(
    projectId,
    sourceText,
    'polish',
    mergedInstructions || undefined,
  )
  return {
    emittedAction: 'rewrite' as const,
    label: '改写',
    generatedText: response.rewritten_text || response.polished_text || '',
    applyMode,
  }
}

// ==================== 消息发送方法 ====================
async function sendMessage(content: string) {
  if (!content.trim() || isTyping.value) return

  const trimmedContent = content.trim()
  const documentCommand = await executeWriterDocumentCommand(trimmedContent, {
    projectId: effectiveWorkflowContext.value?.projectId || props.sessionId,
    currentDocumentId: effectiveWorkflowContext.value?.chapterId || null,
    currentDocumentTitle: effectiveWorkflowContext.value?.chapterTitle || null,
    currentSourceText: props.sourceText || '',
  })

  if (documentCommand.handled) {
    addMessage('user', documentCommand.userEcho || trimmedContent)
    inputText.value = ''
    await scrollToBottom()

    if (documentCommand.assistantMessage?.trim()) {
      addMessage(
        'assistant',
        documentCommand.assistantMessage,
        false,
        documentCommand.assistantMeta,
      )
    }

    if (documentCommand.patchPayload) {
      emit('applyGeneratedText', documentCommand.patchPayload)
    }

    await scrollToBottom()
    return
  }

  const editorPlan = await writerDocumentAgentService.planWriterEditorRequest(
    trimmedContent,
    buildWriterAgentContext(),
  )
  if (
    editorPlan.route === 'plan_only' &&
    !(
      editorPlan.target.candidates?.length &&
      editorPlan.target.assistantMessage?.includes('命中了多个章节')
    )
  ) {
    addMessage('user', trimmedContent)
    inputText.value = ''
    addMessage('assistant', editorPlan.userVisibleSummary, false, buildWriterPlanMeta(editorPlan))
    await scrollToBottom()
    return
  }

  const hasSelectionContext = isSelectionContext(selectedChatContext.value)
  const promptExecution = resolveWriterPromptExecution(trimmedContent, {
    interactionMode: interactionMode.value,
    canEditDirectly: canEditDirectly.value,
    hasSelectionContext,
  })
  const intent = promptExecution.intent

  if (promptExecution.route === 'edit') {
    await runDirectEdit(trimmedContent, intent, editorPlan)
    return
  }
  const requestMessage = buildChatRequestMessage(trimmedContent)
  const finalRequestMessage =
    mergeWriterAIInstructions([requestMessage], {
      workflowContext: effectiveWorkflowContext.value,
      aiSummaryContextText: props.aiSummaryContextText,
    }) || requestMessage

  // 添加用户消息
  addMessage('user', trimmedContent)

  // 清空输入框
  inputText.value = ''

  // 滚动到底部
  await scrollToBottom()

  // 调用真实AI API
  isTyping.value = true
  try {
    if (promptExecution.route === 'analysis' && intent) {
      const resolvedTarget = await resolveDocumentTarget(trimmedContent)
      if (resolvedTarget.status !== 'ready' || !resolvedTarget.sourceText?.trim()) {
        addMessage('user', trimmedContent)
        appendTargetResolutionMessage(trimmedContent, 'analysis', resolvedTarget)
        isTyping.value = false
        await scrollToBottom()
        return
      }
      isTyping.value = false
      await runResolvedAnalysis(trimmedContent, intent, resolvedTarget)
      return
    }

    // ── 通用聊天（无匹配意图或无选中文本）──
    // 构建对话历史
    const history = messages.value
      .slice(0, -1)
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }))

    const response = await chatWithAI(finalRequestMessage, history)
    const aiResponseText = response.reply || '抱歉，我没有理解您的问题。'

    // 通用对话：只在聊天气泡中显示，不触发编辑器候选
    addMessage('assistant', aiResponseText)
    if (selectedChatContext.value) {
      handleClearSelectedContext()
    }
    isTyping.value = false

    // 滚动到底部
    await scrollToBottom()
  } catch (error) {
    console.error('[AIPanel] Failed to get AI response:', error)
    const resolvedError = resolveWriterAIErrorState(error)
    addMessage('assistant', resolvedError.message, false, resolvedError.meta)
    isTyping.value = false
  }
}

async function runResolvedDirectEdit(
  instruction: string,
  intent: WriterPromptIntent | null,
  resolvedTarget: WriterResolvedDocumentTarget,
  plan?: WriterEditorPlan,
) {
  const context = selectedChatContext.value
  const sourceText = resolvedTarget.sourceText?.trim() || ''
  if (!sourceText) {
    addMessage('assistant', '当前没有可编辑的正文内容，请先确认目标章节。')
    return
  }
  const applyMode = (resolvedTarget.applyModeHint ||
    resolveWriterEditApplyMode(
      intent?.action ?? 'direct_edit',
      !!resolvedTarget.useSelectionContext,
    )) as EditorApplyMode

  isTyping.value = true
  addMessage(
    'user',
    `[直接修改正文]\n目标：${resolvedTarget.requestLabel || (applyMode === 'replace_document' ? '当前章节' : '当前片段')}\n修改要求：${instruction}`,
  )
  inputText.value = ''
  await scrollToBottom()

  try {
    const retrievalMeta = plan ? buildWriterRetrievalMeta(plan) : undefined
    if (retrievalMeta && plan?.route === 'search_then_edit') {
      addMessage('assistant', plan.userVisibleSummary, false, retrievalMeta)
      await scrollToBottom()
    }

    if (isCrossDocumentTarget(resolvedTarget)) {
      addMessage(
        'assistant',
        `已定位到 ${resolvedTarget.requestLabel || resolvedTarget.targetDocumentTitle || resolvedTarget.targetDocumentId}，正在生成可挂载到正文编辑器的结果。`,
        false,
        buildTargetStatusMeta(
          resolvedTarget,
          'loading',
          '已定位目标章节，正在生成结果',
          '生成完成后会自动提交给宿主切章并挂起正文 diff。',
        ),
      )
      await scrollToBottom()
    }

    const projectId = props.sessionId || 'demo-project'
    const editResult = await requestEditIntent(
      projectId,
      sourceText,
      instruction,
      intent,
      applyMode,
      context?.instructions?.trim() || '',
    )
    const generatedText = editResult.generatedText

    if (!generatedText.trim()) {
      addMessage('assistant', '未生成可应用的正文，请调整要求后重试。')
      return
    }

    addMessage(
      'assistant',
      generatedText,
      false,
      isCrossDocumentTarget(resolvedTarget)
        ? buildTargetStatusMeta(
            resolvedTarget,
            'switching',
            '已提交切章挂 diff',
            '宿主会自动切换到目标章节，并在正文编辑器中展示可接受/放弃的 diff。',
          )
        : undefined,
    )
    if (isCrossDocumentTarget(resolvedTarget)) {
      addMessage(
        'assistant',
        '正文 diff 已交给工作区处理。',
        false,
        buildWriterCheckpointMeta(
          resolvedTarget,
          'switching',
          'ProjectWorkspace 会切换到目标章节，并展示可接受/放弃的正文 diff。',
        ),
      )
    }
    emit('resultCandidate', {
      source: 'rewrite',
      action: editResult.emittedAction,
      title: `AI 直接${editResult.label}结果`,
      summary: generatedText.slice(0, 72) || '已生成新的正文版本。',
      generatedText,
      sourceText,
    })
    emit('applyGeneratedText', {
      action: editResult.emittedAction,
      sourceText,
      generatedText,
      applyMode: editResult.applyMode,
      targetDocumentId: resolvedTarget.targetDocumentId,
      targetDocumentTitle: resolvedTarget.targetDocumentTitle,
    })
    if (context) {
      handleClearSelectedContext()
    }
    await scrollToBottom()
  } catch (error) {
    console.error('[AIPanel] Failed to run direct edit:', error)
    addMessage('assistant', '直接修改失败，请稍后重试。')
  } finally {
    isTyping.value = false
  }
}

async function runDirectEdit(
  instruction: string,
  intent: WriterPromptIntent | null = null,
  plan?: WriterEditorPlan,
) {
  const resolvedTarget =
    plan?.target.status === 'ready' ? plan.target : await resolveDocumentTarget(instruction)
  if (resolvedTarget.status !== 'ready' || !resolvedTarget.sourceText?.trim()) {
    addMessage('user', instruction)
    appendTargetResolutionMessage(instruction, 'edit', resolvedTarget)
    return
  }

  await runResolvedDirectEdit(instruction, intent, resolvedTarget, plan)
}

function getGeneratedTextByAction(action: string, response: Record<string, any>): string {
  if (action === 'continue') return response.generated_text || ''
  if (action === 'polish') return response.polished_text || response.rewritten_text || ''
  if (action === 'expand') return response.expanded_text || response.rewritten_text || ''
  if (action === 'rewrite') return response.rewritten_text || response.polished_text || ''
  return ''
}

async function runSelectionAction(action: string, selectedText: string, instructions?: string) {
  if (!selectedText.trim()) return
  if (isTyping.value) return

  isTyping.value = true
  updateSelectionNotice(action, selectedText, instructions, 'running')
  try {
    const actionLabelMap: Record<string, string> = {
      continue: '续写',
      polish: '润色',
      expand: '扩写',
      rewrite: '改写',
    }
    const label = actionLabelMap[action] || '处理'
    const trimmedInstructions = (instructions || '').trim()
    const mergedInstructions = mergeWriterAIInstructions([trimmedInstructions], {
      workflowContext: effectiveWorkflowContext.value,
      aiSummaryContextText: props.aiSummaryContextText,
    })
    const userPrompt = trimmedInstructions
      ? `[${label}] ${selectedText}\n要求：${trimmedInstructions}`
      : `[${label}] ${selectedText}`
    addMessage('user', userPrompt)

    const projectId = props.sessionId || 'demo-project'
    let response: Record<string, any> = {}
    if (action === 'continue') {
      response = await continueWriting(
        projectId,
        selectedText,
        200,
        mergedInstructions || undefined,
      )
    } else if (action === 'polish') {
      response = await polishText(projectId, selectedText, mergedInstructions || undefined)
    } else if (action === 'expand') {
      response = await expandText(projectId, selectedText, mergedInstructions || undefined)
    } else if (action === 'rewrite') {
      response = await rewriteText(
        projectId,
        selectedText,
        'polish',
        mergedInstructions || undefined,
      )
    }

    const generatedText = getGeneratedTextByAction(action, response)
    if (!generatedText) {
      addMessage('assistant', '未生成有效内容，请稍后重试。')
      return
    }

    addMessage('assistant', generatedText)
    emit('resultCandidate', {
      source:
        action === 'continue' || action === 'expand' || action === 'polish' || action === 'rewrite'
          ? 'rewrite'
          : 'chat',
      action,
      title: `${label}结果`,
      summary: generatedText.slice(0, 72) || '已生成新的处理结果。',
      generatedText,
      sourceText: selectedText,
    })
    emit('applyGeneratedText', {
      action,
      sourceText: selectedText,
      generatedText,
      applyMode:
        action === 'continue' || action === 'expand'
          ? 'insert_after_selection'
          : 'replace_selection',
    })
    updateSelectionNotice(action, selectedText, instructions, 'done')
    await scrollToBottom()
  } catch (error) {
    console.error('[AIPanel] Failed to run selection action:', error)
    addMessage('assistant', '处理失败，请稍后重试。')
    updateSelectionNotice(action, selectedText, instructions, 'error')
  } finally {
    isTyping.value = false
  }
}

// ==================== 事件处理 ====================
function handleSend() {
  sendMessage(inputText.value)
}

function handleQuickAction(action: QuickAction) {
  const prompt = getQuickActionPrompt(action.id)
  sendMessage(prompt)
}

async function scrollToBottom() {
  await nextTick()
  chatMessagesRef.value?.scrollToBottom()
}

function handleClearSelectedContext() {
  selectedChatContext.value = null
  selectedChatContextScope.value = null
  interactionMode.value = 'chat'
  if (selectionNotice.value?.action === 'chat') {
    selectionNotice.value = null
  }
}

async function handleSelectDocumentTarget(payload: DocumentTargetSelectionPayload) {
  if (!payload.documentId?.trim() || isTyping.value) {
    return
  }

  const resolvedTarget = await writerDocumentAgentService.resolveTargetById(payload.documentId, {
    projectId: effectiveWorkflowContext.value?.projectId || props.sessionId,
    currentDocumentId: effectiveWorkflowContext.value?.chapterId || null,
    currentDocumentTitle: effectiveWorkflowContext.value?.chapterTitle || null,
    currentSourceText: props.sourceText || '',
    selectedContext: selectedChatContext.value,
  })

  if (resolvedTarget.status !== 'ready' || !resolvedTarget.sourceText?.trim()) {
    addMessage('assistant', resolvedTarget.assistantMessage || '目标章节读取失败，请稍后重试。')
    return
  }

  if (payload.route === 'analysis') {
    const promptExecution = resolveWriterPromptExecution(payload.instruction, {
      interactionMode: interactionMode.value,
      canEditDirectly: canEditDirectly.value,
      hasSelectionContext: isSelectionContext(selectedChatContext.value),
    })
    if (!promptExecution.intent) {
      addMessage('assistant', '当前需求未识别成可分析动作，请重新输入更明确的指令。')
      return
    }
    await runResolvedAnalysis(payload.instruction, promptExecution.intent, resolvedTarget)
    return
  }

  const promptExecution = resolveWriterPromptExecution(payload.instruction, {
    interactionMode: 'edit',
    canEditDirectly: canEditDirectly.value,
    hasSelectionContext: isSelectionContext(selectedChatContext.value),
  })
  await runResolvedDirectEdit(payload.instruction, promptExecution.intent, resolvedTarget)
}

// ==================== 生命周期 ====================
onMounted(() => {
  loadConversations()
  ensureCurrentConversation()
  setSessionId(chatSessionKey.value)

  // 加载历史对话
  load()

  // 滚动到底部
  if (messages.value.length > 0) {
    scrollToBottom()
  }
})

onBeforeUnmount(() => {
  flushDebouncedSave()
  // 保存对话历史
  save()
  saveConversations()

  // 停止打字机效果
  typewriter.stop()
})

// ==================== 监听 ====================
// 防抖保存（1秒防抖）
const { debouncedFn: debouncedSave, flush: flushDebouncedSave } = useDebounce(() => {
  save()
}, 1000)

// 监听消息变化，自动保存（使用防抖版本）
watch(
  () => messages.value,
  () => {
    debouncedSave()
    touchConversationTitle()
  },
  { deep: true },
)

watch(
  () => currentConversationId.value,
  () => {
    setSessionId(chatSessionKey.value)
    load()
    nextTick(() => {
      scrollToBottom()
    })
  },
)

watch(
  () => props.sessionId,
  () => {
    loadConversations()
    ensureCurrentConversation()
    setSessionId(chatSessionKey.value)
    load()
  },
)

watch(
  () => ({
    sessionId: props.sessionId,
    workflowSignature: effectiveWorkflowSignature.value,
  }),
  (nextScope) => {
    const currentScope = selectedChatContextScope.value
    if (!currentScope) return

    if (
      currentScope.sessionId === nextScope.sessionId &&
      currentScope.workflowSignature === nextScope.workflowSignature
    ) {
      return
    }

    handleClearSelectedContext()
  },
)

watch(
  () => props.actionTrigger?.id,
  async (newId, oldId) => {
    if (!newId || newId === oldId || !props.actionTrigger) return
    const { action, text, instructions } = props.actionTrigger
    if (!action || !text.trim()) return

    if (action === 'add_to_chat') {
      selectedChatContext.value = {
        text: text.trim(),
        instructions: instructions?.trim() || undefined,
        addedAt: Date.now(),
        kind: 'selection',
      }
      selectedChatContextScope.value = {
        sessionId: props.sessionId,
        workflowSignature: effectiveWorkflowSignature.value,
      }
      interactionMode.value = 'edit'
      selectionNotice.value = null
      return
    }

    if (action === 'chat') {
      await sendMessage(text)
      return
    }

    if (isWriterEditAction(action)) {
      updateSelectionNotice(action, text, instructions, 'pending')
      await runSelectionAction(action, text, instructions)
    }
  },
)

watch(
  () => props.revisionSeed?.id,
  (newId, oldId) => {
    if (!newId || newId === oldId || !props.revisionSeed?.text.trim()) {
      return
    }

    selectedChatContext.value = {
      text: props.revisionSeed.text.trim(),
      instructions: props.revisionSeed.instructions?.trim() || undefined,
      addedAt: Date.now(),
      kind: 'revision',
      applyMode: props.revisionSeed.applyMode,
    }
    selectedChatContextScope.value = {
      sessionId: props.sessionId,
      workflowSignature: effectiveWorkflowSignature.value,
    }
    interactionMode.value = 'edit'
    selectionNotice.value = null
  },
)
</script>

<style scoped lang="scss">
.ai-panel {
  --ai-panel-width: 320px;
  --ai-bg: #ffffff;
  --ai-bg-soft: #f8fafc;
  --ai-border: #e2e8f0;
  --ai-border-strong: #cbd5e1;
  --ai-text: #0f172a;
  --ai-text-muted: #64748b;
  --ai-user-bg: #2563eb;
  --ai-user-bg-hover: #1d4ed8;
  --ai-assistant-bg: #f1f5f9;
  --ai-accent-soft: #dbeafe;

  width: 100%;
  min-width: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: transparent;
  color: var(--ai-text);
  border-left: none;
  border-radius: 0;
  transition: all 0.3s ease;
  overflow: hidden;

  // 响应式布局
  &.is-mobile {
    width: 100%;
    border-left: none;
    border-top: 1px solid var(--ai-border);
    border-radius: 12px 12px 0 0;
  }

  &.is-tablet {
    --ai-panel-width: 280px;
  }
}

.ai-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(252, 253, 255, 0.72));
}

@media (prefers-reduced-motion: reduce) {
  .ai-panel {
    transition: none;
  }
}
</style>
