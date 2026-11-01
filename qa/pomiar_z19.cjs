/* Porównanie przed/po na tych samych ziarnach. Baza z HEAD tylko do odczytu; bez checkout/commit. */
const {chromium,CHROME,fs,path}=require('./wspolne.cjs');
const cp=require('child_process'),{zrodlo}=require('./boty_z18.cjs');
const root=path.resolve(__dirname,'..'),base=path.join(root,'baza-z19.html');
fs.writeFileSync(base,cp.execFileSync('git',['show','HEAD:index.html'],{cwd:root}));
(async()=>{const br=await chromium.launch({headless:true,executablePath:CHROME});const wyn={};
try{for(const [wersja,file]of [['przed',base],['po',path.join(root,'index.html')]]){
 const pg=await br.newPage({viewport:{width:390,height:844}});await pg.goto('file:///'+file.replace(/\\/g,'/')+'?test&tor=1&seed=23');await pg.waitForFunction(()=>!!window.__okruszek);wyn[wersja]={};
 for(const profil of ['idealny','b70','b50','uwazny','losowy']){
  const out=[];for(const kr of [1,2,3,4,5,6])for(let i=0;i<4;i++){
   const seed=1000+kr*37+i*101,src=zrodlo(profil,seed+7),max=profil==='b50'||profil==='losowy'?61:1200;
   out.push(await pg.evaluate(([src,kr,seed,max])=>{let mr=seed;Math.random=()=>{mr=(Math.imul(mr,1664525)+1013904223)>>>0;return mr/4294967296;};const O=__okruszek;O.panel(false);O.ziarno(seed);O.brama(kr);O.odblokuj();O.ustawEnergie(null);O.bezPrzeszkod(false);O.bezPradow(false);O.pauza(true);const bot=(0,eval)(src);let r,first=null,pelny60=0;do{r=O.torSymuluj(.25,bot,1/60);if(r.E>=.98&&first===null)first=r.graCzas;if(r.graCzas<=60.01)pelny60=r.pelnyKolor.lacznie;}while(r.graCzas<max&&r.tryb==='gra');return {seed,kr,t:r.graCzas,koniec:r.tryb,first,pelny60};},[src,kr,seed,max]));
  }const sorted=out.map(x=>x.t).sort((a,b)=>a-b);wyn[wersja][profil]={mediana:sorted[sorted.length>>1],pelnyDo60:out.filter(x=>x.first!==null&&x.first<=60).length,pelny60max:Math.max(...out.map(x=>x.pelny60)),zakonczone:out.filter(x=>x.koniec!=='gra').length,n:out.length,biegi:out};console.log(wersja,profil,JSON.stringify({...wyn[wersja][profil],biegi:undefined}));
 }await pg.close();}
 fs.writeFileSync(path.join(__dirname,'wynik_z19_przed_po.json'),JSON.stringify(wyn,null,2));
}finally{await br.close();fs.unlinkSync(base);}})().catch(e=>{console.error(e);process.exitCode=1;});
