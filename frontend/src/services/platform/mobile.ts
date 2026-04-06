// 移动端实现 — 通过 Capacitor 插件
// Phase 3 实现，当前为占位

import type { PlatformService, Project, Chapter, Snapshot, AIProviderConfig } from './types'

export class MobilePlatform implements PlatformService {
  readonly platform = 'mobile' as const

  async createProject(_title: string): Promise<Project> {
    throw new Error('移动端尚未实现')
  }
  async loadProject(_id: string): Promise<Project> {
    throw new Error('移动端尚未实现')
  }
  async listProjects(): Promise<Project[]> {
    throw new Error('移动端尚未实现')
  }
  async deleteProject(_id: string): Promise<void> {
    throw new Error('移动端尚未实现')
  }
  async saveChapter(_chapter: Chapter): Promise<void> {
    throw new Error('移动端尚未实现')
  }
  async loadChapter(_id: string): Promise<Chapter> {
    throw new Error('移动端尚未实现')
  }
  async deleteChapter(_id: string): Promise<void> {
    throw new Error('移动端尚未实现')
  }
  async reorderChapters(_projectId: string, _order: string[]): Promise<void> {
    throw new Error('移动端尚未实现')
  }
  async createSnapshot(_projectId: string, _chapterId: string | null, _label: string, _content: object, _trigger: string): Promise<Snapshot> {
    throw new Error('移动端尚未实现')
  }
  async listSnapshots(_projectId: string, _chapterId?: string): Promise<Snapshot[]> {
    throw new Error('移动端尚未实现')
  }
  async restoreSnapshot(_snapshotId: string): Promise<void> {
    throw new Error('移动端尚未实现')
  }
  async deleteSnapshot(_id: string): Promise<void> {
    throw new Error('移动端尚未实现')
  }
  async exportProject(_projectId: string, _format: 'md' | 'docx' | 'txt'): Promise<string> {
    throw new Error('移动端尚未实现')
  }
  async callAI(_config: AIProviderConfig, _prompt: string, _context: string): Promise<string> {
    throw new Error('移动端尚未实现')
  }
}
