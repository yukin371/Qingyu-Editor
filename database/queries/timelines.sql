-- name: CreateTimeline :exec
INSERT INTO timelines (
    id,
    project_id,
    name,
    description,
    start_time_json,
    end_time_json
) VALUES (?, ?, ?, ?, ?, ?);

-- name: GetTimelineByID :one
SELECT
    id,
    project_id,
    name,
    COALESCE(description, '') AS description,
    start_time_json,
    end_time_json,
    created_at,
    updated_at
FROM timelines
WHERE id = ?;

-- name: ListTimelinesByProject :many
SELECT
    id,
    project_id,
    name,
    COALESCE(description, '') AS description,
    start_time_json,
    end_time_json,
    created_at,
    updated_at
FROM timelines
WHERE project_id = ?
ORDER BY created_at ASC, updated_at ASC;

-- name: UpdateTimelineByID :execrows
UPDATE timelines
SET name = ?,
    description = ?,
    start_time_json = ?,
    end_time_json = ?,
    updated_at = CURRENT_TIMESTAMP
WHERE id = ?;

-- name: DeleteTimelineByID :execrows
DELETE FROM timelines
WHERE id = ?;

-- name: CreateTimelineEvent :exec
INSERT INTO timeline_events (
    id,
    project_id,
    timeline_id,
    title,
    description,
    story_time_json,
    duration,
    impact,
    participants_json,
    location_ids_json,
    chapter_ids_json,
    event_type,
    importance
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);

-- name: GetTimelineEventByID :one
SELECT
    id,
    project_id,
    timeline_id,
    title,
    COALESCE(description, '') AS description,
    story_time_json,
    COALESCE(duration, '') AS duration,
    COALESCE(impact, '') AS impact,
    participants_json,
    location_ids_json,
    chapter_ids_json,
    COALESCE(event_type, 'plot') AS event_type,
    COALESCE(importance, 5) AS importance,
    created_at,
    updated_at
FROM timeline_events
WHERE id = ?;

-- name: ListTimelineEventsByTimeline :many
SELECT
    id,
    project_id,
    timeline_id,
    title,
    COALESCE(description, '') AS description,
    story_time_json,
    COALESCE(duration, '') AS duration,
    COALESCE(impact, '') AS impact,
    participants_json,
    location_ids_json,
    chapter_ids_json,
    COALESCE(event_type, 'plot') AS event_type,
    COALESCE(importance, 5) AS importance,
    created_at,
    updated_at
FROM timeline_events
WHERE timeline_id = ?
ORDER BY created_at ASC, updated_at ASC;

-- name: UpdateTimelineEventByID :execrows
UPDATE timeline_events
SET title = ?,
    description = ?,
    story_time_json = ?,
    duration = ?,
    impact = ?,
    participants_json = ?,
    location_ids_json = ?,
    chapter_ids_json = ?,
    event_type = ?,
    importance = ?,
    updated_at = CURRENT_TIMESTAMP
WHERE id = ?;

-- name: DeleteTimelineEventByID :execrows
DELETE FROM timeline_events
WHERE id = ?;
