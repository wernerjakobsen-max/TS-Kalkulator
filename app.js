
// v3.9.7d core
const $ = (id) => document.getElementById(id);
const CANONICAL = "https://wernerjakobsen-max.github.io/TS-Kalkulator/?v=3.9.7d";

const X=[400,420,430,500,525,533,536,590,594,623,678,718,743,756,767,779,785,791,796,800];
const Y=[0,8,10.5,31,38,41,42,59,60,70,90,107,120,128,135,145,150,157,166,180];

function pchipSlopes(x,y){
  const n=x.length,h=new Array(n-1),d=new Array(n-1);
  for(let i=0;i<n-1;i++){h[i]=x[i+1]-x[i];d[i]=(y[i+1]-y[i])/h[i];}
  const m=new Array(n); m[0]=d[0]; m[n-1]=d[n-2];
  for(let i=1;i<n-1;i++){
    if(d[i-1]*d[i]<=0) m[i]=0;
    else {const w1=2*h[i]+h[i-1],w2=h[i]+2*h[i-1]; m[i]=(w1+w2)/(w1/d[i-1]+w2/d[i]);}
  }
  for(let i=0;i<n-1;i++){
    if(d[i]===0){m[i]=0; m[i+1]=0;}
    else {const a=m[i]/d[i],b=m[i+1]/d[i],s=a*a+b*b; if(s>9){const t=3/Math.sqrt(s); m[i]=t*a*d[i]; m[i+1]=t*b*d[i];}}
  }
  return m;
}
const M=pchipSlopes(X,Y);
function pchipEval(xq){
  const n=X.length; if(xq<X[0]||xq>X[n-1])return null;
  let i=0,j=n-1; while(j-i>1){const k=(i+j)>>1; if(X[k]<=xq)i=k; else j=k;}
  const h=X[i+1]-X[i],t=(xq-X[i])/h;
  const h00=(1+2*t)*(1-t)*(1-t),h10=t*(1-t)*(1-t),h01=t*t*(3-2*t),h11=t*t*(t-1);
  return h00*Y[i]+h10*h*M[i]+h01*Y[i+1]+h11*h*M[i+1];
}

const themeEl=document.documentElement,themeKey='ts_theme',themeColorTag=document.getElementById('themeColor');
function applyTheme(v){themeEl.setAttribute('data-theme',v); try{localStorage.setItem(themeKey,v);}catch(e){} if(themeColorTag)themeColorTag.setAttribute('content',(v==='dark')?'#0b1220':'#00FFFF');}
function toggleTheme(){const cur=themeEl.getAttribute('data-theme')||'auto';applyTheme(cur==='dark'?'light':cur==='light'?'auto':'dark');}

const STR={
  no:{app:"TS-kalkulator",sub:"Avlest vinkel på tommestokk omregnet til grader",lblD:"Avlest D (mm)",range:"måleområde 400–800 mm",angle:"Vinkel (grader)",guide_title:"Bruksanvisning (kort)",guide:["Utstyr: plast tommestokk 2 m (f.eks. Hultafors), leddbredde ca. 15 mm.","Knekk 200 mm‑leddet til ønsket vinkel.","Knekk 400 mm‑leddet og bøy til 0‑mm‑hjørnet treffer kanten.","Les av mm langs kanten. Skriv inn her – du får graden.","Gyldig område: 400–800 mm (400≈0°, 800≈180°)."],help_btn:"Vis forklaring og illustrasjon",help_text:"Prinsipp: 200‑ledd i vinkel θ. 400‑ledd som føler til 0‑hjørnet treffer kanten. Avlest D → vinkel via kalibrert kurve."},
  en:{app:"TS Calculator",sub:"Angle from folding ruler reading (mm → degrees)",lblD:"Reading D (mm)",range:"measuring range 400–800 mm",angle:"Angle (degrees)",guide_title:"Quick instructions",guide:["Tool: 2 m plastic folding ruler (e.g., Hultafors), joint width ≈ 15 mm.","Bend 200‑mm section to desired angle.","Bend 400‑mm section until the 0‑mm corner meets the edge.","Read D in mm along the edge and enter it here.","Valid range: 400–800 mm (400≈0°, 800≈180°)."],help_btn:"Show explanation and illustration",help_text:"Principle: 200‑mm at angle θ. 400‑mm as feeler to the 0‑corner. Edge reading D → angle via calibrated curve."},
  sv:{app:"TS‑kalkylator",sub:"Avläst vinkel på tumstock omräknad till grader",lblD:"Avläst D (mm)",range:"mätområde 400–800 mm",angle:"Vinkel (grader)",guide_title:"Snabbguide",guide:["Utrustning: plasttumstock 2 m (t.ex. Hultafors), leden bred ca 15 mm.","Vik 200 mm‑ledet till önskad vinkel.","Vik 400 mm‑ledet tills 0‑mm‑hörnet möter kanten.","Läs av i mm längs kanten och skriv in här – du får vinkeln i grader.","Giltigt område: 400–800 mm (400≈0°, 800≈180°)."],help_btn:"Visa förklaring och illustration",help_text:"Princip: 200‑led i vinkel θ. 400‑led som känner tills 0‑hörnet möter kanten. Avläst D → vinkel via kalibrerad kurva."},
  dk:{app:"TS‑kalkulator",sub:"Aflæst vinkel på tommestok omregnet til grader",lblD:"Aflæst D (mm)",range:"måleområde 400–800 mm",angle:"Vinkel (grader)",guide_title:"Kort vejledning",guide:["Udstyr: plasttommestok 2 m (fx Hultafors), led‑bredde ca. 15 mm.","Bøj 200 mm‑leddet til ønsket vinkel.","Bøj 400 mm‑leddet til 0‑mm‑hjørnet møder kanten.","Aflæs i mm langs kanten og indtast her – du får vinklen.","Gyldigt område: 400–800 mm (400≈0°, 800≈180°)."],help_btn:"Vis forklaring og illustrasjon",help_text:"Princip: 200‑led i vinkel θ. 400‑led som føler til 0‑hjørnet møder kanten. Aflæst D → vinkel via kalibreret kurve."},
  fi:{app:"TS‑laskin",sub:"Taittomitan lukema muunnettuna asteiksi",lblD:"Lukema D (mm)",range:"mittausalue 400–800 mm",angle:"Kulma (astetta)",guide_title:"Pikaohje",guide:["Väline: 2 m muovinen taitettava mitta (esim. Hultafors), nivelleveys n. 15 mm.","Taivuta 200 mm osaa haluttuun kulmaan.","Taivuta 400 mm osaa kunnes 0 mm kulma osuu reunaan.","Lue millimetrit reunaa pitkin ja syötä tähän – saat kulman asteina.","Sallittu alue: 400–800 mm (400≈0°, 800≈180°)."],help_btn:"Näytä selitys ja kuva",help_text:"Periaate: 200 mm osan kulma θ. 400 mm osa tuntumana, kunnes 0‑kulma kohtaa reunan. Lukema D → kulma kalibroidun käyrän kautta."},
  de:{app:"TS‑Rechner",sub:"Abgelesener Winkel am Gliedermaßstab in Grad",lblD:"Ablesung D (mm)",range:"Messbereich 400–800 mm",angle:"Winkel (Grad)",guide_title:"Kurz‑Anleitung",guide:["Werkzeug: 2‑m‑Gliedermaßstab aus Kunststoff (z. B. Hultafors), Gelenkbreite ca. 15 mm.","200‑mm‑Glied auf gewünschten Winkel biegen.","400‑mm‑Glied so biegen, bis die 0‑mm‑Ecke die Kante trifft.","In mm an der Kante ablesen und hier eingeben – Ergebnis in Grad.","Gültiger Bereich: 400–800 mm (400≈0°, 800≈180°)."],help_btn:"Erklärung und Skizze anzeigen",help_text:"Prinzip: 200‑mm‑Glied im Winkel θ. 400‑mm‑Glied als Fühler bis zur 0‑Ecke. Ablesung D → Winkel über kalibrierte Kurve."}
};

const LANG_KEY='ts_lang', DEC_KEY='ts_dec';
function setLang(c){try{localStorage.setItem(LANG_KEY,c);}catch(e){} applyLang(c); render();}
function getLang(){try{return localStorage.getItem(LANG_KEY)||'no';}catch(e){return'no';}}

function getDec(){try{return parseInt(localStorage.getItem(DEC_KEY)||'0',10);}catch(e){return 0;}}
function setDec(n){try{localStorage.setItem(DEC_KEY,String(n));}catch(e){} updateDecBtn(); render();}
function toggleDec(){setDec(getDec()===0?1:0);}
function updateDecBtn(){ document.getElementById('decBtn').textContent=(getDec()===0?'0 des':'1 des'); }
function Fdeg(v){const d=getDec(); return (d===0?Math.round(v):v.toFixed(d))+'°';}

const themeKey='ts_theme',themeColorTag=document.getElementById('themeColor');
function applyThemeColor(v){ if(themeColorTag) themeColorTag.setAttribute('content',(v==='dark')?'#0b1220':'#00FFFF'); }
function toggleThemeBtn(){const cur=document.documentElement.getAttribute('data-theme')||'auto'; const nxt=cur==='dark'?'light':cur==='light'?'auto':'dark'; document.documentElement.setAttribute('data-theme',nxt); try{localStorage.setItem(themeKey,nxt);}catch(e){} applyThemeColor(nxt);}

function applyLang(c){
  const S=(STR[c]||STR.no);
  document.title = S.app || "TS-kalkulator";
  document.getElementById('h_sub').textContent=S.sub;
  document.getElementById('lbl_D').textContent=S.lblD;
  document.getElementById('rangeText').textContent=S.range;
  document.getElementById('lbl_angle').textContent=S.angle;
  document.getElementById('guide_title').textContent=S.guide_title;
  const ul=document.getElementById('guide_list'); ul.innerHTML=''; (S.guide||[]).forEach(t=>{const li=document.createElement('li'); li.textContent=t; ul.appendChild(li);});
  document.getElementById('help_btn').textContent=S.help_btn||""; document.getElementById('help_text').textContent=S.help_text||"";
}

function render(){
  const D=parseFloat(String(document.getElementById('D').value).replace(',','.'));
  if(!Number.isFinite(D)){ document.getElementById('thetaTop').textContent='–'; return; }
  document.getElementById('sliderD').value=String(Math.max(400,Math.min(800,D)));
  const deg=pchipEval(D);
  if(deg==null){ document.getElementById('rangeText').classList.add('warn'); document.getElementById('thetaTop').textContent='–'; }
  else { document.getElementById('rangeText').classList.remove('warn'); document.getElementById('thetaTop').textContent=Fdeg(deg); }
}

function openQR(){
  const url=CANONICAL, enc=encodeURIComponent(url);
  document.getElementById('qrUrlBox').textContent=url;
  document.getElementById('qrImg').src=`https://api.qrserver.com/v1/create-qr-code/?size=512x512&margin=10&data=${enc}`;
  document.getElementById('qrDownload').href=document.getElementById('qrImg').src;
  document.getElementById('qrModal').style.display='flex';
}
function closeQR(){ document.getElementById('qrModal').style.display='none'; }
function copyUrl(){ navigator.clipboard.writeText(CANONICAL).then(()=>{document.getElementById('copyUrl').textContent='Kopiert!'; setTimeout(()=>{document.getElementById('copyUrl').textContent='Kopier lenke';},1200);}).catch(()=>{}); }

let deferredPrompt=null;
window.addEventListener('beforeinstallprompt', (e)=>{ e.preventDefault(); deferredPrompt=e; });
async function tryInstall(){
  if(deferredPrompt){ await deferredPrompt.prompt(); deferredPrompt=null; return; }
  document.getElementById('instModal').style.display='flex';
}

document.addEventListener('DOMContentLoaded', ()=>{
  document.getElementById('lang').value=getLang(); applyLang(getLang());
  document.getElementById('lang').addEventListener('change',(e)=>{ setLang(e.target.value); });
  updateDecBtn();
  document.getElementById('decBtn').addEventListener('click',toggleDec);
  document.getElementById('themeBtn').addEventListener('click',toggleThemeBtn);
  document.getElementById('D').addEventListener('input',render);
  document.getElementById('sliderD').addEventListener('input',e=>{ document.getElementById('D').value=e.target.value; render(); });
  document.getElementById('qrBtn').addEventListener('click',openQR);
  document.getElementById('qrClose').addEventListener('click',closeQR);
  document.getElementById('copyUrl').addEventListener('click',copyUrl);
  document.getElementById('installBtn').addEventListener('click',tryInstall);
  document.getElementById('instClose').addEventListener('click',()=>{ document.getElementById('instModal').style.display='none'; });
  document.getElementById('hardRefreshBtn').addEventListener('click', async ()=>{
    if('caches' in window){ const names=await caches.keys(); await Promise.all(names.map(n=>caches.delete(n))); }
    if('serviceWorker' in navigator){ const regs=await navigator.serviceWorker.getRegistrations(); await Promise.all(regs.map(r=>r.unregister())); }
    location.href=CANONICAL;
  });
  render();
  document.getElementById('ver').textContent='3.9.7d';
});
if('serviceWorker' in navigator){ window.addEventListener('load',()=>{ navigator.serviceWorker.register('./sw.js'); }); }
