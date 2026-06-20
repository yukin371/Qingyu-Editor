package agent

import (
	"context"
	"testing"

	"Qingyu-Editor/ai"
)

// TestProcessIntentStream_CacheHitsOnRepeatedToolCall 验证当 cache 非空时，
// 同一会话内对同一工具同一参数的重复调用命中缓存，底层 tool.Execute 只执行一次。
func TestProcessIntentStream_CacheHitsOnRepeatedToolCall(t *testing.T) {
	callCount := 0
	tool := &fakeTool{
		name:        "list_characters",
		description: "列出角色",
		parameters:  map[string]any{"type": "object"},
		executeFunc: func(ctx context.Context, params map[string]any) (string, error) {
			callCount++
			return `[{"name":"林雪"}]`, nil
		},
	}
	router := NewToolRouter()
	router.Register(tool)

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
			{Content: "done"},
		},
	}
	cache := NewToolCache()
	svc := NewAgentService(provider, router)
	emitter := &RecordingEmitter{}

	if err := svc.ProcessIntentStream(context.Background(), "proj", "go", EditorContext{}, emitter, cache); err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if callCount != 1 {
		t.Fatalf("expected underlying tool executed once (second call hit cache), got %d", callCount)
	}
}

// TestProcessIntentStream_NilCacheBypassesWrap 验证当 cache 为 nil 时不走缓存路径，
// 两次同参工具调用都会真实执行。与上面的测试形成镜像，证明 wrap 仅在 cache 非空时生效。
func TestProcessIntentStream_NilCacheBypassesWrap(t *testing.T) {
	callCount := 0
	tool := &fakeTool{
		name:        "list_characters",
		description: "列出角色",
		parameters:  map[string]any{"type": "object"},
		executeFunc: func(ctx context.Context, params map[string]any) (string, error) {
			callCount++
			return `[]`, nil
		},
	}
	router := NewToolRouter()
	router.Register(tool)

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
			{Content: "done"},
		},
	}
	svc := NewAgentService(provider, router)
	emitter := &RecordingEmitter{}

	if err := svc.ProcessIntentStream(context.Background(), "proj", "go", EditorContext{}, emitter, nil); err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if callCount != 2 {
		t.Fatalf("expected underlying tool executed twice (no cache), got %d", callCount)
	}
}

// TestReviewChapterStream_CacheHitsOnRepeatedToolCall 验证审查路径的缓存接线同样生效。
// 复用同一 wrap 逻辑，单测覆盖即可证明三个 *Stream 方法的接线一致。
func TestReviewChapterStream_CacheHitsOnRepeatedToolCall(t *testing.T) {
	callCount := 0
	tool := &fakeTool{
		name:        "get_chapter_content",
		description: "获取章节内容",
		parameters:  map[string]any{"type": "object"},
		executeFunc: func(ctx context.Context, params map[string]any) (string, error) {
			callCount++
			return `{"content":"第1章内容"}`, nil
		},
	}
	router := NewToolRouter()
	router.Register(tool)

	makeToolCall := func(id string) ai.ToolCall {
		return ai.ToolCall{
			ID:   id,
			Type: "function",
			Function: struct {
				Name      string `json:"name"`
				Arguments string `json:"arguments"`
			}{Name: "get_chapter_content", Arguments: "{}"},
		}
	}

	provider := &fakeChatProvider{
		responses: []ai.ChatResponse{
			{ToolCalls: []ai.ToolCall{makeToolCall("c1")}},
			{ToolCalls: []ai.ToolCall{makeToolCall("c2")}},
			{Content: "审查报告"},
		},
	}
	cache := NewToolCache()
	svc := NewReviewService(provider, router)
	emitter := &RecordingEmitter{}

	if err := svc.ReviewChapterStream(context.Background(), "proj", "ch_1", "第1章", emitter, cache); err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if callCount != 1 {
		t.Fatalf("expected underlying tool executed once (cache hit on 2nd), got %d", callCount)
	}
}
