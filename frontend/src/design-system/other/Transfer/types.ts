/**
 * Transfer 组件类型定义
 */

import type { RenderFunction } from 'vue'

// 目标列表排序方式
export type TransferTargetOrder = 'original' | 'push' | 'unshift'

// 数据项配置
export interface TransferPropsOption {
  /**
   * 数据项的键
   */
  key?: string | number

  /**
   * 数据项的标签
   */
  label?: string

  /**
   * 数据项是否禁用
   */
  disabled?: boolean

  /**
   * 数据项的其他属性
   */
  [key: string]: any
}

// Transfer 组件 Props 接口
export interface TransferProps {
  /**
   * 数据源
   */
  data?: TransferPropsOption[]

  /**
   * 目标列表的键数组
   */
  modelValue?: (string | number)[]

  /**
   * 可搜索
   * @default false
   */
  filterable?: boolean

  /**
   * 搜索框占位文本
   */
  filterPlaceholder?: string

  /**
   * 自定义搜索方法
   */
  filterMethod?: (query: string, item: TransferPropsOption) => boolean

  /**
   * 自定义标题列表
   */
  titles?: string[]

  /**
   * 按钮文本列表
   */
  buttonTexts?: string[]

  /**
   * 自定义项渲染函数
   */
  renderContent?: RenderFunction

  /**
   * 列表项展示格式
   * @default '{label}'
   */
  format?: string

  /**
   * 数据项字段配置
   * @default { key: 'key', label: 'label', disabled: 'disabled' }
   */
  props?: {
    key?: string
    label?: string
    disabled?: string
  }

  /**
   * 左侧默认选中
   */
  leftDefaultChecked?: (string | number)[]

  /**
   * 右侧默认选中
   */
  rightDefaultChecked?: (string | number)[]

  /**
   * 目标列表排序方式
   * @default 'original'
   */
  targetOrder?: TransferTargetOrder
}

// Transfer 组件 Emits 接口
export interface TransferEmits {
  /**
   * 变化时触发
   * @param targetValue 目标列表的新值
   * @param direction 移动方向
   * @param movedKeys 移动的数据项的键
   */
  (e: 'change', targetValue: (string | number)[], direction: 'left' | 'right', movedKeys: (string | number)[]): void

  /**
   * 左侧选中变化时触发
   * @param checkedValues 选中的值
   * @param checkedItems 选中的项
   */
  (e: 'left-check-change', checkedValues: (string | number)[], checkedItems: TransferPropsOption[]): void

  /**
   * 右侧选中变化时触发
   * @param checkedValues 选中的值
   * @param checkedItems 选中的项
   */
  (e: 'right-check-change', checkedValues: (string | number)[], checkedItems: TransferPropsOption[]): void

  /**
   * 更新 modelValue
   * @param value 新值
   */
  (e: 'update:modelValue', value: (string | number)[]): void
}

// TransferPanel 组件 Props 接口
export interface TransferPanelProps {
  /**
   * 数据源
   */
  data: TransferPropsOption[]

  /**
   * 选中项的键数组
   */
  checkedKeys: (string | number)[]

  /**
   * 标题
   */
  title?: string

  /**
   * 是否可搜索
   */
  filterable?: boolean

  /**
   * 搜索框占位文本
   */
  filterPlaceholder?: string

  /**
   * 自定义搜索方法
   */
  filterMethod?: (query: string, item: TransferPropsOption) => boolean

  /**
   * 自定义项渲染函数
   */
  renderContent?: RenderFunction

  /**
   * 格式化字符串
   */
  format?: string

  /**
   * 数据项字段配置
   */
  itemProps: {
    key?: string
    label?: string
    disabled?: string
  }

  /**
   * 面板标识（left 或 right）
   */
  panel: 'left' | 'right'
}

// TransferPanel 组件 Emits 接口
export interface TransferPanelEmits {
  /**
   * 选中状态变化
   * @param checkedValues 选中的值
   * @param checkedItems 选中的项
   */
  (e: 'check-change', checkedValues: (string | number)[], checkedItems: TransferPropsOption[]): void
}

// TransferItem 组件 Props 接口
export interface TransferItemProps {
  /**
   * 数据项
   */
  item: TransferPropsOption

  /**
   * 是否选中
   */
  checked?: boolean

  /**
   * 是否禁用
   */
  disabled?: boolean

  /**
   * 自定义渲染函数
   */
  renderContent?: RenderFunction

  /**
   * 格式化字符串
   */
  format?: string

  /**
   * 数据项字段配置
   */
  itemProps: {
    key?: string
    label?: string
    disabled?: string
  }
}

// TransferItem 组件 Emits 接口
export interface TransferItemEmits {
  /**
   * 选中状态变化
   * @param checked 是否选中
   */
  (e: 'change', checked: boolean): void
}

// Transfer 组件默认属性
export const transferDefaults: Partial<TransferProps> = {
  filterable: false,
  filterPlaceholder: '请输入搜索内容',
  format: '{label}',
  props: {
    key: 'key',
    label: 'label',
    disabled: 'disabled',
  },
  leftDefaultChecked: [],
  rightDefaultChecked: [],
  targetOrder: 'original',
}

// TransferPanel 组件默认属性
export const transferPanelDefaults: Partial<TransferPanelProps> = {
  filterable: false,
  filterPlaceholder: '请输入搜索内容',
  format: '{label}',
  itemProps: {
    key: 'key',
    label: 'label',
    disabled: 'disabled',
  },
}

// TransferItem 组件默认属性
export const transferItemDefaults: Partial<TransferItemProps> = {
  checked: false,
  disabled: false,
  format: '{label}',
  itemProps: {
    key: 'key',
    label: 'label',
    disabled: 'disabled',
  },
}
