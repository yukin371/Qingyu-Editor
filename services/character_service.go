package services

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"strings"

	"Qingyu-Editor/database"

	"github.com/google/uuid"
)

type CharacterService struct {
	db *sql.DB
}

func NewCharacterService(db *sql.DB) *CharacterService {
	return &CharacterService{db: db}
}

func (s *CharacterService) Create(input database.CreateCharacterInput) (database.Character, error) {
	projectID := strings.TrimSpace(input.ProjectID)
	name := strings.TrimSpace(input.Name)
	if projectID == "" {
		return database.Character{}, errors.New("projectId 不能为空")
	}
	if name == "" {
		return database.Character{}, errors.New("角色名称不能为空")
	}
	if err := ensureProjectExists(s.db, projectID); err != nil {
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

	_, err = s.db.Exec(
		`INSERT INTO characters (id, project_id, name, alias_json, summary, traits_json, background, avatar_url, personality_prompt, speech_pattern, current_state, custom_status_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		characterID,
		projectID,
		name,
		aliasJSON,
		strings.TrimSpace(input.Summary),
		traitsJSON,
		strings.TrimSpace(input.Background),
		strings.TrimSpace(input.AvatarURL),
		strings.TrimSpace(input.PersonalityPrompt),
		strings.TrimSpace(input.SpeechPattern),
		strings.TrimSpace(input.CurrentState),
		customStatusJSON,
	)
	if err != nil {
		return database.Character{}, fmt.Errorf("创建角色失败: %w", err)
	}

	return s.Get(characterID)
}

func (s *CharacterService) Get(id string) (database.Character, error) {
	row := s.db.QueryRow(
		`SELECT id, project_id, name, alias_json, COALESCE(summary, ''), traits_json, COALESCE(background, ''), COALESCE(avatar_url, ''), COALESCE(personality_prompt, ''), COALESCE(speech_pattern, ''), COALESCE(current_state, ''), custom_status_json, COALESCE(created_at, ''), COALESCE(updated_at, '') FROM characters WHERE id = ?`,
		id,
	)
	return scanCharacter(row)
}

func (s *CharacterService) List(projectID string) ([]database.Character, error) {
	rows, err := s.db.Query(
		`SELECT id, project_id, name, alias_json, COALESCE(summary, ''), traits_json, COALESCE(background, ''), COALESCE(avatar_url, ''), COALESCE(personality_prompt, ''), COALESCE(speech_pattern, ''), COALESCE(current_state, ''), custom_status_json, COALESCE(created_at, ''), COALESCE(updated_at, '') FROM characters WHERE project_id = ? ORDER BY updated_at DESC, created_at DESC`,
		projectID,
	)
	if err != nil {
		return nil, fmt.Errorf("查询角色列表失败: %w", err)
	}
	defer rows.Close()

	items := make([]database.Character, 0)
	for rows.Next() {
		character, err := scanCharacter(rows)
		if err != nil {
			return nil, err
		}
		items = append(items, character)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("读取角色列表失败: %w", err)
	}
	return items, nil
}

func (s *CharacterService) Update(id string, update database.CharacterUpdate) (database.Character, error) {
	current, err := s.Get(id)
	if err != nil {
		return database.Character{}, err
	}

	sets := make([]string, 0, 10)
	args := make([]any, 0, 11)

	if update.Name != nil {
		name := strings.TrimSpace(*update.Name)
		if name == "" {
			return database.Character{}, errors.New("角色名称不能为空")
		}
		sets = append(sets, "name = ?")
		args = append(args, name)
	}
	if update.Alias != nil {
		payload, err := marshalStringSlice(update.Alias)
		if err != nil {
			return database.Character{}, err
		}
		sets = append(sets, "alias_json = ?")
		args = append(args, payload)
	}
	if update.Summary != nil {
		sets = append(sets, "summary = ?")
		args = append(args, strings.TrimSpace(*update.Summary))
	}
	if update.Traits != nil {
		payload, err := marshalStringSlice(update.Traits)
		if err != nil {
			return database.Character{}, err
		}
		sets = append(sets, "traits_json = ?")
		args = append(args, payload)
	}
	if update.Background != nil {
		sets = append(sets, "background = ?")
		args = append(args, strings.TrimSpace(*update.Background))
	}
	if update.AvatarURL != nil {
		sets = append(sets, "avatar_url = ?")
		args = append(args, strings.TrimSpace(*update.AvatarURL))
	}
	if update.PersonalityPrompt != nil {
		sets = append(sets, "personality_prompt = ?")
		args = append(args, strings.TrimSpace(*update.PersonalityPrompt))
	}
	if update.SpeechPattern != nil {
		sets = append(sets, "speech_pattern = ?")
		args = append(args, strings.TrimSpace(*update.SpeechPattern))
	}
	if update.CurrentState != nil {
		sets = append(sets, "current_state = ?")
		args = append(args, strings.TrimSpace(*update.CurrentState))
	}
	if update.CustomStatus != nil {
		payload, err := marshalJSONObject(update.CustomStatus)
		if err != nil {
			return database.Character{}, err
		}
		sets = append(sets, "custom_status_json = ?")
		args = append(args, payload)
	}

	if len(sets) == 0 {
		return current, nil
	}

	sets = append(sets, "updated_at = CURRENT_TIMESTAMP")
	args = append(args, id)
	result, err := s.db.Exec(
		fmt.Sprintf("UPDATE characters SET %s WHERE id = ?", strings.Join(sets, ", ")),
		args...,
	)
	if err != nil {
		return database.Character{}, fmt.Errorf("更新角色失败: %w", err)
	}
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return database.Character{}, fmt.Errorf("确认角色更新结果失败: %w", err)
	}
	if rowsAffected == 0 {
		return database.Character{}, errors.New("角色不存在")
	}
	return s.Get(id)
}

func (s *CharacterService) Delete(id string) error {
	result, err := s.db.Exec(`DELETE FROM characters WHERE id = ?`, id)
	if err != nil {
		return fmt.Errorf("删除角色失败: %w", err)
	}
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("确认角色删除结果失败: %w", err)
	}
	if rowsAffected == 0 {
		return errors.New("角色不存在")
	}
	return nil
}

func (s *CharacterService) CreateRelation(input database.CreateCharacterRelationInput) (database.CharacterRelation, error) {
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
	if err := s.ensureCharacterBelongsToProject(projectID, fromID); err != nil {
		return database.CharacterRelation{}, err
	}
	if err := s.ensureCharacterBelongsToProject(projectID, toID); err != nil {
		return database.CharacterRelation{}, err
	}

	strength := 50
	if input.Strength != nil {
		strength = *input.Strength
	}

	relationID := uuid.NewString()
	_, err := s.db.Exec(
		`INSERT INTO character_relations (id, project_id, from_id, to_id, type, strength, notes, valid_from_chapter_id, valid_until_chapter_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		relationID,
		projectID,
		fromID,
		toID,
		relationType,
		strength,
		strings.TrimSpace(input.Notes),
		nullStringValue(input.ValidFromChapterID),
		nullStringValue(input.ValidUntilChapterID),
	)
	if err != nil {
		return database.CharacterRelation{}, fmt.Errorf("创建角色关系失败: %w", err)
	}
	return s.getRelation(relationID)
}

func (s *CharacterService) ListRelations(projectID string, characterID string) ([]database.CharacterRelation, error) {
	baseQuery := `SELECT id, project_id, from_id, to_id, type, COALESCE(strength, 50), COALESCE(notes, ''), COALESCE(valid_from_chapter_id, ''), COALESCE(valid_until_chapter_id, ''), COALESCE(created_at, ''), COALESCE(updated_at, '') FROM character_relations WHERE project_id = ?`
	args := []any{projectID}
	if strings.TrimSpace(characterID) != "" {
		baseQuery += ` AND (from_id = ? OR to_id = ?)`
		args = append(args, characterID, characterID)
	}
	baseQuery += ` ORDER BY updated_at DESC, created_at DESC`

	rows, err := s.db.Query(baseQuery, args...)
	if err != nil {
		return nil, fmt.Errorf("查询角色关系列表失败: %w", err)
	}
	defer rows.Close()

	items := make([]database.CharacterRelation, 0)
	for rows.Next() {
		relation, err := scanCharacterRelation(rows)
		if err != nil {
			return nil, err
		}
		items = append(items, relation)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("读取角色关系列表失败: %w", err)
	}
	return items, nil
}

func (s *CharacterService) DeleteRelation(id string) error {
	result, err := s.db.Exec(`DELETE FROM character_relations WHERE id = ?`, id)
	if err != nil {
		return fmt.Errorf("删除角色关系失败: %w", err)
	}
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("确认角色关系删除结果失败: %w", err)
	}
	if rowsAffected == 0 {
		return errors.New("角色关系不存在")
	}
	return nil
}

func (s *CharacterService) getRelation(id string) (database.CharacterRelation, error) {
	row := s.db.QueryRow(
		`SELECT id, project_id, from_id, to_id, type, COALESCE(strength, 50), COALESCE(notes, ''), COALESCE(valid_from_chapter_id, ''), COALESCE(valid_until_chapter_id, ''), COALESCE(created_at, ''), COALESCE(updated_at, '') FROM character_relations WHERE id = ?`,
		id,
	)
	return scanCharacterRelation(row)
}

func (s *CharacterService) ensureCharacterBelongsToProject(projectID string, characterID string) error {
	var exists int
	err := s.db.QueryRow(
		`SELECT 1 FROM characters WHERE id = ? AND project_id = ? LIMIT 1`,
		characterID,
		projectID,
	).Scan(&exists)
	if errors.Is(err, sql.ErrNoRows) {
		return errors.New("角色不存在")
	}
	if err != nil {
		return fmt.Errorf("查询角色失败: %w", err)
	}
	return nil
}

type characterScanner interface {
	Scan(dest ...any) error
}

func scanCharacter(scanner characterScanner) (database.Character, error) {
	var item database.Character
	var aliasJSON string
	var traitsJSON string
	var customStatusJSON string
	err := scanner.Scan(
		&item.ID,
		&item.ProjectID,
		&item.Name,
		&aliasJSON,
		&item.Summary,
		&traitsJSON,
		&item.Background,
		&item.AvatarURL,
		&item.PersonalityPrompt,
		&item.SpeechPattern,
		&item.CurrentState,
		&customStatusJSON,
		&item.CreatedAt,
		&item.UpdatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return database.Character{}, errors.New("角色不存在")
	}
	if err != nil {
		return database.Character{}, fmt.Errorf("读取角色失败: %w", err)
	}

	item.Alias = unmarshalStringSlice(aliasJSON)
	item.Traits = unmarshalStringSlice(traitsJSON)
	item.CustomStatus = unmarshalJSONObject(customStatusJSON)
	return item, nil
}

func scanCharacterRelation(scanner characterScanner) (database.CharacterRelation, error) {
	var item database.CharacterRelation
	err := scanner.Scan(
		&item.ID,
		&item.ProjectID,
		&item.FromID,
		&item.ToID,
		&item.Type,
		&item.Strength,
		&item.Notes,
		&item.ValidFromChapterID,
		&item.ValidUntilChapterID,
		&item.CreatedAt,
		&item.UpdatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return database.CharacterRelation{}, errors.New("角色关系不存在")
	}
	if err != nil {
		return database.CharacterRelation{}, fmt.Errorf("读取角色关系失败: %w", err)
	}
	return item, nil
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
