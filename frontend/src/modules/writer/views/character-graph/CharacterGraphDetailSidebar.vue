<template>
  <div class="detail-sidebar">
    <div class="sidebar-header">
      <h3>{{ character.name }}</h3>
      <QyButton variant="text" size="sm" class="close-button" @click="$emit('close')">
        <QyIcon name="Close" :size="16" />
      </QyButton>
    </div>
    <QyScrollbar class="sidebar-content">
      <div class="info-section">
        <h4>基本信息</h4>
        <QyDescriptions :column="1" border size="small">
          <QyDescriptionsItem label="名称">
            {{ character.name }}
          </QyDescriptionsItem>
          <QyDescriptionsItem label="别名" v-if="character.alias?.length">
            {{ character.alias.join('、') }}
          </QyDescriptionsItem>
          <QyDescriptionsItem label="简介" v-if="character.summary">
            {{ character.summary }}
          </QyDescriptionsItem>
        </QyDescriptions>
      </div>

      <div v-if="character.traits?.length" class="info-section">
        <h4>性格特征</h4>
        <div class="traits-list">
          <QyTag v-for="trait in character.traits" :key="trait" size="sm">
            {{ trait }}
          </QyTag>
        </div>
      </div>

      <div v-if="character.background" class="info-section">
        <h4>背景故事</h4>
        <p class="background-text">{{ character.background }}</p>
      </div>

      <div class="info-section">
        <h4>AI 设定</h4>
        <QyDescriptions :column="1" border size="small">
          <QyDescriptionsItem label="性格提示" v-if="character.personalityPrompt">
            {{ character.personalityPrompt }}
          </QyDescriptionsItem>
          <QyDescriptionsItem label="语言模式" v-if="character.speechPattern">
            {{ character.speechPattern }}
          </QyDescriptionsItem>
          <QyDescriptionsItem label="当前状态" v-if="character.currentState">
            {{ character.currentState }}
          </QyDescriptionsItem>
        </QyDescriptions>
      </div>

      <div class="info-section">
        <h4>角色关系</h4>
        <div class="relations-list">
          <div v-for="item in relations" :key="item.id" class="relation-item">
            <div class="relation-info">
              <span class="relation-target">{{ item.targetName }}</span>
              <QyTag size="sm" :type="item.tagType">
                {{ item.type }}
              </QyTag>
            </div>
            <QyProgress :percentage="item.strength" :stroke-width="6" :show-text="false" />
          </div>
          <Empty v-if="relations.length === 0" description="暂无关系" iconSize="small" />
        </div>
      </div>

      <div class="sidebar-actions">
        <QyButton variant="secondary" @click="$emit('send-to-ai')">交给 AI</QyButton>
        <QyButton variant="primary" @click="$emit('edit')">编辑角色</QyButton>
        <QyButton variant="secondary" @click="$emit('manage-relations')">管理关系</QyButton>
      </div>
    </QyScrollbar>
  </div>
</template>

<script setup lang="ts">
import type { Character } from '@/types/writer'
import {
  QyButton,
  QyDescriptions,
  QyDescriptionsItem,
  QyIcon,
  QyProgress,
  QyScrollbar,
  QyTag,
} from '@/design-system/components'
import { Empty } from '@/design-system/base'

type RelationListItem = {
  id: string
  targetName: string
  type: string
  strength: number
  tagType: 'success' | 'info' | 'warning' | 'danger'
}

defineProps<{
  character: Character
  relations: RelationListItem[]
}>()

defineEmits<{
  (e: 'close'): void
  (e: 'edit'): void
  (e: 'manage-relations'): void
  (e: 'send-to-ai'): void
}>()
</script>

<style scoped lang="scss">
.detail-sidebar {
  width: 400px;
  background: var(--editor-bg-base, #1a1a1a);
  border-left: 1px solid var(--editor-border, #2d2d2d);
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--editor-border, #2d2d2d);

  h3 {
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

.sidebar-content {
  flex: 1;
  padding: 16px;
}

.info-section {
  margin-bottom: 24px;

  h4 {
    margin: 0 0 12px 0;
    font-size: 14px;
    font-weight: 600;
    color: var(--editor-text-primary, #e5e5e5);
  }
}

.traits-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.background-text {
  margin: 0;
  font-size: 14px;
  color: var(--editor-text-secondary, #c0c4cc);
  line-height: 1.6;
}

.relations-list {
  .relation-item {
    padding: 12px;
    background: var(--editor-bg-surface, #0d0d0d);
    border-radius: 4px;
    margin-bottom: 8px;
  }

  .relation-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .relation-target {
    font-size: 14px;
    font-weight: 500;
    color: var(--editor-text-primary, #e5e5e5);
  }
}

.sidebar-actions {
  padding-top: 16px;
  border-top: 1px solid var(--editor-border, #2d2d2d);
  display: flex;
  gap: 8px;

  > * {
    flex: 1;
  }
}

@media (max-width: 768px) {
  .detail-sidebar {
    position: fixed;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 1000;
    box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);
  }
}
</style>
