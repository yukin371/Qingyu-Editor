package agent

import (
	"context"
	"encoding/json"
	"testing"

	"Qingyu-Editor/ai"
)

// --- fake ChatProvider 模拟 AI 行为 ---

type fakeChatProvider struct {
	responses []ai.ChatResponse
	callIndex int
	messages  [][]ai.ChatMessage
}

func (f *fakeChatProvider) Chat(ctx context.Context, messages []ai.ChatMessage, tools []map[string]any) (*ai.ChatResponse, error) {
	f.messages = append(f.messages, messages)
	if f.callIndex >= len(f.responses) {
		return &ai.ChatResponse{Content: "默认回复"}, nil
	}
	resp := f.responses[f.callIndex]
	f.callIndex++
	return &resp, nil
}

// --- AgentService 测试 ---

func TestAgentService_SimpleResponse(t *testing.T) {
	provider := &fakeChatProvider{
		responses: []ai.ChatResponse{
			{Content: "这是一个测试回复"},
		},
	}

	svc := NewAgentService(provider, NewToolRouter())
	result, err := svc.ProcessIntent(context.Background(), "test-project", "你好", EditorContext{})

	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if result.Content != "这是一个测试回复" {
		t.Fatalf("expected '这是一个测试回复', got %q", result.Content)
	}
	if result.HasToolCalls() {
		t.Fatal("expected no tool calls")
	}
}

func TestAgentService_ToolCallAndResponse(t *testing.T) {
	router := NewToolRouter()
	router.Register(&fakeTool{
		name:        "list_characters",
		description: "列出角色",
		parameters:  map[string]any{"type": "object"},
		returnVal:   `[{"name":"林雪","role":"主角"}]`,
	})

	provider := &fakeChatProvider{
		responses: []ai.ChatResponse{
			{
				ToolCalls: []ai.ToolCall{
					{
						ID:   "call_1",
						Type: "function",
						Function: struct {
							Name      string `json:"name"`
							Arguments string `json:"arguments"`
						}{
							Name:      "list_characters",
							Arguments: mustMarshal(map[string]any{"project_id": "test-project"}),
						},
					},
				},
			},
			{
				Content: "项目中有1个角色：林雪（主角）",
			},
		},
	}

	svc := NewAgentService(provider, router)
	result, err := svc.ProcessIntent(context.Background(), "test-project", "有哪些角色", EditorContext{})

	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if result.Content != "项目中有1个角色：林雪（主角）" {
		t.Fatalf("expected character list, got %q", result.Content)
	}

	// 验证第二次调用包含了工具结果
	if len(provider.messages) != 2 {
		t.Fatalf("expected 2 chat calls, got %d", len(provider.messages))
	}
	secondCallMessages := provider.messages[1]
	hasToolResult := false
	for _, msg := range secondCallMessages {
		if msg["role"] == "tool" {
			hasToolResult = true
			if msg["content"] != `[{"name":"林雪","role":"主角"}]` {
				t.Fatalf("expected tool result content, got %q", msg["content"])
			}
		}
	}
	if !hasToolResult {
		t.Fatal("expected tool result message in second call")
	}
}

func TestAgentService_EditorContextInjected(t *testing.T) {
	provider := &fakeChatProvider{
		responses: []ai.ChatResponse{
			{Content: "ok"},
		},
	}

	svc := NewAgentService(provider, NewToolRouter())
	_, err := svc.ProcessIntent(context.Background(), "test-project", "续写", EditorContext{
		CurrentChapterID: "ch_005",
		CursorPosition:   2340,
		SelectedText:     "他推开门",
	})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	// 验证system prompt包含了editor context
	firstCallMessages := provider.messages[0]
	hasSystemWithCtx := false
	for _, msg := range firstCallMessages {
		if msg["role"] == "system" {
			content, _ := msg["content"].(string)
			if containsStr(content, "ch_005") && containsStr(content, "他推开门") {
				hasSystemWithCtx = true
			}
		}
	}
	if !hasSystemWithCtx {
		t.Fatal("expected system prompt to contain editor context")
	}
}

func TestAgentService_MaxToolCallRounds(t *testing.T) {
	router := NewToolRouter()

	makeToolCall := func(id string) ai.ToolCall {
		return ai.ToolCall{
			ID:   id,
			Type: "function",
			Function: struct {
				Name      string `json:"name"`
				Arguments string `json:"arguments"`
			}{Name: "list_characters", Arguments: "{}"},
		}
	}

	provider := &fakeChatProvider{
		responses: []ai.ChatResponse{
			{ToolCalls: []ai.ToolCall{makeToolCall("c1")}},
			{ToolCalls: []ai.ToolCall{makeToolCall("c2")}},
			{ToolCalls: []ai.ToolCall{makeToolCall("c3")}},
			{ToolCalls: []ai.ToolCall{makeToolCall("c4")}},
			{ToolCalls: []ai.ToolCall{makeToolCall("c5")}},
			{ToolCalls: []ai.ToolCall{makeToolCall("c6")}},
			{ToolCalls: []ai.ToolCall{makeToolCall("c7")}},
		},
	}

	router.Register(&fakeTool{
		name: "list_characters", description: "列出角色",
		parameters: map[string]any{"type": "object"}, returnVal: "[]",
	})

	svc := NewAgentService(provider, router)
	_, err := svc.ProcessIntent(context.Background(), "test-project", "测试", EditorContext{})

	if err == nil {
		t.Fatal("expected error for exceeding max tool call rounds")
	}
}

func TestAgentService_UnknownToolCall(t *testing.T) {
	provider := &fakeChatProvider{
		responses: []ai.ChatResponse{
			{
				ToolCalls: []ai.ToolCall{
					{
						ID:   "c1",
						Type: "function",
						Function: struct {
							Name      string `json:"name"`
							Arguments string `json:"arguments"`
						}{Name: "nonexistent_tool", Arguments: "{}"},
					},
				},
			},
			{Content: "抱歉，我无法执行该操作"},
		},
	}

	svc := NewAgentService(provider, NewToolRouter())
	result, err := svc.ProcessIntent(context.Background(), "test-project", "测试", EditorContext{})

	if err != nil {
		t.Fatalf("expected no error (tool error should be reported to AI), got %v", err)
	}
	if result.Content != "抱歉，我无法执行该操作" {
		t.Fatalf("expected graceful fallback, got %q", result.Content)
	}
}

// --- helpers ---

func mustMarshal(v any) string {
	b, err := json.Marshal(v)
	if err != nil {
		panic(err)
	}
	return string(b)
}

func containsStr(s, substr string) bool {
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return true
		}
	}
	return false
}
