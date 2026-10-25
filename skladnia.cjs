/* Okruszek: szybkie sprawdzenie składni skryptów w index.html i teksty.js (po każdej edycji). Użycie: node skladnia.cjs [plik.html] */
const fs = require('fs'), os = require('os'), path = require('path'), cp = require('child_process');
const file = path.resolve(process.argv[2] || path.join(__dirname, 'index.html'));
const html = fs.readFileSync(file, 'utf8');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const extra = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => path.join(path.dirname(file), m[1]));
let bad = 0;
scripts.forEach((js, i) => { const tmp = path.join(os.tmpdir(), 'okruszek-skl-' + i + '.js'); fs.writeFileSync(tmp, js); try { cp.execFileSync(process.execPath, ['--check', tmp], { stdio: 'pipe' }); console.log('ok   skrypt ' + (i + 1)); } catch (e) { bad++; console.log('FAIL skrypt ' + (i + 1) + ': ' + String(e.stderr || e).split('\n').slice(0, 4).join(' | ')); } });
extra.forEach((f) => { try { cp.execFileSync(process.execPath, ['--check', f], { stdio: 'pipe' }); console.log('ok   ' + path.basename(f)); } catch (e) { bad++; console.log('FAIL ' + path.basename(f) + ': ' + String(e.stderr || e).split('\n').slice(0, 4).join(' | ')); } });
process.exit(bad ? 1 : 0);
