import type {
  SelectionNotice,
  SelectionNoticeStatus,
} from '@/modules/writer/components/editor/ai/types'
import type { WriterAIApplyPayload, WriterResultCandidate } from '@/modules/writer/types/workflow'
import { resolveWriterActionLabel } from './writerAIGeneration'

export function buildSelectionNotice(
  action: string,
  selectedText: string,
  instructions: string | undefined,
  status: SelectionNoticeStatus,
): SelectionNotice {
  const statusLabelMap: Record<SelectionNoticeStatus, string> = {
    pending: '已识别选中内容，等待执行',
    running: '正在处理选中内容...',
    done: '已完成并应用到编辑器',
    error: '处理失败，请重试',
  }

  return {
    action,
    actionLabel: resolveWriterActionLabel(action),
    text: selectedText,
    instructions: instructions?.trim() || undefined,
    status,
    statusText: statusLabelMap[status],
  }
}

export function buildSelectionUserPrompt(
  action: string,
  selectedText: string,
  instructions?: string,
): string {
  const label = resolveWriterActionLabel(action)
  const trimmedInstructions = (instructions || '').trim()
  return trimmedInstructions
    ? `[${label}] ${selectedText}\n要求：${trimmedInstructions}`
    : `[${label}] ${selectedText}`
}

export function buildSelectionResultCandidate(
  action: string,
  selectedText: string,
  generatedText: string,
): WriterResultCandidate {
  return {
    source:
      action === 'continue' || action === 'expand' || action === 'polish' || action === 'rewrite'
        ? 'rewrite'
        : 'chat',
    action,
    title: `${resolveWriterActionLabel(action)}结果`,
    summary: generatedText.slice(0, 72) || '已生成新的处理结果。',
    generatedText,
    sourceText: selectedText,
  }
}

export function buildSelectionApplyPayload(
  action: string,
  selectedText: string,
  generatedText: string,
): WriterAIApplyPayload {
  return {
    action,
    sourceText: selectedText,
    generatedText,
    applyMode:
      action === 'continue' || action === 'expand'
        ? 'insert_after_selection'
        : 'replace_selection',
  }
}
