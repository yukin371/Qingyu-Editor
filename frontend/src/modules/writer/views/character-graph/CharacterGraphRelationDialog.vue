<template>
  <div class="relation-dialog-container">
    <QyCard class="relation-dialog-card" shadow="always" padding="lg">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <QyIcon class="header-icon" name="Connection" :size="22" />
            <h3 class="header-title">管理角色关系</h3>
          </div>
          <QyButton variant="text" size="sm" class="close-button" @click="$emit('close')">
            <QyIcon name="Close" :size="16" />
          </QyButton>
        </div>
      </template>

      <div class="relation-dialog-content">
        <div class="existing-relations">
          <h4>当前角色关系</h4>
          <div v-if="selectedCharacter" class="relations-list-dialog">
            <div v-for="item in relations" :key="item.relation.id" class="relation-item-dialog">
              <div class="relation-main">
                <span class="relation-target">{{ item.targetName }}</span>
                <QyTag size="sm" :type="item.tagType">
                  {{ item.relation.type }}
                </QyTag>
                <div class="relation-strength">
                  <QyProgress
                    :percentage="item.relation.strength"
                    :stroke-width="4"
                    :show-text="false"
                  />
                  <span class="strength-value">{{ item.relation.strength }}</span>
                </div>
              </div>
              <QyButton
                variant="text"
                size="sm"
                class="relation-delete-button"
                @click="$emit('delete-relation', item.relation)"
              >
                <QyIcon name="Delete" :size="14" />
              </QyButton>
            </div>
            <Empty v-if="relations.length === 0" description="暂无关系" iconSize="small" />
          </div>
        </div>

        <QyDivider />

        <div class="create-relation-form">
          <h4>添加新关系</h4>
          <div class="character-form relation-form">
            <div class="form-field">
              <label class="field-label">目标角色</label>
              <QySelect
                v-model="relationForm.toId"
                placeholder="选择目标角色"
                :options="relationTargetOptions"
                class="w-full"
              />
              <p v-if="relationFormErrors.toId" class="field-error">{{ relationFormErrors.toId }}</p>
            </div>
            <div class="form-field">
              <label class="field-label">关系类型</label>
              <QySelect
                v-model="relationForm.type"
                placeholder="选择关系类型"
                :options="relationTypeOptions"
                class="w-full"
              />
              <p v-if="relationFormErrors.type" class="field-error">{{ relationFormErrors.type }}</p>
            </div>
            <div class="form-field">
              <label class="field-label">关系强度</label>
              <div class="strength-slider">
                <QySlider
                  v-model="relationForm.strength"
                  :min="0"
                  :max="100"
                  :step="5"
                  :show-tooltip="false"
                  class="w-full"
                />
                <span class="strength-display">{{ relationForm.strength }}</span>
              </div>
              <p v-if="relationFormErrors.strength" class="field-error">
                {{ relationFormErrors.strength }}
              </p>
            </div>
            <div class="form-field">
              <label class="field-label" for="relation-notes">备注</label>
              <QyTextarea
                id="relation-notes"
                v-model="relationForm.notes"
                :rows="2"
                placeholder="关系描述（可选）"
              />
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="card-footer">
          <QyButton variant="secondary" @click="$emit('close')">取消</QyButton>
          <QyButton variant="primary" :loading="relationSubmitting" @click="$emit('submit')">
            创建关系
          </QyButton>
        </div>
      </template>
    </QyCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Character, RelationType } from '@/types/writer'
import {
  QyButton,
  QyDivider,
  QyIcon,
  QyProgress,
  QySelect,
  QySlider,
  QyTag,
  QyTextarea,
} from '@/design-system/components'
import { Empty } from '@/design-system/base'
import QyCard from '@/design-system/components/basic/QyCard/QyCard.vue'

type RelationDialogRelation = {
  id: string
  fromId: string
  toId: string
  type: RelationType | string
  strength: number
  notes?: string
  isInherited?: boolean
}

type RelationDialogItem = {
  relation: RelationDialogRelation
  targetName: string
  tagType: 'success' | 'info' | 'warning' | 'danger'
}

type RelationFormState = {
  fromId: string
  toId: string
  type: RelationType
  strength: number
  notes: string
}

const props = defineProps<{
  selectedCharacter: Character | null
  relations: RelationDialogItem[]
  relationForm: RelationFormState
  relationFormErrors: { toId: string; type: string; strength: string }
  relationTargetOptions: Array<{ label: string; value: string }>
  relationTypeOptions: Array<{ label: string; value: string }>
  relationSubmitting: boolean
}>()

const relationForm = computed(() => props.relationForm)

defineEmits<{
  (e: 'close'): void
  (e: 'submit'): void
  (e: 'delete-relation', relation: RelationDialogRelation): void
}>()
</script>

<style scoped lang="scss">
.relation-dialog-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.relation-dialog-card {
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  background: var(--editor-bg-base, #1a1a1a);
  border-color: var(--editor-border, #2d2d2d);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .header-icon {
    color: #67c23a;
  }

  .header-title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--editor-text-primary, #e5e5e5);
  }
}

.close-button {
  min-width: 36px;
  padding-inline: 10px;
}

.relation-dialog-content {
  padding: 0 8px;
}

.existing-relations h4,
.create-relation-form h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--editor-text-primary, #e5e5e5);
}

.relations-list-dialog {
  max-height: 200px;
  overflow-y: auto;
}

.relation-item-dialog {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: var(--editor-bg-surface, #0d0d0d);
  border-radius: 6px;
  margin-bottom: 8px;
}

.relation-main {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.relation-target {
  font-size: 14px;
  font-weight: 500;
  color: var(--editor-text-primary, #e5e5e5);
}

.relation-strength {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  max-width: 150px;
}

.strength-value {
  font-size: 12px;
  color: var(--editor-text-muted, #9ca3af);
  min-width: 24px;
}

.relation-delete-button {
  color: #dc2626;
}

.character-form {
  width: 100%;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--editor-border, #2d2d2d);
}

.field-label {
  font-weight: 500;
  color: var(--editor-text-primary, #e5e5e5);
  font-size: 13px;
}

.field-error {
  margin: -2px 0 0;
  font-size: 12px;
  color: var(--editor-accent, #f87171);
}

.strength-slider {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.strength-display {
  font-size: 14px;
  font-weight: 500;
  color: var(--editor-accent, #f87171);
  min-width: 30px;
}

:deep(.qy-input-wrapper),
:deep(.qy-textarea-wrapper),
:deep(.surface-control) {
  width: 100%;
}

:deep(.qy-textarea) {
  width: 100%;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
