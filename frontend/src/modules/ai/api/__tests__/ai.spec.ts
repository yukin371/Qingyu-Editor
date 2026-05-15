import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  aiDirectApi,
  isDirectModeEnabled,
  isUserProviderModeEnabled,
  userAIProviderApi,
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
  isUserProviderModeEnabled: vi.fn(() => false),
  userAIProviderApi: {
    chat: vi.fn(),
    writing: {
      continue: vi.fn(),
      polish: vi.fn(),
      expand: vi.fn(),
      rewrite: vi.fn(),
      summarize: vi.fn(),
      proofread: vi.fn(),
    },
    story: {
      generate: vi.fn(),
    },
  },
  postAIRequest: vi.fn(),
  putAIRequest: vi.fn(),
}))

vi.mock('../../config/provider', () => ({
  isUserProviderModeEnabled,
}))

vi.mock('../ai-direct', () => ({
  aiDirectApi,
  isDirectModeEnabled,
}))

vi.mock('../ai-user-provider', () => ({
  userAIProviderApi,
}))

vi.mock('../request', () => ({
  AI_REQUEST_TIMEOUT_MS: 65_000,
  postAIRequest: (...args: unknown[]) => postAIRequest(...args),
  putAIRequest: (...args: unknown[]) => putAIRequest(...args),
}))

import { chatWithAI, continueWriting, storyGenerate, updateSceneState } from '../ai'

describe('ai api facade', () => {
  beforeEach(() => {
    isUserProviderModeEnabled.mockReset()
    isUserProviderModeEnabled.mockReturnValue(false)
    isDirectModeEnabled.mockReset()
    isDirectModeEnabled.mockReturnValue(false)
    postAIRequest.mockReset()
    putAIRequest.mockReset()
    aiDirectApi.chat.mockReset()
    aiDirectApi.writing.continue.mockReset()
    userAIProviderApi.chat.mockReset()
    userAIProviderApi.writing.continue.mockReset()
    userAIProviderApi.story.generate.mockReset()
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

  it('routes chat and continue requests through user provider when user api mode is enabled', async () => {
    isUserProviderModeEnabled.mockReturnValue(true)
    userAIProviderApi.chat.mockResolvedValue({ reply: '本地模型回复' })
    userAIProviderApi.writing.continue.mockResolvedValue({ generated_text: '本地续写' })

    const chat = await chatWithAI('你好')
    const continuation = await continueWriting('project-1', '正文')

    expect(userAIProviderApi.chat).toHaveBeenCalledWith('你好', undefined)
    expect(userAIProviderApi.writing.continue).toHaveBeenCalledWith(
      'project-1',
      '正文',
      200,
      undefined,
    )
    expect(postAIRequest).not.toHaveBeenCalled()
    expect(chat.reply).toBe('本地模型回复')
    expect(continuation.generated_text).toBe('本地续写')
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

  it('routes story generation through user provider when user api mode is enabled', async () => {
    isUserProviderModeEnabled.mockReturnValue(true)
    userAIProviderApi.story.generate.mockResolvedValue({
      content: '给出下一段建议',
      data: { content: '给出下一段建议' },
    })

    const response = await storyGenerate({
      projectId: 'project-1',
      documentId: 'doc-1',
      mode: 'suggest',
      instruction: '给出下一段建议',
    })

    expect(userAIProviderApi.story.generate).toHaveBeenCalledWith({
      projectId: 'project-1',
      documentId: 'doc-1',
      mode: 'suggest',
      instruction: '给出下一段建议',
    })
    expect(postAIRequest).not.toHaveBeenCalled()
    expect(response).toEqual({
      content: '给出下一段建议',
      data: { content: '给出下一段建议' },
    })
  })
})
