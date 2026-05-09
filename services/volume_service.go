package services

import (
	"database/sql"
	"errors"
	"fmt"
	"strings"

	"Qingyu-Editor/database"

	"github.com/google/uuid"
)

type VolumeService struct {
	db *sql.DB
}

func NewVolumeService(db *sql.DB) *VolumeService {
	return &VolumeService{db: db}
}

func (s *VolumeService) Create(input database.CreateVolumeInput) (database.Volume, error) {
	projectID := strings.TrimSpace(input.ProjectID)
	title := strings.TrimSpace(input.Title)
	if projectID == "" {
		return database.Volume{}, errors.New("projectId 不能为空")
	}
	if title == "" {
		return database.Volume{}, errors.New("卷标题不能为空")
	}
	if err := ensureProjectExists(s.db, projectID); err != nil {
		return database.Volume{}, err
	}

	sortOrder, err := s.resolveNextSortOrder(projectID, input.SortOrder)
	if err != nil {
		return database.Volume{}, err
	}

	volumeID := uuid.NewString()
	_, err = s.db.Exec(
		`INSERT INTO volumes (id, project_id, title, sort_order) VALUES (?, ?, ?, ?)`,
		volumeID,
		projectID,
		title,
		sortOrder,
	)
	if err != nil {
		return database.Volume{}, fmt.Errorf("创建卷失败: %w", err)
	}

	volumes, err := s.List(projectID)
	if err != nil {
		return database.Volume{}, err
	}
	for _, volume := range volumes {
		if volume.ID == volumeID {
			return volume, nil
		}
	}

	return database.Volume{}, errors.New("卷创建后读取失败")
}

func (s *VolumeService) List(projectID string) ([]database.Volume, error) {
	rows, err := s.db.Query(
		`SELECT id, project_id, title, sort_order, COALESCE(created_at, '') FROM volumes WHERE project_id = ? ORDER BY sort_order ASC, created_at ASC`,
		projectID,
	)
	if err != nil {
		return nil, fmt.Errorf("查询卷列表失败: %w", err)
	}
	defer rows.Close()

	volumes := make([]database.Volume, 0)
	for rows.Next() {
		var volume database.Volume
		if err := rows.Scan(&volume.ID, &volume.ProjectID, &volume.Title, &volume.SortOrder, &volume.CreatedAt); err != nil {
			return nil, fmt.Errorf("扫描卷失败: %w", err)
		}
		volumes = append(volumes, volume)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("读取卷列表失败: %w", err)
	}

	return volumes, nil
}

func (s *VolumeService) Update(id string, update database.VolumeUpdate) error {
	sets := make([]string, 0, 2)
	args := make([]any, 0, 3)

	if update.Title != nil {
		title := strings.TrimSpace(*update.Title)
		if title == "" {
			return errors.New("卷标题不能为空")
		}
		sets = append(sets, "title = ?")
		args = append(args, title)
	}
	if update.SortOrder != nil {
		sets = append(sets, "sort_order = ?")
		args = append(args, *update.SortOrder)
	}

	if len(sets) == 0 {
		return nil
	}

	args = append(args, id)
	query := fmt.Sprintf("UPDATE volumes SET %s WHERE id = ?", strings.Join(sets, ", "))
	result, err := s.db.Exec(query, args...)
	if err != nil {
		return fmt.Errorf("更新卷失败: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("确认卷更新结果失败: %w", err)
	}
	if rowsAffected == 0 {
		return errors.New("卷不存在")
	}

	return nil
}

func (s *VolumeService) Delete(id string) error {
	result, err := s.db.Exec(`DELETE FROM volumes WHERE id = ?`, id)
	if err != nil {
		return fmt.Errorf("删除卷失败: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("确认卷删除结果失败: %w", err)
	}
	if rowsAffected == 0 {
		return errors.New("卷不存在")
	}

	return nil
}

func (s *VolumeService) Reorder(input database.ReorderVolumesInput) error {
	if strings.TrimSpace(input.ProjectID) == "" {
		return errors.New("projectId 不能为空")
	}
	if len(input.OrderedIDs) == 0 {
		return nil
	}

	tx, err := s.db.Begin()
	if err != nil {
		return fmt.Errorf("创建卷排序事务失败: %w", err)
	}
	defer tx.Rollback()

	for index, id := range input.OrderedIDs {
		if _, err := tx.Exec(
			`UPDATE volumes SET sort_order = ? WHERE id = ? AND project_id = ?`,
			index,
			id,
			input.ProjectID,
		); err != nil {
			return fmt.Errorf("更新卷排序失败: %w", err)
		}
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("提交卷排序事务失败: %w", err)
	}

	return nil
}

func (s *VolumeService) resolveNextSortOrder(projectID string, candidate *int) (int, error) {
	if candidate != nil {
		return *candidate, nil
	}

	var next int
	err := s.db.QueryRow(
		`SELECT COALESCE(MAX(sort_order), -1) + 1 FROM volumes WHERE project_id = ?`,
		projectID,
	).Scan(&next)
	if err != nil {
		return 0, fmt.Errorf("计算卷排序失败: %w", err)
	}

	return next, nil
}

func ensureProjectExists(db *sql.DB, projectID string) error {
	var exists int
	err := db.QueryRow(`SELECT 1 FROM projects WHERE id = ? LIMIT 1`, projectID).Scan(&exists)
	if errors.Is(err, sql.ErrNoRows) {
		return errors.New("项目不存在")
	}
	if err != nil {
		return fmt.Errorf("查询项目失败: %w", err)
	}
	return nil
}
