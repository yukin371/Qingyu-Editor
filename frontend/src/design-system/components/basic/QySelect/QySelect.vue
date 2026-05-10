<script setup lang="ts">
/**
 * QySelect 选择器组件
 *
 * Qingyu 风格的下拉选择组件，支持单选、多选、可搜索、可清空等特性
 * 与历史选择器 API 保持兼容
 */

import { computed, ref, nextTick, onMounted, onUnmounted } from 'vue'
import { cn } from '@/design-system/utils/cn'
import { selectVariants } from './variants'
import type { QySelectProps, QySelectEmits, QySelectSlots, QySelectOption } from './types'

// 组件 Props
const props = withDefaults(defineProps<QySelectProps>(), {
  placeholder: '请选择',
  disabled: false,
  clearable: false,
  multiple: false,
  filterable: false,
  size: 'md',
  state: 'default',
  loading: false,
  remote: false,
  popperMaxHeight: 200,
  options: () => [],
})

// 组件 Emits
const emit = defineEmits<QySelectEmits>()

// 组件 Slots
const slots = defineSlots<QySelectSlots>()

// 状态管理
const isDropdownVisible = ref(false)
const searchText = ref('')
const selectRef = ref<HTMLElement>()
const inputRef = ref<HTMLInputElement>()
const dropdownRef = ref<HTMLElement>()
const highlightedIndex = ref(-1)
const dropdownPosition = ref({ top: 0, left: 0, width: 0 })

// 过滤后的选项
const filteredOptions = computed(() => {
  if (!props.filterable || !searchText.value) {
    return props.options || []
  }
  
  const query = searchText.value.toLowerCase()
  return (props.options || []).filter(option => 
    option.label.toLowerCase().includes(query)
  )
})

// 计算当前选中的选项
const selectedOptions = computed(() => {
  if (!props.modelValue && props.modelValue !== 0 && props.modelValue !== false) return []
  
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

// 计算样式类名
const selectClasses = computed(() => {
  return cn(
    selectVariants({
      size: props.size,
      state: props.state
    }),
    props.class
  )
})

// 下拉菜单样式类名
const dropdownClasses = computed(() => {
  return cn(
    'fixed z-50 bg-white rounded-xl shadow-lg border border-slate-200/80',
    'max-h-[200px] overflow-y-auto',
    'animate-in fade-in zoom-in-95 duration-200'
  )
})

// 更新下拉菜单位置
const updateDropdownPosition = () => {
  if (selectRef.value) {
    const rect = selectRef.value.getBoundingClientRect()
    dropdownPosition.value = {
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width
    }
  }
}

// 切换下拉菜单
const toggleDropdown = () => {
  if (props.disabled) return
  isDropdownVisible.value = !isDropdownVisible.value
  emit('visibleChange', isDropdownVisible.value)

  if (isDropdownVisible.value) {
    updateDropdownPosition()
  }
  
  if (isDropdownVisible.value) {
    nextTick(() => {
      if (inputRef.value) {
        inputRef.value.focus()
      }
    })
  }
}

// 关闭下拉菜单
const closeDropdown = () => {
  isDropdownVisible.value = false
  searchText.value = ''
  highlightedIndex.value = -1
  emit('visibleChange', false)
}

// 处理选项选择
const handleSelect = (option: QySelectOption) => {
  if (option.disabled) return
  
  if (props.multiple) {
    const values = Array.isArray(props.modelValue) ? [...props.modelValue] : []
    const index = values.findIndex(v => v === option.value)
    
    if (index === -1) {
      values.push(option.value)
    } else {
      values.splice(index, 1)
    }
    
    emit('update:modelValue', values)
    emit('change', values)
  } else {
    emit('update:modelValue', option.value)
    emit('change', option.value)
    closeDropdown()
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
}

// 处理搜索
const handleSearch = (event: Event) => {
  const target = event.target as HTMLInputElement
  searchText.value = target.value
  
  if (props.remote && props.remoteMethod) {
    props.remoteMethod(target.value)
  }
}

// 处理键盘导航
const handleKeydown = (event: KeyboardEvent) => {
  if (!isDropdownVisible.value) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      toggleDropdown()
    }
    return
  }
  
  const options = filteredOptions.value.filter(opt => !opt.disabled)
  
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      highlightedIndex.value = Math.min(highlightedIndex.value + 1, options.length - 1)
      break
    case 'ArrowUp':
      event.preventDefault()
      highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0)
      break
    case 'Enter':
      event.preventDefault()
      if (highlightedIndex.value >= 0 && options[highlightedIndex.value]) {
        handleSelect(options[highlightedIndex.value])
      }
      break
    case 'Escape':
      event.preventDefault()
      closeDropdown()
      break
  }
}

// 处理焦点事件
const handleFocus = (event: FocusEvent) => {
  emit('focus', event)
}

const handleBlur = (event: FocusEvent) => {
  // 延迟关闭，以允许点击选项
  setTimeout(() => {
    if (!selectRef.value?.contains(document.activeElement)) {
      closeDropdown()
    }
  }, 200)
  
  emit('blur', event)
}

// 点击外部关闭
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node
  if (
    selectRef.value && !selectRef.value.contains(target) &&
    dropdownRef.value && !dropdownRef.value.contains(target)
  ) {
    closeDropdown()
  }
}

// 更新位置（响应滚动和窗口大小变化）
const updatePosition = () => {
  if (isDropdownVisible.value) updateDropdownPosition()
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('scroll', updatePosition, true)
  window.addEventListener('resize', updatePosition)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('scroll', updatePosition, true)
  window.removeEventListener('resize', updatePosition)
})

// 暴露方法
defineExpose({
  selectRef,
  dropdownRef,
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
})
</script>

<template>
  <div
    ref="selectRef"
    :class="selectClasses"
    @click="toggleDropdown"
  >
    <!-- 选中的值显示 -->
    <div class="flex-1 truncate">
      <span v-if="!hasValue" class="text-slate-400">
        {{ placeholder }}
      </span>
      <span v-else class="text-slate-700">
        {{ displayText }}
      </span>
    </div>
    
    <!-- 前缀插槽 -->
    <div v-if="slots.prefix" class="mr-2">
      <slot name="prefix" />
    </div>
    
    <!-- 搜索输入框（可搜索时显示） -->
    <input
      v-if="filterable && isDropdownVisible"
      ref="inputRef"
      :value="searchText"
      type="text"
      class="absolute inset-0 w-full h-full px-3 py-2 bg-transparent outline-none"
      @input="handleSearch"
      @keydown="handleKeydown"
      @focus="handleFocus"
      @blur="handleBlur"
      @click.stop
    />
    
    <!-- 清空按钮 -->
    <button
      v-if="showClear"
      class="ml-2 p-1 hover:bg-slate-100 rounded transition-colors"
      @click="handleClear"
    >
      <svg class="w-4 h-4 text-slate-400 hover:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
    
    <!-- 下拉箭头 -->
    <svg
      v-else
      class="w-4 h-4 text-slate-400 transition-transform duration-200 ml-2"
      :class="{ 'rotate-180': isDropdownVisible }"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
    </svg>
    
    <!-- 下拉菜单 -->
    <Teleport to="body">
      <div
        v-if="isDropdownVisible"
        ref="dropdownRef"
        :class="dropdownClasses"
        :style="{
          top: `${dropdownPosition.top}px`,
          left: `${dropdownPosition.left}px`,
          width: `${dropdownPosition.width}px`,
          maxHeight: `${popperMaxHeight}px`
        }"
      >
        <!-- 加载状态 -->
        <div v-if="loading" class="px-3 py-4 text-center text-slate-500">
          <slot name="loading">
            <svg class="animate-spin h-5 w-5 mx-auto text-primary-600" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </slot>
        </div>
        
        <!-- 空状态 -->
        <div v-else-if="filteredOptions.length === 0" class="px-3 py-4 text-center text-slate-500">
          <slot name="empty">
            暂无数据
          </slot>
        </div>
        
        <!-- 选项列表 -->
        <div
          v-for="(option, index) in filteredOptions"
          :key="index"
          :class="[
            'px-3 py-2 cursor-pointer transition-colors duration-150',
            'flex items-center justify-between',
            option.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-50',
            highlightedIndex === index ? 'bg-primary-50' : '',
            selectedOptions.some(o => o.value === option.value) ? 'bg-primary-100 text-primary-700' : 'text-slate-700'
          ]"
          @click="handleSelect(option)"
        >
          <!-- 默认选项内容 -->
          <span v-if="!slots.default">{{ option.label }}</span>
          <slot v-else name="default" :option="option" :index="index" />
          
          <!-- 选中标记 -->
          <svg
            v-if="selectedOptions.some(o => o.value === option.value)"
            class="w-4 h-4 text-primary-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
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
  background: #f1f5f9;
  border-radius: 3px;
}

:deep(.overflow-y-auto)::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

:deep(.overflow-y-auto)::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
