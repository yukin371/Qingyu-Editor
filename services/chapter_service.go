package services

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"strings"

	"Qingyu-Editor/database"
	"Qingyu-Editor/database/sqlc"

	"github.com/google/uuid"
)

type ChapterService struct {
	db      *sql.DB
	queries *sqlc.Queries
}

func NewChapterService(db *sql.DB) *ChapterService {
	return &ChapterService{
		db:      db,
		queries: sqlc.New(db),
	}
}

func (s *ChapterService) Create(input database.CreateChapterInput) (database.Chapter, error) {
	ctx := context.Background()
	projectID := strings.TrimSpace(input.ProjectID)
	title := strings.TrimSpace(input.Title)
	if projectID == "" {
		return database.Chapter{}, errors.New("projectId 不能为空")
	}
	if title == "" {
		return database.Chapter{}, errors.New("章节标题不能为空")
	}
	if err := ensureProjectExists(ctx, s.queries, projectID); err != nil {
		return database.Chapter{}, err
	}

	volumeID := normalizeOptionalString(input.VolumeID)
	if volumeID != "" {
		if err := s.ensureVolumeBelongsToProject(ctx, projectID, volumeID); err != nil {
			return database.Chapter{}, err
		}
	}

	sortOrder, err := s.resolveNextSortOrder(ctx, projectID, volumeID, input.SortOrder)
	if err != nil {
		return database.Chapter{}, err
	}

	content := strings.TrimSpace(input.Content)
	if content == "" {
		content = defaultChapterContent()
	}

	plainText := strings.TrimSpace(input.PlainText)
	if plainText == "" {
		plainText = extractPlainText(content)
	}

	wordCount := countWords(plainText)
	if input.WordCount != nil {
		wordCount = *input.WordCount
	}

	status := strings.TrimSpace(input.Status)
	if status == "" {
		status = "draft"
	}

	chapterID := uuid.NewString()
	err = s.queries.CreateChapter(ctx, sqlc.CreateChapterParams{
		ID:        chapterID,
		ProjectID: projectID,
		VolumeID:  toOptionalNullString(volumeID),
		Title:     title,
		Content:   content,
		PlainText: toOptionalNullString(plainText),
		WordCount: toNullInt64(wordCount),
		SortOrder: int64(sortOrder),
		Status:    toNullString(status),
	})
	if err != nil {
		return database.Chapter{}, fmt.Errorf("创建章节失败: %w", err)
	}

	if err := s.refreshProjectWordCount(ctx, projectID); err != nil {
		return database.Chapter{}, err
	}

	return s.Get(chapterID)
}

func (s *ChapterService) Get(id string) (database.Chapter, error) {
	row, err := s.queries.GetChapterByID(context.Background(), id)
	if errors.Is(err, sql.ErrNoRows) {
		return database.Chapter{}, errors.New("章节不存在")
	}
	if err != nil {
		return database.Chapter{}, fmt.Errorf("查询章节失败: %w", err)
	}
	return mapChapter(row), nil
}

func (s *ChapterService) List(projectID string) ([]database.Chapter, error) {
	rows, err := s.queries.ListChaptersByProject(context.Background(), projectID)
	if err != nil {
		return nil, fmt.Errorf("查询章节列表失败: %w", err)
	}

	chapters := make([]database.Chapter, 0, len(rows))
	for _, row := range rows {
		chapters = append(chapters, mapChapterList(row))
	}
	return chapters, nil
}

func (s *ChapterService) Update(id string, update database.ChapterUpdate) (database.Chapter, error) {
	ctx := context.Background()
	current, err := s.Get(id)
	if err != nil {
		return database.Chapter{}, err
	}

	next := current
	if update.Title != nil {
		title := strings.TrimSpace(*update.Title)
		if title == "" {
			return database.Chapter{}, errors.New("章节标题不能为空")
		}
		next.Title = title
	}

	if update.VolumeID != nil {
		next.VolumeID = normalizeOptionalString(*update.VolumeID)
		if next.VolumeID != "" {
			if err := s.ensureVolumeBelongsToProject(ctx, current.ProjectID, next.VolumeID); err != nil {
				return database.Chapter{}, err
			}
		}
	}

	if update.Content != nil {
		next.Content = *update.Content
	}
	if update.PlainText != nil {
		next.PlainText = *update.PlainText
	} else if update.Content != nil {
		next.PlainText = extractPlainText(next.Content)
	}

	if update.WordCount != nil {
		next.WordCount = *update.WordCount
	} else if update.Content != nil || update.PlainText != nil {
		next.WordCount = countWords(next.PlainText)
	}

	if update.SortOrder != nil {
		next.SortOrder = *update.SortOrder
	}

	if update.Status != nil {
		status := strings.TrimSpace(*update.Status)
		if status == "" {
			status = "draft"
		}
		next.Status = status
	}

	rowsAffected, err := s.queries.UpdateChapterByID(ctx, sqlc.UpdateChapterByIDParams{
		VolumeID:  toOptionalNullString(next.VolumeID),
		Title:     next.Title,
		Content:   next.Content,
		PlainText: toOptionalNullString(next.PlainText),
		WordCount: toNullInt64(next.WordCount),
		SortOrder: int64(next.SortOrder),
		Status:    toNullString(next.Status),
		ID:        id,
	})
	if err != nil {
		return database.Chapter{}, fmt.Errorf("更新章节失败: %w", err)
	}
	if rowsAffected == 0 {
		return database.Chapter{}, errors.New("章节不存在")
	}

	if err := s.refreshProjectWordCount(ctx, current.ProjectID); err != nil {
		return database.Chapter{}, err
	}

	return s.Get(id)
}

func (s *ChapterService) Delete(id string) error {
	ctx := context.Background()
	chapter, err := s.Get(id)
	if err != nil {
		return err
	}

	rowsAffected, err := s.queries.DeleteChapterByID(ctx, id)
	if err != nil {
		return fmt.Errorf("删除章节失败: %w", err)
	}
	if rowsAffected == 0 {
		return errors.New("章节不存在")
	}

	if err := s.refreshProjectWordCount(ctx, chapter.ProjectID); err != nil {
		return err
	}
	return nil
}

func (s *ChapterService) Reorder(input database.ReorderChaptersInput) error {
	if strings.TrimSpace(input.ProjectID) == "" {
		return errors.New("projectId 不能为空")
	}
	if len(input.OrderedIDs) == 0 {
		return nil
	}

	tx, err := s.db.Begin()
	if err != nil {
		return fmt.Errorf("创建章节排序事务失败: %w", err)
	}
	defer tx.Rollback()

	queries := s.queries.WithTx(tx)
	ctx := context.Background()
	for index, id := range input.OrderedIDs {
		if err := queries.ReorderChapterByProject(ctx, sqlc.ReorderChapterByProjectParams{
			SortOrder: int64(index),
			ID:        id,
			ProjectID: input.ProjectID,
		}); err != nil {
			return fmt.Errorf("更新章节排序失败: %w", err)
		}
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("提交章节排序事务失败: %w", err)
	}
	return nil
}

func (s *ChapterService) Move(input database.MoveChapterInput) error {
	ctx := context.Background()
	chapter, err := s.Get(input.ChapterID)
	if err != nil {
		return err
	}

	targetVolumeID := ""
	if input.TargetVolumeID != nil {
		targetVolumeID = normalizeOptionalString(*input.TargetVolumeID)
	}
	if targetVolumeID != "" {
		if err := s.ensureVolumeBelongsToProject(ctx, chapter.ProjectID, targetVolumeID); err != nil {
			return err
		}
	}

	oldVolumeID := normalizeOptionalString(chapter.VolumeID)
	if targetVolumeID == oldVolumeID {
		siblings, err := s.listChapterIDsByScope(ctx, s.queries, chapter.ProjectID, oldVolumeID, chapter.ID)
		if err != nil {
			return err
		}
		ordered := insertAt(siblings, chapter.ID, input.TargetIndex)
		return s.Reorder(database.ReorderChaptersInput{
			ProjectID:  chapter.ProjectID,
			VolumeID:   nullableStringPointer(oldVolumeID),
			OrderedIDs: ordered,
		})
	}

	tx, err := s.db.Begin()
	if err != nil {
		return fmt.Errorf("创建章节移动事务失败: %w", err)
	}
	defer tx.Rollback()

	queries := s.queries.WithTx(tx)
	oldScope, err := s.listChapterIDsByScope(ctx, queries, chapter.ProjectID, oldVolumeID, chapter.ID)
	if err != nil {
		return err
	}
	targetScope, err := s.listChapterIDsByScope(ctx, queries, chapter.ProjectID, targetVolumeID, chapter.ID)
	if err != nil {
		return err
	}

	if err := queries.UpdateChapterVolumeByID(ctx, sqlc.UpdateChapterVolumeByIDParams{
		VolumeID: toOptionalNullString(targetVolumeID),
		ID:       chapter.ID,
	}); err != nil {
		return fmt.Errorf("更新章节所属卷失败: %w", err)
	}

	if err := s.rewriteChapterScopeOrder(ctx, queries, oldScope); err != nil {
		return err
	}
	if err := s.rewriteChapterScopeOrder(ctx, queries, insertAt(targetScope, chapter.ID, input.TargetIndex)); err != nil {
		return err
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("提交章节移动事务失败: %w", err)
	}
	return nil
}

func (s *ChapterService) resolveNextSortOrder(ctx context.Context, projectID string, volumeID string, candidate *int) (int, error) {
	if candidate != nil {
		return *candidate, nil
	}

	if volumeID == "" {
		next, err := s.queries.NextRootChapterSortOrder(ctx, projectID)
		if err != nil {
			return 0, fmt.Errorf("计算章节排序失败: %w", err)
		}
		return int(next), nil
	}

	next, err := s.queries.NextVolumeChapterSortOrder(ctx, sqlc.NextVolumeChapterSortOrderParams{
		ProjectID: projectID,
		VolumeID:  toOptionalNullString(volumeID),
	})
	if err != nil {
		return 0, fmt.Errorf("计算章节排序失败: %w", err)
	}
	return int(next), nil
}

func (s *ChapterService) ensureVolumeBelongsToProject(ctx context.Context, projectID string, volumeID string) error {
	exists, err := s.queries.VolumeExistsInProject(ctx, sqlc.VolumeExistsInProjectParams{
		ID:        volumeID,
		ProjectID: projectID,
	})
	if err != nil {
		return fmt.Errorf("查询卷失败: %w", err)
	}
	if exists == 0 {
		return errors.New("卷不存在")
	}
	return nil
}

func (s *ChapterService) refreshProjectWordCount(ctx context.Context, projectID string) error {
	err := s.queries.RefreshProjectWordCount(ctx, sqlc.RefreshProjectWordCountParams{
		ProjectID: projectID,
		ID:        projectID,
	})
	if err != nil {
		return fmt.Errorf("刷新项目字数失败: %w", err)
	}
	return nil
}

func (s *ChapterService) listChapterIDsByScope(ctx context.Context, queries *sqlc.Queries, projectID string, volumeID string, excludeID string) ([]string, error) {
	if volumeID == "" {
		ids, err := queries.ListRootChapterIDsByScope(ctx, sqlc.ListRootChapterIDsByScopeParams{
			ProjectID: projectID,
			ID:        excludeID,
		})
		if err != nil {
			return nil, fmt.Errorf("查询根章节失败: %w", err)
		}
		return ids, nil
	}

	ids, err := queries.ListVolumeChapterIDsByScope(ctx, sqlc.ListVolumeChapterIDsByScopeParams{
		ProjectID: projectID,
		VolumeID:  toOptionalNullString(volumeID),
		ID:        excludeID,
	})
	if err != nil {
		return nil, fmt.Errorf("查询卷内章节失败: %w", err)
	}
	return ids, nil
}

func (s *ChapterService) rewriteChapterScopeOrder(ctx context.Context, queries *sqlc.Queries, orderedIDs []string) error {
	for index, id := range orderedIDs {
		if err := queries.ReorderChapterByID(ctx, sqlc.ReorderChapterByIDParams{
			SortOrder: int64(index),
			ID:        id,
		}); err != nil {
			return fmt.Errorf("重写章节排序失败: %w", err)
		}
	}
	return nil
}

func mapChapter(row sqlc.GetChapterByIDRow) database.Chapter {
	return database.Chapter{
		ID:        row.ID,
		ProjectID: row.ProjectID,
		VolumeID:  row.VolumeID,
		Title:     row.Title,
		Content:   row.Content,
		PlainText: row.PlainText,
		WordCount: int(row.WordCount),
		SortOrder: int(row.SortOrder),
		Status:    row.Status,
		CreatedAt: formatSQLiteTime(row.CreatedAt),
		UpdatedAt: formatSQLiteTime(row.UpdatedAt),
	}
}

func mapChapterList(row sqlc.ListChaptersByProjectRow) database.Chapter {
	return database.Chapter{
		ID:        row.ID,
		ProjectID: row.ProjectID,
		VolumeID:  row.VolumeID,
		Title:     row.Title,
		Content:   row.Content,
		PlainText: row.PlainText,
		WordCount: int(row.WordCount),
		SortOrder: int(row.SortOrder),
		Status:    row.Status,
		CreatedAt: formatSQLiteTime(row.CreatedAt),
		UpdatedAt: formatSQLiteTime(row.UpdatedAt),
	}
}

func defaultChapterContent() string {
	return `{"type":"doc","content":[]}`
}

func extractPlainText(content string) string {
	var payload struct {
		Content []struct {
			Type    string `json:"type"`
			Text    string `json:"text"`
			Content []struct {
				Type    string `json:"type"`
				Text    string `json:"text"`
				Content []struct {
					Type string `json:"type"`
					Text string `json:"text"`
				} `json:"content"`
			} `json:"content"`
		} `json:"content"`
	}

	if err := json.Unmarshal([]byte(content), &payload); err != nil {
		return strings.TrimSpace(content)
	}

	parts := make([]string, 0)
	for _, node := range payload.Content {
		if node.Text != "" {
			parts = append(parts, node.Text)
		}
		for _, child := range node.Content {
			if child.Text != "" {
				parts = append(parts, child.Text)
			}
			for _, grandChild := range child.Content {
				if grandChild.Text != "" {
					parts = append(parts, grandChild.Text)
				}
			}
		}
	}

	return strings.TrimSpace(strings.Join(parts, " "))
}

func countWords(text string) int {
	trimmed := strings.TrimSpace(text)
	if trimmed == "" {
		return 0
	}

	fields := strings.Fields(trimmed)
	if len(fields) > 1 {
		return len(fields)
	}

	return len([]rune(strings.ReplaceAll(trimmed, " ", "")))
}

func normalizeOptionalString(value string) string {
	return strings.TrimSpace(value)
}

func nullableStringPointer(value string) *string {
	if strings.TrimSpace(value) == "" {
		return nil
	}
	result := value
	return &result
}

func insertAt(ids []string, targetID string, targetIndex int) []string {
	if targetIndex < 0 {
		targetIndex = 0
	}
	if targetIndex > len(ids) {
		targetIndex = len(ids)
	}

	result := make([]string, 0, len(ids)+1)
	result = append(result, ids[:targetIndex]...)
	result = append(result, targetID)
	result = append(result, ids[targetIndex:]...)
	return result
}
