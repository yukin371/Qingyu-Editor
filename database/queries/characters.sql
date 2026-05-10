-- name: CreateCharacter :exec
INSERT INTO characters (
    id,
    project_id,
    name,
    alias_json,
    summary,
    traits_json,
    background,
    avatar_url,
    personality_prompt,
    speech_pattern,
    current_state,
    custom_status_json
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);

-- name: GetCharacterByID :one
SELECT
    id,
    project_id,
    name,
    alias_json,
    COALESCE(summary, '') AS summary,
    traits_json,
    COALESCE(background, '') AS background,
    COALESCE(avatar_url, '') AS avatar_url,
    COALESCE(personality_prompt, '') AS personality_prompt,
    COALESCE(speech_pattern, '') AS speech_pattern,
    COALESCE(current_state, '') AS current_state,
    custom_status_json,
    COALESCE(created_at, '') AS created_at,
    COALESCE(updated_at, '') AS updated_at
FROM characters
WHERE id = ?;

-- name: ListCharactersByProject :many
SELECT
    id,
    project_id,
    name,
    alias_json,
    COALESCE(summary, '') AS summary,
    traits_json,
    COALESCE(background, '') AS background,
    COALESCE(avatar_url, '') AS avatar_url,
    COALESCE(personality_prompt, '') AS personality_prompt,
    COALESCE(speech_pattern, '') AS speech_pattern,
    COALESCE(current_state, '') AS current_state,
    custom_status_json,
    COALESCE(created_at, '') AS created_at,
    COALESCE(updated_at, '') AS updated_at
FROM characters
WHERE project_id = ?
ORDER BY updated_at DESC, created_at DESC;

-- name: UpdateCharacterByID :execrows
UPDATE characters
SET name = ?,
    alias_json = ?,
    summary = ?,
    traits_json = ?,
    background = ?,
    avatar_url = ?,
    personality_prompt = ?,
    speech_pattern = ?,
    current_state = ?,
    custom_status_json = ?,
    updated_at = CURRENT_TIMESTAMP
WHERE id = ?;

-- name: DeleteCharacterByID :execrows
DELETE FROM characters
WHERE id = ?;

-- name: CharacterExistsInProject :one
SELECT EXISTS(
    SELECT 1 FROM characters WHERE id = ? AND project_id = ? LIMIT 1
);

-- name: CreateCharacterRelation :exec
INSERT INTO character_relations (
    id,
    project_id,
    from_id,
    to_id,
    type,
    strength,
    notes,
    valid_from_chapter_id,
    valid_until_chapter_id
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);

-- name: GetCharacterRelationByID :one
SELECT
    id,
    project_id,
    from_id,
    to_id,
    type,
    COALESCE(strength, 50) AS strength,
    COALESCE(notes, '') AS notes,
    COALESCE(valid_from_chapter_id, '') AS valid_from_chapter_id,
    COALESCE(valid_until_chapter_id, '') AS valid_until_chapter_id,
    COALESCE(created_at, '') AS created_at,
    COALESCE(updated_at, '') AS updated_at
FROM character_relations
WHERE id = ?;

-- name: ListCharacterRelationsByProject :many
SELECT
    id,
    project_id,
    from_id,
    to_id,
    type,
    COALESCE(strength, 50) AS strength,
    COALESCE(notes, '') AS notes,
    COALESCE(valid_from_chapter_id, '') AS valid_from_chapter_id,
    COALESCE(valid_until_chapter_id, '') AS valid_until_chapter_id,
    COALESCE(created_at, '') AS created_at,
    COALESCE(updated_at, '') AS updated_at
FROM character_relations
WHERE project_id = ?
ORDER BY updated_at DESC, created_at DESC;

-- name: ListCharacterRelationsByCharacter :many
SELECT
    id,
    project_id,
    from_id,
    to_id,
    type,
    COALESCE(strength, 50) AS strength,
    COALESCE(notes, '') AS notes,
    COALESCE(valid_from_chapter_id, '') AS valid_from_chapter_id,
    COALESCE(valid_until_chapter_id, '') AS valid_until_chapter_id,
    COALESCE(created_at, '') AS created_at,
    COALESCE(updated_at, '') AS updated_at
FROM character_relations
WHERE project_id = ? AND (from_id = ? OR to_id = ?)
ORDER BY updated_at DESC, created_at DESC;

-- name: DeleteCharacterRelationByID :execrows
DELETE FROM character_relations
WHERE id = ?;
