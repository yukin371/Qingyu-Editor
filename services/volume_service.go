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

type VolumeService struct {
	db      *sql.DB
	queries *sqlc.Queries
}

func NewVolumeService(db *sql.DB) *VolumeService {
	return &VolumeService{
		db:      db,
		queries: sqlc.New(db),
	}
}

func (s *VolumeService) Create(input database.CreateVolumeInput) (database.Volume, error) {
	ctx := context.Background()
	projectID := strings.TrimSpace(input.ProjectID)
	title := strings.TrimSpace(input.Title)
	if projectID == "" {
		return database.Volume{}, errors.New("projectId 不能为空")
	}
	if title == "" {
		return database.Volume{}, errors.New("卷标题不能为空")
	}
	if err := ensureProjectExists(ctx, s.queries, projectID); err != nil {
		return database.Volume{}, err
	}

	sortOrder, err := s.resolveNextSortOrder(ctx, projectID, input.SortOrder)
	if err != nil {
		return database.Volume{}, err
	}

	volumeID := uuid.NewString()
	err = s.queries.CreateVolume(ctx, sqlc.CreateVolumeParams{
		ID:        volumeID,
		ProjectID: projectID,
		Title:     title,
		SortOrder: int64(sortOrder),
	})
	if err != nil {
		return database.Volume{}, fmt.Errorf("创建卷失败: %w", err)
	}

	return s.get(volumeID)
}

func (s *VolumeService) List(projectID string) ([]database.Volume, error) {
	rows, err := s.queries.ListVolumesByProject(context.Background(), projectID)
	if err != nil {
		return nil, fmt.Errorf("查询卷列表失败: %w", err)
	}

	volumes := make([]database.Volume, 0, len(rows))
	for _, row := range rows {
		volumes = append(volumes, mapVolumeList(row))
	}
	return volumes, nil
}

func (s *VolumeService) Update(id string, update database.VolumeUpdate) error {
	if update.Title == nil && update.SortOrder == nil {
		return nil
	}

	current, err := s.get(id)
	if err != nil {
		return err
	}

	title := current.Title
	if update.Title != nil {
		title = strings.TrimSpace(*update.Title)
		if title == "" {
			return errors.New("卷标题不能为空")
		}
	}

	sortOrder := current.SortOrder
	if update.SortOrder != nil {
		sortOrder = *update.SortOrder
	}

	rowsAffected, err := s.queries.UpdateVolumeByID(context.Background(), sqlc.UpdateVolumeByIDParams{
		Title:     title,
		SortOrder: int64(sortOrder),
		ID:        id,
	})
	if err != nil {
		return fmt.Errorf("更新卷失败: %w", err)
	}
	if rowsAffected == 0 {
		return errors.New("卷不存在")
	}
	return nil
}

func (s *VolumeService) Delete(id string) error {
	rowsAffected, err := s.queries.DeleteVolumeByID(context.Background(), id)
	if err != nil {
		return fmt.Errorf("删除卷失败: %w", err)
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

	queries := s.queries.WithTx(tx)
	ctx := context.Background()
	for index, id := range input.OrderedIDs {
		if err := queries.ReorderVolumeByID(ctx, sqlc.ReorderVolumeByIDParams{
			SortOrder: int64(index),
			ID:        id,
			ProjectID: input.ProjectID,
		}); err != nil {
			return fmt.Errorf("更新卷排序失败: %w", err)
		}
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("提交卷排序事务失败: %w", err)
	}
	return nil
}

func (s *VolumeService) resolveNextSortOrder(ctx context.Context, projectID string, candidate *int) (int, error) {
	if candidate != nil {
		return *candidate, nil
	}

	next, err := s.queries.NextVolumeSortOrder(ctx, projectID)
	if err != nil {
		return 0, fmt.Errorf("计算卷排序失败: %w", err)
	}
	return int(next), nil
}

func (s *VolumeService) get(id string) (database.Volume, error) {
	row, err := s.queries.GetVolumeByID(context.Background(), id)
	if errors.Is(err, sql.ErrNoRows) {
		return database.Volume{}, errors.New("卷不存在")
	}
	if err != nil {
		return database.Volume{}, fmt.Errorf("查询卷失败: %w", err)
	}
	return mapVolume(row), nil
}

func mapVolume(row sqlc.Volume) database.Volume {
	return database.Volume{
		ID:        row.ID,
		ProjectID: row.ProjectID,
		Title:     row.Title,
		SortOrder: int(row.SortOrder),
		CreatedAt: formatSQLiteTime(row.CreatedAt),
	}
}

func mapVolumeList(row sqlc.Volume) database.Volume {
	return database.Volume{
		ID:        row.ID,
		ProjectID: row.ProjectID,
		Title:     row.Title,
		SortOrder: int(row.SortOrder),
		CreatedAt: formatSQLiteTime(row.CreatedAt),
	}
}
