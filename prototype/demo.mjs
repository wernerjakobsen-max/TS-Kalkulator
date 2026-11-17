import {X,Y,angle,geometry,parseReading} from './model.mjs';
const $=id=>document.getElementById(id),fmt=(v,n=1)=>v.toLocaleString('nb-NO',{minimumFractionDigits:n,maximumFractionDigits:n});
let playing=false,frame=0,start=0;
function stop(){playing=false;cancelAnimationFrame(frame);$('play').textContent='Spill animasjon';$('play').setAttribute('aria-pressed','false');}
function draw(deg){
  const {A,B,E,C,reading}=geometry(deg),p=v=>`${v.x},${v.y}`;
  $('links').setAttribute('d',`M${p(A)} L${p(B)} L${p(E)}`);
  $('offset').setAttribute('d',`M${p(E)} L${p(C)}`);
  $('joints').innerHTML=[A,B].map(v=>`<circle cx="${v.x}" cy="${v.y}" r="4"/>`).join('');
  $('contact').setAttribute('cx',C.x);$('contact').setAttribute('cy',C.y);
  const a=Math.atan2(A.y-B.y,A.x-B.x),r=25,t=deg*Math.PI/180;
  $('arc').setAttribute('d',`M${B.x+r*Math.cos(a)},${B.y+r*Math.sin(a)} A${r},${r} 0 0 1 ${B.x+r*Math.cos(a+t)},${B.y+r*Math.sin(a+t)}`);
  $('contactLabel').textContent=`Kontakt: ${fmt(reading)} mm`;
  $('geometryText').textContent=`Ved ${fmt(deg)}° gir geometrien ${fmt(reading)} mm. Tegningen styres av vinkelen fra dagens kurve; modellavviket er ikke skjult.`;
}
function render(){
  const mm=parseReading($('reading').value),deg=angle(mm),valid=deg!==null;
  $('reading').setAttribute('aria-invalid',String(!valid));$('diagram').style.visibility=valid?'visible':'hidden';
  $('error').textContent=valid?'':'Skriv et tall mellom 420 og 800 mm. Komma og punktum kan brukes.';
  $('result').textContent=valid?`${fmt(deg)}°`:'–';
  if(!valid){$('sensitivity').textContent='';$('geometryText').textContent='';return;}
  $('slider').value=mm;
  const lo=Math.max(420,mm-1),hi=Math.min(800,mm+1);
  $('sensitivity').textContent=`Ved ${fmt(lo)}–${fmt(hi)} mm: ${fmt(angle(lo))}–${fmt(angle(hi))}°. ${lo!==mm-1||hi!==mm+1?'Avgrenset til måleområdet.':''}`;
  draw(deg);
}
$('reading').addEventListener('input',()=>{stop();render();});
$('slider').addEventListener('input',()=>{stop();$('reading').value=$('slider').value;render();});
$('play').addEventListener('click',()=>{
  if(playing){stop();return;}
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){$('error').textContent='Redusert bevegelse er aktivert. Bruk glidebryteren for å utforske modellen.';return;}
  playing=true;start=performance.now();$('play').textContent='Stopp animasjon';$('play').setAttribute('aria-pressed','true');
  const tick=now=>{const t=Math.min(1,(now-start)/12000);$('reading').value=(420+380*t).toFixed(1);render();if(t<1&&playing)frame=requestAnimationFrame(tick);else stop();};frame=requestAnimationFrame(tick);
});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
$('points').innerHTML=X.map((mm,i)=>`<tr><td>${fmt(mm)}</td><td>${fmt(Y[i])}</td><td>${fmt(geometry(Y[i]).reading,2)}</td><td>${fmt(geometry(Y[i]).reading-mm,2)}</td></tr>`).join('');
render();
