<template>
  <div class="side-panel" :class="[`side-panel--${position}`, { 'side-panel--collapsible': collapsible }]">
    <div class="side-panel__content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  position: 'left' | 'right'
  collapsible?: boolean
}

withDefaults(defineProps<Props>(), {
  collapsible: false
})
</script>

<style scoped lang="scss">
.side-panel {
  height: 100%;
  min-height: 0;
  min-width: 0;
  background: transparent;
  border: none;
  border-radius: 0;
  overflow: hidden;
}

.side-panel--left {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.side-panel--right {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.side-panel__content {
  height: 100%;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
  background: transparent;
}

:deep(.sidebar-container),
:deep(.chapter-list) {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

:deep(.ai-panel) {
  width: 100%;
  border-left: none;
  border-right: none;
}

:deep(.sidebar-header),
:deep(.sidebar-toolbar),
:deep(.sidebar-section-header) {
  background: #fff;
}

:deep(.sidebar-list) {
  background: #fff;
}

:deep(.chapter-item.is-active) {
  border-left-color: #3b82f6;
  background: #eff6ff;
}

:deep(.chapter-item:hover) {
  background: #f8fafc;
}

@media (max-width: 1024px) {
  .side-panel {
    border-radius: 10px;
  }
}
</style>
