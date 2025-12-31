-- Enable foreign keys
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS diagnosis_sessions (
  id TEXT PRIMARY KEY,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS diagnosis_inputs (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  input_key TEXT NOT NULL,
  input_value TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES diagnosis_sessions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS diagnosis_outputs (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  disease_id TEXT NOT NULL,
  confidence REAL NOT NULL,
  explanation TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES diagnosis_sessions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS feedback (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  rating INTEGER,
  comment TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES diagnosis_sessions(id) ON DELETE CASCADE
);
