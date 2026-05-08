<template>
  <div class="relative h-screen overflow-hidden bg-slate-100">
    <div class="absolute bottom-4 right-4 z-20">
      <button
        type="button"
        class="rounded-full border border-slate-200 bg-white/94 px-4 py-2 text-sm text-slate-700 shadow-md backdrop-blur transition hover:bg-white"
        @click="showGuide = !showGuide"
      >
        {{ showGuide ? '收起验收说明' : '查看验收说明' }}
      </button>

      <div
        v-if="showGuide"
        class="mt-3 max-w-sm rounded-2xl border border-slate-200 bg-white/96 p-4 text-sm text-slate-700 shadow-lg backdrop-blur"
      >
        <p class="font-semibold text-slate-900">编辑器 V3 Phase 1 验收入口</p>
        <p class="mt-1 leading-6">
          直接看三件事：右侧是否出现 `Story Harness`，是否能看到正式建议/即时预览分层，保存后是否出现轻量回执。
        </p>
        <p class="mt-2 text-xs leading-5 text-slate-500">
          已固定到 mock 项目与章节 2，可直接肉眼确认，不依赖真实项目数据。
        </p>
      </div>
    </div>

    <ProjectWorkspace class="h-full" project-id="project-yljs-1" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ProjectWorkspace from '@/modules/writer/views/ProjectWorkspace.vue'

const route = useRoute()
const router = useRouter()
const showGuide = ref(false)

onMounted(async () => {
  const nextQuery = {
    ...route.query,
    test: 'true',
    tool: 'writing',
    chapterId: 'ch-2',
  }

  const isAlreadyReady =
    route.query.test === 'true' && route.query.tool === 'writing' && route.query.chapterId === 'ch-2'

  if (!isAlreadyReady) {
    await router.replace({ query: nextQuery })
  }
})
</script>
