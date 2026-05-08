import { describe, expect, it } from 'vitest'

import { normalizeOutlineTreeResponse } from '../outline'

const outlineNode = {
  id: 'outline-1',
  title: '第一章',
  type: 'chapter',
}

describe('normalizeOutlineTreeResponse', () => {
  it('returns array responses as-is', () => {
    expect(normalizeOutlineTreeResponse([outlineNode])).toEqual([outlineNode])
  })

  it('unwraps data/list/tree response shapes', () => {
    expect(normalizeOutlineTreeResponse({ data: [outlineNode] })).toEqual([outlineNode])
    expect(normalizeOutlineTreeResponse({ list: [outlineNode] })).toEqual([outlineNode])
    expect(normalizeOutlineTreeResponse({ tree: [outlineNode] })).toEqual([outlineNode])
  })

  it('falls back to empty array for unknown shapes', () => {
    expect(normalizeOutlineTreeResponse({ projects: [] })).toEqual([])
    expect(normalizeOutlineTreeResponse(null)).toEqual([])
  })
})
