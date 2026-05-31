package ai

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

// ToolCall AI 工具调用
type ToolCall struct {
	ID       string `json:"id"`
	Type     string `json:"type"`
	Function struct {
		Name      string `json:"name"`
		Arguments string `json:"arguments"`
	} `json:"function"`
}

// ChatMessage 聊天消息（通用格式）
type ChatMessage map[string]any

// ChatResponse 聊天响应
type ChatResponse struct {
	Content   string     `json:"content"`
	ToolCalls []ToolCall `json:"tool_calls"`
}

// HasToolCalls 是否包含工具调用
func (r *ChatResponse) HasToolCalls() bool {
	return len(r.ToolCalls) > 0
}

// ChatProvider 支持 tool calling 的 AI 接口
type ChatProvider interface {
	Chat(ctx context.Context, messages []ChatMessage, tools []map[string]any) (*ChatResponse, error)
}

// OpenAIChatProvider 支持 function calling 的 OpenAI 兼容实现
type OpenAIChatProvider struct {
	cfg Config
}

// NewOpenAIChatProvider 创建 ChatProvider
func NewOpenAIChatProvider(cfg Config) *OpenAIChatProvider {
	return &OpenAIChatProvider{cfg: cfg}
}

// Chat 调用 Chat Completion API（支持 tools）
func (p *OpenAIChatProvider) Chat(ctx context.Context, messages []ChatMessage, tools []map[string]any) (*ChatResponse, error) {
	body := map[string]any{
		"model":    p.cfg.Model,
		"messages": messages,
	}
	if len(tools) > 0 {
		body["tools"] = tools
	}

	bodyBytes, err := json.Marshal(body)
	if err != nil {
		return nil, fmt.Errorf("序列化请求失败: %w", err)
	}

	baseURL := p.cfg.BaseURL
	if baseURL == "" {
		baseURL = "https://api.openai.com/v1"
	}

	req, err := http.NewRequestWithContext(ctx, "POST", baseURL+"/chat/completions", bytes.NewReader(bodyBytes))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	if p.cfg.APIKey != "" {
		req.Header.Set("Authorization", "Bearer "+p.cfg.APIKey)
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("请求失败: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("读取响应失败: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("AI API 返回错误 (%d): %s", resp.StatusCode, string(respBody))
	}

	var result struct {
		Choices []struct {
			Message struct {
				Content   string     `json:"content"`
				ToolCalls []ToolCall `json:"tool_calls"`
			} `json:"message"`
		} `json:"choices"`
	}
	if err := json.Unmarshal(respBody, &result); err != nil {
		return nil, fmt.Errorf("解析响应失败: %w", err)
	}
	if len(result.Choices) == 0 {
		return nil, fmt.Errorf("AI API 未返回内容")
	}

	return &ChatResponse{
		Content:   result.Choices[0].Message.Content,
		ToolCalls: result.Choices[0].Message.ToolCalls,
	}, nil
}
