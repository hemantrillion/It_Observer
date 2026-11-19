import { NextResponse } from 'next/server';
import { getDatabaseConnection } from '@/lib/database/sqlite_database_connection_manager';
import { initializeObservatoryTables } from '@/lib/database/initialize_observatory_tables';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    initializeObservatoryTables();
    const db = getDatabaseConnection();
    const { searchParams } = new URL(req.url);
    const emailParam = searchParams.get('email');

    let mails: any[] = [];
    if (emailParam && emailParam.trim() !== '') {
      mails = db
        .prepare(`
          SELECT * FROM platform_mailbox
          WHERE LOWER(recipient_email) = LOWER(?) OR LOWER(recipient_email) = 'jai18hemant334@gmail.com'
          ORDER BY sent_at DESC
        `)
        .all(emailParam.trim());
    } else {
      mails = db
        .prepare(`
          SELECT * FROM platform_mailbox
          ORDER BY sent_at DESC
        `)
        .all();
    }

    return NextResponse.json({
      success: true,
      mails,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    initializeObservatoryTables();
    const db = getDatabaseConnection();
    db.prepare('DELETE FROM platform_mailbox').run();
    return NextResponse.json({ success: true, message: 'Mailbox cleared' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
