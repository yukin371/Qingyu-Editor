import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  buildWriterProjectBriefSummaryLines,
  loadWriterProjectBrief,
  removeWriterProjectBrief,
  saveWriterProjectBrief,
} from '../writerProjectBrief.service'

describe('writerProjectBrief.service', () => {
  beforeEach(() => {
    const map = new Map<string, string>()
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => map.get(key) ?? null,
      setItem: (key: string, value: string) => {
        map.set(key, value)
      },
      removeItem: (key: string) => {
        map.delete(key)
      },
      clear: () => {
        map.clear()
      },
      key: (index: number) => Array.from(map.keys())[index] ?? null,
      get length() {
        return map.size
      },
    })
  })

  it('persists a project-scoped brief without owning chapter facts', async () => {
    const saved = await saveWriterProjectBrief('project-1', {
      premise: '谨慎凡人在修仙界求生',
      targetAudience: '凡人流读者',
      readerPromise: ['低调获利', '风险判断'],
      styleGuide: ['克制', '少解释'],
      worldRules: ['资源有限'],
      constraints: ['奇遇必须有代价'],
      avoid: ['主角无脑莽'],
    })

    const loaded = await loadWriterProjectBrief('project-1')
    const lines = buildWriterProjectBriefSummaryLines(loaded)

    expect(saved.projectId).toBe('project-1')
    expect(loaded.premise).toBe('谨慎凡人在修仙界求生')
    expect(lines).toContain('作品定位：谨慎凡人在修仙界求生')
    expect(lines).toContain('阅读承诺：低调获利 / 风险判断')
  })

  it('removes only the requested project brief', async () => {
    await saveWriterProjectBrief('project-1', { premise: 'A' })
    await saveWriterProjectBrief('project-2', { premise: 'B' })

    removeWriterProjectBrief('project-1')

    expect((await loadWriterProjectBrief('project-1')).premise).toBe('')
    expect((await loadWriterProjectBrief('project-2')).premise).toBe('B')
  })
})
