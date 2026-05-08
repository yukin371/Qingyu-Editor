/**
 * Table 组件类型定义
 */

// 列对齐方式
export type TableAlign = 'left' | 'center' | 'right'

// 列固定位置
export type TableFixed = 'left' | 'right'

// 表格尺寸
export type TableSize = 'sm' | 'md' | 'lg'

// 排序顺序
export type SortOrder = 'ascending' | 'descending' | null

// 列配置接口
export interface Column {
  /** 列的唯一标识 */
  prop: string
  /** 列标题 */
  label: string
  /** 列宽度 */
  width?: number
  /** 列最小宽度 */
  minWidth?: number
  /** 对齐方式 */
  align?: TableAlign
  /** 是否可排序 */
  sortable?: boolean
  /** 固定列 */
  fixed?: TableFixed
  /** 自定义列渲染函数 */
  render?: (row: Record<string, any>, column: Column, index: number) => any
  /** 列类名 */
  className?: string | ((row: Record<string, any>, column: Column, index: number) => string)
  /** 表头类名 */
  headerClassName?: string
  /** 是否显示复选框 */
  type?: 'selection' | 'index' | 'expand'
}

// 行数据类型
export type TableRowData = Record<string, any>

// 排序参数
export interface SortParams {
  prop: string
  order: SortOrder
}

// Table Props 接口
export interface TableProps {
  /** 表格数据 */
  data?: TableRowData[]
  /** 列配置 */
  columns?: Column[]
  /** 是否显示纵向边框 */
  border?: boolean
  /** 是否显示斑马纹 */
  stripe?: boolean
  /** 表格尺寸 */
  size?: TableSize
  /** 列宽度是否自撑开 */
  fit?: boolean
  /** 是否显示表头 */
  showHeader?: boolean
  /** 是否高亮当前行 */
  highlightCurrentRow?: boolean
  /** 空数据时显示的文本内容 */
  emptyText?: string
  /** 默认的排序列的 prop 和顺序 */
  defaultSort?: { prop: string; order: SortOrder }
  /** 行样式的回调函数 */
  rowClassName?: string | ((row: TableRowData, index: number) => string)
  /** 行的 key 的函数 */
  rowKey?: string | ((row: TableRowData) => string)
  /** 单元格样式的回调函数 */
  cellClassName?: string | ((row: TableRowData, column: Column, rowIndex: number, columnIndex: number) => string)
  /** 自定义类名 */
  class?: any
}

// Table Events 接口
export interface TableEmits {
  /** 当用户手动勾选数据行的 Checkbox 时触发的事件 */
  select: [selection: TableRowData[], row: TableRowData]
  /** 当选择项发生变化时会触发该事件 */
  selectionChange: [selection: TableRowData[]]
  /** 当表格的排序条件发生变化的时候触发的事件 */
  sortChange: [sort: SortParams]
  /** 当某一行被点击时会触发该事件 */
  rowClick: [row: TableRowData, column: Column | undefined, event: Event]
  /** 当某一行被鼠标右键点击时会触发该事件 */
  rowContextmenu: [row: TableRowData, column: Column | undefined, event: Event]
  /** 当某一行被双击时会触发该事件 */
  rowDblclick: [row: TableRowData, column: Column | undefined, event: Event]
  /** 当单元格 hover 进入时会触发该事件 */
  cellMouseEnter: [row: TableRowData, column: Column, cell: EventTarget, event: Event]
  /** 当单元格 hover 退出时会触发该事件 */
  cellMouseLeave: [row: TableRowData, column: Column, cell: EventTarget, event: Event]
  /** 当某一行被 hover 进入时会触发该事件 */
  rowMouseEnter: [row: TableRowData, column: Column | undefined, event: Event]
  /** 当某一行被 hover 退出时会触发该事件 */
  rowMouseLeave: [row: TableRowData, column: Column | undefined, event: Event]
}

// Table 组件默认属性
export const tableDefaults: Partial<TableProps> = {
  data: undefined,
  columns: undefined,
  border: false,
  stripe: false,
  size: 'md',
  fit: true,
  showHeader: true,
  highlightCurrentRow: false,
  emptyText: '暂无数据',
}

// 内部状态接口
export interface TableInternalState {
  currentPage: number
  pageSize: number
  currentRow: TableRowData | null
  expandingRows: Set<string | number>
  selectedRows: TableRowData[]
  sortProp: string
  sortOrder: SortOrder
}
