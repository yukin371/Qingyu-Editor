<template>
  <div class="workspace-panel-body">
    <div class="workspace-panel-grid">
      <div class="workspace-panel-card">
        <span class="workspace-panel-card__label">章节</span>
        <strong>{{ chapterCount }}</strong>
      </div>
      <div class="workspace-panel-card">
        <span class="workspace-panel-card__label">目录</span>
        <strong>{{ directoryCount }}</strong>
      </div>
      <div class="workspace-panel-card">
        <span class="workspace-panel-card__label">当前模式</span>
        <strong>{{ activeToolLabel || '写作' }}</strong>
      </div>
      <div class="workspace-panel-card">
        <span class="workspace-panel-card__label">保存状态</span>
        <strong>{{ saveStatusLabel || '等待同步' }}</strong>
      </div>
    </div>
    <div v-if="extraStatusChips.length" class="workspace-panel-chips">
      <span v-for="chip in extraStatusChips" :key="chip" class="workspace-panel-chip">
        {{ chip }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    chapterCount: number
    directoryCount: number
    activeToolLabel: string
    saveStatusLabel: string
    extraStatusChips?: string[]
  }>(),
  {
    extraStatusChips: () => [],
  },
)
</script>

<style scoped lang="scss">
.workspace-panel-body {
  display: grid;
  gap: 12px;
  min-height: 0;
}

.workspace-panel-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.workspace-panel-card {
  min-width: 0;
  display: grid;
  gap: 4px;
  padding: 10px 12px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.9);
}

.workspace-panel-card__label {
  font-size: 11px;
  color: var(--editor-text-ghost, #94a3b8);
}

.workspace-panel-card strong {
  font-size: 13px;
  color: var(--editor-text-primary, #0f172a);
}

.workspace-panel-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.workspace-panel-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border-radius: 999px;
  background: rgba(248, 251, 255, 0.95);
  border: 1px solid rgba(148, 163, 184, 0.14);
  font-size: 12px;
  color: var(--editor-text-secondary, #334155);
}

@media (max-width: 1024px) {
  .workspace-panel-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
