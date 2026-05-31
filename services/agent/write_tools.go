package agent

import (
	"context"
	"encoding/json"
	"fmt"

	"Qingyu-Editor/services"
)

// --- SuggestChapterContentTool ---

type SuggestChapterContentTool struct {
	chapterSvc *services.ChapterService
}

func NewSuggestChapterContentTool(chapterSvc *services.ChapterService) *SuggestChapterContentTool {
	return &SuggestChapterContentTool{chapterSvc: chapterSvc}
}

func (t *SuggestChapterContentTool) Name() string { return "suggest_chapter_content" }
func (t *SuggestChapterContentTool) Description() string {
	return "为指定章节生成正文内容建议。action=append追加续写，action=update替换内容。返回suggestion供用户确认。"
}
func (t *SuggestChapterContentTool) Parameters() map[string]any {
	return map[string]any{
		"type": "object",
		"properties": map[string]any{
			"chapter_id": map[string]any{"type": "string", "description": "目标章节ID"},
			"action":     map[string]any{"type": "string", "description": "append或update", "enum": []string{"append", "update"}},
			"content":    map[string]any{"type": "string", "description": "建议的正文内容（HTML）"},
			"summary":    map[string]any{"type": "string", "description": "一句话说明做了什么"},
		},
		"required": []string{"chapter_id", "action", "content", "summary"},
	}
}

func (t *SuggestChapterContentTool) Execute(ctx context.Context, params map[string]any) (string, error) {
	chapterID, _ := params["chapter_id"].(string)
	action, _ := params["action"].(string)
	content, _ := params["content"].(string)
	summary, _ := params["summary"].(string)

	if chapterID == "" || action == "" || content == "" {
		return "", fmt.Errorf("chapter_id, action, content 不能为空")
	}

	// 获取原章节用于校验存在性和生成original_content
	chapter, err := t.chapterSvc.Get(chapterID)
	if err != nil {
		return "", fmt.Errorf("查询章节失败: %w", err)
	}

	sug := map[string]any{
		"type":            "text_diff",
		"action":          action,
		"target_entity":   "chapter",
		"target_id":       chapterID,
		"content":         content,
		"summary":         summary,
		"chapter_title":   chapter.Title,
	}
	if action == "update" {
		sug["original_content"] = chapter.Content
	}

	b, _ := json.Marshal(sug)
	return string(b), nil
}

// --- SuggestCharacterTool ---

type SuggestCharacterTool struct{}

func NewSuggestCharacterTool() *SuggestCharacterTool {
	return &SuggestCharacterTool{}
}

func (t *SuggestCharacterTool) Name() string { return "suggest_character" }
func (t *SuggestCharacterTool) Description() string {
	return "生成角色创建或更新建议。content为角色JSON（name, summary, traits, background等）。返回suggestion供用户确认。"
}
func (t *SuggestCharacterTool) Parameters() map[string]any {
	return map[string]any{
		"type": "object",
		"properties": map[string]any{
			"project_id": map[string]any{"type": "string", "description": "项目ID"},
			"action":     map[string]any{"type": "string", "description": "create或update", "enum": []string{"create", "update"}},
			"content":    map[string]any{"type": "string", "description": "角色数据JSON"},
			"summary":    map[string]any{"type": "string", "description": "一句话说明"},
			"character_id": map[string]any{"type": "string", "description": "update时需要，角色ID"},
		},
		"required": []string{"project_id", "action", "content", "summary"},
	}
}

func (t *SuggestCharacterTool) Execute(ctx context.Context, params map[string]any) (string, error) {
	projectID, _ := params["project_id"].(string)
	action, _ := params["action"].(string)
	content, _ := params["content"].(string)
	summary, _ := params["summary"].(string)
	characterID, _ := params["character_id"].(string)

	if projectID == "" || action == "" || content == "" {
		return "", fmt.Errorf("project_id, action, content 不能为空")
	}

	sug := map[string]any{
		"type":          "entity_preview",
		"action":        action,
		"target_entity": "character",
		"target_id":     characterID,
		"content":       content,
		"summary":       summary,
		"project_id":    projectID,
	}

	b, _ := json.Marshal(sug)
	return string(b), nil
}

// --- SuggestOutlineTool ---

type SuggestOutlineTool struct{}

func NewSuggestOutlineTool() *SuggestOutlineTool {
	return &SuggestOutlineTool{}
}

func (t *SuggestOutlineTool) Name() string { return "suggest_outline" }
func (t *SuggestOutlineTool) Description() string {
	return "生成大纲结构建议。content为卷章树形结构JSON。返回suggestion供用户确认。"
}
func (t *SuggestOutlineTool) Parameters() map[string]any {
	return map[string]any{
		"type": "object",
		"properties": map[string]any{
			"project_id": map[string]any{"type": "string", "description": "项目ID"},
			"action":     map[string]any{"type": "string", "description": "create或update", "enum": []string{"create", "update"}},
			"content":    map[string]any{"type": "string", "description": "大纲结构JSON"},
			"summary":    map[string]any{"type": "string", "description": "一句话说明"},
		},
		"required": []string{"project_id", "action", "content", "summary"},
	}
}

func (t *SuggestOutlineTool) Execute(ctx context.Context, params map[string]any) (string, error) {
	projectID, _ := params["project_id"].(string)
	action, _ := params["action"].(string)
	content, _ := params["content"].(string)
	summary, _ := params["summary"].(string)

	if projectID == "" || action == "" || content == "" {
		return "", fmt.Errorf("project_id, action, content 不能为空")
	}

	sug := map[string]any{
		"type":          "entity_preview",
		"action":        action,
		"target_entity": "outline",
		"target_id":     projectID,
		"content":       content,
		"summary":       summary,
		"project_id":    projectID,
	}

	b, _ := json.Marshal(sug)
	return string(b), nil
}

// --- SuggestRevisionTool ---

type SuggestRevisionTool struct {
	chapterSvc *services.ChapterService
}

func NewSuggestRevisionTool(chapterSvc *services.ChapterService) *SuggestRevisionTool {
	return &SuggestRevisionTool{chapterSvc: chapterSvc}
}

func (t *SuggestRevisionTool) Name() string { return "suggest_revision" }
func (t *SuggestRevisionTool) Description() string {
	return "生成修改建议（diff格式）。需要指定章节和修改内容。返回suggestion供用户确认。"
}
func (t *SuggestRevisionTool) Parameters() map[string]any {
	return map[string]any{
		"type": "object",
		"properties": map[string]any{
			"chapter_id":       map[string]any{"type": "string", "description": "章节ID"},
			"original_content": map[string]any{"type": "string", "description": "被替换的原始内容"},
			"content":          map[string]any{"type": "string", "description": "替换后的新内容"},
			"summary":          map[string]any{"type": "string", "description": "一句话说明"},
		},
		"required": []string{"chapter_id", "original_content", "content", "summary"},
	}
}

func (t *SuggestRevisionTool) Execute(ctx context.Context, params map[string]any) (string, error) {
	chapterID, _ := params["chapter_id"].(string)
	originalContent, _ := params["original_content"].(string)
	content, _ := params["content"].(string)
	summary, _ := params["summary"].(string)

	if chapterID == "" || content == "" {
		return "", fmt.Errorf("chapter_id, content 不能为空")
	}

	// 校验章节存在
	chapter, err := t.chapterSvc.Get(chapterID)
	if err != nil {
		return "", fmt.Errorf("查询章节失败: %w", err)
	}

	sug := map[string]any{
		"type":            "text_diff",
		"action":          "update",
		"target_entity":   "chapter",
		"target_id":       chapterID,
		"content":         content,
		"original_content": originalContent,
		"summary":         summary,
		"chapter_title":   chapter.Title,
	}

	b, _ := json.Marshal(sug)
	return string(b), nil
}
