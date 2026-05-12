<template>
  <WorkbenchShell
    title="项目列表"
    description="完整浏览、筛选和排序都放在这里，首页只保留最近项目。"
    eyebrow="项目页"
    active-nav-id="projects"
    :last-project-id="lastProjectId"
  >
    <template #actions>
      <QyButton size="sm" variant="ghost" @click="openImportPicker">导入 ZIP</QyButton>
      <QyButton size="sm" @click="createDialogVisible = true">新建项目</QyButton>
    </template>

    <section class="space-y-4">
      <div class="space-y-1">
        <h2 class="text-lg font-semibold text-slate-950">项目结果</h2>
        <p class="text-sm text-slate-500">{{ filteredProjects.length }} 个项目符合当前筛选</p>
      </div>

      <div class="grid gap-4 lg:grid-cols-[minmax(0,2fr)_1fr_1fr]">
        <label class="block space-y-2">
          <span class="text-sm font-medium text-slate-700">搜索</span>
          <QyInput v-model="searchQuery" clearable placeholder="按项目名或摘要搜索" />
        </label>
        <label class="block space-y-2">
          <span class="text-sm font-medium text-slate-700">状态</span>
          <QySelect v-model="statusFilter" :options="statusSelectOptions" />
        </label>
        <label class="block space-y-2">
          <span class="text-sm font-medium text-slate-700">排序</span>
          <QySelect v-model="sortKey" :options="sortOptions" />
        </label>
      </div>

      <div v-if="isLoading" class="text-sm text-slate-500">正在整理项目列表...</div>

      <QyEmpty v-else-if="filteredProjects.length === 0" title="没有匹配结果" type="search">
        <template #description>
          试试清空筛选条件，或者直接新建一个项目。
        </template>
      </QyEmpty>

      <div v-else class="divide-y divide-slate-100 border-t border-slate-100">
        <article
          v-for="project in filteredProjects"
          :key="project.id"
          class="grid gap-5 py-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
        >
          <div class="min-w-0 space-y-2">
            <div class="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>{{ project.statusLabel }}</span>
              <span>{{ formatDate(project.updatedAt) }}</span>
            </div>
            <div class="space-y-1">
              <h3 class="text-lg font-semibold text-slate-950">{{ project.title }}</h3>
              <p class="text-sm leading-6 text-slate-600">{{ project.summary }}</p>
            </div>
            <div class="flex flex-wrap gap-4 text-xs text-slate-500">
              <span>分类：{{ project.category }}</span>
              <span>章节：{{ project.chapterCount }}</span>
              <span>字数：{{ formatNumber(project.totalWords) }}</span>
            </div>
            <p class="text-xs text-slate-500">
              {{
                project.lastChapterTitle
                  ? `最近章节：${project.lastChapterTitle}`
                  : '还没有最近章节定位。'
              }}
            </p>
          </div>

          <div class="flex shrink-0 flex-wrap gap-2">
            <QyButton size="sm" variant="ghost" @click="openProject(project.id)">进入项目</QyButton>
            <QyButton size="sm" @click="router.push(project.continueTarget)">继续创作</QyButton>
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
import { useRouter } from 'vue-router'
import { QyButton, QyEmpty, QyInput, QySelect } from '@/design-system/components'
import { message } from '@/design-system/services'
import WorkbenchShell from '@/modules/writer/components/workbench/WorkbenchShell.vue'
import ProjectCreateDialog from '@/modules/writer/components/workbench/ProjectCreateDialog.vue'
import { WRITER_ROUTE_NAMES } from '@/modules/writer/routes'
import {
  buildWorkbenchRecentProjectCards,
  getProjectStatusLabel,
  importProjectArchive,
  sortProjectsByRecent,
} from '@/modules/writer/services/workbenchProject.service'
import { useProjectStore } from '@/modules/writer/stores/projectStore'
import type { WorkbenchRecentProjectCard } from '@/modules/writer/types/workbench'

const router = useRouter()
const projectStore = useProjectStore()

const isLoading = ref(true)
const isCreating = ref(false)
const projectCards = ref<WorkbenchRecentProjectCard[]>([])
const createDialogVisible = ref(false)
const importInputRef = ref<HTMLInputElement | null>(null)

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

function openProject(projectId: string) {
  router.push({
    name: WRITER_ROUTE_NAMES.project,
    params: { projectId },
  })
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

  await refreshProjects()
  message.success(`已导入项目：${result.title || '未命名项目'}`)
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
    const projectId = createdProject?.id || createdProject?.projectId
    if (projectId) {
      openProject(projectId)
    }
  } catch (error) {
    console.error('[WriterProjects] 创建项目失败:', error)
    message.error('创建项目失败，请稍后重试')
  } finally {
    isCreating.value = false
  }
}

onMounted(refreshProjects)
</script>
