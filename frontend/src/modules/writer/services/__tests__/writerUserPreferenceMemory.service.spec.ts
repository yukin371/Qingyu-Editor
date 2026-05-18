import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  buildWriterUserPreferenceSummaryLines,
  loadWriterUserPreferenceMemory,
  removeWriterUserPreferenceMemory,
  saveWriterUserPreferenceMemory,
} from '../writerUserPreferenceMemory.service'

describe('writerUserPreferenceMemory.service', () => {
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

  it('persists only cross-project writing preferences', async () => {
    await saveWriterUserPreferenceMemory({
      preferredGenres: ['凡人流修仙', '权谋'],
      stylePreference: ['克制', '冷峻'],
      commercialPreference: {
        pace: 'fast',
        payoffFrequency: '3-5章',
        hookStrength: 'strong',
      },
      avoid: ['过度鸡汤', '主角无脑莽'],
      defaultReviewStrictness: 'high',
    })

    const memory = await loadWriterUserPreferenceMemory()
    const lines = buildWriterUserPreferenceSummaryLines(memory)

    expect(memory.preferredGenres).toEqual(['凡人流修仙', '权谋'])
    expect(lines).toContain('偏好题材：凡人流修仙 / 权谋')
    expect(lines).toContain('商业偏好：节奏：fast；兑现频率：3-5章；钩子强度：strong')
  })

  it('can clear user preferences without touching project facts', async () => {
    await saveWriterUserPreferenceMemory({
      preferredGenres: ['悬疑'],
    })

    removeWriterUserPreferenceMemory()

    expect((await loadWriterUserPreferenceMemory()).preferredGenres).toEqual([])
  })
})
