import { httpService } from '@/core/services/http.service'
import type { StoryHarnessChangeRequestPreview } from '@/modules/writer/stores/v3/storyHarnessStore'

export type StoryHarnessBatchSyncSource = 'remote' | 'local_fallback'

export interface StoryHarnessBatchRecord {
  batchId: string
  projectId: string
  chapterId: string
  chapterTitle: string
  committedAt: number
  source: StoryHarnessBatchSyncSource
  changeRequests: StoryHarnessChangeRequestPreview[]
}

export interface CreateStoryHarnessBatchRequest {
  chapterTitle: string
  changeRequests: StoryHarnessChangeRequestPreview[]
}

// --- 后端对接 DTO ---

export interface BackendChapterContextResponse {
  characters: BackendCharacterDTO[]
  relations: BackendRelationDTO[]
  pendingCRs: number
}

export interface BackendCharacterDTO {
  id: string
  name: string
  alias?: string[]
  traits?: string[]
  currentState?: string
  shortDescription?: string
  avatarUrl?: string
}

export interface BackendRelationDTO {
  id: string
  fromId: string
  toId: string
  fromName: string
  toName: string
  type: string
  strength: number
  notes?: string
}

export interface BackendChangeRequestDTO {
  id: string
  batchId: string
  chapterId: string
  category: string
  priority: string
  status: string
  title: string
  description?: string
  suggestedChange?: Record<string, unknown>
  evidence?: { documentId: string; paragraphIdx: number; quoteText: string }[]
  source: string
  createdAt?: string
  updatedAt?: string
}

export interface BackendChangeRequestListResponse {
  items: BackendChangeRequestDTO[]
  total: number
}

export interface ProcessChangeRequestPayload {
  status: 'accepted' | 'ignored' | 'deferred'
}

const BASE_PROJECT_URL = '/writer/project'
const BASE_WRITER_URL = '/writer'

const buildStoryHarnessBatchUrl = (projectId: string, chapterId: string) =>
  `${BASE_PROJECT_URL}/${projectId}/documents/${chapterId}/story-harness/batches`

const buildChapterContextUrl = (projectId: string, chapterId: string) =>
  `${BASE_WRITER_URL}/projects/${projectId}/chapters/${chapterId}/context`

const buildTriggerIndexUrl = (projectId: string, chapterId: string) =>
  `${BASE_WRITER_URL}/projects/${projectId}/chapters/${chapterId}/trigger-index`

const buildRebuildProjectionUrl = (projectId: string, chapterId: string) =>
  `${BASE_WRITER_URL}/projects/${projectId}/chapters/${chapterId}/rebuild-projection`

const buildChangeRequestListUrl = (projectId: string, chapterId: string) =>
  `${BASE_WRITER_URL}/projects/${projectId}/chapters/${chapterId}/change-requests`

export const storyHarnessApi = {
  createBatch(projectId: string, chapterId: string, data: CreateStoryHarnessBatchRequest) {
    return httpService.post<StoryHarnessBatchRecord>(buildStoryHarnessBatchUrl(projectId, chapterId), data)
  },

  getLatestBatch(projectId: string, chapterId: string) {
    return httpService.get<StoryHarnessBatchRecord | null>(
      `${buildStoryHarnessBatchUrl(projectId, chapterId)}/latest`,
    )
  },

  // --- 后端 V3 API ---

  /** 获取章节上下文（角色 + 关系 + 待处理数） */
  getChapterContext(projectId: string, chapterId: string) {
    return httpService.get<BackendChapterContextResponse>(
      buildChapterContextUrl(projectId, chapterId),
    )
  },

  /** 手动触发章节索引（规则引擎生成变更建议） */
  triggerIndex(projectId: string, chapterId: string) {
    return httpService.post<{ batchId: string; generated: number; pending: number; deduplicated: number; source: string }>(
      buildTriggerIndexUrl(projectId, chapterId),
    )
  },

  /** 手动重建章节投影（用于 accepted 后兜底修复） */
  rebuildProjection(projectId: string, chapterId: string) {
    return httpService.post<{ projectId: string; chapterId: string; replayedCount: number; lastRequestId?: string }>(
      buildRebuildProjectionUrl(projectId, chapterId),
    )
  },

  /** 获取章节变更建议列表 */
  listChangeRequests(projectId: string, chapterId: string, status = 'pending') {
    return httpService.get<BackendChangeRequestListResponse>(
      `${buildChangeRequestListUrl(projectId, chapterId)}?status=${status}`,
    )
  },

  /** 处理变更建议（接受/忽略/延后） */
  processChangeRequest(requestId: string, payload: ProcessChangeRequestPayload) {
    return httpService.put<void>(
      `${BASE_WRITER_URL}/change-requests/${requestId}/status`,
      payload,
    )
  },
}

export const createStoryHarnessBatch = (
  projectId: string,
  chapterId: string,
  data: CreateStoryHarnessBatchRequest,
) => storyHarnessApi.createBatch(projectId, chapterId, data)

export const getLatestStoryHarnessBatch = (projectId: string, chapterId: string) =>
  storyHarnessApi.getLatestBatch(projectId, chapterId)
