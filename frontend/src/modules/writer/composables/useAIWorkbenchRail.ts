import { computed, ref, watch, type Ref } from 'vue'
import {
  resolveWriterWorkflowTab,
  type WriterAIActionTrigger,
  type WriterAIApplyFeedback,
  type WriterAIApplyPayload,
  type WriterDraftProposal,
  type WriterResultCandidate,
  type WriterRevisionSeed,
  type WriterWorkbenchTab,
} from '@/modules/writer/types/workflow'

interface UseAIWorkbenchRailOptions {
  projectId: Ref<string>
  chapterId: Ref<string>
  actionTrigger: Ref<WriterAIActionTrigger | null>
  aiApplyFeedback: Ref<WriterAIApplyFeedback | null>
  draftProposals: Ref<WriterDraftProposal[]>
  activeTab: Ref<WriterWorkbenchTab>
  onApplyGeneratedText: (payload: WriterAIApplyPayload) => void
  onProposalDraft: (payload: WriterResultCandidate) => void
}

export const useAIWorkbenchRail = ({
  projectId,
  chapterId,
  actionTrigger,
  aiApplyFeedback,
  draftProposals,
  activeTab,
  onApplyGeneratedText,
  onProposalDraft,
}: UseAIWorkbenchRailOptions) => {
  const latestResultCandidate = ref<WriterResultCandidate | null>(null)
  const pendingApplyPayload = ref<WriterAIApplyPayload | null>(null)
  const revisionSeed = ref<WriterRevisionSeed | null>(null)

  const actionDrivenTab = computed<WriterWorkbenchTab | null>(() =>
    resolveWriterWorkflowTab(actionTrigger.value?.action),
  )

  const primaryDraftProposal = computed<WriterDraftProposal | null>(() => {
    const selectedProposal = draftProposals.value.find((proposal) => proposal.status === 'selected')
    if (selectedProposal) {
      return selectedProposal
    }

    return draftProposals.value.find((proposal) => proposal.status === 'draft') || null
  })

  const visibleResultCandidate = computed(() =>
    pendingApplyPayload.value ? null : latestResultCandidate.value,
  )

  const shouldCondensePrimaryProposal = computed(
    () => !!primaryDraftProposal.value && !!visibleResultCandidate.value,
  )

  const shouldCondenseResultCandidate = computed(
    () => !!visibleResultCandidate.value && !!primaryDraftProposal.value,
  )

  const shouldShowApplyFeedback = computed(
    () =>
      !!aiApplyFeedback.value &&
      !(primaryDraftProposal.value?.status === 'selected' && !!visibleResultCandidate.value),
  )

  const visibleApplyFeedback = computed(() =>
    shouldShowApplyFeedback.value ? aiApplyFeedback.value : null,
  )

  const proposalLifecycleFeedback = computed<{
    status: 'selected' | 'discarded'
    title: string
    detail: string
    source: string
  } | null>(() => {
    if (draftProposals.value.length === 0) {
      return null
    }

    const latestProposal = [...draftProposals.value].sort(
      (left, right) => right.updatedAt - left.updatedAt,
    )[0]
    if (!latestProposal) {
      return null
    }

    const latestStatus = latestProposal.status
    if (latestStatus !== 'selected' && latestStatus !== 'discarded') {
      return null
    }

    return {
      status: latestStatus,
      title:
        latestStatus === 'selected'
          ? `${proposalKindText(latestProposal.kind)}提案已保留`
          : `${proposalKindText(latestProposal.kind)}提案已移出`,
      detail:
        latestStatus === 'selected'
          ? `当前保留：${latestProposal.title}`
          : `已从 rail 中移除：${latestProposal.title}`,
      source: proposalSourceText(latestProposal.source),
    }
  })

  const shouldShowProposalLifecycleFeedback = computed(() => {
    if (!proposalLifecycleFeedback.value) {
      return false
    }

    if (aiApplyFeedback.value || visibleResultCandidate.value) {
      return false
    }
    return proposalLifecycleFeedback.value.status === 'discarded'
  })

  const visibleProposalLifecycleFeedback = computed(() =>
    shouldShowProposalLifecycleFeedback.value ? proposalLifecycleFeedback.value : null,
  )

  const hasWorkflowRail = computed(
    () =>
      !!shouldShowApplyFeedback.value ||
      !!shouldShowProposalLifecycleFeedback.value ||
      !!visibleResultCandidate.value ||
      !!primaryDraftProposal.value ||
      !!pendingApplyPayload.value,
  )

  const showEditorDiffStatus = computed(() => !!pendingApplyPayload.value)

  const diffModeText = computed(() => {
    const mode = pendingApplyPayload.value?.applyMode || actionTrigger.value?.applyMode
    if (mode === 'replace_document') return '整章改写'
    if (mode === 'insert_after_selection') return '插入选区后'
    if (mode === 'replace_selection') return '替换选区'
    if (mode === 'append_paragraph') return '追加段落'
    return '正文改写'
  })

  watch(
    [projectId, chapterId, () => actionTrigger.value?.id],
    ([nextProjectId, nextChapterId, nextActionTriggerId], previous) => {
      const [prevProjectId, prevChapterId, prevActionTriggerId] = previous
      if (
        nextProjectId !== prevProjectId ||
        nextChapterId !== prevChapterId ||
        nextActionTriggerId !== prevActionTriggerId
      ) {
        latestResultCandidate.value = null
        pendingApplyPayload.value = null
        revisionSeed.value = null
      }

      if (nextActionTriggerId !== prevActionTriggerId && actionDrivenTab.value) {
        activeTab.value = actionDrivenTab.value
      }
    },
  )

  watch(
    () => aiApplyFeedback.value?.updatedAt,
    (updatedAt, previousUpdatedAt) => {
      if (!updatedAt || updatedAt === previousUpdatedAt) {
        return
      }

      pendingApplyPayload.value = null
      latestResultCandidate.value = null
      revisionSeed.value = null
    },
  )

  const handleResultCandidate = (payload: WriterResultCandidate) => {
    latestResultCandidate.value = payload
  }

  const handleApplyPayload = (payload: WriterAIApplyPayload) => {
    pendingApplyPayload.value = payload
    revisionSeed.value = null
    onApplyGeneratedText(payload)

    const currentCandidate = latestResultCandidate.value
    if (
      !currentCandidate ||
      currentCandidate.generatedText.trim() !== payload.generatedText.trim() ||
      currentCandidate.sourceText.trim() !== payload.sourceText.trim()
    ) {
      latestResultCandidate.value = buildCandidateFromPayload(payload)
    }
  }

  const handleContinueRevision = () => {
    const revisionText = pendingApplyPayload.value?.generatedText?.trim() || ''
    if (!pendingApplyPayload.value || !revisionText) {
      return
    }

    revisionSeed.value = {
      id: Date.now(),
      text: revisionText,
      instructions: `基于当前候选继续修改，目标模式：${diffModeText.value}。`,
      applyMode: pendingApplyPayload.value.applyMode,
    }
    activeTab.value = 'chat'
  }

  const handlePromoteToProposal = () => {
    if (!visibleResultCandidate.value) {
      return
    }

    onProposalDraft(visibleResultCandidate.value)
    latestResultCandidate.value = null
  }

  return {
    revisionSeed,
    pendingApplyPayload,
    primaryDraftProposal,
    shouldCondensePrimaryProposal,
    visibleResultCandidate,
    shouldCondenseResultCandidate,
    visibleApplyFeedback,
    visibleProposalLifecycleFeedback,
    hasWorkflowRail,
    showEditorDiffStatus,
    diffModeText,
    handleResultCandidate,
    handleApplyPayload,
    handleContinueRevision,
    handlePromoteToProposal,
  }
}

function buildCandidateFromPayload(payload: WriterAIApplyPayload): WriterResultCandidate {
  const resolvedTab = resolveWriterWorkflowTab(payload.action)
  const title =
    payload.applyMode === 'replace_document'
      ? 'AI 整章改写结果'
      : payload.applyMode === 'replace_selection'
        ? 'AI 选区替换结果'
        : payload.applyMode === 'insert_after_selection'
          ? 'AI 续写结果'
          : 'AI 正文结果'

  return {
    source:
      resolvedTab === 'summary' || resolvedTab === 'review' || resolvedTab === 'rewrite'
        ? resolvedTab
        : 'chat',
    action: payload.action,
    title,
    summary: payload.generatedText.slice(0, 72) || '已生成新的正文结果。',
    generatedText: payload.generatedText,
    sourceText: payload.sourceText,
  }
}

function proposalKindText(kind: WriterDraftProposal['kind']) {
  return kind === 'chapter-direction' ? '方向' : '正文'
}

function proposalSourceText(source: WriterDraftProposal['source']) {
  if (source === 'summary-workbench') return '总结'
  if (source === 'review-workbench') return '审校'
  if (source === 'rewrite-workbench') return '改写'
  return '对话'
}
