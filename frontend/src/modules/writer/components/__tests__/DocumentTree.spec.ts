import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import DocumentTree from '../DocumentTree.vue'

const moveDocumentMock = vi.fn()
const duplicateDocumentMock = vi.fn()
const messageSuccess = vi.fn()
const messageError = vi.fn()
const messageBoxAlert = vi.fn()
const batchSubmitMock = vi.fn()
const loadTreeMock = vi.fn()

vi.mock('@/modules/writer/api/document', () => ({
  moveDocument: (...args: unknown[]) => moveDocumentMock(...args),
  duplicateDocument: (...args: unknown[]) => duplicateDocumentMock(...args),
}))

vi.mock('@/design-system/services', () => ({
  message: {
    success: (...args: unknown[]) => messageSuccess(...args),
    error: (...args: unknown[]) => messageError(...args),
  },
  messageBox: {
    alert: (...args: unknown[]) => messageBoxAlert(...args),
  },
}))

vi.mock('@/modules/writer/stores/batchOperationStore', () => ({
  useBatchOperationStore: () => ({
    submit: (...args: unknown[]) => batchSubmitMock(...args),
  }),
}))

vi.mock('@/modules/writer/stores/documentStore', () => ({
  useDocumentStore: () => ({
    loadTree: (...args: unknown[]) => loadTreeMock(...args),
  }),
}))

vi.mock('@/design-system/components', () => ({
  QyIcon: defineComponent({
    name: 'QyIconStub',
    props: {
      name: {
        type: String,
        default: '',
      },
    },
    template: '<span class="qy-icon-stub">{{ name }}</span>',
  }),
  QyInput: defineComponent({
    name: 'QyInputStub',
    props: {
      modelValue: {
        type: String,
        default: '',
      },
    },
    emits: ['update:modelValue'],
    setup(_, { emit }) {
      const onInput = (event: Event) => {
        emit('update:modelValue', (event.target as HTMLInputElement).value)
      }

      return { onInput }
    },
    template: '<input data-testid="tree-search" :value="modelValue" @input="onInput" />',
  }),
}))

const treeData = [
  {
    id: 'vol-1',
    title: '卷一',
    type: 'volume',
    projectId: 'project-1',
    parentId: '',
    level: 0,
    order: 0,
    status: 'planned',
    wordCount: 0,
    children: [
      {
        id: 'chap-1',
        title: '第一章',
        type: 'chapter',
        projectId: 'project-1',
        parentId: 'vol-1',
        level: 1,
        order: 0,
        status: 'writing',
        wordCount: 1234,
      },
      {
        id: 'chap-2',
        title: '第二章',
        type: 'chapter',
        projectId: 'project-1',
        parentId: 'vol-1',
        level: 1,
        order: 1,
        status: 'writing',
        wordCount: 2345,
      },
    ],
  },
  {
    id: 'chap-3',
    title: '尾章',
    type: 'chapter',
    projectId: 'project-1',
    parentId: '',
    level: 0,
    order: 1,
    status: 'planned',
    wordCount: 321,
  },
]

const createWrapper = () =>
  mount(DocumentTree, {
    props: {
      treeData,
      projectId: 'project-1',
      currentDocumentId: 'chap-1',
    },
    global: {
      stubs: {
        BatchOperationConfirmDialog: true,
        BatchOperationProgressDialog: true,
        teleport: true,
      },
    },
  })

describe('DocumentTree', () => {
  beforeEach(() => {
    moveDocumentMock.mockReset()
    duplicateDocumentMock.mockReset()
    messageSuccess.mockReset()
    messageError.mockReset()
    messageBoxAlert.mockReset()
    batchSubmitMock.mockReset()
    loadTreeMock.mockReset()
  })

  it('搜索时保留命中节点及其祖先节点', async () => {
    const wrapper = createWrapper()

    expect(wrapper.text()).toContain('卷一')
    expect(wrapper.text()).toContain('第一章')

    await wrapper.get('[data-testid="tree-search"]').setValue('第二章')

    expect(wrapper.text()).toContain('卷一')
    expect(wrapper.text()).toContain('第二章')
    expect(wrapper.text()).not.toContain('第一章')
    expect(wrapper.text()).not.toContain('尾章')
  })

  it('普通模式点击节点时透传 select 事件', async () => {
    const wrapper = createWrapper()

    await wrapper.get('[data-node-id="chap-2"] .tree-node-row').trigger('click')

    expect(wrapper.emitted('select')).toEqual([[expect.objectContaining({ id: 'chap-2' })]])
  })

  it('使用原生拖拽完成文档移动', async () => {
    const wrapper = createWrapper()
    moveDocumentMock.mockResolvedValue(undefined)

    const dragRow = wrapper.get('[data-node-id="chap-3"] .tree-node-row')
    const dropRow = wrapper.get('[data-node-id="vol-1"] .tree-node-row')

    const dataTransfer = {
      effectAllowed: 'move',
      dropEffect: 'move',
      setData: vi.fn(),
      getData: vi.fn(() => ''),
    }

    Object.defineProperty(dropRow.element, 'getBoundingClientRect', {
      value: () => ({ top: 0, height: 40 }),
    })

    await dragRow.trigger('dragstart', {
      ctrlKey: false,
      altKey: false,
      dataTransfer,
    })
    await dropRow.trigger('dragover', {
      clientY: 20,
      dataTransfer,
      preventDefault: vi.fn(),
    })
    await dropRow.trigger('drop', {
      clientY: 20,
      dataTransfer,
      preventDefault: vi.fn(),
    })

    expect(moveDocumentMock).toHaveBeenCalledWith('chap-3', {
      parentId: 'vol-1',
    })
    expect(messageSuccess).toHaveBeenCalledWith('已移动 "尾章" 到 "卷一"', { duration: 2000 })
    expect(wrapper.emitted('drop')).toEqual([['chap-3', 'vol-1', 'inner']])
  })
})
