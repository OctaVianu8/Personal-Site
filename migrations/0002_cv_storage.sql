CREATE TABLE IF NOT EXISTS cv_files (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  original_filename TEXT    NOT NULL,
  storage_key       TEXT    NOT NULL UNIQUE,
  size_bytes        INTEGER NOT NULL,
  uploaded_at       TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS site_settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_cv_files_uploaded_at ON cv_files(uploaded_at DESC);
