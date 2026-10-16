import { NextResponse } from 'next/server';
import { getDatabaseConnection } from '@/lib/database/sqlite_database_connection_manager';
import { initializeObservatoryTables } from '@/lib/database/initialize_observatory_tables';

export async function GET() {
  try {
    initializeObservatoryTables();
    const db = getDatabaseConnection();

    const users = db.prepare('SELECT * FROM platform_users ORDER BY created_at DESC').all();
    const logs = db.prepare('SELECT * FROM database_query_logs ORDER BY id DESC LIMIT 50').all();

    // Database stats
    const tables = [
      'monitored_services',
      'metric_samples',
      'incident_alerts',
      'platform_users',
      'database_query_logs',
    ];

    const tableStats: Record<string, number> = {};
    for (const t of tables) {
      const row = db.prepare(`SELECT COUNT(*) as count FROM ${t}`).get() as { count: number };
      tableStats[t] = row.count;
    }

    // Pragma checks
    const pageSizeRow = db.prepare('PRAGMA page_size').get() as { page_size: number };
    const pageCountRow = db.prepare('PRAGMA page_count').get() as { page_count: number };
    const integrityRow = db.prepare('PRAGMA integrity_check').get() as { integrity_check: string };

    const dbSizeBytes = (pageSizeRow?.page_size || 4096) * (pageCountRow?.page_count || 1);

    return NextResponse.json({
      success: true,
      users,
      logs,
      stats: {
        tableStats,
        dbSizeBytes,
        dbSizeKb: (dbSizeBytes / 1024).toFixed(2),
        pageSize: pageSizeRow?.page_size || 4096,
        pageCount: pageCountRow?.page_count || 1,
        integrity: integrityRow?.integrity_check || 'ok',
        journalMode: 'WAL',
      },
    });
  } catch (error: any) {
    console.error('Error fetching users and database logs:', error);
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

    const { name, email, role = 'User' } = body;
    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: 'Name and email are required' },
        { status: 400 }
      );
    }

    const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const t0 = performance.now();
    const insertStmt = db.prepare(`
      INSERT INTO platform_users (id, name, email, role, status, created_at, last_active_at)
      VALUES (?, ?, ?, ?, 'ACTIVE', ?, ?)
    `);
    insertStmt.run(id, name, email, role, now, now);
    const executionTimeMs = Number((performance.now() - t0).toFixed(2));

    // Log the insert operation in database_query_logs
    const logStmt = db.prepare(`
      INSERT INTO database_query_logs (operation, table_name, query_details, execution_time_ms, timestamp, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    logStmt.run(
      'INSERT',
      'platform_users',
      `INSERT INTO platform_users (id, name, email, role) VALUES ('${id}', '${name}', '${email}', '${role}')`,
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
    console.error('Error creating user in database:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to insert user' },
      { status: 500 }
    );
  }
}
