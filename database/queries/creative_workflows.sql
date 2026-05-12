-- name: GetCreativeWorkflowByProject :one
SELECT
    project_id,
    COALESCE(template_id, '') AS template_id,
    COALESCE(pitch_line, '') AS pitch_line,
    target_audience_json,
    core_promises_json,
    COALESCE(pace_contract, '') AS pace_contract,
    golden_chapters_json,
    created_at,
    updated_at
FROM creative_workflows
WHERE project_id = ?;

-- name: UpsertCreativeWorkflow :exec
INSERT INTO creative_workflows (
    project_id,
    template_id,
    pitch_line,
    target_audience_json,
    core_promises_json,
    pace_contract,
    golden_chapters_json
) VALUES (?, ?, ?, ?, ?, ?, ?)
ON CONFLICT(project_id) DO UPDATE SET
    template_id = excluded.template_id,
    pitch_line = excluded.pitch_line,
    target_audience_json = excluded.target_audience_json,
    core_promises_json = excluded.core_promises_json,
    pace_contract = excluded.pace_contract,
    golden_chapters_json = excluded.golden_chapters_json,
    updated_at = CURRENT_TIMESTAMP;
