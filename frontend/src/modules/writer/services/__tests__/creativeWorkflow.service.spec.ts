import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Storage } from '@/utils/storage'

const memoryStorage = new Map<string, unknown>()

vi.mock('@/utils/storage', () => {
  const storage: Partial<Storage> = {
    get(key: string, defaultValue?: unknown) {
      return memoryStorage.has(key) ? structuredClone(memoryStorage.get(key)) : (defaultValue ?? null)
    },
    set(key: string, value: unknown) {
      memoryStorage.set(key, structuredClone(value))
    },
    remove(key: string) {
      memoryStorage.delete(key)
    },
    clear() {
      memoryStorage.clear()
    },
    has(key: string) {
      return memoryStorage.has(key)
    },
  }

  return {
    default: storage,
  }
})

import {
  buildCreativeWorkflowSnapshot,
  buildCreativeWorkflowSummaryLines,
  buildInspirationGate,
  listCreativeWorkflowTemplates,
  loadCreativeWorkflow,
  removeCreativeWorkflow,
  saveCreativeWorkflow,
} from '../creativeWorkflow.service'

describe('creativeWorkflow.service', () => {
  beforeEach(() => {
    memoryStorage.clear()
  })

  it('returns a blocked default workflow before template selection', async () => {
    const workflow = await loadCreativeWorkflow('project-alpha')

    expect(workflow.templateId).toBeNull()
    expect(workflow.goldenChapters).toHaveLength(3)
    expect(workflow.gate.status).toBe('blocked')
    expect(workflow.gate.missing).toEqual([
      '选择题材模板',
      '补充目标读者',
      '补充核心卖点承诺',
      '补充节奏合约',
    ])
  })

  it('hydrates template defaults and marks the gate ready after required fields are filled', async () => {
    const seeded = await saveCreativeWorkflow('project-alpha', {
      templateId: 'mystery',
      pitchLine: '一名新人调查员被迫进入会吃人的规则副本。',
    })

    expect(seeded.templateId).toBe('mystery')
    expect(seeded.goldenChapters[0].title).toBe('踏入异常')
    expect(seeded.targetAudience.length).toBeGreaterThan(0)
    expect(seeded.corePromises.length).toBeGreaterThan(0)
    expect(seeded.paceContract).toContain('第三章')
    expect(seeded.gate.status).toBe('ready')
  })

  it('persists manual edits for promises, audience and golden chapters', async () => {
    await saveCreativeWorkflow('project-alpha', {
      templateId: 'building',
    })

    const updated = await saveCreativeWorkflow('project-alpha', {
      targetAudience: ['喜欢经营闭环', '偏好资源增长可视化'],
      corePromises: ['前三章看到建设成果'],
      paceContract: '第一卷先做资源闭环，再上人口增长。',
      goldenChapters: [
        {
          chapterNumber: 1,
          title: '接手烂摊子',
          summary: '开局就让主角面对债务、饥荒和人心涣散。',
          hook: '用一份快要见底的库存表建立压力。',
          payoff: '读者明确知道逆转后会有多爽。',
        },
        {
          chapterNumber: 2,
          title: '核心资源到位',
          summary: '金手指与本地匠人形成闭环。',
          hook: '优势一出现就要拿来解决当前危机。',
          payoff: '从无计可施推进到可以试一次。',
        },
        {
          chapterNumber: 3,
          title: '第一座工坊',
          summary: '先交付第一份看得见的建设成果。',
          hook: '成果引出竞争势力注意。',
          payoff: '读者拿到第一轮正反馈。',
        },
      ],
    })

    expect(updated.targetAudience).toEqual(['喜欢经营闭环', '偏好资源增长可视化'])
    expect(updated.corePromises).toEqual(['前三章看到建设成果'])
    expect(updated.goldenChapters[2]).toEqual(
      expect.objectContaining({
        title: '第一座工坊',
        payoff: '读者拿到第一轮正反馈。',
      }),
    )

    const snapshot = buildCreativeWorkflowSnapshot(updated)
    expect(snapshot).toMatchObject({
      projectId: 'project-alpha',
      templateId: 'building',
      premise: '',
      paceContract: '第一卷先做资源闭环，再上人口增长。',
    })
    expect(buildCreativeWorkflowSummaryLines(snapshot)).toContain(
      '核心承诺：前三章看到建设成果',
    )
    expect(buildCreativeWorkflowSummaryLines(snapshot)).toContain(
      '商业机制：能把烂摊子拆成资源链的经营者；让地盘、团队或产业进入正向循环',
    )
  })

  it('can clear the sidecar workflow state', async () => {
    await saveCreativeWorkflow('project-alpha', {
      templateId: 'emotion',
    })

    removeCreativeWorkflow('project-alpha')

    const workflow = await loadCreativeWorkflow('project-alpha')
    expect(workflow.templateId).toBeNull()
  })

  it('exposes template catalog and gate helper for stage-1 UI', () => {
    const templates = listCreativeWorkflowTemplates()

    expect(templates.map((item) => item.id)).toEqual([
      'comeback',
      'power-up',
      'cautious-mortal',
      'rebirth-revenge',
      'infinite-survival',
      'mystery',
      'building',
      'emotion',
    ])

    expect(
      buildInspirationGate({
        templateId: 'comeback',
        targetAudience: ['高压反转'],
        corePromises: ['第三章先兑现一次'],
        paceContract: '第三章必须打脸。',
      }).status,
    ).toBe('ready')
  })
})
