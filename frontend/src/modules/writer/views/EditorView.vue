<template>
  <div class="editor-view-legacy" data-testid="editor-view-legacy">
    <p>正在切换到写作工作区…</p>
  </div>
</template>

<script setup lang="ts">
/**
 * Legacy compatibility shell for the removed standalone editor page.
 *
 * The actual route is already redirected in `routes.ts`, but keeping this component
 * as a tiny redirect target avoids reintroducing the deprecated editor stack.
 */
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const targetLocation = computed(() => {
  const projectId = String(route.params.projectId || route.query.projectId || '')
  const chapterId = String(route.params.chapterId || route.query.chapterId || '')

  if (!projectId) {
    return { name: 'writer-home' as const, query: route.query }
  }

  return {
    name: 'writer-project' as const,
    params: { projectId },
    query: {
      ...route.query,
      ...(chapterId ? { chapterId } : {}),
    },
  }
})

onMounted(async () => {
  await router.replace(targetLocation.value)
})
</script>

<style scoped lang="scss">
.editor-view-legacy {
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

.editor-view-legacy p {
  margin: 0;
}
</style>
