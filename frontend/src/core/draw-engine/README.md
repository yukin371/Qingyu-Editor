# 青羽通用绘制引擎 (Draw Engine)

一个功能强大、易于集成的通用绘制工具库，支持思维导图、树形图、关系图、时间线等多种图形类型。

## 功能特性

### 核心功能
- ✅ **多种图形类型支持**
  - 思维导图 (MindMap)
  - 树形图 (Tree)
  - 关系图/人物关系图 (Graph)
  - 时间线 (Timeline)
  - 流程图 (Flowchart)
  - 通用图表 (Diagram)

- ✅ **节点管理**
  - 创建、编辑、删除节点
  - 节点拖拽移动
  - 节点样式自定义（颜色、大小、图标等）
  - 元数据支持

- ✅ **连接管理**
  - 创建、编辑、删除连接线
  - 多种连接线样式（直线、曲线、折线、箭头）
  - 连接线标签
  - 箭头类型定制

- ✅ **交互功能**
  - 自由缩放和平移
  - 网格对齐
  - 撤销/重做功能
  - 快捷键支持

- ✅ **导出功能**
  - JSON 导出
  - Markdown 导出（含 Mermaid 图表）
  - SVG 导出
  - 自动生成 Mermaid 语法

- ✅ **主题系统**
  - 内置主题（浅色、深色、默认）
  - 自定义主题支持

## 快速开始

### 1. 安装依赖

```bash
npm install nanoid
```

### 2. 创建基础使用示例

```vue
<template>
  <div style="height: 600px">
    <DrawCanvas
      :config="{
        canvasId: 'demo-canvas',
        type: 'mindmap',
        theme: 'default',
        enableGrid: true,
        enableHistory: true
      }"
      @node-selected="handleNodeSelected"
      @export="handleExport"
    />
  </div>
</template>

<script setup>
import DrawCanvas from '@/shared/components/draw/DrawCanvas.vue'

const handleNodeSelected = (node) => {
  console.log('节点被选中:', node)
}

const handleExport = (data) => {
  console.log('导出数据:', data)
}
</script>
```

### 3. 配置选项

```typescript
interface DrawEngineConfig {
  canvasId: string                    // 画布ID
  type: DrawCanvasType                // 图形类型
  theme?: DrawTheme | string          // 主题
  enableGrid?: boolean                // 启用网格
  snapToGrid?: boolean                // 吸附到网格
  gridSize?: number                   // 网格大小 (默认 20)
  enableHistory?: boolean             // 启用历史记录
  maxHistorySteps?: number            // 最大历史步数 (默认 100)
  readonly?: boolean                  // 只读模式
  defaultNodeWidth?: number           // 默认节点宽度
  defaultNodeHeight?: number          // 默认节点高度
  minZoom?: number                    // 最小缩放 (默认 0.1)
  maxZoom?: number                    // 最大缩放 (默认 5)
  autoLayout?: boolean                // 自动布局
  directions?: 'LR' | 'TB' | 'RL' | 'BT'  // 布局方向
}
```

## API 文档

### DrawEngine 类

#### 构造函数
```typescript
const engine = new DrawEngine(config: DrawEngineConfig)
```

#### 节点操作

##### 创建节点
```typescript
const node = engine.createNode(
  label: string,
  x: number,
  y: number,
  metadata?: Record<string, any>
): DrawNode
```

示例：
```javascript
const node = engine.createNode('新节点', 100, 100, {
  subtitle: '副标题',
  customData: { /* 自定义数据 */ }
})
```

##### 更新节点
```typescript
engine.updateNode(nodeId: string, updates: Partial<DrawNode>): void
```

示例：
```javascript
engine.updateNode(nodeId, {
  label: '更新的标题',
  color: '#409eff',
  description: '新描述'
})
```

##### 删除节点
```typescript
engine.deleteNode(nodeId: string): void
```

##### 获取节点
```typescript
const node = engine.getNode(nodeId: string): DrawNode | undefined
const allNodes = engine.getAllNodes(): DrawNode[]
```

#### 连接操作

##### 创建连接
```typescript
const edge = engine.createEdge(
  fromNodeId: string,
  toNodeId: string,
  label?: string
): DrawEdge
```

##### 更新连接
```typescript
engine.updateEdge(edgeId: string, updates: Partial<DrawEdge>): void
```

##### 删除连接
```typescript
engine.deleteEdge(edgeId: string): void
```

##### 获取连接
```typescript
const edge = engine.getEdge(edgeId: string): DrawEdge | undefined
const allEdges = engine.getAllEdges(): DrawEdge[]
```

#### 选择操作

```typescript
engine.selectNode(nodeId: string | null): void
engine.selectEdge(edgeId: string | null): void
const node = engine.getSelectedNode(): DrawNode | null
const edge = engine.getSelectedEdge(): DrawEdge | null
```

#### 缩放和平移

```typescript
// 缩放 (factor: 1.2 放大20%, 0.8 缩小20%)
engine.zoom(factor: number, centerX?: number, centerY?: number): void

// 平移
engine.pan(deltaX: number, deltaY: number): void

// 适应屏幕
engine.fitToScreen(width: number, height: number, padding?: number): void
```

#### 导出功能

##### 导出为 JSON
```typescript
const json = engine.exportAsJSON(): string
// 包含完整的图形数据和节点信息
```

##### 导出为 Markdown
```typescript
const result = engine.exportAsMarkdown(): MarkdownExport
// {
//   markdown: string,      // Markdown 文本
//   nodes: DrawNode[],     // 节点数组
//   edges: DrawEdge[],     // 连接数组
//   mermaid?: string       // Mermaid 图表代码
// }
```

##### 导出为 SVG
```typescript
const svg = engine.exportAsSVG(width?: number, height?: number): string
```

#### 撤销/重做

```typescript
engine.undo(): void
engine.redo(): void
engine.canUndo(): boolean
engine.canRedo(): boolean
```

#### 事件系统

```typescript
// 监听事件
engine.on(eventType: DrawEventType, listener: (e: DrawEngineEvent) => void): void

// 移除监听
engine.off(eventType: DrawEventType, listener: (e: DrawEngineEvent) => void): void

// 事件类型
type DrawEventType = 
  | 'nodeSelect'       // 节点被选中
  | 'nodeCreate'       // 节点被创建
  | 'nodeUpdate'       // 节点被更新
  | 'nodeDelete'       // 节点被删除
  | 'edgeCreate'       // 连接被创建
  | 'edgeUpdate'       // 连接被更新
  | 'edgeDelete'       // 连接被删除
  | 'canvasZoom'       // 画布缩放
  | 'canvasPan'        // 画布平移
  | 'canvasContextMenu' // 右键菜单
```

示例：
```javascript
engine.on('nodeCreate', (event) => {
  console.log('新节点创建:', event.node)
})

engine.on('nodeUpdate', (event) => {
  console.log('节点更新:', event.node)
})
```

#### 主题管理

```typescript
// 设置主题
engine.setTheme(theme: DrawTheme | string): void

// 获取当前主题
const theme = engine.getTheme(): DrawTheme

// 预设主题: 'light' | 'dark' | 'default'
```

## 高级用法

### 与 Markdown 集成

导出为 Markdown 后可直接在 .md 文件中使用 Mermaid 图表：

```markdown
# 我的思维导图

这是一个自动生成的思维导图。

## 图表

\`\`\`mermaid
mindmap
  root((中心节点))
    分支1
      子节点1
      子节点2
    分支2
\`\`\`

## 详细信息

### 节点1
节点1的详细描述

### 节点2
节点2的详细描述
```

### 在 OutlineView 中使用

```vue
<template>
  <div class="outline-view">
    <DrawCanvas
      v-show="viewMode === 'mindmap'"
      :config="{
        canvasId: 'outline-mindmap',
        type: 'mindmap',
        enableHistory: true
      }"
      :initial-data="outlineData"
      @node-changed="handleNodeChanged"
    />
  </div>
</template>

<script setup>
const outlineData = computed(() => ({
  nodes: writerStore.outline.tree.map(node => ({
    id: node.id,
    label: node.title,
    description: node.description,
    x: 100,
    y: 100,
    width: 120,
    height: 60
  })),
  edges: [] // 根据树结构生成
}))
</script>
```

### 在 EncyclopediaView 中使用

```vue
<template>
  <div class="encyclopedia-view">
    <DrawCanvas
      :config="{
        canvasId: 'encyclopedia-graph',
        type: 'graph',
        enableHistory: true
      }"
      :initial-data="encyclopediaData"
    />
  </div>
</template>

<script setup>
const encyclopediaData = computed(() => {
  const nodes = selectedCharacters.value.map((char, index) => ({
    id: char.id,
    label: char.name,
    description: char.summary,
    x: 100 + index * 150,
    y: 100,
    width: 120,
    height: 60,
    metadata: { avatar: char.avatarUrl }
  }))

  const edges = characterRelations.value.map(rel => ({
    fromNodeId: rel.fromId,
    toNodeId: rel.toId,
    label: rel.type,
    style: 'curve'
  }))

  return { nodes, edges }
})
</script>
```

### 在 CharacterGraphView 中使用

```vue
<template>
  <div class="character-graph">
    <DrawCanvas
      :config="{
        canvasId: 'character-graph',
        type: 'graph',
        enableHistory: true
      }"
      @export="handleExportCharacterGraph"
    />
  </div>
</template>

<script setup>
const handleExportCharacterGraph = ({ type, data }) => {
  if (type === 'markdown') {
    // 保存到文档或发送到后端
    saveToCharacterWiki(data)
  }
}
</script>
```

## 后端集成

### 保存图形数据

```typescript
// API 端点: POST /api/v1/writer/projects/{projectId}/graphs
interface SaveGraphRequest {
  type: DrawCanvasType        // 图形类型
  title: string               // 图形标题
  description?: string        // 描述
  nodes: DrawNode[]          // 节点列表
  edges: DrawEdge[]          // 连接列表
  metadata?: Record<string, any>
}

interface SaveGraphResponse {
  id: string
  type: DrawCanvasType
  createdAt: Date
  updatedAt: Date
}
```

### 获取图形数据

```typescript
// API 端点: GET /api/v1/writer/projects/{projectId}/graphs/{graphId}
interface GetGraphResponse {
  id: string
  type: DrawCanvasType
  title: string
  description?: string
  nodes: DrawNode[]
  edges: DrawEdge[]
  createdAt: Date
  updatedAt: Date
}
```

## 最佳实践

### 1. 性能优化
- 对于大规模图形（节点超过 1000），启用虚拟化渲染
- 适当提高网格大小以减少 DOM 元素
- 禁用不需要的功能（如历史记录）

### 2. 用户体验
- 提供撤销/重做功能
- 实现自动保存草稿
- 显示操作提示和快捷键帮助

### 3. 数据持久化
- 定期保存到后端
- 实现本地缓存机制
- 支持离线编辑

### 4. 导出选项
- 提供多种导出格式
- 在文档中包含元数据
- 支持自定义导出模板

## 常见问题

### Q: 如何实现自定义形状？
A: 通过 metadata 字段存储自定义数据，在渲染时检查该字段进行特殊处理。

### Q: 支持实时协作吗？
A: 当前版本不支持，但可以通过 WebSocket 和事件系统进行扩展。

### Q: 如何处理大型图形？
A: 使用虚拟化渲染、增加网格大小、禁用不必要的动画。

### Q: 能否集成第三方库？
A: 可以，通过事件系统和导出功能与其他库集成。

## 更新日志

### v1.0.0 (2025-10-31)
- ✅ 初始版本
- ✅ 基础节点和连接操作
- ✅ 导出功能
- ✅ 撤销/重做
- ✅ 主题系统

## 许可证

MIT License

