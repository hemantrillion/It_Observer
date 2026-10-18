import { NextResponse } from 'next/server';
import { getDatabaseConnection } from '@/lib/database/sqlite_database_connection_manager';
import { initializeObservatoryTables } from '@/lib/database/initialize_observatory_tables';
import { sendPlatformMail } from '@/lib/mail/mailbox_service';

export async function POST(req: Request) {
  try {
    initializeObservatoryTables();
    const db = getDatabaseConnection();
    const body = await req.json();

    const { email, name, avatarUrl = '/infra_trace_logo.png' } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json({ success: false, error: 'Valid Google email is required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = db.prepare('SELECT * FROM platform_users WHERE LOWER(email) = ?').get(cleanEmail) as any;

    const now = new Date().toISOString();

    if (!user) {
      // Create user automatically with Google identity
      const id = `usr_g_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const displayName = name || cleanEmail.split('@')[0];

      db.prepare(`
        INSERT INTO platform_users (
          id, name, email, role, status, avatar_url, country, created_at, last_active_at
        ) VALUES (?, ?, ?, 'Admin', 'ACTIVE', ?, 'Global', ?, ?)
      `).run(id, displayName, cleanEmail, avatarUrl, now, now);

      sendPlatformMail({
        recipientEmail: cleanEmail,
        sender: 'InfraTrace Google Auth <auth@infratrace.internal>',
        subject: `Signed in with Google - Welcome to InfraTrace`,
        snippet: `Your InfraTrace account was created using Google Sign-In.`,
        body: `Hello ${displayName},\n\nYour InfraTrace account is now linked with your Google account (${cleanEmail}).\n\nYou can access your telemetry dashboards and private API monitoring.\n\nBest regards,\nThe InfraTrace Team`,
        tag: 'WELCOME',
      });

      user = db.prepare('SELECT * FROM platform_users WHERE id = ?').get(id) as any;
    } else {
      // Update last_active_at
      db.prepare('UPDATE platform_users SET last_active_at = ? WHERE id = ?').run(now, user.id);
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatar_url || avatarUrl || '/infra_trace_logo.png',
        company: user.company,
        jobTitle: user.job_title,
        country: user.country,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
