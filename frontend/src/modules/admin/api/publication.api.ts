import { getPendingAudits, reviewAudit } from './audit.api'

export interface PendingPublication {
  id: string
  type: 'project' | 'document'
  resourceId: string
  resourceTitle: string
  createdBy: string
  createdAt: string
  metadata?: Record<string, unknown>
}

export interface GetPendingPublicationsParams {
  page?: number
  pageSize?: number
  type?: string
  keyword?: string
}

export interface ReviewPublicationPayload {
  action: 'approve' | 'reject'
  note?: string
}

export interface PendingPublicationsResponse {
  data: {
    items: PendingPublication[]
    total: number
  }
}

type RawAuditRecord = {
  id?: string
  contentType?: string
  type?: string
  status?: string
  createdAt?: string
  createdBy?: string
  createdByName?: string
  authorName?: string
  resourceId?: string
  resourceTitle?: string
  title?: string
  targetTitle?: string
  metadata?: Record<string, unknown>
}

function mapPublicationType(rawType?: string): 'project' | 'document' {
  if (rawType === 'book' || rawType === 'project') return 'project'
  return 'document'
}

function normalizePendingPublication(item: RawAuditRecord): PendingPublication {
  const type = mapPublicationType(item.contentType || item.type)
  return {
    id: item.id || '',
    type,
    resourceId: item.resourceId || '',
    resourceTitle: item.resourceTitle || item.title || item.targetTitle || '未命名',
    createdBy: item.createdByName || item.authorName || item.createdBy || '-',
    createdAt: item.createdAt || '',
    metadata: item.metadata || {},
  }
}

export async function getPendingPublications(
  params?: GetPendingPublicationsParams,
): Promise<PendingPublicationsResponse> {
  const response = await getPendingAudits({
    page: params?.page,
    pageSize: params?.pageSize,
  })
  const payload = (response as any)?.data ?? response ?? {}
  const rawItems = Array.isArray(payload?.items) ? payload.items : []

  let items = rawItems.map((item: RawAuditRecord) => normalizePendingPublication(item))

  if (params?.type) {
    items = items.filter((item: PendingPublication) => item.type === params.type)
  }

  if (params?.keyword?.trim()) {
    const keyword = params.keyword.trim().toLowerCase()
    items = items.filter((item: PendingPublication) =>
      item.resourceTitle.toLowerCase().includes(keyword),
    )
  }

  return {
    data: {
      items,
      total:
        params?.type || params?.keyword ? items.length : Number(payload?.total || items.length),
    },
  }
}

export async function reviewPublication(id: string, payload: ReviewPublicationPayload) {
  return reviewAudit(id, {
    approved: payload.action === 'approve',
    reason: payload.note,
  })
}
