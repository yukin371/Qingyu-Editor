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
      return '先绑定目标章节，再生成审查证据。'
    }
    if (!contentLength) {
      return '先写入正文，gate 只做提醒，不阻塞作者继续创作。'
    }
    if (focusChangeRequests.length > 0) {
      return `优先查看 ${focusChangeRequests.length} 条重点 Change Request。`
    }
    if (!contextReady) {
      return '补齐角色或关系切片后，审查包会更可靠。'
    }
    if (pendingChangeRequests.length > 0) {
      return '可继续写作，也可以先处理轻量建议。'
    }
    return '当前章节证据可进入审查包预览。'
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
        title: '写前目标',
        status: input.chapterId ? (contextReady ? 'ready' : 'attention') : 'missing',
        text: input.chapterId
          ? contextReady
            ? `已绑定 ${title}，并挂入当前上下文切片。`
            : `已绑定 ${title}，但缺少角色或关系上下文。`
          : '尚未绑定目标章节。',
      },
      {
        key: 'postwrite',
        title: '写后正文',
        status: contentLength > 0 ? 'ready' : 'missing',
        text:
          contentLength > 0
            ? `正文 ${contentLength} 字符，${paragraphCount} 段进入审查范围。`
            : '正文为空，暂不具备写后审查证据。',
      },
      {
        key: 'revision',
        title: '修后建议',
        status:
          focusChangeRequests.length > 0
            ? 'attention'
            : pendingChangeRequests.length > 0
              ? 'info'
              : 'ready',
        text:
          focusChangeRequests.length > 0
            ? `仍有 ${focusChangeRequests.length} 条重点建议等待处理。`
            : pendingChangeRequests.length > 0
              ? `还有 ${pendingChangeRequests.length} 条轻量建议可选处理。`
              : '没有待处理的重点建议。',
      },
      {
        key: 'volume',
        title: '卷级审查',
        status: 'info',
        text: '当前只展示章节级 gate；卷级聚合等待后端正式 owner 接入。',
      },
    ],
  }
}
