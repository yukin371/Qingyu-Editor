/**
 * Tree 组件类型定义
 */

// Tree 节点数据结构
export interface TreeNode {
  /**
   * 节点唯一标识
   */
  id?: string | number

  /**
   * 节点显示文本
   */
  label: string

  /**
   * 子节点列表
   */
  children?: TreeNode[]

  /**
   * 是否禁用
   * @default false
   */
  disabled?: boolean

  /**
   * 是否默认展开
   * @default false
   */
  defaultExpand?: boolean

  /**
   * 自定义数据
   */
  [key: string]: any
}

// Tree 尺寸
export type TreeSize = 'sm' | 'md' | 'lg'

// Tree Props 接口
export interface TreeProps {
  /**
   * 树形数据
   */
  data: TreeNode[]

  /**
   * 是否可勾选
   * @default false
   */
  checkable?: boolean

  /**
   * 是否默认展开所有节点
   * @default false
   */
  defaultExpandAll?: boolean

  /**
   * 是否高亮当前节点
   * @default false
   */
  highlightCurrent?: boolean

  /**
   * 是否点击节点展开
   * @default false
   */
  expandOnClickNode?: boolean

  /**
   * 树形控件尺寸
   * @default 'md'
   */
  size?: TreeSize

  /**
   * 默认选中的节点 key 数组
   */
  defaultCheckedKeys?: Array<string | number>

  /**
   * 默认展开的节点 key 数组
   */
  defaultExpandedKeys?: Array<string | number>

  /**
   * 自定义类名
   */
  class?: any
}

// Tree 节点状态
// 使用reactive对象代替嵌套Ref，确保响应式系统正确追踪状态变化
export interface TreeNodeState {
  node: TreeNode
  expanded: boolean  // 改为普通boolean，由reactive包装
  checked: boolean   // 改为普通boolean，由reactive包装
  indeterminate: boolean  // 改为普通boolean，由reactive包装
  level: number
  parent: TreeNodeState | null
  children: TreeNodeState[]
}

// Tree Events
export interface TreeEmits {
  'nodeClick': [data: TreeNode, node: TreeNodeState]
  'nodeExpand': [data: TreeNode, expanded: boolean, node: TreeNodeState]
  'checkChange': [data: TreeNode, checked: boolean, node: TreeNodeState]
  'update:checkedKeys': [checkedKeys: Array<string | number>]
  'update:expandedKeys': [expandedKeys: Array<string | number>]
}

// Tree 组件实例方法
export interface TreeInstance {
  /**
   * 获取选中的节点
   */
  getCheckedNodes: () => TreeNode[]

  /**
   * 获取选中的节点 key
   */
  getCheckedKeys: () => Array<string | number>

  /**
   * 设置选中的节点
   */
  setCheckedKeys: (keys: Array<string | number>) => void

  /**
   * 获取展开的节点 key
   */
  getExpandedKeys: () => Array<string | number>

  /**
   * 设置展开的节点
   */
  setExpandedKeys: (keys: Array<string | number>) => void
}

// Tree 组件默认属性
export const treeDefaults: Partial<Omit<TreeProps, 'defaultCheckedKeys' | 'defaultExpandedKeys'>> & {
  defaultCheckedKeys?: () => (string | number)[]
  defaultExpandedKeys?: () => (string | number)[]
} = {
  checkable: false,
  defaultExpandAll: false,
  highlightCurrent: false,
  expandOnClickNode: false,
  size: 'md',
  defaultCheckedKeys: () => [],
  defaultExpandedKeys: () => [],
}
