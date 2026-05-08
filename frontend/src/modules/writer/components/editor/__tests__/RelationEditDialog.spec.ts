import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import RelationEditDialog from '../RelationEditDialog.vue'

// Mock writerStore
vi.mock('@/modules/writer/stores/writerStore', () => ({
  useWriterStore: () => ({
    documentTree: [
      { id: 'ch1', title: '第一章', children: [] },
      { id: 'ch2', title: '第二章', children: [] },
      { id: 'ch3', title: '第三章', children: [] },
    ],
    currentDocumentId: 'ch2',
  }),
}))

describe('RelationEditDialog', () => {
  const defaultProps = {
    visible: true,
    fromId: 'char1',
    fromName: '张三',
    toId: 'char2',
    toName: '李四',
  }

  // Helper to mount with Teleport stubbed
  const mountDialog = (props = {}) => {
    return mount(RelationEditDialog, {
      props: { ...defaultProps, ...props },
      global: {
        stubs: {
          Teleport: true,
        },
      },
    })
  }

  describe('渲染', () => {
    it('当 visible 为 true 时应该显示对话框', () => {
      const wrapper = mountDialog()
      expect(wrapper.find('.relation-edit-dialog').isVisible()).toBe(true)
      expect(wrapper.find('.dialog-header h3').text()).toBe('创建关系')
    })

    it('当 visible 为 false 时应该隐藏对话框', () => {
      const wrapper = mountDialog({ visible: false })
      expect(wrapper.find('.relation-edit-overlay').exists()).toBe(false)
    })

    it('编辑模式下应该显示"编辑关系"标题', () => {
      const wrapper = mountDialog({ relationId: 'rel1' })
      expect(wrapper.find('.dialog-header h3').text()).toBe('编辑关系')
    })

    it('应该显示关系双方的名字', () => {
      const wrapper = mountDialog()
      expect(wrapper.find('.party.from .party-name').text()).toBe('张三')
      expect(wrapper.find('.party.to .party-name').text()).toBe('李四')
    })
  })

  describe('关系类型选择', () => {
    it('应该显示所有关系类型选项', () => {
      const wrapper = mountDialog()
      const typeButtons = wrapper.findAll('.type-btn')
      expect(typeButtons.length).toBe(6) // 朋友、恋人、家人、盟友、敌人、陌生人
    })

    it('点击关系类型按钮应该选中', async () => {
      const wrapper = mountDialog()
      await wrapper.findAll('.type-btn')[1].trigger('click') // 恋人
      const activeBtn = wrapper.find('.type-btn.active')
      expect(activeBtn.exists()).toBe(true)
      expect(activeBtn.text()).toBe('恋人')
    })
  })

  describe('关系强度', () => {
    it('应该显示强度滑块', () => {
      const wrapper = mountDialog()
      const slider = wrapper.find('.strength-slider')
      expect(slider.exists()).toBe(true)
      expect(slider.attributes('min')).toBe('0')
      expect(slider.attributes('max')).toBe('100')
    })

    it('应该显示强度百分比', () => {
      const wrapper = mountDialog()
      expect(wrapper.find('.strength-value').text()).toContain('50%')
    })
  })

  describe('时序设置（编辑模式）', () => {
    it('编辑模式下应该显示时序设置', () => {
      const wrapper = mountDialog({ relationId: 'rel1' })
      expect(wrapper.find('.timeline-setting').exists()).toBe(true)
    })

    it('创建模式下不应该显示时序设置', () => {
      const wrapper = mountDialog()
      expect(wrapper.find('.timeline-setting').exists()).toBe(false)
    })
  })

  describe('事件发射', () => {
    it('点击关闭按钮应该发射 close 事件', async () => {
      const wrapper = mountDialog()
      await wrapper.find('.close-btn').trigger('click')
      expect(wrapper.emitted('close')).toBeDefined()
    })

    it('点击保存按钮应该发射 save 事件', async () => {
      const wrapper = mountDialog()
      await wrapper.find('.btn-primary').trigger('click')
      const saveEvent = wrapper.emitted('save')
      expect(saveEvent).toBeDefined()
      expect(saveEvent?.[0]).toEqual([
        expect.objectContaining({
          type: '朋友',
          strength: 50,
        }),
      ])
    })

    it('编辑模式下点击"保存为新变化"应该发射 saveWithTimeline 事件', async () => {
      const wrapper = mountDialog({ relationId: 'rel1' })
      // 切换到"保存为新变化"按钮（不是主按钮）
      await wrapper.find('.btn-warning').trigger('click')
      const saveWithTimelineEvent = wrapper.emitted('saveWithTimeline')
      expect(saveWithTimelineEvent).toBeDefined()
      expect(saveWithTimelineEvent?.[0]).toEqual([
        expect.objectContaining({
          type: '朋友',
          strength: 50,
          chapterId: 'ch2', // currentId from mock store
        }),
      ])
    })

    it('点击取消按钮应该发射 close 事件', async () => {
      const wrapper = mountDialog()
      await wrapper.find('.btn-secondary').trigger('click')
      expect(wrapper.emitted('close')).toBeDefined()
    })
  })

  describe('initialData 合并', () => {
    it('应该使用 initialData 初始化表单', () => {
      const wrapper = mountDialog({
        initialData: {
          type: '敌人',
          strength: 80,
          notes: '测试备注',
        },
      })
      const activeBtn = wrapper.find('.type-btn.active')
      expect(activeBtn.text()).toBe('敌人')
      expect(wrapper.find('.strength-value').text()).toContain('80%')
    })
  })
})
