(function(){
  var cv=document.getElementById('probka'); if(!cv) return;
  var ctx=cv.getContext('2d');
  var W=390,H=640, dpr=Math.min(2,window.devicePixelRatio||1);
  cv.width=W*dpr; cv.height=H*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
  var seed=11; function rnd(){ seed=(seed*16807)%2147483647; return (seed-1)/2147483646; }
  function lerp(a,b,t){ return a+(b-a)*t; }
  function mix(c1,c2,t,a){ t=Math.max(0,Math.min(1,t)); var r=Math.round(lerp(c1[0],c2[0],t)),g=Math.round(lerp(c1[1],c2[1],t)),b=Math.round(lerp(c1[2],c2[2],t)); return a==null?'rgb('+r+','+g+','+b+')':'rgba('+r+','+g+','+b+','+a+')'; }
  function rgba(c,a){ return 'rgba('+c[0]+','+c[1]+','+c[2]+','+Math.max(0,Math.min(1,a))+')'; }
  var NAVY=[14,19,36], LINE=[236,240,248], SKYTOP=[20,36,96], SKYMID=[112,72,148], SKYHOR=[255,138,70], SKYLOW=[255,205,130];
  var CLOUD_LIGHT=[255,241,232], CLOUD_SHADE=[154,122,172], CLOUD_UNDER=[255,150,92];
  var B_NEAR=[16,22,42], B_FAR=[74,62,124], WIN_WARM=[255,206,118], WIN_COOL=[166,214,255], PAPER=[250,248,244];
  var L=W*2.4, GROUND=H-72;

  function makeCloud(w,h){
    var n=4+Math.floor(rnd()*4), lobes=[], i;
    for(i=0;i<n;i++) lobes.push({cx:lerp(w*0.12,w*0.88,i/(n-1))+(rnd()-0.5)*w*0.12, r:lerp(h*0.5,h*1.0,rnd())});
    var pts=[], x, y, j, dx, yy;
    for(x=0;x<=w;x+=5){ y=h; for(j=0;j<n;j++){ dx=x-lobes[j].cx; if(Math.abs(dx)<lobes[j].r){ yy=h-Math.sqrt(lobes[j].r*lobes[j].r-dx*dx)*0.82; if(yy<y) y=yy; } }
      y+=Math.sin(x*0.31+h)*1.4; pts.push([x,Math.min(h,y)]); }
    return {w:w,h:h,pts:pts};
  }
  function drawCloud(c,x,y,sc,s,far){
    var i,px; ctx.save(); ctx.translate(x,y); ctx.scale(sc,sc); ctx.beginPath();
    for(i=0;i<c.pts.length;i++){ if(i) ctx.lineTo(c.pts[i][0],c.pts[i][1]); else ctx.moveTo(c.pts[i][0],c.pts[i][1]); }
    for(i=c.pts.length-1;i>=0;i-=3){ px=c.pts[i][0]; ctx.lineTo(px,c.h+Math.sin(px*0.2)*1.6); }
    ctx.closePath();
    ctx.fillStyle=mix(NAVY,[24,30,52],s*0.6); ctx.fill();
    if(s>0.02){ var g=ctx.createLinearGradient(0,0,0,c.h);
      if(far){ g.addColorStop(0,rgba(CLOUD_LIGHT,0.45*s)); g.addColorStop(0.65,rgba([150,130,190],0.6*s)); g.addColorStop(1,rgba(CLOUD_UNDER,0.75*s)); }
      else { g.addColorStop(0,rgba(CLOUD_LIGHT,0.97*s)); g.addColorStop(0.45,rgba([232,196,214],0.95*s)); g.addColorStop(0.8,rgba([255,176,120],0.97*s)); g.addColorStop(1,rgba(CLOUD_UNDER,1*s)); }
      ctx.fillStyle=g; ctx.fill(); }
    ctx.lineWidth=(far?0.8:1.3)/sc; ctx.strokeStyle=rgba(LINE,far?0.5*(1-s*0.85):0.9*(1-s*0.72)); ctx.stroke();
    ctx.restore();
  }
  function makeBuilding(x,w,h){
    var cols=Math.max(2,Math.floor(w/9)), rows=Math.max(3,Math.floor(h/11)), lit=[], i;
    for(i=0;i<cols*rows;i++) lit.push(rnd()<0.42);
    return {x:x,w:w,h:h,cols:cols,rows:rows,lit:lit,spire:rnd()<0.28?10+rnd()*26:0};
  }
  function drawBuilding(b,ox,s,far){
    var x=b.x+ox, top=GROUND-b.h-(far?34:0), r, c, cw=b.w/b.cols, rh=b.h/b.rows, warm, wx, wy;
    ctx.fillStyle=far?mix(NAVY,B_FAR,s):mix(NAVY,B_NEAR,s); ctx.fillRect(x,top,b.w,b.h);
    ctx.lineWidth=far?0.7:1; ctx.strokeStyle=rgba(LINE,far?0.42*(1-s*0.92):0.85*(1-s*0.7)); ctx.strokeRect(x+0.5,top+0.5,b.w-1,b.h-1);
    if(b.spire){ ctx.beginPath(); ctx.moveTo(x+b.w/2,top); ctx.lineTo(x+b.w/2,top-b.spire); ctx.stroke(); }
    for(r=0;r<b.rows;r++) for(c=0;c<b.cols;c++){ if(!b.lit[r*b.cols+c]) continue;
      wx=x+c*cw+cw*0.3; wy=top+r*rh+rh*0.36; warm=((r*7+c*3)%5)!==0;
      ctx.fillStyle=far?mix(LINE,WIN_WARM,s*0.7,0.55):mix(LINE,warm?WIN_WARM:WIN_COOL,s,0.92);
      ctx.fillRect(wx,wy,Math.max(1.6,cw*0.42),Math.max(1,rh*0.28)); }
  }
  var farClouds=[], nearClouds=[], farB=[], nearB=[], i, x;
  for(i=0;i<7;i++) farClouds.push({c:makeCloud(90+rnd()*110,26+rnd()*18), x:rnd()*L, y:150+rnd()*150, sc:0.9+rnd()*0.5});
  for(i=0;i<4;i++) nearClouds.push({c:makeCloud(150+rnd()*130,44+rnd()*26), x:rnd()*L, y:300+rnd()*140, sc:1.1+rnd()*0.5});
  x=0; while(x<L){ var w=22+rnd()*34; farB.push(makeBuilding(x,w,70+rnd()*150)); x+=w+2+rnd()*10; }
  x=0; while(x<L){ var w2=30+rnd()*48; nearB.push(makeBuilding(x,w2,50+rnd()*190)); x+=w2+6+rnd()*22; }
  var trail=[], groundLines=[]; for(i=0;i<14;i++) groundLines.push({x:rnd()*L, y:GROUND+10+rnd()*52, len:20+rnd()*50});

  var slider=document.getElementById('probka-v'), label=document.getElementById('probka-txt');
  var holding=false, s=0, target=0, off={fc:0,fb:0,nb:0,nc:0,g:0}, last=performance.now(), t=0;
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function setHold(v){ holding=v; cv.classList.toggle('trzymam',v); }
  cv.addEventListener('pointerdown',function(e){ setHold(true); try{cv.setPointerCapture(e.pointerId);}catch(_){ } e.preventDefault(); });
  ['pointerup','pointercancel','lostpointercapture'].forEach(function(n){ cv.addEventListener(n,function(){ setHold(false); }); });
  window.addEventListener('pointerup',function(){ setHold(false); });
  function wrapDraw(items, offv, fn){ var k; for(k=0;k<items.length;k++){ fn(items[k], -offv); fn(items[k], L-offv); } }

  function frame(now){
    var dt=Math.min(0.05,(now-last)/1000); last=now; t+=dt;
    target=holding?1:(slider?slider.value/100:0);
    s+=(target-s)*Math.min(1,dt*(target>s?1.4:1.0));
    var e=s*s*(3-2*s);
    off.fc=(off.fc+dt*(10+e*55))%L; off.fb=(off.fb+dt*(18+e*120))%L; off.nb=(off.nb+dt*(34+e*230))%L; off.nc=(off.nc+dt*(50+e*320))%L; off.g=(off.g+dt*(70+e*520))%L;
    ctx.fillStyle=rgba(NAVY,1); ctx.fillRect(0,0,W,H);
    var g=ctx.createLinearGradient(0,0,0,GROUND); g.addColorStop(0,rgba(SKYTOP,e)); g.addColorStop(0.5,rgba(SKYMID,e)); g.addColorStop(0.82,rgba(SKYHOR,e)); g.addColorStop(1,rgba(SKYLOW,e));
    ctx.fillStyle=g; ctx.fillRect(0,0,W,GROUND);
    wrapDraw(farClouds,off.fc,function(cl,o){ drawCloud(cl.c,cl.x+o,cl.y,cl.sc,e,true); });
    wrapDraw(farB,off.fb,function(b,o){ drawBuilding(b,o,e,true); });
    var hz=ctx.createLinearGradient(0,GROUND-220,0,GROUND); hz.addColorStop(0,rgba(SKYHOR,0)); hz.addColorStop(1,rgba(SKYHOR,0.35*e)); ctx.fillStyle=hz; ctx.fillRect(0,GROUND-220,W,220);
    wrapDraw(nearB,off.nb,function(b,o){ drawBuilding(b,o,e,false); });
    ctx.fillStyle=mix([12,16,30],[30,22,50],e); ctx.fillRect(0,GROUND,W,H-GROUND);
    ctx.strokeStyle=rgba(LINE,0.7*(1-e*0.5)); ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(0,GROUND+0.5); ctx.lineTo(W,GROUND+0.5); ctx.stroke();
    if(e>0.25){ ctx.strokeStyle=rgba(LINE,0.35*e); wrapDraw(groundLines,off.g,function(l,o){ ctx.beginPath(); ctx.moveTo(l.x+o,l.y); ctx.lineTo(l.x+o+l.len*(0.5+e),l.y); ctx.stroke(); }); }
    wrapDraw(nearClouds,off.nc,function(cl,o){ drawCloud(cl.c,cl.x+o,cl.y,cl.sc,e,false); });
    var px=118, py=322+(reduce?0:Math.sin(t*2.1)*5), ang=-0.16-e*0.06, k;
    if(e>0.45 && !reduce){ trail.push({x:px-18,y:py+6,a:(e-0.45)*0.9,r:7+rnd()*10,h:rnd()}); }
    for(k=trail.length-1;k>=0;k--){ var p=trail[k]; p.x-=dt*(120+e*260); p.a-=dt*0.9; p.r+=dt*14; if(p.a<=0||p.x<-40){ trail.splice(k,1); continue; }
      var rg=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r); var col=p.h<0.5?SKYHOR:[255,120,150]; rg.addColorStop(0,rgba(col,p.a*0.55)); rg.addColorStop(1,rgba(col,0)); ctx.fillStyle=rg; ctx.beginPath(); ctx.ellipse(p.x,p.y,p.r*1.5,p.r*0.8,-0.2,0,Math.PI*2); ctx.fill(); }
    ctx.save(); ctx.translate(px,py); ctx.rotate(ang);
    ctx.strokeStyle=rgba(LINE,0.55+0.4*e); ctx.lineWidth=1.1; var n=3, ln;
    for(k=0;k<n;k++){ ln=28+e*80; var ly=-6+k*7, lx=-26-k*4, ph=(t*(3+e*6)+k)%1; ctx.globalAlpha=0.35+0.55*(1-ph); ctx.beginPath(); ctx.moveTo(lx-ph*12,ly); ctx.lineTo(lx-ln-ph*12,ly+3-k*2); ctx.stroke(); }
    ctx.globalAlpha=1;
    function wing(pts,fill){ ctx.beginPath(); ctx.moveTo(pts[0][0],pts[0][1]); for(k=1;k<pts.length;k++) ctx.lineTo(pts[k][0],pts[k][1]); ctx.closePath(); ctx.fillStyle=fill; ctx.fill(); ctx.stroke(); }
    ctx.lineWidth=1.3; ctx.strokeStyle=mix(LINE,[48,44,70],e); ctx.lineJoin='round';
    wing([[26,0],[-20,-12],[-13,-2]], mix(NAVY,PAPER,e));
    wing([[26,0],[-13,-2],[-20,8]], mix(NAVY,[214,210,224],e));
    wing([[26,0],[-13,-2],[-9,11]], mix(NAVY,[186,182,206],e));
    ctx.restore();
    if(label){ label.textContent = s<0.12?'tylko kreski':(s<0.5?'kolor wraca':(s<0.88?'prawie pełny kolor':'pełny kolor')); }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
