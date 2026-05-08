<template>
    <button :class="buttonClass" :type="nativeType" :disabled="disabled || loading" @click="handleClick">
        <span v-if="loading" class="button-loading">
            <i class="el-icon-loading" />
        </span>
        <span v-if="icon && !loading" class="button-icon">
            <component :is="icon" />
        </span>
        <span v-if="$slots.default" class="button-content">
            <slot />
        </span>
    </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
    type?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
    size?: 'large' | 'default' | 'small'
    plain?: boolean
    round?: boolean
    circle?: boolean
    disabled?: boolean
    loading?: boolean
    icon?: any
    nativeType?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<Props>(), {
    type: 'default',
    size: 'default',
    plain: false,
    round: false,
    circle: false,
    disabled: false,
    loading: false,
    nativeType: 'button'
})

const emit = defineEmits<{
    click: [event: MouseEvent]
}>()

const buttonClass = computed(() => {
    return [
        'base-button',
        `base-button--${props.type}`,
        `base-button--${props.size}`,
        {
            'is-plain': props.plain,
            'is-round': props.round,
            'is-circle': props.circle,
            'is-disabled': props.disabled || props.loading,
            'is-loading': props.loading
        }
    ]
})

const handleClick = (event: MouseEvent) => {
    if (!props.disabled && !props.loading) {
        emit('click', event)
    }
}
</script>

<style scoped lang="scss">
.base-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 8px 16px;
    font-size: 14px;
    line-height: 1.5;
    border: 1px solid transparent;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s;
    user-select: none;

    &:hover:not(.is-disabled) {
        opacity: 0.8;
    }

    &:active:not(.is-disabled) {
        opacity: 0.9;
    }

    &.is-disabled {
        cursor: not-allowed;
        opacity: 0.6;
    }

    &.is-loading {
        pointer-events: none;
    }

    &.is-plain {
        background: transparent;
    }

    &.is-round {
        border-radius: 20px;
    }

    &.is-circle {
        border-radius: 50%;
        padding: 8px;
    }

    // Size variants
    &--large {
        padding: 12px 20px;
        font-size: 16px;
    }

    &--small {
        padding: 6px 12px;
        font-size: 12px;
    }

    // Type variants
    &--default {
        background: #fff;
        border-color: #dcdfe6;
        color: #606266;

        &:hover:not(.is-disabled) {
            color: #409eff;
            border-color: #c6e2ff;
            background-color: #ecf5ff;
        }
    }

    &--primary {
        background: #409eff;
        border-color: #409eff;
        color: #fff;
    }

    &--success {
        background: #67c23a;
        border-color: #67c23a;
        color: #fff;
    }

    &--warning {
        background: #e6a23c;
        border-color: #e6a23c;
        color: #fff;
    }

    &--danger {
        background: #f56c6c;
        border-color: #f56c6c;
        color: #fff;
    }

    &--info {
        background: #909399;
        border-color: #909399;
        color: #fff;
    }
}

.button-loading,
.button-icon {
    display: inline-flex;
    align-items: center;
}

.button-content {
    display: inline-flex;
    align-items: center;
}
</style>
