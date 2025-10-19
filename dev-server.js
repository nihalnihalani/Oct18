// Clear NODE_OPTIONS before starting Next.js
delete process.env.NODE_OPTIONS;

// Start Next.js dev server
const { spawn } = require('child_process');

const child = spawn('npx', ['next', 'dev'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, NODE_OPTIONS: '' }
});

child.on('error', (error) => {
  console.error('Error starting dev server:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code);
});

