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
          <h2 class="writer-template-heading text-lg font-semibold">模板列表</h2>
          <p class="writer-template-muted text-sm">{{ filteredTemplates.length }} 个模板</p>
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
                class="writer-template-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl"
              >
                <QyIcon name="Collection" :size="18" />
              </div>
              <div class="min-w-0">
                <div class="writer-template-heading text-sm font-semibold">当前分类没有模板</div>
                <p class="writer-template-muted mt-1 text-sm">切换分类后再试。</p>
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
          class="writer-template-card rounded-3xl px-4 py-4"
        >
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div class="min-w-0 flex-1 space-y-2">
              <div class="writer-template-muted flex flex-wrap items-center gap-2 text-xs">
                <span class="writer-template-chip px-2 py-1 font-medium">
                  {{ template.category }}
                </span>
                <span>{{ template.templateType }}</span>
                <span>{{ template.emotionCurve }}</span>
              </div>

              <button type="button" class="block text-left" @click="openTemplateDetail(template.id)">
                <div class="writer-template-heading text-base font-semibold">{{ template.name }}</div>
                <div class="writer-template-muted mt-1 text-sm">{{ template.tagline }}</div>
              </button>

              <div class="writer-template-muted flex flex-wrap items-center gap-3 text-xs">
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
const { openCreatedProject } = useWriterProjectEntryActions()

const categories = ref<Array<{ id: string; label: string; count: number }>>([])
const templates = ref<TemplateCatalogItem[]>([])

const sortedProjects = computed(() => sortProjectsByRecent(projectStore.projects))
const lastProjectId = computed(() => sortedProjects.value[0]?.id || '')

const activeCategory = ref('all')
const selectedTemplateId = ref<TemplateCatalogItem['id'] | null>(null)
const selectedTemplateDetail = ref<Awaited<ReturnType<typeof getWorkbenchTemplateDetail>> | null>(null)
const detailDrawerVisible = ref(false)
const createDialogVisible = ref(false)
const isApplyingTemplate = ref(false)

const categoryOptions = computed(() =>
  categories.value.map((category) => ({
    label: `${category.label} (${category.count})`,
    value: category.id,
  })),
)

const filteredTemplates = computed(() =>
  activeCategory.value === 'all'
    ? templates.value
    : templates.value.filter((template) => template.category === activeCategory.value),
)
const selectedTemplate = computed(() => selectedTemplateDetail.value)

onMounted(async () => {
  await projectStore.loadList()
  categories.value = await listWorkbenchTemplateCategories()
  templates.value = await listWorkbenchTemplates()
})

async function openTemplateDetail(templateId: TemplateCatalogItem['id']) {
  selectedTemplateId.value = templateId
  selectedTemplateDetail.value = await getWorkbenchTemplateDetail(templateId)
  detailDrawerVisible.value = true
}

function openCreateDialogFromTemplate() {
  if (!selectedTemplateDetail.value) {
    return
  }
  createDialogVisible.value = true
}

async function handleCreateFromTemplate(payload: { title: string; summary: string }) {
  if (!selectedTemplateDetail.value) {
    return
  }

  isApplyingTemplate.value = true
  try {
    const result = await createProjectFromTemplate({
      templateId: selectedTemplateDetail.value.id,
      title: payload.title,
      summary: payload.summary,
    })

    createDialogVisible.value = false
    detailDrawerVisible.value = false
    message.success(`已基于 ${selectedTemplateDetail.value.name} 创建新项目`)
    await openCreatedProject(result, result.chapterId ? { chapterId: result.chapterId } : undefined)
  } catch (error) {
    console.error('[WriterTemplateCenter] 模板创建失败:', error)
    message.error('模板应用失败，请稍后重试')
  } finally {
    isApplyingTemplate.value = false
  }
}
</script>

<style scoped>
.writer-template-heading {
  color: var(--editor-text-primary, #0f172a);
}

.writer-template-muted {
  color: var(--editor-text-muted, #64748b);
}

.writer-template-icon {
  background: var(--editor-layer-strong, #f1f5f9);
  color: var(--editor-text-muted, #64748b);
}

.writer-template-card {
  border: 1px solid var(--editor-border, #e2e8f0);
  background: var(--editor-layer-panel, #ffffff);
  box-shadow: var(--editor-shadow-sm, 0 1px 3px rgba(15, 23, 42, 0.08));
}

.writer-template-chip {
  border-radius: 999px;
  background: var(--editor-layer-strong, #f1f5f9);
  color: var(--editor-text-secondary, #334155);
}
</style>
