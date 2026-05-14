<template>
  <section class="inspiration-template-selector">
    <div class="inspiration-template-selector__head">
      <h4>题材模板</h4>
      <span class="inspiration-template-selector__meta">{{ templates.length }} 类模板</span>
    </div>

    <div class="inspiration-template-selector__buttons">
      <button
        v-for="template in templates"
        :key="template.id"
        type="button"
        class="inspiration-template-selector__button"
        :class="{ 'is-active': activeTemplateId === template.id }"
        :data-testid="`template-${template.id}`"
        @click="$emit('select-template', template.id)"
      >
        <strong>{{ template.name }}</strong>
      </button>
    </div>

    <div v-if="selectedTemplate" class="inspiration-template-selector__brief">
      <div>
        <p class="inspiration-template-selector__label">模板摘要</p>
        <strong>{{ selectedTemplate.tagline }}</strong>
      </div>
      <div>
        <p class="inspiration-template-selector__label">适用题材</p>
        <strong>{{ selectedTemplate.applicableTo.join(' / ') }}</strong>
      </div>
      <div>
        <p class="inspiration-template-selector__label">情绪曲线</p>
        <strong>{{ selectedTemplate.emotionCurve }}</strong>
      </div>
      <div>
        <p class="inspiration-template-selector__label">爽点重点</p>
        <strong>{{ selectedTemplate.payoffFocus.join(' / ') }}</strong>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { CreativeWorkflowTemplateId } from '@/modules/writer/services/creativeWorkflow.service'

interface TemplateSummary {
  id: CreativeWorkflowTemplateId
  name: string
  tagline: string
  applicableTo: string[]
  emotionCurve: string
  payoffFocus: string[]
}

defineProps<{
  templates: TemplateSummary[]
  activeTemplateId: CreativeWorkflowTemplateId | null
  selectedTemplate: TemplateSummary | null | undefined
}>()

defineEmits<{
  (e: 'select-template', templateId: CreativeWorkflowTemplateId): void
}>()
</script>

<style scoped lang="scss">
.inspiration-template-selector {
  display: grid;
  gap: 12px;
}

.inspiration-template-selector__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  h4,
  p,
  strong {
    margin: 0;
  }

  h4 {
    font-size: 15px;
    font-weight: 700;
    color: var(--editor-text-primary, #0f172a);
  }
}

.inspiration-template-selector__meta {
  color: var(--editor-text-ghost, #94a3b8);
  font-size: 12px;
}

.inspiration-template-selector__buttons {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.inspiration-template-selector__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-align: left;
  min-height: 42px;
  padding: 0 12px;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  background: rgba(255, 255, 255, 0.94);
  cursor: pointer;
  transition:
    border-color 0.18s ease,
    transform 0.18s ease,
    box-shadow 0.18s ease;

  strong {
    font-size: 13px;
    color: var(--editor-text-secondary, #475569);
  }

  &.is-active {
    border-color: rgba(245, 158, 11, 0.42);
    background: linear-gradient(135deg, rgba(255, 251, 235, 0.95), rgba(255, 255, 255, 0.96));
    box-shadow: 0 10px 28px rgba(245, 158, 11, 0.12);
    transform: translateY(-1px);

    strong {
      color: #92400e;
    }
  }
}

.inspiration-template-selector__brief {
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(248, 250, 252, 0.82);
  color: var(--editor-text-secondary, #475569);
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 12px;
}

.inspiration-template-selector__label {
  margin: 0 0 4px;
  color: #b45309;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

@media (max-width: 1200px) {
  .inspiration-template-selector__buttons,
  .inspiration-template-selector__brief {
    grid-template-columns: 1fr;
  }
}
</style>
