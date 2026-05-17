<template>
  <WorkbenchShell
    title="开始今天的创作"
    description="从空白、导入或模板开始。"
    active-nav-id="workbench"
    :last-project-id="lastProjectId"
  >
    <template #actions>
      <QyButton size="sm" variant="ghost" @click="openImportPicker">导入项目</QyButton>
      <QyButton
        size="sm"
        variant="ghost"
        @click="router.push({ name: WRITER_ROUTE_NAMES.templates })"
      >
        模板中心
      </QyButton>
      <QyButton size="sm" @click="createDialogVisible = true">新建项目</QyButton>
    </template>

    <section class="space-y-4">
      <div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 class="writer-workbench-heading text-lg font-semibold">五阶段创作流程</h2>
          <p class="writer-workbench-muted mt-1 max-w-3xl text-sm leading-6">
            先收灵感，再搭地基，接着绘蓝图，最后落到逐章施工和复盘成长。每个阶段都能直接进入对应的工作面。
          </p>
        </div>
        <QyButton
          size="sm"
          variant="ghost"
          @click="router.push({ name: WRITER_ROUTE_NAMES.projects })"
        >
          打开项目列表
        </QyButton>
      </div>

      <div class="grid gap-3 lg:grid-cols-5">
        <button
          v-for="stage in creativeFlowStages"
          :key="stage.id"
          type="button"
          class="writer-stage-card rounded-2xl p-4 text-left transition hover:-translate-y-0.5"
          @click="openStage(stage.id)"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="writer-workbench-ghost text-xs font-semibold uppercase tracking-[0.16em]">
                Stage {{ stage.order }}
              </div>
              <div class="writer-workbench-heading mt-2 text-base font-semibold">{{ stage.title }}</div>
            </div>
            <QyIcon name="ArrowRight" :size="16" class="writer-workbench-ghost shrink-0" />
          </div>
          <p class="writer-workbench-muted mt-3 text-sm leading-6">{{ stage.subtitle }}</p>
          <div class="writer-stage-card__tasks mt-3">
            <span
              v-for="task in stage.tasks.slice(0, 3)"
              :key="task"
              class="writer-stage-card__task"
            >
              {{ task }}
            </span>
          </div>
        </button>
      </div>
    </section>

    <section class="space-y-5">
      <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <h2 class="writer-workbench-heading text-lg font-semibold">最近项目</h2>
        <QyButton
          size="sm"
          variant="ghost"
          @click="router.push({ name: WRITER_ROUTE_NAMES.projects })"
        >
          查看全部项目
        </QyButton>
      </div>

      <div v-if="isLoading" class="space-y-3">
        <QyCard
          v-for="index in recentProjectSkeletonRows"
          :key="index"
          variant="outlined"
          shadow="never"
          padding="sm"
          class="rounded-3xl"
        >
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div class="min-w-0 flex-1 space-y-2">
              <Skeleton type="text" width="156px" height="18px" />
              <div class="flex flex-wrap items-center gap-3">
                <Skeleton type="text" width="64px" height="12px" />
                <Skeleton type="text" width="72px" height="12px" />
                <Skeleton type="text" width="96px" height="12px" />
              </div>
            </div>
            <Skeleton type="rect" width="88px" height="32px" class="rounded-xl" />
          </div>
        </QyCard>
      </div>

      <div v-else-if="recentProjects.length === 0">
        <QyCard variant="outlined" shadow="never" padding="sm" class="rounded-3xl">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex min-w-0 items-center gap-3">
              <div
                class="writer-workbench-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl"
              >
                <QyIcon name="BookOpen" :size="18" />
              </div>
              <div class="min-w-0">
                <div class="writer-workbench-heading text-sm font-semibold">还没有项目</div>
                <p class="writer-workbench-muted mt-1 text-sm">新建一个项目，或者先导入现有稿件。</p>
              </div>
            </div>

            <div class="flex flex-wrap gap-2">
              <QyButton size="sm" @click="createDialogVisible = true">新建项目</QyButton>
              <QyButton size="sm" variant="ghost" @click="openImportPicker">导入</QyButton>
            </div>
          </div>
        </QyCard>
      </div>

      <div v-else class="space-y-3">
        <QyCard
          v-for="project in recentProjects"
          :key="project.id"
          variant="outlined"
          shadow="hover"
          padding="sm"
          class="rounded-3xl"
        >
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div class="min-w-0 flex-1 space-y-2">
              <div class="writer-workbench-muted flex flex-wrap items-center gap-2 text-xs">
                <span class="writer-workbench-chip px-2 py-1 font-medium">
                  {{ project.category }}
                </span>
                <span>{{ project.statusLabel }}</span>
                <span>{{ formatDate(project.updatedAt) }}</span>
              </div>

              <button type="button" class="block text-left" @click="continueProject(project)">
                <div class="writer-workbench-heading text-base font-semibold">{{ project.title }}</div>
                <div class="writer-workbench-muted mt-1 text-sm">
                  {{ project.lastChapterTitle || '从项目入口继续创作' }}
                </div>
              </button>

              <div class="writer-workbench-muted flex flex-wrap items-center gap-3 text-xs">
                <span>{{ project.chapterCount }} 章</span>
                <span>{{ formatNumber(project.totalWords) }} 字</span>
              </div>
            </div>

            <div class="flex shrink-0 items-center gap-2">
              <QyButton size="sm" @click="continueProject(project)">继续</QyButton>
              <QyButton size="sm" variant="ghost" @click="openProject(project.id)">进入</QyButton>
            </div>
          </div>
        </QyCard>
      </div>
    </section>

    <input
      ref="importInputRef"
      class="hidden"
      type="file"
      accept=".zip"
      @change="handleImportChange"
    />

    <ProjectCreateDialog
      v-model:visible="createDialogVisible"
      :submitting="isCreating"
      @submit="handleCreateProject"
    />
  </WorkbenchShell>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { QyButton, QyCard, QyIcon, Skeleton } from '@/design-system/components'
import { message } from '@/design-system/services'
import { creativeFlowStages } from '@/modules/writer/config/creativeFlow'
import WorkbenchShell from '@/modules/writer/components/workbench/WorkbenchShell.vue'
import ProjectCreateDialog from '@/modules/writer/components/workbench/ProjectCreateDialog.vue'
import { useWriterProjectEntryActions } from '@/modules/writer/composables/useWriterProjectEntryActions'
import { useProjectStore } from '@/modules/writer/stores/projectStore'
import { WRITER_ROUTE_NAMES } from '@/modules/writer/routes'
import {
  buildWorkbenchRecentProjectCards,
  ensureProjectBaseSkeleton,
  sortProjectsByRecent,
} from '@/modules/writer/services/workbenchProject.service'
import type { WorkbenchRecentProjectCard } from '@/modules/writer/types/workbench'

const router = useRouter()
const projectStore = useProjectStore()
const { openProject, continueProject, openCreatedProject, importProjectAndEnter } =
  useWriterProjectEntryActions()

const isLoading = ref(true)
const isCreating = ref(false)
const recentProjects = ref<WorkbenchRecentProjectCard[]>([])
const createDialogVisible = ref(false)
const importInputRef = ref<HTMLInputElement | null>(null)
const recentProjectSkeletonRows = [1, 2, 3]

const sortedProjects = computed(() => sortProjectsByRecent(projectStore.projects))
const lastProjectId = computed(
  () => recentProjects.value[0]?.id || sortedProjects.value[0]?.id || '',
)

function formatDate(value: string): string {
  if (!value) {
    return '时间待定'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('zh-CN').format(value)
}

async function refreshWorkbench() {
  isLoading.value = true
  try {
    await projectStore.loadList()
    recentProjects.value = await buildWorkbenchRecentProjectCards(projectStore.projects, 4)
  } finally {
    isLoading.value = false
  }
}

function openImportPicker() {
  importInputRef.value?.click()
}

async function handleImportChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  target.value = ''

  if (!file) {
    return
  }

  await importProjectAndEnter(file, { refresh: refreshWorkbench })
}

async function handleCreateProject(payload: { title: string; summary: string }) {
  isCreating.value = true
  try {
    const created = await projectStore.create({
      title: payload.title,
      summary: payload.summary,
    })
    const createdProject = created as { id?: string; projectId?: string } | undefined
    createDialogVisible.value = false
    await refreshWorkbench()
    const projectId = createdProject?.id || createdProject?.projectId || ''
    const { chapterId } = await ensureProjectBaseSkeleton(projectId)
    await openCreatedProject(createdProject, chapterId ? { chapterId } : undefined)
  } catch (error) {
    console.error('[WriterWorkbench] 创建项目失败:', error)
    message.error('创建项目失败，请稍后重试')
  } finally {
    isCreating.value = false
  }
}

async function openStage(stageId: string) {
  if (!lastProjectId.value) {
    createDialogVisible.value = true
    return
  }

  if (stageId === 'inspiration') {
    await openProject(lastProjectId.value, { stage: stageId, rightTool: 'inspiration' })
    return
  }

  if (stageId === 'review') {
    await openProject(lastProjectId.value, { stage: stageId, rightTool: 'harness' })
    return
  }

  await openProject(lastProjectId.value, { stage: stageId })
}

onMounted(refreshWorkbench)
</script>

<style scoped>
.writer-workbench-heading {
  color: var(--editor-text-primary, #0f172a);
}

.writer-workbench-muted {
  color: var(--editor-text-muted, #64748b);
}

.writer-workbench-ghost {
  color: var(--editor-text-ghost, #94a3b8);
}

.writer-stage-card {
  border: 1px solid var(--editor-border, #e2e8f0);
  background: var(--editor-layer-panel, #ffffff);
  box-shadow: var(--editor-shadow-sm, 0 1px 3px rgba(15, 23, 42, 0.08));
}

.writer-stage-card:hover {
  border-color: var(--editor-border-light, #cbd5e1);
  box-shadow: var(--editor-shadow-md, 0 4px 12px rgba(15, 23, 42, 0.08));
}

.writer-stage-card__tasks {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.writer-stage-card__task {
  border-radius: 999px;
  background: var(--editor-layer-strong, #f1f5f9);
  color: var(--editor-text-secondary, #334155);
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
  padding: 6px 8px;
}

.writer-workbench-icon {
  background: var(--editor-layer-strong, #f1f5f9);
  color: var(--editor-text-muted, #64748b);
}

.writer-workbench-chip {
  border-radius: 999px;
  background: var(--editor-layer-strong, #f1f5f9);
  color: var(--editor-text-secondary, #334155);
}
</style>
