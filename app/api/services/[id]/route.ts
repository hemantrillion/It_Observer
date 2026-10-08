import { NextRequest, NextResponse } from 'next/server';
import { getSingleServiceByIdQuery } from '@/lib/database/get_single_service_by_id_query';
import { getMetricSamplesByServiceQuery } from '@/lib/database/get_metric_samples_by_service_query';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const service = getSingleServiceByIdQuery(params.id);
    if (!service) {
      return NextResponse.json({ success: false, error: 'Service not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const limitParam = parseInt(searchParams.get('limit') || '120', 10);
    const safeLimit = Math.max(10, Math.min(500, isNaN(limitParam) ? 120 : limitParam));

    const samples = getMetricSamplesByServiceQuery(params.id, safeLimit);
    return NextResponse.json(
      { success: true, service, samples },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to query service';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
