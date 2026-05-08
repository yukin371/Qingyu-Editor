<template>
  <div
    class="workspace-shell"
    :class="{ 'workspace-shell--immersive': isImmersiveMode }"
    :data-editor-theme="editorTheme"
  >
    <header class="workspace-shell__topbar">
      <slot name="topbar" />
    </header>

    <main class="workspace-shell__body">
      <slot name="body" />
    </main>

    <footer class="workspace-shell__statusbar">
      <slot name="statusbar" />
    </footer>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isImmersiveMode?: boolean
  editorTheme?: string
}>()

defineSlots<{
  topbar?: () => unknown
  body?: () => unknown
  statusbar?: () => unknown
}>()
</script>

<style scoped lang="scss">
.workspace-shell {
  height: 100vh;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
  overflow: hidden;
}

.workspace-shell__topbar,
.workspace-shell__statusbar {
  flex-shrink: 0;
  min-height: 0;
}

.workspace-shell__body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
</style>
