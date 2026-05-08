/**
 * 数据迁移工具
 * 将 IndexedDB 中的本地项目数据迁移到后端数据库
 */

import { initDB, getAllItems, getItemsByIndex, clearStore, STORES } from './indexedDB'
import { httpService } from '@/core/services/http.service'
import type { LocalProject, LocalDocument } from './localStorageAPI'

export interface MigrationResult {
  success: boolean
  projectsMigrated: number
  documentsMigrated: number
  errors: string[]
}

interface MigrationProgress {
  current: number
  total: number
  status: string
}

type ProgressCallback = (progress: MigrationProgress) => void

/**
 * 迁移 IndexedDB 数据到后端
 */
export async function migrateToBackend(onProgress?: ProgressCallback): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: true,
    projectsMigrated: 0,
    documentsMigrated: 0,
    errors: [],
  }

  try {
    // 初始化数据库
    await initDB()

    // 获取所有本地项目
    const localProjects = await getAllItems<LocalProject>(STORES.PROJECTS)
    console.log(`[Migration] Found ${localProjects.length} local projects`)

    if (localProjects.length === 0) {
      console.log('[Migration] No local projects to migrate')
      return result
    }

    const total = localProjects.length

    // 迁移每个项目
    for (let i = 0; i < localProjects.length; i++) {
      const localProject = localProjects[i]
      const projectNum = i + 1

      onProgress?.({
        current: projectNum,
        total,
        status: `正在迁移项目: ${localProject.title}`,
      })

      try {
        // 1. 创建项目
        console.log(`[Migration] Creating project ${projectNum}/${total}: ${localProject.title}`)

        const createResponse = await httpService.post<{
          id: string
          title: string
        }>('/writer/projects', {
          title: localProject.title,
          description: localProject.description || '',
          genre: localProject.type === 'novel' ? '玄幻' : localProject.type,
        })

        const newProjectId = (createResponse as any)?.id || (createResponse as any)?.data?.id
        if (!newProjectId) {
          throw new Error('创建项目失败：未返回项目ID')
        }

        console.log(`[Migration] Project created with ID: ${newProjectId}`)
        result.projectsMigrated++

        // 2. 迁移该项目的文档
        const localDocs = await getItemsByIndex<LocalDocument>(
          STORES.DOCUMENTS,
          'projectId',
          localProject.projectId,
        )

        console.log(
          `[Migration] Found ${localDocs.length} documents for project ${localProject.title}`,
        )

        for (const localDoc of localDocs) {
          try {
            // 创建文档
            await httpService.post(`/writer/project/${newProjectId}/documents`, {
              title: localDoc.title,
              content: localDoc.content || '',
              chapterNumber: localDoc.chapterNum,
              status: 'draft',
            })
            result.documentsMigrated++
            console.log(`[Migration] Document created: ${localDoc.title}`)
          } catch (docError: unknown) {
            const errorMsg = `文档迁移失败 [${localDoc.title}]: ${docError instanceof Error ? docError.message : '未知错误'}`
            console.error(`[Migration] ${errorMsg}`)
            result.errors.push(errorMsg)
          }
        }
      } catch (projectError: unknown) {
        const errorMsg = `项目迁移失败 [${localProject.title}]: ${projectError instanceof Error ? projectError.message : '未知错误'}`
        console.error(`[Migration] ${errorMsg}`)
        result.errors.push(errorMsg)
        result.success = false
      }
    }

    onProgress?.({
      current: total,
      total,
      status: '迁移完成',
    })

    console.log('[Migration] Migration completed:', result)
    return result
  } catch (error: unknown) {
    console.error('[Migration] Migration failed:', error)
    result.success = false
    result.errors.push(`迁移失败: ${error instanceof Error ? error.message : '未知错误'}`)
    return result
  }
}

/**
 * 清空本地 IndexedDB 数据
 * 注意：只有在确认迁移成功后才应该调用此函数
 */
export async function clearLocalData(): Promise<void> {
  try {
    await initDB()
    await clearStore(STORES.PROJECTS)
    await clearStore(STORES.DOCUMENTS)
    console.log('[Migration] Local IndexedDB data cleared')
  } catch (error: unknown) {
    console.error('[Migration] Failed to clear local data:', error)
    throw error
  }
}

/**
 * 检查是否有本地数据需要迁移
 */
export async function hasLocalDataToMigrate(): Promise<{
  hasData: boolean
  projectCount: number
  documentCount: number
}> {
  try {
    await initDB()
    const projects = await getAllItems<LocalProject>(STORES.PROJECTS)
    const documents = await getAllItems<LocalDocument>(STORES.DOCUMENTS)

    return {
      hasData: projects.length > 0,
      projectCount: projects.length,
      documentCount: documents.length,
    }
  } catch (error) {
    console.error('[Migration] Failed to check local data:', error)
    return {
      hasData: false,
      projectCount: 0,
      documentCount: 0,
    }
  }
}

/**
 * 导出本地数据为 JSON（用于备份）
 */
export async function exportLocalData(): Promise<{
  projects: LocalProject[]
  documents: LocalDocument[]
  exportedAt: string
}> {
  await initDB()
  const projects = await getAllItems<LocalProject>(STORES.PROJECTS)
  const documents = await getAllItems<LocalDocument>(STORES.DOCUMENTS)

  return {
    projects,
    documents,
    exportedAt: new Date().toISOString(),
  }
}
