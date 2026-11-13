// Reference curve extracted unchanged from index.html at 00ed244.
export const X=[420,430,453,485,500,525,536,563,594,635,677.5,718,756,779,791,796,800];
export const Y=[8,11,17.5,27,31,38.5,42,50.5,60,74,90,107.5,128,145,158,166,180];
export function slopes(x,y){
  const n=x.length,h=[],d=[],m=[];
  for(let i=0;i<n-1;i++){h[i]=x[i+1]-x[i];d[i]=(y[i+1]-y[i])/h[i];}
  m[0]=d[0];m[n-1]=d[n-2];
  for(let i=1;i<n-1;i++){
    if(d[i-1]*d[i]<=0)m[i]=0;
    else {const w1=2*h[i]+h[i-1],w2=h[i]+2*h[i-1];m[i]=(w1+w2)/(w1/d[i-1]+w2/d[i]);}
  }
  for(let i=0;i<n-1;i++){
    if(d[i]===0){m[i]=0;m[i+1]=0;}
    else {const a=m[i]/d[i],b=m[i+1]/d[i],s=a*a+b*b;if(s>9){const t=3/Math.sqrt(s);m[i]=t*a*d[i];m[i+1]=t*b*d[i];}}
  }
  return m;
}
const M=slopes(X,Y);
export function angle(mm){
  if(!Number.isFinite(mm)||mm<X[0]||mm>X.at(-1))return null;
  let i=0,j=X.length-1;
  while(j-i>1){const k=(i+j)>>1;if(X[k]<=mm)i=k;else j=k;}
  const h=X[i+1]-X[i],t=(mm-X[i])/h;
  return (1+2*t)*(1-t)**2*Y[i]+t*(1-t)**2*h*M[i]+t*t*(3-2*t)*Y[i+1]+t*t*(t-1)*h*M[i+1];
}
export function parseReading(raw){
  const s=String(raw).trim();
  return /^\d+(?:[.,]\d+)?$/.test(s)?Number(s.replace(',','.')):NaN;
}
// Hypothesis: hinge-centre lengths L; zero corner h below first-link axis.
// C = B + L*u - h*perp(u), A=(0,0), C lies on the baseline.
export function geometry(deg,L=200,h=7.5){
  const t=deg*Math.PI/180;
  const zx=L-L*Math.cos(t)-h*Math.sin(t),zy=-L*Math.sin(t)+h*Math.cos(t);
  const beta=-Math.atan2(zy,zx),g=beta-Math.PI+t;
  const A={x:0,y:0},B={x:L*Math.cos(beta),y:L*Math.sin(beta)};
  const E={x:B.x+L*Math.cos(g),y:B.y+L*Math.sin(g)};
  const C={x:E.x+h*Math.sin(g),y:E.y-h*Math.cos(g)};
  return {A,B,E,C,reading:400+C.x,theta:deg};
}
export function geometricAngle(mm){
  if(!Number.isFinite(mm)||mm<geometry(8).reading||mm>geometry(180).reading)return null;
  let lo=8,hi=180;
  for(let i=0;i<60;i++){const mid=(lo+hi)/2;if(geometry(mid).reading<mm)lo=mid;else hi=mid;}
  return (lo+hi)/2;
}
