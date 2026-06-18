package agent

import (
	"context"
	"encoding/json"
	"fmt"

	"Qingyu-Editor/ai"
)

// runStreamingLoop drives the up-to-6-round tool-call loop for any ChatProvider,
// emitting progress events to the supplied emitter.
//
// It calls provider.ChatStream and routes content deltas to emitter.Token. For
// each tool call it emits ToolStart before dispatch and ToolEnd (with the
// dispatch error, if any) afterward. Done is NOT emitted here — callers wrap
// the returned content into a typed result and emit Done themselves, so the
// loop stays result-type-agnostic.
//
// On any failure (provider error, maxToolCallRounds exhausted) emitter.Error
// is called exactly once and the error is returned.
func runStreamingLoop(
	ctx context.Context,
	provider ai.ChatProvider,
	router *ToolRouter,
	messages []ai.ChatMessage,
	emitter StreamEmitter,
) (string, error) {
	tools := router.ToolDefinitions()

	for range maxToolCallRounds {
		var resp *ai.ChatResponse
		resp, err := provider.ChatStream(ctx, messages, tools, func(delta ai.StreamDelta) {
			// 文本增量转发给 emitter；tool_calls 增量由 ChatStream 内部累积，
			// 循环从返回的 resp.ToolCalls 读取，不在此回调内派发。
			if delta.Content != "" {
				emitter.Token(delta.Content)
			}
		})
		if err != nil {
			emitter.Error(err.Error())
			return "", fmt.Errorf("AI 调用失败: %w", err)
		}

		if !resp.HasToolCalls() {
			return resp.Content, nil
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

			emitter.ToolStart(tc.Function.Name)
			result, dErr := router.Dispatch(ctx, tc.Function.Name, params)
			emitter.ToolEnd(tc.Function.Name, dErr)
			if dErr != nil {
				result = fmt.Sprintf("工具执行失败: %s", dErr)
			}

			messages = append(messages, ai.ChatMessage{
				"role":         "tool",
				"content":      result,
				"tool_call_id": tc.ID,
				"name":         tc.Function.Name,
			})
		}
	}

	emitter.Error(fmt.Sprintf("超过最大工具调用轮数 (%d)", maxToolCallRounds))
	return "", fmt.Errorf("超过最大工具调用轮数 (%d)", maxToolCallRounds)
}
