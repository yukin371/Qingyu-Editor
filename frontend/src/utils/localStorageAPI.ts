/**
 * 本地存储 API
 * 使用 IndexedDB 模拟后端 API
 */

import {
  initDB,
  addItem,
  updateItem,
  getItem,
  getAllItems,
  getItemsByIndex,
  deleteItem,
  STORES
} from './indexedDB'
import { nanoid } from 'nanoid'

// 类型定义
export interface LocalProject {
  projectId: string
  title: string
  description?: string
  type: 'novel' | 'essay' | 'others'
  status: 'draft' | 'writing' | 'completed' | 'published'
  wordCount: number
  chapterCount: number
  createdAt: string
  updatedAt: string
  userId?: string
}

export interface LocalDocument {
  documentId: string
  projectId: string
  title: string
  content: string
  chapterNum?: number
  wordCount: number
  version: number
  createdAt: string
  updatedAt: string
}

const TEST_SEED_PROJECT_ID = 'project-yljs-1'

function isInTestMode(): boolean {
  if (typeof window === 'undefined') return false
  const params = new URLSearchParams(window.location.search)
  return params.get('test') === 'true'
}

async function seedTestProjectIfNeeded() {
  if (!isInTestMode()) return

  const projects = await getAllItems<LocalProject>(STORES.PROJECTS)
  const alreadyExists = projects.some((p) => p.projectId === TEST_SEED_PROJECT_ID)
  const now = new Date()
  const updatedAt = new Date(now.getTime() - 45 * 60 * 1000).toISOString()

  const project: LocalProject = {
    projectId: TEST_SEED_PROJECT_ID,
    title: '云岚纪事',
    description: '仙侠长篇，当前已编辑 3 章。',
    type: 'novel',
    status: 'writing',
    wordCount: 9800,
    chapterCount: 3,
    createdAt: '2026-02-01T10:00:00.000Z',
    updatedAt
  }

  const seedDocs: LocalDocument[] = [
    {
      documentId: `${TEST_SEED_PROJECT_ID}-doc-1`,
      projectId: TEST_SEED_PROJECT_ID,
      title: '第一章 云岚初起',
      content: '山门晨雾未散，少年提剑上山，命运自此转动。',
      chapterNum: 1,
      wordCount: 3200,
      version: 1,
      createdAt: '2026-02-01T10:30:00.000Z',
      updatedAt
    },
    {
      documentId: `${TEST_SEED_PROJECT_ID}-doc-2`,
      projectId: TEST_SEED_PROJECT_ID,
      title: '第二章 试剑台',
      content: '试剑台上风声凛冽，旧怨与新局在一剑之间分明。',
      chapterNum: 2,
      wordCount: 3300,
      version: 1,
      createdAt: '2026-02-02T11:00:00.000Z',
      updatedAt
    },
    {
      documentId: `${TEST_SEED_PROJECT_ID}-doc-3`,
      projectId: TEST_SEED_PROJECT_ID,
      title: '第三章 夜探藏经阁',
      content: '夜色如墨，藏经阁灯火微明，一页残卷牵出旧案。',
      chapterNum: 3,
      wordCount: 3300,
      version: 1,
      createdAt: '2026-02-03T09:00:00.000Z',
      updatedAt
    }
  ]

  if (!alreadyExists) {
    await addItem(STORES.PROJECTS, project)
    console.log('✅ 已注入测试项目: 云岚纪事（3章）')
  } else {
    await updateItem(STORES.PROJECTS, project)
    console.log('✅ 已同步测试项目: 云岚纪事（3章）')
  }

  for (const doc of seedDocs) {
    const existing = await getItem<LocalDocument>(STORES.DOCUMENTS, doc.documentId)
    if (!existing) {
      await addItem(STORES.DOCUMENTS, doc)
    } else {
      await updateItem(STORES.DOCUMENTS, doc)
    }
  }
}

/**
 * 初始化本地存储
 */
export async function initLocalStorage() {
  await initDB()
  await seedTestProjectIfNeeded()
  console.log('📦 本地存储已初始化')
}

// ==================== 项目 API ====================

/**
 * 获取项目列表
 */
export async function getLocalProjects(): Promise<LocalProject[]> {
  await seedTestProjectIfNeeded()
  const projects = await getAllItems<LocalProject>(STORES.PROJECTS)
  // 按更新时间倒序排列
  return projects.sort((a, b) => {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  })
}

/**
 * 获取项目详情
 */
export async function getLocalProject(projectId: string): Promise<LocalProject | null> {
  return await getItem<LocalProject>(STORES.PROJECTS, projectId)
}

/**
 * 创建项目
 */
export async function createLocalProject(data: {
  title: string
  description?: string
  type?: 'novel' | 'essay' | 'others'
}): Promise<LocalProject> {
  const project: LocalProject = {
    projectId: nanoid(),
    title: data.title,
    description: data.description || '',
    type: data.type || 'novel',
    status: 'draft',
    wordCount: 0,
    chapterCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  await addItem(STORES.PROJECTS, project)
  console.log('✅ 项目创建成功（本地）:', project.title)
  return project
}

/**
 * 更新项目
 */
export async function updateLocalProject(
  projectId: string,
  data: Partial<LocalProject>
): Promise<LocalProject> {
  const project = await getLocalProject(projectId)
  if (!project) {
    throw new Error('项目不存在')
  }

  const updatedProject: LocalProject = {
    ...project,
    ...data,
    updatedAt: new Date().toISOString()
  }

  await updateItem(STORES.PROJECTS, updatedProject)
  console.log('✅ 项目更新成功（本地）:', updatedProject.title)
  return updatedProject
}

/**
 * 删除项目
 */
export async function deleteLocalProject(projectId: string): Promise<void> {
  // 删除项目下的所有文档
  const documents = await getItemsByIndex<LocalDocument>(
    STORES.DOCUMENTS,
    'projectId',
    projectId
  )

  for (const doc of documents) {
    await deleteItem(STORES.DOCUMENTS, doc.documentId)
  }

  // 删除项目
  await deleteItem(STORES.PROJECTS, projectId)
  console.log('✅ 项目删除成功（本地）:', projectId)
}

// ==================== 文档 API ====================

/**
 * 获取项目的文档列表
 */
export async function getLocalDocuments(projectId: string): Promise<LocalDocument[]> {
  const documents = await getItemsByIndex<LocalDocument>(
    STORES.DOCUMENTS,
    'projectId',
    projectId
  )

  // 按章节号或创建时间排序
  return documents.sort((a, b) => {
    if (a.chapterNum !== undefined && b.chapterNum !== undefined) {
      return a.chapterNum - b.chapterNum
    }
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  })
}

/**
 * 获取文档详情
 */
export async function getLocalDocument(documentId: string): Promise<LocalDocument | null> {
  return await getItem<LocalDocument>(STORES.DOCUMENTS, documentId)
}

/**
 * 创建文档
 */
export async function createLocalDocument(data: {
  projectId: string
  title: string
  chapterNum?: number
}): Promise<LocalDocument> {
  const document: LocalDocument = {
    documentId: nanoid(),
    projectId: data.projectId,
    title: data.title,
    content: '',
    chapterNum: data.chapterNum,
    wordCount: 0,
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  await addItem(STORES.DOCUMENTS, document)

  // 更新项目的章节数
  const project = await getLocalProject(data.projectId)
  if (project) {
    await updateLocalProject(data.projectId, {
      chapterCount: project.chapterCount + 1
    })
  }

  console.log('✅ 文档创建成功（本地）:', document.title)
  return document
}

/**
 * 更新文档
 */
export async function updateLocalDocument(
  documentId: string,
  data: Partial<LocalDocument>
): Promise<LocalDocument> {
  const document = await getLocalDocument(documentId)
  if (!document) {
    throw new Error('文档不存在')
  }

  const updatedDocument: LocalDocument = {
    ...document,
    ...data,
    updatedAt: new Date().toISOString()
  }

  await updateItem(STORES.DOCUMENTS, updatedDocument)
  console.log('✅ 文档更新成功（本地）:', updatedDocument.title)
  return updatedDocument
}

/**
 * 更新文档内容
 */
export async function updateLocalDocumentContent(
  documentId: string,
  content: string
): Promise<LocalDocument> {
  const document = await getLocalDocument(documentId)
  if (!document) {
    throw new Error('文档不存在')
  }

  // 计算字数（去除空白字符）
  const wordCount = content.replace(/[\s\n\r]/g, '').length

  const updatedDocument: LocalDocument = {
    ...document,
    content,
    wordCount,
    version: document.version + 1,
    updatedAt: new Date().toISOString()
  }

  await updateItem(STORES.DOCUMENTS, updatedDocument)

  // 更新项目的总字数
  const documents = await getLocalDocuments(document.projectId)
  const totalWords = documents.reduce((sum, doc) => {
    if (doc.documentId === documentId) {
      return sum + wordCount
    }
    return sum + doc.wordCount
  }, 0)

  await updateLocalProject(document.projectId, {
    wordCount: totalWords
  })

  console.log('✅ 文档内容保存成功（本地）:', wordCount, '字')
  return updatedDocument
}

/**
 * 删除文档
 */
export async function deleteLocalDocument(documentId: string): Promise<void> {
  const document = await getLocalDocument(documentId)
  if (!document) {
    throw new Error('文档不存在')
  }

  await deleteItem(STORES.DOCUMENTS, documentId)

  // 更新项目的章节数和字数
  const project = await getLocalProject(document.projectId)
  if (project) {
    const documents = await getLocalDocuments(document.projectId)
    const totalWords = documents.reduce((sum, doc) => sum + doc.wordCount, 0)

    await updateLocalProject(document.projectId, {
      chapterCount: documents.length,
      wordCount: totalWords
    })
  }

  console.log('✅ 文档删除成功（本地）:', documentId)
}

/**
 * 获取文档树（简化版，暂不支持层级结构）
 */
export async function getLocalDocumentTree(projectId: string): Promise<any[]> {
  const documents = await getLocalDocuments(projectId)

  return documents.map(doc => ({
    documentId: doc.documentId,
    title: doc.title,
    chapterNum: doc.chapterNum,
    wordCount: doc.wordCount,
    children: []
  }))
}

// ==================== 统计信息 ====================

/**
 * 获取统计数据
 */
export async function getLocalStats() {
  const projects = await getAllItems<LocalProject>(STORES.PROJECTS)
  const allDocuments = await getAllItems<LocalDocument>(STORES.DOCUMENTS)

  const totalWords = projects.reduce((sum, p) => sum + p.wordCount, 0)
  const bookCount = projects.length

  // 计算今日新增字数（简化版）
  const today = new Date().toDateString()
  const todayDocs = allDocuments.filter(doc => {
    return new Date(doc.updatedAt).toDateString() === today
  })
  const todayWords = todayDocs.reduce((sum, doc) => sum + doc.wordCount, 0)

  return {
    totalWords,
    bookCount,
    todayWords,
    pending: 0,
    recentProjects: projects.slice(0, 5)
  }
}








