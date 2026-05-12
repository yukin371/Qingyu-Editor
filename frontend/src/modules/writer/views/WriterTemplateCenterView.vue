<template>
  <WorkbenchShell
    title="模板中心"
    description="只服务于更快启动新项目，先预览，再应用。"
    eyebrow="模板中心"
    active-nav-id="templates"
    :last-project-id="lastProjectId"
  >
    <template #actions>
      <QyButton size="sm" @click="router.push({ name: WRITER_ROUTE_NAMES.projects })">
        查看项目列表
      </QyButton>
    </template>

    <section class="space-y-4">
      <div class="space-y-1">
        <h2 class="text-lg font-semibold text-slate-950">模板列表</h2>
        <p class="text-sm text-slate-500">{{ filteredTemplates.length }} 个模板可用于快速新建项目</p>
      </div>

      <div class="pb-2">
        <label class="block max-w-[280px] space-y-2">
          <span class="text-sm font-medium text-slate-700">模板分类</span>
          <QySelect v-model="activeCategory" :options="categoryOptions" />
        </label>
      </div>

      <QyEmpty v-if="filteredTemplates.length === 0" title="当前分类没有模板" type="list">
        <template #description>切换分类后再试。</template>
      </QyEmpty>

      <div v-else class="divide-y divide-slate-100 border-t border-slate-100">
        <article
          v-for="template in filteredTemplates"
          :key="template.id"
          class="grid gap-5 py-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
        >
          <div class="min-w-0 space-y-2">
            <div class="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>{{ template.category }}</span>
              <span>{{ template.templateType }}</span>
              <span>{{ template.emotionCurve }}</span>
            </div>
            <div class="space-y-1">
              <h3 class="text-lg font-semibold text-slate-950">{{ template.name }}</h3>
              <p class="text-sm leading-6 text-slate-600">{{ template.tagline }}</p>
            </div>
            <p class="text-xs text-slate-500">
              {{ template.recommendedLabel }} · {{ template.applicableTo.join(' / ') }}
            </p>
          </div>

          <div class="flex shrink-0 flex-wrap gap-2">
            <QyButton size="sm" @click="openTemplateDetail(template.id)">查看详情</QyButton>
          </div>
        </article>
      </div>
    </section>

    <TemplateDetailDrawer
      v-model="detailDrawerVisible"
      :template="selectedTemplate"
      :submitting="isApplyingTemplate"
      @apply="openCreateDialogFromTemplate"
    />

    <ProjectCreateDialog
      v-model:visible="createDialogVisible"
      :submitting="isApplyingTemplate"
      :template-name="selectedTemplate?.name"
      :initial-title="selectedTemplate ? `${selectedTemplate.name}新项目` : ''"
      @submit="handleCreateFromTemplate"
    />
  </WorkbenchShell>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { QyButton, QyEmpty, QySelect } from '@/design-system/components'
import { message } from '@/design-system/services'
import WorkbenchShell from '@/modules/writer/components/workbench/WorkbenchShell.vue'
import ProjectCreateDialog from '@/modules/writer/components/workbench/ProjectCreateDialog.vue'
import TemplateDetailDrawer from '@/modules/writer/components/workbench/TemplateDetailDrawer.vue'
import { WRITER_ROUTE_NAMES } from '@/modules/writer/routes'
import {
  createProjectFromTemplate,
  getWorkbenchTemplateDetail,
  listWorkbenchTemplateCategories,
  listWorkbenchTemplates,
} from '@/modules/writer/services/workbenchTemplate.service'
import type { TemplateCatalogItem } from '@/modules/writer/types/workbench'

const router = useRouter()

const categories = listWorkbenchTemplateCategories()
const templates = listWorkbenchTemplates()

const lastProjectId = computed(
  () => window.localStorage.getItem('qingyu-editor:last-project') || '',
)

const activeCategory = ref('all')
const selectedTemplateId = ref<TemplateCatalogItem['id'] | null>(null)
const detailDrawerVisible = ref(false)
const createDialogVisible = ref(false)
const isApplyingTemplate = ref(false)

const categoryOptions = categories.map((category) => ({
  label: `${category.label} (${category.count})`,
  value: category.id,
}))

const filteredTemplates = computed(() =>
  activeCategory.value === 'all'
    ? templates
    : templates.filter((template) => template.category === activeCategory.value),
)

const selectedTemplate = computed(() =>
  selectedTemplateId.value ? getWorkbenchTemplateDetail(selectedTemplateId.value) : null,
)

function openTemplateDetail(templateId: TemplateCatalogItem['id']) {
  selectedTemplateId.value = templateId
  detailDrawerVisible.value = true
}

function openCreateDialogFromTemplate() {
  if (!selectedTemplate.value) {
    return
  }
  createDialogVisible.value = true
}

async function handleCreateFromTemplate(payload: { title: string; summary: string }) {
  if (!selectedTemplate.value) {
    return
  }

  isApplyingTemplate.value = true
  try {
    const result = await createProjectFromTemplate({
      templateId: selectedTemplate.value.id,
      title: payload.title,
      summary: payload.summary,
    })

    createDialogVisible.value = false
    detailDrawerVisible.value = false
    message.success(`已基于 ${selectedTemplate.value.name} 创建新项目`)
    router.push({
      name: WRITER_ROUTE_NAMES.project,
      params: { projectId: result.projectId },
      query: result.chapterId ? { chapterId: result.chapterId } : undefined,
    })
  } catch (error) {
    console.error('[WriterTemplateCenter] 模板创建失败:', error)
    message.error('模板应用失败，请稍后重试')
  } finally {
    isApplyingTemplate.value = false
  }
}
</script>
