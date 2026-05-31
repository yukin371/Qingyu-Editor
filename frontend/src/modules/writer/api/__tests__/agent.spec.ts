import { beforeEach, describe, expect, it } from 'vitest'
import type { AgentResult, EditorContext, AIAgentConfig } from '../../types/agent'
import { sendIntent } from '../agent'

const testConfig: AIAgentConfig = {
  provider: 'openai',
  apiKey: 'test-key',
  baseUrl: 'https://api.example.com/v1',
  model: 'gpt-4',
}

const defaultCtx: EditorContext = {
  currentChapterId: '',
  cursorPosition: 0,
  selectedText: '',
  nearbyCharacters: [],
}

describe('agentApi', () => {
  let mockFn: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockFn = vi.fn()
    ;(window as any).go = {
      main: {
        App: {
          AgentProcessIntent: mockFn,
        },
      },
    }
  })

  it('calls AgentProcessIntent with correct arguments', async () => {
    const expectedResult: AgentResult = { content: '林雪', suggestions: [] }
    mockFn.mockResolvedValue(expectedResult)

    const result = await sendIntent('proj_001', '有哪些角色', defaultCtx, testConfig)

    expect(mockFn).toHaveBeenCalledTimes(1)
    const args = mockFn.mock.calls[0]
    expect(args[0]).toEqual(testConfig)
    expect(args[1]).toBe('proj_001')
    expect(args[2]).toBe('有哪些角色')
    expect(args[3]).toEqual(defaultCtx)
    expect(result).toEqual(expectedResult)
  })

  it('returns result with suggestions', async () => {
    mockFn.mockResolvedValue({
      content: '建议如下',
      suggestions: [{
        id: 'sug_001', type: 'entity_preview', action: 'create',
        targetEntity: 'character', targetId: '', content: '{"name":"赵衡"}',
        summary: '建议新建角色赵衡',
      }],
    })

    const result = await sendIntent('proj_001', '设计一个角色', defaultCtx, testConfig)

    expect(result.suggestions).toHaveLength(1)
    expect(result.suggestions![0].type).toBe('entity_preview')
  })

  it('throws when config is missing', async () => {
    await expect(
      sendIntent('proj_001', '测试', defaultCtx, undefined),
    ).rejects.toThrow()
  })

  it('propagates Wails binding errors', async () => {
    mockFn.mockRejectedValue(new Error('AI 服务不可用'))

    await expect(
      sendIntent('proj_001', '测试', defaultCtx, testConfig),
    ).rejects.toThrow('AI 服务不可用')
  })
})
