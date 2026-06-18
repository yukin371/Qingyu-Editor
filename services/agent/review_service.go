package agent

import (
	"context"
	"fmt"
	"strings"

	"Qingyu-Editor/ai"
)

// ReviewResult 审查结果
type ReviewResult struct {
	Content string `json:"content"`
	Type    string `json:"type"`
}

// ReviewService 审查智能体服务
type ReviewService struct {
	provider ai.ChatProvider
	router   *ToolRouter
}

// NewReviewService 创建审查智能体服务
func NewReviewService(provider ai.ChatProvider, router *ToolRouter) *ReviewService {
	return &ReviewService{
		provider: provider,
		router:   router,
	}
}

// ReviewChapter 审查单个章节
func (s *ReviewService) ReviewChapter(ctx context.Context, projectID string, chapterID string, chapterTitle string) (*ReviewResult, error) {
	messages := s.buildChapterReviewMessages(projectID, chapterID, chapterTitle)
	return s.runReviewLoop(ctx, messages)
}

// ReviewFullProject 审查整个项目
func (s *ReviewService) ReviewFullProject(ctx context.Context, projectID string) (*ReviewResult, error) {
	messages := s.buildFullProjectReviewMessages(projectID)
	return s.runReviewLoop(ctx, messages)
}

func (s *ReviewService) runReviewLoop(ctx context.Context, messages []ai.ChatMessage) (*ReviewResult, error) {
	content, err := runStreamingLoop(ctx, s.provider, s.router, messages)
	if err != nil {
		return nil, fmt.Errorf("审查 %w", err)
	}
	return &ReviewResult{
		Content: content,
		Type:    "review",
	}, nil
}

func (s *ReviewService) buildChapterReviewMessages(projectID, chapterID, chapterTitle string) []ai.ChatMessage {
	system := buildReviewSystemPrompt(projectID)
	system += fmt.Sprintf("\n\n当前审查章节: %s (ID: %s)", chapterTitle, chapterID)
	system += "\n请先使用 get_chapter_content 获取章节内容，再结合角色设定进行审查。"

	return []ai.ChatMessage{
		{"role": "system", "content": system},
		{"role": "user", "content": fmt.Sprintf("请审查章节「%s」的角色一致性、设定一致性和情节连贯性。", chapterTitle)},
	}
}

func (s *ReviewService) buildFullProjectReviewMessages(projectID string) []ai.ChatMessage {
	system := buildReviewSystemPrompt(projectID)
	system += "\n请先使用 list_characters 和 list_volumes_chapters 了解项目结构，再逐步审查。"

	return []ai.ChatMessage{
		{"role": "system", "content": system},
		{"role": "user", "content": "请对整个项目进行全面审查，包括角色一致性、时间线冲突、设定矛盾和情节漏洞。"},
	}
}

func buildReviewSystemPrompt(projectID string) string {
	var parts []string

	parts = append(parts, "你是一个小说审查编辑。你的任务是审查小说内容，发现一致性问题、情节漏洞和设定矛盾。")
	parts = append(parts, "你应当：")
	parts = append(parts, "1. 检查角色行为是否与其性格设定一致")
	parts = append(parts, "2. 检查时间线是否有矛盾（事件顺序、年龄变化等）")
	parts = append(parts, "3. 检查地点/场景描写是否前后一致")
	parts = append(parts, "4. 检查情节线索是否有断裂或矛盾")
	parts = append(parts, "5. 检查对话是否符合角色语言习惯")
	parts = append(parts, "")
	parts = append(parts, fmt.Sprintf("项目ID: %s", projectID))
	parts = append(parts, "")
	parts = append(parts, "输出格式：使用 Markdown 格式，按问题严重程度分类（严重/中等/轻微），每个问题说明：位置、问题描述、建议修改方案。")

	return strings.Join(parts, "\n")
}
