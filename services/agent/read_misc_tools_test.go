package agent

import (
	"context"
	"encoding/json"
	"strings"
	"testing"

	"Qingyu-Editor/database"
)

// --- GetProjectSummaryTool ---

func TestGetProjectSummaryTool_ReturnsMeta(t *testing.T) {
	tdb := newTestDB(t)
	project := tdb.createTestProject(t, "测试项目")

	tool := NewGetProjectSummaryTool(tdb.projectSvc)
	result, err := tool.Execute(context.Background(), map[string]any{
		"project_id": project.ID,
	})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	var summary map[string]any
	json.Unmarshal([]byte(result), &summary)
	if summary["title"] != "测试项目" {
		t.Fatalf("expected title=测试项目, got %v", summary["title"])
	}
	wantKeys := map[string]bool{
		"id": true, "title": true, "description": true, "status": true,
		"wordCount": true, "chapterCount": true, "createdAt": true, "updatedAt": true,
	}
	if len(summary) != len(wantKeys) {
		t.Fatalf("project summary has %d keys, want %d: %v", len(summary), len(wantKeys), summary)
	}
	for k := range wantKeys {
		if _, ok := summary[k]; !ok {
			t.Fatalf("project summary missing key %s", k)
		}
	}
}

func TestGetProjectSummaryTool_MissingProjectID(t *testing.T) {
	tdb := newTestDB(t)
	tool := NewGetProjectSummaryTool(tdb.projectSvc)
	_, err := tool.Execute(context.Background(), map[string]any{})
	if err == nil {
		t.Fatal("expected error for missing project_id")
	}
}

// --- GetChapterSummaryTool (L2 of 大纲) ---

func TestGetChapterSummaryTool_ReturnsSummary(t *testing.T) {
	tdb := newTestDB(t)
	project := tdb.createTestProject(t, "测试项目")
	vol := tdb.createTestVolume(t, project.ID, "第一卷")
	ch := tdb.createTestChapter(t, project.ID, vol.ID, "第一章")

	tool := NewGetChapterSummaryTool(tdb.chapterSvc)
	result, err := tool.Execute(context.Background(), map[string]any{
		"chapter_id": ch.ID,
	})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	var summary map[string]any
	json.Unmarshal([]byte(result), &summary)
	if summary["title"] != "第一章" {
		t.Fatalf("expected title=第一章, got %v", summary["title"])
	}
	if _, ok := summary["plainText"]; !ok {
		t.Fatal("chapter summary should include plainText")
	}
	if _, ok := summary["wordCount"]; !ok {
		t.Fatal("chapter summary should include wordCount")
	}
	// 摘要不应包含完整 content（HTML）
	if _, ok := summary["content"]; ok {
		t.Fatal("chapter summary should not include full HTML content")
	}
}

func TestGetChapterSummaryTool_MissingChapterID(t *testing.T) {
	tdb := newTestDB(t)
	tool := NewGetChapterSummaryTool(tdb.chapterSvc)
	_, err := tool.Execute(context.Background(), map[string]any{})
	if err == nil {
		t.Fatal("expected error for missing chapter_id")
	}
}

func TestGetChapterSummaryTool_TruncatesLongPlainText(t *testing.T) {
	tdb := newTestDB(t)
	project := tdb.createTestProject(t, "测试项目")
	vol := tdb.createTestVolume(t, project.ID, "第一卷")

	longText := strings.Repeat("字", 600)

	ch, err := tdb.chapterSvc.Create(database.CreateChapterInput{
		ProjectID: project.ID,
		VolumeID:  vol.ID,
		Title:     "长章节",
		Content:   "<p>" + longText + "</p>",
		PlainText: longText,
		Status:    "draft",
	})
	if err != nil {
		t.Fatalf("创建长章节失败: %v", err)
	}

	tool := NewGetChapterSummaryTool(tdb.chapterSvc)
	result, err := tool.Execute(context.Background(), map[string]any{
		"chapter_id": ch.ID,
	})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	var summary map[string]any
	if err := json.Unmarshal([]byte(result), &summary); err != nil {
		t.Fatalf("invalid JSON: %v", err)
	}

	plainText, _ := summary["plainText"].(string)
	if rc := len([]rune(plainText)); rc != 501 {
		t.Fatalf("expected truncated plainText to be 501 runes (500 chars + ellipsis), got %d", rc)
	}
	if !strings.HasSuffix(plainText, "…") {
		t.Fatalf("expected truncated plainText to end with ellipsis, got: %q", plainText)
	}
}

// --- GetInspirationNotesTool ---

func TestGetInspirationNotesTool_ReturnsNotes(t *testing.T) {
	tdb := newTestDB(t)
	project := tdb.createTestProject(t, "测试项目")
	tdb.createTestInspirationNote(t, project.ID, "灵感A")
	tdb.createTestInspirationNote(t, project.ID, "灵感B")

	tool := NewGetInspirationNotesTool(tdb.inspirationSvc)
	result, err := tool.Execute(context.Background(), map[string]any{
		"project_id": project.ID,
	})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	var notes []map[string]any
	json.Unmarshal([]byte(result), &notes)
	if len(notes) != 2 {
		t.Fatalf("expected 2 notes, got %d", len(notes))
	}
}

func TestGetInspirationNotesTool_MissingProjectID(t *testing.T) {
	tdb := newTestDB(t)
	tool := NewGetInspirationNotesTool(tdb.inspirationSvc)
	_, err := tool.Execute(context.Background(), map[string]any{})
	if err == nil {
		t.Fatal("expected error for missing project_id")
	}
}
