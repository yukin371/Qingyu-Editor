import { describe, expect, it } from 'vitest'
import {
  buildWriterAIContextBlock,
  buildWriterAIContextPacket,
} from '@/modules/writer/utils/writerAIContext'

describe('writerAIContext', () => {
  it('builds a compact packet with document, assets, workflow summary and evidence', () => {
    const packet = buildWriterAIContextPacket({
      projectId: 'project-1',
      currentDocument: {
        documentId: 'chapter-1',
        documentTitle: '雨夜',
        sourceText: '林舟推开门，雨声压低了走廊里的脚步。',
      },
      target: {
        kind: 'current_document',
        documentId: 'chapter-1',
        documentTitle: '雨夜',
        label: '本章全文：雨夜',
      },
      assets: [
        {
          scope: 'chapter',
          assetType: 'character',
          assetId: 'char-1',
          assetName: '林舟',
          referenceCount: 2,
        },
      ],
      aiSummaryContextText: '创作蓝图与资产摘要：\n当前章节资产：角色 1',
    })

    expect(packet.projectId).toBe('project-1')
    expect(packet.assets[0]?.assetName).toBe('林舟')
    expect(packet.evidence.map((item) => item.source)).toContain('current_document')
    expect(packet.evidence.map((item) => item.source)).toContain('asset')
    expect(packet.workflowSummary).toContain('当前章节资产：角色 1')
  })

  it('formats context block without dumping unbounded full-book text', () => {
    const contextBlock = buildWriterAIContextBlock({
      projectId: 'project-1',
      currentDocument: {
        documentId: 'chapter-1',
        documentTitle: '长章',
        sourceText: '很长'.repeat(2000),
      },
      maxContextChars: 120,
    })

    expect(contextBlock).toContain('当前章节：长章')
    expect(contextBlock).toContain('当前章节正文：')
    expect(contextBlock).toContain('上下文预算')
    expect(contextBlock.length).toBeLessThan(900)
  })
})
