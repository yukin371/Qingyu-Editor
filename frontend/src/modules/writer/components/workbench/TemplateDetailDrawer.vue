<template>
  <QyDrawer
    v-model="drawerVisible"
    title="模板详情"
    direction="rtl"
    size="520px"
  >
    <div v-if="template" class="space-y-5">
      <div class="space-y-2">
        <p class="text-sm text-slate-500">
          {{ template.category }} · {{ template.templateType }}
        </p>
        <div class="space-y-2">
          <h2 class="text-2xl font-semibold text-slate-950">{{ template.name }}</h2>
          <p class="text-sm leading-6 text-slate-500">{{ template.tagline }}</p>
        </div>
        <p class="text-sm text-slate-500">
          {{ template.emotionCurve }} · {{ template.recommendedLabel }}
        </p>
      </div>

      <Tabs v-model="activeTab" type="card">
        <TabPane name="outline" label="大纲">
          <ul class="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
            <li
              v-for="chapter in template.previewTabs.outline"
              :key="chapter.order"
              class="space-y-2 px-4 py-4"
            >
              <div class="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>第 {{ chapter.order }} 章</span>
                <span>{{ chapter.title }}</span>
              </div>
              <p class="text-sm leading-6 text-slate-600">{{ chapter.summary }}</p>
              <div class="grid gap-2 text-sm text-slate-500">
                <p><span class="font-medium text-slate-700">推进钩子：</span>{{ chapter.hook }}</p>
                <p><span class="font-medium text-slate-700">兑现点：</span>{{ chapter.payoff }}</p>
              </div>
            </li>
          </ul>
        </TabPane>

        <TabPane name="characters" label="角色">
          <ul class="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
            <li
              v-for="section in template.previewTabs.characters"
              :key="section.id"
              class="space-y-2 px-4 py-4"
            >
              <h3 class="text-sm font-medium text-slate-900">{{ section.title }}</h3>
              <p class="text-sm leading-6 text-slate-600">{{ section.summary }}</p>
              <ul class="list-disc space-y-1 pl-5 text-sm text-slate-500">
                <li v-for="bullet in section.bullets" :key="bullet">{{ bullet }}</li>
              </ul>
            </li>
          </ul>
        </TabPane>

        <TabPane name="settings" label="设定">
          <ul class="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
            <li
              v-for="section in template.previewTabs.settings"
              :key="section.id"
              class="space-y-2 px-4 py-4"
            >
              <h3 class="text-sm font-medium text-slate-900">{{ section.title }}</h3>
              <p class="text-sm leading-6 text-slate-600">{{ section.summary }}</p>
              <ul class="list-disc space-y-1 pl-5 text-sm text-slate-500">
                <li v-for="bullet in section.bullets" :key="bullet">{{ bullet }}</li>
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
          <strong class="block text-sm font-medium text-slate-900">
            {{ template.seed.volumeTitle }}
          </strong>
          <p class="mt-1 text-sm text-slate-500">
            应用后会创建 1 个卷骨架与 {{ template.previewTabs.outline.length }} 个起始章节。
          </p>
        </div>
        <QyButton :loading="submitting" @click="$emit('apply')">应用于新建项目</QyButton>
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
