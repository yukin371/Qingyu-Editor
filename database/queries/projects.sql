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
    CAST(COUNT(c.id) AS INTEGER) AS chapter_count,
    COALESCE(p.created_at, '') AS created_at,
    COALESCE(p.updated_at, '') AS updated_at
FROM projects p
LEFT JOIN chapters c ON c.project_id = p.id
WHERE p.id = ?
GROUP BY p.id, p.title, p.description, p.cover_path, p.word_count, p.status, p.created_at, p.updated_at;

-- name: ListProjects :many
SELECT
    p.id,
    p.title,
    COALESCE(p.description, '') AS description,
    COALESCE(p.cover_path, '') AS cover_path,
    COALESCE(p.word_count, 0) AS word_count,
    COALESCE(p.status, 'draft') AS status,
    CAST(COUNT(c.id) AS INTEGER) AS chapter_count,
    COALESCE(p.created_at, '') AS created_at,
    COALESCE(p.updated_at, '') AS updated_at
FROM projects p
LEFT JOIN chapters c ON c.project_id = p.id
GROUP BY p.id, p.title, p.description, p.cover_path, p.word_count, p.status, p.created_at, p.updated_at
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
