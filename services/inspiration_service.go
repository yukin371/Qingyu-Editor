package services

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"

	"Qingyu-Editor/database"
	"Qingyu-Editor/database/sqlc"

	"github.com/google/uuid"
)

type InspirationService struct {
	db      *sql.DB
	queries *sqlc.Queries
}

func NewInspirationService(db *sql.DB) *InspirationService {
	return &InspirationService{
		db:      db,
		queries: sqlc.New(db),
	}
}

func (s *InspirationService) List(projectID string) ([]database.InspirationNote, error) {
	ctx := context.Background()
	projectID = strings.TrimSpace(projectID)
	if projectID == "" {
		return nil, errors.New("projectId 不能为空")
	}
	if err := ensureProjectExists(ctx, s.queries, projectID); err != nil {
		return nil, err
	}

	rows, err := s.queries.ListInspirationNotesByProject(ctx, projectID)
	if err != nil {
		return nil, fmt.Errorf("查询灵感记录失败: %w", err)
	}

	items := make([]database.InspirationNote, 0, len(rows))
	for _, row := range rows {
		items = append(items, database.InspirationNote{
			ID:           row.ID,
			ProjectID:    row.ProjectID,
			ChapterID:    row.ChapterID,
			ChapterTitle: row.ChapterTitle,
			Title:        row.Title,
			Content:      row.Content,
			CreatedAt:    formatSQLiteTime(row.CreatedAt),
			UpdatedAt:    formatSQLiteTime(row.UpdatedAt),
		})
	}
	return items, nil
}

func (s *InspirationService) Create(
	input database.CreateInspirationNoteInput,
) (database.InspirationNote, error) {
	ctx := context.Background()
	projectID := strings.TrimSpace(input.ProjectID)
	if projectID == "" {
		return database.InspirationNote{}, errors.New("projectId 不能为空")
	}
	if err := ensureProjectExists(ctx, s.queries, projectID); err != nil {
		return database.InspirationNote{}, err
	}
	if err := ensureChapterMatchesProject(ctx, s.queries, projectID, input.ChapterID); err != nil {
		return database.InspirationNote{}, err
	}

	title := strings.TrimSpace(input.Title)
	content := strings.TrimSpace(input.Content)
	if title == "" {
		title = "未命名灵感"
	}
	if content == "" {
		return database.InspirationNote{}, errors.New("灵感内容不能为空")
	}

	id := uuid.NewString()
	if err := s.queries.CreateInspirationNote(ctx, sqlc.CreateInspirationNoteParams{
		ID:           id,
		ProjectID:    projectID,
		ChapterID:    toOptionalNullString(input.ChapterID),
		ChapterTitle: strings.TrimSpace(input.ChapterTitle),
		Title:        title,
		Content:      content,
	}); err != nil {
		return database.InspirationNote{}, fmt.Errorf("创建灵感记录失败: %w", err)
	}

	items, err := s.List(projectID)
	if err != nil {
		return database.InspirationNote{}, err
	}
	for _, item := range items {
		if item.ID == id {
			return item, nil
		}
	}
	return database.InspirationNote{}, errors.New("灵感记录创建成功但未找到记录")
}

func (s *InspirationService) Delete(id string) error {
	rowsAffected, err := s.queries.DeleteInspirationNoteByID(context.Background(), strings.TrimSpace(id))
	if err != nil {
		return fmt.Errorf("删除灵感记录失败: %w", err)
	}
	if rowsAffected == 0 {
		return errors.New("灵感记录不存在")
	}
	return nil
}

func ensureChapterMatchesProject(
	ctx context.Context,
	queries *sqlc.Queries,
	projectID string,
	chapterID string,
) error {
	chapterID = strings.TrimSpace(chapterID)
	if chapterID == "" {
		return nil
	}
	row, err := queries.GetChapterByID(ctx, chapterID)
	if errors.Is(err, sql.ErrNoRows) {
		return errors.New("章节不存在")
	}
	if err != nil {
		return fmt.Errorf("查询章节失败: %w", err)
	}
	if row.ProjectID != projectID {
		return errors.New("章节不属于当前项目")
	}
	return nil
}
