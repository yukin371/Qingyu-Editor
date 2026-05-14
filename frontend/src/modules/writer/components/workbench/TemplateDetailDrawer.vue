<template>
  <QyDrawer
    v-model="drawerVisible"
    title="模板详情"
    direction="rtl"
    size="520px"
  >
    <div v-if="template" class="space-y-4">
      <div class="template-detail-drawer__head space-y-2 pb-4">
        <div class="template-detail-drawer__muted flex flex-wrap items-center gap-2 text-xs">
          <span class="template-detail-drawer__chip px-2 py-1 font-medium">
            {{ template.category }}
          </span>
          <span>{{ template.templateType }}</span>
          <span>{{ template.emotionCurve }}</span>
        </div>
        <h2 class="template-detail-drawer__heading text-xl font-semibold">{{ template.name }}</h2>
        <p class="template-detail-drawer__muted text-sm leading-6">{{ template.tagline }}</p>
      </div>

      <Tabs v-model="activeTab" type="card">
        <TabPane name="outline" label="大纲">
          <ul class="template-detail-drawer__list divide-y border-y">
            <li
              v-for="chapter in template.previewTabs.outline"
              :key="chapter.order"
              class="space-y-2 py-4"
            >
              <div class="template-detail-drawer__muted flex flex-wrap items-center gap-2 text-xs">
                <span>第 {{ chapter.order }} 章</span>
                <span>{{ chapter.title }}</span>
              </div>
              <p class="template-detail-drawer__secondary text-sm leading-6">{{ chapter.summary }}</p>
              <p class="template-detail-drawer__muted text-sm">{{ chapter.hook }}</p>
            </li>
          </ul>
        </TabPane>

        <TabPane name="characters" label="角色">
          <ul class="template-detail-drawer__list divide-y border-y">
            <li
              v-for="section in template.previewTabs.characters"
              :key="section.id"
              class="space-y-2 py-4"
            >
              <h3 class="template-detail-drawer__heading text-sm font-medium">{{ section.title }}</h3>
              <p class="template-detail-drawer__secondary text-sm leading-6">{{ section.summary }}</p>
              <ul class="template-detail-drawer__muted flex flex-wrap gap-2 text-xs">
                <li
                  v-for="bullet in section.bullets.slice(0, 2)"
                  :key="bullet"
                  class="template-detail-drawer__chip px-2 py-1"
                >
                  {{ bullet }}
                </li>
              </ul>
            </li>
          </ul>
        </TabPane>

        <TabPane name="settings" label="设定">
          <ul class="template-detail-drawer__list divide-y border-y">
            <li
              v-for="section in template.previewTabs.settings"
              :key="section.id"
              class="space-y-2 py-4"
            >
              <h3 class="template-detail-drawer__heading text-sm font-medium">{{ section.title }}</h3>
              <p class="template-detail-drawer__secondary text-sm leading-6">{{ section.summary }}</p>
              <ul class="template-detail-drawer__muted flex flex-wrap gap-2 text-xs">
                <li
                  v-for="bullet in section.bullets.slice(0, 2)"
                  :key="bullet"
                  class="template-detail-drawer__chip px-2 py-1"
                >
                  {{ bullet }}
                </li>
              </ul>
            </li>
          </ul>
        </TabPane>
      </Tabs>
    </div>

    <template #footer>
      <div
        v-if="template"
        class="flex w-full flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"
      >
        <div>
          <strong class="template-detail-drawer__heading block text-sm font-medium">
            {{ template.seed.volumeTitle }}
          </strong>
          <p class="template-detail-drawer__muted mt-1 text-sm">
            应用后会创建 1 个卷骨架与 {{ template.previewTabs.outline.length }} 个起始章节。
          </p>
        </div>
        <QyButton :loading="submitting" @click="$emit('apply')">应用并新建项目</QyButton>
      </div>
    </template>
  </QyDrawer>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { QyButton, QyDrawer, TabPane, Tabs } from '@/design-system/components'
import type { TemplateDetailPayload } from '@/modules/writer/types/workbench'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    template: TemplateDetailPayload | null
    submitting?: boolean
  }>(),
  {
    submitting: false,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'apply'): void
}>()

const activeTab = ref<'outline' | 'characters' | 'settings'>('outline')

const drawerVisible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

watch(
  () => props.template?.id,
  () => {
    activeTab.value = 'outline'
  },
)
</script>

<style scoped>
.template-detail-drawer__head,
.template-detail-drawer__list {
  border-color: color-mix(in srgb, var(--editor-border-light, #f1f5f9) 80%, transparent);
}

.template-detail-drawer__heading {
  color: var(--editor-text-primary, #0f172a);
}

.template-detail-drawer__secondary {
  color: var(--editor-text-secondary, #334155);
}

.template-detail-drawer__muted {
  color: var(--editor-text-muted, #64748b);
}

.template-detail-drawer__chip {
  border-radius: 999px;
  background: var(--editor-layer-strong, #f1f5f9);
  color: var(--editor-text-secondary, #334155);
}
</style>
