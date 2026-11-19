import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session_manager';
import { getDatabaseConnection } from '@/lib/database/sqlite_database_connection_manager';
import { initializeObservatoryTables } from '@/lib/database/initialize_observatory_tables';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);

    if (!session) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    }

    initializeObservatoryTables();
    const db = getDatabaseConnection();

    const user = db
      .prepare('SELECT * FROM platform_users WHERE id = ? OR LOWER(email) = ?')
      .get(session.userId, session.email.toLowerCase()) as any;

    if (!user) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    }

    const isSuperAdmin = user.email.toLowerCase() === 'jai18hemant334@gmail.com';
    const effectiveRole = isSuperAdmin ? 'Super Admin' : (user.role === 'Super Admin' ? 'Super Admin' : (user.role === 'Admin' ? 'Admin' : 'Normal User'));
    const defaultPerms = (effectiveRole === 'Super Admin' || effectiveRole === 'Admin')
      ? ['VT1', 'EM1', 'PA1', 'CI1', 'UM1', 'SC1']
      : ['VT1'];
    const effectivePerms = user.permissions
      ? user.permissions.split(',').map((p: string) => p.trim())
      : defaultPerms;

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: effectiveRole,
        permissions: effectivePerms,
        avatarUrl: user.profile_picture || user.avatar_url || '/infra_trace_logo.png',
        profilePicture: user.profile_picture || user.avatar_url || '/infra_trace_logo.png',
        authProvider: user.auth_provider || 'local',
        providerUserId: user.provider_user_id || null,
        company: user.company,
        jobTitle: user.job_title,
        country: user.country || 'India',
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ authenticated: false, error: err.message }, { status: 500 });
  }
}

