import { beforeEach, describe, expect, it, vi } from 'vitest'

const { requestWriterAI } = vi.hoisted(() => ({
  requestWriterAI: vi.fn(),
}))

vi.mock('@/modules/ai/api', () => ({
  requestWriterAI: (...args: unknown[]) => requestWriterAI(...args),
}))

import {
  buildWriterProjectInitializationPromptForTest,
  generateWriterProjectInitialization,
} from '../projectInitialization.service'

describe('projectInitialization.service', () => {
  beforeEach(() => {
    requestWriterAI.mockReset()
  })

  it('builds a human-ai collaboration prompt instead of asking ai to write正文', () => {
    const prompt = buildWriterProjectInitializationPromptForTest({
      entryMode: 'idea',
      rawInput: '一个谨慎凡人在修仙界求生的故事',
      templateId: 'cautious-mortal',
      userPreference: {
        preferredGenres: ['凡人流修仙'],
        stylePreference: ['克制'],
        avoid: ['主角无脑莽'],
        updatedAt: 1,
      },
    })

    expect(prompt).toContain('人给方向，AI 补结构')
    expect(prompt).toContain('不能写正文')
    expect(prompt).toContain('模板：谨慎凡人流')
    expect(prompt).toContain('内置写作 Skill：')
  })

  it('requests initialization candidates through requestWriterAI and normalizes json result', async () => {
    requestWriterAI.mockResolvedValue({
      message: JSON.stringify({
        brief: {
          premise: '谨慎凡人在修仙界靠风险判断活下去',
          targetAudience: '凡人流读者',
          readerPromise: ['低调获利'],
          styleGuide: ['克制'],
          protagonistCore: '极度自保但有底线',
          worldRules: ['资源有限'],
          constraints: ['奇遇必须有代价'],
          avoid: ['主角无脑莽'],
        },
        candidates: [
          {
            label: '更商业',
            positioning: '每 3-5 章完成一次资源闭环',
            readerPromise: ['低调获利'],
            styleGuide: ['克制'],
            worldRules: ['资源有限'],
            constraints: ['强者不降智'],
            avoid: ['无脑莽'],
            goldenChapters: [
              {
                title: '资源缺口',
                summary: '建立缺口',
                hook: '危险机会出现',
                payoff: '读者理解主角必须冒险',
              },
            ],
          },
        ],
        suggestedAssets: [
          {
            type: 'character',
            name: '韩式主角',
            summary: '谨慎自保的凡人',
          },
        ],
      }),
      evidence: [],
      requiresConfirmation: true,
    })

    const result = await generateWriterProjectInitialization({
      projectId: 'project-1',
      entryMode: 'idea',
      rawInput: '谨慎凡人修仙',
      templateId: 'cautious-mortal',
    })

    expect(requestWriterAI).toHaveBeenCalledWith(
      expect.objectContaining({
        route: 'plan_only',
        mutationMode: 'none',
        workflow: 'organize',
        requiresConfirmation: true,
      }),
    )
    expect(result.brief.premise).toBe('谨慎凡人在修仙界靠风险判断活下去')
    expect(result.candidates[0]?.label).toBe('更商业')
    expect(result.goldenChapters[0]?.title).toBe('资源缺口')
    expect(result.suggestedAssets[0]).toMatchObject({
      type: 'character',
      name: '韩式主角',
    })
  })
})
