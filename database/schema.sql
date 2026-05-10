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
