<template>
  <QyCard class="character-edit-card" shadow="always" padding="lg">
    <template #header>
      <div class="card-header">
        <div class="header-left">
          <QyIcon class="header-icon" name="User" :size="22" />
          <h3 class="header-title">{{ isEdit ? '编辑角色' : '添加角色' }}</h3>
        </div>
        <QyButton variant="text" size="sm" class="close-button" @click="$emit('close')">
          <QyIcon name="Close" :size="16" />
        </QyButton>
      </div>
    </template>

    <div class="character-form">
      <div class="form-field">
        <label class="field-label" for="character-name">角色名称</label>
        <QyInput
          id="character-name"
          v-model="characterForm.name"
          placeholder="请输入角色名称"
          :state="characterFormErrors.name ? 'error' : 'default'"
        />
        <p v-if="characterFormErrors.name" class="field-error">{{ characterFormErrors.name }}</p>
      </div>
      <div class="form-field">
        <label class="field-label">别名</label>
        <div class="tags-container">
          <QyTag
            v-for="(alias, index) in characterForm.alias"
            :key="index"
            closable
            @close="characterForm.alias.splice(index, 1)"
          >
            {{ alias }}
          </QyTag>
          <QyInput
            v-if="showAliasInputModel"
            v-model="newAliasModel"
            size="sm"
            @blur="$emit('confirm-alias-input')"
            @keyup.enter="$emit('confirm-alias-input')"
          />
          <QyButton v-else variant="text" size="sm" @click="showAliasInputModel = true">
            + 添加别名
          </QyButton>
        </div>
      </div>
      <div class="form-field">
        <label class="field-label" for="character-summary">角色简介</label>
        <QyTextarea
          id="character-summary"
          v-model="characterForm.summary"
          :rows="2"
          placeholder="请输入角色简介"
        />
      </div>
      <div class="form-field">
        <label class="field-label">性格特征</label>
        <div class="tags-container">
          <QyTag
            v-for="(trait, index) in characterForm.traits"
            :key="index"
            closable
            @close="characterForm.traits.splice(index, 1)"
          >
            {{ trait }}
          </QyTag>
          <QyInput
            v-if="showTraitInputModel"
            v-model="newTraitModel"
            size="sm"
            @blur="$emit('confirm-trait-input')"
            @keyup.enter="$emit('confirm-trait-input')"
          />
          <QyButton v-else variant="text" size="sm" @click="showTraitInputModel = true">
            + 添加特征
          </QyButton>
        </div>
      </div>
      <div class="form-field">
        <label class="field-label" for="character-background">背景故事</label>
        <QyTextarea
          id="character-background"
          v-model="characterForm.background"
          :rows="4"
          placeholder="请输入角色背景故事"
        />
      </div>
      <div class="form-field">
        <label class="field-label" for="character-prompt">性格提示</label>
        <QyTextarea
          id="character-prompt"
          v-model="characterForm.personalityPrompt"
          :rows="2"
          placeholder="为 AI 提供角色性格提示"
        />
      </div>
      <div class="form-field">
        <label class="field-label" for="character-speech-pattern">语言模式</label>
        <QyInput
          id="character-speech-pattern"
          v-model="characterForm.speechPattern"
          placeholder="角色说话方式"
        />
      </div>
    </div>

    <template #footer>
      <div class="card-footer">
        <QyButton variant="secondary" @click="$emit('close')">取消</QyButton>
        <QyButton variant="primary" :loading="submitting" @click="$emit('submit')">
          确定
        </QyButton>
      </div>
    </template>
  </QyCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { QyButton, QyIcon, QyInput, QyTag, QyTextarea } from '@/design-system/components'
import QyCard from '@/design-system/components/basic/QyCard/QyCard.vue'

type CharacterFormState = {
  name: string
  alias: string[]
  summary: string
  traits: string[]
  background: string
  personalityPrompt: string
  speechPattern: string
  currentState: string
}

const props = defineProps<{
  isEdit: boolean
  submitting: boolean
  characterForm: CharacterFormState
  characterFormErrors: { name: string }
  showAliasInput: boolean
  showTraitInput: boolean
  newAlias: string
  newTrait: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit'): void
  (e: 'confirm-alias-input'): void
  (e: 'confirm-trait-input'): void
  (e: 'update:showAliasInput', value: boolean): void
  (e: 'update:showTraitInput', value: boolean): void
  (e: 'update:newAlias', value: string): void
  (e: 'update:newTrait', value: string): void
}>()

const showAliasInputModel = computed({
  get: () => props.showAliasInput,
  set: (value: boolean) => emit('update:showAliasInput', value),
})

const showTraitInputModel = computed({
  get: () => props.showTraitInput,
  set: (value: boolean) => emit('update:showTraitInput', value),
})

const newAliasModel = computed({
  get: () => props.newAlias,
  set: (value: string) => emit('update:newAlias', value),
})

const newTraitModel = computed({
  get: () => props.newTrait,
  set: (value: string) => emit('update:newTrait', value),
})
</script>

<style scoped lang="scss">
.character-edit-card {
  width: 100%;
  max-width: 700px;
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

    .header-icon {
      font-size: 24px;
      color: #67c23a;
    }

    .header-title {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: var(--editor-text-primary, #e5e5e5);
    }
  }
}

.close-button {
  min-width: 36px;
  padding-inline: 10px;
}

.character-form {
  width: 100%;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 18px;

  .form-field {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--editor-border);
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

  .tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    width: 100%;
  }

  :deep(.qy-input-wrapper),
  :deep(.qy-textarea-wrapper),
  :deep(.surface-control) {
    width: 100%;
  }

  :deep(.qy-input-wrapper) {
    min-width: 0;
  }

  :deep(.qy-textarea) {
    width: 100%;
  }

  .tags-container :deep(.qy-input-wrapper) {
    width: auto;
    min-width: 160px;
  }
}

.card-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
