<template>
  <div class="editor-view-legacy" data-testid="editor-view-legacy">
    <div class="editor-view-legacy__card">
      <p class="editor-view-legacy__eyebrow">Legacy Entry</p>
      <h1>正在切换到新的 Writer Workspace</h1>
      <p>旧编辑器入口已废弃，系统会自动跳转到统一工作区。</p>
    </div>
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
  background:
    radial-gradient(circle at 12% 0%, rgba(143, 63, 47, 0.12), transparent 28%),
    linear-gradient(180deg, #f6ede1 0%, #efe2d2 100%);
}

.editor-view-legacy__card {
  max-width: 420px;
  border-radius: 20px;
  border: 1px solid rgba(117, 93, 67, 0.14);
  background: rgba(255, 251, 245, 0.94);
  box-shadow: 0 20px 40px rgba(72, 46, 22, 0.08);
  padding: 24px 22px;
  text-align: center;
}

.editor-view-legacy__eyebrow {
  margin: 0;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #8f3f2f;
}

.editor-view-legacy__card h1 {
  margin: 10px 0 8px;
  font-size: 24px;
  line-height: 1.15;
  color: #2d241d;
}

.editor-view-legacy__card p:last-child {
  margin: 0;
  color: #6b5f54;
  font-size: 14px;
  line-height: 1.6;
}
</style>
