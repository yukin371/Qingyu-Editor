package version

// TriggerType 快照触发类型
type TriggerType string

const (
	TriggerAuto      TriggerType = "auto"
	TriggerManual    TriggerType = "manual"
	TriggerMilestone TriggerType = "milestone"
)

// Snapshot 快照数据
type Snapshot struct {
	ID        string      `json:"id"`
	ProjectID string      `json:"projectId"`
	ChapterID string      `json:"chapterId,omitempty"`
	Label     string      `json:"label"`
	Content   string      `json:"content"`
	WordCount int         `json:"wordCount"`
	Trigger   TriggerType `json:"trigger"`
	CreatedAt string      `json:"createdAt"`
}
