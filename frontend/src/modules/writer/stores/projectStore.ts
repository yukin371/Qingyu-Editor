import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { projectApi } from '../api/project'
import type {
  ProjectSummary,
  ProjectDetailResponse,
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectListResponse,
} from '../api/project'

// 类型别名用于 store 内部
type ProjectDetail = ProjectDetailResponse

function normalizeProjectSummary(raw: any): ProjectSummary {
  return {
    ...raw,
    id: raw?.id || raw?.projectId || '',
    summary: raw?.summary || raw?.description || '',
    coverUrl: raw?.coverUrl || raw?.coverImage || '',
    coverImage: raw?.coverImage || raw?.coverUrl || '',
    genre: raw?.genre || raw?.category || '',
    category: raw?.category || raw?.genre || '',
    totalWords: raw?.totalWords ?? raw?.wordCount ?? 0,
    wordCount: raw?.wordCount ?? raw?.totalWords ?? 0,
    chapterCount: raw?.chapterCount ?? 0,
    updatedAt: raw?.updatedAt || raw?.lastUpdateTime || raw?.createdAt || '',
  }
}

export const useProjectStore = defineStore('writer-project', () => {
  // State
  const projects = ref<ProjectSummary[]>([])
  const currentProject = ref<ProjectDetail | null>(null)
  const loading = ref(false)
  const total = ref(0)

  // Getters
  const currentProjectId = computed(() => currentProject.value?.id)

  // Actions
  async function loadList(params: { page?: number; pageSize?: number; status?: string } = {}) {
    loading.value = true
    try {
      // httpService 响应拦截器会自动解包返回 data
      const res = (await projectApi.list(params)) as unknown as ProjectListResponse
      const list = Array.isArray(res.projects)
        ? res.projects
        : Array.isArray(res.items)
          ? res.items
          : []
      projects.value = list.map(normalizeProjectSummary)
      total.value = res.total
    } finally {
      loading.value = false
    }
  }

  async function loadDetail(id: string) {
    loading.value = true
    try {
      currentProject.value = (await projectApi.getDetail(id)) as unknown as ProjectDetail
    } finally {
      loading.value = false
    }
  }

  async function create(data: CreateProjectRequest) {
    const res = await projectApi.create(data)
    // 创建后重新加载列表或直接添加
    await loadList()
    return res
  }

  async function update(id: string, data: UpdateProjectRequest) {
    await projectApi.update(id, data)
    if (currentProject.value?.id === id) {
      // 简单合并或重新拉取
      await loadDetail(id)
    }
  }

  async function remove(id: string) {
    await projectApi.delete(id)
    projects.value = projects.value.filter((p) => p.id !== id)
    if (currentProject.value?.id === id) {
      currentProject.value = null
    }
  }

  return {
    projects,
    currentProject,
    loading,
    total,
    currentProjectId,
    loadList,
    loadDetail,
    create,
    update,
    remove,
  }
})
