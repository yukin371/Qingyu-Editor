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

type ChapterService struct {
	db *sql.DB
}

func NewChapterService(db *sql.DB) *ChapterService {
	return &ChapterService{db: db}
}

func (s *ChapterService) Create(input database.CreateChapterInput) (database.Chapter, error) {
	projectID := strings.TrimSpace(input.ProjectID)
	title := strings.TrimSpace(input.Title)
	if projectID == "" {
		return database.Chapter{}, errors.New("projectId 不能为空")
	}
	if title == "" {
		return database.Chapter{}, errors.New("章节标题不能为空")
	}
	if err := ensureProjectExists(s.db, projectID); err != nil {
		return database.Chapter{}, err
	}

	volumeID := normalizeOptionalString(input.VolumeID)
	if volumeID != "" {
		if err := s.ensureVolumeBelongsToProject(projectID, volumeID); err != nil {
			return database.Chapter{}, err
		}
	}

	sortOrder, err := s.resolveNextSortOrder(projectID, volumeID, input.SortOrder)
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
	_, err = s.db.Exec(
		`INSERT INTO chapters (id, project_id, volume_id, title, content, plain_text, word_count, sort_order, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		chapterID,
		projectID,
		nullStringValue(volumeID),
		title,
		content,
		plainText,
		wordCount,
		sortOrder,
		status,
	)
	if err != nil {
		return database.Chapter{}, fmt.Errorf("创建章节失败: %w", err)
	}

	if err := s.refreshProjectWordCount(projectID); err != nil {
		return database.Chapter{}, err
	}

	return s.Get(chapterID)
}

func (s *ChapterService) Get(id string) (database.Chapter, error) {
	const query = `
	SELECT
		id,
		project_id,
		COALESCE(volume_id, ''),
		title,
		COALESCE(content, ''),
		COALESCE(plain_text, ''),
		COALESCE(word_count, 0),
		COALESCE(sort_order, 0),
		COALESCE(status, 'draft'),
		COALESCE(created_at, ''),
		COALESCE(updated_at, '')
	FROM chapters
	WHERE id = ?
	`

	var chapter database.Chapter
	err := s.db.QueryRow(query, id).Scan(
		&chapter.ID,
		&chapter.ProjectID,
		&chapter.VolumeID,
		&chapter.Title,
		&chapter.Content,
		&chapter.PlainText,
		&chapter.WordCount,
		&chapter.SortOrder,
		&chapter.Status,
		&chapter.CreatedAt,
		&chapter.UpdatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return database.Chapter{}, errors.New("章节不存在")
	}
	if err != nil {
		return database.Chapter{}, fmt.Errorf("查询章节失败: %w", err)
	}

	return chapter, nil
}

func (s *ChapterService) List(projectID string) ([]database.Chapter, error) {
	rows, err := s.db.Query(
		`SELECT id, project_id, COALESCE(volume_id, ''), title, COALESCE(content, ''), COALESCE(plain_text, ''), COALESCE(word_count, 0), COALESCE(sort_order, 0), COALESCE(status, 'draft'), COALESCE(created_at, ''), COALESCE(updated_at, '') FROM chapters WHERE project_id = ? ORDER BY CASE WHEN volume_id IS NULL THEN 0 ELSE 1 END ASC, volume_id ASC, sort_order ASC, created_at ASC`,
		projectID,
	)
	if err != nil {
		return nil, fmt.Errorf("查询章节列表失败: %w", err)
	}
	defer rows.Close()

	chapters := make([]database.Chapter, 0)
	for rows.Next() {
		var chapter database.Chapter
		if err := rows.Scan(
			&chapter.ID,
			&chapter.ProjectID,
			&chapter.VolumeID,
			&chapter.Title,
			&chapter.Content,
			&chapter.PlainText,
			&chapter.WordCount,
			&chapter.SortOrder,
			&chapter.Status,
			&chapter.CreatedAt,
			&chapter.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("扫描章节失败: %w", err)
		}
		chapters = append(chapters, chapter)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("读取章节列表失败: %w", err)
	}

	return chapters, nil
}

func (s *ChapterService) Update(id string, update database.ChapterUpdate) (database.Chapter, error) {
	current, err := s.Get(id)
	if err != nil {
		return database.Chapter{}, err
	}

	sets := make([]string, 0, 7)
	args := make([]any, 0, 8)

	nextContent := current.Content
	nextPlainText := current.PlainText
	nextWordCount := current.WordCount

	if update.Title != nil {
		title := strings.TrimSpace(*update.Title)
		if title == "" {
			return database.Chapter{}, errors.New("章节标题不能为空")
		}
		sets = append(sets, "title = ?")
		args = append(args, title)
	}

	if update.VolumeID != nil {
		volumeID := normalizeOptionalString(*update.VolumeID)
		if volumeID != "" {
			if err := s.ensureVolumeBelongsToProject(current.ProjectID, volumeID); err != nil {
				return database.Chapter{}, err
			}
		}
		sets = append(sets, "volume_id = ?")
		args = append(args, nullStringValue(volumeID))
	}

	if update.Content != nil {
		nextContent = *update.Content
		sets = append(sets, "content = ?")
		args = append(args, nextContent)
	}

	if update.PlainText != nil {
		nextPlainText = *update.PlainText
	}
	if update.Content != nil && update.PlainText == nil {
		nextPlainText = extractPlainText(nextContent)
	}
	if update.PlainText != nil || update.Content != nil {
		sets = append(sets, "plain_text = ?")
		args = append(args, nextPlainText)
	}

	if update.WordCount != nil {
		nextWordCount = *update.WordCount
	} else if update.Content != nil || update.PlainText != nil {
		nextWordCount = countWords(nextPlainText)
	}
	if update.WordCount != nil || update.Content != nil || update.PlainText != nil {
		sets = append(sets, "word_count = ?")
		args = append(args, nextWordCount)
	}

	if update.SortOrder != nil {
		sets = append(sets, "sort_order = ?")
		args = append(args, *update.SortOrder)
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
		return current, nil
	}

	sets = append(sets, "updated_at = CURRENT_TIMESTAMP")
	args = append(args, id)

	query := fmt.Sprintf("UPDATE chapters SET %s WHERE id = ?", strings.Join(sets, ", "))
	result, err := s.db.Exec(query, args...)
	if err != nil {
		return database.Chapter{}, fmt.Errorf("更新章节失败: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return database.Chapter{}, fmt.Errorf("确认章节更新结果失败: %w", err)
	}
	if rowsAffected == 0 {
		return database.Chapter{}, errors.New("章节不存在")
	}

	if err := s.refreshProjectWordCount(current.ProjectID); err != nil {
		return database.Chapter{}, err
	}

	return s.Get(id)
}

func (s *ChapterService) Delete(id string) error {
	chapter, err := s.Get(id)
	if err != nil {
		return err
	}

	result, err := s.db.Exec(`DELETE FROM chapters WHERE id = ?`, id)
	if err != nil {
		return fmt.Errorf("删除章节失败: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("确认章节删除结果失败: %w", err)
	}
	if rowsAffected == 0 {
		return errors.New("章节不存在")
	}

	if err := s.refreshProjectWordCount(chapter.ProjectID); err != nil {
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

	for index, id := range input.OrderedIDs {
		if _, err := tx.Exec(
			`UPDATE chapters SET sort_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND project_id = ?`,
			index,
			id,
			input.ProjectID,
		); err != nil {
			return fmt.Errorf("更新章节排序失败: %w", err)
		}
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("提交章节排序事务失败: %w", err)
	}

	return nil
}

func (s *ChapterService) Move(input database.MoveChapterInput) error {
	chapter, err := s.Get(input.ChapterID)
	if err != nil {
		return err
	}

	targetVolumeID := ""
	if input.TargetVolumeID != nil {
		targetVolumeID = normalizeOptionalString(*input.TargetVolumeID)
	}
	if targetVolumeID != "" {
		if err := s.ensureVolumeBelongsToProject(chapter.ProjectID, targetVolumeID); err != nil {
			return err
		}
	}

	oldVolumeID := normalizeOptionalString(chapter.VolumeID)
	if targetVolumeID == oldVolumeID {
		siblings, err := s.listChapterIDsByScope(chapter.ProjectID, oldVolumeID, chapter.ID)
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

	oldScope, err := s.listChapterIDsByScopeTx(tx, chapter.ProjectID, oldVolumeID, chapter.ID)
	if err != nil {
		return err
	}
	targetScope, err := s.listChapterIDsByScopeTx(tx, chapter.ProjectID, targetVolumeID, chapter.ID)
	if err != nil {
		return err
	}

	if _, err := tx.Exec(
		`UPDATE chapters SET volume_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
		nullStringValue(targetVolumeID),
		chapter.ID,
	); err != nil {
		return fmt.Errorf("更新章节所属卷失败: %w", err)
	}

	if err := s.rewriteChapterScopeOrderTx(tx, oldScope); err != nil {
		return err
	}
	if err := s.rewriteChapterScopeOrderTx(tx, insertAt(targetScope, chapter.ID, input.TargetIndex)); err != nil {
		return err
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("提交章节移动事务失败: %w", err)
	}

	return nil
}

func (s *ChapterService) resolveNextSortOrder(projectID string, volumeID string, candidate *int) (int, error) {
	if candidate != nil {
		return *candidate, nil
	}

	var next int
	var err error
	if volumeID == "" {
		err = s.db.QueryRow(
			`SELECT COALESCE(MAX(sort_order), -1) + 1 FROM chapters WHERE project_id = ? AND volume_id IS NULL`,
			projectID,
		).Scan(&next)
	} else {
		err = s.db.QueryRow(
			`SELECT COALESCE(MAX(sort_order), -1) + 1 FROM chapters WHERE project_id = ? AND volume_id = ?`,
			projectID,
			volumeID,
		).Scan(&next)
	}
	if err != nil {
		return 0, fmt.Errorf("计算章节排序失败: %w", err)
	}

	return next, nil
}

func (s *ChapterService) ensureVolumeBelongsToProject(projectID string, volumeID string) error {
	var exists int
	err := s.db.QueryRow(
		`SELECT 1 FROM volumes WHERE id = ? AND project_id = ? LIMIT 1`,
		volumeID,
		projectID,
	).Scan(&exists)
	if errors.Is(err, sql.ErrNoRows) {
		return errors.New("卷不存在")
	}
	if err != nil {
		return fmt.Errorf("查询卷失败: %w", err)
	}
	return nil
}

func (s *ChapterService) refreshProjectWordCount(projectID string) error {
	_, err := s.db.Exec(
		`UPDATE projects SET word_count = COALESCE((SELECT SUM(word_count) FROM chapters WHERE project_id = ?), 0), updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
		projectID,
		projectID,
	)
	if err != nil {
		return fmt.Errorf("刷新项目字数失败: %w", err)
	}
	return nil
}

func (s *ChapterService) listChapterIDsByScope(projectID string, volumeID string, excludeID string) ([]string, error) {
	rows, err := s.queryScopeRows(s.db, projectID, volumeID, excludeID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return readChapterIDs(rows)
}

func (s *ChapterService) listChapterIDsByScopeTx(tx *sql.Tx, projectID string, volumeID string, excludeID string) ([]string, error) {
	rows, err := s.queryScopeRows(tx, projectID, volumeID, excludeID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return readChapterIDs(rows)
}

type chapterRowQuerier interface {
	Query(query string, args ...any) (*sql.Rows, error)
}

func (s *ChapterService) queryScopeRows(querier chapterRowQuerier, projectID string, volumeID string, excludeID string) (*sql.Rows, error) {
	if volumeID == "" {
		rows, err := querier.Query(
			`SELECT id FROM chapters WHERE project_id = ? AND volume_id IS NULL AND id <> ? ORDER BY sort_order ASC, created_at ASC`,
			projectID,
			excludeID,
		)
		if err != nil {
			return nil, fmt.Errorf("查询根章节失败: %w", err)
		}
		return rows, nil
	}

	rows, err := querier.Query(
		`SELECT id FROM chapters WHERE project_id = ? AND volume_id = ? AND id <> ? ORDER BY sort_order ASC, created_at ASC`,
		projectID,
		volumeID,
		excludeID,
	)
	if err != nil {
		return nil, fmt.Errorf("查询卷内章节失败: %w", err)
	}
	return rows, nil
}

func (s *ChapterService) rewriteChapterScopeOrderTx(tx *sql.Tx, orderedIDs []string) error {
	for index, id := range orderedIDs {
		if _, err := tx.Exec(
			`UPDATE chapters SET sort_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
			index,
			id,
		); err != nil {
			return fmt.Errorf("重写章节排序失败: %w", err)
		}
	}
	return nil
}

func readChapterIDs(rows *sql.Rows) ([]string, error) {
	ids := make([]string, 0)
	for rows.Next() {
		var id string
		if err := rows.Scan(&id); err != nil {
			return nil, fmt.Errorf("扫描章节 ID 失败: %w", err)
		}
		ids = append(ids, id)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("读取章节 ID 失败: %w", err)
	}
	return ids, nil
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

func nullStringValue(value string) any {
	if strings.TrimSpace(value) == "" {
		return nil
	}
	return value
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
