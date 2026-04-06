// 桌面端实现 — 通过 Wails Go 绑定

import type { PlatformService, Project, Chapter, Snapshot, AIProviderConfig } from './types'

// Wails 生成的 Go 绑定类型
import {
  InitDatabase,
  AICall,
} from '../../wailsjs/go/main/App'

import type { ai as aiTypes } from '../../wailsjs/go/models'

export class DesktopPlatform implements PlatformService {
  readonly platform = 'desktop' as const

  private ready = false

  async init(): Promise<void> {
    if (!this.ready) {
      await InitDatabase()
      this.ready = true
    }
  }

  // --- 项目管理 ---
  async createProject(title: string): Promise<Project> {
    // TODO: 通过 Go 后端实现
    throw new Error('尚未实现')
  }

  async loadProject(id: string): Promise<Project> {
    throw new Error('尚未实现')
  }

  async listProjects(): Promise<Project[]> {
    throw new Error('尚未实现')
  }

  async deleteProject(id: string): Promise<void> {
    throw new Error('尚未实现')
  }

  // --- 章节 ---
  async saveChapter(chapter: Chapter): Promise<void> {
    throw new Error('尚未实现')
  }

  async loadChapter(id: string): Promise<Chapter> {
    throw new Error('尚未实现')
  }

  async deleteChapter(id: string): Promise<void> {
    throw new Error('尚未实现')
  }

  async reorderChapters(projectId: string, order: string[]): Promise<void> {
    throw new Error('尚未实现')
  }

  // --- 快照 ---
  async createSnapshot(projectId: string, chapterId: string | null, label: string, content: object, trigger: string): Promise<Snapshot> {
    throw new Error('尚未实现')
  }

  async listSnapshots(projectId: string, chapterId?: string): Promise<Snapshot[]> {
    throw new Error('尚未实现')
  }

  async restoreSnapshot(snapshotId: string): Promise<void> {
    throw new Error('尚未实现')
  }

  async deleteSnapshot(id: string): Promise<void> {
    throw new Error('尚未实现')
  }

  // --- 导出 ---
  async exportProject(projectId: string, format: 'md' | 'docx' | 'txt'): Promise<string> {
    throw new Error('尚未实现')
  }

  // --- AI ---
  async callAI(config: AIProviderConfig, prompt: string, context: string): Promise<string> {
    return await AICall(config as unknown as aiTypes.Config, prompt, context)
  }
}
