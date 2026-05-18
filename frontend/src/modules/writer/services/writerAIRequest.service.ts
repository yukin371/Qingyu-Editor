import { requestWriterAI, type WriterAIResult } from '@/modules/ai/api'
import { withWriterAIOrchestration } from '@/modules/writer/utils/writerAIOrchestration'
import type { WriterAIPlan } from '@/modules/writer/utils/writerAIContext'

export function requestWriterOrchestratedAI(plan: WriterAIPlan): Promise<WriterAIResult> {
  return requestWriterAI(withWriterAIOrchestration(plan))
}
