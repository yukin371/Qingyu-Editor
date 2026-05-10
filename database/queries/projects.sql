-- name: CreateProject :exec
INSERT INTO projects (id, title, description, cover_path, status)
VALUES (?, ?, ?, ?, ?);

-- name: GetProject :one
SELECT
    p.id,
    p.title,
    COALESCE(p.description, '') AS description,
    COALESCE(p.cover_path, '') AS cover_path,
    COALESCE(p.word_count, 0) AS word_count,
    COALESCE(p.status, 'draft') AS status,
    CAST((
        SELECT COUNT(1)
        FROM chapters c
        WHERE c.project_id = p.id
    ) AS INTEGER) AS chapter_count,
    p.created_at,
    p.updated_at
FROM projects p
WHERE p.id = ?;

-- name: ListProjects :many
SELECT
    p.id,
    p.title,
    COALESCE(p.description, '') AS description,
    COALESCE(p.cover_path, '') AS cover_path,
    COALESCE(p.word_count, 0) AS word_count,
    COALESCE(p.status, 'draft') AS status,
    CAST((
        SELECT COUNT(1)
        FROM chapters c
        WHERE c.project_id = p.id
    ) AS INTEGER) AS chapter_count,
    p.created_at,
    p.updated_at
FROM projects p
ORDER BY p.updated_at DESC, p.created_at DESC;

-- name: UpdateProjectByID :execrows
UPDATE projects
SET title = ?,
    description = ?,
    cover_path = ?,
    status = ?,
    updated_at = CURRENT_TIMESTAMP
WHERE id = ?;

-- name: DeleteProjectByID :execrows
DELETE FROM projects
WHERE id = ?;

-- name: ProjectExists :one
SELECT EXISTS(
    SELECT 1 FROM projects WHERE id = ? LIMIT 1
);
