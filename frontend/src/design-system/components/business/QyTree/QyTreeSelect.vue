<template>
  <div
    ref="containerRef"
    :class="['qy-tree-select', `qy-tree-select--${size}`, { 'qy-tree-select--disabled': disabled }]"
  >
    <!-- Trigger -->
    <div class="qy-tree-select__trigger" @click="toggleDropdown">
      <span class="qy-tree-select__value">
        {{ displayValue || placeholder }}
      </span>
      <span class="qy-tree-select__icon">
        <svg
          :class="['qy-tree-select__arrow', { 'qy-tree-select__arrow--open': isOpen }]"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </span>
    </div>

    <!-- Dropdown -->
    <Transition name="select-fade">
      <div v-if="isOpen && !disabled" class="qy-tree-select__dropdown">
        <QyTree
          :data="data"
          :model-value="modelValue ?? undefined"
          :multiple="multiple"
          :show-checkbox="showCheckbox"
          :node-key="nodeKey"
          @node-click="handleSelect"
        />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import QyTree from './QyTree.vue'
import type { TreeNode, TreeSelectProps } from './types'

const props = withDefaults(defineProps<TreeSelectProps>(), {
  data: () => [],
  modelValue: null,
  placeholder: '请选择',
  size: 'default',
  disabled: false,
  multiple: false,
  clearable: false,
  showCheckbox: false,
  nodeKey: 'id',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | (string | number)[] | null]
  change: [value: string | number | (string | number)[] | null]
}>()

const isOpen = ref(false)
const containerRef = ref<HTMLElement>()

const displayValue = computed(() => {
  if (!props.modelValue) return ''

  if (Array.isArray(props.modelValue)) {
    return props.modelValue
      .map((value) => findNode(props.data, value)?.label)
      .filter((label): label is string => !!label)
      .join(', ')
  }

  const selected = findNode(props.data, props.modelValue)
  return selected?.label || ''
})

const findNode = (nodes: TreeNode[], id: string | number): TreeNode | null => {
  for (const node of nodes) {
    if (node.id === id) return node
    if (node.children) {
      const found = findNode(node.children, id)
      if (found) return found
    }
  }
  return null
}

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const handleSelect = (node: TreeNode) => {
  if (props.multiple) return

  emit('update:modelValue', node.id)
  emit('change', node.id)
  isOpen.value = false
}

// Close on click outside
const handleClickOutside = (e: MouseEvent) => {
  if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

defineOptions({ name: 'QyTreeSelect' })
</script>

<style scoped lang="scss">
// Apple style tree select
// Clean dropdown with tree inside

.qy-tree-select {
  position: relative;
  display: inline-block;
  min-width: 200px;

  &__trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 0 14px;
    height: 40px;
    background: #fff;
    border: 1px solid #d1d1d6;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      border-color: #007aff;
    }
  }

  &__value {
    flex: 1;
    font-size: 14px;
    color: #1d1d1f;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    &::placeholder {
      color: #c7c7cc;
    }
  }

  &__icon {
    display: flex;
    color: #6e6e73;
  }

  &__arrow {
    transition: transform 0.2s ease;

    &--open {
      transform: rotate(180deg);
    }
  }

  &__dropdown {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    right: 0;
    z-index: 1000;
    min-width: 240px;
    max-height: 320px;
    overflow-y: auto;
    background: #fff;
    border-radius: 12px;
    box-shadow:
      0 10px 40px rgba(0, 0, 0, 0.15),
      0 0 1px rgba(0, 0, 0, 0.1);
    padding: 8px;
  }

  // Size variants
  &--small {
    .qy-tree-select__trigger {
      height: 32px;
      padding: 0 10px;
      border-radius: 8px;
    }

    .qy-tree-select__value {
      font-size: 13px;
    }
  }

  &--large {
    .qy-tree-select__trigger {
      height: 48px;
      padding: 0 18px;
      border-radius: 12px;
    }

    .qy-tree-select__value {
      font-size: 16px;
    }
  }

  &--disabled {
    opacity: 0.5;
    pointer-events: none;
  }
}

// Transitions
.select-fade-enter-active,
.select-fade-leave-active {
  transition: all 0.2s ease;
}

.select-fade-enter-from,
.select-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
