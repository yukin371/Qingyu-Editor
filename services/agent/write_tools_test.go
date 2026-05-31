package agent

import (
	"context"
	"encoding/json"
	"testing"

	"Qingyu-Editor/database"
	"Qingyu-Editor/services"
)

// --- 写工具测试 ---

func TestSuggestChapterContent_ReturnsSuggestion(t *testing.T) {
	tdb := newTestDB(t)
	project := tdb.createTestProject(t, "测试项目")
	vol := tdb.createTestVolume(t, project.ID, "第一卷")
	ch := tdb.createTestChapter(t, project.ID, vol.ID, "第一章")

	tool := NewSuggestChapterContentTool(tdb.chapterSvc)
	result, err := tool.Execute(context.Background(), map[string]any{
		"chapter_id": ch.ID,
		"action":     "append",
		"content":    "<p>他推开门，发现桌上放着一封信。</p>",
		"summary":    "为第一章续写100字",
	})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	var sug map[string]any
	if err := json.Unmarshal([]byte(result), &sug); err != nil {
		t.Fatalf("expected valid JSON, got %q: %v", result, err)
	}

	if sug["type"] != "text_diff" {
		t.Fatalf("expected type=text_diff, got %v", sug["type"])
	}
	if sug["action"] != "append" {
		t.Fatalf("expected action=append, got %v", sug["action"])
	}
	if sug["target_entity"] != "chapter" {
		t.Fatalf("expected target_entity=chapter, got %v", sug["target_entity"])
	}
	if sug["content"] == nil {
		t.Fatal("expected content field")
	}
	if sug["summary"] != "为第一章续写100字" {
		t.Fatalf("expected summary, got %v", sug["summary"])
	}
}

func TestSuggestChapterContent_MissingParams(t *testing.T) {
	tool := NewSuggestChapterContentTool(nil)
	_, err := tool.Execute(context.Background(), map[string]any{})
	if err == nil {
		t.Fatal("expected error for missing params")
	}
}

func TestSuggestCharacter_ReturnsEntityPreview(t *testing.T) {
	tool := NewSuggestCharacterTool()

	characterJSON := `{"name":"赵衡","summary":"前朝将军之后","traits":["隐忍","心机深"]}`
	result, err := tool.Execute(context.Background(), map[string]any{
		"project_id": "proj_001",
		"action":     "create",
		"content":    characterJSON,
		"summary":    "建议新建角色赵衡",
	})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	var sug map[string]any
	json.Unmarshal([]byte(result), &sug)

	if sug["type"] != "entity_preview" {
		t.Fatalf("expected type=entity_preview, got %v", sug["type"])
	}
	if sug["target_entity"] != "character" {
		t.Fatalf("expected target_entity=character, got %v", sug["target_entity"])
	}
}

func TestSuggestCharacter_MissingParams(t *testing.T) {
	tool := NewSuggestCharacterTool()
	_, err := tool.Execute(context.Background(), map[string]any{
		"project_id": "proj_001",
	})
	if err == nil {
		t.Fatal("expected error for missing content")
	}
}

func TestSuggestOutline_ReturnsStructure(t *testing.T) {
	tool := NewSuggestOutlineTool()

	outlineJSON := `[{"title":"第一卷","chapters":[{"title":"第一章"},{"title":"第二章"}]}]`
	result, err := tool.Execute(context.Background(), map[string]any{
		"project_id": "proj_001",
		"action":     "create",
		"content":    outlineJSON,
		"summary":    "建议创建2卷6章大纲",
	})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	var sug map[string]any
	json.Unmarshal([]byte(result), &sug)

	if sug["type"] != "entity_preview" {
		t.Fatalf("expected type=entity_preview, got %v", sug["type"])
	}
	if sug["target_entity"] != "outline" {
		t.Fatalf("expected target_entity=outline, got %v", sug["target_entity"])
	}
}

func TestSuggestRevision_ReturnsDiff(t *testing.T) {
	tdb := newTestDB(t)
	project := tdb.createTestProject(t, "测试项目")
	vol := tdb.createTestVolume(t, project.ID, "第一卷")
	ch := tdb.createTestChapter(t, project.ID, vol.ID, "第一章")

	tool := NewSuggestRevisionTool(tdb.chapterSvc)
	result, err := tool.Execute(context.Background(), map[string]any{
		"chapter_id":       ch.ID,
		"original_content": "旧内容",
		"content":          "新内容",
		"summary":          "修改第一段描述",
	})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	var sug map[string]any
	json.Unmarshal([]byte(result), &sug)

	if sug["type"] != "text_diff" {
		t.Fatalf("expected type=text_diff, got %v", sug["type"])
	}
	if sug["action"] != "update" {
		t.Fatalf("expected action=update, got %v", sug["action"])
	}
	if sug["original_content"] == nil {
		t.Fatal("expected original_content for diff")
	}
}

func TestSuggestRevision_ChapterNotFound(t *testing.T) {
	tdb := newTestDB(t)

	tool := NewSuggestRevisionTool(tdb.chapterSvc)
	_, err := tool.Execute(context.Background(), map[string]any{
		"chapter_id":       "nonexistent",
		"original_content": "旧",
		"content":          "新",
		"summary":          "test",
	})
	if err == nil {
		t.Fatal("expected error for nonexistent chapter")
	}
}

// 确认写工具没有修改数据库
func TestWriteTools_DoNotModifyDB(t *testing.T) {
	tdb := newTestDB(t)
	project := tdb.createTestProject(t, "测试项目")
	vol := tdb.createTestVolume(t, project.ID, "第一卷")
	ch := tdb.createTestChapter(t, project.ID, vol.ID, "第一章")

	originalContent := ch.Content

	suggestTool := NewSuggestChapterContentTool(tdb.chapterSvc)
	suggestTool.Execute(context.Background(), map[string]any{
		"chapter_id": ch.ID,
		"action":     "append",
		"content":    "<p>新内容</p>",
		"summary":    "test",
	})

	// 验证原始内容未变
	unchanged, _ := tdb.chapterSvc.Get(ch.ID)
	if unchanged.Content != originalContent {
		t.Fatal("write tool should NOT modify the database")
	}
}

// dummy unused import suppress
var _ database.Chapter
var _ *services.ChapterService
