import { describe, expect, it } from 'vitest'
import {
  buildDirectEditApplyPayload,
  buildDirectEditLoadingMessage,
  buildDirectEditResultCandidate,
  buildDirectEditUserPrompt,
} from '../writerAIDirectEdit'
import type { WriterResolvedDocumentTarget } from '@/modules/writer/services/writerDocumentAgent.service'

const target: WriterResolvedDocumentTarget = {
  status: 'ready',
  targetDocumentId: 'chapter-2',
  targetDocumentTitle: '第二章',
  requestLabel: '第二章',
  sourceText: '正文',
}

describe('writerAIDirectEdit', () => {
  it('builds direct edit user prompt and loading message', () => {
    expect(buildDirectEditUserPrompt('补强冲突', target, 'replace_document')).toContain('修改要求：补强冲突')
    expect(buildDirectEditLoadingMessage(target)).toContain('已定位到 第二章')
  })

  it('builds result candidate and apply payload', () => {
    expect(
      buildDirectEditResultCandidate({
        action: 'rewrite',
        label: '改写',
        generatedText: '新正文',
        sourceText: '旧正文',
      }),
    ).toMatchObject({
      source: 'rewrite',
      title: 'AI 直接改写结果',
      generatedText: '新正文',
    })

    expect(
      buildDirectEditApplyPayload({
        action: 'rewrite',
        sourceText: '旧正文',
        generatedText: '新正文',
        applyMode: 'replace_document',
        target,
      }),
    ).toMatchObject({
      targetDocumentId: 'chapter-2',
      targetDocumentTitle: '第二章',
      applyMode: 'replace_document',
    })
  })
})
