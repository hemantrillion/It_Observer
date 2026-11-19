const http = require('node:http');

const PORT = 5001;

let state = {
  status: 'HEALTHY', // 'HEALTHY' | 'DOWN' | 'LAG'
  artificialLagMs: 0,
  startTime: Date.now(),
};

function getSystemMetrics() {
  const mem = process.memoryUsage();
  const cpu = process.cpuUsage();
  return {
    status: state.status,
    uptimeSeconds: Math.round((Date.now() - state.startTime) / 1000),
    memoryMb: Math.round(mem.rss / (1024 * 1024)),
    heapUsedMb: Math.round(mem.heapUsed / (1024 * 1024)),
    cpuPercentage: Math.min(100, Math.round(((cpu.user + cpu.system) / 1000000) % 100)),
    artificialLagMs: state.artificialLagMs,
  };
}

const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Artificial lag simulation
  if (state.artificialLagMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, state.artificialLagMs));
  }

  // Health check endpoint
  if (req.url === '/metrics' || req.url === '/health') {
    if (state.status === 'DOWN') {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Service Unavailable (Chaos Trigger Active)', ...getSystemMetrics() }));
      return;
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(getSystemMetrics()));
    return;
  }

  // Chaos controls (support both GET and POST for easy browser / curl triggering)
  const isDownReq = req.url === '/chaos/down' || req.url === '/chaos/crash' || req.url === '/crash' || req.url === '/down';
  const isLagReq = req.url === '/chaos/lag' || req.url === '/lag';
  const isRecoverReq = req.url === '/chaos/recover' || req.url === '/recover' || req.url === '/up';

  if (isDownReq && (req.method === 'POST' || req.method === 'GET')) {
    state.status = 'DOWN';
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Chaos: Service set to DOWN (503)' }));
    return;
  }

  if (isLagReq && (req.method === 'POST' || req.method === 'GET')) {
    state.status = 'LAG';
    state.artificialLagMs = 2500;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Chaos: Artificial 2500ms lag injected' }));
    return;
  }

  if (isRecoverReq && (req.method === 'POST' || req.method === 'GET')) {
    state.status = 'HEALTHY';
    state.artificialLagMs = 0;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Chaos: Service recovered to HEALTHY' }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not Found' }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[Controlled Service] Running on http://localhost:${PORT}`);
});
