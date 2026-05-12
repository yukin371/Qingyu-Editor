package services

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"Qingyu-Editor/database"
	"Qingyu-Editor/database/sqlc"
)

type CreativeWorkflowService struct {
	db      *sql.DB
	queries *sqlc.Queries
}

func NewCreativeWorkflowService(db *sql.DB) *CreativeWorkflowService {
	return &CreativeWorkflowService{
		db:      db,
		queries: sqlc.New(db),
	}
}

func (s *CreativeWorkflowService) Get(projectID string) (database.CreativeWorkflowRecord, error) {
	ctx := context.Background()
	projectID = strings.TrimSpace(projectID)
	if projectID == "" {
		return database.CreativeWorkflowRecord{}, errors.New("projectId 不能为空")
	}
	if err := ensureProjectExists(ctx, s.queries, projectID); err != nil {
		return database.CreativeWorkflowRecord{}, err
	}

	row, err := s.queries.GetCreativeWorkflowByProject(ctx, projectID)
	if errors.Is(err, sql.ErrNoRows) {
		return createDefaultCreativeWorkflowRecord(projectID), nil
	}
	if err != nil {
		return database.CreativeWorkflowRecord{}, fmt.Errorf("查询创作流失败: %w", err)
	}
	return mapCreativeWorkflowRecord(row), nil
}

func (s *CreativeWorkflowService) Save(
	projectID string,
	update database.CreativeWorkflowUpdate,
) (database.CreativeWorkflowRecord, error) {
	ctx := context.Background()
	projectID = strings.TrimSpace(projectID)
	if projectID == "" {
		return database.CreativeWorkflowRecord{}, errors.New("projectId 不能为空")
	}
	if err := ensureProjectExists(ctx, s.queries, projectID); err != nil {
		return database.CreativeWorkflowRecord{}, err
	}

	current, err := s.Get(projectID)
	if err != nil {
		return database.CreativeWorkflowRecord{}, err
	}

	next := current
	if update.TemplateID != nil {
		next.TemplateID = strings.TrimSpace(*update.TemplateID)
		if next.TemplateID == "" {
			next.TemplateID = ""
			next.TargetAudience = []string{}
			next.CorePromises = []string{}
			next.PaceContract = ""
			next.GoldenChapters = createBlankGoldenChapterPlans()
		} else {
			template, ok := getCreativeWorkflowTemplateDefinition(next.TemplateID)
			if !ok {
				return database.CreativeWorkflowRecord{}, errors.New("模板不存在")
			}
			next.TemplateID = template.ID
			next.TargetAudience = append([]string{}, template.DefaultAudience...)
			next.CorePromises = append([]string{}, template.DefaultPromises...)
			next.PaceContract = template.DefaultPaceContract
			next.GoldenChapters = cloneGoldenChapterPlans(template.GoldenChapterSeeds)
		}
	}
	if update.PitchLine != nil {
		next.PitchLine = strings.TrimSpace(*update.PitchLine)
	}
	if update.TargetAudience != nil {
		next.TargetAudience = normalizeDistinctStrings(update.TargetAudience)
	}
	if update.CorePromises != nil {
		next.CorePromises = normalizeDistinctStrings(update.CorePromises)
	}
	if update.PaceContract != nil {
		next.PaceContract = strings.TrimSpace(*update.PaceContract)
	}
	if update.GoldenChapters != nil {
		fallback := next.GoldenChapters
		if len(fallback) == 0 {
			fallback = createBlankGoldenChapterPlans()
		}
		next.GoldenChapters = normalizeGoldenChapterPlans(update.GoldenChapters, fallback)
	}

	targetAudienceJSON, err := marshalStringSlice(next.TargetAudience)
	if err != nil {
		return database.CreativeWorkflowRecord{}, err
	}
	corePromisesJSON, err := marshalStringSlice(next.CorePromises)
	if err != nil {
		return database.CreativeWorkflowRecord{}, err
	}
	goldenChaptersJSON, err := marshalGoldenChapterPlans(next.GoldenChapters)
	if err != nil {
		return database.CreativeWorkflowRecord{}, err
	}

	if err := s.queries.UpsertCreativeWorkflow(ctx, sqlc.UpsertCreativeWorkflowParams{
		ProjectID:          projectID,
		TemplateID:         toOptionalNullString(next.TemplateID),
		PitchLine:          next.PitchLine,
		TargetAudienceJson: targetAudienceJSON,
		CorePromisesJson:   corePromisesJSON,
		PaceContract:       next.PaceContract,
		GoldenChaptersJson: goldenChaptersJSON,
	}); err != nil {
		return database.CreativeWorkflowRecord{}, fmt.Errorf("保存创作流失败: %w", err)
	}

	return s.Get(projectID)
}

func createDefaultCreativeWorkflowRecord(projectID string) database.CreativeWorkflowRecord {
	now := time.Now().UTC().Format(time.RFC3339)
	return database.CreativeWorkflowRecord{
		Version:        1,
		ProjectID:      projectID,
		TemplateID:     "",
		PitchLine:      "",
		TargetAudience: []string{},
		CorePromises:   []string{},
		PaceContract:   "",
		GoldenChapters: createBlankGoldenChapterPlans(),
		CreatedAt:      now,
		UpdatedAt:      now,
	}
}

func createBlankGoldenChapterPlans() []database.GoldenChapterPlan {
	return []database.GoldenChapterPlan{
		{ChapterNumber: 1, Title: "第1章目标"},
		{ChapterNumber: 2, Title: "第2章目标"},
		{ChapterNumber: 3, Title: "第3章目标"},
	}
}

func mapCreativeWorkflowRecord(
	row sqlc.GetCreativeWorkflowByProjectRow,
) database.CreativeWorkflowRecord {
	goldenChapters := unmarshalGoldenChapterPlans(row.GoldenChaptersJson)
	if len(goldenChapters) == 0 {
		goldenChapters = createBlankGoldenChapterPlans()
	}

	return database.CreativeWorkflowRecord{
		Version:        1,
		ProjectID:      row.ProjectID,
		TemplateID:     row.TemplateID,
		PitchLine:      row.PitchLine,
		TargetAudience: unmarshalStringSlice(row.TargetAudienceJson),
		CorePromises:   unmarshalStringSlice(row.CorePromisesJson),
		PaceContract:   row.PaceContract,
		GoldenChapters: goldenChapters,
		CreatedAt:      formatSQLiteTime(row.CreatedAt),
		UpdatedAt:      formatSQLiteTime(row.UpdatedAt),
	}
}

func normalizeDistinctStrings(items []string) []string {
	seen := make(map[string]struct{}, len(items))
	normalized := make([]string, 0, len(items))
	for _, item := range items {
		trimmed := strings.TrimSpace(item)
		if trimmed == "" {
			continue
		}
		if _, exists := seen[trimmed]; exists {
			continue
		}
		seen[trimmed] = struct{}{}
		normalized = append(normalized, trimmed)
	}
	return normalized
}

func normalizeGoldenChapterPlans(
	items []database.GoldenChapterPlan,
	fallback []database.GoldenChapterPlan,
) []database.GoldenChapterPlan {
	if len(fallback) == 0 {
		fallback = createBlankGoldenChapterPlans()
	}

	normalized := make([]database.GoldenChapterPlan, 0, len(fallback))
	for index, base := range fallback {
		current := base
		if index < len(items) {
			input := items[index]
			if input.ChapterNumber > 0 {
				current.ChapterNumber = input.ChapterNumber
			}
			if strings.TrimSpace(input.Title) != "" {
				current.Title = strings.TrimSpace(input.Title)
			}
			if input.Summary != "" {
				current.Summary = strings.TrimSpace(input.Summary)
			}
			if input.Hook != "" {
				current.Hook = strings.TrimSpace(input.Hook)
			}
			if input.Payoff != "" {
				current.Payoff = strings.TrimSpace(input.Payoff)
			}
		}
		normalized = append(normalized, current)
	}
	return normalized
}

func marshalGoldenChapterPlans(items []database.GoldenChapterPlan) (string, error) {
	if items == nil {
		items = []database.GoldenChapterPlan{}
	}
	payload, err := json.Marshal(items)
	if err != nil {
		return "", fmt.Errorf("序列化黄金三章失败: %w", err)
	}
	return string(payload), nil
}

func unmarshalGoldenChapterPlans(payload string) []database.GoldenChapterPlan {
	if strings.TrimSpace(payload) == "" {
		return nil
	}
	var items []database.GoldenChapterPlan
	if err := json.Unmarshal([]byte(payload), &items); err != nil {
		return nil
	}
	return items
}
