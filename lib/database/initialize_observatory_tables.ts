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
}
