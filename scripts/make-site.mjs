// Builds the website versions of Theory Club from web/index.html.
//
//   node scripts/make-site.mjs <version> <owner/repo>
//
// Writes:
//   _site/index.html           the download page (GitHub Pages)
//   _site/app/                 the web app, installable as a phone or desktop app
//   release-web/theory-club-web.zip       the same web app, ready to upload to Netlify or any host
//   release-web/theory-club-offline.html  one file that opens in any browser, no install
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const version = process.argv[2] || 'dev';
const repo = process.argv[3] || process.env.GITHUB_REPOSITORY || '';

// web/index.html wraps the app's page body (see scripts/sync-web.sh); take the body back out.
const wrapped = readFileSync(join(root, 'web/index.html'), 'utf8');
const a = wrapped.indexOf('<body>'), b = wrapped.lastIndexOf('</body>');
if (a < 0 || b < 0) throw new Error('web/index.html has no <body>');
let app = wrapped.slice(a + 6, b).replace(/^\n/, '');

// Small changes for a normal website: challenge links open directly, and the
// leaderboard note doesn't mention Claude. A missing match is only a warning.
const swap = (from, to) => {
  if (!app.includes(from)) { console.warn('::warning::make-site: text not found, skipped: ' + from.slice(0, 60)); return; }
  app = app.replace(from, to);
};
swap("const txt=`I scored ${score}/10 on a Theory Club challenge. Can you beat it? Open Theory Club and enter this code: ${code}`;",
  "const link=location.origin&&location.origin.startsWith('http')?location.origin+location.pathname+'#'+code:'';const txt=`I scored ${score}/10 on a Theory Club challenge. Can you beat it? `+(link?`Play it here: ${link}`:`Open Theory Club and enter this code: ${code}`);");
swap("<p class=\"lede\">Send this to your friends. The page's Share menu can also copy a link that opens this challenge directly.</p>",
  "<p class=\"lede\">Send this to your friends. ${window.claude?'The page\\'s Share menu can also copy a link that opens this challenge directly.':'The link opens this exact challenge.'}</p>");
swap("const LB_OFF='<p class=\"hint\">Shared scores show here when you are signed in to Claude and the page is shared with you as a Contributor or higher. You can still copy your score into the group chat.</p>';",
  "const LB_OFF=window.claude?'<p class=\"hint\">Shared scores show here when you are signed in to Claude and the page is shared with you as a Contributor or higher. You can still copy your score into the group chat.</p>':'<p class=\"hint\">This version has no shared leaderboard, so copy your score and paste it in the group chat.</p>';");

const head = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="description" content="Learn music theory with your friends: daily challenge, CAGED system, guitar, bass, piano and drum lessons, jam band, tuner and more.">
<meta name="theory-club-version" content="${version}">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<meta name="theme-color" content="#F2F2F7" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0A0A0B" media="(prefers-color-scheme: dark)">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Theory Club">
<title>Theory Club</title>
<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>
</head>
<body>
`;
const sw = "\n<script>if('serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('sw.js').catch(()=>{})</script>";
const page = head + app + sw + '\n</body>\n</html>\n';

// the web app folder
const site = join(root, '_site'), appDir = join(site, 'app'), rel = join(root, 'release-web');
rmSync(site, { recursive: true, force: true }); rmSync(rel, { recursive: true, force: true });
mkdirSync(appDir, { recursive: true }); mkdirSync(rel, { recursive: true });
for (const f of readdirSync(join(root, 'site'))) {
  if (f === 'download.html') continue;
  if (f === 'sw.js') writeFileSync(join(appDir, f), readFileSync(join(root, 'site', f), 'utf8').replaceAll('__VERSION__', version));
  else cpSync(join(root, 'site', f), join(appDir, f));
}
writeFileSync(join(appDir, 'index.html'), page);

// the download page
const dl = readFileSync(join(root, 'site/download.html'), 'utf8').replaceAll('__REPO__', repo).replaceAll('__VERSION__', version);
writeFileSync(join(site, 'index.html'), dl);
cpSync(join(root, 'site/favicon.svg'), join(site, 'favicon.svg'));
writeFileSync(join(site, '.nojekyll'), '');

// release files: a zip of the web app (folder named theory-club) and one offline file
const tmp = join(root, '_zip'); rmSync(tmp, { recursive: true, force: true }); mkdirSync(tmp);
cpSync(appDir, join(tmp, 'theory-club'), { recursive: true });
execFileSync('zip', ['-qr', join(rel, 'theory-club-web.zip'), 'theory-club'], { cwd: tmp });
rmSync(tmp, { recursive: true, force: true });
writeFileSync(join(rel, 'theory-club-offline.html'), page.replace(sw, '').replace(/<link rel="(icon|manifest|apple-touch-icon)"[^>]*>\n/g, ''));
console.log(`Built Theory Club ${version} for ${repo || '(no repo)'}: _site/ and release-web/`);
