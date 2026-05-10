-- name: CreateVolume :exec
INSERT INTO volumes (id, project_id, title, sort_order)
VALUES (?, ?, ?, ?);

-- name: GetVolumeByID :one
SELECT
    id,
    project_id,
    title,
    sort_order,
    COALESCE(created_at, '') AS created_at
FROM volumes
WHERE id = ?;

-- name: ListVolumesByProject :many
SELECT
    id,
    project_id,
    title,
    sort_order,
    COALESCE(created_at, '') AS created_at
FROM volumes
WHERE project_id = ?
ORDER BY sort_order ASC, created_at ASC;

-- name: UpdateVolumeByID :execrows
UPDATE volumes
SET title = ?,
    sort_order = ?
WHERE id = ?;

-- name: DeleteVolumeByID :execrows
DELETE FROM volumes
WHERE id = ?;

-- name: ReorderVolumeByID :exec
UPDATE volumes
SET sort_order = ?
WHERE id = ? AND project_id = ?;

-- name: NextVolumeSortOrder :one
SELECT COALESCE(MAX(sort_order), -1) + 1
FROM volumes
WHERE project_id = ?;
