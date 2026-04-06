// 平台抽象层 — 统一接口定义

export interface Project {
  id: string
  title: string
  description: string
  coverPath: string
  wordCount: number
  status: 'draft' | 'writing' | 'completed'
  createdAt: string
  updatedAt: string
}

export interface Volume {
  id: string
  projectId: string
  title: string
  sortOrder: number
  createdAt: string
}

export interface Chapter {
  id: string
  projectId: string
  volumeId: string | null
  title: string
  content: object // TipTap JSON
  plainText: string
  wordCount: number
  sortOrder: number
  status: 'draft' | 'written' | 'revised'
  createdAt: string
  updatedAt: string
}

export interface Snapshot {
  id: string
  projectId: string
  chapterId: string | null
  label: string
  content: object
  wordCount: number
  trigger: 'auto' | 'manual' | 'milestone'
  createdAt: string
}

export interface AIProviderConfig {
  provider: 'openai' | 'anthropic' | 'ollama' | 'custom'
  apiKey: string
  baseUrl: string
  model: string
}

export interface PlatformService {
  // 项目管理
  createProject(title: string): Promise<Project>
  loadProject(id: string): Promise<Project>
  listProjects(): Promise<Project[]>
  deleteProject(id: string): Promise<void>

  // 章节 CRUD
  saveChapter(chapter: Chapter): Promise<void>
  loadChapter(id: string): Promise<Chapter>
  deleteChapter(id: string): Promise<void>
  reorderChapters(projectId: string, order: string[]): Promise<void>

  // 版本快照
  createSnapshot(projectId: string, chapterId: string | null, label: string, content: object, trigger: string): Promise<Snapshot>
  listSnapshots(projectId: string, chapterId?: string): Promise<Snapshot[]>
  restoreSnapshot(snapshotId: string): Promise<void>
  deleteSnapshot(id: string): Promise<void>

  // 导出
  exportProject(projectId: string, format: 'md' | 'docx' | 'txt'): Promise<string>

  // AI
  callAI(config: AIProviderConfig, prompt: string, context: string): Promise<string>

  // 环境
  readonly platform: 'desktop' | 'mobile'
}
