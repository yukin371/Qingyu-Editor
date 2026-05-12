-- name: CreateInspirationNote :exec
INSERT INTO inspiration_notes (
    id,
    project_id,
    chapter_id,
    chapter_title,
    title,
    content
) VALUES (?, ?, ?, ?, ?, ?);

-- name: ListInspirationNotesByProject :many
SELECT
    id,
    project_id,
    COALESCE(chapter_id, '') AS chapter_id,
    COALESCE(chapter_title, '') AS chapter_title,
    title,
    content,
    created_at,
    updated_at
FROM inspiration_notes
WHERE project_id = ?
ORDER BY created_at DESC, updated_at DESC;

-- name: DeleteInspirationNoteByID :execrows
DELETE FROM inspiration_notes
WHERE id = ?;
