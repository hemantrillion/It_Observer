import { NextResponse } from 'next/server';
import { getDatabaseConnection } from '@/lib/database/sqlite_database_connection_manager';
import { initializeObservatoryTables } from '@/lib/database/initialize_observatory_tables';

export async function GET(req: Request) {
  try {
    initializeObservatoryTables();
    const db = getDatabaseConnection();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const suiteId = searchParams.get('suiteId');

    if (suiteId) {
      const suite = db.prepare('SELECT * FROM private_api_suites WHERE id = ?').get(suiteId);
      if (!suite) {
        return NextResponse.json({ success: false, error: 'Suite not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, suite });
    }

    let suites = [];
    if (email) {
      suites = db.prepare('SELECT * FROM private_api_suites WHERE LOWER(user_email) = LOWER(?) ORDER BY created_at DESC').all(email);
    } else {
      suites = db.prepare('SELECT * FROM private_api_suites ORDER BY created_at DESC').all();
    }

    return NextResponse.json({ success: true, suites });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    initializeObservatoryTables();
    const db = getDatabaseConnection();
    const body = await req.json();

    const {
      userEmail,
      name,
      suiteType = 'cloud_aws',
      cspProvider = 'AWS',
      serviceCategory = 'Compute & Telemetry',
      endpoints = [],
    } = body;

    if (!userEmail || !name) {
      return NextResponse.json({ success: false, error: 'User email and suite name are required' }, { status: 400 });
    }

    const id = `suite_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO private_api_suites (
        id, user_email, name, suite_type, csp_provider, service_category, endpoints_json, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?)
    `).run(
      id,
      userEmail.toLowerCase().trim(),
      name,
      suiteType,
      cspProvider,
      serviceCategory,
      JSON.stringify(endpoints),
      now
    );

    // Also register endpoints in monitored_services for user
    const insertMonitored = db.prepare(`
      INSERT OR REPLACE INTO monitored_services (
        id, name, target_type, target_url, check_interval_seconds,
        current_status, latest_response_time_ms, uptime_percentage,
        total_checks, failed_checks, last_checked_at, user_email, metric_type
      ) VALUES (?, ?, 'private_api', ?, ?, 'HEALTHY', 35.0, 100.0, 1, 0, ?, ?, ?)
    `);

    for (const ep of endpoints) {
      if (ep.endpoint) {
        const serviceId = `priv_${ep.id || Math.random().toString(36).substring(2, 8)}`;
        try {
          insertMonitored.run(
            serviceId,
            `${name}: ${ep.name || 'Private Probe'}`,
            ep.endpoint,
            ep.intervalSeconds || 15,
            now,
            userEmail.toLowerCase().trim(),
            ep.id || 'latency'
          );
        } catch {
          // Ignore duplicate IDs
        }
      }
    }

    return NextResponse.json({
      success: true,
      suiteId: id,
      message: 'Private API suite created and monitoring initialized.',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    initializeObservatoryTables();
    const db = getDatabaseConnection();
    const body = await req.json();

    const {
      suiteId,
      userEmail,
      name,
      suiteType,
      cspProvider,
      serviceCategory,
      endpoints = [],
    } = body;

    if (!suiteId || !name) {
      return NextResponse.json({ success: false, error: 'Suite ID and name are required for update' }, { status: 400 });
    }

    const existing: any = db.prepare('SELECT * FROM private_api_suites WHERE id = ?').get(suiteId);
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Suite not found' }, { status: 404 });
    }

    // Optional user security check
    if (userEmail && existing.user_email.toLowerCase() !== userEmail.toLowerCase()) {
      return NextResponse.json({ success: false, error: 'Unauthorized to modify this suite' }, { status: 403 });
    }

    db.prepare(`
      UPDATE private_api_suites
      SET name = ?,
          suite_type = COALESCE(?, suite_type),
          csp_provider = COALESCE(?, csp_provider),
          service_category = COALESCE(?, service_category),
          endpoints_json = ?
      WHERE id = ?
    `).run(
      name,
      suiteType || existing.suite_type,
      cspProvider || existing.csp_provider,
      serviceCategory || existing.service_category,
      JSON.stringify(endpoints),
      suiteId
    );

    return NextResponse.json({
      success: true,
      message: 'Private API suite successfully updated.',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    initializeObservatoryTables();
    const db = getDatabaseConnection();
    const { searchParams } = new URL(req.url);
    const suiteId = searchParams.get('suiteId');
    const userEmail = searchParams.get('email');

    if (!suiteId) {
      return NextResponse.json({ success: false, error: 'Suite ID is required' }, { status: 400 });
    }

    const existing: any = db.prepare('SELECT * FROM private_api_suites WHERE id = ?').get(suiteId);
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Suite not found' }, { status: 404 });
    }

    if (userEmail && existing.user_email.toLowerCase() !== userEmail.toLowerCase()) {
      return NextResponse.json({ success: false, error: 'Unauthorized to delete this suite' }, { status: 403 });
    }

    db.prepare('DELETE FROM private_api_suites WHERE id = ?').run(suiteId);

    return NextResponse.json({
      success: true,
      message: 'Private API suite removed.',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
