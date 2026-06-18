package agent

import (
	"context"
	"encoding/json"
	"testing"

	"Qingyu-Editor/database"
)

// --- L1: ListLocationsTool ---

func TestListLocationsTool_ReturnsNameAndIDOnly(t *testing.T) {
	tdb := newTestDB(t)
	project := tdb.createTestProject(t, "测试项目")
	tdb.createTestLocation(t, project.ID, "云隐城")
	tdb.createTestLocation(t, project.ID, "雪原")

	tool := NewListLocationsTool(tdb.locationSvc)
	result, err := tool.Execute(context.Background(), map[string]any{
		"project_id": project.ID,
	})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	var locations []map[string]any
	if err := json.Unmarshal([]byte(result), &locations); err != nil {
		t.Fatalf("invalid JSON: %v", err)
	}
	if len(locations) != 2 {
		t.Fatalf("expected 2 locations, got %d", len(locations))
	}
	for _, loc := range locations {
		if _, ok := loc["id"]; !ok {
			t.Fatal("L1 should include id")
		}
		if _, ok := loc["name"]; !ok {
			t.Fatal("L1 should include name")
		}
		if _, ok := loc["parentId"]; !ok {
			t.Fatal("L1 should include parentId")
		}
		if _, ok := loc["description"]; ok {
			t.Fatal("L1 should not include description")
		}
	}
}

func TestListLocationsTool_MissingProjectID(t *testing.T) {
	tdb := newTestDB(t)
	tool := NewListLocationsTool(tdb.locationSvc)
	_, err := tool.Execute(context.Background(), map[string]any{})
	if err == nil {
		t.Fatal("expected error for missing project_id")
	}
}

// --- L2: GetLocationTool ---

func TestGetLocationTool_ReturnsFullProfile(t *testing.T) {
	tdb := newTestDB(t)
	project := tdb.createTestProject(t, "测试项目")
	loc := tdb.createTestLocation(t, project.ID, "云隐城")

	tool := NewGetLocationTool(tdb.locationSvc)
	result, err := tool.Execute(context.Background(), map[string]any{
		"location_id": loc.ID,
	})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	var profile map[string]any
	json.Unmarshal([]byte(result), &profile)
	if profile["name"] != "云隐城" {
		t.Fatalf("expected name=云隐城, got %v", profile["name"])
	}
	if _, ok := profile["description"]; !ok {
		t.Fatal("L2 should include description")
	}
}

func TestGetLocationTool_NotFound(t *testing.T) {
	tdb := newTestDB(t)
	tool := NewGetLocationTool(tdb.locationSvc)
	_, err := tool.Execute(context.Background(), map[string]any{
		"location_id": "nonexistent",
	})
	if err == nil {
		t.Fatal("expected error for nonexistent location")
	}
}

// --- L3: GetLocationRelationsTool ---

func TestGetLocationRelationsTool_ReturnsRelations(t *testing.T) {
	tdb := newTestDB(t)
	project := tdb.createTestProject(t, "测试项目")
	loc1 := tdb.createTestLocation(t, project.ID, "云隐城")
	loc2 := tdb.createTestLocation(t, project.ID, "雪原")

	_, err := tdb.locationSvc.CreateRelation(database.CreateLocationRelationInput{
		ProjectID: project.ID,
		FromID:    loc1.ID,
		ToID:      loc2.ID,
		Type:      "相邻",
		Distance:  "三天路程",
	})
	if err != nil {
		t.Fatalf("创建地点关系失败: %v", err)
	}

	tool := NewGetLocationRelationsTool(tdb.locationSvc)
	result, err := tool.Execute(context.Background(), map[string]any{
		"project_id":  project.ID,
		"location_id": loc1.ID,
	})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	var relations []map[string]any
	json.Unmarshal([]byte(result), &relations)
	if len(relations) != 1 {
		t.Fatalf("expected 1 relation, got %d", len(relations))
	}
	if relations[0]["type"] != "相邻" {
		t.Fatalf("expected type=相邻, got %v", relations[0]["type"])
	}
}
