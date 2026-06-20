import { ReviewChapterStream, ReviewFullProjectStream } from '../../../../wailsjs/go/main/App'
import { EventsOn } from '../../../../wailsjs/runtime/runtime'
import { getConfig, type StreamHandlers } from './agent'
import type { AIAgentConfig, AgentResult } from '../types/agent'

/**
 * 流式触发章节审阅。返回 sessionID；审阅结果通过 handlers 回调推送。
 * 订阅在 onDone 或 onError 后自动清理。复用 streamIntent 的 session 过滤模式。
 *
 * 已知限制：与 streamIntent 相同——订阅发生在 Wails binding resolve 之后，
 * resolve 与首个 EventsOn 之间发射的事件会被丢弃（MVP 可接受）。
 */
export interface ReviewStreamHandle {
  sessionID: string
  /** 取消底层 EventsOn 订阅；调用多次安全。 */
  unsubscribe: () => void
}

type TokenPayload = { sessionID: string; delta: string }
type ToolStartPayload = { sessionID: string; toolName: string }
type ToolEndPayload = { sessionID: string; toolName: string; ok: boolean; error?: string }
type DonePayload = { sessionID: string; agentKind: string; result: AgentResult }
type ErrorPayload = { sessionID: string; message: string }

/**
 * 为已 resolve 的 sessionID 订阅 EventsOn。done/error 时自动取消订阅。
 * streamReviewChapter / streamReviewProject 共享此逻辑。
 */
function setupReviewStream(sessionID: string, handlers: StreamHandlers): ReviewStreamHandle {
  const unsubs: Array<() => void> = []
  const cleanup = () => {
    for (const unsub of unsubs) unsub()
  }

  unsubs.push(EventsOn('agent:token', (p: TokenPayload) => {
    if (p.sessionID === sessionID) handlers.onToken(p.delta)
  }))

  if (handlers.onToolStart) {
    const cb = handlers.onToolStart
    unsubs.push(EventsOn('agent:tool_start', (p: ToolStartPayload) => {
      if (p.sessionID === sessionID) cb(p.toolName)
    }))
  }
  if (handlers.onToolEnd) {
    const cb = handlers.onToolEnd
    unsubs.push(EventsOn('agent:tool_end', (p: ToolEndPayload) => {
      if (p.sessionID === sessionID) cb(p.toolName, p.ok, p.error)
    }))
  }

  unsubs.push(EventsOn('agent:done', (p: DonePayload) => {
    if (p.sessionID !== sessionID) return
    cleanup()
    handlers.onDone(p.result)
  }))
  unsubs.push(EventsOn('agent:error', (p: ErrorPayload) => {
    if (p.sessionID !== sessionID) return
    cleanup()
    handlers.onError(p.message)
  }))

  return { sessionID, unsubscribe: cleanup }
}

function resolveConfig(config: AIAgentConfig | null) {
  const cfg = config || getConfig()
  if (!cfg || (!cfg.apiKey && !cfg.baseUrl)) {
    throw new Error('AI 未配置，请先在设置中配置 AI Provider')
  }
  return cfg
}

/**
 * 流式触发章节审阅。返回 sessionID；审阅结果通过 handlers 回调推送。
 */
export async function streamReviewChapter(
  conversationId: string,
  projectId: string,
  chapterId: string,
  chapterTitle: string,
  config: AIAgentConfig | null,
  handlers: StreamHandlers,
): Promise<ReviewStreamHandle> {
  const cfg = resolveConfig(config)
  const sessionID = await ReviewChapterStream(cfg, conversationId, projectId, chapterId, chapterTitle)
  return setupReviewStream(sessionID, handlers)
}

/**
 * 流式触发整书审阅。返回 sessionID；审阅结果通过 handlers 回调推送。
 */
export async function streamReviewProject(
  conversationId: string,
  projectId: string,
  config: AIAgentConfig | null,
  handlers: StreamHandlers,
): Promise<ReviewStreamHandle> {
  const cfg = resolveConfig(config)
  const sessionID = await ReviewFullProjectStream(cfg, conversationId, projectId)
  return setupReviewStream(sessionID, handlers)
}
