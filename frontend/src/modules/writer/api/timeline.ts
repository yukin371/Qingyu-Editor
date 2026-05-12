import httpService from '@/core/services/http.service'
import { standaloneLocalBridge } from '../data-bridge/standalone-local'
import {
  isStandaloneLocalWriterAvailable,
  isWailsWriterAvailable,
  wailsWriterBridge,
} from '../data-bridge/wails'
import type {
  Timeline,
  TimelineEvent,
  SaveTimelineRequest,
  SaveTimelineEventRequest,
} from '../types/timeline'

// 后端路由配置 (来自 timeline_router.go):
// POST   /api/v1/writer/projects/:id/timelines
// GET    /api/v1/writer/projects/:id/timelines
// GET    /api/v1/writer/timelines/:timelineId
// DELETE /api/v1/writer/timelines/:timelineId
// POST   /api/v1/writer/timelines/:timelineId/events
// GET    /api/v1/writer/timelines/:timelineId/events
// GET    /api/v1/writer/timelines/:timelineId/visualization
// GET    /api/v1/writer/timeline-events/:eventId
// PUT    /api/v1/writer/timeline-events/:eventId
// DELETE /api/v1/writer/timeline-events/:eventId

const BASE_PROJECT_URL = '/writer/projects'
const BASE_TIMELINE_URL = '/writer/timelines'
const BASE_EVENT_URL = '/writer/timeline-events'

export const timelineApi = {
  // ==========================================
  // 时间线管理 (Timeline CRUD)
  // ==========================================

  /**
   * 创建时间线
   * POST /api/v1/projects/{projectId}/timelines
   */
  create(projectId: string, data: SaveTimelineRequest) {
    if (isWailsWriterAvailable()) {
      return wailsWriterBridge.timeline.create(projectId, data as unknown as Record<string, unknown>)
    }
    if (isStandaloneLocalWriterAvailable()) {
      return standaloneLocalBridge.timeline.create(projectId, data)
    }
    return httpService.post<Timeline>(`${BASE_PROJECT_URL}/${projectId}/timelines`, data)
  },

  /**
   * 获取项目时间线列表
   * GET /api/v1/projects/{projectId}/timelines
   */
  list(projectId: string) {
    if (isWailsWriterAvailable()) {
      return wailsWriterBridge.timeline.list(projectId)
    }
    if (isStandaloneLocalWriterAvailable()) {
      return standaloneLocalBridge.timeline.list(projectId)
    }
    return httpService.get<Timeline[]>(`${BASE_PROJECT_URL}/${projectId}/timelines`)
  },

  /**
   * 获取时间线详情
   * GET /api/v1/writer/timelines/{timelineId}
   */
  getDetail(timelineId: string, projectId: string) {
    if (isWailsWriterAvailable()) {
      return wailsWriterBridge.timeline.get(timelineId)
    }
    if (isStandaloneLocalWriterAvailable()) {
      return standaloneLocalBridge.timeline.get(timelineId)
    }
    return httpService.get<Timeline>(
      `${BASE_TIMELINE_URL}/${timelineId}`,
      { params: { projectId } } as any
    )
  },

  /**
   * 删除时间线
   * DELETE /api/v1/writer/timelines/{timelineId}
   */
  delete(timelineId: string, projectId: string) {
    if (isWailsWriterAvailable()) {
      return wailsWriterBridge.timeline.delete(timelineId)
    }
    if (isStandaloneLocalWriterAvailable()) {
      return standaloneLocalBridge.timeline.delete(timelineId)
    }
    return httpService.delete<void>(
      `${BASE_TIMELINE_URL}/${timelineId}`,
      { params: { projectId } } as any
    )
  },

  /**
   * 获取时间线可视化数据
   * GET /api/v1/writer/timelines/{timelineId}/visualization
   * 返回类型可能是复杂的图表数据，暂时用 any 或定义专门的 Visualization 类型
   */
  getVisualization(timelineId: string) {
    if (isWailsWriterAvailable()) {
      return wailsWriterBridge.timeline.getVisualization(timelineId)
    }
    if (isStandaloneLocalWriterAvailable()) {
      return standaloneLocalBridge.timeline.getVisualization(timelineId)
    }
    return httpService.get<any>(`${BASE_TIMELINE_URL}/${timelineId}/visualization`)
  },

  // ==========================================
  // 事件管理 (Event CRUD)
  // ==========================================

  /**
   * 创建时间线事件
   * POST /api/v1/writer/timelines/{timelineId}/events?projectId=...
   * 注意：后端要求 query 中带 projectId
   */
  createEvent(timelineId: string, projectId: string, data: SaveTimelineEventRequest) {
    if (isWailsWriterAvailable()) {
      return wailsWriterBridge.timeline.createEvent(
        timelineId,
        projectId,
        data as unknown as Record<string, unknown>,
      )
    }
    if (isStandaloneLocalWriterAvailable()) {
      return standaloneLocalBridge.timeline.createEvent(timelineId, projectId, data)
    }
    return httpService.post<TimelineEvent>(
      `${BASE_TIMELINE_URL}/${timelineId}/events`,
      data,
      { params: { projectId } } // POST 请求中 Query 参数需放在 config.params
    )
  },

  /**
   * 获取时间线事件列表
   * GET /api/v1/writer/timelines/{timelineId}/events
   */
  listEvents(timelineId: string) {
    if (isWailsWriterAvailable()) {
      return wailsWriterBridge.timeline.listEvents(timelineId)
    }
    if (isStandaloneLocalWriterAvailable()) {
      return standaloneLocalBridge.timeline.listEvents(timelineId)
    }
    return httpService.get<TimelineEvent[]>(`${BASE_TIMELINE_URL}/${timelineId}/events`)
  },

  /**
   * 获取事件详情
   * GET /api/v1/writer/timeline-events/{eventId}
   */
  getEvent(eventId: string, projectId: string) {
    if (isWailsWriterAvailable()) {
      return wailsWriterBridge.timeline.getEvent(eventId)
    }
    if (isStandaloneLocalWriterAvailable()) {
      return standaloneLocalBridge.timeline.getEvent(eventId)
    }
    return httpService.get<TimelineEvent>(`${BASE_EVENT_URL}/${eventId}`, { params: { projectId } })
  },

  /**
   * 更新事件
   * PUT /api/v1/writer/timeline-events/{eventId}
   */
  updateEvent(eventId: string, projectId: string, data: SaveTimelineEventRequest) {
    if (isWailsWriterAvailable()) {
      return wailsWriterBridge.timeline.updateEvent(
        eventId,
        projectId,
        data as unknown as Record<string, unknown>,
      )
    }
    if (isStandaloneLocalWriterAvailable()) {
      return standaloneLocalBridge.timeline.updateEvent(eventId, projectId, data)
    }
    return httpService.put<TimelineEvent>(`${BASE_EVENT_URL}/${eventId}`, data, {
      params: { projectId },
    })
  },

  /**
   * 删除事件
   * DELETE /api/v1/writer/timeline-events/{eventId}
   */
  deleteEvent(eventId: string, projectId: string) {
    if (isWailsWriterAvailable()) {
      return wailsWriterBridge.timeline.deleteEvent(eventId)
    }
    if (isStandaloneLocalWriterAvailable()) {
      return standaloneLocalBridge.timeline.deleteEvent(eventId, projectId)
    }
    return httpService.delete<void>(`${BASE_EVENT_URL}/${eventId}`, { params: { projectId } })
  },
}

// 便捷函数导出（兼容旧代码）
export const listTimelines = (projectId: string) => timelineApi.list(projectId)
export const listTimelineEvents = (timelineId: string, _projectId?: string) => timelineApi.listEvents(timelineId)
