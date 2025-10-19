// Delete NODE_OPTIONS from environment before spawning
delete process.env.NODE_OPTIONS;

const { spawn } = require('child_process');
const path = require('path');

const nextBin = path.join(__dirname, 'node_modules', '.bin', 'next.cmd');

console.log('Starting Next.js dev server...');

const child = spawn(nextBin, ['dev'], {
  stdio: 'inherit',
  shell: false,
  env: Object.assign({}, process.env, { NODE_OPTIONS: '' }),
  cwd: __dirname
});

child.on('exit', (code) => {
  process.exit(code || 0);
});

