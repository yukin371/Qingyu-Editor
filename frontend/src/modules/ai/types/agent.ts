export type AIDomainToolSafety = 'read_only' | 'candidate_only' | 'requires_confirmation'

export interface AIDomainToolDefinition {
  id: string
  label: string
  description: string
  safety: AIDomainToolSafety
  inputHint?: string
  outputHint?: string
}

export interface AIDomainToolRegistry {
  domainId: string
  label: string
  tools: AIDomainToolDefinition[]
}

export interface AIOrchestrationPrompt {
  domainId?: string
  workflow?: string
  systemPrompt?: string
  instructions?: string
  contextPrompt?: string
  toolRegistry?: AIDomainToolRegistry | null
}

export interface AIPlanEvidence {
  id: string
  label: string
  source: string
  detail?: string
}

export interface AIChapterTaskContext {
  goal?: string
  emotionalFunction?: string
  readerPayoff?: string
  protagonistAction?: string
  conflict?: string
  hook?: string
  assetChanges?: string
}

export interface AISceneStageContext {
  sceneTitle?: string
  beatTitle?: string
  goal?: string
  conflict?: string
  doneCondition?: string
  nextBeatTitle?: string
  assetNames?: string[]
}

export interface AIExecutablePlan {
  route: string
  mutationMode: 'none' | 'single_document_diff' | 'multi_document_plan' | 'chapter_create_plan'
  target?: {
    kind?: string
    label?: string
    documentId?: string | null
    documentTitle?: string | null
  }
  context: {
    projectId: string
    currentDocument?: {
      documentId?: string | null
      documentTitle?: string | null
      sourceText?: string | null
    }
    target?: {
      kind?: string
      documentId?: string | null
      label?: string
      documentTitle?: string | null
    }
    selection?: {
      kind?: string
      text?: string
      instructions?: string
    }
    assets?: Array<{
      scope?: string
      assetName: string
      assetType?: string
      referenceCount?: number
    }>
    workflowSummary?: string[]
    chapterTask?: AIChapterTaskContext
    sceneStage?: AISceneStageContext
    evidence?: AIPlanEvidence[]
    budget?: {
      maxChars: number
      truncated: boolean
    }
  }
  intent?: {
    action?: string
    targetLength?: number
  }
  history?: Array<{ role: 'user' | 'assistant'; content: string }>
  workflow?: string
  skillId?: string
  toolHintIds?: string[]
  orchestration?: AIOrchestrationPrompt
  requiresConfirmation: boolean
  userVisibleSummary: string
}

export function formatAIOrchestrationPrompt(orchestration?: AIOrchestrationPrompt | null): string {
  if (!orchestration) return ''

  const lines = [
    orchestration.domainId ? `业务域：${orchestration.domainId}` : '',
    orchestration.workflow ? `工作流：${orchestration.workflow}` : '',
    orchestration.systemPrompt,
    orchestration.instructions ? `任务说明：\n${orchestration.instructions}` : '',
    orchestration.contextPrompt ? `业务上下文：\n${orchestration.contextPrompt}` : '',
  ]

  if (orchestration.toolRegistry?.tools.length) {
    lines.push(`可用工具：${orchestration.toolRegistry.label}`)
    lines.push(
      ...orchestration.toolRegistry.tools.map((tool) =>
        [
          `- ${tool.id}：${tool.label}。${tool.description}`,
          `  安全级别：${tool.safety}`,
          tool.inputHint ? `  输入：${tool.inputHint}` : '',
          tool.outputHint ? `  输出：${tool.outputHint}` : '',
        ]
          .filter(Boolean)
          .join('\n'),
      ),
    )
  }

  return lines.filter(Boolean).join('\n')
}
