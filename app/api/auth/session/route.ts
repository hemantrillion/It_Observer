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

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || 'Admin',
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

