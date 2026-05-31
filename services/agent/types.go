package agent

// EditorContext 编辑器上下文
type EditorContext struct {
	CurrentChapterID string   `json:"current_chapter_id"`
	CursorPosition   int      `json:"cursor_position"`
	SelectedText     string   `json:"selected_text"`
	NearbyCharacters []string `json:"nearby_characters"`
}

// AgentResult 智能体返回结果
type AgentResult struct {
	Content     string       `json:"content"`
	Suggestions []Suggestion `json:"suggestions,omitempty"`
}

// Suggestion AI 建议
type Suggestion struct {
	ID              string `json:"id"`
	Type            string `json:"type"`
	Action          string `json:"action"`
	TargetEntity    string `json:"target_entity"`
	TargetID        string `json:"target_id"`
	Content         string `json:"content"`
	OriginalContent string `json:"original_content,omitempty"`
	Summary         string `json:"summary"`
}

// HasToolCalls 用于 AgentResult 兼容测试中的接口
func (r *AgentResult) HasToolCalls() bool {
	return false
}
