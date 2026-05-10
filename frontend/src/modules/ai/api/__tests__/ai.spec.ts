import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  aiDirectApi,
  isDirectModeEnabled,
  postAIRequest,
  putAIRequest,
} = vi.hoisted(() => ({
  aiDirectApi: {
    chat: vi.fn(),
    writing: {
      continue: vi.fn(),
      polish: vi.fn(),
      expand: vi.fn(),
      rewrite: vi.fn(),
      summarize: vi.fn(),
      proofread: vi.fn(),
    },
  },
  isDirectModeEnabled: vi.fn(() => false),
  postAIRequest: vi.fn(),
  putAIRequest: vi.fn(),
}))

vi.mock('../ai-direct', () => ({
  aiDirectApi,
  isDirectModeEnabled,
}))

vi.mock('../request', () => ({
  AI_REQUEST_TIMEOUT_MS: 65_000,
  postAIRequest: (...args: unknown[]) => postAIRequest(...args),
  putAIRequest: (...args: unknown[]) => putAIRequest(...args),
}))

import {
  chatWithAI,
  continueWriting,
  storyGenerate,
  updateSceneState,
} from '../ai'

describe('ai api facade', () => {
  beforeEach(() => {
    isDirectModeEnabled.mockReset()
    isDirectModeEnabled.mockReturnValue(false)
    postAIRequest.mockReset()
    putAIRequest.mockReset()
    aiDirectApi.chat.mockReset()
    aiDirectApi.writing.continue.mockReset()
  })

  it('routes chat requests through the shared backend ai helper when direct mode is off', async () => {
    postAIRequest.mockResolvedValue({
      reply: '助手回复',
      usage: { total_tokens: 12 },
    })

    const response = await chatWithAI('你好', [{ role: 'user', content: '上一条消息' }])

    expect(postAIRequest).toHaveBeenCalledWith('/api/v1/ai/chat', {
      message: '你好',
      history: [{ role: 'user', content: '上一条消息' }],
    })
    expect(response.reply).toBe('助手回复')
  })

  it('routes continue requests through the shared backend ai helper when direct mode is off', async () => {
    postAIRequest.mockResolvedValue({
      generated_text: '续写内容',
    })

    const response = await continueWriting('project-1', '正文', 300, '延续当前节奏')

    expect(postAIRequest).toHaveBeenCalledWith('/api/v1/ai/generate', {
      projectId: 'project-1',
      currentText: '正文',
      prompt: '正文\n\n续写要求：延续当前节奏',
      continueLength: 300,
      type: 'continue',
    })
    expect(response.generated_text).toBe('续写内容')
  })

  it('keeps story generation and scene updates on the shared ai request helper', async () => {
    postAIRequest.mockResolvedValue({ ok: true })
    putAIRequest.mockResolvedValue({ ok: true })

    await storyGenerate({
      projectId: 'project-1',
      documentId: 'doc-1',
      mode: 'suggest',
      instruction: '给出下一段建议',
    })
    await updateSceneState('doc-1', {
      sceneGoal: '推进冲突',
    })

    expect(postAIRequest).toHaveBeenCalledWith('/ai/story/generate', {
      projectId: 'project-1',
      documentId: 'doc-1',
      mode: 'suggest',
      instruction: '给出下一段建议',
    })
    expect(putAIRequest).toHaveBeenCalledWith('/ai/story/documents/doc-1/scene-state', {
      sceneGoal: '推进冲突',
    })
  })
})
