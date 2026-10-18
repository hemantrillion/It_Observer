import { NextResponse } from 'next/server';
import { getDatabaseConnection } from '@/lib/database/sqlite_database_connection_manager';
import { initializeObservatoryTables } from '@/lib/database/initialize_observatory_tables';

export async function GET(req: Request) {
  try {
    initializeObservatoryTables();
    const db = getDatabaseConnection();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email') || 'xyztestuser@gmail.com';

    const mails = db.prepare(`
      SELECT * FROM platform_mailbox
      WHERE LOWER(recipient_email) = LOWER(?)
      ORDER BY sent_at DESC
    `).all(email);

    return NextResponse.json({
      success: true,
      mails,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
