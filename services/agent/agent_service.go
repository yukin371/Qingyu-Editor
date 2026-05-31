package agent

import (
	"context"
	"encoding/json"
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
	tools := s.router.ToolDefinitions()

	for range maxToolCallRounds {
		resp, err := s.provider.Chat(ctx, messages, tools)
		if err != nil {
			return nil, fmt.Errorf("AI 调用失败: %w", err)
		}

		if !resp.HasToolCalls() {
			return &AgentResult{Content: resp.Content}, nil
		}

		// 处理工具调用
		assistantMsg := ai.ChatMessage{
			"role":    "assistant",
			"content": resp.Content,
		}
		// 将 tool_calls 转为 map 格式
		tcMaps := make([]map[string]any, len(resp.ToolCalls))
		for i, tc := range resp.ToolCalls {
			tcMaps[i] = map[string]any{
				"id":   tc.ID,
				"type": "function",
				"function": map[string]any{
					"name":      tc.Function.Name,
					"arguments": tc.Function.Arguments,
				},
			}
		}
		assistantMsg["tool_calls"] = tcMaps
		messages = append(messages, assistantMsg)

		for _, tc := range resp.ToolCalls {
			var params map[string]any
			if err := json.Unmarshal([]byte(tc.Function.Arguments), &params); err != nil {
				params = make(map[string]any)
			}

			result, err := s.router.Dispatch(ctx, tc.Function.Name, params)
			if err != nil {
				result = fmt.Sprintf("工具执行失败: %s", err)
			}

			messages = append(messages, ai.ChatMessage{
				"role":          "tool",
				"content":      result,
				"tool_call_id": tc.ID,
				"name":         tc.Function.Name,
			})
		}
	}

	return nil, fmt.Errorf("超过最大工具调用轮数 (%d)", maxToolCallRounds)
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
