import { describe, expect, it } from 'vitest'
import {
  buildWriterEditInstructions,
  buildWriterSelectionInstructions,
} from '../writerAIInstructionBuilder'

const context = {
  workflowContext: {
    signature: 'sig',
    projectId: 'project-1',
    chapterId: 'chapter-1',
    chapterTitle: '第一章',
    activeCharacters: [],
    activeRelations: [],
    pendingChangeRequests: [],
    pendingChangeRequestCount: 0,
  },
  aiSummaryContextText: '前文摘要',
}

describe('writerAIInstructionBuilder', () => {
  it('adds replacement hint for document edit instructions', () => {
    const merged = buildWriterEditInstructions({
      instruction: '重写这一章结尾',
      baseInstructions: '保留语气',
      applyMode: 'replace_document',
      context,
    })

    expect(merged).toContain('重写这一章结尾')
    expect(merged).toContain('保留语气')
    expect(merged).toContain('请直接输出可替换整章正文的完整版本。')
    expect(merged).toContain('前文摘要')
  })

  it('builds lightweight selection instructions', () => {
    const merged = buildWriterSelectionInstructions({
      instructions: '  保持克制语气  ',
      context,
    })

    expect(merged).toContain('保持克制语气')
    expect(merged).not.toContain('请直接输出可替换整章正文的完整版本。')
  })
})
