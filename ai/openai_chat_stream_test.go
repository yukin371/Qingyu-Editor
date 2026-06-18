package ai

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"
)

// TestOpenAIChatProvider_ChatStream_TextDeltas 纯文本流：3 个 content chunk + [DONE]
func TestOpenAIChatProvider_ChatStream_TextDeltas(t *testing.T) {
	var bodyReceived map[string]any
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		rb, _ := io.ReadAll(r.Body)
		_ = json.Unmarshal(rb, &bodyReceived)

		w.Header().Set("Content-Type", "text/event-stream")
		w.WriteHeader(http.StatusOK)
		flusher, _ := w.(http.Flusher)

		for _, content := range []string{"你好", "，", "世界"} {
			chunk := fmt.Sprintf(`{"choices":[{"delta":{"content":%s},"finish_reason":null}]}`, mustJSONString(content))
			fmt.Fprintf(w, "data: %s\n\n", chunk)
			if flusher != nil {
				flusher.Flush()
			}
		}
		fmt.Fprint(w, "data: [DONE]\n\n")
		if flusher != nil {
			flusher.Flush()
		}
	}))
	defer srv.Close()

	provider := NewOpenAIChatProvider(Config{
		BaseURL: srv.URL,
		APIKey:  "test-key",
		Model:   "gpt-4",
	})

	var deltas []StreamDelta
	resp, err := provider.ChatStream(context.Background(), []ChatMessage{
		{"role": "user", "content": "hi"},
	}, nil, func(d StreamDelta) {
		deltas = append(deltas, d)
	})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	// stream=true 必须被发出
	if v, ok := bodyReceived["stream"].(bool); !ok || !v {
		t.Fatalf("expected stream=true in request body, got %v", bodyReceived["stream"])
	}
	// 应当有 3 个 content delta，且没有 tool_calls delta
	if len(deltas) != 3 {
		t.Fatalf("expected 3 deltas, got %d (%+v)", len(deltas), deltas)
	}
	for i, d := range deltas {
		if len(d.ToolCalls) != 0 {
			t.Fatalf("delta %d should not carry tool calls", i)
		}
	}
	want := []string{"你好", "，", "世界"}
	for i, d := range deltas {
		if d.Content != want[i] {
			t.Fatalf("delta[%d]: expected %q, got %q", i, want[i], d.Content)
		}
	}
	// 返回值 Content 应为累计文本
	if resp.Content != "你好，世界" {
		t.Fatalf("expected accumulated content %q, got %q", "你好，世界", resp.Content)
	}
	if resp.HasToolCalls() {
		t.Fatalf("expected no tool calls in response, got %+v", resp.ToolCalls)
	}
}

// TestOpenAIChatProvider_ChatStream_ToolCallFragmented 工具调用流：
// arguments 在多个 chunk 中分段返回，应当被正确拼接
func TestOpenAIChatProvider_ChatStream_ToolCallFragmented(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/event-stream")
		w.WriteHeader(http.StatusOK)
		flusher, _ := w.(http.Flusher)

		// 第 1 个 chunk：tool_call 头（id / type / function.name），无 arguments
		fmt.Fprint(w, `data: {"choices":[{"delta":{"tool_calls":[{"index":0,"id":"call_001","type":"function","function":{"name":"list_characters","arguments":""}}]},"finish_reason":null}]}`+"\n\n")
		if flusher != nil {
			flusher.Flush()
		}
		// 第 2 个 chunk：arguments 第一段
		fmt.Fprint(w, `data: {"choices":[{"delta":{"tool_calls":[{"index":0,"function":{"arguments":"{\"proj"}}]},"finish_reason":null}]}`+"\n\n")
		if flusher != nil {
			flusher.Flush()
		}
		// 第 3 个 chunk：arguments 第二段
		fmt.Fprint(w, `data: {"choices":[{"delta":{"tool_calls":[{"index":0,"function":{"arguments":"ect\":\"p1\"}"}}]},"finish_reason":null}]}`+"\n\n")
		if flusher != nil {
			flusher.Flush()
		}
		// 第 4 个 chunk：finish_reason=tool_calls
		fmt.Fprint(w, `data: {"choices":[{"delta":{},"finish_reason":"tool_calls"}]}`+"\n\n")
		if flusher != nil {
			flusher.Flush()
		}
		fmt.Fprint(w, "data: [DONE]\n\n")
		if flusher != nil {
			flusher.Flush()
		}
	}))
	defer srv.Close()

	provider := NewOpenAIChatProvider(Config{
		BaseURL: srv.URL,
		APIKey:  "test-key",
		Model:   "gpt-4",
	})

	var deltas []StreamDelta
	resp, err := provider.ChatStream(context.Background(), []ChatMessage{
		{"role": "user", "content": "列出角色"},
	}, []map[string]any{
		{"type": "function", "function": map[string]any{"name": "list_characters"}},
	}, func(d StreamDelta) {
		deltas = append(deltas, d)
	})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	// 没有任何 content delta，应当只有最后 1 个 ToolCalls delta
	var toolCallDeltas []StreamDelta
	for _, d := range deltas {
		if d.Content != "" {
			t.Fatalf("did not expect content delta, got %q", d.Content)
		}
		if len(d.ToolCalls) > 0 {
			toolCallDeltas = append(toolCallDeltas, d)
		}
	}
	if len(toolCallDeltas) != 1 {
		t.Fatalf("expected exactly 1 tool_calls delta, got %d", len(toolCallDeltas))
	}
	if len(toolCallDeltas[0].ToolCalls) != 1 {
		t.Fatalf("expected 1 tool call in final delta, got %d", len(toolCallDeltas[0].ToolCalls))
	}

	// 验证 arguments 拼接正确
	tc := toolCallDeltas[0].ToolCalls[0]
	if tc.ID != "call_001" {
		t.Fatalf("expected id=call_001, got %q", tc.ID)
	}
	if tc.Type != "function" {
		t.Fatalf("expected type=function, got %q", tc.Type)
	}
	if tc.Function.Name != "list_characters" {
		t.Fatalf("expected name=list_characters, got %q", tc.Function.Name)
	}
	wantArgs := `{"project":"p1"}`
	if tc.Function.Arguments != wantArgs {
		t.Fatalf("expected concatenated arguments %q, got %q", wantArgs, tc.Function.Arguments)
	}

	// 返回值应同样带上累积 tool calls
	if !resp.HasToolCalls() {
		t.Fatal("expected response to carry tool calls")
	}
	if len(resp.ToolCalls) != 1 {
		t.Fatalf("expected 1 tool call in response, got %d", len(resp.ToolCalls))
	}
	if resp.ToolCalls[0].Function.Arguments != wantArgs {
		t.Fatalf("response tool call arguments mismatch: got %q", resp.ToolCalls[0].Function.Arguments)
	}
}

// TestOpenAIChatProvider_ChatStream_HTTPError 非 200 响应：应当返回 error 且 callback 不被调用
func TestOpenAIChatProvider_ChatStream_HTTPError(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusInternalServerError)
	}))
	defer srv.Close()

	provider := NewOpenAIChatProvider(Config{
		BaseURL: srv.URL,
		APIKey:  "test-key",
		Model:   "gpt-4",
	})

	called := false
	resp, err := provider.ChatStream(context.Background(), []ChatMessage{
		{"role": "user", "content": "hi"},
	}, nil, func(d StreamDelta) {
		called = true
	})
	if err == nil {
		t.Fatal("expected error for HTTP 500, got nil")
	}
	if called {
		t.Fatal("callback must not be invoked on error path")
	}
	if resp != nil {
		t.Fatalf("expected nil response on error, got %+v", resp)
	}
}

// mustJSONString 将字符串编码为 JSON 字符串字面量（带引号）
func mustJSONString(s string) string {
	b, err := json.Marshal(s)
	if err != nil {
		panic(err)
	}
	return string(b)
}
