// Checks the app's script modules before anything runs:
//  - the combined script parses (a syntax error is reported as module file and line)
//  - no name is declared twice in the same scope (acorn reports this as an error too)
//  - nothing declared inside the app's main block quietly hides (shadows) a name declared
//    at the very top of the script, which makes code in different modules see different things.
// Usage: node scripts/check-app.mjs   (exit code 1 on problems)
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(join(here, '..', 'tools', 'package.json'));
const acorn = require('acorn'), walk = require('acorn-walk');
const root = join(here, '..', 'app');
const files = JSON.parse(readFileSync(join(root, 'manifest.json'), 'utf8')).find(p => p.kind === 'script').files;
let js = ''; const starts = [];
for (const f of files) { starts.push([js.length, f]); js += readFileSync(join(root, f), 'utf8'); }
const where = pos => { let s0 = 0, f = files[0]; for (const [s, ff] of starts) if (s <= pos) { s0 = s; f = ff; } const line = js.slice(s0, pos).split('\n').length; return `app/${f}:${line}`; };
let ast;
try { ast = acorn.parse(js, { ecmaVersion: 'latest', locations: false }); }
catch (e) { console.error(`✗ ${where(e.pos)}: ${e.message.replace(/ \(\d+:\d+\)$/, '')}`); process.exit(1); }
const names = n => { const out = []; const add = p => { if (!p) return; if (p.type === 'Identifier') out.push(p); else if (p.type === 'ObjectPattern') p.properties.forEach(q => add(q.value || q.argument)); else if (p.type === 'ArrayPattern') p.elements.forEach(add); else if (p.type === 'AssignmentPattern') add(p.left); else if (p.type === 'RestElement') add(p.argument); }; n.declarations.forEach(d => add(d.id)); return out; };
const topNames = new Map();
for (const st of ast.body) {
  if (st.type === 'VariableDeclaration') names(st).forEach(id => topNames.set(id.name, id.start));
  if (st.type === 'FunctionDeclaration' || st.type === 'ClassDeclaration') topNames.set(st.id.name, st.start);
}
// the app's code lives in `if (typeof document !== 'undefined') { … }` (and any plain blocks)
const mainBlocks = ast.body.flatMap(st => st.type === 'BlockStatement' ? [st] : st.type === 'IfStatement' && st.consequent.type === 'BlockStatement' ? [st.consequent] : []);
const problems = [];
for (const b of mainBlocks) for (const st of b.body) {
  const ids = st.type === 'VariableDeclaration' ? names(st) : (st.type === 'FunctionDeclaration' || st.type === 'ClassDeclaration') ? [st.id] : [];
  for (const id of ids) if (topNames.has(id.name)) problems.push(`${where(id.start)}: "${id.name}" hides the one declared at ${where(topNames.get(id.name))}`);
}
const nMods = files.length;
if (problems.length) { console.error(problems.map(p => '✗ ' + p).join('\n')); process.exit(1); }
console.log(`✓ ${nMods} modules parse; no clashing names (${topNames.size} top-level names, ${mainBlocks.length} main block).`);
