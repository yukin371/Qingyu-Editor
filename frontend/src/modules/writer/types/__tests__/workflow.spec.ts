import { describe, expect, it } from 'vitest'

import {
  buildWriterAIActionTrigger,
  detectWriterPromptIntent,
  resolveWriterEditApplyMode,
  resolveWriterPromptExecution,
} from '../workflow'

describe('writer workflow intent helpers', () => {
  it('detects expand requests and extracts target length', () => {
    expect(detectWriterPromptIntent('请把这一章扩写到300字，补充心理描写')).toMatchObject({
      action: 'expand',
      kind: 'edit',
      targetLength: 300,
    })
  })

  it('keeps summarize requests on analysis route when source text is available', () => {
    expect(
      resolveWriterPromptExecution('帮我总结一下这一章', {
        interactionMode: 'edit',
        canEditDirectly: true,
        hasSelectionContext: false,
      }),
    ).toMatchObject({
      route: 'analysis',
      intent: {
        action: 'summarize',
      },
    })
  })

  it('routes edit prompts into direct edit flow with selection-aware apply mode', () => {
    expect(
      resolveWriterPromptExecution('把这段改写得更紧张', {
        interactionMode: 'chat',
        canEditDirectly: true,
        hasSelectionContext: true,
      }),
    ).toMatchObject({
      route: 'edit',
      intent: {
        action: 'rewrite',
      },
      applyMode: 'replace_selection',
    })
  })

  it('falls back to direct edit in edit mode even when the prompt has no explicit keyword', () => {
    expect(
      resolveWriterPromptExecution('把人物的语气压得更冷一些', {
        interactionMode: 'edit',
        canEditDirectly: true,
        hasSelectionContext: false,
      }),
    ).toMatchObject({
      route: 'edit',
      intent: null,
      applyMode: 'replace_document',
    })
  })

  it('returns chat route when no editable source is available', () => {
    expect(
      resolveWriterPromptExecution('帮我扩写到300字', {
        interactionMode: 'chat',
        canEditDirectly: false,
        hasSelectionContext: false,
      }),
    ).toMatchObject({
      route: 'chat',
      intent: {
        action: 'expand',
      },
    })
  })

  it('treats cross-chapter rewrite requests as edit intents', () => {
    expect(detectWriterPromptIntent('修改第12章结尾，让冲突更强')).toMatchObject({
      action: 'rewrite',
      kind: 'edit',
    })
  })

  it('treats add-a-paragraph requests as expand intents', () => {
    expect(detectWriterPromptIntent('在上一章补一段伏笔')).toMatchObject({
      action: 'expand',
      kind: 'edit',
    })
  })

  it('normalizes workflow trigger apply mode for edit actions', () => {
    expect(
      buildWriterAIActionTrigger({
        action: 'rewrite',
        text: '原始正文',
      }).applyMode,
    ).toBe('replace_document')

    expect(
      buildWriterAIActionTrigger({
        action: 'continue',
        text: '原始正文',
        from: 2,
        to: 8,
      }).applyMode,
    ).toBe('insert_after_selection')
  })

  it('keeps continue and rewrite apply modes aligned with context shape', () => {
    expect(resolveWriterEditApplyMode('continue', false)).toBe('append_paragraph')
    expect(resolveWriterEditApplyMode('continue', true)).toBe('insert_after_selection')
    expect(resolveWriterEditApplyMode('rewrite', false)).toBe('replace_document')
    expect(resolveWriterEditApplyMode('rewrite', true)).toBe('replace_selection')
  })
})
