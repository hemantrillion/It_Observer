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
      role TEXT DEFAULT 'Admin',
      status TEXT DEFAULT 'ACTIVE',
      created_at TEXT NOT NULL,
      last_active_at TEXT NOT NULL
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

  // Seed platform users if empty
  const userCountRow = db.prepare('SELECT COUNT(*) as count FROM platform_users').get() as { count: number };
  if (userCountRow.count === 0) {
    const insertUser = db.prepare(`
      INSERT INTO platform_users (id, name, email, role, status, created_at, last_active_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const now = new Date().toISOString();
    insertUser.run('usr_admin_1', 'HemanT', 'hemantrillion@gmail.com', 'Lead Architect / Admin', 'ACTIVE', '2026-10-01T10:00:00Z', now);
    insertUser.run('usr_sre_2', 'Alex Vance', 'alex.vance@infratrace.internal', 'Lead SRE Operator', 'ACTIVE', '2026-10-05T14:30:00Z', now);
    insertUser.run('usr_dev_3', 'DevOps Automator', 'sre-telemetry@infratrace.internal', 'System Automation Service', 'ACTIVE', '2026-10-08T09:15:00Z', now);
    insertUser.run('usr_aud_4', 'Security Auditor', 'security-compliance@infratrace.internal', 'Compliance Inspector', 'IDLE', '2026-10-12T16:45:00Z', now);
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
