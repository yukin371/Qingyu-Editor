<template>
  <nav class="creative-stage-tabs" aria-label="创作舞台切换">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      type="button"
      class="creative-stage-tabs__item"
      :class="{ active: modelValue === tab.id }"
      @click="$emit('update:modelValue', tab.id)"
    >
      <span class="creative-stage-tabs__label">{{ tab.label }}</span>
      <span class="creative-stage-tabs__hint">{{ tab.hint }}</span>
    </button>
  </nav>
</template>

<script setup lang="ts">
export type CreativeStageId = 'writing' | 'structure' | 'relations' | 'timeline' | 'branches'

defineProps<{
  modelValue: CreativeStageId
}>()

defineEmits<{
  (e: 'update:modelValue', value: CreativeStageId): void
}>()

const tabs: Array<{ id: CreativeStageId; label: string; hint: string }> = [
  { id: 'writing', label: '正文', hint: '连续写作' },
  { id: 'structure', label: '结构', hint: '百科 / 世界观' },
  { id: 'relations', label: '图谱', hint: '角色关系' },
  { id: 'timeline', label: '时间线', hint: '事件排序' },
  { id: 'branches', label: '分支', hint: '多线剧情' },
]
</script>

<style scoped lang="scss">
.creative-stage-tabs {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
  padding: 12px 14px 0;
}

.creative-stage-tabs__item {
  border: 1px solid rgba(117, 93, 67, 0.16);
  border-radius: 14px;
  background: rgba(255, 250, 244, 0.85);
  padding: 10px 12px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
}

.creative-stage-tabs__item:hover {
  transform: translateY(-1px);
  border-color: rgba(143, 63, 47, 0.28);
}

.creative-stage-tabs__item.active {
  background: linear-gradient(180deg, #fffaf3 0%, #f2e2cf 100%);
  border-color: rgba(143, 63, 47, 0.32);
  box-shadow: 0 8px 20px rgba(73, 42, 18, 0.08);
}

.creative-stage-tabs__label {
  display: block;
  font-size: 13px;
  font-weight: 800;
  color: #1f2430;
}

.creative-stage-tabs__hint {
  display: block;
  margin-top: 4px;
  font-size: 11px;
  color: #726b63;
}

@media (max-width: 1100px) {
  .creative-stage-tabs {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .creative-stage-tabs {
    grid-template-columns: 1fr;
  }
}
</style>
