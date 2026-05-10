<template>
  <div
    class="graph-state-card"
    :class="{ 'is-guide': mode === 'guide', 'is-empty': mode === 'empty' }"
    :data-testid="testId"
  >
    <div class="graph-state-card__content">
      <QyIcon class="graph-state-card__icon" :name="iconName" :size="iconSize" />
      <h3 class="graph-state-card__title">{{ title }}</h3>
      <p class="graph-state-card__description">{{ description }}</p>
      <p v-if="secondaryDescription" class="graph-state-card__description is-secondary">
        {{ secondaryDescription }}
      </p>
      <div v-if="actions.length > 0" class="graph-state-card__actions">
        <QyButton
          v-for="action in actions"
          :key="action.id"
          :variant="action.variant ?? 'secondary'"
          :disabled="action.disabled"
          @click="$emit('action', action.id)"
        >
          {{ action.label }}
        </QyButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { QyButton, QyIcon } from '@/design-system/components'

type ActionStateButton = {
  id: string
  label: string
  variant?: 'primary' | 'secondary' | 'text'
  disabled?: boolean
}

defineProps<{
  mode: 'guide' | 'empty'
  iconName: string
  iconSize?: number
  title: string
  description: string
  secondaryDescription?: string
  testId?: string
  actions: ActionStateButton[]
}>()

defineEmits<{
  (e: 'action', actionId: string): void
}>()
</script>

<style scoped lang="scss">
.graph-state-card {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;

  &.is-guide {
    height: 100%;
  }

  &.is-empty {
    height: 100%;
    padding: 40px 32px;
    text-align: center;
    background:
      radial-gradient(circle at top, rgba(102, 126, 234, 0.08), transparent 35%),
      linear-gradient(180deg, #fbfcff 0%, #f6f8fc 100%);
  }
}

.graph-state-card__content {
  max-width: 520px;
  padding: 40px;
  text-align: center;
}

.graph-state-card__icon {
  margin-bottom: 16px;
  color: var(--editor-text-muted, #9ca3af);
}

.graph-state-card__title {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--editor-text-primary, #111827);
}

.graph-state-card__description {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--editor-text-muted, #6b7280);

  &.is-secondary {
    margin-top: 6px;
  }
}

.graph-state-card__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-top: 22px;
}
</style>
