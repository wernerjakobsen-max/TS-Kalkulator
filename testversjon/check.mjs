import assert from 'node:assert/strict';
import {angle,geometry,pose,slope,parseNumber} from './model.mjs';
for(const [mm,deg] of [[420,8],[430,11],[486,27],[677.5,90],[798,170]])assert.equal(angle(mm),deg);
let last=0;
for(let k=0;k<=37800;k++){const v=angle(420+k/100);assert.ok(v>=last&&v>=8&&v<=170);last=v;}
for(const v of [419.9,798.1,NaN,Infinity])assert.equal(angle(v),null);
assert.equal(parseNumber(' 677,5 '),677.5);
for(const s of ['','2abc','2,3.4','-1','1e2','Infinity'])assert.ok(Number.isNaN(parseNumber(s)));
for(let t=8;t<=170;t+=.25){
  const {A,B,E,C}=geometry(t);
  assert.ok(Math.abs(Math.hypot(B.x-A.x,B.y-A.y)-200)<1e-8);
  assert.ok(Math.abs(Math.hypot(E.x-B.x,E.y-B.y)-200)<1e-8);
  assert.ok(Math.abs(C.y-7.5)<1e-8); // Null corner meets the visible UPPER edge.
  const dot=((A.x-B.x)*(E.x-B.x)+(A.y-B.y)*(E.y-B.y))/40000;
  assert.ok(Math.abs(Math.acos(Math.max(-1,Math.min(1,dot)))*180/Math.PI-t)<1e-7);
}
for(const t of [11,27,90,170]){
  const end=geometry(t);
  for(let k=0;k<=20;k++){
    const {A,B,E}=pose(t,Math.PI+(end.beta-Math.PI)*k/20);
    const dot=((A.x-B.x)*(E.x-B.x)+(A.y-B.y)*(E.y-B.y))/40000;
    assert.ok(Math.abs(Math.acos(Math.max(-1,Math.min(1,dot)))*180/Math.PI-t)<1e-7);
  }
}
// Uavhengige kontrollverdier og konvertering begge veier.
assert.equal(slope('ratio',2,50).percent,4);
assert.equal(slope('height',20,1000).percent,2);
assert.ok(Math.abs(slope('degrees',45).percent-100)<1e-10);
assert.equal(slope('percent',0).ratio,null);
for(const p of [0,.01,2,4,100,1000]){
  const a=slope('percent',p),b=slope('degrees',a.degrees);
  assert.ok(Math.abs(a.r-b.r)<1e-10);
  assert.ok(Math.abs(slope('height',a.r*7000,7000).percent-p)<1e-10);
}
for(const args of [['degrees',90],['degrees',200],['ratio',1,0],['height',20,0],['percent',NaN],['percent',-2]])assert.throws(()=>slope(...args));
console.log('OK: 37 801 kurveverdier, kontrollpunkter, stiv geometri, fallkonverteringer og ugyldige inndata.');
