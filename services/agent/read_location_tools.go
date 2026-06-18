package agent

import (
	"context"
	"encoding/json"
	"fmt"

	"Qingyu-Editor/services"
)

// --- L1: ListLocationsTool ---

type ListLocationsTool struct {
	locSvc *services.LocationService
}

func NewListLocationsTool(locSvc *services.LocationService) *ListLocationsTool {
	return &ListLocationsTool{locSvc: locSvc}
}

func (t *ListLocationsTool) Name() string { return "list_locations" }
func (t *ListLocationsTool) Description() string {
	return "列出项目中的地点摘要（L1），仅返回id、name、parentId。用于了解作品世界观有哪些地点。"
}
func (t *ListLocationsTool) Parameters() map[string]any {
	return map[string]any{
		"type": "object",
		"properties": map[string]any{
			"project_id": map[string]any{"type": "string", "description": "项目ID"},
		},
		"required": []string{"project_id"},
	}
}

func (t *ListLocationsTool) Execute(ctx context.Context, params map[string]any) (string, error) {
	projectID, _ := params["project_id"].(string)
	if projectID == "" {
		return "", fmt.Errorf("project_id 不能为空")
	}

	locations, err := t.locSvc.List(projectID)
	if err != nil {
		return "", fmt.Errorf("查询地点列表失败: %w", err)
	}

	summaries := make([]map[string]string, len(locations))
	for i, loc := range locations {
		summaries[i] = map[string]string{
			"id":       loc.ID,
			"name":     loc.Name,
			"parentId": loc.ParentID,
		}
	}

	b, err := json.Marshal(summaries)
	if err != nil {
		return "", fmt.Errorf("序列化失败: %w", err)
	}
	return string(b), nil
}

// --- L2: GetLocationTool ---

type GetLocationTool struct {
	locSvc *services.LocationService
}

func NewGetLocationTool(locSvc *services.LocationService) *GetLocationTool {
	return &GetLocationTool{locSvc: locSvc}
}

func (t *GetLocationTool) Name() string { return "get_location" }
func (t *GetLocationTool) Description() string {
	return "获取单个地点的完整档案（L2），包括描述、气候、文化、地理、氛围等。"
}
func (t *GetLocationTool) Parameters() map[string]any {
	return map[string]any{
		"type": "object",
		"properties": map[string]any{
			"location_id": map[string]any{"type": "string", "description": "地点ID"},
		},
		"required": []string{"location_id"},
	}
}

func (t *GetLocationTool) Execute(ctx context.Context, params map[string]any) (string, error) {
	locationID, _ := params["location_id"].(string)
	if locationID == "" {
		return "", fmt.Errorf("location_id 不能为空")
	}

	loc, err := t.locSvc.Get(locationID)
	if err != nil {
		return "", fmt.Errorf("查询地点失败: %w", err)
	}

	b, err := json.Marshal(loc)
	if err != nil {
		return "", fmt.Errorf("序列化失败: %w", err)
	}
	return string(b), nil
}

// --- L3: GetLocationRelationsTool ---

type GetLocationRelationsTool struct {
	locSvc *services.LocationService
}

func NewGetLocationRelationsTool(locSvc *services.LocationService) *GetLocationRelationsTool {
	return &GetLocationRelationsTool{locSvc: locSvc}
}

func (t *GetLocationRelationsTool) Name() string { return "get_location_relations" }
func (t *GetLocationRelationsTool) Description() string {
	return "获取指定地点与其他地点的关系链（L3），包括类型、距离、备注。"
}
func (t *GetLocationRelationsTool) Parameters() map[string]any {
	return map[string]any{
		"type": "object",
		"properties": map[string]any{
			"project_id":  map[string]any{"type": "string", "description": "项目ID"},
			"location_id": map[string]any{"type": "string", "description": "地点ID"},
		},
		"required": []string{"project_id", "location_id"},
	}
}

func (t *GetLocationRelationsTool) Execute(ctx context.Context, params map[string]any) (string, error) {
	projectID, _ := params["project_id"].(string)
	locationID, _ := params["location_id"].(string)
	if projectID == "" || locationID == "" {
		return "", fmt.Errorf("project_id 和 location_id 不能为空")
	}

	relations, err := t.locSvc.ListRelations(projectID, locationID)
	if err != nil {
		return "", fmt.Errorf("查询地点关系失败: %w", err)
	}

	b, err := json.Marshal(relations)
	if err != nil {
		return "", fmt.Errorf("序列化失败: %w", err)
	}
	return string(b), nil
}
