/* arkusz zrzutów: node arkusz.cjs katalog prefiks wyjście.png [szer] */
const { chromium } = require('C:/Users/User/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs=require('fs'), path=require('path');
(async()=>{const dir=process.argv[2], pre=process.argv[3], out=process.argv[4], w=+(process.argv[5]||195);
const files=fs.readdirSync(dir).filter(f=>f.startsWith(pre)).sort();
const b=await chromium.launch({executablePath:'C:/Users/User/AppData/Local/ms-playwright/chromium-1134/chrome-win/chrome.exe'});const p=await b.newPage({viewport:{width:1240,height:600}});
await p.setContent('<body style="margin:0;background:#222;display:flex;flex-wrap:wrap;gap:4px">'+files.map(f=>'<div style="color:#fff;font:10px sans-serif"><img src="data:image/png;base64,'+fs.readFileSync(path.join(dir,f)).toString('base64')+'" width='+w+'><br>'+f.replace('z4-','').replace('.png','')+'</div>').join('')+'</body>');
await p.screenshot({path:out,fullPage:true});await b.close();})();
