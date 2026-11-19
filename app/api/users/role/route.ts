import { NextResponse } from 'next/server';
import { getDatabaseConnection } from '@/lib/database/sqlite_database_connection_manager';
import { initializeObservatoryTables } from '@/lib/database/initialize_observatory_tables';

export async function POST(req: Request) {
  try {
    initializeObservatoryTables();
    const db = getDatabaseConnection();
    const body = await req.json();
    const { targetEmail, newRole, permissions, adminEmail } = body;

    if (!targetEmail || !newRole) {
      return NextResponse.json(
        { success: false, error: 'Target email and new role are required.' },
        { status: 400 }
      );
    }

    // Protection: Prevent demoting default Super Admin jai18hemant334@gmail.com
    if (targetEmail.toLowerCase() === 'jai18hemant334@gmail.com' && newRole !== 'Super Admin') {
      return NextResponse.json(
        { success: false, error: 'Primary Super Administrator (jai18hemant334@gmail.com) cannot be demoted.' },
        { status: 403 }
      );
    }

    // Three roles: Super Admin, Admin, and Normal User
    let normalizedRole = 'Normal User';
    if (newRole === 'Super Admin') normalizedRole = 'Super Admin';
    else if (newRole === 'Admin') normalizedRole = 'Admin';

    let permString = '';
    if (Array.isArray(permissions)) {
      permString = permissions.join(',');
    } else if (typeof permissions === 'string') {
      permString = permissions;
    } else {
      if (normalizedRole === 'Super Admin' || normalizedRole === 'Admin') {
        permString = 'VT1,EM1,PA1,CI1,UM1,SC1';
      } else {
        permString = 'VT1';
      }
    }

    const now = new Date().toISOString();
    db.prepare(`
      UPDATE platform_users
      SET role = ?,
          permissions = ?,
          updated_at = ?
      WHERE LOWER(email) = ?
    `).run(normalizedRole, permString, now, targetEmail.toLowerCase().trim());

    // Record audit log entry
    try {
      db.prepare(`
        INSERT INTO database_query_logs (operation, table_name, query_details, execution_time_ms, timestamp, status)
        VALUES ('UPDATE_ROLE', 'platform_users', ?, 0.35, ?, 'SUCCESS')
      `).run(`Role of ${targetEmail} changed to ${newRole} [${permString}] by ${adminEmail || 'Admin'}`, now);
    } catch (_) {}

    return NextResponse.json({
      success: true,
      message: `User ${targetEmail} role updated to ${newRole}`,
      role: normalizedRole,
      permissions: permString.split(','),
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update user role' },
      { status: 500 }
    );
  }
}
