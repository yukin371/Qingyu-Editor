/**
 * Transfer 组件单元测试
 */

// @ts-nocheck - Test file with flexible type assertions
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Transfer from '../Transfer.vue'
import TransferPanel from '../TransferPanel.vue'
import TransferItem from '../TransferItem.vue'

// 生成测试数据
const generateData = (count = 10) => {
  return Array.from({ length: count }, (_, i) => ({
    key: i + 1,
    label: `选项 ${i + 1}`,
    disabled: i % 4 === 0,
  }))
}

describe('Transfer 组件', () => {
  // 组件渲染测试
  describe('组件渲染', () => {
    it('应该正确渲染 Transfer 组件', () => {
      const wrapper = mount(Transfer, {
        props: {
          data: generateData(),
          modelValue: [],
        },
      })
      expect(wrapper.exists()).toBe(true)
    })

    it('应该渲染左右两个面板', () => {
      const wrapper = mount(Transfer, {
        props: {
          data: generateData(),
          modelValue: [],
        },
      })
      const panels = wrapper.findAllComponents(TransferPanel)
      expect(panels).toHaveLength(2)
    })

    it('应该渲染操作按钮', () => {
      const wrapper = mount(Transfer, {
        props: {
          data: generateData(),
          modelValue: [],
        },
      })
      const buttons = wrapper.findAll('button')
      expect(buttons.length).toBeGreaterThanOrEqual(2)
    })

    it('应该应用自定义类名', () => {
      const wrapper = mount(Transfer, {
        props: {
          data: generateData(),
          modelValue: [],
          class: 'custom-transfer',
        },
      })
      expect(wrapper.classes()).toContain('custom-transfer')
    })
  })

  // Props 测试
  describe('Props', () => {
    it('应该接受 data 属性', () => {
      const data = generateData()
      const wrapper = mount(Transfer, {
        props: {
          data,
          modelValue: [],
        },
      })
      expect(wrapper.props('data')).toEqual(data)
    })

    it('应该接受 modelValue 属性', () => {
      const value = [1, 2, 3]
      const wrapper = mount(Transfer, {
        props: {
          data: generateData(),
          modelValue: value,
        },
      })
      expect(wrapper.props('modelValue')).toEqual(value)
    })

    it('应该接受 filterable 属性', () => {
      const wrapper = mount(Transfer, {
        props: {
          data: generateData(),
          modelValue: [],
          filterable: true,
        },
      })
      expect(wrapper.props('filterable')).toBe(true)
    })

    it('应该接受 filterPlaceholder 属性', () => {
      const placeholder = '搜索内容'
      const wrapper = mount(Transfer, {
        props: {
          data: generateData(),
          modelValue: [],
          filterable: true,
          filterPlaceholder: placeholder,
        },
      })
      expect(wrapper.props('filterPlaceholder')).toBe(placeholder)
    })

    it('应该接受 titles 属性', () => {
      const titles = ['源列表', '目标列表']
      const wrapper = mount(Transfer, {
        props: {
          data: generateData(),
          modelValue: [],
          titles,
        },
      })
      expect(wrapper.props('titles')).toEqual(titles)
    })

    it('应该接受 buttonTexts 属性', () => {
      const buttonTexts = ['添加', '移除']
      const wrapper = mount(Transfer, {
        props: {
          data: generateData(),
          modelValue: [],
          buttonTexts,
        },
      })
      expect(wrapper.props('buttonTexts')).toEqual(buttonTexts)
    })

    it('应该接受 format 属性', () => {
      const format = '前缀：{label}'
      const wrapper = mount(Transfer, {
        props: {
          data: generateData(),
          modelValue: [],
          format,
        },
      })
      expect(wrapper.props('format')).toBe(format)
    })

    it('应该接受 props 属性（自定义字段名）', () => {
      const customProps = {
        key: 'id',
        label: 'name',
        disabled: 'disabled',
      }
      const wrapper = mount(Transfer, {
        props: {
          data: [],
          modelValue: [],
          props: customProps,
        },
      })
      expect(wrapper.props('props')).toEqual(customProps)
    })

    it('应该接受 targetOrder 属性', () => {
      const wrapper = mount(Transfer, {
        props: {
          data: generateData(),
          modelValue: [],
          targetOrder: 'push',
        },
      })
      expect(wrapper.props('targetOrder')).toBe('push')
    })

    it('应该接受 leftDefaultChecked 属性', () => {
      const leftDefaultChecked = [1, 2, 3]
      const wrapper = mount(Transfer, {
        props: {
          data: generateData(),
          modelValue: [],
          leftDefaultChecked,
        },
      })
      expect(wrapper.props('leftDefaultChecked')).toEqual(leftDefaultChecked)
    })

    it('应该接受 rightDefaultChecked 属性', () => {
      const rightDefaultChecked = [4, 5, 6]
      const wrapper = mount(Transfer, {
        props: {
          data: generateData(),
          modelValue: [4, 5, 6],
          rightDefaultChecked,
        },
      })
      expect(wrapper.props('rightDefaultChecked')).toEqual(rightDefaultChecked)
    })
  })

  // 数据穿梭功能测试
  describe('数据穿梭功能', () => {
    it('应该能够将数据从左侧移动到右侧', async () => {
      const wrapper = mount(Transfer, {
        props: {
          data: generateData(),
          modelValue: [],
        },
      })

      // 模拟左侧选中
      await wrapper.vm.handleLeftCheckChange(
        [1, 2],
        [
          { key: 1, label: '选项 1', disabled: false },
          { key: 2, label: '选项 2', disabled: false },
        ],
      )

      // 点击向右移动按钮
      await wrapper.vm.moveToRight()

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('change')).toBeTruthy()
    })

    it('应该能够将数据从右侧移动到左侧', async () => {
      const wrapper = mount(Transfer, {
        props: {
          data: generateData(),
          modelValue: [1, 2, 3],
        },
      })

      // 模拟右侧选中
      await wrapper.vm.handleRightCheckChange(
        [1, 2],
        [
          { key: 1, label: '选项 1', disabled: false },
          { key: 2, label: '选项 2', disabled: false },
        ],
      )

      // 点击向左移动按钮
      await wrapper.vm.moveToLeft()

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('change')).toBeTruthy()
    })

    it('应该在未选中时禁用移动按钮', () => {
      const wrapper = mount(Transfer, {
        props: {
          data: generateData(),
          modelValue: [],
        },
      })

      expect(wrapper.vm.canMoveRight).toBe(false)
      expect(wrapper.vm.canMoveLeft).toBe(false)
    })

    it('应该在选中时启用移动按钮', async () => {
      const wrapper = mount(Transfer, {
        props: {
          data: generateData(),
          modelValue: [],
        },
      })

      await wrapper.vm.handleLeftCheckChange([1], [{ key: 1, label: '选项 1', disabled: false }])

      expect(wrapper.vm.canMoveRight).toBe(true)
    })
  })

  // 事件测试
  describe('事件', () => {
    it('应该在移动时触发 change 事件', async () => {
      const wrapper = mount(Transfer, {
        props: {
          data: generateData(),
          modelValue: [],
        },
      })

      await wrapper.vm.handleLeftCheckChange([1], [{ key: 1, label: '选项 1', disabled: false }])
      await wrapper.vm.moveToRight()

      const changeEvents = wrapper.emitted('change')
      expect(changeEvents).toBeTruthy()
      expect(changeEvents![0]).toEqual([[1], 'right', [1]])
    })

    it('应该在左侧选中变化时触发 left-check-change 事件', async () => {
      const wrapper = mount(Transfer, {
        props: {
          data: generateData(),
          modelValue: [],
        },
      })

      await wrapper.vm.handleLeftCheckChange(
        [1, 2],
        [
          { key: 1, label: '选项 1', disabled: false },
          { key: 2, label: '选项 2', disabled: false },
        ],
      )

      const events = wrapper.emitted('left-check-change')
      expect(events).toBeTruthy()
      expect(events![0]).toEqual([
        [1, 2],
        [
          { key: 1, label: '选项 1', disabled: false },
          { key: 2, label: '选项 2', disabled: false },
        ],
      ])
    })

    it('应该在右侧选中变化时触发 right-check-change 事件', async () => {
      const wrapper = mount(Transfer, {
        props: {
          data: generateData(),
          modelValue: [1, 2, 3],
        },
      })

      await wrapper.vm.handleRightCheckChange([1], [{ key: 1, label: '选项 1', disabled: false }])

      const events = wrapper.emitted('right-check-change')
      expect(events).toBeTruthy()
      expect(events![0]).toEqual([[1], [{ key: 1, label: '选项 1', disabled: false }]])
    })

    it('应该在值变化时触发 update:modelValue 事件', async () => {
      const wrapper = mount(Transfer, {
        props: {
          data: generateData(),
          modelValue: [],
        },
      })

      await wrapper.vm.handleLeftCheckChange([1], [{ key: 1, label: '选项 1', disabled: false }])
      await wrapper.vm.moveToRight()

      const events = wrapper.emitted('update:modelValue')
      expect(events).toBeTruthy()
    })
  })

  // 数据计算测试
  describe('数据计算', () => {
    it('应该正确计算源数据（左侧）', () => {
      const data = generateData(10)
      const wrapper = mount(Transfer, {
        props: {
          data,
          modelValue: [1, 2, 3],
        },
      })

      const sourceData = wrapper.vm.sourceData
      expect(sourceData).toHaveLength(7)
      expect(sourceData.every((item: any) => ![1, 2, 3].includes(item.key))).toBe(true)
    })

    it('应该正确计算目标数据（右侧）', () => {
      const data = generateData(10)
      const wrapper = mount(Transfer, {
        props: {
          data,
          modelValue: [1, 2, 3],
        },
      })

      const targetData = wrapper.vm.targetData
      expect(targetData).toHaveLength(3)
      expect(targetData.every((item: any) => [1, 2, 3].includes(item.key))).toBe(true)
    })

    it('应该根据 targetOrder 正确排序目标数据 - original', () => {
      const data = [
        { key: 1, label: '选项 1', disabled: false },
        { key: 2, label: '选项 2', disabled: false },
        { key: 3, label: '选项 3', disabled: false },
        { key: 4, label: '选项 4', disabled: false },
        { key: 5, label: '选项 5', disabled: false },
      ]
      const wrapper = mount(Transfer, {
        props: {
          data,
          modelValue: [3, 1, 5],
          targetOrder: 'original',
        },
      })

      const targetData = wrapper.vm.targetData
      expect(targetData[0].key).toBe(1)
      expect(targetData[1].key).toBe(3)
      expect(targetData[2].key).toBe(5)
    })

    it('应该根据 targetOrder 正确排序目标数据 - push', () => {
      const data = [
        { key: 1, label: '选项 1', disabled: false },
        { key: 2, label: '选项 2', disabled: false },
        { key: 3, label: '选项 3', disabled: false },
      ]
      const wrapper = mount(Transfer, {
        props: {
          data,
          modelValue: [3, 1],
          targetOrder: 'push',
        },
      })

      const targetData = wrapper.vm.targetData
      // push 模式保持 modelValue 中的顺序: [3, 1]
      expect(targetData).toHaveLength(2)
      expect(targetData[0].key).toBe(3)
      expect(targetData[1].key).toBe(1)
    })

    it('应该根据 targetOrder 正确排序目标数据 - unshift', () => {
      const data = [
        { key: 1, label: '选项 1', disabled: false },
        { key: 2, label: '选项 2', disabled: false },
        { key: 3, label: '选项 3', disabled: false },
      ]
      const wrapper = mount(Transfer, {
        props: {
          data,
          modelValue: [3, 1],
          targetOrder: 'unshift',
        },
      })

      const targetData = wrapper.vm.targetData
      // unshift 模式将 modelValue 反转: [3, 1] -> [1, 3]
      expect(targetData).toHaveLength(2)
      expect(targetData[0].key).toBe(1)
      expect(targetData[1].key).toBe(3)
    })
  })

  // 禁用项测试
  describe('禁用项', () => {
    it('应该正确标记禁用项', () => {
      const data = [
        { key: 1, label: '选项 1', disabled: false },
        { key: 2, label: '选项 2', disabled: true },
        { key: 3, label: '选项 3', disabled: false },
      ]
      const wrapper = mount(Transfer, {
        props: {
          data,
          modelValue: [],
        },
      })

      const sourceData = wrapper.vm.sourceData
      const disabledItem = sourceData.find((item: any) => item.key === 2)
      expect(disabledItem.disabled).toBe(true)
    })

    it('禁用项不应该影响数据移动', () => {
      const data = [
        { key: 1, label: '选项 1', disabled: false },
        { key: 2, label: '选项 2', disabled: true },
        { key: 3, label: '选项 3', disabled: false },
      ]
      const wrapper = mount(Transfer, {
        props: {
          data,
          modelValue: [2],
        },
      })

      const targetData = wrapper.vm.targetData
      expect(targetData).toHaveLength(1)
      expect(targetData[0].key).toBe(2)
    })
  })

  // 响应式测试
  describe('响应式', () => {
    it('应该响应 modelValue 的变化', async () => {
      const wrapper = mount(Transfer, {
        props: {
          data: generateData(),
          modelValue: [],
        },
      })

      await wrapper.setProps({ modelValue: [1, 2, 3] })

      expect(wrapper.vm.internalValue).toEqual([1, 2, 3])
    })

    it('应该响应 data 的变化', async () => {
      const initialData = generateData(5)
      const wrapper = mount(Transfer, {
        props: {
          data: initialData,
          modelValue: [],
        },
      })

      const newData = generateData(10)
      await wrapper.setProps({ data: newData })

      expect(wrapper.vm.sourceData).toHaveLength(newData.length)
    })
  })

  // 边界情况测试
  describe('边界情况', () => {
    it('应该处理空数据', () => {
      const wrapper = mount(Transfer, {
        props: {
          data: [],
          modelValue: [],
        },
      })

      expect(wrapper.vm.sourceData).toHaveLength(0)
      expect(wrapper.vm.targetData).toHaveLength(0)
    })

    it('应该处理空 modelValue', () => {
      const wrapper = mount(Transfer, {
        props: {
          data: generateData(),
          modelValue: [],
        },
      })

      expect(wrapper.vm.targetData).toHaveLength(0)
    })

    it('应该处理所有数据都在右侧的情况', () => {
      const data = generateData(5)
      const wrapper = mount(Transfer, {
        props: {
          data,
          modelValue: [1, 2, 3, 4, 5],
        },
      })

      expect(wrapper.vm.sourceData).toHaveLength(0)
      expect(wrapper.vm.targetData).toHaveLength(5)
    })

    it('应该处理所有数据都在左侧的情况', () => {
      const data = generateData(5)
      const wrapper = mount(Transfer, {
        props: {
          data,
          modelValue: [],
        },
      })

      expect(wrapper.vm.sourceData).toHaveLength(5)
      expect(wrapper.vm.targetData).toHaveLength(0)
    })
  })
})

describe('TransferPanel 组件', () => {
  describe('组件渲染', () => {
    it('应该正确渲染 TransferPanel 组件', () => {
      const wrapper = mount(TransferPanel, {
        props: {
          data: generateData(),
          checkedKeys: [],
          itemProps: {
            key: 'key',
            label: 'label',
            disabled: 'disabled',
          },
          panel: 'left',
        },
      })
      expect(wrapper.exists()).toBe(true)
    })

    it('应该渲染标题', () => {
      const title = '测试标题'
      const wrapper = mount(TransferPanel, {
        props: {
          data: generateData(),
          checkedKeys: [],
          title,
          itemProps: {
            key: 'key',
            label: 'label',
            disabled: 'disabled',
          },
          panel: 'left',
        },
      })

      expect(wrapper.text()).toContain(title)
    })

    it('应该在 filterable 时渲染搜索框', () => {
      const wrapper = mount(TransferPanel, {
        props: {
          data: generateData(),
          checkedKeys: [],
          filterable: true,
          itemProps: {
            key: 'key',
            label: 'label',
            disabled: 'disabled',
          },
          panel: 'left',
        },
      })

      expect(wrapper.find('input[type="text"]').exists()).toBe(true)
    })
  })

  describe('搜索功能', () => {
    it('应该根据关键词过滤数据', async () => {
      const data = [
        { key: 1, label: 'Apple', disabled: false },
        { key: 2, label: 'Banana', disabled: false },
        { key: 3, label: 'Orange', disabled: false },
      ]
      const wrapper = mount(TransferPanel, {
        props: {
          data,
          checkedKeys: [],
          filterable: true,
          itemProps: {
            key: 'key',
            label: 'label',
            disabled: 'disabled',
          },
          panel: 'left',
        },
      })

      const input = wrapper.find('input[type="text"]')
      await input.setValue('App')

      expect(wrapper.vm.filteredData).toHaveLength(1)
      expect(wrapper.vm.filteredData[0].label).toBe('Apple')
    })
  })

  describe('全选功能', () => {
    it('应该支持全选', async () => {
      const data = [
        { key: 1, label: '选项 1', disabled: false },
        { key: 2, label: '选项 2', disabled: false },
      ]
      const wrapper = mount(TransferPanel, {
        props: {
          data,
          checkedKeys: [],
          itemProps: {
            key: 'key',
            label: 'label',
            disabled: 'disabled',
          },
          panel: 'left',
        },
      })

      await wrapper.vm.handleCheckAll()
      expect(wrapper.vm.internalChecked).toEqual([1, 2])
    })

    it('应该支持取消全选', async () => {
      const data = [
        { key: 1, label: '选项 1', disabled: false },
        { key: 2, label: '选项 2', disabled: false },
      ]
      const wrapper = mount(TransferPanel, {
        props: {
          data,
          checkedKeys: [1, 2],
          itemProps: {
            key: 'key',
            label: 'label',
            disabled: 'disabled',
          },
          panel: 'left',
        },
      })

      await wrapper.vm.handleCheckAll()
      expect(wrapper.vm.internalChecked).toEqual([])
    })
  })
})

describe('TransferItem 组件', () => {
  describe('组件渲染', () => {
    it('应该正确渲染 TransferItem 组件', () => {
      const wrapper = mount(TransferItem, {
        props: {
          item: { key: 1, label: '选项 1', disabled: false },
          checked: false,
          itemProps: {
            key: 'key',
            label: 'label',
            disabled: 'disabled',
          },
        },
      })
      expect(wrapper.exists()).toBe(true)
    })

    it('应该显示正确的标签', () => {
      const wrapper = mount(TransferItem, {
        props: {
          item: { key: 1, label: '测试标签', disabled: false },
          checked: false,
          itemProps: {
            key: 'key',
            label: 'label',
            disabled: 'disabled',
          },
        },
      })

      expect(wrapper.text()).toContain('测试标签')
    })
  })

  describe('选中状态', () => {
    it('应该在选中时显示选中样式', () => {
      const wrapper = mount(TransferItem, {
        props: {
          item: { key: 1, label: '选项 1', disabled: false },
          checked: true,
          itemProps: {
            key: 'key',
            label: 'label',
            disabled: 'disabled',
          },
        },
      })

      expect(wrapper.vm.itemClasses).toContain('bg-primary-50')
    })

    it('应该在未选中时不显示选中样式', () => {
      const wrapper = mount(TransferItem, {
        props: {
          item: { key: 1, label: '选项 1', disabled: false },
          checked: false,
          itemProps: {
            key: 'key',
            label: 'label',
            disabled: 'disabled',
          },
        },
      })

      expect(wrapper.vm.itemClasses).not.toContain('bg-primary-50')
    })
  })

  describe('点击事件', () => {
    it('应该在点击时切换选中状态', async () => {
      const wrapper = mount(TransferItem, {
        props: {
          item: { key: 1, label: '选项 1', disabled: false },
          checked: false,
          itemProps: {
            key: 'key',
            label: 'label',
            disabled: 'disabled',
          },
        },
      })

      await wrapper.trigger('click')
      expect(wrapper.emitted('change')).toBeTruthy()
      expect(wrapper.emitted('change')![0]).toEqual([true])
    })

    it('应该在禁用时不触发点击事件', async () => {
      const wrapper = mount(TransferItem, {
        props: {
          item: { key: 1, label: '选项 1', disabled: true },
          checked: false,
          disabled: true,
          itemProps: {
            key: 'key',
            label: 'label',
            disabled: 'disabled',
          },
        },
      })

      await wrapper.trigger('click')
      expect(wrapper.emitted('change')).toBeFalsy()
    })
  })

  describe('格式化显示', () => {
    it('应该使用 format 格式化显示', () => {
      const wrapper = mount(TransferItem, {
        props: {
          item: { key: 1, label: '选项 1', disabled: false },
          checked: false,
          format: '前缀：{label}',
          itemProps: {
            key: 'key',
            label: 'label',
            disabled: 'disabled',
          },
        },
      })

      expect(wrapper.vm.displayLabel).toBe('前缀：选项 1')
    })
  })
})
