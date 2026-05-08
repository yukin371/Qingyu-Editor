const STORAGE_PREFIX = 'qingyu_writer_items'

export interface WriterItem {
  id: string
  projectId: string
  name: string
  alias?: string[]
  summary?: string
  category?: string
  createdAt: string
  updatedAt: string
}

const getStorageKey = (projectId: string) => `${STORAGE_PREFIX}:${projectId}`

export function loadWriterItems(projectId: string): WriterItem[] {
  if (!projectId) return []

  try {
    const raw = localStorage.getItem(getStorageKey(projectId))
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as WriterItem[]) : []
  } catch {
    return []
  }
}

export function saveWriterItems(projectId: string, items: WriterItem[]) {
  if (!projectId) return
  localStorage.setItem(getStorageKey(projectId), JSON.stringify(items))
}

export function upsertWriterItem(
  projectId: string,
  payload: {
    id?: string
    name: string
    alias?: string[]
    summary?: string
    category?: string
  },
): WriterItem[] {
  const current = loadWriterItems(projectId)
  const now = new Date().toISOString()
  const existing = payload.id ? current.find((item) => item.id === payload.id) : null

  const nextItem: WriterItem = existing
    ? {
        ...existing,
        name: payload.name,
        alias: payload.alias || [],
        summary: payload.summary || '',
        category: payload.category || '',
        updatedAt: now,
      }
    : {
        id: `writer-item-${Date.now()}-${current.length}`,
        projectId,
        name: payload.name,
        alias: payload.alias || [],
        summary: payload.summary || '',
        category: payload.category || '',
        createdAt: now,
        updatedAt: now,
      }

  const nextItems = existing
    ? current.map((item) => (item.id === existing.id ? nextItem : item))
    : [...current, nextItem]

  saveWriterItems(projectId, nextItems)
  return nextItems
}

export function deleteWriterItem(projectId: string, itemId: string): WriterItem[] {
  const nextItems = loadWriterItems(projectId).filter((item) => item.id !== itemId)
  saveWriterItems(projectId, nextItems)
  return nextItems
}
