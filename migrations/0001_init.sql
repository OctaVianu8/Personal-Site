CREATE TABLE IF NOT EXISTS albums (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    NOT NULL,
  slug       TEXT    NOT NULL UNIQUE,
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS photos (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  album_id      INTEGER NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
  filename      TEXT    NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_photos_album_id ON photos(album_id);
