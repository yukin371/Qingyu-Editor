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

type Character struct {
	ID                string                 `json:"id"`
	ProjectID         string                 `json:"projectId"`
	Name              string                 `json:"name"`
	Alias             []string               `json:"alias"`
	Summary           string                 `json:"summary"`
	Traits            []string               `json:"traits"`
	Background        string                 `json:"background"`
	AvatarURL         string                 `json:"avatarUrl"`
	PersonalityPrompt string                 `json:"personalityPrompt"`
	SpeechPattern     string                 `json:"speechPattern"`
	CurrentState      string                 `json:"currentState"`
	CustomStatus      map[string]interface{} `json:"customStatus"`
	CreatedAt         string                 `json:"createdAt"`
	UpdatedAt         string                 `json:"updatedAt"`
}

type CharacterRelation struct {
	ID                  string `json:"id"`
	ProjectID           string `json:"projectId"`
	FromID              string `json:"fromId"`
	ToID                string `json:"toId"`
	Type                string `json:"type"`
	Strength            int    `json:"strength"`
	Notes               string `json:"notes"`
	ValidFromChapterID  string `json:"validFromChapterId"`
	ValidUntilChapterID string `json:"validUntilChapterId"`
	CreatedAt           string `json:"createdAt"`
	UpdatedAt           string `json:"updatedAt"`
}

type Location struct {
	ID          string `json:"id"`
	ProjectID   string `json:"projectId"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Climate     string `json:"climate"`
	Culture     string `json:"culture"`
	Geography   string `json:"geography"`
	Atmosphere  string `json:"atmosphere"`
	ParentID    string `json:"parentId"`
	ImageURL    string `json:"imageUrl"`
	CreatedAt   string `json:"createdAt"`
	UpdatedAt   string `json:"updatedAt"`
}

type LocationRelation struct {
	ID        string `json:"id"`
	ProjectID string `json:"projectId"`
	FromID    string `json:"fromId"`
	ToID      string `json:"toId"`
	Type      string `json:"type"`
	Distance  string `json:"distance"`
	Notes     string `json:"notes"`
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

type CreateCharacterInput struct {
	ProjectID         string                 `json:"projectId"`
	Name              string                 `json:"name"`
	Alias             []string               `json:"alias"`
	Summary           string                 `json:"summary"`
	Traits            []string               `json:"traits"`
	Background        string                 `json:"background"`
	AvatarURL         string                 `json:"avatarUrl"`
	PersonalityPrompt string                 `json:"personalityPrompt"`
	SpeechPattern     string                 `json:"speechPattern"`
	CurrentState      string                 `json:"currentState"`
	CustomStatus      map[string]interface{} `json:"customStatus"`
}

type CharacterUpdate struct {
	Name              *string                `json:"name,omitempty"`
	Alias             []string               `json:"alias,omitempty"`
	Summary           *string                `json:"summary,omitempty"`
	Traits            []string               `json:"traits,omitempty"`
	Background        *string                `json:"background,omitempty"`
	AvatarURL         *string                `json:"avatarUrl,omitempty"`
	PersonalityPrompt *string                `json:"personalityPrompt,omitempty"`
	SpeechPattern     *string                `json:"speechPattern,omitempty"`
	CurrentState      *string                `json:"currentState,omitempty"`
	CustomStatus      map[string]interface{} `json:"customStatus,omitempty"`
}

type CreateCharacterRelationInput struct {
	ProjectID           string `json:"projectId"`
	FromID              string `json:"fromId"`
	ToID                string `json:"toId"`
	Type                string `json:"type"`
	Strength            *int   `json:"strength,omitempty"`
	Notes               string `json:"notes"`
	ValidFromChapterID  string `json:"validFromChapterId"`
	ValidUntilChapterID string `json:"validUntilChapterId"`
}

type CreateLocationInput struct {
	ProjectID   string `json:"projectId"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Climate     string `json:"climate"`
	Culture     string `json:"culture"`
	Geography   string `json:"geography"`
	Atmosphere  string `json:"atmosphere"`
	ParentID    string `json:"parentId"`
	ImageURL    string `json:"imageUrl"`
}

type LocationUpdate struct {
	Name        *string `json:"name,omitempty"`
	Description *string `json:"description,omitempty"`
	Climate     *string `json:"climate,omitempty"`
	Culture     *string `json:"culture,omitempty"`
	Geography   *string `json:"geography,omitempty"`
	Atmosphere  *string `json:"atmosphere,omitempty"`
	ParentID    *string `json:"parentId,omitempty"`
	ImageURL    *string `json:"imageUrl,omitempty"`
}

type CreateLocationRelationInput struct {
	ProjectID string `json:"projectId"`
	FromID    string `json:"fromId"`
	ToID      string `json:"toId"`
	Type      string `json:"type"`
	Distance  string `json:"distance"`
	Notes     string `json:"notes"`
}
