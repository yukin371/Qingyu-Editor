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

type ProjectService struct {
	db      *sql.DB
	queries *sqlc.Queries
}

func NewProjectService(db *sql.DB) *ProjectService {
	return &ProjectService{
		db:      db,
		queries: sqlc.New(db),
	}
}

func (s *ProjectService) Create(input database.CreateProjectInput) (database.Project, error) {
	ctx := context.Background()
	title := strings.TrimSpace(input.Title)
	if title == "" {
		return database.Project{}, errors.New("项目标题不能为空")
	}

	status := strings.TrimSpace(input.Status)
	if status == "" {
		status = "draft"
	}

	projectID := uuid.NewString()
	err := s.queries.CreateProject(ctx, sqlc.CreateProjectParams{
		ID:          projectID,
		Title:       title,
		Description: toNullString(input.Description),
		CoverPath:   toNullString(input.CoverPath),
		Status:      toNullString(status),
	})
	if err != nil {
		return database.Project{}, fmt.Errorf("创建项目失败: %w", err)
	}

	return s.Get(projectID)
}

func (s *ProjectService) Get(id string) (database.Project, error) {
	row, err := s.queries.GetProject(context.Background(), id)
	if errors.Is(err, sql.ErrNoRows) {
		return database.Project{}, errors.New("项目不存在")
	}
	if err != nil {
		return database.Project{}, fmt.Errorf("查询项目失败: %w", err)
	}
	return mapProject(row), nil
}

func (s *ProjectService) List() ([]database.Project, error) {
	rows, err := s.queries.ListProjects(context.Background())
	if err != nil {
		return nil, fmt.Errorf("查询项目列表失败: %w", err)
	}

	projects := make([]database.Project, 0, len(rows))
	for _, row := range rows {
		projects = append(projects, mapProjectList(row))
	}
	return projects, nil
}

func (s *ProjectService) Update(id string, update database.ProjectUpdate) (database.Project, error) {
	current, err := s.Get(id)
	if err != nil {
		return database.Project{}, err
	}

	next := current
	if update.Title != nil {
		title := strings.TrimSpace(*update.Title)
		if title == "" {
			return database.Project{}, errors.New("项目标题不能为空")
		}
		next.Title = title
	}
	if update.Description != nil {
		next.Description = strings.TrimSpace(*update.Description)
	}
	if update.CoverPath != nil {
		next.CoverPath = strings.TrimSpace(*update.CoverPath)
	}
	if update.Status != nil {
		status := strings.TrimSpace(*update.Status)
		if status == "" {
			status = "draft"
		}
		next.Status = status
	}

	rowsAffected, err := s.queries.UpdateProjectByID(context.Background(), sqlc.UpdateProjectByIDParams{
		Title:       next.Title,
		Description: toNullString(next.Description),
		CoverPath:   toNullString(next.CoverPath),
		Status:      toNullString(next.Status),
		ID:          id,
	})
	if err != nil {
		return database.Project{}, fmt.Errorf("更新项目失败: %w", err)
	}
	if rowsAffected == 0 {
		return database.Project{}, errors.New("项目不存在")
	}

	return s.Get(id)
}

func (s *ProjectService) Delete(id string) error {
	rowsAffected, err := s.queries.DeleteProjectByID(context.Background(), id)
	if err != nil {
		return fmt.Errorf("删除项目失败: %w", err)
	}
	if rowsAffected == 0 {
		return errors.New("项目不存在")
	}
	return nil
}

func mapProject(row sqlc.GetProjectRow) database.Project {
	return database.Project{
		ID:           row.ID,
		Title:        row.Title,
		Description:  row.Description,
		CoverPath:    row.CoverPath,
		WordCount:    int(row.WordCount),
		Status:       row.Status,
		ChapterCount: int(row.ChapterCount),
		CreatedAt:    formatSQLiteTime(row.CreatedAt),
		UpdatedAt:    formatSQLiteTime(row.UpdatedAt),
	}
}

func mapProjectList(row sqlc.ListProjectsRow) database.Project {
	return database.Project{
		ID:           row.ID,
		Title:        row.Title,
		Description:  row.Description,
		CoverPath:    row.CoverPath,
		WordCount:    int(row.WordCount),
		Status:       row.Status,
		ChapterCount: int(row.ChapterCount),
		CreatedAt:    formatSQLiteTime(row.CreatedAt),
		UpdatedAt:    formatSQLiteTime(row.UpdatedAt),
	}
}
