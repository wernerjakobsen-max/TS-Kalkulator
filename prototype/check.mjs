import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {X,Y,angle,geometry,geometricAngle,parseReading} from './model.mjs';
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const script=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].at(-1)[1];
// Run the ACTUAL production script with inert DOM/lifecycle stubs.
const context=vm.createContext({document:{documentElement:{},getElementById:()=>null,addEventListener(){}},window:{addEventListener(){}},navigator:{}});
vm.runInContext(script,context);
for(let i=0;i<X.length;i++)assert.ok(Math.abs(angle(X[i])-Y[i])<1e-10);
let prev=-Infinity,maxDiff=0,maxSlope=0;
for(let k=0;k<=38000;k++){
  const mm=420+k/100,v=angle(mm),production=vm.runInContext(`pchipEval(${mm})`,context);
  maxDiff=Math.max(maxDiff,Math.abs(v-production));
  assert.ok(v>=prev&&v>=8&&v<=180);
  if(k)maxSlope=Math.max(maxSlope,(v-prev)/.01);
  prev=v;
}
assert.ok(maxDiff<1e-10);
for(const v of [NaN,Infinity,419.99,800.01])assert.equal(angle(v),null);
assert.equal(parseReading('677,5'),677.5);assert.equal(parseReading(' 677.5 '),677.5);
for(const s of ['','677abc','6e2','677,5,2','Infinity'])assert.ok(Number.isNaN(parseReading(s)));
for(let deg=8;deg<=180;deg+=.1){
  const {A,B,E,C}=geometry(deg);
  assert.ok(Math.abs(Math.hypot(B.x-A.x,B.y-A.y)-200)<1e-8);
  assert.ok(Math.abs(Math.hypot(E.x-B.x,E.y-B.y)-200)<1e-8);
  assert.ok(Math.abs(C.y)<1e-8);
  assert.ok(Math.abs(Math.hypot(C.x-E.x,C.y-E.y)-7.5)<1e-8);
  const actual=Math.acos(Math.max(-1,Math.min(1,((A.x-B.x)*(E.x-B.x)+(A.y-B.y)*(E.y-B.y))/40000)))*180/Math.PI;
  assert.ok(Math.abs(actual-deg)<1e-6);
  assert.ok(Math.abs(geometricAngle(geometry(deg).reading)-deg)<1e-8);
}
const rows=X.map((mm,i)=>({mm,deg:Y[i],idealMm:400+400*Math.sin(Y[i]*Math.PI/360),geometryMm:geometry(Y[i]).reading,residualMm:geometry(Y[i]).reading-mm}));
const rms=key=>Math.sqrt(rows.reduce((s,r)=>s+(r[key]-r.mm)**2,0)/rows.length);
// Reproduce production slope issues without a browser or modifying app code.
const fields=Object.fromEntries(['fallPercent','fallDegrees','fallRatio','fallHeightVal','fallLengthVal','fallHeightUnit','fallLengthUnit'].map(id=>[id,{value:''}]));
context.document.getElementById=id=>fields[id]??null;
fields.fallHeightVal.value='20';fields.fallHeightUnit.value='mm';
fields.fallLengthVal.value='1';fields.fallLengthUnit.value='m';
vm.runInContext('fallFromHeightLength()',context);assert.equal(fields.fallPercent.value,'2.000');
fields.fallDegrees.value='200';vm.runInContext('fallFromDegrees()',context);
const degrees200Percent=fields.fallPercent.value;assert.equal(degrees200Percent,'36.397');
fields.fallDegrees.value='90';vm.runInContext('fallFromDegrees()',context);
const degrees90Percent=fields.fallPercent.value;assert.ok(Number(degrees90Percent)>1e17);
fields.fallRatio.value='2:50';vm.runInContext('fallFromRatio()',context);
assert.equal(fields.fallPercent.value,'2.000');
fields.fallPercent.value='10';vm.runInContext('fallFromPercent()',context);
assert.equal(fields.fallHeightVal.value,'20'); // Stale height while length remains 1 m.
const productionObservations={degrees200Percent,degrees90Percent,ratio2to50Percent:'2.000',heightAfter10PercentMm:fields.fallHeightVal.value};
const summary={baseline:'00ed244ec328fcaf0ea42669b6416a2e2c42382b',samples:38001,maxDiff,maxSlopeDegPerMm:maxSlope,idealRmsMm:rms('idealMm'),geometryRmsMm:rms('geometryMm'),geometryMaxResidualMm:Math.max(...rows.map(r=>Math.abs(r.residualMm))),productionObservations,rows};
console.log(JSON.stringify(summary,null,2));
