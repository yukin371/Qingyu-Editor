<template>
  <aside
    class="min-h-screen border-r border-slate-100 bg-slate-50/80 px-4 py-5 lg:h-screen lg:overflow-y-auto"
  >
    <div class="space-y-5">
      <div class="space-y-1 px-2 pt-2">
        <p class="text-xs font-medium uppercase tracking-[0.24em] text-slate-400">作者工作台</p>
        <h2 class="text-[1.9rem] font-semibold leading-none text-slate-950">Qingyu Editor</h2>
      </div>

      <nav class="space-y-1.5" aria-label="作者工作台导航">
        <RouterLink
          v-for="item in navigation"
          :key="item.id"
          :to="item.to"
          class="block rounded-xl px-3 py-3 transition-colors"
          :class="
            activeNavId === item.id
              ? 'bg-white text-sky-700 shadow-[inset_0_0_0_1px_rgba(14,165,233,0.1),0_1px_2px_rgba(15,23,42,0.04)]'
              : 'text-slate-700 hover:bg-white hover:text-slate-950'
          "
        >
          <div class="flex items-center gap-3">
            <QyIcon
              :name="item.icon"
              :size="17"
              :class="activeNavId === item.id ? 'text-sky-600' : 'text-slate-400'"
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
