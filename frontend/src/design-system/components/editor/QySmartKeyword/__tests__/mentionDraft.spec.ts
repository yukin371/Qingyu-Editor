import { describe, expect, it } from 'vitest'
import { extractMentionDraft } from '../mentionDraft'

describe('mentionDraft', () => {
  it('extracts bare at-sign draft before completion becomes visible', () => {
    expect(extractMentionDraft('@', 1)).toEqual({
      raw: '@',
      query: '',
      from: 0,
      to: 1,
    })
  })

  it('extracts named asset draft', () => {
    expect(extractMentionDraft('角色 @林舟', 6)).toEqual({
      raw: '@林舟',
      query: '林舟',
      from: 3,
      to: 6,
    })
  })

  it('returns null when cursor is outside mention context', () => {
    expect(extractMentionDraft('角色 林舟', 5)).toBeNull()
  })
})
