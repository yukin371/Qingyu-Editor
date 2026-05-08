<template>
  <!-- 固定定位遮罩 -->
  <Transition name="fade">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      @click="handleCancel"
    />
  </Transition>

  <!-- 居中对话框 -->
  <Transition name="zoom">
    <div
      v-if="modelValue"
      class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-hidden flex flex-col"
      role="dialog"
      aria-labelledby="dialog-title"
      aria-modal="true"
    >
      <!-- 标题栏 -->
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 id="dialog-title" class="text-lg font-semibold text-gray-900">选择目标位置</h3>
      </div>

      <!-- 内容区 -->
      <div class="p-6 flex-1 overflow-y-auto space-y-6">
        <!-- 目标父节点选择 -->
        <div>
          <label for="target-tree" class="block text-sm font-medium text-gray-700 mb-2">移动到</label>
          <div class="relative">
            <el-tree
              ref="treeRef"
              :data="filteredTreeData"
              :props="treeProps"
              :highlight-current="true"
              :expand-on-click-node="false"
              :default-expand-all="false"
              node-key="id"
              empty-text="暂无可用位置"
              id="target-tree"
              role="tree"
              aria-label="目标位置树"
              @node-click="handleNodeClick"
            >
              <template #default="{ data }">
                <div class="custom-tree-node">
                  <!-- 图标区分：卷用文件夹，章用文档 -->
                  <svg v-if="data.type === DocumentType.VOLUME" class="w-5 h-5 text-amber-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                  </svg>
                  <svg v-else class="w-5 h-5 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd" />
                  </svg>
                  <span class="node-title" :title="data.title">
                    {{ data.title }}
                  </span>
                </div>
              </template>
            </el-tree>
          </div>
          <p v-if="selectedParentId" class="mt-2 text-sm text-gray-600">
            已选择：<span class="font-medium text-gray-900">{{ selectedNodeTitle }}</span>
          </p>
        </div>

        <!-- 插入位置选择 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">插入位置</label>
          <div class="flex gap-2" role="radiogroup" aria-label="插入位置选择">
            <button
              :class="position === 'before' ? 'bg-secondary-500 text-white border-secondary-500' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'"
              @click="position = 'before'"
              class="flex-1 px-4 py-2 rounded border transition-colors text-sm font-medium"
              type="button"
              role="radio"
              :aria-checked="position === 'before'"
              aria-label="插入到目标节点之前"
            >
              之前
            </button>
            <button
              :class="position === 'inner' ? 'bg-secondary-500 text-white border-secondary-500' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'"
              @click="position = 'inner'"
              class="flex-1 px-4 py-2 rounded border transition-colors text-sm font-medium"
              type="button"
              role="radio"
              :aria-checked="position === 'inner'"
              aria-label="插入到目标节点内部"
            >
              内部
            </button>
            <button
              :class="position === 'after' ? 'bg-secondary-500 text-white border-secondary-500' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'"
              @click="position = 'after'"
              class="flex-1 px-4 py-2 rounded border transition-colors text-sm font-medium"
              type="button"
              role="radio"
              :aria-checked="position === 'after'"
              aria-label="插入到目标节点之后"
            >
              之后
            </button>
          </div>
          <p class="mt-2 text-sm text-gray-600" role="status" aria-live="polite">
            {{ positionDescription }}
          </p>
        </div>
      </div>

      <!-- 底部按钮区 -->
      <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
        <button
          type="button"
          class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
          @click="handleCancel"
        >
          取消
        </button>
        <button
          type="button"
          :disabled="!selectedParentId"
          class="px-4 py-2 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          @click="handleConfirm"
        >
          移动
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElTree } from 'element-plus'
import type { Document } from '@/modules/writer/types/document'
import { DocumentType } from '@/modules/writer/types/document'

// =======================
// Props & Emits
// =======================
interface Props {
  modelValue: boolean
  treeData: Document[]
  currentDocumentId?: string
}

const props = withDefaults(defineProps<Props>(), {
  currentDocumentId: ''
})

interface Emits {
  'update:modelValue': [value: boolean]
  'confirm': [payload: { targetParentId: string | null, position: 'before' | 'inner' | 'after' }]
  'cancel': []
}

const emit = defineEmits<Emits>()

// =======================
// State
// =======================
const treeRef = ref<InstanceType<typeof ElTree>>()
const selectedParentId = ref<string | null>(null)
const position = ref<'before' | 'inner' | 'after'>('inner')

// 树配置
const treeProps = {
  children: 'children',
  label: 'title'
}

// =======================
// Methods
// =======================
/**
 * 递归查找节点
 * @param nodes 节点数组
 * @param id 要查找的节点ID
 * @returns 找到的节点或null
 */
function findNodeById(nodes: Document[], id: string): Document | null {
  for (const node of nodes) {
    if (node.id === id) return node
    if (node.children) {
      const found = findNodeById(node.children, id)
      if (found) return found
    }
  }
  return null
}

// =======================
// Computed
// =======================
/**
 * 过滤后的树数据
 * 排除当前文档及其子节点
 */
const filteredTreeData = computed(() => {
  if (!props.currentDocumentId) {
    return props.treeData
  }

  // 递归过滤函数
  const filterTree = (nodes: Document[]): Document[] => {
    return nodes
      .filter(node => node.id !== props.currentDocumentId)
      .map(node => ({
        ...node,
        children: node.children ? filterTree(node.children) : undefined
      }))
  }

  return filterTree(props.treeData)
})

/**
 * 获取选中节点的标题
 */
const selectedNodeTitle = computed(() => {
  if (!selectedParentId.value) return ''

  const node = findNodeById(props.treeData, selectedParentId.value)
  return node?.title || ''
})

/**
 * 位置描述
 */
const positionDescription = computed(() => {
  const descriptions = {
    before: '将文档插入到目标节点的同级前面',
    inner: '将文档作为目标节点的子文档',
    after: '将文档插入到目标节点的同级后面'
  }
  return descriptions[position.value]
})

// =======================
// Methods
// =======================
/**
 * 处理节点点击
 */
function handleNodeClick(data: Document): void {
  // 只允许选择volume类型的节点作为inner位置
  if (position.value === 'inner' && data.type !== DocumentType.VOLUME) {
    return
  }
  selectedParentId.value = data.id
}

/**
 * 处理确认
 */
function handleConfirm(): void {
  if (!selectedParentId.value) {
    return
  }

  emit('confirm', {
    targetParentId: selectedParentId.value,
    position: position.value
  })

  // 重置状态
  selectedParentId.value = null
  position.value = 'inner'
}

/**
 * 处理取消
 */
function handleCancel(): void {
  emit('cancel')
  emit('update:modelValue', false)

  // 重置状态
  selectedParentId.value = null
  position.value = 'inner'
}

/**
 * 重置选中状态
 */
function resetSelection(): void {
  selectedParentId.value = null
  position.value = 'inner'
  treeRef.value?.setCurrentKey(undefined)
}

// =======================
// Watch
// =======================
/**
 * 监听对话框显示状态，重置选择
 */
watch(() => props.modelValue, (newVal) => {
  if (!newVal) {
    resetSelection()
  }
})

/**
 * 监听位置变化，如果是inner位置，检查选中的节点是否是volume类型
 */
watch(position, (newPos) => {
  if (newPos === 'inner' && selectedParentId.value) {
    const node = findNodeById(props.treeData, selectedParentId.value)
    if (node && node.type !== DocumentType.VOLUME) {
      // 如果选中的不是volume类型，切换到after位置并清除选择
      position.value = 'after'
      selectedParentId.value = null
      treeRef.value?.setCurrentKey(undefined)
    }
  }
})
</script>

<style scoped>
/* 淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 缩放动画 */
.zoom-enter-active,
.zoom-leave-active {
  transition: all 0.3s ease;
}

.zoom-enter-from,
.zoom-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.9);
}

/* 自定义树节点样式 */
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  font-size: 14px;
  overflow: hidden;
}

.custom-tree-node .node-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 覆盖 Element Tree 样式 */
:deep(.el-tree-node__content) {
  height: 36px;
  border-radius: 4px;
  margin: 0 4px;

  &:hover {
    background-color: var(--el-fill-color-light);
  }
}

:deep(.el-tree--highlight-current .el-tree-node.is-current > .el-tree-node__content) {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  font-weight: 500;
}

:deep(.el-tree-node__content:hover) {
  background-color: var(--el-fill-color-light);
}
</style>
