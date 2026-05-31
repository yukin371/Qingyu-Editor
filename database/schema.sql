CREATE TABLE IF NOT EXISTS projects (
    id          TEXT PRIMARY KEY,
    title       TEXT NOT NULL,
    description TEXT,
    cover_path  TEXT,
    word_count  INTEGER DEFAULT 0,
    status      TEXT DEFAULT 'draft',
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS volumes (
    id          TEXT PRIMARY KEY,
    project_id  TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    sort_order  INTEGER NOT NULL,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chapters (
    id          TEXT PRIMARY KEY,
    project_id  TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    volume_id   TEXT REFERENCES volumes(id) ON DELETE SET NULL,
    title       TEXT NOT NULL,
    content     TEXT NOT NULL DEFAULT '{}',
    plain_text  TEXT,
    word_count  INTEGER DEFAULT 0,
    sort_order  INTEGER NOT NULL,
    status      TEXT DEFAULT 'draft',
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS snapshots (
    id          TEXT PRIMARY KEY,
    project_id  TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    chapter_id  TEXT REFERENCES chapters(id) ON DELETE CASCADE,
    label       TEXT,
    content     TEXT NOT NULL,
    word_count  INTEGER DEFAULT 0,
    trigger     TEXT DEFAULT 'auto',
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS characters (
    id                  TEXT PRIMARY KEY,
    project_id          TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name                TEXT NOT NULL,
    alias_json          TEXT NOT NULL DEFAULT '[]',
    summary             TEXT DEFAULT '',
    traits_json         TEXT NOT NULL DEFAULT '[]',
    background          TEXT DEFAULT '',
    avatar_url          TEXT DEFAULT '',
    personality_prompt  TEXT DEFAULT '',
    speech_pattern      TEXT DEFAULT '',
    current_state       TEXT DEFAULT '',
    custom_status_json  TEXT NOT NULL DEFAULT '{}',
    created_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS character_relations (
    id                     TEXT PRIMARY KEY,
    project_id             TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    from_id                TEXT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    to_id                  TEXT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    type                   TEXT NOT NULL,
    strength               INTEGER NOT NULL DEFAULT 50,
    notes                  TEXT DEFAULT '',
    valid_from_chapter_id  TEXT REFERENCES chapters(id) ON DELETE SET NULL,
    valid_until_chapter_id TEXT REFERENCES chapters(id) ON DELETE SET NULL,
    created_at             DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at             DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS locations (
    id           TEXT PRIMARY KEY,
    project_id   TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name         TEXT NOT NULL,
    description  TEXT DEFAULT '',
    climate      TEXT DEFAULT '',
    culture      TEXT DEFAULT '',
    geography    TEXT DEFAULT '',
    atmosphere   TEXT DEFAULT '',
    parent_id    TEXT REFERENCES locations(id) ON DELETE SET NULL,
    image_url    TEXT DEFAULT '',
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS location_relations (
    id          TEXT PRIMARY KEY,
    project_id  TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    from_id     TEXT NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    to_id       TEXT NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    type        TEXT NOT NULL,
    distance    TEXT DEFAULT '',
    notes       TEXT DEFAULT '',
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS creative_workflows (
    project_id            TEXT PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
    template_id           TEXT,
    pitch_line            TEXT NOT NULL DEFAULT '',
    target_audience_json  TEXT NOT NULL DEFAULT '[]',
    core_promises_json    TEXT NOT NULL DEFAULT '[]',
    pace_contract         TEXT NOT NULL DEFAULT '',
    golden_chapters_json  TEXT NOT NULL DEFAULT '[]',
    created_at            DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at            DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inspiration_notes (
    id             TEXT PRIMARY KEY,
    project_id     TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    chapter_id     TEXT REFERENCES chapters(id) ON DELETE SET NULL,
    chapter_title  TEXT NOT NULL DEFAULT '',
    title          TEXT NOT NULL,
    content        TEXT NOT NULL,
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS timelines (
    id              TEXT PRIMARY KEY,
    project_id      TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    description     TEXT NOT NULL DEFAULT '',
    start_time_json TEXT NOT NULL DEFAULT '{}',
    end_time_json   TEXT NOT NULL DEFAULT '{}',
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS timeline_events (
    id                TEXT PRIMARY KEY,
    project_id        TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    timeline_id       TEXT NOT NULL REFERENCES timelines(id) ON DELETE CASCADE,
    title             TEXT NOT NULL,
    description       TEXT NOT NULL DEFAULT '',
    story_time_json   TEXT NOT NULL DEFAULT '{}',
    duration          TEXT NOT NULL DEFAULT '',
    impact            TEXT NOT NULL DEFAULT '',
    participants_json TEXT NOT NULL DEFAULT '[]',
    location_ids_json TEXT NOT NULL DEFAULT '[]',
    chapter_ids_json  TEXT NOT NULL DEFAULT '[]',
    event_type        TEXT NOT NULL DEFAULT 'plot',
    importance        INTEGER NOT NULL DEFAULT 5,
    created_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS story_harness_batches (
    batch_id             TEXT PRIMARY KEY,
    project_id           TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    chapter_id           TEXT NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    chapter_title        TEXT NOT NULL DEFAULT '',
    committed_at         INTEGER NOT NULL,
    source               TEXT NOT NULL,
    change_requests_json TEXT NOT NULL DEFAULT '[]',
    created_at           DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at           DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS story_harness_change_requests (
    id                    TEXT PRIMARY KEY,
    batch_id              TEXT NOT NULL REFERENCES story_harness_batches(batch_id) ON DELETE CASCADE,
    project_id            TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    chapter_id            TEXT NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    category              TEXT NOT NULL,
    priority              TEXT NOT NULL,
    status                TEXT NOT NULL DEFAULT 'pending',
    title                 TEXT NOT NULL,
    description           TEXT NOT NULL DEFAULT '',
    suggested_change_json TEXT NOT NULL DEFAULT '{}',
    evidence_json         TEXT NOT NULL DEFAULT '[]',
    source                TEXT NOT NULL DEFAULT 'local',
    created_at            DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at            DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chapters_project ON chapters(project_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_snapshots_project ON snapshots(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_snapshots_chapter ON snapshots(chapter_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_characters_project ON characters(project_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_character_relations_project ON character_relations(project_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_character_relations_from ON character_relations(from_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_character_relations_to ON character_relations(to_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_locations_project ON locations(project_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_locations_parent ON locations(project_id, parent_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_location_relations_project ON location_relations(project_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_inspiration_notes_project ON inspiration_notes(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_timelines_project ON timelines(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_timeline_events_timeline ON timeline_events(timeline_id, created_at DESC);
CREATE TABLE IF NOT EXISTS agent_conversations (
    id          TEXT PRIMARY KEY,
    project_id  TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title       TEXT NOT NULL DEFAULT '',
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agent_messages (
    id              TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL REFERENCES agent_conversations(id) ON DELETE CASCADE,
    role            TEXT NOT NULL,
    content         TEXT NOT NULL,
    suggestions_json TEXT NOT NULL DEFAULT '[]',
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_agent_conversations_project ON agent_conversations(project_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_messages_conversation ON agent_messages(conversation_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_story_harness_batches_project_chapter ON story_harness_batches(project_id, chapter_id, committed_at DESC);
CREATE INDEX IF NOT EXISTS idx_story_harness_change_requests_chapter_status ON story_harness_change_requests(chapter_id, status, created_at DESC);
