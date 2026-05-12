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

	"github.com/google/uuid"
)

type StoryHarnessService struct {
	db      *sql.DB
	queries *sqlc.Queries
}

func NewStoryHarnessService(db *sql.DB) *StoryHarnessService {
	return &StoryHarnessService{
		db:      db,
		queries: sqlc.New(db),
	}
}

func (s *StoryHarnessService) CreateBatch(
	input database.CreateStoryHarnessBatchInput,
) (database.StoryHarnessBatch, error) {
	ctx := context.Background()
	projectID := strings.TrimSpace(input.ProjectID)
	chapterID := strings.TrimSpace(input.ChapterID)
	if projectID == "" || chapterID == "" {
		return database.StoryHarnessBatch{}, errors.New("projectId 和 chapterId 不能为空")
	}
	if err := ensureProjectExists(ctx, s.queries, projectID); err != nil {
		return database.StoryHarnessBatch{}, err
	}
	chapter, err := s.getChapter(ctx, chapterID)
	if err != nil {
		return database.StoryHarnessBatch{}, err
	}
	if chapter.ProjectID != projectID {
		return database.StoryHarnessBatch{}, errors.New("章节不属于当前项目")
	}

	committedAt := time.Now().UnixMilli()
	batchID := uuid.NewString()
	source := normalizeStoryHarnessSource(input.Source)
	changeRequests := normalizeStoryHarnessPreviewList(input.ChangeRequests, source, committedAt)
	changeRequestsJSON, err := marshalStoryHarnessPreviewList(changeRequests)
	if err != nil {
		return database.StoryHarnessBatch{}, err
	}

	if err := s.queries.CreateStoryHarnessBatch(ctx, sqlc.CreateStoryHarnessBatchParams{
		BatchID:            batchID,
		ProjectID:          projectID,
		ChapterID:          chapterID,
		ChapterTitle:       firstNonEmptyString(strings.TrimSpace(input.ChapterTitle), chapter.Title),
		CommittedAt:        committedAt,
		Source:             source,
		ChangeRequestsJson: changeRequestsJSON,
	}); err != nil {
		return database.StoryHarnessBatch{}, fmt.Errorf("保存 Story Harness 批次失败: %w", err)
	}

	for _, changeRequest := range changeRequests {
		evidenceJSON, err := marshalStoryHarnessEvidence(
			buildStoryHarnessEvidenceFromPreview(chapterID, changeRequest.Evidence),
		)
		if err != nil {
			return database.StoryHarnessBatch{}, err
		}
		suggestedChangeJSON, err := marshalJSONObject(map[string]interface{}{
			"type":            changeRequest.Type,
			"summary":         changeRequest.Summary,
			"reason":          changeRequest.Reason,
			"severity":        changeRequest.Severity,
			"sourceTimestamp": changeRequest.SourceTimestamp,
		})
		if err != nil {
			return database.StoryHarnessBatch{}, err
		}

		if err := s.queries.CreateStoryHarnessChangeRequest(ctx, sqlc.CreateStoryHarnessChangeRequestParams{
			ID:                  changeRequest.ID,
			BatchID:             batchID,
			ProjectID:           projectID,
			ChapterID:           chapterID,
			Category:            normalizeStoryHarnessCategory(changeRequest.Type),
			Priority:            normalizeStoryHarnessPriority(changeRequest.Severity),
			Status:              "pending",
			Title:               changeRequest.Title,
			Description:         changeRequest.Summary,
			SuggestedChangeJson: suggestedChangeJSON,
			EvidenceJson:        evidenceJSON,
			Source:              source,
		}); err != nil {
			return database.StoryHarnessBatch{}, fmt.Errorf("保存 Story Harness 变更建议失败: %w", err)
		}
	}

	return database.StoryHarnessBatch{
		BatchID:        batchID,
		ProjectID:      projectID,
		ChapterID:      chapterID,
		ChapterTitle:   firstNonEmptyString(strings.TrimSpace(input.ChapterTitle), chapter.Title),
		CommittedAt:    committedAt,
		Source:         source,
		ChangeRequests: changeRequests,
	}, nil
}

func (s *StoryHarnessService) GetLatestBatch(
	projectID string,
	chapterID string,
) (*database.StoryHarnessBatch, error) {
	ctx := context.Background()
	projectID = strings.TrimSpace(projectID)
	chapterID = strings.TrimSpace(chapterID)
	if projectID == "" || chapterID == "" {
		return nil, nil
	}

	row, err := s.queries.GetLatestStoryHarnessBatch(ctx, sqlc.GetLatestStoryHarnessBatchParams{
		ProjectID: projectID,
		ChapterID: chapterID,
	})
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("查询 Story Harness 批次失败: %w", err)
	}

	batch := mapStoryHarnessBatch(row)
	return &batch, nil
}

func (s *StoryHarnessService) GetChapterContext(
	projectID string,
	chapterID string,
) (database.StoryHarnessChapterContext, error) {
	ctx := context.Background()
	projectID = strings.TrimSpace(projectID)
	chapterID = strings.TrimSpace(chapterID)
	if projectID == "" || chapterID == "" {
		return database.StoryHarnessChapterContext{}, errors.New("projectId 和 chapterId 不能为空")
	}
	if err := ensureProjectExists(ctx, s.queries, projectID); err != nil {
		return database.StoryHarnessChapterContext{}, err
	}
	chapter, err := s.getChapter(ctx, chapterID)
	if err != nil {
		return database.StoryHarnessChapterContext{}, err
	}
	if chapter.ProjectID != projectID {
		return database.StoryHarnessChapterContext{}, errors.New("章节不属于当前项目")
	}

	characters, err := s.queries.ListCharactersByProject(ctx, projectID)
	if err != nil {
		return database.StoryHarnessChapterContext{}, fmt.Errorf("查询角色上下文失败: %w", err)
	}
	relations, err := s.queries.ListCharacterRelationsByProject(ctx, projectID)
	if err != nil {
		return database.StoryHarnessChapterContext{}, fmt.Errorf("查询关系上下文失败: %w", err)
	}
	pendingCRs, err := s.queries.CountStoryHarnessChangeRequestsByChapterAndStatus(
		ctx,
		sqlc.CountStoryHarnessChangeRequestsByChapterAndStatusParams{
			ChapterID: chapterID,
			Status:    "pending",
		},
	)
	if err != nil {
		return database.StoryHarnessChapterContext{}, fmt.Errorf("查询待处理建议数量失败: %w", err)
	}

	characterContext := make([]database.StoryHarnessCharacterContext, 0, len(characters))
	characterNameByID := make(map[string]string, len(characters))
	for _, item := range characters {
		characterNameByID[item.ID] = item.Name
		characterContext = append(characterContext, database.StoryHarnessCharacterContext{
			ID:               item.ID,
			Name:             item.Name,
			Alias:            unmarshalStringSlice(item.AliasJson),
			Traits:           unmarshalStringSlice(item.TraitsJson),
			CurrentState:     item.CurrentState,
			ShortDescription: item.Summary,
			AvatarURL:        item.AvatarUrl,
		})
	}

	relationContext := make([]database.StoryHarnessRelationContext, 0, len(relations))
	for _, item := range relations {
		relationContext = append(relationContext, database.StoryHarnessRelationContext{
			ID:       item.ID,
			FromID:   item.FromID,
			ToID:     item.ToID,
			FromName: characterNameByID[item.FromID],
			ToName:   characterNameByID[item.ToID],
			Type:     item.Type,
			Strength: int(item.Strength),
			Notes:    item.Notes,
		})
	}

	return database.StoryHarnessChapterContext{
		Characters: characterContext,
		Relations:  relationContext,
		PendingCRs: int(pendingCRs),
	}, nil
}

func (s *StoryHarnessService) ListChangeRequests(
	projectID string,
	chapterID string,
	status string,
) ([]database.StoryHarnessChangeRequest, error) {
	ctx := context.Background()
	projectID = strings.TrimSpace(projectID)
	chapterID = strings.TrimSpace(chapterID)
	if projectID == "" || chapterID == "" {
		return nil, errors.New("projectId 和 chapterId 不能为空")
	}
	if err := ensureProjectExists(ctx, s.queries, projectID); err != nil {
		return nil, err
	}
	chapter, err := s.getChapter(ctx, chapterID)
	if err != nil {
		return nil, err
	}
	if chapter.ProjectID != projectID {
		return nil, errors.New("章节不属于当前项目")
	}

	rows, err := s.queries.ListStoryHarnessChangeRequestsByChapterAndStatus(
		ctx,
		sqlc.ListStoryHarnessChangeRequestsByChapterAndStatusParams{
			ChapterID: chapterID,
			Status:    normalizeStoryHarnessStatus(status),
		},
	)
	if err != nil {
		return nil, fmt.Errorf("查询 Story Harness 变更建议失败: %w", err)
	}

	items := make([]database.StoryHarnessChangeRequest, 0, len(rows))
	for _, row := range rows {
		items = append(items, mapStoryHarnessChangeRequest(row))
	}
	return items, nil
}

func (s *StoryHarnessService) ProcessChangeRequest(
	requestID string,
	update database.StoryHarnessChangeRequestStatusUpdate,
) (database.StoryHarnessChangeRequest, error) {
	status := normalizeStoryHarnessStatus(update.Status)
	rowsAffected, err := s.queries.UpdateStoryHarnessChangeRequestStatus(
		context.Background(),
		sqlc.UpdateStoryHarnessChangeRequestStatusParams{
			ID:     strings.TrimSpace(requestID),
			Status: status,
		},
	)
	if err != nil {
		return database.StoryHarnessChangeRequest{}, fmt.Errorf("处理 Story Harness 变更建议失败: %w", err)
	}
	if rowsAffected == 0 {
		return database.StoryHarnessChangeRequest{}, errors.New("Story Harness 变更建议不存在")
	}
	return s.getChangeRequest(strings.TrimSpace(requestID))
}

func (s *StoryHarnessService) TriggerIndex(
	projectID string,
	chapterID string,
) (database.StoryHarnessTriggerIndexResult, error) {
	ctx := context.Background()
	projectID = strings.TrimSpace(projectID)
	chapterID = strings.TrimSpace(chapterID)
	if projectID == "" || chapterID == "" {
		return database.StoryHarnessTriggerIndexResult{}, errors.New("projectId 和 chapterId 不能为空")
	}
	chapter, err := s.getChapter(ctx, chapterID)
	if err != nil {
		return database.StoryHarnessTriggerIndexResult{}, err
	}
	if chapter.ProjectID != projectID {
		return database.StoryHarnessTriggerIndexResult{}, errors.New("章节不属于当前项目")
	}
	contextPayload, err := s.GetChapterContext(projectID, chapterID)
	if err != nil {
		return database.StoryHarnessTriggerIndexResult{}, err
	}

	generated := buildLocalStoryHarnessSuggestions(chapter, contextPayload)
	existing, err := s.ListChangeRequests(projectID, chapterID, "pending")
	if err != nil {
		return database.StoryHarnessTriggerIndexResult{}, err
	}

	signatures := make(map[string]struct{}, len(existing))
	for _, item := range existing {
		signatures[buildStoryHarnessSignature(item.Category, item.Title, item.Description)] = struct{}{}
	}

	filtered := make([]database.StoryHarnessChangeRequestPreview, 0, len(generated))
	deduplicated := 0
	for _, item := range generated {
		signature := buildStoryHarnessSignature(item.Type, item.Title, item.Summary)
		if _, exists := signatures[signature]; exists {
			deduplicated++
			continue
		}
		signatures[signature] = struct{}{}
		filtered = append(filtered, item)
	}

	var batchID string
	if len(filtered) > 0 {
		batch, err := s.CreateBatch(database.CreateStoryHarnessBatchInput{
			ProjectID:      projectID,
			ChapterID:      chapterID,
			ChapterTitle:   chapter.Title,
			Source:         "local_index",
			ChangeRequests: filtered,
		})
		if err != nil {
			return database.StoryHarnessTriggerIndexResult{}, err
		}
		batchID = batch.BatchID
	}

	pending, err := s.queries.CountStoryHarnessChangeRequestsByChapterAndStatus(
		ctx,
		sqlc.CountStoryHarnessChangeRequestsByChapterAndStatusParams{
			ChapterID: chapterID,
			Status:    "pending",
		},
	)
	if err != nil {
		return database.StoryHarnessTriggerIndexResult{}, fmt.Errorf("查询待处理建议数量失败: %w", err)
	}

	return database.StoryHarnessTriggerIndexResult{
		BatchID:      batchID,
		Generated:    len(filtered),
		Pending:      int(pending),
		Deduplicated: deduplicated,
		Source:       "local_index",
	}, nil
}

func (s *StoryHarnessService) RebuildProjection(
	projectID string,
	chapterID string,
) (database.StoryHarnessRebuildProjectionResult, error) {
	ctx := context.Background()
	projectID = strings.TrimSpace(projectID)
	chapterID = strings.TrimSpace(chapterID)
	if projectID == "" || chapterID == "" {
		return database.StoryHarnessRebuildProjectionResult{}, errors.New("projectId 和 chapterId 不能为空")
	}
	chapter, err := s.getChapter(ctx, chapterID)
	if err != nil {
		return database.StoryHarnessRebuildProjectionResult{}, err
	}
	if chapter.ProjectID != projectID {
		return database.StoryHarnessRebuildProjectionResult{}, errors.New("章节不属于当前项目")
	}

	acceptedCount, err := s.queries.CountStoryHarnessChangeRequestsByChapterAndStatus(
		ctx,
		sqlc.CountStoryHarnessChangeRequestsByChapterAndStatusParams{
			ChapterID: chapterID,
			Status:    "accepted",
		},
	)
	if err != nil {
		return database.StoryHarnessRebuildProjectionResult{}, fmt.Errorf("查询已接受建议数量失败: %w", err)
	}

	lastRequestID, err := s.queries.GetLatestAcceptedStoryHarnessChangeRequestID(ctx, chapterID)
	if errors.Is(err, sql.ErrNoRows) {
		lastRequestID = ""
	} else if err != nil {
		return database.StoryHarnessRebuildProjectionResult{}, fmt.Errorf("查询最后一条已接受建议失败: %w", err)
	}

	return database.StoryHarnessRebuildProjectionResult{
		ProjectID:     projectID,
		ChapterID:     chapterID,
		ReplayedCount: int(acceptedCount),
		LastRequestID: strings.TrimSpace(lastRequestID),
	}, nil
}

func (s *StoryHarnessService) getChapter(
	ctx context.Context,
	chapterID string,
) (sqlc.GetChapterByIDRow, error) {
	row, err := s.queries.GetChapterByID(ctx, strings.TrimSpace(chapterID))
	if errors.Is(err, sql.ErrNoRows) {
		return sqlc.GetChapterByIDRow{}, errors.New("章节不存在")
	}
	if err != nil {
		return sqlc.GetChapterByIDRow{}, fmt.Errorf("查询章节失败: %w", err)
	}
	return row, nil
}

func (s *StoryHarnessService) getChangeRequest(
	requestID string,
) (database.StoryHarnessChangeRequest, error) {
	row, err := s.queries.GetStoryHarnessChangeRequestByID(context.Background(), requestID)
	if errors.Is(err, sql.ErrNoRows) {
		return database.StoryHarnessChangeRequest{}, errors.New("Story Harness 变更建议不存在")
	}
	if err != nil {
		return database.StoryHarnessChangeRequest{}, fmt.Errorf("查询 Story Harness 变更建议失败: %w", err)
	}
	return mapStoryHarnessChangeRequest(row), nil
}

func mapStoryHarnessBatch(row sqlc.StoryHarnessBatch) database.StoryHarnessBatch {
	return database.StoryHarnessBatch{
		BatchID:        row.BatchID,
		ProjectID:      row.ProjectID,
		ChapterID:      row.ChapterID,
		ChapterTitle:   row.ChapterTitle,
		CommittedAt:    row.CommittedAt,
		Source:         row.Source,
		ChangeRequests: unmarshalStoryHarnessPreviewList(row.ChangeRequestsJson),
	}
}

func mapStoryHarnessChangeRequest(row sqlc.StoryHarnessChangeRequest) database.StoryHarnessChangeRequest {
	return database.StoryHarnessChangeRequest{
		ID:              row.ID,
		BatchID:         row.BatchID,
		ProjectID:       row.ProjectID,
		ChapterID:       row.ChapterID,
		Category:        row.Category,
		Priority:        row.Priority,
		Status:          row.Status,
		Title:           row.Title,
		Description:     row.Description,
		SuggestedChange: unmarshalJSONObject(row.SuggestedChangeJson),
		Evidence:        unmarshalStoryHarnessEvidence(row.EvidenceJson),
		Source:          row.Source,
		CreatedAt:       formatSQLiteTime(row.CreatedAt),
		UpdatedAt:       formatSQLiteTime(row.UpdatedAt),
	}
}

func buildLocalStoryHarnessSuggestions(
	chapter sqlc.GetChapterByIDRow,
	context database.StoryHarnessChapterContext,
) []database.StoryHarnessChangeRequestPreview {
	suggestions := make([]database.StoryHarnessChangeRequestPreview, 0, 4)
	wordCount := int(chapter.WordCount)
	plainText := strings.TrimSpace(chapter.PlainText)

	if plainText == "" {
		suggestions = append(suggestions, database.StoryHarnessChangeRequestPreview{
			Type:     "scene_scope",
			Title:    "正文尚未落笔",
			Summary:  "当前章节还没有可分析的正文内容，建议先补齐起笔场景。",
			Reason:   "缺少正文会导致角色状态、关系推进和节奏判断无法建立基线。",
			Severity: "focus",
			Evidence: "当前章节正文为空。",
		})
	}
	if wordCount > 0 && wordCount < 300 {
		suggestions = append(suggestions, database.StoryHarnessChangeRequestPreview{
			Type:     "scene_scope",
			Title:    "章节推进偏短",
			Summary:  "当前章节字数较短，建议补一段目标动作或冲突推进。",
			Reason:   "字数偏短时，结构节拍通常还没形成稳定的起承转合。",
			Severity: "hint",
			Evidence: fmt.Sprintf("当前章节约 %d 字。", wordCount),
		})
	}
	if len(context.Characters) == 0 {
		suggestions = append(suggestions, database.StoryHarnessChangeRequestPreview{
			Type:     "state",
			Title:    "角色资产尚未接入",
			Summary:  "当前项目还没有角色信息，建议先补至少 1 个关键角色。",
			Reason:   "缺少角色资产会削弱人物状态和关系建议的可信度。",
			Severity: "focus",
			Evidence: "角色列表为空。",
		})
	}
	if len(context.Characters) > 1 && len(context.Relations) == 0 {
		suggestions = append(suggestions, database.StoryHarnessChangeRequestPreview{
			Type:     "relation",
			Title:    "角色关系尚未成图",
			Summary:  "项目已有多个角色，但还没有关系边，建议补关系强弱和冲突方向。",
			Reason:   "关系图为空时，章节中的互动变化无法挂到明确关系线上。",
			Severity: "hint",
			Evidence: fmt.Sprintf("当前角色数 %d，关系数 0。", len(context.Characters)),
		})
	}

	return normalizeStoryHarnessPreviewList(suggestions, "local_index", time.Now().UnixMilli())
}

func buildStoryHarnessEvidenceFromPreview(
	chapterID string,
	evidence string,
) []database.StoryHarnessEvidence {
	evidence = strings.TrimSpace(evidence)
	if evidence == "" {
		return []database.StoryHarnessEvidence{}
	}
	return []database.StoryHarnessEvidence{
		{
			DocumentID:   chapterID,
			ParagraphIdx: 0,
			QuoteText:    evidence,
		},
	}
}

func normalizeStoryHarnessPreviewList(
	items []database.StoryHarnessChangeRequestPreview,
	source string,
	sourceTimestamp int64,
) []database.StoryHarnessChangeRequestPreview {
	normalized := make([]database.StoryHarnessChangeRequestPreview, 0, len(items))
	for _, item := range items {
		changeRequest := database.StoryHarnessChangeRequestPreview{
			ID:       strings.TrimSpace(item.ID),
			Source:   firstNonEmptyString(strings.TrimSpace(item.Source), source),
			Type:     normalizeStoryHarnessCategory(item.Type),
			Title:    firstNonEmptyString(strings.TrimSpace(item.Title), "正文指令建议"),
			Summary:  strings.TrimSpace(item.Summary),
			Reason:   strings.TrimSpace(item.Reason),
			Evidence: strings.TrimSpace(item.Evidence),
			Severity: normalizeStoryHarnessSeverity(item.Severity),
		}
		if changeRequest.ID == "" {
			changeRequest.ID = uuid.NewString()
		}
		if item.SourceTimestamp != nil && *item.SourceTimestamp > 0 {
			timestamp := *item.SourceTimestamp
			changeRequest.SourceTimestamp = &timestamp
		} else if sourceTimestamp > 0 {
			timestamp := sourceTimestamp
			changeRequest.SourceTimestamp = &timestamp
		}
		normalized = append(normalized, changeRequest)
	}
	return normalized
}

func normalizeStoryHarnessCategory(value string) string {
	switch strings.TrimSpace(value) {
	case "relation", "state":
		return strings.TrimSpace(value)
	default:
		return "scene_scope"
	}
}

func normalizeStoryHarnessPriority(value string) string {
	switch strings.TrimSpace(value) {
	case "critical", "high", "medium", "low":
		return strings.TrimSpace(value)
	default:
		if normalizeStoryHarnessSeverity(value) == "focus" {
			return "high"
		}
		return "medium"
	}
}

func normalizeStoryHarnessSeverity(value string) string {
	if strings.TrimSpace(value) == "focus" {
		return "focus"
	}
	return "hint"
}

func normalizeStoryHarnessStatus(value string) string {
	switch strings.TrimSpace(value) {
	case "accepted", "ignored", "deferred":
		return strings.TrimSpace(value)
	default:
		return "pending"
	}
}

func normalizeStoryHarnessSource(value string) string {
	if strings.TrimSpace(value) == "" {
		return "save_batch"
	}
	return strings.TrimSpace(value)
}

func marshalStoryHarnessPreviewList(
	items []database.StoryHarnessChangeRequestPreview,
) (string, error) {
	if items == nil {
		items = []database.StoryHarnessChangeRequestPreview{}
	}
	payload, err := json.Marshal(items)
	if err != nil {
		return "", fmt.Errorf("序列化 Story Harness 批次失败: %w", err)
	}
	return string(payload), nil
}

func unmarshalStoryHarnessPreviewList(
	payload string,
) []database.StoryHarnessChangeRequestPreview {
	if strings.TrimSpace(payload) == "" {
		return []database.StoryHarnessChangeRequestPreview{}
	}
	var items []database.StoryHarnessChangeRequestPreview
	if err := json.Unmarshal([]byte(payload), &items); err != nil {
		return []database.StoryHarnessChangeRequestPreview{}
	}
	return items
}

func marshalStoryHarnessEvidence(
	items []database.StoryHarnessEvidence,
) (string, error) {
	if items == nil {
		items = []database.StoryHarnessEvidence{}
	}
	payload, err := json.Marshal(items)
	if err != nil {
		return "", fmt.Errorf("序列化 Story Harness 证据失败: %w", err)
	}
	return string(payload), nil
}

func unmarshalStoryHarnessEvidence(payload string) []database.StoryHarnessEvidence {
	if strings.TrimSpace(payload) == "" {
		return []database.StoryHarnessEvidence{}
	}
	var items []database.StoryHarnessEvidence
	if err := json.Unmarshal([]byte(payload), &items); err != nil {
		return []database.StoryHarnessEvidence{}
	}
	return items
}

func buildStoryHarnessSignature(category string, title string, description string) string {
	return strings.ToLower(strings.TrimSpace(category) + "|" + strings.TrimSpace(title) + "|" + strings.TrimSpace(description))
}

func firstNonEmptyString(values ...string) string {
	for _, value := range values {
		if strings.TrimSpace(value) != "" {
			return strings.TrimSpace(value)
		}
	}
	return ""
}
