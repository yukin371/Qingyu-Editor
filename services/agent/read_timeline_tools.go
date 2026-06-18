package agent

import (
	"context"
	"encoding/json"
	"fmt"

	"Qingyu-Editor/services"
)

// --- L1: ListTimelinesTool ---

type ListTimelinesTool struct {
	tlSvc *services.TimelineService
}

func NewListTimelinesTool(tlSvc *services.TimelineService) *ListTimelinesTool {
	return &ListTimelinesTool{tlSvc: tlSvc}
}

func (t *ListTimelinesTool) Name() string { return "list_timelines" }
func (t *ListTimelinesTool) Description() string {
	return "列出项目中的时间线摘要（L1），仅返回id和name。用于了解作品有哪些时间线。"
}
func (t *ListTimelinesTool) Parameters() map[string]any {
	return map[string]any{
		"type": "object",
		"properties": map[string]any{
			"project_id": map[string]any{"type": "string", "description": "项目ID"},
		},
		"required": []string{"project_id"},
	}
}

func (t *ListTimelinesTool) Execute(ctx context.Context, params map[string]any) (string, error) {
	projectID, _ := params["project_id"].(string)
	if projectID == "" {
		return "", fmt.Errorf("project_id 不能为空")
	}

	timelines, err := t.tlSvc.List(projectID)
	if err != nil {
		return "", fmt.Errorf("查询时间线列表失败: %w", err)
	}

	summaries := make([]map[string]string, len(timelines))
	for i, tl := range timelines {
		summaries[i] = map[string]string{
			"id":   tl.ID,
			"name": tl.Name,
		}
	}

	b, err := json.Marshal(summaries)
	if err != nil {
		return "", fmt.Errorf("序列化失败: %w", err)
	}
	return string(b), nil
}

// --- L2: ListTimelineEventsTool ---

type ListTimelineEventsTool struct {
	tlSvc *services.TimelineService
}

func NewListTimelineEventsTool(tlSvc *services.TimelineService) *ListTimelineEventsTool {
	return &ListTimelineEventsTool{tlSvc: tlSvc}
}

func (t *ListTimelineEventsTool) Name() string { return "list_timeline_events" }
func (t *ListTimelineEventsTool) Description() string {
	return "列出指定时间线的事件摘要（L2），返回id、title、storyTime、importance、eventType。避免直接拉取完整事件详情。"
}
func (t *ListTimelineEventsTool) Parameters() map[string]any {
	return map[string]any{
		"type": "object",
		"properties": map[string]any{
			"timeline_id": map[string]any{"type": "string", "description": "时间线ID"},
		},
		"required": []string{"timeline_id"},
	}
}

func (t *ListTimelineEventsTool) Execute(ctx context.Context, params map[string]any) (string, error) {
	timelineID, _ := params["timeline_id"].(string)
	if timelineID == "" {
		return "", fmt.Errorf("timeline_id 不能为空")
	}

	events, err := t.tlSvc.ListEvents(timelineID)
	if err != nil {
		return "", fmt.Errorf("查询时间线事件失败: %w", err)
	}

	summaries := make([]map[string]any, len(events))
	for i, evt := range events {
		summaries[i] = map[string]any{
			"id":         evt.ID,
			"title":      evt.Title,
			"storyTime":  evt.StoryTime,
			"importance": evt.Importance,
			"eventType":  evt.EventType,
		}
	}

	b, err := json.Marshal(summaries)
	if err != nil {
		return "", fmt.Errorf("序列化失败: %w", err)
	}
	return string(b), nil
}

// --- L3: GetTimelineEventTool ---

type GetTimelineEventTool struct {
	tlSvc *services.TimelineService
}

func NewGetTimelineEventTool(tlSvc *services.TimelineService) *GetTimelineEventTool {
	return &GetTimelineEventTool{tlSvc: tlSvc}
}

func (t *GetTimelineEventTool) Name() string { return "get_timeline_event" }
func (t *GetTimelineEventTool) Description() string {
	return "获取单个时间线事件的完整详情（L3），包括描述、参与角色、关联地点/章节、持续时间、影响等。"
}
func (t *GetTimelineEventTool) Parameters() map[string]any {
	return map[string]any{
		"type": "object",
		"properties": map[string]any{
			"event_id": map[string]any{"type": "string", "description": "事件ID"},
		},
		"required": []string{"event_id"},
	}
}

func (t *GetTimelineEventTool) Execute(ctx context.Context, params map[string]any) (string, error) {
	eventID, _ := params["event_id"].(string)
	if eventID == "" {
		return "", fmt.Errorf("event_id 不能为空")
	}

	evt, err := t.tlSvc.GetEvent(eventID)
	if err != nil {
		return "", fmt.Errorf("查询时间线事件失败: %w", err)
	}

	b, err := json.Marshal(evt)
	if err != nil {
		return "", fmt.Errorf("序列化失败: %w", err)
	}
	return string(b), nil
}
