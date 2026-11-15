// TS testversjon. Eldre kontrollpunkter beholdes; 27° og øvre grense
// er oppdatert etter brukerens kontroll på tre tommestokker 14.11.2026.
export const X=[420,430,453,486,500,525,536,563,594,635,677.5,718,756,779,791,796,798];
export const Y=[8,11,17.5,27,31,38.5,42,50.5,60,74,90,107.5,128,145,158,166,170];
function tangents(x,y){
  const h=x.slice(1).map((v,i)=>v-x[i]),d=h.map((v,i)=>(y[i+1]-y[i])/v),m=[d[0]];
  for(let i=1;i<x.length-1;i++){
    const w1=2*h[i]+h[i-1],w2=h[i]+2*h[i-1];
    m[i]=d[i-1]*d[i]<=0?0:(w1+w2)/(w1/d[i-1]+w2/d[i]);
  }
  m.push(d.at(-1));
  for(let i=0;i<d.length;i++){
    if(d[i]===0){m[i]=m[i+1]=0;continue;}
    const a=m[i]/d[i],b=m[i+1]/d[i],s=a*a+b*b;
    if(s>9){const f=3/Math.sqrt(s);m[i]=f*a*d[i];m[i+1]=f*b*d[i];}
  }
  return m;
}
const M=tangents(X,Y);
export function angle(mm){
  if(!Number.isFinite(mm)||mm<420||mm>798)return null;
  let i=0;while(i<X.length-2&&X[i+1]<mm)i++;
  const h=X[i+1]-X[i],t=(mm-X[i])/h;
  return (1+2*t)*(1-t)**2*Y[i]+t*(1-t)**2*h*M[i]+t*t*(3-2*t)*Y[i+1]+t*t*(t-1)*h*M[i+1];
}
export function parseNumber(raw){
  const s=String(raw).trim();
  return /^\d+(?:[.,]\d+)?$/.test(s)?Number(s.replace(',','.')):NaN;
}
// Stive ledd med 200 mm akselengde og 7,5 mm fra nullaksen til hjørnet.
// Skissen viser denne idealiserte geometrien, ikke en ny fysisk kalibrering.
export function geometry(deg){
  const t=deg*Math.PI/180,L=200,h=7.5;
  const zx=L-L*Math.cos(t)-h*Math.sin(t),zy=-L*Math.sin(t)+h*Math.cos(t);
  // The SVG flips y: the visible upper edge is model y=+h.
  const beta=Math.asin(h/Math.hypot(zx,zy))-Math.atan2(zy,zx);
  return pose(deg,beta);
}
// Rotating at 40 cm changes beta while the angle at 20 cm stays fixed.
export function pose(deg,beta){
  const t=deg*Math.PI/180,L=200,h=7.5;
  const g=beta-Math.PI+t,A={x:0,y:0},B={x:L*Math.cos(beta),y:L*Math.sin(beta)};
  const E={x:B.x+L*Math.cos(g),y:B.y+L*Math.sin(g)},C={x:E.x+h*Math.sin(g),y:E.y-h*Math.cos(g)};
  return {A,B,E,C,beta,edgeY:h,reading:400+C.x};
}
// Egen fallberegning: stigning = høydeforskjell / HORISONTAL lengde.
export function slopeFromHeight(degrees,height){
  const result=slope('degrees',degrees);
  if(degrees<=0)throw Error('Ved kjent høyde må vinkelen være større enn 0° og mindre enn 90°.');
  if(!Number.isFinite(height)||height<=0)throw Error('Skriv en høydeforskjell større enn null.');
  const length=height/result.r,along=Math.hypot(length,height);
  if(!Number.isFinite(length)||!Number.isFinite(along)||length<=0)throw Error('Tallene er for store eller for små.');
  return {result,length,h:height,along};
}
export function slope(mode,a,b){
  if(!Number.isFinite(a)||a<0)throw Error('Skriv et gyldig, positivt tall eller null.');
  let r;
  if(mode==='percent')r=a/100;
  else if(mode==='degrees'){
    if(a>=90)throw Error('Vinkelen må være mindre enn 90°.');
    r=Math.tan(a*Math.PI/180);
  }else if(mode==='ratio'){
    if(!Number.isFinite(b)||b<=0)throw Error('Den andre delen av forholdet må være større enn null.');
    r=a/b;
  }else if(mode==='height'){
    if(!Number.isFinite(b)||b<=0)throw Error('Horisontal lengde må være større enn null.');
    r=a/b;
  }else throw Error('Ukjent beregningsmåte.');
  const percent=r*100,degrees=Math.atan(r)*180/Math.PI,ratio=r===0?null:1/r;
  if(![r,percent,degrees].every(Number.isFinite)||(ratio!==null&&!Number.isFinite(ratio)))throw Error('Tallene er for store eller for små.');
  return {r,percent,degrees,ratio};
}
