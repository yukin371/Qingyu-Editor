import { describe, expect, it } from 'vitest'

import {
  buildWriterLocateRequest,
  locateWriterCandidate,
  resolveStableWriterSegmentId,
  resolveWriterWindowRange,
} from '../longformLocate'

describe('longformLocate', () => {
  it('infers chapter-number mode from numeric input', () => {
    expect(buildWriterLocateRequest('115')).toMatchObject({
      mode: 'chapter-number',
      query: '115',
      windowMode: 'around-target',
    })
  })

  it('locates the matched row and computes around-target window', () => {
    const rows = Array.from({ length: 120 }, (_, index) => ({
      id: `node-${index + 1}`,
      order: index,
      segmentId: `segment:${Math.floor(index / 50)}`,
      title: `第${index + 1}章节点`,
      chapterNumber: index + 1,
      chapterTitle: `第${index + 1}章`,
    }))

    const located = locateWriterCandidate(
      rows,
      '115',
      (segmentId) => rows.filter((row) => row.segmentId === segmentId),
      {
        beforeCount: 20,
        afterCount: 20,
        initialCount: 40,
      },
    )

    expect(located?.candidate.id).toBe('node-115')
    expect(located?.segmentId).toBe('segment:2')
    expect(located?.windowRange).toEqual({
      startOrder: 100,
      endOrder: 119,
    })
  })

  it('preserves the current segment when it is still valid', () => {
    expect(
      resolveStableWriterSegmentId('segment:2', ['segment:0', 'segment:1', 'segment:2'], [
        'segment:1',
      ]),
    ).toBe('segment:2')
  })

  it('falls back to preferred segment when current segment is missing', () => {
    expect(
      resolveStableWriterSegmentId('segment:9', ['segment:0', 'segment:1', 'segment:2'], [
        'segment:1',
        'segment:2',
      ]),
    ).toBe('segment:1')
  })

  it('builds a stable initial window when there is no anchor', () => {
    const rows = Array.from({ length: 50 }, (_, index) => ({
      id: `row-${index + 1}`,
      order: index,
      segmentId: 'segment:0',
      title: `第${index + 1}项`,
    }))

    expect(
      resolveWriterWindowRange(rows, null, 'segment', {
        beforeCount: 20,
        afterCount: 20,
        initialCount: 40,
      }),
    ).toEqual({
      startOrder: 0,
      endOrder: 49,
    })
  })
})
