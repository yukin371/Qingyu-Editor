/**
 * Writer Store - 作者状态管理
 * 支持在线模式（API）和离线模式（IndexedDB）
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
// import { getProjects, createProject, updateProject, deleteProject, getProjectById } from '@/modules/writer/api'
// Temporarily disable API calls - will be restored when API is fully integrated
import {
  getLocalProjects,
  createLocalProject,
  getLocalProject,
  updateLocalProject,
  deleteLocalProject,
  getLocalStats,
  initLocalStorage,
  type LocalProject,
} from '@/utils/localStorageAPI'
import { message } from '@/design-system/services'
// 运行模式
type StorageMode = 'online' | 'offline'

function isTestModeActive(): boolean {
  if (typeof window === 'undefined') return false
  return new URLSearchParams(window.location.search).get('test') === 'true'
}

function buildYunlanMockProject(): LocalProject {
  const updatedAt = new Date(Date.now() - 45 * 60 * 1000).toISOString()
  return {
    projectId: 'project-yljs-1',
    title: '云岚纪事',
    description: '仙侠长篇，当前已编辑 3 章。',
    type: 'novel',
    status: 'writing',
    wordCount: 9800,
    chapterCount: 3,
    createdAt: '2026-02-01T10:00:00.000Z',
    updatedAt,
  }
}

/**
 * 写作端状态管理
 */
export const useWriterStore = defineStore('writer', () => {
  // 状态
  const projects = ref<any[]>([]) // Any type for compatibility with both Project and LocalProject
  const currentProject = ref<any | null>(null)
  const loading = ref(false)
  const total = ref(0)

  // 存储模式（默认离线模式，可测试前端功能）
  const storageMode = ref<StorageMode>('offline')

  // 初始化本地存储
  initLocalStorage().catch((err) => {
    console.error('初始化本地存储失败:', err)
  })

  // 统计数据
  const stats = ref({
    totalWords: 0,
    bookCount: 0,
    todayWords: 0,
    pending: 0,
    streak: 0,
  })

  // 计算属性
  const projectList = computed(() => projects.value)
  const hasProjects = computed(() => projects.value.length > 0)
  const isOnlineMode = computed(() => storageMode.value === 'online')
  const isOfflineMode = computed(() => storageMode.value === 'offline')

  // 获取项目列表
  const fetchProjects = async (_params?: any) => {
    loading.value = true
    try {
      if (storageMode.value === 'offline') {
        // 离线模式：使用本地存储
        const localProjects = await getLocalProjects()
        const list = Array.isArray(localProjects) ? [...localProjects] : []
        if (isTestModeActive() && !list.some((p) => p?.projectId === 'project-yljs-1')) {
          list.unshift(buildYunlanMockProject())
        }
        projects.value = list
        total.value = projects.value.length
        return projects.value
      } else {
        // 在线模式：API未完成，使用离线模式
        const localProjects = await getLocalProjects()
        const list = Array.isArray(localProjects) ? [...localProjects] : []
        if (isTestModeActive() && !list.some((p) => p?.projectId === 'project-yljs-1')) {
          list.unshift(buildYunlanMockProject())
        }
        projects.value = list
        total.value = projects.value.length
        message.warning('在线模式API功能待完善，已切换到离线模式')
        storageMode.value = 'offline'
        return projects.value
      }
    } catch (error: any) {
      console.error('获取项目列表失败:', error)
      message.error('获取项目列表失败')
      return []
    } finally {
      loading.value = false
    }
  }

  // 创建项目
  const createNewProject = async (data: any) => {
    // Changed from ProjectCreateData to any
    try {
      if (storageMode.value === 'offline') {
        // 离线模式：使用 IndexedDB
        const project = await createLocalProject(data)
        // 确保 projects.value 是数组
        if (!Array.isArray(projects.value)) {
          projects.value = []
        }
        projects.value.unshift(project as any)
        message.success('项目创建成功（本地存储）')
        return project as any
      } else {
        // 在线模式：使用 API
        try {
          // const response = await createProject(data) // Original line commented out
          // if (response.code === 200 && response.data) { // Original line commented out
          //   if (!Array.isArray(projects.value)) { // Original line commented out
          //     projects.value = [] // Original line commented out
          //   } // Original line commented out
          //   projects.value.unshift(response.data) // Original line commented out
          //   message.success('项目创建成功') // Original line commented out
          //   return response.data // Original line commented out
          // } // Original line commented out
          // return null // Original line commented out
          // Temporarily disable API calls - will be restored when API is fully integrated
          message.warning('API功能待完善，请使用离线模式')
          return { code: 501, message: 'API功能待完善' } // Placeholder response
        } catch (apiError: any) {
          console.error('在线模式API调用失败:', apiError)
          message.warning('网络错误，已切换到离线模式')
          storageMode.value = 'offline'
          return createNewProject(data)
        }
      }
    } catch (error: any) {
      console.error('创建项目失败:', error)
      throw error
    }
  }

  // 获取项目详情
  const fetchProjectById = async (projectId: string) => {
    try {
      if (storageMode.value === 'offline') {
        // 离线模式：使用 IndexedDB
        const project = await getLocalProject(projectId)
        currentProject.value = project as any
        return project as any
      } else {
        // 在线模式：使用 API
        // const response = await getProjectById(projectId) // Original line commented out
        // if (response.code === 200 && response.data) { // Original line commented out
        //   currentProject.value = response.data // Original line commented out
        //   return response.data // Original line commented out
        // } // Original line commented out
        // return null // Original line commented out
        // Temporarily disable API calls - will be restored when API is fully integrated
        message.warning('API功能待完善，请使用离线模式')
        return { code: 501, message: 'API功能待完善' } // Placeholder response
      }
    } catch (error: any) {
      console.error('获取项目详情失败:', error)
      throw error
    }
  }

  // 更新项目
  const updateProjectData = async (projectId: string, data: any) => {
    // Changed from ProjectUpdateData to any
    try {
      if (storageMode.value === 'offline') {
        // 离线模式：使用 IndexedDB
        const updatedProject = await updateLocalProject(projectId, data)

        // 更新列表中的项目
        const index = projects.value.findIndex((p) => p.projectId === projectId)
        if (index !== -1) {
          projects.value[index] = updatedProject as any
        }

        // 更新当前项目
        if (currentProject.value?.projectId === projectId) {
          currentProject.value = updatedProject as any
        }

        message.success('项目更新成功（本地存储）')
        return updatedProject as any
      } else {
        // 在线模式：使用 API
        // const response = await updateProject(projectId, data) // Original line commented out
        // if (response.code === 200 && response.data) { // Original line commented out
        //   // 更新列表中的项目 // Original line commented out
        //   const index = projects.value.findIndex(p => p.projectId === projectId) // Original line commented out
        //   if (index !== -1) { // Original line commented out
        //     projects.value[index] = response.data // Original line commented out
        //   } // Original line commented out

        //   // 更新当前项目 // Original line commented out
        //   if (currentProject.value?.projectId === projectId) { // Original line commented out
        //     currentProject.value = response.data // Original line commented out
        //   } // Original line commented out

        //   message.success('项目更新成功') // Original line commented out
        //   return response.data // Original line commented out
        // } // Original line commented out
        // return null // Original line commented out
        // Temporarily disable API calls - will be restored when API is fully integrated
        message.warning('API功能待完善，请使用离线模式')
        return { code: 501, message: 'API功能待完善' } // Placeholder response
      }
    } catch (error: any) {
      console.error('更新项目失败:', error)
      throw error
    }
  }

  // 删除项目
  const deleteProjectById = async (projectId: string) => {
    try {
      if (storageMode.value === 'offline') {
        // 离线模式：使用 IndexedDB
        await deleteLocalProject(projectId)

        // 从列表中移除
        projects.value = projects.value.filter((p) => p.projectId !== projectId)

        // 如果删除的是当前项目，清空当前项目
        if (currentProject.value?.projectId === projectId) {
          currentProject.value = null
        }

        message.success('项目删除成功（本地存储）')
        return true
      } else {
        // 在线模式：使用 API
        // const response = await deleteProject(projectId) // Original line commented out
        // if (response.code === 200) { // Original line commented out
        //   // 从列表中移除 // Original line commented out
        //   projects.value = projects.value.filter(p => p.projectId !== projectId) // Original line commented out

        //   // 如果删除的是当前项目，清空当前项目 // Original line commented out
        //   if (currentProject.value?.projectId === projectId) { // Original line commented out
        //     currentProject.value = null // Original line commented out
        //   } // Original line commented out

        //   message.success('项目删除成功') // Original line commented out
        //   return true // Original line commented out
        // } // Original line commented out
        // return false // Original line commented out
        // Temporarily disable API calls - will be restored when API is fully integrated
        message.warning('API功能待完善，请使用离线模式')
        return { code: 501, message: 'API功能待完善' } // Placeholder response
      }
    } catch (error: any) {
      console.error('删除项目失败:', error)
      throw error
    }
  }

  // 一键发布项目
  const publishProjectById = async (projectId: string) => {
    const index = projects.value.findIndex((p) => (p.projectId || p.id) === projectId)
    if (index === -1) {
      throw new Error('项目不存在')
    }

    const current = projects.value[index]
    const updatedProject = {
      ...current,
      status: 'published',
      updatedAt: new Date().toISOString(),
    }
    projects.value[index] = updatedProject

    if ((currentProject.value?.projectId || currentProject.value?.id) === projectId) {
      currentProject.value = updatedProject
    }

    // 尝试持久化到本地存储，mock项目不存在时忽略持久化错误
    try {
      await updateLocalProject(projectId, {
        status: 'published',
        updatedAt: updatedProject.updatedAt,
      } as Partial<LocalProject>)
    } catch (error) {
      console.warn('[writerStore] 发布状态仅内存更新，未持久化:', error)
    }

    message.success('项目发布成功')
    return updatedProject
  }

  // 加载统计数据
  const loadStats = async () => {
    try {
      if (storageMode.value === 'offline') {
        const localStats = await getLocalStats()
        stats.value = {
          ...localStats,
          streak: 0, // 本地模式不支持连续写作天数
        }
      } else {
        // 在线模式：调用真实 API
        const { getDashboardOverview } = await import('@/modules/writer/api/dashboard')
        const overview = await getDashboardOverview()
        stats.value = {
          totalWords: overview.totalWords,
          bookCount: overview.totalProjects,
          todayWords: overview.todayWords,
          pending: overview.activeProjects,
          streak: 0, // DashboardOverview 未包含 streak，后续可扩展
        }
      }
    } catch (error: any) {
      console.error('加载统计数据失败:', error)
      // 失败时尝试降级到离线模式
      if (storageMode.value === 'online') {
        try {
          const localStats = await getLocalStats()
          stats.value = {
            ...localStats,
            streak: 0,
          }
        } catch {
          // 静默失败
        }
      }
    }
  }

  // 切换存储模式
  const toggleStorageMode = () => {
    storageMode.value = storageMode.value === 'online' ? 'offline' : 'online'
    message.info(`已切换到${storageMode.value === 'online' ? '在线' : '离线'}模式`)
    // 清空当前数据
    projects.value = []
    currentProject.value = null
    total.value = 0
    return storageMode.value
  }

  // 设置存储模式
  const setStorageMode = (mode: StorageMode) => {
    storageMode.value = mode
    console.log(`📦 存储模式: ${mode === 'online' ? '在线' : '离线'}`)
  }

  // 清空状态
  const clearState = () => {
    projects.value = []
    currentProject.value = null
    total.value = 0
  }

  return {
    // 状态
    projects,
    currentProject,
    loading,
    total,
    stats,
    storageMode,

    // 计算属性
    projectList,
    hasProjects,
    isOnlineMode,
    isOfflineMode,

    // 方法
    fetchProjects,
    createNewProject,
    fetchProjectById,
    updateProjectData,
    deleteProjectById,
    publishProjectById,
    loadStats,
    clearState,
    toggleStorageMode,
    setStorageMode,
  }
})
