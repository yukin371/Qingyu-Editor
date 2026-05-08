import httpService from '@/core/services/http.service'
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
    return httpService.post<Timeline>(`${BASE_PROJECT_URL}/${projectId}/timelines`, data)
  },

  /**
   * 获取项目时间线列表
   * GET /api/v1/projects/{projectId}/timelines
   */
  list(projectId: string) {
    return httpService.get<Timeline[]>(`${BASE_PROJECT_URL}/${projectId}/timelines`)
  },

  /**
   * 获取时间线详情
   * GET /api/v1/writer/timelines/{timelineId}
   */
  getDetail(timelineId: string, projectId: string) {
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
    return httpService.get<TimelineEvent[]>(`${BASE_TIMELINE_URL}/${timelineId}/events`)
  },

  /**
   * 获取事件详情
   * GET /api/v1/writer/timeline-events/{eventId}
   */
  getEvent(eventId: string, projectId: string) {
    return httpService.get<TimelineEvent>(`${BASE_EVENT_URL}/${eventId}`, { params: { projectId } })
  },

  /**
   * 更新事件
   * PUT /api/v1/writer/timeline-events/{eventId}
   */
  updateEvent(eventId: string, projectId: string, data: SaveTimelineEventRequest) {
    return httpService.put<TimelineEvent>(`${BASE_EVENT_URL}/${eventId}`, data, {
      params: { projectId },
    })
  },

  /**
   * 删除事件
   * DELETE /api/v1/writer/timeline-events/{eventId}
   */
  deleteEvent(eventId: string, projectId: string) {
    return httpService.delete<void>(`${BASE_EVENT_URL}/${eventId}`, { params: { projectId } })
  },
}

// 便捷函数导出（兼容旧代码）
export const listTimelines = (projectId: string) => timelineApi.list(projectId)
export const listTimelineEvents = (timelineId: string, _projectId?: string) => timelineApi.listEvents(timelineId)
