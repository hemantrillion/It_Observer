import { NextResponse } from 'next/server';
import { getDatabaseConnection } from '@/lib/database/sqlite_database_connection_manager';
import { initializeObservatoryTables } from '@/lib/database/initialize_observatory_tables';

export async function GET(req: Request) {
  try {
    initializeObservatoryTables();
    const db = getDatabaseConnection();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

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

    return NextResponse.json({
      success: true,
      suiteId: id,
      message: 'Private API suite created and monitoring initialized.',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
