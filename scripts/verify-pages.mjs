/** Static artifact checks. Run after `npm run build` or point at an existing site directory. */
import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { resolve, dirname, join, relative, sep } from 'node:path';

const root = resolve(process.argv[2] || 'dist');
const fail = message => { console.error(`BARDO Pages check failed: ${message}`); process.exit(1); };
const index = join(root, 'index.html');
if (!existsSync(index)) fail('index.html not found');
if (!existsSync(join(root, '.nojekyll'))) fail('.nojekyll not found');
const html = readFileSync(index, 'utf8');
if (!html.includes('id="app"')) fail('app mount element missing');
if (!html.includes('type="module"')) fail('built entry module missing');
if (/\/src\/app\.ts/.test(html)) fail('unbuilt Vite entry found');
const references = [...html.matchAll(/(?:src|href)="([^"#?]+)"/g)].map(match => match[1]);
if (!references.length) fail('no static asset references found');
for (const asset of references) {
  if (/^(?:\/|https?:|data:|blob:)/i.test(asset)) fail(`external or absolute asset reference: ${asset}`);
  const file = resolve(dirname(index), asset);
  if (!file.startsWith(root + sep) || !existsSync(file)) fail(`missing or escaping asset: ${asset}`);
}
const assets = join(root, 'assets');
if (!existsSync(assets)) fail('assets directory missing');
const files = readdirSync(assets).map(file => join(assets, file));
const worker = files.find(file => /analyzer\.worker-[\w-]+\.js$/.test(file));
if (!worker) fail('audio analyzer worker missing');
for (const file of files.filter(file => /\.js$/.test(file))) {
  const code = readFileSync(file, 'utf8');
  if (/\/api\/bardo\b/.test(code)) fail(`server-only API reference in ${relative(root, file)}`);
}
const total = files.reduce((sum, file) => sum + statSync(file).size, 0);
console.log(`BARDO Pages verified: ${references.length} relative HTML assets, audio worker present, ${files.length} asset files (${(total / 1024).toFixed(0)} KiB).`);
