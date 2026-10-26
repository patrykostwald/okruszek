/* CDP: wejście trafia przez przeglądarkę, pomiar kończy rzeczywista klatka renderera. */
const {chromium,CHROME,fs,path}=require('./wspolne.cjs');
(async()=>{const br=await chromium.launch({headless:true,executablePath:CHROME});try{
 const pg=await br.newPage({viewport:{width:390,height:844},hasTouch:true});const errors=[];pg.on('pageerror',e=>errors.push(String(e)));
 await pg.goto('file:///'+path.resolve('index.html').replace(/\\/g,'/')+'?test&tor=1&dzwiek=1');await pg.waitForFunction(()=>!!window.__okruszek);
 const cdp=await pg.context().newCDPSession(pg),out=[];
 for(const mode of [1,2,3]){
  await pg.evaluate(mode=>{const O=__okruszek;O.panel(false);O.nowyBieg();O.sterowanie(mode);O.bezPrzeszkod(true);O.bezPradow(true);O.ustaw(0);O.tempo(.01);O.pauza(false);},mode);await pg.waitForTimeout(500);
  for(let i=0;i<12;i++){
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:300,y:700,id:1}]});await pg.waitForTimeout(80);
   out.push(await pg.evaluate(mode=>{const q=__okruszek.czucie().wejscia.slice(-1)[0];return {mode,stan:q.stan-q.down,klatka:q.klatka===null?null:q.klatka-q.down};},mode));
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await pg.waitForTimeout(100);
  }
 }
 const audio=await pg.evaluate(async()=>{const D=OkruszekDzwiek;await D.start();D.dzwiek(true);D.pauza(false);const names=['machniecie','uderzenie','wybicie','lancuch','rozkwit','drapieznik','turbo','hiper','schody','nurkStart','prad'];for(const n of names){D[n](n==='drapieznik'?'sowa':2);await new Promise(r=>setTimeout(r,140));}return names;});
 const summary=[1,2,3].map(mode=>{const a=out.filter(x=>x.mode===mode&&x.klatka!==null).map(x=>x.klatka).sort((a,b)=>a-b);return {mode,n:a.length,mediana:a[a.length>>1],max:a[a.length-1]};});
 fs.writeFileSync(path.join(__dirname,'wynik_z19_dotyk.json'),JSON.stringify({summary,out,audio,errors},null,2));console.log(JSON.stringify({summary,audio,errors}));
 if(errors.length||summary.some(x=>x.n<12||x.mediana>=50))process.exitCode=1;
}finally{await br.close();}})().catch(e=>{console.error(e);process.exitCode=2;});
