import { NextResponse } from 'next/server';
import { getDatabaseConnection } from '@/lib/database/sqlite_database_connection_manager';
import { initializeObservatoryTables } from '@/lib/database/initialize_observatory_tables';

export async function GET() {
  try {
    initializeObservatoryTables();
    const db = getDatabaseConnection();

    const rows = db.prepare('SELECT * FROM role_visibility_config').all() as any[];
    const configs: Record<string, any> = {};

    for (const row of rows) {
      const a1: string[] = JSON.parse(row.a1_tabs || '[]');
      const a2: Record<string, any> = JSON.parse(row.a2_elements || '{}');

      if (row.role === 'Super Admin') {
        // Invariant: Super Admin must ALWAYS have users rail tab and visibility section
        if (!a1.includes('users')) a1.push('users');
        if (!a2.users) a2.users = [];
        if (!a2.users.includes('visibility')) a2.users.push('visibility');
      } else {
        // Invariant: Non-Super Admin must NEVER have visibility
        if (a2.users && Array.isArray(a2.users)) {
          a2.users = a2.users.filter((item: string) => item !== 'visibility');
        }
      }

      configs[row.role] = {
        role: row.role,
        a1_tabs: a1,
        a2_elements: a2,
        updated_at: row.updated_at,
      };
    }

    return NextResponse.json({ success: true, configs });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    initializeObservatoryTables();
    const db = getDatabaseConnection();
    const body = await req.json();

    const { role, a1_tabs, a2_elements } = body;

    if (!role || !Array.isArray(a1_tabs) || typeof a2_elements !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Valid role, a1_tabs array, and a2_elements object are required.' },
        { status: 400 }
      );
    }

    const finalA1Tabs: string[] = [...a1_tabs];
    const finalA2Elements: Record<string, any> = { ...a2_elements };

    if (role === 'Super Admin') {
      // Invariant: Super Admin CANNOT remove 'users' or 'visibility'
      if (!finalA1Tabs.includes('users')) {
        finalA1Tabs.push('users');
      }
      const usersA2 = Array.isArray(finalA2Elements.users) ? [...finalA2Elements.users] : [];
      if (!usersA2.includes('visibility')) {
        usersA2.push('visibility');
      }
      finalA2Elements.users = usersA2;
    } else {
      // Invariant: Non-Super Admin can NEVER have visibility
      if (Array.isArray(finalA2Elements.users)) {
        finalA2Elements.users = finalA2Elements.users.filter((item: string) => item !== 'visibility');
      }
    }

    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO role_visibility_config (role, a1_tabs, a2_elements, updated_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(role) DO UPDATE SET
        a1_tabs = excluded.a1_tabs,
        a2_elements = excluded.a2_elements,
        updated_at = excluded.updated_at
    `).run(role, JSON.stringify(finalA1Tabs), JSON.stringify(finalA2Elements), now);

    // Fetch updated
    const rows = db.prepare('SELECT * FROM role_visibility_config').all() as any[];
    const configs: Record<string, any> = {};

    for (const r of rows) {
      const a1: string[] = JSON.parse(r.a1_tabs || '[]');
      const a2: Record<string, any> = JSON.parse(r.a2_elements || '{}');

      if (r.role === 'Super Admin') {
        if (!a1.includes('users')) a1.push('users');
        if (!a2.users) a2.users = [];
        if (!a2.users.includes('visibility')) a2.users.push('visibility');
      } else {
        if (a2.users && Array.isArray(a2.users)) {
          a2.users = a2.users.filter((item: string) => item !== 'visibility');
        }
      }

      configs[r.role] = {
        role: r.role,
        a1_tabs: a1,
        a2_elements: a2,
        updated_at: r.updated_at,
      };
    }

    return NextResponse.json({ success: true, configs });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
