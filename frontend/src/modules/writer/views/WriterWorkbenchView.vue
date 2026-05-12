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

    <section class="space-y-5">
      <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <h2 class="text-lg font-semibold text-slate-950">最近项目</h2>
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
        <QyCard
          variant="outlined"
          shadow="never"
          padding="sm"
          class="rounded-3xl"
        >
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex min-w-0 items-center gap-3">
              <div
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-500"
              >
                <QyIcon name="BookOpen" :size="18" />
              </div>
              <div class="min-w-0">
                <div class="text-sm font-semibold text-slate-950">还没有项目</div>
                <p class="mt-1 text-sm text-slate-500">新建一个项目，或者先导入现有稿件。</p>
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
              <div class="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span class="rounded-full bg-slate-100 px-2 py-1 font-medium text-slate-700">
                  {{ project.category }}
                </span>
                <span>{{ project.statusLabel }}</span>
                <span>{{ formatDate(project.updatedAt) }}</span>
              </div>

              <button
                type="button"
                class="block text-left"
                @click="continueProject(project)"
              >
                <div class="text-base font-semibold text-slate-950">{{ project.title }}</div>
                <div class="mt-1 text-sm text-slate-500">
                  {{ project.lastChapterTitle || '从项目入口继续创作' }}
                </div>
              </button>

              <div class="flex flex-wrap items-center gap-3 text-xs text-slate-500">
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
import WorkbenchShell from '@/modules/writer/components/workbench/WorkbenchShell.vue'
import ProjectCreateDialog from '@/modules/writer/components/workbench/ProjectCreateDialog.vue'
import { useProjectStore } from '@/modules/writer/stores/projectStore'
import { WRITER_ROUTE_NAMES } from '@/modules/writer/routes'
import {
  buildWorkbenchRecentProjectCards,
  importProjectArchive,
  sortProjectsByRecent,
} from '@/modules/writer/services/workbenchProject.service'
import type { WorkbenchRecentProjectCard } from '@/modules/writer/types/workbench'

const router = useRouter()
const projectStore = useProjectStore()

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

function openProject(projectId: string) {
  router.push({
    name: WRITER_ROUTE_NAMES.project,
    params: { projectId },
  })
}

function continueProject(project: WorkbenchRecentProjectCard) {
  router.push(project.continueTarget)
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

  const result = await importProjectArchive(file)
  if (!result.success || !result.projectId) {
    message.error(result.error || '导入失败，请重试')
    return
  }

  await refreshWorkbench()
  message.success(`已导入项目：${result.title || '未命名项目'}`)
  router.push({
    name: WRITER_ROUTE_NAMES.project,
    params: { projectId: result.projectId },
  })
}

async function handleCreateProject(payload: { title: string; summary: string }) {
  isCreating.value = true
  try {
    const created = await projectStore.create({
      title: payload.title,
      summary: payload.summary,
    })
    const createdProject = created as { id?: string; projectId?: string } | undefined
    const projectId = createdProject?.id || createdProject?.projectId
    createDialogVisible.value = false
    await refreshWorkbench()

    if (projectId) {
      router.push({
        name: WRITER_ROUTE_NAMES.project,
        params: { projectId },
      })
    }
  } catch (error) {
    console.error('[WriterWorkbench] 创建项目失败:', error)
    message.error('创建项目失败，请稍后重试')
  } finally {
    isCreating.value = false
  }
}

onMounted(refreshWorkbench)
</script>
