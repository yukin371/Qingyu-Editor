<template>
  <section v-if="items.length" class="announcement-bar">
    <article
      v-for="item in items"
      :key="item.id"
      class="announcement-item"
      @click="$emit('select', item.id)"
    >
      <span class="announcement-type" :data-level="item.level">{{ getTypeLabel(item.type) }}</span>
      <div class="announcement-content">
        <strong>{{ item.title }}</strong>
        <span>{{ item.summary }}</span>
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
import type { AnnouncementPreview } from '../composables/useAnnouncements'

defineProps<{ items: AnnouncementPreview[] }>()
defineEmits<{ select: [id: string] }>()

function getTypeLabel(type: AnnouncementPreview['type']) {
  const labels = {
    info: '信息',
    warning: '警告',
    notice: '通知',
  }
  return labels[type]
}
</script>

<style scoped lang="scss">
.announcement-bar {
  display: grid;
  gap: 12px;
  margin: 20px 0 28px;
}

.announcement-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 16px 18px;
  background: #ffffff;
  border: 1px solid #e9edf3;
  border-radius: 16px;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    border-color: #d5ddea;
    box-shadow: 0 10px 24px -16px rgba(15, 23, 42, 0.35);
  }
}

.announcement-type {
  flex-shrink: 0;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  line-height: 20px;
  font-weight: 600;
  background: #eef2ff;
  color: #4f46e5;

  &[data-level='high'] {
    background: #fef2f2;
    color: #dc2626;
  }

  &[data-level='medium'] {
    background: #fff7ed;
    color: #ea580c;
  }
}

.announcement-content {
  display: grid;
  gap: 4px;
  min-width: 0;

  strong {
    font-size: 15px;
    color: #1f2937;
  }

  span {
    color: #6b7280;
    font-size: 13px;
    line-height: 1.5;
  }
}
</style>
