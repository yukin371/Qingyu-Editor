# Tree 组件

树形控件组件，用于展示层级数据，支持展开/收起、勾选、高亮等功能。

## 特性

- ✅ 支持多层级树形数据展示
- ✅ 支持展开/收起节点
- ✅ 支持节点勾选（父子节点联动）
- ✅ 支持高亮当前节点
- ✅ 支持点击节点展开
- ✅ 支持禁用节点
- ✅ 支持自定义节点内容（插槽）
- ✅ 支持 3 种尺寸 (sm, md, lg)
- ✅ 支持受控模式（v-model）
- ✅ 提供实例方法操作树状态
- ✅ 完整的 TypeScript 类型支持

## 使用方法

### 基础用法

```vue
<script setup lang="ts">
import { ref } from 'vue'
import Tree from '@/design-system/data/Tree/Tree.vue'
import type { TreeNode } from '@/design-system/data/Tree/types'

const data = ref<TreeNode[]>([
  {
    id: '1',
    label: '一级 1',
    children: [
      {
        id: '1-1',
        label: '二级 1-1',
      },
      {
        id: '1-2',
        label: '二级 1-2',
      },
    ],
  },
  {
    id: '2',
    label: '一级 2',
    children: [
      {
        id: '2-1',
        label: '二级 2-1',
      },
    ],
  },
])
</script>

<template>
  <Tree :data="data" />
</template>
```

### 可勾选

```vue
<template>
  <Tree :data="data" :checkable="true" />
</template>
```

### 默认展开所有节点

```vue
<template>
  <Tree :data="data" :default-expand-all="true" />
</template>
```

### 高亮当前节点

```vue
<template>
  <Tree :data="data" :highlight-current="true" />
</template>
```

### 点击节点展开

```vue
<template>
  <Tree :data="data" :expand-on-click-node="true" />
</template>
```

### 不同尺寸

```vue
<template>
  <Tree :data="data" size="sm" />
  <Tree :data="data" size="md" />
  <Tree :data="data" size="lg" />
</template>
```

### 默认选中

```vue
<template>
  <Tree 
    :data="data" 
    :checkable="true"
    :default-checked-keys="['1-1', '2']"
  />
</template>
```

### 默认展开指定节点

```vue
<template>
  <Tree 
    :data="data" 
    :default-expanded-keys="['1', '2']"
  />
</template>
```

### 禁用节点

```vue
<script setup lang="ts">
import { ref } from 'vue'
import type { TreeNode } from '@/design-system/data/Tree/types'

const data = ref<TreeNode[]>([
  {
    id: '1',
    label: '一级 1',
    disabled: true,
    children: [
      { id: '1-1', label: '二级 1-1' },
    ],
  },
  {
    id: '2',
    label: '一级 2',
    children: [
      { id: '2-1', label: '二级 2-1', disabled: true },
      { id: '2-2', label: '二级 2-2' },
    ],
  },
])
</script>

<template>
  <Tree :data="data" :checkable="true" />
</template>
```

### 自定义节点内容

```vue
<template>
  <Tree :data="data">
    <template #default="{ node, data }">
      <div class="flex items-center gap-2">
        <span>{{ node.label }}</span>
        <span class="text-xs text-slate-400">
          {{ data.children?.length || 0 }} 个子项
        </span>
      </div>
    </template>
  </Tree>
</template>
```

### 受控模式

```vue
<script setup lang="ts">
import { ref } from 'vue'
import type { TreeNode } from '@/design-system/data/Tree/types'

const data = ref<TreeNode[]>([...])
const expandedKeys = ref<Array<string | number>>(['1', '2'])
const checkedKeys = ref<Array<string | number>>(['1-1'])
</script>

<template>
  <div>
    <div>展开的节点: {{ expandedKeys.join(', ') }}</div>
    <div>选中的节点: {{ checkedKeys.join(', ') }}</div>
    <Tree 
      :data="data" 
      :checkable="true"
      v-model:expanded-keys="expandedKeys"
      v-model:checked-keys="checkedKeys"
    />
  </div>
</template>
```

### 事件处理

```vue
<script setup lang="ts">
import type { TreeNode } from '@/design-system/data/Tree/types'

const handleNodeClick = (node: TreeNode, nodeState: any) => {
  console.log('节点点击:', node)
}

const handleNodeExpand = (node: TreeNode, expanded: boolean, nodeState: any) => {
  console.log('节点展开/收起:', node.label, expanded)
}

const handleCheckChange = (node: TreeNode, checked: boolean, nodeState: any) => {
  console.log('勾选状态改变:', node.label, checked)
}
</script>

<template>
  <Tree 
    :data="data" 
    :checkable="true"
    @node-click="handleNodeClick"
    @node-expand="handleNodeExpand"
    @check-change="handleCheckChange"
  />
</template>
```

### 实例方法

```vue
<script setup lang="ts">
import { ref } from 'vue'
import type { TreeNode } from '@/design-system/data/Tree/types'

const treeRef = ref()
const data = ref<TreeNode[]>([...])

// 获取选中的节点
const getChecked = () => {
  const nodes = treeRef.value.getCheckedNodes()
  console.log('选中的节点:', nodes)
}

// 获取选中的节点 key
const getCheckedKeys = () => {
  const keys = treeRef.value.getCheckedKeys()
  console.log('选中的节点 key:', keys)
}

// 设置选中的节点
const setChecked = () => {
  treeRef.value.setCheckedKeys(['1-1', '2'])
}

// 获取展开的节点 key
const getExpandedKeys = () => {
  const keys = treeRef.value.getExpandedKeys()
  console.log('展开的节点 key:', keys)
}

// 设置展开的节点
const setExpanded = () => {
  treeRef.value.setExpandedKeys(['1', '2', '3'])
}
</script>

<template>
  <div>
    <Tree ref="treeRef" :data="data" :checkable="true" />
    <button @click="getChecked">获取选中节点</button>
    <button @click="setChecked">设置选中</button>
  </div>
</template>
```

### 文件系统示例

```vue
<script setup lang="ts">
import { ref } from 'vue'
import type { TreeNode } from '@/design-system/data/Tree/types'

const fileSystemData = ref<TreeNode[]>([
  {
    id: 'src',
    label: 'src',
    children: [
      {
        id: 'components',
        label: 'components',
        children: [
          { id: 'Header.vue', label: 'Header.vue' },
          { id: 'Footer.vue', label: 'Footer.vue' },
        ],
      },
      {
        id: 'views',
        label: 'views',
        children: [
          { id: 'Home.vue', label: 'Home.vue' },
          { id: 'About.vue', label: 'About.vue' },
        ],
      },
    ],
  },
  {
    id: 'public',
    label: 'public',
    children: [
      { id: 'favicon.ico', label: 'favicon.ico' },
    ],
  },
  {
    id: 'package.json',
    label: 'package.json',
  },
])
</script>

<template>
  <div class="w-80">
    <Tree :data="fileSystemData" />
  </div>
</template>
```

## API

### Tree Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `data` | `TreeNode[]` | **必填** | 树形数据 |
| `checkable` | `boolean` | `false` | 是否可勾选 |
| `defaultExpandAll` | `boolean` | `false` | 是否默认展开所有节点 |
| `highlightCurrent` | `boolean` | `false` | 是否高亮当前节点 |
| `expandOnClickNode` | `boolean` | `false` | 是否点击节点展开 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 树形控件尺寸 |
| `defaultCheckedKeys` | `Array<string \| number>` | `[]` | 默认选中的节点 key 数组 |
| `defaultExpandedKeys` | `Array<string \| number>` | `[]` | 默认展开的节点 key 数组 |
| `class` | `any` | - | 自定义类名 |

### Tree Events

| 事件 | 参数 | 说明 |
|------|------|------|
| `nodeClick` | `(data: TreeNode, node: TreeNodeState)` | 节点点击 |
| `nodeExpand` | `(data: TreeNode, expanded: boolean, node: TreeNodeState)` | 节点展开/收起 |
| `checkChange` | `(data: TreeNode, checked: boolean, node: TreeNodeState)` | 勾选状态改变 |
| `update:checkedKeys` | `(checkedKeys: Array<string \| number>)` | 选中的节点变化（v-model） |
| `update:expandedKeys` | `(expandedKeys: Array<string \| number>)` | 展开的节点变化（v-model） |

### Tree Slots

| 插槽 | 参数 | 说明 |
|------|------|------|
| `default` | `{ node: TreeNode, data: TreeNode }` | 自定义节点内容 |

### Tree Instance Methods

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `getCheckedNodes` | - | `TreeNode[]` | 获取选中的节点 |
| `getCheckedKeys` | - | `Array<string \| number>` | 获取选中的节点 key |
| `setCheckedKeys` | `(keys: Array<string \| number>)` | `void` | 设置选中的节点 |
| `getExpandedKeys` | - | `Array<string \| number>` | 获取展开的节点 key |
| `setExpandedKeys` | `(keys: Array<string \| number>)` | `void` | 设置展开的节点 |

### TreeNode 类型

```typescript
interface TreeNode {
  id?: string | number           // 节点唯一标识
  label: string                  // 节点显示文本
  children?: TreeNode[]          // 子节点列表
  disabled?: boolean             // 是否禁用
  defaultExpand?: boolean        // 是否默认展开
  [key: string]: any             // 自定义数据
}
```

## 设计规范

### 尺寸规范

| 尺寸 | 字体大小 | 节点高度 | 缩进宽度 |
|------|---------|---------|----------|
| sm | 14px | 32px | 16px |
| md | 16px | 40px | 16px |
| lg | 18px | 48px | 16px |

### 颜色规范

| 状态 | 背景色 | 文字色 |
|------|--------|--------|
| 默认 | transparent | slate-700 |
| 悬停 | slate-100 | slate-700 |
| 高亮 | primary-50 | primary-600 |
| 禁用 | transparent | slate-400 |

### 交互规范

- **展开/收起**: 点击箭头图标或节点（expandOnClickNode 时）
- **选中节点**: 点击复选框
- **高亮节点**: 点击节点内容
- **禁用状态**: 不响应任何交互

### 复选框状态

- **未选中**: 空心方框，灰色边框
- **选中**: 实心方框，主题色背景，白色对勾
- **半选**: 实心方框，主题色背景，白色横线（当子节点部分选中时）

## 最佳实践

### 1. 提供唯一的 id

建议为每个节点提供唯一的 `id`，这样可以更好地控制节点的状态：

```vue
<script setup>
const data = ref([
  {
    id: '1',  // 唯一 id
    label: '一级 1',
    children: [
      { id: '1-1', label: '二级 1-1' },
      { id: '1-2', label: '二级 1-2' },
    ],
  },
])
</script>
```

### 2. 合理使用受控模式

当需要在组件外部管理树状态时，使用受控模式：

```vue
<script setup>
const expandedKeys = ref(['1', '2'])

const handleExpandedChange = (keys) => {
  // 可以在这里做一些额外的处理
  expandedKeys.value = keys
}
</script>

<template>
  <Tree 
    :data="data" 
    v-model:expanded-keys="expandedKeys"
  />
</template>
```

### 3. 大数据量优化

对于大数据量的树，建议：

- 使用默认展开选项而不是全部展开
- 按需加载子节点（懒加载）
- 虚拟滚动（如果需要）

### 4. 自定义节点内容

使用插槽可以实现丰富的节点内容：

```vue
<template>
  <Tree :data="data">
    <template #default="{ node, data }">
      <div class="flex items-center gap-2">
        <Icon :name="getIcon(node)" />
        <span>{{ node.label }}</span>
        <Badge v-if="data.count" :value="data.count" />
      </div>
    </template>
  </Tree>
</template>
```

### 5. 错误处理

当节点没有 `id` 时，组件会使用 `label` 作为唯一标识，但这可能会导致问题（当有重复 label 时）：

```vue
<script setup>
// ✅ 好 - 使用唯一 id
const goodData = [
  { id: 1, label: '节点' },
  { id: 2, label: '节点' },
]

// ❌ 不好 - 重复的 label
const badData = [
  { label: '节点' },
  { label: '节点' },
]
</script>
```

## 可访问性

- 支持键盘导航（方向键、Enter、Space）
- 正确的 ARIA 属性
- 禁用状态正确处理
- 清晰的视觉反馈

## 常见问题

### Q: 如何实现懒加载子节点？

A: 可以通过监听 `nodeExpand` 事件，在展开时动态加载子节点：

```vue
<script setup>
const handleNodeExpand = async (node, expanded) => {
  if (expanded && !node.children) {
    // 加载子节点
    node.children = await loadChildren(node.id)
  }
}
</script>

<template>
  <Tree :data="data" @node-expand="handleNodeExpand" />
</template>
```

### Q: 如何实现搜索过滤？

A: 可以在外部过滤数据，然后更新 Tree 的 data：

```vue
<script setup>
const searchValue = ref('')
const filteredData = computed(() => {
  if (!searchValue.value) return originalData.value
  return filterTree(originalData.value, searchValue.value)
})
</script>

<template>
  <input v-model="searchValue" placeholder="搜索..." />
  <Tree :data="filteredData" />
</template>
```

### Q: 如何实现拖拽排序？

A: Tree 组件本身不支持拖拽，建议使用第三方拖拽库（如 VueDraggable）配合 Tree 使用。
