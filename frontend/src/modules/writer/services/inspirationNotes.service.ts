import dayjs from 'dayjs'
import storage from '@/utils/storage'
import { isWailsWriterAvailable, wailsWriterBridge } from '@/modules/writer/data-bridge/wails'

export interface InspirationNoteRecord {
  id: string
  projectId: string
  chapterId?: string
  chapterTitle?: string
  title: string
  content: string
  createdAt: string
  updatedAt?: string
}

const buildStorageKey = (projectId: string) => `qingyu_writer_inspirations_${projectId || 'global'}`

function normalizeNote(note: Partial<InspirationNoteRecord>): InspirationNoteRecord {
  return {
    id: note.id || `${Date.now()}`,
    projectId: note.projectId || '',
    chapterId: note.chapterId || '',
    chapterTitle: note.chapterTitle || '',
    title: note.title || '未命名灵感',
    content: note.content || '',
    createdAt: note.createdAt || dayjs().format('MM-DD HH:mm'),
    updatedAt: note.updatedAt || note.createdAt || dayjs().format('MM-DD HH:mm'),
  }
}

function readLocalNotes(projectId: string): InspirationNoteRecord[] {
  const stored = storage.get<InspirationNoteRecord[] | null>(buildStorageKey(projectId), null)
  return Array.isArray(stored) ? stored.map(normalizeNote) : []
}

function writeLocalNotes(projectId: string, notes: InspirationNoteRecord[]) {
  storage.set(buildStorageKey(projectId), notes)
}

export async function listInspirationNotes(projectId: string): Promise<InspirationNoteRecord[]> {
  const normalizedProjectId = projectId || 'global'
  if (isWailsWriterAvailable() && normalizedProjectId !== 'global') {
    try {
      const items = await wailsWriterBridge.inspiration.list(normalizedProjectId)
      const normalized = items.map(normalizeNote)
      writeLocalNotes(normalizedProjectId, normalized)
      return normalized
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('[inspirationNotesService] load from Wails failed, fallback to storage:', error)
      }
    }
  }
  return readLocalNotes(normalizedProjectId)
}

export async function createInspirationNote(payload: {
  projectId: string
  chapterId?: string
  chapterTitle?: string
  title: string
  content: string
}): Promise<InspirationNoteRecord> {
  const normalizedProjectId = payload.projectId || 'global'
  if (isWailsWriterAvailable() && normalizedProjectId !== 'global') {
    try {
      const created = await wailsWriterBridge.inspiration.create(payload)
      const normalized = normalizeNote(created)
      const merged = [normalized, ...readLocalNotes(normalizedProjectId).filter((item) => item.id !== normalized.id)]
      writeLocalNotes(normalizedProjectId, merged)
      return normalized
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('[inspirationNotesService] create via Wails failed, fallback to storage:', error)
      }
    }
  }

  const note = normalizeNote({
    ...payload,
    createdAt: dayjs().format('MM-DD HH:mm'),
  })
  writeLocalNotes(normalizedProjectId, [note, ...readLocalNotes(normalizedProjectId)])
  return note
}

export async function deleteInspirationNote(
  projectId: string,
  noteId: string,
): Promise<void> {
  const normalizedProjectId = projectId || 'global'
  if (isWailsWriterAvailable() && normalizedProjectId !== 'global') {
    try {
      await wailsWriterBridge.inspiration.delete(noteId)
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('[inspirationNotesService] delete via Wails failed, fallback to storage:', error)
      }
    }
  }

  const next = readLocalNotes(normalizedProjectId).filter((item) => item.id !== noteId)
  writeLocalNotes(normalizedProjectId, next)
}
