// Moves a page's big inline scripts into their own files. Browsers read separate script files in the
// background and keep compiled copies between visits, so the app opens noticeably faster, most of all on phones.
//   import { splitScripts } from './split-scripts.mjs'  -> { html, files: [[name, code]] }
//   node scripts/split-scripts.mjs <folder>            -> rewrites <folder>/index.html in place
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export function splitScripts(html, minSize = 50000) {
  const files = [];
  const out = html.replace(/<script(\s[^>]*)?>([\s\S]*?)<\/script>/g, (all, attrs = '', code) => {
    if (/\b(type|src)=/.test(attrs) || code.length < minSize) return all;
    const name = files.length ? `app${files.length + 1}.js` : 'app.js';
    files.push([name, code]);
    return `<script src="${name}"></script>`;
  });
  return { html: out, files };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dir = process.argv[2];
  const p = join(dir, 'index.html');
  const { html, files } = splitScripts(readFileSync(p, 'utf8'));
  for (const [n, c] of files) writeFileSync(join(dir, n), c);
  writeFileSync(p, html);
  console.log(`moved ${files.map(f => f[0]).join(', ') || 'nothing'} out of ${p}`);
}
