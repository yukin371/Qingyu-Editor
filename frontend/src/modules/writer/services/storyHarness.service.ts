import storage from '@/utils/storage'
import {
  createStoryHarnessBatch,
  getLatestStoryHarnessBatch,
  storyHarnessApi,
  type StoryHarnessBatchRecord,
  type StoryHarnessBatchSyncSource,
} from '@/modules/writer/api/story-harness'
import type {
  StoryHarnessChangeRequestPreview,
  StoryHarnessSavedBatchReceipt,
} from '@/modules/writer/stores/v3/storyHarnessStore'

interface PersistStoryHarnessBatchPayload {
  projectId: string
  chapterId: string
  chapterTitle: string
  changeRequests: StoryHarnessChangeRequestPreview[]
}

interface StoryHarnessPersistedBatchResult {
  changeRequests: StoryHarnessChangeRequestPreview[]
  receipt: StoryHarnessSavedBatchReceipt
}

type StoryHarnessBatchRecordLike = Partial<StoryHarnessBatchRecord> | null | undefined

const buildStorageKey = (projectId: string, chapterId: string) =>
  `writer_story_harness_batch:${projectId}:${chapterId}`

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0

const isValidTimestamp = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)

const isBatchSyncSource = (value: unknown): value is StoryHarnessBatchSyncSource =>
  value === 'remote' || value === 'local_fallback'

const normalizeChangeRequests = (
  changeRequests: unknown,
  batchId: string,
  committedAt: number,
): StoryHarnessChangeRequestPreview[] =>
  (Array.isArray(changeRequests) ? changeRequests : []).map((changeRequest, index) => ({
    ...changeRequest,
    id:
      changeRequest.id && changeRequest.id.startsWith('save-batch:')
        ? changeRequest.id
        : `save-batch:${batchId}:${index}:${changeRequest.id}`,
    source: 'save_batch',
    sourceTimestamp: committedAt,
  }))

const normalizeBatchRecord = (
  record: StoryHarnessBatchRecord,
): StoryHarnessPersistedBatchResult => {
  const changeRequests = normalizeChangeRequests(
    record.changeRequests,
    record.batchId,
    record.committedAt,
  )

  return {
    changeRequests,
    receipt: {
      chapterId: record.chapterId,
      chapterTitle: record.chapterTitle,
      count: changeRequests.length,
      committedAt: record.committedAt,
      batchId: record.batchId,
      source: record.source,
    },
  }
}

const createLocalFallbackRecord = (
  payload: PersistStoryHarnessBatchPayload,
  source: StoryHarnessBatchSyncSource,
): StoryHarnessBatchRecord => {
  const committedAt = Date.now()

  return {
    batchId: `story-harness:${payload.chapterId}:${committedAt}`,
    projectId: payload.projectId,
    chapterId: payload.chapterId,
    chapterTitle: payload.chapterTitle,
    committedAt,
    source,
    changeRequests: payload.changeRequests.map((changeRequest) => ({
      ...changeRequest,
      source: 'save_batch',
      sourceTimestamp: committedAt,
    })),
  }
}

const mergeBatchRecord = (
  record: StoryHarnessBatchRecordLike,
  fallbackRecord: StoryHarnessBatchRecord | null,
): StoryHarnessBatchRecord | null => {
  if (!record || typeof record !== 'object') {
    return fallbackRecord
  }

  const projectId = isNonEmptyString(record.projectId)
    ? record.projectId
    : (fallbackRecord?.projectId ?? '')
  const chapterId = isNonEmptyString(record.chapterId)
    ? record.chapterId
    : (fallbackRecord?.chapterId ?? '')

  if (!projectId || !chapterId) {
    return fallbackRecord
  }

  const committedAt = isValidTimestamp(record.committedAt)
    ? record.committedAt
    : (fallbackRecord?.committedAt ?? Date.now())

  const batchId = isNonEmptyString(record.batchId)
    ? record.batchId
    : (fallbackRecord?.batchId ?? `story-harness:${chapterId}:${committedAt}`)

  return {
    batchId,
    projectId,
    chapterId,
    chapterTitle: isNonEmptyString(record.chapterTitle)
      ? record.chapterTitle
      : (fallbackRecord?.chapterTitle ?? ''),
    committedAt,
    source: isBatchSyncSource(record.source) ? record.source : (fallbackRecord?.source ?? 'remote'),
    changeRequests: Array.isArray(record.changeRequests)
      ? record.changeRequests
      : (fallbackRecord?.changeRequests ?? []),
  }
}

class StoryHarnessService {
  private readLocalBatchRecord(
    projectId: string,
    chapterId: string,
  ): StoryHarnessBatchRecord | null {
    return storage.get<StoryHarnessBatchRecord | null>(buildStorageKey(projectId, chapterId), null)
  }

  private readLocalBatch(
    projectId: string,
    chapterId: string,
  ): StoryHarnessPersistedBatchResult | null {
    const record = this.readLocalBatchRecord(projectId, chapterId)
    if (!record) {
      return null
    }

    return normalizeBatchRecord(record)
  }

  private writeLocalBatch(record: StoryHarnessBatchRecord): StoryHarnessPersistedBatchResult {
    storage.set(buildStorageKey(record.projectId, record.chapterId), record)
    return normalizeBatchRecord(record)
  }

  async getLatestBatch(
    projectId: string,
    chapterId: string,
  ): Promise<StoryHarnessPersistedBatchResult | null> {
    if (!projectId || !chapterId) {
      return null
    }

    try {
      const localRecord = this.readLocalBatchRecord(projectId, chapterId)
      const response = await getLatestStoryHarnessBatch(projectId, chapterId)
      const hasWrappedData =
        response != null &&
        typeof response === 'object' &&
        Object.prototype.hasOwnProperty.call(response, 'data')
      const payload = hasWrappedData
        ? ((response as { data?: StoryHarnessBatchRecordLike }).data as StoryHarnessBatchRecordLike)
        : (response as StoryHarnessBatchRecordLike)

      if (!payload) {
        return localRecord ? normalizeBatchRecord(localRecord) : null
      }

      const normalizedRecord = mergeBatchRecord(payload, localRecord)
      if (!normalizedRecord) {
        return null
      }

      return this.writeLocalBatch(normalizedRecord)
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn(
          '[storyHarnessService] failed to load remote batch, fallback to local cache:',
          error,
        )
      }
      return this.readLocalBatch(projectId, chapterId)
    }
  }

  async persistBatch(
    payload: PersistStoryHarnessBatchPayload,
  ): Promise<StoryHarnessPersistedBatchResult> {
    const fallbackRecord = createLocalFallbackRecord(payload, 'local_fallback')

    try {
      const response = await createStoryHarnessBatch(payload.projectId, payload.chapterId, {
        chapterTitle: payload.chapterTitle,
        changeRequests: payload.changeRequests,
      })
      const remoteRecord = mergeBatchRecord(
        ((response as { data?: StoryHarnessBatchRecordLike })?.data ??
          response) as StoryHarnessBatchRecordLike,
        fallbackRecord,
      )

      return this.writeLocalBatch(remoteRecord ?? fallbackRecord)
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn(
          '[storyHarnessService] failed to persist remote batch, fallback to local cache:',
          error,
        )
      }
      return this.writeLocalBatch(fallbackRecord)
    }
  }

  // --- V3 Backend API 集成 ---

  async fetchChapterContext(projectId: string, chapterId: string) {
    if (!projectId || !chapterId) return null
    try {
      const response = await storyHarnessApi.getChapterContext(projectId, chapterId)
      const data = (response as { data?: unknown })?.data ?? response
      return data as import('../api/story-harness').BackendChapterContextResponse
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('[storyHarnessService] fetchChapterContext failed:', error)
      }
      return null
    }
  }

  async fetchChangeRequests(projectId: string, chapterId: string, status = 'pending') {
    if (!projectId || !chapterId) return []
    try {
      const response = await storyHarnessApi.listChangeRequests(projectId, chapterId, status)
      const data = (response as { data?: unknown })?.data ?? response
      const list = data as import('../api/story-harness').BackendChangeRequestListResponse
      return list?.items ?? []
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('[storyHarnessService] fetchChangeRequests failed:', error)
      }
      return []
    }
  }

  async processChangeRequest(requestId: string, status: 'accepted' | 'ignored' | 'deferred') {
    try {
      await storyHarnessApi.processChangeRequest(requestId, { status })
      return true
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('[storyHarnessService] processChangeRequest failed:', error)
      }
      return false
    }
  }

  /** 手动触发章节索引 */
  async triggerIndex(projectId: string, chapterId: string) {
    if (!projectId || !chapterId) return null
    try {
      const response = await storyHarnessApi.triggerIndex(projectId, chapterId)
      const data = (response as { data?: unknown })?.data ?? response
      return data as {
        batchId: string
        generated: number
        pending: number
        deduplicated: number
        source: string
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('[storyHarnessService] triggerIndex failed:', error)
      }
      return null
    }
  }

  /** accepted 后兜底重建 projection */
  async rebuildProjection(projectId: string, chapterId: string) {
    if (!projectId || !chapterId) return null
    try {
      const response = await storyHarnessApi.rebuildProjection(projectId, chapterId)
      const data = (response as { data?: unknown })?.data ?? response
      return data as {
        projectId: string
        chapterId: string
        replayedCount: number
        lastRequestId?: string
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('[storyHarnessService] rebuildProjection failed:', error)
      }
      return null
    }
  }
}

export const storyHarnessService = new StoryHarnessService()
export default storyHarnessService
