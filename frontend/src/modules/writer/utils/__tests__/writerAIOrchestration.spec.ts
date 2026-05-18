import { describe, expect, it } from 'vitest'
import { withWriterAIOrchestration } from '../writerAIOrchestration'

describe('writerAIOrchestration', () => {
  it('wraps writer plans with writer-owned prompts and tool registry', () => {
    const plan = withWriterAIOrchestration({
      route: 'single_document_edit',
      mutationMode: 'single_document_diff',
      target: {
        kind: 'current_document',
        label: '本章全文',
      },
      context: {
        projectId: 'project-1',
        currentDocument: {
          documentTitle: '第一章',
          sourceText: '原正文',
        },
        assets: [],
        workflowSummary: ['节奏：压迫后反击'],
        evidence: [],
        budget: {
          maxChars: 1000,
          truncated: false,
        },
      },
      workflow: 'write',
      skillId: 'commercial_loop',
      toolHintIds: ['scene_stage', 'assets'],
      requiresConfirmation: true,
      userVisibleSummary: '改写当前章节。',
    })

    expect(plan.orchestration?.domainId).toBe('writer')
    expect(plan.orchestration?.systemPrompt).toContain('极简 Agent：写作')
    expect(plan.orchestration?.systemPrompt).toContain('写作 Skill：商业爽文')
    expect(plan.orchestration?.toolRegistry?.tools.map((tool) => tool.id)).toContain(
      'writer.build_apply_payload',
    )
    expect(plan.orchestration?.contextPrompt).toContain('当前章节：第一章')
  })
})
