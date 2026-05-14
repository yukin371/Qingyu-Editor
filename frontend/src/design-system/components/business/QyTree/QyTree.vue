<template>
  <div class="qy-tree">
    <div
      v-for="node in flatData"
      :key="node.id"
      :class="[
        'qy-tree-node',
        { 'qy-tree-node--expanded': expandedKeys.includes(node.id) },
        { 'qy-tree-node--selected': selectedKeys.includes(node.id) },
        { 'qy-tree-node--disabled': node.disabled },
      ]"
      :style="{ paddingLeft: `${(node.level - 1) * 20 + 12}px` }"
      @click="handleNodeClick(node)"
    >
      <!-- Expand/Collapse Icon -->
      <span
        v-if="node.children && node.children.length > 0"
        class="qy-tree-node__expand"
        @click.stop="toggleExpand(node.id)"
      >
        <svg
          :class="[
            'qy-tree-node__arrow',
            { 'qy-tree-node__arrow--expanded': expandedKeys.includes(node.id) },
          ]"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </span>
      <span v-else class="qy-tree-node__expand qy-tree-node__expand--placeholder" />

      <!-- Checkbox -->
      <span v-if="showCheckbox" class="qy-tree-node__checkbox">
        <input
          type="checkbox"
          :checked="checkedKeys.includes(node.id)"
          :disabled="node.disabled"
          @change="handleCheck(node, $event)"
        />
      </span>

      <!-- Label -->
      <span class="qy-tree-node__label">{{ node.label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { TreeNode as TreeNodeType } from './types'

interface Props {
  data?: TreeNodeType[]
  modelValue?: string | number | (string | number)[]
  multiple?: boolean
  checkable?: boolean
  showCheckbox?: boolean
  defaultExpandAll?: boolean
  expandOnClickNode?: boolean
  nodeKey?: string
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  modelValue: undefined,
  multiple: false,
  checkable: false,
  showCheckbox: false,
  defaultExpandAll: false,
  expandOnClickNode: true,
  nodeKey: 'id',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | (string | number)[]]
  change: [value: string | number | (string | number)[]]
  nodeClick: [node: TreeNodeType]
}>()

const expandedKeys = ref<(string | number)[]>([])
const selectedKeys = ref<(string | number)[]>([])
const checkedKeys = ref<(string | number)[]>([])

// Flatten tree data with level info
const flatData = computed(() => {
  const result: Array<TreeNodeType & { level: number }> = []

  const traverse = (nodes: TreeNodeType[], level = 1) => {
    for (const node of nodes) {
      result.push({ ...node, level })

      if (expandedKeys.value.includes(node.id) && node.children) {
        traverse(node.children, level + 1)
      }
    }
  }

  traverse(props.data)
  return result
})

const toggleExpand = (key: string | number) => {
  const index = expandedKeys.value.indexOf(key)
  if (index > -1) {
    expandedKeys.value.splice(index, 1)
  } else {
    expandedKeys.value.push(key)
  }
}

const handleNodeClick = (node: TreeNodeType & { level: number }) => {
  if (node.disabled) return

  if (props.expandOnClickNode && node.children && node.children.length > 0) {
    toggleExpand(node.id)
  }

  // Handle selection
  if (!props.multiple) {
    selectedKeys.value = [node.id]
    emit('update:modelValue', node.id)
    emit('change', node.id)
  } else {
    const index = selectedKeys.value.indexOf(node.id)
    if (index > -1) {
      selectedKeys.value.splice(index, 1)
    } else {
      selectedKeys.value.push(node.id)
    }
    emit('update:modelValue', [...selectedKeys.value])
    emit('change', [...selectedKeys.value])
  }

  emit('nodeClick', node)
}

const handleCheck = (node: TreeNodeType, e: Event) => {
  const target = e.target as HTMLInputElement
  const index = checkedKeys.value.indexOf(node.id)

  if (target.checked && index === -1) {
    checkedKeys.value.push(node.id)
  } else if (!target.checked && index > -1) {
    checkedKeys.value.splice(index, 1)
  }

  emit('update:modelValue', [...checkedKeys.value])
  emit('change', [...checkedKeys.value])
}

// Initialize
if (props.defaultExpandAll) {
  const expandAll = (nodes: TreeNodeType[]) => {
    for (const node of nodes) {
      if (node.children && node.children.length > 0) {
        expandedKeys.value.push(node.id)
        expandAll(node.children)
      }
    }
  }
  expandAll(props.data)
}

watch(
  () => props.modelValue,
  (val) => {
    if (props.multiple && Array.isArray(val)) {
      selectedKeys.value = val
      checkedKeys.value = val
    } else if (val !== undefined && val !== null && !Array.isArray(val)) {
      selectedKeys.value = [val]
    }
  },
  { immediate: true },
)

defineOptions({ name: 'QyTree' })
</script>

<style scoped lang="scss">
// Apple style tree component
// Clean, minimal hierarchical list

.qy-tree {
  padding: 4px 0;
}

.qy-tree-node {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;

  &:hover:not(.qy-tree-node--disabled) {
    background: var(--editor-layer-soft, #f5f5f7);
  }

  &--selected {
    background: color-mix(in srgb, var(--editor-accent, #007aff) 12%, var(--editor-layer-panel, #fff) 88%) !important;
    color: var(--editor-accent, #007aff);
  }

  &--disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &__expand {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    flex-shrink: 0;

    &--placeholder {
      visibility: hidden;
    }
  }

  &__arrow {
    color: #6e6e73;
    transition: transform 0.2s ease;

    &--expanded {
      transform: rotate(90deg);
    }
  }

  &__checkbox {
    display: flex;
    align-items: center;

    input[type='checkbox'] {
      width: 16px;
      height: 16px;
      accent-color: #007aff;
      cursor: pointer;
    }
  }

  &__label {
    flex: 1;
    font-size: 14px;
    color: #1d1d1f;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
