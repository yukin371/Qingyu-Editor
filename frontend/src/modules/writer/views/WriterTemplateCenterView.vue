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
      <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div class="space-y-1">
          <h2 class="text-lg font-semibold text-slate-950">模板列表</h2>
          <p class="text-sm text-slate-500">{{ filteredTemplates.length }} 个模板</p>
        </div>

        <div class="w-full lg:w-[280px]">
          <QySelect v-model="activeCategory" :options="categoryOptions" />
        </div>
      </div>

      <div v-if="filteredTemplates.length === 0">
        <QyCard variant="outlined" shadow="never" padding="sm" class="rounded-3xl">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex min-w-0 items-center gap-3">
              <div
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-500"
              >
                <QyIcon name="Collection" :size="18" />
              </div>
              <div class="min-w-0">
                <div class="text-sm font-semibold text-slate-950">当前分类没有模板</div>
                <p class="mt-1 text-sm text-slate-500">切换分类后再试。</p>
              </div>
            </div>

            <QyButton size="sm" variant="ghost" @click="activeCategory = 'all'">全部模板</QyButton>
          </div>
        </QyCard>
      </div>

      <div v-else class="space-y-3">
        <article
          v-for="template in filteredTemplates"
          :key="template.id"
          class="rounded-3xl border border-slate-100 bg-white px-4 py-4"
        >
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div class="min-w-0 flex-1 space-y-2">
              <div class="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span class="rounded-full bg-slate-100 px-2 py-1 font-medium text-slate-700">
                  {{ template.category }}
                </span>
                <span>{{ template.templateType }}</span>
                <span>{{ template.emotionCurve }}</span>
              </div>

              <button type="button" class="block text-left" @click="openTemplateDetail(template.id)">
                <div class="text-base font-semibold text-slate-950">{{ template.name }}</div>
                <div class="mt-1 text-sm text-slate-500">{{ template.tagline }}</div>
              </button>

              <div class="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span>{{ template.recommendedLabel }}</span>
                <span>{{ template.applicableTo.slice(0, 2).join(' / ') }}</span>
              </div>
            </div>

            <div class="flex shrink-0 flex-wrap gap-2">
              <QyButton size="sm" @click="openTemplateDetail(template.id)">预览</QyButton>
            </div>
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
      submit-text="应用并创建"
      @submit="handleCreateFromTemplate"
    />
  </WorkbenchShell>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { QyButton, QyCard, QyIcon, QySelect } from '@/design-system/components'
import { message } from '@/design-system/services'
import WorkbenchShell from '@/modules/writer/components/workbench/WorkbenchShell.vue'
import ProjectCreateDialog from '@/modules/writer/components/workbench/ProjectCreateDialog.vue'
import TemplateDetailDrawer from '@/modules/writer/components/workbench/TemplateDetailDrawer.vue'
import { useWriterProjectEntryActions } from '@/modules/writer/composables/useWriterProjectEntryActions'
import { WRITER_ROUTE_NAMES } from '@/modules/writer/routes'
import {
  createProjectFromTemplate,
  getWorkbenchTemplateDetail,
  listWorkbenchTemplateCategories,
  listWorkbenchTemplates,
} from '@/modules/writer/services/workbenchTemplate.service'
import { sortProjectsByRecent } from '@/modules/writer/services/workbenchProject.service'
import { useProjectStore } from '@/modules/writer/stores/projectStore'
import type { TemplateCatalogItem } from '@/modules/writer/types/workbench'

const router = useRouter()
const projectStore = useProjectStore()
const { openProject } = useWriterProjectEntryActions()

const categories = listWorkbenchTemplateCategories()
const templates = listWorkbenchTemplates()

const sortedProjects = computed(() => sortProjectsByRecent(projectStore.projects))
const lastProjectId = computed(() => sortedProjects.value[0]?.id || '')

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

onMounted(async () => {
  await projectStore.loadList()
})

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
    await openProject(
      result.projectId,
      result.chapterId ? { chapterId: result.chapterId } : undefined,
    )
  } catch (error) {
    console.error('[WriterTemplateCenter] 模板创建失败:', error)
    message.error('模板应用失败，请稍后重试')
  } finally {
    isApplyingTemplate.value = false
  }
}
</script>
