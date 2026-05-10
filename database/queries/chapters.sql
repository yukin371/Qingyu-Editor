-- name: CreateChapter :exec
INSERT INTO chapters (id, project_id, volume_id, title, content, plain_text, word_count, sort_order, status)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);

-- name: GetChapterByID :one
SELECT
    id,
    project_id,
    COALESCE(volume_id, '') AS volume_id,
    title,
    COALESCE(content, '') AS content,
    COALESCE(plain_text, '') AS plain_text,
    COALESCE(word_count, 0) AS word_count,
    COALESCE(sort_order, 0) AS sort_order,
    COALESCE(status, 'draft') AS status,
    COALESCE(created_at, '') AS created_at,
    COALESCE(updated_at, '') AS updated_at
FROM chapters
WHERE id = ?;

-- name: ListChaptersByProject :many
SELECT
    id,
    project_id,
    COALESCE(volume_id, '') AS volume_id,
    title,
    COALESCE(content, '') AS content,
    COALESCE(plain_text, '') AS plain_text,
    COALESCE(word_count, 0) AS word_count,
    COALESCE(sort_order, 0) AS sort_order,
    COALESCE(status, 'draft') AS status,
    COALESCE(created_at, '') AS created_at,
    COALESCE(updated_at, '') AS updated_at
FROM chapters
WHERE project_id = ?
ORDER BY CASE WHEN volume_id IS NULL THEN 0 ELSE 1 END ASC, volume_id ASC, sort_order ASC, created_at ASC;

-- name: UpdateChapterByID :execrows
UPDATE chapters
SET volume_id = ?,
    title = ?,
    content = ?,
    plain_text = ?,
    word_count = ?,
    sort_order = ?,
    status = ?,
    updated_at = CURRENT_TIMESTAMP
WHERE id = ?;

-- name: DeleteChapterByID :execrows
DELETE FROM chapters
WHERE id = ?;

-- name: ReorderChapterByProject :exec
UPDATE chapters
SET sort_order = ?,
    updated_at = CURRENT_TIMESTAMP
WHERE id = ? AND project_id = ?;

-- name: ReorderChapterByID :exec
UPDATE chapters
SET sort_order = ?,
    updated_at = CURRENT_TIMESTAMP
WHERE id = ?;

-- name: UpdateChapterVolumeByID :exec
UPDATE chapters
SET volume_id = ?,
    updated_at = CURRENT_TIMESTAMP
WHERE id = ?;

-- name: NextRootChapterSortOrder :one
SELECT COALESCE(MAX(sort_order), -1) + 1
FROM chapters
WHERE project_id = ? AND volume_id IS NULL;

-- name: NextVolumeChapterSortOrder :one
SELECT COALESCE(MAX(sort_order), -1) + 1
FROM chapters
WHERE project_id = ? AND volume_id = ?;

-- name: VolumeExistsInProject :one
SELECT EXISTS(
    SELECT 1 FROM volumes WHERE id = ? AND project_id = ? LIMIT 1
);

-- name: RefreshProjectWordCount :exec
UPDATE projects
SET word_count = COALESCE((SELECT SUM(word_count) FROM chapters WHERE project_id = ?), 0),
    updated_at = CURRENT_TIMESTAMP
WHERE projects.id = ?;

-- name: ListRootChapterIDsByScope :many
SELECT id
FROM chapters
WHERE project_id = ? AND volume_id IS NULL AND id <> ?
ORDER BY sort_order ASC, created_at ASC;

-- name: ListVolumeChapterIDsByScope :many
SELECT id
FROM chapters
WHERE project_id = ? AND volume_id = ? AND id <> ?
ORDER BY sort_order ASC, created_at ASC;
