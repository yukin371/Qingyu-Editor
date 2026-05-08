/**
 * Tree Types
 * Hierarchical data display
 */

export interface TreeNode {
  id: string | number
  label: string
  children?: TreeNode[]
  disabled?: boolean
  isLeaf?: boolean
  [key: string]: unknown
}

export interface TreeProps {
  data?: TreeNode[]
  modelValue?: string | number | (string | number)[]
  multiple?: boolean
  checkable?: boolean
  showCheckbox?: boolean
  defaultExpandAll?: boolean
  expandOnClickNode?: boolean
  nodeKey?: string
  props?: {
    label?: string
    children?: string
    disabled?: string
  }
}

export interface TreeSelectProps {
  modelValue?: string | number | (string | number)[] | null
  data?: TreeNode[]
  placeholder?: string
  size?: 'small' | 'default' | 'large'
  disabled?: boolean
  multiple?: boolean
  clearable?: boolean
  showCheckbox?: boolean
  nodeKey?: string
  props?: {
    label?: string
    children?: string
    disabled?: string
  }
}
