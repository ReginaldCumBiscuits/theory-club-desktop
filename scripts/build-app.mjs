// Builds the single-file app (theory-club.html) from the modules in app/.
//   node scripts/build-app.mjs [out]   (default: dist/theory-club.html)
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'app');
export function buildApp() {
  const parts = JSON.parse(readFileSync(join(root, 'manifest.json'), 'utf8'));
  const rd = f => readFileSync(join(root, f), 'utf8');
  const map = [];  // where each module starts in the built file, for error messages
  let out = '';
  for (const p of parts) {
    if (p.kind === 'text') out += p.text;
    else if (p.kind === 'style') out += '<style>' + rd(p.file) + '</style>';
    else if (p.kind === 'file') out += rd(p.file);
    else if (p.kind === 'json') out += `<script type="application/json" id="${p.id}">` + rd(p.file) + '</script>';
    else if (p.kind === 'script') { out += '<script>'; for (const f of p.files) { map.push([out.length, f]); out += rd(f); } out += '</script>'; }
  }
  return { html: out, map };
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dest = process.argv[2] || join(root, '..', 'dist', 'theory-club.html');
  mkdirSync(dirname(dest), { recursive: true });
  const { html } = buildApp();
  writeFileSync(dest, html);
  console.log(`built ${dest} (${(html.length / 1e6).toFixed(2)} MB)`);
}
