export interface WriterAIConnectionStatusMeta {
  kind: 'writer_connection_status'
  status: 'offline' | 'error'
  statusText: string
  targetLabel: string
  detail?: string
}

export interface ResolvedWriterAIErrorState {
  message: string
  meta?: WriterAIConnectionStatusMeta
}

export function resolveWriterAIErrorState(error: unknown): ResolvedWriterAIErrorState {
  const fallback = '抱歉，我遇到了一些问题。请稍后再试。'
  if (!error || typeof error !== 'object') {
    return { message: fallback }
  }

  const record = error as {
    code?: string
    message?: string
    response?: {
      status?: number
      data?: Record<string, unknown> | string
    }
  }

  const status = record.response?.status
  const responseData = record.response?.data
  const responseMessage =
    typeof responseData === 'string'
      ? responseData
      : typeof responseData?.message === 'string'
        ? responseData.message
        : typeof responseData?.detail === 'string'
          ? responseData.detail
          : typeof responseData?.error === 'string'
            ? responseData.error
            : ''

  if (status === 401) {
    return { message: 'AI 请求未通过鉴权，请刷新页面后重试。' }
  }
  if (status === 404) {
    return { message: '当前 AI 接口不可用，请检查服务配置后重试。' }
  }
  if (status && status >= 500) {
    return { message: responseMessage || 'AI 服务暂时不可用，请稍后再试。' }
  }
  if (record.code === 'ECONNABORTED' || /timeout/i.test(record.message || '')) {
    return { message: 'AI 请求超时，请稍后重试。' }
  }
  if (/network error/i.test(record.message || '')) {
    return {
      message: 'AI 服务连接失败，请确认本地 AI 服务已启动。',
      meta: {
        kind: 'writer_connection_status',
        status: 'offline',
        statusText: '服务未连接',
        targetLabel: 'AI 服务不可用',
        detail: '当前请求已经发出，但本地 AI 服务未启动或无法连接到配置地址。',
      },
    }
  }

  return { message: responseMessage || fallback }
}
