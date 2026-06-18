package agent

import (
	"context"
	"encoding/json"
	"testing"
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
	if _, ok := summary["wordCount"]; !ok {
		t.Fatal("project summary should include wordCount")
	}
	if _, ok := summary["chapterCount"]; !ok {
		t.Fatal("project summary should include chapterCount")
	}
	if _, ok := summary["status"]; !ok {
		t.Fatal("project summary should include status")
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

func TestGetChapterSummaryTool_ReturnsTruncatedPlainText(t *testing.T) {
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
