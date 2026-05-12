<template>
  <WorkbenchShell
    title="项目列表"
    description="浏览全部项目，并在这里完成筛选和继续创作。"
    eyebrow="项目页"
    active-nav-id="projects"
    :last-project-id="lastProjectId"
  >
    <template #actions>
      <QyButton size="sm" variant="ghost" @click="openImportPicker">导入 ZIP</QyButton>
      <QyButton size="sm" @click="createDialogVisible = true">新建项目</QyButton>
    </template>

    <section class="space-y-4">
      <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div class="space-y-1">
          <h2 class="text-lg font-semibold text-slate-950">全部项目</h2>
          <p class="text-sm text-slate-500">{{ filteredProjects.length }} 个项目</p>
        </div>

        <div class="grid gap-3 md:grid-cols-[minmax(0,2fr)_180px_180px] lg:min-w-[720px]">
          <QyInput v-model="searchQuery" clearable placeholder="搜索项目名或摘要" />
          <QySelect v-model="statusFilter" :options="statusSelectOptions" />
          <QySelect v-model="sortKey" :options="sortOptions" />
        </div>
      </div>

      <div v-if="isLoading" class="space-y-3">
        <QyCard
          v-for="index in loadingRows"
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

      <div v-else-if="filteredProjects.length === 0">
        <QyCard variant="outlined" shadow="never" padding="sm" class="rounded-3xl">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex min-w-0 items-center gap-3">
              <div
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-500"
              >
                <QyIcon name="Search" :size="18" />
              </div>
              <div class="min-w-0">
                <div class="text-sm font-semibold text-slate-950">没有匹配结果</div>
                <p class="mt-1 text-sm text-slate-500">试试清空筛选条件，或者直接新建一个项目。</p>
              </div>
            </div>

            <div class="flex flex-wrap gap-2">
              <QyButton size="sm" variant="ghost" @click="resetFilters">清空筛选</QyButton>
              <QyButton size="sm" @click="createDialogVisible = true">新建项目</QyButton>
            </div>
          </div>
        </QyCard>
      </div>

      <div v-else class="space-y-3">
        <article
          v-for="project in filteredProjects"
          :key="project.id"
          class="rounded-3xl border border-slate-100 bg-white px-4 py-4"
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

              <button type="button" class="block text-left" @click="continueProject(project)">
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

            <div class="flex shrink-0 flex-wrap gap-2">
              <QyButton size="sm" @click="continueProject(project)">继续</QyButton>
              <QyButton size="sm" variant="ghost" @click="openProject(project.id)">进入</QyButton>
            </div>
          </div>
        </article>
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
import { QyButton, QyCard, QyIcon, QyInput, QySelect, Skeleton } from '@/design-system/components'
import { message } from '@/design-system/services'
import WorkbenchShell from '@/modules/writer/components/workbench/WorkbenchShell.vue'
import ProjectCreateDialog from '@/modules/writer/components/workbench/ProjectCreateDialog.vue'
import { useWriterProjectEntryActions } from '@/modules/writer/composables/useWriterProjectEntryActions'
import {
  buildWorkbenchRecentProjectCards,
  getProjectStatusLabel,
  sortProjectsByRecent,
} from '@/modules/writer/services/workbenchProject.service'
import { useProjectStore } from '@/modules/writer/stores/projectStore'
import type { WorkbenchRecentProjectCard } from '@/modules/writer/types/workbench'

const projectStore = useProjectStore()
const { openProject, continueProject, openCreatedProject, importProjectAndEnter } =
  useWriterProjectEntryActions()

const isLoading = ref(true)
const isCreating = ref(false)
const projectCards = ref<WorkbenchRecentProjectCard[]>([])
const createDialogVisible = ref(false)
const importInputRef = ref<HTMLInputElement | null>(null)
const loadingRows = [1, 2, 3]

const searchQuery = ref('')
const statusFilter = ref('all')
const sortKey = ref<'updated-desc' | 'updated-asc' | 'title-asc' | 'words-desc'>('updated-desc')

const statusOptions = computed(() =>
  Array.from(new Set(projectStore.projects.map((project) => project.status)))
    .filter(Boolean)
    .map((status) => ({
      value: status,
      label: getProjectStatusLabel(status),
    })),
)

const statusSelectOptions = computed(() => [
  { label: '全部状态', value: 'all' },
  ...statusOptions.value,
])

const sortOptions = [
  { label: '最近更新', value: 'updated-desc' },
  { label: '最早更新', value: 'updated-asc' },
  { label: '标题 A-Z', value: 'title-asc' },
  { label: '字数最多', value: 'words-desc' },
]

const lastProjectId = computed(() => sortProjectsByRecent(projectStore.projects)[0]?.id || '')

const filteredProjects = computed(() => {
  const keyword = searchQuery.value.trim().toLowerCase()
  const filtered = projectCards.value.filter((project) => {
    const matchesKeyword =
      !keyword ||
      project.title.toLowerCase().includes(keyword) ||
      project.summary.toLowerCase().includes(keyword)
    const matchesStatus = statusFilter.value === 'all' || project.status === statusFilter.value

    return matchesKeyword && matchesStatus
  })

  return filtered.sort((left, right) => {
    if (sortKey.value === 'updated-asc') {
      return Date.parse(left.updatedAt) - Date.parse(right.updatedAt)
    }
    if (sortKey.value === 'title-asc') {
      return left.title.localeCompare(right.title, 'zh-CN')
    }
    if (sortKey.value === 'words-desc') {
      return right.totalWords - left.totalWords
    }
    return Date.parse(right.updatedAt) - Date.parse(left.updatedAt)
  })
})

function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value || '时间待定'
  }

  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('zh-CN').format(value)
}

function resetFilters() {
  searchQuery.value = ''
  statusFilter.value = 'all'
  sortKey.value = 'updated-desc'
}

async function refreshProjects() {
  isLoading.value = true
  try {
    await projectStore.loadList()
    projectCards.value = await buildWorkbenchRecentProjectCards(
      projectStore.projects,
      Math.max(projectStore.projects.length, 1),
    )
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

  await importProjectAndEnter(file, { refresh: refreshProjects })
}

async function handleCreateProject(payload: { title: string; summary: string }) {
  isCreating.value = true
  try {
    const created = await projectStore.create({
      title: payload.title,
      summary: payload.summary,
    })
    createDialogVisible.value = false
    await refreshProjects()

    const createdProject = created as { id?: string; projectId?: string } | undefined
    await openCreatedProject(createdProject)
  } catch (error) {
    console.error('[WriterProjects] 创建项目失败:', error)
    message.error('创建项目失败，请稍后重试')
  } finally {
    isCreating.value = false
  }
}

onMounted(refreshProjects)
</script>
