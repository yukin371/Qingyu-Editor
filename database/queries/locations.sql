-- name: CreateLocation :exec
INSERT INTO locations (
    id,
    project_id,
    name,
    description,
    climate,
    culture,
    geography,
    atmosphere,
    parent_id,
    image_url
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);

-- name: GetLocationByID :one
SELECT
    id,
    project_id,
    name,
    COALESCE(description, '') AS description,
    COALESCE(climate, '') AS climate,
    COALESCE(culture, '') AS culture,
    COALESCE(geography, '') AS geography,
    COALESCE(atmosphere, '') AS atmosphere,
    COALESCE(parent_id, '') AS parent_id,
    COALESCE(image_url, '') AS image_url,
    COALESCE(created_at, '') AS created_at,
    COALESCE(updated_at, '') AS updated_at
FROM locations
WHERE id = ?;

-- name: ListLocationsByProject :many
SELECT
    id,
    project_id,
    name,
    COALESCE(description, '') AS description,
    COALESCE(climate, '') AS climate,
    COALESCE(culture, '') AS culture,
    COALESCE(geography, '') AS geography,
    COALESCE(atmosphere, '') AS atmosphere,
    COALESCE(parent_id, '') AS parent_id,
    COALESCE(image_url, '') AS image_url,
    COALESCE(created_at, '') AS created_at,
    COALESCE(updated_at, '') AS updated_at
FROM locations
WHERE project_id = ?
ORDER BY CASE WHEN parent_id IS NULL THEN 0 ELSE 1 END ASC, parent_id ASC, updated_at DESC, created_at DESC;

-- name: UpdateLocationByID :execrows
UPDATE locations
SET name = ?,
    description = ?,
    climate = ?,
    culture = ?,
    geography = ?,
    atmosphere = ?,
    parent_id = ?,
    image_url = ?,
    updated_at = CURRENT_TIMESTAMP
WHERE id = ?;

-- name: DeleteLocationByID :execrows
DELETE FROM locations
WHERE id = ?;

-- name: LocationExistsInProject :one
SELECT EXISTS(
    SELECT 1 FROM locations WHERE id = ? AND project_id = ? LIMIT 1
);

-- name: CreateLocationRelation :exec
INSERT INTO location_relations (
    id,
    project_id,
    from_id,
    to_id,
    type,
    distance,
    notes
) VALUES (?, ?, ?, ?, ?, ?, ?);

-- name: GetLocationRelationByID :one
SELECT
    id,
    project_id,
    from_id,
    to_id,
    type,
    COALESCE(distance, '') AS distance,
    COALESCE(notes, '') AS notes,
    COALESCE(created_at, '') AS created_at,
    COALESCE(updated_at, '') AS updated_at
FROM location_relations
WHERE id = ?;

-- name: ListLocationRelationsByProject :many
SELECT
    id,
    project_id,
    from_id,
    to_id,
    type,
    COALESCE(distance, '') AS distance,
    COALESCE(notes, '') AS notes,
    COALESCE(created_at, '') AS created_at,
    COALESCE(updated_at, '') AS updated_at
FROM location_relations
WHERE project_id = ?
ORDER BY updated_at DESC, created_at DESC;

-- name: ListLocationRelationsByLocation :many
SELECT
    id,
    project_id,
    from_id,
    to_id,
    type,
    COALESCE(distance, '') AS distance,
    COALESCE(notes, '') AS notes,
    COALESCE(created_at, '') AS created_at,
    COALESCE(updated_at, '') AS updated_at
FROM location_relations
WHERE project_id = ? AND (from_id = ? OR to_id = ?)
ORDER BY updated_at DESC, created_at DESC;

-- name: DeleteLocationRelationByID :execrows
DELETE FROM location_relations
WHERE id = ?;
