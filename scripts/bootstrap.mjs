import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const npm = path.join(path.dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js');
function execute(file, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [file, ...args], { cwd: root, windowsHide: true, stdio: 'inherit', env: { ...process.env, PATH: path.dirname(process.execPath) + path.delimiter + process.env.PATH } });
    child.on('error', reject); child.on('close', code => code === 0 ? resolve() : reject(new Error(`Command exited ${code}`)));
  });
}
try {
  if (Number(process.versions.node.split('.')[0]) < 22 || !existsSync(npm)) throw new Error('Node.js 22+ and npm required. Run start.ps1.');
  await execute(npm, ['install', '--no-audit', '--no-fund']);
  if (!process.argv.includes('--setup-only')) await execute(path.join(root, 'node_modules/vite/bin/vite.js'), ['--configLoader', 'native', '--host', '127.0.0.1', '--port', '5177', '--open', ...process.argv.slice(2)]);
} catch (e) { console.error('BARDO Pages:', e.message); process.exitCode = 1; }
