package agent

import (
	"database/sql"
	"encoding/json"
	"errors"
	"time"

	"github.com/google/uuid"
)

// Conversation 对话
type Conversation struct {
	ID        string    `json:"id"`
	ProjectID string    `json:"project_id"`
	Title     string    `json:"title"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	Messages  []ConversationMessage `json:"messages,omitempty"`
}

// ConversationMessage 对话消息
type ConversationMessage struct {
	ID          string       `json:"id"`
	Role        string       `json:"role"`
	Content     string       `json:"content"`
	Suggestions []Suggestion `json:"suggestions,omitempty"`
	Timestamp   time.Time    `json:"timestamp"`
}

// ConversationService 对话持久化服务
type ConversationService struct {
	db *sql.DB
}

// NewConversationService 创建对话服务
func NewConversationService(db *sql.DB) *ConversationService {
	return &ConversationService{db: db}
}

// Create 创建新对话
func (s *ConversationService) Create(projectID string) (*Conversation, error) {
	now := time.Now()
	id := uuid.New().String()
	_, err := s.db.Exec(
		"INSERT INTO agent_conversations (id, project_id, title, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
		id, projectID, "", now, now,
	)
	if err != nil {
		return nil, err
	}
	return &Conversation{
		ID:        id,
		ProjectID: projectID,
		CreatedAt: now,
		UpdatedAt: now,
	}, nil
}

// SaveMessage 保存消息到对话
func (s *ConversationService) SaveMessage(conversationID string, msg ConversationMessage) (*ConversationMessage, error) {
	id := uuid.New().String()
	suggestionsJSON, _ := json.Marshal(msg.Suggestions)

	_, err := s.db.Exec(
		"INSERT INTO agent_messages (id, conversation_id, role, content, suggestions_json, created_at) VALUES (?, ?, ?, ?, ?, ?)",
		id, conversationID, msg.Role, msg.Content, string(suggestionsJSON), msg.Timestamp,
	)
	if err != nil {
		return nil, err
	}

	// 更新对话的 updated_at
	_, err = s.db.Exec(
		"UPDATE agent_conversations SET updated_at = ? WHERE id = ?",
		msg.Timestamp, conversationID,
	)
	if err != nil {
		return nil, err
	}

	return &ConversationMessage{
		ID:          id,
		Role:        msg.Role,
		Content:     msg.Content,
		Suggestions: msg.Suggestions,
		Timestamp:   msg.Timestamp,
	}, nil
}

// LoadMessages 加载对话的所有消息
func (s *ConversationService) LoadMessages(conversationID string) ([]ConversationMessage, error) {
	rows, err := s.db.Query(
		"SELECT id, role, content, suggestions_json, created_at FROM agent_messages WHERE conversation_id = ? ORDER BY created_at ASC",
		conversationID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var messages []ConversationMessage
	for rows.Next() {
		var msg ConversationMessage
		var suggestionsJSON string
		if err := rows.Scan(&msg.ID, &msg.Role, &msg.Content, &suggestionsJSON, &msg.Timestamp); err != nil {
			return nil, err
		}
		if suggestionsJSON != "" && suggestionsJSON != "[]" {
			var suggestions []Suggestion
			if err := json.Unmarshal([]byte(suggestionsJSON), &suggestions); err == nil {
				msg.Suggestions = suggestions
			}
		}
		messages = append(messages, msg)
	}
	return messages, rows.Err()
}

// ListByProject 列出项目的所有对话（按更新时间倒序）
func (s *ConversationService) ListByProject(projectID string) ([]Conversation, error) {
	rows, err := s.db.Query(
		"SELECT id, project_id, title, created_at, updated_at FROM agent_conversations WHERE project_id = ? ORDER BY updated_at DESC",
		projectID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var conversations []Conversation
	for rows.Next() {
		var conv Conversation
		if err := rows.Scan(&conv.ID, &conv.ProjectID, &conv.Title, &conv.CreatedAt, &conv.UpdatedAt); err != nil {
			return nil, err
		}
		conversations = append(conversations, conv)
	}
	return conversations, rows.Err()
}

// GetWithMessages 获取对话及其所有消息
func (s *ConversationService) GetWithMessages(conversationID string) (*Conversation, error) {
	var conv Conversation
	err := s.db.QueryRow(
		"SELECT id, project_id, title, created_at, updated_at FROM agent_conversations WHERE id = ?",
		conversationID,
	).Scan(&conv.ID, &conv.ProjectID, &conv.Title, &conv.CreatedAt, &conv.UpdatedAt)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("对话不存在")
		}
		return nil, err
	}

	messages, err := s.LoadMessages(conversationID)
	if err != nil {
		return nil, err
	}
	conv.Messages = messages
	return &conv, nil
}

// Delete 删除对话及其所有消息
func (s *ConversationService) Delete(conversationID string) error {
	_, err := s.db.Exec("DELETE FROM agent_messages WHERE conversation_id = ?", conversationID)
	if err != nil {
		return err
	}
	_, err = s.db.Exec("DELETE FROM agent_conversations WHERE id = ?", conversationID)
	return err
}

// UpdateTitle 更新对话标题
func (s *ConversationService) UpdateTitle(conversationID string, title string) error {
	_, err := s.db.Exec(
		"UPDATE agent_conversations SET title = ?, updated_at = ? WHERE id = ?",
		title, time.Now(), conversationID,
	)
	return err
}
