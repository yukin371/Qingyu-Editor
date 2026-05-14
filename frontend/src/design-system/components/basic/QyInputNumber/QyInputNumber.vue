<template>
  <div
    :class="[
      'qy-input-number',
      `qy-input-number--${size}`,
      { 'qy-input-number--disabled': disabled },
    ]"
  >
    <!-- Decrease button -->
    <button
      v-if="controls"
      type="button"
      class="qy-input-number__stepper qy-input-number__stepper--minus"
      :disabled="disabled || (modelValue !== undefined && modelValue <= min)"
      @click="decrease"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M3 7H11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      </svg>
    </button>

    <!-- Input -->
    <input
      type="number"
      class="qy-input-number__input"
      :value="modelValue"
      :min="min"
      :max="max"
      :step="step"
      :disabled="disabled"
      :placeholder="placeholder"
      @input="handleInput"
      @change="handleChange"
      @focus="handleFocus"
      @blur="handleBlur"
    />

    <!-- Increase button -->
    <button
      v-if="controls"
      type="button"
      class="qy-input-number__stepper qy-input-number__stepper--plus"
      :disabled="disabled || (modelValue !== undefined && modelValue >= max)"
      @click="increase"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M7 3V11M3 7H11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { InputNumberProps } from './types'

const props = withDefaults(defineProps<InputNumberProps>(), {
  modelValue: 0,
  min: -Infinity,
  max: Infinity,
  step: 1,
  size: 'default',
  disabled: false,
  controls: true,
  placeholder: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
  change: [value: number]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

const decrease = () => {
  if (props.disabled) return
  const newValue = (props.modelValue || 0) - props.step
  if (newValue >= props.min) {
    emit('update:modelValue', newValue)
  }
}

const increase = () => {
  if (props.disabled) return
  const newValue = (props.modelValue || 0) + props.step
  if (newValue <= props.max) {
    emit('update:modelValue', newValue)
  }
}

const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  const value = parseFloat(target.value)
  if (!isNaN(value)) {
    emit('update:modelValue', value)
  }
}

const handleChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const value = parseFloat(target.value)
  if (!isNaN(value)) {
    emit('change', value)
  }
}

const handleFocus = (e: FocusEvent) => {
  emit('focus', e)
}

const handleBlur = (e: FocusEvent) => {
  emit('blur', e)
}

defineOptions({ name: 'QyInputNumber' })
</script>

<style scoped lang="scss">
// Apple style number input with stepper
// Clean, minimal with rounded design

.qy-input-number {
  display: inline-flex;
  align-items: center;
  background: var(--editor-layer-panel, #fff);
  border: 1px solid color-mix(in srgb, var(--editor-border, #d1d1d6) 72%, transparent);
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.2s ease;

  &:hover:not(.qy-input-number--disabled) {
    border-color: var(--editor-border-focus, #007aff);
  }

  &:focus-within:not(.qy-input-number--disabled) {
    border-color: var(--editor-border-focus, #007aff);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--editor-accent, #007aff) 15%, transparent);
  }

  &--disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: var(--editor-layer-soft, #f5f5f5);
  }

  &__stepper {
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--editor-layer-soft, #f5f5f7);
    border: none;
    color: var(--editor-accent, #007aff);
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover:not(:disabled) {
      background: var(--editor-layer-strong, #e8e8ed);
    }

    &:active:not(:disabled) {
      background: color-mix(in srgb, var(--editor-layer-strong, #d8d8de) 88%, black 12%);
    }

    &:disabled {
      color: var(--editor-text-ghost, #c7c7cc);
      cursor: not-allowed;
    }

    &--minus {
      border-right: 1px solid color-mix(in srgb, var(--editor-border, #d1d1d6) 72%, transparent);
    }

    &--plus {
      border-left: 1px solid color-mix(in srgb, var(--editor-border, #d1d1d6) 72%, transparent);
    }
  }

  &__input {
    flex: 1;
    min-width: 60px;
    border: none;
    outline: none;
    text-align: center;
    font-size: 14px;
    color: var(--editor-text-primary, #1d1d1f);
    background: transparent;
    -moz-appearance: textfield;

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    &::placeholder {
      color: var(--editor-text-ghost, #c7c7cc);
    }

    &:focus {
      outline: none;
    }
  }

  // Size variants
  &--small {
    border-radius: 8px;

    .qy-input-number__stepper {
      width: 28px;
      height: 28px;
    }

    .qy-input-number__input {
      height: 28px;
      font-size: 13px;
    }
  }

  &--default {
    .qy-input-number__stepper {
      width: 36px;
      height: 36px;
    }

    .qy-input-number__input {
      height: 36px;
    }
  }

  &--large {
    border-radius: 12px;

    .qy-input-number__stepper {
      width: 44px;
      height: 44px;
    }

    .qy-input-number__input {
      height: 44px;
      font-size: 16px;
    }
  }
}
</style>
