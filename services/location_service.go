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

type LocationService struct {
	db      *sql.DB
	queries *sqlc.Queries
}

func NewLocationService(db *sql.DB) *LocationService {
	return &LocationService{
		db:      db,
		queries: sqlc.New(db),
	}
}

func (s *LocationService) Create(input database.CreateLocationInput) (database.Location, error) {
	ctx := context.Background()
	projectID := strings.TrimSpace(input.ProjectID)
	name := strings.TrimSpace(input.Name)
	if projectID == "" {
		return database.Location{}, errors.New("projectId 不能为空")
	}
	if name == "" {
		return database.Location{}, errors.New("地点名称不能为空")
	}
	if err := ensureProjectExists(ctx, s.queries, projectID); err != nil {
		return database.Location{}, err
	}

	parentID := normalizeOptionalString(input.ParentID)
	if parentID != "" {
		if err := s.ensureLocationBelongsToProject(ctx, projectID, parentID); err != nil {
			return database.Location{}, err
		}
	}

	locationID := uuid.NewString()
	err := s.queries.CreateLocation(ctx, sqlc.CreateLocationParams{
		ID:          locationID,
		ProjectID:   projectID,
		Name:        name,
		Description: toNullString(input.Description),
		Climate:     toNullString(input.Climate),
		Culture:     toNullString(input.Culture),
		Geography:   toNullString(input.Geography),
		Atmosphere:  toNullString(input.Atmosphere),
		ParentID:    toOptionalNullString(parentID),
		ImageUrl:    toNullString(input.ImageURL),
	})
	if err != nil {
		return database.Location{}, fmt.Errorf("创建地点失败: %w", err)
	}
	return s.Get(locationID)
}

func (s *LocationService) Get(id string) (database.Location, error) {
	row, err := s.queries.GetLocationByID(context.Background(), id)
	if errors.Is(err, sql.ErrNoRows) {
		return database.Location{}, errors.New("地点不存在")
	}
	if err != nil {
		return database.Location{}, fmt.Errorf("查询地点失败: %w", err)
	}
	return mapLocation(row), nil
}

func (s *LocationService) List(projectID string) ([]database.Location, error) {
	rows, err := s.queries.ListLocationsByProject(context.Background(), projectID)
	if err != nil {
		return nil, fmt.Errorf("查询地点列表失败: %w", err)
	}

	items := make([]database.Location, 0, len(rows))
	for _, row := range rows {
		items = append(items, mapLocationList(row))
	}
	return items, nil
}

func (s *LocationService) Update(id string, update database.LocationUpdate) (database.Location, error) {
	ctx := context.Background()
	current, err := s.Get(id)
	if err != nil {
		return database.Location{}, err
	}

	next := current
	if update.Name != nil {
		name := strings.TrimSpace(*update.Name)
		if name == "" {
			return database.Location{}, errors.New("地点名称不能为空")
		}
		next.Name = name
	}
	if update.Description != nil {
		next.Description = strings.TrimSpace(*update.Description)
	}
	if update.Climate != nil {
		next.Climate = strings.TrimSpace(*update.Climate)
	}
	if update.Culture != nil {
		next.Culture = strings.TrimSpace(*update.Culture)
	}
	if update.Geography != nil {
		next.Geography = strings.TrimSpace(*update.Geography)
	}
	if update.Atmosphere != nil {
		next.Atmosphere = strings.TrimSpace(*update.Atmosphere)
	}
	if update.ParentID != nil {
		next.ParentID = normalizeOptionalString(*update.ParentID)
		if next.ParentID != "" {
			if next.ParentID == id {
				return database.Location{}, errors.New("地点不能挂到自身之下")
			}
			if err := s.ensureLocationBelongsToProject(ctx, current.ProjectID, next.ParentID); err != nil {
				return database.Location{}, err
			}
		}
	}
	if update.ImageURL != nil {
		next.ImageURL = strings.TrimSpace(*update.ImageURL)
	}

	rowsAffected, err := s.queries.UpdateLocationByID(ctx, sqlc.UpdateLocationByIDParams{
		Name:        next.Name,
		Description: toNullString(next.Description),
		Climate:     toNullString(next.Climate),
		Culture:     toNullString(next.Culture),
		Geography:   toNullString(next.Geography),
		Atmosphere:  toNullString(next.Atmosphere),
		ParentID:    toOptionalNullString(next.ParentID),
		ImageUrl:    toNullString(next.ImageURL),
		ID:          id,
	})
	if err != nil {
		return database.Location{}, fmt.Errorf("更新地点失败: %w", err)
	}
	if rowsAffected == 0 {
		return database.Location{}, errors.New("地点不存在")
	}
	return s.Get(id)
}

func (s *LocationService) Delete(id string) error {
	rowsAffected, err := s.queries.DeleteLocationByID(context.Background(), id)
	if err != nil {
		return fmt.Errorf("删除地点失败: %w", err)
	}
	if rowsAffected == 0 {
		return errors.New("地点不存在")
	}
	return nil
}

func (s *LocationService) CreateRelation(input database.CreateLocationRelationInput) (database.LocationRelation, error) {
	ctx := context.Background()
	projectID := strings.TrimSpace(input.ProjectID)
	fromID := strings.TrimSpace(input.FromID)
	toID := strings.TrimSpace(input.ToID)
	relationType := strings.TrimSpace(input.Type)
	if projectID == "" {
		return database.LocationRelation{}, errors.New("projectId 不能为空")
	}
	if fromID == "" || toID == "" {
		return database.LocationRelation{}, errors.New("地点关系必须包含 fromId 和 toId")
	}
	if fromID == toID {
		return database.LocationRelation{}, errors.New("地点关系不能指向自身")
	}
	if relationType == "" {
		return database.LocationRelation{}, errors.New("地点关系类型不能为空")
	}
	if err := s.ensureLocationBelongsToProject(ctx, projectID, fromID); err != nil {
		return database.LocationRelation{}, err
	}
	if err := s.ensureLocationBelongsToProject(ctx, projectID, toID); err != nil {
		return database.LocationRelation{}, err
	}

	relationID := uuid.NewString()
	err := s.queries.CreateLocationRelation(ctx, sqlc.CreateLocationRelationParams{
		ID:        relationID,
		ProjectID: projectID,
		FromID:    fromID,
		ToID:      toID,
		Type:      relationType,
		Distance:  toNullString(input.Distance),
		Notes:     toNullString(input.Notes),
	})
	if err != nil {
		return database.LocationRelation{}, fmt.Errorf("创建地点关系失败: %w", err)
	}
	return s.getRelation(relationID)
}

func (s *LocationService) ListRelations(projectID string, locationID string) ([]database.LocationRelation, error) {
	ctx := context.Background()
	if strings.TrimSpace(locationID) != "" {
		rows, err := s.queries.ListLocationRelationsByLocation(ctx, sqlc.ListLocationRelationsByLocationParams{
			ProjectID: projectID,
			FromID:    locationID,
			ToID:      locationID,
		})
		if err != nil {
			return nil, fmt.Errorf("查询地点关系列表失败: %w", err)
		}
		items := make([]database.LocationRelation, 0, len(rows))
		for _, row := range rows {
			items = append(items, mapLocationRelationListByLocation(row))
		}
		return items, nil
	}

	rows, err := s.queries.ListLocationRelationsByProject(ctx, projectID)
	if err != nil {
		return nil, fmt.Errorf("查询地点关系列表失败: %w", err)
	}
	items := make([]database.LocationRelation, 0, len(rows))
	for _, row := range rows {
		items = append(items, mapLocationRelationList(row))
	}
	return items, nil
}

func (s *LocationService) DeleteRelation(id string) error {
	rowsAffected, err := s.queries.DeleteLocationRelationByID(context.Background(), id)
	if err != nil {
		return fmt.Errorf("删除地点关系失败: %w", err)
	}
	if rowsAffected == 0 {
		return errors.New("地点关系不存在")
	}
	return nil
}

func (s *LocationService) getRelation(id string) (database.LocationRelation, error) {
	row, err := s.queries.GetLocationRelationByID(context.Background(), id)
	if errors.Is(err, sql.ErrNoRows) {
		return database.LocationRelation{}, errors.New("地点关系不存在")
	}
	if err != nil {
		return database.LocationRelation{}, fmt.Errorf("查询地点关系失败: %w", err)
	}
	return mapLocationRelation(row), nil
}

func (s *LocationService) ensureLocationBelongsToProject(ctx context.Context, projectID string, locationID string) error {
	exists, err := s.queries.LocationExistsInProject(ctx, sqlc.LocationExistsInProjectParams{
		ID:        locationID,
		ProjectID: projectID,
	})
	if err != nil {
		return fmt.Errorf("查询地点失败: %w", err)
	}
	if exists == 0 {
		return errors.New("地点不存在")
	}
	return nil
}

func mapLocation(row sqlc.GetLocationByIDRow) database.Location {
	return database.Location{
		ID:          row.ID,
		ProjectID:   row.ProjectID,
		Name:        row.Name,
		Description: row.Description,
		Climate:     row.Climate,
		Culture:     row.Culture,
		Geography:   row.Geography,
		Atmosphere:  row.Atmosphere,
		ParentID:    row.ParentID,
		ImageURL:    row.ImageUrl,
		CreatedAt:   formatSQLiteTime(row.CreatedAt),
		UpdatedAt:   formatSQLiteTime(row.UpdatedAt),
	}
}

func mapLocationList(row sqlc.ListLocationsByProjectRow) database.Location {
	return database.Location{
		ID:          row.ID,
		ProjectID:   row.ProjectID,
		Name:        row.Name,
		Description: row.Description,
		Climate:     row.Climate,
		Culture:     row.Culture,
		Geography:   row.Geography,
		Atmosphere:  row.Atmosphere,
		ParentID:    row.ParentID,
		ImageURL:    row.ImageUrl,
		CreatedAt:   formatSQLiteTime(row.CreatedAt),
		UpdatedAt:   formatSQLiteTime(row.UpdatedAt),
	}
}

func mapLocationRelation(row sqlc.GetLocationRelationByIDRow) database.LocationRelation {
	return database.LocationRelation{
		ID:        row.ID,
		ProjectID: row.ProjectID,
		FromID:    row.FromID,
		ToID:      row.ToID,
		Type:      row.Type,
		Distance:  row.Distance,
		Notes:     row.Notes,
		CreatedAt: formatSQLiteTime(row.CreatedAt),
		UpdatedAt: formatSQLiteTime(row.UpdatedAt),
	}
}

func mapLocationRelationList(row sqlc.ListLocationRelationsByProjectRow) database.LocationRelation {
	return database.LocationRelation{
		ID:        row.ID,
		ProjectID: row.ProjectID,
		FromID:    row.FromID,
		ToID:      row.ToID,
		Type:      row.Type,
		Distance:  row.Distance,
		Notes:     row.Notes,
		CreatedAt: formatSQLiteTime(row.CreatedAt),
		UpdatedAt: formatSQLiteTime(row.UpdatedAt),
	}
}

func mapLocationRelationListByLocation(row sqlc.ListLocationRelationsByLocationRow) database.LocationRelation {
	return database.LocationRelation{
		ID:        row.ID,
		ProjectID: row.ProjectID,
		FromID:    row.FromID,
		ToID:      row.ToID,
		Type:      row.Type,
		Distance:  row.Distance,
		Notes:     row.Notes,
		CreatedAt: formatSQLiteTime(row.CreatedAt),
		UpdatedAt: formatSQLiteTime(row.UpdatedAt),
	}
}
