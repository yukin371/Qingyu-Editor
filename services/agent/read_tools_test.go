package agent

import (
	"context"
	"database/sql"
	"encoding/json"
	"os"
	"path/filepath"
	"testing"

	"Qingyu-Editor/database"
	"Qingyu-Editor/services"

	_ "github.com/mattn/go-sqlite3"
)

// --- 集成测试基础设施 ---

type testDB struct {
	db        *sql.DB
	charSvc   *services.CharacterService
	chapterSvc *services.ChapterService
	volumeSvc  *services.VolumeService
}

func newTestDB(t *testing.T) *testDB {
	t.Helper()

	schemaPath := filepath.Join("..", "..", "database", "schema.sql")
	schemaSQL, err := os.ReadFile(schemaPath)
	if err != nil {
		t.Fatalf("读取 schema 失败: %v", err)
	}

	dbPath := filepath.Join(t.TempDir(), "agent_test.db")
	db, err := sql.Open("sqlite3", dbPath+"?_foreign_keys=on&_loc=auto")
	if err != nil {
		t.Fatalf("打开测试数据库失败: %v", err)
	}
	t.Cleanup(func() { db.Close() })

	if _, err := db.Exec(string(schemaSQL)); err != nil {
		t.Fatalf("初始化 schema 失败: %v", err)
	}

	return &testDB{
		db:         db,
		charSvc:    services.NewCharacterService(db),
		chapterSvc: services.NewChapterService(db),
		volumeSvc:  services.NewVolumeService(db),
	}
}

func (tdb *testDB) createTestProject(t *testing.T, title string) database.Project {
	t.Helper()
	projectSvc := services.NewProjectService(tdb.db)
	p, err := projectSvc.Create(database.CreateProjectInput{
		Title:  title,
		Status: "draft",
	})
	if err != nil {
		t.Fatalf("创建测试项目失败: %v", err)
	}
	return p
}

func (tdb *testDB) createTestCharacter(t *testing.T, projectID, name string) database.Character {
	t.Helper()
	c, err := tdb.charSvc.Create(database.CreateCharacterInput{
		ProjectID: projectID,
		Name:      name,
		Summary:   "测试角色摘要",
		Traits:    []string{"勇敢", "聪明"},
	})
	if err != nil {
		t.Fatalf("创建测试角色失败: %v", err)
	}
	return c
}

func (tdb *testDB) createTestVolume(t *testing.T, projectID, title string) database.Volume {
	t.Helper()
	v, err := tdb.volumeSvc.Create(database.CreateVolumeInput{
		ProjectID: projectID,
		Title:     title,
	})
	if err != nil {
		t.Fatalf("创建测试卷失败: %v", err)
	}
	return v
}

func (tdb *testDB) createTestChapter(t *testing.T, projectID, volumeID, title string) database.Chapter {
	t.Helper()
	ch, err := tdb.chapterSvc.Create(database.CreateChapterInput{
		ProjectID: projectID,
		VolumeID:  volumeID,
		Title:     title,
		Content:   "<p>这是" + title + "的正文内容。</p>",
		PlainText: "这是" + title + "的正文内容。",
		Status:    "draft",
	})
	if err != nil {
		t.Fatalf("创建测试章节失败: %v", err)
	}
	return ch
}

// --- L1: ListCharactersTool ---

func TestListCharactersTool_ReturnsNameAndIDOnly(t *testing.T) {
	tdb := newTestDB(t)
	project := tdb.createTestProject(t, "测试项目")
	tdb.createTestCharacter(t, project.ID, "林雪")
	tdb.createTestCharacter(t, project.ID, "赵衡")

	tool := NewListCharactersTool(tdb.charSvc)
	result, err := tool.Execute(context.Background(), map[string]any{
		"project_id": project.ID,
	})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	// 应该返回 L1 摘要格式：只有 id 和 name
	var characters []map[string]any
	if err := json.Unmarshal([]byte(result), &characters); err != nil {
		t.Fatalf("expected valid JSON array, got %q: %v", result, err)
	}
	if len(characters) != 2 {
		t.Fatalf("expected 2 characters, got %d", len(characters))
	}
	for _, c := range characters {
		if _, ok := c["id"]; !ok {
			t.Fatal("expected id field in L1 summary")
		}
		if _, ok := c["name"]; !ok {
			t.Fatal("expected name field in L1 summary")
		}
		// L1 不应包含详细字段
		if _, ok := c["summary"]; ok {
			t.Fatal("L1 should not include summary")
		}
		if _, ok := c["traits"]; ok {
			t.Fatal("L1 should not include traits")
		}
	}
}

func TestListCharactersTool_EmptyProject(t *testing.T) {
	tdb := newTestDB(t)
	project := tdb.createTestProject(t, "空项目")

	tool := NewListCharactersTool(tdb.charSvc)
	result, err := tool.Execute(context.Background(), map[string]any{
		"project_id": project.ID,
	})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	var characters []map[string]any
	json.Unmarshal([]byte(result), &characters)
	if len(characters) != 0 {
		t.Fatalf("expected 0 characters, got %d", len(characters))
	}
}

// --- L2: GetCharacterTool ---

func TestGetCharacterTool_ReturnsFullProfile(t *testing.T) {
	tdb := newTestDB(t)
	project := tdb.createTestProject(t, "测试项目")
	char := tdb.createTestCharacter(t, project.ID, "林雪")

	tool := NewGetCharacterTool(tdb.charSvc)
	result, err := tool.Execute(context.Background(), map[string]any{
		"character_id": char.ID,
	})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	var profile map[string]any
	json.Unmarshal([]byte(result), &profile)

	if profile["name"] != "林雪" {
		t.Fatalf("expected name=林雪, got %v", profile["name"])
	}
	// L2 应包含详细字段
	if _, ok := profile["summary"]; !ok {
		t.Fatal("L2 should include summary")
	}
	if _, ok := profile["traits"]; !ok {
		t.Fatal("L2 should include traits")
	}
}

func TestGetCharacterTool_NotFound(t *testing.T) {
	tdb := newTestDB(t)

	tool := NewGetCharacterTool(tdb.charSvc)
	_, err := tool.Execute(context.Background(), map[string]any{
		"character_id": "nonexistent",
	})
	if err == nil {
		t.Fatal("expected error for nonexistent character")
	}
}

// --- L3: GetCharacterRelationsTool ---

func TestGetCharacterRelationsTool_ReturnsRelations(t *testing.T) {
	tdb := newTestDB(t)
	project := tdb.createTestProject(t, "测试项目")
	char1 := tdb.createTestCharacter(t, project.ID, "林雪")
	char2 := tdb.createTestCharacter(t, project.ID, "赵衡")

	_, err := tdb.charSvc.CreateRelation(database.CreateCharacterRelationInput{
		ProjectID: project.ID,
		FromID:    char1.ID,
		ToID:      char2.ID,
		Type:      "师徒",
		Strength:  intPtr(8),
		Notes:     "林雪是赵衡的师父",
	})
	if err != nil {
		t.Fatalf("创建关系失败: %v", err)
	}

	tool := NewGetCharacterRelationsTool(tdb.charSvc)
	result, err := tool.Execute(context.Background(), map[string]any{
		"project_id":    project.ID,
		"character_id":  char1.ID,
	})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	var relations []map[string]any
	json.Unmarshal([]byte(result), &relations)
	if len(relations) != 1 {
		t.Fatalf("expected 1 relation, got %d", len(relations))
	}
	if relations[0]["type"] != "师徒" {
		t.Fatalf("expected type=师徒, got %v", relations[0]["type"])
	}
}

// --- L1: ListVolumesChaptersTool ---

func TestListVolumesChaptersTool_ReturnsTree(t *testing.T) {
	tdb := newTestDB(t)
	project := tdb.createTestProject(t, "测试项目")
	vol1 := tdb.createTestVolume(t, project.ID, "第一卷")
	tdb.createTestChapter(t, project.ID, vol1.ID, "第一章")
	tdb.createTestChapter(t, project.ID, vol1.ID, "第二章")

	tool := NewListVolumesChaptersTool(tdb.volumeSvc, tdb.chapterSvc)
	result, err := tool.Execute(context.Background(), map[string]any{
		"project_id": project.ID,
	})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	// 应该返回树形结构：卷 > 章节
	var tree []map[string]any
	json.Unmarshal([]byte(result), &tree)
	if len(tree) != 1 {
		t.Fatalf("expected 1 volume, got %d", len(tree))
	}

	vol := tree[0]
	if vol["title"] != "第一卷" {
		t.Fatalf("expected 第一卷, got %v", vol["title"])
	}
	chapters, ok := vol["chapters"].([]any)
	if !ok {
		t.Fatal("expected chapters array")
	}
	if len(chapters) != 2 {
		t.Fatalf("expected 2 chapters, got %d", len(chapters))
	}
}

// --- L3: GetChapterContentTool ---

func TestGetChapterContentTool_ReturnsContent(t *testing.T) {
	tdb := newTestDB(t)
	project := tdb.createTestProject(t, "测试项目")
	vol := tdb.createTestVolume(t, project.ID, "第一卷")
	ch := tdb.createTestChapter(t, project.ID, vol.ID, "第一章")

	tool := NewGetChapterContentTool(tdb.chapterSvc)
	result, err := tool.Execute(context.Background(), map[string]any{
		"chapter_id": ch.ID,
	})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	var chapter map[string]any
	json.Unmarshal([]byte(result), &chapter)
	if chapter["title"] != "第一章" {
		t.Fatalf("expected 第一章, got %v", chapter["title"])
	}
	if _, ok := chapter["content"]; !ok {
		t.Fatal("expected content field")
	}
	if _, ok := chapter["plainText"]; !ok {
		t.Fatal("expected plainText field")
	}
}

// --- helper ---

func intPtr(v int) *int { return &v }
