package ai

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"sort"
	"strings"
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

// StreamDelta 流式增量：本 chunk 的增量文本或最终 tool_calls
type StreamDelta struct {
	Content   string     // 本 chunk 增量文本（非累计）
	ToolCalls []ToolCall // finish_reason==tool_calls 时填充，一次性发出
}

// StreamCallback 流式回调，由 ChatStream 在收到 delta 时调用
type StreamCallback func(delta StreamDelta)

// ChatProvider 支持 tool calling 的 AI 接口
type ChatProvider interface {
	Chat(ctx context.Context, messages []ChatMessage, tools []map[string]any) (*ChatResponse, error)
	ChatStream(ctx context.Context, messages []ChatMessage, tools []map[string]any, onDelta StreamCallback) (*ChatResponse, error)
}

// OpenAIChatProvider 支持 function calling 的 OpenAI 兼容实现
type OpenAIChatProvider struct {
	cfg Config
}

// NewOpenAIChatProvider 创建 ChatProvider
func NewOpenAIChatProvider(cfg Config) *OpenAIChatProvider {
	return &OpenAIChatProvider{cfg: cfg}
}

// buildChatRequestBody 构造 Chat Completion 请求体（Chat / ChatStream 共用）
func (p *OpenAIChatProvider) buildChatRequestBody(messages []ChatMessage, tools []map[string]any) map[string]any {
	body := map[string]any{
		"model":    p.cfg.Model,
		"messages": messages,
	}
	if len(tools) > 0 {
		body["tools"] = tools
	}
	return body
}

// Chat 调用 Chat Completion API（支持 tools）
func (p *OpenAIChatProvider) Chat(ctx context.Context, messages []ChatMessage, tools []map[string]any) (*ChatResponse, error) {
	bodyBytes, err := json.Marshal(p.buildChatRequestBody(messages, tools))
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

// ChatStream 流式版本：以 Server-Sent Events 方式读取响应，逐 chunk 调用 onDelta。
// 纯文本会以多个 StreamDelta{Content:...} 回调发出；tool_calls 会跨 chunk 按 index 累加，
// 在 finish_reason=="tool_calls" 时一次性发出最终 ToolCalls，并随返回值带出累计结果。
func (p *OpenAIChatProvider) ChatStream(ctx context.Context, messages []ChatMessage, tools []map[string]any, onDelta StreamCallback) (*ChatResponse, error) {
	body := p.buildChatRequestBody(messages, tools)
	body["stream"] = true

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
	req.Header.Set("Accept", "text/event-stream")
	if p.cfg.APIKey != "" {
		req.Header.Set("Authorization", "Bearer "+p.cfg.APIKey)
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("请求失败: %w", err)
	}
	defer resp.Body.Close()

	// 状态检查必须在读取 body 之前
	if resp.StatusCode != http.StatusOK {
		respBody, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("AI API 返回错误 (%d): %s", resp.StatusCode, string(respBody))
	}

	var contentBuilder strings.Builder
	toolCallMap := map[int]*ToolCall{} // key = delta.index

	reader := bufio.NewReader(resp.Body)
	for {
		line, err := reader.ReadBytes('\n')
		if err != nil {
			if err == io.EOF {
				break
			}
			return nil, fmt.Errorf("读取流失败: %w", err)
		}
		line = bytes.TrimSpace(line)
		if len(line) == 0 {
			continue // 空行分隔符
		}
		if !bytes.HasPrefix(line, []byte("data: ")) {
			continue // 非 data 行（event / 注释等）跳过
		}
		data := bytes.TrimPrefix(line, []byte("data: "))
		if bytes.Equal(data, []byte("[DONE]")) {
			break
		}

		var chunk struct {
			Choices []struct {
				Delta struct {
					Content   string `json:"content"`
					ToolCalls []struct {
						Index    int    `json:"index"`
						ID       string `json:"id"`
						Type     string `json:"type"`
						Function struct {
							Name      string `json:"name"`
							Arguments string `json:"arguments"`
						} `json:"function"`
					} `json:"tool_calls"`
				} `json:"delta"`
				FinishReason string `json:"finish_reason"`
			} `json:"choices"`
		}
		if err := json.Unmarshal(data, &chunk); err != nil {
			continue // 跳过畸形 chunk（含 keep-alive 等）
		}
		if len(chunk.Choices) == 0 {
			continue
		}

		delta := chunk.Choices[0].Delta
		finishReason := chunk.Choices[0].FinishReason

		if delta.Content != "" {
			contentBuilder.WriteString(delta.Content)
			if onDelta != nil {
				onDelta(StreamDelta{Content: delta.Content})
			}
		}

		for _, tc := range delta.ToolCalls {
			existing, ok := toolCallMap[tc.Index]
			if !ok {
				existing = &ToolCall{}
				toolCallMap[tc.Index] = existing
			}
			if tc.ID != "" {
				existing.ID = tc.ID
			}
			if tc.Type != "" {
				existing.Type = tc.Type
			}
			if tc.Function.Name != "" {
				existing.Function.Name = tc.Function.Name
			}
			// arguments 是跨 chunk 追加的，必须用 +=
			existing.Function.Arguments += tc.Function.Arguments
		}

		if finishReason == "tool_calls" {
			toolCalls := flattenToolCallMap(toolCallMap)
			if len(toolCalls) > 0 && onDelta != nil {
				onDelta(StreamDelta{ToolCalls: toolCalls})
			}
		}
	}

	return &ChatResponse{
		Content:   contentBuilder.String(),
		ToolCalls: flattenToolCallMap(toolCallMap),
	}, nil
}

// flattenToolCallMap 按 index 升序返回 toolCallMap 中的 ToolCall 列表
func flattenToolCallMap(m map[int]*ToolCall) []ToolCall {
	if len(m) == 0 {
		return nil
	}
	indices := make([]int, 0, len(m))
	for i := range m {
		indices = append(indices, i)
	}
	sort.Ints(indices)
	out := make([]ToolCall, 0, len(indices))
	for _, i := range indices {
		out = append(out, *m[i])
	}
	return out
}
