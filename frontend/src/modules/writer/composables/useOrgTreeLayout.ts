/**
 * useOrgTreeLayout - 组织结构图树布局算法
 *
 * 将大纲树递归计算为组织结构图布局，支持：
 * - 自底向上计算子树宽度
 * - 自顶向下分配节点坐标
 * - 生成 SVG 连线数据
 * - 节点类型推断（主线/分支/支线/结局/章节）
 *
 * 用于 StoryBranchView 组织结构图可视化。
 */

import { computed, type ComputedRef } from 'vue'
import type { OutlineNode } from '@/types/writer'

// ---------------------------------------------------------------------------
// 常量
// ---------------------------------------------------------------------------

/** 节点卡片宽度 */
const NODE_WIDTH = 180
/** 节点卡片高度 */
const NODE_HEIGHT = 72
/** 同层节点水平间距 */
const HORIZONTAL_GAP = 32
/** 层级间垂直间距 */
const VERTICAL_GAP = 64
/** 节点圆角 */
const NODE_RADIUS = 12

// ---------------------------------------------------------------------------
// 类型
// ---------------------------------------------------------------------------

/** 组织结构图节点类型 */
export type OrgNodeCategory = 'main' | 'chapter' | 'sidetrack' | 'ending' | 'branch-point'

/** 布局后的节点 */
export interface OrgTreeNode {
  id: string
  title: string
  category: OrgNodeCategory
  x: number
  y: number
  width: number
  height: number
  level: number
  status: string
  outlineNode: OutlineNode
  children: OrgTreeNode[]
}

/** SVG 连线 */
export interface OrgTreeEdge {
  id: string
  sourceId: string
  targetId: string
  path: string
}

// ---------------------------------------------------------------------------
// 节点类型推断
// ---------------------------------------------------------------------------

/**
 * 推断节点在分支图中的分类
 *
 * - chapter: type 为 'volume' 或 'chapter'
 * - branch-point: 有 2+ 子节点
 * - ending: 叶子节点（无子节点）且非根节点
 * - sidetrack: 非主线路径上的子节点
 * - main: 默认主线节点
 */
export function inferNodeCategory(
  node: OutlineNode,
  isRoot: boolean,
  childIndex: number,
  siblingCount: number,
): OrgNodeCategory {
  const nodeWithType = node as OutlineNode & { type?: string }

  // 章节/卷类型优先
  if (nodeWithType.type === 'volume' || nodeWithType.type === 'chapter') {
    return 'chapter'
  }

  // 根节点始终为主线
  if (isRoot) {
    return 'main'
  }

  const childCount = node.children?.length ?? 0

  // 有多个子节点 → 分支点
  if (childCount >= 2) {
    return 'branch-point'
  }

  // 叶子节点 → 结局
  if (childCount === 0) {
    return 'ending'
  }

  // 多兄弟中的非首个子节点 → 支线
  if (siblingCount > 1 && childIndex > 0) {
    return 'sidetrack'
  }

  return 'main'
}

/** 获取节点类型对应的颜色 */
export function getCategoryColor(category: OrgNodeCategory): string {
  switch (category) {
    case 'main':
      return '#4d79da'
    case 'chapter':
      return '#52c41a'
    case 'sidetrack':
      return '#faad14'
    case 'ending':
      return '#ff4d4f'
    case 'branch-point':
      return '#722ed1'
    default:
      return '#8c8c8c'
  }
}

/** 获取节点类型对应的背景色（浅色） */
export function getCategoryBgColor(category: OrgNodeCategory): string {
  switch (category) {
    case 'main':
      return '#ecf3ff'
    case 'chapter':
      return '#eaf7ef'
    case 'sidetrack':
      return '#fff8e6'
    case 'ending':
      return '#fff2f0'
    case 'branch-point':
      return '#f3eaff'
    default:
      return '#f5f5f5'
  }
}

/** 获取节点类型的中文标签 */
export function getCategoryLabel(category: OrgNodeCategory): string {
  switch (category) {
    case 'main':
      return '主线'
    case 'chapter':
      return '章节'
    case 'sidetrack':
      return '支线'
    case 'ending':
      return '结局'
    case 'branch-point':
      return '分支'
    default:
      return '节点'
  }
}

/** 获取节点类型对应的图标名 */
export function getCategoryIcon(category: OrgNodeCategory): string {
  switch (category) {
    case 'main':
      return 'Flag'
    case 'chapter':
      return 'Document'
    case 'sidetrack':
      return 'Share'
    case 'ending':
      return 'CircleClose'
    case 'branch-point':
      return 'Connection'
    default:
      return 'Node'
  }
}

// ---------------------------------------------------------------------------
// 布局算法
// ---------------------------------------------------------------------------

/** 计算子树宽度（叶子向上累加） */
function calcSubtreeWidth(node: OutlineNode): number {
  const children = node.children ?? []
  if (children.length === 0) {
    return NODE_WIDTH
  }

  let totalWidth = 0
  for (const child of children) {
    totalWidth += calcSubtreeWidth(child)
  }
  totalWidth += (children.length - 1) * HORIZONTAL_GAP

  // 父节点不能比子树窄
  return Math.max(NODE_WIDTH, totalWidth)
}

/** 递归构建布局节点并分配坐标 */
function buildLayoutNodes(
  node: OutlineNode,
  centerX: number,
  y: number,
  level: number,
  childIndex: number,
  siblingCount: number,
  isRoot: boolean,
): OrgTreeNode {
  const children = node.children ?? []
  const category = inferNodeCategory(node, isRoot, childIndex, siblingCount)

  // 先递归计算子树宽度
  const subtreeWidths = children.map((child) => calcSubtreeWidth(child))
  const totalChildrenWidth =
    subtreeWidths.reduce((sum, w) => sum + w, 0) + Math.max(0, children.length - 1) * HORIZONTAL_GAP

  // 子节点从左到右排列，居中在父节点下方
  let childX = centerX - totalChildrenWidth / 2

  const layoutChildren: OrgTreeNode[] = children.map((child, index) => {
    const childSubtreeWidth = subtreeWidths[index]
    const childCenterX = childX + childSubtreeWidth / 2
    childX += childSubtreeWidth + HORIZONTAL_GAP

    return buildLayoutNodes(
      child,
      childCenterX,
      y + NODE_HEIGHT + VERTICAL_GAP,
      level + 1,
      index,
      children.length,
      false,
    )
  })

  return {
    id: node.id,
    title: node.title || '未命名节点',
    category,
    x: centerX - NODE_WIDTH / 2,
    y,
    width: NODE_WIDTH,
    height: NODE_HEIGHT,
    level,
    status: node.status || 'draft',
    outlineNode: node,
    children: layoutChildren,
  }
}

/** 生成父子之间的贝塞尔曲线路径 */
function generateEdgePath(parent: OrgTreeNode, child: OrgTreeNode): string {
  const sourceX = parent.x + parent.width / 2
  const sourceY = parent.y + parent.height
  const targetX = child.x + child.width / 2
  const targetY = child.y

  const midY = (sourceY + targetY) / 2

  // 使用三次贝塞尔曲线：从父底部到子顶部，中间有两个控制点
  return `M ${sourceX} ${sourceY} C ${sourceX} ${midY}, ${targetX} ${midY}, ${targetX} ${targetY}`
}

/** 递归生成所有连线 */
function generateEdges(nodes: OrgTreeNode[]): OrgTreeEdge[] {
  const edges: OrgTreeEdge[] = []

  function walk(node: OrgTreeNode) {
    for (const child of node.children) {
      edges.push({
        id: `edge-${node.id}-${child.id}`,
        sourceId: node.id,
        targetId: child.id,
        path: generateEdgePath(node, child),
      })
      walk(child)
    }
  }

  for (const root of nodes) {
    walk(root)
  }

  return edges
}

/** 扁平化所有布局节点 */
function flattenNodes(nodes: OrgTreeNode[]): OrgTreeNode[] {
  const result: OrgTreeNode[] = []

  function walk(node: OrgTreeNode) {
    result.push(node)
    for (const child of node.children) {
      walk(child)
    }
  }

  for (const root of nodes) {
    walk(root)
  }

  return result
}

// ---------------------------------------------------------------------------
// Composable
// ---------------------------------------------------------------------------

export interface UseOrgTreeLayoutReturn {
  /** 布局后的根节点（含位置信息） */
  layoutRoots: ComputedRef<OrgTreeNode[]>
  /** 扁平化的所有布局节点 */
  flatNodes: ComputedRef<OrgTreeNode[]>
  /** 所有连线 */
  edges: ComputedRef<OrgTreeEdge[]>
  /** 内容总宽度 */
  contentWidth: ComputedRef<number>
  /** 内容总高度 */
  contentHeight: ComputedRef<number>
  /** 是否为普通线性模式（无分支） */
  isLinearMode: ComputedRef<boolean>
  /** 查找指定 ID 的节点 */
  findNode: (id: string) => OrgTreeNode | null
}

export function useOrgTreeLayout(rootNodes: ComputedRef<OutlineNode[]>): UseOrgTreeLayoutReturn {
  /** 计算布局 */
  const layoutRoots = computed<OrgTreeNode[]>(() => {
    const roots = rootNodes.value
    if (!roots.length) return []

    // 计算所有根节点的子树宽度
    const subtreeWidths = roots.map((node) => calcSubtreeWidth(node))
    const totalWidth =
      subtreeWidths.reduce((sum, w) => sum + w, 0) + Math.max(0, roots.length - 1) * HORIZONTAL_GAP

    let currentX = -totalWidth / 2

    return roots.map((node, index) => {
      const subtreeWidth = subtreeWidths[index]
      const centerX = currentX + subtreeWidth / 2
      currentX += subtreeWidth + HORIZONTAL_GAP

      return buildLayoutNodes(node, centerX, 0, 1, index, roots.length, index === 0)
    })
  })

  const flatNodes = computed(() => flattenNodes(layoutRoots.value))
  const edges = computed(() => generateEdges(layoutRoots.value))

  /** 内容包围盒 */
  const contentWidth = computed(() => {
    const nodes = flatNodes.value
    if (!nodes.length) return 0
    const minX = Math.min(...nodes.map((n) => n.x))
    const maxX = Math.max(...nodes.map((n) => n.x + n.width))
    return maxX - minX + NODE_RADIUS * 2
  })

  const contentHeight = computed(() => {
    const nodes = flatNodes.value
    if (!nodes.length) return 0
    const maxY = Math.max(...nodes.map((n) => n.y + n.height))
    return maxY + NODE_RADIUS
  })

  /** 判断是否为线性模式（每个节点最多一个子节点） */
  const isLinearMode = computed(() => {
    function checkLinear(nodes: OutlineNode[]): boolean {
      for (const node of nodes) {
        const children = node.children ?? []
        if (children.length > 1) return false
        if (children.length === 1 && !checkLinear(children)) return false
      }
      return true
    }
    return checkLinear(rootNodes.value)
  })

  /** 根据 ID 查找节点 */
  function findNode(id: string): OrgTreeNode | null {
    return flatNodes.value.find((n) => n.id === id) ?? null
  }

  return {
    layoutRoots,
    flatNodes,
    edges,
    contentWidth,
    contentHeight,
    isLinearMode,
    findNode,
  }
}
