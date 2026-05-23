import { describe, expect, it } from 'vitest'
import { Schema } from '@tiptap/pm/model'
import {
  mapPlainTextRangeToDocPosition,
  normalizeHighlights,
} from '../ProofreadHighlightExtension'

const schema = new Schema({
  nodes: {
    doc: { content: 'block+' },
    paragraph: {
      group: 'block',
      content: 'text*',
      toDOM: () => ['p', 0],
      parseDOM: [{ tag: 'p' }],
    },
    text: { group: 'inline' },
  },
  marks: {},
})

describe('ProofreadHighlightExtension', () => {
  it('normalizes invalid and unordered highlight ranges', () => {
    expect(
      normalizeHighlights([
        { id: 'late', start: 4, end: 6, severity: 'warning' },
        { id: 'bad', start: 7, end: 7, severity: 'error' },
        { id: 'early', start: 1, end: 2, severity: 'suggestion' },
      ]).map((item) => item.id),
    ).toEqual(['early', 'late'])
  })

  it('maps plain-text offsets to ProseMirror text positions', () => {
    const doc = schema.node('doc', null, [
      schema.node('paragraph', null, schema.text('山门外风声骤起')),
      schema.node('paragraph', null, schema.text('少年停下脚步')),
    ])

    const mapped = mapPlainTextRangeToDocPosition(doc, {
      id: 'issue-1',
      start: 3,
      end: 5,
      severity: 'error',
      originalText: '风声',
    })

    expect(mapped).toMatchObject({
      from: 4,
      to: 6,
      originalText: '风声',
    })
  })

  it('keeps paragraph separators aligned with extracted plain text', () => {
    const doc = schema.node('doc', null, [
      schema.node('paragraph', null, schema.text('山门外风声骤起')),
      schema.node('paragraph', null, schema.text('少年停下脚步')),
    ])

    const mapped = mapPlainTextRangeToDocPosition(doc, {
      id: 'issue-2',
      start: 8,
      end: 10,
      severity: 'warning',
      originalText: '少年',
    })

    expect(mapped).toMatchObject({
      from: 10,
      to: 12,
      originalText: '少年',
    })
  })

  it('drops stale ranges when original text no longer matches', () => {
    const doc = schema.node('doc', null, [
      schema.node('paragraph', null, schema.text('山门外风声骤起')),
    ])

    expect(
      mapPlainTextRangeToDocPosition(doc, {
        id: 'issue-1',
        start: 3,
        end: 5,
        severity: 'error',
        originalText: '雨声',
      }),
    ).toBeNull()
  })
})
