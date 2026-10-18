import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getDatabaseConnection } from '@/lib/database/sqlite_database_connection_manager';
import { initializeObservatoryTables } from '@/lib/database/initialize_observatory_tables';
import { sendPlatformMail } from '@/lib/mail/mailbox_service';

export async function POST(req: Request) {
  try {
    initializeObservatoryTables();
    const db = getDatabaseConnection();
    const body = await req.json();

    const {
      email,
      password,
      firstName = '',
      lastName = '',
      company = '',
      jobTitle = '',
      phone = '',
      country = 'India',
      interests = '',
    } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json({ success: false, error: 'Valid email is required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check duplicate
    const existing = db.prepare('SELECT id FROM platform_users WHERE LOWER(email) = ?').get(cleanEmail);
    if (existing) {
      return NextResponse.json({ success: false, error: 'An account with this email already exists.' }, { status: 409 });
    }

    const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const fullName = `${firstName} ${lastName}`.trim() || cleanEmail.split('@')[0];
    const passwordHash = password ? crypto.createHash('sha256').update(password).digest('hex') : null;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO platform_users (
        id, name, email, password_hash, role, status, avatar_url,
        company, job_title, phone, country, interests, created_at, last_active_at
      ) VALUES (?, ?, ?, ?, 'Admin', 'ACTIVE', '/infra_trace_logo.png', ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      fullName,
      cleanEmail,
      passwordHash,
      company,
      jobTitle,
      phone,
      country,
      interests,
      now,
      now
    );

    // Send Welcome Email and store in mailbox
    sendPlatformMail({
      recipientEmail: cleanEmail,
      sender: 'InfraTrace Team <welcome@infratrace.internal>',
      subject: `Welcome to InfraTrace, ${fullName}!`,
      snippet: `Your InfraTrace account is active. Explore synthetic observability, metric dashboards, and private API suites.`,
      body: `Hello ${fullName},\n\nWelcome to InfraTrace!\n\nYour account has been successfully created. You can now configure private API monitoring suites, track service health, and inspect synthetic telemetry.\n\nAccount Email: ${cleanEmail}\nCountry: ${country}\n\nHappy monitoring,\nThe InfraTrace Team`,
      tag: 'WELCOME',
    });

    const user = db.prepare('SELECT * FROM platform_users WHERE id = ?').get(id) as any;

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatar_url,
        company: user.company,
        jobTitle: user.job_title,
        country: user.country,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
