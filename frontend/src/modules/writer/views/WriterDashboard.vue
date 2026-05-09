<template>
  <div class="writer-dashboard-legacy" data-testid="writer-dashboard-legacy">
    <p>正在切换到写作工作区…</p>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const targetLocation = computed(() => {
  const lastProjectId =
    typeof window !== 'undefined' ? window.localStorage.getItem('qingyu-editor:last-project') || '' : ''

  if (lastProjectId) {
    return { name: 'writer-project' as const, params: { projectId: lastProjectId } }
  }

  return { name: 'writer-projects' as const }
})

onMounted(async () => {
  await router.replace(targetLocation.value)
})
</script>

<style scoped lang="scss">
.writer-dashboard-legacy {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  color: #5f5347;
  font-size: 13px;
  letter-spacing: 0.04em;
  background: #f5efe5;
}

.writer-dashboard-legacy p {
  margin: 0;
}
</style>
