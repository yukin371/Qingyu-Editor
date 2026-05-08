import { defineStore } from 'pinia'
import type { Project, Document, DocumentTreeNode } from '..'
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getDocuments,
  getDocumentTree,
  getDocumentById,
  getDocumentContent,
  getDocumentContents,
  createDocument,
  updateDocument,
  updateDocumentContent,
  replaceDocumentContents,
  searchProjectKeywords,
  deleteDocument,
  moveDocument,
  autosaveDocument,
  type ParagraphContent,
  type ProjectCreateData,
  type ProjectUpdateData,
} from '..'
import type {
  Character,
  CharacterRelation,
  Location,
  LocationRelation,
  Timeline,
  TimelineEvent,
  OutlineNode,
} from '@/types/writer'
import type { ChatMessage, AIToolType, AIConfig, AIHistory } from '@/types/ai'
import {
  chatWithAI,
  continueWriting,
  polishText,
  expandText,
  rewriteText,
  storyGenerate,
} from '@/modules/ai/api'
import { useAIContext } from '../composables/useAIContext'
import { syncService, type SyncStatus } from '@/utils/syncService'
import { outlineApi } from '../api/outline'
import {
  createMockOutlineTree,
  createMockTimelineEvents,
  createMockTimelines,
  getWorkspaceMockProject,
  MOCK_TIMELINE_EVENTS,
  MOCK_CHARACTER_GRAPH,
  MOCK_ENTITIES,
} from '../mock/workspaceMock'
import type {
  LocationTreeNode,
  StatisticsCacheItem,
  RawProjectData,
  ProjectListResponse,
} from '@/types/models/project'

/**
 * 自动保存任务
 */
interface AutosaveTask {
  documentId: string
  content: string
  version: number
  timestamp: number
}

/**
 * Writer Store状态
 */
export interface WriterState {
  // 项目管理
  projects: Project[]
  currentProject: Project | null
  projectsLoading: boolean

  // 文档管理
  documents: Document[]
  documentTree: DocumentTreeNode[]
  currentDocument: Document | null
  documentsLoading: boolean
  documentTreeLoading: boolean

  // 编辑器状态
  editorContent: string
  editorVersion: number
  isDirty: boolean
  lastSaved: Date | null

  // 自动保存
  autosaveEnabled: boolean
  autosaveInterval: number
  autosaveQueue: AutosaveTask[]
  isSaving: boolean

  // AI助手状态
  ai: {
    chatHistory: ChatMessage[]
    isProcessing: boolean
    lastResult: string
    sidebarVisible: boolean
    currentTool: AIToolType
    config: AIConfig
    history: AIHistory[]
    error: string | null
    selectedText: string
    agentContext: {
      characters: Character[]
      locations: Location[]
      events: TimelineEvent[]
    }
  }

  // 角色管理
  characters: {
    list: Character[]
    relations: CharacterRelation[]
    currentCharacter: Character | null
    loading: boolean
  }

  // 地点管理
  locations: {
    list: Location[]
    relations: LocationRelation[]
    tree: LocationTreeNode[]
    currentLocation: Location | null
    loading: boolean
  }

  // 时间线管理
  timeline: {
    list: Timeline[]
    currentTimeline: Timeline | null
    events: TimelineEvent[]
    loading: boolean
    showBar: boolean
  }

  // 大纲管理
  outline: {
    nodes: OutlineNode[]
    tree: OutlineNode[]
    currentNode: OutlineNode | null
    loading: boolean
  }

  // 统计缓存
  statisticsCache: Record<string, StatisticsCacheItem>

  // 同步状态
  sync: SyncStatus

  // 错误信息
  error: string | null
}

function normalizeProject(raw: RawProjectData): Project {
  const rawRecord = raw as Record<string, unknown>
  const rawStats = rawRecord.statistics as Record<string, unknown> | undefined
  const rawSettings = rawRecord.settings as Record<string, unknown> | undefined

  return {
    ...raw,
    projectId: raw?.projectId || raw?.id,
    id: raw?.id || raw?.projectId,
    description: raw?.description || raw?.summary || '',
    summary: raw?.summary || raw?.description || '',
    coverImage: raw?.coverImage || raw?.coverUrl || '',
    coverUrl: raw?.coverUrl || raw?.coverImage || '',
    genre: raw?.genre || raw?.category || '',
    category: raw?.category || raw?.genre || '',
    wordCount: raw?.wordCount ?? raw?.totalWords ?? 0,
    totalWords: raw?.totalWords ?? raw?.wordCount ?? 0,
    chapterCount: raw?.chapterCount ?? 0,
    updatedAt: raw?.updatedAt || raw?.lastUpdateTime || raw?.createdAt || '',
    // 提供默认值以满足 Project 类型要求
    authorId: (rawRecord.authorId as string) || '',
    visibility: (rawRecord.visibility as string) || 'private',
    status: (rawRecord.status as string) || 'draft',
    statistics: {
      totalWords: raw?.totalWords ?? raw?.wordCount ?? (rawStats?.totalWords as number) ?? 0,
      chapterCount: raw?.chapterCount ?? (rawStats?.chapterCount as number) ?? 0,
      documentCount: (rawStats?.documentCount as number) ?? 0,
      lastUpdateAt:
        raw?.updatedAt || raw?.lastUpdateTime || (rawStats?.lastUpdateAt as string) || '',
    },
    settings: {
      autoBackup: (rawSettings?.autoBackup as boolean) ?? true,
      backupInterval: (rawSettings?.backupInterval as number) ?? 300000,
      wordCountGoal: rawSettings?.wordCountGoal as number | undefined,
    },
  } as Project
}

function normalizeProjectListResponse(response: ProjectListResponse | RawProjectData[]): Project[] {
  // 直接是数组的情况
  if (Array.isArray(response)) {
    return response.map(normalizeProject)
  }

  // 对象格式的情况
  const candidates = [
    response?.projects,
    response?.items,
    response?.data && typeof response.data === 'object' && !Array.isArray(response.data)
      ? (response.data as { projects?: RawProjectData[]; items?: RawProjectData[] }).projects
      : undefined,
    response?.data && typeof response.data === 'object' && !Array.isArray(response.data)
      ? (response.data as { projects?: RawProjectData[]; items?: RawProjectData[] }).items
      : undefined,
    Array.isArray(response?.data) ? response.data : undefined,
  ]

  const list = candidates.find((item): item is RawProjectData[] => Array.isArray(item))
  return Array.isArray(list) ? list.map(normalizeProject) : []
}

export const useWriterStore = defineStore('writer', {
  state: (): WriterState => ({
    // 项目管理
    projects: [],
    currentProject: null,
    projectsLoading: false,

    // 文档管理
    documents: [],
    documentTree: [],
    currentDocument: null,
    documentsLoading: false,
    documentTreeLoading: false,

    // 编辑器状态
    editorContent: '',
    editorVersion: 0,
    isDirty: false,
    lastSaved: null,

    // 自动保存
    autosaveEnabled: true,
    autosaveInterval: 30000, // 30秒
    autosaveQueue: [],
    isSaving: false,

    // AI助手状态
    ai: {
      chatHistory: [],
      isProcessing: false,
      lastResult: '',
      sidebarVisible: false,
      currentTool: 'chat',
      config: {
        continueLength: 200,
        polishStyle: 'literary',
        expandLevel: 'moderate',
        rewriteMode: 'meaning',
      },
      history: [],
      error: null,
      selectedText: '',
      agentContext: {
        characters: [],
        locations: [],
        events: [],
      },
    },

    // 角色管理
    characters: {
      list: [],
      relations: [],
      currentCharacter: null,
      loading: false,
    },

    // 地点管理
    locations: {
      list: [],
      relations: [],
      tree: [],
      currentLocation: null,
      loading: false,
    },

    // 时间线管理
    timeline: {
      list: [],
      currentTimeline: null,
      events: [],
      loading: false,
      showBar: false,
    },

    // 大纲管理
    outline: {
      nodes: [],
      tree: [],
      currentNode: null,
      loading: false,
    },

    // 统计缓存
    statisticsCache: {},

    // 同步状态
    sync: syncService.getStatus(),

    // 错误信息
    error: null,
  }),

  getters: {
    /**
     * 获取当前项目ID
     */
    currentProjectId: (state): string | null => {
      return state.currentProject?.projectId || null
    },

    /**
     * 获取当前文档ID
     */
    currentDocumentId: (state): string | null => {
      return state.currentDocument?.documentId || null
    },

    /**
     * 是否有未保存的更改
     */
    hasUnsavedChanges: (state): boolean => {
      return state.isDirty
    },

    /**
     * 获取项目总数
     */
    projectCount: (state): number => {
      return state.projects.length
    },

    /**
     * 获取项目列表（兼容旧代码）
     */
    projectList: (state): Project[] => {
      return state.projects
    },

    /**
     * 获取加载状态（兼容旧代码）
     */
    loading: (state): boolean => {
      return state.projectsLoading
    },

    /**
     * 获取文档总数
     */
    documentCount: (state): number => {
      return state.documents.length
    },

    /**
     * 获取章节顺序映射（用于时序过滤）
     */
    chapterOrderMap: (state): Map<string, number> => {
      const tree = state.documentTree || []
      const map = new Map<string, number>()

      function traverse(nodes: any[], order: number = 0): number {
        nodes.forEach((node) => {
          map.set(node.id, ++order)
          if (node.children && node.children.length > 0) {
            traverse(node.children, order)
          }
        })
        return order
      }

      traverse(tree)
      return map
    },
  },

  actions: {
    /**
     * 将段落数组合并为编辑器字符串
     */
    composeContentFromParagraphs(contents: ParagraphContent[] = []): string {
      if (!Array.isArray(contents) || contents.length === 0) {
        return ''
      }

      return contents
        .slice()
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((item) => item.content || '')
        .join('\n\n')
    },

    /**
     * 将编辑器字符串拆分为段落数组（用于V2批量提交）
     */
    splitContentToParagraphs(content: string): ParagraphContent[] {
      const blocks = (content || '')
        .split(/\n{2,}/g)
        .map((item) => item.trim())
        .filter((item) => item.length > 0)

      if (blocks.length === 0) {
        return [{ order: 1, content: '' }]
      }

      return blocks.map((item, index) => ({
        order: index + 1,
        content: item,
      }))
    },

    // ==================== 项目管理 ====================

    /**
     * 加载项目列表
     */
    async loadProjects(params?: any): Promise<void> {
      this.projectsLoading = true
      this.error = null

      try {
        // httpService 响应拦截器会自动解包返回 data
        const response = (await getProjects(params)) as any
        this.projects = normalizeProjectListResponse(response)
      } catch (error: any) {
        console.error('加载项目列表失败:', error)
        this.error = error.message || '网络错误，请稍后重试'
        throw error
      } finally {
        this.projectsLoading = false
      }
    },

    /**
     * 获取项目列表（兼容旧代码的别名方法）
     */
    async fetchProjects(params?: any): Promise<Project[]> {
      await this.loadProjects(params)
      return this.projects
    },

    /**
     * 加载项目详情
     */
    async loadProject(projectId: string): Promise<void> {
      this.projectsLoading = true
      this.error = null

      try {
        // httpService 响应拦截器会自动解包返回 data
        const response = (await getProjectById(projectId)) as any
        // response 是 ProjectDetailResponse 类型
        // 后端返回 id 字段，前端需要 projectId 字段
        if (response && response.id) {
          this.currentProject = normalizeProject(response)
        } else {
          this.error = '加载项目失败'
        }
      } catch (error: any) {
        console.error('加载项目失败:', error)
        this.error = error.message || '网络错误，请稍后重试'
        throw error
      } finally {
        this.projectsLoading = false
      }
    },

    /**
     * 创建项目
     */
    async createNewProject(data: ProjectCreateData): Promise<Project | null> {
      this.projectsLoading = true
      this.error = null

      try {
        // httpService 响应拦截器会自动解包返回 data
        const response = (await createProject(data)) as any
        const projectData = response as Record<string, unknown>
        // 兼容后端返回 projectId 或 id 的情况
        const projectId = projectData?.projectId || projectData?.id
        if (projectData && projectId) {
          const projectWithId = normalizeProject(projectData)
          this.projects.unshift(projectWithId)
          return projectWithId
        } else {
          this.error = '创建项目失败'
          return null
        }
      } catch (error: any) {
        console.error('创建项目失败:', error)
        this.error = error.message || '网络错误，请稍后重试'
        throw error
      } finally {
        this.projectsLoading = false
      }
    },

    /**
     * 更新项目
     */
    async updateCurrentProject(data: ProjectUpdateData): Promise<void> {
      if (!this.currentProject) {
        throw new Error('没有选中的项目')
      }

      try {
        // httpService 响应拦截器会自动解包返回 data
        const response = (await updateProject(this.currentProject.projectId!, data)) as any
        // response 是 ProjectDetailResponse 类型
        // 后端返回 id 字段，前端需要 projectId 字段
        if (response && response.id) {
          this.currentProject = { ...this.currentProject, ...normalizeProject(response) }
          // 更新项目列表中的项目
          const index = this.projects.findIndex(
            (p) => p.projectId === this.currentProject!.projectId,
          )
          if (index !== -1) {
            this.projects[index] = this.currentProject!
          }
        } else {
          this.error = '更新项目失败'
        }
      } catch (error: any) {
        console.error('更新项目失败:', error)
        this.error = error.message || '网络错误，请稍后重试'
        throw error
      }
    },

    /**
     * 删除项目
     */
    async deleteProjectById(projectId: string): Promise<void> {
      try {
        await deleteProject(projectId)
        // deleteProject 返回 void，直接执行删除操作
        this.projects = this.projects.filter((p) => p.projectId !== projectId)
        if (this.currentProject?.projectId === projectId) {
          this.currentProject = null
        }
      } catch (error: any) {
        console.error('删除项目失败:', error)
        this.error = error.message || '网络错误，请稍后重试'
        throw error
      }
    },

    // ==================== 文档管理 ====================

    /**
     * 加载文档列表
     */
    async loadDocuments(projectId: string, params?: any): Promise<void> {
      this.documentsLoading = true
      this.error = null

      try {
        // httpService 响应拦截器会自动解包返回 data
        const response = (await getDocuments(projectId, params)) as any
        // response 是 { documents: Document[]; total: number } 类型
        if (response && response.documents) {
          this.documents = Array.isArray(response.documents) ? response.documents : []
        } else {
          this.documents = []
        }
      } catch (error: any) {
        console.error('加载文档列表失败:', error)
        this.error = error.message || '网络错误，请稍后重试'
        throw error
      } finally {
        this.documentsLoading = false
      }
    },

    /**
     * 加载文档树
     */
    async loadDocumentTree(projectId: string): Promise<void> {
      this.documentTreeLoading = true
      this.error = null

      try {
        // httpService 响应拦截器会自动解包返回 data
        const response = (await getDocumentTree(projectId)) as any
        // response 返回树形结构
        this.documentTree = response || []
      } catch (error: any) {
        console.error('加载文档树失败:', error)
        this.error = error.message || '网络错误，请稍后重试'
        throw error
      } finally {
        this.documentTreeLoading = false
      }
    },

    /**
     * 加载文档详情
     */
    async loadDocument(documentId: string): Promise<void> {
      this.documentsLoading = true
      this.error = null

      try {
        // httpService 响应拦截器会自动解包返回 data
        const response = (await getDocumentById(documentId)) as any
        // response 是 Document 类型
        if (response && response.id) {
          this.currentDocument = response
          this.editorVersion = response.version || 0
        } else {
          this.error = '加载文档失败'
        }
      } catch (error: any) {
        console.error('加载文档失败:', error)
        this.error = error.message || '网络错误，请稍后重试'
        throw error
      } finally {
        this.documentsLoading = false
      }
    },

    /**
     * 加载文档内容
     */
    async loadDocumentContent(documentId: string): Promise<void> {
      this.documentsLoading = true
      this.error = null

      try {
        try {
          const response = await getDocumentContents(documentId)
          if (response && Array.isArray((response as any).contents)) {
            this.editorContent = this.composeContentFromParagraphs((response as any).contents || [])
            this.isDirty = false
            return
          }
        } catch (v2Error) {
          if (import.meta.env.DEV) console.warn('V2分段接口加载失败，回退到content接口:', v2Error)
        }

        const fallback = await getDocumentContent(documentId)
        if (fallback && (fallback as any).content !== undefined) {
          this.editorContent = (fallback as any).content || ''
          this.isDirty = false
        } else {
          this.error = '加载文档内容失败'
        }
      } catch (error: any) {
        console.error('加载文档内容失败:', error)
        this.error = error.message || '网络错误，请稍后重试'
        throw error
      } finally {
        this.documentsLoading = false
      }
    },

    /**
     * 创建文档
     */
    async createNewDocument(projectId: string, data: any): Promise<Document | null> {
      this.documentsLoading = true
      this.error = null

      try {
        // httpService 响应拦截器会自动解包返回 data
        const response = (await createDocument(projectId, data)) as any
        // response 是 CreateDocumentResponse 类型
        if (response && response.id) {
          const newDoc = response as Document
          this.documents.push(newDoc)
          // 重新加载文档树
          await this.loadDocumentTree(projectId)
          return newDoc
        } else {
          this.error = '创建文档失败'
          return null
        }
      } catch (error: any) {
        console.error('创建文档失败:', error)
        this.error = error.message || '网络错误，请稍后重试'
        throw error
      } finally {
        this.documentsLoading = false
      }
    },

    /**
     * 更新文档
     */
    async updateDocumentById(documentId: string, data: any): Promise<void> {
      try {
        await updateDocument(documentId, data)
        // updateDocument 返回 void，直接更新本地状态
        if (this.currentDocument?.documentId === documentId) {
          this.currentDocument = { ...this.currentDocument, ...data }
        }
        // 更新文档列表中的文档
        const index = this.documents.findIndex((d) => d.documentId === documentId)
        if (index !== -1) {
          this.documents[index] = { ...this.documents[index], ...data }
        }
      } catch (error: any) {
        console.error('更新文档失败:', error)
        this.error = error.message || '网络错误，请稍后重试'
        throw error
      }
    },

    /**
     * 保存文档内容
     */
    async saveDocumentContent(documentId: string, content: string): Promise<void> {
      this.isSaving = true

      try {
        const contents = this.splitContentToParagraphs(content)
        try {
          await replaceDocumentContents(documentId, contents)
        } catch (v2Error) {
          if (import.meta.env.DEV) console.warn('V2分段保存失败，回退到content接口:', v2Error)
          await updateDocumentContent(documentId, {
            content,
            version: this.editorVersion,
          })
        }
        this.editorContent = content
        this.isDirty = false
        this.lastSaved = new Date()
        this.editorVersion = this.editorVersion + 1
      } catch (error: any) {
        console.error('保存文档失败:', error)
        this.error = error.message || '网络错误，请稍后重试'
        throw error
      } finally {
        this.isSaving = false
      }
    },

    /**
     * 自动保存文档
     */
    async autosave(documentId: string, content: string): Promise<void> {
      if (!this.autosaveEnabled || this.isSaving) {
        return
      }

      try {
        const response = await autosaveDocument(documentId, {
          content,
          currentVersion: this.editorVersion,
          saveType: 'auto',
        })
        if (response) {
          this.lastSaved = new Date()
          this.isDirty = false

          const newVersion = (response as any).newVersion
          if (newVersion && newVersion !== this.editorVersion) {
            if (import.meta.env.DEV) console.warn('检测到版本冲突')
          }
        }
      } catch (error: any) {
        console.error('自动保存失败:', error)
      }
    },

    /**
     * 删除文档
     */
    async deleteDocumentById(documentId: string): Promise<void> {
      try {
        await deleteDocument(documentId)
        // deleteDocument 返回 void，直接更新本地状态
        this.documents = this.documents.filter((d) => d.documentId !== documentId)
        if (this.currentDocument?.documentId === documentId) {
          this.currentDocument = null
          this.editorContent = ''
          this.isDirty = false
        }
        // 重新加载文档树
        if (this.currentProject) {
          await this.loadDocumentTree(this.currentProject.projectId!)
        }
      } catch (error: any) {
        console.error('删除文档失败:', error)
        this.error = error.message || '网络错误，请稍后重试'
        throw error
      }
    },

    /**
     * 移动文档
     */
    async moveDocumentTo(
      documentId: string,
      newParentId?: string,
      newOrder?: number,
    ): Promise<void> {
      try {
        const response = await moveDocument(documentId, {
          newParentId,
          newOrder: newOrder || 0,
        })
        if (response.code === 200) {
          // 重新加载文档树
          if (this.currentProject) {
            await this.loadDocumentTree(this.currentProject.projectId!)
          }
        } else {
          this.error = response.message || '移动文档失败'
        }
      } catch (error: any) {
        console.error('移动文档失败:', error)
        this.error = error.message || '网络错误，请稍后重试'
        throw error
      }
    },

    // ==================== 编辑器状态 ====================

    /**
     * 更新编辑器内容
     */
    updateEditorContent(content: string): void {
      this.editorContent = content
      this.isDirty = true
    },

    /**
     * 关键词检索（支持拼音模糊/补全）
     */
    async searchKeywords(
      query: string,
      limit: number = 20,
      projectId?: string,
    ): Promise<Array<{ type: string; id: string; name: string; matchMode: string }>> {
      const targetProjectId = projectId || this.currentProjectId
      if (!targetProjectId || !query.trim()) {
        return []
      }

      try {
        const response = await searchProjectKeywords(targetProjectId, query.trim(), limit)
        return Array.isArray((response as any)?.suggestions) ? (response as any).suggestions : []
      } catch (error) {
        if (import.meta.env.DEV) console.warn('关键词检索失败:', error)
        return []
      }
    },

    /**
     * 标记为已保存
     */
    markAsSaved(): void {
      this.isDirty = false
      this.lastSaved = new Date()
    },

    /**
     * 设置自动保存
     */
    setAutosave(enabled: boolean, interval?: number): void {
      this.autosaveEnabled = enabled
      if (interval !== undefined) {
        this.autosaveInterval = interval
      }
    },

    // ==================== 统计缓存 ====================

    /**
     * 缓存统计数据
     */
    cacheStatistics(key: string, data: any): void {
      this.statisticsCache[key] = {
        data,
        timestamp: Date.now(),
      }
    },

    /**
     * 获取缓存的统计数据
     */
    getCachedStatistics(key: string, maxAge: number = 300000): any | null {
      const cached = this.statisticsCache[key]
      if (cached && Date.now() - cached.timestamp < maxAge) {
        return cached.data
      }
      return null
    },

    // ==================== AI助手功能 ====================

    /**
     * 切换AI侧边栏显示/隐藏
     */
    toggleAISidebar(visible?: boolean): void {
      if (visible !== undefined) {
        this.ai.sidebarVisible = visible
      } else {
        this.ai.sidebarVisible = !this.ai.sidebarVisible
      }
    },

    /**
     * 切换AI工具
     */
    setAITool(tool: AIToolType): void {
      this.ai.currentTool = tool
    },

    /**
     * 设置选中的文本
     */
    setSelectedText(text: string): void {
      this.ai.selectedText = text
    },

    /**
     * 发送聊天消息
     */
    async sendChatMessage(message: string): Promise<void> {
      if (!message.trim()) return

      this.ai.isProcessing = true
      this.ai.error = null

      // 添加用户消息到历史
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: message,
        timestamp: Date.now(),
      }
      this.ai.chatHistory.push(userMessage)

      try {
        const response = await chatWithAI(message, this.ai.chatHistory.slice(0, -1))

        // 添加AI回复到历史
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.reply,
          timestamp: Date.now(),
        }
        this.ai.chatHistory.push(aiMessage)
        this.ai.lastResult = response.reply

        // 保存到历史记录
        this.ai.history.push({
          id: Date.now().toString(),
          tool: 'chat',
          input: message,
          output: response.reply,
          timestamp: Date.now(),
          projectId: this.currentProjectId || undefined,
          usage: response.usage,
        })
      } catch (error: any) {
        console.error('AI对话失败:', error)
        this.ai.error = error.message || '对话失败，请重试'
      } finally {
        this.ai.isProcessing = false
      }
    },

    /**
     * 清空聊天历史
     */
    clearChatHistory(): void {
      this.ai.chatHistory = []
      this.ai.lastResult = ''
    },

    /**
     * AI续写
     */
    async aiContinueWriting(text: string, length: number = 200): Promise<string> {
      if (!this.currentProjectId) {
        throw new Error('请先选择一个项目')
      }

      this.ai.isProcessing = true
      this.ai.error = null

      try {
        // 自动注入项目上下文
        const { buildContextString } = useAIContext()
        const contextStr = buildContextString({ includeRelations: false, maxTokenEstimate: 1500 })
        const contextInstructions = contextStr
          ? `请根据以下作品设定续写：\n${contextStr}`
          : undefined
        const response = await continueWriting(
          this.currentProjectId,
          text,
          length,
          contextInstructions,
        )
        const result = response.generated_text || ''
        this.ai.lastResult = result

        // 保存到历史记录
        this.ai.history.push({
          id: Date.now().toString(),
          tool: 'continue',
          input: text,
          output: result,
          timestamp: Date.now(),
          projectId: this.currentProjectId,
          usage: response.usage,
        })

        return result
      } catch (error: any) {
        console.error('AI续写失败:', error)
        this.ai.error = error.message || '续写失败，请重试'
        throw error
      } finally {
        this.ai.isProcessing = false
      }
    },

    /**
     * AI润色
     */
    async aiPolishText(text: string, instructions?: string): Promise<string> {
      if (!this.currentProjectId) {
        throw new Error('请先选择一个项目')
      }

      this.ai.isProcessing = true
      this.ai.error = null

      try {
        // 自动注入项目上下文
        const { buildContextString } = useAIContext()
        const contextStr = buildContextString({ includeRelations: false, maxTokenEstimate: 1000 })
        const mergedInstructions = contextStr
          ? `${instructions || ''}\n\n请参考以下作品设定进行润色，保持角色性格和世界观的统一：\n${contextStr}`
          : instructions
        const response = await polishText(this.currentProjectId, text, mergedInstructions)
        const result = response.polished_text || response.rewritten_text || ''
        this.ai.lastResult = result

        // 保存到历史记录
        this.ai.history.push({
          id: Date.now().toString(),
          tool: 'polish',
          input: text,
          output: result,
          timestamp: Date.now(),
          projectId: this.currentProjectId,
          usage: response.usage,
        })

        return result
      } catch (error: any) {
        console.error('AI润色失败:', error)
        this.ai.error = error.message || '润色失败，请重试'
        throw error
      } finally {
        this.ai.isProcessing = false
      }
    },

    /**
     * AI扩写
     */
    async aiExpandText(
      text: string,
      instructions?: string,
      targetLength?: number,
    ): Promise<string> {
      if (!this.currentProjectId) {
        throw new Error('请先选择一个项目')
      }

      this.ai.isProcessing = true
      this.ai.error = null

      try {
        // 自动注入项目上下文
        const { buildContextString } = useAIContext()
        const contextStr = buildContextString({ includeRelations: false, maxTokenEstimate: 1500 })
        const mergedInstructions = contextStr
          ? `${instructions || ''}\n\n请参考以下作品设定进行扩写，保持与故事世界的一致性：\n${contextStr}`
          : instructions
        const response = await expandText(
          this.currentProjectId,
          text,
          mergedInstructions,
          targetLength,
        )
        const result = response.expanded_text || response.rewritten_text || ''
        this.ai.lastResult = result

        // 保存到历史记录
        this.ai.history.push({
          id: Date.now().toString(),
          tool: 'expand',
          input: text,
          output: result,
          timestamp: Date.now(),
          projectId: this.currentProjectId,
          usage: response.usage,
        })

        return result
      } catch (error: any) {
        console.error('AI扩写失败:', error)
        this.ai.error = error.message || '扩写失败，请重试'
        throw error
      } finally {
        this.ai.isProcessing = false
      }
    },

    /**
     * AI改写
     */
    async aiRewriteText(
      text: string,
      mode: 'polish' | 'simplify' | 'formal' | 'casual',
      instructions?: string,
    ): Promise<string> {
      if (!this.currentProjectId) {
        throw new Error('请先选择一个项目')
      }

      this.ai.isProcessing = true
      this.ai.error = null

      try {
        // 自动注入项目上下文
        const { buildContextString } = useAIContext()
        const contextStr = buildContextString({ includeRelations: false, maxTokenEstimate: 1000 })
        const mergedInstructions = contextStr
          ? `${instructions || ''}\n\n请参考以下作品设定进行改写，保持角色性格一致性：\n${contextStr}`
          : instructions
        const response = await rewriteText(this.currentProjectId, text, mode, mergedInstructions)
        const result = response.rewritten_text || response.polished_text || ''
        this.ai.lastResult = result

        // 保存到历史记录
        this.ai.history.push({
          id: Date.now().toString(),
          tool: 'rewrite',
          input: text,
          output: result,
          timestamp: Date.now(),
          projectId: this.currentProjectId,
          usage: response.usage,
        })

        return result
      } catch (error: any) {
        console.error('AI改写失败:', error)
        this.ai.error = error.message || '改写失败，请重试'
        throw error
      } finally {
        this.ai.isProcessing = false
      }
    },

    /**
     * AI故事生成（上下文感知续写/改写/建议）
     */
    async storyGenerateAction(
      mode: 'continue' | 'rewrite' | 'suggest',
      instruction?: string,
      selectedText?: string,
    ): Promise<string> {
      if (!this.currentProjectId || !this.currentDocumentId) return ''

      this.ai.isProcessing = true
      this.ai.error = null

      try {
        const historyTool: AIToolType =
          mode === 'continue' ? 'continue' : mode === 'rewrite' ? 'rewrite' : 'chat'
        const response = (await storyGenerate({
          projectId: this.currentProjectId,
          documentId: this.currentDocumentId,
          mode,
          instruction,
          selectedText,
        })) as any
        const result = response?.data?.content || response?.data?.prompt || response?.content || ''
        this.ai.lastResult = result

        // 保存到历史记录
        this.ai.history.push({
          id: Date.now().toString(),
          tool: historyTool,
          input: selectedText || instruction || '',
          output: result,
          timestamp: Date.now(),
          projectId: this.currentProjectId,
        })

        return result
      } catch (error: any) {
        console.error('AI故事生成失败:', error)
        this.ai.error = error.message || '生成失败'
        throw error
      } finally {
        this.ai.isProcessing = false
      }
    },

    /**
     * 插入生成的内容到编辑器
     */
    insertGeneratedText(text: string): void {
      // 这个方法将由编辑器组件调用来插入文本
      // 实际插入逻辑在编辑器组件中实现
      this.ai.lastResult = text
    },

    /**
     * 清除AI错误
     */
    clearAIError(): void {
      this.ai.error = null
    },

    // ==================== 辅助方法 ====================

    /**
     * 清除错误信息
     */
    clearError(): void {
      this.error = null
    },

    // ==================== 角色管理 ====================

    /**
     * 加载角色列表
     */
    async loadCharacters(projectId?: string): Promise<void> {
      const pid = projectId || this.currentProjectId
      // 无项目时使用 Mock 数据演示
      if (!pid) {
        this.characters.loading = true
        this.characters.list = MOCK_CHARACTER_GRAPH.characters
        this.characters.loading = false
        return
      }

      this.characters.loading = true
      try {
        const writerModule = (await import('..')) as any
        const list = (await (writerModule.listCharacters?.(pid) ?? [])) || []
        // API 无数据时降级为 Mock
        this.characters.list = list.length > 0 ? list : MOCK_CHARACTER_GRAPH.characters
      } catch (error: any) {
        console.error('加载角色列表失败:', error)
        this.error = error.message
        // 出错时降级为 Mock 数据
        this.characters.list = MOCK_CHARACTER_GRAPH.characters
      } finally {
        this.characters.loading = false
      }
    },

    /**
     * 加载角色关系
     */
    async loadCharacterRelations(projectId?: string): Promise<void> {
      const pid = projectId || this.currentProjectId
      if (!pid) {
        this.characters.relations = MOCK_CHARACTER_GRAPH.relations as any
        return
      }

      try {
        const writerModule = (await import('..')) as any
        const relations = (await (writerModule.listCharacterRelations?.(pid) ?? [])) || []
        this.characters.relations =
          relations.length > 0 ? (relations as any) : (MOCK_CHARACTER_GRAPH.relations as any)
      } catch (error: any) {
        console.error('加载角色关系失败:', error)
        this.characters.relations = MOCK_CHARACTER_GRAPH.relations as any
      }
    },

    /**
     * 设置当前角色
     */
    setCurrentCharacter(character: Character | null): void {
      this.characters.currentCharacter = character
    },

    /**
     * 创建角色关系
     */
    async createCharacterRelation(
      projectId: string,
      data: { fromId: string; toId: string; type: string; strength: number; notes?: string },
    ): Promise<CharacterRelation | null> {
      try {
        const { characterApi } = await import('../api/character')
        const relation = (await characterApi.createRelation(projectId, {
          fromId: data.fromId,
          toId: data.toId,
          type: data.type as any, // 类型断言处理 RelationType
          strength: data.strength,
          notes: data.notes,
        })) as unknown as CharacterRelation
        if (relation) {
          this.characters.relations.push(relation)
          return relation
        }
        return null
      } catch (error: any) {
        console.error('创建角色关系失败:', error)
        this.error = error.message
        throw error
      }
    },

    /**
     * 删除角色关系
     */
    async deleteCharacterRelation(relationId: string, projectId: string): Promise<void> {
      try {
        const { characterApi } = await import('../api/character')
        await characterApi.deleteRelation(relationId, projectId)
        this.characters.relations = this.characters.relations.filter((r) => r.id !== relationId)
      } catch (error: any) {
        console.error('删除角色关系失败:', error)
        this.error = error.message
        throw error
      }
    },

    // ==================== 地点管理 ====================

    /**
     * 加载地点列表
     */
    async loadLocations(projectId?: string): Promise<void> {
      const pid = projectId || this.currentProjectId
      if (!pid) {
        this.locations.loading = true
        this.locations.list = MOCK_ENTITIES.locations as any
        this.locations.loading = false
        return
      }

      this.locations.loading = true
      try {
        const writerModule = (await import('..')) as any
        const list = (await (writerModule.listLocations?.(pid) ?? [])) || []
        this.locations.list = list.length > 0 ? list : (MOCK_ENTITIES.locations as any)
      } catch (error: any) {
        console.error('加载地点列表失败:', error)
        this.error = error.message
        this.locations.list = MOCK_ENTITIES.locations as any
      } finally {
        this.locations.loading = false
      }
    },

    /**
     * 加载地点树
     */
    async loadLocationTree(projectId?: string): Promise<void> {
      const pid = projectId || this.currentProjectId
      if (!pid) return

      try {
        const writerModule = (await import('..')) as any
        this.locations.tree = (await (writerModule.getLocationTree?.(pid) ?? [])) || []
      } catch (error: any) {
        console.error('加载地点树失败:', error)
      }
    },

    /**
     * 设置当前地点
     */
    setCurrentLocation(location: Location | null): void {
      this.locations.currentLocation = location
    },

    // ==================== 时间线管理 ====================

    /**
     * 加载时间线列表
     */
    async loadTimelines(projectId?: string): Promise<void> {
      const pid = projectId || this.currentProjectId
      const mockProject = pid ? getWorkspaceMockProject(pid) : null
      // 无项目时使用 Mock 数据演示
      if (!pid || mockProject) {
        this.timeline.loading = true
        const timelineList = createMockTimelines(pid || 'mock-project')
        this.timeline.list = timelineList
        this.timeline.currentTimeline = timelineList[0] || null
        await this.loadTimelineEvents(this.timeline.currentTimeline?.id)
        this.timeline.loading = false
        return
      }

      this.timeline.loading = true
      try {
        const writerModule = (await import('..')) as any
        const list = (await (writerModule.listTimelines?.(pid) ?? [])) || []
        this.timeline.list = list.length > 0 ? list : []
        if (this.timeline.list.length > 0 && !this.timeline.currentTimeline) {
          this.timeline.currentTimeline = this.timeline.list[0]
        }
      } catch (error: any) {
        console.error('加载时间线列表失败:', error)
        this.error = error.message
        this.timeline.list = []
      } finally {
        this.timeline.loading = false
      }
    },

    /**
     * 加载时间线事件
     */
    async loadTimelineEvents(timelineId?: string): Promise<void> {
      const tid = timelineId || this.timeline.currentTimeline?.id
      const currentTimeline =
        this.timeline.list.find((timeline) => timeline.id === tid) || this.timeline.currentTimeline
      const timelineProjectId = currentTimeline?.projectId || this.currentProjectId
      // 无时间线时使用 Mock 事件
      if (!tid || getWorkspaceMockProject(timelineProjectId)) {
        this.timeline.events = timelineProjectId
          ? createMockTimelineEvents(timelineProjectId)
          : MOCK_TIMELINE_EVENTS
        return
      }

      try {
        const writerModule = (await import('..')) as any
        this.timeline.events = (await (writerModule.listTimelineEvents?.(tid) ?? [])) || []
      } catch (error: any) {
        console.error('加载时间线事件失败:', error)
      }
    },

    /**
     * 切换时间线显示
     */
    toggleTimelineBar(show?: boolean): void {
      this.timeline.showBar = show !== undefined ? show : !this.timeline.showBar
    },

    /**
     * 设置当前时间线
     */
    setCurrentTimeline(timeline: Timeline | null): void {
      this.timeline.currentTimeline = timeline
      if (timeline) {
        this.loadTimelineEvents(timeline.id)
      }
    },

    // ==================== 大纲管理 ====================

    /**
     * 加载大纲树
     */
    async loadOutlineTree(projectId?: string): Promise<void> {
      const pid = projectId || this.currentProjectId
      if (!pid) return
      const mockProject = getWorkspaceMockProject(pid)

      this.outline.loading = true
      try {
        if (mockProject) {
          this.outline.tree = createMockOutlineTree(pid)
          return
        }
        this.outline.tree = await outlineApi.getTree(pid)
      } catch (error: any) {
        console.error('加载大纲树失败:', error)
        this.error = error.message
        this.outline.tree = []
      } finally {
        this.outline.loading = false
      }
    },

    /**
     * 设置当前大纲节点
     */
    setCurrentOutlineNode(node: OutlineNode | null): void {
      this.outline.currentNode = node
    },

    /**
     * 创建大纲节点
     */
    async createOutlineNode(projectId: string, nodeData: any): Promise<OutlineNode> {
      try {
        // 调用大纲API创建节点
        const response = await outlineApi.create(projectId, {
          parentId: nodeData.parentId || undefined,
          title: nodeData.title || '新节点',
          type: nodeData.type || 'section',
          order: nodeData.order,
        })
        // 刷新大纲树
        await this.loadOutlineTree(projectId)
        return response as unknown as OutlineNode
      } catch (error: any) {
        console.error('创建大纲节点失败:', error)
        throw error
      }
    },

    /**
     * 更新大纲节点
     */
    async updateOutlineNode(
      nodeId: string,
      projectId: string,
      nodeData: any,
    ): Promise<OutlineNode> {
      try {
        // 调用大纲更新API
        const response = await outlineApi.update(nodeId, projectId, nodeData)
        // 刷新大纲树
        await this.loadOutlineTree(projectId)
        return response as unknown as OutlineNode
      } catch (error: any) {
        console.error('更新大纲节点失败:', error)
        throw error
      }
    },

    /**
     * 删除大纲节点
     */
    async deleteOutlineNode(nodeId: string, projectId: string): Promise<void> {
      try {
        // 调用大纲删除API
        await outlineApi.delete(nodeId, projectId)
        // 刷新大纲树
        await this.loadOutlineTree(projectId)
      } catch (error: any) {
        console.error('删除大纲节点失败:', error)
        throw error
      }
    },

    /**
     * 移动/重排大纲节点
     */
    async moveOutlineNode(
      nodeId: string,
      projectId: string,
      payload: { parentId?: string; order: number },
    ): Promise<void> {
      try {
        await moveDocument(nodeId, {
          parentId: payload.parentId,
          order: payload.order,
        })
        await this.loadOutlineTree(projectId)
      } catch (error: any) {
        console.error('移动大纲节点失败:', error)
        throw error
      }
    },

    // ==================== AI Agent 上下文 ====================

    /**
     * 更新 AI Agent 上下文
     */
    async updateAgentContext(): Promise<void> {
      if (!this.currentProjectId) return

      try {
        // 加载相关角色
        await this.loadCharacters()
        this.ai.agentContext.characters = this.characters.list.slice(0, 10) // 限制数量

        // 加载相关地点
        await this.loadLocations()
        this.ai.agentContext.locations = this.locations.list.slice(0, 10)

        // 加载时间线事件
        if (this.timeline.currentTimeline) {
          await this.loadTimelineEvents()
          this.ai.agentContext.events = this.timeline.events.slice(0, 20)
        }
      } catch (error: any) {
        console.error('更新AI上下文失败:', error)
      }
    },

    // ==================== 同步管理 ====================

    /**
     * 初始化同步服务
     */
    initSyncService(): void {
      // 注册同步回调 - 网络恢复时刷新项目列表
      syncService.onSync(async () => {
        await this.loadProjects()
      })

      // 监听同步状态变化
      syncService.onStatusChange((status) => {
        this.sync = status
      })

      // 启动健康检查
      syncService.startHealthCheck()
    },

    /**
     * 停止同步服务
     */
    stopSyncService(): void {
      syncService.stopHealthCheck()
    },

    /**
     * 手动触发同步
     */
    async syncNow(): Promise<void> {
      await syncService.syncNow()
    },

    /**
     * 检查是否在线
     */
    isOnline(): boolean {
      return this.sync.isOnline
    },

    /**
     * 重置状态
     */
    resetState(): void {
      this.projects = []
      this.currentProject = null
      this.projectsLoading = false
      this.documents = []
      this.documentTree = []
      this.currentDocument = null
      this.documentsLoading = false
      this.documentTreeLoading = false
      this.editorContent = ''
      this.editorVersion = 0
      this.isDirty = false
      this.lastSaved = null
      this.autosaveEnabled = true
      this.autosaveInterval = 30000
      this.autosaveQueue = []
      this.isSaving = false
      this.ai = {
        chatHistory: [],
        isProcessing: false,
        lastResult: '',
        sidebarVisible: false,
        currentTool: 'chat',
        config: {
          continueLength: 200,
          polishStyle: 'literary',
          expandLevel: 'moderate',
          rewriteMode: 'meaning',
        },
        history: [],
        error: null,
        selectedText: '',
        agentContext: {
          characters: [],
          locations: [],
          events: [],
        },
      }
      this.characters = {
        list: [],
        relations: [],
        currentCharacter: null,
        loading: false,
      }
      this.locations = {
        list: [],
        relations: [],
        tree: [],
        currentLocation: null,
        loading: false,
      }
      this.timeline = {
        list: [],
        currentTimeline: null,
        events: [],
        loading: false,
        showBar: false,
      }
      this.outline = {
        nodes: [],
        tree: [],
        currentNode: null,
        loading: false,
      }
      this.statisticsCache = {}
      this.sync = syncService.getStatus()
      this.error = null
    },
  },
})
