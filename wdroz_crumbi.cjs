/* Okruszek/Crumbi: kopiuje wskazane pliki do zbudujmi\wdrozenie\dist\crumbi\ i wdraża (noindex w _headers i robots).
   Użycie: node wdroz_crumbi.cjs <katalog-ze-zrodlem> [--bez-wdrozenia]  (źródło: index.html + opcjonalnie manifest, ikony, sw.js, dzwieki/) */
const fs = require('fs'), path = require('path'), cp = require('child_process');
const src = path.resolve(process.argv[2] || '.'), dry = process.argv.includes('--bez-wdrozenia');
const root = 'C:/Users/User/zbudujmi/wdrozenie', dest = path.join(root, 'dist', 'crumbi');
if (!fs.existsSync(path.join(src, 'index.html'))) { console.error('brak index.html w ' + src); process.exit(2); }
const html = fs.readFileSync(path.join(src, 'index.html'), 'utf8');
if (!/<meta name="robots" content="noindex/.test(html)) { console.error('index.html bez meta robots noindex: przerywam'); process.exit(3); }
const headers = fs.readFileSync(path.join(root, 'dist', '_headers'), 'utf8'), robots = fs.readFileSync(path.join(root, 'dist', 'robots.txt'), 'utf8');
if (!/\/crumbi\/\*[\s\S]*X-Robots-Tag: noindex/.test(headers) || !/Disallow: \/crumbi\//.test(robots)) { console.error('brak noindex dla /crumbi w _headers lub robots: przerywam'); process.exit(4); }
fs.mkdirSync(dest, { recursive: true });
/* Lista DOZWOLONYCH plików gry (nic poza nią nie trafia na stronę): index.html, teksty.js, dzwiek.js, sw.js, manifest, ikony, folder dzwieki. */
const DOZWOLONE = /^(index\.html|teksty\.js|dzwiek\.js|sw\.js|manifest\.webmanifest|ikona-\d+(-maskable)?\.png)$/i;
const DOZWOLONE_FOLDERY = /^(dzwieki)$/i;
function copy(a, b) { for (const f of fs.readdirSync(a)) { const s = path.join(a, f), d = path.join(b, f), dir = fs.statSync(s).isDirectory(); if (dir ? !DOZWOLONE_FOLDERY.test(f) : !DOZWOLONE.test(f)) continue; if (dir) { fs.mkdirSync(d, { recursive: true }); copyAll(s, d); } else fs.copyFileSync(s, d); } }
function copyAll(a, b) { for (const f of fs.readdirSync(a)) { const s = path.join(a, f), d = path.join(b, f); if (fs.statSync(s).isDirectory()) { fs.mkdirSync(d, { recursive: true }); copyAll(s, d); } else fs.copyFileSync(s, d); } }
copy(src, dest);
console.log('skopiowano do ' + dest + ': ' + fs.readdirSync(dest).join(', '));
if (dry) { console.log('(bez wdrożenia)'); process.exit(0); }
const r = cp.spawnSync('npx', ['wrangler', 'deploy'], { cwd: root, env: Object.assign({}, process.env, { CI: '1' }), stdio: 'inherit', shell: true });
process.exit(r.status || 0);
