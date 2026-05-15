import type { WriterResolvedDocumentTarget } from '@/modules/writer/services/writerDocumentAgent.service'
import type { AIApplyMode, WriterAIApplyPayload, WriterResultCandidate } from '@/modules/writer/types/workflow'

export function buildDirectEditUserPrompt(
  instruction: string,
  target: WriterResolvedDocumentTarget,
  applyMode: AIApplyMode,
): string {
  const targetLabel =
    target.requestLabel || (applyMode === 'replace_document' ? '当前章节' : '当前片段')
  return `[直接修改正文]\n目标：${targetLabel}\n修改要求：${instruction}`
}

export function buildDirectEditLoadingMessage(target: WriterResolvedDocumentTarget): string {
  return `已定位到 ${target.requestLabel || target.targetDocumentTitle || target.targetDocumentId}，正在生成可挂载到正文编辑器的结果。`
}

export function buildDirectEditResultCandidate(params: {
  action: string
  label: string
  generatedText: string
  sourceText: string
}): WriterResultCandidate {
  return {
    source: 'rewrite',
    action: params.action,
    title: `AI 直接${params.label}结果`,
    summary: params.generatedText.slice(0, 72) || '已生成新的正文版本。',
    generatedText: params.generatedText,
    sourceText: params.sourceText,
  }
}

export function buildDirectEditApplyPayload(params: {
  action: string
  sourceText: string
  generatedText: string
  applyMode: AIApplyMode
  target: WriterResolvedDocumentTarget
}): WriterAIApplyPayload {
  return {
    action: params.action,
    sourceText: params.sourceText,
    generatedText: params.generatedText,
    applyMode: params.applyMode,
    targetDocumentId: params.target.targetDocumentId,
    targetDocumentTitle: params.target.targetDocumentTitle,
  }
}
