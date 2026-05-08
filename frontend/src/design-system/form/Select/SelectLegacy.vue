<script setup lang="ts">
/**
 * Select 选择器组件
 *
 * 功能完整的下拉选择组件，支持单选、多选、可搜索、可清空等特性
 */

import { computed, ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../../utils/cn'
import type { SelectProps, SelectEmits, SelectSlots, SelectOption } from './types-legacy'

// 使用 CVA 定义 Select 变体
const selectVariants = cva(
  // 基础样式
  'relative flex items-center justify-between w-full rounded-md border border-input bg-background text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      size: {
        sm: 'h-8 px-2 py-1 text-xs',
        md: 'h-10 px-3 py-2 text-sm',
        lg: 'h-12 px-4 py-3 text-base',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
)

// 组件 Props
const props = withDefaults(defineProps<SelectProps>(), {
  placeholder: '请选择',
  disabled: false,
  clearable: false,
  multiple: false,
  filterable: false,
  size: 'md',
  loading: false,
  remote: false,
  popperMaxHeight: 200,
  options: () => [],
})

// 组件 Emits
const emit = defineEmits<SelectEmits>()

// 组件 Slots
const slots = defineSlots<SelectSlots>()

// 状态管理
const isDropdownVisible = ref(false)
const searchText = ref('')
const selectRef = ref<HTMLElement>()
const inputRef = ref<HTMLInputElement>()
const dropdownRef = ref<HTMLElement>()
const dropdownStyle = ref<Record<string, string>>({})

// 计算样式类名
const classes = computed(() =>
  cn(
    selectVariants({
      size: props.size,
    }),
    props.class,
    {
      'cursor-pointer': !props.disabled,
      'cursor-not-allowed': props.disabled,
    }
  )
)

// 计算当前选中的选项
const selectedOptions = computed(() => {
  if (!props.modelValue) return []
  
  if (props.multiple) {
    const values = Array.isArray(props.modelValue) ? props.modelValue : [props.modelValue]
    return props.options?.filter(opt => values.includes(opt.value)) || []
  } else {
    return props.options?.filter(opt => opt.value === props.modelValue) || []
  }
})

// 计算显示文本
const displayText = computed(() => {
  if (props.multiple) {
    return selectedOptions.value.map(opt => opt.label).join(', ')
  } else {
    return selectedOptions.value.length > 0 ? selectedOptions.value[0].label : ''
  }
})

// 计算是否有值
const hasValue = computed(() => {
  if (props.multiple) {
    return Array.isArray(props.modelValue) && props.modelValue.length > 0
  }
  return props.modelValue !== undefined && props.modelValue !== ''
})

// 计算是否显示清空按钮
const showClear = computed(() => {
  return props.clearable && hasValue.value && !props.disabled
})

// 计算过滤后的选项
const filteredOptions = computed(() => {
  if (!props.filterable || !searchText.value) {
    return props.options || []
  }
  
  const query = searchText.value.toLowerCase()
  return (props.options || []).filter(opt => 
    opt.label.toLowerCase().includes(query)
  )
})

// 处理下拉框显示/隐藏
const handleToggleDropdown = () => {
  if (props.disabled) return
  
  isDropdownVisible.value = !isDropdownVisible.value
  emit('visibleChange', isDropdownVisible.value)
  
  if (isDropdownVisible.value) {
    nextTick(() => {
      updateDropdownPosition()
      inputRef.value?.focus()
    })
  }
}

const updateDropdownPosition = () => {
  if (!selectRef.value) return
  const rect = selectRef.value.getBoundingClientRect()
  dropdownStyle.value = {
    position: 'fixed',
    top: `${rect.bottom + 4}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    zIndex: '9999'
  }
}

// 处理选项选择
const handleSelectOption = (option: SelectOption) => {
  if (option.disabled) return
  
  if (props.multiple) {
    const values = Array.isArray(props.modelValue) ? [...props.modelValue] : []
    const index = values.indexOf(option.value)
    
    if (index > -1) {
      values.splice(index, 1)
    } else {
      values.push(option.value)
    }
    
    emit('update:modelValue', values)
    emit('change', values)
  } else {
    emit('update:modelValue', option.value)
    emit('change', option.value)
    isDropdownVisible.value = false
  }
}

// 处理清空
const handleClear = (event: MouseEvent) => {
  event.stopPropagation()
  
  if (props.multiple) {
    emit('update:modelValue', [])
    emit('change', [])
  } else {
    emit('update:modelValue', undefined)
    emit('change', undefined)
  }
  
  emit('clear')
  searchText.value = ''
}

// 处理搜索
const handleSearch = (event: Event) => {
  const target = event.target as HTMLInputElement
  searchText.value = target.value
  
  if (props.remote && props.remoteMethod) {
    props.remoteMethod(target.value)
  }
}

// 处理焦点事件
const handleFocus = (event: FocusEvent) => {
  emit('focus', event)
}

const handleBlur = (event: FocusEvent) => {
  emit('blur', event)
}

// 处理多选标签关闭
const handleTagClose = (option: SelectOption, event: MouseEvent) => {
  event.stopPropagation()
  
  if (props.multiple && Array.isArray(props.modelValue)) {
    const values = [...props.modelValue]
    const index = values.indexOf(option.value)
    
    if (index > -1) {
      values.splice(index, 1)
      emit('update:modelValue', values)
      emit('change', values)
    }
  }
}

// 点击外部关闭下拉框
const handleClickOutside = (event: MouseEvent) => {
  if (!isDropdownVisible.value) return
  
  const target = event.target as Node
  if (
    selectRef.value &&
    !selectRef.value.contains(target) &&
    dropdownRef.value &&
    !dropdownRef.value.contains(target)
  ) {
    isDropdownVisible.value = false
  }
}

// 监听全局点击事件
watch(isDropdownVisible, (newValue) => {
  if (newValue) {
    nextTick(() => {
      updateDropdownPosition()
      document.addEventListener('click', handleClickOutside as any, true)
    })
  } else {
    document.removeEventListener('click', handleClickOutside as any, true)
  }
})

// 监听键盘事件
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    isDropdownVisible.value = false
  } else if (event.key === 'Enter' && isDropdownVisible.value) {
    event.preventDefault()
  }
}

// 监听 modelValue 变化，清空搜索文本
watch(() => props.modelValue, () => {
  if (!props.multiple) {
    searchText.value = ''
  }
})

const handleViewportChange = () => {
  if (isDropdownVisible.value) {
    updateDropdownPosition()
  }
}

onMounted(() => {
  window.addEventListener('resize', handleViewportChange)
  window.addEventListener('scroll', handleViewportChange, true)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleViewportChange)
  window.removeEventListener('scroll', handleViewportChange, true)
  document.removeEventListener('click', handleClickOutside as any, true)
})

// 暴露方法
defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
})

// 创建一个空的 MouseEvent 用于 slot 中的 handleClose
const createEmptyMouseEvent = (): MouseEvent => {
  return new MouseEvent('click')
}
</script>

<template>
  <div 
    ref="selectRef"
    :class="classes"
    role="combobox"
    :aria-expanded="isDropdownVisible"
    :aria-disabled="disabled"
    :tabindex="disabled ? -1 : 0"
    @click="handleToggleDropdown"
    @keydown="handleKeydown"

  >
    <!-- 前缀插槽 -->
    <span v-if="$slots.prefix" class="mr-2">
      <slot name="prefix" />
    </span>

    <!-- 选择值显示区域 -->
    <div class="flex-1 overflow-hidden">
      <!-- 多选标签显示 -->
      <div v-if="multiple && selectedOptions.length > 0" class="flex flex-wrap gap-1">
        <span
          v-for="(option, index) in selectedOptions"
          :key="option.value"
          class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary-100 text-primary-700 text-xs"
        >
          <slot v-if="$slots.tag" name="tag" :option="option" :index="index" :handleClose="(e?: MouseEvent) => handleTagClose(option, e || createEmptyMouseEvent())" />
          <template v-else>
            {{ option.label }}
            <button
              type="button"
              class="hover:text-primary-900"
              @click="handleTagClose(option, $event as MouseEvent)"
            >
              <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </template>
        </span>
      </div>

      <!-- 单选文本显示 -->
      <span v-else-if="!multiple && displayText" class="block truncate">
        {{ displayText }}
      </span>

      <!-- 占位符 -->
      <span v-else class="text-muted-foreground">
        {{ placeholder }}
      </span>
    </div>

    <!-- 搜索输入框 -->
    <input
      v-if="filterable && isDropdownVisible"
      ref="inputRef"
      :value="searchText"
      @input="handleSearch"
      @focus="handleFocus"
      @blur="handleBlur"
      class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
    />

    <!-- 清空按钮 -->
    <button
      v-if="showClear"
      type="button"
      class="ml-2 text-muted-foreground hover:text-foreground"
      @click="handleClear"
    >
      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>

    <!-- 箭头图标 -->
    <svg
      v-if="!showClear"
      class="ml-2 h-4 w-4 transition-transform"
      :class="{ 'rotate-180': isDropdownVisible }"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
    </svg>

    <!-- 下拉菜单 -->
    <Teleport to="body">
      <div
        v-if="isDropdownVisible"
        ref="dropdownRef"
        class="overflow-hidden rounded-md border border-gray-200 bg-white text-gray-800 shadow-md"
        :style="{
          ...dropdownStyle,
          maxHeight: `${popperMaxHeight}px`,
          overflowY: 'auto',
        }"
      >
        <!-- 加载状态 -->
        <div v-if="loading" class="flex items-center justify-center py-4">
          <slot name="loading">
            <svg class="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </slot>
        </div>

        <!-- 空状态 -->
        <div v-else-if="filteredOptions.length === 0" class="py-4 text-center text-sm text-muted-foreground">
          <slot name="empty">
            暂无数据
          </slot>
        </div>

        <!-- 选项列表 -->
        <ul v-else class="max-h-[200px] overflow-y-auto">
          <li
            v-for="(option, index) in filteredOptions"
            :key="option.value"
            class="relative flex cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm outline-none bg-white hover:bg-slate-100 hover:text-slate-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
            :class="{
              'bg-blue-50 text-blue-700': selectedOptions.some(o => o.value === option.value),
              'opacity-50 cursor-not-allowed': option.disabled,
            }"
            @click="handleSelectOption(option)"
          >
            <!-- 自定义选项内容 -->
            <slot v-if="$slots.default" name="default" :option="option" :index="index" />
            <!-- 默认选项内容 -->
            <template v-else>
              <span class="flex-1 truncate">{{ option.label }}</span>
              <!-- 选中标记 -->
              <svg
                v-if="selectedOptions.some(o => o.value === option.value)"
                class="h-4 w-4 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </template>
          </li>
        </ul>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
/* 自定义滚动条样式 */
:deep(.overflow-y-auto)::-webkit-scrollbar {
  width: 6px;
}

:deep(.overflow-y-auto)::-webkit-scrollbar-track {
  background: transparent;
}

:deep(.overflow-y-auto)::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

:deep(.overflow-y-auto)::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
