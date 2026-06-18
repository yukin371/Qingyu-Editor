package agent

import (
	"context"
	"encoding/json"
	"fmt"

	"Qingyu-Editor/services"
)

// 章节摘要的最大字符数（控制 token）
const chapterSummaryMaxChars = 500

// --- GetProjectSummaryTool ---

type GetProjectSummaryTool struct {
	projectSvc *services.ProjectService
}

func NewGetProjectSummaryTool(projectSvc *services.ProjectService) *GetProjectSummaryTool {
	return &GetProjectSummaryTool{projectSvc: projectSvc}
}

func (t *GetProjectSummaryTool) Name() string { return "get_project_summary" }
func (t *GetProjectSummaryTool) Description() string {
	return "获取项目概要，包括标题、描述、状态、字数和章节总数。用于了解项目整体规模。"
}
func (t *GetProjectSummaryTool) Parameters() map[string]any {
	return map[string]any{
		"type": "object",
		"properties": map[string]any{
			"project_id": map[string]any{"type": "string", "description": "项目ID"},
		},
		"required": []string{"project_id"},
	}
}

func (t *GetProjectSummaryTool) Execute(ctx context.Context, params map[string]any) (string, error) {
	projectID, _ := params["project_id"].(string)
	if projectID == "" {
		return "", fmt.Errorf("project_id 不能为空")
	}

	project, err := t.projectSvc.Get(projectID)
	if err != nil {
		return "", fmt.Errorf("查询项目失败: %w", err)
	}

	summary := map[string]any{
		"id":           project.ID,
		"title":        project.Title,
		"description":  project.Description,
		"status":       project.Status,
		"wordCount":    project.WordCount,
		"chapterCount": project.ChapterCount,
		"createdAt":    project.CreatedAt,
		"updatedAt":    project.UpdatedAt,
	}

	b, err := json.Marshal(summary)
	if err != nil {
		return "", fmt.Errorf("序列化失败: %w", err)
	}
	return string(b), nil
}

// --- GetChapterSummaryTool (L2 大纲摘要) ---

type GetChapterSummaryTool struct {
	chapterSvc *services.ChapterService
}

func NewGetChapterSummaryTool(chapterSvc *services.ChapterService) *GetChapterSummaryTool {
	return &GetChapterSummaryTool{chapterSvc: chapterSvc}
}

func (t *GetChapterSummaryTool) Name() string { return "get_chapter_summary" }
func (t *GetChapterSummaryTool) Description() string {
	return "获取章节摘要（L2），返回id、title、状态、字数和纯文本前500字。避免直接拉取完整正文以节省token。"
}
func (t *GetChapterSummaryTool) Parameters() map[string]any {
	return map[string]any{
		"type": "object",
		"properties": map[string]any{
			"chapter_id": map[string]any{"type": "string", "description": "章节ID"},
		},
		"required": []string{"chapter_id"},
	}
}

func (t *GetChapterSummaryTool) Execute(ctx context.Context, params map[string]any) (string, error) {
	chapterID, _ := params["chapter_id"].(string)
	if chapterID == "" {
		return "", fmt.Errorf("chapter_id 不能为空")
	}

	chapter, err := t.chapterSvc.Get(chapterID)
	if err != nil {
		return "", fmt.Errorf("查询章节失败: %w", err)
	}

	plainText := chapter.PlainText
	if len([]rune(plainText)) > chapterSummaryMaxChars {
		plainText = string([]rune(plainText)[:chapterSummaryMaxChars]) + "…"
	}

	summary := map[string]any{
		"id":        chapter.ID,
		"title":     chapter.Title,
		"status":    chapter.Status,
		"wordCount": chapter.WordCount,
		"plainText": plainText,
	}

	b, err := json.Marshal(summary)
	if err != nil {
		return "", fmt.Errorf("序列化失败: %w", err)
	}
	return string(b), nil
}

// --- GetInspirationNotesTool ---

type GetInspirationNotesTool struct {
	inspirationSvc *services.InspirationService
}

func NewGetInspirationNotesTool(inspirationSvc *services.InspirationService) *GetInspirationNotesTool {
	return &GetInspirationNotesTool{inspirationSvc: inspirationSvc}
}

func (t *GetInspirationNotesTool) Name() string { return "get_inspiration_notes" }
func (t *GetInspirationNotesTool) Description() string {
	return "获取项目的所有灵感笔记。灵感笔记是作者随手记录的创意火花，AI 在创作时应主动参考以保持连贯。"
}
func (t *GetInspirationNotesTool) Parameters() map[string]any {
	return map[string]any{
		"type": "object",
		"properties": map[string]any{
			"project_id": map[string]any{"type": "string", "description": "项目ID"},
		},
		"required": []string{"project_id"},
	}
}

func (t *GetInspirationNotesTool) Execute(ctx context.Context, params map[string]any) (string, error) {
	projectID, _ := params["project_id"].(string)
	if projectID == "" {
		return "", fmt.Errorf("project_id 不能为空")
	}

	notes, err := t.inspirationSvc.List(projectID)
	if err != nil {
		return "", fmt.Errorf("查询灵感笔记失败: %w", err)
	}

	b, err := json.Marshal(notes)
	if err != nil {
		return "", fmt.Errorf("序列化失败: %w", err)
	}
	return string(b), nil
}
