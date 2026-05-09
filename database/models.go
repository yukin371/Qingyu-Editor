package database

type Project struct {
	ID           string `json:"id"`
	Title        string `json:"title"`
	Description  string `json:"description"`
	CoverPath    string `json:"coverPath"`
	WordCount    int    `json:"wordCount"`
	Status       string `json:"status"`
	ChapterCount int    `json:"chapterCount"`
	CreatedAt    string `json:"createdAt"`
	UpdatedAt    string `json:"updatedAt"`
}

type Volume struct {
	ID        string `json:"id"`
	ProjectID string `json:"projectId"`
	Title     string `json:"title"`
	SortOrder int    `json:"sortOrder"`
	CreatedAt string `json:"createdAt"`
}

type Chapter struct {
	ID        string `json:"id"`
	ProjectID string `json:"projectId"`
	VolumeID  string `json:"volumeId"`
	Title     string `json:"title"`
	Content   string `json:"content"`
	PlainText string `json:"plainText"`
	WordCount int    `json:"wordCount"`
	SortOrder int    `json:"sortOrder"`
	Status    string `json:"status"`
	CreatedAt string `json:"createdAt"`
	UpdatedAt string `json:"updatedAt"`
}

type CreateProjectInput struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	CoverPath   string `json:"coverPath"`
	Status      string `json:"status"`
}

type ProjectUpdate struct {
	Title       *string `json:"title,omitempty"`
	Description *string `json:"description,omitempty"`
	CoverPath   *string `json:"coverPath,omitempty"`
	Status      *string `json:"status,omitempty"`
}

type CreateVolumeInput struct {
	ProjectID string `json:"projectId"`
	Title     string `json:"title"`
	SortOrder *int   `json:"sortOrder,omitempty"`
}

type VolumeUpdate struct {
	Title     *string `json:"title,omitempty"`
	SortOrder *int    `json:"sortOrder,omitempty"`
}

type ReorderVolumesInput struct {
	ProjectID  string   `json:"projectId"`
	OrderedIDs []string `json:"orderedIds"`
}

type CreateChapterInput struct {
	ProjectID string `json:"projectId"`
	VolumeID  string `json:"volumeId"`
	Title     string `json:"title"`
	Content   string `json:"content"`
	PlainText string `json:"plainText"`
	WordCount *int   `json:"wordCount,omitempty"`
	SortOrder *int   `json:"sortOrder,omitempty"`
	Status    string `json:"status"`
}

type ChapterUpdate struct {
	Title     *string `json:"title,omitempty"`
	Content   *string `json:"content,omitempty"`
	PlainText *string `json:"plainText,omitempty"`
	WordCount *int    `json:"wordCount,omitempty"`
	SortOrder *int    `json:"sortOrder,omitempty"`
	Status    *string `json:"status,omitempty"`
	VolumeID  *string `json:"volumeId,omitempty"`
}

type ReorderChaptersInput struct {
	ProjectID  string   `json:"projectId"`
	VolumeID   *string  `json:"volumeId,omitempty"`
	OrderedIDs []string `json:"orderedIds"`
}

type MoveChapterInput struct {
	ChapterID      string  `json:"chapterId"`
	TargetVolumeID *string `json:"targetVolumeId,omitempty"`
	TargetIndex    int     `json:"targetIndex"`
}
