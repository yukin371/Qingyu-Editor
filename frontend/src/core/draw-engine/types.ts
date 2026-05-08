/**
 * 青羽通用绘制引擎 - 类型定义
 * 支持思维导图、树形图、关系图、时间线等多种图形
 */

// ============ 基础图形元素 ============

/**
 * 图形节点
 */
export interface DrawNode {
  id: string
  type: 'node' | 'group' | 'text'
  label: string
  description?: string
  x: number
  y: number
  width: number
  height: number
  color?: string
  borderColor?: string
  borderWidth?: number
  fontSize?: number
  icon?: string
  metadata?: Record<string, any>
  collapsed?: boolean
  children?: string[] // 子节点ID列表
}

/**
 * 图形连接线
 */
export interface DrawEdge {
  id: string
  type: 'line' | 'curve' | 'polyline' | 'arrow'
  fromNodeId: string
  toNodeId: string
  label?: string
  style?: 'solid' | 'dashed' | 'dotted'
  color?: string
  lineWidth?: number
  showArrow?: boolean
  arrowType?: 'default' | 'triangle' | 'circle'
  metadata?: Record<string, any>
}

/**
 * 图形容器
 */
export interface DrawCanvas {
  id: string
  type: DrawCanvasType
  title: string
  description?: string
  nodes: Map<string, DrawNode>
  edges: Map<string, DrawEdge>
  selectedNodeId?: string
  selectedEdgeId?: string
  zoom: number
  offsetX: number
  offsetY: number
  backgroundColor?: string
  gridEnabled?: boolean
  snapToGrid?: boolean
  gridSize?: number
}

/**
 * 图形类型
 */
export type DrawCanvasType =
  | 'mindmap'      // 思维导图
  | 'tree'         // 树形图
  | 'graph'        // 关系图/人物关系图
  | 'timeline'     // 时间线
  | 'flowchart'    // 流程图
  | 'diagram'      // 通用图表

// ============ 主题和样式 ============

/**
 * 绘制主题
 */
export interface DrawTheme {
  name: string
  nodeColor: string
  nodeBorderColor: string
  nodeTextColor: string
  edgeColor: string
  backgroundColor: string
  gridColor?: string
  hoverColor?: string
  selectedColor?: string
}

/**
 * 常见主题预设
 */
export const DRAW_THEMES: Record<string, DrawTheme> = {
  light: {
    name: 'light',
    nodeColor: '#ffffff',
    nodeBorderColor: '#409eff',
    nodeTextColor: '#303133',
    edgeColor: '#909399',
    backgroundColor: '#f9fafb',
    gridColor: '#e5e7eb',
    hoverColor: '#ecf5ff',
    selectedColor: '#409eff'
  },
  dark: {
    name: 'dark',
    nodeColor: '#1a1a1a',
    nodeBorderColor: '#409eff',
    nodeTextColor: '#e5e5e5',
    edgeColor: '#606266',
    backgroundColor: '#0d0d0d',
    gridColor: '#2d2d2d',
    hoverColor: '#1a3a52',
    selectedColor: '#409eff'
  },
  default: {
    name: 'default',
    nodeColor: '#ecf5ff',
    nodeBorderColor: '#409eff',
    nodeTextColor: '#303133',
    edgeColor: '#409eff',
    backgroundColor: '#ffffff',
    gridColor: '#f5f7fa',
    hoverColor: '#f0f9ff',
    selectedColor: '#409eff'
  }
}

// ============ 事件类型 ============

/**
 * 绘制引擎事件
 */
export interface DrawEngineEvent {
  type: DrawEventType
  canvas?: DrawCanvas
  node?: DrawNode
  edge?: DrawEdge
  sourceEvent?: MouseEvent | KeyboardEvent
  metadata?: Record<string, any>
}

export type DrawEventType =
  | 'nodeSelect'
  | 'nodeCreate'
  | 'nodeUpdate'
  | 'nodeDelete'
  | 'edgeCreate'
  | 'edgeUpdate'
  | 'edgeDelete'
  | 'canvasZoom'
  | 'canvasPan'
  | 'canvasContextMenu'

// ============ 操作命令 ============

/**
 * 可撤销的命令
 */
export interface DrawCommand {
  type: string
  execute(): void
  undo(): void
  redo?(): void
}

// ============ 导出格式 ============

/**
 * 图形导出格式
 */
export type ExportFormat = 'svg' | 'png' | 'json' | 'markdown' | 'mermaid'

/**
 * 导出选项
 */
export interface ExportOptions {
  format: ExportFormat
  filename?: string
  width?: number
  height?: number
  scale?: number
  quality?: number
  includeMetadata?: boolean
}

/**
 * Markdown 导出结果
 */
export interface MarkdownExport {
  markdown: string
  nodes: DrawNode[]
  edges: DrawEdge[]
  mermaid?: string // Mermaid diagram syntax
}

// ============ 历史记录 ============

/**
 * 操作历史
 */
export interface DrawHistory {
  undo: DrawCommand[]
  redo: DrawCommand[]
  maxSteps: number
}

// ============ 配置 ============

/**
 * 绘制引擎配置
 */
export interface DrawEngineConfig {
  canvasId: string
  type: DrawCanvasType
  theme?: DrawTheme | string
  enableGrid?: boolean
  snapToGrid?: boolean
  gridSize?: number
  enableHistory?: boolean
  maxHistorySteps?: number
  readonly?: boolean
  defaultNodeWidth?: number
  defaultNodeHeight?: number
  minZoom?: number
  maxZoom?: number
  autoLayout?: boolean // 自动布局
  directions?: 'LR' | 'TB' | 'RL' | 'BT' // 布局方向
}

// ============ 布局算法 ============

/**
 * 自动布局选项
 */
export interface LayoutOptions {
  algorithm: 'tree' | 'force' | 'grid' | 'circle' | 'dagre'
  direction?: 'LR' | 'TB' | 'RL' | 'BT'
  spacing?: number
  iterations?: number // for force layout
}

/**
 * 节点位置
 */
export interface NodePosition {
  nodeId: string
  x: number
  y: number
}

