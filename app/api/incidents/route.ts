import { NextResponse } from 'next/server';
import { getAllIncidentsHistoryQuery } from '@/lib/database/get_all_incidents_history_query';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const incidents = getAllIncidentsHistoryQuery(50);
    return NextResponse.json({ success: true, incidents });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to query incidents';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
