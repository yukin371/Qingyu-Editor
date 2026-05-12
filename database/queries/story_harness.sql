-- name: CreateStoryHarnessBatch :exec
INSERT INTO story_harness_batches (
    batch_id,
    project_id,
    chapter_id,
    chapter_title,
    committed_at,
    source,
    change_requests_json
) VALUES (?, ?, ?, ?, ?, ?, ?);

-- name: GetLatestStoryHarnessBatch :one
SELECT
    batch_id,
    project_id,
    chapter_id,
    COALESCE(chapter_title, '') AS chapter_title,
    committed_at,
    source,
    change_requests_json,
    created_at,
    updated_at
FROM story_harness_batches
WHERE project_id = ? AND chapter_id = ?
ORDER BY committed_at DESC
LIMIT 1;

-- name: DeleteStoryHarnessChangeRequestsByChapter :exec
DELETE FROM story_harness_change_requests
WHERE chapter_id = ?;

-- name: CreateStoryHarnessChangeRequest :exec
INSERT INTO story_harness_change_requests (
    id,
    batch_id,
    project_id,
    chapter_id,
    category,
    priority,
    status,
    title,
    description,
    suggested_change_json,
    evidence_json,
    source
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);

-- name: ListStoryHarnessChangeRequestsByChapterAndStatus :many
SELECT
    id,
    batch_id,
    project_id,
    chapter_id,
    category,
    priority,
    status,
    title,
    COALESCE(description, '') AS description,
    suggested_change_json,
    evidence_json,
    source,
    created_at,
    updated_at
FROM story_harness_change_requests
WHERE chapter_id = ? AND status = ?
ORDER BY created_at DESC, updated_at DESC;

-- name: GetStoryHarnessChangeRequestByID :one
SELECT
    id,
    batch_id,
    project_id,
    chapter_id,
    category,
    priority,
    status,
    title,
    COALESCE(description, '') AS description,
    suggested_change_json,
    evidence_json,
    source,
    created_at,
    updated_at
FROM story_harness_change_requests
WHERE id = ?;

-- name: UpdateStoryHarnessChangeRequestStatus :execrows
UPDATE story_harness_change_requests
SET status = ?,
    updated_at = CURRENT_TIMESTAMP
WHERE id = ?;

-- name: CountStoryHarnessChangeRequestsByChapterAndStatus :one
SELECT COUNT(1)
FROM story_harness_change_requests
WHERE chapter_id = ? AND status = ?;

-- name: GetLatestAcceptedStoryHarnessChangeRequestID :one
SELECT COALESCE(id, '')
FROM story_harness_change_requests
WHERE chapter_id = ? AND status = 'accepted'
ORDER BY updated_at DESC, created_at DESC
LIMIT 1;
