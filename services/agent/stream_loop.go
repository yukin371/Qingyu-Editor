package agent

import (
	"context"
	"encoding/json"
	"fmt"

	"Qingyu-Editor/ai"
)

// runStreamingLoop drives the up-to-6-round tool-call loop for any ChatProvider.
// Returns the final assistant content when the provider returns a response with
// no tool calls, or an error if maxToolCallRounds is exhausted.
//
// Note: streaming itself is layered on top of this loop in later tasks; for now
// this is a pure refactor of the duplicated tool-call loop previously inlined
// in AgentService.ProcessIntent and ReviewService.runReviewLoop.
func runStreamingLoop(
	ctx context.Context,
	provider ai.ChatProvider,
	router *ToolRouter,
	messages []ai.ChatMessage,
) (string, error) {
	tools := router.ToolDefinitions()

	for range maxToolCallRounds {
		resp, err := provider.Chat(ctx, messages, tools)
		if err != nil {
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

			result, err := router.Dispatch(ctx, tc.Function.Name, params)
			if err != nil {
				result = fmt.Sprintf("工具执行失败: %s", err)
			}

			messages = append(messages, ai.ChatMessage{
				"role":         "tool",
				"content":      result,
				"tool_call_id": tc.ID,
				"name":         tc.Function.Name,
			})
		}
	}

	return "", fmt.Errorf("超过最大工具调用轮数 (%d)", maxToolCallRounds)
}
