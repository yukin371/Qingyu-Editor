<template>
  <button
    type="button"
    class="qy-ghost-button"
    :class="{
      'qy-ghost-button--active': active,
      'qy-ghost-button--disabled': disabled
    }"
    :disabled="disabled"
    @click="handleClick"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
interface Props {
  active?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  active: false,
  disabled: false,
})

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const handleClick = (event: MouseEvent) => {
  if (!props.disabled) {
    emit('click', event)
  }
}
</script>

<style scoped lang="scss">
.qy-ghost-button {
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.16s ease, color 0.16s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(148, 163, 184, 0.16);
  }

  &:focus-visible {
    outline: 2px solid rgba(59, 130, 246, 0.45);
    outline-offset: 1px;
  }

  &--active {
    background: rgba(59, 130, 246, 0.14);
    color: #1d4ed8;
  }

  &--disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style>
