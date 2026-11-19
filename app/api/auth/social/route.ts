import { NextResponse } from 'next/server';
import { getDatabaseConnection } from '@/lib/database/sqlite_database_connection_manager';
import { initializeObservatoryTables } from '@/lib/database/initialize_observatory_tables';
import { sendPlatformMail } from '@/lib/mail/mailbox_service';

export async function POST(req: Request) {
  try {
    initializeObservatoryTables();
    const db = getDatabaseConnection();
    const body = await req.json();

    const { email, name, provider = 'google', avatarUrl } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Valid email is required for social authentication.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = db.prepare('SELECT * FROM platform_users WHERE LOWER(email) = ?').get(cleanEmail) as any;

    const now = new Date().toISOString();
    const providerLabel = provider.charAt(0).toUpperCase() + provider.slice(1);
    const userAvatar = avatarUrl || '/infra_trace_logo.png';

    if (!user) {
      // Create user automatically with social provider identity
      const id = `usr_${provider.slice(0, 3)}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const displayName = name || cleanEmail.split('@')[0];

      const isSuperAdmin = cleanEmail === 'jai18hemant334@gmail.com';
      const initialRole = isSuperAdmin ? 'Admin' : 'Normal User';
      const initialPerms = isSuperAdmin ? 'VT1,EM1,PA1,CI1,UM1,SC1' : 'VT1';

      db.prepare(`
        INSERT INTO platform_users (
          id, name, email, role, permissions, status, avatar_url, country, company, job_title, created_at, last_active_at
        ) VALUES (?, ?, ?, ?, ?, 'ACTIVE', ?, 'Global', ?, 'Observability Engineer', ?, ?)
      `).run(id, displayName, cleanEmail, initialRole, initialPerms, userAvatar, `${providerLabel} Verified User`, now, now);

      sendPlatformMail({
        recipientEmail: cleanEmail,
        sender: `InfraTrace ${providerLabel} Auth <auth@infratrace.internal>`,
        subject: `Signed in with ${providerLabel} - Welcome to InfraTrace`,
        snippet: `Your InfraTrace account is active and connected with your ${providerLabel} account.`,
        body: `Hello ${displayName},\n\nYour InfraTrace account was successfully created and linked with your ${providerLabel} credentials (${cleanEmail}).\n\nYou now have full access to the live telemetry cockpit, Prometheus metrics, and Private API Test Suites.\n\nBest regards,\nThe InfraTrace Team`,
        tag: 'WELCOME',
      });

      user = db.prepare('SELECT * FROM platform_users WHERE id = ?').get(id) as any;
    } else {
      // Update last_active_at
      db.prepare('UPDATE platform_users SET last_active_at = ? WHERE id = ?').run(now, user.id);
    }

    return NextResponse.json({
      success: true,
      provider,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatar_url || userAvatar,
        company: user.company,
        jobTitle: user.job_title,
        country: user.country,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
