import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  aiDirectApi,
  isDirectModeEnabled,
  isUserProviderModeEnabled,
  hasSessionApiKey,
  hasUsableUserProviderConfig,
  userAIProviderApi,
  getAIRequest,
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
    health: vi.fn(),
  },
  isDirectModeEnabled: vi.fn(() => false),
  isUserProviderModeEnabled: vi.fn(() => false),
  hasSessionApiKey: vi.fn(() => false),
  hasUsableUserProviderConfig: vi.fn(() => true),
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
  getAIRequest: vi.fn(),
  postAIRequest: vi.fn(),
  putAIRequest: vi.fn(),
}))

vi.mock('../../config/provider', () => ({
  hasSessionApiKey,
  hasUsableUserProviderConfig,
  isUserProviderModeEnabled,
  loadAIProviderSettings: vi.fn(() => ({
    mode: 'system_remote',
    userProvider: {
      providerType: 'openai-compatible',
      baseURL: '',
      endpointPath: '/v1/chat/completions',
      model: '',
      apiKey: '',
      temperature: 0.7,
    },
  })),
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
  getAIRequest: (...args: unknown[]) => getAIRequest(...args),
  postAIRequest: (...args: unknown[]) => postAIRequest(...args),
  putAIRequest: (...args: unknown[]) => putAIRequest(...args),
}))

import {
  chatWithAI,
  checkAIProviderHealth,
  continueWriting,
  requestWriterAI,
  storyGenerate,
  updateSceneState,
} from '../ai'

describe('ai api facade', () => {
  beforeEach(() => {
    isUserProviderModeEnabled.mockReset()
    isUserProviderModeEnabled.mockReturnValue(false)
    isDirectModeEnabled.mockReset()
    isDirectModeEnabled.mockReturnValue(false)
    postAIRequest.mockReset()
    putAIRequest.mockReset()
    getAIRequest.mockReset()
    aiDirectApi.chat.mockReset()
    aiDirectApi.health.mockReset()
    aiDirectApi.writing.continue.mockReset()
    hasSessionApiKey.mockReset()
    hasSessionApiKey.mockReturnValue(false)
    hasUsableUserProviderConfig.mockReset()
    hasUsableUserProviderConfig.mockReturnValue(true)
    userAIProviderApi.chat.mockReset()
    userAIProviderApi.writing.continue.mockReset()
    userAIProviderApi.story.generate.mockReset()
  })

  it('checks system remote provider health through the shared ai request helper', async () => {
    getAIRequest.mockResolvedValue({ status: 'ok' })

    const health = await checkAIProviderHealth({
      mode: 'system_remote',
      userProvider: {
        providerType: 'openai-compatible',
        baseURL: '',
        endpointPath: '/v1/chat/completions',
        model: '',
        apiKey: '',
        temperature: 0.7,
      },
    })

    expect(getAIRequest).toHaveBeenCalledWith('/api/v1/ai/health')
    expect(health.ok).toBe(true)
    expect(health.mode).toBe('system_remote')
  })

  it('checks user api provider health with explicit runtime config state', async () => {
    userAIProviderApi.chat.mockResolvedValue({ reply: 'OK' })
    hasSessionApiKey.mockReturnValue(true)

    const health = await checkAIProviderHealth({
      mode: 'user_api',
      userProvider: {
        providerType: 'openai-compatible',
        baseURL: 'http://127.0.0.1:11434',
        endpointPath: '/v1/chat/completions',
        model: 'local-model',
        apiKey: 'sk-****...****',
        temperature: 0.7,
      },
    })

    expect(userAIProviderApi.chat).toHaveBeenCalledWith('请只回复 OK，用于连接测试。', [])
    expect(health.ok).toBe(true)
    expect(health.hasRuntimeSecret).toBe(true)
  })

  it('allows user api health check without runtime secret for local providers', async () => {
    userAIProviderApi.chat.mockResolvedValue({ reply: 'OK' })
    hasSessionApiKey.mockReturnValue(false)

    const health = await checkAIProviderHealth({
      mode: 'user_api',
      userProvider: {
        providerType: 'openai-compatible',
        baseURL: 'http://127.0.0.1:11434',
        endpointPath: '/v1/chat/completions',
        model: 'local-model',
        apiKey: 'sk-****...****',
        temperature: 0.7,
      },
    })

    expect(userAIProviderApi.chat).toHaveBeenCalledWith('请只回复 OK，用于连接测试。', [])
    expect(health.ok).toBe(true)
    expect(health.configured).toBe(true)
    expect(health.hasRuntimeSecret).toBe(false)
    expect(health.message).toContain('未使用 API Key')
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

  it('generates writer single-document diff candidates through the unified facade', async () => {
    postAIRequest.mockResolvedValue({
      rewritten_text: '改写后的正文',
      usage: { total_tokens: 42 },
    })

    const result = await requestWriterAI({
      route: 'single_document_edit',
      mutationMode: 'single_document_diff',
      target: {
        kind: 'current_document',
        documentId: 'chapter-1',
        documentTitle: '雨夜',
      },
      context: {
        projectId: 'project-1',
        currentDocument: {
          documentId: 'chapter-1',
          documentTitle: '雨夜',
          sourceText: '原正文',
        },
        chapterTask: {
          goal: '完成第一次反击',
          readerPayoff: '读者看到主角拿回主动权',
          hook: '章末出现新的阻力',
        },
        assets: [],
        workflowSummary: ['节奏：压迫感'],
        evidence: [
          {
            id: 'current:chapter-1',
            label: '雨夜',
            source: 'current_document',
          },
        ],
        budget: {
          maxChars: 6000,
          truncated: false,
        },
      },
      workflow: 'write',
      skillId: 'commercial_loop',
      toolHintIds: ['scene_stage', 'assets'],
      requiresConfirmation: false,
      userVisibleSummary: '计划：对《雨夜》生成单章 diff。',
    })

    expect(postAIRequest).toHaveBeenCalledWith('/api/v1/ai/rewrite', {
      projectId: 'project-1',
      originalText: '原正文',
      rewriteMode: 'polish',
      instructions: expect.stringContaining('计划：对《雨夜》生成单章 diff。'),
    })
    expect(postAIRequest.mock.calls[0]?.[1].instructions).toContain('本章任务卡：')
    expect(postAIRequest.mock.calls[0]?.[1].instructions).toContain('极简 Agent：写作')
    expect(postAIRequest.mock.calls[0]?.[1].instructions).toContain('写作 Skill：商业爽文')
    expect(postAIRequest.mock.calls[0]?.[1].instructions).toContain('当前场景')
    expect(postAIRequest.mock.calls[0]?.[1].instructions).toContain('设定资产')
    expect(postAIRequest.mock.calls[0]?.[1].instructions).toContain('目标：完成第一次反击')
    expect(postAIRequest.mock.calls[0]?.[1].instructions).toContain(
      '读者收益：读者看到主角拿回主动权',
    )
    expect(result.generatedText).toBe('改写后的正文')
    expect(result.requiresConfirmation).toBe(true)
  })

  it('keeps writer continue intent inside the unified facade', async () => {
    postAIRequest.mockResolvedValue({
      generated_text: '续写后的正文',
    })

    const result = await requestWriterAI({
      route: 'single_document_edit',
      mutationMode: 'single_document_diff',
      target: {
        kind: 'current_document',
        documentId: 'chapter-1',
      },
      context: {
        projectId: 'project-1',
        currentDocument: {
          documentId: 'chapter-1',
          documentTitle: '第一章',
          sourceText: '原正文',
        },
        assets: [],
        workflowSummary: ['节奏：压迫后反击'],
        sceneStage: {
          sceneTitle: '雨夜追杀',
          beatTitle: '旧友现身',
          beatStatus: 'active',
          goal: '逼主角做选择',
          conflict: '救人与守秘冲突',
        },
        evidence: [],
        budget: {
          maxChars: 6000,
          truncated: false,
        },
      },
      intent: {
        action: 'continue',
        targetLength: 350,
      },
      requiresConfirmation: false,
      userVisibleSummary: '继续写一段。',
    })

    expect(postAIRequest).toHaveBeenCalledWith('/api/v1/ai/generate', {
      projectId: 'project-1',
      currentText: '原正文',
      prompt: expect.stringContaining('继续写一段。'),
      continueLength: 350,
      type: 'continue',
    })
    expect(postAIRequest.mock.calls[0]?.[1].prompt).toContain('极简 Agent：写作')
    expect(postAIRequest.mock.calls[0]?.[1].prompt).toContain('写作 Skill：节奏强化')
    expect(result.generatedText).toBe('续写后的正文')
  })

  it('runs writer analysis requests through the unified facade', async () => {
    postAIRequest.mockResolvedValue({
      summary: '章节摘要',
      keyPoints: ['冲突升级'],
    })

    const result = await requestWriterAI({
      route: 'analysis',
      mutationMode: 'none',
      target: {
        kind: 'current_document',
        documentId: 'chapter-1',
      },
      context: {
        projectId: 'project-1',
        currentDocument: {
          documentId: 'chapter-1',
          documentTitle: '第一章',
          sourceText: '原正文',
        },
          assets: [],
          workflowSummary: ['节奏：压迫后反击'],
          sceneStage: {
            sceneTitle: '雨夜追杀',
            beatTitle: '旧友现身',
            beatStatus: 'active',
            goal: '逼主角做选择',
            conflict: '救人与守秘冲突',
          },
          evidence: [],
        budget: {
          maxChars: 6000,
          truncated: false,
        },
      },
      intent: {
        action: 'summarize',
      },
      requiresConfirmation: false,
      userVisibleSummary: '总结本章。',
    })

    expect(postAIRequest).toHaveBeenCalledWith(
      '/api/v1/ai/writing/summarize',
      expect.objectContaining({
        content: '原正文',
        projectId: 'project-1',
        chapterId: 'chapter-1',
        contextPrompt: expect.stringContaining('当前场景舞台：'),
      }),
    )
    expect(postAIRequest.mock.calls[0]?.[1].contextPrompt).toContain('当前拍：旧友现身')
    expect(postAIRequest.mock.calls[0]?.[1].contextPrompt).toContain('节奏：压迫后反击')
    expect(result.message).toContain('章节摘要')
  })

  it('keeps multi-document writer plans out of silent mutation', async () => {
    const result = await requestWriterAI({
      route: 'plan_only',
      mutationMode: 'multi_document_plan',
      target: {
        kind: 'search_results',
        label: '多章节计划',
      },
      context: {
        projectId: 'project-1',
        assets: [],
        workflowSummary: [],
        evidence: [],
        budget: {
          maxChars: 6000,
          truncated: false,
        },
      },
      requiresConfirmation: true,
      userVisibleSummary: '计划：识别为多章节请求。',
    })

    expect(postAIRequest).not.toHaveBeenCalled()
    expect(result.message).toBe('计划：识别为多章节请求。')
    expect(result.requiresConfirmation).toBe(true)
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
