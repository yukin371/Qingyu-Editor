<template>
  <div class="character-graph-deprecated">
    <div class="deprecated-message">
      <span class="deprecated-icon">⚠️</span>
      <h3>角色关系图谱已废弃</h3>
      <p>请使用 Ctrl+G 打开工具面板中的关系图谱</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// 此组件已废弃，请使用 WorkspaceToolOverlay 中的关系图谱
// 快捷键: Ctrl+G 打开工具面板
defineProps<{
  nodes?: unknown[]
  links?: unknown[]
  showLinkLabels?: boolean
  viewMode?: string
  chapterTitle?: string
}>()
</script>

<style scoped>
.character-graph-deprecated {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: #1a1a2e;
  color: #fff;
}
.deprecated-message {
  text-align: center;
  padding: 40px;
}
.deprecated-icon {
  font-size: 48px;
}
.deprecated-message h3 {
  margin: 16px 0 8px;
  color: #ffc107;
}
.deprecated-message p {
  color: #aaa;
  margin: 0;
}
</style>
