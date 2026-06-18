package main

import (
	"database/sql"
	"os"
	"path/filepath"
	"testing"
	"time"

	"Qingyu-Editor/ai"

	_ "github.com/mattn/go-sqlite3"
)

func newTestAppDB(t *testing.T) *sql.DB {
	t.Helper()

	schemaPath := filepath.Join("database", "schema.sql")
	schemaSQL, err := os.ReadFile(schemaPath)
	if err != nil {
		t.Fatalf("读取 schema 失败: %v", err)
	}

	dbPath := filepath.Join(t.TempDir(), "app_test.db")
	db, err := sql.Open("sqlite3", dbPath+"?_foreign_keys=on&_loc=auto")
	if err != nil {
		t.Fatalf("打开数据库失败: %v", err)
	}
	if _, err := db.Exec(string(schemaSQL)); err != nil {
		t.Fatalf("执行 schema 失败: %v", err)
	}

	t.Cleanup(func() { _ = db.Close() })
	return db
}

// TestAgentService_NoDeadlock 验证 agentService() 在 services 缓存为空时不会死锁。
// 回归测试：commit 74b5462 引入的 serviceMu 是非可重入 sync.Mutex，
// agentService() 持锁后调用 characterService() 等内部 service 方法会再次
// 尝试获取同一锁，必然死锁。
func TestAgentService_NoDeadlock(t *testing.T) {
	app := &App{
		appName: "Qingyu-Editor-test",
		db:      newTestAppDB(t),
	}

	cfg := ai.Config{}

	done := make(chan error, 1)
	go func() {
		_, err := app.agentService(cfg)
		done <- err
	}()

	select {
	case <-done:
		// 返回值（错误与否）无关紧要——关键是没卡住
	case <-time.After(3 * time.Second):
		t.Fatal("agentService() 死锁：3 秒未返回")
	}
}

// TestReviewService_NoDeadlock 同上，验证 reviewService() 不死锁。
func TestReviewService_NoDeadlock(t *testing.T) {
	app := &App{
		appName: "Qingyu-Editor-test",
		db:      newTestAppDB(t),
	}

	cfg := ai.Config{}

	done := make(chan error, 1)
	go func() {
		_, err := app.reviewService(cfg)
		done <- err
	}()

	select {
	case <-done:
	case <-time.After(3 * time.Second):
		t.Fatal("reviewService() 死锁：3 秒未返回")
	}
}
