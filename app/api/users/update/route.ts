import { NextResponse } from 'next/server';
import { getDatabaseConnection } from '@/lib/database/sqlite_database_connection_manager';
import { initializeObservatoryTables } from '@/lib/database/initialize_observatory_tables';

export async function POST(req: Request) {
  try {
    initializeObservatoryTables();
    const db = getDatabaseConnection();
    const body = await req.json();

    const { email, name, avatarUrl, company, jobTitle, phone, country, password } = body;

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = db.prepare('SELECT id FROM platform_users WHERE LOWER(email) = ?').get(cleanEmail) as any;

    if (!existing) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const passwordHash = password && password.trim().length > 0
      ? require('crypto').createHash('sha256').update(password).digest('hex')
      : null;

    db.prepare(`
      UPDATE platform_users
      SET name = COALESCE(?, name),
          avatar_url = COALESCE(?, avatar_url),
          company = COALESCE(?, company),
          job_title = COALESCE(?, job_title),
          phone = COALESCE(?, phone),
          country = COALESCE(?, country),
          password_hash = COALESCE(?, password_hash),
          last_active_at = ?
      WHERE LOWER(email) = ?
    `).run(
      name || null,
      avatarUrl || null,
      company || null,
      jobTitle || null,
      phone || null,
      country || null,
      passwordHash,
      new Date().toISOString(),
      cleanEmail
    );

    const updated = db.prepare('SELECT * FROM platform_users WHERE LOWER(email) = ?').get(cleanEmail) as any;

    return NextResponse.json({
      success: true,
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        avatarUrl: updated.avatar_url,
        company: updated.company,
        jobTitle: updated.job_title,
        phone: updated.phone,
        country: updated.country,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
