import { getDatabaseConnection } from './sqlite_database_connection_manager';
import rawCatalog from '../catalog/excel_metrics_catalog.json';

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

        CREATE TABLE IF NOT EXISTS role_visibility_config (
      role TEXT PRIMARY KEY,
      a1_tabs TEXT NOT NULL,
      a2_elements TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS platform_users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      role TEXT DEFAULT 'Normal User',
      status TEXT DEFAULT 'ACTIVE',
      avatar_url TEXT DEFAULT '/infra_trace_logo.png',
      profile_picture TEXT,
      auth_provider TEXT DEFAULT 'local',
      provider_user_id TEXT,
      company TEXT,
      job_title TEXT,
      phone TEXT,
      country TEXT,
      interests TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT,
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

    CREATE TABLE IF NOT EXISTS service_probe_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      service_id TEXT NOT NULL,
      raw_status TEXT NOT NULL,
      response_time_ms REAL NOT NULL,
      http_status INTEGER NOT NULL,
      timestamp TEXT NOT NULL,
      error_message TEXT,
      FOREIGN KEY (service_id) REFERENCES monitored_services(id)
    );

    CREATE TABLE IF NOT EXISTS service_state_transitions (
      id TEXT PRIMARY KEY,
      service_id TEXT NOT NULL,
      from_state TEXT NOT NULL,
      to_state TEXT NOT NULL,
      trigger_reason TEXT NOT NULL,
      response_time_ms REAL,
      http_status INTEGER,
      transition_timestamp TEXT NOT NULL,
      notification_sent INTEGER DEFAULT 0,
      error_details TEXT,
      FOREIGN KEY (service_id) REFERENCES monitored_services(id)
    );

    CREATE TABLE IF NOT EXISTS service_notification_logs (
      id TEXT PRIMARY KEY,
      service_id TEXT NOT NULL,
      recipient_email TEXT NOT NULL,
      event_type TEXT NOT NULL,
      previous_status TEXT NOT NULL,
      new_status TEXT NOT NULL,
      subject TEXT NOT NULL,
      delivery_status TEXT DEFAULT 'PENDING',
      delivery_provider TEXT,
      sent_at TEXT NOT NULL,
      idempotency_key TEXT UNIQUE,
      error_message TEXT,
      FOREIGN KEY (service_id) REFERENCES monitored_services(id)
    );

    CREATE TABLE IF NOT EXISTS user_notification_preferences (
      user_email TEXT PRIMARY KEY,
      notify_down INTEGER DEFAULT 1,
      notify_up INTEGER DEFAULT 1,
      notify_degraded INTEGER DEFAULT 1,
      notify_unstable INTEGER DEFAULT 1,
      is_enabled INTEGER DEFAULT 1,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notification_engine_state (
      id TEXT PRIMARY KEY,
      current_phase_number INTEGER DEFAULT 1,
      phase_stage TEXT DEFAULT 'BOOTSTRAP_WAITING_DOWN',
      active_window_started_at TEXT,
      active_window_duration_minutes INTEGER DEFAULT 20,
      up_events_count INTEGER DEFAULT 0,
      down_events_count INTEGER DEFAULT 0,
      degraded_events_count INTEGER DEFAULT 0,
      last_evaluated_at TEXT,
      last_notification_status TEXT,
      previous_notification_status TEXT,
      last_window_duration_minutes INTEGER DEFAULT 20,
      previous_window_duration_minutes INTEGER DEFAULT 20,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS notification_phases_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phase_number INTEGER NOT NULL,
      phase_type TEXT NOT NULL,
      window_duration_minutes INTEGER DEFAULT 20,
      started_at TEXT NOT NULL,
      completed_at TEXT NOT NULL,
      up_count INTEGER DEFAULT 0,
      down_count INTEGER DEFAULT 0,
      degraded_count INTEGER DEFAULT 0,
      outcome_status TEXT NOT NULL,
      notification_sent INTEGER DEFAULT 1,
      notification_subject TEXT,
      recipient_email TEXT
    );
  `);

  // Safely ensure all columns exist on monitored_services for backwards compatibility
  try { db.exec('ALTER TABLE monitored_services ADD COLUMN last_down_notified_at TEXT'); } catch (_) {}
  try { db.exec('ALTER TABLE monitored_services ADD COLUMN user_email TEXT'); } catch (_) {}
  try { db.exec('ALTER TABLE monitored_services ADD COLUMN metric_type TEXT'); } catch (_) {}
  try { db.exec('ALTER TABLE monitored_services ADD COLUMN previous_status TEXT DEFAULT "HEALTHY"'); } catch (_) {}
  try { db.exec('ALTER TABLE monitored_services ADD COLUMN consecutive_failures INTEGER DEFAULT 0'); } catch (_) {}
  try { db.exec('ALTER TABLE monitored_services ADD COLUMN consecutive_successes INTEGER DEFAULT 0'); } catch (_) {}
  try { db.exec('ALTER TABLE monitored_services ADD COLUMN last_state_change_at TEXT'); } catch (_) {}
  try { db.exec('ALTER TABLE monitored_services ADD COLUMN last_notified_status TEXT'); } catch (_) {}
  try { db.exec('ALTER TABLE monitored_services ADD COLUMN last_notified_at TEXT'); } catch (_) {}

  // Safely ensure all columns exist on platform_users for backwards compatibility
  try { db.exec('ALTER TABLE platform_users ADD COLUMN avatar_url TEXT DEFAULT "/infra_trace_logo.png"'); } catch (_) {}
  try { db.exec('ALTER TABLE platform_users ADD COLUMN profile_picture TEXT'); } catch (_) {}
  try { db.exec('ALTER TABLE platform_users ADD COLUMN auth_provider TEXT DEFAULT "local"'); } catch (_) {}
  try { db.exec('ALTER TABLE platform_users ADD COLUMN provider_user_id TEXT'); } catch (_) {}
  try { db.exec('ALTER TABLE platform_users ADD COLUMN updated_at TEXT'); } catch (_) {}
  try { db.exec('ALTER TABLE platform_users ADD COLUMN password_hash TEXT'); } catch (_) {}
  try { db.exec('ALTER TABLE platform_users ADD COLUMN company TEXT'); } catch (_) {}
  try { db.exec('ALTER TABLE platform_users ADD COLUMN job_title TEXT'); } catch (_) {}
  try { db.exec('ALTER TABLE platform_users ADD COLUMN phone TEXT'); } catch (_) {}
  try { db.exec('ALTER TABLE platform_users ADD COLUMN country TEXT'); } catch (_) {}
  try { db.exec('ALTER TABLE platform_users ADD COLUMN interests TEXT'); } catch (_) {}
  try { db.exec('ALTER TABLE platform_users ADD COLUMN permissions TEXT'); } catch (_) {}

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

  // Remove old test user
  try {
    db.prepare('DELETE FROM platform_users WHERE email = ?').run('xyztestuser@gmail.com');
  } catch (_) {}

  // Seed default Super Admin: jai18hemant334@gmail.com
  const adminEmail = 'jai18hemant334@gmail.com';
  const adminRow = db.prepare('SELECT id, role FROM platform_users WHERE LOWER(email) = ?').get(adminEmail) as any;
  const now = new Date().toISOString();
  if (!adminRow) {
    db.prepare(`
      INSERT INTO platform_users (
        id, name, email, role, status, avatar_url, profile_picture,
        auth_provider, company, job_title, country, permissions, created_at, updated_at, last_active_at
      ) VALUES (
        'usr_admin_jai18', 'Hemant Kumar', ?, 'Super Admin', 'ACTIVE',
        '/infra_trace_logo.png', '/infra_trace_logo.png', 'google',
        'InfraTrace Internal', 'Observability Lead', 'India',
        'VT1,EM1,PA1,CI1,UM1,SC1', ?, ?, ?
      )
    `).run(adminEmail, now, now, now);
  } else if (adminRow.role !== 'Super Admin') {
    db.prepare('UPDATE platform_users SET role = "Super Admin", permissions = "VT1,EM1,PA1,CI1,UM1,SC1" WHERE LOWER(email) = ?').run(adminEmail);
  }

  // Seed default role visibility configs if empty
  const visCount = db.prepare('SELECT COUNT(*) as count FROM role_visibility_config').get() as { count: number };
  if (visCount.count === 0) {
    const insertVis = db.prepare(`
      INSERT INTO role_visibility_config (role, a1_tabs, a2_elements, updated_at)
      VALUES (?, ?, ?, ?)
    `);
    const defaultDisabledGraphs: string[] = [];
    const catMap = rawCatalog as Record<string, any[]>;
    for (const catKey of Object.keys(catMap)) {
      for (const m of catMap[catKey]) {
        if (!m.is_api_endpoint) {
          defaultDisabledGraphs.push(m.metric);
        }
      }
    }

    const defaultA2 = {
      users: ['accounts', 'permissions', 'websites', 'roles', 'apikeys', 'audit'],
      console: ['dashboard', 'incidents', 'settings'],
      mail: ['inbox', 'starred', 'snoozed', 'sent', 'drafts'],
      inspect: ['traces', 'probes', 'latency', 'audits', 'payload'],
      delivery: ['pipelines', 'rules', 'channels', 'sla', 'dlq'],
      metrics: [
        'Cloud', 'Containers', 'Service', 'Synthetic',
        'Queues', 'Database', 'Security', 'Infrastructure'
      ],
      disabled_graphs: defaultDisabledGraphs,
    };
    insertVis.run(
      'Super Admin',
      JSON.stringify(['chat', 'mail', 'metrics', 'inspect', 'delivery', 'users']),
      JSON.stringify({
        ...defaultA2,
        users: ['accounts', 'permissions', 'visibility', 'websites', 'roles', 'apikeys', 'audit'],
      }),
      now
    );
    insertVis.run(
      'Admin',
      JSON.stringify(['chat', 'mail', 'metrics', 'inspect', 'delivery', 'users']),
      JSON.stringify(defaultA2),
      now
    );
    insertVis.run(
      'Normal User',
      JSON.stringify(['chat', 'mail', 'metrics', 'inspect', 'delivery']),
      JSON.stringify({
        users: [],
        console: ['dashboard', 'incidents', 'settings'],
        mail: ['inbox', 'starred', 'snoozed', 'sent', 'drafts'],
        inspect: ['traces', 'probes', 'latency', 'audits', 'payload'],
        delivery: ['pipelines', 'rules', 'channels', 'sla', 'dlq'],
        metrics: [
          'Cloud', 'Containers', 'Service', 'Synthetic',
          'Queues', 'Database', 'Security', 'Infrastructure'
        ],
        disabled_graphs: defaultDisabledGraphs,
      }),
      now
    );
  }

  // Seed initial mailbox welcoming test user if empty
  const mailCount = db.prepare('SELECT COUNT(*) as count FROM platform_mailbox WHERE recipient_email = ?').get('xyztestuser@gmail.com') as { count: number };
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
