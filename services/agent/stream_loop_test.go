package agent

import (
	"context"
	"errors"
	"testing"

	"Qingyu-Editor/ai"
)

// TestRunStreamingLoop_EmitsTokenEvents 验证 ChatStream 的内容增量被转发为 token 事件。
func TestRunStreamingLoop_EmitsTokenEvents(t *testing.T) {
	provider := &fakeChatProvider{
		responses: []ai.ChatResponse{
			{Content: "hello"},
		},
	}
	router := NewToolRouter()
	emitter := &RecordingEmitter{}

	content, err := runStreamingLoop(context.Background(), provider, router, []ai.ChatMessage{
		{"role": "user", "content": "hi"},
	}, emitter)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if content != "hello" {
		t.Fatalf("expected content 'hello', got %q", content)
	}

	tokenCount := 0
	for _, ev := range emitter.Events {
		if ev.Type == "token" {
			tokenCount++
			if ev.Delta != "hello" {
				t.Errorf("token delta = %q, want 'hello'", ev.Delta)
			}
		}
	}
	if tokenCount != 1 {
		t.Fatalf("expected exactly 1 token event (fake emits full content in one delta), got %d", tokenCount)
	}
}

// TestRunStreamingLoop_EmitsToolEvents 验证每个工具调用先 emit tool_start，dispatch 后 emit tool_end。
func TestRunStreamingLoop_EmitsToolEvents(t *testing.T) {
	router := NewToolRouter()
	router.Register(&fakeTool{
		name:        "fake_tool",
		description: "fake",
		parameters:  map[string]any{"type": "object"},
		returnVal:   `{"ok":true}`,
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
						}{Name: "fake_tool", Arguments: "{}"},
					},
				},
			},
			{Content: "done"},
		},
	}
	emitter := &RecordingEmitter{}

	_, err := runStreamingLoop(context.Background(), provider, router, []ai.ChatMessage{
		{"role": "user", "content": "go"},
	}, emitter)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	// 查找第一个 tool_start 与紧随其后的 tool_end，断言名称与顺序
	var startIdx, endIdx = -1, -1
	for i, ev := range emitter.Events {
		if ev.Type == "tool_start" && startIdx == -1 {
			startIdx = i
		}
		if ev.Type == "tool_end" && endIdx == -1 {
			endIdx = i
		}
	}
	if startIdx == -1 {
		t.Fatal("expected at least one tool_start event")
	}
	if endIdx == -1 {
		t.Fatal("expected at least one tool_end event")
	}
	if endIdx <= startIdx {
		t.Fatalf("tool_end (idx %d) must come after tool_start (idx %d)", endIdx, startIdx)
	}
	if emitter.Events[startIdx].ToolName != "fake_tool" {
		t.Errorf("tool_start.Name = %q, want fake_tool", emitter.Events[startIdx].ToolName)
	}
	if emitter.Events[endIdx].ToolName != "fake_tool" {
		t.Errorf("tool_end.Name = %q, want fake_tool", emitter.Events[endIdx].ToolName)
	}
	if emitter.Events[endIdx].Err != nil {
		t.Errorf("tool_end.Err = %v, want nil (successful dispatch)", emitter.Events[endIdx].Err)
	}
}

// TestRunStreamingLoop_EmitsErrorOnExhaustion 验证超过最大轮数时 emit Error，且不 emit Done。
// 注：runStreamingLoop 本身不 emit Done（由调用者负责），所以这里只断言 error 事件恰好一次。
func TestRunStreamingLoop_EmitsErrorOnExhaustion(t *testing.T) {
	router := NewToolRouter()
	router.Register(&fakeTool{
		name: "list_characters", description: "列出角色",
		parameters: map[string]any{"type": "object"}, returnVal: "[]",
	})

	makeToolCall := func(id string) ai.ToolCall {
		return ai.ToolCall{
			ID: id, Type: "function",
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
	emitter := &RecordingEmitter{}

	_, err := runStreamingLoop(context.Background(), provider, router, []ai.ChatMessage{
		{"role": "user", "content": "go"},
	}, emitter)
	if err == nil {
		t.Fatal("expected exhaustion error")
	}

	errCount, doneCount := 0, 0
	for _, ev := range emitter.Events {
		switch ev.Type {
		case "error":
			errCount++
		case "done":
			doneCount++
		}
	}
	if errCount != 1 {
		t.Fatalf("expected exactly 1 error event, got %d", errCount)
	}
	if doneCount != 0 {
		t.Fatalf("expected 0 done events from loop itself, got %d", doneCount)
	}
}

// TestRunStreamingLoop_EmitsErrorOnProviderFailure 验证 provider 返回 error 时 emit Error。
type failingProvider struct{}

func (failingProvider) Chat(context.Context, []ai.ChatMessage, []map[string]any) (*ai.ChatResponse, error) {
	return nil, errors.New("boom")
}
func (failingProvider) ChatStream(context.Context, []ai.ChatMessage, []map[string]any, ai.StreamCallback) (*ai.ChatResponse, error) {
	return nil, errors.New("boom")
}

func TestRunStreamingLoop_EmitsErrorOnProviderFailure(t *testing.T) {
	emitter := &RecordingEmitter{}
	_, err := runStreamingLoop(context.Background(), failingProvider{}, NewToolRouter(), []ai.ChatMessage{
		{"role": "user", "content": "go"},
	}, emitter)
	if err == nil {
		t.Fatal("expected error from failing provider")
	}

	if len(emitter.Events) != 1 || emitter.Events[0].Type != "error" {
		t.Fatalf("expected exactly 1 error event, got %+v", emitter.Events)
	}
}

// TestProcessIntentStream_EmitsDoneWithAgentResult 验证 ProcessIntentStream 成功时 emit Done(*AgentResult)。
func TestProcessIntentStream_EmitsDoneWithAgentResult(t *testing.T) {
	provider := &fakeChatProvider{
		responses: []ai.ChatResponse{
			{Content: "智能体回复内容"},
		},
	}
	svc := NewAgentService(provider, NewToolRouter())
	emitter := &RecordingEmitter{}

	if err := svc.ProcessIntentStream(context.Background(), "proj", "你好", EditorContext{}, emitter, nil); err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	var doneEvent *RecordedEvent
	for i := range emitter.Events {
		if emitter.Events[i].Type == "done" {
			doneEvent = &emitter.Events[i]
			break
		}
	}
	if doneEvent == nil {
		t.Fatal("expected a done event")
	}
	result, ok := doneEvent.Result.(*AgentResult)
	if !ok {
		t.Fatalf("done.Result type = %T, want *AgentResult", doneEvent.Result)
	}
	if result.Content != "智能体回复内容" {
		t.Errorf("done.Result.Content = %q, want '智能体回复内容'", result.Content)
	}
}

// TestProcessIntentStream_EmitsDoneWithReviewResult 验证 ReviewChapterStream 成功时 emit Done(*ReviewResult)。
func TestProcessIntentStream_EmitsDoneWithReviewResult(t *testing.T) {
	provider := &fakeChatProvider{
		responses: []ai.ChatResponse{
			{Content: "## 审查报告\n无重大问题。"},
		},
	}
	router := NewToolRouter()
	router.Register(&fakeTool{name: "get_chapter_content", description: "获取章节内容", parameters: map[string]any{}})
	svc := NewReviewService(provider, router)
	emitter := &RecordingEmitter{}

	if err := svc.ReviewChapterStream(context.Background(), "proj", "ch_1", "第1章", emitter, nil); err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	var doneEvent *RecordedEvent
	for i := range emitter.Events {
		if emitter.Events[i].Type == "done" {
			doneEvent = &emitter.Events[i]
			break
		}
	}
	if doneEvent == nil {
		t.Fatal("expected a done event")
	}
	result, ok := doneEvent.Result.(*ReviewResult)
	if !ok {
		t.Fatalf("done.Result type = %T, want *ReviewResult", doneEvent.Result)
	}
	if result.Type != "review" {
		t.Errorf("done.Result.Type = %q, want 'review'", result.Type)
	}
}
