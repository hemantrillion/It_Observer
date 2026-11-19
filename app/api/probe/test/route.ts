import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url, method = 'GET', headers = {} } = body;

    if (!url) {
      return NextResponse.json({ success: false, error: 'Target URL is required' }, { status: 400 });
    }

    const startTime = performance.now();
    let responseStatus = 0;
    let responseStatusText = '';
    let responseHeaders: Record<string, string> = {};
    let sampleData: any = null;
    let isOk = false;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'User-Agent': 'InfraTrace-Telemetry-Prober/2.0 (+https://infratrace.io)',
          ...headers,
        },
        signal: controller.signal,
        cache: 'no-store',
      });

      clearTimeout(timeout);
      const endTime = performance.now();
      const latencyMs = Math.round(endTime - startTime);

      responseStatus = res.status;
      responseStatusText = res.statusText;
      isOk = res.ok;

      // Extract headers
      res.headers.forEach((val, key) => {
        if (['content-type', 'content-length', 'server', 'x-powered-by', 'date'].includes(key.toLowerCase())) {
          responseHeaders[key] = val;
        }
      });

      // Try parsing JSON or text
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const json = await res.json();
        // Truncate if too huge
        sampleData = Array.isArray(json) ? json.slice(0, 3) : json;
      } else {
        const text = await res.text();
        sampleData = text.length > 500 ? text.substring(0, 500) + '... (truncated)' : text;
      }

      return NextResponse.json({
        success: true,
        status: responseStatus,
        statusText: responseStatusText,
        latencyMs,
        isOk,
        headers: responseHeaders,
        sampleData,
        timestamp: new Date().toISOString(),
      });
    } catch (fetchErr: any) {
      clearTimeout(timeout);
      const endTime = performance.now();
      const latencyMs = Math.round(endTime - startTime);

      return NextResponse.json({
        success: false,
        error: fetchErr.name === 'AbortError' ? 'Request timed out after 8000ms' : fetchErr.message,
        latencyMs,
        status: 0,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
