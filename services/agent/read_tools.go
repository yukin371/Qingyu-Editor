package agent

import (
	"context"
	"encoding/json"
	"fmt"

	"Qingyu-Editor/database"
	"Qingyu-Editor/services"
)

// --- L1: ListCharactersTool ---

type ListCharactersTool struct {
	charSvc *services.CharacterService
}

func NewListCharactersTool(charSvc *services.CharacterService) *ListCharactersTool {
	return &ListCharactersTool{charSvc: charSvc}
}

func (t *ListCharactersTool) Name() string { return "list_characters" }
func (t *ListCharactersTool) Description() string {
	return "列出项目中的角色摘要（L1），仅返回id和name。用于快速了解项目有哪些角色。"
}
func (t *ListCharactersTool) Parameters() map[string]any {
	return map[string]any{
		"type": "object",
		"properties": map[string]any{
			"project_id": map[string]any{
				"type":        "string",
				"description": "项目ID",
			},
		},
		"required": []string{"project_id"},
	}
}

func (t *ListCharactersTool) Execute(ctx context.Context, params map[string]any) (string, error) {
	projectID, _ := params["project_id"].(string)
	if projectID == "" {
		return "", fmt.Errorf("project_id 不能为空")
	}

	characters, err := t.charSvc.List(projectID)
	if err != nil {
		return "", fmt.Errorf("查询角色列表失败: %w", err)
	}

	// L1: 只返回 id 和 name
	summaries := make([]map[string]string, len(characters))
	for i, c := range characters {
		summaries[i] = map[string]string{
			"id":   c.ID,
			"name": c.Name,
		}
	}

	b, err := json.Marshal(summaries)
	if err != nil {
		return "", fmt.Errorf("序列化失败: %w", err)
	}
	return string(b), nil
}

// --- L2: GetCharacterTool ---

type GetCharacterTool struct {
	charSvc *services.CharacterService
}

func NewGetCharacterTool(charSvc *services.CharacterService) *GetCharacterTool {
	return &GetCharacterTool{charSvc: charSvc}
}

func (t *GetCharacterTool) Name() string        { return "get_character" }
func (t *GetCharacterTool) Description() string { return "获取单个角色的完整档案（L2），包括摘要、性格、背景等详细信息。" }
func (t *GetCharacterTool) Parameters() map[string]any {
	return map[string]any{
		"type": "object",
		"properties": map[string]any{
			"character_id": map[string]any{
				"type":        "string",
				"description": "角色ID",
			},
		},
		"required": []string{"character_id"},
	}
}

func (t *GetCharacterTool) Execute(ctx context.Context, params map[string]any) (string, error) {
	characterID, _ := params["character_id"].(string)
	if characterID == "" {
		return "", fmt.Errorf("character_id 不能为空")
	}

	char, err := t.charSvc.Get(characterID)
	if err != nil {
		return "", fmt.Errorf("查询角色失败: %w", err)
	}

	b, err := json.Marshal(char)
	if err != nil {
		return "", fmt.Errorf("序列化失败: %w", err)
	}
	return string(b), nil
}

// --- L3: GetCharacterRelationsTool ---

type GetCharacterRelationsTool struct {
	charSvc *services.CharacterService
}

func NewGetCharacterRelationsTool(charSvc *services.CharacterService) *GetCharacterRelationsTool {
	return &GetCharacterRelationsTool{charSvc: charSvc}
}

func (t *GetCharacterRelationsTool) Name() string { return "get_character_relations" }
func (t *GetCharacterRelationsTool) Description() string {
	return "获取指定角色的关系链（L3），返回该角色与其他角色的关系列表。"
}
func (t *GetCharacterRelationsTool) Parameters() map[string]any {
	return map[string]any{
		"type": "object",
		"properties": map[string]any{
			"project_id": map[string]any{
				"type":        "string",
				"description": "项目ID",
			},
			"character_id": map[string]any{
				"type":        "string",
				"description": "角色ID",
			},
		},
		"required": []string{"project_id", "character_id"},
	}
}

func (t *GetCharacterRelationsTool) Execute(ctx context.Context, params map[string]any) (string, error) {
	projectID, _ := params["project_id"].(string)
	characterID, _ := params["character_id"].(string)
	if projectID == "" || characterID == "" {
		return "", fmt.Errorf("project_id 和 character_id 不能为空")
	}

	relations, err := t.charSvc.ListRelations(projectID, characterID)
	if err != nil {
		return "", fmt.Errorf("查询角色关系失败: %w", err)
	}

	b, err := json.Marshal(relations)
	if err != nil {
		return "", fmt.Errorf("序列化失败: %w", err)
	}
	return string(b), nil
}

// --- L1: ListVolumesChaptersTool ---

type ListVolumesChaptersTool struct {
	volumeSvc  *services.VolumeService
	chapterSvc *services.ChapterService
}

func NewListVolumesChaptersTool(volumeSvc *services.VolumeService, chapterSvc *services.ChapterService) *ListVolumesChaptersTool {
	return &ListVolumesChaptersTool{volumeSvc: volumeSvc, chapterSvc: chapterSvc}
}

func (t *ListVolumesChaptersTool) Name() string { return "list_volumes_chapters" }
func (t *ListVolumesChaptersTool) Description() string {
	return "列出项目的卷章树形结构（L1），仅返回卷名和章名。用于了解作品整体结构。"
}
func (t *ListVolumesChaptersTool) Parameters() map[string]any {
	return map[string]any{
		"type": "object",
		"properties": map[string]any{
			"project_id": map[string]any{
				"type":        "string",
				"description": "项目ID",
			},
		},
		"required": []string{"project_id"},
	}
}

func (t *ListVolumesChaptersTool) Execute(ctx context.Context, params map[string]any) (string, error) {
	projectID, _ := params["project_id"].(string)
	if projectID == "" {
		return "", fmt.Errorf("project_id 不能为空")
	}

	volumes, err := t.volumeSvc.List(projectID)
	if err != nil {
		return "", fmt.Errorf("查询卷列表失败: %w", err)
	}

	chapters, err := t.chapterSvc.List(projectID)
	if err != nil {
		return "", fmt.Errorf("查询章节列表失败: %w", err)
	}

	// 按volume_id分组章节
	chapterMap := make(map[string][]database.Chapter)
	for _, ch := range chapters {
		chapterMap[ch.VolumeID] = append(chapterMap[ch.VolumeID], ch)
	}

	// 构建树形结构
	type chapterSummary struct {
		ID    string `json:"id"`
		Title string `json:"title"`
	}
	type volumeSummary struct {
		ID       string           `json:"id"`
		Title    string           `json:"title"`
		Chapters []chapterSummary `json:"chapters"`
	}

	tree := make([]volumeSummary, 0, len(volumes))
	for _, vol := range volumes {
		vs := volumeSummary{
			ID:       vol.ID,
			Title:    vol.Title,
			Chapters: make([]chapterSummary, 0),
		}
		for _, ch := range chapterMap[vol.ID] {
			vs.Chapters = append(vs.Chapters, chapterSummary{
				ID:    ch.ID,
				Title: ch.Title,
			})
		}
		tree = append(tree, vs)
	}

	b, err := json.Marshal(tree)
	if err != nil {
		return "", fmt.Errorf("序列化失败: %w", err)
	}
	return string(b), nil
}

// --- L3: GetChapterContentTool ---

type GetChapterContentTool struct {
	chapterSvc *services.ChapterService
}

func NewGetChapterContentTool(chapterSvc *services.ChapterService) *GetChapterContentTool {
	return &GetChapterContentTool{chapterSvc: chapterSvc}
}

func (t *GetChapterContentTool) Name() string { return "get_chapter_content" }
func (t *GetChapterContentTool) Description() string {
	return "获取指定章节的完整内容（L3），包括标题、正文、纯文本和字数。"
}
func (t *GetChapterContentTool) Parameters() map[string]any {
	return map[string]any{
		"type": "object",
		"properties": map[string]any{
			"chapter_id": map[string]any{
				"type":        "string",
				"description": "章节ID",
			},
		},
		"required": []string{"chapter_id"},
	}
}

func (t *GetChapterContentTool) Execute(ctx context.Context, params map[string]any) (string, error) {
	chapterID, _ := params["chapter_id"].(string)
	if chapterID == "" {
		return "", fmt.Errorf("chapter_id 不能为空")
	}

	chapter, err := t.chapterSvc.Get(chapterID)
	if err != nil {
		return "", fmt.Errorf("查询章节失败: %w", err)
	}

	b, err := json.Marshal(chapter)
	if err != nil {
		return "", fmt.Errorf("序列化失败: %w", err)
	}
	return string(b), nil
}
