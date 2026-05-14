<template>
  <div
    data-writer-shell="top-level"
    class="writer-workbench-shell min-h-screen lg:grid lg:h-screen lg:grid-cols-[236px_minmax(0,1fr)] lg:overflow-hidden"
  >
    <WorkbenchSidebar :active-nav-id="activeNavId" :navigation="navigation" />

    <main class="min-w-0 lg:h-screen lg:min-h-0 lg:overflow-y-auto">
      <div class="mx-auto max-w-[1044px] space-y-7 px-5 py-5 lg:px-8 lg:py-8">
        <WorkbenchPageHeader :title="title" :description="description" :eyebrow="eyebrow">
          <template #actions>
            <slot name="actions" />
          </template>
        </WorkbenchPageHeader>

        <section class="space-y-7">
          <slot />
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  getWriterWorkbenchNavigation,
  type WriterWorkbenchNavId,
} from '@/modules/writer/config/workbenchNavigation'
import WorkbenchPageHeader from '@/modules/writer/components/workbench/shell/WorkbenchPageHeader.vue'
import WorkbenchSidebar from '@/modules/writer/components/workbench/shell/WorkbenchSidebar.vue'

const props = withDefaults(
  defineProps<{
    title: string
    description: string
    eyebrow?: string
    lastProjectId?: string
    activeNavId: WriterWorkbenchNavId
  }>(),
  {
    eyebrow: '作者工作台',
    lastProjectId: '',
  },
)

const navigation = computed(() => getWriterWorkbenchNavigation(props.lastProjectId))
</script>

<style scoped>
.writer-workbench-shell {
  background: var(--editor-layer-panel, var(--editor-bg-base, #ffffff));
  color: var(--editor-text-primary, #0f172a);
}
</style>
