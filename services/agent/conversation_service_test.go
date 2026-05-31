package agent

import (
	"database/sql"
	"os"
	"path/filepath"
	"testing"
	"time"

	_ "github.com/mattn/go-sqlite3"
)

// --- 对话持久化集成测试 ---

func newConversationTestDB(t *testing.T) *sql.DB {
	t.Helper()

	schemaPath := filepath.Join("..", "..", "database", "schema.sql")
	schemaSQL, err := os.ReadFile(schemaPath)
	if err != nil {
		t.Fatalf("读取 schema 失败: %v", err)
	}

	dbPath := filepath.Join(t.TempDir(), "conversation_test.db")
	db, err := sql.Open("sqlite3", dbPath+"?_foreign_keys=on&_loc=auto")
	if err != nil {
		t.Fatalf("打开测试数据库失败: %v", err)
	}
	t.Cleanup(func() { db.Close() })

	if _, err := db.Exec(string(schemaSQL)); err != nil {
		t.Fatalf("初始化 schema 失败: %v", err)
	}

	return db
}

func mustInsertTestProject(t *testing.T, db *sql.DB) string {
	t.Helper()
	id := "test-project-001"
	_, err := db.Exec("INSERT INTO projects (id, title, status) VALUES (?, ?, ?)", id, "测试项目", "draft")
	if err != nil {
		t.Fatalf("插入测试项目失败: %v", err)
	}
	return id
}

func TestConversationService_CreateConversation(t *testing.T) {
	db := newConversationTestDB(t)
	projectID := mustInsertTestProject(t, db)
	svc := NewConversationService(db)

	conv, err := svc.Create(projectID)
	if err != nil {
		t.Fatalf("创建对话失败: %v", err)
	}
	if conv.ID == "" {
		t.Fatal("对话 ID 不应为空")
	}
	if conv.ProjectID != projectID {
		t.Fatalf("期望 project_id=%s, got %s", projectID, conv.ProjectID)
	}
	if conv.CreatedAt.IsZero() {
		t.Fatal("created_at 不应为零值")
	}
}

func TestConversationService_SaveAndLoadMessages(t *testing.T) {
	db := newConversationTestDB(t)
	projectID := mustInsertTestProject(t, db)
	svc := NewConversationService(db)

	conv, err := svc.Create(projectID)
	if err != nil {
		t.Fatalf("创建对话失败: %v", err)
	}

	// 保存用户消息
	msg1 := ConversationMessage{
		Role:      "user",
		Content:   "帮我写一段林雪走进房间的描写",
		Timestamp: time.Now(),
	}
	saved1, err := svc.SaveMessage(conv.ID, msg1)
	if err != nil {
		t.Fatalf("保存消息失败: %v", err)
	}
	if saved1.ID == "" {
		t.Fatal("消息 ID 不应为空")
	}

	// 保存助手回复
	msg2 := ConversationMessage{
		Role:      "assistant",
		Content:   "林雪推开雕花木门...",
		Timestamp: time.Now(),
	}
	svc.SaveMessage(conv.ID, msg2)

	// 加载对话
	messages, err := svc.LoadMessages(conv.ID)
	if err != nil {
		t.Fatalf("加载消息失败: %v", err)
	}
	if len(messages) != 2 {
		t.Fatalf("期望 2 条消息, got %d", len(messages))
	}
	if messages[0].Role != "user" {
		t.Fatalf("第一条消息 role 期望 user, got %s", messages[0].Role)
	}
	if messages[1].Content != "林雪推开雕花木门..." {
		t.Fatalf("第二条消息内容不匹配, got %s", messages[1].Content)
	}
}

func TestConversationService_SaveMessageWithSuggestions(t *testing.T) {
	db := newConversationTestDB(t)
	projectID := mustInsertTestProject(t, db)
	svc := NewConversationService(db)

	conv, _ := svc.Create(projectID)

	suggestions := []Suggestion{
		{ID: "sug-1", Type: "text_diff", Action: "replace_selection", Content: "新内容", Summary: "替换选中文本"},
	}

	msg := ConversationMessage{
		Role:        "assistant",
		Content:     "建议修改如下",
		Suggestions: suggestions,
		Timestamp:   time.Now(),
	}
	saved, err := svc.SaveMessage(conv.ID, msg)
	if err != nil {
		t.Fatalf("保存带建议的消息失败: %v", err)
	}
	if len(saved.Suggestions) != 1 {
		t.Fatalf("期望 1 条建议, got %d", len(saved.Suggestions))
	}
	if saved.Suggestions[0].ID != "sug-1" {
		t.Fatalf("建议 ID 不匹配, got %s", saved.Suggestions[0].ID)
	}

	// 加载后验证建议也被还原
	messages, _ := svc.LoadMessages(conv.ID)
	if len(messages[0].Suggestions) != 1 {
		t.Fatalf("加载后期望 1 条建议, got %d", len(messages[0].Suggestions))
	}
}

func TestConversationService_ListByProject(t *testing.T) {
	db := newConversationTestDB(t)
	projectID := mustInsertTestProject(t, db)
	svc := NewConversationService(db)

	conv1, _ := svc.Create(projectID)
	conv2, _ := svc.Create(projectID)

	conversations, err := svc.ListByProject(projectID)
	if err != nil {
		t.Fatalf("列出对话失败: %v", err)
	}
	if len(conversations) != 2 {
		t.Fatalf("期望 2 个对话, got %d", len(conversations))
	}

	ids := map[string]bool{conv1.ID: true, conv2.ID: true}
	for _, c := range conversations {
		if !ids[c.ID] {
			t.Fatalf("未知对话 ID: %s", c.ID)
		}
	}
}

func TestConversationService_GetWithMessages(t *testing.T) {
	db := newConversationTestDB(t)
	projectID := mustInsertTestProject(t, db)
	svc := NewConversationService(db)

	conv, _ := svc.Create(projectID)
	svc.SaveMessage(conv.ID, ConversationMessage{Role: "user", Content: "你好", Timestamp: time.Now()})
	svc.SaveMessage(conv.ID, ConversationMessage{Role: "assistant", Content: "你好！", Timestamp: time.Now()})

	loaded, err := svc.GetWithMessages(conv.ID)
	if err != nil {
		t.Fatalf("获取对话失败: %v", err)
	}
	if loaded.ID != conv.ID {
		t.Fatal("对话 ID 不匹配")
	}
	if len(loaded.Messages) != 2 {
		t.Fatalf("期望 2 条消息, got %d", len(loaded.Messages))
	}
}

func TestConversationService_Delete(t *testing.T) {
	db := newConversationTestDB(t)
	projectID := mustInsertTestProject(t, db)
	svc := NewConversationService(db)

	conv, _ := svc.Create(projectID)
	svc.SaveMessage(conv.ID, ConversationMessage{Role: "user", Content: "test", Timestamp: time.Now()})

	err := svc.Delete(conv.ID)
	if err != nil {
		t.Fatalf("删除对话失败: %v", err)
	}

	// 确认消息也被删除
	_, err = svc.GetWithMessages(conv.ID)
	if err == nil {
		t.Fatal("删除后应无法获取对话")
	}
}

func TestConversationService_UpdateTitle(t *testing.T) {
	db := newConversationTestDB(t)
	projectID := mustInsertTestProject(t, db)
	svc := NewConversationService(db)

	conv, _ := svc.Create(projectID)

	err := svc.UpdateTitle(conv.ID, "林雪角色设定讨论")
	if err != nil {
		t.Fatalf("更新标题失败: %v", err)
	}

	loaded, _ := svc.GetWithMessages(conv.ID)
	if loaded.Title != "林雪角色设定讨论" {
		t.Fatalf("标题不匹配, got %s", loaded.Title)
	}
}

func TestConversationService_ListByProject_OrdersByUpdated(t *testing.T) {
	db := newConversationTestDB(t)
	projectID := mustInsertTestProject(t, db)
	svc := NewConversationService(db)

	conv1, _ := svc.Create(projectID)
	svc.Create(projectID)

	// conv1 有消息，updated_at 会更新
	svc.SaveMessage(conv1.ID, ConversationMessage{Role: "user", Content: "test", Timestamp: time.Now()})

	conversations, _ := svc.ListByProject(projectID)
	if len(conversations) != 2 {
		t.Fatalf("期望 2 个对话, got %d", len(conversations))
	}
	// 最近更新的排在前面
	if conversations[0].ID != conv1.ID {
		t.Fatal("最近更新的对话应排在前面")
	}
}
