import { describe, expect, it } from 'vitest'
import {
  getWriterAIPromptPreset,
  getWriterAIPromptText,
  listWriterAIPromptPresets,
} from '../writerAIPromptPresets'

describe('writerAIPromptPresets', () => {
  it('groups writing, review and organize presets for the AI workflow', () => {
    const presets = listWriterAIPromptPresets()

    expect(presets.map((preset) => preset.group)).toEqual(
      expect.arrayContaining(['write', 'review', 'organize']),
    )
    expect(getWriterAIPromptPreset('chapterReview')).toMatchObject({
      group: 'review',
      label: '审本章',
    })
  })

  it('returns a safe fallback for unknown prompt ids', () => {
    expect(getWriterAIPromptText('missing-preset')).toBe('请提供帮助')
  })
})
