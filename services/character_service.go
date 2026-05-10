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

type CharacterService struct {
	db      *sql.DB
	queries *sqlc.Queries
}

func NewCharacterService(db *sql.DB) *CharacterService {
	return &CharacterService{
		db:      db,
		queries: sqlc.New(db),
	}
}

func (s *CharacterService) Create(input database.CreateCharacterInput) (database.Character, error) {
	ctx := context.Background()
	projectID := strings.TrimSpace(input.ProjectID)
	name := strings.TrimSpace(input.Name)
	if projectID == "" {
		return database.Character{}, errors.New("projectId 不能为空")
	}
	if name == "" {
		return database.Character{}, errors.New("角色名称不能为空")
	}
	if err := ensureProjectExists(ctx, s.queries, projectID); err != nil {
		return database.Character{}, err
	}

	characterID := uuid.NewString()
	aliasJSON, err := marshalStringSlice(input.Alias)
	if err != nil {
		return database.Character{}, err
	}
	traitsJSON, err := marshalStringSlice(input.Traits)
	if err != nil {
		return database.Character{}, err
	}
	customStatusJSON, err := marshalJSONObject(input.CustomStatus)
	if err != nil {
		return database.Character{}, err
	}

	err = s.queries.CreateCharacter(ctx, sqlc.CreateCharacterParams{
		ID:                characterID,
		ProjectID:         projectID,
		Name:              name,
		AliasJson:         aliasJSON,
		Summary:           toNullString(input.Summary),
		TraitsJson:        traitsJSON,
		Background:        toNullString(input.Background),
		AvatarUrl:         toNullString(input.AvatarURL),
		PersonalityPrompt: toNullString(input.PersonalityPrompt),
		SpeechPattern:     toNullString(input.SpeechPattern),
		CurrentState:      toNullString(input.CurrentState),
		CustomStatusJson:  customStatusJSON,
	})
	if err != nil {
		return database.Character{}, fmt.Errorf("创建角色失败: %w", err)
	}

	return s.Get(characterID)
}

func (s *CharacterService) Get(id string) (database.Character, error) {
	row, err := s.queries.GetCharacterByID(context.Background(), id)
	if errors.Is(err, sql.ErrNoRows) {
		return database.Character{}, errors.New("角色不存在")
	}
	if err != nil {
		return database.Character{}, fmt.Errorf("查询角色失败: %w", err)
	}
	return mapCharacter(row), nil
}

func (s *CharacterService) List(projectID string) ([]database.Character, error) {
	rows, err := s.queries.ListCharactersByProject(context.Background(), projectID)
	if err != nil {
		return nil, fmt.Errorf("查询角色列表失败: %w", err)
	}

	items := make([]database.Character, 0, len(rows))
	for _, row := range rows {
		items = append(items, mapCharacterList(row))
	}
	return items, nil
}

func (s *CharacterService) Update(id string, update database.CharacterUpdate) (database.Character, error) {
	ctx := context.Background()
	current, err := s.Get(id)
	if err != nil {
		return database.Character{}, err
	}

	next := current
	if update.Name != nil {
		name := strings.TrimSpace(*update.Name)
		if name == "" {
			return database.Character{}, errors.New("角色名称不能为空")
		}
		next.Name = name
	}
	if update.Alias != nil {
		next.Alias = update.Alias
	}
	if update.Summary != nil {
		next.Summary = strings.TrimSpace(*update.Summary)
	}
	if update.Traits != nil {
		next.Traits = update.Traits
	}
	if update.Background != nil {
		next.Background = strings.TrimSpace(*update.Background)
	}
	if update.AvatarURL != nil {
		next.AvatarURL = strings.TrimSpace(*update.AvatarURL)
	}
	if update.PersonalityPrompt != nil {
		next.PersonalityPrompt = strings.TrimSpace(*update.PersonalityPrompt)
	}
	if update.SpeechPattern != nil {
		next.SpeechPattern = strings.TrimSpace(*update.SpeechPattern)
	}
	if update.CurrentState != nil {
		next.CurrentState = strings.TrimSpace(*update.CurrentState)
	}
	if update.CustomStatus != nil {
		next.CustomStatus = update.CustomStatus
	}

	aliasJSON, err := marshalStringSlice(next.Alias)
	if err != nil {
		return database.Character{}, err
	}
	traitsJSON, err := marshalStringSlice(next.Traits)
	if err != nil {
		return database.Character{}, err
	}
	customStatusJSON, err := marshalJSONObject(next.CustomStatus)
	if err != nil {
		return database.Character{}, err
	}

	rowsAffected, err := s.queries.UpdateCharacterByID(ctx, sqlc.UpdateCharacterByIDParams{
		Name:              next.Name,
		AliasJson:         aliasJSON,
		Summary:           toNullString(next.Summary),
		TraitsJson:        traitsJSON,
		Background:        toNullString(next.Background),
		AvatarUrl:         toNullString(next.AvatarURL),
		PersonalityPrompt: toNullString(next.PersonalityPrompt),
		SpeechPattern:     toNullString(next.SpeechPattern),
		CurrentState:      toNullString(next.CurrentState),
		CustomStatusJson:  customStatusJSON,
		ID:                id,
	})
	if err != nil {
		return database.Character{}, fmt.Errorf("更新角色失败: %w", err)
	}
	if rowsAffected == 0 {
		return database.Character{}, errors.New("角色不存在")
	}

	return s.Get(id)
}

func (s *CharacterService) Delete(id string) error {
	rowsAffected, err := s.queries.DeleteCharacterByID(context.Background(), id)
	if err != nil {
		return fmt.Errorf("删除角色失败: %w", err)
	}
	if rowsAffected == 0 {
		return errors.New("角色不存在")
	}
	return nil
}

func (s *CharacterService) CreateRelation(input database.CreateCharacterRelationInput) (database.CharacterRelation, error) {
	ctx := context.Background()
	projectID := strings.TrimSpace(input.ProjectID)
	fromID := strings.TrimSpace(input.FromID)
	toID := strings.TrimSpace(input.ToID)
	relationType := strings.TrimSpace(input.Type)
	if projectID == "" {
		return database.CharacterRelation{}, errors.New("projectId 不能为空")
	}
	if fromID == "" || toID == "" {
		return database.CharacterRelation{}, errors.New("角色关系必须包含 fromId 和 toId")
	}
	if fromID == toID {
		return database.CharacterRelation{}, errors.New("角色关系不能指向自身")
	}
	if relationType == "" {
		relationType = "其他"
	}
	if err := s.ensureCharacterBelongsToProject(ctx, projectID, fromID); err != nil {
		return database.CharacterRelation{}, err
	}
	if err := s.ensureCharacterBelongsToProject(ctx, projectID, toID); err != nil {
		return database.CharacterRelation{}, err
	}

	strength := 50
	if input.Strength != nil {
		strength = *input.Strength
	}

	relationID := uuid.NewString()
	err := s.queries.CreateCharacterRelation(ctx, sqlc.CreateCharacterRelationParams{
		ID:                  relationID,
		ProjectID:           projectID,
		FromID:              fromID,
		ToID:                toID,
		Type:                relationType,
		Strength:            int64(strength),
		Notes:               toNullString(input.Notes),
		ValidFromChapterID:  toOptionalNullString(input.ValidFromChapterID),
		ValidUntilChapterID: toOptionalNullString(input.ValidUntilChapterID),
	})
	if err != nil {
		return database.CharacterRelation{}, fmt.Errorf("创建角色关系失败: %w", err)
	}
	return s.getRelation(relationID)
}

func (s *CharacterService) ListRelations(projectID string, characterID string) ([]database.CharacterRelation, error) {
	ctx := context.Background()
	if strings.TrimSpace(characterID) != "" {
		rows, err := s.queries.ListCharacterRelationsByCharacter(ctx, sqlc.ListCharacterRelationsByCharacterParams{
			ProjectID: projectID,
			FromID:    characterID,
			ToID:      characterID,
		})
		if err != nil {
			return nil, fmt.Errorf("查询角色关系列表失败: %w", err)
		}
		items := make([]database.CharacterRelation, 0, len(rows))
		for _, row := range rows {
			items = append(items, mapCharacterRelationListByCharacter(row))
		}
		return items, nil
	}

	rows, err := s.queries.ListCharacterRelationsByProject(ctx, projectID)
	if err != nil {
		return nil, fmt.Errorf("查询角色关系列表失败: %w", err)
	}
	items := make([]database.CharacterRelation, 0, len(rows))
	for _, row := range rows {
		items = append(items, mapCharacterRelationList(row))
	}
	return items, nil
}

func (s *CharacterService) DeleteRelation(id string) error {
	rowsAffected, err := s.queries.DeleteCharacterRelationByID(context.Background(), id)
	if err != nil {
		return fmt.Errorf("删除角色关系失败: %w", err)
	}
	if rowsAffected == 0 {
		return errors.New("角色关系不存在")
	}
	return nil
}

func (s *CharacterService) getRelation(id string) (database.CharacterRelation, error) {
	row, err := s.queries.GetCharacterRelationByID(context.Background(), id)
	if errors.Is(err, sql.ErrNoRows) {
		return database.CharacterRelation{}, errors.New("角色关系不存在")
	}
	if err != nil {
		return database.CharacterRelation{}, fmt.Errorf("查询角色关系失败: %w", err)
	}
	return mapCharacterRelation(row), nil
}

func (s *CharacterService) ensureCharacterBelongsToProject(ctx context.Context, projectID string, characterID string) error {
	exists, err := s.queries.CharacterExistsInProject(ctx, sqlc.CharacterExistsInProjectParams{
		ID:        characterID,
		ProjectID: projectID,
	})
	if err != nil {
		return fmt.Errorf("查询角色失败: %w", err)
	}
	if exists == 0 {
		return errors.New("角色不存在")
	}
	return nil
}

func mapCharacter(row sqlc.GetCharacterByIDRow) database.Character {
	return database.Character{
		ID:                row.ID,
		ProjectID:         row.ProjectID,
		Name:              row.Name,
		Alias:             unmarshalStringSlice(row.AliasJson),
		Summary:           row.Summary,
		Traits:            unmarshalStringSlice(row.TraitsJson),
		Background:        row.Background,
		AvatarURL:         row.AvatarUrl,
		PersonalityPrompt: row.PersonalityPrompt,
		SpeechPattern:     row.SpeechPattern,
		CurrentState:      row.CurrentState,
		CustomStatus:      unmarshalJSONObject(row.CustomStatusJson),
		CreatedAt:         formatSQLiteTime(row.CreatedAt),
		UpdatedAt:         formatSQLiteTime(row.UpdatedAt),
	}
}

func mapCharacterList(row sqlc.ListCharactersByProjectRow) database.Character {
	return database.Character{
		ID:                row.ID,
		ProjectID:         row.ProjectID,
		Name:              row.Name,
		Alias:             unmarshalStringSlice(row.AliasJson),
		Summary:           row.Summary,
		Traits:            unmarshalStringSlice(row.TraitsJson),
		Background:        row.Background,
		AvatarURL:         row.AvatarUrl,
		PersonalityPrompt: row.PersonalityPrompt,
		SpeechPattern:     row.SpeechPattern,
		CurrentState:      row.CurrentState,
		CustomStatus:      unmarshalJSONObject(row.CustomStatusJson),
		CreatedAt:         formatSQLiteTime(row.CreatedAt),
		UpdatedAt:         formatSQLiteTime(row.UpdatedAt),
	}
}

func mapCharacterRelation(row sqlc.GetCharacterRelationByIDRow) database.CharacterRelation {
	return database.CharacterRelation{
		ID:                  row.ID,
		ProjectID:           row.ProjectID,
		FromID:              row.FromID,
		ToID:                row.ToID,
		Type:                row.Type,
		Strength:            int(row.Strength),
		Notes:               row.Notes,
		ValidFromChapterID:  row.ValidFromChapterID,
		ValidUntilChapterID: row.ValidUntilChapterID,
		CreatedAt:           formatSQLiteTime(row.CreatedAt),
		UpdatedAt:           formatSQLiteTime(row.UpdatedAt),
	}
}

func mapCharacterRelationList(row sqlc.ListCharacterRelationsByProjectRow) database.CharacterRelation {
	return database.CharacterRelation{
		ID:                  row.ID,
		ProjectID:           row.ProjectID,
		FromID:              row.FromID,
		ToID:                row.ToID,
		Type:                row.Type,
		Strength:            int(row.Strength),
		Notes:               row.Notes,
		ValidFromChapterID:  row.ValidFromChapterID,
		ValidUntilChapterID: row.ValidUntilChapterID,
		CreatedAt:           formatSQLiteTime(row.CreatedAt),
		UpdatedAt:           formatSQLiteTime(row.UpdatedAt),
	}
}

func mapCharacterRelationListByCharacter(row sqlc.ListCharacterRelationsByCharacterRow) database.CharacterRelation {
	return database.CharacterRelation{
		ID:                  row.ID,
		ProjectID:           row.ProjectID,
		FromID:              row.FromID,
		ToID:                row.ToID,
		Type:                row.Type,
		Strength:            int(row.Strength),
		Notes:               row.Notes,
		ValidFromChapterID:  row.ValidFromChapterID,
		ValidUntilChapterID: row.ValidUntilChapterID,
		CreatedAt:           formatSQLiteTime(row.CreatedAt),
		UpdatedAt:           formatSQLiteTime(row.UpdatedAt),
	}
}

func marshalStringSlice(items []string) (string, error) {
	normalized := make([]string, 0, len(items))
	for _, item := range items {
		value := strings.TrimSpace(item)
		if value == "" {
			continue
		}
		normalized = append(normalized, value)
	}
	payload, err := json.Marshal(normalized)
	if err != nil {
		return "", fmt.Errorf("序列化字符串数组失败: %w", err)
	}
	return string(payload), nil
}

func marshalJSONObject(payload map[string]interface{}) (string, error) {
	if payload == nil {
		payload = map[string]interface{}{}
	}
	encoded, err := json.Marshal(payload)
	if err != nil {
		return "", fmt.Errorf("序列化 JSON 对象失败: %w", err)
	}
	return string(encoded), nil
}

func unmarshalStringSlice(payload string) []string {
	if strings.TrimSpace(payload) == "" {
		return []string{}
	}
	var items []string
	if err := json.Unmarshal([]byte(payload), &items); err != nil {
		return []string{}
	}
	return items
}

func unmarshalJSONObject(payload string) map[string]interface{} {
	if strings.TrimSpace(payload) == "" {
		return map[string]interface{}{}
	}
	var item map[string]interface{}
	if err := json.Unmarshal([]byte(payload), &item); err != nil {
		return map[string]interface{}{}
	}
	if item == nil {
		return map[string]interface{}{}
	}
	return item
}
