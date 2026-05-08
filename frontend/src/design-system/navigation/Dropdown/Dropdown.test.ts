/**
 * QyDropdown 下拉菜单组件测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/vue'
import Dropdown from './Dropdown.vue'
import type { DropdownItem } from './types'

const sampleItems: DropdownItem[] = [
  { key: 'profile', label: '个人资料' },
  { key: 'settings', label: '设置' },
  { key: 'logout', label: '退出登录' },
]

describe('QyDropdown', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  describe('渲染', () => {
    it('应正确渲染触发器', () => {
      render(Dropdown, {
        props: { items: sampleItems },
        slots: {
          default: '<button data-testid="trigger">菜单</button>',
        },
      })

      expect(screen.getByTestId('trigger')).toBeInTheDocument()
      expect(screen.getByTestId('trigger')).toHaveTextContent('菜单')
    })
  })

  describe('click 触发', () => {
    it('点击触发器后应显示面板', async () => {
      render(Dropdown, {
        props: { items: sampleItems, trigger: 'click' },
        slots: {
          default: '<button data-testid="trigger">菜单</button>',
        },
      })

      await fireEvent.click(screen.getByTestId('trigger'))

      await waitFor(() => {
        expect(document.querySelector('[role="menu"]')).toBeInTheDocument()
      })
    })

    it('再次点击应关闭面板', async () => {
      render(Dropdown, {
        props: { items: sampleItems, trigger: 'click' },
        slots: {
          default: '<button data-testid="trigger">菜单</button>',
        },
      })

      await fireEvent.click(screen.getByTestId('trigger'))
      await waitFor(() => {
        expect(document.querySelector('[role="menu"]')).toBeInTheDocument()
      })

      await fireEvent.click(screen.getByTestId('trigger'))
      await waitFor(() => {
        expect(document.querySelector('[role="menu"]')).not.toBeInTheDocument()
      })
    })
  })

  describe('菜单项点击', () => {
    it('点击菜单项应触发 select 事件', async () => {
      const onSelect = vi.fn()

      render(Dropdown, {
        props: { items: sampleItems, trigger: 'click', onSelect },
        slots: {
          default: '<button data-testid="trigger">菜单</button>',
        },
      })

      await fireEvent.click(screen.getByTestId('trigger'))

      await waitFor(() => {
        const item = document.querySelector('[role="menuitem"]')
        expect(item).toBeInTheDocument()
      })

      const firstItem = document.querySelector('[role="menuitem"]')!
      await fireEvent.click(firstItem)

      expect(onSelect).toHaveBeenCalledWith('profile')
    })

    it('禁用项点击不应触发事件', async () => {
      const items: DropdownItem[] = [
        { key: 'ok', label: '可用' },
        { key: 'no', label: '禁用', disabled: true },
      ]
      const onSelect = vi.fn()

      render(Dropdown, {
        props: { items, trigger: 'click', onSelect },
        slots: {
          default: '<button data-testid="trigger">菜单</button>',
        },
      })

      await fireEvent.click(screen.getByTestId('trigger'))

      await waitFor(() => {
        const disabledItem = document.querySelector('[aria-disabled="true"]')
        expect(disabledItem).toBeInTheDocument()
      })

      const disabledItem = document.querySelector('[aria-disabled="true"]')!
      await fireEvent.click(disabledItem)

      expect(onSelect).not.toHaveBeenCalled()
    })
  })

  describe('禁用状态', () => {
    it('整体禁用不应打开面板', async () => {
      render(Dropdown, {
        props: { items: sampleItems, disabled: true },
        slots: {
          default: '<button data-testid="trigger">菜单</button>',
        },
      })

      await fireEvent.click(screen.getByTestId('trigger'))

      await new Promise((r) => setTimeout(r, 100))
      expect(document.querySelector('[role="menu"]')).not.toBeInTheDocument()
    })
  })

  describe('键盘', () => {
    it('ESC 应关闭面板', async () => {
      render(Dropdown, {
        props: { items: sampleItems, trigger: 'click' },
        slots: {
          default: '<button data-testid="trigger">菜单</button>',
        },
      })

      await fireEvent.click(screen.getByTestId('trigger'))
      await waitFor(() => {
        expect(document.querySelector('[role="menu"]')).toBeInTheDocument()
      })

      await fireEvent.keyDown(document, { key: 'Escape' })
      await waitFor(() => {
        expect(document.querySelector('[role="menu"]')).not.toBeInTheDocument()
      })
    })
  })

  describe('点击外部关闭', () => {
    it('点击面板外部应关闭', async () => {
      render(Dropdown, {
        props: { items: sampleItems, trigger: 'click' },
        slots: {
          default: '<button data-testid="trigger">菜单</button>',
        },
      })

      await fireEvent.click(screen.getByTestId('trigger'))
      await waitFor(() => {
        expect(document.querySelector('[role="menu"]')).toBeInTheDocument()
      })

      await fireEvent.mouseDown(document.body)
      await waitFor(() => {
        expect(document.querySelector('[role="menu"]')).not.toBeInTheDocument()
      })
    })
  })

  describe('分隔线', () => {
    it('divider 为 true 时应渲染分隔线', async () => {
      const items: DropdownItem[] = [
        { key: 'a', label: 'A', divider: true },
        { key: 'b', label: 'B' },
      ]

      render(Dropdown, {
        props: { items, trigger: 'click' },
        slots: {
          default: '<button data-testid="trigger">菜单</button>',
        },
      })

      await fireEvent.click(screen.getByTestId('trigger'))
      await waitFor(() => {
        expect(document.querySelector('[role="separator"]')).toBeInTheDocument()
      })
    })
  })
})
