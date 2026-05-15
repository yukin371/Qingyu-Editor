import { mergeWriterAIInstructions, type WriterAIContextOptions } from './writerAIContext'

export type WriterInstructionApplyMode =
  | 'replace_selection'
  | 'insert_after_selection'
  | 'append_paragraph'
  | 'replace_document'

function resolveReplacementHint(applyMode: WriterInstructionApplyMode): string {
  if (applyMode === 'replace_document') {
    return '请直接输出可替换整章正文的完整版本。'
  }

  if (applyMode === 'replace_selection') {
    return '请直接输出可替换当前选中文本的完整版本。'
  }

  return ''
}

export function buildWriterEditInstructions(input: {
  instruction: string
  baseInstructions?: string
  applyMode: WriterInstructionApplyMode
  context: WriterAIContextOptions
}): string | undefined {
  return (
    mergeWriterAIInstructions(
      [
        input.instruction,
        input.baseInstructions || '',
        resolveReplacementHint(input.applyMode),
      ],
      input.context,
    ) || undefined
  )
}

export function buildWriterSelectionInstructions(input: {
  instructions?: string
  context: WriterAIContextOptions
}): string | undefined {
  return (
    mergeWriterAIInstructions([(input.instructions || '').trim()], input.context) || undefined
  )
}
