import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import ProjectSidebar from '../ProjectSidebar.vue'

const searchKeywordsMock = vi.fn()

vi.mock('@/modules/writer/stores/writerStore', () => ({
  useWriterStore: () => ({
    searchKeywords: (...args: unknown[]) => searchKeywordsMock(...args),
  }),
}))

vi.mock('@/design-system/services', () => ({
  messageBox: {
    confirm: vi.fn(),
  },
}))

const QyInputStub = defineComponent({
  name: 'QyInputStub',
  props: {
    modelValue: {
      type: String,
      default: '',
    },
  },
  emits: ['update:modelValue', 'focus', 'keydown'],
  setup(_, { emit }) {
    const onInput = (event: Event) => {
      emit('update:modelValue', (event.target as HTMLInputElement).value)
    }

    const onFocus = () => {
      emit('focus')
    }

    const onKeydown = (event: KeyboardEvent) => {
      emit('keydown', event)
    }

    return { onInput, onFocus, onKeydown }
  },
  template: `
    <input
      data-testid="project-sidebar-search"
      :value="modelValue"
      @input="onInput"
      @focus="onFocus"
      @keydown="onKeydown"
    />
  `,
})

const createWrapper = () =>
  mount(ProjectSidebar, {
    props: {
      projects: [
        {
          id: 'project-1',
          title: '测试项目',
          status: 'draft',
          wordCount: 0,
          chapterCount: 2,
          updatedAt: '2026-05-10T00:00:00Z',
        },
      ],
      projectId: 'project-1',
      chapterId: '',
      chapters: [
        {
          id: 'chapter-1',
          projectId: 'project-1',
          chapterNum: 1,
          title: '第一章 起风',
          wordCount: 1200,
          updatedAt: '2026-05-10T00:00:00Z',
          status: 'draft',
          nodeType: 'chapter',
        },
        {
          id: 'chapter-2',
          projectId: 'project-1',
          chapterNum: 2,
          title: '第二章 入局',
          wordCount: 1400,
          updatedAt: '2026-05-09T00:00:00Z',
          status: 'draft',
          nodeType: 'chapter',
        },
      ],
    },
    global: {
      stubs: {
        QyInput: QyInputStub,
        QyIcon: true,
        QyDropdown: {
          template: '<div><slot /></div>',
        },
        QyGhostButton: {
          template: '<button><slot /></button>',
        },
      },
      directives: {
        safeHtml: {
          mounted(el, binding) {
            el.innerHTML = binding.value
          },
          updated(el, binding) {
            el.innerHTML = binding.value
          },
        },
      },
    },
  })

describe('ProjectSidebar', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    searchKeywordsMock.mockReset()
    searchKeywordsMock.mockResolvedValue([])
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('搜索关键词后展示建议并选择章节', async () => {
    const wrapper = createWrapper()

    await wrapper.get('[data-testid="project-sidebar-search"]').setValue('第一章')
    vi.advanceTimersByTime(200)
    await Promise.resolve()
    await Promise.resolve()
    await nextTick()

    expect(wrapper.get('[data-testid="project-sidebar-suggestions"]').text()).toContain('第一章 起风')

    const firstSuggestion = wrapper.findAll('.keyword-option').find((node) => node.text().includes('第一章 起风'))
    expect(firstSuggestion).toBeTruthy()

    await firstSuggestion!.trigger('click')

    expect(wrapper.emitted('update:chapterId')).toEqual([['chapter-1']])
  })
})
