import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

const routeState = {
  params: {
    projectId: 'project-1',
    chapterId: 'chapter-2',
  },
  query: {},
}

const routerReplace = vi.fn().mockResolvedValue(undefined)

vi.mock('vue-router', () => ({
  useRoute: () => routeState,
  useRouter: () => ({
    replace: routerReplace,
  }),
}))

import EditorView from '../EditorView.vue'

describe('EditorView legacy shell', () => {
  it('redirects legacy editor entry to the unified project workspace', async () => {
    mount(EditorView)

    expect(routerReplace).toHaveBeenCalledWith({
      name: 'writer-project',
      params: { projectId: 'project-1' },
      query: { chapterId: 'chapter-2' },
    })
  })

  it('renders a lightweight compatibility notice instead of the old editor stack', () => {
    const wrapper = mount(EditorView)

    expect(wrapper.find('[data-testid="editor-view-legacy"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('正在切换到写作工作区')
  })
})
