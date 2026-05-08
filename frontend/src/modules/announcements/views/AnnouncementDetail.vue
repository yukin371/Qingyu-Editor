<template>
  <div class="announcement-detail-page">
    <div v-if="loading" class="announcement-detail-state">加载中...</div>
    <div v-else-if="!announcement" class="announcement-detail-state">公告不存在或已下线</div>
    <article v-else class="announcement-detail-card">
      <header class="announcement-detail-header">
        <span class="announcement-type">{{ getTypeLabel(announcement.type) }}</span>
        <h1>{{ announcement.title }}</h1>
        <p class="announcement-meta">
          <span>发布时间：{{ formatDate(announcement.createdAt) }}</span>
          <span v-if="announcement.startTime || announcement.effectiveStartTime">
            生效时间：{{ formatDate(announcement.startTime || announcement.effectiveStartTime) }}
          </span>
          <span v-if="announcement.endTime || announcement.effectiveEndTime">
            结束时间：{{ formatDate(announcement.endTime || announcement.effectiveEndTime) }}
          </span>
        </p>
      </header>
      <div class="announcement-content">{{ announcement.content }}</div>
    </article>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getAnnouncementById, incrementViewCount, type Announcement } from '../api/announcements'

const route = useRoute()
const announcement = ref<Announcement | null>(null)
const loading = ref(true)

function getTypeLabel(type: Announcement['type']) {
  const labels = {
    info: '信息',
    warning: '警告',
    notice: '通知',
  }
  return labels[type]
}

function formatDate(value?: string) {
  if (!value) return '--'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('zh-CN')
}

onMounted(async () => {
  const id = String(route.params.id || '')
  if (!id) {
    loading.value = false
    return
  }

  try {
    const response = await getAnnouncementById(id)
    announcement.value = response.data ?? null
    if (announcement.value) {
      void incrementViewCount(id)
    }
  } catch (_error) {
    announcement.value = null
  } finally {
    loading.value = false
  }
})
</script>

<style scoped lang="scss">
.announcement-detail-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px 0 40px;
}

.announcement-detail-state,
.announcement-detail-card {
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 10px 30px -20px rgba(15, 23, 42, 0.25);
  padding: 24px;
}

.announcement-detail-header {
  display: grid;
  gap: 12px;
  margin-bottom: 20px;
}

.announcement-type {
  width: fit-content;
  padding: 4px 10px;
  border-radius: 999px;
  background: #eef2ff;
  color: #4338ca;
  font-size: 12px;
  font-weight: 600;
}

.announcement-meta {
  display: grid;
  gap: 6px;
  color: #6b7280;
  font-size: 13px;
}

.announcement-content {
  white-space: pre-wrap;
  color: #1f2937;
  line-height: 1.75;
}
</style>
