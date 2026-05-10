package services

import (
	"database/sql"
	"os"
	"path/filepath"
	"testing"

	"Qingyu-Editor/database"

	_ "github.com/mattn/go-sqlite3"
)

type testServices struct {
	db        *sql.DB
	project   *ProjectService
	volume    *VolumeService
	chapter   *ChapterService
	character *CharacterService
	location  *LocationService
}

func newTestServices(t *testing.T) *testServices {
	t.Helper()

	schemaPath := filepath.Join("..", "database", "schema.sql")
	schemaSQL, err := os.ReadFile(schemaPath)
	if err != nil {
		t.Fatalf("读取测试 schema 失败: %v", err)
	}

	dbPath := filepath.Join(t.TempDir(), "integration.db")
	db, err := sql.Open("sqlite3", dbPath+"?_foreign_keys=on&_loc=auto")
	if err != nil {
		t.Fatalf("打开测试数据库失败: %v", err)
	}
	t.Cleanup(func() {
		_ = db.Close()
	})

	if _, err := db.Exec(string(schemaSQL)); err != nil {
		t.Fatalf("初始化测试 schema 失败: %v", err)
	}

	return &testServices{
		db:        db,
		project:   NewProjectService(db),
		volume:    NewVolumeService(db),
		chapter:   NewChapterService(db),
		character: NewCharacterService(db),
		location:  NewLocationService(db),
	}
}

func createTestProject(t *testing.T, svc *ProjectService, title string) database.Project {
	t.Helper()
	project, err := svc.Create(database.CreateProjectInput{
		Title:  title,
		Status: "draft",
	})
	if err != nil {
		t.Fatalf("创建测试项目失败: %v", err)
	}
	return project
}

func createTestVolume(t *testing.T, svc *VolumeService, projectID string, title string, sortOrder int) database.Volume {
	t.Helper()
	volume, err := svc.Create(database.CreateVolumeInput{
		ProjectID: projectID,
		Title:     title,
		SortOrder: intPtr(sortOrder),
	})
	if err != nil {
		t.Fatalf("创建测试卷失败: %v", err)
	}
	return volume
}

func createTestChapter(t *testing.T, svc *ChapterService, projectID string, volumeID *string, title string, sortOrder int) database.Chapter {
	t.Helper()

	input := database.CreateChapterInput{
		ProjectID: projectID,
		Title:     title,
		SortOrder: intPtr(sortOrder),
		Status:    "draft",
	}
	if volumeID != nil {
		input.VolumeID = *volumeID
	}

	chapter, err := svc.Create(input)
	if err != nil {
		t.Fatalf("创建测试章节失败: %v", err)
	}
	return chapter
}

func createTestCharacter(t *testing.T, svc *CharacterService, projectID string, name string) database.Character {
	t.Helper()
	character, err := svc.Create(database.CreateCharacterInput{
		ProjectID: projectID,
		Name:      name,
	})
	if err != nil {
		t.Fatalf("创建测试角色失败: %v", err)
	}
	return character
}

func createTestLocation(t *testing.T, svc *LocationService, projectID string, name string) database.Location {
	t.Helper()
	location, err := svc.Create(database.CreateLocationInput{
		ProjectID: projectID,
		Name:      name,
	})
	if err != nil {
		t.Fatalf("创建测试地点失败: %v", err)
	}
	return location
}

func intPtr(value int) *int {
	return &value
}
