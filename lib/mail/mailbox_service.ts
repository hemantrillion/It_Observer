import crypto from 'crypto';
import { getDatabaseConnection } from '@/lib/database/sqlite_database_connection_manager';
import { initializeObservatoryTables } from '@/lib/database/initialize_observatory_tables';

export interface MailMessage {
  id: string;
  recipientEmail: string;
  sender: string;
  subject: string;
  snippet: string;
  body: string;
  sentAt: string;
  isRead?: boolean;
  tag?: string;
}

/**
 * Sends a platform email and automatically logs a copy into the recipient's in-app platform mailbox.
 */
export function sendPlatformMail(mail: {
  recipientEmail: string;
  sender?: string;
  subject: string;
  snippet?: string;
  body: string;
  tag?: string;
}): MailMessage {
  initializeObservatoryTables();
  const db = getDatabaseConnection();

  const id = `mail_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const sender = mail.sender || 'InfraTrace Security <security@infratrace.internal>';
  const sentAt = new Date().toISOString();
  const snippet = mail.snippet || mail.body.substring(0, 90).replace(/\n/g, ' ') + '...';
  const tag = mail.tag || 'INBOX';

  const stmt = db.prepare(`
    INSERT INTO platform_mailbox (id, recipient_email, sender, subject, snippet, body, sent_at, is_read, tag)
    VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)
  `);

  stmt.run(id, mail.recipientEmail, sender, mail.subject, snippet, mail.body, sentAt, tag);

  // In production with RESEND_API_KEY or SMTP configured, trigger external delivery here.
  // In development, output clearly to server logs.
  console.log(`\n======================================================`);
  console.log(`[InfraTrace Mailer] Delivered to: ${mail.recipientEmail}`);
  console.log(`[Subject]: ${mail.subject}`);
  console.log(`[Body]:\n${mail.body}`);
  console.log(`======================================================\n`);

  return {
    id,
    recipientEmail: mail.recipientEmail,
    sender,
    subject: mail.subject,
    snippet,
    body: mail.body,
    sentAt,
    isRead: false,
    tag,
  };
}

/**
 * Cryptographically generates a 6-digit OTP, stores its SHA-256 hash in SQLite,
 * logs a copy to the user's platform inbox, and returns details.
 */
export function generateAndSendOtp(email: string): { success: boolean; message: string; otpPreview?: string } {
  initializeObservatoryTables();
  const db = getDatabaseConnection();

  // Rate-limiting check: check if an unexpired OTP was sent in the last 60 seconds
  const recent = db.prepare(`
    SELECT * FROM email_otp_verifications
    WHERE email = ? AND datetime(created_at, '+60 seconds') > datetime('now')
    ORDER BY id DESC LIMIT 1
  `).get(email) as any;

  if (recent) {
    return {
      success: false,
      message: 'Please wait 60 seconds before requesting another verification code.',
    };
  }

  // Cryptographically secure 6-digit integer
  const rawOtp = crypto.randomInt(100000, 1000000).toString();
  const otpHash = crypto.createHash('sha256').update(rawOtp).digest('hex');
  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

  // Insert verification entry
  db.prepare(`
    INSERT INTO email_otp_verifications (email, otp_hash, expires_at, attempts, created_at)
    VALUES (?, ?, ?, 0, ?)
  `).run(email, otpHash, expiresAt, now);

  // Send email and store in user's in-app platform mailbox
  sendPlatformMail({
    recipientEmail: email,
    sender: 'InfraTrace Verification <auth@infratrace.internal>',
    subject: `Your InfraTrace Verification Code: ${rawOtp}`,
    snippet: `Use verification code ${rawOtp} to verify your email address. Valid for 10 minutes.`,
    body: `Hello,\n\nYour one-time verification code for InfraTrace is:\n\n${rawOtp}\n\nThis code will expire in 10 minutes. If you did not request this verification, please ignore this email.\n\nBest regards,\nThe InfraTrace Team`,
    tag: 'SECURITY',
  });

  return {
    success: true,
    message: 'Verification code sent to your email and platform inbox.',
    otpPreview: rawOtp, // Exposed for development/testing ease
  };
}

/**
 * Validates the user-entered OTP against the stored SHA-256 hash.
 */
export function verifyOtp(email: string, enteredOtp: string): { valid: boolean; reason?: string } {
  initializeObservatoryTables();
  const db = getDatabaseConnection();

  const record = db.prepare(`
    SELECT * FROM email_otp_verifications
    WHERE email = ? AND datetime(expires_at) > datetime('now')
    ORDER BY id DESC LIMIT 1
  `).get(email) as any;

  if (!record) {
    return { valid: false, reason: 'Verification code has expired or was not requested. Please request a new one.' };
  }

  if (record.attempts >= 4) {
    return { valid: false, reason: 'Maximum verification attempts exceeded. Please request a new code.' };
  }

  const enteredHash = crypto.createHash('sha256').update(enteredOtp.trim()).digest('hex');

  if (enteredHash === record.otp_hash) {
    // Clean up used OTP
    db.prepare('DELETE FROM email_otp_verifications WHERE id = ?').run(record.id);
    return { valid: true };
  } else {
    db.prepare('UPDATE email_otp_verifications SET attempts = attempts + 1 WHERE id = ?').run(record.id);
    return { valid: false, reason: 'Invalid verification code. Please check your email and try again.' };
  }
}
