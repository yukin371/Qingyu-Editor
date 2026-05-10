<template>
  <div ref="containerRef" class="relationship-graph-container">
    <!-- D3将直接在这里创建DOM -->
    <!-- 连线提示 -->
    <div v-if="isDrawingLine" class="drawing-hint">
      <QyTag type="warning" size="sm">
        <QyIcon name="Connection" :size="14" />
        拖拽到目标节点创建关系，松开取消
      </QyTag>
    </div>
    <!-- 工具提示 -->
    <div class="graph-toolbar">
      <div title="拖拽节点移动位置，双击节点释放回布局">
        <QyTag size="sm" type="info">
          <QyIcon name="QuestionFilled" :size="14" />
          拖拽移动 | 双击释放
        </QyTag>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as d3 from 'd3'
import { QyIcon, QyTag } from '@/design-system/components'

export interface GraphNode {
  id: string
  name: string
  avatar?: string
  entityType?: 'character' | 'location' | 'item' | 'organization' | 'concept'
  importance?: number
  isInherited?: boolean // 是否继承自父图谱
  isAppeared?: boolean // 是否已通过@引用登场（true=已登场高亮，false/undefined=未登场灰显）
}

export interface GraphLink {
  id?: string
  source: string
  target: string
  type: string
  strength: number
  isInherited?: boolean // 是否继承自父图谱
}

// 内部节点类型（包含D3计算的位置属性）
interface InternalNode extends GraphNode {
  x?: number
  y?: number
  fx?: number | null
  fy?: number | null
}

interface Props {
  nodes: GraphNode[]
  links: GraphLink[]
  inheritedNodes?: GraphNode[]
  inheritedLinks?: GraphLink[]
  focusedNodeId?: string | null
}

const props = defineProps<Props>()

// 发射事件
const emit = defineEmits<{
  (e: 'create-link', fromId: string, toId: string): void
  (e: 'node-click', nodeId: string): void
  (e: 'delete-node', nodeId: string): void
  (e: 'delete-link', linkId: string): void
  (e: 'remove-graph'): void
  (e: 'add-node', x: number, y: number): void
}>()

const containerRef = ref<HTMLElement>()
let simulation: d3.Simulation<any, undefined> | null = null
let svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | null = null
let g: d3.Selection<SVGGElement, unknown, null, undefined> | null = null
let nodeSelection: d3.Selection<SVGGElement, GraphNode, SVGGElement, unknown> | null = null

// 连线状态
const isDrawingLine = ref(false)
let drawingLine: d3.Selection<SVGLineElement, unknown, null, undefined> | null = null
let sourceNode: GraphNode | null = null
let sourceNodePos: { x: number; y: number } | null = null
let hoveredNodeId: string | null = null

// 暴露给测试使用
defineExpose({
  d3Simulation: () => simulation,
})

function getNodeBaseColor(node: GraphNode) {
  if (node.entityType === 'location') return '#52c41a'
  if (node.entityType === 'item') return '#fa8c16'
  if (node.entityType === 'organization') return '#0f766e'
  if (node.entityType === 'concept') return '#722ed1'
  return '#5b8cff'
}

function getNodeFillColor(node: GraphNode) {
  if (node.isAppeared === false) {
    return '#c4c8d4'
  }

  if (node.isInherited) {
    if (node.entityType === 'location') return '#95de64'
    if (node.entityType === 'item') return '#ffc069'
    if (node.entityType === 'organization') return '#5eead4'
    if (node.entityType === 'concept') return '#b37feb'
    return '#a0b4f0'
  }

  return getNodeBaseColor(node)
}

function getNodeTypeGlyph(node: GraphNode) {
  if (node.entityType === 'location') return '地'
  if (node.entityType === 'item') return '物'
  if (node.entityType === 'organization') return '组'
  if (node.entityType === 'concept') return '概'
  return '角'
}

function applyFocusedNodeState() {
  if (!nodeSelection) return
  const targetId = props.focusedNodeId || null
  nodeSelection.classed('is-focused', (node: GraphNode) =>
    Boolean(targetId && node.id === targetId),
  )
}

function initGraph() {
  if (!containerRef.value) return

  // 清理旧的SVG
  if (svg) {
    svg.remove()
  }
  if (simulation) {
    simulation.stop()
  }

  const width = containerRef.value.clientWidth || 800
  const height = 600

  // D3直接创建SVG和DOM
  svg = d3
    .select(containerRef.value)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('class', 'graph-canvas')
    .attr('viewBox', [0, 0, width, height])

  // 创建缩放行为
  const zoom = d3
    .zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.1, 4])
    .on('zoom', (event) => {
      g?.attr('transform', event.transform)
    })

  svg.call(zoom as any)

  g = svg.append('g')

  // 右键画布添加节点
  svg!.on('contextmenu', (event: MouseEvent) => {
    event.preventDefault()
    // 获取相对于SVG的坐标
    const svgElement = svg!.node() as SVGSVGElement
    const rect = svgElement.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    emit('add-node', x, y)
  })

  // 创建箭头标记
  svg
    .append('defs')
    .append('marker')
    .attr('id', 'arrowhead')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 25)
    .attr('refY', 0)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', '#999')

  // 准备数据
  const nodes = props.nodes.map((n) => ({ ...n }))
  const links = props.links.map((l) => ({ ...l }))

  // 创建链接
  const link = g
    .append('g')
    .attr('class', 'links')
    .selectAll('line')
    .data(links)
    .join('line')
    .attr('stroke', '#999')
    .attr('stroke-opacity', 0.6)
    .attr('stroke-width', (d: GraphLink) => Math.sqrt(d.strength / 20))
    .attr('marker-end', 'url(#arrowhead)')

  // 创建临时连线层（用于绘制新连线）
  const tempLineLayer = g.append('g').attr('class', 'temp-line-layer')

  // 创建节点组
  const node = g
    .append('g')
    .attr('class', 'nodes')
    .selectAll('g')
    .data(nodes)
    .join('g')
    .attr('class', 'node')
    .attr('data-id', (d: GraphNode) => d.id)
    .attr('data-entity-type', (d: GraphNode) => d.entityType || 'character')
  nodeSelection = node as d3.Selection<SVGGElement, GraphNode, SVGGElement, unknown>

  // 节点圆形 — 已登场/未登场视觉区分
  node
    .append('circle')
    .attr('r', (d: GraphNode) => 15 + (d.importance || 3) * 2)
    .attr('fill', (d: GraphNode) => getNodeFillColor(d))
    .attr('stroke', (d: GraphNode) => (d.isAppeared === false ? '#d0d4de' : '#fff'))
    .attr('stroke-width', 2)
    .attr('stroke-dasharray', (d: GraphNode) => (d.isAppeared === false ? '4,3' : 'none'))
    .style('cursor', 'pointer')
    .style('opacity', (d: GraphNode) => (d.isAppeared === false ? 0.55 : 1))

  node
    .append('text')
    .attr('class', 'node-type-badge')
    .text((d: GraphNode) => getNodeTypeGlyph(d))
    .attr('x', 0)
    .attr('y', 4)
    .attr('text-anchor', 'middle')
    .attr('font-size', '11px')
    .attr('font-weight', 700)
    .attr('fill', '#fff')
    .style('pointer-events', 'none')

  // 节点标签
  node
    .append('text')
    .text((d: GraphNode) => d.name)
    .attr('x', 0)
    .attr('y', (d: GraphNode) => 20 + (d.importance || 3) * 2)
    .attr('text-anchor', 'middle')
    .attr('font-size', '12px')
    .attr('fill', (d: GraphNode) => (d.isAppeared === false ? '#9ca3af' : '#333'))
    .style('pointer-events', 'none')

  // 添加拖拽行为（移动节点）
  const drag = d3
    .drag()
    .filter((event: any) => {
      // Shift 键按下时不触发节点拖拽，而是触发连线
      return !event.shiftKey
    })
    .on('start', dragStarted as any)
    .on('drag', dragged as any)
    .on('end', dragEnded as any)

  node.call(drag as any)

  // 连线拖拽行为
  const lineDrag = d3
    .drag()
    .filter((event: any) => {
      // 只有 Shift 键按下时才触发连线
      return event.shiftKey
    })
    .on('start', lineDragStarted as any)
    .on('drag', lineDragged as any)
    .on('end', lineDragEnded as any)

  node.call(lineDrag as any)

  // 节点点击事件
  node.on('click', (event: MouseEvent, d: any) => {
    if (!event.shiftKey) {
      emit('node-click', d.id)
    }
  })

  // 节点双击事件 - 释放节点回力导向布局
  node.on('dblclick', (_event: MouseEvent, d: any) => {
    d.fx = null
    d.fy = null
    simulation!.alphaTarget(0.3).restart()
  })

  // 节点右键事件 - 删除节点
  node.on('contextmenu', (event: MouseEvent, d: any) => {
    event.preventDefault()
    emit('delete-node', d.id)
  })

  // 节点悬停效果
  node.on('mouseenter', function (this: any, _event: MouseEvent, d: any) {
    if (isDrawingLine.value && sourceNode && sourceNode.id !== d.id) {
      hoveredNodeId = d.id
      d3.select(this).select('circle').attr('stroke', '#67c23a').attr('stroke-width', 4)
    }
  })

  node.on('mouseleave', function (this: any, _event: MouseEvent, d: GraphNode) {
    hoveredNodeId = null
    const circle = d3.select(this).select('circle')
    const isUnappeared = d.isAppeared === false
    circle
      .attr('stroke', isUnappeared ? '#d0d4de' : '#fff')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', isUnappeared ? '4,3' : 'none')
  })

  // 力导向布局
  simulation = d3
    .forceSimulation(nodes as any)
    .force(
      'link',
      d3
        .forceLink(links as any)
        .id((d: any) => d.id)
        .distance(100),
    )
    .force('charge', d3.forceManyBody().strength(-300))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force(
      'collision',
      d3.forceCollide().radius((d: any) => 20 + (d.importance || 3) * 2),
    )

  // Tick中直接更新DOM，不经过Vue响应式
  simulation.on('tick', () => {
    link
      .attr('x1', (d: any) => d.source.x)
      .attr('y1', (d: any) => d.source.y)
      .attr('x2', (d: any) => d.target.x)
      .attr('y2', (d: any) => d.target.y)

    node.attr('transform', (d: any) => `translate(${d.x},${d.y})`)

    // 更新临时连线位置
    if (drawingLine && sourceNodePos) {
      drawingLine.attr('x1', sourceNodePos.x).attr('y1', sourceNodePos.y)
    }
  })

  function dragStarted(event: any, d: InternalNode) {
    if (!event.active) simulation!.alphaTarget(0.3).restart()
    d.fx = d.x
    d.fy = d.y
  }

  function dragged(event: any, d: InternalNode) {
    d.fx = event.x
    d.fy = event.y
  }

  function dragEnded(event: any, d: InternalNode) {
    if (!event.active) simulation!.alphaTarget(0)
    // 保持节点在拖拽后的位置，不让力导向布局干扰
    d.fx = event.x
    d.fy = event.y
  }

  // 连线拖拽开始
  function lineDragStarted(event: any, d: InternalNode) {
    isDrawingLine.value = true
    sourceNode = d
    sourceNodePos = { x: d.x || 0, y: d.y || 0 }

    // 创建临时连线
    drawingLine = tempLineLayer
      .append('line')
      .attr('class', 'temp-line')
      .attr('x1', sourceNodePos.x)
      .attr('y1', sourceNodePos.y)
      .attr('x2', event.x)
      .attr('y2', event.y)
      .attr('stroke', '#67c23a')
      .attr('stroke-width', 3)
      .attr('stroke-dasharray', '5,5')
      .attr('pointer-events', 'none')

    // 高亮源节点
    node
      .filter((n: any) => n.id === d.id)
      .select('circle')
      .attr('stroke', '#67c23a')
      .attr('stroke-width', 4)
  }

  // 连线拖拽中
  function lineDragged(event: any) {
    if (drawingLine) {
      drawingLine.attr('x2', event.x).attr('y2', event.y)
    }
  }

  // 连线拖拽结束
  function lineDragEnded(_event: any) {
    // 重置源节点高亮
    if (sourceNode) {
      const srcNode = sourceNode as unknown as GraphNode
      const isUnappeared = srcNode.isAppeared === false
      node
        .filter((n: GraphNode) => n.id === sourceNode!.id)
        .select('circle')
        .attr('stroke', isUnappeared ? '#d0d4de' : '#fff')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', isUnappeared ? '4,3' : 'none')
    }

    // 检查是否落在某个节点上
    if (hoveredNodeId && sourceNode && hoveredNodeId !== sourceNode.id) {
      // 发射创建连线事件
      emit('create-link', sourceNode.id, hoveredNodeId)
    }

    // 清理临时连线
    if (drawingLine) {
      drawingLine.remove()
      drawingLine = null
    }

    isDrawingLine.value = false
    sourceNode = null
    sourceNodePos = null
    hoveredNodeId = null
  }

  applyFocusedNodeState()
}

onMounted(() => {
  // 等待DOM渲染完成后初始化
  setTimeout(() => {
    initGraph()
  }, 100)
})

// 监听props变化重新初始化
watch(
  () => [props.nodes, props.links],
  () => {
    initGraph()
  },
  { deep: true },
)

watch(
  () => props.focusedNodeId,
  () => {
    applyFocusedNodeState()
  },
)

onUnmounted(() => {
  // 清理资源
  if (simulation) {
    simulation.stop()
    simulation = null
  }
  if (svg) {
    svg.remove()
    svg = null
  }
  nodeSelection = null
})
</script>

<style scoped lang="scss">
.relationship-graph-container {
  width: 100%;
  height: 100%;
  min-height: 400px;
  background: var(--editor-bg-surface);
  border-radius: 8px;
  overflow: hidden;
  position: relative;

  :deep(svg) {
    display: block;
  }

  :deep(.node:hover circle) {
    fill: #409eff;
  }

  :deep(.node.is-focused circle) {
    stroke: #f59e0b;
    stroke-width: 4;
  }

  :deep(.node.is-focused .node-type-badge) {
    font-size: 12px;
  }

  :deep(.temp-line) {
    animation: dash 0.5s linear infinite;
  }

  @keyframes dash {
    to {
      stroke-dashoffset: -10;
    }
  }
}

.drawing-hint {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  pointer-events: none;

  .qy-tag {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: color-mix(in srgb, var(--editor-bg-surface) 95%, transparent);
    box-shadow: 0 2px 8px color-mix(in srgb, var(--editor-border) 40%, transparent);
  }
}

.graph-toolbar {
  position: absolute;
  bottom: 12px;
  right: 12px;
  z-index: 10;

  .qy-tag {
    display: flex;
    align-items: center;
    gap: 4px;
    background: color-mix(in srgb, var(--editor-bg-surface) 90%, transparent);
  }
}
</style>
