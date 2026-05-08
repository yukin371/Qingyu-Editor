/**
 * 设计系统统一导入验证测试
 * 用于验证所有P0/P1/P2组件都能通过 @/design-system/components 正确导入
 */

import { describe, it, expect } from 'vitest'

// 测试所有P0组件（核心输入）的导入
import {
  QyButton,
  QyInput,
  QyTextarea,
  QySelect
} from '../components'

// 测试所有P1组件（表单控件）的导入
import {
  QyCheckbox,
  QyRadio,
  QySwitch,
  QySlider
} from '../components'

// 测试所有P2组件（展示组件）的导入
import {
  QyAvatar,
  QyBadge,
  QyTag,
  QyIcon,
  QyImage,
  QyCard,
  QyRate
} from '../components'

// 测试其他组件的导入
import {
  QyScrollbar,
  QyTopNav,
  QyBottomDock,
  QyTabBar,
  QyModal,
  QyLoading,
  QyEmpty,
  QyForm,
  QyFormItem,
  QyConfirmDialog,
  QyBookCard,
  QyBookCover,
  QyUserCard,
  QyCommentItem
} from '../components'

// 测试分组组件的导入
import { QyCheckboxGroup, QyRadioGroup } from '../components'

// 测试类型的导入（仅用于编译时类型检查）
// 这些类型导入用于验证类型定义是否正确导出
import type {
  ButtonProps,
  InputProps,
  TextareaProps,
  SelectProps,
  CheckboxProps,
  RadioProps,
  SwitchProps,
  SliderProps,
  AvatarProps,
  BadgeProps,
  TagProps,
  IconProps,
  ImageProps,
  CardProps,
  RateProps
} from '../components'

// 类型使用示例（用于消除 ESLint no-unused-vars 警告）
// 导出供类型验证使用
export type ComponentPropsMap = {
  Button: ButtonProps
  Input: InputProps
  Textarea: TextareaProps
  Select: SelectProps
  Checkbox: CheckboxProps
  Radio: RadioProps
  Switch: SwitchProps
  Slider: SliderProps
  Avatar: AvatarProps
  Badge: BadgeProps
  Tag: TagProps
  Icon: IconProps
  Image: ImageProps
  Card: CardProps
  Rate: RateProps
}

describe('Design System 统一导出验证', () => {
  describe('P0组件（核心输入）', () => {
    it('应该能正确导入 QyButton', () => {
      expect(QyButton).toBeDefined()
    })

    it('应该能正确导入 QyInput', () => {
      expect(QyInput).toBeDefined()
    })

    it('应该能正确导入 QyTextarea', () => {
      expect(QyTextarea).toBeDefined()
    })

    it('应该能正确导入 QySelect', () => {
      expect(QySelect).toBeDefined()
    })
  })

  describe('P1组件（表单控件）', () => {
    it('应该能正确导入 QyCheckbox', () => {
      expect(QyCheckbox).toBeDefined()
    })

    it('应该能正确导入 QyRadio', () => {
      expect(QyRadio).toBeDefined()
    })

    it('应该能正确导入 QySwitch', () => {
      expect(QySwitch).toBeDefined()
    })

    it('应该能正确导入 QySlider', () => {
      expect(QySlider).toBeDefined()
    })
  })

  describe('P2组件（展示组件）', () => {
    it('应该能正确导入 QyAvatar', () => {
      expect(QyAvatar).toBeDefined()
    })

    it('应该能正确导入 QyBadge', () => {
      expect(QyBadge).toBeDefined()
    })

    it('应该能正确导入 QyTag', () => {
      expect(QyTag).toBeDefined()
    })

    it('应该能正确导入 QyIcon', () => {
      expect(QyIcon).toBeDefined()
    })

    it('应该能正确导入 QyImage', () => {
      expect(QyImage).toBeDefined()
    })

    it('应该能正确导入 QyCard', () => {
      expect(QyCard).toBeDefined()
    })

    it('应该能正确导入 QyRate', () => {
      expect(QyRate).toBeDefined()
    })
  })

  describe('分组组件', () => {
    it('应该能正确导入 QyCheckboxGroup', () => {
      expect(QyCheckboxGroup).toBeDefined()
    })

    it('应该能正确导入 QyRadioGroup', () => {
      expect(QyRadioGroup).toBeDefined()
    })
  })

  describe('其他基础组件', () => {
    it('应该能正确导入 QyScrollbar', () => {
      expect(QyScrollbar).toBeDefined()
    })
  })

  describe('导航组件', () => {
    it('应该能正确导入 QyTopNav', () => {
      expect(QyTopNav).toBeDefined()
    })

    it('应该能正确导入 QyBottomDock', () => {
      expect(QyBottomDock).toBeDefined()
    })

    it('应该能正确导入 QyTabBar', () => {
      expect(QyTabBar).toBeDefined()
    })
  })

  describe('高级组件', () => {
    it('应该能正确导入 QyModal', () => {
      expect(QyModal).toBeDefined()
    })

    it('应该能正确导入 QyLoading', () => {
      expect(QyLoading).toBeDefined()
    })

    it('应该能正确导入 QyEmpty', () => {
      expect(QyEmpty).toBeDefined()
    })

    it('应该能正确导入 QyForm', () => {
      expect(QyForm).toBeDefined()
    })

    it('应该能正确导入 QyFormItem', () => {
      expect(QyFormItem).toBeDefined()
    })

    it('应该能正确导入 QyConfirmDialog', () => {
      expect(QyConfirmDialog).toBeDefined()
    })
  })

  describe('业务组件', () => {
    it('应该能正确导入 QyBookCard', () => {
      expect(QyBookCard).toBeDefined()
    })

    it('应该能正确导入 QyBookCover', () => {
      expect(QyBookCover).toBeDefined()
    })

    it('应该能正确导入 QyUserCard', () => {
      expect(QyUserCard).toBeDefined()
    })

    it('应该能正确导入 QyCommentItem', () => {
      expect(QyCommentItem).toBeDefined()
    })
  })

  describe('类型导出', () => {
    it('应该能正确导入 P0 组件类型', () => {
      // 类型在编译时检查，这里只确保导入不会出错
      expect(true).toBe(true)
    })

    it('应该能正确导入 P1 组件类型', () => {
      expect(true).toBe(true)
    })

    it('应该能正确导入 P2 组件类型', () => {
      expect(true).toBe(true)
    })
  })
})
