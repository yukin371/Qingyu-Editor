import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

const setTipTapEditor = vi.fn()
const saveParagraphs = vi.fn().mockResolvedValue(undefined)
const markDirty = vi.fn()

const mockStore = {
  tipTapEditor: null as unknown,
  isDirty: false,
  autosaveEnabled: true,
  setTipTapEditor,
  saveParagraphs,
  markDirty: () => {
    markDirty()
    mockStore.isDirty = true
  },
}

vi.mock('@/modules/writer/stores/editorStore', () => ({
  useEditorStore: () => mockStore,
}))

import TipTapEditorView from '../TipTapEditorView.vue'

describe('TipTapEditorView', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
    mockStore.isDirty = false
    mockStore.autosaveEnabled = true
    mockStore.tipTapEditor = null
    saveParagraphs.mockResolvedValue(undefined)
  })

  it('shows empty-state guidance when the document has no plain text', () => {
    const wrapper = mount(TipTapEditorView, {
      props: {
        modelValue: JSON.stringify({ type: 'doc', content: [{ type: 'paragraph' }] }),
        projectId: 'project-1',
        documentId: 'chapter-1',
        showReferencePanel: false,
      },
      global: {
        stubs: {
          QyTipTapEditor: { template: '<div class="qy-tiptap-editor-stub" />' },
        },
      },
    })

    expect(wrapper.find('.editor-empty-banner').exists()).toBe(true)
    expect(wrapper.text()).toContain('开始写作这一章')
  })

  it('emits selection-action with apply mode derived from the action', async () => {
    const wrapper = mount(TipTapEditorView, {
      props: {
        modelValue: JSON.stringify({
          type: 'doc',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: '测试片段' }] }],
        }),
        projectId: 'project-1',
        documentId: 'chapter-1',
        showReferencePanel: false,
      },
      global: {
        stubs: {
          QyTipTapEditor: {
            template: `
              <button
                class="qy-tiptap-editor-stub"
                @click="$emit('selection-change', { text: '测试片段', from: 2, to: 6, x: 100, y: 80, visible: true })"
              />
            `,
          },
        },
      },
    })

    await wrapper.find('.qy-tiptap-editor-stub').trigger('click')

    await wrapper.findAll('.selection-toolbar__action')[0].trigger('click')

    expect(wrapper.emitted('selection-action')).toEqual([
      [
        {
          action: 'continue',
          text: '测试片段',
          from: 2,
          to: 6,
          applyMode: 'insert_after_selection',
        },
      ],
    ])
  })

  it('autosaves after editing loaded content even when the text length stays the same', async () => {
    const wrapper = mount(TipTapEditorView, {
      props: {
        modelValue: JSON.stringify({
          type: 'doc',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: '春风十里' }] }],
        }),
        projectId: 'project-1',
        documentId: 'chapter-1',
        showReferencePanel: false,
      },
      global: {
        stubs: {
          QyTipTapEditor: { template: '<div class="qy-tiptap-editor-stub" />' },
        },
      },
    })

    mockStore.markDirty()

    await wrapper.setProps({
      modelValue: JSON.stringify({
        type: 'doc',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: '秋雨无声' }] }],
      }),
    })

    await vi.advanceTimersByTimeAsync(300)

    expect(saveParagraphs).toHaveBeenCalledTimes(1)
    expect(saveParagraphs).toHaveBeenCalledWith([
      {
        paragraphId: 'main',
        order: 0,
        content: JSON.stringify({
          type: 'doc',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: '秋雨无声' }] }],
        }),
        contentType: 'tiptap_json',
      },
    ])
  })
})
