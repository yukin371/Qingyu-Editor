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

type TimelineService struct {
	db      *sql.DB
	queries *sqlc.Queries
}

func NewTimelineService(db *sql.DB) *TimelineService {
	return &TimelineService{
		db:      db,
		queries: sqlc.New(db),
	}
}

func (s *TimelineService) Create(input database.CreateTimelineInput) (database.Timeline, error) {
	ctx := context.Background()
	projectID := strings.TrimSpace(input.ProjectID)
	name := strings.TrimSpace(input.Name)
	if projectID == "" {
		return database.Timeline{}, errors.New("projectId 不能为空")
	}
	if name == "" {
		return database.Timeline{}, errors.New("时间线名称不能为空")
	}
	if err := ensureProjectExists(ctx, s.queries, projectID); err != nil {
		return database.Timeline{}, err
	}

	startTimeJSON, err := marshalStoryTime(input.StartTime)
	if err != nil {
		return database.Timeline{}, err
	}
	endTimeJSON, err := marshalStoryTime(input.EndTime)
	if err != nil {
		return database.Timeline{}, err
	}

	id := uuid.NewString()
	if err := s.queries.CreateTimeline(ctx, sqlc.CreateTimelineParams{
		ID:            id,
		ProjectID:     projectID,
		Name:          name,
		Description:   strings.TrimSpace(input.Description),
		StartTimeJson: startTimeJSON,
		EndTimeJson:   endTimeJSON,
	}); err != nil {
		return database.Timeline{}, fmt.Errorf("创建时间线失败: %w", err)
	}

	return s.Get(id)
}

func (s *TimelineService) Get(id string) (database.Timeline, error) {
	row, err := s.getTimelineRow(strings.TrimSpace(id))
	if err != nil {
		return database.Timeline{}, err
	}
	return mapTimeline(row), nil
}

func (s *TimelineService) List(projectID string) ([]database.Timeline, error) {
	ctx := context.Background()
	projectID = strings.TrimSpace(projectID)
	if projectID == "" {
		return nil, errors.New("projectId 不能为空")
	}
	if err := ensureProjectExists(ctx, s.queries, projectID); err != nil {
		return nil, err
	}

	rows, err := s.queries.ListTimelinesByProject(ctx, projectID)
	if err != nil {
		return nil, fmt.Errorf("查询时间线列表失败: %w", err)
	}

	items := make([]database.Timeline, 0, len(rows))
	for _, row := range rows {
		items = append(items, mapTimeline(row))
	}
	return items, nil
}

func (s *TimelineService) Update(
	id string,
	update database.TimelineUpdate,
) (database.Timeline, error) {
	current, err := s.Get(id)
	if err != nil {
		return database.Timeline{}, err
	}

	next := current
	if update.Name != nil {
		name := strings.TrimSpace(*update.Name)
		if name == "" {
			return database.Timeline{}, errors.New("时间线名称不能为空")
		}
		next.Name = name
	}
	if update.Description != nil {
		next.Description = strings.TrimSpace(*update.Description)
	}
	if update.StartTime != nil {
		next.StartTime = *update.StartTime
	}
	if update.EndTime != nil {
		next.EndTime = *update.EndTime
	}

	startTimeJSON, err := marshalStoryTime(next.StartTime)
	if err != nil {
		return database.Timeline{}, err
	}
	endTimeJSON, err := marshalStoryTime(next.EndTime)
	if err != nil {
		return database.Timeline{}, err
	}

	rowsAffected, err := s.queries.UpdateTimelineByID(context.Background(), sqlc.UpdateTimelineByIDParams{
		ID:            strings.TrimSpace(id),
		Name:          next.Name,
		Description:   next.Description,
		StartTimeJson: startTimeJSON,
		EndTimeJson:   endTimeJSON,
	})
	if err != nil {
		return database.Timeline{}, fmt.Errorf("更新时间线失败: %w", err)
	}
	if rowsAffected == 0 {
		return database.Timeline{}, errors.New("时间线不存在")
	}
	return s.Get(id)
}

func (s *TimelineService) Delete(id string) error {
	rowsAffected, err := s.queries.DeleteTimelineByID(context.Background(), strings.TrimSpace(id))
	if err != nil {
		return fmt.Errorf("删除时间线失败: %w", err)
	}
	if rowsAffected == 0 {
		return errors.New("时间线不存在")
	}
	return nil
}

func (s *TimelineService) GetVisualization(timelineID string) (database.TimelineVisualization, error) {
	timeline, err := s.Get(timelineID)
	if err != nil {
		return database.TimelineVisualization{}, err
	}
	events, err := s.ListEvents(timelineID)
	if err != nil {
		return database.TimelineVisualization{}, err
	}
	return database.TimelineVisualization{
		Timeline: timeline,
		Events:   events,
	}, nil
}

func (s *TimelineService) CreateEvent(
	input database.CreateTimelineEventInput,
) (database.TimelineEvent, error) {
	ctx := context.Background()
	timelineRow, err := s.getTimelineRow(strings.TrimSpace(input.TimelineID))
	if err != nil {
		return database.TimelineEvent{}, err
	}
	if strings.TrimSpace(input.ProjectID) == "" {
		input.ProjectID = timelineRow.ProjectID
	}
	if timelineRow.ProjectID != strings.TrimSpace(input.ProjectID) {
		return database.TimelineEvent{}, errors.New("时间线不属于当前项目")
	}
	if err := ensureProjectExists(ctx, s.queries, input.ProjectID); err != nil {
		return database.TimelineEvent{}, err
	}

	title := strings.TrimSpace(input.Title)
	if title == "" {
		return database.TimelineEvent{}, errors.New("时间线事件标题不能为空")
	}

	storyTimeJSON, err := marshalStoryTime(input.StoryTime)
	if err != nil {
		return database.TimelineEvent{}, err
	}
	participantsJSON, err := marshalStringSlice(input.Participants)
	if err != nil {
		return database.TimelineEvent{}, err
	}
	locationIDsJSON, err := marshalStringSlice(input.LocationIDs)
	if err != nil {
		return database.TimelineEvent{}, err
	}
	chapterIDsJSON, err := marshalStringSlice(input.ChapterIDs)
	if err != nil {
		return database.TimelineEvent{}, err
	}

	importance := 5
	if input.Importance != nil {
		importance = *input.Importance
	}

	id := uuid.NewString()
	if err := s.queries.CreateTimelineEvent(ctx, sqlc.CreateTimelineEventParams{
		ID:               id,
		ProjectID:        input.ProjectID,
		TimelineID:       timelineRow.ID,
		Title:            title,
		Description:      strings.TrimSpace(input.Description),
		StoryTimeJson:    storyTimeJSON,
		Duration:         strings.TrimSpace(input.Duration),
		Impact:           strings.TrimSpace(input.Impact),
		ParticipantsJson: participantsJSON,
		LocationIdsJson:  locationIDsJSON,
		ChapterIdsJson:   chapterIDsJSON,
		EventType:        normalizeTimelineEventType(input.EventType),
		Importance:       int64(importance),
	}); err != nil {
		return database.TimelineEvent{}, fmt.Errorf("创建时间线事件失败: %w", err)
	}

	return s.GetEvent(id)
}

func (s *TimelineService) GetEvent(id string) (database.TimelineEvent, error) {
	row, err := s.getTimelineEventRow(strings.TrimSpace(id))
	if err != nil {
		return database.TimelineEvent{}, err
	}
	return mapTimelineEvent(row), nil
}

func (s *TimelineService) ListEvents(timelineID string) ([]database.TimelineEvent, error) {
	if strings.TrimSpace(timelineID) == "" {
		return nil, errors.New("timelineId 不能为空")
	}
	if _, err := s.getTimelineRow(timelineID); err != nil {
		return nil, err
	}

	rows, err := s.queries.ListTimelineEventsByTimeline(context.Background(), strings.TrimSpace(timelineID))
	if err != nil {
		return nil, fmt.Errorf("查询时间线事件失败: %w", err)
	}

	items := make([]database.TimelineEvent, 0, len(rows))
	for _, row := range rows {
		items = append(items, mapTimelineEvent(row))
	}
	return items, nil
}

func (s *TimelineService) UpdateEvent(
	id string,
	update database.TimelineEventUpdate,
) (database.TimelineEvent, error) {
	current, err := s.GetEvent(id)
	if err != nil {
		return database.TimelineEvent{}, err
	}

	next := current
	if update.Title != nil {
		title := strings.TrimSpace(*update.Title)
		if title == "" {
			return database.TimelineEvent{}, errors.New("时间线事件标题不能为空")
		}
		next.Title = title
	}
	if update.Description != nil {
		next.Description = strings.TrimSpace(*update.Description)
	}
	if update.StoryTime != nil {
		next.StoryTime = *update.StoryTime
	}
	if update.Duration != nil {
		next.Duration = strings.TrimSpace(*update.Duration)
	}
	if update.Impact != nil {
		next.Impact = strings.TrimSpace(*update.Impact)
	}
	if update.Participants != nil {
		next.Participants = normalizeDistinctStrings(update.Participants)
	}
	if update.LocationIDs != nil {
		next.LocationIDs = normalizeDistinctStrings(update.LocationIDs)
	}
	if update.ChapterIDs != nil {
		next.ChapterIDs = normalizeDistinctStrings(update.ChapterIDs)
	}
	if update.EventType != nil {
		next.EventType = normalizeTimelineEventType(*update.EventType)
	}
	if update.Importance != nil {
		next.Importance = *update.Importance
	}

	storyTimeJSON, err := marshalStoryTime(next.StoryTime)
	if err != nil {
		return database.TimelineEvent{}, err
	}
	participantsJSON, err := marshalStringSlice(next.Participants)
	if err != nil {
		return database.TimelineEvent{}, err
	}
	locationIDsJSON, err := marshalStringSlice(next.LocationIDs)
	if err != nil {
		return database.TimelineEvent{}, err
	}
	chapterIDsJSON, err := marshalStringSlice(next.ChapterIDs)
	if err != nil {
		return database.TimelineEvent{}, err
	}

	rowsAffected, err := s.queries.UpdateTimelineEventByID(context.Background(), sqlc.UpdateTimelineEventByIDParams{
		ID:               strings.TrimSpace(id),
		Title:            next.Title,
		Description:      next.Description,
		StoryTimeJson:    storyTimeJSON,
		Duration:         next.Duration,
		Impact:           next.Impact,
		ParticipantsJson: participantsJSON,
		LocationIdsJson:  locationIDsJSON,
		ChapterIdsJson:   chapterIDsJSON,
		EventType:        normalizeTimelineEventType(next.EventType),
		Importance:       int64(next.Importance),
	})
	if err != nil {
		return database.TimelineEvent{}, fmt.Errorf("更新时间线事件失败: %w", err)
	}
	if rowsAffected == 0 {
		return database.TimelineEvent{}, errors.New("时间线事件不存在")
	}
	return s.GetEvent(id)
}

func (s *TimelineService) DeleteEvent(id string) error {
	rowsAffected, err := s.queries.DeleteTimelineEventByID(context.Background(), strings.TrimSpace(id))
	if err != nil {
		return fmt.Errorf("删除时间线事件失败: %w", err)
	}
	if rowsAffected == 0 {
		return errors.New("时间线事件不存在")
	}
	return nil
}

func (s *TimelineService) getTimelineRow(id string) (sqlc.Timeline, error) {
	row, err := s.queries.GetTimelineByID(context.Background(), strings.TrimSpace(id))
	if errors.Is(err, sql.ErrNoRows) {
		return sqlc.Timeline{}, errors.New("时间线不存在")
	}
	if err != nil {
		return sqlc.Timeline{}, fmt.Errorf("查询时间线失败: %w", err)
	}
	return row, nil
}

func (s *TimelineService) getTimelineEventRow(id string) (sqlc.TimelineEvent, error) {
	row, err := s.queries.GetTimelineEventByID(context.Background(), strings.TrimSpace(id))
	if errors.Is(err, sql.ErrNoRows) {
		return sqlc.TimelineEvent{}, errors.New("时间线事件不存在")
	}
	if err != nil {
		return sqlc.TimelineEvent{}, fmt.Errorf("查询时间线事件失败: %w", err)
	}
	return row, nil
}

func mapTimeline(row sqlc.Timeline) database.Timeline {
	return database.Timeline{
		ID:          row.ID,
		ProjectID:   row.ProjectID,
		Name:        row.Name,
		Description: row.Description,
		StartTime:   unmarshalStoryTime(row.StartTimeJson),
		EndTime:     unmarshalStoryTime(row.EndTimeJson),
		CreatedAt:   formatSQLiteTime(row.CreatedAt),
		UpdatedAt:   formatSQLiteTime(row.UpdatedAt),
	}
}

func mapTimelineEvent(row sqlc.TimelineEvent) database.TimelineEvent {
	return database.TimelineEvent{
		ID:           row.ID,
		ProjectID:    row.ProjectID,
		TimelineID:   row.TimelineID,
		Title:        row.Title,
		Description:  row.Description,
		StoryTime:    unmarshalStoryTime(row.StoryTimeJson),
		Duration:     row.Duration,
		Impact:       row.Impact,
		Participants: unmarshalStringSlice(row.ParticipantsJson),
		LocationIDs:  unmarshalStringSlice(row.LocationIdsJson),
		ChapterIDs:   unmarshalStringSlice(row.ChapterIdsJson),
		EventType:    normalizeTimelineEventType(row.EventType),
		Importance:   int(row.Importance),
		CreatedAt:    formatSQLiteTime(row.CreatedAt),
		UpdatedAt:    formatSQLiteTime(row.UpdatedAt),
	}
}

func marshalStoryTime(value database.StoryTime) (string, error) {
	payload, err := json.Marshal(value)
	if err != nil {
		return "", fmt.Errorf("序列化故事时间失败: %w", err)
	}
	return string(payload), nil
}

func unmarshalStoryTime(payload string) database.StoryTime {
	if strings.TrimSpace(payload) == "" {
		return database.StoryTime{}
	}
	var value database.StoryTime
	if err := json.Unmarshal([]byte(payload), &value); err != nil {
		return database.StoryTime{}
	}
	return value
}

func normalizeTimelineEventType(value string) string {
	switch strings.TrimSpace(value) {
	case "character", "world", "background", "milestone":
		return strings.TrimSpace(value)
	default:
		return "plot"
	}
}
