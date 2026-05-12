<template>
  <div
    data-writer-shell="editor"
    class="writer-editor-shell"
    :class="{ 'writer-editor-shell--immersive': isImmersiveMode }"
    :data-editor-theme="editorTheme"
  >
    <header class="writer-editor-shell__topbar">
      <slot name="topbar" />
    </header>

    <main class="writer-editor-shell__body">
      <slot name="body" />
    </main>

    <footer class="writer-editor-shell__statusbar">
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
.writer-editor-shell {
  height: 100vh;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
  overflow: hidden;
}

.writer-editor-shell__topbar,
.writer-editor-shell__statusbar {
  flex-shrink: 0;
  min-height: 0;
}

.writer-editor-shell__body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
</style>
