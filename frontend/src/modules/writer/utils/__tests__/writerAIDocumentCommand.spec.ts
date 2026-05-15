import { describe, expect, it } from 'vitest'
import { buildHandledDocumentCommandResult } from '../writerAIDocumentCommand'

describe('writerAIDocumentCommand', () => {
  it('builds handled document command result with fallback user message', () => {
    expect(
      buildHandledDocumentCommandResult({
        fallbackUserMessage: '/doc list',
        assistantMessage: '  已列出章节  ',
      }),
    ).toMatchObject({
      userMessage: '/doc list',
      assistantMessage: '已列出章节',
    })
  })

  it('prefers explicit user echo and preserves patch payload', () => {
    expect(
      buildHandledDocumentCommandResult({
        fallbackUserMessage: '/doc patch',
        userEcho: '执行 patch',
        patchPayload: {
          action: 'patch',
          sourceText: '旧文本',
          generatedText: '新文本',
        },
      }),
    ).toMatchObject({
      userMessage: '执行 patch',
      patchPayload: {
        action: 'patch',
        sourceText: '旧文本',
        generatedText: '新文本',
      },
    })
  })
})
