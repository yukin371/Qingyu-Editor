/**
 * 青羽通用绘制引擎 - 核心实现
 */

import { nanoid } from 'nanoid'
import type {
  DrawNode,
  DrawEdge,
  DrawCanvas,
  DrawEngineConfig,
  DrawEngineEvent,
  DrawEventType,
  DrawCommand,
  DrawTheme,
  MarkdownExport
} from './types'
import { DRAW_THEMES } from './types'

/**
 * 绘制引擎类
 */
export class DrawEngine {
  private canvas: DrawCanvas
  private config: DrawEngineConfig
  private theme: DrawTheme
  private eventListeners: Map<DrawEventType, Set<(e: DrawEngineEvent) => void>>
  private history: { undo: DrawCommand[], redo: DrawCommand[] }
  private selectedNodeId: string | null = null
  private selectedEdgeId: string | null = null

  constructor(config: DrawEngineConfig) {
    this.config = config
    this.theme = this.resolveTheme(config.theme)
    this.eventListeners = new Map()
    this.history = { undo: [], redo: [] }

    this.canvas = {
      id: nanoid(),
      type: config.type,
      title: '',
      description: '',
      nodes: new Map(),
      edges: new Map(),
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
      backgroundColor: this.theme.backgroundColor,
      gridEnabled: config.enableGrid ?? true,
      snapToGrid: config.snapToGrid ?? false,
      gridSize: config.gridSize ?? 20
    }
  }

  // ============ 主题管理 ============

  private resolveTheme(theme?: DrawTheme | string): DrawTheme {
    if (!theme) return DRAW_THEMES.default
    if (typeof theme === 'string') {
      return DRAW_THEMES[theme] || DRAW_THEMES.default
    }
    return theme
  }

  setTheme(theme: DrawTheme | string): void {
    this.theme = this.resolveTheme(theme)
    this.canvas.backgroundColor = this.theme.backgroundColor
    this.emitEvent('canvasPan', {})
  }

  getTheme(): DrawTheme {
    return this.theme
  }

  // ============ 节点操作 ============

  /**
   * 创建节点
   */
  createNode(label: string, x: number, y: number, metadata?: Record<string, any>): DrawNode {
    const node: DrawNode = {
      id: nanoid(),
      type: 'node',
      label,
      x: this.config.snapToGrid ? Math.round(x / this.config.gridSize!) * this.config.gridSize! : x,
      y: this.config.snapToGrid ? Math.round(y / this.config.gridSize!) * this.config.gridSize! : y,
      width: this.config.defaultNodeWidth || 120,
      height: this.config.defaultNodeHeight || 60,
      color: this.theme.nodeColor,
      borderColor: this.theme.nodeBorderColor,
      borderWidth: 2,
      fontSize: 14,
      metadata: metadata || {}
    }

    this.canvas.nodes.set(node.id, node)
    this.emitEvent('nodeCreate', { canvas: this.canvas, node })
    this.addToHistory({
      type: 'createNode',
      execute: () => this.canvas.nodes.set(node.id, node),
      undo: () => this.canvas.nodes.delete(node.id)
    })

    return node
  }

  /**
   * 更新节点
   */
  updateNode(nodeId: string, updates: Partial<DrawNode>): void {
    const node = this.canvas.nodes.get(nodeId)
    if (!node) return

    const oldNode = { ...node }
    Object.assign(node, updates)

    this.emitEvent('nodeUpdate', { canvas: this.canvas, node })
    this.addToHistory({
      type: 'updateNode',
      execute: () => Object.assign(this.canvas.nodes.get(nodeId)!, updates),
      undo: () => Object.assign(this.canvas.nodes.get(nodeId)!, oldNode)
    })
  }

  /**
   * 删除节点
   */
  deleteNode(nodeId: string): void {
    const node = this.canvas.nodes.get(nodeId)
    if (!node) return

    // 同时删除相关的连接
    const edgesToDelete: string[] = []
    this.canvas.edges.forEach((edge, edgeId) => {
      if (edge.fromNodeId === nodeId || edge.toNodeId === nodeId) {
        edgesToDelete.push(edgeId)
      }
    })

    edgesToDelete.forEach(edgeId => this.canvas.edges.delete(edgeId))

    this.canvas.nodes.delete(nodeId)
    if (this.selectedNodeId === nodeId) this.selectedNodeId = null

    this.emitEvent('nodeDelete', { canvas: this.canvas, node })
    this.addToHistory({
      type: 'deleteNode',
      execute: () => {
        this.canvas.nodes.delete(nodeId)
        edgesToDelete.forEach(edgeId => this.canvas.edges.delete(edgeId))
      },
      undo: () => {
        this.canvas.nodes.set(nodeId, node)
        edgesToDelete.forEach(edgeId => {
          const edge = Array.from(this.canvas.edges.values()).find(e =>
            (e.fromNodeId === nodeId || e.toNodeId === nodeId)
          )
          if (edge) this.canvas.edges.set(edgeId, edge)
        })
      }
    })
  }

  getNode(nodeId: string): DrawNode | undefined {
    return this.canvas.nodes.get(nodeId)
  }

  getAllNodes(): DrawNode[] {
    return Array.from(this.canvas.nodes.values())
  }

  // ============ 连接操作 ============

  /**
   * 创建连接
   */
  createEdge(fromNodeId: string, toNodeId: string, label?: string): DrawEdge {
    const edge: DrawEdge = {
      id: nanoid(),
      type: 'curve',
      fromNodeId,
      toNodeId,
      label,
      color: this.theme.edgeColor,
      lineWidth: 2,
      showArrow: true,
      arrowType: 'default'
    }

    this.canvas.edges.set(edge.id, edge)
    this.emitEvent('edgeCreate', { canvas: this.canvas, edge })
    this.addToHistory({
      type: 'createEdge',
      execute: () => this.canvas.edges.set(edge.id, edge),
      undo: () => this.canvas.edges.delete(edge.id)
    })

    return edge
  }

  /**
   * 更新连接
   */
  updateEdge(edgeId: string, updates: Partial<DrawEdge>): void {
    const edge = this.canvas.edges.get(edgeId)
    if (!edge) return

    const oldEdge = { ...edge }
    Object.assign(edge, updates)

    this.emitEvent('edgeUpdate', { canvas: this.canvas, edge })
    this.addToHistory({
      type: 'updateEdge',
      execute: () => Object.assign(this.canvas.edges.get(edgeId)!, updates),
      undo: () => Object.assign(this.canvas.edges.get(edgeId)!, oldEdge)
    })
  }

  /**
   * 删除连接
   */
  deleteEdge(edgeId: string): void {
    const edge = this.canvas.edges.get(edgeId)
    if (!edge) return

    this.canvas.edges.delete(edgeId)
    if (this.selectedEdgeId === edgeId) this.selectedEdgeId = null

    this.emitEvent('edgeDelete', { canvas: this.canvas, edge })
    this.addToHistory({
      type: 'deleteEdge',
      execute: () => this.canvas.edges.delete(edgeId),
      undo: () => this.canvas.edges.set(edgeId, edge)
    })
  }

  getEdge(edgeId: string): DrawEdge | undefined {
    return this.canvas.edges.get(edgeId)
  }

  getAllEdges(): DrawEdge[] {
    return Array.from(this.canvas.edges.values())
  }

  // ============ 选择操作 ============

  selectNode(nodeId: string | null): void {
    if (nodeId && !this.canvas.nodes.has(nodeId)) return
    this.selectedNodeId = nodeId
    if (nodeId) this.canvas.selectedNodeId = nodeId
    this.emitEvent('nodeSelect', {
      canvas: this.canvas,
      node: nodeId ? this.canvas.nodes.get(nodeId) : undefined
    })
  }

  selectEdge(edgeId: string | null): void {
    if (edgeId && !this.canvas.edges.has(edgeId)) return
    this.selectedEdgeId = edgeId
    if (edgeId) this.canvas.selectedEdgeId = edgeId
  }

  getSelectedNode(): DrawNode | null {
    return this.selectedNodeId ? this.canvas.nodes.get(this.selectedNodeId) || null : null
  }

  getSelectedEdge(): DrawEdge | null {
    return this.selectedEdgeId ? this.canvas.edges.get(this.selectedEdgeId) || null : null
  }

  // ============ 缩放和平移 ============

  zoom(factor: number, centerX?: number, centerY?: number): void {
    const minZoom = this.config.minZoom || 0.1
    const maxZoom = this.config.maxZoom || 5
    const newZoom = Math.max(minZoom, Math.min(maxZoom, this.canvas.zoom * factor))

    if (centerX && centerY) {
      this.canvas.offsetX -= (centerX * (newZoom - this.canvas.zoom)) / this.canvas.zoom
      this.canvas.offsetY -= (centerY * (newZoom - this.canvas.zoom)) / this.canvas.zoom
    }

    this.canvas.zoom = newZoom
    this.emitEvent('canvasZoom', { canvas: this.canvas })
  }

  pan(deltaX: number, deltaY: number): void {
    this.canvas.offsetX += deltaX
    this.canvas.offsetY += deltaY
    this.emitEvent('canvasPan', { canvas: this.canvas })
  }

  fitToScreen(width: number, height: number, padding: number = 20): void {
    const nodes = this.getAllNodes()
    if (nodes.length === 0) return

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

    nodes.forEach(node => {
      minX = Math.min(minX, node.x)
      minY = Math.min(minY, node.y)
      maxX = Math.max(maxX, node.x + node.width)
      maxY = Math.max(maxY, node.y + node.height)
    })

    const contentWidth = maxX - minX + padding * 2
    const contentHeight = maxY - minY + padding * 2
    const scaleX = width / contentWidth
    const scaleY = height / contentHeight
    const zoom = Math.min(scaleX, scaleY, 1)

    this.canvas.zoom = zoom
    this.canvas.offsetX = (width - (maxX - minX)) / 2 - minX * zoom + padding
    this.canvas.offsetY = (height - (maxY - minY)) / 2 - minY * zoom + padding
    this.emitEvent('canvasZoom', { canvas: this.canvas })
  }

  // ============ 导出功能 ============

  /**
   * 导出为 JSON
   */
  exportAsJSON(): string {
    const data = {
      id: this.canvas.id,
      type: this.canvas.type,
      title: this.canvas.title,
      nodes: Array.from(this.canvas.nodes.values()),
      edges: Array.from(this.canvas.edges.values())
    }
    return JSON.stringify(data, null, 2)
  }

  /**
   * 导出为 Markdown
   */
  exportAsMarkdown(): MarkdownExport {
    const nodes = Array.from(this.canvas.nodes.values())
    const edges = Array.from(this.canvas.edges.values())
    let markdown = `# ${this.canvas.title || '无标题'}\n\n`

    if (this.canvas.description) {
      markdown += `${this.canvas.description}\n\n`
    }

    // 生成 Mermaid 图表
    const mermaid = this.generateMermaidDiagram(nodes, edges)

    markdown += '## 图表\n\n'
    markdown += '```mermaid\n'
    markdown += mermaid
    markdown += '\n```\n\n'

    // 生成节点列表
    markdown += '## 节点\n\n'
    nodes.forEach(node => {
      markdown += `### ${node.label}\n\n`
      if (node.description) {
        markdown += `${node.description}\n\n`
      }
    })

    // 生成连接列表
    if (edges.length > 0) {
      markdown += '## 连接\n\n'
      edges.forEach(edge => {
        const fromNode = nodes.find(n => n.id === edge.fromNodeId)
        const toNode = nodes.find(n => n.id === edge.toNodeId)
        if (fromNode && toNode) {
          markdown += `- ${fromNode.label} → ${toNode.label}${edge.label ? ` (${edge.label})` : ''}\n`
        }
      })
    }

    return {
      markdown,
      nodes,
      edges,
      mermaid
    }
  }

  /**
   * 生成 Mermaid 图表语法
   */
  private generateMermaidDiagram(nodes: DrawNode[], edges: DrawEdge[]): string {
    let diagram = ''

    if (this.canvas.type === 'mindmap') {
      diagram = 'mindmap\n'
      diagram += `  root((${this.canvas.title}))\n`
      // 递归构建节点
      nodes.forEach(node => {
        if (node.children && node.children.length > 0) {
          diagram += `    ${node.label}\n`
        }
      })
    } else if (this.canvas.type === 'tree') {
      diagram = 'graph TD\n'
      edges.forEach(edge => {
        const fromNode = nodes.find(n => n.id === edge.fromNodeId)
        const toNode = nodes.find(n => n.id === edge.toNodeId)
        if (fromNode && toNode) {
          const label = edge.label ? `|${edge.label}|` : ''
          diagram += `  ${fromNode.id}["${fromNode.label}"] ${label} --> ${toNode.id}["${toNode.label}"]\n`
        }
      })
    } else {
      diagram = 'graph LR\n'
      edges.forEach(edge => {
        const fromNode = nodes.find(n => n.id === edge.fromNodeId)
        const toNode = nodes.find(n => n.id === edge.toNodeId)
        if (fromNode && toNode) {
          diagram += `  ${fromNode.id}["${fromNode.label}"] --> ${toNode.id}["${toNode.label}"]\n`
        }
      })
    }

    return diagram
  }

  /**
   * 导出为 SVG
   */
  exportAsSVG(width: number = 800, height: number = 600): string {
    const nodes = this.getAllNodes()
    const edges = this.getAllEdges()

    let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">\n`
    svg += `  <rect width="${width}" height="${height}" fill="${this.theme.backgroundColor}"/>\n`

    // 绘制连接
    edges.forEach(edge => {
      const fromNode = nodes.find(n => n.id === edge.fromNodeId)
      const toNode = nodes.find(n => n.id === edge.toNodeId)
      if (fromNode && toNode) {
        const x1 = fromNode.x + fromNode.width / 2 + this.canvas.offsetX
        const y1 = fromNode.y + fromNode.height / 2 + this.canvas.offsetY
        const x2 = toNode.x + toNode.width / 2 + this.canvas.offsetX
        const y2 = toNode.y + toNode.height / 2 + this.canvas.offsetY

        svg += `  <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${edge.color || '#000'}" stroke-width="${edge.lineWidth || 1}"/>\n`

        if (edge.showArrow) {
          svg += this.generateArrow(x2, y2, x1, y1, edge.color || '#000')
        }
      }
    })

    // 绘制节点
    nodes.forEach(node => {
      const x = node.x + this.canvas.offsetX
      const y = node.y + this.canvas.offsetY

      svg += `  <rect x="${x}" y="${y}" width="${node.width}" height="${node.height}" `
      svg += `fill="${node.color}" stroke="${node.borderColor}" stroke-width="${node.borderWidth}"/>\n`
      svg += `  <text x="${x + node.width / 2}" y="${y + node.height / 2}" `
      svg += `text-anchor="middle" dominant-baseline="middle" font-size="${node.fontSize}" `
      svg += `fill="${this.theme.nodeTextColor}">${node.label}</text>\n`
    })

    svg += '</svg>'
    return svg
  }

  private generateArrow(x: number, y: number, fromX: number, fromY: number, color: string): string {
    const angle = Math.atan2(y - fromY, x - fromX)
    const arrowSize = 10
    const point1X = x - arrowSize * Math.cos(angle - Math.PI / 6)
    const point1Y = y - arrowSize * Math.sin(angle - Math.PI / 6)
    const point2X = x - arrowSize * Math.cos(angle + Math.PI / 6)
    const point2Y = y - arrowSize * Math.sin(angle + Math.PI / 6)

    return `  <polygon points="${x},${y} ${point1X},${point1Y} ${point2X},${point2Y}" fill="${color}"/>\n`
  }

  // ============ 事件系统 ============

  on(eventType: DrawEventType, listener: (e: DrawEngineEvent) => void): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set())
    }
    this.eventListeners.get(eventType)!.add(listener)
  }

  off(eventType: DrawEventType, listener: (e: DrawEngineEvent) => void): void {
    this.eventListeners.get(eventType)?.delete(listener)
  }

  private emitEvent(eventType: DrawEventType, event: Partial<DrawEngineEvent>): void {
    const listeners = this.eventListeners.get(eventType)
    if (!listeners) return

    const fullEvent: DrawEngineEvent = {
      type: eventType,
      canvas: this.canvas,
      ...event
    }

    listeners.forEach(listener => listener(fullEvent))
  }

  // ============ 撤销/重做 ============

  private addToHistory(command: DrawCommand): void {
    if (!this.config.enableHistory) return
    if (this.history.undo.length >= (this.config.maxHistorySteps || 100)) {
      this.history.undo.shift()
    }
    this.history.undo.push(command)
    this.history.redo = []
  }

  undo(): void {
    const command = this.history.undo.pop()
    if (!command) return
    command.undo()
    this.history.redo.push(command)
  }

  redo(): void {
    const command = this.history.redo.pop()
    if (!command) return
    command.execute()
    command.redo?.()
    this.history.undo.push(command)
  }

  canUndo(): boolean {
    return this.history.undo.length > 0
  }

  canRedo(): boolean {
    return this.history.redo.length > 0
  }

  // ============ Canvas 管理 ============

  getCanvas(): DrawCanvas {
    return this.canvas
  }

  setCanvasTitle(title: string): void {
    this.canvas.title = title
  }

  setCanvasDescription(description: string): void {
    this.canvas.description = description
  }

  clear(): void {
    this.canvas.nodes.clear()
    this.canvas.edges.clear()
    this.selectedNodeId = null
    this.selectedEdgeId = null
  }
}

export default DrawEngine
