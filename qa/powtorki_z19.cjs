/* Powtórki niezaliczonych zestawów po pełnym preflighcie, kolejno bez konkurencji pomiarów. */
const fs=require('fs'),path=require('path'),cp=require('child_process');
const root=path.resolve(__dirname,'..'),wyn=[];
for(const [n,env] of [['z3b',{}],['z11',{CZESCI:'j'}],['z5',{}],['z14',{}],['z17',{}],['z18',{}],['z19',{}]]) {
 const start=Date.now();console.log('START '+n+' '+new Date().toISOString());
 const r=cp.spawnSync(process.execPath,['gra_test_'+n+'.cjs'],{cwd:root,env:{...process.env,...env},encoding:'utf8',timeout:1500000,maxBuffer:12*1024*1024});
 const out=(r.stdout||'')+(r.stderr||'')+(r.error?'\n'+r.error:'');
 fs.writeFileSync(path.join(root,'powtorka-z19-'+n+'.log'),out);
 const q={test:n,kod:r.status,sekundy:Math.round((Date.now()-start)/1000),zakres:n==='z11'?'a,h,j (powtórka wydajności)':'pełny'};wyn.push(q);
 console.log(JSON.stringify(q));console.log(out.split('\n').filter(x=>/FAIL|TEST .*OK|NIE PRZESZED|BŁĄD/.test(x)).join('\n'));
 fs.writeFileSync(path.join(__dirname,'wynik_z19_powtorki.json'),JSON.stringify(wyn,null,2));
}
process.exitCode=wyn.some(x=>x.kod!==0)?1:0;
