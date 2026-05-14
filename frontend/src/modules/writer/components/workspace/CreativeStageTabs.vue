<template>
  <nav class="creative-stage-tabs" aria-label="五阶段创作流程">
    <button
      v-for="stage in creativeFlowStages"
      :key="stage.id"
      type="button"
      class="creative-stage-tabs__item"
      :class="{
        active: modelValue === stage.id,
        complete: completedStageIds.includes(stage.id),
      }"
      @click="$emit('update:modelValue', stage.id)"
    >
      <span class="creative-stage-tabs__index">{{ stage.order }}</span>
      <span class="creative-stage-tabs__body">
        <span class="creative-stage-tabs__label">{{ stage.title }}</span>
        <span class="creative-stage-tabs__hint">{{ stage.subtitle }}</span>
      </span>
      <span
        v-if="completedStageIds.includes(stage.id)"
        class="creative-stage-tabs__check"
        aria-label="已完成"
      >
        <QyIcon name="Check" :size="13" />
      </span>
    </button>
  </nav>
</template>

<script setup lang="ts">
import QyIcon from '@/design-system/components/basic/QyIcon/QyIcon.vue'
import { creativeFlowStages, type CreativeFlowStageId } from '@/modules/writer/config/creativeFlow'

withDefaults(
  defineProps<{
    modelValue: CreativeFlowStageId
    completedStageIds?: CreativeFlowStageId[]
  }>(),
  {
    completedStageIds: () => [],
  },
)

defineEmits<{
  (e: 'update:modelValue', value: CreativeFlowStageId): void
}>()
</script>

<style scoped lang="scss">
.creative-stage-tabs {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
  padding: 12px 14px 10px;
  background: linear-gradient(90deg, rgba(241, 245, 249, 0.96), rgba(255, 255, 255, 0.96));
  border-bottom: 1px solid rgba(203, 213, 225, 0.78);
}

.creative-stage-tabs__item {
  position: relative;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 8px;
  min-height: 68px;
  border: 1px solid rgba(148, 163, 184, 0.28);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.82);
  padding: 10px;
  text-align: left;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    background 0.18s ease,
    box-shadow 0.18s ease;
}

.creative-stage-tabs__item:hover {
  transform: translateY(-1px);
  border-color: rgba(51, 65, 85, 0.34);
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.06);
}

.creative-stage-tabs__item.active {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(49, 46, 129, 0.92));
  border-color: rgba(15, 23, 42, 0.5);
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.16);
}

.creative-stage-tabs__item.complete:not(.active) {
  border-color: rgba(20, 184, 166, 0.38);
}

.creative-stage-tabs__index {
  display: inline-flex;
  width: 22px;
  height: 22px;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: rgba(15, 23, 42, 0.08);
  color: #334155;
  font-size: 12px;
  font-weight: 800;
}

.creative-stage-tabs__item.active .creative-stage-tabs__index {
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
}

.creative-stage-tabs__body {
  min-width: 0;
}

.creative-stage-tabs__label {
  display: block;
  color: #0f172a;
  font-size: 13px;
  font-weight: 800;
  line-height: 1.2;
}

.creative-stage-tabs__hint {
  display: -webkit-box;
  margin-top: 5px;
  overflow: hidden;
  color: #64748b;
  font-size: 11px;
  line-height: 1.35;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.creative-stage-tabs__item.active .creative-stage-tabs__label,
.creative-stage-tabs__item.active .creative-stage-tabs__hint {
  color: #fff;
}

.creative-stage-tabs__check {
  position: absolute;
  right: 8px;
  top: 8px;
  display: inline-flex;
  width: 18px;
  height: 18px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #14b8a6;
  color: #fff;
}

@media (max-width: 1180px) {
  .creative-stage-tabs {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .creative-stage-tabs {
    grid-template-columns: 1fr;
  }
}
</style>
