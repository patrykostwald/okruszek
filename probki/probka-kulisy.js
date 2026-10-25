(function(){
  var cv=document.getElementById('kulisy'); if(!cv) return;
  var ctx=cv.getContext('2d');
  var W=390,H=640, dpr=Math.min(2,window.devicePixelRatio||1);
  cv.width=W*dpr; cv.height=H*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
  var seed=23; function rnd(){ seed=(seed*16807)%2147483647; return (seed-1)/2147483646; }
  function lerp(a,b,t){ return a+(b-a)*t; }
  function cl(t){ return Math.max(0,Math.min(1,t)); }
  function sm(t){ t=cl(t); return t*t*(3-2*t); }
  function mixc(c1,c2,t){ t=cl(t); return [lerp(c1[0],c2[0],t),lerp(c1[1],c2[1],t),lerp(c1[2],c2[2],t)]; }
  function rgba(c,a){ return 'rgba('+Math.round(c[0])+','+Math.round(c[1])+','+Math.round(c[2])+','+cl(a)+')'; }
  var NAVY=[13,18,36], LINE=[236,240,248], SKYTOP=[18,30,88], SKYMID=[110,70,150], SKYHOR=[255,138,70], SKYLOW=[255,206,132];
  var CL_TOP=[255,240,230], CL_MID=[232,196,214], CL_BOT=[255,150,92], SUN=[255,190,110];
  var SEA=[[226,180,200],[150,100,160],[96,66,126]], SCARF=[226,64,72], BODY=[96,150,200], BODY_D=[60,100,150];
  var HORIZON=H*0.6, NEAR=0.55, FAR=8.5, N=9;

  /* Kumulus z płatów: duże płaty nad podstawą, na nich średnie, na średnich drobne; podstawa płaska i lekko falująca,
     końce zaokrąglone (środki dużych płatów leżą nad podstawą, więc dół jest węższy niż szerokość chmury). */
  function makeCloud(w,h){
    var circles=[], main=[], n=3+Math.floor(rnd()*3), i, j, u, x, r, cy, m, k, r2, ang, cx2, cy2, r3, a3;
    for(i=0;i<n;i++){ u=(i+0.5)/n; x=(u-0.5)*w*0.74+(rnd()-0.5)*w*0.06; r=h*(0.46+rnd()*0.16)*(1-0.42*Math.abs(u-0.5)*2); cy=-r*0.55-rnd()*h*0.04;
      m={x:x,y:cy,r:r}; main.push(m); circles.push(m); }
    for(i=0;i<main.length;i++){ m=main[i]; k=1+Math.floor(rnd()*3);
      for(j=0;j<k;j++){ r2=m.r*(0.42+rnd()*0.3); ang=-Math.PI/2+(rnd()-0.5)*1.7; cx2=m.x+Math.cos(ang)*m.r*0.72; cy2=m.y+Math.sin(ang)*m.r*0.78; circles.push({x:cx2,y:cy2,r:r2});
        if(rnd()<0.75){ r3=r2*(0.45+rnd()*0.25); a3=-Math.PI/2+(rnd()-0.5)*1.9; circles.push({x:cx2+Math.cos(a3)*r2*0.72,y:cy2+Math.sin(a3)*r2*0.78,r:r3}); } } }
    var minx=1e9,maxx=-1e9,top=1e9,bl=1e9,br=-1e9,ch;
    for(i=0;i<circles.length;i++){ var c=circles[i]; if(c.x-c.r<minx) minx=c.x-c.r; if(c.x+c.r>maxx) maxx=c.x+c.r; if(c.y-c.r<top) top=c.y-c.r; }
    for(i=0;i<main.length;i++){ m=main[i]; ch=Math.sqrt(Math.max(0,m.r*m.r-m.y*m.y)); if(m.x-ch<bl) bl=m.x-ch; if(m.x+ch>br) br=m.x+ch; }
    return {circles:circles,h:h,minx:minx,maxx:maxx,top:top,bl:bl,br:br};
  }
  function basePath(c,x,y,sc,wob,back){
    var px, step=Math.max(6,(c.br-c.bl)/26), amp=c.h*0.025;
    if(back){ for(px=c.br;px>=c.bl;px-=step) ctx.lineTo(x+px*sc, y+(Math.sin(px*0.05+wob)*amp+1)*sc); ctx.lineTo(x+c.bl*sc, y+(Math.sin(c.bl*0.05+wob)*amp+1)*sc); }
    else { ctx.moveTo(x+c.bl*sc, y+(Math.sin(c.bl*0.05+wob)*amp+1)*sc); for(px=c.bl;px<=c.br;px+=step) ctx.lineTo(x+px*sc, y+(Math.sin(px*0.05+wob)*amp+1)*sc); ctx.lineTo(x+c.br*sc, y+(Math.sin(c.br*0.05+wob)*amp+1)*sc); }
  }
  function fillCircles(c,x,y,sc,grow,wob){
    var i, cc, bob; ctx.beginPath();
    for(i=0;i<c.circles.length;i++){ cc=c.circles[i]; bob=Math.sin(wob+cc.x*0.02+cc.y*0.03)*c.h*0.012; ctx.moveTo(x+(cc.x+cc.r)*sc+grow, y+(cc.y+bob)*sc); ctx.arc(x+cc.x*sc, y+(cc.y+bob)*sc, cc.r*sc+grow, 0, Math.PI*2); }
    ctx.fill();
  }
  function drawCloud(c,x,y,sc,e,tt,mono,wob){
    var lw=Math.max(0.7,1.5*sc), fogc=mixc(SKYMID,SKYHOR,0.5), strokeA=(0.9-tt*0.55)*(1-e*0.75);
    ctx.save(); ctx.beginPath(); ctx.moveTo(x+c.minx*sc-lw*2, y+(c.top-c.h)*sc); ctx.lineTo(x+c.maxx*sc+lw*2, y+(c.top-c.h)*sc); ctx.lineTo(x+c.maxx*sc+lw*2, y+1*sc); basePath(c,x,y,sc,wob,true); ctx.lineTo(x+c.minx*sc-lw*2, y+1*sc); ctx.closePath(); ctx.clip();
    ctx.fillStyle=rgba(LINE,strokeA); fillCircles(c,x,y,sc,lw,wob);
    ctx.fillStyle=rgba(mono,1); fillCircles(c,x,y,sc,0,wob);
    if(e>0.02){ var g=ctx.createLinearGradient(0,y+c.top*sc,0,y);
      var top=mixc(CL_TOP,fogc,tt*0.75), mid=mixc(CL_MID,fogc,tt*0.75), bot=mixc(CL_BOT,fogc,tt*0.7), a=e*(1-tt*0.35);
      g.addColorStop(0,rgba(top,a)); g.addColorStop(0.55,rgba(mid,a)); g.addColorStop(1,rgba(bot,a)); ctx.fillStyle=g; fillCircles(c,x,y,sc,0,wob);
      var sh=ctx.createLinearGradient(0,y-c.h*0.4*sc,0,y); sh.addColorStop(0,rgba([150,90,130],0)); sh.addColorStop(1,rgba([150,90,130],0.35*e*(1-tt*0.5))); ctx.fillStyle=sh; fillCircles(c,x,y,sc,0,wob); }
    ctx.restore();
    ctx.beginPath(); basePath(c,x,y,sc,wob,false); ctx.lineWidth=lw; ctx.strokeStyle=rgba(LINE,strokeA); ctx.stroke();
  }
  function makeFlat(z){
    var clouds=[], k, n=3+Math.floor(rnd()*3), side;
    for(k=0;k<n;k++){ side=k%2?1:-1; var w=260+rnd()*320, h=90+rnd()*110;
      clouds.push({c:makeCloud(w,h), x:side*(190+rnd()*420), y:-300+rnd()*520, wob:rnd()*6}); }
    if(rnd()<0.5){ var w2=180+rnd()*160, h2=70+rnd()*60; clouds.push({c:makeCloud(w2,h2), x:(rnd()-0.5)*260, y:-400+rnd()*420, wob:rnd()*6}); }
    return {z:z, clouds:clouds, tone:rnd()};
  }
  var flats=[], i; for(i=0;i<N;i++) flats.push(makeFlat(NEAR+(FAR-NEAR)*(i+0.5)/N));
  var stars=[]; for(i=0;i<70;i++) stars.push({x:rnd()*W, y:rnd()*HORIZON*0.8, r:0.5+rnd()*1.2, tw:rnd()*6});
  var seas=[]; for(i=0;i<3;i++){ var pts=[], x; for(x=-120;x<=W+120;x+=14) pts.push([x, HORIZON+4+i*24+Math.sin(x*0.02+i*2)*(9+i*3)+Math.sin(x*0.051+i)*5+Math.sin(x*0.13)*2]); seas.push(pts); }

  var slider=document.getElementById('kulisy-v'), label=document.getElementById('kulisy-txt');
  var holding=false, s=0, target=0, last=performance.now(), t=0, camX=0, camXt=0, steer=0, pointerX=null;
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function setHold(v){ holding=v; var tel=cv.parentNode; if(tel&&tel.classList) tel.classList.toggle('trzymam',v); }
  function px(e){ var r=cv.getBoundingClientRect(); return (e.clientX-r.left)/r.width*W; }
  cv.addEventListener('pointerdown',function(e){ setHold(true); pointerX=px(e); try{cv.setPointerCapture(e.pointerId);}catch(_){ } e.preventDefault(); });
  cv.addEventListener('pointermove',function(e){ if(holding) pointerX=px(e); });
  ['pointerup','pointercancel','lostpointercapture'].forEach(function(n){ cv.addEventListener(n,function(){ setHold(false); pointerX=null; }); });
  window.addEventListener('pointerup',function(){ setHold(false); pointerX=null; });

  function drawFlat(f,e){
    var z=f.z, sc=1/z, tt=cl((z-NEAR)/(FAR-NEAR)), k;
    var fillMono=mixc(NAVY,[30,36,64],(1-tt)*0.7+f.tone*0.15);
    for(k=0;k<f.clouds.length;k++){ var c=f.clouds[k];
      var sx=W/2+(c.x-camX*(1-tt*0.6))*sc, sy=HORIZON+c.y*sc;
      if(sx+c.c.minx*sc>W+40||sx+c.c.maxx*sc<-40) continue;
      drawCloud(c.c,sx,sy,sc,e,tt,fillMono,c.wob+t*0.35);
    }
  }
  function fluff(cx,cy,rx,ry,bumps,ph){
    var a, n=36, r; ctx.beginPath();
    for(a=0;a<=n;a++){ var ang=a/n*Math.PI*2; r=1+0.05*Math.sin(ang*bumps+ph)+0.03*Math.sin(ang*(bumps*2+1)+ph*2); var x=cx+Math.cos(ang)*rx*r, y=cy+Math.sin(ang)*ry*r; if(a) ctx.lineTo(x,y); else ctx.moveTo(x,y); }
    ctx.closePath();
  }
  function drawBird(x,y,e,tilt){
    ctx.save(); ctx.translate(x,y); ctx.rotate(tilt*0.3); ctx.scale(0.85,0.85);
    var flap=reduce?0.3:Math.sin(t*(9+e*8)), look=Math.sin(t*0.7)*3;
    var body=mixc(mixc(NAVY,[52,60,92],0.8),BODY,e), dark=mixc(mixc(NAVY,[40,46,74],0.8),BODY_D,e), ink=mixc(LINE,[34,34,56],e);
    ctx.strokeStyle=rgba(ink,0.9); ctx.lineWidth=1.3; ctx.lineJoin='round';
    var side;
    for(side=-1;side<=1;side+=2){ ctx.save(); ctx.translate(side*13,-4); ctx.rotate(side*(-0.75+flap*0.85)); ctx.beginPath(); ctx.ellipse(side*17,0,19,7.5,0,0,Math.PI*2); ctx.fillStyle=rgba(dark,1); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(side*6,-2); ctx.lineTo(side*30,-1); ctx.moveTo(side*8,2); ctx.lineTo(side*28,3); ctx.strokeStyle=rgba(ink,0.35); ctx.stroke(); ctx.strokeStyle=rgba(ink,0.9); ctx.restore(); }
    ctx.beginPath(); ctx.moveTo(-6,16); ctx.lineTo(-11,32); ctx.lineTo(-3,26); ctx.lineTo(0,34); ctx.lineTo(3,26); ctx.lineTo(11,32); ctx.lineTo(6,16); ctx.closePath(); ctx.fillStyle=rgba(dark,1); ctx.fill(); ctx.stroke();
    fluff(0,0,19,21,9,t*2); ctx.fillStyle=rgba(body,1); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-10,18); ctx.quadraticCurveTo(0,10,10,18); ctx.strokeStyle=rgba(ink,0.3); ctx.stroke(); ctx.strokeStyle=rgba(ink,0.9);
    fluff(look,-22,13,13,7,t*2.5+1); ctx.fillStyle=rgba(body,1); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(look-9,-30); ctx.lineTo(look-6,-37); ctx.lineTo(look-3,-31); ctx.closePath(); ctx.fillStyle=rgba(body,1); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(look+3,-31); ctx.lineTo(look+6,-37); ctx.lineTo(look+9,-30); ctx.closePath(); ctx.fill(); ctx.stroke();
    var sc1=mixc([150,52,60],SCARF,0.4+0.6*e), w1=Math.sin(t*6)*5, w2=Math.sin(t*6+1.2)*5;
    ctx.beginPath(); ctx.ellipse(look*0.5,-10,15,5,0,0,Math.PI*2); ctx.fillStyle=rgba(sc1,1); ctx.fill(); ctx.strokeStyle=rgba(mixc(LINE,[90,20,30],e),0.8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-8,-8); ctx.quadraticCurveTo(-22+w1,8,-26+w2,30); ctx.quadraticCurveTo(-20+w1,20,-14,-2); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-12,-10); ctx.quadraticCurveTo(-26+w2,2,-34+w1,16); ctx.quadraticCurveTo(-24+w2,10,-16,-6); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
  }

  function frame(now){
    var dt=Math.min(0.05,(now-last)/1000); last=now; t+=dt; var k;
    target=holding?1:(slider?slider.value/100:0);
    s+=(target-s)*Math.min(1,dt*(target>s?1.3:0.9));
    var e=Math.pow(s,2.2); /* pełny kolor dopiero przy maksymalnej prędkości; wcześniej pojawia się stopniowo */
    camXt = pointerX==null ? 0 : (pointerX-W/2)*2.2;
    var prev=camX; camX+=(camXt-camX)*Math.min(1,dt*3); steer=Math.max(-1,Math.min(1,(camX-prev)/Math.max(dt,0.001)/600));
    var speed=0.32+e*1.9;
    for(k=0;k<flats.length;k++){ flats[k].z-=dt*speed; if(flats[k].z<NEAR){ flats[k]=makeFlat(flats[k].z+(FAR-NEAR)); } }
    flats.sort(function(a,b){ return b.z-a.z; });
    ctx.fillStyle=rgba(NAVY,1); ctx.fillRect(0,0,W,H);
    var g=ctx.createLinearGradient(0,0,0,HORIZON+40); g.addColorStop(0,rgba(SKYTOP,e)); g.addColorStop(0.5,rgba(SKYMID,e)); g.addColorStop(0.85,rgba(SKYHOR,e)); g.addColorStop(1,rgba(SKYLOW,e));
    ctx.fillStyle=g; ctx.fillRect(0,0,W,HORIZON+40);
    for(k=0;k<stars.length;k++){ var st=stars[k]; ctx.fillStyle=rgba(LINE,(0.45+0.35*Math.sin(t*1.5+st.tw))*(1-e)); ctx.beginPath(); ctx.arc(st.x,st.y,st.r,0,Math.PI*2); ctx.fill(); }
    var sunx=W/2-camX*0.04, suny=HORIZON-30, sr=80+e*140; var sg=ctx.createRadialGradient(sunx,suny,2,sunx,suny,sr); sg.addColorStop(0,rgba(SUN,0.1+0.5*e)); sg.addColorStop(0.4,rgba(SUN,0.05+0.22*e)); sg.addColorStop(1,rgba(SUN,0));
    ctx.fillStyle=sg; ctx.fillRect(0,0,W,H);
    ctx.fillStyle=rgba(mixc(NAVY,[70,50,110],e*0.6),1); ctx.fillRect(0,HORIZON,W,H-HORIZON);
    for(k=0;k<seas.length;k++){ var sp=seas[k], j, drift=-camX*0.02*(k+1)+(t*(6+e*30)*(k+1))%28-14; ctx.beginPath(); ctx.moveTo(sp[0][0]+drift,sp[0][1]); for(j=1;j<sp.length;j++) ctx.lineTo(sp[j][0]+drift,sp[j][1]); ctx.lineTo(W+140,H); ctx.lineTo(-140,H); ctx.closePath();
      ctx.fillStyle=rgba(mixc(mixc(NAVY,[28,32,58],1-k*0.3),SEA[k],e),1); ctx.fill(); ctx.strokeStyle=rgba(LINE,(0.55-k*0.14)*(1-e*0.8)); ctx.lineWidth=1; ctx.stroke(); }
    var ax=W/2+steer*18, ay=H-150;
    for(k=0;k<flats.length;k++){ drawFlat(flats[k],e); }
    if(e>0.5){ ctx.strokeStyle=rgba(LINE,(e-0.5)*0.5); ctx.lineWidth=1; for(k=0;k<10;k++){ var a=(k/10)*Math.PI*2+0.3, ph=(t*(2+e*4)+k*0.37)%1, r0=120+ph*260, r1=r0+30+e*50; ctx.globalAlpha=1-ph; ctx.beginPath(); ctx.moveTo(W/2+Math.cos(a)*r0,HORIZON-20+Math.sin(a)*r0*0.8); ctx.lineTo(W/2+Math.cos(a)*r1,HORIZON-20+Math.sin(a)*r1*0.8); ctx.stroke(); } ctx.globalAlpha=1; }
    var bob=reduce?0:Math.sin(t*1.7)*4+Math.sin(t*9)*(1-e)*1.5;
    drawBird(ax,ay+bob,e,steer);
    if(label){ label.textContent = s<0.12?'tylko kreski':(s<0.6?'kolor się budzi':(s<0.95?'coraz więcej koloru':'pełny kolor')); }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
