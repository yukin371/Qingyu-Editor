import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import type { Storage } from '@/utils/storage'
import InspirationPanel from '../InspirationPanel.vue'

const memoryStorage = new Map<string, unknown>()

vi.mock('@/utils/storage', () => {
  const storage: Partial<Storage> = {
    get(key: string, defaultValue?: unknown) {
      return memoryStorage.has(key) ? structuredClone(memoryStorage.get(key)) : (defaultValue ?? null)
    },
    set(key: string, value: unknown) {
      memoryStorage.set(key, structuredClone(value))
    },
    remove(key: string) {
      memoryStorage.delete(key)
    },
    clear() {
      memoryStorage.clear()
    },
    has(key: string) {
      return memoryStorage.has(key)
    },
  }

  return {
    default: storage,
  }
})

const baseProps = {
  projectId: 'project-stage1',
  chapterId: 'chapter-1',
  chapterTitle: '第一章',
}

describe('InspirationPanel', () => {
  beforeEach(() => {
    memoryStorage.clear()
    localStorage.clear()
  })

  const mountPanel = () =>
    mount(InspirationPanel, {
      props: baseProps,
      global: {
        stubs: {
          QyIcon: true,
        },
      },
    })

  it('hydrates template defaults and promotes the gate after selecting a template', async () => {
    const wrapper = mountPanel()
    await nextTick()

    await wrapper.get('[data-testid="template-mystery"]').trigger('click')
    await nextTick()
    await flushPromises()

    expect(wrapper.text()).toContain('可推进到阶段 2')
    expect(wrapper.text()).toContain('踏入异常')
    expect(wrapper.text()).toContain('求知解谜')
  })

  it('persists workflow sidecar state across remounts', async () => {
    const wrapper = mountPanel()
    await nextTick()

    await wrapper.get('[data-testid="template-building"]').trigger('click')
    await nextTick()
    await flushPromises()

    const pitchInput = wrapper.find('textarea')
    await pitchInput.setValue('一个濒临破产的领地，要靠第一座工坊翻盘。')
    await nextTick()
    await flushPromises()

    wrapper.unmount()

    const secondWrapper = mountPanel()
    await nextTick()
    await nextTick()
    await flushPromises()
    expect(secondWrapper.text()).toContain('建设养成')
    expect(secondWrapper.text()).toContain('第一份成果')
    expect(secondWrapper.find('textarea').element.value).toContain('第一座工坊翻盘')
  })
})
