import fs from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {angle,parseNumber,slopeFromHeight} from './model.mjs';
const read=p=>fs.readFile(new URL(p,import.meta.url),'utf8');
const dict={...JSON.parse(await read('translations.json')),...JSON.parse(await read('dynamic-translations.json'))};
for(const [key,values] of Object.entries(dict)){
  assert.equal(values.length,5,key);
  for(const value of values){
    assert.equal(typeof value,'string');assert.ok(value.trim(),key);
    assert.deepEqual([...value.matchAll(/\{\d+\}/g)].map(m=>m[0]).sort(),[...key.matchAll(/\{\d+\}/g)].map(m=>m[0]).sort(),key);
  }
}
for(const file of ['app.mjs','actions.mjs','update.mjs']){
  for(const [,key] of (await read(file)).matchAll(/\btr\('([^']+)'/g))assert.ok(dict[key],`${file}: ${key}`);
}
for(const [,message] of (await read('model.mjs')).matchAll(/throw Error\('([^']+)'\)/g))assert.ok(dict[message],message);
const html=await read('index.html');
const identity=new Set(['TS','Kalkulator','Android · Chrome:','iPhone · Safari:','Norsk','English','Polski','Українська','Deutsch','Español','Testversjon · 15.11.2026']);
for(const [,raw] of html.matchAll(/>([^<>]+)</g)){
  const text=raw.trim();if(!/[a-zæøå]{4}/i.test(text)||identity.has(text))continue;
  assert.ok(dict[text],`Static text missing: ${text}`);
}
const runtime=(await read('i18n.js')).replace('/*__TRANSLATIONS__*/{}',()=>JSON.stringify(dict));
for(const storageBlocked of [false,true]){
  const saved=new Map(),listeners=new Map();const select={value:'',addEventListener(type,fn){this.change=fn;}};
  const doc={documentElement:{lang:''},createTreeWalker:()=>({nextNode:()=>null}),querySelectorAll:()=>[],getElementById:()=>select,dispatchEvent(event){listeners.get(event.type)?.();}};
  const window={};
  const ctx={window,document:doc,NodeFilter:{SHOW_TEXT:4},Event:class{constructor(type){this.type=type;}},localStorage:{getItem:k=>{if(storageBlocked)throw Error();return saved.get(k);},setItem:(k,v)=>{if(storageBlocked)throw Error();saved.set(k,v);}}};
  vm.runInNewContext(runtime,ctx);
  assert.equal(doc.documentElement.lang,'nb');
  const live={textContent:''};window.TSI18n.write(live,()=>window.TSI18n.t('Du bruker versjon {0}.','rc.6'));
  for(const lang of ['nb','en','pl','uk','de','es']){
    select.value=lang;select.change();assert.equal(doc.documentElement.lang,lang);
    assert.equal(window.TSI18n.language,lang);assert.ok(live.textContent.includes('rc.6'));
    assert.ok(!window.TSI18n.t('2. Bøy leddet ved 200 mm til {0}°. Dette er vinkelen vi måler.','27').includes('{0}'));
    assert.equal(parseNumber('486,0'),parseNumber('486.0'));assert.equal(angle(486),27);
    assert.ok(Math.abs(slopeFromHeight(parseNumber('35'),parseNumber('3,2')*1000).length-4570.0736216)<0.001);
  }
  if(!storageBlocked){vm.runInNewContext(runtime,ctx);assert.equal(doc.documentElement.lang,'es','Remember language on reload');}
}
const built=await read('dist/index.html');
assert.ok(!built.includes('src="i18n.js"'),'Offline bundle must contain the language runtime');
assert.ok(!built.includes('/*__TRANSLATIONS__*/'));
for(const [,script] of built.matchAll(/<script(?: type="module")?>([\s\S]*?)<\/script>/g)){
  const result=spawnSync(process.execPath,['--input-type=module','--check'],{input:script,encoding:'utf8'});assert.equal(result.status,0,result.stderr);
}
console.log(`OK: ${Object.keys(dict).length} complete translation keys, six languages, placeholders, model errors, stored language, blocked storage and embedded offline bundle.`);
