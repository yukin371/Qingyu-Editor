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
        <TabPane name="mechanism" label="机制">
          <div v-if="template.commercialMechanism" class="template-detail-drawer__mechanism space-y-4">
            <section class="template-detail-drawer__panel space-y-2 rounded-2xl p-3">
              <h3 class="template-detail-drawer__heading text-sm font-medium">商业机制卡</h3>
              <p class="template-detail-drawer__secondary text-sm leading-6">
                主角原型：{{ template.commercialMechanism.protagonistArchetype }}
              </p>
              <p class="template-detail-drawer__secondary text-sm leading-6">
                核心驱动：{{ template.commercialMechanism.coreDrive }}
              </p>
              <p class="template-detail-drawer__secondary text-sm leading-6">
                世界压力：{{ template.commercialMechanism.worldPressure }}
              </p>
            </section>

            <section class="space-y-2">
              <h3 class="template-detail-drawer__heading text-sm font-medium">章节循环</h3>
              <ol class="template-detail-drawer__muted flex flex-wrap gap-2 text-xs">
                <li
                  v-for="step in template.commercialMechanism.chapterLoop"
                  :key="step"
                  class="template-detail-drawer__chip px-2 py-1"
                >
                  {{ step }}
                </li>
              </ol>
            </section>

            <section class="space-y-2">
              <h3 class="template-detail-drawer__heading text-sm font-medium">质量约束</h3>
              <ul class="template-detail-drawer__list divide-y border-y">
                <li
                  v-for="item in template.commercialMechanism.qualityConstraints"
                  :key="item"
                  class="template-detail-drawer__secondary py-2 text-sm"
                >
                  {{ item }}
                </li>
              </ul>
            </section>

            <section
              v-if="template.commercialMechanism.promptPresets?.length"
              class="space-y-2"
            >
              <h3 class="template-detail-drawer__heading text-sm font-medium">推荐 AI 协作</h3>
              <ul class="grid gap-2">
                <li
                  v-for="preset in template.commercialMechanism.promptPresets"
                  :key="preset.id"
                  class="template-detail-drawer__prompt rounded-xl px-3 py-2"
                >
                  <div class="flex items-center justify-between gap-2">
                    <span class="template-detail-drawer__heading text-sm font-medium">
                      {{ preset.label }}
                    </span>
                    <span class="template-detail-drawer__chip px-2 py-0.5 text-xs">
                      {{ promptGroupLabels[preset.group] }}
                    </span>
                  </div>
                  <p class="template-detail-drawer__muted mt-1 text-xs leading-5">
                    {{ preset.description }}
                  </p>
                </li>
              </ul>
            </section>
          </div>
        </TabPane>

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

const activeTab = ref<'mechanism' | 'outline' | 'characters' | 'settings'>('mechanism')
const promptGroupLabels = {
  write: '写',
  review: '审',
  organize: '整理',
}

const drawerVisible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

watch(
  () => props.template?.id,
  () => {
    activeTab.value = 'mechanism'
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

.template-detail-drawer__panel {
  border: 1px solid var(--editor-border, #e2e8f0);
  background: var(--editor-layer-soft, #f8fafc);
}

.template-detail-drawer__prompt {
  border: 1px solid var(--editor-border, #e2e8f0);
  background: var(--editor-layer, #ffffff);
}
</style>
