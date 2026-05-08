/**
 * 项目导入/导出工具
 * 支持将项目导出为 ZIP 压缩包，从 ZIP 导入项目
 */

import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { http } from '@/core/http'

// ==================== 类型定义 ====================

export interface ExportDocument {
  documentId: string
  title: string
  content: string
  parentId?: string
  sortOrder: number
}

export interface ExportProject {
  projectId: string
  title: string
  description?: string
  documents: ExportDocument[]
}

export interface ImportResult {
  success: boolean
  projectId?: string
  title?: string
  documentCount?: number
  error?: string
}

// API 响应类型
interface ProjectResponse {
  id?: string
  title?: string
  description?: string
}

interface DocumentNode {
  documentId?: string
  id?: string
  title: string
  parentId?: string
  sortOrder?: number
  children?: DocumentNode[]
}

interface ContentResponse {
  content?: string
}

// ==================== 导出功能 ====================

/**
 * 构建文档树结构
 */
function buildDocumentTree(documents: ExportDocument[]): Map<string | undefined, ExportDocument[]> {
  const tree = new Map<string | undefined, ExportDocument[]>()

  for (const doc of documents) {
    const parentId = doc.parentId || undefined
    if (!tree.has(parentId)) {
      tree.set(parentId, [])
    }
    tree.get(parentId)!.push(doc)
  }

  // 按 sortOrder 排序
  for (const [, children] of tree) {
    children.sort((a, b) => a.sortOrder - b.sortOrder)
  }

  return tree
}

/**
 * 递归添加文档到 ZIP
 */
function addDocumentsToZip(
  zip: any,
  documents: ExportDocument[],
  tree: Map<string | undefined, ExportDocument[]>,
  parentPath: string,
  parentId?: string
): void {
  const children = tree.get(parentId) || []

  for (const doc of children) {
    // 检查是否有子文档
    const hasChildren = (tree.get(doc.documentId) || []).length > 0

    if (hasChildren) {
      // 有子文档，创建文件夹
      const folderPath = `${parentPath}${sanitizeFileName(doc.title)}/`
      const folder = zip.folder(folderPath)

      // 添加当前文档内容（如果有）
      if (doc.content) {
        folder!.file(`${sanitizeFileName(doc.title)}.txt`, doc.content)
      }

      // 递归添加子文档
      addDocumentsToZip(zip, documents, tree, folderPath, doc.documentId)
    } else {
      // 没有子文档，直接添加 TXT 文件
      const fileName = `${parentPath}${sanitizeFileName(doc.title)}.txt`
      zip.file(fileName, doc.content || '')
    }
  }
}

/**
 * 清理文件名（移除非法字符）
 */
function sanitizeFileName(name: string): string {
  return name
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, '_')
    .substring(0, 100) // 限制长度
}

/**
 * 导出项目为 ZIP
 */
export async function exportProjectToZip(projectId: string): Promise<void> {
  try {
    // 1. 获取项目详情
    const project = await http.get<ProjectResponse>(`/writer/projects/${projectId}`)

    // 2. 获取文档树
    const documentsResponse = await http.get<DocumentNode[]>(
      `/writer/project/${projectId}/documents/tree`
    )

    // 3. 获取所有文档内容
    const documents: ExportDocument[] = []
    const documentList = flattenDocuments(documentsResponse)

    for (const doc of documentList) {
      try {
        const contentResponse = await http.get<ContentResponse>(
          `/writer/documents/${doc.documentId || doc.id}/content`
        )
        const currentDocId = doc.documentId || doc.id
        if (!currentDocId) continue
        documents.push({
          documentId: currentDocId,
          title: doc.title,
          content: contentResponse?.content || '',
          parentId: doc.parentId,
          sortOrder: doc.sortOrder || 0,
        })
      } catch {
        const currentDocId = doc.documentId || doc.id
        if (!currentDocId) continue
        // 内容获取失败时添加空内容
        documents.push({
          documentId: currentDocId,
          title: doc.title,
          content: '',
          parentId: doc.parentId,
          sortOrder: doc.sortOrder || 0,
        })
      }
    }

    // 4. 构建 ZIP
    const zip = new JSZip()
    const rootFolder = sanitizeFileName(project.title || '未命名项目')

    // 构建文档树并添加到 ZIP
    const tree = buildDocumentTree(documents)
    addDocumentsToZip(zip, documents, tree, `${rootFolder}/`)

    // 5. 生成并下载 ZIP
    const blob = await zip.generateAsync({ type: 'blob' })
    saveAs(blob, `${rootFolder}.zip`)

    console.log(`[Export] 项目 "${project.title}" 导出成功，包含 ${documents.length} 个文档`)
  } catch (error: unknown) {
    console.error('[Export] 导出失败:', error)
    throw new Error(`导出失败: ${error instanceof Error ? error.message : '未知错误'}`)
  }
}

/**
 * 扁平化文档树
 */
function flattenDocuments(nodes: DocumentNode[], result: DocumentNode[] = []): DocumentNode[] {
  if (!Array.isArray(nodes)) return result

  for (const node of nodes) {
    result.push(node)
    if (node.children && Array.isArray(node.children)) {
      flattenDocuments(node.children, result)
    }
  }

  return result
}

// ==================== 导入功能 ====================

interface ParsedDocument {
  title: string
  content: string
  isFolder: boolean
  children: ParsedDocument[]
}

/**
 * 从 ZIP 导入项目
 */
export async function importProjectFromZip(file: File): Promise<ImportResult> {
  try {
    // 1. 解析 ZIP 文件
    const zip = await JSZip.loadAsync(file)

    // 2. 解析文件结构
    const rootFolder = findRootFolder(zip)
    if (!rootFolder) {
      return { success: false, error: '无法找到项目根目录' }
    }

    const projectTitle = rootFolder.replace(/\/$/, '')
    const documents = await parseZipStructure(zip, rootFolder)

    // 3. 调用后端 API 创建项目
    const result = await createProjectWithDocuments(projectTitle, documents)

    return result
  } catch (error: unknown) {
    console.error('[Import] 导入失败:', error)
    return { success: false, error: `导入失败: ${error instanceof Error ? error.message : '未知错误'}` }
  }
}

/**
 * 查找 ZIP 根目录
 */
function findRootFolder(zip: any): string | null {
  const folders = new Set<string>()

  zip.forEach((relativePath: string) => {
    const parts = relativePath.split('/')
    if (parts.length > 1) {
      folders.add(parts[0] + '/')
    }
  })

  // 返回第一个顶级文件夹
  return folders.size > 0 ? Array.from(folders)[0] : null
}

/**
 * 解析 ZIP 文件结构
 */
async function parseZipStructure(zip: any, rootFolder: string): Promise<ParsedDocument[]> {
  const documents: ParsedDocument[] = []
  const folderMap = new Map<string, ParsedDocument>()

  // 收集所有文件路径
  const filePaths: string[] = []
  zip.forEach((relativePath: string) => {
    if (relativePath.startsWith(rootFolder) && relativePath !== rootFolder) {
      filePaths.push(relativePath)
    }
  })

  // 处理每个文件
  for (const path of filePaths) {
    const relativeToRoot = path.substring(rootFolder.length)
    const parts = relativeToRoot.split('/').filter(Boolean)

    if (parts.length === 0) continue

    // 检查是否是文件夹
    const isFolder = path.endsWith('/')

    if (isFolder) {
      // 创建文件夹节点
      const folderName = parts[parts.length - 1]
      const folder: ParsedDocument = {
        title: folderName,
        content: '',
        isFolder: true,
        children: [],
      }
      folderMap.set(path, folder)
    } else if (parts[parts.length - 1].endsWith('.txt')) {
      // 处理 TXT 文件
      const fileName = parts[parts.length - 1].replace('.txt', '')
      const content = await zip.file(path)?.async('string') || ''

      const doc: ParsedDocument = {
        title: fileName,
        content,
        isFolder: false,
        children: [],
      }

      // 确定父路径
      if (parts.length === 1) {
        // 根目录下的文件
        documents.push(doc)
      } else {
        // 子目录下的文件
        const parentPath = path.substring(0, path.lastIndexOf('/'))
        const parentFolder = folderMap.get(parentPath + '/')
        if (parentFolder) {
          parentFolder.children.push(doc)
        } else {
          documents.push(doc)
        }
      }
    }
  }

  // 将文件夹添加到文档树
  for (const [path, folder] of folderMap) {
    const relativeToRoot = path.substring(rootFolder.length)
    const parts = relativeToRoot.split('/').filter(Boolean)

    if (parts.length === 1) {
      // 顶级文件夹
      documents.push(folder)
    } else {
      // 子文件夹
      const parentPath = parts.slice(0, -1).join('/')
      const parentFolder = folderMap.get(rootFolder + parentPath + '/')
      if (parentFolder) {
        parentFolder.children.push(folder)
      }
    }
  }

  return documents
}

/**
 * 调用后端 API 创建项目和文档
 */
async function createProjectWithDocuments(
  projectTitle: string,
  documents: ParsedDocument[]
): Promise<ImportResult> {
  try {
    // 1. 创建项目
    const projectResponse = await http.post<ProjectResponse>('/writer/projects', {
      title: projectTitle,
      description: `从文件导入于 ${new Date().toLocaleString('zh-CN')}`,
    })

    const projectId = projectResponse?.id
    if (!projectId) {
      return { success: false, error: '创建项目失败：未返回项目ID' }
    }

    // 2. 创建文档
    let documentCount = 0
    await createDocumentsRecursive(projectId, documents, null, () => {
      documentCount += 1
    })

    return {
      success: true,
      projectId,
      title: projectTitle,
      documentCount,
    }
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : '未知错误' }
  }
}

/**
 * 递归创建文档
 */
async function createDocumentsRecursive(
  projectId: string,
  documents: ParsedDocument[],
  parentId: string | null,
  onCreated: () => void
): Promise<void> {
  for (const doc of documents) {
    try {
      const response = await http.post<{ id?: string }>(
        `/writer/project/${projectId}/documents`,
        {
          title: doc.title,
          content: doc.content,
          parentId: parentId || undefined,
        }
      )

      const newDocId = response?.id
      onCreated()

      // 递归创建子文档
      if (doc.children.length > 0 && newDocId) {
        await createDocumentsRecursive(projectId, doc.children, newDocId, onCreated)
      }
    } catch (error) {
      console.error(`[Import] 创建文档失败: ${doc.title}`, error)
    }
  }
}

// ==================== 本地数据导出（IndexedDB 迁移） ====================

/**
 * 导出 IndexedDB 数据为 JSON
 */
export async function exportIndexedDBToJson(): Promise<string> {
  const { getAllItems, STORES } = await import('./indexedDB')

  const projects = await getAllItems<any>(STORES.PROJECTS)
  const documents = await getAllItems<any>(STORES.DOCUMENTS)

  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    projects,
    documents,
  }

  return JSON.stringify(data, null, 2)
}

/**
 * 下载 IndexedDB 数据为 JSON 文件
 */
export async function downloadIndexedDBBackup(): Promise<void> {
  const json = await exportIndexedDBToJson()
  const blob = new Blob([json], { type: 'application/json' })
  saveAs(blob, `qingyu_backup_${new Date().toISOString().split('T')[0]}.json`)
}
