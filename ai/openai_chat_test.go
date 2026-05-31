package ai

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestOpenAIChatProvider_SimpleResponse(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var body map[string]json.RawMessage
		json.NewDecoder(r.Body).Decode(&body)

		if string(body["model"]) != `"test-model"` {
			t.Errorf("expected model=test-model, got %s", body["model"])
		}

		resp := map[string]any{
			"choices": []map[string]any{
				{
					"message": map[string]any{
						"role":    "assistant",
						"content": "这是一个测试回复",
					},
				},
			},
		}
		json.NewEncoder(w).Encode(resp)
	}))
	defer server.Close()

	provider := NewOpenAIChatProvider(Config{
		BaseURL: server.URL,
		Model:   "test-model",
	})

	resp, err := provider.Chat(context.Background(), nil, nil)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if resp.Content != "这是一个测试回复" {
		t.Fatalf("expected test response, got %q", resp.Content)
	}
	if resp.HasToolCalls() {
		t.Fatal("expected no tool calls")
	}
}

func TestOpenAIChatProvider_ToolCallResponse(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		resp := map[string]any{
			"choices": []map[string]any{
				{
					"message": map[string]any{
						"role": "assistant",
						"tool_calls": []map[string]any{
							{
								"id":   "call_001",
								"type": "function",
								"function": map[string]any{
									"name":      "list_characters",
									"arguments": `{"project_id":"p1"}`,
								},
							},
						},
					},
				},
			},
		}
		json.NewEncoder(w).Encode(resp)
	}))
	defer server.Close()

	provider := NewOpenAIChatProvider(Config{
		BaseURL: server.URL,
		Model:   "test-model",
	})

	resp, err := provider.Chat(context.Background(), nil, nil)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if !resp.HasToolCalls() {
		t.Fatal("expected tool calls")
	}
	if len(resp.ToolCalls) != 1 {
		t.Fatalf("expected 1 tool call, got %d", len(resp.ToolCalls))
	}
	if resp.ToolCalls[0].Function.Name != "list_characters" {
		t.Fatalf("expected list_characters, got %q", resp.ToolCalls[0].Function.Name)
	}
	if resp.ToolCalls[0].Function.Arguments != `{"project_id":"p1"}` {
		t.Fatalf("unexpected arguments: %q", resp.ToolCalls[0].Function.Arguments)
	}
}

func TestOpenAIChatProvider_SendsMessagesAndTools(t *testing.T) {
	var receivedBody map[string]any

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		json.NewDecoder(r.Body).Decode(&receivedBody)

		resp := map[string]any{
			"choices": []map[string]any{
				{"message": map[string]any{"role": "assistant", "content": "ok"}},
			},
		}
		json.NewEncoder(w).Encode(resp)
	}))
	defer server.Close()

	provider := NewOpenAIChatProvider(Config{
		BaseURL: server.URL,
		Model:   "test-model",
		APIKey:  "test-key",
	})

	messages := []ChatMessage{
		{"role": "system", "content": "你是一个助手"},
		{"role": "user", "content": "你好"},
		{"role": "assistant", "content": "你好啊", "tool_calls": []map[string]any{
			{"id": "c1", "type": "function", "function": map[string]any{"name": "test", "arguments": "{}"}},
		}},
		{"role": "tool", "content": "result", "tool_call_id": "c1"},
	}

	_, err := provider.Chat(context.Background(), messages, []map[string]any{
		{"type": "function", "function": map[string]any{"name": "test"}},
	})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	// 验证 messages 被正确发送
	msgs, ok := receivedBody["messages"].([]any)
	if !ok || len(msgs) != 4 {
		t.Fatalf("expected 4 messages, got %v", receivedBody["messages"])
	}

	// 验证 tools 被发送
	tools, ok := receivedBody["tools"].([]any)
	if !ok || len(tools) != 1 {
		t.Fatalf("expected 1 tool, got %v", receivedBody["tools"])
	}
}

func TestOpenAIChatProvider_ApiError(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusTooManyRequests)
		w.Write([]byte(`{"error":"rate limited"}`))
	}))
	defer server.Close()

	provider := NewOpenAIChatProvider(Config{
		BaseURL: server.URL,
		Model:   "test-model",
	})

	_, err := provider.Chat(context.Background(), nil, nil)
	if err == nil {
		t.Fatal("expected error for API error response")
	}
}
