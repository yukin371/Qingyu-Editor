package agent

import (
	"context"
	"fmt"
	"strings"

	"Qingyu-Editor/ai"
)

const maxToolCallRounds = 6

// AgentService 智能体服务
type AgentService struct {
	provider ai.ChatProvider
	router   *ToolRouter
}

// NewAgentService 创建智能体服务
func NewAgentService(provider ai.ChatProvider, router *ToolRouter) *AgentService {
	return &AgentService{
		provider: provider,
		router:   router,
	}
}

// ProcessIntent 处理用户意图
func (s *AgentService) ProcessIntent(ctx context.Context, projectID string, intent string, editorCtx EditorContext) (*AgentResult, error) {
	messages := s.buildMessages(projectID, intent, editorCtx)

	content, err := runStreamingLoop(ctx, s.provider, s.router, messages)
	if err != nil {
		return nil, err
	}
	return &AgentResult{Content: content}, nil
}

// buildMessages 构建初始消息列表
func (s *AgentService) buildMessages(projectID string, intent string, editorCtx EditorContext) []ai.ChatMessage {
	var systemParts []string

	systemParts = append(systemParts, "你是一个小说创作助手。用户是作者，你辅助创作。")
	systemParts = append(systemParts, fmt.Sprintf("当前项目ID: %s", projectID))

	if editorCtx.CurrentChapterID != "" {
		systemParts = append(systemParts, fmt.Sprintf("当前章节: %s", editorCtx.CurrentChapterID))
	}
	if editorCtx.SelectedText != "" {
		systemParts = append(systemParts, fmt.Sprintf("选中文本: %s", editorCtx.SelectedText))
	}
	if editorCtx.CursorPosition > 0 {
		systemParts = append(systemParts, fmt.Sprintf("光标位置: %d", editorCtx.CursorPosition))
	}
	if len(editorCtx.NearbyCharacters) > 0 {
		systemParts = append(systemParts, fmt.Sprintf("相关角色: %s", strings.Join(editorCtx.NearbyCharacters, ", ")))
	}

	return []ai.ChatMessage{
		{"role": "system", "content": strings.Join(systemParts, "\n")},
		{"role": "user", "content": intent},
	}
}
