const tr=(key,...args)=>window.TSI18n?.t(key,...args)??key.replace(/\{(\d+)\}/g,(_,i)=>String(args[i]??''));
import {angle,geometry,pose,parseNumber,slope,slopeFromHeight} from './model.mjs';
const $=id=>document.getElementById(id),fmt=(v,n=1)=>window.TSI18n?.formatNumber(v,n)??v.toLocaleString('nb-NO',{minimumFractionDigits:n,maximumFractionDigits:n});
let playing=false,frame=0;
function stop(){playing=false;cancelAnimationFrame(frame);$('play').textContent=tr('Vis måletrinn');$('play').setAttribute('aria-pressed','false');$('diagram').setAttribute('viewBox','-100 -235 540 295');renderTS();}
function draw(deg,mm,shape=geometry(deg)){
  const {A,B,E,C,reading}=shape,p=v=>`${v.x},${v.y}`;
  $('links').setAttribute('d',`M${p(A)} L${p(B)} L${p(E)}`);
  $('offset').setAttribute('d',`M${p(E)} L${p(C)}`);
  $('joints').innerHTML=[A,B].map(v=>`<circle cx="${v.x}" cy="${v.y}" r="4"/>`).join('');
  $('contact').setAttribute('cx',C.x);$('contact').setAttribute('cy',C.y);
  const a=Math.atan2(A.y-B.y,A.x-B.x),r=25,t=deg*Math.PI/180;
  $('arc').setAttribute('d',`M${B.x+r*Math.cos(a)},${B.y+r*Math.sin(a)} A${r},${r} 0 0 1 ${B.x+r*Math.cos(a+t)},${B.y+r*Math.sin(a+t)}`);
  const labelRadius=46,mid=a+t/2;
  $('arc-degrees').setAttribute('x',B.x+labelRadius*Math.cos(mid));
  $('arc-degrees').setAttribute('y',-(B.y+labelRadius*Math.sin(mid)));
  $('arc-degrees').textContent=fmt(deg)+'°';
  $('hinge-label').setAttribute('x',B.x-22);$('hinge-label').setAttribute('y',-B.y-16);$('hinge-label').textContent='200 mm';
  $('zero-label').setAttribute('x',Math.min(320,C.x+8));$('zero-label').setAttribute('y',-C.y+22);$('zero-label').textContent=tr('Nullhjørne');
  $('geometry-note').textContent=tr('Avlest {0} mm → {1}°. Modellskissen gir kontakt ved {2} mm for denne vinkelen.',fmt(mm),fmt(deg),fmt(reading));
}
function renderTS(){
  const mm=parseNumber($('reading').value),deg=angle(mm),valid=deg!==null;
  $('reading').setAttribute('aria-invalid',String(!valid));$('diagram').style.visibility=valid?'visible':'hidden';
  $('ts-error').textContent=valid?'':tr('Skriv et tall fra 420 til 798 mm. Komma og punktum kan brukes.');
  $('angle').textContent=valid?`${fmt(deg)}°`:'–';
  if(!valid){$('sensitivity').textContent='';$('geometry-note').textContent='';return;}
  $('slider').value=mm;draw(deg,mm);
  $('animation-step').textContent=tr('Vinkelen måles i leddet ved 200 mm. Nullhjørnet berører den øvre kanten ved avlesningen.');
  const lo=Math.max(420,mm-1),hi=Math.min(798,mm+1);
  $('sensitivity').textContent=tr('Avlesningsfølsomhet: {0}–{1} mm gir {2}–{3}°. Dette viser virkningen av opptil ±1 mm, avgrenset til måleområdet.',fmt(lo),fmt(hi),fmt(angle(lo)),fmt(angle(hi)));
}
$('ticks').setAttribute('d',Array.from({length:41},(_,i)=>`M${i*10},7.5 v-${i%10===0?11:5}`).join(' '));
$('reading').addEventListener('input',()=>{stop();renderTS();});
$('slider').addEventListener('input',()=>{const mm=$('slider').value;stop();$('reading').value=mm;renderTS();});
const motion=matchMedia('(prefers-reduced-motion: reduce)');
$('play').addEventListener('click',()=>{
  if(playing){stop();return;}
  if(motion.matches){$('ts-error').textContent=tr('Redusert bevegelse er aktivert. Bruk glidebryteren.');return;}
  const mm=parseNumber($('reading').value),target=angle(mm);if(target===null)return;
  playing=true;const start=performance.now(),end=geometry(target),ease=t=>t*t*(3-2*t);
  $('play').textContent=tr('Stopp animasjon');$('play').setAttribute('aria-pressed','true');
  $('diagram').setAttribute('viewBox','-435 -435 870 510');
  const tick=now=>{
    if(!playing)return;const seconds=(now-start)/1000;
    let deg=180,beta=Math.PI;
    if(seconds<1){$('animation-step').textContent=tr('1. Brett ut tre–fire ledd fra nullenden og legg dem rett. Resten kan være sammenbrettet.');}
    else if(seconds<5){deg=180+(target-180)*ease(Math.min(1,(seconds-1)/3));$('animation-step').textContent=tr('2. Bøy leddet ved 200 mm til {0}°. Dette er vinkelen vi måler.',fmt(target));}
    else {deg=target;beta=Math.PI+(end.beta-Math.PI)*ease(Math.min(1,(seconds-5)/4));$('animation-step').textContent=tr('3. Behold vinkelen ved 200 mm. Bøy leddet ved 400 mm til nullhjørnet møter den øvre kanten. Les av der.');}
    draw(deg,mm,pose(deg,beta)); 
    $('geometry-note').textContent=tr('Animasjonen viser fremgangsmåten for valgt vinkel. Les av først når nullhjørnet treffer den øvre kanten.');
    if(seconds<10)frame=requestAnimationFrame(tick);else{stop();renderTS();}
  };frame=requestAnimationFrame(tick);
});
document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();stopFall();}});
motion.addEventListener('change',()=>{if(motion.matches){stop();stopFall();}});
for(const name of ['ts','fall'])$('tab-'+name).addEventListener('click',()=>{
  stop();stopFall();for(const n of ['ts','fall']){$(n).hidden=n!==name;$('tab-'+n).setAttribute('aria-pressed',String(n===name));}
});
const number=id=>parseNumber($(id).value);
let fallFrame=0,fallPlaying=false,fallCurrent=null;
function stopFall(){
  cancelAnimationFrame(fallFrame);fallPlaying=false;
  $('fall-play').textContent=tr('Vis sammenhengen');$('fall-play').setAttribute('aria-pressed','false');
  if(fallCurrent){
    $('fall-step').textContent=tr('Valgt helning vises. Begge aksene har samme målestokk.');
    drawFall(fallCurrent.result,fallCurrent.length);
  }
}
function drawFall(result,length){
  // One scale for both axes: small gradients stay small, steep slopes stay steep.
  const t=result.degrees*Math.PI/180,r=result.r;
  const w=r<=170/310?310:170/r,h=w*r,x=65,y=220,ex=x+w,ey=y-h;
  $('fall-area').setAttribute('d',`M${x} ${y} H${ex} V${ey} Z`);
  $('fall-base').setAttribute('d',`M${x} ${y} H${ex}`);
  $('fall-rise').setAttribute('d',`M${ex} ${y} V${ey}`);
  $('fall-incline').setAttribute('d',`M${x} ${y} L${ex} ${ey}`);
  $('fall-right').setAttribute('d',w>18&&h>18?`M${ex-12} ${y} v-12 h12`:'');
  $('fall-arc').setAttribute('d',t>0?`M${x+36} ${y} A36 36 0 0 0 ${x+36*Math.cos(t)} ${y-36*Math.sin(t)}`:'');
  $('fall-height-label').setAttribute('x',ex+14);$('fall-height-label').setAttribute('y',Math.min(y-12,ey+h/2));
  $('fall-height-label').textContent=fmt(r*length,2)+' mm';
  $('fall-angle-label').textContent=fmt(result.degrees,3)+'°';
  $('fall-length-label').textContent=tr('Horisontalt: {0} m',fmt(length/1000,3));
  $('fall-live-percent').textContent=fmt(result.percent,3)+' %';
  $('fall-live-ratio').textContent=result.ratio===null?'0 : 1':'1 : '+fmt(result.ratio,3);
  $('fall-svg-desc').textContent=tr('{0} m horisontal lengde og {1} mm høydeforskjell gir {2} grader, {3} prosent og forhold {4}.',fmt(length/1000,3),fmt(r*length,2),fmt(result.degrees,3),fmt(result.percent,3),$('fall-live-ratio').textContent);
}
$('fall-play').addEventListener('click',()=>{
  if(fallPlaying){stopFall();$('fall-step').textContent=tr('Valgt helning vises. Begge aksene har samme målestokk.');return;}
  if(!fallCurrent)return;
  if(motion.matches){$('fall-step').textContent=tr('Redusert bevegelse er aktivert. Figuren viser den valgte helningen uten animasjon.');return;}
  fallPlaying=true;const start=performance.now(),{result,length}=fallCurrent;
  $('fall-play').textContent=tr('Stopp animasjon');$('fall-play').setAttribute('aria-pressed','true');
  const tick=now=>{
    if(!fallPlaying)return;const s=(now-start)/1000,p=Math.max(0,Math.min(1,(s-1)/4)),e=p*p*(3-2*p);
    drawFall(slope('degrees',result.degrees*e),length);
    const step=s<1?tr('1. Start med den horisontale lengden.'):s<5?tr('2. Øk høydeforskjellen. Vinkel, prosent og forhold følger samme helning.'):tr('3. Prosent = høyde / horisontal lengde × 100. Forholdet viser høyde : lengde.');
    if($('fall-step').textContent!==step)$('fall-step').textContent=step;
    if(s<8)fallFrame=requestAnimationFrame(tick);else{stopFall();$('fall-step').textContent=tr('Valgt helning vises. Begge aksene har samme målestokk.');}
  };fallFrame=requestAnimationFrame(tick);
});
function renderFall(){
  stopFall();fallCurrent=null;
  const mode=$('fall-mode').value;
  const fromHeight=mode==='degrees-height';
  $('single-fields').hidden=!['percent','degrees','degrees-height'].includes(mode);
  $('ratio-fields').hidden=mode!=='ratio';$('height-fields').hidden=mode!=='height'&&!fromHeight;
  $('length-fields').hidden=fromHeight;
  $('length-label').textContent=mode==='height'?tr('Horisontal lengde'):tr('Horisontal lengde (valgfritt)');
  $('length-hint').textContent=mode==='height'?tr('Lengden er nødvendig for å beregne helningen fra høydeforskjellen.'):tr('La feltet stå tomt for kun prosent, grader og fallforhold.');
  $('single-label').textContent=['degrees','degrees-height'].includes(mode)?tr('Vinkel (°)'):tr('Helning (%)');
  ['fall-a','ratio-a','ratio-b','height','length'].forEach(id=>$(id).removeAttribute('aria-invalid'));
  try{
    let length;
    const hasLength=$('length').value.trim()!=='';
    if(mode==='height')length=number('length')*Number($('length-unit').value);
    let a,b,result,h,along;
    if(mode==='height'){a=number('height')*Number($('height-unit').value);b=length;}
    else if(mode==='ratio'){a=number('ratio-a');b=number('ratio-b');}
    else a=number('fall-a');
    result=slope(fromHeight?'degrees':mode,a,b);
    $('percent').textContent=fmt(result.percent,3)+' %';$('degrees').textContent=fmt(result.degrees,3)+'°';
    $('ratio').textContent=result.ratio===null?tr('Flatt (0 : 1)'):'1 : '+fmt(result.ratio,3);
    ['height-result','horizontal-result','slope-length'].forEach(id=>$(id).textContent='–');
    $('fall-error').textContent='';
    $('fall-visual').hidden=true;$('fall-play').disabled=true;
    $('fall-step').textContent=tr('Legg eventuelt til lengde for å vise mål og illustrasjon.');
    try {
    if(fromHeight){
      if($('height').value.trim()===''){$('fall-step').textContent=tr('Legg til høydeforskjell for å beregne lengdene.');return;}
      ({result,length,h,along}=slopeFromHeight(a,number('height')*Number($('height-unit').value)));
    }
    else {
      if(!hasLength&&mode!=='height')return;
      length=number('length')*Number($('length-unit').value);
      if(!Number.isFinite(length)||length<=0){$('length').setAttribute('aria-invalid','true');throw Error(tr('Skriv en horisontal lengde større enn null, eller la feltet stå tomt.'));}
      h=result.r*length;along=Math.hypot(h,length);
    }
    if(!Number.isFinite(h)||!Number.isFinite(along))throw Error(tr('Tallene er for store.'));
    $('height-result').textContent=fmt(h,2)+' mm';$('slope-length').textContent=fmt(along/1000,3)+' m';
    $('horizontal-result').textContent=fmt(length/1000,3)+' m';
    fallCurrent={result,length};drawFall(result,length);$('fall-visual').hidden=false;$('fall-play').disabled=false;
    $('fall-step').textContent=tr('Valgt helning vises. Begge aksene har samme målestokk.');
    $('fall-error').textContent='';
    } catch(e) {
      ['height-result','horizontal-result','slope-length'].forEach(id=>$(id).textContent='–');
      $('fall-error').textContent=tr(e.message);
      $('fall-step').textContent=tr('Helningen er beregnet. Korriger målene for å vise illustrasjonen.');
      if(fromHeight)$('height').setAttribute('aria-invalid','true');
    }
  }catch(e){
    $('fall-visual').hidden=true;$('fall-play').disabled=true;$('fall-step').textContent=tr('Skriv inn gyldige mål for å vise figuren.');
    $('fall-error').textContent=tr(e.message);
    ['percent','degrees','ratio','height-result','horizontal-result','slope-length'].forEach(id=>$(id).textContent='–');
    const ids=fromHeight?['fall-a','height']:mode==='ratio'?['ratio-a','ratio-b']:mode==='height'?['height']:['fall-a'];
    ids.forEach(id=>$(id).setAttribute('aria-invalid','true'));
  }
}
$('fall').querySelectorAll('input,select').forEach(el=>el.addEventListener('input',renderFall));
document.addEventListener('ts-language-change',()=>{stop();stopFall();renderTS();renderFall();});
renderTS();renderFall();
