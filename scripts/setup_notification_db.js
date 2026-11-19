const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('observatory_storage.db');

// 1. Delete all past sample mails from platform_mailbox as requested
db.exec('DELETE FROM platform_mailbox');
console.log('Cleared platform_mailbox table successfully');

// 2. Create the 4 notification tables if not exists
db.exec(`
  CREATE TABLE IF NOT EXISTS service_probe_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service_id TEXT NOT NULL,
    raw_status TEXT NOT NULL,
    response_time_ms REAL NOT NULL,
    http_status INTEGER,
    timestamp TEXT NOT NULL,
    error_message TEXT
  );

  CREATE TABLE IF NOT EXISTS service_state_transitions (
    id TEXT PRIMARY KEY,
    service_id TEXT NOT NULL,
    from_state TEXT NOT NULL,
    to_state TEXT NOT NULL,
    trigger_reason TEXT,
    response_time_ms REAL,
    http_status INTEGER,
    transition_timestamp TEXT NOT NULL,
    notification_sent INTEGER DEFAULT 0,
    error_details TEXT
  );

  CREATE TABLE IF NOT EXISTS service_notification_logs (
    id TEXT PRIMARY KEY,
    service_id TEXT NOT NULL,
    recipient_email TEXT NOT NULL,
    event_type TEXT NOT NULL,
    previous_status TEXT,
    new_status TEXT NOT NULL,
    subject TEXT NOT NULL,
    delivery_status TEXT DEFAULT 'SENT',
    delivery_provider TEXT DEFAULT 'RESEND',
    sent_at TEXT NOT NULL,
    idempotency_key TEXT UNIQUE,
    error_message TEXT
  );

  CREATE TABLE IF NOT EXISTS user_notification_preferences (
    user_email TEXT PRIMARY KEY,
    is_enabled INTEGER DEFAULT 1,
    notify_down INTEGER DEFAULT 1,
    notify_up INTEGER DEFAULT 1,
    notify_degraded INTEGER DEFAULT 1,
    notify_unstable INTEGER DEFAULT 1,
    updated_at TEXT NOT NULL
  );
`);
console.log('Created notification tables successfully');

// 3. Ensure new columns on monitored_services
const cols = [
  'previous_status TEXT DEFAULT "UP"',
  'consecutive_failures INTEGER DEFAULT 0',
  'consecutive_successes INTEGER DEFAULT 0',
  'last_state_change_at TEXT',
  'last_notified_status TEXT DEFAULT "UP"',
  'last_notified_at TEXT'
];

for (const col of cols) {
  try {
    db.exec('ALTER TABLE monitored_services ADD COLUMN ' + col);
  } catch (e) {
    // Column may already exist
  }
}
console.log('Ensured monitored_services columns successfully');
