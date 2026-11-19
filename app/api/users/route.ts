import { NextResponse } from 'next/server';
import { getDatabaseConnection } from '@/lib/database/sqlite_database_connection_manager';
import { initializeObservatoryTables } from '@/lib/database/initialize_observatory_tables';

export async function GET() {
  try {
    initializeObservatoryTables();
    const db = getDatabaseConnection();

    const rawUsers = db.prepare('SELECT * FROM platform_users ORDER BY created_at DESC').all() as any[];
    const logs = db.prepare('SELECT * FROM database_query_logs ORDER BY id DESC LIMIT 50').all();

    // Attach private suites count and endpoints to each user
    const users = rawUsers.map((u) => {
      const suiteRow = db
        .prepare('SELECT COUNT(*) as count FROM private_api_suites WHERE LOWER(user_email) = ?')
        .get(u.email.toLowerCase()) as { count: number };

      const suites = db
        .prepare('SELECT id, name, suite_type, csp_provider, service_category, endpoints_json, created_at FROM private_api_suites WHERE LOWER(user_email) = ?')
        .all(u.email.toLowerCase()) as any[];

      const isDefault = u.email.toLowerCase() === 'jai18hemant334@gmail.com';
      const role = isDefault
        ? 'Super Admin'
        : (u.role === 'Super Admin' ? 'Super Admin' : (u.role === 'Admin' ? 'Admin' : 'Normal User'));
      const defaultPerms = (role === 'Super Admin' || role === 'Admin')
        ? ['VT1', 'EM1', 'PA1', 'CI1', 'UM1', 'SC1']
        : ['VT1'];
      const permissions = u.permissions ? u.permissions.split(',').map((p: string) => p.trim()) : defaultPerms;

      return {
        ...u,
        role,
        permissions,
        suitesCount: suiteRow?.count || 0,
        suites,
      };
    });

    // Extract all user websites & endpoints from private_api_suites
    const userWebsites: any[] = [];
    for (const u of users) {
      if (Array.isArray(u.suites)) {
        for (const s of u.suites) {
          try {
            const endpoints = JSON.parse(s.endpoints_json || '[]');
            for (const ep of endpoints) {
              userWebsites.push({
                suiteId: s.id,
                suiteName: s.name,
                userEmail: u.email,
                userName: u.name,
                endpointName: ep.name || ep.id,
                endpointUrl: ep.endpoint || ep.url || 'https://monitoring.internal',
                region: ep.region || s.csp_provider || 'Global',
                intervalSeconds: ep.intervalSeconds || 15,
                status: 'HEALTHY',
                createdAt: s.created_at,
              });
            }
          } catch (_) {}
        }
      }
    }

    // Role definitions matrix with live user counts
    const roleStats: Record<string, number> = {};
    for (const u of users) {
      const r = u.role || 'Admin';
      roleStats[r] = (roleStats[r] || 0) + 1;
    }

    const rolesMatrix = [
      {
        name: 'Super Admin',
        accessLevel: 'Full System & Visibility Control',
        permissions: 'VT1, EM1, PA1, CI1, UM1, SC1 & Full a1/a2 Visibility Administration',
        assignedCount: users.filter((u) => u.role === 'Super Admin').length,
      },
      {
        name: 'Admin',
        accessLevel: 'Full System Access',
        permissions: 'VT1, EM1, PA1, CI1, UM1, SC1 (Manage Services, Users & Permissions)',
        assignedCount: users.filter((u) => u.role === 'Admin').length,
      },
      {
        name: 'Normal User',
        accessLevel: 'Standard Observability & View Access',
        permissions: 'VT1 (Standard View Access)',
        assignedCount: users.filter((u) => u.role !== 'Admin' && u.role !== 'Super Admin').length,
      },
    ];

    // API Keys and webhooks
    const apiKeys = users.map((u, i) => ({
      keyId: `key_live_${u.id.replace('usr_', '')}`,
      userEmail: u.email,
      userName: u.name,
      tokenPrefix: `it_live_${u.email.split('@')[0]}_...`,
      webhookTarget: `https://api.infratrace.internal/v1/hooks/${u.id}`,
      rateLimit: '1,000 req/min',
      createdAt: u.created_at,
      status: 'ACTIVE',
    }));

    // Database stats
    const tables = [
      'monitored_services',
      'metric_samples',
      'incident_alerts',
      'platform_users',
      'private_api_suites',
      'platform_mailbox',
      'database_query_logs',
    ];

    const tableStats: Record<string, number> = {};
    for (const t of tables) {
      const row = db.prepare(`SELECT COUNT(*) as count FROM ${t}`).get() as { count: number };
      tableStats[t] = row.count;
    }

    return NextResponse.json({
      success: true,
      users,
      userWebsites,
      rolesMatrix,
      apiKeys,
      logs,
      stats: {
        tableStats,
        totalUsers: users.length,
        totalWebsites: userWebsites.length,
      },
    });
  } catch (error: any) {
    console.error('Error fetching users directory:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Database query error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    initializeObservatoryTables();
    const db = getDatabaseConnection();
    const body = await req.json();

    const { name, email, role = 'Admin', company = '', jobTitle = '' } = body;
    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: 'Name and email are required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = db.prepare('SELECT id FROM platform_users WHERE LOWER(email) = ?').get(cleanEmail);
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'A user with this email address already exists.' },
        { status: 409 }
      );
    }

    const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const t0 = performance.now();
    db.prepare(`
      INSERT INTO platform_users (id, name, email, role, status, company, job_title, created_at, last_active_at)
      VALUES (?, ?, ?, ?, 'ACTIVE', ?, ?, ?, ?)
    `).run(id, name, cleanEmail, role, company, jobTitle, now, now);
    const executionTimeMs = Number((performance.now() - t0).toFixed(2));

    db.prepare(`
      INSERT INTO database_query_logs (operation, table_name, query_details, execution_time_ms, timestamp, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      'INSERT',
      'platform_users',
      `INSERT INTO platform_users (id, name, email, role) VALUES ('${id}', '${name}', '${cleanEmail}', '${role}')`,
      executionTimeMs,
      now,
      'SUCCESS'
    );

    const newUser = db.prepare('SELECT * FROM platform_users WHERE id = ?').get(id);

    return NextResponse.json({
      success: true,
      user: newUser,
      message: 'User created in database successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to insert user' },
      { status: 500 }
    );
  }
}
