<template>
    <div :class="inputWrapperClass">
        <label v-if="label" class="input-label" :for="inputId">
            {{ label }}
            <span v-if="required" class="input-required">*</span>
        </label>

        <div class="input-inner">
            <span v-if="prefixIcon" class="input-prefix">
                <component :is="prefixIcon" />
            </span>

            <input :id="inputId" ref="inputRef" :class="inputClass" :type="type" :value="modelValue"
                :placeholder="placeholder" :disabled="disabled" :readonly="readonly" :maxlength="maxlength"
                :autocomplete="autocomplete" @input="handleInput" @change="handleChange" @focus="handleFocus"
                @blur="handleBlur" />

            <span v-if="suffixIcon || showClear" class="input-suffix">
                <i v-if="showClear" class="el-icon-circle-close input-clear" @click="handleClear" />
                <component v-else-if="suffixIcon" :is="suffixIcon" />
            </span>
        </div>

        <div v-if="error || $slots.error" class="input-error">
            <slot name="error">{{ error }}</slot>
        </div>

        <div v-else-if="hint || $slots.hint" class="input-hint">
            <slot name="hint">{{ hint }}</slot>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
    modelValue?: string | number
    type?: string
    label?: string
    placeholder?: string
    error?: string
    hint?: string
    disabled?: boolean
    readonly?: boolean
    required?: boolean
    maxlength?: number
    size?: 'large' | 'default' | 'small'
    prefixIcon?: any
    suffixIcon?: any
    clearable?: boolean
    autocomplete?: string
}

const props = withDefaults(defineProps<Props>(), {
    type: 'text',
    size: 'default',
    autocomplete: 'off'
})

const emit = defineEmits<{
    'update:modelValue': [value: string]
    change: [value: string]
    focus: [event: FocusEvent]
    blur: [event: FocusEvent]
    clear: []
}>()

const inputRef = ref<HTMLInputElement>()
const isFocused = ref(false)
const inputId = computed(() => `input-${Math.random().toString(36).substr(2, 9)}`)

const inputWrapperClass = computed(() => [
    'base-input',
    `base-input--${props.size}`,
    {
        'is-disabled': props.disabled,
        'is-focused': isFocused.value,
        'is-error': props.error
    }
])

const inputClass = computed(() => [
    'input-field',
    {
        'has-prefix': props.prefixIcon,
        'has-suffix': props.suffixIcon || showClear.value
    }
])

const showClear = computed(() => {
    return props.clearable && props.modelValue && !props.disabled && !props.readonly
})

const handleInput = (event: Event) => {
    const target = event.target as HTMLInputElement
    emit('update:modelValue', target.value)
}

const handleChange = (event: Event) => {
    const target = event.target as HTMLInputElement
    emit('change', target.value)
}

const handleFocus = (event: FocusEvent) => {
    isFocused.value = true
    emit('focus', event)
}

const handleBlur = (event: FocusEvent) => {
    isFocused.value = false
    emit('blur', event)
}

const handleClear = () => {
    emit('update:modelValue', '')
    emit('clear')
    inputRef.value?.focus()
}

defineExpose({
    focus: () => inputRef.value?.focus(),
    blur: () => inputRef.value?.blur()
})
</script>

<style scoped lang="scss">
.base-input {
    width: 100%;

    &--large {
        .input-field {
            height: 40px;
            font-size: 16px;
        }
    }

    &--small {
        .input-field {
            height: 28px;
            font-size: 12px;
        }
    }

    &.is-disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    &.is-error {
        .input-field {
            border-color: #f56c6c;
        }
    }
}

.input-label {
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    color: #606266;
}

.input-required {
    color: #f56c6c;
    margin-left: 2px;
}

.input-inner {
    position: relative;
    display: flex;
    align-items: center;
}

.input-field {
    width: 100%;
    height: 36px;
    padding: 0 12px;
    font-size: 14px;
    line-height: 36px;
    color: #606266;
    background-color: #fff;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    transition: border-color 0.3s;

    &:hover:not(:disabled) {
        border-color: #c0c4cc;
    }

    &:focus {
        outline: none;
        border-color: #409eff;
    }

    &:disabled {
        background-color: #f5f7fa;
        cursor: not-allowed;
    }

    &.has-prefix {
        padding-left: 36px;
    }

    &.has-suffix {
        padding-right: 36px;
    }
}

.input-prefix,
.input-suffix {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 100%;
    color: #909399;
}

.input-prefix {
    left: 0;
}

.input-suffix {
    right: 0;
}

.input-clear {
    cursor: pointer;
    transition: color 0.3s;

    &:hover {
        color: #606266;
    }
}

.input-error {
    margin-top: 4px;
    font-size: 12px;
    color: #f56c6c;
}

.input-hint {
    margin-top: 4px;
    font-size: 12px;
    color: #909399;
}
</style>
