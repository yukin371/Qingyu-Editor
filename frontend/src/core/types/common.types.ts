/**
 * Common Types
 * Shared types across the application
 */

/**
 * ID type
 */
export type ID = string | number

/**
 * Timestamp type (Unix timestamp in seconds)
 */
export type Timestamp = number

/**
 * Status type
 */
export type Status = 'active' | 'inactive' | 'pending' | 'deleted'

/**
 * Loading state
 */
export interface LoadingState {
  [key: string]: boolean
}

/**
 * Error state
 */
export interface ErrorState {
  [key: string]: string | null
}

/**
 * Selection state
 */
export interface SelectionState<T> {
  selected: T[]
  selectedIds: Set<ID>
}

/**
 * Form state
 */
export interface FormState<T> {
  data: T
  loading: boolean
  errors: Partial<Record<keyof T, string>>
  touched: Partial<Record<keyof T, boolean>>
}

/**
 * Table state
 */
export interface TableState<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  loading: boolean
  selection: ID[]
}

/**
 * Dialog state
 */
export interface DialogState {
  visible: boolean
  loading: boolean
  data?: any
}

/**
 * Async operation state
 */
export interface AsyncState<T = any, E = Error> {
  loading: boolean
  data: T | null
  error: E | null
}

/**
 * Option item for select/dropdown
 */
export interface OptionItem<T = any> {
  label: string
  value: T
  disabled?: boolean
  [key: string]: any
}

/**
 * Tree node
 */
export interface TreeNode<T = any> {
  id: ID
  label: string
  children?: TreeNode<T>[]
  data?: T
  [key: string]: any
}

/**
 * Menu item
 */
export interface MenuItem {
  id: ID
  label: string
  icon?: string
  path?: string
  children?: MenuItem[]
  meta?: Record<string, any>
}

/**
 * Breadcrumb item
 */
export interface BreadcrumbItem {
  label: string
  path?: string
  icon?: string
}

/**
 * Tab item
 */
export interface TabItem {
  name: string
  label: string
  icon?: string
  closable?: boolean
  [key: string]: any
}

/**
 * Notification
 */
export interface Notification {
  id: ID
  type: 'success' | 'warning' | 'info' | 'error'
  title: string
  message: string
  duration?: number
  timestamp: Timestamp
}

/**
 * Callback function types
 */
export type VoidCallback = () => void
export type Callback<T = any> = (data: T) => void
export type AsyncCallback<T = any> = (data: T) => Promise<void>

/**
 * Nullable type
 */
export type Nullable<T> = T | null

/**
 * Optional type
 */
export type Optional<T> = T | undefined

/**
 * Maybe type (nullable or undefined)
 */
export type Maybe<T> = T | null | undefined

/**
 * Deep partial type
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/**
 * Deep readonly type
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}

