<template>
  <aside class="workbench-sidebar min-h-screen px-4 py-5 lg:h-screen lg:min-h-0 lg:overflow-y-auto">
    <div class="space-y-5">
      <div class="space-y-1 px-2 pt-2">
        <p class="workbench-sidebar__eyebrow text-xs font-medium uppercase tracking-[0.24em]">作者工作台</p>
        <h2 class="workbench-sidebar__title text-[1.9rem] font-semibold leading-none">Qingyu Editor</h2>
      </div>

      <nav class="space-y-1.5" aria-label="作者工作台导航">
        <RouterLink
          v-for="item in navigation"
          :key="item.id"
          :to="item.to"
          class="workbench-sidebar__link block rounded-xl px-3 py-3 transition-colors"
          :class="
            activeNavId === item.id
              ? 'is-active'
              : ''
          "
        >
          <div class="flex items-center gap-3">
            <QyIcon
              :name="item.icon"
              :size="17"
              :class="activeNavId === item.id ? 'workbench-sidebar__icon is-active' : 'workbench-sidebar__icon'"
            />
            <div class="font-medium">{{ item.label }}</div>
          </div>
        </RouterLink>
      </nav>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { QyIcon } from '@/design-system/components'
import type {
  WriterWorkbenchNavId,
  WriterWorkbenchNavItem,
} from '@/modules/writer/config/workbenchNavigation'

defineProps<{
  activeNavId: WriterWorkbenchNavId
  navigation: WriterWorkbenchNavItem[]
}>()
</script>

<style scoped>
.workbench-sidebar {
  border-right: 1px solid color-mix(in srgb, var(--editor-border, #e2e8f0) 72%, transparent);
  background: color-mix(in srgb, var(--editor-bg-surface, #f8fafc) 78%, transparent);
}

.workbench-sidebar__eyebrow {
  color: var(--editor-text-ghost, #94a3b8);
}

.workbench-sidebar__title {
  color: var(--editor-text-primary, #0f172a);
}

.workbench-sidebar__link {
  color: var(--editor-text-secondary, #334155);
}

.workbench-sidebar__link:hover {
  background: var(--editor-layer-panel, #ffffff);
  color: var(--editor-text-primary, #0f172a);
}

.workbench-sidebar__link.is-active {
  background: var(--editor-layer-panel, #ffffff);
  color: var(--editor-accent, #0284c7);
  box-shadow:
    inset 0 0 0 1px color-mix(in srgb, var(--editor-accent, #0284c7) 14%, transparent),
    var(--editor-shadow-sm, 0 1px 3px rgba(15, 23, 42, 0.06));
}

.workbench-sidebar__icon {
  color: var(--editor-text-ghost, #94a3b8);
}

.workbench-sidebar__icon.is-active {
  color: var(--editor-accent, #0284c7);
}
</style>
