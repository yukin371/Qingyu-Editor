import type { ChatContextSnippet } from '@/modules/writer/components/editor/ai/types'
import type { WriterDocumentAgentContext } from '@/modules/writer/services/writerDocumentAgent.service'

export interface WriterProofreadIssueLike {
  message?: string
  suggestions?: string[]
}

export function buildWriterAgentContext(params: {
  sessionId?: string
  projectId?: string | null
  currentDocumentId?: string | null
  currentDocumentTitle?: string | null
  currentSourceText?: string | null
  selectedContext?: ChatContextSnippet | null
}): WriterDocumentAgentContext {
  return {
    projectId: params.projectId || params.sessionId,
    currentDocumentId: params.currentDocumentId || null,
    currentDocumentTitle: params.currentDocumentTitle || null,
    currentSourceText: params.currentSourceText || '',
    selectedContext: params.selectedContext || null,
  }
}

export function formatWriterProofreadIssues(issues: WriterProofreadIssueLike[]): string {
  return issues
    .map((issue, index) => {
      const suggestions =
        Array.isArray(issue.suggestions) && issue.suggestions.length > 0
          ? ` 建议：${issue.suggestions.join('；')}`
          : ''
      return `${index + 1}. ${issue.message || '检测到可优化项。'}${suggestions}`
    })
    .join('\n')
}

export function resolveWriterAnalysisText(params: {
  summary?: string
  keyPoints?: string[]
  proofreadIssues?: WriterProofreadIssueLike[]
}): string {
  if (params.proofreadIssues) {
    return formatWriterProofreadIssues(params.proofreadIssues)
  }
  return params.summary || params.keyPoints?.join('\n') || ''
}
