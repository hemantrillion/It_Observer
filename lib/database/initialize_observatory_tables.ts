import { getDatabaseConnection } from './sqlite_database_connection_manager';

export function initializeObservatoryTables(): void {
  const db = getDatabaseConnection();

  db.exec(`
    CREATE TABLE IF NOT EXISTS monitored_services (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_url TEXT NOT NULL,
      check_interval_seconds INTEGER DEFAULT 5,
      current_status TEXT DEFAULT 'HEALTHY',
      latest_response_time_ms REAL DEFAULT 0,
      uptime_percentage REAL DEFAULT 100.0,
      total_checks INTEGER DEFAULT 0,
      failed_checks INTEGER DEFAULT 0,
      last_checked_at TEXT
    );

    CREATE TABLE IF NOT EXISTS metric_samples (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      service_id TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      response_time_ms REAL NOT NULL,
      http_status INTEGER NOT NULL,
      cpu_percentage REAL DEFAULT 0,
      memory_mb REAL DEFAULT 0,
      error_message TEXT,
      FOREIGN KEY (service_id) REFERENCES monitored_services(id)
    );

    CREATE TABLE IF NOT EXISTS incident_alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      service_id TEXT NOT NULL,
      severity TEXT NOT NULL,
      reason TEXT NOT NULL,
      started_at TEXT NOT NULL,
      resolved_at TEXT,
      is_active INTEGER DEFAULT 1,
      duration_seconds INTEGER DEFAULT 0,
      FOREIGN KEY (service_id) REFERENCES monitored_services(id)
    );

    CREATE TABLE IF NOT EXISTS platform_users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      role TEXT DEFAULT 'Admin',
      status TEXT DEFAULT 'ACTIVE',
      avatar_url TEXT DEFAULT '/infra_trace_logo.png',
      company TEXT,
      job_title TEXT,
      phone TEXT,
      country TEXT,
      interests TEXT,
      created_at TEXT NOT NULL,
      last_active_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS email_otp_verifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      otp_hash TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      attempts INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS platform_mailbox (
      id TEXT PRIMARY KEY,
      recipient_email TEXT NOT NULL,
      sender TEXT NOT NULL,
      subject TEXT NOT NULL,
      snippet TEXT NOT NULL,
      body TEXT NOT NULL,
      sent_at TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      tag TEXT DEFAULT 'INBOX'
    );

    CREATE TABLE IF NOT EXISTS private_api_suites (
      id TEXT PRIMARY KEY,
      user_email TEXT NOT NULL,
      name TEXT NOT NULL,
      suite_type TEXT NOT NULL,
      csp_provider TEXT,
      service_category TEXT,
      endpoints_json TEXT NOT NULL,
      status TEXT DEFAULT 'ACTIVE',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS database_query_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      operation TEXT NOT NULL,
      table_name TEXT NOT NULL,
      query_details TEXT,
      execution_time_ms REAL,
      timestamp TEXT NOT NULL,
      status TEXT DEFAULT 'SUCCESS'
    );
  `);

  // Safely ensure all columns exist on platform_users for backwards compatibility
  try { db.exec('ALTER TABLE platform_users ADD COLUMN avatar_url TEXT DEFAULT "/infra_trace_logo.png"'); } catch (_) {}
  try { db.exec('ALTER TABLE platform_users ADD COLUMN password_hash TEXT'); } catch (_) {}
  try { db.exec('ALTER TABLE platform_users ADD COLUMN company TEXT'); } catch (_) {}
  try { db.exec('ALTER TABLE platform_users ADD COLUMN job_title TEXT'); } catch (_) {}
  try { db.exec('ALTER TABLE platform_users ADD COLUMN phone TEXT'); } catch (_) {}
  try { db.exec('ALTER TABLE platform_users ADD COLUMN country TEXT'); } catch (_) {}
  try { db.exec('ALTER TABLE platform_users ADD COLUMN interests TEXT'); } catch (_) {}

  // Seed default test suite targets if empty
  const countRow = db.prepare('SELECT COUNT(*) as count FROM monitored_services').get() as { count: number };
  if (countRow.count === 0) {
    const insertService = db.prepare(`
      INSERT INTO monitored_services (id, name, target_type, target_url, check_interval_seconds, current_status)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertService.run('github_api', 'GitHub REST API', 'public_api', 'https://api.github.com/users/octocat', 10, 'HEALTHY');
    insertService.run('hacker_news_api', 'Hacker News Firebase API', 'public_api', 'https://hacker-news.firebaseio.com/v0/maxitem.json', 5, 'HEALTHY');
    insertService.run('open_meteo_api', 'Open-Meteo Weather API', 'public_api', 'https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current_weather=true', 5, 'HEALTHY');
    insertService.run('local_controlled_service', 'Local Controlled Node Service', 'system_process', 'http://localhost:5001/metrics', 5, 'HEALTHY');
    insertService.run('aws_cloudwatch', 'AWS CloudWatch Telemetry', 'cloud_provider', 'https://monitoring.us-east-1.amazonaws.com', 15, 'HEALTHY');
    insertService.run('cloudflare_edge', 'Cloudflare Edge Analytics', 'cloud_provider', 'https://api.cloudflare.com/client/v4/radar/http/summary/bot', 15, 'HEALTHY');
  }

  // Seed default Test User if not present
  const userCount = db.prepare('SELECT COUNT(*) as count FROM platform_users WHERE email = "xyztestuser@gmail.com"').get() as { count: number };
  if (userCount.count === 0) {
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO platform_users (id, name, email, role, status, avatar_url, company, job_title, country, created_at, last_active_at)
      VALUES ('usr_test_001', 'Test User', 'xyztestuser@gmail.com', 'Admin', 'ACTIVE', '/infra_trace_logo.png', 'InfraTrace Internal', 'Observability Lead', 'India', ?, ?)
    `).run(now, now);
  }

  // Seed initial mailbox welcoming test user if empty
  const mailCount = db.prepare('SELECT COUNT(*) as count FROM platform_mailbox WHERE recipient_email = "xyztestuser@gmail.com"').get() as { count: number };
  if (mailCount.count === 0) {
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO platform_mailbox (id, recipient_email, sender, subject, snippet, body, sent_at, is_read, tag)
      VALUES (?, ?, ?, ?, ?, ?, ?, 0, 'INBOX')
    `).run(
      'mail_welcome_test',
      'xyztestuser@gmail.com',
      'InfraTrace Team <noreply@infratrace.internal>',
      'Welcome to InfraTrace Telemetry & Observability',
      'Your Test User account has full access to the live monitoring cockpit, Prometheus charts, and chaos simulator...',
      'Welcome to InfraTrace!\n\nYour Test User account is pre-configured with full administrative rights to monitor simulated cloud workloads, public APIs, and chaos engineering triggers.\n\nEnjoy the observatory experience.',
      now
    );
  }

  // Seed initial database query logs if empty
  const logCountRow = db.prepare('SELECT COUNT(*) as count FROM database_query_logs').get() as { count: number };
  if (logCountRow.count === 0) {
    const insertLog = db.prepare(`
      INSERT INTO database_query_logs (operation, table_name, query_details, execution_time_ms, timestamp, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const now = new Date().toISOString();
    insertLog.run('SELECT', 'monitored_services', 'SELECT * FROM monitored_services WHERE current_status = "HEALTHY" LIMIT 50', 0.42, now, 'SUCCESS');
    insertLog.run('INSERT', 'metric_samples', 'INSERT INTO metric_samples (service_id, response_time_ms) VALUES ("github_api", 45.2)', 0.85, now, 'SUCCESS');
    insertLog.run('SELECT', 'incident_alerts', 'SELECT COUNT(*) as active FROM incident_alerts WHERE is_active = 1', 0.28, now, 'SUCCESS');
    insertLog.run('UPDATE', 'monitored_services', 'UPDATE monitored_services SET uptime_percentage = 99.98 WHERE id = "aws_cloudwatch"', 1.15, now, 'SUCCESS');
    insertLog.run('SELECT', 'platform_users', 'SELECT id, name, email, role, status FROM platform_users ORDER BY created_at DESC', 0.36, now, 'SUCCESS');
  }
}
