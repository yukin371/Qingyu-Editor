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
        <strong>{{ selectedTemplate.tagline }}</strong>
      </div>
      <div>
        <strong>{{ selectedTemplate.applicableTo.join(' / ') }}</strong>
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
  gap: 10px;
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
  color: var(--editor-text-muted, #64748b);
  font-size: 12px;
}

.inspiration-template-selector__buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.inspiration-template-selector__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-align: left;
  min-height: 30px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid var(--editor-border, #d9dee6);
  background: transparent;
  cursor: pointer;

  strong {
    font-size: 12px;
    color: var(--editor-text-secondary, #475569);
  }

  &.is-active {
    border-color: var(--editor-accent, #1d4ed8);
    background: var(--editor-accent-soft, #eff6ff);

    strong {
      color: var(--editor-accent, #1d4ed8);
    }
  }
}

.inspiration-template-selector__brief {
  padding-left: 10px;
  border-left: 2px solid var(--editor-border, #d9dee6);
  color: var(--editor-text-secondary, #475569);
  display: grid;
  gap: 4px;
  font-size: 12px;
}

@media (max-width: 1200px) {
  .inspiration-template-selector__brief {
    grid-template-columns: 1fr;
  }
}
</style>
