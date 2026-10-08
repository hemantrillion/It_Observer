const { spawn } = require('node:child_process');
const path = require('node:path');

console.log('====================================================');
console.log('   STARTING INFRASTRUCTURE OBSERVATORY 30-A SUITE   ');
console.log('====================================================');

// 1. Start Companion Controlled Service (Port 5001)
const companionPath = path.join(__dirname, '..', 'controlled_service', 'server.js');
const companionProcess = spawn(process.execPath, [companionPath], {
  stdio: 'inherit',
});

// 2. Start Next.js Development Server (Port 3000)
const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';
const nextProcess = spawn(npmCmd, ['run', 'dev'], {
  stdio: 'inherit',
});

function cleanup() {
  console.log('\nShutting down Observatory services...');
  companionProcess.kill();
  nextProcess.kill();
  process.exit();
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
