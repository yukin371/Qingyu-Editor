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
  background: #fff;
  border: 1px solid #d1d1d6;
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.2s ease;

  &:hover:not(.qy-input-number--disabled) {
    border-color: #007aff;
  }

  &:focus-within:not(.qy-input-number--disabled) {
    border-color: #007aff;
    box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.15);
  }

  &--disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: #f5f5f5;
  }

  &__stepper {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f5f7;
    border: none;
    color: #007aff;
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover:not(:disabled) {
      background: #e8e8ed;
    }

    &:active:not(:disabled) {
      background: #d8d8de;
    }

    &:disabled {
      color: #c7c7cc;
      cursor: not-allowed;
    }

    &--minus {
      border-right: 1px solid #d1d1d6;
    }

    &--plus {
      border-left: 1px solid #d1d1d6;
    }
  }

  &__input {
    flex: 1;
    min-width: 60px;
    border: none;
    outline: none;
    text-align: center;
    font-size: 14px;
    color: #1d1d1f;
    background: transparent;
    -moz-appearance: textfield;

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    &::placeholder {
      color: #c7c7cc;
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
