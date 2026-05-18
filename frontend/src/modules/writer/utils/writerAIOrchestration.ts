import type { AIOrchestrationPrompt } from '@/modules/ai/types/agent'
import {
  buildWriterAIAgentPrompt,
  inferWriterAIWorkflow,
  inferWriterAIWritingSkillId,
} from '@/modules/writer/config/writerAIPromptPresets'
import { createWriterAIToolRegistry } from '@/modules/writer/services/writerAIToolRegistry.service'
import { formatWriterAIContextPacket, type WriterAIPlan } from './writerAIContext'

export function buildWriterAIOrchestrationPrompt(plan: WriterAIPlan): AIOrchestrationPrompt {
  const workflow = plan.workflow || inferWriterAIWorkflow(plan)
  const skillId = plan.skillId || inferWriterAIWritingSkillId(plan)

  return {
    domainId: 'writer',
    workflow,
    systemPrompt: buildWriterAIAgentPrompt({
      workflow,
      skillId,
      toolHintIds: plan.toolHintIds,
    }),
    instructions: plan.userVisibleSummary,
    contextPrompt: formatWriterAIContextPacket(plan.context),
    toolRegistry: createWriterAIToolRegistry(),
  }
}

export function withWriterAIOrchestration(plan: WriterAIPlan): WriterAIPlan {
  return {
    ...plan,
    orchestration: plan.orchestration || buildWriterAIOrchestrationPrompt(plan),
  }
}
