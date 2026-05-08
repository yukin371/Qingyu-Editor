import { computed, ref } from 'vue'
import { getEffectiveAnnouncements, type Announcement } from '../api/announcements'

export type AnnouncementPreview = {
  id: string
  title: string
  summary: string
  type: Announcement['type']
  level: 'low' | 'medium' | 'high'
}

export function mapAnnouncementPreview(item: Announcement): AnnouncementPreview {
  const priority = Number(item.priority || 0)
  return {
    id: item.id,
    title: item.title,
    summary: item.content.slice(0, 48),
    type: item.type,
    level: priority >= 80 ? 'high' : priority >= 50 ? 'medium' : 'low',
  }
}

export function useAnnouncements() {
  const loading = ref(false)
  const items = ref<AnnouncementPreview[]>([])

  const visibleItems = computed(() => items.value.slice(0, 3))

  async function loadAnnouncements() {
    loading.value = true
    try {
      const response = await getEffectiveAnnouncements()
      const raw = Array.isArray(response.data) ? response.data : []
      items.value = raw.map(mapAnnouncementPreview)
    } catch (_error) {
      items.value = []
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    items,
    visibleItems,
    loadAnnouncements,
  }
}
