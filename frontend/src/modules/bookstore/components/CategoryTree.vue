<template>
  <div class="category-tree-container">
    <!-- 骨架屏加载状态 -->
    <div v-if="loading" class="tree-skeleton">
      <div v-for="n in 6" :key="n" class="skeleton-item">
        <el-skeleton animated>
          <template #template>
            <div style="display: flex; align-items: center; gap: 10px; width: 100%;">
              <el-skeleton-item variant="circle" style="width: 16px; height: 16px" />
              <el-skeleton-item variant="text" style="width: 60%" />
              <el-skeleton-item variant="text" style="width: 20px; margin-left: auto" />
            </div>
          </template>
        </el-skeleton>
      </div>
    </div>

    <!-- 真实树形结构 -->
    <div v-else class="tree-wrapper">
      <el-tree ref="treeRef" :data="treeData" :props="treeProps" :current-node-key="currentCategoryId"
        :default-expanded-keys="defaultExpandedKeys" :highlight-current="true" :expand-on-click-node="false"
        :indent="16" node-key="id" class="premium-tree" @node-click="handleNodeClick">
        <template #default="{ node, data }">
          <div class="custom-tree-node">
            <div class="node-main">
              <!-- 图标：优先使用数据中的 icon，否则根据是否有子节点自动判断 -->
              <el-icon class="node-icon" :class="{ 'is-folder': hasChildren(data) }">
                <component :is="getIcon(data)" />
              </el-icon>
              <span class="node-label">{{ node.label }}</span>
            </div>

            <!-- 数量徽标 -->
            <div v-if="showCount && data.count !== undefined" class="node-badge">
              {{ formatCount(data.count) }}
            </div>
          </div>
        </template>
      </el-tree>

      <!-- 空状态 -->
      <div v-if="treeData.length === 0" class="empty-tree">
        <span class="empty-text">暂无分类</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { ElTree } from 'element-plus'
import { Folder, CollectionTag } from '@element-plus/icons-vue'
// 假设 Category 定义在 types 目录
// import type { Category } from '@/types/models'

// 临时类型定义 (如果已导入可忽略)
interface Category {
  id: string
  name: string
  parentId?: string
  count?: number
  icon?: string
  children?: Category[]
  [key: string]: any
}

interface Props {
  categories: Category[]
  currentCategoryId?: string
  showCount?: boolean
  defaultExpanded?: boolean
  loading?: boolean
}

interface Emits {
  (e: 'category-change', category: Category): void
}

const props = withDefaults(defineProps<Props>(), {
  categories: () => [],
  currentCategoryId: '',
  showCount: true,
  defaultExpanded: false,
  loading: false
})

const emit = defineEmits<Emits>()
const treeRef = ref<InstanceType<typeof ElTree>>()

const treeProps = {
  label: 'name',
  children: 'children'
}

// 构建树数据
const treeData = computed(() => buildTree(props.categories))

// 默认展开逻辑
const defaultExpandedKeys = computed(() => {
  if (!props.defaultExpanded) return []
  // 默认展开一级节点
  return treeData.value.map(item => item.id)
})

// 构建树函数
function buildTree(items: Category[]): Category[] {
  const map = new Map<string, Category>()
  const roots: Category[] = []

  // 深拷贝以避免修改原始 prop
  const categories = JSON.parse(JSON.stringify(items))

  categories.forEach((cat: Category) => {
    map.set(cat.id, { ...cat, children: [] })
  })

  categories.forEach((cat: Category) => {
    const node = map.get(cat.id)!
    if (cat.parentId && map.has(cat.parentId)) {
      const parent = map.get(cat.parentId)!
      parent.children?.push(node)
    } else {
      roots.push(node)
    }
  })

  return roots
}

// 辅助：判断是否有子节点
function hasChildren(data: Category): boolean {
  return !!(data.children && data.children.length > 0)
}

// 辅助：获取图标
function getIcon(data: Category) {
  // 只返回 Element Plus 图标组件，不处理自定义图片路径
  // 如果需要自定义图标，应该用 <img> 标签单独渲染
  if (hasChildren(data)) return Folder // 如果是父节点
  return CollectionTag // 默认叶子节点
}

function formatCount(count: number): string {
  if (count >= 10000) return (count / 10000).toFixed(1) + 'w'
  if (count >= 1000) return (count / 1000).toFixed(1) + 'k'
  return count.toString()
}

function handleNodeClick(data: Category) {
  emit('category-change', data)
}

// 监听选中变化
watch(
  () => props.currentCategoryId,
  (newId) => {
    if (newId && treeRef.value) {
      treeRef.value.setCurrentKey(newId)
    }
  }
)

defineExpose({
  setCurrentKey: (key: string) => treeRef.value?.setCurrentKey(key),
  getCurrentKey: () => treeRef.value?.getCurrentKey()
})
</script>

<style scoped lang="scss">
.category-tree-container {
  width: 100%;
  /* 移除硬边框，保持通透 */
}

/* 骨架屏样式 */
.tree-skeleton {
  padding: 10px;

  .skeleton-item {
    margin-bottom: 16px;
    padding: 0 10px;
  }
}

/* 深度定制 Element Tree */
.premium-tree {
  background: transparent;
  --el-tree-node-content-height: 44px;
  /* 增加行高，更易点击 */
  --el-tree-node-hover-bg-color: transparent;
  /* 禁用默认 hover 背景，使用自定义 */

  :deep(.el-tree-node) {
    white-space: normal;

    .el-tree-node__content {
      border-radius: 12px;
      /* 大圆角 */
      margin-bottom: 4px;
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
      border: 1px solid transparent;
      /* 预留边框位置 */

      /* 展开箭头的微调 */
      .el-tree-node__expand-icon {
        color: #aeb5c0;
        font-size: 14px;
        padding: 6px;

        &.is-leaf {
          color: transparent;
        }
      }

      /* Hover 效果 */
      &:hover {
        background-color: rgba(0, 0, 0, 0.03);
        transform: translateX(4px);
        /* 经典的位移微交互 */
      }
    }

    /* 选中状态 */
    &.is-current>.el-tree-node__content {
      background-color: rgba(64, 158, 255, 0.1);
      /* 柔和的品牌色背景 */
      color: #409eff;
      font-weight: 600;

      .node-icon {
        color: #409eff;
      }

      .node-badge {
        background-color: #fff;
        color: #409eff;
        box-shadow: 0 2px 6px rgba(64, 158, 255, 0.2);
      }
    }
  }
}

/* 自定义节点内容布局 */
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
  width: 100%;
  overflow: hidden;

  .node-main {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
    overflow: hidden;

    .node-icon {
      font-size: 16px;
      color: #909399;
      flex-shrink: 0;
      transition: color 0.3s;

      &.is-folder {
        color: #e6a23c;
        /* 文件夹显示为黄色，更生动 */
      }
    }

    .node-label {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      letter-spacing: 0.3px;
    }
  }

  .node-badge {
    font-size: 12px;
    color: #909399;
    padding: 2px 8px;
    background-color: #f4f4f5;
    border-radius: 20px;
    min-width: 24px;
    text-align: center;
    transition: all 0.3s;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    /* 数字用等宽字体更整齐 */
  }
}

.empty-tree {
  padding: 20px;
  text-align: center;
  color: #c0c4cc;
  font-size: 13px;
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .premium-tree {
    :deep(.el-tree-node) {
      .el-tree-node__content:hover {
        background-color: rgba(255, 255, 255, 0.05);
      }

      &.is-current>.el-tree-node__content {
        background-color: rgba(64, 158, 255, 0.2);

        .node-badge {
          background-color: #1d1e1f;
          color: #409eff;
        }
      }
    }
  }

  .custom-tree-node .node-badge {
    background-color: #262727;
    color: #a3a6ad;
  }
}
</style>
