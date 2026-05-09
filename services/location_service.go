package services

import (
	"database/sql"
	"errors"
	"fmt"
	"strings"

	"Qingyu-Editor/database"

	"github.com/google/uuid"
)

type LocationService struct {
	db *sql.DB
}

func NewLocationService(db *sql.DB) *LocationService {
	return &LocationService{db: db}
}

func (s *LocationService) Create(input database.CreateLocationInput) (database.Location, error) {
	projectID := strings.TrimSpace(input.ProjectID)
	name := strings.TrimSpace(input.Name)
	if projectID == "" {
		return database.Location{}, errors.New("projectId 不能为空")
	}
	if name == "" {
		return database.Location{}, errors.New("地点名称不能为空")
	}
	if err := ensureProjectExists(s.db, projectID); err != nil {
		return database.Location{}, err
	}

	parentID := normalizeOptionalString(input.ParentID)
	if parentID != "" {
		if err := s.ensureLocationBelongsToProject(projectID, parentID); err != nil {
			return database.Location{}, err
		}
	}

	locationID := uuid.NewString()
	_, err := s.db.Exec(
		`INSERT INTO locations (id, project_id, name, description, climate, culture, geography, atmosphere, parent_id, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		locationID,
		projectID,
		name,
		strings.TrimSpace(input.Description),
		strings.TrimSpace(input.Climate),
		strings.TrimSpace(input.Culture),
		strings.TrimSpace(input.Geography),
		strings.TrimSpace(input.Atmosphere),
		nullStringValue(parentID),
		strings.TrimSpace(input.ImageURL),
	)
	if err != nil {
		return database.Location{}, fmt.Errorf("创建地点失败: %w", err)
	}
	return s.Get(locationID)
}

func (s *LocationService) Get(id string) (database.Location, error) {
	row := s.db.QueryRow(
		`SELECT id, project_id, name, COALESCE(description, ''), COALESCE(climate, ''), COALESCE(culture, ''), COALESCE(geography, ''), COALESCE(atmosphere, ''), COALESCE(parent_id, ''), COALESCE(image_url, ''), COALESCE(created_at, ''), COALESCE(updated_at, '') FROM locations WHERE id = ?`,
		id,
	)
	return scanLocation(row)
}

func (s *LocationService) List(projectID string) ([]database.Location, error) {
	rows, err := s.db.Query(
		`SELECT id, project_id, name, COALESCE(description, ''), COALESCE(climate, ''), COALESCE(culture, ''), COALESCE(geography, ''), COALESCE(atmosphere, ''), COALESCE(parent_id, ''), COALESCE(image_url, ''), COALESCE(created_at, ''), COALESCE(updated_at, '') FROM locations WHERE project_id = ? ORDER BY CASE WHEN parent_id IS NULL THEN 0 ELSE 1 END ASC, parent_id ASC, updated_at DESC, created_at DESC`,
		projectID,
	)
	if err != nil {
		return nil, fmt.Errorf("查询地点列表失败: %w", err)
	}
	defer rows.Close()

	items := make([]database.Location, 0)
	for rows.Next() {
		location, err := scanLocation(rows)
		if err != nil {
			return nil, err
		}
		items = append(items, location)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("读取地点列表失败: %w", err)
	}
	return items, nil
}

func (s *LocationService) Update(id string, update database.LocationUpdate) (database.Location, error) {
	current, err := s.Get(id)
	if err != nil {
		return database.Location{}, err
	}

	sets := make([]string, 0, 8)
	args := make([]any, 0, 9)

	if update.Name != nil {
		name := strings.TrimSpace(*update.Name)
		if name == "" {
			return database.Location{}, errors.New("地点名称不能为空")
		}
		sets = append(sets, "name = ?")
		args = append(args, name)
	}
	if update.Description != nil {
		sets = append(sets, "description = ?")
		args = append(args, strings.TrimSpace(*update.Description))
	}
	if update.Climate != nil {
		sets = append(sets, "climate = ?")
		args = append(args, strings.TrimSpace(*update.Climate))
	}
	if update.Culture != nil {
		sets = append(sets, "culture = ?")
		args = append(args, strings.TrimSpace(*update.Culture))
	}
	if update.Geography != nil {
		sets = append(sets, "geography = ?")
		args = append(args, strings.TrimSpace(*update.Geography))
	}
	if update.Atmosphere != nil {
		sets = append(sets, "atmosphere = ?")
		args = append(args, strings.TrimSpace(*update.Atmosphere))
	}
	if update.ParentID != nil {
		parentID := normalizeOptionalString(*update.ParentID)
		if parentID != "" {
			if parentID == id {
				return database.Location{}, errors.New("地点不能挂到自身之下")
			}
			if err := s.ensureLocationBelongsToProject(current.ProjectID, parentID); err != nil {
				return database.Location{}, err
			}
		}
		sets = append(sets, "parent_id = ?")
		args = append(args, nullStringValue(parentID))
	}
	if update.ImageURL != nil {
		sets = append(sets, "image_url = ?")
		args = append(args, strings.TrimSpace(*update.ImageURL))
	}

	if len(sets) == 0 {
		return current, nil
	}

	sets = append(sets, "updated_at = CURRENT_TIMESTAMP")
	args = append(args, id)
	result, err := s.db.Exec(
		fmt.Sprintf("UPDATE locations SET %s WHERE id = ?", strings.Join(sets, ", ")),
		args...,
	)
	if err != nil {
		return database.Location{}, fmt.Errorf("更新地点失败: %w", err)
	}
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return database.Location{}, fmt.Errorf("确认地点更新结果失败: %w", err)
	}
	if rowsAffected == 0 {
		return database.Location{}, errors.New("地点不存在")
	}
	return s.Get(id)
}

func (s *LocationService) Delete(id string) error {
	result, err := s.db.Exec(`DELETE FROM locations WHERE id = ?`, id)
	if err != nil {
		return fmt.Errorf("删除地点失败: %w", err)
	}
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("确认地点删除结果失败: %w", err)
	}
	if rowsAffected == 0 {
		return errors.New("地点不存在")
	}
	return nil
}

func (s *LocationService) CreateRelation(input database.CreateLocationRelationInput) (database.LocationRelation, error) {
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
	if err := s.ensureLocationBelongsToProject(projectID, fromID); err != nil {
		return database.LocationRelation{}, err
	}
	if err := s.ensureLocationBelongsToProject(projectID, toID); err != nil {
		return database.LocationRelation{}, err
	}

	relationID := uuid.NewString()
	_, err := s.db.Exec(
		`INSERT INTO location_relations (id, project_id, from_id, to_id, type, distance, notes) VALUES (?, ?, ?, ?, ?, ?, ?)`,
		relationID,
		projectID,
		fromID,
		toID,
		relationType,
		strings.TrimSpace(input.Distance),
		strings.TrimSpace(input.Notes),
	)
	if err != nil {
		return database.LocationRelation{}, fmt.Errorf("创建地点关系失败: %w", err)
	}
	return s.getRelation(relationID)
}

func (s *LocationService) ListRelations(projectID string, locationID string) ([]database.LocationRelation, error) {
	baseQuery := `SELECT id, project_id, from_id, to_id, type, COALESCE(distance, ''), COALESCE(notes, ''), COALESCE(created_at, ''), COALESCE(updated_at, '') FROM location_relations WHERE project_id = ?`
	args := []any{projectID}
	if strings.TrimSpace(locationID) != "" {
		baseQuery += ` AND (from_id = ? OR to_id = ?)`
		args = append(args, locationID, locationID)
	}
	baseQuery += ` ORDER BY updated_at DESC, created_at DESC`

	rows, err := s.db.Query(baseQuery, args...)
	if err != nil {
		return nil, fmt.Errorf("查询地点关系列表失败: %w", err)
	}
	defer rows.Close()

	items := make([]database.LocationRelation, 0)
	for rows.Next() {
		relation, err := scanLocationRelation(rows)
		if err != nil {
			return nil, err
		}
		items = append(items, relation)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("读取地点关系列表失败: %w", err)
	}
	return items, nil
}

func (s *LocationService) DeleteRelation(id string) error {
	result, err := s.db.Exec(`DELETE FROM location_relations WHERE id = ?`, id)
	if err != nil {
		return fmt.Errorf("删除地点关系失败: %w", err)
	}
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("确认地点关系删除结果失败: %w", err)
	}
	if rowsAffected == 0 {
		return errors.New("地点关系不存在")
	}
	return nil
}

func (s *LocationService) getRelation(id string) (database.LocationRelation, error) {
	row := s.db.QueryRow(
		`SELECT id, project_id, from_id, to_id, type, COALESCE(distance, ''), COALESCE(notes, ''), COALESCE(created_at, ''), COALESCE(updated_at, '') FROM location_relations WHERE id = ?`,
		id,
	)
	return scanLocationRelation(row)
}

func (s *LocationService) ensureLocationBelongsToProject(projectID string, locationID string) error {
	var exists int
	err := s.db.QueryRow(
		`SELECT 1 FROM locations WHERE id = ? AND project_id = ? LIMIT 1`,
		locationID,
		projectID,
	).Scan(&exists)
	if errors.Is(err, sql.ErrNoRows) {
		return errors.New("地点不存在")
	}
	if err != nil {
		return fmt.Errorf("查询地点失败: %w", err)
	}
	return nil
}

type locationScanner interface {
	Scan(dest ...any) error
}

func scanLocation(scanner locationScanner) (database.Location, error) {
	var item database.Location
	err := scanner.Scan(
		&item.ID,
		&item.ProjectID,
		&item.Name,
		&item.Description,
		&item.Climate,
		&item.Culture,
		&item.Geography,
		&item.Atmosphere,
		&item.ParentID,
		&item.ImageURL,
		&item.CreatedAt,
		&item.UpdatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return database.Location{}, errors.New("地点不存在")
	}
	if err != nil {
		return database.Location{}, fmt.Errorf("读取地点失败: %w", err)
	}
	return item, nil
}

func scanLocationRelation(scanner locationScanner) (database.LocationRelation, error) {
	var item database.LocationRelation
	err := scanner.Scan(
		&item.ID,
		&item.ProjectID,
		&item.FromID,
		&item.ToID,
		&item.Type,
		&item.Distance,
		&item.Notes,
		&item.CreatedAt,
		&item.UpdatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return database.LocationRelation{}, errors.New("地点关系不存在")
	}
	if err != nil {
		return database.LocationRelation{}, fmt.Errorf("读取地点关系失败: %w", err)
	}
	return item, nil
}
