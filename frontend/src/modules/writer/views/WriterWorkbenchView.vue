<template>
  <WorkbenchShell
    title="开始今天的创作"
    description="继续最近项目，或从空白、导入、模板开始。"
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

    <section class="grid gap-4 pt-1 md:grid-cols-2 xl:grid-cols-4">
      <button
        v-for="action in quickActions"
        :key="action.id"
        type="button"
        class="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left transition-colors hover:border-slate-300 hover:bg-slate-50"
        @click="handleQuickAction(action.id)"
      >
        <div class="flex items-start gap-3">
          <div
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
            :class="
              action.emphasis === 'primary'
                ? 'bg-sky-50 text-sky-600'
                : 'bg-slate-100 text-slate-500'
            "
          >
            <QyIcon :name="action.icon" :size="18" />
          </div>
          <div class="min-w-0 space-y-1">
            <div class="text-sm font-semibold text-slate-950">{{ action.label }}</div>
            <p class="text-xs leading-5 text-slate-500">{{ action.description }}</p>
          </div>
        </div>
      </button>
    </section>

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

      <div
        v-if="isLoading"
        class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <QyCard
          v-for="index in recentProjectSkeletonRows"
          :key="index"
          variant="outlined"
          shadow="never"
          padding="sm"
          class="rounded-3xl"
        >
          <div class="space-y-3">
            <div class="rounded-[24px] border border-slate-100 bg-slate-50/80 p-3">
              <div class="flex items-center justify-between">
                <Skeleton type="text" width="48px" height="18px" />
                <Skeleton type="text" width="40px" height="18px" />
              </div>
              <div class="mt-8 space-y-2">
                <Skeleton type="text" width="132px" height="18px" />
                <Skeleton type="text" width="108px" height="18px" />
              </div>
            </div>
            <div class="space-y-2">
              <Skeleton type="text" width="144px" height="18px" />
              <div class="flex items-center justify-between gap-3">
                <Skeleton type="text" width="72px" height="12px" />
                <Skeleton type="text" width="88px" height="12px" />
              </div>
            </div>
            <Skeleton type="rect" width="100%" height="32px" class="rounded-xl" />
          </div>
        </QyCard>
      </div>

      <QyEmpty v-else-if="recentProjects.length === 0" title="还没有项目" type="list">
        <template #description>
          当前没有可继续的项目，先从空白新建、导入 ZIP，或进入模板中心开始。
        </template>
        <template #action>
          <div class="flex flex-wrap justify-center gap-3">
            <QyButton @click="createDialogVisible = true">新建项目</QyButton>
            <QyButton variant="ghost" @click="openImportPicker">导入项目</QyButton>
          </div>
        </template>
      </QyEmpty>

      <div v-else class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <QyCard
          v-for="project in recentProjects"
          :key="project.id"
          variant="outlined"
          shadow="hover"
          padding="sm"
          class="rounded-3xl"
        >
          <div class="space-y-3">
            <button
              type="button"
              class="block w-full rounded-[24px] border border-slate-100 bg-slate-50/80 p-3 text-left transition-colors hover:border-slate-200 hover:bg-slate-50"
              @click="continueProject(project)"
            >
              <div class="flex items-center justify-between gap-3 text-xs text-slate-500">
                <span class="rounded-full bg-white px-2.5 py-1 font-medium text-slate-700">
                  {{ project.category }}
                </span>
                <span>{{ project.statusLabel }}</span>
              </div>
              <div class="mt-10 flex min-h-[84px] items-end">
                <div class="space-y-2">
                  <div class="line-clamp-2 text-lg font-semibold leading-7 text-slate-950">
                    {{ project.title }}
                  </div>
                  <div class="text-xs text-slate-500">
                    {{ project.lastChapterTitle || '从项目入口继续创作' }}
                  </div>
                </div>
              </div>
            </button>

            <div class="space-y-2">
              <div class="line-clamp-1 text-sm font-medium text-slate-800">
                {{ formatNumber(project.totalWords) }} 字
              </div>
              <div class="flex items-center justify-between gap-3 text-xs text-slate-500">
                <span>{{ project.chapterCount }} 章</span>
                <span>{{ formatDate(project.updatedAt) }}</span>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <QyButton size="sm" class="flex-1" @click="continueProject(project)">继续</QyButton>
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
import { QyButton, QyCard, QyEmpty, QyIcon, Skeleton } from '@/design-system/components'
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
import type {
  WorkbenchQuickAction,
  WorkbenchRecentProjectCard,
} from '@/modules/writer/types/workbench'

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

const quickActions = computed<WorkbenchQuickAction[]>(() => {
  const actions: WorkbenchQuickAction[] = [
    {
      id: 'create',
      label: '新建项目',
      description: '直接走空白创建，随后进入正文工作区。',
      icon: 'EditPen',
      emphasis: 'primary',
    },
    {
      id: 'import',
      label: '导入项目',
      description: '沿用现有 ZIP 导入能力，把历史稿件接进本地项目。',
      icon: 'Upload',
      emphasis: 'secondary',
    },
    {
      id: 'templates',
      label: '模板中心',
      description: '先预览大纲/角色/设定，再应用到新项目。',
      icon: 'Collection',
      emphasis: 'secondary',
    },
  ]

  if (recentProjects.value.length > 0) {
    actions.unshift({
      id: 'continue',
      label: '继续创作',
      description: recentProjects.value[0]?.lastChapterTitle
        ? `返回 ${recentProjects.value[0].lastChapterTitle}`
        : '回到最近项目的正文工作区。',
      icon: 'BookOpen',
      emphasis: 'primary',
    })
  }

  return actions
})

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

function handleQuickAction(actionId: WorkbenchQuickAction['id']) {
  if (actionId === 'create') {
    createDialogVisible.value = true
    return
  }

  if (actionId === 'import') {
    openImportPicker()
    return
  }

  if (actionId === 'templates') {
    router.push({ name: WRITER_ROUTE_NAMES.templates })
    return
  }

  if (actionId === 'continue' && recentProjects.value[0]) {
    continueProject(recentProjects.value[0])
  }
}

onMounted(refreshWorkbench)
</script>
