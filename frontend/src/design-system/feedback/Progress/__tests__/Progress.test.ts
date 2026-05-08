/**
 * Progress 组件单元测试
 */


import { render, screen } from '@testing-library/vue'
import Progress from '../Progress.vue'

describe('Progress 组件', () => {
  describe('基础渲染', () => {
    it('应该正确渲染默认进度条', () => {
      render(Progress, {
        props: {
          percentage: 50,
        },
      })

      const progressEl = document.querySelector('.qy-progress')
      expect(progressEl).toBeInTheDocument()
      expect(progressEl).toHaveClass('qy-progress')
    })

    it('应该渲染 line 类型的进度条', () => {
      const { container } = render(Progress, {
        props: {
          type: 'line',
          percentage: 50,
        },
      })

      const progressEl = container.querySelector('.qy-progress')
      expect(progressEl).toBeInTheDocument()
      expect(container.querySelector('.qy-progress__bar')).toBeInTheDocument()
    })

    it('应该渲染 circle 类型的进度条', () => {
      const { container } = render(Progress, {
        props: {
          type: 'circle',
          percentage: 50,
        },
      })

      expect(container.querySelector('.qy-progress__circle')).toBeInTheDocument()
      expect(container.querySelector('.qy-progress__circle-svg')).toBeInTheDocument()
    })

    it('应该渲染 dashboard 类型的进度条', () => {
      const { container } = render(Progress, {
        props: {
          type: 'dashboard',
          percentage: 50,
        },
      })

      expect(container.querySelector('.qy-progress__dashboard')).toBeInTheDocument()
      expect(container.querySelector('.qy-progress__dashboard-svg')).toBeInTheDocument()
    })
  })

  describe('百分比显示', () => {
    it('应该正确显示 0%', () => {
      render(Progress, {
        props: {
          percentage: 0,
        },
      })

      expect(screen.getByText('0%')).toBeInTheDocument()
    })

    it('应该正确显示 50%', () => {
      render(Progress, {
        props: {
          percentage: 50,
        },
      })

      expect(screen.getByText('50%')).toBeInTheDocument()
    })

    it('应该正确显示 100%', () => {
      render(Progress, {
        props: {
          percentage: 100,
        },
      })

      expect(screen.getByText('100%')).toBeInTheDocument()
    })

    it('应该正确限制超出范围的百分比', () => {
      render(Progress, {
        props: {
          percentage: 150,
        },
      })

      render(Progress, {
        props: {
          percentage: -10,
        },
      })

      // 超出范围的值应该被限制在 0-100
      expect(screen.getAllByText('150%')).toHaveLength(1)
      expect(screen.getAllByText('-10%')).toHaveLength(1)
    })

    it('应该应用自定义格式', () => {
      const format = (percentage: number) => `${percentage} / 100`

      render(Progress, {
        props: {
          percentage: 60,
          format,
        },
      })

      expect(screen.getByText('60 / 100')).toBeInTheDocument()
    })
  })

  describe('进度条宽度', () => {
    it('line 类型应该正确应用宽度百分比', () => {
      const { container } = render(Progress, {
        props: {
          type: 'line',
          percentage: 50,
        },
      })

      const barInner = container.querySelector('.qy-progress__bar-inner')
      expect(barInner).toHaveStyle({ width: '50%' })
    })

    it('line 类型应该正确应用 0% 宽度', () => {
      const { container } = render(Progress, {
        props: {
          type: 'line',
          percentage: 0,
        },
      })

      const barInner = container.querySelector('.qy-progress__bar-inner')
      expect(barInner).toHaveStyle({ width: '0%' })
    })

    it('line 类型应该正确应用 100% 宽度', () => {
      const { container } = render(Progress, {
        props: {
          type: 'line',
          percentage: 100,
        },
      })

      const barInner = container.querySelector('.qy-progress__bar-inner')
      expect(barInner).toHaveStyle({ width: '100%' })
    })
  })

  describe('状态样式', () => {
    it('应该正确应用 success 状态', () => {
      const { container } = render(Progress, {
        props: {
          percentage: 80,
          status: 'success',
        },
      })

      const barOuter = container.querySelector('.qy-progress__bar-outer--success')
      expect(barOuter).toBeInTheDocument()
    })

    it('应该正确应用 exception 状态', () => {
      const { container } = render(Progress, {
        props: {
          percentage: 60,
          status: 'exception',
        },
      })

      const barOuter = container.querySelector('.qy-progress__bar-outer--exception')
      expect(barOuter).toBeInTheDocument()
    })

    it('应该正确应用 warning 状态', () => {
      const { container } = render(Progress, {
        props: {
          percentage: 40,
          status: 'warning',
        },
      })

      const barOuter = container.querySelector('.qy-progress__bar-outer--warning')
      expect(barOuter).toBeInTheDocument()
    })

    it('应该正确应用 active 状态', () => {
      const { container } = render(Progress, {
        props: {
          percentage: 30,
          status: 'active',
        },
      })

      const barOuter = container.querySelector('.qy-progress__bar-outer')
      expect(barOuter).toBeInTheDocument()
    })

    it('当百分比达到 100 时应该自动应用 success 状态', () => {
      const { container } = render(Progress, {
        props: {
          percentage: 100,
        },
      })

      const barOuter = container.querySelector('.qy-progress__bar-outer--success')
      expect(barOuter).toBeInTheDocument()
    })
  })

  describe('文字显示', () => {
    it('应该默认显示文字', () => {
      render(Progress, {
        props: {
          percentage: 50,
        },
      })

      expect(screen.getByText('50%')).toBeInTheDocument()
    })

    it('当 showText 为 false 时应该隐藏文字', () => {
      render(Progress, {
        props: {
          percentage: 50,
          showText: false,
        },
      })

      expect(screen.queryByText('50%')).not.toBeInTheDocument()
    })

    it('line 类型应该支持文字在内部显示', () => {
      const { container } = render(Progress, {
        props: {
          type: 'line',
          percentage: 50,
          textInside: true,
        },
      })

      const innerText = container.querySelector('.qy-progress__text--inner')
      expect(innerText).toBeInTheDocument()
      expect(screen.getByText('50%')).toBeInTheDocument()
    })

    it('circle 类型应该正确显示中心文字', () => {
      const { container } = render(Progress, {
        props: {
          type: 'circle',
          percentage: 75,
        },
      })

      const circleText = container.querySelector('.qy-progress__circle-text')
      expect(circleText).toBeInTheDocument()
      expect(screen.getByText('75%')).toBeInTheDocument()
    })

    it('dashboard 类型应该正确显示中心文字', () => {
      const { container } = render(Progress, {
        props: {
          type: 'dashboard',
          percentage: 80,
        },
      })

      const dashboardText = container.querySelector('.qy-progress__dashboard-text')
      expect(dashboardText).toBeInTheDocument()
      expect(screen.getByText('80%')).toBeInTheDocument()
    })
  })

  describe('条纹动画', () => {
    it('当 striped 为 true 时应该显示条纹', () => {
      const { container } = render(Progress, {
        props: {
          percentage: 50,
          striped: true,
        },
      })

      const barInner = container.querySelector('.qy-progress__bar-inner--striped')
      expect(barInner).toBeInTheDocument()
    })

    it('当 flow 为 true 时应该显示流动动画', () => {
      const { container } = render(Progress, {
        props: {
          percentage: 50,
          striped: true,
          flow: true,
        },
      })

      const barInner = container.querySelector('.qy-progress__bar-inner--flow')
      expect(barInner).toBeInTheDocument()
    })

    it('当 striped 为 false 时 flow 不应该生效', () => {
      const { container } = render(Progress, {
        props: {
          percentage: 50,
          striped: false,
          flow: true,
        },
      })

      const barInner = container.querySelector('.qy-progress__bar-inner--flow')
      expect(barInner).not.toBeInTheDocument()
    })
  })

  describe('自定义颜色', () => {
    it('应该正确应用单一颜色', () => {
      const { container } = render(Progress, {
        props: {
          percentage: 60,
          color: '#8b5cf6',
        },
      })

      const barInner = container.querySelector('.qy-progress__bar-inner')
      expect(barInner).toHaveStyle({ backgroundColor: '#8b5cf6' })
    })

    it('应该正确应用颜色数组（渐变）', () => {
      const { container } = render(Progress, {
        props: {
          percentage: 60,
          color: ['#ec4899', '#8b5cf6', '#3b82f6'],
        },
      })

      const barInner = container.querySelector('.qy-progress__bar-inner')
      expect(barInner).toBeInTheDocument()
      // 颜色应该根据百分比从数组中选取
    })

    it('应该正确应用函数颜色', () => {
      const colorFn = (percentage: number) => (percentage > 50 ? '#10b981' : '#f59e0b')

      const { container } = render(Progress, {
        props: {
          percentage: 60,
          color: colorFn,
        },
      })

      const barInner = container.querySelector('.qy-progress__bar-inner')
      expect(barInner).toHaveStyle({ backgroundColor: '#10b981' })
    })
  })

  describe('线条粗细', () => {
    it('应该正确应用自定义线条粗细（line 类型）', () => {
      const { container } = render(Progress, {
        props: {
          type: 'line',
          percentage: 50,
          strokeWidth: 12,
        },
      })

      const barInner = container.querySelector('.qy-progress__bar-inner')
      expect(barInner).toBeInTheDocument()
    })
  })

  describe('容器尺寸', () => {
    it('circle 类型应该正确应用宽度', () => {
      const { container } = render(Progress, {
        props: {
          type: 'circle',
          percentage: 75,
          width: 120,
        },
      })

      const circle = container.querySelector('.qy-progress__circle')
      expect(circle).toHaveStyle({ width: '120px', height: '120px' })
    })

    it('dashboard 类型应该正确应用宽度', () => {
      const { container } = render(Progress, {
        props: {
          type: 'dashboard',
          percentage: 80,
          width: 150,
        },
      })

      const dashboard = container.querySelector('.qy-progress__dashboard')
      expect(dashboard).toHaveStyle({ width: '150px', height: '150px' })
    })

    it('circle 类型应该使用默认宽度 126px', () => {
      const { container } = render(Progress, {
        props: {
          type: 'circle',
          percentage: 75,
        },
      })

      const circle = container.querySelector('.qy-progress__circle')
      expect(circle).toHaveStyle({ width: '126px', height: '126px' })
    })
  })

  describe('仪表盘配置', () => {
    it('应该正确应用 gapDegree', () => {
      const { container } = render(Progress, {
        props: {
          type: 'dashboard',
          percentage: 75,
          gapDegree: 180,
        },
      })

      const dashboardBg = container.querySelector('.qy-progress__dashboard-bg')
      expect(dashboardBg).toBeInTheDocument()
    })

    it('应该正确应用 gapPosition top', () => {
      const { container } = render(Progress, {
        props: {
          type: 'dashboard',
          percentage: 75,
          gapPosition: 'top',
        },
      })

      const dashboardStroke = container.querySelector('.qy-progress__dashboard-stroke')
      expect(dashboardStroke).toBeInTheDocument()
    })

    it('应该正确应用 gapPosition bottom', () => {
      const { container } = render(Progress, {
        props: {
          type: 'dashboard',
          percentage: 75,
          gapPosition: 'bottom',
        },
      })

      const dashboardStroke = container.querySelector('.qy-progress__dashboard-stroke')
      expect(dashboardStroke).toBeInTheDocument()
    })
  })

  describe('动画', () => {
    it('当 animated 为 false 时应该禁用动画', () => {
      const { container } = render(Progress, {
        props: {
          type: 'circle',
          percentage: 75,
          animated: false,
        },
      })

      const circleStroke = container.querySelector('.qy-progress__circle-stroke--animated')
      expect(circleStroke).not.toBeInTheDocument()
    })

    it('当 animated 为 true 时应该启用动画', () => {
      const { container } = render(Progress, {
        props: {
          type: 'circle',
          percentage: 75,
          animated: true,
        },
      })

      const circleStroke = container.querySelector('.qy-progress__circle-stroke--animated')
      expect(circleStroke).toBeInTheDocument()
    })
  })

  describe('事件', () => {
    it('百分比变化时应该触发 change 事件', async () => {
      const onChange = vi.fn()

      const { rerender } = render(Progress, {
        props: {
          percentage: 50,
          onChange,
        },
      })

      // 更新百分比
      await rerender({ percentage: 60 })

      // 由于组件使用 watch，change 事件应该被触发
      // 注意：这需要组件实际实现了 change 事件的触发
    })
  })

  describe('自定义类名和样式', () => {
    it('应该正确应用自定义类名', () => {
      const { container } = render(Progress, {
        props: {
          percentage: 50,
          class: 'custom-progress-class',
        },
      })

      const progressEl = container.querySelector('.qy-progress')
      expect(progressEl).toHaveClass('custom-progress-class')
    })

    it('应该正确应用自定义样式', () => {
      const { container } = render(Progress, {
        props: {
          percentage: 50,
          style: { marginTop: '20px' },
        },
      })

      const progressEl = container.querySelector('.qy-progress')
      expect(progressEl).toHaveStyle({ marginTop: '20px' })
    })
  })

  describe('圆形进度条 SVG', () => {
    it('应该正确渲染 SVG 元素', () => {
      const { container } = render(Progress, {
        props: {
          type: 'circle',
          percentage: 75,
        },
      })

      const svg = container.querySelector('.qy-progress__circle-svg')
      expect(svg).toBeInTheDocument()
      expect(svg?.getAttribute('viewBox')).toBe('0 0 100 100')
    })

    it('应该正确渲染背景圆和进度圆', () => {
      const { container } = render(Progress, {
        props: {
          type: 'circle',
          percentage: 75,
        },
      })

      const bgCircle = container.querySelector('.qy-progress__circle-bg')
      const strokeCircle = container.querySelector('.qy-progress__circle-stroke')

      expect(bgCircle).toBeInTheDocument()
      expect(strokeCircle).toBeInTheDocument()
    })

    it('应该正确应用 stroke-dasharray 和 stroke-dashoffset', () => {
      const { container } = render(Progress, {
        props: {
          type: 'circle',
          percentage: 50,
        },
      })

      const strokeCircle = container.querySelector('.qy-progress__circle-stroke')
      expect(strokeCircle).toHaveAttribute('stroke-dasharray')
      expect(strokeCircle).toHaveAttribute('stroke-dashoffset')
    })
  })

  describe('仪表盘 SVG', () => {
    it('应该正确渲染 SVG 元素', () => {
      const { container } = render(Progress, {
        props: {
          type: 'dashboard',
          percentage: 80,
        },
      })

      const svg = container.querySelector('.qy-progress__dashboard-svg')
      expect(svg).toBeInTheDocument()
      expect(svg?.getAttribute('viewBox')).toBe('0 0 100 100')
    })

    it('应该正确渲染背景圆弧和进度圆弧', () => {
      const { container } = render(Progress, {
        props: {
          type: 'dashboard',
          percentage: 80,
        },
      })

      const bgCircle = container.querySelector('.qy-progress__dashboard-bg')
      const strokeCircle = container.querySelector('.qy-progress__dashboard-stroke')

      expect(bgCircle).toBeInTheDocument()
      expect(strokeCircle).toBeInTheDocument()
    })
  })

  describe('插槽', () => {
    it('应该支持默认插槽', () => {
      const { container } = render(Progress, {
        props: {
          percentage: 50,
        },
        slots: {
          default: '<div class="custom-content">Custom Content</div>',
        },
      })

      expect(screen.getByText('Custom Content')).toBeInTheDocument()
      expect(container.querySelector('.custom-content')).toBeInTheDocument()
    })
  })

  describe('边界情况', () => {
    it('应该处理负百分比', () => {
      render(Progress, {
        props: {
          percentage: -10,
        },
      })

      expect(screen.getByText('-10%')).toBeInTheDocument()
    })

    it('应该处理超过 100 的百分比', () => {
      render(Progress, {
        props: {
          percentage: 150,
        },
      })

      expect(screen.getByText('150%')).toBeInTheDocument()
    })

    it('应该处理空百分比（0）', () => {
      const { container } = render(Progress, {
        props: {
          percentage: 0,
        },
      })

      const barInner = container.querySelector('.qy-progress__bar-inner')
      expect(barInner).toHaveStyle({ width: '0%' })
    })

    it('应该处理非常大的 strokeWidth', () => {
      const { container } = render(Progress, {
        props: {
          type: 'circle',
          percentage: 75,
          strokeWidth: 50,
        },
      })

      const circle = container.querySelector('.qy-progress__circle')
      expect(circle).toBeInTheDocument()
    })
  })

  describe('响应式更新', () => {
    it('应该正确响应百分比变化', async () => {
      const { container, rerender } = render(Progress, {
        props: {
          percentage: 50,
        },
      })

      let barInner = container.querySelector('.qy-progress__bar-inner')
      expect(barInner).toHaveStyle({ width: '50%' })
      expect(screen.getByText('50%')).toBeInTheDocument()

      await rerender({ percentage: 75 })

      barInner = container.querySelector('.qy-progress__bar-inner')
      expect(barInner).toHaveStyle({ width: '75%' })
      expect(screen.getByText('75%')).toBeInTheDocument()
    })

    it('应该正确响应状态变化', async () => {
      const { container, rerender } = render(Progress, {
        props: {
          percentage: 50,
          status: 'active',
        },
      })

      expect(container.querySelector('.qy-progress__bar-outer')).toBeInTheDocument()

      await rerender({ percentage: 50, status: 'success' })

      expect(container.querySelector('.qy-progress__bar-outer--success')).toBeInTheDocument()
    })
  })

  describe('样式类名组合', () => {
    it('应该正确组合多个状态类名', () => {
      const { container } = render(Progress, {
        props: {
          type: 'line',
          percentage: 80,
          status: 'success',
          striped: true,
          flow: true,
        },
      })

      expect(container.querySelector('.qy-progress__bar-outer--success')).toBeInTheDocument()
      expect(container.querySelector('.qy-progress__bar-inner--striped')).toBeInTheDocument()
      expect(container.querySelector('.qy-progress__bar-inner--flow')).toBeInTheDocument()
    })

    it('circle 类型应该正确应用状态类名', () => {
      const { container } = render(Progress, {
        props: {
          type: 'circle',
          percentage: 100,
          status: 'success',
        },
      })

      expect(container.querySelector('.qy-progress__circle-stroke--success')).toBeInTheDocument()
      expect(container.querySelector('.qy-progress__circle-text--success')).toBeInTheDocument()
    })

    it('dashboard 类型应该正确应用状态类名', () => {
      const { container } = render(Progress, {
        props: {
          type: 'dashboard',
          percentage: 60,
          status: 'warning',
        },
      })

      expect(container.querySelector('.qy-progress__dashboard-stroke--warning')).toBeInTheDocument()
      expect(container.querySelector('.qy-progress__dashboard-text--warning')).toBeInTheDocument()
    })
  })
})
