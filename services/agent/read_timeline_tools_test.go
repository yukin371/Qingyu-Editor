package agent

import (
	"context"
	"encoding/json"
	"testing"
)

// --- L1: ListTimelinesTool ---

func TestListTimelinesTool_ReturnsSummary(t *testing.T) {
	tdb := newTestDB(t)
	project := tdb.createTestProject(t, "测试项目")
	tdb.createTestTimeline(t, project.ID, "主线")
	tdb.createTestTimeline(t, project.ID, "支线")

	tool := NewListTimelinesTool(tdb.timelineSvc)
	result, err := tool.Execute(context.Background(), map[string]any{
		"project_id": project.ID,
	})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	var timelines []map[string]any
	if err := json.Unmarshal([]byte(result), &timelines); err != nil {
		t.Fatalf("invalid JSON: %v", err)
	}
	if len(timelines) != 2 {
		t.Fatalf("expected 2 timelines, got %d", len(timelines))
	}
	for _, tl := range timelines {
		if _, ok := tl["id"]; !ok {
			t.Fatal("L1 should include id")
		}
		if _, ok := tl["name"]; !ok {
			t.Fatal("L1 should include name")
		}
		if _, ok := tl["description"]; ok {
			t.Fatal("L1 should not include description")
		}
	}
}

func TestListTimelinesTool_MissingProjectID(t *testing.T) {
	tdb := newTestDB(t)
	tool := NewListTimelinesTool(tdb.timelineSvc)
	_, err := tool.Execute(context.Background(), map[string]any{})
	if err == nil {
		t.Fatal("expected error for missing project_id")
	}
}

// --- L2: ListTimelineEventsTool ---

func TestListTimelineEventsTool_ReturnsEventSummaries(t *testing.T) {
	tdb := newTestDB(t)
	project := tdb.createTestProject(t, "测试项目")
	tl := tdb.createTestTimeline(t, project.ID, "主线")
	tdb.createTestTimelineEvent(t, project.ID, tl.ID, "事件A")
	tdb.createTestTimelineEvent(t, project.ID, tl.ID, "事件B")

	tool := NewListTimelineEventsTool(tdb.timelineSvc)
	result, err := tool.Execute(context.Background(), map[string]any{
		"timeline_id": tl.ID,
	})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	var events []map[string]any
	json.Unmarshal([]byte(result), &events)
	if len(events) != 2 {
		t.Fatalf("expected 2 events, got %d", len(events))
	}
	for _, evt := range events {
		if _, ok := evt["id"]; !ok {
			t.Fatal("L2 should include id")
		}
		if _, ok := evt["title"]; !ok {
			t.Fatal("L2 should include title")
		}
		// L2 摘要不包含 description 等大字段
		if _, ok := evt["description"]; ok {
			t.Fatal("L2 should not include description")
		}
	}
}

func TestListTimelineEventsTool_MissingTimelineID(t *testing.T) {
	tdb := newTestDB(t)
	tool := NewListTimelineEventsTool(tdb.timelineSvc)
	_, err := tool.Execute(context.Background(), map[string]any{})
	if err == nil {
		t.Fatal("expected error for missing timeline_id")
	}
}

// --- L3: GetTimelineEventTool ---

func TestGetTimelineEventTool_ReturnsFullDetail(t *testing.T) {
	tdb := newTestDB(t)
	project := tdb.createTestProject(t, "测试项目")
	tl := tdb.createTestTimeline(t, project.ID, "主线")
	evt := tdb.createTestTimelineEvent(t, project.ID, tl.ID, "事件A")

	tool := NewGetTimelineEventTool(tdb.timelineSvc)
	result, err := tool.Execute(context.Background(), map[string]any{
		"event_id": evt.ID,
	})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	var detail map[string]any
	json.Unmarshal([]byte(result), &detail)
	if detail["title"] != "事件A" {
		t.Fatalf("expected title=事件A, got %v", detail["title"])
	}
	// L3 完整详情包含 description
	if _, ok := detail["description"]; !ok {
		t.Fatal("L3 should include description")
	}
}

func TestGetTimelineEventTool_NotFound(t *testing.T) {
	tdb := newTestDB(t)
	tool := NewGetTimelineEventTool(tdb.timelineSvc)
	_, err := tool.Execute(context.Background(), map[string]any{
		"event_id": "nonexistent",
	})
	if err == nil {
		t.Fatal("expected error for nonexistent event")
	}
}
