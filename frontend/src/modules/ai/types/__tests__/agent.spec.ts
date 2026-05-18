import { describe, expect, it } from 'vitest'
import { formatAIOrchestrationPrompt } from '../agent'

describe('AI agent protocol', () => {
  it('formats a domain-neutral tool registry without importing writer semantics', () => {
    const prompt = formatAIOrchestrationPrompt({
      domainId: 'external-system',
      workflow: 'review',
      systemPrompt: '你是一个可替换的 AI 编排层。',
      instructions: '检查当前对象。',
      contextPrompt: '对象摘要：A',
      toolRegistry: {
        domainId: 'external-system',
        label: '外部系统工具',
        tools: [
          {
            id: 'external.read',
            label: '读取对象',
            description: '读取外部系统对象摘要。',
            safety: 'read_only',
          },
        ],
      },
    })

    expect(prompt).toContain('业务域：external-system')
    expect(prompt).toContain('external.read')
    expect(prompt).not.toContain('章节')
    expect(prompt).not.toContain('正文 diff')
  })
})
