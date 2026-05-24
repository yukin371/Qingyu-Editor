import type {
  StoryHarnessChangeRequestDecision,
  StoryHarnessChangeRequestPreview,
} from '@/modules/writer/stores/v3/storyHarnessStore'

export type StoryHarnessGateVariant = 'success' | 'warning' | 'info'
export type StoryHarnessWorkflowGateStatus = 'ready' | 'attention' | 'missing' | 'info'

export interface StoryHarnessWorkflowGateItem {
  key: 'prewrite' | 'postwrite' | 'revision' | 'volume'
  title: string
  status: StoryHarnessWorkflowGateStatus
  text: string
}

export interface StoryHarnessWorkflowGateInput {
  chapterId: string
  chapterTitle: string
  content: string
  activeCharacterCount: number
  activeRelationCount: number
  changeRequests: StoryHarnessChangeRequestPreview[]
  getChangeRequestDecision: (changeRequestId: string) => StoryHarnessChangeRequestDecision
}

export interface StoryHarnessWorkflowGateState {
  contentLength: number
  paragraphCount: number
  pendingChangeRequests: StoryHarnessChangeRequestPreview[]
  focusChangeRequests: StoryHarnessChangeRequestPreview[]
  summary: {
    label: string
    variant: StoryHarnessGateVariant
  }
  nextAction: string
  gates: StoryHarnessWorkflowGateItem[]
}

const countParagraphs = (content: string) =>
  content ? content.split(/\n\s*\n|(?<=。)\s*\n/).filter(Boolean).length : 0

const hasContextEvidence = (input: StoryHarnessWorkflowGateInput) =>
  input.activeCharacterCount > 0 || input.activeRelationCount > 0

export const buildStoryHarnessWorkflowGateState = (
  input: StoryHarnessWorkflowGateInput,
): StoryHarnessWorkflowGateState => {
  const normalizedContent = input.content.trim()
  const contentLength = normalizedContent.length
  const paragraphCount = countParagraphs(normalizedContent)
  const pendingChangeRequests = input.changeRequests.filter(
    (changeRequest) => input.getChangeRequestDecision(changeRequest.id) === 'pending',
  )
  const focusChangeRequests = pendingChangeRequests.filter(
    (changeRequest) => changeRequest.severity === 'focus',
  )
  const contextReady = hasContextEvidence(input)
  const title = input.chapterTitle || input.chapterId

  const summary = (() => {
    if (!input.chapterId) {
      return { label: '未绑定章节', variant: 'info' as const }
    }
    if (!contentLength) {
      return { label: '待写作', variant: 'warning' as const }
    }
    if (focusChangeRequests.length > 0) {
      return { label: '需审查', variant: 'warning' as const }
    }
    if (!contextReady) {
      return { label: '缺上下文', variant: 'warning' as const }
    }
    if (pendingChangeRequests.length > 0) {
      return { label: '有建议', variant: 'info' as const }
    }
    return { label: '可继续', variant: 'success' as const }
  })()

  const nextAction = (() => {
    if (!input.chapterId) {
      return '先绑定章节'
    }
    if (!contentLength) {
      return '先写正文'
    }
    if (focusChangeRequests.length > 0) {
      return `${focusChangeRequests.length} 条重点建议`
    }
    if (!contextReady) {
      return '缺角色 / 关系'
    }
    if (pendingChangeRequests.length > 0) {
      return '可先处理轻建议'
    }
    return '可审查'
  })()

  return {
    contentLength,
    paragraphCount,
    pendingChangeRequests,
    focusChangeRequests,
    summary,
    nextAction,
    gates: [
      {
        key: 'prewrite',
        title: '写前',
        status: input.chapterId ? (contextReady ? 'ready' : 'attention') : 'missing',
        text: input.chapterId
          ? contextReady
            ? `已绑定 ${title}`
            : `已绑定 ${title}，缺上下文`
          : '未绑定章节',
      },
      {
        key: 'postwrite',
        title: '正文',
        status: contentLength > 0 ? 'ready' : 'missing',
        text:
          contentLength > 0
            ? `${contentLength} 字符 · ${paragraphCount} 段`
            : '正文为空',
      },
      {
        key: 'revision',
        title: '建议',
        status:
          focusChangeRequests.length > 0
            ? 'attention'
            : pendingChangeRequests.length > 0
              ? 'info'
              : 'ready',
        text:
          focusChangeRequests.length > 0
            ? `${focusChangeRequests.length} 条重点建议`
            : pendingChangeRequests.length > 0
              ? `${pendingChangeRequests.length} 条轻建议`
              : '无重点建议',
      },
      {
        key: 'volume',
        title: '卷级',
        status: 'info',
        text: '待接入',
      },
    ],
  }
}
