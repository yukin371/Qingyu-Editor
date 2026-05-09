package services

import (
	"database/sql"
	"errors"
	"fmt"
	"strings"

	"Qingyu-Editor/database"

	"github.com/google/uuid"
)

type ProjectService struct {
	db *sql.DB
}

func NewProjectService(db *sql.DB) *ProjectService {
	return &ProjectService{db: db}
}

func (s *ProjectService) Create(input database.CreateProjectInput) (database.Project, error) {
	title := strings.TrimSpace(input.Title)
	if title == "" {
		return database.Project{}, errors.New("项目标题不能为空")
	}

	status := strings.TrimSpace(input.Status)
	if status == "" {
		status = "draft"
	}

	projectID := uuid.NewString()
	_, err := s.db.Exec(
		`INSERT INTO projects (id, title, description, cover_path, status) VALUES (?, ?, ?, ?, ?)`,
		projectID,
		title,
		strings.TrimSpace(input.Description),
		strings.TrimSpace(input.CoverPath),
		status,
	)
	if err != nil {
		return database.Project{}, fmt.Errorf("创建项目失败: %w", err)
	}

	return s.Get(projectID)
}

func (s *ProjectService) Get(id string) (database.Project, error) {
	const query = `
	SELECT
		p.id,
		p.title,
		COALESCE(p.description, ''),
		COALESCE(p.cover_path, ''),
		COALESCE(p.word_count, 0),
		COALESCE(p.status, 'draft'),
		COALESCE(COUNT(c.id), 0) AS chapter_count,
		COALESCE(p.created_at, ''),
		COALESCE(p.updated_at, '')
	FROM projects p
	LEFT JOIN chapters c ON c.project_id = p.id
	WHERE p.id = ?
	GROUP BY p.id, p.title, p.description, p.cover_path, p.word_count, p.status, p.created_at, p.updated_at
	`

	var project database.Project
	err := s.db.QueryRow(query, id).Scan(
		&project.ID,
		&project.Title,
		&project.Description,
		&project.CoverPath,
		&project.WordCount,
		&project.Status,
		&project.ChapterCount,
		&project.CreatedAt,
		&project.UpdatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return database.Project{}, errors.New("项目不存在")
	}
	if err != nil {
		return database.Project{}, fmt.Errorf("查询项目失败: %w", err)
	}

	return project, nil
}

func (s *ProjectService) List() ([]database.Project, error) {
	const query = `
	SELECT
		p.id,
		p.title,
		COALESCE(p.description, ''),
		COALESCE(p.cover_path, ''),
		COALESCE(p.word_count, 0),
		COALESCE(p.status, 'draft'),
		COALESCE(COUNT(c.id), 0) AS chapter_count,
		COALESCE(p.created_at, ''),
		COALESCE(p.updated_at, '')
	FROM projects p
	LEFT JOIN chapters c ON c.project_id = p.id
	GROUP BY p.id, p.title, p.description, p.cover_path, p.word_count, p.status, p.created_at, p.updated_at
	ORDER BY p.updated_at DESC, p.created_at DESC
	`

	rows, err := s.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("查询项目列表失败: %w", err)
	}
	defer rows.Close()

	projects := make([]database.Project, 0)
	for rows.Next() {
		var project database.Project
		if err := rows.Scan(
			&project.ID,
			&project.Title,
			&project.Description,
			&project.CoverPath,
			&project.WordCount,
			&project.Status,
			&project.ChapterCount,
			&project.CreatedAt,
			&project.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("扫描项目失败: %w", err)
		}
		projects = append(projects, project)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("读取项目列表失败: %w", err)
	}

	return projects, nil
}

func (s *ProjectService) Update(id string, update database.ProjectUpdate) (database.Project, error) {
	sets := make([]string, 0, 4)
	args := make([]any, 0, 5)

	if update.Title != nil {
		title := strings.TrimSpace(*update.Title)
		if title == "" {
			return database.Project{}, errors.New("项目标题不能为空")
		}
		sets = append(sets, "title = ?")
		args = append(args, title)
	}
	if update.Description != nil {
		sets = append(sets, "description = ?")
		args = append(args, strings.TrimSpace(*update.Description))
	}
	if update.CoverPath != nil {
		sets = append(sets, "cover_path = ?")
		args = append(args, strings.TrimSpace(*update.CoverPath))
	}
	if update.Status != nil {
		status := strings.TrimSpace(*update.Status)
		if status == "" {
			status = "draft"
		}
		sets = append(sets, "status = ?")
		args = append(args, status)
	}

	if len(sets) == 0 {
		return s.Get(id)
	}

	sets = append(sets, "updated_at = CURRENT_TIMESTAMP")
	args = append(args, id)

	query := fmt.Sprintf("UPDATE projects SET %s WHERE id = ?", strings.Join(sets, ", "))
	result, err := s.db.Exec(query, args...)
	if err != nil {
		return database.Project{}, fmt.Errorf("更新项目失败: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return database.Project{}, fmt.Errorf("确认项目更新结果失败: %w", err)
	}
	if rowsAffected == 0 {
		return database.Project{}, errors.New("项目不存在")
	}

	return s.Get(id)
}

func (s *ProjectService) Delete(id string) error {
	result, err := s.db.Exec(`DELETE FROM projects WHERE id = ?`, id)
	if err != nil {
		return fmt.Errorf("删除项目失败: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("确认项目删除结果失败: %w", err)
	}
	if rowsAffected == 0 {
		return errors.New("项目不存在")
	}

	return nil
}
