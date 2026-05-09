import { writerSampleBookMeta } from './yunlanWriterMock'
import { getWorkspaceMockProject } from './workspaceMock'
import type { PublishRecord } from '@/modules/writer/api/publish'

const STORAGE_KEY = 'qingyu:writer:published-preview:v1'

type PublishedBridgeChapter = {
  id: string
  chapterNum: number
  title: string
  content: string
  wordCount: number
  isFree: boolean
  publishedAt?: string
}

type PublishedBridgeBookDetail = {
  book: {
    id: string
    title: string
    author: string
    cover: string
    description: string
    tags: string[]
    category: string
    categoryName: string
    status: 'serializing' | 'completed'
    wordCount: number
    chapterCount: number
    rating: number
    viewCount: number
    favoriteCount: number
    lastUpdateTime: string
  }
  chapters: PublishedBridgeChapter[]
}

type PublishedBridgeStorage = Record<string, PublishedBridgeBookDetail>

const safeParse = (raw: string | null): PublishedBridgeStorage => {
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw) as PublishedBridgeStorage
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

const readStorage = (): PublishedBridgeStorage => {
  if (typeof window === 'undefined') return {}
  return safeParse(window.localStorage.getItem(STORAGE_KEY))
}

const writeStorage = (data: PublishedBridgeStorage) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

const normalizeContent = (raw: string) => raw.replace(/^#\s+.+?\n+/m, '').trim()

const buildBaseFromWriterProject = (
  projectId: string,
  fallbackTitle?: string,
): PublishedBridgeBookDetail | null => {
  const mockProject = getWorkspaceMockProject(projectId)
  if (!mockProject) return null

  const chapters = mockProject.chapters
    .slice()
    .sort((a, b) => a.chapterNum - b.chapterNum)
    .map((chapter) => {
      const rawContent = mockProject.contentByDocId[chapter.id] || ''
      return {
        id: chapter.id,
        chapterNum: chapter.chapterNum,
        title: chapter.title,
        content: normalizeContent(rawContent),
        wordCount: chapter.wordCount || normalizeContent(rawContent).length,
        isFree: true,
      } as PublishedBridgeChapter
    })

  return {
    book: {
      id: projectId,
      title: mockProject.project.title || fallbackTitle || projectId,
      author: writerSampleBookMeta.author,
      cover: writerSampleBookMeta.cover || '',
      description: writerSampleBookMeta.introduction || '来自写作工作区的本地发布预览内容。',
      tags: [...(writerSampleBookMeta.tags || ['创作发布'])],
      category: '虚构文学',
      categoryName: '虚构文学',
      status: 'serializing',
      wordCount: chapters.reduce((sum, item) => sum + (item.wordCount || 0), 0),
      chapterCount: chapters.length,
      rating: 0,
      viewCount: 0,
      favoriteCount: 0,
      lastUpdateTime: new Date().toISOString(),
    },
    chapters,
  }
}

const toSet = (records: PublishRecord[]) =>
  new Set(records.filter((item) => item.status === 'published').map((item) => item.chapter_id))

export const syncPublishedBookFromRecords = (
  projectId: string,
  records: PublishRecord[],
  options?: { title?: string },
): PublishedBridgeBookDetail | null => {
  const base = buildBaseFromWriterProject(projectId, options?.title)
  if (!base) return null

  const publishedSet = toSet(records)
  const publishedAtMap = new Map(records.map((item) => [item.chapter_id, item.published_at]))
  const publishedChapters = base.chapters
    .filter((chapter) => publishedSet.has(chapter.id))
    .map((chapter) => ({
      ...chapter,
      publishedAt: publishedAtMap.get(chapter.id),
    }))

  const storage = readStorage()
  if (publishedChapters.length === 0) {
    delete storage[projectId]
    writeStorage(storage)
    return null
  }

  const detail: PublishedBridgeBookDetail = {
    book: {
      ...base.book,
      chapterCount: publishedChapters.length,
      wordCount: publishedChapters.reduce((sum, item) => sum + (item.wordCount || 0), 0),
      lastUpdateTime: new Date().toISOString(),
      title: options?.title || base.book.title,
    },
    chapters: publishedChapters,
  }

  storage[projectId] = detail
  writeStorage(storage)
  return detail
}
