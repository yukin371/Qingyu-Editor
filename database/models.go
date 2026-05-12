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

type StoryTime struct {
	Year        *int   `json:"year,omitempty"`
	Month       *int   `json:"month,omitempty"`
	Day         *int   `json:"day,omitempty"`
	Hour        *int   `json:"hour,omitempty"`
	Minute      *int   `json:"minute,omitempty"`
	Era         string `json:"era,omitempty"`
	Season      string `json:"season,omitempty"`
	Description string `json:"description,omitempty"`
}

type Timeline struct {
	ID          string    `json:"id"`
	ProjectID   string    `json:"projectId"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	StartTime   StoryTime `json:"startTime"`
	EndTime     StoryTime `json:"endTime"`
	CreatedAt   string    `json:"createdAt"`
	UpdatedAt   string    `json:"updatedAt"`
}

type TimelineEvent struct {
	ID          string    `json:"id"`
	ProjectID   string    `json:"projectId"`
	TimelineID  string    `json:"timelineId"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	StoryTime   StoryTime `json:"storyTime"`
	Duration    string    `json:"duration"`
	Impact      string    `json:"impact"`
	Participants []string `json:"participants"`
	LocationIDs []string  `json:"locationIds"`
	ChapterIDs  []string  `json:"chapterIds"`
	EventType   string    `json:"eventType"`
	Importance  int       `json:"importance"`
	CreatedAt   string    `json:"createdAt"`
	UpdatedAt   string    `json:"updatedAt"`
}

type TimelineVisualization struct {
	Timeline Timeline        `json:"timeline"`
	Events   []TimelineEvent `json:"events"`
}

type CreateTimelineInput struct {
	ProjectID   string    `json:"projectId"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	StartTime   StoryTime `json:"startTime"`
	EndTime     StoryTime `json:"endTime"`
}

type TimelineUpdate struct {
	Name        *string    `json:"name,omitempty"`
	Description *string    `json:"description,omitempty"`
	StartTime   *StoryTime `json:"startTime,omitempty"`
	EndTime     *StoryTime `json:"endTime,omitempty"`
}

type CreateTimelineEventInput struct {
	ProjectID    string    `json:"projectId"`
	TimelineID   string    `json:"timelineId"`
	Title        string    `json:"title"`
	Description  string    `json:"description"`
	StoryTime    StoryTime `json:"storyTime"`
	Duration     string    `json:"duration"`
	Impact       string    `json:"impact"`
	Participants []string  `json:"participants"`
	LocationIDs  []string  `json:"locationIds"`
	ChapterIDs   []string  `json:"chapterIds"`
	EventType    string    `json:"eventType"`
	Importance   *int      `json:"importance,omitempty"`
}

type TimelineEventUpdate struct {
	Title        *string    `json:"title,omitempty"`
	Description  *string    `json:"description,omitempty"`
	StoryTime    *StoryTime `json:"storyTime,omitempty"`
	Duration     *string    `json:"duration,omitempty"`
	Impact       *string    `json:"impact,omitempty"`
	Participants []string   `json:"participants,omitempty"`
	LocationIDs  []string   `json:"locationIds,omitempty"`
	ChapterIDs   []string   `json:"chapterIds,omitempty"`
	EventType    *string    `json:"eventType,omitempty"`
	Importance   *int       `json:"importance,omitempty"`
}

type GoldenChapterPlan struct {
	ChapterNumber int    `json:"chapterNumber"`
	Title         string `json:"title"`
	Summary       string `json:"summary"`
	Hook          string `json:"hook"`
	Payoff        string `json:"payoff"`
}

type TemplateDetailSection struct {
	ID      string   `json:"id"`
	Title   string   `json:"title"`
	Summary string   `json:"summary"`
	Bullets []string `json:"bullets"`
}

type CreativeWorkflowTemplate struct {
	ID                  string                  `json:"id"`
	Name                string                  `json:"name"`
	Tagline             string                  `json:"tagline"`
	Category            string                  `json:"category"`
	TemplateType        string                  `json:"templateType"`
	RecommendedLabel    string                  `json:"recommendedLabel"`
	ApplicableTo        []string                `json:"applicableTo"`
	EmotionCurve        string                  `json:"emotionCurve"`
	PayoffFocus         []string                `json:"payoffFocus"`
	DefaultAudience     []string                `json:"defaultAudience"`
	DefaultPromises     []string                `json:"defaultPromises"`
	DefaultPaceContract string                  `json:"defaultPaceContract"`
	BlueprintHints      []string                `json:"blueprintHints"`
	GoldenChapterSeeds  []GoldenChapterPlan     `json:"goldenChapterSeeds"`
	Characters          []TemplateDetailSection `json:"characters"`
	Settings            []TemplateDetailSection `json:"settings"`
	ProjectCategory     string                  `json:"projectCategory"`
	VolumeTitle         string                  `json:"volumeTitle"`
	OpeningLine         string                  `json:"openingLine"`
}

type CreativeWorkflowRecord struct {
	Version        int                `json:"version"`
	ProjectID      string             `json:"projectId"`
	TemplateID     string             `json:"templateId"`
	PitchLine      string             `json:"pitchLine"`
	TargetAudience []string           `json:"targetAudience"`
	CorePromises   []string           `json:"corePromises"`
	PaceContract   string             `json:"paceContract"`
	GoldenChapters []GoldenChapterPlan `json:"goldenChapters"`
	CreatedAt      string             `json:"createdAt"`
	UpdatedAt      string             `json:"updatedAt"`
}

type CreativeWorkflowUpdate struct {
	TemplateID     *string            `json:"templateId,omitempty"`
	PitchLine      *string            `json:"pitchLine,omitempty"`
	TargetAudience []string           `json:"targetAudience,omitempty"`
	CorePromises   []string           `json:"corePromises,omitempty"`
	PaceContract   *string            `json:"paceContract,omitempty"`
	GoldenChapters []GoldenChapterPlan `json:"goldenChapters,omitempty"`
}

type InspirationNote struct {
	ID           string `json:"id"`
	ProjectID    string `json:"projectId"`
	ChapterID    string `json:"chapterId"`
	ChapterTitle string `json:"chapterTitle"`
	Title        string `json:"title"`
	Content      string `json:"content"`
	CreatedAt    string `json:"createdAt"`
	UpdatedAt    string `json:"updatedAt"`
}

type CreateInspirationNoteInput struct {
	ProjectID    string `json:"projectId"`
	ChapterID    string `json:"chapterId"`
	ChapterTitle string `json:"chapterTitle"`
	Title        string `json:"title"`
	Content      string `json:"content"`
}

type StoryHarnessChangeRequestPreview struct {
	ID              string `json:"id"`
	Source          string `json:"source"`
	Type            string `json:"type"`
	Title           string `json:"title"`
	Summary         string `json:"summary"`
	Reason          string `json:"reason"`
	Evidence        string `json:"evidence"`
	Severity        string `json:"severity"`
	SourceTimestamp *int64 `json:"sourceTimestamp,omitempty"`
}

type StoryHarnessBatch struct {
	BatchID        string                            `json:"batchId"`
	ProjectID      string                            `json:"projectId"`
	ChapterID      string                            `json:"chapterId"`
	ChapterTitle   string                            `json:"chapterTitle"`
	CommittedAt    int64                             `json:"committedAt"`
	Source         string                            `json:"source"`
	ChangeRequests []StoryHarnessChangeRequestPreview `json:"changeRequests"`
}

type CreateStoryHarnessBatchInput struct {
	ProjectID      string                            `json:"projectId"`
	ChapterID      string                            `json:"chapterId"`
	ChapterTitle   string                            `json:"chapterTitle"`
	Source         string                            `json:"source"`
	ChangeRequests []StoryHarnessChangeRequestPreview `json:"changeRequests"`
}

type StoryHarnessEvidence struct {
	DocumentID   string `json:"documentId"`
	ParagraphIdx int    `json:"paragraphIdx"`
	QuoteText    string `json:"quoteText"`
}

type StoryHarnessChangeRequest struct {
	ID              string                 `json:"id"`
	BatchID         string                 `json:"batchId"`
	ProjectID       string                 `json:"projectId"`
	ChapterID       string                 `json:"chapterId"`
	Category        string                 `json:"category"`
	Priority        string                 `json:"priority"`
	Status          string                 `json:"status"`
	Title           string                 `json:"title"`
	Description     string                 `json:"description"`
	SuggestedChange map[string]interface{} `json:"suggestedChange"`
	Evidence        []StoryHarnessEvidence `json:"evidence"`
	Source          string                 `json:"source"`
	CreatedAt       string                 `json:"createdAt"`
	UpdatedAt       string                 `json:"updatedAt"`
}

type StoryHarnessChangeRequestStatusUpdate struct {
	Status string `json:"status"`
}

type StoryHarnessCharacterContext struct {
	ID               string   `json:"id"`
	Name             string   `json:"name"`
	Alias            []string `json:"alias"`
	Traits           []string `json:"traits"`
	CurrentState     string   `json:"currentState"`
	ShortDescription string   `json:"shortDescription"`
	AvatarURL        string   `json:"avatarUrl"`
}

type StoryHarnessRelationContext struct {
	ID       string `json:"id"`
	FromID   string `json:"fromId"`
	ToID     string `json:"toId"`
	FromName string `json:"fromName"`
	ToName   string `json:"toName"`
	Type     string `json:"type"`
	Strength int    `json:"strength"`
	Notes    string `json:"notes"`
}

type StoryHarnessChapterContext struct {
	Characters []StoryHarnessCharacterContext `json:"characters"`
	Relations  []StoryHarnessRelationContext  `json:"relations"`
	PendingCRs int                            `json:"pendingCRs"`
}

type StoryHarnessTriggerIndexResult struct {
	BatchID      string `json:"batchId"`
	Generated    int    `json:"generated"`
	Pending      int    `json:"pending"`
	Deduplicated int    `json:"deduplicated"`
	Source       string `json:"source"`
}

type StoryHarnessRebuildProjectionResult struct {
	ProjectID     string `json:"projectId"`
	ChapterID     string `json:"chapterId"`
	ReplayedCount int    `json:"replayedCount"`
	LastRequestID string `json:"lastRequestId"`
}
