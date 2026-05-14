import { describe, expect, it } from 'vitest'
import type { KeywordInfo } from '../extensions/SmartKeyword'
import {
  getCompletionOptionCount,
  getDefaultCompletionActiveIndex,
  hasExactCompletionMatch,
  shouldShowCompletionCreateAction,
} from '../completionCreateOption'

const buildItems = (...names: string[]): KeywordInfo[] =>
  names.map((name, index) => ({
    id: `kw-${index}`,
    type: 'character',
    name,
  }))

describe('completionCreateOption', () => {
  it('shows create action when query has no exact match', () => {
    const items = buildItems('林州', '林舟')
    expect(hasExactCompletionMatch('林中城', items)).toBe(false)
    expect(shouldShowCompletionCreateAction('林中城', items)).toBe(true)
    expect(getCompletionOptionCount('林中城', items)).toBe(3)
    expect(getDefaultCompletionActiveIndex('林中城', items)).toBe(2)
  })

  it('hides create action when query exactly matches an existing asset', () => {
    const items = buildItems('林舟', '林州')
    expect(hasExactCompletionMatch('林舟', items)).toBe(true)
    expect(shouldShowCompletionCreateAction('林舟', items)).toBe(false)
    expect(getCompletionOptionCount('林舟', items)).toBe(2)
    expect(getDefaultCompletionActiveIndex('林舟', items)).toBe(0)
  })

  it('does not show create action for empty query', () => {
    const items = buildItems('林舟')
    expect(shouldShowCompletionCreateAction('', items)).toBe(true)
    expect(getCompletionOptionCount('', items)).toBe(2)
    expect(getDefaultCompletionActiveIndex('', items)).toBe(1)
  })
})
