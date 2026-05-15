import { describe, expect, it } from 'vitest'
import {
  buildWriterAgentContext,
  formatWriterProofreadIssues,
  resolveWriterAnalysisText,
} from '../writerAIAnalysis'

describe('writerAIAnalysis', () => {
  it('builds writer agent context with fallbacks', () => {
    expect(
      buildWriterAgentContext({
        sessionId: 'session-1',
        projectId: '',
        currentDocumentId: 'chapter-1',
        currentDocumentTitle: '第一章',
        currentSourceText: '正文',
        selectedContext: null,
      }),
    ).toMatchObject({
      projectId: 'session-1',
      currentDocumentId: 'chapter-1',
      currentDocumentTitle: '第一章',
      currentSourceText: '正文',
    })
  })

  it('formats proofread issues and resolves analysis text', () => {
    const issues = [{ message: '建议调整语序', suggestions: ['主语前置'] }]
    expect(formatWriterProofreadIssues(issues)).toContain('1. 建议调整语序')
    expect(resolveWriterAnalysisText({ proofreadIssues: issues })).toContain('主语前置')
    expect(resolveWriterAnalysisText({ summary: '摘要', keyPoints: ['要点'] })).toBe('摘要')
    expect(resolveWriterAnalysisText({ keyPoints: ['要点1', '要点2'] })).toContain('要点1')
  })
})
