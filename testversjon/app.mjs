import {angle,geometry,pose,parseNumber,slope} from './model.mjs';
const $=id=>document.getElementById(id),fmt=(v,n=1)=>v.toLocaleString('nb-NO',{minimumFractionDigits:n,maximumFractionDigits:n});
let playing=false,frame=0;
function stop(){playing=false;cancelAnimationFrame(frame);$('play').textContent='Vis måletrinn';$('play').setAttribute('aria-pressed','false');$('diagram').setAttribute('viewBox','-35 -235 470 295');renderTS();}
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
  $('zero-label').setAttribute('x',Math.min(320,C.x+8));$('zero-label').setAttribute('y',-C.y+22);$('zero-label').textContent='Nullhjørne';
  $('geometry-note').textContent=`Avlest ${fmt(mm)} mm → ${fmt(deg)}°. Modellskissen gir kontakt ved ${fmt(reading)} mm for denne vinkelen.`;
}
function renderTS(){
  const mm=parseNumber($('reading').value),deg=angle(mm),valid=deg!==null;
  $('reading').setAttribute('aria-invalid',String(!valid));$('diagram').style.visibility=valid?'visible':'hidden';
  $('ts-error').textContent=valid?'':'Skriv et tall fra 420 til 798 mm. Komma og punktum kan brukes.';
  $('angle').textContent=valid?`${fmt(deg)}°`:'–';
  if(!valid){$('sensitivity').textContent='';$('geometry-note').textContent='';return;}
  $('slider').value=mm;draw(deg,mm);
  $('animation-step').textContent='Vinkelen måles i leddet ved 200 mm. Nullhjørnet berører den øvre kanten ved avlesningen.';
  const lo=Math.max(420,mm-1),hi=Math.min(798,mm+1);
  $('sensitivity').textContent=`Avlesningsfølsomhet: ${fmt(lo)}–${fmt(hi)} mm gir ${fmt(angle(lo))}–${fmt(angle(hi))}°. Dette viser virkningen av opptil ±1 mm, avgrenset til måleområdet.`;
}
$('ticks').setAttribute('d',Array.from({length:41},(_,i)=>`M${i*10},7.5 v-${i%10===0?11:5}`).join(' '));
$('reading').addEventListener('input',()=>{stop();renderTS();});
$('slider').addEventListener('input',()=>{stop();$('reading').value=$('slider').value;renderTS();});
document.querySelectorAll('[data-mm]').forEach(b=>b.addEventListener('click',()=>{stop();$('reading').value=b.dataset.mm;renderTS();}));
const motion=matchMedia('(prefers-reduced-motion: reduce)');
$('play').addEventListener('click',()=>{
  if(playing){stop();return;}
  if(motion.matches){$('ts-error').textContent='Redusert bevegelse er aktivert. Bruk glidebryteren.';return;}
  const mm=parseNumber($('reading').value),target=angle(mm);if(target===null)return;
  playing=true;const start=performance.now(),end=geometry(target),ease=t=>t*t*(3-2*t);
  $('play').textContent='Stopp animasjon';$('play').setAttribute('aria-pressed','true');
  $('diagram').setAttribute('viewBox','-435 -435 870 510');
  const tick=now=>{
    if(!playing)return;const seconds=(now-start)/1000;
    let deg=180,beta=Math.PI;
    if(seconds<1){$('animation-step').textContent='1. Legg tommestokken ned med alle ledd rett utover.';}
    else if(seconds<5){deg=180+(target-180)*ease(Math.min(1,(seconds-1)/3));$('animation-step').textContent=`2. Bøy leddet ved 200 mm til ${fmt(target)}°. Dette er vinkelen vi måler.`;}
    else {deg=target;beta=Math.PI+(end.beta-Math.PI)*ease(Math.min(1,(seconds-5)/4));$('animation-step').textContent='3. Behold vinkelen ved 200 mm. Bøy leddet ved 400 mm til nullhjørnet møter den øvre kanten. Les av der.';}
    draw(deg,mm,pose(deg,beta)); 
    $('geometry-note').textContent='Animasjonen viser fremgangsmåten for valgt vinkel. Les av først når nullhjørnet treffer den øvre kanten.';
    if(seconds<10)frame=requestAnimationFrame(tick);else{stop();renderTS();}
  };frame=requestAnimationFrame(tick);
});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
motion.addEventListener('change',()=>{if(motion.matches)stop();});
for(const name of ['ts','fall'])$('tab-'+name).addEventListener('click',()=>{
  stop();for(const n of ['ts','fall']){$(n).hidden=n!==name;$('tab-'+n).setAttribute('aria-pressed',String(n===name));}
});
const number=id=>parseNumber($(id).value);
function renderFall(){
  const mode=$('fall-mode').value;
  $('single-fields').hidden=!['percent','degrees'].includes(mode);
  $('ratio-fields').hidden=mode!=='ratio';$('height-fields').hidden=mode!=='height';
  $('single-label').textContent=mode==='degrees'?'Vinkel (°)':'Helning (%)';
  ['fall-a','ratio-a','ratio-b','height','length'].forEach(id=>$(id).removeAttribute('aria-invalid'));
  try{
    const length=number('length')*Number($('length-unit').value);
    if(!Number.isFinite(length)||length<=0){$('length').setAttribute('aria-invalid','true');throw Error('Skriv en horisontal lengde større enn null.');}
    let a,b;
    if(mode==='height'){a=number('height')*Number($('height-unit').value);b=length;}
    else if(mode==='ratio'){a=number('ratio-a');b=number('ratio-b');}
    else a=number('fall-a');
    const result=slope(mode,a,b),h=result.r*length,along=Math.hypot(h,length);
    if(!Number.isFinite(h)||!Number.isFinite(along))throw Error('Tallene er for store.');
    $('percent').textContent=fmt(result.percent,3)+' %';$('degrees').textContent=fmt(result.degrees,3)+'°';
    $('ratio').textContent=result.ratio===null?'Flatt (0 : 1)':'1 : '+fmt(result.ratio,3);
    $('height-result').textContent=fmt(h,2)+' mm';$('slope-length').textContent=fmt(along/1000,3)+' m';
    $('fall-error').textContent='';
  }catch(e){
    $('fall-error').textContent=e.message;
    ['percent','degrees','ratio','height-result','slope-length'].forEach(id=>$(id).textContent='–');
    const ids=mode==='ratio'?['ratio-a','ratio-b']:mode==='height'?['height']:['fall-a'];
    ids.forEach(id=>$(id).setAttribute('aria-invalid','true'));
  }
}
$('fall').querySelectorAll('input,select').forEach(el=>el.addEventListener('input',renderFall));
renderTS();renderFall();
