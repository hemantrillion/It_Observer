import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getDatabaseConnection } from '@/lib/database/sqlite_database_connection_manager';
import { initializeObservatoryTables } from '@/lib/database/initialize_observatory_tables';

export async function POST(req: Request) {
  try {
    initializeObservatoryTables();
    const db = getDatabaseConnection();
    const { email, password } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = db.prepare('SELECT * FROM platform_users WHERE LOWER(email) = ?').get(cleanEmail) as any;

    if (!user) {
      return NextResponse.json({ success: false, error: 'No account found with this email address.' }, { status: 404 });
    }

    // If password provided and user has a password_hash, check it
    if (password && user.password_hash) {
      const hash = crypto.createHash('sha256').update(password).digest('hex');
      if (hash !== user.password_hash) {
        return NextResponse.json({ success: false, error: 'Incorrect password.' }, { status: 401 });
      }
    }

    // Update last_active_at
    const now = new Date().toISOString();
    db.prepare('UPDATE platform_users SET last_active_at = ? WHERE id = ?').run(now, user.id);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatar_url || '/infra_trace_logo.png',
        company: user.company,
        jobTitle: user.job_title,
        country: user.country,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
