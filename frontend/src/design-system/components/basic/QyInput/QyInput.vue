<template>
  <div class="qy-input-wrapper" :class="{ 'qy-input-wrapper--focused': isFocused }">
    <!-- 前置插槽 -->
    <div v-if="prepend" class="qy-input__prepend">
      {{ prepend }}
    </div>

    <div class="qy-input__container relative">
      <!-- 前置图标 -->
      <span
        v-if="prefixIcon"
        class="qy-input__icon qy-input__icon--prefix"
        v-html="prefixIcon"
      ></span>

      <!-- 输入框 -->
      <input
        ref="inputRef"
        :type="currentType"
        :class="['qy-input__field', inputClasses]"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :value="modelValue"
        :maxlength="maxlength"
        :minlength="minlength"
        :name="name"
        :id="id"
        :autocomplete="autocomplete"
        :required="required"
        @input="handleInput"
        @change="handleChange"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeydown"
        @keyup="handleKeyup"
      />

      <!-- 后置图标区域 -->
      <div v-if="hasSuffix" class="qy-input__suffix">
        <!-- 清空按钮 -->
        <button
          v-if="clearable && hasValue && !disabled"
          type="button"
          class="qy-input__clear"
          @click="handleClear"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <!-- 密码显示切换 -->
        <button
          v-if="type === 'password' && showPassword"
          type="button"
          class="qy-input__password-toggle"
          @click="togglePasswordVisibility"
        >
          <svg
            v-if="showPasswordVisible"
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
            />
          </svg>
        </button>

        <!-- 后置图标 -->
        <span
          v-if="suffixIcon"
          class="qy-input__icon qy-input__icon--suffix"
          v-html="suffixIcon"
        ></span>
      </div>
    </div>

    <!-- 后置插槽 -->
    <div v-if="append" class="qy-input__append">
      {{ append }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { cn } from '@/design-system/utils/cn'
import { inputVariants } from './variants'
import type { QyInputProps, QyInputEmits } from './types'

// Props
const props = withDefaults(defineProps<QyInputProps>(), {
  type: 'text',
  size: 'md',
  state: 'default',
  disabled: false,
  readonly: false,
  clearable: false,
  showPassword: true,
})

// Emits
const emit = defineEmits<QyInputEmits>()

// Refs
const inputRef = ref<HTMLInputElement>()
const showPasswordVisible = ref(false)
const isFocused = ref(false)

// 计算当前输入类型（密码显示切换）
const currentType = computed(() => {
  if (props.type === 'password' && props.showPassword && showPasswordVisible.value) {
    return 'text'
  }
  return props.type
})

// 计算是否有值
const hasValue = computed(() => {
  return props.modelValue !== undefined && props.modelValue !== ''
})

// 计算是否有后置内容
const hasSuffix = computed(() => {
  return props.clearable || (props.type === 'password' && props.showPassword) || props.suffixIcon
})

// 计算输入框类名
const inputClasses = computed(() => {
  return cn(
    inputVariants({
      size: props.size,
      state: props.disabled ? 'disabled' : props.state,
    }),
    {
      'pl-11': props.prefixIcon,
      'pr-12': hasSuffix.value,
    },
    props.class,
  )
})

// 切换密码可见性
const togglePasswordVisibility = () => {
  showPasswordVisible.value = !showPasswordVisible.value
}

// 处理输入事件
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  let value: string | number = target.value

  // 数字类型转换
  if (props.type === 'number' && value !== '') {
    value = Number(value)
  }

  emit('update:modelValue', value)
  emit('input', value)
}

// 处理变更事件
const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  let value: string | number = target.value

  if (props.type === 'number' && value !== '') {
    value = Number(value)
  }

  emit('change', value)
}

// 处理焦点事件
const handleFocus = (event: FocusEvent) => {
  isFocused.value = true
  emit('focus', event)
}

// 处理失焦事件
const handleBlur = (event: FocusEvent) => {
  isFocused.value = false
  emit('blur', event)
}

// 处理清空
const handleClear = () => {
  emit('update:modelValue', '')
  emit('clear')
  inputRef.value?.focus()
}

// 处理键盘事件
const handleKeydown = (event: KeyboardEvent) => {
  emit('keydown', event)
}

// 处理按键抬起事件
const handleKeyup = (event: KeyboardEvent) => {
  emit('keyup', event)
}

// 暴露方法
defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
  select: () => inputRef.value?.select(),
  getText: () => inputRef.value?.value || '',
})
</script>

<style scoped>
.qy-input-wrapper {
  display: flex;
  width: 100%;
}

.qy-input__container {
  position: relative;
  flex: 1;
}

.qy-input__prepend,
.qy-input__append {
  display: inline-flex;
  align-items: center;
  padding: 0 1rem;
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--editor-layer-soft, rgb(248 250 252 / 0.94)) 94%, transparent) 0%,
    color-mix(in srgb, var(--editor-layer-panel, rgb(241 245 249 / 0.98)) 98%, transparent) 100%
  );
  border: 1px solid color-mix(in srgb, var(--editor-border, rgb(226 232 240 / 0.95)) 82%, transparent);
  color: var(--editor-text-muted, rgb(100 116 139));
  box-shadow: inset 0 1px 0 color-mix(in srgb, var(--editor-bg-elevated, #fff) 80%, transparent);
  font-size: 0.875rem;
  white-space: nowrap;
}

.qy-input__prepend {
  border-radius: 0.75rem 0 0 0.75rem;
  border-right: none;
}

.qy-input__append {
  border-radius: 0 0.75rem 0.75rem 0;
  border-left: none;
}

.qy-input__icon {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  width: 1rem;
  height: 1rem;
  color: var(--editor-text-ghost, rgb(148 163 184));
  pointer-events: none;
  transition: color 180ms ease;
}

.qy-input__icon--prefix {
  left: 0.75rem;
}

.qy-input__icon--suffix {
  right: 0.75rem;
}

.qy-input__icon :deep(svg) {
  width: 100%;
  height: 100%;
}

.qy-input__field {
  background: var(--editor-layer-panel, rgb(255 255 255 / 0.9)) !important;
  color: var(--editor-text-primary, rgb(15 23 42)) !important;
  border-color: color-mix(in srgb, var(--editor-border, rgb(226 232 240)) 82%, transparent) !important;
  box-shadow: var(--editor-shadow-sm, 0 8px 30px -20px rgb(15 23 42 / 0.5)) !important;
}

.qy-input__field::placeholder {
  color: var(--editor-text-ghost, rgb(148 163 184)) !important;
}

.qy-input__field:focus,
.qy-input__field:focus-visible {
  border-color: var(--editor-border-focus, rgb(37 99 235)) !important;
  box-shadow:
    0 0 0 4px color-mix(in srgb, var(--editor-accent, rgb(37 99 235)) 20%, transparent),
    var(--editor-shadow-sm, 0 8px 30px -20px rgb(15 23 42 / 0.5)) !important;
}

.qy-input__suffix {
  position: absolute;
  right: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.qy-input__clear,
.qy-input__password-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  color: var(--editor-text-ghost, rgb(148 163 184));
  cursor: pointer;
  transition:
    color 150ms ease,
    background-color 150ms ease,
    transform 150ms ease;
  background: color-mix(in srgb, var(--editor-layer-panel, rgb(255 255 255 / 0.86)) 90%, transparent);
  border: 1px solid color-mix(in srgb, var(--editor-border, rgb(226 232 240 / 0.8)) 72%, transparent);
  border-radius: 9999px;
  padding: 0;
  box-shadow: 0 4px 10px -8px rgb(15 23 42 / 0.4);
}

.qy-input__clear:hover,
.qy-input__password-toggle:hover {
  color: var(--editor-text-muted, rgb(100 116 139));
  background: var(--editor-layer-soft, rgb(248 250 252 / 1));
  transform: translateY(-1px);
}

.qy-input__clear:hover {
  color: rgb(239 68 68);
}

.qy-input-wrapper--focused .qy-input__icon {
  color: color-mix(in srgb, var(--editor-accent, rgb(37 99 235)) 78%, transparent);
}
</style>
