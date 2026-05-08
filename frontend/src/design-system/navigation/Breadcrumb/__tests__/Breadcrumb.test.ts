/**
 * Breadcrumb 组件单元测试
 */

// @ts-nocheck - Test file with flexible type assertions
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { useRouter } from 'vue-router'
import Breadcrumb from '../Breadcrumb.vue'
import BreadcrumbItem from '../BreadcrumbItem.vue'
import BreadcrumbSeparator from '../BreadcrumbSeparator.vue'

// Mock vue-router
vi.mock('vue-router', () => ({
  useRouter: vi.fn(),
  useRoute: vi.fn(() => ({ path: '/' })),
}))

describe('Breadcrumb 组件', () => {
  const mockRouter = {
    push: vi.fn(),
    replace: vi.fn(),
  }

  beforeEach(() => {
    vi.mocked(useRouter).mockReturnValue(mockRouter)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('基础渲染', () => {
    it('应该正确渲染面包屑容器', () => {
      const { container } = render(Breadcrumb, {
        slots: {
          default: '<span>测试内容</span>',
        },
      })

      const nav = container.querySelector('nav')
      expect(nav).toBeTruthy()
      expect(nav).toHaveAttribute('aria-label', 'Breadcrumb')
    })

    it('应该渲染有序列表', () => {
      const { container } = render(Breadcrumb, {
        slots: {
          default: '<span>测试内容</span>',
        },
      })

      const ol = container.querySelector('ol')
      expect(ol).toBeTruthy()
    })

    it('应该应用自定义类名', () => {
      const { container } = render(Breadcrumb, {
        props: {
          class: 'custom-class',
        },
        slots: {
          default: '<span>测试</span>',
        },
      })

      const nav = container.querySelector('nav')
      expect(nav).toHaveClass('custom-class')
    })

    it('应该应用默认样式类', () => {
      const { container } = render(Breadcrumb, {
        slots: {
          default: '<span>测试</span>',
        },
      })

      const nav = container.querySelector('nav')
      expect(nav).toHaveClass('flex')
      expect(nav).toHaveClass('items-center')
    })
  })

  describe('BreadcrumbItem 组件', () => {
    it('应该渲染面包屑项', () => {
      render(BreadcrumbItem, {
        slots: {
          default: '首页',
        },
      })

      expect(screen.getByText('首页')).toBeTruthy()
    })

    it('应该渲染为列表项', () => {
      const { container } = render(BreadcrumbItem, {
        slots: {
          default: '测试',
        },
      })

      const li = container.querySelector('li')
      expect(li).toBeTruthy()
    })

    it('应该应用自定义类名', () => {
      const { container } = render(BreadcrumbItem, {
        props: {
          class: 'custom-item-class',
        },
        slots: {
          default: '测试',
        },
      })

      const element = container.querySelector('[class*="custom-item-class"]')
      expect(element).toBeTruthy()
    })

    it('应该在点击时触发事件', async () => {
      const { emitted } = render(BreadcrumbItem, {
        props: {
          clickable: true,
        },
        slots: {
          default: '点击测试',
        },
      })

      const button = screen.getByText('点击测试')
      await fireEvent.click(button)

      expect(emitted()).toHaveProperty('click')
    })

    it('应该在不可点击时不触发事件', async () => {
      const { emitted } = render(BreadcrumbItem, {
        props: {
          clickable: false,
        },
        slots: {
          default: '不可点击',
        },
      })

      const button = screen.getByText('不可点击')
      await fireEvent.click(button)

      // 不应该触发 click 事件
      expect(emitted().click).toBeUndefined()
    })

    it('应该支持clickable属性', () => {
      const { container } = render(BreadcrumbItem, {
        props: {
          clickable: true,
        },
        slots: {
          default: '可点击',
        },
      })

      const button = container.querySelector('button')
      expect(button).toBeTruthy()
    })

    it('应该支持replace属性', () => {
      render(BreadcrumbItem, {
        props: {
          to: '/test',
          replace: true,
        },
        slots: {
          default: '测试',
        },
      })

      expect(screen.getByText('测试')).toBeTruthy()
    })
  })

  describe('路由导航', () => {
    it('应该支持to属性用于路由链接', () => {
      render(
        {
          components: { Breadcrumb, BreadcrumbItem },
          template: `
            <Breadcrumb>
              <BreadcrumbItem to="/test-path">测试链接</BreadcrumbItem>
            </Breadcrumb>
          `,
        },
        {}
      )

      expect(screen.getByText('测试链接')).toBeTruthy()
    })

    it('应该支持replace属性', () => {
      render(
        {
          components: { Breadcrumb, BreadcrumbItem },
          template: `
            <Breadcrumb>
              <BreadcrumbItem to="/replace-path" :replace="true">替换链接</BreadcrumbItem>
            </Breadcrumb>
          `,
        },
        {}
      )

      expect(screen.getByText('替换链接')).toBeTruthy()
    })

    it('应该支持对象形式的路由', () => {
      const routeObject = { name: 'testRoute', params: { id: 1 } }

      render(
        {
          components: { Breadcrumb, BreadcrumbItem },
          template: `
            <Breadcrumb>
              <BreadcrumbItem :to="routeObject">对象路由</BreadcrumbItem>
            </Breadcrumb>
          `,
          setup() {
            return { routeObject }
          },
        },
        {}
      )

      expect(screen.getByText('对象路由')).toBeTruthy()
    })
  })

  describe('分隔符', () => {
    it('应该使用默认分隔符', () => {
      const { container } = render(
        {
          components: { Breadcrumb, BreadcrumbItem },
          template: `
            <Breadcrumb>
              <BreadcrumbItem>首页</BreadcrumbItem>
              <BreadcrumbItem>产品</BreadcrumbItem>
            </Breadcrumb>
          `,
        },
        {}
      )

      const separators = container.querySelectorAll('span')
      const hasSeparator = Array.from(separators).some((span) =>
        span.textContent?.includes('/')
      )
      expect(hasSeparator).toBe(true)
    })

    it('应该使用自定义分隔符', () => {
      const { container } = render(
        {
          components: { Breadcrumb, BreadcrumbItem },
          template: `
            <Breadcrumb separator=">">
              <BreadcrumbItem>首页</BreadcrumbItem>
              <BreadcrumbItem>产品</BreadcrumbItem>
            </Breadcrumb>
          `,
        },
        {}
      )

      const separators = container.querySelectorAll('span')
      const hasCustomSeparator = Array.from(separators).some((span) =>
        span.textContent?.includes('>')
      )
      expect(hasCustomSeparator).toBe(true)
    })

    it('应该应用分隔符自定义类名', () => {
      const { container } = render(
        {
          components: { Breadcrumb, BreadcrumbItem },
          template: `
            <Breadcrumb separatorClass="text-red-500">
              <BreadcrumbItem>首页</BreadcrumbItem>
              <BreadcrumbItem>产品</BreadcrumbItem>
            </Breadcrumb>
          `,
        },
        {}
      )

      const separator = container.querySelector('.text-red-500')
      expect(separator).toBeTruthy()
    })
  })

  describe('BreadcrumbSeparator 组件', () => {
    it('应该渲染自定义分隔符', () => {
      const { container } = render(BreadcrumbSeparator, {
        slots: {
          default: '>',
        },
      })

      const separator = container.querySelector('span')
      expect(separator).toBeTruthy()
      expect(separator?.textContent).toBe('>')
    })

    it('应该应用自定义类名', () => {
      const { container } = render(BreadcrumbSeparator, {
        props: {
          class: 'text-red-500 custom-separator',
        },
        slots: {
          default: '>',
        },
      })

      const separator = container.querySelector('span')
      expect(separator?.classList.contains('custom-separator')).toBe(true)
    })

    it('应该渲染 SVG 图标作为分隔符', () => {
      const { container } = render(BreadcrumbSeparator, {
        slots: {
          default: '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4"><path d="M9 5l7 7-7 7"/></svg>',
        },
      })

      const svg = container.querySelector('svg')
      expect(svg).toBeTruthy()
    })

    it('应该应用基础样式类', () => {
      const { container } = render(BreadcrumbSeparator, {
        slots: {
          default: '→',
        },
      })

      const separator = container.querySelector('span')
      expect(separator?.className).toContain('flex')
    })
  })

  describe('组合使用', () => {
    it('应该渲染完整的面包屑导航', () => {
      const { container } = render(
        {
          components: { Breadcrumb, BreadcrumbItem },
          template: `
            <Breadcrumb>
              <BreadcrumbItem to="/">首页</BreadcrumbItem>
              <BreadcrumbItem to="/products">产品</BreadcrumbItem>
              <BreadcrumbItem>详情</BreadcrumbItem>
            </Breadcrumb>
          `,
        },
        {}
      )

      const items = container.querySelectorAll('li')
      expect(items.length).toBe(3)
    })

    it('应该正确区分最后一项', () => {
      const { container } = render(
        {
          components: { Breadcrumb, BreadcrumbItem },
          template: `
            <Breadcrumb>
              <BreadcrumbItem to="/">首页</BreadcrumbItem>
              <BreadcrumbItem to="/products">产品</BreadcrumbItem>
              <BreadcrumbItem>详情</BreadcrumbItem>
            </Breadcrumb>
          `,
        },
        {}
      )

      const items = container.querySelectorAll('li')
      const lastItem = items[items.length - 1]
      expect(lastItem).toBeTruthy()
    })

    it('应该支持嵌套插槽', () => {
      render(
        {
          components: { Breadcrumb, BreadcrumbItem, BreadcrumbSeparator },
          template: `
            <Breadcrumb separator="">
              <BreadcrumbItem to="/">首页</BreadcrumbItem>
              <BreadcrumbSeparator>
                <span class="custom-sep">›</span>
              </BreadcrumbSeparator>
              <BreadcrumbItem>产品</BreadcrumbItem>
            </Breadcrumb>
          `,
        },
        {}
      )

      expect(screen.getByText('›')).toBeTruthy()
      expect(screen.getByText('首页')).toBeTruthy()
      expect(screen.getByText('产品')).toBeTruthy()
    })
  })

  describe('样式和类名', () => {
    it('应该为可点击项应用悬停样式', () => {
      const { container } = render(
        {
          components: { Breadcrumb, BreadcrumbItem },
          template: `
            <Breadcrumb>
              <BreadcrumbItem to="/test" clickable>可点击项</BreadcrumbItem>
            </Breadcrumb>
          `,
        },
        {}
      )

      const element = container.querySelector('[class*="hover:"]')
      expect(element).toBeTruthy()
    })

    it('应该为不可点击项应用普通样式', () => {
      const { container } = render(BreadcrumbItem, {
        props: {
          clickable: false,
        },
        slots: {
          default: '普通项',
        },
      })

      const span = container.querySelector('span')
      expect(span?.className).toContain('font-medium')
    })

    it('应该支持响应式类名', () => {
      const { container } = render(Breadcrumb, {
        props: {
          class: 'text-base md:text-lg',
        },
        slots: {
          default: '<span>测试</span>',
        },
      })

      const nav = container.querySelector('nav')
      expect(nav).toHaveClass('text-base', 'md:text-lg')
    })
  })

  describe('可访问性', () => {
    it('应该设置正确的 ARIA 标签', () => {
      const { container } = render(Breadcrumb, {
        slots: {
          default: '<span>测试</span>',
        },
      })

      const nav = container.querySelector('nav')
      expect(nav).toHaveAttribute('aria-label', 'Breadcrumb')
    })

    it('应该为不可点击项设置正确的按钮类型', () => {
      const { container } = render(BreadcrumbItem, {
        props: {
          clickable: true,
        },
        slots: {
          default: '按钮项',
        },
      })

      const button = container.querySelector('button')
      expect(button?.getAttribute('type')).toBe('button')
    })
  })

  describe('边界情况', () => {
    it('应该处理空内容', () => {
      const { container } = render(BreadcrumbItem, {
        slots: {
          default: '',
        },
      })

      const li = container.querySelector('li')
      expect(li).toBeTruthy()
    })

    it('应该处理单个面包屑项', () => {
      const { container } = render(
        {
          components: { Breadcrumb, BreadcrumbItem },
          template: `
            <Breadcrumb>
              <BreadcrumbItem>首页</BreadcrumbItem>
            </Breadcrumb>
          `,
        },
        {}
      )

      const items = container.querySelectorAll('li')
      expect(items.length).toBe(1)
    })

    it('应该处理多个面包屑项', () => {
      const { container } = render(
        {
          components: { Breadcrumb, BreadcrumbItem },
          template: `
            <Breadcrumb>
              <BreadcrumbItem>首页</BreadcrumbItem>
              <BreadcrumbItem>产品</BreadcrumbItem>
              <BreadcrumbItem>详情</BreadcrumbItem>
              <BreadcrumbItem>更多信息</BreadcrumbItem>
              <BreadcrumbItem>最终页</BreadcrumbItem>
            </Breadcrumb>
          `,
        },
        {}
      )

      const items = container.querySelectorAll('li')
      expect(items.length).toBe(5)
    })
  })
})
