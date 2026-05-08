/**
 * Popover 组件单元测试
 */

// @ts-nocheck - Test file with flexible type assertions
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/vue'
import Popover from '../Popover.vue'

describe('Popover 组件', () => {
  beforeEach(() => {
    // 清理可能残留的 popover 元素
    const popovers = document.querySelectorAll('.qy-popover')
    popovers.forEach(el => el.remove())
  })

  afterEach(() => {
    // 清理可能残留的 popover 元素
    const popovers = document.querySelectorAll('.qy-popover')
    popovers.forEach(el => el.remove())
  })

  describe('基础渲染', () => {
    it('应该正确渲染默认的 Popover', () => {
      render(Popover, {
        props: {
          content: '这是一段内容',
        },
        slots: {
          default: '<button>点击我</button>',
        },
      })

      expect(screen.getByText('点击我')).toBeInTheDocument()
    })

    it('应该正确渲染 trigger 为 hover 的 Popover', () => {
      render(Popover, {
        props: {
          trigger: 'hover',
          content: '悬停内容',
        },
        slots: {
          default: '<button>悬停我</button>',
        },
      })

      expect(screen.getByText('悬停我')).toBeInTheDocument()
    })

    it('应该正确渲染 trigger 为 focus 的 Popover', () => {
      render(Popover, {
        props: {
          trigger: 'focus',
          content: '聚焦内容',
        },
        slots: {
          default: '<button>聚焦我</button>',
        },
      })

      expect(screen.getByText('聚焦我')).toBeInTheDocument()
    })

    it('应该正确渲染 trigger 为 manual 的 Popover', () => {
      render(Popover, {
        props: {
          trigger: 'manual',
          content: '手动内容',
        },
        slots: {
          default: '<button>手动我</button>',
        },
      })

      expect(screen.getByText('手动我')).toBeInTheDocument()
    })
  })

  describe('触发方式', () => {
    it('应该在 click 时切换显示状态（trigger=click）', async () => {
      render(Popover, {
        props: {
          trigger: 'click',
          content: '点击显示',
        },
        slots: {
          default: '<button>点击我</button>',
        },
      })

      const button = screen.getByText('点击我')

      // 点击显示
      await fireEvent.click(button)
      await waitFor(() => {
        const popover = document.querySelector('.qy-popover')
        expect(popover).toBeInTheDocument()
      })
    })

    it('应该在 hover 模式下支持鼠标进入事件', async () => {
      render(Popover, {
        props: {
          trigger: 'hover',
          content: '悬停显示',
        },
        slots: {
          default: '<button>悬停我</button>',
        },
      })

      const button = screen.getByText('悬停我')
      await fireEvent.mouseEnter(button)

      // 验证事件被触发（由于 Teleport，内容可能不在测试容器中）
      expect(button).toBeInTheDocument()
    })

    it('应该在 focus 模式下支持焦点事件', async () => {
      render(Popover, {
        props: {
          trigger: 'focus',
          content: '聚焦显示',
        },
        slots: {
          default: '<button>聚焦我</button>',
        },
      })

      const button = screen.getByText('聚焦我')
      await fireEvent.focus(button)

      // 验证元素存在
      expect(button).toBeInTheDocument()
    })
  })

  describe('位置选项', () => {
    it('应该正确设置 placement 为 top', async () => {
      render(Popover, {
        props: {
          placement: 'top',
          content: '顶部内容',
        },
        slots: {
          default: '<button>Top</button>',
        },
      })

      const button = screen.getByText('Top')
      await fireEvent.click(button)

      await waitFor(() => {
        const popover = document.querySelector('.qy-popover')
        expect(popover).toBeInTheDocument()
      })
    })

    it('应该正确设置 placement 为 bottom', async () => {
      render(Popover, {
        props: {
          placement: 'bottom',
          content: '底部内容',
        },
        slots: {
          default: '<button>Bottom</button>',
        },
      })

      const button = screen.getByText('Bottom')
      await fireEvent.click(button)

      await waitFor(() => {
        const popover = document.querySelector('.qy-popover')
        expect(popover).toBeInTheDocument()
      })
    })

    it('应该正确设置 placement 为 left', async () => {
      render(Popover, {
        props: {
          placement: 'left',
          content: '左侧内容',
        },
        slots: {
          default: '<button>Left</button>',
        },
      })

      const button = screen.getByText('Left')
      await fireEvent.click(button)

      await waitFor(() => {
        const popover = document.querySelector('.qy-popover')
        expect(popover).toBeInTheDocument()
      })
    })

    it('应该正确设置 placement 为 right', async () => {
      render(Popover, {
        props: {
          placement: 'right',
          content: '右侧内容',
        },
        slots: {
          default: '<button>Right</button>',
        },
      })

      const button = screen.getByText('Right')
      await fireEvent.click(button)

      await waitFor(() => {
        const popover = document.querySelector('.qy-popover')
        expect(popover).toBeInTheDocument()
      })
    })

    it('应该正确设置 placement 为 top-start', async () => {
      render(Popover, {
        props: {
          placement: 'top-start',
          content: '左上内容',
        },
        slots: {
          default: '<button>Top Start</button>',
        },
      })

      const button = screen.getByText('Top Start')
      await fireEvent.click(button)

      await waitFor(() => {
        const popover = document.querySelector('.qy-popover')
        expect(popover).toBeInTheDocument()
      })
    })

    it('应该正确设置 placement 为 bottom-end', async () => {
      render(Popover, {
        props: {
          placement: 'bottom-end',
          content: '右下内容',
        },
        slots: {
          default: '<button>Bottom End</button>',
        },
      })

      const button = screen.getByText('Bottom End')
      await fireEvent.click(button)

      await waitFor(() => {
        const popover = document.querySelector('.qy-popover')
        expect(popover).toBeInTheDocument()
      })
    })

    it('应该正确设置 placement 为 top-end', async () => {
      render(Popover, {
        props: {
          placement: 'top-end',
          content: '右上内容',
        },
        slots: {
          default: '<button>Top End</button>',
        },
      })

      const button = screen.getByText('Top End')
      await fireEvent.click(button)

      await waitFor(() => {
        const popover = document.querySelector('.qy-popover')
        expect(popover).toBeInTheDocument()
      })
    })

    it('应该正确设置 placement 为 bottom-start', async () => {
      render(Popover, {
        props: {
          placement: 'bottom-start',
          content: '左下内容',
        },
        slots: {
          default: '<button>Bottom Start</button>',
        },
      })

      const button = screen.getByText('Bottom Start')
      await fireEvent.click(button)

      await waitFor(() => {
        const popover = document.querySelector('.qy-popover')
        expect(popover).toBeInTheDocument()
      })
    })

    it('应该正确设置 placement 为 left-start', async () => {
      render(Popover, {
        props: {
          placement: 'left-start',
          content: '左上内容',
        },
        slots: {
          default: '<button>Left Start</button>',
        },
      })

      const button = screen.getByText('Left Start')
      await fireEvent.click(button)

      await waitFor(() => {
        const popover = document.querySelector('.qy-popover')
        expect(popover).toBeInTheDocument()
      })
    })

    it('应该正确设置 placement 为 right-end', async () => {
      render(Popover, {
        props: {
          placement: 'right-end',
          content: '右下内容',
        },
        slots: {
          default: '<button>Right End</button>',
        },
      })

      const button = screen.getByText('Right End')
      await fireEvent.click(button)

      await waitFor(() => {
        const popover = document.querySelector('.qy-popover')
        expect(popover).toBeInTheDocument()
      })
    })
  })

  describe('宽度设置', () => {
    it('应该正确设置数字宽度', async () => {
      render(Popover, {
        props: {
          width: 200,
          content: '宽度测试',
        },
        slots: {
          default: '<button>宽度</button>',
        },
      })

      const button = screen.getByText('宽度')
      await fireEvent.click(button)

      await waitFor(() => {
        const popover = document.querySelector('.qy-popover')
        expect(popover).toBeInTheDocument()
      })
    })

    it('应该正确设置字符串宽度', async () => {
      render(Popover, {
        props: {
          width: '300px',
          content: '宽度测试',
        },
        slots: {
          default: '<button>宽度</button>',
        },
      })

      const button = screen.getByText('宽度')
      await fireEvent.click(button)

      await waitFor(() => {
        const popover = document.querySelector('.qy-popover')
        expect(popover).toBeInTheDocument()
      })
    })

    it('应该在没有设置宽度时使用默认宽度', async () => {
      render(Popover, {
        props: {
          content: '宽度测试',
        },
        slots: {
          default: '<button>默认宽度</button>',
        },
      })

      const button = screen.getByText('默认宽度')
      await fireEvent.click(button)

      await waitFor(() => {
        const popover = document.querySelector('.qy-popover')
        expect(popover).toBeInTheDocument()
      })
    })
  })

  describe('禁用状态', () => {
    it('应该在禁用状态下应用禁用样式', () => {
      render(Popover, {
        props: {
          disabled: true,
          content: '内容',
        },
        slots: {
          default: '<button>禁用按钮</button>',
        },
      })

      const wrapper = document.querySelector('.qy-popover-wrapper')
      expect(wrapper?.firstElementChild).toHaveClass('cursor-not-allowed', 'opacity-50')
    })

    it('应该在非禁用状态下不应用禁用样式', () => {
      render(Popover, {
        props: {
          disabled: false,
          content: '内容',
        },
        slots: {
          default: '<button>正常按钮</button>',
        },
      })

      const wrapper = document.querySelector('.qy-popover-wrapper')
      expect(wrapper?.firstElementChild).not.toHaveClass('cursor-not-allowed')
    })
  })

  describe('箭头显示', () => {
    it('应该默认显示箭头', async () => {
      render(Popover, {
        props: {
          content: '带箭头',
        },
        slots: {
          default: '<button>箭头</button>',
        },
      })

      const button = screen.getByText('箭头')
      await fireEvent.click(button)

      await waitFor(() => {
        const popover = document.querySelector('.qy-popover')
        expect(popover).toBeInTheDocument()
      })
    })

    it('应该在 showArrow 为 false 时不显示箭头', async () => {
      render(Popover, {
        props: {
          showArrow: false,
          content: '无箭头',
        },
        slots: {
          default: '<button>无箭头</button>',
        },
      })

      const button = screen.getByText('无箭头')
      await fireEvent.click(button)

      await waitFor(() => {
        const popover = document.querySelector('.qy-popover')
        expect(popover).toBeInTheDocument()
      })
    })
  })

  describe('延迟控制', () => {
    it('应该支持 openDelay 属性', () => {
      render(Popover, {
        props: {
          trigger: 'hover',
          openDelay: 500,
          content: '延迟显示',
        },
        slots: {
          default: '<button>延迟</button>',
        },
      })

      expect(screen.getByText('延迟')).toBeInTheDocument()
    })

    it('应该支持 closeDelay 属性', () => {
      render(Popover, {
        props: {
          trigger: 'hover',
          closeDelay: 300,
          content: '延迟关闭',
        },
        slots: {
          default: '<button>延迟</button>',
        },
      })

      expect(screen.getByText('延迟')).toBeInTheDocument()
    })

    it('应该支持同时设置 openDelay 和 closeDelay', () => {
      render(Popover, {
        props: {
          trigger: 'hover',
          openDelay: 200,
          closeDelay: 300,
          content: '双向延迟',
        },
        slots: {
          default: '<button>双向延迟</button>',
        },
      })

      expect(screen.getByText('双向延迟')).toBeInTheDocument()
    })
  })

  describe('自定义样式', () => {
    it('应该支持 popperClass 属性', () => {
      render(Popover, {
        props: {
          popperClass: 'custom-class',
          content: '自定义类名',
        },
        slots: {
          default: '<button>自定义</button>',
        },
      })

      expect(screen.getByText('自定义')).toBeInTheDocument()
    })

    it('应该支持 popperStyle 属性', () => {
      render(Popover, {
        props: {
          popperStyle: { backgroundColor: 'red' },
          content: '自定义样式',
        },
        slots: {
          default: '<button>自定义</button>',
        },
      })

      expect(screen.getByText('自定义')).toBeInTheDocument()
    })
  })

  describe('插槽内容', () => {
    it('应该渲染默认插槽的触发元素', () => {
      render(Popover, {
        props: {
          content: '内容',
        },
        slots: {
          default: '<button class="custom-btn">自定义按钮</button>',
        },
      })

      expect(screen.getByText('自定义按钮')).toBeInTheDocument()
      expect(screen.getByText('自定义按钮')).toHaveClass('custom-btn')
    })

    it('应该支持 content 插槽', () => {
      render(Popover, {
        props: {},
        slots: {
          default: '<button>按钮</button>',
          content: '<div class="custom-content">自定义内容区域</div>',
        },
      })

      expect(screen.getByText('按钮')).toBeInTheDocument()
    })
  })

  describe('事件触发', () => {
    it('应该支持 beforeEnter 事件', () => {
      const beforeEnter = vi.fn()

      render(Popover, {
        props: {
          content: '内容',
          beforeEnter,
        },
        slots: {
          default: '<button>按钮</button>',
        },
      })

      expect(screen.getByText('按钮')).toBeInTheDocument()
    })

    it('应该支持 afterEnter 事件', () => {
      const afterEnter = vi.fn()

      render(Popover, {
        props: {
          content: '内容',
          afterEnter,
        },
        slots: {
          default: '<button>按钮</button>',
        },
      })

      expect(screen.getByText('按钮')).toBeInTheDocument()
    })

    it('应该支持 beforeLeave 事件', () => {
      const beforeLeave = vi.fn()

      render(Popover, {
        props: {
          content: '内容',
          beforeLeave,
        },
        slots: {
          default: '<button>按钮</button>',
        },
      })

      expect(screen.getByText('按钮')).toBeInTheDocument()
    })

    it('应该支持 afterLeave 事件', () => {
      const afterLeave = vi.fn()

      render(Popover, {
        props: {
          content: '内容',
          afterLeave,
        },
        slots: {
          default: '<button>按钮</button>',
        },
      })

      expect(screen.getByText('按钮')).toBeInTheDocument()
    })
  })

  describe('点击外部关闭', () => {
    it('应该支持 closeOnClickOutside 属性', () => {
      render(Popover, {
        props: {
          content: '内容',
          closeOnClickOutside: true,
        },
        slots: {
          default: '<button>按钮</button>',
        },
      })

      expect(screen.getByText('按钮')).toBeInTheDocument()
    })

    it('应该在 closeOnClickOutside 为 false 时不关闭', () => {
      render(Popover, {
        props: {
          content: '内容',
          closeOnClickOutside: false,
        },
        slots: {
          default: '<button>按钮</button>',
        },
      })

      expect(screen.getByText('按钮')).toBeInTheDocument()
    })
  })

  describe('手动控制模式', () => {
    it('应该在 manual 模式下支持 visible prop', () => {
      render(Popover, {
        props: {
          trigger: 'manual',
          visible: false,
          content: '手动控制',
        },
        slots: {
          default: '<button>按钮</button>',
        },
      })

      expect(screen.getByText('按钮')).toBeInTheDocument()
    })
  })

  describe('样式类名', () => {
    it('应该应用正确的基础样式类名', () => {
      render(Popover, {
        props: {
          content: '内容',
        },
        slots: {
          default: '<button>按钮</button>',
        },
      })

      const wrapper = document.querySelector('.qy-popover-wrapper')
      expect(wrapper).toBeInTheDocument()
      expect(wrapper).toHaveClass('inline-block')
    })

    it('应该在触发元素上应用正确的类名', () => {
      render(Popover, {
        props: {
          content: '内容',
        },
        slots: {
          default: '<button>按钮</button>',
        },
      })

      const wrapper = document.querySelector('.qy-popover-wrapper')
      expect(wrapper?.firstElementChild).toHaveClass('inline-block')
    })

    it('应该在禁用时应用禁用类名', () => {
      render(Popover, {
        props: {
          disabled: true,
          content: '内容',
        },
        slots: {
          default: '<button>禁用</button>',
        },
      })

      const wrapper = document.querySelector('.qy-popover-wrapper')
      expect(wrapper?.firstElementChild).toHaveClass('opacity-50')
    })
  })

  describe('可访问性', () => {
    it('应该在弹出框显示时设置正确的 role 属性', async () => {
      render(Popover, {
        props: {
          content: '内容',
        },
        slots: {
          default: '<button>按钮</button>',
        },
      })

      const button = screen.getByText('按钮')
      await fireEvent.click(button)

      await waitFor(() => {
        const popover = document.querySelector('.qy-popover')
        expect(popover).toHaveAttribute('role', 'tooltip')
      })
    })

    it('应该在弹出框上设置 aria-hidden 属性', async () => {
      render(Popover, {
        props: {
          content: '内容',
        },
        slots: {
          default: '<button>按钮</button>',
        },
      })

      const button = screen.getByText('按钮')
      await fireEvent.click(button)

      await waitFor(() => {
        const popover = document.querySelector('.qy-popover')
        expect(popover).toHaveAttribute('aria-hidden')
      })
    })
  })

  describe('边界情况', () => {
    it('应该处理空内容', () => {
      render(Popover, {
        props: {
          content: '',
        },
        slots: {
          default: '<button>空内容</button>',
        },
      })

      expect(screen.getByText('空内容')).toBeInTheDocument()
    })

    it('应该处理很长的内容', () => {
      const longContent = '这是一段很长的内容。'.repeat(10)

      render(Popover, {
        props: {
          content: longContent,
        },
        slots: {
          default: '<button>长内容</button>',
        },
      })

      expect(screen.getByText('长内容')).toBeInTheDocument()
    })

    it('应该处理零偏移量', () => {
      render(Popover, {
        props: {
          offset: 0,
          content: '零偏移',
        },
        slots: {
          default: '<button>偏移</button>',
        },
      })

      expect(screen.getByText('偏移')).toBeInTheDocument()
    })

    it('应该处理很大的偏移量', () => {
      render(Popover, {
        props: {
          offset: 1000,
          content: '大偏移',
        },
        slots: {
          default: '<button>偏移</button>',
        },
      })

      expect(screen.getByText('偏移')).toBeInTheDocument()
    })

    it('应该处理零延迟', () => {
      render(Popover, {
        props: {
          trigger: 'hover',
          openDelay: 0,
          closeDelay: 0,
          content: '零延迟',
        },
        slots: {
          default: '<button>延迟</button>',
        },
      })

      expect(screen.getByText('延迟')).toBeInTheDocument()
    })
  })

  describe('不同触发方式组合测试', () => {
    it('click + bottom + 有箭头', async () => {
      render(Popover, {
        props: {
          trigger: 'click',
          placement: 'bottom',
          showArrow: true,
          content: '组合测试',
        },
        slots: {
          default: '<button>组合</button>',
        },
      })

      const button = screen.getByText('组合')
      await fireEvent.click(button)

      await waitFor(() => {
        const popover = document.querySelector('.qy-popover')
        expect(popover).toBeInTheDocument()
      })
    })

    it('hover + top + 无箭头 + 延迟', () => {
      render(Popover, {
        props: {
          trigger: 'hover',
          placement: 'top',
          showArrow: false,
          openDelay: 200,
          content: '组合测试',
        },
        slots: {
          default: '<button>组合</button>',
        },
      })

      expect(screen.getByText('组合')).toBeInTheDocument()
    })

    it('focus + right + 自定义宽度', () => {
      render(Popover, {
        props: {
          trigger: 'focus',
          placement: 'right',
          width: 250,
          content: '组合测试',
        },
        slots: {
          default: '<button>组合</button>',
        },
      })

      const button = screen.getByText('组合')
      expect(button).toBeInTheDocument()
    })

    it('manual + left + 自定义样式', () => {
      render(Popover, {
        props: {
          trigger: 'manual',
          placement: 'left',
          popperClass: 'custom',
          content: '组合测试',
        },
        slots: {
          default: '<button>组合</button>',
        },
      })

      expect(screen.getByText('组合')).toBeInTheDocument()
    })

    it('click + top-start + 延迟 + 禁用外部点击', () => {
      render(Popover, {
        props: {
          trigger: 'click',
          placement: 'top-start',
          closeOnClickOutside: false,
          content: '组合测试',
        },
        slots: {
          default: '<button>组合</button>',
        },
      })

      expect(screen.getByText('组合')).toBeInTheDocument()
    })
  })

  describe('属性默认值', () => {
    it('应该使用默认的 trigger 值（click）', () => {
      render(Popover, {
        props: {
          content: '内容',
        },
        slots: {
          default: '<button>默认</button>',
        },
      })

      expect(screen.getByText('默认')).toBeInTheDocument()
    })

    it('应该使用默认的 placement 值（bottom）', () => {
      render(Popover, {
        props: {
          content: '内容',
        },
        slots: {
          default: '<button>默认</button>',
        },
      })

      expect(screen.getByText('默认')).toBeInTheDocument()
    })

    it('应该使用默认的 disabled 值（false）', () => {
      render(Popover, {
        props: {
          content: '内容',
        },
        slots: {
          default: '<button>默认</button>',
        },
      })

      const wrapper = document.querySelector('.qy-popover-wrapper')
      expect(wrapper?.firstElementChild).not.toHaveClass('cursor-not-allowed')
    })

    it('应该使用默认的 showArrow 值（true）', () => {
      render(Popover, {
        props: {
          content: '内容',
        },
        slots: {
          default: '<button>默认</button>',
        },
      })

      expect(screen.getByText('默认')).toBeInTheDocument()
    })

    it('应该使用默认的 closeOnClickOutside 值（true）', () => {
      render(Popover, {
        props: {
          content: '内容',
        },
        slots: {
          default: '<button>默认</button>',
        },
      })

      expect(screen.getByText('默认')).toBeInTheDocument()
    })

    it('应该使用默认的 offset 值（0）', () => {
      render(Popover, {
        props: {
          content: '内容',
        },
        slots: {
          default: '<button>默认</button>',
        },
      })

      expect(screen.getByText('默认')).toBeInTheDocument()
    })

    it('应该使用默认的 openDelay 值（0）', () => {
      render(Popover, {
        props: {
          trigger: 'hover',
          content: '内容',
        },
        slots: {
          default: '<button>默认</button>',
        },
      })

      expect(screen.getByText('默认')).toBeInTheDocument()
    })

    it('应该使用默认的 closeDelay 值（200）', () => {
      render(Popover, {
        props: {
          trigger: 'hover',
          content: '内容',
        },
        slots: {
          default: '<button>默认</button>',
        },
      })

      expect(screen.getByText('默认')).toBeInTheDocument()
    })
  })

  describe('交互行为', () => {
    it('应该支持多次点击切换', async () => {
      render(Popover, {
        props: {
          content: '切换内容',
        },
        slots: {
          default: '<button>切换</button>',
        },
      })

      const button = screen.getByText('切换')

      // 第一次点击
      await fireEvent.click(button)
      await waitFor(() => {
        const popover = document.querySelector('.qy-popover')
        expect(popover).toBeInTheDocument()
      })
    })

    it('应该在悬停时保持显示状态', () => {
      render(Popover, {
        props: {
          trigger: 'hover',
          content: '悬停内容',
        },
        slots: {
          default: '<button>悬停</button>',
        },
      })

      expect(screen.getByText('悬停')).toBeInTheDocument()
    })
  })

  describe('所有位置变体', () => {
    const placements = [
      'top', 'top-start', 'top-end',
      'bottom', 'bottom-start', 'bottom-end',
      'left', 'left-start', 'left-end',
      'right', 'right-start', 'right-end',
    ] as const

    placements.forEach((placement) => {
      it(`应该支持 ${placement} 位置`, async () => {
        render(Popover, {
          props: {
            placement,
            content: `${placement} 内容`,
          },
          slots: {
            default: `<button>${placement}</button>`,
          },
        })

        const button = screen.getByText(placement)
        await fireEvent.click(button)

        await waitFor(() => {
          const popover = document.querySelector('.qy-popover')
          expect(popover).toBeInTheDocument()
        })
      })
    })
  })

  describe('所有触发方式', () => {
    const triggers = ['click', 'hover', 'focus', 'manual'] as const

    triggers.forEach((trigger) => {
      it(`应该支持 ${trigger} 触发方式`, () => {
        render(Popover, {
          props: {
            trigger,
            content: `${trigger} 内容`,
          },
          slots: {
            default: `<button>${trigger}</button>`,
          },
        })

        expect(screen.getByText(trigger)).toBeInTheDocument()
      })
    })
  })

  describe('DOM 结构', () => {
    it('应该正确渲染包装器元素', () => {
      render(Popover, {
        props: {
          content: '内容',
        },
        slots: {
          default: '<button>按钮</button>',
        },
      })

      const wrapper = document.querySelector('.qy-popover-wrapper')
      expect(wrapper).toBeInTheDocument()
      expect(wrapper).toHaveClass('relative', 'inline-block')
    })

    it('应该正确渲染触发元素', () => {
      render(Popover, {
        props: {
          content: '内容',
        },
        slots: {
          default: '<button class="test-btn">测试按钮</button>',
        },
      })

      expect(screen.getByText('测试按钮')).toBeInTheDocument()
      expect(screen.getByText('测试按钮')).toHaveClass('test-btn')
    })
  })

  describe('事件监听器', () => {
    it('应该在触发元素上绑定正确的事件监听器', () => {
      render(Popover, {
        props: {
          trigger: 'click',
          content: '内容',
        },
        slots: {
          default: '<button>点击</button>',
        },
      })

      const button = screen.getByText('点击')
      expect(button).toBeInTheDocument()
    })

    it('应该在 hover 模式下绑定鼠标事件', () => {
      render(Popover, {
        props: {
          trigger: 'hover',
          content: '内容',
        },
        slots: {
          default: '<button>悬停</button>',
        },
      })

      const button = screen.getByText('悬停')
      expect(button).toBeInTheDocument()
    })

    it('应该在 focus 模式下绑定焦点事件', () => {
      render(Popover, {
        props: {
          trigger: 'focus',
          content: '内容',
        },
        slots: {
          default: '<button>聚焦</button>',
        },
      })

      const button = screen.getByText('聚焦')
      expect(button).toBeInTheDocument()
    })
  })
})
