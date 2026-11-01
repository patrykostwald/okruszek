/* Z19: rzeczywiste zdarzenia gry, stałe ziarna, deterministyczne klatki i zrzuty. */
const { chromium, CHROME, fs, path } = require('./qa/wspolne.cjs');
const { zrodlo } = require('./qa/boty_z18.cjs');
const file = path.resolve(process.argv[2] || 'index.html');
const dir = path.join(__dirname, 'zrzuty-z19'); fs.mkdirSync(dir, { recursive: true });
let fail = 0; const wyn = {}, errors = [];
function check(v, s) { console.log((v ? '  ok   ' : '  FAIL ') + s); if (!v) fail++; }
const median = a => a.slice().sort((x,y)=>x-y)[Math.floor(a.length/2)];
(async () => {
 console.log('TEST Z19 ' + file);
 const br = await chromium.launch({headless:true, executablePath:CHROME});
 try {
 const ctx = await br.newContext({ viewport:{width:390,height:844}, deviceScaleFactor:1, hasTouch:true });
 await ctx.addInitScript(() => { let seed=19023; Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}; window.wibracjeTest = []; Object.defineProperty(navigator,'vibrate',{ configurable:true,value:p=>{wibracjeTest.push(p);return true;} }); });
 const pg = await ctx.newPage(); pg.on('pageerror', e=>errors.push(String(e)));
 await pg.goto('file:///' + file.replace(/\\/g,'/') + '?test&tor=1&seed=23');
 await pg.waitForFunction(()=>!!window.__okruszek);
 check(await pg.locator('#wibracje').isHidden(),'przełącznik nie zmienia ekranu startowego');
 const reset = () => pg.evaluate(()=>{ const O=__okruszek; O.panel(false); O.pauza(true); O.bezPradow(true); O.bezPrzeszkod(true); O.ziarno(23); O.brama(1); O.odblokuj(); O.nowyBieg(); O.pauza(true); O.pomiarKadru19(0); O.tempo(1); O.idz(1,1,true); });
 await reset();
 wyn.wejscie = await pg.evaluate(()=>{
  const O=__okruszek, cv=document.querySelector('canvas#g'), out=[];
  for(const mode of [1,2,3]) for(let i=0;i<7;i++) {
   O.sterowanie(mode); O.pauza(false); O.tempo(0.001);
   const before=O.skrzydla();
   cv.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerId:10+i,pointerType:'touch',isPrimary:true,clientX:300,clientY:700,button:0}));
   const after=O.skrzydla(); O.kadr19(); const q=O.czucie().wejscia.slice(-1)[0];
   out.push({mode,stan:q.stan-q.down,klatka:q.klatka-q.down,zmiana:after.f!==before.f});
   window.dispatchEvent(new PointerEvent('pointercancel',{bubbles:true,pointerId:10+i,pointerType:'touch'})); O.torSymuluj(0.6); O.idz(1,1,true);
  } return out;
 });
 check(wyn.wejscie.every(x=>x.stan<50 && x.zmiana),'pointerdown: natychmiastowa zmiana skrzydeł we wszystkich trybach');
 check(median(wyn.wejscie.map(x=>x.klatka))<50,'mediana do renderowania <50 ms: '+median(wyn.wejscie.map(x=>x.klatka)).toFixed(2));
 await reset();
 wyn.os = await pg.evaluate(()=>{const O=__okruszek; const a=[]; for(const sec of [0,0.25,0.5]){O.idz(1,1,true); if(sec)O.torSymuluj(sec);a.push(O.czucie().os);}return a;});
 check(wyn.os[0]>wyn.os[1] && wyn.os[1]>wyn.os[2],'poświata rośnie z bliskością osi: '+wyn.os.map(x=>x.toFixed(3)));
 await reset();
 wyn.kanaly = await pg.evaluate(src=>{
  const O=__okruszek; O.bezPradow(false); O.bezPrzeszkod(false); const bot=(0,eval)(src);
  O.torSymuluj(180,bot); O.bezPradow(true);O.bezPrzeszkod(true);O.nowyBieg(); O.pauza(true); O.pomiarKadru19(0);O.idz(1,1,true);
  O.torSymuluj(0.4,()=>({nurkuj:true}));O.torSymuluj(0.1,()=>({}));
  O.idz(1,1,true);O.zdarzenie('chmura:szara',{k:1,w:1,z:0.71});O.torSymuluj(0.1);
  O.ustawPoziom(4);O.torSymuluj(0.1);O.ustawPoziom(5);O.torSymuluj(0.1);O.brama(4);O.ustaw(0.1);O.zdarzenie('jastrzab');O.torSymuluj(4);
  return O.czucie().kanaly;
 },zrodlo('nurek',1044));
 const typy=['machniecie','prad','lancuch','rozkwit','wybicie','uderzenie','drapieznik','turbo','hiper','schody','nurkStart'];
 check(typy.every(n=>wyn.kanaly[n]?.obraz>0 && wyn.kanaly[n]?.dzwiek>0 && wyn.kanaly[n]?.vibrate>0),'11 typów zdarzeń: obraz + wywołanie dźwięku + vibrate: '+JSON.stringify(wyn.kanaly));
 await reset(); await pg.evaluate(()=>__okruszek.panel(true)); await pg.locator('#wibracje').click();
 wyn.wibracje = await pg.evaluate(()=>{const O=__okruszek;O.panel(false);const n=wibracjeTest.length;O.stuknij();return {bez:wibracjeTest.length===n,zapis:O.zapisPodglad().dz.v};});
 check(wyn.wibracje.bez && wyn.wibracje.zapis===0,'przełącznik wyłącza wibrację i zapisuje wybór');
 await pg.reload(); await pg.waitForFunction(()=>!!window.__okruszek);
 check(await pg.evaluate(()=>!__okruszek.czucie().wibracje),'wyłączenie zachowane po przeładowaniu');
 await reset(); await pg.evaluate(()=>__okruszek.panel(true)); await pg.locator('#wibracje').click();
 check(await pg.evaluate(()=>{__okruszek.panel(false);Object.defineProperty(navigator,'vibrate',{configurable:true,value:undefined});__okruszek.stuknij();return __okruszek.czucie().wibracje;}),'wibracje włączone: brak API nie powoduje błędu');
 wyn.ataki = await pg.evaluate(()=>{
  const O=__okruszek,out=[];
  for(let seed=1;seed<=30;seed++) {
   O.ziarno(seed);O.brama(4);O.bezPradow(true);O.bezPrzeszkod(true);O.ustaw(0.1);O.idz(1,1,true);O.zdarzenie('jastrzab');
   O.torSymuluj(12,A=>{const k=A.kom,c=A.hawCele||[];if(A.haw?.cel && A.haw.cel[2]>A.hawLock+0.15 && c.some(q=>q[0]===k.kol&&q[1]===k.wiersz)){const col=[0,1,2].find(x=>Math.abs(x-k.kol)===1&&!c.some(q=>q[0]===x&&q[1]===k.wiersz));if(col!==undefined)return {ruch:[col-k.kol,0]};}return {};});
   out.push(...O.torLog().ataki.filter(a=>a.lock!==undefined));
  } O.odblokuj(); return out;
 });
 check(wyn.ataki.length>=30 && Math.min(...wyn.ataki.map(a=>a.lockAt))>=0.5 && Math.max(...wyn.ataki.map(a=>a.lockAt))<=1.1 && new Set(wyn.ataki.map(a=>a.lockAt.toFixed(2))).size>15,'zmienne namierzanie 0,5–1,1 s, liczba prób '+wyn.ataki.length);
 check(wyn.ataki.every(a=>a.hitAt>=1.5 && a.drugi && a.wyjscie && !(a.wyjscie[0]===a.k&&a.wyjscie[1]===a.w) && !(a.wyjscie[0]===a.drugi[0]&&a.wyjscie[1]===a.drugi[1])),'K4: dwa cele, zapowiedź >=1,5 s i wolna sąsiednia droga');
 check(wyn.ataki.some(a=>a.zwod),'zwód w drugim uderzeniu');
 await reset();
 wyn.kamera = await pg.evaluate(()=>{const O=__okruszek;O.idz(2,1);O.torSymuluj(0.05);const a=O.czucie().kamera;O.zdarzenie('samolot',{k:2,w:1,z:0.71});O.torSymuluj(0.1);return {skret:a,trafienie:O.czucie().kamera};});
 await pg.emulateMedia({reducedMotion:'reduce'}); await pg.waitForFunction(()=>matchMedia('(prefers-reduced-motion: reduce)').matches === __okruszek.czucie().reducedMotion);
 wyn.kamera.reduce = await pg.evaluate(()=>__okruszek.czucie().kamera);
 check(wyn.kamera.reduce.drzenie===0 && wyn.kamera.reduce.przechyl===0 && wyn.kamera.reduce.kop===0,'reduced-motion wyłącza przechył, drżenie i kopnięcie');
 await pg.emulateMedia({reducedMotion:'no-preference'});
 await pg.waitForFunction(()=>matchMedia('(prefers-reduced-motion: reduce)').matches === __okruszek.czucie().reducedMotion); await reset();
 wyn.blyski = await pg.evaluate(()=>{const O=__okruszek;O.ustaw(0);let prev=false,starts=[];for(let i=0;i<600;i++){O.torSymuluj(1/60);O.kadr19(1/60);const on=O.czucie().blyskBurzy;if(on&&!prev)starts.push(i/60);prev=on;}return starts;});
 check(wyn.blyski.length>5 && wyn.blyski.every(t=>wyn.blyski.filter(x=>x>=t&&x<t+1).length<=3),'burze: najwyżej 3 początki błysku w dowolnym oknie sekundy');
 // Kontrast rzeczywistych pikseli, cień z porównania tego samego kadru z wyłączonym rysunkiem.
 wyn.kontrast = await pg.evaluate(()=>{
  const O=__okruszek,cv=document.querySelector('#g'),cx=cv.getContext('2d'),out=[];
  function lum(x,y,w,h){const d=cx.getImageData(Math.round(x*cv.width/390),Math.round(y*cv.height/844),Math.max(1,Math.round(w*cv.width/390)),Math.max(1,Math.round(h*cv.height/844))).data,a=[]; const lin=v=>(v/=255)<=0.04045?v/12.92:((v+0.055)/1.055)**2.4;for(let i=0;i<d.length;i+=4)a.push(.2126*lin(d[i])+.7152*lin(d[i+1])+.0722*lin(d[i+2]));return a.sort((a,b)=>a-b);}
  for(const pora of ['swit','dzien','zachod','noc'])for(const L of [0,5]){
   O.brama(1);O.nowyBieg(); O.pauza(true); O.pomiarKadru19(0);O.ustawPore(pora);O.ustawPoziom(L);O.torSymuluj(.1);O.idz(1,1,true);O.kadr19(0);
   const hud=[[18,14,64,12],[18,30,55,22],[142,60,70,14],[300,14,70,12]].map(b=>{const a=lum(...b);return (a[a.length>>1]+.05)/(a[Math.floor(a.length*.02)]+.05);});
   const q=O.cienOkruszka(); O.dbg({torCien:0});O.kadr19(0);let a=lum(q.x-8,q.y-2,16,4);O.dbg({torCien:1});O.kadr19(0);let b=lum(q.x-8,q.y-2,16,4); O.dbg({torCien:0});const la=a[a.length>>1],lb=b[b.length>>1],cie=(Math.max(la,lb)+.05)/(Math.min(la,lb)+.05);out.push({pora,L,hud,cien:cie});
  }return out;
 });
 check(wyn.kontrast.every(x=>x.hud.every(c=>c>=4.5)),'HUD >=4,5:1 także w hiperze: minimum '+Math.min(...wyn.kontrast.flatMap(x=>x.hud)).toFixed(2));
 check(wyn.kontrast.every(x=>x.cien>=2),'cień >=2:1 w każdej porze i L0/L5: '+wyn.kontrast.map(x=>x.cien.toFixed(2)));
 await pg.evaluate(()=>{const z=JSON.parse(localStorage.getItem('okruszek.zapis')||'{}');z.naukaTor=0;localStorage.setItem('okruszek.zapis',JSON.stringify(z));});
 await pg.reload();await pg.waitForFunction(()=>!!window.__okruszek);
 // Macierz zrzutów po rzeczywistym renderze, bez postprodukcji.
 wyn.sceny=[];
 for(const name of ['wskazowka','wiatr-os','wiatr-brzeg','dol-eta1.5','hiper-dzien','cien-noc','drapieznik']) {
  await reset();
  const data=await pg.evaluate(name=>{const O=__okruszek;O.ustawPore(name==='cien-noc'?'noc':'dzien');O.ustawPoziom(name==='hiper-dzien'?5:0);
   if(name.startsWith('wiatr')) {O.odblokuj();O.torSymuluj(1.5);O.zdarzenie('wiatr:gora',{k:1,w:1,z:0.7+O.tor().sp*1.1});O.torSymuluj(0.5);if(name==='wiatr-os')O.idz(1,1,true);}
   if(name==='dol-eta1.5'){O.zdarzenie('chmura:szara',{k:1,w:2,z:0.7+O.tor().sp*2});O.torSymuluj(.5);O.idz(1,1,true);}
   if(name==='drapieznik'){O.brama(4);O.ustaw(0.1);O.idz(1,1,true);O.zdarzenie('jastrzab');O.torSymuluj(3.1);}
   O.kadr19();return {nazwa:name,os:O.czucie().os,cien:O.cienOkruszka(),ptak:O.komorka(),obiekty:O.gdzie()};
  },name);
  await pg.locator('#g').screenshot({path:path.join(dir,name+'.png')});wyn.sceny.push(data);
 }
 const dol=wyn.sceny.find(x=>x.nazwa==='dol-eta1.5');check(dol.obiekty.some(x=>x.typ==='chmura:szara'&&x.ey>dol.ptak.ekranY),'przedmiot dolnego wiersza jest poniżej ptaka przy eta 1,5 s');
 check(wyn.sceny.find(x=>x.nazwa==='wiatr-os').os-wyn.sceny.find(x=>x.nazwa==='wiatr-brzeg').os>0.4,'zrzuty wiatru przedstawiają wyraźnie różne wyrównanie');
 check(errors.length===0,'brak błędów konsoli: '+JSON.stringify(errors));
 fs.writeFileSync(path.join(dir,'pomiary.json'),JSON.stringify(wyn,null,2));
 } finally {await br.close();}
 console.log(fail?'TEST Z19 NIE PRZESZEDŁ ('+fail+')':'TEST Z19 OK');process.exitCode=fail?1:0;
})().catch(e=>{console.error(e);process.exitCode=2;});
