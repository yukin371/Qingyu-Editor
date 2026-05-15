import { describe, expect, it } from 'vitest'
import {
  buildAnalysisCandidate,
  buildChatRequestMessage,
  buildTargetCandidatesMeta,
  buildTargetStatusMeta,
  buildWriterCheckpointMeta,
  buildWriterPlanMeta,
  buildWriterRetrievalMeta,
  isCrossDocumentTarget,
  type DocumentTargetRoute,
} from '../writerAIChatMeta'
import type {
  WriterEditorPlan,
  WriterResolvedDocumentTarget,
} from '@/modules/writer/services/writerDocumentAgent.service'
import type { WriterPromptIntent } from '@/modules/writer/types/workflow'

function buildTarget(partial: Partial<WriterResolvedDocumentTarget> = {}): WriterResolvedDocumentTarget {
  return {
    status: 'ready',
    targetDocumentId: 'chapter-2',
    targetDocumentTitle: '第二章',
    requestLabel: '第二章',
    candidates: [],
    ...partial,
  }
}

function buildPlan(partial: Partial<WriterEditorPlan> = {}): WriterEditorPlan {
  return {
    route: 'single_document_edit',
    mutationMode: 'single_document_diff',
    intent: null,
    target: buildTarget(),
    retrievals: [],
    requiresConfirmation: false,
    userVisibleSummary: '已规划编辑步骤。',
    ...partial,
  }
}

describe('writerAIChatMeta', () => {
  it('builds analysis candidate for summarize intent', () => {
    const intent: WriterPromptIntent = { action: 'summarize', confidence: 0.8, kind: 'analysis' }
    expect(buildAnalysisCandidate(intent, '这是摘要内容', '正文')).toMatchObject({
      source: 'summary',
      action: 'summary',
      title: '章节方向提案',
    })
  })

  it('builds chat request message with context prefix', () => {
    expect(
      buildChatRequestMessage('帮我润色', {
        text: '原文片段',
        addedAt: 1,
        kind: 'selection',
      }),
    ).toContain('参考片段：原文片段')
  })

  it('builds document target meta blocks', () => {
    const route: DocumentTargetRoute = 'analysis'
    expect(
      buildTargetCandidatesMeta('看第二章', route, buildTarget({ candidates: [{ documentId: 'chapter-2', documentTitle: '第二章' }] })),
    ).toMatchObject({
      kind: 'document_target_candidates',
      route,
    })
    expect(buildTargetStatusMeta(buildTarget(), 'switching', '正在切换')).toMatchObject({
      kind: 'document_target_status',
      status: 'switching',
    })
  })

  it('builds writer plan, retrieval and checkpoint meta', () => {
    const plan = buildPlan({
      mutationMode: 'multi_document_plan',
      route: 'plan_only',
      requiresConfirmation: true,
      retrievals: [
        {
          kind: 'resolved_document',
          documentId: 'chapter-2',
          documentTitle: '第二章',
          reason: '唯一命中',
        },
      ],
    })

    expect(buildWriterPlanMeta(plan)).toMatchObject({
      kind: 'writer_plan_preview',
      status: 'needs_confirmation',
      operationLabel: '多章节修改计划',
    })
    expect(buildWriterRetrievalMeta(plan)).toMatchObject({
      kind: 'writer_retrieval_summary',
      statusText: '已整理 1 个上下文',
    })
    expect(buildWriterCheckpointMeta(buildTarget(), 'chapter-1', 'switching')).toMatchObject({
      kind: 'writer_apply_checkpoint',
      statusText: '切章挂 diff',
    })
  })

  it('detects cross-document targets', () => {
    expect(isCrossDocumentTarget(buildTarget(), 'chapter-1')).toBe(true)
    expect(isCrossDocumentTarget(buildTarget(), 'chapter-2')).toBe(false)
  })
})
