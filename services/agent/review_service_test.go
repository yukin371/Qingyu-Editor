package agent

import (
	"context"
	"testing"

	"Qingyu-Editor/ai"
)

// --- ReviewAgent 测试 ---

func TestReviewService_ReviewChapter_ReturnsReview(t *testing.T) {
	provider := &fakeChatProvider{
		responses: []ai.ChatResponse{
			{Content: "## 角色一致性审查\n\n林雪在第二章中的行为与其设定一致，但在第五章的描写中性格有偏差。"},
		},
	}

	router := NewToolRouter()
	router.Register(&fakeTool{name: "get_chapter_content", description: "获取章节内容", parameters: map[string]any{}})
	router.Register(&fakeTool{name: "list_characters", description: "列出角色", parameters: map[string]any{}})
	router.Register(&fakeTool{name: "get_character", description: "获取角色详情", parameters: map[string]any{}})

	svc := NewReviewService(provider, router)

	result, err := svc.ReviewChapter(context.Background(), "proj_001", "chapter_001", "第5章 风暴之夜")
	if err != nil {
		t.Fatalf("审查失败: %v", err)
	}

	if result.Content == "" {
		t.Fatal("审查结果不应为空")
	}
	if result.Type != "review" {
		t.Fatalf("期望 type=review, got %s", result.Type)
	}
}

func TestReviewService_ReviewChapter_UsesAuditTools(t *testing.T) {
	toolCallReceived := ""
	provider := &fakeChatProvider{
		responses: []ai.ChatResponse{
			{
				ToolCalls: []ai.ToolCall{
					{
						ID:   "tc_1",
						Type: "function",
						Function: struct {
							Name      string `json:"name"`
							Arguments string `json:"arguments"`
						}{Name: "get_chapter_content", Arguments: `{"chapter_id":"ch_001"}`},
					},
				},
			},
			{Content: "审查完成，未发现一致性问题。"},
		},
	}

	router := NewToolRouter()
	router.Register(&fakeTool{
		name:        "get_chapter_content",
		description: "获取章节内容",
		parameters:  map[string]any{},
		executeFunc: func(ctx context.Context, params map[string]any) (string, error) {
			toolCallReceived = "get_chapter_content"
			return `{"title":"第5章","plain_text":"林雪激动地摔碎了杯子"}`, nil
		},
	})

	svc := NewReviewService(provider, router)
	_, err := svc.ReviewChapter(context.Background(), "proj_001", "ch_001", "第5章")
	if err != nil {
		t.Fatalf("审查失败: %v", err)
	}

	if toolCallReceived != "get_chapter_content" {
		t.Fatal("审查智能体应调用 get_chapter_content 工具获取章节内容")
	}
}

func TestReviewService_ReviewChapter_UsesReviewSystemPrompt(t *testing.T) {
	provider := &fakeChatProvider{
		responses: []ai.ChatResponse{
			{Content: "审查完成。"},
		},
	}

	router := NewToolRouter()

	svc := NewReviewService(provider, router)
	_, err := svc.ReviewChapter(context.Background(), "proj_001", "ch_001", "第5章 风暴之夜")
	if err != nil {
		t.Fatalf("审查失败: %v", err)
	}

	// 验证系统提示包含审查相关指令
	if len(provider.messages) == 0 {
		t.Fatal("应发送消息给 AI")
	}
	firstMessages := provider.messages[0]
	var systemPrompt string
	for _, msg := range firstMessages {
		if msg["role"] == "system" {
			systemPrompt, _ = msg["content"].(string)
		}
	}
	if systemPrompt == "" {
		t.Fatal("应发送系统提示")
	}
	if !containsStr(systemPrompt, "审查") {
		t.Fatal("系统提示应包含审查相关指令")
	}
	if !containsStr(systemPrompt, "角色") || !containsStr(systemPrompt, "一致") {
		t.Fatal("系统提示应包含角色一致性检查要求")
	}
}

func TestReviewService_ReviewScope_FullProject(t *testing.T) {
	provider := &fakeChatProvider{
		responses: []ai.ChatResponse{
			{Content: "全项目审查完成，发现3个一致性问题。"},
		},
	}

	router := NewToolRouter()
	router.Register(&fakeTool{name: "list_characters", description: "列出角色", parameters: map[string]any{}})
	router.Register(&fakeTool{name: "list_volumes_chapters", description: "列出章节", parameters: map[string]any{}})

	svc := NewReviewService(provider, router)

	result, err := svc.ReviewFullProject(context.Background(), "proj_001")
	if err != nil {
		t.Fatalf("全项目审查失败: %v", err)
	}
	if result.Type != "review" {
		t.Fatalf("期望 type=review, got %s", result.Type)
	}
}
